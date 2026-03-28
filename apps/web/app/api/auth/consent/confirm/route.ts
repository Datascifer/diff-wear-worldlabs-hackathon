import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${origin}/consent-confirmed?status=invalid`);
  }

  // Use service client — parent clicking this link is not authenticated in Supabase Auth
  const supabase = createServiceClient();

  const { activateMinorAccount } = await import("../../../../../../services/auth/consent");
  const result = await activateMinorAccount(token, supabase);

  if (!result) {
    return NextResponse.redirect(`${origin}/consent-confirmed?status=invalid`);
  }

  // Send welcome email to the minor user
  try {
    const { data: userProfile } = await supabase
      .from("users")
      .select("display_name")
      .eq("id", result.userId)
      .single();

    const { data: authUser } = await supabase.auth.admin.getUserById(result.userId);

    if (userProfile && authUser.user?.email) {
      const { sendEmail } = await import("../../../../../../services/email/index");
      const { WelcomeMinorEmail } = await import("../../../../../../services/email/templates/welcome-minor");
      const { createElement } = await import("react");

      await sendEmail(
        authUser.user.email,
        "You're in — welcome to Diiff",
        createElement(WelcomeMinorEmail, {
          displayName: userProfile.display_name as string,
        })
      );
    }
  } catch (e) {
    console.error("[consent/confirm] Welcome email failed:", e);
  }

  return NextResponse.redirect(`${origin}/consent-confirmed?status=success`);
}
