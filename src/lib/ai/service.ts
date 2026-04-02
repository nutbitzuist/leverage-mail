import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const AIService = {
  /**
   * Refines email content or subject lines to be more engaging.
   */
  async polishEmail(content: string, type: "subject" | "body") {
    if (!process.env.OPENAI_API_KEY) throw new Error("OpenAI API Key missing");

    const prompt = type === "subject" 
      ? `Refine this email subject line to be higher converting and more professional. Return only the new subject. Original: "${content}"`
      : `Refine this email body to be more engaging, professional, and clear. Maintain the original meaning and placeholders. Return only the new body. Original: "${content}"`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content?.trim() || content;
  },

  /**
   * Generates a summary or insight for a lead's metadata.
   */
  async generateLeadInsight(leadData: { email: string, metadata?: Record<string, any> }) {
    if (!process.env.OPENAI_API_KEY) throw new Error("OpenAI API Key missing");

    const prompt = `Analyze this lead data and provide a 1-sentence insight for a business owner. Data: ${JSON.stringify(leadData)}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content?.trim() || "No insight available.";
  }
};
