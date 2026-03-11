"use client";

import { type ReactNode } from "react";
import dynamic from "next/dynamic";
import NavBar from "./NavBar";
import NavDock from "./NavDock";
import BottomSheet from "./BottomSheet";

/**
 * AppShell — the master layout component.
 *
 * Think of this as the "frame" of the entire app. It arranges:
 * 1. The Mapbox map (full-screen, always behind everything)
 * 2. The NavBar (top, overlays the map with glass effect)
 * 3. The content area (BottomSheet on mobile, SidePanel on desktop)
 * 4. The NavDock (bottom navigation, always visible)
 *
 * The map is loaded with dynamic import + no SSR because Mapbox GL
 * requires the browser's window object — it can't render on the server.
 */

// Dynamically import MapCanvas so it only loads in the browser.
// The "ssr: false" tells Next.js to skip server-side rendering for this
// component, which is necessary because Mapbox needs the browser's
// window/document objects to work.
const MapCanvas = dynamic(() => import("@/components/map/MapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[var(--color-deep-ocean)] flex items-center justify-center">
      <div className="text-[var(--text-muted)] text-sm">Loading map...</div>
    </div>
  ),
});

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Layer 1: Map — fills entire screen, always behind everything */}
      <div className="absolute inset-0 z-0">
        <MapCanvas />
      </div>

      {/* Layer 2: Top navigation bar */}
      <NavBar />

      {/* Layer 3: Content — BottomSheet on mobile, will add SidePanel for desktop later */}
      <BottomSheet>{children}</BottomSheet>

      {/* Layer 4: Bottom navigation dock */}
      <NavDock />
    </div>
  );
}
