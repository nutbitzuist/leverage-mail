import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { LANDING_PAGE_PROMPT, LandingPageSchema } from "@/lib/ai/prompts";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Anthropic API key is not configured. Please set ANTHROPIC_API_KEY in your environment." },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: LANDING_PAGE_PROMPT.replace("{PROMPT}", prompt) + "\n\nCRITICAL: Return ONLY the JSON object. No preamble or markdown.",
        },
      ],
    });

    const rawContent = response.content[0].type === "text" ? response.content[0].text : "{}";
    
    // Attempt to extract JSON if Claude includes preamble
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    const content = JSON.parse(jsonMatch ? jsonMatch[0] : "{}");
    
    // Validate with Zod
    const validated = LandingPageSchema.parse(content);

    return NextResponse.json(validated);
  } catch (error: unknown) {
    console.error("AI Generation failed:", error);
    const message = error instanceof Error ? error.message : "Failed to generate page content.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
