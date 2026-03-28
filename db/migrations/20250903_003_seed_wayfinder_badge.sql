-- Migration: 20250903_003_seed_wayfinder_badge

INSERT INTO public.badges (slug, name, description, icon)
VALUES ('wayfinder', 'Wayfinder', 'Completed all 5 chapters of the Identity Journey.', '🧭')
ON CONFLICT (slug) DO NOTHING;
