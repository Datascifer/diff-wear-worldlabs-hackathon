-- RLS Policies: moderation_flags
-- This table is APPEND-ONLY. No DELETE policy exists at any level.
-- Only staff may view all flags. Regular users may only insert (report) flags.

ALTER TABLE public.moderation_flags ENABLE ROW LEVEL SECURITY;

-- SELECT: staff can read all flags. Users cannot query flags directly.
CREATE POLICY "moderation_flags_select_staff"
  ON public.moderation_flags
  FOR SELECT
  TO authenticated
  USING (
    (SELECT is_staff FROM public.users WHERE id = auth.uid())
  );

-- INSERT: any authenticated user can file a report.
--         flagged_by must match the calling user (enforced by API layer too).
CREATE POLICY "moderation_flags_insert_authenticated"
  ON public.moderation_flags
  FOR INSERT
  TO authenticated
  WITH CHECK (
    flagged_by = auth.uid()
    OR flagged_by IS NULL  -- system-generated flags (Perspective API auto-flag)
  );

-- UPDATE: staff only, to resolve/action flags.
CREATE POLICY "moderation_flags_update_staff"
  ON public.moderation_flags
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT is_staff FROM public.users WHERE id = auth.uid())
  )
  WITH CHECK (
    (SELECT is_staff FROM public.users WHERE id = auth.uid())
  );

-- DELETE: no policy. DELETE was also revoked in the migration.
-- Double protection: no policy + REVOKE DELETE ensures immutability.
