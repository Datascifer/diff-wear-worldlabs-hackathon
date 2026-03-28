"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);

  const signInWith = async (provider: "google" | "apple") => {
    setLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
    if (error) {
      router.push("/login?error=auth");
      setLoading(null);
    }
  };

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: "var(--color-bg-base)" }}
    >
      {/* Ambient glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 65% 50% at 50% 105%, rgba(107,31,255,0.38) 0%, transparent 70%)",
            "radial-gradient(ellipse 40% 30% at 72% 18%, rgba(255,107,0,0.18) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      <div className="relative w-full max-w-sm space-y-8 animate-fade-up">
        {/* Wordmark */}
        <div className="text-center space-y-2">
          <h1
            className="text-5xl font-bold"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.02em",
              background: "var(--gradient-flame)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Diiff
          </h1>
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: "var(--color-text-tertiary)", letterSpacing: "0.14em" }}
          >
            Faith · Fitness · Community
          </p>
        </div>

        {/* Glass card */}
        <div
          className="rounded-xl p-8 space-y-6"
          style={{
            background: "var(--color-glass-bg)",
            backdropFilter: "blur(var(--blur-md))",
            WebkitBackdropFilter: "blur(var(--blur-md))",
            border: "1px solid var(--color-glass-border)",
            boxShadow: "var(--shadow-lg), 0 0 0 0.5px rgba(255,214,0,0.12) inset",
          }}
        >
          <div className="space-y-1">
            <h2
              className="text-xl font-semibold"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              Welcome
            </h2>
            <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
              NYC · Ages 16–25 only
            </p>
          </div>

          <div className="space-y-3">
            {/* Apple */}
            <button
              onClick={() => { void signInWith("apple"); }}
              disabled={loading !== null}
              className="w-full h-12 rounded-md flex items-center justify-center gap-3 font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.96)", color: "#000" }}
              aria-label="Continue with Apple"
            >
              {loading === "apple" ? (
                <Spinner dark />
              ) : (
                <AppleIcon />
              )}
              Continue with Apple
            </button>

            {/* Google */}
            <button
              onClick={() => { void signInWith("google"); }}
              disabled={loading !== null}
              className="w-full h-12 rounded-md flex items-center justify-center gap-3 font-medium text-sm transition-all active:scale-[0.97] disabled:opacity-50"
              style={{
                background: "transparent",
                border: "1px solid var(--color-border-strong)",
                color: "var(--color-text-primary)",
              }}
              aria-label="Continue with Google"
            >
              {loading === "google" ? (
                <Spinner />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>
          </div>

          <p
            className="text-xs text-center leading-relaxed"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            By continuing you agree to our{" "}
            <a href="/terms" className="underline underline-offset-2" style={{ color: "var(--color-text-secondary)" }}>
              Terms
            </a>{" "}and{" "}
            <a href="/privacy" className="underline underline-offset-2" style={{ color: "var(--color-text-secondary)" }}>
              Privacy Policy
            </a>
            . Users under 18 require parental consent before activation.
          </p>
        </div>
      </div>
    </main>
  );
}

function Spinner({ dark }: { dark?: boolean }) {
  return (
    <span
      className="w-4 h-4 rounded-full border-2 animate-spin"
      style={{
        borderColor: dark ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.2)",
        borderTopColor: dark ? "#000" : "#fff",
      }}
    />
  );
}

function AppleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 814 1000" fill="currentColor" aria-hidden="true">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 411.5 6.7 297.5 6.7 188.8 6.7 84.3 58.4 33 108.4 12.8c46.5-18.7 101.2-27 153.9-27 55.1 0 107 19.6 144.5 37.5L371.1 23.3c47.3-23.4 103.4-37.5 164.4-37.5 57.3 0 109.6 12.8 155.5 38.2C767.5 53.1 814 92.8 814 156.2c0 57.3-46.5 99.2-83.4 129.8-2.6 2-23.9 19.2-26.5 21.5zm-261.6 73.3c-23.6-11.6-46.5-17.4-73.8-17.4-32 0-54.4 12-75.3 30.6-28.2 24.9-39.2 56.5-39.2 89.2s9.7 61.9 34.9 84.5c21.3 19.2 46.5 30.6 76 30.6 30.3 0 55.8-11.9 76.3-31.8 20.8-20.1 30.3-50.5 30.3-81.1 0-31.8-8.7-61.5-29.2-104.6z"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
