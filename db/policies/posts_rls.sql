-- RLS Policies: posts, post_reactions, comments
-- Minor users must never see adults_only content.
-- age_tier is ALWAYS read from the DB row — never from JWT claims.

ALTER TABLE public.posts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments       ENABLE ROW LEVEL SECURITY;

-- Helper: is the calling authenticated user a minor?
CREATE OR REPLACE FUNCTION public.caller_is_minor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT age_tier = 'minor'
  FROM public.users
  WHERE id = auth.uid();
$$;

-- ── posts ────────────────────────────────────────────────────────────────────

-- SELECT: approved posts only.
--         Minors see only all_ages content.
--         Own posts visible regardless of moderation_status (author preview).
CREATE POLICY "posts_select_approved"
  ON public.posts
  FOR SELECT
  TO authenticated
  USING (
    (moderation_status = 'approved' OR author_id = auth.uid())
    AND (
      NOT public.caller_is_minor()
      OR audience = 'all_ages'
    )
  );

-- INSERT: authenticated users can create posts.
--         Trigger enforce_minor_audience blocks minors from adults_only at DB level.
CREATE POLICY "posts_insert_own"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

-- UPDATE: authors can update their own posts; staff can update any post.
CREATE POLICY "posts_update_own_or_staff"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (
    author_id = auth.uid()
    OR (SELECT is_staff FROM public.users WHERE id = auth.uid())
  )
  WITH CHECK (
    author_id = auth.uid()
    OR (SELECT is_staff FROM public.users WHERE id = auth.uid())
  );

-- DELETE: no client-side delete. Soft delete only (moderation_status = 'removed').
-- (No DELETE policy.)

-- ── post_reactions ───────────────────────────────────────────────────────────

CREATE POLICY "reactions_select"
  ON public.post_reactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "reactions_insert_own"
  ON public.post_reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "reactions_delete_own"
  ON public.post_reactions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ── comments ─────────────────────────────────────────────────────────────────

CREATE POLICY "comments_select_approved"
  ON public.comments
  FOR SELECT
  TO authenticated
  USING (
    moderation_status = 'approved'
    OR author_id = auth.uid()
  );

CREATE POLICY "comments_insert_own"
  ON public.comments
  FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "comments_update_own_or_staff"
  ON public.comments
  FOR UPDATE
  TO authenticated
  USING (
    author_id = auth.uid()
    OR (SELECT is_staff FROM public.users WHERE id = auth.uid())
  )
  WITH CHECK (
    author_id = auth.uid()
    OR (SELECT is_staff FROM public.users WHERE id = auth.uid())
  );

-- DELETE: no client-side delete.
-- (No DELETE policy.)
