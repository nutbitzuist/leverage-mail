import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const adminSupabase = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { leads, tags } = await req.json();

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: "No leads provided. Expected an array of {email, first_name?, last_name?}." }, { status: 400 });
    }

    // Validate every row has an email
    const invalid = leads.filter((l: { email?: string }) => !l.email || !l.email.includes("@"));
    if (invalid.length > 0) {
      return NextResponse.json({ 
        error: `${invalid.length} row(s) have missing or invalid emails. First bad row: ${JSON.stringify(invalid[0])}` 
      }, { status: 400 });
    }

    // Deduplicate by email (keep first occurrence)
    const seen = new Set<string>();
    const uniqueLeads = leads.filter((l: { email: string }) => {
      const lower = l.email.toLowerCase().trim();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });

    // Batch upsert leads (Supabase allows bulk upsert)
    const leadPayloads = uniqueLeads.map((l: { email: string; first_name?: string; last_name?: string; source?: string }) => ({
      email: l.email.toLowerCase().trim(),
      first_name: l.first_name?.trim() || null,
      last_name: l.last_name?.trim() || null,
      source: l.source || "csv-import",
      user_id: user.id,
      status: "active",
    }));

    // Upsert in chunks of 500 to avoid payload limits
    let importedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < leadPayloads.length; i += 500) {
      const chunk = leadPayloads.slice(i, i + 500);
      const { data: upserted, error: upsertError } = await adminSupabase
        .from("leads")
        .upsert(chunk, { onConflict: "user_id,email", ignoreDuplicates: false })
        .select("id");

      if (upsertError) {
        console.error("[Import] Chunk upsert error:", upsertError);
        skippedCount += chunk.length;
        continue;
      }

      importedCount += upserted?.length || 0;

      // If tags were provided, apply them to all imported leads in this chunk
      if (tags && tags.length > 0 && upserted && upserted.length > 0) {
        // Ensure tags exist
        const tagPayloads = tags.map((tagName: string) => ({
          user_id: user.id,
          name: tagName.trim(),
        }));

        const { data: upsertedTags } = await adminSupabase
          .from("tags")
          .upsert(tagPayloads, { onConflict: "user_id,name" })
          .select("id");

        if (upsertedTags && upsertedTags.length > 0) {
          const leadTagRows = upserted.flatMap(lead =>
            upsertedTags.map(tag => ({
              lead_id: lead.id,
              tag_id: tag.id,
            }))
          );

          // Upsert lead_tags in chunks
          for (let j = 0; j < leadTagRows.length; j += 1000) {
            await adminSupabase
              .from("lead_tags")
              .upsert(leadTagRows.slice(j, j + 1000), { onConflict: "lead_id,tag_id" });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      imported: importedCount,
      skipped: skippedCount,
      duplicatesRemoved: leads.length - uniqueLeads.length,
      total: leads.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Import failed";
    console.error("[Import] Failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
