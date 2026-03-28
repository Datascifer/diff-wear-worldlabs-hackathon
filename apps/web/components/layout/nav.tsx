"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/feed",
    label: "Feed",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: "/move",
    label: "Move",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
  },
  {
    href: "/rooms",
    label: "Rooms",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
        <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>
      </svg>
    ),
  },
  {
    href: "/you",
    label: "You",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
] as const;

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{
        background: "var(--color-glass-bg)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        borderTop: "1px solid var(--color-border-default)",
      }}
      aria-label="Main navigation"
    >
      <div className="flex items-center max-w-lg mx-auto px-2" style={{ height: "60px" }}>
        {/* Feed */}
        <NavItem href="/feed" label="Feed" pathname={pathname} icon={NAV_ITEMS[0].icon} />

        {/* Move */}
        <NavItem href="/move" label="Move" pathname={pathname} icon={NAV_ITEMS[1].icon} />

        {/* Center CTA */}
        <div className="flex-1 flex justify-center">
          <Link
            href="/feed?compose=true"
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{
              background: "var(--gradient-flame)",
              boxShadow: "0 0 24px rgba(255,107,0,0.40), 0 4px 12px rgba(0,0,0,0.30)",
            }}
            aria-label="Create post"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </Link>
        </div>

        {/* Rooms */}
        <NavItem href="/rooms" label="Rooms" pathname={pathname} icon={NAV_ITEMS[2].icon} />

        {/* You */}
        <NavItem href="/you" label="You" pathname={pathname} icon={NAV_ITEMS[3].icon} />
      </div>
    </nav>
  );
}

function NavItem({
  href,
  label,
  pathname,
  icon,
}: {
  href: string;
  label: string;
  pathname: string;
  icon: (active: boolean) => React.ReactNode;
}) {
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors"
      style={{ color: isActive ? "var(--color-accent-yellow)" : "var(--color-text-tertiary)" }}
      aria-current={isActive ? "page" : undefined}
    >
      <span
        className="transition-transform duration-150"
        style={{ transform: isActive ? "scale(1.1)" : "scale(1)" }}
      >
        {icon(isActive)}
      </span>
      <span
        style={{
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.04em",
          opacity: isActive ? 1 : 0.6,
        }}
      >
        {label}
      </span>
    </Link>
  );
}
