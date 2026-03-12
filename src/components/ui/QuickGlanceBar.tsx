"use client";

import { Train, Zap, Waves, CloudSun } from "lucide-react";
import { useLirrStatus } from "@/lib/hooks/useLirrStatus";
import { useWeather } from "@/lib/hooks/useWeather";

/**
 * QuickGlanceBar — horizontal scrolling status pills.
 *
 * Shows pill-shaped badges with at-a-glance status info:
 * - LIRR overall status (green/yellow/red)
 * - Weather condition for the nearest zone
 * - Wind speed
 *
 * Each pill shows live data from Supabase (populated by cron routes).
 * Falls back to a "loading" state while data is being fetched.
 */

interface StatusPill {
  icon: React.ReactNode;
  label: string;
  status: "green" | "yellow" | "red";
  value: string;
}

const statusColors = {
  green: "bg-[var(--color-sea-glass)]/20 text-[var(--color-sea-glass)] border-[var(--color-sea-glass)]/30",
  yellow: "bg-[var(--color-sunset-glow)]/20 text-[var(--color-sunset-glow)] border-[var(--color-sunset-glow)]/30",
  red: "bg-[var(--color-sunset)]/20 text-[var(--color-sunset)] border-[var(--color-sunset)]/30",
};

export default function QuickGlanceBar() {
  const { worstLevel, summaryLabel, loading: lirrLoading } = useLirrStatus();
  const { current, loading: weatherLoading } = useWeather();

  // Build pills from live data, with loading fallbacks
  const pills: StatusPill[] = [
    {
      icon: <Train size={14} />,
      label: "LIRR",
      status: lirrLoading ? "green" : worstLevel,
      value: lirrLoading ? "Loading…" : summaryLabel,
    },
    {
      icon: <CloudSun size={14} />,
      label: "Weather",
      status: current?.alert_severity === "severe" || current?.alert_severity === "extreme"
        ? "red"
        : current?.alert_headline
          ? "yellow"
          : "green",
      value: weatherLoading
        ? "Loading…"
        : current?.condition ?? "No Data",
    },
    {
      icon: <Waves size={14} />,
      label: "Wind",
      status: (current?.wind_speed_mph ?? 0) > 30
        ? "red"
        : (current?.wind_speed_mph ?? 0) > 15
          ? "yellow"
          : "green",
      value: weatherLoading
        ? "Loading…"
        : current?.wind_speed_mph != null
          ? `${current.wind_speed_mph} mph ${current.wind_direction ?? ""}`
          : "Calm",
    },
  ];

  // If there's a weather alert, add it as a prominent pill
  if (current?.alert_headline) {
    pills.push({
      icon: <Zap size={14} />,
      label: "Alert",
      status: current.alert_severity === "severe" || current.alert_severity === "extreme"
        ? "red"
        : "yellow",
      value: current.alert_headline.length > 30
        ? current.alert_headline.slice(0, 30) + "…"
        : current.alert_headline,
    });
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {pills.map((pill) => (
        <button
          key={pill.label}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-colors ${statusColors[pill.status]}`}
        >
          {pill.icon}
          <span>{pill.value}</span>
        </button>
      ))}
    </div>
  );
}
