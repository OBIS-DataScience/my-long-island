"use client";

import AppShell from "@/components/layout/AppShell";
import QuickGlanceBar from "@/components/ui/QuickGlanceBar";
import { useFeed } from "@/lib/hooks/useFeed";
import { useWeather } from "@/lib/hooks/useWeather";
import { useUserStore } from "@/stores/userStore";
import { Newspaper, CloudSun, AlertTriangle, Calendar } from "lucide-react";
import type { FeedItem } from "@/types/database";

/**
 * Home Page — "The Daily Pulse"
 *
 * This is the first screen users see. It answers the question every
 * Long Islander asks every morning: "What's happening today?"
 *
 * Structure:
 * 1. Quick Glance Bar (LIRR, weather, wind status pills)
 * 2. Breaking/Alert card (conditional — only shows when active)
 * 3. Town Feed (news, events, alerts from your zip/hamlet)
 *
 * All content is filtered to the user's home zone by default.
 * Shows the most recent daily snapshot from Supabase.
 */

export default function HomePage() {
  const { homeZone } = useUserStore();
  const { current: weather } = useWeather();
  const { items, loading: feedLoading } = useFeed(homeZone.hamlet);

  // Check for active weather alerts
  const hasAlert = weather?.alert_headline != null;

  return (
    <AppShell>
      {/* Quick Glance — always visible in peek mode */}
      <QuickGlanceBar />

      {/* Section: Breaking Alert (only shows when there's a real alert) */}
      {hasAlert && (
        <div className="mt-4 p-3 rounded-xl border border-[var(--color-sunset)]/40 bg-[var(--color-sunset)]/10">
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="text-[var(--color-sunset)] mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-[var(--color-sunset)] uppercase tracking-wider">
                Weather Alert
              </span>
              <p className="text-sm text-[var(--text-primary)] mt-0.5 leading-snug">
                {weather.alert_headline}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section: Town Feed */}
      <div className="mt-6">
        <h2 className="font-serif text-lg font-semibold text-[var(--text-primary)] mb-3">
          {homeZone.hamlet ? `${homeZone.hamlet} Today` : "Long Island Today"}
        </h2>

        {/* Loading state */}
        {feedLoading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-3 animate-pulse">
                <div className="h-3 bg-[var(--text-muted)]/20 rounded w-1/4 mb-2" />
                <div className="h-4 bg-[var(--text-muted)]/20 rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        {/* Feed cards from real data */}
        {!feedLoading && items.length > 0 && (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <FeedCard key={`${item.item_type}-${item.external_id}`} item={item} />
            ))}
          </div>
        )}

        {/* Empty state when no feed items exist yet */}
        {!feedLoading && items.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-[var(--text-muted)]">
              No updates yet. Run the data sync to populate your feed.
            </p>
          </div>
        )}
      </div>

      {/* Snapshot date indicator */}
      {items.length > 0 && (
        <div className="mt-6 text-center py-2">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
            Snapshot: {items[0].snapshot_date}
          </p>
        </div>
      )}
    </AppShell>
  );
}

/**
 * FeedCard — a single item in the town feed.
 * Renders differently based on item_type (news, event, weather_alert).
 */
function FeedCard({ item }: { item: FeedItem }) {
  const config = FEED_CARD_CONFIG[item.item_type];

  // Format the timestamp as a relative time like "2h ago"
  const timeAgo = formatTimeAgo(item.published_at);

  return (
    <button className="card p-3 text-left w-full">
      <div className="flex items-center gap-2 mb-1.5">
        <span className={config.colorClass}>{config.icon}</span>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${config.colorClass}`}>
          {item.item_type === "news" ? (item.category ?? "News") : config.label}
        </span>
        {item.town && (
          <span className="text-[10px] text-[var(--text-muted)]">
            {item.town}
          </span>
        )}
        <span className="text-[10px] text-[var(--text-muted)] ml-auto">
          {timeAgo}
        </span>
      </div>
      <p className="text-sm font-medium text-[var(--text-primary)] leading-snug">
        {item.title}
      </p>
    </button>
  );
}

/** Visual config for each feed item type */
const FEED_CARD_CONFIG: Record<
  FeedItem["item_type"],
  { icon: React.ReactNode; label: string; colorClass: string }
> = {
  news: {
    icon: <Newspaper size={14} />,
    label: "News",
    colorClass: "text-[var(--color-sky)]",
  },
  event: {
    icon: <Calendar size={14} />,
    label: "Event",
    colorClass: "text-[var(--color-sunset-glow)]",
  },
  weather_alert: {
    icon: <CloudSun size={14} />,
    label: "Weather",
    colorClass: "text-[var(--color-seafoam)]",
  },
};

/** Converts an ISO date string to a relative time label like "2h ago" */
function formatTimeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "yesterday";
    return `${diffDays}d ago`;
  } catch {
    return "";
  }
}
