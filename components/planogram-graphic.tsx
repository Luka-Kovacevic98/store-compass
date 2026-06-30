// Deterministic procedural planogram diagram rendered as an SVG.
// Draws retail gondola bays with shelves and colored product facings so the
// layout is crisp at any zoom level and requires no external image network call.

interface PlanogramGraphicProps {
  seed: string
  width: number
  height: number
  className?: string
  // 1-based index of the bay to highlight as the target (optional).
  highlightBay?: number
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

const SLOT_COLORS = ["#38bdf8", "#22d3ee", "#818cf8", "#34d399", "#fbbf24", "#f472b6", "#a3e635"]

function PlanogramGraphic({ seed, width, height, className, highlightBay }: PlanogramGraphicProps) {
  const rng = makeRng(seed)
  const bays = 4
  const bayGap = 28
  const margin = 40
  const bayWidth = (width - margin * 2 - bayGap * (bays - 1)) / bays
  const topOffset = 70
  const bottomOffset = 60
  const usableHeight = height - topOffset - bottomOffset
  const shelvesPerBay = 5
  const shelfGap = usableHeight / shelvesPerBay

  const bayEls = []
  for (let b = 0; b < bays; b++) {
    const bx = margin + b * (bayWidth + bayGap)
    const shelves = []
    for (let s = 0; s < shelvesPerBay; s++) {
      const sy = topOffset + s * shelfGap
      const shelfHeight = shelfGap - 10
      const slots = 3 + Math.floor(rng() * 3)
      const slotGap = 6
      const slotWidth = (bayWidth - slotGap * (slots + 1)) / slots
      const products = []
      for (let p = 0; p < slots; p++) {
        const px = bx + slotGap + p * (slotWidth + slotGap)
        const fill = SLOT_COLORS[Math.floor(rng() * SLOT_COLORS.length)]
        const ph = shelfHeight * (0.55 + rng() * 0.4)
        products.push(
          <rect
            key={`p-${b}-${s}-${p}`}
            x={px}
            y={sy + shelfHeight - ph}
            width={slotWidth}
            height={ph}
            rx={4}
            fill={fill}
            opacity={0.85}
          />,
        )
      }
      shelves.push(
        <g key={`s-${b}-${s}`}>
          {products}
          {/* shelf board */}
          <rect x={bx} y={sy + shelfHeight} width={bayWidth} height={6} rx={2} fill="#0f172a" opacity={0.55} />
        </g>,
      )
    }
    const isTargetBay = highlightBay === b + 1
    bayEls.push(
      <g key={`bay-${b}`}>
        {/* bay frame */}
        <rect
          x={bx - 6}
          y={topOffset - 14}
          width={bayWidth + 12}
          height={usableHeight + 22}
          rx={10}
          fill={isTargetBay ? "#0e3a44" : "#1e293b"}
          opacity={isTargetBay ? 0.7 : 0.35}
          stroke={isTargetBay ? "#22d3ee" : "#475569"}
          strokeWidth={isTargetBay ? 3 : 1}
          strokeOpacity={isTargetBay ? 0.95 : 0.4}
        />
        {shelves}
        <text
          x={bx + bayWidth / 2}
          y={height - bottomOffset + 32}
          textAnchor="middle"
          fontSize={20}
          fontWeight={isTargetBay ? 700 : 400}
          fill={isTargetBay ? "#67e8f9" : "#cbd5e1"}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {isTargetBay ? `Bay ${b + 1} ·` : `Bay ${b + 1}`}
        </text>
        {isTargetBay && (
          <text
            x={bx + bayWidth / 2}
            y={topOffset - 22}
            textAnchor="middle"
            fontSize={16}
            fontWeight={700}
            fill="#22d3ee"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            ▼ TARGET
          </text>
        )}
      </g>,
    )
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label="Store planogram layout showing shelving bays and product facings"
      preserveAspectRatio="xMidYMid meet"
    >
      <rect x={0} y={0} width={width} height={height} fill="#0b1220" />
      {/* floor strip */}
      <rect x={0} y={height - 24} width={width} height={24} fill="#111c2e" />
      <text
        x={margin}
        y={42}
        fontSize={26}
        fontWeight={600}
        fill="#e2e8f0"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        Aisle overview
      </text>
      {bayEls}
    </svg>
  )
}

export default PlanogramGraphic
