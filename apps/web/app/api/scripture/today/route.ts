import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { ApiResult } from "@/types/domain";
import { getDailyScripture } from "../../../../../services/ai";

export async function GET() {
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

  // 2. Fetch daily scripture with optional audio
  const scripture = await getDailyScripture(new Date());

  return NextResponse.json<ApiResult<typeof scripture>>({
    success: true,
    data: scripture,
  });
}
