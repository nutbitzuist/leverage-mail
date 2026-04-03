import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("sequences")
    .select("*, sequence_emails(id, subject, delay_days, delay_hours, order_index)")
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

  const { id, name, emails } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Sequence name is required" }, { status: 400 });
  }

  // Upsert the sequence
  const upsertData: { id?: string; user_id: string; name: string; updated_at: string } = {
    user_id: user.id,
    name,
    updated_at: new Date().toISOString(),
  };
  if (id) upsertData.id = id;

  const { data: sequence, error } = await supabase
    .from("sequences")
    .upsert(upsertData)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If emails were provided, replace all sequence emails
  if (emails && Array.isArray(emails)) {
    // Delete existing emails for this sequence
    await supabase
      .from("sequence_emails")
      .delete()
      .eq("sequence_id", sequence.id);

    // Insert new emails
    if (emails.length > 0) {
      const emailPayloads = emails.map((e: { subject: string; content_html: string; delay_days?: number; delay_hours?: number }, idx: number) => ({
        sequence_id: sequence.id,
        subject: e.subject,
        content_html: e.content_html || "",
        delay_days: e.delay_days || (idx === 0 ? 0 : 1),
        delay_hours: e.delay_hours || 0,
        order_index: idx,
      }));

      const { error: emailError } = await supabase
        .from("sequence_emails")
        .insert(emailPayloads);

      if (emailError) {
        return NextResponse.json({ error: emailError.message }, { status: 500 });
      }
    }
  }

  // Return the full sequence with emails
  const { data: full } = await supabase
    .from("sequences")
    .select("*, sequence_emails(id, subject, content_html, delay_days, delay_hours, order_index)")
    .eq("id", sequence.id)
    .single();

  return NextResponse.json(full);
}

export async function DELETE(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Sequence ID is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("sequences")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
