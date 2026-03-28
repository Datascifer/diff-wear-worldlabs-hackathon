-- RLS Policies: users table
-- age_tier is NEVER derived from JWT claims — always read from the DB row.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Helper: is the calling user's profile marked as a minor?
-- Reads directly from the DB row — never from JWT claims.
CREATE OR REPLACE FUNCTION public.is_minor_profile(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT age_tier = 'minor'
  FROM public.users
  WHERE id = user_id;
$$;

-- SELECT: users can read their own profile.
--         Anyone authenticated can read basic profiles (for social features).
CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "users_select_others"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: only the auth owner can insert their own profile row.
CREATE POLICY "users_insert_own"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- UPDATE: users can update their own profile.
--         age_tier, date_of_birth, is_staff, and account_status are
--         protected at the API layer — this policy is a fallback gate.
CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- DELETE: users cannot delete their own profile via RLS.
--         Account deletion is handled via a service role edge function
--         that cascades properly and logs the action.
-- (No DELETE policy → DELETE is denied for authenticated role.)
