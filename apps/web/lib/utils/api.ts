import { NextResponse } from "next/server";
import type { ApiResult } from "@/types/domain";

// Standardized error response builder.
export function apiError(
  code: string,
  message: string,
  status: number
): NextResponse<ApiResult<never>> {
  return NextResponse.json<ApiResult<never>>(
    { success: false, error: { code, message } },
    { status }
  );
}

// Standardized success response builder.
export function apiSuccess<T>(
  data: T,
  status = 200
): NextResponse<ApiResult<T>> {
  return NextResponse.json<ApiResult<T>>({ success: true, data }, { status });
}

// Rate limit exceeded response with proper headers.
export function apiRateLimited(reset: number): NextResponse<ApiResult<never>> {
  return NextResponse.json<ApiResult<never>>(
    {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests. Please try again later.",
      },
    },
    {
      status: 429,
      headers: {
        "X-RateLimit-Reset": String(reset),
        "Retry-After": String(Math.max(0, reset - Math.floor(Date.now() / 1000))),
      },
    }
  );
}

// Strip HTML tags from user-submitted text.
// Runs server-side — no DOM available.
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

// Sanitize user-submitted text: strip HTML, trim, enforce max length.
export function sanitizeText(input: string, maxLength: number): string {
  return stripHtml(input).substring(0, maxLength);
}
