import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/feed";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const supabase = createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  // Validate session after exchange
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  // Check if user already has a profile record
  const { data: existingProfile } = await supabase
    .from("users")
    .select("id, account_status")
    .eq("id", user.id)
    .single();

  if (existingProfile) {
    if (existingProfile.account_status === "pending_consent") {
      return NextResponse.redirect(`${origin}/register/age-gate`);
    }
    return NextResponse.redirect(`${origin}${next}`);
  }

  // New user — collect DOB before proceeding
  return NextResponse.redirect(`${origin}/register`);
}
