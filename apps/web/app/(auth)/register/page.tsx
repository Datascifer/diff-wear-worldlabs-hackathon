"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isEligibleAge, computeAgeTier } from "@/lib/utils/age";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [dob, setDob] = useState("");
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

    if (!isEligibleAge(dateOfBirth)) {
      setError("Diiff is for people ages 16–25 only.");
      return;
    }

    const ageTier = computeAgeTier(dateOfBirth);
    setLoading(true);

    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          dateOfBirth: dob,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Registration failed. Please try again.");
        return;
      }

      if (ageTier === "minor") {
        router.push(`/register/age-gate?dob=${encodeURIComponent(dob)}`);
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
            Create your profile
          </h1>
          <p className="text-white/50 text-sm">Tell us a bit about yourself</p>
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
              htmlFor="name"
            >
              Display Name
            </label>
            <input
              id="name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
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
              Date of Birth
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
            <p className="text-white/30 text-xs">Must be 16–25 years old to join.</p>
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
      </div>
    </main>
  );
}
