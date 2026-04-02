import { AIService } from "@/lib/ai/service";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content, type } = await req.json();
    if (!content || !type) {
      return NextResponse.json({ error: "Missing content or type" }, { status: 400 });
    }

    const polished = await AIService.polishEmail(content, type);
    return NextResponse.json({ polished });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Polish failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
