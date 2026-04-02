import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

// Prevent caching to ensure fresh execution
export const dynamic = 'force-dynamic';

export async function GET() {
  // Option: Protect via cron secret check (e.g. headers.get('Authorization') === `Bearer ${process.env.CRON_SECRET}`)
  
  const adminSupabase = createAdminClient();
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return NextResponse.json({ error: "Resend not configured" }, { status: 500 });
  }
  const resend = new Resend(resendApiKey);
  const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";

  // 1. Fetch pending items that are ready to execute
  const { data: jobs, error } = await adminSupabase
    .from("automation_queue")
    .select("*, leads(email, first_name), sequence_emails(*)")
    .eq("status", "pending")
    .lte("execute_after", new Date().toISOString())
    .limit(50); // Process blocks of 50

  if (error || !jobs || jobs.length === 0) {
    return NextResponse.json({ processed: 0, message: "No jobs pending." });
  }

  let processedCount = 0;

  // 2. Process each job
  for (const job of jobs) {
    try {
      // Mark as processing
      await adminSupabase.from("automation_queue").update({ status: "processing" }).eq("id", job.id);

      if (job.job_type === "sequence_email" && job.sequence_emails && job.leads) {
        // Send the email
        await resend.emails.send({
          from: fromEmail,
          to: job.leads.email,
          subject: job.sequence_emails.subject,
          html: job.sequence_emails.content_html.replace("{{first_name}}", job.leads.first_name || "there"),
        });

        // Setup the next email in the sequence!
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
      processedCount++;
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

  return NextResponse.json({ processed: processedCount });
}
