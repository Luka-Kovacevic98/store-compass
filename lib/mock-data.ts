import type { Store, Article, Planogram } from "./types"

const STORAGE_KEY = "store-compass-mock-data-v1"

// ---------------------------------------------------------------------------
// stores.json — shape mirrors a real internal "Keephub" store record.
// Field names are kept exact so they can later be populated from a real API.
// ---------------------------------------------------------------------------
export const stores: Store[] = [
  {
    _id: "test0039",
    name: "Madrid - 3004",
    externalRef: "3004",
    contactInformation: { city: "Madrid", country: "Spain" },
  },
  {
    _id: "test0040",
    name: "Berlin - 1188",
    externalRef: "1188",
    contactInformation: { city: "Berlin", country: "Germany" },
  },
  {
    _id: "test0041",
    name: "Paris - 2207",
    externalRef: "2207",
    contactInformation: { city: "Paris", country: "France" },
  },
  {
    _id: "test0042",
    name: "Amsterdam - 0901",
    externalRef: "0901",
    contactInformation: { city: "Amsterdam", country: "Netherlands" },
  },
  {
    _id: "test0043",
    name: "Lisbon - 4456",
    externalRef: "4456",
    contactInformation: { city: "Lisbon", country: "Portugal" },
  },
]

// ---------------------------------------------------------------------------
// articles.json — mocked product catalog.
// ---------------------------------------------------------------------------
export const articles: Article[] = [
  { articleId: "art_0001", name: "Coca-Cola 1.5L", sku: "COKE-150", category: "Beverages" },
  { articleId: "art_0002", name: "Tropicana Orange Juice 1L", sku: "TROP-100", category: "Beverages" },
  { articleId: "art_0003", name: "Lay's Classic Chips 175g", sku: "LAYS-175", category: "Snacks" },
  { articleId: "art_0004", name: "Oreo Original 154g", sku: "OREO-154", category: "Snacks" },
  { articleId: "art_0005", name: "Barilla Spaghetti 500g", sku: "BARI-500", category: "Pantry" },
  { articleId: "art_0006", name: "Heinz Tomato Ketchup 570g", sku: "HEINZ-570", category: "Pantry" },
  { articleId: "art_0007", name: "Nutella Hazelnut Spread 400g", sku: "NUT-400", category: "Pantry" },
  { articleId: "art_0008", name: "Colgate Total Toothpaste 75ml", sku: "COLG-075", category: "Personal Care" },
  { articleId: "art_0009", name: "Dove Body Wash 500ml", sku: "DOVE-500", category: "Personal Care" },
  { articleId: "art_0010", name: "Pampers Baby Wipes 80ct", sku: "PAMP-080", category: "Baby" },
]

// ---------------------------------------------------------------------------
// planograms.json — the join between stores and articles (one record per store).
// hotspot coords are percentage-based so they stay aligned at any image size.
// ---------------------------------------------------------------------------
export const planograms: Planogram[] = [
  {
    storeRef: "test0039",
    imageUrl: "/planograms/test0039.svg",
    imageWidth: 1200,
    imageHeight: 800,
    items: [
      {
        articleId: "art_0001",
        hotspot: { xPct: 23.5, yPct: 61.2, wPct: 7, hPct: 12 },
        shelfImageUrl: "/shelves/art_0001.svg",
        instructions:
          "Aisle 3, bay 2, shelf 3 from the bottom. Face label outward, 6 units per row, restock to full depth.",
        aisle: "Aisle 3",
        bay: "Bay 2",
        shelf: "Shelf 3 (from bottom)",
        facing: "Label outward",
        unitsPerRow: 6,
      },
      {
        articleId: "art_0003",
        hotspot: { xPct: 62, yPct: 30, wPct: 7, hPct: 12 },
        shelfImageUrl: "/shelves/art_0003.svg",
        instructions: "Aisle 5, bay 1, shelf 4 from the bottom. Hang-strip optional, 4 units per row.",
        aisle: "Aisle 5",
        bay: "Bay 1",
        shelf: "Shelf 4 (from bottom)",
        facing: "Front face up",
        unitsPerRow: 4,
      },
      {
        articleId: "art_0006",
        hotspot: { xPct: 78, yPct: 72, wPct: 7, hPct: 12 },
        shelfImageUrl: "/shelves/art_0006.svg",
        instructions: "Aisle 2, bay 3, shelf 1 from the bottom. Cap-out facing, 5 units per row.",
        aisle: "Aisle 2",
        bay: "Bay 3",
        shelf: "Shelf 1 (from bottom)",
        facing: "Cap-out",
        unitsPerRow: 5,
      },
    ],
  },
  {
    storeRef: "test0040",
    imageUrl: "/planograms/test0040.svg",
    imageWidth: 1200,
    imageHeight: 800,
    items: [
      {
        articleId: "art_0002",
        hotspot: { xPct: 15, yPct: 28, wPct: 7, hPct: 12 },
        shelfImageUrl: "/shelves/art_0002.svg",
        instructions: "Aisle 1, bay 1, shelf 4 from the bottom. Chilled section, label outward, 5 units per row.",
        aisle: "Aisle 1",
        bay: "Bay 1",
        shelf: "Shelf 4 (from bottom)",
        facing: "Label outward",
        unitsPerRow: 5,
      },
      {
        articleId: "art_0004",
        hotspot: { xPct: 48, yPct: 55, wPct: 7, hPct: 12 },
        shelfImageUrl: "/shelves/art_0004.svg",
        instructions: "Aisle 5, bay 2, shelf 2 from the bottom. Stack two-high, 8 units per row.",
        aisle: "Aisle 5",
        bay: "Bay 2",
        shelf: "Shelf 2 (from bottom)",
        facing: "Front face up",
        unitsPerRow: 8,
      },
      {
        articleId: "art_0008",
        hotspot: { xPct: 83, yPct: 40, wPct: 7, hPct: 12 },
        shelfImageUrl: "/shelves/art_0008.svg",
        instructions: "Aisle 7, bay 1, shelf 3 from the bottom. Peg-hook display, 10 units per row.",
        aisle: "Aisle 7",
        bay: "Bay 1",
        shelf: "Shelf 3 (from bottom)",
        facing: "Peg-hook",
        unitsPerRow: 10,
      },
    ],
  },
  {
    storeRef: "test0041",
    imageUrl: "/planograms/test0041.svg",
    imageWidth: 1200,
    imageHeight: 800,
    items: [
      {
        articleId: "art_0005",
        hotspot: { xPct: 35, yPct: 65, wPct: 7, hPct: 12 },
        shelfImageUrl: "/shelves/art_0005.svg",
        instructions: "Aisle 4, bay 2, shelf 2 from the bottom. Label outward, 7 units per row.",
        aisle: "Aisle 4",
        bay: "Bay 2",
        shelf: "Shelf 2 (from bottom)",
        facing: "Label outward",
        unitsPerRow: 7,
      },
      {
        articleId: "art_0007",
        hotspot: { xPct: 68, yPct: 35, wPct: 7, hPct: 12 },
        shelfImageUrl: "/shelves/art_0007.svg",
        instructions: "Aisle 4, bay 3, shelf 4 from the bottom. Eye-level placement, 6 units per row.",
        aisle: "Aisle 4",
        bay: "Bay 3",
        shelf: "Shelf 4 (from bottom)",
        facing: "Label outward",
        unitsPerRow: 6,
      },
      {
        articleId: "art_0009",
        hotspot: { xPct: 88, yPct: 68, wPct: 7, hPct: 12 },
        shelfImageUrl: "/shelves/art_0009.svg",
        instructions: "Aisle 8, bay 1, shelf 1 from the bottom. Cap-out, 4 units per row.",
        aisle: "Aisle 8",
        bay: "Bay 1",
        shelf: "Shelf 1 (from bottom)",
        facing: "Cap-out",
        unitsPerRow: 4,
      },
    ],
  },
  {
    storeRef: "test0042",
    imageUrl: "/planograms/test0042.svg",
    imageWidth: 1200,
    imageHeight: 800,
    items: [
      {
        articleId: "art_0001",
        hotspot: { xPct: 20, yPct: 40, wPct: 7, hPct: 12 },
        shelfImageUrl: "/shelves/art_0001.svg",
        instructions: "Aisle 2, bay 1, shelf 3 from the bottom. Label outward, 6 units per row.",
        aisle: "Aisle 2",
        bay: "Bay 1",
        shelf: "Shelf 3 (from bottom)",
        facing: "Label outward",
        unitsPerRow: 6,
      },
      {
        articleId: "art_0010",
        hotspot: { xPct: 55, yPct: 70, wPct: 7, hPct: 12 },
        shelfImageUrl: "/shelves/art_0010.svg",
        instructions: "Aisle 9, bay 2, shelf 2 from the bottom. Soft-pack stacked, 5 units per row.",
        aisle: "Aisle 9",
        bay: "Bay 2",
        shelf: "Shelf 2 (from bottom)",
        facing: "Front face up",
        unitsPerRow: 5,
      },
    ],
  },
  // Lisbon (test0043) intentionally has NO planogram to exercise the empty state.
]

let mutableArticles: Article[] = [...articles]
let mutablePlanograms: Planogram[] = [...planograms]
let storageLoaded = false

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

function loadFromStorage() {
  if (storageLoaded || !canUseStorage()) return
  storageLoaded = true

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    const parsed = JSON.parse(raw) as {
      articles?: Article[]
      planograms?: Planogram[]
    }

    if (Array.isArray(parsed.articles)) {
      mutableArticles = parsed.articles
    }
    if (Array.isArray(parsed.planograms)) {
      mutablePlanograms = parsed.planograms
    }
  } catch {
    // Ignore malformed local storage and keep default seed data.
  }
}

function persistToStorage() {
  if (!canUseStorage()) return
  const payload = JSON.stringify({ articles: mutableArticles, planograms: mutablePlanograms })
  window.localStorage.setItem(STORAGE_KEY, payload)
}

function nextArticleId() {
  const base = mutableArticles.length + 1
  return `art_${String(base).padStart(4, "0")}`
}

// ---------------------------------------------------------------------------
// Async "fetch" functions. Swap the bodies for real API calls later — the
// signatures and return shapes can stay the same.
// ---------------------------------------------------------------------------
const NETWORK_DELAY = 650

function delay<T>(value: T, ms = NETWORK_DELAY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export function fetchStores(): Promise<Store[]> {
  return delay(stores)
}

export function fetchArticles(): Promise<Article[]> {
  loadFromStorage()
  return delay(mutableArticles)
}

export function fetchPlanogram(storeId: string): Promise<Planogram | null> {
  loadFromStorage()
  const match = mutablePlanograms.find((p) => p.storeRef === storeId) ?? null
  return delay(match)
}

export function createMockArticle(input: Omit<Article, "articleId">): Promise<Article> {
  loadFromStorage()
  const existing = mutableArticles.find((a) => a.sku.toLowerCase() === input.sku.toLowerCase())
  if (existing) {
    return delay(existing)
  }

  const created: Article = {
    articleId: nextArticleId(),
    name: input.name,
    sku: input.sku,
    category: input.category,
  }
  mutableArticles = [...mutableArticles, created]
  persistToStorage()
  return delay(created)
}

export function saveMockPlanogram(nextPlanogram: Planogram): Promise<Planogram> {
  loadFromStorage()
  mutablePlanograms = [
    ...mutablePlanograms.filter((p) => p.storeRef !== nextPlanogram.storeRef),
    nextPlanogram,
  ]
  persistToStorage()
  return delay(nextPlanogram)
}
