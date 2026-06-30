"use client"

import { useEffect, useRef, useState } from "react"
import { Edit2, ImageOff, Map, MapPinned, Minus, Plus, RotateCcw, Store as StoreIcon, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import StoreFloorPlan from "@/components/store-floor-plan"
import HotspotOverlay from "@/components/hotspot-overlay"
import type { Article, PlanogramItem, Planogram, Store } from "@/lib/types"

interface PlanogramViewerProps {
  store: Store | null
  planogram: Planogram | null
  loading: boolean
  article: Article | null
  matchedItem: PlanogramItem | null
  onHotspotClick: () => void
  onCreatePlanner: () => void
  onEditPlanner: () => void
}

const ZOOM_STEP = 0.25
const ZOOM_MIN = 1
const ZOOM_MAX = 2.5

function PlanogramViewer({
  store,
  planogram,
  loading,
  article,
  matchedItem,
  onHotspotClick,
  onCreatePlanner,
  onEditPlanner,
}: PlanogramViewerProps) {
  const [zoom, setZoom] = useState(1)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hotspotWrapRef = useRef<HTMLDivElement>(null)

  // Reset zoom whenever the store/planogram changes.
  useEffect(() => {
    setZoom(1)
  }, [planogram?.storeRef])

  // Auto-pan to the hotspot once both store + article resolve to a match.
  useEffect(() => {
    if (matchedItem && hotspotWrapRef.current) {
      const id = window.setTimeout(() => {
        hotspotWrapRef.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
      }, 250)
      return () => window.clearTimeout(id)
    }
  }, [matchedItem, zoom])

  const aspectRatio = planogram ? `${planogram.imageWidth} / ${planogram.imageHeight}` : "3 / 2"

  return (
    <section
      aria-label="Store floor plan"
      className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-lg sm:p-5"
    >
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent/20 text-accent">
            <StoreIcon className="size-5" />
          </span>
          <div>
            <h2 className="text-sm font-semibold leading-tight text-foreground">Store floor plan</h2>
            <p className="text-xs text-muted-foreground">
              {store ? store.name : "No store selected"}
            </p>
          </div>
        </div>

        {planogram && (
          <div className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 p-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Edit planner"
              title="Edit planner layout and articles"
              onClick={onEditPlanner}
            >
              <Edit2 className="size-4" />
            </Button>
            <span className="mx-0.5 h-5 w-px bg-white/20" />
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Zoom out"
              disabled={zoom <= ZOOM_MIN}
              onClick={() => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))}
            >
              <Minus className="size-4" />
            </Button>
            <span className="w-10 text-center text-xs tabular-nums text-muted-foreground">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Zoom in"
              disabled={zoom >= ZOOM_MAX}
              onClick={() => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))}
            >
              <Plus className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Reset zoom"
              disabled={zoom === 1}
              onClick={() => setZoom(1)}
            >
              <RotateCcw className="size-4" />
            </Button>
          </div>
        )}
      </header>

      {/* Not-mapped banner */}
      {planogram && article && !matchedItem && !loading && (
        <div
          role="status"
          className="mb-4 flex items-center gap-3 rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-amber-100"
        >
          <TriangleAlert className="size-5 shrink-0" />
          <p className="text-sm font-medium">This article is not mapped on this store&apos;s planogram.</p>
        </div>
      )}

      {/* Located banner */}
      {matchedItem && article && !loading && (
        <div
          role="status"
          className="mb-4 flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-foreground"
        >
          <MapPinned className="size-5 shrink-0 text-accent" />
          <p className="text-sm">
            <span className="font-medium">{article.name}</span> located in{" "}
            <span className="font-medium text-accent">{matchedItem.aisle}</span> — tap the glowing marker for the aisle
            overview and placement details.
          </p>
        </div>
      )}

      {/* Body */}
      {loading ? (
        <div className="glass-shimmer aspect-[3/2] w-full rounded-xl" />
      ) : !store ? (
        <EmptyState
          icon={<Map className="size-8" />}
          title="Select a store to view its floor plan"
          description="Choose a store from the dropdown above to load its overhead layout."
        />
      ) : !planogram ? (
        <EmptyState
          icon={<ImageOff className="size-8" />}
          title="No floor plan available for this store yet"
          description="This location hasn't been mapped. Create a planner to design fixture layout and article placement."
          action={
            <Button className="mt-4" onClick={onCreatePlanner}>
              Create store planner
            </Button>
          }
        />
      ) : (
        <div
          ref={scrollRef}
          className="relative max-h-[70vh] overflow-auto rounded-xl border border-white/10 bg-black/20"
        >
          <div
            className="relative mx-auto"
            style={{ width: `${zoom * 100}%`, aspectRatio, minWidth: zoom > 1 ? "100%" : undefined }}
          >
            <StoreFloorPlan
              seed={planogram.storeRef}
              width={planogram.imageWidth}
              height={planogram.imageHeight}
              showWalls={planogram.showWalls}
              fixtures={planogram.fixtures}
              className="absolute inset-0 h-full w-full"
            />
            {matchedItem && article && (
              <div
                ref={hotspotWrapRef}
                className="absolute"
                style={{
                  left: `${matchedItem.hotspot.xPct}%`,
                  top: `${matchedItem.hotspot.yPct}%`,
                  width: `${matchedItem.hotspot.wPct}%`,
                  height: `${matchedItem.hotspot.hPct}%`,
                }}
              >
                <HotspotOverlay
                  hotspot={{ xPct: 0, yPct: 0, wPct: 100, hPct: 100 }}
                  label={article.name}
                  onClick={onHotspotClick}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex aspect-[3/2] flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/5 px-6 text-center">
      <span className="mb-3 flex size-16 items-center justify-center rounded-2xl bg-white/10 text-muted-foreground">
        {icon}
      </span>
      <h3 className="text-balance text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-xs text-pretty text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  )
}

export default PlanogramViewer
