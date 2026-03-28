import { Suspense } from "react";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: { status?: string };
}

function ConsentResult({ status }: { status?: string }) {
  if (status === "success") {
    return (
      <div className="text-center space-y-4">
        <div className="text-6xl">✦</div>
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Thank you
        </h1>
        <p className="text-white/60 text-sm leading-relaxed">
          Your consent has been confirmed. Your child&apos;s Diiff account is
          now active and they have been notified.
        </p>
        <p className="text-white/40 text-xs leading-relaxed max-w-xs mx-auto">
          You can revoke consent at any time by emailing{" "}
          <a href="mailto:support@diiff.app" className="underline">
            support@diiff.app
          </a>
          . We will deactivate the account within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div className="text-6xl">⚠️</div>
      <h1
        className="text-2xl font-bold text-white"
        style={{ fontFamily: "Playfair Display, serif" }}
      >
        Link expired or invalid
      </h1>
      <p className="text-white/60 text-sm leading-relaxed">
        This consent link has expired or has already been used. Consent links
        are valid for 24 hours.
      </p>
      <p className="text-white/40 text-xs leading-relaxed">
        Ask your child to log in to Diiff and send a new consent request from
        their account settings.
      </p>
    </div>
  );
}

export default function ConsentConfirmedPage({ searchParams }: PageProps) {
  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-6"
      style={{ background: "#0a0012" }}
    >
      <div className="w-full max-w-sm space-y-6">
        <div
          className="rounded-3xl p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Suspense fallback={<div className="text-white/40 text-center text-sm">Loading…</div>}>
            <ConsentResult status={searchParams.status} />
          </Suspense>
        </div>
        <p className="text-center text-white/25 text-xs">
          Diiff · New York City · support@diiff.app
        </p>
      </div>
    </main>
  );
}
