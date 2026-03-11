"use client";

import AppShell from "@/components/layout/AppShell";
import QuickGlanceBar from "@/components/ui/QuickGlanceBar";
import { Newspaper, CloudSun, AlertTriangle, Calendar } from "lucide-react";

/**
 * Home Page — "The Daily Pulse"
 *
 * This is the first screen users see. It answers the question every
 * Long Islander asks every morning: "What's happening today?"
 *
 * Structure:
 * 1. Quick Glance Bar (LIRR, power, tide status pills)
 * 2. Breaking/Alert card (conditional — only shows when active)
 * 3. Town Feed (news, events, incidents from your zip/hamlet)
 *
 * All content is filtered to the user's home zone by default.
 */

export default function HomePage() {
  return (
    <AppShell>
      {/* Quick Glance — always visible in peek mode */}
      <QuickGlanceBar />

      {/* Section: Breaking Alert (conditional — placeholder) */}
      <div className="mt-4 p-3 rounded-xl border border-[var(--color-sunset)]/40 bg-[var(--color-sunset)]/10">
        <div className="flex items-start gap-2">
          <AlertTriangle size={18} className="text-[var(--color-sunset)] mt-0.5 shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-[var(--color-sunset)] uppercase tracking-wider">
              Breaking
            </span>
            <p className="text-sm text-[var(--text-primary)] mt-0.5 leading-snug">
              Water main break on Rte 25A near Main St. Expect delays.
            </p>
          </div>
        </div>
      </div>

      {/* Section: Town Feed */}
      <div className="mt-6">
        <h2 className="font-serif text-lg font-semibold text-[var(--text-primary)] mb-3">
          Your Town
        </h2>

        {/* Placeholder feed cards — will be replaced with real data */}
        <div className="flex flex-col gap-3">
          <FeedCard
            icon={<Newspaper size={14} />}
            source="NEWSDAY"
            time="2h ago"
            title="School Board Approves $180M Budget for 2026-27"
            category="news"
          />
          <FeedCard
            icon={<CloudSun size={14} />}
            source="WEATHER"
            time="45m ago"
            title="Nor'easter Watch: 6-10&quot; Expected Thursday"
            category="weather"
          />
          <FeedCard
            icon={<Calendar size={14} />}
            source="EVENTS"
            time="3h ago"
            title="Festival of Lights This Saturday at Main Street"
            category="events"
          />
        </div>
      </div>

      {/* Contextual empty state — shows when there's nothing new */}
      <div className="mt-8 text-center py-6">
        <p className="text-sm text-[var(--text-muted)]">
          Your neighborhood is quiet today.
        </p>
      </div>
    </AppShell>
  );
}

/**
 * FeedCard — a single item in the town feed.
 * Shows a source tag, headline, and timestamp.
 */
function FeedCard({
  icon,
  source,
  time,
  title,
  category,
}: {
  icon: React.ReactNode;
  source: string;
  time: string;
  title: string;
  category: "news" | "weather" | "events" | "safety";
}) {
  const categoryColors = {
    news: "text-[var(--color-sky)]",
    weather: "text-[var(--color-seafoam)]",
    events: "text-[var(--color-sunset-glow)]",
    safety: "text-[var(--color-sunset)]",
  };

  return (
    <button className="card p-3 text-left w-full">
      <div className="flex items-center gap-2 mb-1.5">
        <span className={categoryColors[category]}>{icon}</span>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${categoryColors[category]}`}>
          {source}
        </span>
        <span className="text-[10px] text-[var(--text-muted)] ml-auto">
          {time}
        </span>
      </div>
      <p className="text-sm font-medium text-[var(--text-primary)] leading-snug">
        {title}
      </p>
    </button>
  );
}
