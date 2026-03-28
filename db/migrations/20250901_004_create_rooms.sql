-- Migration: 20250901_004_create_rooms
-- Creates rooms, room_participants, and room_moderators tables.
-- Database triggers enforce minor safety rules at the database level.

CREATE TABLE IF NOT EXISTS public.rooms (
  id          uuid          NOT NULL DEFAULT uuid_generate_v4(),
  creator_id  uuid          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title       text          NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  topic       text          CHECK (char_length(topic) <= 200),
  room_type   text          NOT NULL DEFAULT 'all_ages_moderated'
                            CHECK (room_type IN ('all_ages_moderated', 'adults_only')),
  status      text          NOT NULL DEFAULT 'scheduled'
                            CHECK (status IN ('scheduled', 'live', 'closed')),
  opened_at   timestamptz   DEFAULT NULL,
  closed_at   timestamptz   DEFAULT NULL,
  created_at  timestamptz   NOT NULL DEFAULT now(),
  updated_at  timestamptz   NOT NULL DEFAULT now(),
  CONSTRAINT rooms_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_rooms_creator_id ON public.rooms (creator_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status     ON public.rooms (status);
CREATE INDEX IF NOT EXISTS idx_rooms_room_type  ON public.rooms (room_type);

-- Trigger: prevent minors from creating rooms
CREATE OR REPLACE FUNCTION public.enforce_room_creator_age()
RETURNS TRIGGER AS $$
DECLARE
  creator_age_tier text;
BEGIN
  SELECT age_tier INTO creator_age_tier
  FROM public.users
  WHERE id = NEW.creator_id;

  IF creator_age_tier = 'minor' THEN
    RAISE EXCEPTION 'Minor users cannot create rooms.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER rooms_enforce_creator_age
  BEFORE INSERT ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.enforce_room_creator_age();

CREATE TRIGGER rooms_set_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Room participants
CREATE TABLE IF NOT EXISTS public.room_participants (
  id        uuid          NOT NULL DEFAULT uuid_generate_v4(),
  room_id   uuid          NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id   uuid          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role      text          NOT NULL DEFAULT 'listener'
                          CHECK (role IN ('listener', 'speaker', 'moderator')),
  joined_at timestamptz   NOT NULL DEFAULT now(),
  left_at   timestamptz   DEFAULT NULL,
  CONSTRAINT room_participants_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON public.room_participants (room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_user_id ON public.room_participants (user_id);

-- Room moderators
CREATE TABLE IF NOT EXISTS public.room_moderators (
  id                 uuid        NOT NULL DEFAULT uuid_generate_v4(),
  room_id            uuid        NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  moderator_user_id  uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_active          boolean     NOT NULL DEFAULT true,
  assigned_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT room_moderators_pkey PRIMARY KEY (id)
);

-- Trigger: prevent minors from joining adults_only rooms or rooms without active moderator
CREATE OR REPLACE FUNCTION public.enforce_participant_safety()
RETURNS TRIGGER AS $$
DECLARE
  participant_age_tier   text;
  target_room_type       text;
  active_moderator_count int;
BEGIN
  SELECT age_tier INTO participant_age_tier
  FROM public.users
  WHERE id = NEW.user_id;

  SELECT room_type INTO target_room_type
  FROM public.rooms
  WHERE id = NEW.room_id;

  IF participant_age_tier = 'minor' AND target_room_type = 'adults_only' THEN
    RAISE EXCEPTION 'Minor users cannot join adults_only rooms.'
      USING ERRCODE = 'check_violation';
  END IF;

  IF participant_age_tier = 'minor' THEN
    SELECT COUNT(*) INTO active_moderator_count
    FROM public.room_moderators
    WHERE room_id = NEW.room_id AND is_active = true;

    IF active_moderator_count = 0 THEN
      RAISE EXCEPTION 'Minors cannot join rooms without an active moderator.'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER room_participants_enforce_safety
  BEFORE INSERT ON public.room_participants
  FOR EACH ROW EXECUTE FUNCTION public.enforce_participant_safety();
