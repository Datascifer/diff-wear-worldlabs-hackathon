-- Migration: 20250902_004_seed_move_plans
-- Seeds 20 faith-centered workout plans across all plan types.

INSERT INTO public.move_plans (title, description, plan_type, scripture_reference, duration_minutes) VALUES

-- CARDIO (5)
('Morning Devotional Run',
 'Begin your run by speaking today''s scripture aloud. With each mile, release one worry to God. Focus on breath as prayer.',
 'cardio', 'Philippians 4:13', 30),

('Praise Walk',
 'Walk with worship music or in silence, giving thanks for each step. Notice creation around you. No pace goals — just presence.',
 'cardio', 'Psalm 118:24', 25),

('Faith Sprint Intervals',
 '8 rounds: sprint 30 seconds, walk 90 seconds. On each sprint, push past what you think you can. His strength, not yours.',
 'cardio', 'Isaiah 40:31', 20),

('Evening Wind-Down Walk',
 'A slow, prayerful walk to close the day. Reflect on one moment of grace from today. Let the day go.',
 'cardio', 'Matthew 11:28', 25),

('Community Run',
 'Best done with a friend or your Diiff community. Run at a pace where you can still hold a conversation about what matters.',
 'cardio', 'Ecclesiastes 4:9-10', 45),

-- STRENGTH (5)
('Strength & Scripture',
 'Full body circuit. Between each set, pause and meditate on one word from today''s scripture. Rest is not weakness — it is surrender.',
 'strength', 'Joshua 1:9', 45),

('Iron Soul',
 'Progressive overload focus. Track your lifts. Your body remembers every rep of faithfulness. Compound movements only today.',
 'strength', '1 Corinthians 9:27', 60),

('Foundation Work',
 'Bodyweight fundamentals for beginners. Plank, push-up, squat, lunge. Build on solid ground. Every expert was once a beginner.',
 'strength', 'Matthew 7:24', 35),

('Temple Builder',
 'Upper body focus. Every press, pull, and row is an act of stewardship. You are building something that serves more than yourself.',
 'strength', '1 Corinthians 6:19-20', 50),

('Pillar Training',
 'Lower body and core. The pillars hold everything up. Train the foundations. Hip hinge, squat, deadlift pattern.',
 'strength', 'Proverbs 31:17', 40),

-- FLEXIBILITY (5)
('Mindful Yoga Flow',
 'A guided series of poses with breath cues. Each exhale releases what you''ve been carrying. "Be still and know." Move slowly.',
 'flexibility', 'Psalm 46:10', 20),

('Morning Stretch + Prayer',
 'Wake-up mobility routine. 10 stretches, 10 gratitudes. Start each stretch with one thing you''re thankful for today.',
 'flexibility', 'Lamentations 3:22-23', 15),

('Deep Release',
 'Hip and shoulder tension release. Hold each stretch for 60 seconds minimum. Tension stored in the body is often grief stored in the spirit.',
 'flexibility', 'Matthew 11:29', 30),

('Faith Breathwork Flow',
 'Breathing exercises woven into gentle movement. Each breath is the breath God first gave. Inhale grace, exhale anxiety.',
 'flexibility', 'Genesis 2:7', 15),

('Evening Restore',
 'Restorative poses for rest preparation. Bolster-supported positions held for 3–5 minutes each. Let your nervous system say yes to rest.',
 'flexibility', 'Psalm 23:2', 20),

-- BREATHWORK (5)
('4-7-8 Prayer Breathing',
 'Inhale for 4 counts, hold for 7, exhale for 8. Repeat 8 cycles. Between each cycle, speak one word of prayer. Simple. Consistent. Transformative.',
 'breathwork', 'Psalm 150:6', 10),

('Stress Reset',
 'Physiological sigh technique: double inhale through the nose, long exhale through the mouth. For moments when the day has been too much.',
 'breathwork', 'John 14:27', 15),

('Pre-Workout Activation',
 'Energizing breath pattern to prepare mind and body. Box breathing at pace: 4 in, 4 hold, 4 out, 4 hold. 10 rounds.',
 'breathwork', 'Philippians 4:13', 8),

('Crisis Calm',
 'For moments of anxiety or overwhelm. Extended exhale breathing: inhale 4 counts, exhale 8 counts. The nervous system responds to the exhale.',
 'breathwork', 'Isaiah 26:3', 10),

('Evening Wind-Down Breath',
 'Prepare mind and body for sleep. Progressive relaxation with slow diaphragmatic breathing. Last thing before you rest.',
 'breathwork', 'Psalm 4:8', 12)

ON CONFLICT DO NOTHING;
