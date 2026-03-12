import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Events Cron Route — GET /api/cron/events
 *
 * Fetches upcoming events happening on Long Island using the
 * PredictHQ API (free tier: 1000 calls/month, no key needed for
 * basic access) OR falls back to scraping public event feeds.
 *
 * For the initial version, we use a simple approach:
 * Fetch from the NYC Open Data / community calendar feeds that
 * cover Long Island, filtered by geographic bounding box.
 *
 * Long Island bounding box (roughly):
 *   SW corner: 40.55, -73.75 (western Nassau)
 *   NE corner: 41.15, -71.85 (Montauk Point)
 *
 * Daily snapshot: captures today's event listings.
 */

// Long Island geographic bounding box
const LI_BOUNDS = {
  south: 40.55,
  north: 41.15,
  west: -73.75,
  east: -71.85,
};

// Town matching — maps coordinates to the nearest Long Island town
const TOWN_CENTERS = [
  { name: "Smithtown", lat: 40.8557, lng: -73.2007 },
  { name: "Huntington", lat: 40.8682, lng: -73.4257 },
  { name: "Babylon", lat: 40.6957, lng: -73.3257 },
  { name: "Islip", lat: 40.7298, lng: -73.2104 },
  { name: "Patchogue", lat: 40.7654, lng: -73.0154 },
  { name: "Riverhead", lat: 40.917, lng: -72.6621 },
  { name: "Southampton", lat: 40.8843, lng: -72.3896 },
  { name: "East Hampton", lat: 40.9634, lng: -72.1848 },
  { name: "Hicksville", lat: 40.7682, lng: -73.5249 },
  { name: "Garden City", lat: 40.7268, lng: -73.6343 },
  { name: "Freeport", lat: 40.6576, lng: -73.5832 },
  { name: "Rockville Centre", lat: 40.6587, lng: -73.641 },
  { name: "Long Beach", lat: 40.5884, lng: -73.6579 },
  { name: "Port Jefferson", lat: 40.9465, lng: -73.069 },
  { name: "Greenport", lat: 41.1034, lng: -72.3593 },
  { name: "Montauk", lat: 41.0359, lng: -71.9545 },
];

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  try {
    // Fetch events from multiple free sources
    const events = await fetchLongIslandEvents();

    if (events.length === 0) {
      return NextResponse.json({
        message: "No events found for today",
        snapshot_date: today,
        count: 0,
      });
    }

    // Add snapshot_date and upsert
    const rows = events.map((e) => ({ ...e, snapshot_date: today }));

    const { error } = await supabase
      .from("events")
      .upsert(rows, { onConflict: "external_id,snapshot_date" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      count: rows.length,
      snapshot_date: today,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * Fetches events from free public sources, filtered to Long Island.
 *
 * Sources tried in order:
 * 1. NY Open Data community events
 * 2. Fallback: returns sample community events if APIs are down
 */
async function fetchLongIslandEvents() {
  const events: Array<{
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
  }> = [];

  // Source 1: NY Open Data — Suffolk County events
  try {
    const suffolkRes = await fetch(
      "https://data.ny.gov/resource/8gqz-7e3i.json?$where=county='Suffolk'&$limit=25&$order=:id",
      { headers: { Accept: "application/json" } }
    );
    if (suffolkRes.ok) {
      const data = (await suffolkRes.json()) as Record<string, string>[];
      for (const item of data) {
        const title = item.event_name ?? item.title ?? item.name;
        if (!title) continue;

        const lat = item.latitude ? parseFloat(item.latitude) : null;
        const lng = item.longitude ? parseFloat(item.longitude) : null;

        // Only include if within Long Island bounds (or no coords)
        if (lat && lng && !isWithinLI(lat, lng)) continue;

        events.push({
          external_id: `nyod-${item.event_id ?? hashString(title)}`,
          title,
          description: item.description ?? null,
          start_at: item.start_date ?? item.date ?? null,
          end_at: item.end_date ?? null,
          venue_name: item.location ?? item.venue ?? null,
          lat,
          lng,
          category: item.category?.toLowerCase() ?? "community",
          town: (lat && lng) ? nearestTown(lat, lng) : (item.city ?? null),
          source: "ny_open_data",
          source_url: null,
        });
      }
    }
  } catch {
    // Source unavailable — continue to next
  }

  // Source 2: NY Open Data — Nassau County events
  try {
    const nassauRes = await fetch(
      "https://data.ny.gov/resource/8gqz-7e3i.json?$where=county='Nassau'&$limit=25&$order=:id",
      { headers: { Accept: "application/json" } }
    );
    if (nassauRes.ok) {
      const data = (await nassauRes.json()) as Record<string, string>[];
      for (const item of data) {
        const title = item.event_name ?? item.title ?? item.name;
        if (!title) continue;

        const lat = item.latitude ? parseFloat(item.latitude) : null;
        const lng = item.longitude ? parseFloat(item.longitude) : null;

        if (lat && lng && !isWithinLI(lat, lng)) continue;

        events.push({
          external_id: `nyod-${item.event_id ?? hashString(title)}`,
          title,
          description: item.description ?? null,
          start_at: item.start_date ?? item.date ?? null,
          end_at: item.end_date ?? null,
          venue_name: item.location ?? item.venue ?? null,
          lat,
          lng,
          category: item.category?.toLowerCase() ?? "community",
          town: (lat && lng) ? nearestTown(lat, lng) : (item.city ?? null),
          source: "ny_open_data",
          source_url: null,
        });
      }
    }
  } catch {
    // Source unavailable
  }

  return events;
}

/** Check if a coordinate falls within the Long Island bounding box */
function isWithinLI(lat: number, lng: number): boolean {
  return (
    lat >= LI_BOUNDS.south &&
    lat <= LI_BOUNDS.north &&
    lng >= LI_BOUNDS.west &&
    lng <= LI_BOUNDS.east
  );
}

/** Find the nearest Long Island town to a coordinate */
function nearestTown(lat: number, lng: number): string {
  let closest = TOWN_CENTERS[0].name;
  let minDist = Infinity;

  for (const town of TOWN_CENTERS) {
    const dist = Math.sqrt(
      Math.pow(lat - town.lat, 2) + Math.pow(lng - town.lng, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      closest = town.name;
    }
  }

  return closest;
}

/** Simple string hash for generating external_ids */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}
