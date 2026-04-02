# LeverageMail Marketing OS: Owner's Manual

Welcome to your new Marketing OS. This platform is designed specifically for the one-person business who needs high-performance, AI-driven marketing without the complexity of traditional CRMs.

## 🚀 Quick Start Guide

### 1. Environment Configuration
To run the OS at full capacity, ensure you have these keys in your `.env.local`:
- `OPENAI_API_KEY`: Powers the AI Page Builder and Email Polish.
- `RESEND_API_KEY`: Powers actual email deliverability.
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your database.

### 2. The AI Landing Page Builder
- Go to `/dashboard/forms`.
- describe your offer (e.g., "A 3-day course on meditation for developers").
- Click **Generate Magic** to see your high-converting page.
- Click **Publish to Public URL** and share the live link (`/p/[slug]`) with your audience.

### 3. Visual Automations ("The Brain")
- Go to `/dashboard/automations`.
- Define your workflow (e.g., "When lead joins" -> "Wait 1 hour" -> "Send Welcome Email").
- Click **Activate Automation**. 
- Whenever a lead is captured (via your landing page or the capture script), this workflow will trigger automatically.

### 4. Audience CRM
- Monitor your growth at `/dashboard/leads`.
- Track tags, sources, and engagement in real-time.

## ⚙️ Integrating with your site (leverage100x.com)
To capture leads from any site, embed this script:

```html
<script src="https://leverage-mail.vercel.app/js/leverage-capture.js"></script>
<script>
  LeverageMail.init({
    type: "floating",
    userId: "YOUR_USER_ID", // Find in profile settings
    title: "Join the 1% Elite",
    subheadline: "Get weekly leverage strategies.",
    cta: "Join Now",
    tags: ["homepage-lead"]
  });
</script>
```

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Vanilla CSS with HSL Design Tokens
- **AI**: OpenAI GPT-4-Turbo
- **Icons**: Lucide React

## 📈 Roadmap for Growth
- [ ] Connect Stripe for paid newsletter support.
- [ ] Implement A/B testing for AI-generated landing pages.
- [ ] Add Lead Scoring based on email open rates.

---
*Built for the ambitious solo founder. Leverage everything.*
