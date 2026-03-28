-- Migration: 20250902_005_seed_badges_extended
-- Extends the badges catalog with additional achievement badges.
-- The initial 7 badges were seeded in migration 006.

INSERT INTO public.badges (slug, name, description) VALUES
  ('founding_member',   'Founding Member',  'You were here from the very beginning of Diiff.'),
  ('faith_walk_21',     'Faith Walk',       'Maintained a devotional streak for 21 consecutive days.'),
  ('iron_soul_50',      'Iron Soul',        'Logged 50 completed workouts.'),
  ('voice_host',        'Voice Host',       'Opened a room and created space for community conversation.'),
  ('luminary_100',      'Luminary',         'Connected with 100 members of the Diiff community.'),
  ('community_builder', 'Community Builder','Left 50 comments that added value to the conversation.')
ON CONFLICT (slug) DO NOTHING;
