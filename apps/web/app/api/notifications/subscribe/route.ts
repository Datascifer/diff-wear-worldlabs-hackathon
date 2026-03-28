import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import type { ApiResult } from "@/types/domain";

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  const body = (await request.json()) as {
    subscription?: {
      endpoint?: string;
      keys?: { p256dh?: string; auth?: string };
    };
  };

  const { endpoint, keys } = body.subscription ?? {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "INVALID_SUBSCRIPTION", message: "Valid push subscription required." } },
      { status: 422 }
    );
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      { user_id: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
      { onConflict: "user_id,endpoint" }
    );

  if (error) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "DB_ERROR", message: "Failed to save subscription." } },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiResult<{ subscribed: boolean }>>(
    { success: true, data: { subscribed: true } }
  );
}
