import type { SupabaseClient } from "@supabase/supabase-js";

// generateConsentToken — creates a consent token record and returns the token UUID.
// Called server-side only when a minor submits their parent's email.
export async function generateConsentToken(
  userId: string,
  parentEmail: string,
  supabase: SupabaseClient
): Promise<string> {
  // Upsert: replace any existing token for this user
  const { data, error } = await supabase
    .from("consent_tokens")
    .upsert(
      {
        user_id: userId,
        parent_email: parentEmail,
        confirmed_at: null,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select("token")
    .single();

  if (error ?? !data) {
    throw new Error(`Failed to generate consent token: ${error?.message ?? "unknown"}`);
  }

  return data.token as string;
}

// validateConsentToken — looks up a token and validates it is unexpired and unconfirmed.
export async function validateConsentToken(
  token: string,
  supabase: SupabaseClient
): Promise<{ valid: boolean; userId?: string; parentEmail?: string }> {
  const { data, error } = await supabase
    .from("consent_tokens")
    .select("user_id, parent_email, expires_at, confirmed_at")
    .eq("token", token)
    .single();

  if (error ?? !data) return { valid: false };

  if (data.confirmed_at !== null) return { valid: false }; // already confirmed

  const expiresAt = new Date(data.expires_at as string);
  if (expiresAt < new Date()) return { valid: false }; // expired

  return {
    valid: true,
    userId: data.user_id as string,
    parentEmail: data.parent_email as string,
  };
}

// activateMinorAccount — marks token as confirmed and sets account_status to active.
export async function activateMinorAccount(
  token: string,
  supabase: SupabaseClient
): Promise<{ userId: string } | null> {
  const validation = await validateConsentToken(token, supabase);
  if (!validation.valid ?? !validation.userId) return null;

  const now = new Date().toISOString();

  // Mark token confirmed
  const { error: tokenError } = await supabase
    .from("consent_tokens")
    .update({ confirmed_at: now })
    .eq("token", token);

  if (tokenError) throw new Error(`Token confirm failed: ${tokenError.message}`);

  // Activate account and record consent timestamp
  const { error: userError } = await supabase
    .from("users")
    .update({
      account_status: "active",
      parental_consent_at: now,
    })
    .eq("id", validation.userId);

  if (userError) throw new Error(`Account activation failed: ${userError.message}`);

  return { userId: validation.userId };
}
