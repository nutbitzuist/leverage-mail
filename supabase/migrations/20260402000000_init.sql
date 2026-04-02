-- 1. Profiles Table (Extended User Info)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    company_name TEXT,
    website_url TEXT,
    brand_primary_color TEXT DEFAULT '#6d28d9',
    brand_logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tags & Segments
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#e2e8f0',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- 3. Leads (CRM)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    source TEXT, -- e.g., 'landing-page-1'
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced', 'complaint')),
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, email)
);

-- 4. Junction Table for Lead Tags
CREATE TABLE IF NOT EXISTS public.lead_tags (
    lead_id UUID REFERENCES public.leads ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags ON DELETE CASCADE,
    PRIMARY KEY (lead_id, tag_id)
);

-- 5. Forms & Landing Pages (AI Generated Concepts)
CREATE TABLE IF NOT EXISTS public.forms_landing_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content_json JSONB NOT NULL, -- The AI-generated structure (headline, copy, layout)
    style_json JSONB DEFAULT '{}'::jsonb,
    lead_magnet_url TEXT, -- Link to the download
    success_message TEXT DEFAULT 'Thank you for subscribing!',
    view_count INTEGER DEFAULT 0,
    submission_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Email Broadcasts
CREATE TABLE IF NOT EXISTS public.broadcasts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    subject TEXT NOT NULL,
    content_html TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    total_recipients INTEGER DEFAULT 0,
    open_rate FLOAT DEFAULT 0.0,
    click_rate FLOAT DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Visual Automations (Workflows)
CREATE TABLE IF NOT EXISTS public.automations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    trigger_config JSONB NOT NULL, -- e.g., { "type": "tag_added", "tag_id": "..." }
    workflow_steps JSONB NOT NULL, -- Array of steps (email, delay, condition)
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms_landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

-- Simple Policies (User can only see their own data)
CREATE POLICY "Users can manage their own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage their own tags" ON public.tags FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own leads" ON public.leads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own lead tags" ON public.lead_tags FOR ALL USING (
    EXISTS (SELECT 1 FROM public.leads WHERE id = lead_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage their own forms" ON public.forms_landing_pages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own broadcasts" ON public.broadcasts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own automations" ON public.automations FOR ALL USING (auth.uid() = user_id);
