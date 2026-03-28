import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    env: process.env.APP_ENV ?? "unknown",
    ts: new Date().toISOString(),
  });
}
