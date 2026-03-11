"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Map, Bell, Menu } from "lucide-react";

/**
 * NavDock — the bottom navigation bar (mobile).
 *
 * Four tabs: Home (daily pulse), Map (geographic view), Alerts
 * (notification center), More (settings, saved, profile).
 *
 * Fixed to the bottom of the screen, always visible. Uses the
 * sea-glass color for the active tab indicator — a small dot above
 * the icon (above, not below, to avoid confusion with the iPhone
 * home indicator bar).
 */

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/map", icon: Map, label: "Map" },
  { href: "/alerts", icon: Bell, label: "Alerts" },
  { href: "/more", icon: Menu, label: "More" },
];

export default function NavDock() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-[var(--border-default)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 py-2 px-4 relative"
            >
              {/* Active indicator dot (above the icon) */}
              {isActive && (
                <span className="absolute top-0.5 w-1.5 h-1.5 rounded-full bg-[var(--color-sea-glass)]" />
              )}
              <Icon
                size={22}
                className={
                  isActive
                    ? "text-[var(--color-sea-glass)]"
                    : "text-[var(--text-muted)]"
                }
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive
                    ? "text-[var(--color-sea-glass)]"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
