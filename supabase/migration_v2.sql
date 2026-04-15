-- ============================================================
-- DSA Collaborative Revision Platform - Migration (Collaboration Features)
-- ============================================================

-- 1. Update profiles for contribution tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contribution_count INT DEFAULT 0;

-- 2. Update questions table for naming/notes
-- Rename existing notes to shared_notes if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='notes') THEN
    ALTER TABLE public.questions RENAME COLUMN notes TO shared_notes;
  ELSE
    ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS shared_notes TEXT;
  END IF;
END $$;

-- 3. Update user_question_status for personal notes
ALTER TABLE public.user_question_status ADD COLUMN IF NOT EXISTS personal_notes TEXT;

-- 4. Activity Log Table
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
CREATE POLICY "Activity log readable by all authenticated" ON public.activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Activity log insertable by system/user" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- 5. Trigger for contribution count
CREATE OR REPLACE FUNCTION public.increment_contribution_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET contribution_count = contribution_count + 1 WHERE id = NEW.created_by;
  
  -- Also log activity
  INSERT INTO public.activity_log (user_id, action, question_id, topic_id)
  VALUES (NEW.created_by, 'added_question', NEW.id, NEW.topic_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_question_added ON public.questions;
CREATE TRIGGER on_question_added
  AFTER INSERT ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.increment_contribution_count();

-- 6. Trigger for solve activity
CREATE OR REPLACE FUNCTION public.log_solve_activity()
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
  FOR EACH ROW EXECUTE FUNCTION public.log_solve_activity();
