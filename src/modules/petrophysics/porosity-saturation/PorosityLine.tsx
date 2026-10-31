import { usePreferences } from '../../../app/preferences-context'
import { axisFor, linearScale, niceTicks } from '../../../utils/scale'
import { porosityLine } from './model'

const WIDTH = 640
const HEIGHT = 340
const MARGIN = { left: 64, right: 20, top: 16, bottom: 52 }

interface PorosityLineProps {
  rhoGrain: number
  rhoFluid: number
  rhoBulk: number
  phi: number
  unit: string
}

// Droite φ(ρbulk) entre (ρfluid ; 1) et (ρgrain ; 0), avec le point de calcul courant.
export default function PorosityLine({ rhoGrain, rhoFluid, rhoBulk, phi, unit }: PorosityLineProps) {
  const { t } = usePreferences()
  const plotWidth = WIDTH - MARGIN.left - MARGIN.right
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom
  const xAxis = axisFor([rhoGrain])
  const yAxis = niceTicks(1)
  const x = linearScale(xAxis.upper, MARGIN.left, MARGIN.left + plotWidth)
  const y = linearScale(yAxis.upper, MARGIN.top + plotHeight, MARGIN.top)
  const [start, end] = porosityLine(rhoFluid, rhoGrain)

  return (
    <figure className="composition">
      <figcaption>{t('porosity.chart.line')}</figcaption>
      <svg
        className="vk-chart"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={t('porosity.chart.lineAria', { rho: rhoBulk, phi })}
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

        <line className="porosity-line" x1={x(start.rho)} y1={y(start.phi)} x2={x(end.rho)} y2={y(end.phi)} />
        <circle className="vk-point vk-point--selected" cx={x(rhoBulk)} cy={y(phi)} r={7} />

        <text className="vk-title" x={MARGIN.left + plotWidth / 2} y={HEIGHT - 10} textAnchor="middle">
          {t('porosity.axis.rhoBulk', { unit })}
        </text>
        <text
          className="vk-title"
          transform={`translate(16 ${MARGIN.top + plotHeight / 2}) rotate(-90)`}
          textAnchor="middle"
        >
          {t('porosity.axis.phi')}
        </text>
      </svg>
    </figure>
  )
}
