import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * LIRR Cron Route — GET /api/cron/lirr
 *
 * Fetches LIRR service status from the MTA's public alerts feed.
 * The MTA provides a JSON endpoint with current service alerts
 * for all their transit lines, including LIRR branches.
 *
 * We filter to LIRR-only alerts and map each branch to a status
 * level: green (good service), yellow (delays), red (suspended).
 *
 * Daily snapshot: one row per branch per day.
 */

// All LIRR branches we track (matches our constants file)
const LIRR_BRANCHES = [
  "Babylon",
  "Ronkonkoma",
  "Port Jefferson",
  "Montauk",
  "Oyster Bay",
  "Long Beach",
  "Hempstead",
  "Far Rockaway",
];

// MTA uses specific route IDs for LIRR in their GTFS-realtime feed
// This endpoint returns service status in JSON format
const MTA_STATUS_URL =
  "https://collector-otp-prod.camsys-apps.com/realtime/serviceStatus?type=json&apikey=Z276E3rCeTzOQEoBPPN4JCEc6GfvdnYE";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  try {
    // Fetch MTA service status
    const res = await fetch(MTA_STATUS_URL, {
      headers: { Accept: "application/json" },
    });

    let branchStatuses: Array<{
      branch_name: string;
      status: string;
      status_level: string;
      detail: string | null;
    }>;

    if (res.ok) {
      const data = await res.json();

      // The MTA feed has different structures depending on the endpoint.
      // We look for LIRR-specific entries and extract status info.
      const lirrAlerts = extractLirrAlerts(data);

      // Build status for each branch
      branchStatuses = LIRR_BRANCHES.map((branch) => {
        const branchAlert = lirrAlerts.find((a) =>
          a.affectedBranch.toLowerCase().includes(branch.toLowerCase())
        );

        if (branchAlert) {
          return {
            branch_name: `${branch} Branch`,
            status: branchAlert.statusLabel,
            status_level: branchAlert.level,
            detail: branchAlert.detail,
          };
        }

        // No alert = good service
        return {
          branch_name: `${branch} Branch`,
          status: "Good Service",
          status_level: "green",
          detail: null,
        };
      });
    } else {
      // If MTA feed is down, mark all branches as unknown but don't crash
      branchStatuses = LIRR_BRANCHES.map((branch) => ({
        branch_name: `${branch} Branch`,
        status: "Status Unavailable",
        status_level: "yellow",
        detail: "MTA feed temporarily unavailable",
      }));
    }

    // Upsert all branches
    const rows = branchStatuses.map((b) => ({
      ...b,
      snapshot_date: today,
    }));

    const { error } = await supabase
      .from("lirr_status")
      .upsert(rows, { onConflict: "branch_name,snapshot_date" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      branches: rows.length,
      snapshot_date: today,
      statuses: branchStatuses,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * Parse the MTA service status feed for LIRR alerts.
 * The feed structure varies — we handle the common formats.
 */
function extractLirrAlerts(data: Record<string, unknown>): Array<{
  affectedBranch: string;
  statusLabel: string;
  level: "green" | "yellow" | "red";
  detail: string | null;
}> {
  const alerts: Array<{
    affectedBranch: string;
    statusLabel: string;
    level: "green" | "yellow" | "red";
    detail: string | null;
  }> = [];

  try {
    // The MTA JSON feed nests alerts under different keys
    // We look for LIRR-specific service status entries
    const serviceDelivery =
      (data as Record<string, unknown>).Siri ??
      (data as Record<string, unknown>).ServiceDelivery ??
      data;

    const situations = findNestedArray(serviceDelivery, "PtSituationElement");

    for (const situation of situations) {
      const sit = situation as Record<string, unknown>;
      const summary = (sit.Summary ?? sit.Description ?? "") as string;
      const severity = ((sit.Severity ?? "") as string).toLowerCase();

      // Check if this alert mentions LIRR
      const affectedLines = findNestedArray(sit, "LineRef");
      const isLirr =
        summary.toLowerCase().includes("lirr") ||
        summary.toLowerCase().includes("long island rail road") ||
        affectedLines.some((l) =>
          String(l).toLowerCase().includes("lirr")
        );

      if (!isLirr) continue;

      // Determine which branch is affected
      for (const branch of LIRR_BRANCHES) {
        if (summary.toLowerCase().includes(branch.toLowerCase())) {
          const level: "green" | "yellow" | "red" =
            severity === "severe" || summary.toLowerCase().includes("suspend")
              ? "red"
              : severity === "minor" || summary.toLowerCase().includes("delay")
                ? "yellow"
                : "yellow";

          alerts.push({
            affectedBranch: branch,
            statusLabel: summary.length > 60 ? summary.slice(0, 60) + "…" : summary,
            level,
            detail: summary,
          });
        }
      }
    }
  } catch {
    // If parsing fails, return empty — branches default to green
  }

  return alerts;
}

/**
 * Recursively searches a nested object for arrays matching a key name.
 * MTA feeds have deeply nested structures that vary by endpoint version.
 */
function findNestedArray(obj: unknown, targetKey: string): unknown[] {
  if (!obj || typeof obj !== "object") return [];

  const record = obj as Record<string, unknown>;
  if (Array.isArray(record[targetKey])) return record[targetKey] as unknown[];
  if (record[targetKey] && typeof record[targetKey] === "object") {
    return [record[targetKey]];
  }

  for (const val of Object.values(record)) {
    if (typeof val === "object" && val !== null) {
      const found = findNestedArray(val, targetKey);
      if (found.length > 0) return found;
    }
  }

  return [];
}
