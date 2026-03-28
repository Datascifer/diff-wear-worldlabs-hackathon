-- Migration: 20250901_003_create_reactions_comments
-- Creates post_reactions and comments tables.

CREATE TABLE IF NOT EXISTS public.post_reactions (
  id            uuid          NOT NULL DEFAULT uuid_generate_v4(),
  post_id       uuid          NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id       uuid          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reaction_type text          NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like')),
  created_at    timestamptz   NOT NULL DEFAULT now(),
  CONSTRAINT post_reactions_pkey   PRIMARY KEY (id),
  CONSTRAINT post_reactions_unique UNIQUE (post_id, user_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON public.post_reactions (post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON public.post_reactions (user_id);

CREATE TABLE IF NOT EXISTS public.comments (
  id                uuid          NOT NULL DEFAULT uuid_generate_v4(),
  post_id           uuid          NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id         uuid          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content           text          NOT NULL CHECK (char_length(content) BETWEEN 1 AND 300),
  moderation_status text          NOT NULL DEFAULT 'pending'
                                  CHECK (moderation_status IN ('pending', 'approved', 'removed', 'flagged')),
  created_at        timestamptz   NOT NULL DEFAULT now(),
  updated_at        timestamptz   NOT NULL DEFAULT now(),
  CONSTRAINT comments_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id    ON public.comments (post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id  ON public.comments (author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments (created_at DESC);

CREATE TRIGGER comments_set_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
