-- ============================================================
-- Migration: Job Tracker
-- Date: 2026-05-25
-- Run this in the Supabase SQL Editor after schema.sql
-- ============================================================

-- ── 1. Add board title to profiles ─────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS board_title TEXT NOT NULL DEFAULT 'Job hunt 2026';

-- ── 2. Job columns ──────────────────────────────────────────
-- One row per column on the kanban board, scoped per-user.
-- sort_order controls left-to-right display order.

CREATE TABLE public.job_columns (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  color      TEXT        NOT NULL DEFAULT '#94a3b8',
  emoji      TEXT        NOT NULL DEFAULT '■',
  sort_order INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_job_columns_user_sort ON public.job_columns(user_id, sort_order);

ALTER TABLE public.job_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_columns_all_own" ON public.job_columns
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── 3. Jobs ─────────────────────────────────────────────────
-- One row per job application. Belongs to a column (FK with
-- CASCADE delete — removing a column removes all its jobs).
-- date is stored as TEXT (user-entered display string, e.g. "May 25").
-- No archived_at — jobs are hard-deleted (no historical view needed).

CREATE TABLE public.jobs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  column_id   UUID        NOT NULL REFERENCES public.job_columns(id) ON DELETE CASCADE,
  company     TEXT        NOT NULL DEFAULT '',
  position    TEXT        NOT NULL DEFAULT '',
  description TEXT        NOT NULL DEFAULT '',
  salary      TEXT        NOT NULL DEFAULT '',
  location    TEXT        NOT NULL DEFAULT '',
  url         TEXT        NOT NULL DEFAULT '',
  tags        TEXT        NOT NULL DEFAULT '',
  date        TEXT        NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_jobs_user_col ON public.jobs(user_id, column_id);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jobs_all_own" ON public.jobs
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── 4. Seed default columns for existing accounts ───────────
-- New sign-ups are seeded in the app (auth.ts signUp action).
-- This one-time query seeds accounts that existed before this
-- migration. Safe to re-run — the WHERE NOT EXISTS guard makes
-- it idempotent.

INSERT INTO public.job_columns (user_id, name, color, emoji, sort_order)
SELECT u.id, c.name, c.color, c.emoji, c.sort_order
FROM auth.users u
CROSS JOIN (VALUES
  (0, 'Wishlist',     '#5aa7ff', '★'),
  (1, 'Applied',      '#8b5cf6', '➤'),
  (2, 'Interviewing', '#2bd4a1', '☏'),
  (3, 'Offers',       '#4ade80', '✓'),
  (4, 'Rejected',     '#ef4d6c', '✕'),
  (5, 'Ghosted',      '#6b7a99', '◌')
) AS c(sort_order, name, color, emoji)
WHERE NOT EXISTS (
  SELECT 1 FROM public.job_columns WHERE user_id = u.id
);
