import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = await params;
  const supabase = createClient();

  const { data, error } = await supabase
    .from("forms_landing_pages")
    .select("*, profiles(full_name)")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  // Increment view count (fire and forget)
  supabase
    .from("forms_landing_pages")
    .update({ view_count: data.view_count + 1 })
    .eq("id", data.id)
    .then();

  return NextResponse.json({
    ...data,
    username: data.profiles?.full_name || "a LeverageMail User"
  });
}
