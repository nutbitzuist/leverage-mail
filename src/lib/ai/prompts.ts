import { z } from "zod";

export const LandingPageSchema = z.object({
  hero: z.object({
    headline: z.string(),
    subheadline: z.string(),
    ctaText: z.string(),
    imageUrl: z.string().optional(),
  }),
  benefits: z.array(z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string(), // name of lucide-react icon
  })),
  socialProof: z.object({
    testimonial: z.string(),
    author: z.string(),
    role: z.string(),
  }).optional(),
  form: z.object({
    buttonLabel: z.string(),
    successMessage: z.string(),
  }),
  footer: z.object({
    copyrightText: z.string(),
  }),
  theme: z.object({
    primaryColor: z.string(),
    accentColor: z.string(),
    fontFamily: z.string(),
  }),
});

export type LandingPageContent = z.infer<typeof LandingPageSchema>;

export const LANDING_PAGE_PROMPT = `
You are a high-conversion digital marketer and designer. 
Generate a landing page configuration in JSON format based on the following user input:
User Input: "{PROMPT}"

Follow these rules:
1. Provide a powerful, benefit-driven headline.
2. The subheadline should explain the "how" or the unique value proposition.
3. The benefits section should have 3 key value points.
4. Use standard Lucide React icon names for icons (e.g., "CheckCircle", "Zap", "Users").
5. The theme should use high-end HSL or Hex values.
6. Return ONLY the JSON object following the schema.
`;
