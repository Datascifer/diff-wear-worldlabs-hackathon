import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgeTier } from "../../apps/web/types/domain";
import { AuthError } from "../../apps/web/types/domain";
import { computeAgeTier, isEligibleAge } from "../../apps/web/lib/utils/age";

export interface AuthUser {
  id: string;
  email: string | undefined;
}

// resolveSession — returns authenticated user or null.
// Uses getUser() not getSession() — safe for server-side use.
export async function resolveSession(
  supabase: SupabaseClient
): Promise<AuthUser | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error ?? !user) return null;
  return { id: user.id, email: user.email };
}

// assertAuthenticated — throws AuthError if session is invalid.
export async function assertAuthenticated(
  supabase: SupabaseClient
): Promise<AuthUser> {
  const user = await resolveSession(supabase);
  if (!user) throw new AuthError("Authentication required.");
  return user;
}

// resolveAgeTier — reads age tier from the database.
// INVARIANT: age tier is NEVER read from JWT claims or client input.
export async function resolveAgeTier(
  userId: string,
  supabase: SupabaseClient
): Promise<AgeTier> {
  const { data, error } = await supabase
    .from("users")
    .select("age_tier")
    .eq("id", userId)
    .single();

  if (error ?? !data) {
    throw new Error(
      `Cannot resolve age tier for user ${userId}: ${error?.message ?? "not found"}`
    );
  }

  const tier = data.age_tier as AgeTier;
  if (tier !== "minor" && tier !== "young_adult") {
    throw new Error(
      `Invalid age tier value "${String(tier)}" for user ${userId}`
    );
  }

  return tier;
}

// computeAndStoreAgeTier — calculates age tier from DOB and writes it to the DB.
// Called once during registration. Never called from client code.
export async function computeAndStoreAgeTier(
  userId: string,
  dateOfBirth: Date,
  supabase: SupabaseClient
): Promise<AgeTier> {
  if (!isEligibleAge(dateOfBirth)) {
    throw new Error("User is not eligible age (must be 16–25).");
  }

  const ageTier = computeAgeTier(dateOfBirth);

  const { error } = await supabase
    .from("users")
    .update({ age_tier: ageTier })
    .eq("id", userId);

  if (error) {
    throw new Error(
      `Failed to store age tier for user ${userId}: ${error.message}`
    );
  }

  return ageTier;
}
