"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/feed", label: "Feed", icon: "✦" },
  { href: "/move", label: "Move", icon: "⚡" },
  { href: "/rooms", label: "Rooms", icon: "🎙️" },
  { href: "/you", label: "You", icon: "◈" },
] as const;

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "rgba(10, 0, 18, 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto px-4 py-3">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-1 rounded-2xl transition-all",
                isActive ? "text-white" : "text-white/40"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={cn(
                  "text-xl transition-transform",
                  isActive ? "scale-110" : ""
                )}
                aria-hidden="true"
              >
                {icon}
              </span>
              <span className="text-xs font-medium">{label}</span>
              {isActive && (
                <span
                  className="w-1 h-1 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #FFD600, #FF6B00)",
                  }}
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
