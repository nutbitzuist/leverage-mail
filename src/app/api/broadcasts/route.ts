import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("broadcasts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json();
  const { subject, content_html, status, scheduled_at } = json;
  
  let totalRecipients = 0;

  // Execute Email Sending if Status is "sent"
  if (status === "sent") {
    const { data: leads } = await supabase
      .from("leads")
      .select("email, first_name")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (leads && leads.length > 0 && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://leverage-mail.vercel.app";
      
      const emailPayloads = leads.map(l => ({
        from: fromEmail,
        to: [l.email],
        subject: subject,
        html: content_html.replace(/\{\{first_name\}\}/g, l.first_name || "there")
          + `<p style="font-size:11px;color:#999;margin-top:32px;text-align:center;"><a href="${appUrl}/unsubscribe?uid=${user.id}&email=${encodeURIComponent(l.email)}" style="color:#999;">Unsubscribe</a></p>`,
      }));

      try {
        // Resend Batch API recommends chunks, we do 100 per chunk
        for (let i = 0; i < emailPayloads.length; i += 100) {
          await resend.batch.send(emailPayloads.slice(i, i + 100));
        }
        totalRecipients = leads.length;
      } catch (err) {
        console.error("Resend Batch Error:", err);
      }
    } else if (!process.env.RESEND_API_KEY) {
      console.warn("Broadcast marked as sent, but RESEND_API_KEY is missing. Emails were not dispatched.");
    }
  }

  const { data, error } = await supabase
    .from("broadcasts")
    .insert([
      {
        user_id: user.id,
        subject,
        content_html,
        status: status || 'draft',
        scheduled_at: scheduled_at || null,
        total_recipients: totalRecipients,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
