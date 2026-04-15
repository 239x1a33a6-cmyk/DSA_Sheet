-- ============================================================
-- DSA Collaborative Revision Platform - Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (synced from auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,
  email       TEXT,
  avatar_url  TEXT,
  bio         TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TOPICS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.topics (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  is_predefined  BOOLEAN DEFAULT FALSE,
  created_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name)
);

-- ============================================================
-- QUESTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.questions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  link        TEXT,
  difficulty  TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')) DEFAULT 'Easy',
  topic_id    UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  tags        TEXT[] DEFAULT '{}',
  notes       TEXT,
  created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_by ON public.questions(created_by);

-- ============================================================
-- USER QUESTION STATUS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_question_status (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id  UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  status       TEXT CHECK (status IN ('solved', 'unsolved', 'revisit', 'hard')) DEFAULT 'unsolved',
  attempts     INT DEFAULT 0,
  bookmarked   BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_uqs_user ON public.user_question_status(user_id);
CREATE INDEX IF NOT EXISTS idx_uqs_question ON public.user_question_status(question_id);

-- ============================================================
-- FRIENDSHIPS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.friendships (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status     TEXT CHECK (status IN ('pending', 'accepted')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- ============================================================
-- STREAKS (activity tracking for heatmap)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.streaks (
  id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date    DATE NOT NULL,
  count   INT DEFAULT 1,
  UNIQUE(user_id, date)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_question_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- Profiles: readable by all auth users, writable by owner
CREATE POLICY "Profiles readable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Profiles updatable by owner" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Topics: readable by all, writable by authenticated
CREATE POLICY "Topics readable by all" ON public.topics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Topics insertable by authenticated" ON public.topics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Topics deletable by creator" ON public.topics FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Questions: readable by all, writable by authenticated
CREATE POLICY "Questions readable by all" ON public.questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Questions insertable by authenticated" ON public.questions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Questions updatable by creator" ON public.questions FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Questions deletable by creator" ON public.questions FOR DELETE TO authenticated USING (created_by = auth.uid());

-- User question status: owned by user
CREATE POLICY "Status readable by owner" ON public.user_question_status FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Status insertable by owner" ON public.user_question_status FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Status updatable by owner" ON public.user_question_status FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Friendships: visible to involved users
CREATE POLICY "Friendships readable by involved" ON public.friendships FOR SELECT TO authenticated USING (user_id = auth.uid() OR friend_id = auth.uid());
CREATE POLICY "Friendships insertable by requester" ON public.friendships FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Friendships updatable by receiver" ON public.friendships FOR UPDATE TO authenticated USING (friend_id = auth.uid());
CREATE POLICY "Friendships deletable by involved" ON public.friendships FOR DELETE TO authenticated USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Streaks: own rows
CREATE POLICY "Streaks by owner" ON public.streaks FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- SEED: PREDEFINED TOPICS
-- ============================================================
INSERT INTO public.topics (name, is_predefined) VALUES
  ('Arrays', true),
  ('Strings', true),
  ('Linked List', true),
  ('Stack', true),
  ('Queue', true),
  ('Trees', true),
  ('Graphs', true),
  ('Dynamic Programming', true),
  ('Greedy', true),
  ('Bit Manipulation', true)
ON CONFLICT (name) DO NOTHING;
