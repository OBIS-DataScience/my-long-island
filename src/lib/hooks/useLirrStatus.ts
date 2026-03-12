"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LirrStatusRow } from "@/types/database";

/**
 * useLirrStatus — fetches today's LIRR branch statuses from Supabase.
 *
 * Returns an array of branch statuses with color-coded levels:
 * - green = Good Service
 * - yellow = Delays or minor issues
 * - red = Suspended or major disruption
 *
 * Always shows the most recent snapshot (today if available).
 */
export function useLirrStatus() {
  const [branches, setBranches] = useState<LirrStatusRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const supabase = createClient();

        // Get the most recent snapshot date
        const { data: latest } = await supabase
          .from("lirr_status")
          .select("snapshot_date")
          .order("snapshot_date", { ascending: false })
          .limit(1)
          .single();

        if (!latest) {
          setBranches([]);
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("lirr_status")
          .select("*")
          .eq("snapshot_date", latest.snapshot_date)
          .order("branch_name");

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setBranches((data as LirrStatusRow[]) ?? []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch LIRR status");
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
  }, []);

  // Quick summary: worst status across all branches
  const worstLevel = branches.reduce<"green" | "yellow" | "red">(
    (worst, b) => {
      if (b.status_level === "red") return "red";
      if (b.status_level === "yellow" && worst !== "red") return "yellow";
      return worst;
    },
    "green"
  );

  const summaryLabel =
    worstLevel === "green"
      ? "On Time"
      : worstLevel === "yellow"
        ? "Delays"
        : "Disrupted";

  return { branches, worstLevel, summaryLabel, loading, error };
}
