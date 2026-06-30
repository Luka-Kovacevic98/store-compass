// Zoomed-in "shelf close-up" diagram for the placement modal. Highlights the
// exact slot where the target product belongs among neighbouring facings.

interface ShelfGraphicProps {
  productName: string
  unitsPerRow: number
  className?: string
}

function ShelfGraphic({ productName, unitsPerRow, className }: ShelfGraphicProps) {
  const width = 600
  const height = 360
  const cols = Math.max(4, Math.min(unitsPerRow, 8))
  const targetIndex = Math.floor(cols / 2)
  const margin = 30
  const gap = 12
  const slotWidth = (width - margin * 2 - gap * (cols - 1)) / cols
  const shelfY = 90
  const shelfHeight = 200

  const slots = []
  for (let i = 0; i < cols; i++) {
    const x = margin + i * (slotWidth + gap)
    const isTarget = i === targetIndex
    slots.push(
      <g key={i}>
        <rect
          x={x}
          y={shelfY}
          width={slotWidth}
          height={shelfHeight}
          rx={8}
          fill={isTarget ? "#22d3ee" : "#334155"}
          opacity={isTarget ? 0.95 : 0.55}
          stroke={isTarget ? "#a5f3fc" : "#475569"}
          strokeWidth={isTarget ? 3 : 1}
        />
        {isTarget && (
          <text
            x={x + slotWidth / 2}
            y={shelfY + shelfHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={13}
            fontWeight={700}
            fill="#06262b"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            HERE
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
      aria-label={`Shelf close-up showing exactly where ${productName} belongs`}
      preserveAspectRatio="xMidYMid meet"
    >
      <rect x={0} y={0} width={width} height={height} fill="#0b1220" />
      <text
        x={margin}
        y={50}
        fontSize={22}
        fontWeight={600}
        fill="#e2e8f0"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        Target shelf
      </text>
      {slots}
      {/* shelf board + price rail */}
      <rect x={margin - 6} y={shelfY + shelfHeight} width={width - margin * 2 + 12} height={10} rx={3} fill="#0f172a" />
      <rect x={margin - 6} y={shelfY + shelfHeight + 12} width={width - margin * 2 + 12} height={16} rx={3} fill="#1e293b" />
      <text
        x={width / 2}
        y={height - 18}
        textAnchor="middle"
        fontSize={13}
        fill="#94a3b8"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {`${unitsPerRow} units per row`}
      </text>
    </svg>
  )
}

export default ShelfGraphic
