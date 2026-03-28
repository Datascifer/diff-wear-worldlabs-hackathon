-- Migration: 20250903_002_create_campfire_sessions

CREATE TABLE IF NOT EXISTS public.campfire_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  topic text,
  host_id uuid REFERENCES public.users(id),
  status text DEFAULT 'live' CHECK (status IN ('live','closed')),
  participant_cap int DEFAULT 50,
  opened_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  narration_script_id text
);

ALTER TABLE public.campfire_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "adults view campfires" ON public.campfire_sessions;
CREATE POLICY "adults view campfires" ON public.campfire_sessions
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE age_tier = 'young_adult' AND account_status = 'active'
    )
  );

CREATE TABLE IF NOT EXISTS public.campfire_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.campfire_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  avatar_color text NOT NULL DEFAULT '#7B2FFF',
  joined_at timestamptz DEFAULT now(),
  left_at timestamptz,
  UNIQUE(session_id, user_id)
);

ALTER TABLE public.campfire_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "adults join campfires" ON public.campfire_participants;
CREATE POLICY "adults join campfires" ON public.campfire_participants
  FOR ALL USING (
    auth.uid() = user_id AND
    auth.uid() IN (
      SELECT id FROM public.users WHERE age_tier = 'young_adult' AND account_status = 'active'
    )
  );

CREATE OR REPLACE FUNCTION public.enforce_campfire_cap()
RETURNS TRIGGER AS $$
DECLARE
  participant_count int;
BEGIN
  SELECT COUNT(*) INTO participant_count
  FROM public.campfire_participants
  WHERE session_id = NEW.session_id AND left_at IS NULL;

  IF participant_count >= 50 THEN
    RAISE EXCEPTION 'Campfire is at capacity (50 participants)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS campfire_cap_check ON public.campfire_participants;
CREATE TRIGGER campfire_cap_check
BEFORE INSERT ON public.campfire_participants
FOR EACH ROW EXECUTE FUNCTION public.enforce_campfire_cap();
