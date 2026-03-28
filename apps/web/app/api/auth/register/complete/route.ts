import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import type { ApiResult } from "@/types/domain";
import { isEligibleAge, computeAgeTier } from "@/lib/utils/age";
import { sanitizeText } from "@/lib/utils/api";
// Email sends happen asynchronously — import lazily to avoid blocking if keys missing

export async function POST(request: NextRequest) {
  const supabase = createClient();

  // 1. Validate session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  // 2. Ensure profile doesn't already exist (idempotency guard)
  const { data: existing } = await supabase
    .from("users")
    .select("id, account_status")
    .eq("id", user.id)
    .single();

  if (existing) {
    // Already registered — redirect based on status
    const dest = existing.account_status === "pending_consent" ? "age-gate" : "feed";
    return NextResponse.json<ApiResult<{ redirect: string }>>(
      { success: true, data: { redirect: dest } },
      { status: 200 }
    );
  }

  // 3. Parse and validate body
  const body = (await request.json()) as {
    displayName?: string;
    dateOfBirth?: string;
    city?: string;
  };

  if (!body.displayName || body.displayName.trim().length === 0) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "MISSING_DISPLAY_NAME", message: "Display name is required." } },
      { status: 422 }
    );
  }

  if (!body.dateOfBirth) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "MISSING_DOB", message: "Date of birth is required." } },
      { status: 422 }
    );
  }

  // 4. Server-side age validation — INVARIANT: never trust client-computed age
  const dob = new Date(body.dateOfBirth);
  if (isNaN(dob.getTime())) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "INVALID_DOB", message: "Invalid date of birth." } },
      { status: 422 }
    );
  }

  if (!isEligibleAge(dob)) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "INELIGIBLE_AGE", message: "Diiff is for people ages 16–25 only." } },
      { status: 422 }
    );
  }

  // 5. Compute age tier server-side — INVARIANT: never accept from client
  const ageTier = computeAgeTier(dob);
  const accountStatus = ageTier === "minor" ? "pending_consent" : "active";
  const authProvider = (user.app_metadata["provider"] as string | undefined) ?? "google";

  const { error: insertError } = await supabase.from("users").insert({
    id: user.id,
    display_name: sanitizeText(body.displayName, 40),
    date_of_birth: body.dateOfBirth,
    age_tier: ageTier,
    account_status: accountStatus,
    auth_provider: authProvider,
    city: body.city ? sanitizeText(body.city, 80) : null,
  });

  if (insertError) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "DB_ERROR", message: "Failed to create profile." } },
      { status: 500 }
    );
  }

  // 6. Post-registration side effects (non-blocking)
  if (ageTier === "young_adult" && user.email) {
    void (async () => {
      try {
        const { sendEmail } = await import("../../../../../../services/email/index");
        const { WelcomeAdultEmail } = await import("../../../../../../services/email/templates/welcome-adult");
        const { createElement } = await import("react");
        await sendEmail(
          user.email!,
          "Welcome to Diiff",
          createElement(WelcomeAdultEmail, { displayName: body.displayName! })
        );
      } catch (e) {
        console.error("[register] Welcome email failed:", e);
      }
    })();
  }

  return NextResponse.json<ApiResult<{ redirect: string; ageTier: string }>>(
    { success: true, data: { redirect: ageTier === "minor" ? "age-gate" : "feed", ageTier } },
    { status: 201 }
  );
}
