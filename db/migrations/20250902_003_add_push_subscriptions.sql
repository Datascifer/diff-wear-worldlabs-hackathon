-- Migration: 20250902_003_add_push_subscriptions
-- Web Push subscription storage for native push notifications.

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id        uuid  NOT NULL DEFAULT uuid_generate_v4(),
  user_id   uuid  NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint  text  NOT NULL CHECK (char_length(endpoint) BETWEEN 10 AND 2000),
  p256dh    text  NOT NULL,
  auth      text  NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT push_subscriptions_pkey          PRIMARY KEY (id),
  CONSTRAINT push_subscriptions_user_endpoint UNIQUE (user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions (user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_subscriptions_all_own"
  ON public.push_subscriptions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
