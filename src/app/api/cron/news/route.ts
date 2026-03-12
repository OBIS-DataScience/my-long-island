import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * News Cron Route — GET /api/cron/news
 *
 * Fetches Long Island news from free public sources:
 * 1. Google News RSS feed filtered to "Long Island" (no key needed)
 * 2. NY Open Data press releases for Nassau/Suffolk counties
 *
 * This is Long Island ONLY — we filter out any articles that don't
 * mention Long Island towns/areas in the title or description.
 *
 * Daily snapshot: captures today's news headlines.
 */

// Keywords that indicate an article is about Long Island
const LI_KEYWORDS = [
  "long island",
  "nassau county",
  "suffolk county",
  "lirr",
  "jones beach",
  "fire island",
  "hamptons",
  "montauk",
  "smithtown",
  "huntington",
  "babylon",
  "islip",
  "brookhaven",
  "riverhead",
  "southampton",
  "east hampton",
  "oyster bay",
  "hempstead",
  "north hempstead",
  "glen cove",
  "long beach",
  "freeport",
  "levittown",
  "massapequa",
  "hicksville",
  "garden city",
  "mineola",
  "patchogue",
  "bay shore",
  "lindenhurst",
  "commack",
  "port jefferson",
  "stony brook",
  "north fork",
  "south fork",
  "newsday",
];

// Map article text to a Long Island town
const TOWN_MATCHERS = [
  { keywords: ["smithtown", "st james", "kings park"], town: "Smithtown" },
  { keywords: ["huntington", "cold spring harbor", "northport"], town: "Huntington" },
  { keywords: ["babylon", "amityville", "copiague", "lindenhurst"], town: "Babylon" },
  { keywords: ["islip", "bay shore", "central islip", "brentwood"], town: "Islip" },
  { keywords: ["brookhaven", "patchogue", "port jefferson", "stony brook"], town: "Brookhaven" },
  { keywords: ["riverhead"], town: "Riverhead" },
  { keywords: ["southampton", "hampton bays", "westhampton"], town: "Southampton" },
  { keywords: ["east hampton", "montauk", "amagansett", "sag harbor"], town: "East Hampton" },
  { keywords: ["hempstead", "levittown", "freeport", "merrick", "wantagh"], town: "Hempstead" },
  { keywords: ["north hempstead", "manhasset", "great neck", "port washington"], town: "North Hempstead" },
  { keywords: ["oyster bay", "hicksville", "massapequa", "syosset", "bethpage"], town: "Oyster Bay" },
  { keywords: ["glen cove"], town: "Glen Cove" },
  { keywords: ["long beach"], town: "Long Beach" },
  { keywords: ["garden city", "mineola", "rockville centre"], town: "Garden City" },
  { keywords: ["hamptons", "south fork"], town: "Southampton" },
  { keywords: ["north fork", "greenport", "southold", "mattituck"], town: "Riverhead" },
  { keywords: ["fire island"], town: "Islip" },
  { keywords: ["jones beach"], town: "Hempstead" },
];

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  try {
    const articles = await fetchLongIslandNews();

    if (articles.length === 0) {
      return NextResponse.json({
        message: "No Long Island news found",
        snapshot_date: today,
        count: 0,
      });
    }

    const rows = articles.map((a) => ({ ...a, snapshot_date: today }));

    const { error } = await supabase
      .from("news_articles")
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

async function fetchLongIslandNews() {
  const articles: Array<{
    external_id: string;
    title: string;
    summary: string | null;
    published_at: string | null;
    source_name: string | null;
    source_url: string | null;
    town: string | null;
    category: string | null;
  }> = [];

  // Source 1: Google News RSS for "Long Island" — free, no key
  try {
    const rssRes = await fetch(
      "https://news.google.com/rss/search?q=Long+Island+NY&hl=en-US&gl=US&ceid=US:en",
      { headers: { Accept: "application/xml" } }
    );

    if (rssRes.ok) {
      const xml = await rssRes.text();
      const items = parseRssItems(xml);

      for (const item of items.slice(0, 20)) {
        // Only keep articles that mention Long Island locations
        const text = `${item.title} ${item.description}`.toLowerCase();
        if (!LI_KEYWORDS.some((kw) => text.includes(kw))) continue;

        articles.push({
          external_id: `gnews-${hashString(item.title + item.pubDate)}`,
          title: cleanHtml(item.title),
          summary: item.description ? cleanHtml(item.description).slice(0, 300) : null,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
          source_name: extractSource(item.title),
          source_url: item.link ?? null,
          town: matchTown(text),
          category: categorizeArticle(text),
        });
      }
    }
  } catch {
    // RSS fetch failed — continue
  }

  // Source 2: NY Open Data press releases
  try {
    const pressRes = await fetch(
      "https://data.ny.gov/resource/gha5-esqj.json?$limit=30&$order=date_posted desc",
      { headers: { Accept: "application/json" } }
    );

    if (pressRes.ok) {
      const data = (await pressRes.json()) as Record<string, string>[];
      for (const item of data) {
        const title = item.title ?? item.headline;
        if (!title) continue;

        const text = `${title} ${item.description ?? ""}`.toLowerCase();
        // Only keep articles mentioning Long Island
        if (!LI_KEYWORDS.some((kw) => text.includes(kw))) continue;

        articles.push({
          external_id: `nyod-press-${hashString(title + (item.date_posted ?? ""))}`,
          title,
          summary: item.description?.slice(0, 300) ?? null,
          published_at: item.date_posted ?? null,
          source_name: "NY State",
          source_url: item.url ?? null,
          town: matchTown(text),
          category: categorizeArticle(text),
        });
      }
    }
  } catch {
    // Source unavailable
  }

  return articles;
}

/** Parse RSS XML into simple item objects (lightweight, no dependency needed) */
function parseRssItems(
  xml: string
): Array<{ title: string; link: string; description: string; pubDate: string }> {
  const items: Array<{ title: string; link: string; description: string; pubDate: string }> = [];

  // Simple regex-based RSS parser (good enough for Google News RSS)
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    items.push({
      title: extractTag(block, "title"),
      link: extractTag(block, "link"),
      description: extractTag(block, "description"),
      pubDate: extractTag(block, "pubDate"),
    });
  }

  return items;
}

/** Extract content between XML tags */
function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  const match = regex.exec(xml);
  return match?.[1] ?? match?.[2] ?? "";
}

/** Remove HTML tags from a string */
function cleanHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/** Google News appends " - SourceName" to titles */
function extractSource(title: string): string {
  const parts = title.split(" - ");
  return parts.length > 1 ? parts[parts.length - 1].trim() : "News";
}

/** Match article text to the most relevant Long Island town */
function matchTown(text: string): string | null {
  for (const matcher of TOWN_MATCHERS) {
    if (matcher.keywords.some((kw) => text.includes(kw))) {
      return matcher.town;
    }
  }
  return null;
}

/** Categorize article based on content keywords */
function categorizeArticle(text: string): string {
  if (/school|board of ed|student|teacher|budget/.test(text)) return "schools";
  if (/police|crime|arrest|crash|accident|fire department/.test(text)) return "safety";
  if (/town board|village|council|mayor|election|vote/.test(text)) return "government";
  if (/lirr|train|traffic|road|highway|parkway/.test(text)) return "transit";
  if (/weather|storm|flood|snow|hurricane|nor.easter/.test(text)) return "weather";
  if (/restaurant|shop|business|open|close/.test(text)) return "business";
  return "local";
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
