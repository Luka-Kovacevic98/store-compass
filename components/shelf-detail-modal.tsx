"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ShelfGraphic from "@/components/shelf-graphic"
import PlanogramGraphic from "@/components/planogram-graphic"
import { Compass, Layers, Move3d, Rows3 } from "lucide-react"
import type { Article, PlanogramItem } from "@/lib/types"

// Parse the 1-based bay number out of a label like "Bay 2".
function parseBayNumber(bay: string): number | undefined {
  const match = bay.match(/\d+/)
  return match ? Number(match[0]) : undefined
}

interface ShelfDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  article: Article | null
  item: PlanogramItem | null
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent">
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-medium text-foreground">{value}</span>
      </span>
    </div>
  )
}

function ShelfDetailModal({ open, onOpenChange, article, item }: ShelfDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        {article && item && (
          <>
            <DialogHeader>
              <DialogTitle>{article.name}</DialogTitle>
              <DialogDescription>
                {item.aisle} · {article.sku} · {article.category}
              </DialogDescription>
            </DialogHeader>

            {/* Aisle overview — the elevation of the target aisle with the bay highlighted */}
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {item.aisle} — aisle overview
              </p>
              <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/5">
                <PlanogramGraphic
                  seed={`${article.articleId}-${item.aisle}`}
                  width={1200}
                  height={800}
                  highlightBay={parseBayNumber(item.bay)}
                  className="h-auto w-full"
                />
              </div>
            </div>

            {/* Shelf close-up — exact slot on the target shelf */}
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Exact shelf placement
              </p>
              <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/5">
                <ShelfGraphic productName={article.name} unitsPerRow={item.unitsPerRow} className="h-auto w-full" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <DetailRow icon={<Compass className="size-4" />} label="Aisle" value={item.aisle} />
              <DetailRow icon={<Layers className="size-4" />} label="Bay" value={item.bay} />
              <DetailRow icon={<Rows3 className="size-4" />} label="Shelf" value={item.shelf} />
              <DetailRow icon={<Move3d className="size-4" />} label="Facing" value={item.facing} />
            </div>

            <div className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3">
              <p className="text-sm leading-relaxed text-foreground">{item.instructions}</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ShelfDetailModal
