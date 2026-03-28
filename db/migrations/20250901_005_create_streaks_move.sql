-- Migration: 20250901_005_create_streaks_move
-- Creates move_plans, move_logs, and streaks tables.

CREATE TABLE IF NOT EXISTS public.move_plans (
  id                 uuid        NOT NULL DEFAULT uuid_generate_v4(),
  title              text        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  description        text        CHECK (char_length(description) <= 500),
  plan_type          text        NOT NULL CHECK (plan_type IN ('cardio', 'strength', 'flexibility', 'breathwork')),
  scripture_reference text       CHECK (char_length(scripture_reference) <= 100),
  duration_minutes   int         NOT NULL CHECK (duration_minutes > 0),
  created_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT move_plans_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_move_plans_plan_type ON public.move_plans (plan_type);

CREATE TABLE IF NOT EXISTS public.move_logs (
  id               uuid        NOT NULL DEFAULT uuid_generate_v4(),
  user_id          uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id          uuid        NOT NULL REFERENCES public.move_plans(id) ON DELETE CASCADE,
  completed_at     timestamptz NOT NULL DEFAULT now(),
  duration_minutes int         CHECK (duration_minutes > 0),
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT move_logs_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_move_logs_user_id      ON public.move_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_move_logs_plan_id      ON public.move_logs (plan_id);
CREATE INDEX IF NOT EXISTS idx_move_logs_completed_at ON public.move_logs (completed_at DESC);

CREATE TABLE IF NOT EXISTS public.streaks (
  id                 uuid  NOT NULL DEFAULT uuid_generate_v4(),
  user_id            uuid  NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  streak_type        text  NOT NULL CHECK (streak_type IN ('move', 'devotional')),
  current_count      int   NOT NULL DEFAULT 0 CHECK (current_count >= 0),
  longest_count      int   NOT NULL DEFAULT 0 CHECK (longest_count >= 0),
  last_activity_date date  DEFAULT NULL,
  CONSTRAINT streaks_pkey                PRIMARY KEY (id),
  CONSTRAINT streaks_user_type_unique    UNIQUE (user_id, streak_type)
);

CREATE INDEX IF NOT EXISTS idx_streaks_user_id     ON public.streaks (user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_streak_type ON public.streaks (streak_type);
