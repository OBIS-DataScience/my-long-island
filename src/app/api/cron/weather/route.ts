import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Weather Cron Route — GET /api/cron/weather
 *
 * Fetches current weather for 5 Long Island zones from the
 * National Weather Service (NWS) API. NWS is free and keyless.
 *
 * How it works:
 * 1. For each zone, we have a representative lat/lng point
 * 2. We call NWS to get the forecast office + grid coordinates
 * 3. We fetch the current observation from the nearest station
 * 4. We upsert (insert-or-update) into our weather_current table
 *
 * The snapshot_date column means we get one row per zone per day,
 * so you always see "today's weather" and can look back historically.
 */

// Representative points for each Long Island zone
// NWS needs a lat/lng to find the nearest weather station
const ZONE_POINTS = [
  { zone_id: "south_shore", zone_name: "South Shore", lat: 40.6501, lng: -73.4232 },
  { zone_id: "north_shore", zone_name: "North Shore", lat: 40.8682, lng: -73.4257 },
  { zone_id: "central_li", zone_name: "Central LI", lat: 40.7898, lng: -73.1350 },
  { zone_id: "north_fork", zone_name: "North Fork", lat: 41.0834, lng: -72.3593 },
  { zone_id: "south_fork", zone_name: "South Fork", lat: 40.9634, lng: -72.1848 },
];

export async function GET(request: NextRequest) {
  // Verify the request is authorized
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];
  const results: Array<{ zone_id: string; ok: boolean; error?: string }> = [];

  for (const zone of ZONE_POINTS) {
    try {
      // Step 1: Get the nearest observation station for this point
      const pointRes = await fetch(
        `https://api.weather.gov/points/${zone.lat},${zone.lng}`,
        { headers: { "User-Agent": "MyLongIsland/1.0 (jacqueline@omnibisolutions.com)" } }
      );

      if (!pointRes.ok) {
        results.push({ zone_id: zone.zone_id, ok: false, error: `NWS points: ${pointRes.status}` });
        continue;
      }

      const pointData = await pointRes.json();
      const stationsUrl = pointData.properties?.observationStations;

      if (!stationsUrl) {
        results.push({ zone_id: zone.zone_id, ok: false, error: "No stations URL" });
        continue;
      }

      // Step 2: Get list of stations, pick the first (nearest)
      const stationsRes = await fetch(stationsUrl, {
        headers: { "User-Agent": "MyLongIsland/1.0 (jacqueline@omnibisolutions.com)" },
      });
      const stationsData = await stationsRes.json();
      const stationId = stationsData.features?.[0]?.properties?.stationIdentifier;

      if (!stationId) {
        results.push({ zone_id: zone.zone_id, ok: false, error: "No station found" });
        continue;
      }

      // Step 3: Get latest observation from that station
      const obsRes = await fetch(
        `https://api.weather.gov/stations/${stationId}/observations/latest`,
        { headers: { "User-Agent": "MyLongIsland/1.0 (jacqueline@omnibisolutions.com)" } }
      );
      const obsData = await obsRes.json();
      const props = obsData.properties;

      // Convert Celsius to Fahrenheit (NWS returns Celsius)
      const tempC = props?.temperature?.value;
      const feelsC = props?.windChill?.value ?? props?.heatIndex?.value ?? tempC;
      const tempF = tempC != null ? Math.round(tempC * 9 / 5 + 32) : null;
      const feelsF = feelsC != null ? Math.round(feelsC * 9 / 5 + 32) : null;

      // Wind speed: NWS returns km/h, convert to mph
      const windKmh = props?.windSpeed?.value;
      const windMph = windKmh != null ? Math.round(windKmh * 0.621371) : null;

      // Step 4: Check for active alerts in this area
      const alertsRes = await fetch(
        `https://api.weather.gov/alerts/active?point=${zone.lat},${zone.lng}`,
        { headers: { "User-Agent": "MyLongIsland/1.0 (jacqueline@omnibisolutions.com)" } }
      );
      const alertsData = await alertsRes.json();
      const topAlert = alertsData.features?.[0]?.properties;

      // Step 5: Upsert into Supabase
      const { error } = await supabase.from("weather_current").upsert(
        {
          zone_id: zone.zone_id,
          zone_name: zone.zone_name,
          temperature_f: tempF,
          feels_like_f: feelsF,
          condition: props?.textDescription ?? null,
          wind_speed_mph: windMph,
          wind_direction: props?.windDirection?.value != null
            ? degreesToCardinal(props.windDirection.value)
            : null,
          humidity_pct: props?.relativeHumidity?.value != null
            ? Math.round(props.relativeHumidity.value)
            : null,
          alert_headline: topAlert?.headline ?? null,
          alert_severity: topAlert?.severity?.toLowerCase() ?? null,
          snapshot_date: today,
        },
        { onConflict: "zone_id,snapshot_date" }
      );

      results.push({ zone_id: zone.zone_id, ok: !error, error: error?.message });
    } catch (err) {
      results.push({
        zone_id: zone.zone_id,
        ok: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  const successCount = results.filter((r) => r.ok).length;
  return NextResponse.json({
    fetched: results.length,
    success: successCount,
    snapshot_date: today,
    details: results,
  });
}

/** Converts wind direction in degrees to a cardinal label like "NW" */
function degreesToCardinal(deg: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}
