import { NextResponse } from "next/server"

type OrgUnit = Record<string, unknown>

interface KeephubResponse {
  total?: number
  limit?: number
  skip?: number
  data?: OrgUnit[]
}

async function fetchOrgUnitsPage(token: string, skip: number, limit: number): Promise<KeephubResponse> {
  // Range filter for the namepath prefix ",Keephub,Stores,".
  // This pushes filtering to Keephub and avoids returning unrelated orgunits.
  const params = new URLSearchParams({
    "$sort": "namepath",
    allFields: "false",
    "$skip": String(skip),
    "$limit": String(limit),
    "namepath[$gte]": ",Keephub,Stores,",
    "namepath[$lt]": ",Keephub,Storet",
  })

  const response = await fetch(`https://dev.api.keephub.io/orgchart?${params.toString()}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      "accept-language": "en-US,en;q=0.9",
      authorization: `Bearer ${token}`,
      "if-none-match": 'W/"d41d-Or3QrUsPZUumxxXafkziBVWvET4"',
      lang: "en",
      origin: "https://dev.keephub.io",
      priority: "u=1, i",
      "sec-ch-ua": '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Linux"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Keephub API error ${response.status}: ${body.slice(0, 300)}`)
  }

  return (await response.json()) as KeephubResponse
}

export async function GET() {
  try {
    const token = process.env.TOKEN
    if (!token) {
      return NextResponse.json({ error: "Missing TOKEN environment variable" }, { status: 500 })
    }

    const limit = 200
    let skip = 0
    let total = Number.POSITIVE_INFINITY
    const data: OrgUnit[] = []

    while (skip < total) {
      const page = await fetchOrgUnitsPage(token, skip, limit)
      const rows = Array.isArray(page.data) ? page.data : []
      data.push(...rows)

      total = typeof page.total === "number" ? page.total : rows.length
      const pageLimit = typeof page.limit === "number" && page.limit > 0 ? page.limit : limit
      skip += pageLimit

      if (rows.length === 0) break
    }

    return NextResponse.json({ total: data.length, limit, skip: 0, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Failed to load orgunits", details: message }, { status: 502 })
  }
}
