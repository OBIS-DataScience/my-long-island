"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FeedItem } from "@/types/database";

/**
 * useFeed — fetches the unified feed from the feed_items view.
 *
 * The feed_items view in Supabase combines weather alerts, events,
 * and news articles into a single timeline, always filtered to the
 * most recent snapshot date for each source.
 *
 * Optionally filter by town to show only local content.
 */
export function useFeed(town?: string | null) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeed() {
      try {
        const supabase = createClient();

        let query = supabase
          .from("feed_items")
          .select("*")
          .order("published_at", { ascending: false })
          .limit(30);

        // If a town is specified, filter to that town
        // (weather alerts have no town, so we always include them)
        if (town) {
          query = query.or(`town.eq.${town},town.is.null`);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setItems((data as FeedItem[]) ?? []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch feed");
      } finally {
        setLoading(false);
      }
    }

    fetchFeed();
  }, [town]);

  return { items, loading, error };
}
