// Data shapes mirror the real internal "Keephub" records so the mock layer can
// later be swapped for live API calls without changing component logic.

export interface Store {
  _id: string
  name: string
  externalRef: string
  contactInformation: {
    city: string
    country: string
  }
}

export interface Article {
  articleId: string
  name: string
  sku: string
  category: string
}

export interface Hotspot {
  xPct: number
  yPct: number
  wPct: number
  hPct: number
}

export interface PlanogramItem {
  articleId: string
  hotspot: Hotspot
  shelfImageUrl: string
  instructions: string
  aisle: string
  bay: string
  shelf: string
  facing: string
  unitsPerRow: number
}

export interface Planogram {
  storeRef: string
  imageUrl: string
  imageWidth: number
  imageHeight: number
  items: PlanogramItem[]
}
