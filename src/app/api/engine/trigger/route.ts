import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  const adminSupabase = createAdminClient();
  const { leadId, triggerType, triggerValue, userId } = await req.json();

  if (!leadId || !triggerType || !userId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const resend = resendApiKey ? new Resend(resendApiKey) : null;
  const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://leverage-mail.vercel.app";

  // Get lead details
  const { data: lead } = await adminSupabase.from("leads").select("*").eq("id", leadId).single();
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  console.log(`[Engine] Processing Trigger: ${triggerType} -> '${triggerValue}' for Lead ${lead.email}`);

  // 1. Process "Rules" (Mini IF/THEN automations)
  const { data: activeRules } = await adminSupabase
    .from("rules")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .eq("trigger_type", triggerType)
    .eq("trigger_value", triggerValue);

  if (activeRules && activeRules.length > 0) {
    for (const rule of activeRules) {
      if (rule.action_type === "subscribe_to_sequence") {
        // Enqueue the first email of the sequence
        const sequenceId = rule.action_value;
        const { data: firstEmail } = await adminSupabase
           .from("sequence_emails")
           .select("*")
           .eq("sequence_id", sequenceId)
           .order("order_index", { ascending: true })
           .limit(1)
           .single();

        if (firstEmail) {
           // Queue the job
           const executeAfter = new Date();
           executeAfter.setDate(executeAfter.getDate() + (firstEmail.delay_days || 0));
           executeAfter.setHours(executeAfter.getHours() + (firstEmail.delay_hours || 0));

           await adminSupabase.from("automation_queue").insert({
               user_id: userId,
               lead_id: leadId,
               job_type: "sequence_email",
               job_target_id: firstEmail.id,
               execute_after: executeAfter.toISOString()
           });
           console.log(`[Engine] Rule fired: Queued Sequence Email '${firstEmail.subject}'`);
        }
      } 
      // Handle other rule types...
    }
  }

  // 2. Process Visual Automations (Workflows) 
  // (Maintained backward compatibility with existing workflows logic)
  const { data: activeAutomations } = await adminSupabase
      .from("automations")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true);

  if (activeAutomations && activeAutomations.length > 0) {
      // Find automations that start with this trigger
      for (const auto of activeAutomations) {
          if (auto.trigger_config?.type === triggerType && 
             (auto.trigger_config?.value === triggerValue || triggerType === 'lead_added')) {
              
              // Evaluate immediate next step (simplified for exact kit-parity demo)
              const emailStep = auto.workflow_steps?.find((s: { type: string, title: string, description: string }) => s.type === 'email');
              if (emailStep && resend) {
                  try {
                      await resend.emails.send({
                          from: fromEmail,
                          to: lead.email,
                          subject: emailStep.title,
                          html: `<p>Hi ${lead.first_name || "there"},</p><p>${emailStep.description}</p><p style="font-size:11px;color:#999;margin-top:32px;text-align:center;"><a href="${appUrl}/unsubscribe?uid=${userId}&email=${encodeURIComponent(lead.email)}" style="color:#999;">Unsubscribe</a></p>`,
                      });
                      console.log(`[Engine] Visual Auto Fired: Sent direct email.`);
                  } catch (e) {
                      console.error(e);
                  }
              }
          }
      }
  }

  return NextResponse.json({ success: true });
}
