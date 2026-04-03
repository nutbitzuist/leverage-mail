import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { uid, email } = await req.json();

    if (!uid || !email) {
      return NextResponse.json({ error: "Missing uid or email" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase
      .from("leads")
      .update({ status: "unsubscribed" })
      .eq("user_id", uid)
      .eq("email", email.toLowerCase().trim());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unsubscribe failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
