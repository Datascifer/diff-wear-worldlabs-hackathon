import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import type { ApiResult } from "@/types/domain";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif",
]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4"]);
const IMAGE_MAX_BYTES = 10 * 1024 * 1024;  // 10 MB
const VIDEO_MAX_BYTES = 50 * 1024 * 1024;  // 50 MB

function generatePath(userId: string, ext: string): string {
  const rand = Math.random().toString(36).substring(2, 14);
  const ts = Date.now().toString(36);
  return `${userId}/${ts}-${rand}.${ext}`;
}

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "MISSING_FILE", message: "A file is required." } },
      { status: 422 }
    );
  }

  const contentType = file.type;
  const isImage = ALLOWED_IMAGE_TYPES.has(contentType);
  const isVideo = ALLOWED_VIDEO_TYPES.has(contentType);

  if (!isImage && !isVideo) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "INVALID_FILE_TYPE", message: "File must be jpeg, png, webp, gif, or mp4." } },
      { status: 422 }
    );
  }

  const maxBytes = isVideo ? VIDEO_MAX_BYTES : IMAGE_MAX_BYTES;
  if (file.size > maxBytes) {
    const maxMB = maxBytes / (1024 * 1024);
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "FILE_TOO_LARGE", message: `File must be under ${maxMB}MB.` } },
      { status: 422 }
    );
  }

  const ext = contentType.split("/")[1] ?? "bin";
  const path = generatePath(user.id, ext);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload via service client — bypasses RLS for storage
  const serviceSupabase = createServiceClient();
  const { error: uploadError } = await serviceSupabase.storage
    .from("post-media")
    .upload(path, buffer, { contentType, upsert: false });

  if (uploadError) {
    return NextResponse.json<ApiResult<never>>(
      { success: false, error: { code: "UPLOAD_ERROR", message: "Upload failed." } },
      { status: 500 }
    );
  }

  // Generate a short-lived signed URL for immediate display
  const { data: signedUrl } = await serviceSupabase.storage
    .from("post-media")
    .createSignedUrl(path, 3600); // 1 hour

  return NextResponse.json<ApiResult<{ path: string; signedUrl: string | null }>>(
    { success: true, data: { path, signedUrl: signedUrl?.signedUrl ?? null } },
    { status: 201 }
  );
}
