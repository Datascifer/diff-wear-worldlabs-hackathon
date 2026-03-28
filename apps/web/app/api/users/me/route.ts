import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import type { ApiResult, AgeTier } from "@/types/domain";
import { getCapabilities } from "@/lib/utils/capabilities";
import { isEligibleAge, computeAgeTier } from "@/lib/utils/age";

export async function GET(_request: NextRequest) {
  const supabase = createClient();

  // 1. Validate session
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  // 2. Resolve profile from DB
  const { data: profile } = await supabase
    .from("users")
    .select(
      "id, display_name, bio, city, state, age_tier, avatar_url, account_status, created_at"
    )
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "NOT_FOUND", message: "User profile not found." } },
      { status: 404 }
    );
  }

  const { data: streaks } = await supabase
    .from("streaks")
    .select("streak_type, current_count, longest_count, last_activity_date")
    .eq("user_id", user.id);

  const { data: userBadges } = await supabase
    .from("user_badges")
    .select("earned_at, badge:badges(slug, name, icon, description)")
    .eq("user_id", user.id);

  const capabilities = getCapabilities(profile.age_tier as AgeTier);

  return NextResponse.json<
    ApiResult<
      typeof profile & {
        streaks: typeof streaks;
        badges: typeof userBadges;
        capabilities: typeof capabilities;
      }
    >
  >({
    success: true,
    data: { ...profile, streaks, badges: userBadges, capabilities },
  });
}

export async function PATCH(request: NextRequest) {
  const supabase = createClient();

  // 1. Validate session
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  const body = (await request.json()) as {
    displayName?: string;
    bio?: string;
    city?: string;
    parentConsentEmail?: string;
    dateOfBirth?: string;
  };

  // date_of_birth, age_tier, is_staff, parental_consent_at are never updated via client PATCH
  const updates: Record<string, string> = {};

  if (body.displayName !== undefined) {
    if (body.displayName.trim().length === 0) {
      return NextResponse.json<ApiResult<never>>(
        { success: false, error: { code: "INVALID_INPUT", message: "Display name cannot be empty." } },
        { status: 422 }
      );
    }
    updates["display_name"] = body.displayName.trim().substring(0, 40);
  }

  if (body.bio !== undefined) {
    updates["bio"] = body.bio.substring(0, 200);
  }

  if (body.city !== undefined) {
    updates["city"] = body.city.trim().substring(0, 80);
  }

  // Initial registration with DOB — upserts the user record
  if (body.dateOfBirth) {
    const dob = new Date(body.dateOfBirth);
    if (!isEligibleAge(dob)) {
      return NextResponse.json<ApiResult<never>>(
        { success: false, error: { code: "INELIGIBLE_AGE", message: "Must be 16–25 to join Diiff." } },
        { status: 422 }
      );
    }
    const ageTier = computeAgeTier(dob);
    const accountStatus = ageTier === "minor" ? "pending_consent" : "active";

    const { error } = await supabase.from("users").upsert({
      id: user.id,
      date_of_birth: body.dateOfBirth,
      age_tier: ageTier,
      account_status: accountStatus,
      auth_provider:
        (user.app_metadata["provider"] as string | undefined) ?? "google",
      ...updates,
    });

    if (error) {
      return NextResponse.json<ApiResult<never>>(
        { success: false, error: { code: "DB_ERROR", message: "Failed to create profile." } },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResult<{ updated: true }>>({
      success: true,
      data: { updated: true },
    });
  }

  if (Object.keys(updates).length === 0 && !body.parentConsentEmail) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "NO_UPDATES", message: "No valid fields to update." } },
      { status: 422 }
    );
  }

  if (body.parentConsentEmail) {
    // In production: trigger an email via Resend/Postmark
    // For now, mark account as pending_consent
    updates["account_status"] = "pending_consent";
  }

  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "DB_ERROR", message: "Failed to update profile." } },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiResult<{ updated: true }>>({
    success: true,
    data: { updated: true },
  });
}
