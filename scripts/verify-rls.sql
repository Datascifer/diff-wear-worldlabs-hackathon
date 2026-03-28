-- verify-rls.sql
-- Run this against your Supabase project to confirm RLS is enabled on all public tables.
-- Expected result: 0 rows (all tables have RLS enabled).
-- If any rows are returned, RLS is disabled on those tables — fix before deploying.

SELECT
  schemaname,
  tablename,
  rowsecurity
FROM
  pg_tables
WHERE
  schemaname = 'public'
  AND rowsecurity = false
ORDER BY
  tablename;

-- Also verify moderation_flags has no DELETE grant for authenticated role.
-- Expected result: 0 rows.
SELECT
  grantee,
  privilege_type
FROM
  information_schema.role_table_grants
WHERE
  table_schema = 'public'
  AND table_name = 'moderation_flags'
  AND privilege_type = 'DELETE'
  AND grantee IN ('authenticated', 'anon', 'public');

-- Verify all expected tables exist.
SELECT
  tablename
FROM
  pg_tables
WHERE
  schemaname = 'public'
ORDER BY
  tablename;
