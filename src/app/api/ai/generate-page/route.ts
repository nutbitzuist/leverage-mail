import { NextResponse } from "next/server";
import OpenAI from "openai";
import { LANDING_PAGE_PROMPT, LandingPageSchema } from "@/lib/ai/prompts";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: LANDING_PAGE_PROMPT.replace("{PROMPT}", prompt),
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate with Zod
    const validated = LandingPageSchema.parse(content);

    return NextResponse.json(validated);
  } catch (error: any) {
    console.error("AI Generation failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate page content." },
      { status: 500 }
    );
  }
}
