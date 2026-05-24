-- ============================================================
-- Habit Tracker — Supabase Schema
-- Run this in the Supabase SQL Editor (once, top to bottom)
-- ============================================================

-- ── Functions ──────────────────────────────────────────────

-- Auto-create a profile row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ── Tables ─────────────────────────────────────────────────

-- profiles: 1-to-1 with auth.users; stores display name + persisted UI preferences
CREATE TABLE public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text NOT NULL DEFAULT '',
  accent        text NOT NULL DEFAULT '#2bd4a1',
  week_scheme   text NOT NULL DEFAULT 'rainbow'
                CHECK (week_scheme IN ('rainbow','cool','warm','mono')),
  density       text NOT NULL DEFAULT 'regular'
                CHECK (density IN ('compact','regular','comfy')),
  check_style   text NOT NULL DEFAULT 'fill'
                CHECK (check_style IN ('fill','box','dot')),
  show_mental   boolean NOT NULL DEFAULT false,
  show_analysis boolean NOT NULL DEFAULT true,
  show_area     boolean NOT NULL DEFAULT true,
  radius        integer NOT NULL DEFAULT 14,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- habits: global per-user. Soft-deleted via archived_at.
-- A habit is "visible in month M" when:
--   created_at <= last_day(M)  AND  (archived_at IS NULL OR archived_at >= first_day(M))
CREATE TABLE public.habits (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji       text NOT NULL DEFAULT '✨',
  name        text NOT NULL,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz   -- NULL = active
);

-- habit_completions: one row per (habit, date) when the habit was done
CREATE TABLE public.habit_completions (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  done_on  date NOT NULL,
  UNIQUE (habit_id, done_on)
);

-- mental_logs: daily mood + motivation, one row per (user, date)
CREATE TABLE public.mental_logs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_on  date NOT NULL,
  mood       smallint NOT NULL DEFAULT 5 CHECK (mood BETWEEN 0 AND 10),
  motivation smallint NOT NULL DEFAULT 5 CHECK (motivation BETWEEN 0 AND 10),
  UNIQUE (user_id, logged_on)
);

-- ── Indexes ────────────────────────────────────────────────

CREATE INDEX habits_user_id_idx       ON public.habits(user_id);
CREATE INDEX habits_user_active_idx   ON public.habits(user_id, archived_at) WHERE archived_at IS NULL;
CREATE INDEX completions_user_month   ON public.habit_completions(user_id, done_on);
CREATE INDEX mental_logs_user_month   ON public.mental_logs(user_id, logged_on);

-- ── Triggers ───────────────────────────────────────────────

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Row Level Security ─────────────────────────────────────

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mental_logs       ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (id = auth.uid());

-- habits
CREATE POLICY "habits_select_own"   ON public.habits FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "habits_insert_own"   ON public.habits FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "habits_update_own"   ON public.habits FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "habits_delete_own"   ON public.habits FOR DELETE USING (user_id = auth.uid());

-- habit_completions
CREATE POLICY "completions_select_own" ON public.habit_completions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "completions_insert_own" ON public.habit_completions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "completions_delete_own" ON public.habit_completions FOR DELETE USING (user_id = auth.uid());

-- mental_logs
CREATE POLICY "mental_select_own"  ON public.mental_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "mental_insert_own"  ON public.mental_logs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "mental_update_own"  ON public.mental_logs FOR UPDATE USING (user_id = auth.uid());
