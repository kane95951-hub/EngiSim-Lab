import { axisFor, linearScale } from '../../../utils/scale'
import type { Sample } from '../rock-eval/samples'

const WIDTH = 640
const HEIGHT = 420
const MARGIN = { left: 64, right: 20, top: 16, bottom: 52 }
const RADIUS = 6

interface ScatterChartProps {
  samples: Sample[]
  selected: ReadonlySet<string>
  onToggle: (key: string) => void
  labelOf: (sample: Sample) => string
  xTitle: string
  yTitle: string
  ariaLabel: string
  pointLabel: (sample: Sample) => string
}

// Nuage de points HI–OI en SVG : axes gradués, points focalisables au clavier, sélection au clic ou à Entrée/Espace.
export default function ScatterChart({
  samples,
  selected,
  onToggle,
  labelOf,
  xTitle,
  yTitle,
  ariaLabel,
  pointLabel,
}: ScatterChartProps) {
  const plotWidth = WIDTH - MARGIN.left - MARGIN.right
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom
  const xAxis = axisFor(samples.map((s) => s.oi))
  const yAxis = axisFor(samples.map((s) => s.hi))
  const x = linearScale(xAxis.upper, MARGIN.left, MARGIN.left + plotWidth)
  const y = linearScale(yAxis.upper, MARGIN.top + plotHeight, MARGIN.top)

  return (
    <svg
      className="vk-chart"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="group"
      aria-label={ariaLabel}
    >
      {yAxis.ticks.map((tick) => (
        <g key={`y-${tick}`}>
          <line className="vk-grid" x1={MARGIN.left} x2={MARGIN.left + plotWidth} y1={y(tick)} y2={y(tick)} />
          <text className="vk-tick" x={MARGIN.left - 8} y={y(tick) + 4} textAnchor="end">
            {tick}
          </text>
        </g>
      ))}
      {xAxis.ticks.map((tick) => (
        <g key={`x-${tick}`}>
          <line className="vk-grid" x1={x(tick)} x2={x(tick)} y1={MARGIN.top} y2={MARGIN.top + plotHeight} />
          <text className="vk-tick" x={x(tick)} y={MARGIN.top + plotHeight + 18} textAnchor="middle">
            {tick}
          </text>
        </g>
      ))}

      <line className="vk-axis" x1={MARGIN.left} x2={MARGIN.left + plotWidth} y1={MARGIN.top + plotHeight} y2={MARGIN.top + plotHeight} />
      <line className="vk-axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={MARGIN.top + plotHeight} />

      <text className="vk-title" x={MARGIN.left + plotWidth / 2} y={HEIGHT - 10} textAnchor="middle">
        {xTitle}
      </text>
      <text
        className="vk-title"
        transform={`translate(16 ${MARGIN.top + plotHeight / 2}) rotate(-90)`}
        textAnchor="middle"
      >
        {yTitle}
      </text>

      {samples.map((sample) => {
        const isSelected = selected.has(sample.key)
        const cx = x(sample.oi)
        const cy = y(sample.hi)
        return (
          <g key={sample.key}>
            <circle
              className={isSelected ? 'vk-point vk-point--selected' : 'vk-point'}
              cx={cx}
              cy={cy}
              r={RADIUS}
              tabIndex={0}
              role="button"
              aria-pressed={isSelected}
              aria-label={pointLabel(sample)}
              onClick={() => onToggle(sample.key)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onToggle(sample.key)
                }
              }}
            >
              <title>{pointLabel(sample)}</title>
            </circle>
            {isSelected && (
              <text className="vk-label" x={cx + RADIUS + 3} y={cy - RADIUS - 2}>
                {labelOf(sample)}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
