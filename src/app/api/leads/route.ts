import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AutomationEngine } from "@/lib/engine";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch leads with tags
  const { data, error } = await supabase
    .from("leads")
    .select(`
      *,
      lead_tags(
        tags(name, color)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flatten the response for the frontend
  const leads = data.map((lead: { id: string; email: string; first_name: string; last_name: string; created_at: string; status: string; lead_tags: { tags: { name: string; color: string } }[] }) => ({
    ...lead,
    tags: lead.lead_tags?.map((lt: { tags: { name: string; color: string } }) => lt.tags) || []
  }));

  return NextResponse.json(leads);
}

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const adminSupabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    // If no user, this might be a public lead capture form
    // We should allow this but we'll need a way to link it to a specific user/account
    // For now, we'll try to get the user_id from the body if the caller is an admin
    // or just use the auth user.

    const body = await req.json();
    const { email, first_name, last_name, source, metadata, tags, redirect_url, target_user_id } = body;

    const finalUserId = user?.id || target_user_id;

    if (!finalUserId) {
      return NextResponse.json({ error: "User context missing" }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1. Insert or Update Lead using Admin client to bypass RLS for public entry
    const { data: lead, error: leadError } = await adminSupabase
      .from("leads")
      .upsert({
        email,
        first_name,
        last_name,
        source,
        metadata,
        user_id: finalUserId,
      }, { onConflict: "user_id,email" })
      .select()
      .single();

    if (leadError) throw leadError;

    // 2. Add Tags if provided
    if (tags && tags.length > 0) {
      // Upsert tags (create if not exist)
      const tagPayloads = tags.map((tagName: string) => ({
        user_id: finalUserId,
        name: tagName,
      }));
      
      const { data: upsertedTags, error: tagError } = await adminSupabase
        .from("tags")
        .upsert(tagPayloads, { onConflict: "user_id,name" })
        .select("id, name");

      if (!tagError && upsertedTags) {
        const leadTags = upsertedTags.map(tag => ({
          lead_id: lead.id,
          tag_id: tag.id
        }));
        await adminSupabase.from("lead_tags").upsert(leadTags);
      }
    }

    // 3. Trigger Automations (The "Brain")
    try {
      if (tags && tags.length > 0) {
        for (const tg of tags) {
          await AutomationEngine.processLeadTriggers(lead.id, "tag_added", tg, finalUserId);
        }
      } else {
        await AutomationEngine.processLeadTriggers(lead.id, "lead_added", source || "unknown", finalUserId);
      }
    } catch (e) {
      console.error("[Engine] Trigger mapping failed:", e);
    }

    return NextResponse.json({ success: true, leadId: lead.id, redirect_url });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lead capture failed";
    console.error("Lead capture failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
