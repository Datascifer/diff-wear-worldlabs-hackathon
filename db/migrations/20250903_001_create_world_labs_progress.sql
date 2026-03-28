-- Migration: 20250903_001_create_world_labs_progress

CREATE TABLE IF NOT EXISTS public.prayer_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  duration_seconds int NOT NULL,
  scripture_ref text,
  completed_at timestamptz DEFAULT now()
);

ALTER TABLE public.prayer_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own sessions" ON public.prayer_sessions;
CREATE POLICY "own sessions" ON public.prayer_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_prayer_sessions_user ON public.prayer_sessions(user_id);

CREATE TABLE IF NOT EXISTS public.journey_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  chapter_number int NOT NULL CHECK (chapter_number BETWEEN 1 AND 5),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  journal_entry text,
  unlocked_at timestamptz,
  UNIQUE(user_id, chapter_number)
);

ALTER TABLE public.journey_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own journey" ON public.journey_progress;
CREATE POLICY "own journey" ON public.journey_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_journey_user ON public.journey_progress(user_id, chapter_number);

CREATE OR REPLACE FUNCTION public.check_journey_completion()
RETURNS TRIGGER AS $$
DECLARE
  completed_count int;
  badge_id uuid;
BEGIN
  SELECT COUNT(*) INTO completed_count
  FROM public.journey_progress
  WHERE user_id = NEW.user_id AND completed_at IS NOT NULL;

  IF completed_count = 5 THEN
    SELECT id INTO badge_id FROM public.badges WHERE slug = 'wayfinder';
    IF badge_id IS NOT NULL THEN
      INSERT INTO public.user_badges (user_id, badge_id, earned_at)
      VALUES (NEW.user_id, badge_id, now())
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS journey_completion_check ON public.journey_progress;
CREATE TRIGGER journey_completion_check
AFTER UPDATE ON public.journey_progress
FOR EACH ROW WHEN (NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL)
EXECUTE FUNCTION public.check_journey_completion();
