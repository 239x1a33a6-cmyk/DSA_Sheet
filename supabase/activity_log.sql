-- ============================================================
-- ACTIVITY LOGS TABLE
-- Tracks user logins and other critical actions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.activity_log (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type        TEXT NOT NULL, -- e.g. 'login', 'question_deleted', 'topic_created'
    details     JSONB DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to see logs (for the global activity feed)
DROP POLICY IF EXISTS "Activity logs readable by all authenticated" ON public.activity_log;
CREATE POLICY "Activity logs readable by all authenticated" ON public.activity_log
    FOR SELECT TO authenticated
    USING (true);

-- Allow authenticated users to insert logs (needed for login logging)
DROP POLICY IF EXISTS "Users can insert their own logs" ON public.activity_log;
CREATE POLICY "Users can insert their own logs" ON public.activity_log
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at);

COMMENT ON TABLE public.activity_log IS 'System activity logs for tracking user engagement and security events.';
