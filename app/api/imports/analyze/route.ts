import { NextResponse } from "next/server"
import { analyzeFloorPlanWithOpenAI } from "@/lib/services/floor-plan-analyzer"

interface AnalyzeBody {
  imageBase64?: unknown
  mimeType?: unknown
  storeId?: unknown
}

const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg"])

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeBody

    const imageBase64 = typeof body.imageBase64 === "string" ? body.imageBase64.trim() : ""
    const mimeType = typeof body.mimeType === "string" ? body.mimeType.trim() : ""
    const storeId = typeof body.storeId === "string" ? body.storeId.trim() : ""

    if (!imageBase64 || !ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        {
          error: "Invalid request body. imageBase64 is required and mimeType must be image/png or image/jpeg",
        },
        { status: 400 },
      )
    }

    if (!storeId) {
      return NextResponse.json({ error: "storeId is required" }, { status: 400 })
    }

    const result = await analyzeFloorPlanWithOpenAI({
      imageBase64,
      mimeType: mimeType as "image/png" | "image/jpeg",
      storeId,
    })

    const needsReview = result.fixtures.some(
      (fixture) => typeof fixture.confidence === "number" && fixture.confidence < 0.75,
    )

    return NextResponse.json({
      importId: crypto.randomUUID(),
      storeId,
      needsReview,
      fixtures: result.fixtures,
    })
  } catch (error) {
    const maybeRaw =
      typeof error === "object" &&
      error !== null &&
      "raw" in error &&
      typeof (error as { raw?: unknown }).raw === "string"
        ? (error as { raw: string }).raw
        : undefined

    if (error instanceof Error && error.message === "Model returned unparseable response") {
      return NextResponse.json({ error: error.message, raw: maybeRaw ?? "" }, { status: 500 })
    }

    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Failed to analyze floor plan", details: message }, { status: 500 })
  }
}
