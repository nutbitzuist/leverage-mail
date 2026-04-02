import { createAdminClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export const AutomationEngine = {
  async processLeadTriggers(leadId: string, triggerType: string, triggerValue: string, userId: string) {
    const adminSupabase = createAdminClient();

    const resendApiKey = process.env.RESEND_API_KEY;
    const resend = resendApiKey ? new Resend(resendApiKey) : null;
    const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";

    const { data: lead } = await adminSupabase.from("leads").select("*").eq("id", leadId).single();
    if (!lead) return;

    console.log(`[Engine] Processing Trigger: ${triggerType} -> '${triggerValue}' for Lead ${lead.email}`);

    // 1. Process "Rules"
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
          const sequenceId = rule.action_value;
          const { data: firstEmail } = await adminSupabase
            .from("sequence_emails")
            .select("*")
            .eq("sequence_id", sequenceId)
            .order("order_index", { ascending: true })
            .limit(1)
            .single();

          if (firstEmail) {
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
            console.log(`[Engine] Rule Fired: Queued Sequence Email '${firstEmail.subject}'`);
          }
        }
      }
    }

    // 2. Process Visual Automations
    const { data: activeAutomations } = await adminSupabase
      .from("automations")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (activeAutomations && activeAutomations.length > 0) {
      for (const auto of activeAutomations) {
        // Broaden matching for generic "lead_added" or specific form match
        if (auto.trigger_config?.type === triggerType && 
            (auto.trigger_config?.value === triggerValue || auto.trigger_config?.value === 'any')) {
            
            const emailStep = auto.workflow_steps?.find((s: { type: string, title: string, description: string }) => s.type === 'email');
            if (emailStep && resend) {
              try {
                await resend.emails.send({
                  from: fromEmail,
                  to: lead.email,
                  subject: emailStep.title,
                  html: `<p>Hi ${lead.first_name || "there"},</p><p>${emailStep.description}</p>`,
                });
                console.log(`[Engine] Visual Auto Fired: Sent direct email.`);
              } catch (e) {
                console.error(e);
              }
            }
        }
      }
    }
  }
};
