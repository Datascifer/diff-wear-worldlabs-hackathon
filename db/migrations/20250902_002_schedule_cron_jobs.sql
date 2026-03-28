-- Migration: 20250902_002_schedule_cron_jobs
-- Schedules pg_cron jobs for birthday recalculation and streak updates.
-- Requires pg_cron and pg_net extensions (available on Supabase Pro).
-- Replace <SUPABASE_PROJECT_REF> with your actual project reference.
-- Replace <SERVICE_ROLE_KEY> with your service role key (set as Vault secret, not inline).

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Birthday recalculation: runs daily at 00:05 UTC
-- Upgrades users from minor → young_adult on their 18th birthday
SELECT cron.schedule(
  'birthday-recalculation',
  '5 0 * * *',
  $$
    SELECT net.http_post(
      url := 'https://' || current_setting('app.supabase_project_ref') || '.supabase.co/functions/v1/birthday-recalculation',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := '{}'::jsonb
    )
  $$
);

-- Streak recalculation: runs daily at 00:10 UTC
SELECT cron.schedule(
  'streak-recalculation',
  '10 0 * * *',
  $$
    SELECT net.http_post(
      url := 'https://' || current_setting('app.supabase_project_ref') || '.supabase.co/functions/v1/streak-recalculation',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := '{}'::jsonb
    )
  $$
);
