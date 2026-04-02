-- 1. Sequences (Drip Campaigns)
CREATE TABLE IF NOT EXISTS public.sequences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Sequence Emails (Individual Drip Steps)
CREATE TABLE IF NOT EXISTS public.sequence_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sequence_id UUID REFERENCES public.sequences ON DELETE CASCADE NOT NULL,
    subject TEXT NOT NULL,
    content_html TEXT NOT NULL,
    delay_days INTEGER DEFAULT 1,     -- Days to wait after previous email/start
    delay_hours INTEGER DEFAULT 0,    -- Additional hours to wait
    order_index INTEGER NOT NULL DEFAULT 0, -- Determines the chain order
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Rules (Mini "If This Then That")
CREATE TABLE IF NOT EXISTS public.rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    trigger_type TEXT NOT NULL, -- 'tag_added', 'form_joined'
    trigger_value TEXT NOT NULL, -- e.g., tag ID or Form slug
    action_type TEXT NOT NULL, -- 'subscribe_to_sequence', 'add_tag', 'send_email'
    action_value TEXT NOT NULL, -- e.g., Sequence ID stringified
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Automation Queue (For scheduling execution of Drips & Delays)
CREATE TABLE IF NOT EXISTS public.automation_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    lead_id UUID REFERENCES public.leads ON DELETE CASCADE NOT NULL,
    job_type TEXT NOT NULL, -- 'sequence_email'
    job_target_id UUID NOT NULL, -- ID of the sequence_email to send
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    execute_after TIMESTAMPTZ NOT NULL,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their sequences" ON public.sequences FOR ALL USING (auth.uid() = user_id);

-- Sequence emails inherit permission through user_id implicitly required by sequences? 
-- Let's just allow users to query matching sequences
CREATE POLICY "Users can manage their sequence emails" ON public.sequence_emails FOR ALL USING (
    EXISTS (SELECT 1 FROM public.sequences WHERE id = sequence_id AND user_id = auth.uid())
);

CREATE POLICY "Users can manage their rules" ON public.rules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their queue" ON public.automation_queue FOR ALL USING (auth.uid() = user_id);
