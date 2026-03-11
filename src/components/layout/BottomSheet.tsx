"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useTransform, useDragControls, PanInfo } from "framer-motion";

/**
 * BottomSheet — the draggable content panel for mobile.
 *
 * This is the primary way users interact with content on mobile.
 * It sits on top of the map and can be dragged to three positions:
 *
 * 1. PEEK (80px visible) — just shows the Quick Glance status pills
 * 2. HALF (50% of screen) — shows the scrollable card feed
 * 3. FULL (90% of screen) — shows full content / detail views
 *
 * Users drag the handle to switch between positions. The sheet uses
 * spring physics for natural-feeling motion — if you flick it fast,
 * it snaps to the next position. Slow drags follow your finger.
 *
 * This is the same interaction pattern used by Apple Maps and Google Maps,
 * so it feels immediately familiar.
 */

interface BottomSheetProps {
  children: ReactNode;
}

// These values represent how far from the TOP of the screen each snap
// point sits. A higher % means the sheet is more "closed."
const SNAP_POINTS = {
  full: 10,   // 10% from top = sheet fills 90% of screen
  half: 50,   // 50% from top = sheet fills half of screen
  peek: 85,   // 85% from top = just the handle + glance bar visible
};

export default function BottomSheet({ children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const y = useMotionValue(0);

  // The border radius shrinks as the sheet expands to full
  const borderRadius = useTransform(y, [-500, 0], [0, 20]);

  /**
   * When the user stops dragging, snap to the nearest position.
   * If they were moving fast (velocity), snap in the direction of motion.
   */
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const velocity = info.velocity.y;
    const currentY = y.get();

    // Convert current position to a percentage of screen height
    const screenHeight = window.innerHeight;
    const currentPercent = ((screenHeight * SNAP_POINTS.peek / 100) + currentY) / screenHeight * 100;

    let targetPercent: number;

    // If flicking fast, snap in direction of motion
    if (Math.abs(velocity) > 500) {
      if (velocity > 0) {
        // Flicking DOWN — close the sheet
        targetPercent = SNAP_POINTS.peek;
      } else {
        // Flicking UP — open the sheet
        targetPercent = currentPercent < SNAP_POINTS.half
          ? SNAP_POINTS.full
          : SNAP_POINTS.half;
      }
    } else {
      // Slow drag — snap to nearest point
      const distances = Object.entries(SNAP_POINTS).map(([name, pct]) => ({
        name,
        distance: Math.abs(currentPercent - pct),
        pct,
      }));
      distances.sort((a, b) => a.distance - b.distance);
      targetPercent = distances[0].pct;
    }

    // Calculate the Y offset needed to reach the target snap point
    const targetY = (targetPercent - SNAP_POINTS.peek) / 100 * screenHeight;

    // Animate to the snap point with a spring
    y.set(targetY);
  };

  return (
    <motion.div
      ref={sheetRef}
      className="fixed left-0 right-0 z-30 glass rounded-t-[20px] shadow-2xl"
      style={{
        top: `${SNAP_POINTS.peek}%`,
        height: `${100 - SNAP_POINTS.full}%`,
        y,
        borderTopLeftRadius: borderRadius,
        borderTopRightRadius: borderRadius,
      }}
      drag="y"
      dragControls={dragControls}
      dragConstraints={{
        top: -((SNAP_POINTS.peek - SNAP_POINTS.full) / 100) * (typeof window !== "undefined" ? window.innerHeight : 800),
        bottom: 0,
      }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
    >
      {/* Drag handle — the small pill at the top users grab to drag */}
      <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
        <div className="w-10 h-1 rounded-full bg-[var(--color-storm-gray)] opacity-60" />
      </div>

      {/* Content area — scrollable when sheet is expanded */}
      <div className="overflow-y-auto h-full px-4 pb-24">
        {children}
      </div>
    </motion.div>
  );
}
