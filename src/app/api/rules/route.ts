import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("rules")
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

  const { id, name, trigger_type, trigger_value, action_type, action_value, is_active } = await req.json();

  if (!name || !trigger_type || !trigger_value || !action_type || !action_value) {
    return NextResponse.json({ error: "All rule fields are required" }, { status: 400 });
  }

  const upsertData: {
    id?: string;
    user_id: string;
    name: string;
    trigger_type: string;
    trigger_value: string;
    action_type: string;
    action_value: string;
    is_active: boolean;
  } = {
    user_id: user.id,
    name,
    trigger_type,
    trigger_value,
    action_type,
    action_value,
    is_active: is_active !== undefined ? is_active : true,
  };
  if (id) upsertData.id = id;

  const { data, error } = await supabase
    .from("rules")
    .upsert(upsertData)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Rule ID is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("rules")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
