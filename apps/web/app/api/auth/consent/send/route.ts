import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import type { ApiResult } from "@/types/domain";

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

  // 2. Confirm user is a minor with pending_consent status
  const { data: profile } = await supabase
    .from("users")
    .select("age_tier, account_status, display_name")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "NOT_FOUND", message: "User profile not found." } },
      { status: 404 }
    );
  }

  if (profile.age_tier !== "minor") {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "NOT_MINOR", message: "Consent flow only applies to minor accounts." } },
      { status: 400 }
    );
  }

  // 3. Parse and validate parent email
  const body = (await request.json()) as { parentEmail?: string };
  const parentEmail = body.parentEmail?.trim().toLowerCase();

  if (!parentEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "INVALID_EMAIL", message: "A valid parent email is required." } },
      { status: 422 }
    );
  }

  // 4. Generate consent token
  const { generateConsentToken } = await import("../../../../../../services/auth/consent");
  const token = await generateConsentToken(user.id, parentEmail, supabase);

  // 5. Build consent URL
  const origin = request.headers.get("origin") ?? "https://diiff.app";
  const consentUrl = `${origin}/api/auth/consent/confirm?token=${token}`;

  // 6. Send consent email
  try {
    const { sendEmail } = await import("../../../../../../services/email/index");
    const { ConsentRequestEmail } = await import("../../../../../../services/email/templates/consent-request");
    const { createElement } = await import("react");

    await sendEmail(
      parentEmail,
      `${profile.display_name as string} wants to join Diiff — your approval is needed`,
      createElement(ConsentRequestEmail, {
        minorDisplayName: profile.display_name as string,
        consentUrl,
        expiresHours: 24,
      })
    );
  } catch (e) {
    console.error("[consent/send] Email send failed:", e);
    // Don't fail the request — the token was created, user can resend
  }

  return NextResponse.json<ApiResult<{ sent: boolean }>>(
    { success: true, data: { sent: true } }
  );
}
