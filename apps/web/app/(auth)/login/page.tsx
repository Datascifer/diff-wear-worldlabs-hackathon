"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const signInWith = async (provider: "google" | "apple") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) {
      router.push("/login?error=auth");
    }
  };

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-6"
      style={{ background: "#0a0012" }}
    >
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="text-5xl mb-4">🦄</div>
          <h1
            className="text-3xl font-bold"
            style={{
              fontFamily: "Playfair Display, serif",
              background: "linear-gradient(135deg, #FFD600, #FF6B00)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Diiff
          </h1>
          <p className="text-white/60 text-sm">Faith. Fitness. Community.</p>
        </div>

        {/* Sign in */}
        <div className="space-y-3">
          <p className="text-center text-white/40 text-xs uppercase tracking-widest">
            Sign in to continue
          </p>

          <button
            onClick={() => {
              void signInWith("google");
            }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl font-medium text-white transition-all hover:bg-white/10"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <button
            onClick={() => {
              void signInWith("apple");
            }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl font-medium text-white transition-all hover:bg-white/10"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <AppleIcon />
            Continue with Apple
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-white/30 text-xs leading-relaxed">
          For ages 16–25 only. By continuing you agree to our Terms of Service
          and Privacy Policy.
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="white">
      <path d="M12.47 0c.08.85-.25 1.7-.73 2.33-.5.65-1.3 1.16-2.1 1.1-.1-.82.28-1.67.75-2.28C10.9.5 11.73.02 12.47 0zm2.84 4.81c-.18.12-1.74.99-1.72 2.95.02 2.32 2.03 3.1 2.06 3.11-.02.07-.32 1.1-1.05 2.16-.63.93-1.3 1.85-2.34 1.87-1.02.02-1.35-.6-2.52-.6-1.18 0-1.55.59-2.52.62-1 .03-1.76-.99-2.4-1.91C3.1 11 2.26 8.48 3.2 6.77c.46-.85 1.3-1.39 2.2-1.4.99-.02 1.92.66 2.52.66.6 0 1.73-.82 2.9-.7.5.02 1.88.2 2.77 1.48z" />
    </svg>
  );
}
