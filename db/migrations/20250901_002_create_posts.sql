-- Migration: 20250901_002_create_posts
-- Creates posts table with minor-audience enforcement via trigger.

CREATE TABLE IF NOT EXISTS public.posts (
  id                uuid          NOT NULL DEFAULT uuid_generate_v4(),
  author_id         uuid          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content           text          NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  post_type         text          NOT NULL CHECK (post_type IN ('spirit', 'move', 'community', 'wellness')),
  audience          text          NOT NULL DEFAULT 'all_ages'
                                  CHECK (audience IN ('all_ages', 'adults_only')),
  media_url         text,
  moderation_status text          NOT NULL DEFAULT 'pending'
                                  CHECK (moderation_status IN ('pending', 'approved', 'removed', 'flagged')),
  created_at        timestamptz   NOT NULL DEFAULT now(),
  updated_at        timestamptz   NOT NULL DEFAULT now(),
  CONSTRAINT posts_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_posts_author_id         ON public.posts (author_id);
CREATE INDEX IF NOT EXISTS idx_posts_post_type         ON public.posts (post_type);
CREATE INDEX IF NOT EXISTS idx_posts_audience          ON public.posts (audience);
CREATE INDEX IF NOT EXISTS idx_posts_moderation_status ON public.posts (moderation_status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at        ON public.posts (created_at DESC);

-- Trigger: prevent minors from setting audience = 'adults_only'
CREATE OR REPLACE FUNCTION public.enforce_minor_audience()
RETURNS TRIGGER AS $$
DECLARE
  author_age_tier text;
BEGIN
  SELECT age_tier INTO author_age_tier
  FROM public.users
  WHERE id = NEW.author_id;

  IF author_age_tier = 'minor' AND NEW.audience = 'adults_only' THEN
    RAISE EXCEPTION 'Minor users cannot create adults_only posts.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER posts_enforce_minor_audience
  BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_minor_audience();

CREATE TRIGGER posts_set_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
