import { usePreferences } from '../../../app/preferences-context'
import type { MessageKey } from '../../../i18n/fr'
import type { Segment, SegmentId } from './model'

const WIDTH = 640
const HEIGHT = 56

const LABEL_KEYS: Record<SegmentId, MessageKey> = {
  grain: 'porosity.seg.grain',
  water: 'porosity.seg.water',
  otherPore: 'porosity.seg.otherPore',
  pore: 'porosity.seg.pore',
}

// Barre de composition du volume total. Chaque segment est aussi décrit en texte (nom et pourcentage) dans la
// légende : la couleur n'est jamais le seul porteur de l'information.
export default function CompositionBar({ segments }: { segments: Segment[] }) {
  const { language, t } = usePreferences()
  const formatter = new Intl.NumberFormat(language, { maximumSignificantDigits: 3 })
  const percent = (fraction: number): string => `${formatter.format(fraction * 100)} %`

  // Position de départ de chaque segment = somme des fractions précédentes (sans modifier de variable extérieure).
  const bars = segments.map((segment, index) => {
    const before = segments.slice(0, index).reduce((sum, previous) => sum + previous.fraction, 0)
    return { segment, x: before * WIDTH, width: segment.fraction * WIDTH }
  })
  const summary = segments.map((s) => `${t(LABEL_KEYS[s.id])} ${percent(s.fraction)}`).join(', ')

  return (
    <figure className="composition">
      <figcaption>{t('porosity.chart.composition')}</figcaption>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`${t('porosity.chart.composition')} : ${summary}`}>
        {bars.map(({ segment, x, width }) => (
          <rect
            key={segment.id}
            className={`seg seg--${segment.id}`}
            x={x}
            y={4}
            width={width}
            height={HEIGHT - 8}
          />
        ))}
        <rect className="seg-frame" x={0} y={4} width={WIDTH} height={HEIGHT - 8} />
      </svg>
      <ul className="legend">
        {segments.map((segment) => (
          <li key={segment.id}>
            <span className={`swatch seg--${segment.id}`} aria-hidden="true" />
            {t(LABEL_KEYS[segment.id])} : {percent(segment.fraction)}
          </li>
        ))}
      </ul>
    </figure>
  )
}