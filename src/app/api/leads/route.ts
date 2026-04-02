import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Supabase configuration is missing. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    const body = await req.json();
    const { email, first_name, last_name, source, metadata, tags } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1. Insert or Update Lead
    const { data: lead, error: leadError } = await supabaseAdmin
      .from("leads")
      .upsert({
        email,
        first_name,
        last_name,
        source,
        metadata,
        user_id: "7ee6f1c7-7e61-4e6f-9e6f-7e6f7e6f7e6f", // Placeholder UUID for testing/initial dev
      }, { onConflict: "email" })
      .select()
      .single();

    if (leadError) throw leadError;

    // 2. Add Tags if provided
    if (tags && tags.length > 0) {
      const { data: existingTags } = await supabaseAdmin
        .from("tags")
        .select("id, name")
        .in("name", tags);

      if (existingTags && existingTags.length > 0) {
        const leadTags = existingTags.map(tag => ({
          lead_id: lead.id,
          tag_id: tag.id
        }));

        await supabaseAdmin.from("lead_tags").upsert(leadTags);
      }
    }

    return NextResponse.json({ success: true, leadId: lead.id });

  } catch (error: any) {
    console.error("Lead capture failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
