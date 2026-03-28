"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";

function AgeGateForm() {
  const router = useRouter();
  const [parentEmail, setParentEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentConsentEmail: parentEmail }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Failed to send consent request. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center space-y-4">
        <div className="text-5xl">✉️</div>
        <h2
          className="text-xl font-bold text-white"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Consent request sent
        </h2>
        <p className="text-white/60 text-sm leading-relaxed">
          We sent a parental consent email to{" "}
          <strong className="text-white">{parentEmail}</strong>. Your account
          will be activated once your parent or guardian approves.
        </p>
        <p className="text-white/40 text-xs">
          Check your parent&apos;s inbox — the email may take a few minutes to arrive.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="mt-4 text-sm text-white/60 underline underline-offset-2"
        >
          Return to login
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="text-center space-y-2">
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Parental consent required
        </h1>
        <p className="text-white/50 text-sm leading-relaxed">
          Because you are 16 or 17, we need a parent or guardian to approve
          your Diiff account before you can join.
        </p>
      </div>

      <div
        className="rounded-2xl p-4 space-y-3"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h3 className="text-white font-medium text-sm">
          What your parent will see
        </h3>
        <ul className="text-white/60 text-sm space-y-1.5 list-disc list-inside">
          <li>What Diiff is and who runs it</li>
          <li>What data we collect about your child</li>
          <li>How their child&apos;s content is moderated</li>
          <li>How to revoke access at any time</li>
          <li>Contact information for our safety team</li>
        </ul>
      </div>

      <form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className="space-y-4"
      >
        <div className="space-y-1">
          <label
            className="text-white/60 text-xs uppercase tracking-wider"
            htmlFor="parent-email"
          >
            Parent / Guardian Email
          </label>
          <input
            id="parent-email"
            type="email"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            placeholder="parent@example.com"
            required
            className="w-full px-4 py-3 rounded-2xl text-white placeholder-white/30 outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-xl border border-red-500/20">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl font-semibold text-black transition-all disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #FFD600, #FF6B00)" }}
        >
          {loading ? "Sending…" : "Send consent request"}
        </button>
      </form>

      <p className="text-center text-white/30 text-xs">
        Your account stays inactive until consent is received. No data is
        shared until approved.
      </p>
    </>
  );
}

export default function AgeGatePage() {
  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-6"
      style={{ background: "#0a0012" }}
    >
      <div className="w-full max-w-sm space-y-6">
        <Suspense
          fallback={
            <div className="text-white/40 text-center text-sm">Loading…</div>
          }
        >
          <AgeGateForm />
        </Suspense>
      </div>
    </main>
  );
}
