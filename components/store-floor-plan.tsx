// Deterministic top-down store floor plan rendered as an SVG.
// Draws the store footprint, entrance, checkout lanes, perimeter departments
// and a row of numbered aisle gondolas. This is the overhead map on which the
// article location marker is pinned. Crisp at any zoom, no network image needed.

interface StoreFloorPlanProps {
  seed: string
  width: number
  height: number
  className?: string
  showWalls?: boolean
  fixtures?: Array<{
    id: string
    type: "shelf" | "fridge" | "checkout" | "entrance"
    label: string
    xPct: number
    yPct: number
    wPct: number
    hPct: number
    rotationDeg: number
  }>
}

type OpeningSide = "top" | "right" | "bottom" | "left"

interface WallOpening {
  side: OpeningSide
  start: number
  size: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getEntranceOpenings(
  fixtures: NonNullable<StoreFloorPlanProps["fixtures"]>,
  width: number,
  height: number,
  wallInset: number,
): WallOpening[] {
  const entrances = fixtures.filter((f) => f.type === "entrance")

  return entrances.map((entrance) => {
    const cx = (entrance.xPct / 100) * width + ((entrance.wPct / 100) * width) / 2
    const cy = (entrance.yPct / 100) * height + ((entrance.hPct / 100) * height) / 2

    const leftEdge = wallInset
    const rightEdge = width - wallInset
    const topEdge = wallInset
    const bottomEdge = height - wallInset

    const distances: Record<OpeningSide, number> = {
      top: Math.abs(cy - topEdge),
      right: Math.abs(rightEdge - cx),
      bottom: Math.abs(bottomEdge - cy),
      left: Math.abs(cx - leftEdge),
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
      const size = clamp((entrance.wPct / 100) * width * 0.95, width * 0.03, width * 0.14)
      const start = clamp(cx - size / 2, leftEdge + 8, rightEdge - 8 - size)
      return { side, start, size }
    }

    const size = clamp((entrance.hPct / 100) * height * 0.95, height * 0.03, height * 0.14)
    const start = clamp(cy - size / 2, topEdge + 8, bottomEdge - 8 - size)
    return { side, start, size }
  })
}

// Tiny deterministic PRNG so each store renders a stable, unique layout.
function makeRng(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const DEPARTMENTS = ["Produce", "Bakery", "Dairy", "Frozen", "Deli", "Beverages", "Household"]

function StoreFloorPlan({ seed, width, height, className, fixtures, showWalls = true }: StoreFloorPlanProps) {
  if (fixtures && fixtures.length > 0) {
    const wallInset = 30
    const openings = getEntranceOpenings(fixtures, width, height, wallInset)
    const fixtureWithoutEntrances = fixtures.filter((fixture) => fixture.type !== "entrance")

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={className}
        role="img"
        aria-label="Custom store floor plan showing manually placed fixtures"
        preserveAspectRatio="xMidYMid meet"
      >
        <rect x={0} y={0} width={width} height={height} fill="#0b1220" />
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#94a3b8" strokeOpacity="0.2" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x={0} y={0} width={width} height={height} fill="url(#grid)" opacity={0.45} />

        {showWalls && (
          <>
            <rect
              x={wallInset}
              y={wallInset}
              width={width - wallInset * 2}
              height={height - wallInset * 2}
              rx={16}
              fill="#0d1729"
              fill="none"
              stroke="#475569"
              strokeWidth={3}
              strokeOpacity={0.7}
            />
            <rect
              x={wallInset + 2}
              y={wallInset + 2}
              width={width - wallInset * 2 - 4}
              height={height - wallInset * 2 - 4}
              rx={14}
              fill="none"
              stroke="#64748b"
              strokeWidth={1}
              strokeOpacity={0.35}
              strokeDasharray="3 3"
            />
            {openings.map((opening, index) => {
              if (opening.side === "top") {
                return <rect key={`opening-${index}`} x={opening.start} y={wallInset - 2} width={opening.size} height={5} fill="#0b1220" />
              }
              if (opening.side === "bottom") {
                return (
                  <rect
                    key={`opening-${index}`}
                    x={opening.start}
                    y={height - wallInset - 3}
                    width={opening.size}
                    height={5}
                    fill="#0b1220"
                  />
                )
              }
              if (opening.side === "left") {
                return <rect key={`opening-${index}`} x={wallInset - 2} y={opening.start} width={5} height={opening.size} fill="#0b1220" />
              }
              return (
                <rect
                  key={`opening-${index}`}
                  x={width - wallInset - 3}
                  y={opening.start}
                  width={5}
                  height={opening.size}
                  fill="#0b1220"
                />
              )
            })}

            {openings.map((opening, index) => {
              if (opening.side === "top") {
                return (
                  <text
                    key={`opening-label-${index}`}
                    x={opening.start + opening.size / 2}
                    y={wallInset - 10}
                    textAnchor="middle"
                    fontSize={15}
                    fontWeight={600}
                    fill="#34d399"
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                  >
                    Entrance
                  </text>
                )
              }
              if (opening.side === "bottom") {
                return (
                  <text
                    key={`opening-label-${index}`}
                    x={opening.start + opening.size / 2}
                    y={height - wallInset - 10}
                    textAnchor="middle"
                    fontSize={15}
                    fontWeight={600}
                    fill="#34d399"
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                  >
                    Entrance
                  </text>
                )
              }
              if (opening.side === "left") {
                return (
                  <text
                    key={`opening-label-${index}`}
                    x={wallInset + 12}
                    y={opening.start + opening.size / 2}
                    textAnchor="start"
                    dominantBaseline="middle"
                    fontSize={15}
                    fontWeight={600}
                    fill="#34d399"
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                  >
                    Entrance
                  </text>
                )
              }
              return (
                <text
                  key={`opening-label-${index}`}
                  x={width - wallInset - 12}
                  y={opening.start + opening.size / 2}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={15}
                  fontWeight={600}
                  fill="#34d399"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  Entrance
                </text>
              )
            })}
          </>
        )}

        <text
          x={54}
          y={74}
          fontSize={26}
          fontWeight={600}
          fill="#e2e8f0"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          Store floor plan
        </text>

        {fixtureWithoutEntrances.map((fixture) => {
          const x = (fixture.xPct / 100) * width
          const y = (fixture.yPct / 100) * height
          const w = (fixture.wPct / 100) * width
          const h = (fixture.hPct / 100) * height

          const palette =
            fixture.type === "shelf"
              ? { fill: "#1e293b", stroke: "#475569" }
              : fixture.type === "fridge"
                ? { fill: "#243449", stroke: "#5b718a" }
                : { fill: "#334155", stroke: "#64748b" }

          return (
            <g key={fixture.id} transform={`translate(${x + w / 2} ${y + h / 2}) rotate(${fixture.rotationDeg})`}>
              <rect
                x={-w / 2}
                y={-h / 2}
                width={w}
                height={h}
                rx={10}
                fill={palette.fill}
                fillOpacity={0.55}
                stroke={palette.stroke}
                strokeWidth={2}
              />
              <text
                x={0}
                y={0}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={12}
                fontWeight={700}
                fill="#f8fafc"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {fixture.label}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  const rng = makeRng(seed)

  const wall = 30
  const innerX = wall
  const innerY = wall
  const innerW = width - wall * 2
  const innerH = height - wall * 2

  // Aisle gondolas live in the central zone.
  const aisleCount = 5 + Math.floor(rng() * 2) // 5–6 aisles
  const zoneTop = innerY + 110
  const zoneBottom = height - wall - 120
  const zoneLeft = innerX + 150
  const zoneRight = width - wall - 60
  const zoneW = zoneRight - zoneLeft
  const gondolaW = (zoneW / aisleCount) * 0.5
  const aisleStep = zoneW / aisleCount

  const aisles = []
  for (let i = 0; i < aisleCount; i++) {
    const gx = zoneLeft + i * aisleStep + (aisleStep - gondolaW) / 2
    aisles.push(
      <g key={`aisle-${i}`}>
        <rect
          x={gx}
          y={zoneTop}
          width={gondolaW}
          height={zoneBottom - zoneTop}
          rx={6}
          fill="#1e293b"
          stroke="#475569"
          strokeOpacity={0.5}
        />
        <text
          x={gx + gondolaW / 2}
          y={zoneTop - 14}
          textAnchor="middle"
          fontSize={20}
          fontWeight={600}
          fill="#cbd5e1"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {i + 1}
        </text>
      </g>,
    )
  }

  // Perimeter departments along the left wall (kept above the checkout zone).
  const leftZoneTop = innerY + 80
  const leftZoneBottom = height - wall - 130
  const leftDeptCount = 3
  const leftDeptH = (leftZoneBottom - leftZoneTop) / leftDeptCount
  const leftDepts = []
  for (let i = 0; i < leftDeptCount; i++) {
    const dy = leftZoneTop + i * leftDeptH
    leftDepts.push(
      <g key={`ld-${i}`}>
        <rect
          x={innerX + 20}
          y={dy}
          width={90}
          height={leftDeptH - 16}
          rx={6}
          fill="#0f2436"
          stroke="#1e4a63"
          strokeOpacity={0.6}
        />
        <text
          x={innerX + 65}
          y={dy + (leftDeptH - 16) / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={14}
          fill="#7dd3fc"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {DEPARTMENTS[Math.floor(rng() * DEPARTMENTS.length)]}
        </text>
      </g>,
    )
  }

  // Checkout lanes near the entrance (bottom-left).
  const lanes = []
  for (let i = 0; i < 4; i++) {
    const lx = innerX + 40 + i * 70
    lanes.push(
      <rect
        key={`lane-${i}`}
        x={lx}
        y={height - wall - 80}
        width={20}
        height={50}
        rx={4}
        fill="#334155"
        stroke="#64748b"
        strokeOpacity={0.5}
      />,
    )
  }

  const entranceX = width - wall - 220

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label="Top-down store floor plan showing aisles, departments, checkouts and the entrance"
      preserveAspectRatio="xMidYMid meet"
    >
      <rect x={0} y={0} width={width} height={height} fill="#0b1220" />

      {/* Store footprint / outer wall */}
      <rect
        x={innerX}
        y={innerY}
        width={innerW}
        height={innerH}
        rx={16}
        fill="#0d1729"
        stroke="#475569"
        strokeWidth={3}
        strokeOpacity={0.7}
      />

      {/* Entrance gap on the bottom wall */}
      <rect x={entranceX} y={height - wall - 6} width={150} height={12} fill="#0b1220" />
      <text
        x={entranceX + 75}
        y={height - wall - 18}
        textAnchor="middle"
        fontSize={15}
        fontWeight={600}
        fill="#34d399"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        Entrance
      </text>

      <text
        x={innerX + 24}
        y={innerY + 44}
        fontSize={26}
        fontWeight={600}
        fill="#e2e8f0"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        Store floor plan
      </text>

      {leftDepts}
      {aisles}
      {lanes}
      <text
        x={innerX + 40}
        y={height - wall - 92}
        fontSize={13}
        fill="#94a3b8"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        Checkouts
      </text>
    </svg>
  )
}

export default StoreFloorPlan
