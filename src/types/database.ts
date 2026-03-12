/**
 * TypeScript interfaces matching our Supabase tables.
 *
 * These types keep our code in sync with the database schema.
 * When you fetch data from Supabase, you tell TypeScript
 * "this data looks like WeatherRow" so it can catch mistakes.
 */

export interface WeatherRow {
  id: number;
  zone_id: string;
  zone_name: string;
  temperature_f: number | null;
  feels_like_f: number | null;
  condition: string | null;
  wind_speed_mph: number | null;
  wind_direction: string | null;
  humidity_pct: number | null;
  alert_headline: string | null;
  alert_severity: string | null;
  snapshot_date: string; // 'YYYY-MM-DD'
  fetched_at: string;
}

export interface LirrStatusRow {
  id: number;
  branch_name: string;
  status: string;
  status_level: "green" | "yellow" | "red";
  detail: string | null;
  snapshot_date: string;
  fetched_at: string;
}

export interface EventRow {
  id: number;
  external_id: string;
  title: string;
  description: string | null;
  start_at: string | null;
  end_at: string | null;
  venue_name: string | null;
  lat: number | null;
  lng: number | null;
  category: string | null;
  town: string | null;
  source: string;
  source_url: string | null;
  snapshot_date: string;
  fetched_at: string;
}

export interface NewsArticleRow {
  id: number;
  external_id: string;
  title: string;
  summary: string | null;
  published_at: string | null;
  source_name: string | null;
  source_url: string | null;
  town: string | null;
  category: string | null;
  snapshot_date: string;
  fetched_at: string;
}

/** A single item from the unified feed_items view */
export interface FeedItem {
  item_type: "weather_alert" | "event" | "news";
  external_id: string;
  title: string;
  category: string | null;
  town: string | null;
  published_at: string;
  snapshot_date: string;
}
