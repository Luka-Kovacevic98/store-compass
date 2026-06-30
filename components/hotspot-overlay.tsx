"use client"

import { MapPin } from "lucide-react"
import type { Hotspot } from "@/lib/types"

interface HotspotOverlayProps {
  hotspot: Hotspot
  label: string
  onClick: () => void
}

// Positioned with percentage coords so it stays aligned at any image size.
function HotspotOverlay({ hotspot, label, onClick }: HotspotOverlayProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open placement details for ${label}`}
      className="hotspot-pulse absolute z-20 rounded-xl border-2 border-accent bg-accent/25 backdrop-blur-[2px] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      style={{
        left: `${hotspot.xPct}%`,
        top: `${hotspot.yPct}%`,
        width: `${hotspot.wPct}%`,
        height: `${hotspot.hPct}%`,
      }}
    >
      <span className="absolute -top-9 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full border border-white/20 bg-[oklch(0.24_0.04_265_/_0.92)] px-2.5 py-1 text-xs font-medium text-foreground shadow-lg backdrop-blur-md">
        <MapPin className="size-3 text-accent" />
        {label}
      </span>
    </button>
  )
}

export default HotspotOverlay
