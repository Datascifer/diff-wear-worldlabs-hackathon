"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isEligibleAge } from "@/lib/utils/age";

export default function RegisterCompletePage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [dob, setDob] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError("Please enter your display name.");
      return;
    }

    const dateOfBirth = new Date(dob);
    if (isNaN(dateOfBirth.getTime())) {
      setError("Please enter a valid date of birth.");
      return;
    }

    // Client-side eligibility check — server re-validates independently
    if (!isEligibleAge(dateOfBirth)) {
      setError(
        "Diiff is for people ages 16–25 in NYC. If you believe this is an error, contact support@diiff.app."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          dateOfBirth: dob,
          city: city.trim() || undefined,
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        data?: { redirect: string };
        error?: { message: string };
      };

      if (!res.ok || !data.success) {
        setError(data.error?.message ?? "Registration failed. Please try again.");
        return;
      }

      const redirect = data.data?.redirect;
      if (redirect === "age-gate") {
        router.push("/register/age-gate");
      } else {
        router.push("/feed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-6"
      style={{ background: "#0a0012" }}
    >
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-1">
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            One more step
          </h1>
          <p className="text-white/50 text-sm">
            Tell us a bit about yourself to complete your profile.
          </p>
        </div>

        <form
          onSubmit={(e) => { void handleSubmit(e); }}
          className="space-y-4"
        >
          <div className="space-y-1">
            <label
              className="text-white/60 text-xs uppercase tracking-wider"
              htmlFor="name"
            >
              Display Name *
            </label>
            <input
              id="name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How you'll appear to others"
              maxLength={40}
              required
              className="w-full px-4 py-3 rounded-2xl text-white placeholder-white/30 outline-none"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
          </div>

          <div className="space-y-1">
            <label
              className="text-white/60 text-xs uppercase tracking-wider"
              htmlFor="dob"
            >
              Date of Birth *
            </label>
            <input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl text-white outline-none"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                colorScheme: "dark",
              }}
            />
            <p className="text-white/30 text-xs">Must be 16–25 to join. Your DOB is never shared publicly.</p>
          </div>

          <div className="space-y-1">
            <label
              className="text-white/60 text-xs uppercase tracking-wider"
              htmlFor="city"
            >
              City (optional)
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="New York City"
              maxLength={80}
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
            {loading ? "Creating profile…" : "Continue"}
          </button>
        </form>

        <p className="text-center text-white/30 text-xs leading-relaxed">
          By continuing, you agree to our{" "}
          <a href="/terms" className="underline underline-offset-2 text-white/50">Terms</a>
          {" "}and{" "}
          <a href="/privacy" className="underline underline-offset-2 text-white/50">Privacy Policy</a>.
        </p>
      </div>
    </main>
  );
}
