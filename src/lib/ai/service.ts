import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const AIService = {
  /**
   * Refines email content or subject lines to be more engaging using Claude 3.5 Sonnet.
   */
  async polishEmail(content: string, type: "subject" | "body") {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("Anthropic API Key missing");

    const prompt = type === "subject" 
      ? `Refine this email subject line to be higher converting and more professional. Return only the new subject. Original: "${content}"`
      : `Refine this email body to be more engaging, professional, and clear. Maintain the original meaning and placeholders. Return only the new body. Original: "${content}"`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const polishedContent = response.content[0].type === "text" ? response.content[0].text : content;
    return polishedContent.trim() || content;
  },

  /**
   * Generates a summary or insight for a lead's metadata using Claude 3.5 Sonnet.
   */
  async generateLeadInsight(leadData: { email: string, metadata?: Record<string, unknown> }) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("Anthropic API Key missing");

    const prompt = `Analyze this lead data and provide a 1-sentence insight for a business owner. Data: ${JSON.stringify(leadData)}`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const insight = response.content[0].type === "text" ? response.content[0].text : "No insight available.";
    return insight.trim() || "No insight available.";
  }
};
