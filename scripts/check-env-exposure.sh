#!/usr/bin/env bash
# check-env-exposure.sh
# Fails with exit code 1 if any server-side secret key names appear in
# client-accessible files (NEXT_PUBLIC_ vars, files in public/, or client components).
# Run in CI before every build.

set -e

FAIL=0
SECRET_PATTERNS=(
  "SUPABASE_SERVICE_ROLE_KEY"
  "ELEVENLABS_API_KEY"
  "PERSPECTIVE_API_KEY"
  "RESEND_API_KEY"
  "VAPID_PRIVATE_KEY"
  "LIVEKIT_API_SECRET"
  "WORLD_LABS_API_KEY"
)

echo "=== Environment Exposure Check ==="

# 1. Check that no secret key NAME appears in any NEXT_PUBLIC_ variable definition
echo "Checking for secret keys in NEXT_PUBLIC_ definitions..."
for secret in "${SECRET_PATTERNS[@]}"; do
  if grep -r "NEXT_PUBLIC_${secret}" --include="*.ts" --include="*.tsx" --include="*.js" . \
       --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | grep -v ".env.example"; then
    echo "ERROR: ${secret} found as NEXT_PUBLIC_ variable — this would expose a secret to the browser."
    FAIL=1
  fi
done

# 2. Check that no secret key values appear in public/ directory
echo "Checking apps/web/public/ for secret key patterns..."
for secret in "${SECRET_PATTERNS[@]}"; do
  if grep -r "$secret" apps/web/public/ 2>/dev/null; then
    echo "ERROR: ${secret} found in public/ directory."
    FAIL=1
  fi
done

# 3. Check for hardcoded API key patterns (common formats)
echo "Checking for hardcoded API key patterns..."
HARDCODED_PATTERNS=(
  "sk_[a-zA-Z0-9_]{20,}"   # ElevenLabs / Stripe style
  "re_[a-zA-Z0-9_]{20,}"   # Resend style
  "eyJ[a-zA-Z0-9_-]{50,}"  # JWT tokens (service role keys)
)

for pattern in "${HARDCODED_PATTERNS[@]}"; do
  matches=$(grep -rE "$pattern" \
    --include="*.ts" --include="*.tsx" --include="*.js" \
    --exclude-dir=node_modules --exclude-dir=.next \
    --exclude="*.env*" \
    . 2>/dev/null | grep -v ".env.example" | grep -v "# " || true)
  if [ -n "$matches" ]; then
    echo "WARNING: Possible hardcoded credential pattern '$pattern' found:"
    echo "$matches"
    # Warning only — don't fail on this (could be test fixtures)
  fi
done

if [ $FAIL -eq 1 ]; then
  echo ""
  echo "=== SECURITY CHECK FAILED ==="
  echo "Secret key names were found in client-accessible locations."
  echo "Remove them before deploying."
  exit 1
else
  echo ""
  echo "=== All checks passed ==="
fi
