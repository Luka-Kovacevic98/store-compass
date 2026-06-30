"use client"

import { useEffect, useRef, useState } from "react"
import { DoorOpen, Edit2, Plus, RotateCw, Save, ShoppingBasket, Snowflake, SquareTerminal, Trash2, Wallpaper } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Article, Fixture, FixtureType, Hotspot, Planogram, PlanogramItem, Store } from "@/lib/types"

const CANVAS_WIDTH = 1200
const CANVAS_HEIGHT = 800

interface PlannerArticleDraft {
  articleName: string
  sku: string
  category: string
  aisle: string
  bay: string
  shelf: string
  facing: string
  unitsPerRow: number
  instructions: string
}

interface PlannerEntry {
  hotspot: Hotspot
  details: PlannerArticleDraft
  linkedFixtureId?: string | null
  fixtureOffsetXPct?: number
  fixtureOffsetYPct?: number
}

interface StorePlannerEditorProps {
  open: boolean
  store: Store | null
  onOpenChange: (open: boolean) => void
  onSave: (payload: { planogram: Planogram; entries: PlannerEntry[] }) => Promise<void>
  /** Pass an existing planogram to open in edit mode */
  initialPlanogram?: Planogram | null
  /** Full article list needed to reconstruct article names/skus when editing */
  allArticles?: Article[]
}

const DEFAULT_FIXTURE_SIZE: Record<FixtureType, { wPct: number; hPct: number; label: string }> = {
  shelf: { wPct: 18, hPct: 10, label: "Shelf" },
  fridge: { wPct: 14, hPct: 16, label: "Fridge" },
  checkout: { wPct: 16, hPct: 8, label: "Checkout" },
  entrance: { wPct: 10, hPct: 4, label: "Entrance" },
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

function isLinkableFixtureType(type: FixtureType) {
  return type === "shelf" || type === "fridge"
}

function findLinkedFixture(hotspot: Hotspot, fixtures: Fixture[]) {
  const cx = hotspot.xPct + hotspot.wPct / 2
  const cy = hotspot.yPct + hotspot.hPct / 2
  return (
    fixtures.find(
      (fixture) =>
        isLinkableFixtureType(fixture.type) &&
        cx >= fixture.xPct &&
        cx <= fixture.xPct + fixture.wPct &&
        cy >= fixture.yPct &&
        cy <= fixture.yPct + fixture.hPct,
    ) ?? null
  )
}

function getFixtureOffsets(hotspot: Hotspot, fixture: Fixture) {
  return {
    fixtureOffsetXPct: hotspot.xPct - fixture.xPct,
    fixtureOffsetYPct: hotspot.yPct - fixture.yPct,
  }
}

function fixtureColorClasses(type: FixtureType) {
  if (type === "shelf") return "border-cyan-300/70 bg-cyan-300/20"
  if (type === "fridge") return "border-sky-200/80 bg-sky-200/25"
  if (type === "entrance") return "border-emerald-400/80 bg-emerald-400/20"
  return "border-amber-300/70 bg-amber-300/20"
}

function fixtureIcon(type: FixtureType) {
  if (type === "shelf") return <ShoppingBasket className="size-3.5" />
  if (type === "fridge") return <Snowflake className="size-3.5" />
  if (type === "entrance") return <DoorOpen className="size-3.5" />
  return <SquareTerminal className="size-3.5" />
}

type OpeningSide = "top" | "right" | "bottom" | "left"

interface WallOpening {
  side: OpeningSide
  start: number
  size: number
}

function getEntranceOpenings(fixtures: Fixture[]): WallOpening[] {
  const entrances = fixtures.filter((f) => f.type === "entrance")

  return entrances.map((entrance) => {
    const cx = entrance.xPct + entrance.wPct / 2
    const cy = entrance.yPct + entrance.hPct / 2

    const distances: Record<OpeningSide, number> = {
      top: Math.abs(cy - 4),
      right: Math.abs(96 - cx),
      bottom: Math.abs(96 - cy),
      left: Math.abs(cx - 4),
    }

    let side: OpeningSide = "top"
    let minDist = distances.top
    ;(["right", "bottom", "left"] as OpeningSide[]).forEach((candidate) => {
      if (distances[candidate] < minDist) {
        side = candidate
        minDist = distances[candidate]
      }
    })

    if (side === "top" || side === "bottom") {
      const size = clamp(entrance.wPct * 0.95, 4, 20)
      const start = clamp(cx - size / 2, 8, 92 - size)
      return { side, start, size }
    }

    const size = clamp(entrance.hPct * 0.95, 4, 20)
    const start = clamp(cy - size / 2, 8, 92 - size)
    return { side, start, size }
  })
}

const BLANK_DRAFT: PlannerArticleDraft = {
  articleName: "",
  sku: "",
  category: "",
  aisle: "",
  bay: "",
  shelf: "",
  facing: "",
  unitsPerRow: 1,
  instructions: "",
}

function StorePlannerEditor({
  open,
  store,
  onOpenChange,
  onSave,
  initialPlanogram,
  allArticles,
}: StorePlannerEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [entries, setEntries] = useState<PlannerEntry[]>([])
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>(null)
  const [pendingHotspot, setPendingHotspot] = useState<Hotspot | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  /** null = adding new entry; number = editing existing entry at that index */
  const [editingEntryIndex, setEditingEntryIndex] = useState<number | null>(null)
  /** highlights a saved entry on the canvas */
  const [selectedEntryIndex, setSelectedEntryIndex] = useState<number | null>(null)
  const [showWalls, setShowWalls] = useState(true)
  const [pendingLinkedFixtureId, setPendingLinkedFixtureId] = useState<string | null>(null)

  const [articleDraft, setArticleDraft] = useState<PlannerArticleDraft>(BLANK_DRAFT)

  const actionRef = useRef<{
    kind: "drag-fixture" | "resize-fixture" | "drag-slot" | "resize-slot" | "drag-entry"
    targetId?: string
    entryIndex?: number
    startX: number
    startY: number
    startRect: { xPct: number; yPct: number; wPct: number; hPct: number }
  } | null>(null)

  const prevOpenRef = useRef(false)

  // Load / reset state whenever the editor is opened
  useEffect(() => {
    const justOpened = open && !prevOpenRef.current
    const justClosed = !open && prevOpenRef.current
    prevOpenRef.current = open

    if (justOpened) {
      if (initialPlanogram) {
        const initialFixtures = initialPlanogram.fixtures ?? []
        setFixtures(initialFixtures)
        setShowWalls(initialPlanogram.showWalls ?? true)
        setEntries(
          initialPlanogram.items.map((item) => {
            const article = allArticles?.find((a) => a.articleId === item.articleId)
            const linkedFixture =
              initialFixtures.find((fixture) => fixture.id === item.connectedFixtureId) ??
              findLinkedFixture(item.hotspot, initialFixtures)
            const offsets = linkedFixture ? getFixtureOffsets(item.hotspot, linkedFixture) : null

            return {
              hotspot: item.hotspot,
              details: {
                articleName: article?.name ?? item.articleId,
                sku: article?.sku ?? "",
                category: article?.category ?? "",
                aisle: item.aisle,
                bay: item.bay,
                shelf: item.shelf,
                facing: item.facing,
                unitsPerRow: item.unitsPerRow,
                instructions: item.instructions,
              },
              linkedFixtureId: linkedFixture?.id ?? null,
              fixtureOffsetXPct: item.fixtureOffsetXPct ?? offsets?.fixtureOffsetXPct,
              fixtureOffsetYPct: item.fixtureOffsetYPct ?? offsets?.fixtureOffsetYPct,
            }
          }),
        )
      } else {
        resetState()
      }
    }
    if (justClosed) resetState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const selectedFixture = fixtures.find((f) => f.id === selectedFixtureId) ?? null

  function resetState() {
    setFixtures([])
    setEntries([])
    setSelectedFixtureId(null)
    setPendingHotspot(null)
    setDetailsOpen(false)
    setEditingEntryIndex(null)
    setSelectedEntryIndex(null)
    setPendingLinkedFixtureId(null)
    setShowWalls(true)
    setSaving(false)
    setArticleDraft(BLANK_DRAFT)
  }

  function addFixture(type: FixtureType) {
    const spec = DEFAULT_FIXTURE_SIZE[type]
    const next: Fixture = {
      id: uid("fix"),
      type,
      label: `${spec.label} ${fixtures.filter((f) => f.type === type).length + 1}`,
      xPct: 40,
      yPct: 40,
      wPct: spec.wPct,
      hPct: spec.hPct,
      rotationDeg: 0,
    }
    setFixtures((prev) => [...prev, next])
    setSelectedFixtureId(next.id)
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const action = actionRef.current
    if (!action || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const dxPct = ((event.clientX - action.startX) / rect.width) * 100
    const dyPct = ((event.clientY - action.startY) / rect.height) * 100

    if (action.kind === "drag-fixture" && action.targetId) {
      let movedDx = 0
      let movedDy = 0
      setFixtures((prev) =>
        prev.map((f) =>
          f.id !== action.targetId
            ? f
            : {
                ...f,
                xPct: (() => {
                  const next = clamp(action.startRect.xPct + dxPct, 0, 100 - f.wPct)
                  movedDx = next - f.xPct
                  return next
                })(),
                yPct: (() => {
                  const next = clamp(action.startRect.yPct + dyPct, 0, 100 - f.hPct)
                  movedDy = next - f.yPct
                  return next
                })(),
              },
        ),
      )

      if (movedDx !== 0 || movedDy !== 0) {
        setEntries((prev) =>
          prev.map((entry) => {
            if (entry.linkedFixtureId !== action.targetId) return entry
            return {
              ...entry,
              hotspot: {
                ...entry.hotspot,
                xPct: clamp(entry.hotspot.xPct + movedDx, 0, 100 - entry.hotspot.wPct),
                yPct: clamp(entry.hotspot.yPct + movedDy, 0, 100 - entry.hotspot.hPct),
              },
            }
          }),
        )

        if (pendingLinkedFixtureId === action.targetId) {
          setPendingHotspot((prev) =>
            prev
              ? {
                  ...prev,
                  xPct: clamp(prev.xPct + movedDx, 0, 100 - prev.wPct),
                  yPct: clamp(prev.yPct + movedDy, 0, 100 - prev.hPct),
                }
              : prev,
          )
        }
      }

      return
    }
    if (action.kind === "resize-fixture" && action.targetId) {
      setFixtures((prev) =>
        prev.map((f) =>
          f.id !== action.targetId
            ? f
            : {
                ...f,
                wPct: clamp(action.startRect.wPct + dxPct, 6, 100 - f.xPct),
                hPct: clamp(action.startRect.hPct + dyPct, 5, 100 - f.yPct),
              },
        ),
      )
      return
    }
    if (action.kind === "drag-slot") {
      setPendingHotspot((prev) =>
        prev
          ? {
              ...prev,
              xPct: clamp(action.startRect.xPct + dxPct, 0, 100 - prev.wPct),
              yPct: clamp(action.startRect.yPct + dyPct, 0, 100 - prev.hPct),
            }
          : prev,
      )
      return
    }
    if (action.kind === "drag-entry" && action.entryIndex !== undefined) {
      setEntries((prev) =>
        prev.map((entry, index) => {
          if (index !== action.entryIndex) return entry

          const nextHotspot = {
            ...entry.hotspot,
            xPct: clamp(action.startRect.xPct + dxPct, 0, 100 - entry.hotspot.wPct),
            yPct: clamp(action.startRect.yPct + dyPct, 0, 100 - entry.hotspot.hPct),
          }

          if (!entry.linkedFixtureId) {
            return { ...entry, hotspot: nextHotspot }
          }

          const linkedFixture = fixtures.find((fixture) => fixture.id === entry.linkedFixtureId)
          if (!linkedFixture) {
            return { ...entry, hotspot: nextHotspot }
          }

          return {
            ...entry,
            hotspot: nextHotspot,
            fixtureOffsetXPct: nextHotspot.xPct - linkedFixture.xPct,
            fixtureOffsetYPct: nextHotspot.yPct - linkedFixture.yPct,
          }
        }),
      )
      return
    }
    if (action.kind === "resize-slot") {
      setPendingHotspot((prev) =>
        prev
          ? {
              ...prev,
              wPct: clamp(action.startRect.wPct + dxPct, 2.5, 100 - prev.xPct),
              hPct: clamp(action.startRect.hPct + dyPct, 2.5, 100 - prev.yPct),
            }
          : prev,
      )
    }
  }

  function clearAction() {
    actionRef.current = null
  }

  function createSlotFromFixture() {
    if (!selectedFixture) return
    setPendingHotspot({
      xPct: selectedFixture.xPct + selectedFixture.wPct * 0.25,
      yPct: selectedFixture.yPct + selectedFixture.hPct * 0.25,
      wPct: Math.max(selectedFixture.wPct * 0.45, 6),
      hPct: Math.max(selectedFixture.hPct * 0.45, 6),
    })
    setPendingLinkedFixtureId(isLinkableFixtureType(selectedFixture.type) ? selectedFixture.id : null)
    setEditingEntryIndex(null)
    setSelectedEntryIndex(null)
  }

  function openDetailsForNew() {
    if (!pendingHotspot) return
    setEditingEntryIndex(null)
    setArticleDraft(BLANK_DRAFT)
    setDetailsOpen(true)
  }

  function openDetailsForEdit(index: number) {
    const entry = entries[index]
    if (!entry) return
    setEditingEntryIndex(index)
    setPendingHotspot(entry.hotspot)
    setPendingLinkedFixtureId(entry.linkedFixtureId ?? null)
    setArticleDraft({ ...entry.details })
    setSelectedEntryIndex(index)
    setDetailsOpen(true)
  }

  function deleteEntry(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index))
    if (selectedEntryIndex === index) setSelectedEntryIndex(null)
    if (editingEntryIndex === index) {
      setEditingEntryIndex(null)
      setPendingHotspot(null)
    }
  }

  function saveEntry() {
    const { articleName, sku, category, aisle, bay, shelf, facing } = articleDraft
    if (!articleName.trim() || !sku.trim() || !category.trim()) return
    if (!aisle.trim() || !bay.trim() || !shelf.trim() || !facing.trim()) return

    const details: PlannerArticleDraft = {
      ...articleDraft,
      unitsPerRow: Math.max(1, Number(articleDraft.unitsPerRow || 1)),
      instructions: articleDraft.instructions.trim() || "Placement configured in planner.",
    }

    const hotspotForSave =
      editingEntryIndex !== null
        ? pendingHotspot ?? entries[editingEntryIndex]?.hotspot ?? null
        : pendingHotspot
    if (!hotspotForSave) return

    const linkedFixture =
      fixtures.find((fixture) => fixture.id === pendingLinkedFixtureId) ??
      findLinkedFixture(hotspotForSave, fixtures)
    const linkOffsets = linkedFixture ? getFixtureOffsets(hotspotForSave, linkedFixture) : null

    if (editingEntryIndex !== null) {
      setEntries((prev) =>
        prev.map((e, i) =>
          i === editingEntryIndex
            ? {
                hotspot: hotspotForSave,
                details,
                linkedFixtureId: linkedFixture?.id ?? null,
                fixtureOffsetXPct: linkOffsets?.fixtureOffsetXPct,
                fixtureOffsetYPct: linkOffsets?.fixtureOffsetYPct,
              }
            : e,
        ),
      )
    } else {
      setEntries((prev) => [
        ...prev,
        {
          hotspot: hotspotForSave,
          details,
          linkedFixtureId: linkedFixture?.id ?? null,
          fixtureOffsetXPct: linkOffsets?.fixtureOffsetXPct,
          fixtureOffsetYPct: linkOffsets?.fixtureOffsetYPct,
        },
      ])
    }

    setPendingHotspot(null)
    setPendingLinkedFixtureId(null)
    setDetailsOpen(false)
    setEditingEntryIndex(null)
    setSelectedEntryIndex(null)
    setArticleDraft(BLANK_DRAFT)
  }

  async function savePlanner() {
    if (!store || fixtures.length === 0 || entries.length === 0) return

    const planogramItems: PlanogramItem[] = entries.map((entry) => ({
      articleId: "",
      hotspot: entry.hotspot,
      connectedFixtureId: entry.linkedFixtureId ?? undefined,
      fixtureOffsetXPct: entry.fixtureOffsetXPct,
      fixtureOffsetYPct: entry.fixtureOffsetYPct,
      shelfImageUrl: "/shelves/custom.svg",
      instructions: entry.details.instructions,
      aisle: entry.details.aisle,
      bay: entry.details.bay,
      shelf: entry.details.shelf,
      facing: entry.details.facing,
      unitsPerRow: Math.max(1, Number(entry.details.unitsPerRow || 1)),
    }))

    const planogram: Planogram = {
      storeRef: store._id,
      imageUrl: `/planograms/${store._id}.svg`,
      imageWidth: CANVAS_WIDTH,
      imageHeight: CANVAS_HEIGHT,
      showWalls,
      fixtures,
      items: planogramItems,
    }

    setSaving(true)
    await onSave({ planogram, entries })
    setSaving(false)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) resetState()
      }}
    >
      <DialogContent className="flex h-[94vh] max-h-[94vh] max-w-7xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{initialPlanogram ? "Edit Store Planner" : "Create Store Planner"}</DialogTitle>
          <DialogDescription>
            {initialPlanogram
              ? "Edit fixture layout and article placements, then save to update mocked data."
              : "Add fixtures, drag them into position, rotate/resize, mark article areas, then enter placement info."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[340px_1fr]">
          {/* ---- Sidebar ------------------------------------------------- */}
          <aside className="flex min-h-0 flex-col gap-3 overflow-y-auto rounded-2xl border border-white/15 bg-white/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pre-built fixtures</p>
            <div className="grid grid-cols-1 gap-2">
              <Button variant="glass" onClick={() => addFixture("shelf")}>
                <Plus className="size-4" /> Add shelf
              </Button>
              <Button variant="glass" onClick={() => addFixture("fridge")}>
                <Plus className="size-4" /> Add fridge
              </Button>
              <Button variant="glass" onClick={() => addFixture("checkout")}>
                <Plus className="size-4" /> Add checkout
              </Button>
              <Button variant="glass" onClick={() => addFixture("entrance")}>
                <Plus className="size-4" /> Add entrance
              </Button>
              <Button
                variant="glass"
                className={showWalls ? "border-slate-300/50 bg-slate-300/20" : ""}
                onClick={() => setShowWalls((v) => !v)}
              >
                <Wallpaper className="size-4" /> {showWalls ? "Hide walls" : "Show walls"}
              </Button>
            </div>

            {/* Selected-fixture actions */}
            <div className="space-y-1.5 rounded-xl border border-white/10 bg-black/20 p-2.5">
              <p className="mb-2 text-xs text-muted-foreground">Selected fixture actions</p>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                disabled={!selectedFixture}
                onClick={() => {
                  if (!selectedFixture) return
                  setFixtures((prev) =>
                    prev.map((f) =>
                      f.id === selectedFixture.id ? { ...f, rotationDeg: (f.rotationDeg + 15) % 360 } : f,
                    ),
                  )
                }}
              >
                <RotateCw className="size-4" /> Rotate +15°
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                disabled={!selectedFixture}
                onClick={createSlotFromFixture}
              >
                <Plus className="size-4" /> Mark article area
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                disabled={!pendingHotspot}
                onClick={openDetailsForNew}
              >
                <Plus className="size-4" /> Add article details
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm text-red-300 hover:text-red-200"
                disabled={!selectedFixture}
                onClick={() => {
                  if (!selectedFixture) return
                  setEntries((prev) =>
                    prev.map((entry) =>
                      entry.linkedFixtureId === selectedFixture.id
                        ? {
                            ...entry,
                            linkedFixtureId: null,
                            fixtureOffsetXPct: undefined,
                            fixtureOffsetYPct: undefined,
                          }
                        : entry,
                    ),
                  )
                  if (pendingLinkedFixtureId === selectedFixture.id) {
                    setPendingLinkedFixtureId(null)
                  }
                  setFixtures((prev) => prev.filter((f) => f.id !== selectedFixture.id))
                  setSelectedFixtureId(null)
                }}
              >
                <Trash2 className="size-4" /> Remove fixture
              </Button>
            </div>

            <div className="flex min-h-44 max-h-60 flex-col gap-1.5 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-2.5">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Fixtures ({fixtures.length})
              </p>
              {fixtures.length === 0 && (
                <p className="text-xs text-muted-foreground">No fixtures added yet.</p>
              )}
              {fixtures.map((fixture, idx) => (
                <button
                  key={fixture.id}
                  type="button"
                  className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors ${
                    selectedFixtureId === fixture.id
                      ? "border-cyan-300/70 bg-cyan-300/20"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                  onClick={() => {
                    setSelectedFixtureId(fixture.id)
                    setSelectedEntryIndex(null)
                  }}
                >
                  {fixtureIcon(fixture.type)}
                  <span className="truncate text-xs text-foreground">
                    {idx + 1}. {fixture.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Article placements list */}
            <div className="flex flex-1 flex-col gap-1.5 rounded-xl border border-white/10 bg-black/20 p-2.5">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Article placements ({entries.length})
              </p>
              {entries.length === 0 && (
                <p className="text-xs text-muted-foreground">No articles placed yet.</p>
              )}
              {entries.map((entry, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 transition-colors ${
                    selectedEntryIndex === idx
                      ? "border-fuchsia-400/60 bg-fuchsia-400/15"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() => setSelectedEntryIndex(selectedEntryIndex === idx ? null : idx)}
                  >
                    <span className="block truncate text-xs font-medium text-foreground">
                      {idx + 1}. {entry.details.articleName || "(unnamed)"}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {entry.details.aisle} · {entry.details.bay}
                    </span>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0"
                    aria-label={`Edit article ${idx + 1}`}
                    onClick={() => openDetailsForEdit(idx)}
                  >
                    <Edit2 className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 text-red-300 hover:text-red-200"
                    aria-label={`Delete article ${idx + 1}`}
                    onClick={() => deleteEntry(idx)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              className="w-full"
              disabled={fixtures.length === 0 || entries.length === 0 || saving}
              onClick={savePlanner}
            >
              <Save className="size-4" /> {saving ? "Saving…" : "Save planner"}
            </Button>
          </aside>

          {/* ---- Canvas -------------------------------------------------- */}
          <div className="min-h-0">
            <div
              ref={canvasRef}
              className="relative h-full min-h-[520px] w-full overflow-hidden rounded-2xl border border-white/15 bg-slate-950"
              onPointerMove={onPointerMove}
              onPointerUp={clearAction}
              onPointerLeave={clearAction}
              onPointerDown={(event) => {
                if (event.target !== event.currentTarget) return
                setSelectedFixtureId(null)
                setSelectedEntryIndex(null)
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.16),transparent_50%),linear-gradient(120deg,rgba(15,23,42,0.95),rgba(30,41,59,0.86))]" />
              <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] [background-size:50px_50px]" />

              {/* Store walls overlay */}
              {showWalls && (
                <svg
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {(() => {
                    const openings = getEntranceOpenings(fixtures)
                    return (
                      <>
                  {/* Primary wall border */}
                  <rect
                    x="4"
                    y="4"
                    width="92"
                    height="92"
                    rx="2.8"
                    fill="none"
                    stroke="#67e8f9"
                    strokeWidth="1.8"
                    strokeOpacity="0.95"
                  />
                  {/* Secondary inset border */}
                  <rect
                    x="6"
                    y="6"
                    width="88"
                    height="88"
                    rx="2"
                    fill="none"
                    stroke="#a5f3fc"
                    strokeWidth="0.5"
                    strokeOpacity="0.75"
                    strokeDasharray="2 1.5"
                  />
                        {openings.map((opening, index) => {
                          if (opening.side === "top") {
                            return <rect key={`opening-${index}`} x={opening.start} y="2.8" width={opening.size} height="3.4" fill="#0f172a" />
                          }
                          if (opening.side === "bottom") {
                            return <rect key={`opening-${index}`} x={opening.start} y="93.8" width={opening.size} height="3.4" fill="#0f172a" />
                          }
                          if (opening.side === "left") {
                            return <rect key={`opening-${index}`} x="2.8" y={opening.start} width="3.4" height={opening.size} fill="#0f172a" />
                          }
                          return <rect key={`opening-${index}`} x="93.8" y={opening.start} width="3.4" height={opening.size} fill="#0f172a" />
                        })}
                      </>
                    )
                  })()}
                </svg>
              )}

              {/* Fixtures */}
              {fixtures.map((fixture) => {
                const selected = fixture.id === selectedFixtureId
                const colorClasses =
                  fixture.type === "shelf"
                    ? "border-cyan-300/70 bg-cyan-300/20"
                    : fixture.type === "fridge"
                      ? "border-sky-200/80 bg-sky-200/25"
                      : fixture.type === "entrance"
                        ? "border-emerald-400/80 bg-emerald-400/20"
                        : "border-amber-300/70 bg-amber-300/20"
                return (
                  <div
                    key={fixture.id}
                    className={`absolute rounded-xl border shadow-xl ${colorClasses} ${selected ? "ring-2 ring-white/80" : ""}`}
                    style={{
                      left: `${fixture.xPct}%`,
                      top: `${fixture.yPct}%`,
                      width: `${fixture.wPct}%`,
                      height: `${fixture.hPct}%`,
                      transform: `rotate(${fixture.rotationDeg}deg)`,
                      transformOrigin: "center",
                    }}
                    onPointerDown={(event) => {
                      event.stopPropagation()
                      setSelectedFixtureId(fixture.id)
                      setSelectedEntryIndex(null)
                      actionRef.current = {
                        kind: "drag-fixture",
                        targetId: fixture.id,
                        startX: event.clientX,
                        startY: event.clientY,
                        startRect: { xPct: fixture.xPct, yPct: fixture.yPct, wPct: fixture.wPct, hPct: fixture.hPct },
                      }
                    }}
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-center gap-1 rounded-t-xl bg-black/25 px-1 py-0.5 text-[10px] font-semibold text-white">
                      {fixtureIcon(fixture.type)}
                      <span>{fixture.label}</span>
                    </div>
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 size-4 cursor-se-resize rounded-tl-md bg-white/70"
                      onPointerDown={(event) => {
                        event.stopPropagation()
                        setSelectedFixtureId(fixture.id)
                        actionRef.current = {
                          kind: "resize-fixture",
                          targetId: fixture.id,
                          startX: event.clientX,
                          startY: event.clientY,
                          startRect: { xPct: fixture.xPct, yPct: fixture.yPct, wPct: fixture.wPct, hPct: fixture.hPct },
                        }
                      }}
                    />
                  </div>
                )
              })}

              {/* Saved article entry boxes — clickable and double-click to edit */}
              {entries.map((entry, idx) => {
                const isSelected = selectedEntryIndex === idx
                const isEditing = editingEntryIndex === idx
                return (
                  <div
                    key={`entry-${idx}`}
                    className={`absolute cursor-pointer rounded-lg border-2 transition-colors ${
                      isEditing
                        ? "border-fuchsia-300 bg-fuchsia-300/20"
                        : isSelected
                          ? "border-amber-200 bg-amber-200/25"
                          : "border-amber-300 bg-amber-300/15 hover:bg-amber-300/25"
                    }`}
                    style={{
                      left: `${entry.hotspot.xPct}%`,
                      top: `${entry.hotspot.yPct}%`,
                      width: `${entry.hotspot.wPct}%`,
                      height: `${entry.hotspot.hPct}%`,
                    }}
                    onPointerDown={(event) => {
                      event.stopPropagation()
                      setSelectedEntryIndex(idx)
                      setSelectedFixtureId(null)
                      actionRef.current = {
                        kind: "drag-entry",
                        entryIndex: idx,
                        startX: event.clientX,
                        startY: event.clientY,
                        startRect: {
                          xPct: entry.hotspot.xPct,
                          yPct: entry.hotspot.yPct,
                          wPct: entry.hotspot.wPct,
                          hPct: entry.hotspot.hPct,
                        },
                      }
                    }}
                    onDoubleClick={(event) => {
                      event.stopPropagation()
                      openDetailsForEdit(idx)
                    }}
                  >
                    <span className="pointer-events-none absolute left-1 top-0.5 truncate text-[9px] font-semibold text-amber-100">
                      {entry.details.articleName || `#${idx + 1}`}
                    </span>
                  </div>
                )
              })}

              {/* Pending hotspot being positioned */}
              {pendingHotspot && (
                <div
                  className="absolute rounded-lg border-2 border-fuchsia-300 bg-fuchsia-300/15"
                  style={{
                    left: `${pendingHotspot.xPct}%`,
                    top: `${pendingHotspot.yPct}%`,
                    width: `${pendingHotspot.wPct}%`,
                    height: `${pendingHotspot.hPct}%`,
                  }}
                  onPointerDown={(event) => {
                    event.stopPropagation()
                    actionRef.current = {
                      kind: "drag-slot",
                      startX: event.clientX,
                      startY: event.clientY,
                      startRect: { xPct: pendingHotspot.xPct, yPct: pendingHotspot.yPct, wPct: pendingHotspot.wPct, hPct: pendingHotspot.hPct },
                    }
                  }}
                >
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-fuchsia-200">
                    {editingEntryIndex !== null ? `Editing #${editingEntryIndex + 1}` : "Drag to reposition"}
                  </span>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 size-4 cursor-se-resize rounded-tl-md bg-fuchsia-300"
                    onPointerDown={(event) => {
                      event.stopPropagation()
                      actionRef.current = {
                        kind: "resize-slot",
                        startX: event.clientX,
                        startY: event.clientY,
                        startRect: { xPct: pendingHotspot.xPct, yPct: pendingHotspot.yPct, wPct: pendingHotspot.wPct, hPct: pendingHotspot.hPct },
                      }
                    }}
                  />
                </div>
              )}
            </div>

            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Click fixture to select · Drag to move · Corner handle to resize · Double-click article box to edit
            </p>
          </div>
        </div>

        {/* ---- Article details modal -------------------------------------- */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEntryIndex !== null
                  ? `Edit article #${editingEntryIndex + 1} — ${entries[editingEntryIndex]?.details.articleName || ""}`
                  : "New article placement"}
              </DialogTitle>
              <DialogDescription>
                Fill in all fields used by the planogram display: article identity, aisle/bay/shelf, and facing info.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Article name" value={articleDraft.articleName} onChange={(v) => setArticleDraft((p) => ({ ...p, articleName: v }))} />
              <Field label="SKU" value={articleDraft.sku} onChange={(v) => setArticleDraft((p) => ({ ...p, sku: v }))} />
              <Field label="Category" value={articleDraft.category} onChange={(v) => setArticleDraft((p) => ({ ...p, category: v }))} />
              <Field label="Aisle" value={articleDraft.aisle} onChange={(v) => setArticleDraft((p) => ({ ...p, aisle: v }))} />
              <Field label="Bay" value={articleDraft.bay} onChange={(v) => setArticleDraft((p) => ({ ...p, bay: v }))} />
              <Field label="Shelf" value={articleDraft.shelf} onChange={(v) => setArticleDraft((p) => ({ ...p, shelf: v }))} />
              <Field label="Facing" value={articleDraft.facing} onChange={(v) => setArticleDraft((p) => ({ ...p, facing: v }))} />
              <label className="text-sm">
                <span className="mb-1 block text-xs text-muted-foreground">Units per row</span>
                <input
                  type="number"
                  min={1}
                  className="h-10 w-full rounded-lg border border-white/20 bg-black/20 px-3 text-sm text-foreground"
                  value={articleDraft.unitsPerRow}
                  onChange={(e) => setArticleDraft((p) => ({ ...p, unitsPerRow: Number(e.target.value || 1) }))}
                />
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block text-xs text-muted-foreground">Instructions</span>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-sm text-foreground"
                  value={articleDraft.instructions}
                  onChange={(e) => setArticleDraft((p) => ({ ...p, instructions: e.target.value }))}
                />
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setDetailsOpen(false)
                  if (editingEntryIndex !== null) {
                    setPendingHotspot(null)
                    setPendingLinkedFixtureId(null)
                    setEditingEntryIndex(null)
                    setSelectedEntryIndex(null)
                  }
                }}
              >
                Cancel
              </Button>
              <Button onClick={saveEntry}>
                {editingEntryIndex !== null ? "Update placement" : "Save placement"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="text-sm">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      <input
        className="h-10 w-full rounded-lg border border-white/20 bg-black/20 px-3 text-sm text-foreground"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

export type { PlannerEntry }
export default StorePlannerEditor
