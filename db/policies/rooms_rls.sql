-- RLS Policies: rooms, room_participants, room_moderators
-- Minors cannot see adults_only rooms.
-- Minors cannot create rooms (also enforced by DB trigger).
-- Minors cannot join rooms without an active moderator (also enforced by DB trigger).

ALTER TABLE public.rooms             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_moderators   ENABLE ROW LEVEL SECURITY;

-- Helper: is the calling user a young_adult (18–25)?
CREATE OR REPLACE FUNCTION public.caller_is_young_adult()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT age_tier = 'young_adult'
  FROM public.users
  WHERE id = auth.uid();
$$;

-- Helper: can the calling user join a given room?
--   - young_adults: can join any non-closed room.
--   - minors: can only join all_ages_moderated rooms that have an active moderator.
CREATE OR REPLACE FUNCTION public.can_join_room(room_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  caller_age_tier    text;
  target_room_type   text;
  target_room_status text;
  active_mods        int;
BEGIN
  SELECT age_tier INTO caller_age_tier
  FROM public.users WHERE id = auth.uid();

  SELECT room_type, status INTO target_room_type, target_room_status
  FROM public.rooms WHERE id = room_id;

  IF target_room_status = 'closed' THEN
    RETURN false;
  END IF;

  IF caller_age_tier = 'young_adult' THEN
    RETURN true;
  END IF;

  -- minor checks
  IF target_room_type = 'adults_only' THEN
    RETURN false;
  END IF;

  SELECT COUNT(*) INTO active_mods
  FROM public.room_moderators
  WHERE room_moderators.room_id = can_join_room.room_id AND is_active = true;

  RETURN active_mods > 0;
END;
$$;

-- ── rooms ────────────────────────────────────────────────────────────────────

-- SELECT: minors see only all_ages_moderated rooms.
CREATE POLICY "rooms_select"
  ON public.rooms
  FOR SELECT
  TO authenticated
  USING (
    NOT public.caller_is_minor()
    OR room_type = 'all_ages_moderated'
  );

-- INSERT: young_adults only. DB trigger also blocks minors.
CREATE POLICY "rooms_insert_young_adult"
  ON public.rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (
    creator_id = auth.uid()
    AND public.caller_is_young_adult()
  );

-- UPDATE: creator or staff only.
CREATE POLICY "rooms_update_creator_or_staff"
  ON public.rooms
  FOR UPDATE
  TO authenticated
  USING (
    creator_id = auth.uid()
    OR (SELECT is_staff FROM public.users WHERE id = auth.uid())
  )
  WITH CHECK (
    creator_id = auth.uid()
    OR (SELECT is_staff FROM public.users WHERE id = auth.uid())
  );

-- DELETE: no client-side delete.

-- ── room_participants ────────────────────────────────────────────────────────

CREATE POLICY "room_participants_select"
  ON public.room_participants
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: can_join_room enforces minor safety. DB trigger is secondary enforcement.
CREATE POLICY "room_participants_insert"
  ON public.room_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.can_join_room(room_id)
  );

-- UPDATE: own row only (e.g., updating left_at).
CREATE POLICY "room_participants_update_own"
  ON public.room_participants
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── room_moderators ──────────────────────────────────────────────────────────

CREATE POLICY "room_moderators_select"
  ON public.room_moderators
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: staff only can assign moderators.
CREATE POLICY "room_moderators_insert_staff"
  ON public.room_moderators
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT is_staff FROM public.users WHERE id = auth.uid())
  );

-- UPDATE: staff only.
CREATE POLICY "room_moderators_update_staff"
  ON public.room_moderators
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT is_staff FROM public.users WHERE id = auth.uid())
  )
  WITH CHECK (
    (SELECT is_staff FROM public.users WHERE id = auth.uid())
  );
