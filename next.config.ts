import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

/**
 * PWA (Progressive Web App) configuration.
 *
 * This plugin generates a "service worker" — a script that runs in the
 * background of the user's browser. It handles:
 * - Caching assets so the app loads fast (even on slow connections)
 * - Making the app installable on phones ("Add to Home Screen")
 * - Enabling offline access to previously viewed content
 */
const withPWA = withPWAInit({
  dest: "public",
  // Only enable service worker in production (skip during development)
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  // Allow loading images from external sources (news articles, etc.)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Empty turbopack config to allow both webpack (PWA plugin) and turbopack
  turbopack: {},
};

export default withPWA(nextConfig);
