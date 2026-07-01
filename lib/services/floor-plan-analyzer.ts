export interface ImportAnalyzeRequest {
  imageBase64: string
  mimeType: "image/png" | "image/jpeg"
  storeId: string
}

export interface ModelFixture {
  id: string
  type: "shelf" | "fridge" | "checkout" | "clothing_rack" | "gondola" | "entrance" | "exit" | "wall" | "register" | "impulse_buy" | "atm"
  xPct: number
  yPct: number
  wPct: number
  hPct: number
  rotation: number
  confidence: number
  label: string
  wall?: "left" | "right" | "top" | "bottom" | "none"
}

interface OpenAIChatCompletionsResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

const FLOOR_PLAN_SYSTEM_PROMPT = `You are a retail store floor plan analyzer. The user will give you a 2D overhead floor plan image. Your job is to detect ALL fixtures and structural elements and return their positions with high spatial accuracy.

CRITICAL RULES:
1. Pay close attention to WHICH WALL each perimeter fixture is attached to.
   - If a fixture is on the LEFT edge of the image → its xPct should be near 0.
   - If a fixture is on the RIGHT edge → its xPct should be near (100 - wPct).
   - If a fixture is on the TOP edge → its yPct should be near 0.
   - If a fixture is on the BOTTOM edge → its yPct should be near (100 - hPct).
   Do NOT move right-wall fixtures to the top row or vice versa.

2. Count repeated fixtures carefully. If you see a row of similar shelves, count them individually and return one entry per shelf with evenly spaced xPct values. Do not merge multiple shelves into one.

3. Use the full coordinate space. The image spans 0-100 on both axes. Fixtures near the center of the image should have xPct and yPct values near 50, not clustered near 0.

4. For perimeter fixtures attached to walls, set their wPct or hPct to reflect their actual shallow depth — typically hPct: 5-10 for top/bottom wall items, wPct: 5-10 for left/right wall items.

Return ONLY a valid JSON object — no explanation, no markdown, no backticks:
{
  'fixtures': [
    {
      'id': 'fix_001',
      'type': 'shelf | fridge | checkout | clothing_rack | gondola | entrance | exit | wall | register | impulse_buy | atm',
      'xPct': 23.5,
      'yPct': 45.0,
      'wPct': 12.0,
      'hPct': 8.0,
      'rotation': 0,
      'confidence': 0.85,
      'label': 'optional visible text label or empty string',
      'wall': 'left | right | top | bottom | none'
    }
  ]
}

The wall field is required for every fixture. Set it to the wall the fixture is attached to, or none for freestanding fixtures like center gondola shelves.`

export async function analyzeFloorPlanWithOpenAI(input: ImportAnalyzeRequest): Promise<{
  fixtures: ModelFixture[]
  raw: string
}> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable")
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: FLOOR_PLAN_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Store ID: ${input.storeId}. Analyze this floor plan image and return JSON only.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${input.mimeType};base64,${input.imageBase64}`,
              },
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`OpenAI API error ${response.status}: ${details.slice(0, 500)}`)
  }

  const payload = (await response.json()) as OpenAIChatCompletionsResponse
  const raw = payload.choices?.[0]?.message?.content?.trim() ?? ""

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw Object.assign(new Error("Model returned unparseable response"), { raw })
  }

  const fixtures = Array.isArray((parsed as { fixtures?: unknown }).fixtures)
    ? ((parsed as { fixtures: ModelFixture[] }).fixtures ?? [])
    : []

  return { fixtures, raw }
}
