-- Migration: 20250901_007_create_moderation
-- Creates the moderation_flags table.
-- This table is APPEND-ONLY: DELETE is explicitly revoked at the role level.
-- No row may ever be deleted — only resolved via status updates.

CREATE TABLE IF NOT EXISTS public.moderation_flags (
  id              uuid        NOT NULL DEFAULT uuid_generate_v4(),
  content_type    text        NOT NULL CHECK (content_type IN ('post', 'comment', 'room', 'user')),
  content_id      uuid        NOT NULL,
  flagged_by      uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  reason          text        NOT NULL CHECK (char_length(reason) <= 500),
  status          text        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  scores          jsonb       DEFAULT NULL,  -- raw Perspective API scores snapshot
  resolved_by     uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  resolved_at     timestamptz DEFAULT NULL,
  resolution_note text        CHECK (char_length(resolution_note) <= 500),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT moderation_flags_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_moderation_flags_content     ON public.moderation_flags (content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_moderation_flags_status      ON public.moderation_flags (status);
CREATE INDEX IF NOT EXISTS idx_moderation_flags_flagged_by  ON public.moderation_flags (flagged_by);
CREATE INDEX IF NOT EXISTS idx_moderation_flags_created_at  ON public.moderation_flags (created_at DESC);

CREATE TRIGGER moderation_flags_set_updated_at
  BEFORE UPDATE ON public.moderation_flags
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CRITICAL: Revoke DELETE on moderation_flags for all roles.
-- This table is the audit trail. Rows must never be deleted.
-- Staff may only update status/resolution fields.
REVOKE DELETE ON public.moderation_flags FROM PUBLIC;
REVOKE DELETE ON public.moderation_flags FROM authenticated;
REVOKE DELETE ON public.moderation_flags FROM anon;
REVOKE DELETE ON public.moderation_flags FROM service_role;
