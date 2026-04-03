import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

// Prevent caching to ensure fresh execution
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Protect via cron secret when configured
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const adminSupabase = createAdminClient();
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return NextResponse.json({ error: "Resend not configured" }, { status: 500 });
  }
  const resend = new Resend(resendApiKey);
  const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://leverage-mail.vercel.app";

  let processedCount = 0;

  // ── PHASE 1: Process Scheduled Broadcasts ──
  const { data: scheduledBroadcasts } = await adminSupabase
    .from("broadcasts")
    .select("*")
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString())
    .limit(10);

  if (scheduledBroadcasts && scheduledBroadcasts.length > 0) {
    for (const broadcast of scheduledBroadcasts) {
      try {
        await adminSupabase.from("broadcasts").update({ status: "sending" }).eq("id", broadcast.id);

        const { data: leads } = await adminSupabase
          .from("leads")
          .select("email, first_name")
          .eq("user_id", broadcast.user_id)
          .eq("status", "active");

        if (leads && leads.length > 0) {
          const emailPayloads = leads.map(l => ({
            from: fromEmail,
            to: [l.email],
            subject: broadcast.subject,
            html: broadcast.content_html
              .replace(/\{\{first_name\}\}/g, l.first_name || "there")
              + `<p style="font-size:11px;color:#999;margin-top:32px;text-align:center;"><a href="${appUrl}/unsubscribe?uid=${broadcast.user_id}&email=${encodeURIComponent(l.email)}" style="color:#999;">Unsubscribe</a></p>`,
          }));

          for (let i = 0; i < emailPayloads.length; i += 100) {
            await resend.batch.send(emailPayloads.slice(i, i + 100));
          }

          await adminSupabase.from("broadcasts").update({
            status: "sent",
            sent_at: new Date().toISOString(),
            total_recipients: leads.length,
          }).eq("id", broadcast.id);
          processedCount++;
        } else {
          await adminSupabase.from("broadcasts").update({ status: "sent", sent_at: new Date().toISOString(), total_recipients: 0 }).eq("id", broadcast.id);
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Broadcast send error";
        console.error(`[Cron] Broadcast ${broadcast.id} failed:`, message);
        await adminSupabase.from("broadcasts").update({ status: "failed" }).eq("id", broadcast.id);
      }
    }
  }

  // ── PHASE 2: Process Automation Queue (Sequences) ──
  const { data: jobs, error } = await adminSupabase
    .from("automation_queue")
    .select("*, leads(email, first_name), sequence_emails(*)")
    .eq("status", "pending")
    .lte("execute_after", new Date().toISOString())
    .limit(50);

  if (error || !jobs || jobs.length === 0) {
    return NextResponse.json({ processed: processedCount, queueJobs: 0, message: "Queue phase complete." });
  }

  let queueProcessed = 0;

  for (const job of jobs) {
    try {
      // Mark as processing
      await adminSupabase.from("automation_queue").update({ status: "processing" }).eq("id", job.id);

      if (job.job_type === "sequence_email" && job.sequence_emails && job.leads) {
        // Send the email with unsubscribe footer
        await resend.emails.send({
          from: fromEmail,
          to: job.leads.email,
          subject: job.sequence_emails.subject,
          html: job.sequence_emails.content_html.replace(/\{\{first_name\}\}/g, job.leads.first_name || "there")
            + `<p style="font-size:11px;color:#999;margin-top:32px;text-align:center;"><a href="${appUrl}/unsubscribe?uid=${job.user_id}&email=${encodeURIComponent(job.leads.email)}" style="color:#999;">Unsubscribe</a></p>`,
        });

        // Setup the next email in the sequence
        const { data: nextEmail } = await adminSupabase
           .from("sequence_emails")
           .select("*")
           .eq("sequence_id", job.sequence_emails.sequence_id)
           .gt("order_index", job.sequence_emails.order_index)
           .order("order_index", { ascending: true })
           .limit(1)
           .single();

        if (nextEmail) {
           const executeAfter = new Date();
           executeAfter.setDate(executeAfter.getDate() + (nextEmail.delay_days || 0));
           executeAfter.setHours(executeAfter.getHours() + (nextEmail.delay_hours || 0));

           await adminSupabase.from("automation_queue").insert({
               user_id: job.user_id,
               lead_id: job.lead_id,
               job_type: "sequence_email",
               job_target_id: nextEmail.id,
               execute_after: executeAfter.toISOString()
           });
        }
      }

      // Mark Job as Complete
      await adminSupabase.from("automation_queue").update({ status: "completed" }).eq("id", job.id);
      queueProcessed++;
    } catch (e: unknown) {
      // Handle Failure
      const message = e instanceof Error ? e.message : "Cron execution error";
      console.error(`[Cron] Job ${job.id} failed:`, message);
      await adminSupabase.from("automation_queue").update({ 
        status: "failed", 
        last_error: message 
      }).eq("id", job.id);
    }
  }

  return NextResponse.json({ processed: processedCount + queueProcessed, broadcasts: processedCount, queueJobs: queueProcessed });
}
