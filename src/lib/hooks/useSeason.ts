"use client";

import { useEffect, useState } from "react";

/**
 * useSeason — detects the current season and applies it to the document.
 *
 * This hook automatically determines the current season based on the date
 * and sets a `data-season` attribute on the <html> element. The CSS in
 * globals.css uses this attribute to shift the app's color personality.
 *
 * Seasons on Long Island:
 * - Summer (Jun 20 - Sep 21): Beach mode, warm golds, sunset gradients
 * - Fall (Sep 22 - Dec 20): Harvest mode, amber/deep orange tones
 * - Winter (Dec 21 - Mar 19): Snow mode, cool blue-white, frost effects
 * - Spring (Mar 20 - Jun 19): Fresh mode, greens, pastels
 */

export type Season = "spring" | "summer" | "fall" | "winter";

function getCurrentSeason(): Season {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const day = now.getDate();

  // March 20 - June 19
  if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day < 20)) {
    return "spring";
  }
  // June 20 - September 21
  if ((month === 5 && day >= 20) || month === 6 || month === 7 || (month === 8 && day < 22)) {
    return "summer";
  }
  // September 22 - December 20
  if ((month === 8 && day >= 22) || month === 9 || month === 10 || (month === 11 && day < 21)) {
    return "fall";
  }
  // December 21 - March 19
  return "winter";
}

export function useSeason() {
  const [season, setSeason] = useState<Season>(getCurrentSeason);

  useEffect(() => {
    // Apply the season attribute to the document for CSS targeting
    document.documentElement.setAttribute("data-season", season);
  }, [season]);

  return season;
}
