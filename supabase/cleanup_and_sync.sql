-- ============================================================
-- DSA Collaborative Revision Platform - Cleanup & Collaboration Sync
-- Run this in the Supabase SQL Editor to purge dummy data and
-- enable global activity tracking.
-- ============================================================

-- 1. CLEANUP: Purge all dummy data
TRUNCATE public.questions RESTART IDENTITY CASCADE;
DELETE FROM public.topics WHERE is_predefined = false;
TRUNCATE public.user_question_status RESTART IDENTITY CASCADE;
TRUNCATE public.streaks RESTART IDENTITY CASCADE;

-- 2. SCHEMA FIX: Add missing columns and tables
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contribution_count INT DEFAULT 0;

-- Ensure questions table uses shared_notes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='notes') THEN
    ALTER TABLE public.questions RENAME COLUMN notes TO shared_notes;
  ELSE
    ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS shared_notes TEXT;
  END IF;
END $$;

-- Activity Log Table
CREATE TABLE IF NOT EXISTS public.activity_log (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action       TEXT NOT NULL, -- 'added_question', 'solved_question'
  question_id  UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  topic_id     UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  details      JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Activity Log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Activity log readable by all authenticated" ON public.activity_log;
CREATE POLICY "Activity log readable by all authenticated" ON public.activity_log FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Activity log insertable by owner" ON public.activity_log;
CREATE POLICY "Activity log insertable by owner" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- 3. TRIGGERS: Automate collaboration tracking

-- Trigger for contribution count and addition log
CREATE OR REPLACE FUNCTION public.handle_question_addition()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET contribution_count = contribution_count + 1 WHERE id = NEW.created_by;
  
  INSERT INTO public.activity_log (user_id, action, question_id, topic_id)
  VALUES (NEW.created_by, 'added_question', NEW.id, NEW.topic_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_question_added ON public.questions;
CREATE TRIGGER on_question_added
  AFTER INSERT ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.handle_question_addition();

-- Trigger for solve activity listing
CREATE OR REPLACE FUNCTION public.handle_question_solve()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.status = 'solved' AND (OLD.status IS NULL OR OLD.status != 'solved')) THEN
    INSERT INTO public.activity_log (user_id, action, question_id)
    VALUES (NEW.user_id, 'solved_question', NEW.question_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_question_solved ON public.user_question_status;
CREATE TRIGGER on_question_solved
  AFTER UPDATE ON public.user_question_status
  FOR EACH ROW EXECUTE FUNCTION public.handle_question_solve();
