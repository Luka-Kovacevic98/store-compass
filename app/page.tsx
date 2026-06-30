"use client"

import { useEffect, useMemo, useState } from "react"
import { Compass } from "lucide-react"
import StoreCombobox from "@/components/store-combobox"
import ArticleCombobox from "@/components/article-combobox"
import PlanogramViewer from "@/components/planogram-viewer"
import ShelfDetailModal from "@/components/shelf-detail-modal"
import StorePlannerEditor, { type PlannerEntry } from "@/components/store-planner-editor"
import { createMockArticle, fetchArticles, fetchPlanogram, fetchStores, saveMockPlanogram } from "@/lib/mock-data"
import type { Article, Planogram, Store } from "@/lib/types"

export default function Page() {
  const [stores, setStores] = useState<Store[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [listsLoading, setListsLoading] = useState(true)

  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  const [planogram, setPlanogram] = useState<Planogram | null>(null)
  const [planogramLoading, setPlanogramLoading] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [plannerOpen, setPlannerOpen] = useState(false)

  // Load the store + article catalogs once (mocked, simulated latency).
  useEffect(() => {
    let active = true
    Promise.all([fetchStores(), fetchArticles()]).then(([s, a]) => {
      if (!active) return
      setStores(s)
      setArticles(a)
      setListsLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  // Load the planogram whenever the selected store changes.
  useEffect(() => {
    if (!selectedStore) {
      setPlanogram(null)
      return
    }
    let active = true
    setPlanogramLoading(true)
    setPlanogram(null)
    fetchPlanogram(selectedStore._id).then((p) => {
      if (!active) return
      setPlanogram(p)
      setPlanogramLoading(false)
    })
    return () => {
      active = false
    }
  }, [selectedStore])

  const matchedItem = useMemo(() => {
    if (!planogram || !selectedArticle) return null
    return planogram.items.find((item) => item.articleId === selectedArticle.articleId) ?? null
  }, [planogram, selectedArticle])

  async function handleSavePlanner(payload: { planogram: Planogram; entries: PlannerEntry[] }) {
    const savedItems = await Promise.all(
      payload.entries.map(async (entry, index) => {
        const article = await createMockArticle({
          name: entry.details.articleName,
          sku: entry.details.sku,
          category: entry.details.category,
        })

        return {
          ...payload.planogram.items[index],
          articleId: article.articleId,
          hotspot: entry.hotspot,
        }
      }),
    )

    const savedPlanogram = await saveMockPlanogram({ ...payload.planogram, items: savedItems })
    const nextArticles = await fetchArticles()

    setArticles(nextArticles)
    setPlanogram(savedPlanogram)

    if (selectedArticle) {
      const maybeCurrent = nextArticles.find((a) => a.articleId === selectedArticle.articleId) ?? null
      setSelectedArticle(maybeCurrent)
    }
  }

  return (
    <main className="min-h-dvh bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Header */}
        <header className="mb-6 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-accent shadow-lg backdrop-blur-md">
            <Compass className="size-6" />
          </span>
          <div>
            <h1 className="text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Store Compass
            </h1>
            <p className="text-sm text-muted-foreground">Find exactly where a product belongs on the shelf.</p>
          </div>
        </header>

        {/* Top bar: searchable comboboxes */}
        <div className="mb-6 rounded-2xl border border-white/20 bg-white/10 p-3 shadow-xl backdrop-blur-lg sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StoreCombobox
              stores={stores}
              selectedId={selectedStore?._id ?? null}
              loading={listsLoading}
              onSelect={(store) => {
                setSelectedStore(store)
              }}
            />
            <ArticleCombobox
              articles={articles}
              selectedId={selectedArticle?.articleId ?? null}
              loading={listsLoading}
              disabled={!selectedStore}
              onSelect={(article) => {
                setSelectedArticle(article)
              }}
            />
          </div>
          {!selectedStore && !listsLoading && (
            <p className="mt-2 px-1 text-xs text-muted-foreground">
              Tip: pick a store first, then search for the article you need to place.
            </p>
          )}
        </div>

        {/* Planogram panel */}
        <PlanogramViewer
          store={selectedStore}
          planogram={planogram}
          loading={planogramLoading}
          article={selectedArticle}
          matchedItem={matchedItem}
          onHotspotClick={() => setModalOpen(true)}
          onCreatePlanner={() => setPlannerOpen(true)}
          onEditPlanner={() => setPlannerOpen(true)}
        />
      </div>

      <ShelfDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        article={selectedArticle}
        item={matchedItem}
      />

      <StorePlannerEditor
        open={plannerOpen}
        store={selectedStore}
        onOpenChange={setPlannerOpen}
        onSave={handleSavePlanner}
        initialPlanogram={planogram}
        allArticles={articles}
      />
    </main>
  )
}
