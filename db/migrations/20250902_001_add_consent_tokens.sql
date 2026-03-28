-- Migration: 20250902_001_add_consent_tokens
-- Consent token table for minor parental consent flow.
-- One active token per user at a time (UNIQUE on user_id).

CREATE TABLE IF NOT EXISTS public.consent_tokens (
  id            uuid        NOT NULL DEFAULT uuid_generate_v4(),
  user_id       uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token         uuid        NOT NULL DEFAULT uuid_generate_v4(),
  parent_email  text        NOT NULL CHECK (char_length(parent_email) BETWEEN 5 AND 200),
  expires_at    timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  confirmed_at  timestamptz DEFAULT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT consent_tokens_pkey        PRIMARY KEY (id),
  CONSTRAINT consent_tokens_user_unique UNIQUE (user_id),
  CONSTRAINT consent_tokens_token_unique UNIQUE (token)
);

CREATE INDEX IF NOT EXISTS idx_consent_tokens_token   ON public.consent_tokens (token);
CREATE INDEX IF NOT EXISTS idx_consent_tokens_user_id ON public.consent_tokens (user_id);

ALTER TABLE public.consent_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only read their own consent token status
CREATE POLICY "consent_tokens_select_own"
  ON public.consent_tokens FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Service role inserts/updates via backend only
-- No INSERT policy for authenticated role — tokens are created server-side only
