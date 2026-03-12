"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { WeatherRow } from "@/types/database";

/**
 * useWeather — fetches the latest weather snapshot from Supabase.
 *
 * By default returns weather for ALL Long Island zones (today's snapshot).
 * Pass a zone_id to get weather for a specific zone (e.g. "south_shore").
 *
 * The data comes from our weather_current table, which is populated
 * by the /api/cron/weather route. The snapshot_date filter ensures
 * we always show the most recent day's data.
 */
export function useWeather(zoneId?: string) {
  const [weather, setWeather] = useState<WeatherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const supabase = createClient();

        // Get the most recent snapshot date first
        const { data: latest } = await supabase
          .from("weather_current")
          .select("snapshot_date")
          .order("snapshot_date", { ascending: false })
          .limit(1)
          .single();

        if (!latest) {
          setWeather([]);
          setLoading(false);
          return;
        }

        // Fetch all zones for the latest snapshot
        let query = supabase
          .from("weather_current")
          .select("*")
          .eq("snapshot_date", latest.snapshot_date);

        if (zoneId) {
          query = query.eq("zone_id", zoneId);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setWeather((data as WeatherRow[]) ?? []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch weather");
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [zoneId]);

  // Convenience: the "nearest" zone's weather (first result)
  const current = weather[0] ?? null;

  return { weather, current, loading, error };
}
