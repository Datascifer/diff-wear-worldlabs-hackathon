-- Migration: 20250901_006_create_badges
-- Creates badges catalog, user_badges join table, and seeds initial badge data.

CREATE TABLE IF NOT EXISTS public.badges (
  id          uuid  NOT NULL DEFAULT uuid_generate_v4(),
  slug        text  NOT NULL UNIQUE CHECK (char_length(slug) BETWEEN 1 AND 60),
  name        text  NOT NULL CHECK (char_length(name) BETWEEN 1 AND 60),
  description text  NOT NULL CHECK (char_length(description) <= 200),
  icon_url    text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT badges_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id         uuid        NOT NULL DEFAULT uuid_generate_v4(),
  user_id    uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id   uuid        NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_badges_pkey        PRIMARY KEY (id),
  CONSTRAINT user_badges_user_badge  UNIQUE (user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id  ON public.user_badges (user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges (badge_id);

-- Seed: initial badge catalog
INSERT INTO public.badges (slug, name, description) VALUES
  ('first_post',        'First Word',      'Published your very first post on Diiff.'),
  ('streak_7',          'Week Warrior',    'Maintained a move or devotional streak for 7 days.'),
  ('streak_30',         'Month Strong',    'Kept a streak alive for 30 consecutive days.'),
  ('community_voice',   'Community Voice', 'Received 10 or more likes across your posts.'),
  ('scripture_seeker',  'Scripture Seeker','Opened the daily scripture 5 days in a row.'),
  ('move_milestone',    'Move Milestone',  'Logged 10 completed workouts.'),
  ('verified_consent',  'Family Circle',   'Account verified with parental consent.')
ON CONFLICT (slug) DO NOTHING;
