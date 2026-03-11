"use client";

import { Train, Zap, Waves, AlertTriangle } from "lucide-react";

/**
 * QuickGlanceBar — horizontal scrolling status pills.
 *
 * Shows 3-5 pill-shaped badges with at-a-glance status info:
 * LIRR status, power outages, tide info, school status.
 *
 * Each pill is tappable to expand for details.
 * Data refreshes every 60 seconds via Supabase realtime.
 *
 * This sits at the top of the BottomSheet in "peek" mode —
 * always visible even when the sheet is minimized.
 */

interface StatusPill {
  icon: React.ReactNode;
  label: string;
  status: "green" | "yellow" | "red";
  value: string;
}

// Placeholder data — will be replaced with real Supabase data
const STATUS_PILLS: StatusPill[] = [
  {
    icon: <Train size={14} />,
    label: "LIRR",
    status: "green",
    value: "On Time",
  },
  {
    icon: <Zap size={14} />,
    label: "Power",
    status: "green",
    value: "No Outages",
  },
  {
    icon: <Waves size={14} />,
    label: "Tide",
    status: "green",
    value: "High 2:41p",
  },
];

const statusColors = {
  green: "bg-[var(--color-sea-glass)]/20 text-[var(--color-sea-glass)] border-[var(--color-sea-glass)]/30",
  yellow: "bg-[var(--color-sunset-glow)]/20 text-[var(--color-sunset-glow)] border-[var(--color-sunset-glow)]/30",
  red: "bg-[var(--color-sunset)]/20 text-[var(--color-sunset)] border-[var(--color-sunset)]/30",
};

export default function QuickGlanceBar() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {STATUS_PILLS.map((pill) => (
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
