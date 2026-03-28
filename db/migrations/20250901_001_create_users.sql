-- Migration: 20250901_001_create_users
-- Creates the core users table with age-tier enforcement.
-- age_tier is server-computed only — never set by client input.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.users (
  id                  uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name        text          NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 40),
  date_of_birth       date          NOT NULL,
  age_tier            text          NOT NULL CHECK (age_tier IN ('minor', 'young_adult')),
  city                text          CHECK (char_length(city) <= 80),
  state               text          CHECK (char_length(state) <= 50),
  bio                 text          CHECK (char_length(bio) <= 200),
  avatar_url          text,
  auth_provider       text          NOT NULL CHECK (auth_provider IN ('google', 'apple')),
  parental_consent_at timestamptz   DEFAULT NULL,
  account_status      text          NOT NULL DEFAULT 'active'
                                    CHECK (account_status IN ('active', 'pending_consent', 'suspended', 'banned')),
  is_staff            boolean       NOT NULL DEFAULT false,
  created_at          timestamptz   NOT NULL DEFAULT now(),
  updated_at          timestamptz   NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- IMPORTANT: age_tier is server-computed only.
-- It must never be accepted from client input in any API route.
COMMENT ON COLUMN public.users.age_tier IS
  'Server-computed from date_of_birth. Never accept from client input. minor=16-17, young_adult=18-25.';

COMMENT ON COLUMN public.users.date_of_birth IS
  'Used to compute age_tier at registration and on the user''s 18th birthday. Never expose raw DOB in public APIs.';

CREATE INDEX IF NOT EXISTS idx_users_age_tier       ON public.users (age_tier);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON public.users (account_status);

-- Auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
