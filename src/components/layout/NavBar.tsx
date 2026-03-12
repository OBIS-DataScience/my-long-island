"use client";

import { useUserStore } from "@/stores/userStore";
import { useWeather } from "@/lib/hooks/useWeather";
import { Cloud, CloudRain, Sun, CloudSnow, MapPin } from "lucide-react";

/**
 * NavBar — the top header bar.
 *
 * Shows a personalized greeting (changes by time of day), the user's
 * town name, current weather snippet, and the Local/Tourist toggle.
 *
 * On mobile, this overlays the top of the map with a glass-morphism
 * effect so the map shows through slightly.
 */
export default function NavBar() {
  const { displayName, homeZone, mode, setMode } = useUserStore();
  const { current, loading: weatherLoading } = useWeather();

  // Generate a greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Tonight in";
  };

  const greeting = getGreeting();
  const name = displayName || homeZone.hamlet || "Long Island";

  // Pick a weather icon based on the condition text
  const WeatherIcon = getWeatherIcon(current?.condition);

  // Show temperature or loading state
  const tempDisplay = weatherLoading
    ? "…"
    : current?.temperature_f != null
      ? `${Math.round(current.temperature_f)}°F`
      : "--°F";

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Greeting + Location */}
        <div className="flex flex-col">
          <span className="text-xs text-[var(--text-muted)] font-medium tracking-wide uppercase">
            {greeting}
          </span>
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-[var(--color-sea-glass)]" />
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              {name}
            </h1>
          </div>
        </div>

        {/* Center: Live weather snippet */}
        <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
          <WeatherIcon size={16} />
          <span>{tempDisplay}</span>
        </div>

        {/* Right: Local/Tourist toggle */}
        <div className="flex items-center rounded-full border border-[var(--border-default)] overflow-hidden">
          <button
            onClick={() => setMode("local")}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              mode === "local"
                ? "bg-[var(--color-sea-glass)] text-[var(--color-deep-ocean)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            Local
          </button>
          <button
            onClick={() => setMode("tourist")}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              mode === "tourist"
                ? "bg-[var(--color-sea-glass)] text-[var(--color-deep-ocean)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            Visitor
          </button>
        </div>
      </div>
    </header>
  );
}

/**
 * Returns an appropriate weather icon component based on the condition text.
 * NWS conditions include things like "Partly Cloudy", "Rain", "Snow", etc.
 */
function getWeatherIcon(condition: string | null | undefined) {
  if (!condition) return Cloud;

  const lower = condition.toLowerCase();
  if (lower.includes("rain") || lower.includes("shower")) return CloudRain;
  if (lower.includes("snow") || lower.includes("ice") || lower.includes("sleet")) return CloudSnow;
  if (lower.includes("clear") || lower.includes("sunny") || lower.includes("fair")) return Sun;
  return Cloud;
}
