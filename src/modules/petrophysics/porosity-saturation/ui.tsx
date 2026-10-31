import { useMemo, useState } from 'react'
import { usePreferences } from '../../../app/preferences-context'
import InterpretationPanel from '../../../components/scientific/InterpretationPanel'
import IssueList from '../../../components/scientific/IssueList'
import type { MessageKey } from '../../../i18n/fr'
import { evaluateRules } from '../../../science/interpretation'
import { REFERENCES } from '../../../science/references'
import CompositionBar from './CompositionBar'
import { SYNTHETIC_DENSITIES, SYNTHETIC_VOLUMES } from './example'
import { POROSITY_RULES, type PorosityContext } from './interpretation'
import {
  computeFromDensities,
  computeFromVolumes,
  densitySegments,
  volumeSegments,
  type SwReason,
} from './model'
import PorosityLine from './PorosityLine'

type Mode = 'volumes' | 'densities'
type VolumesForm = typeof SYNTHETIC_VOLUMES
type DensitiesForm = typeof SYNTHETIC_DENSITIES

const EMPTY_VOLUMES: VolumesForm = { vbulk: '', vgrain: '', vwater: '' }
const EMPTY_DENSITIES: DensitiesForm = { rhoGrain: '', rhoBulk: '', rhoFluid: '' }

const VOLUME_UNITS = ['cm³', 'm³', 'mL', 'L']
const DENSITY_UNITS = ['kg/m³', 'g/cm³']

const MODES: { id: Mode; label: MessageKey }[] = [
  { id: 'volumes', label: 'porosity.mode.volumes' },
  { id: 'densities', label: 'porosity.mode.densities' },
]

const VOLUME_FIELDS: { key: keyof VolumesForm; label: MessageKey }[] = [
  { key: 'vbulk', label: 'porosity.field.vbulk' },
  { key: 'vgrain', label: 'porosity.field.vgrain' },
  { key: 'vwater', label: 'porosity.field.vwater' },
]

const DENSITY_FIELDS: { key: keyof DensitiesForm; label: MessageKey }[] = [
  { key: 'rhoGrain', label: 'porosity.field.rhoGrain' },
  { key: 'rhoBulk', label: 'porosity.field.rhoBulk' },
  { key: 'rhoFluid', label: 'porosity.field.rhoFluid' },
]

const SW_REASON_KEYS: Record<SwReason, MessageKey> = {
  missingInput: 'porosity.reason.missingInput',
  zeroPoreVolume: 'porosity.reason.zeroPoreVolume',
}

interface ResultRow {
  id: string
  label: MessageKey
  value: number | null
  // Texte de l'unité ; null = grandeur sans dimension.
  unit: string | null
  formula: string
  isFraction: boolean
  reason?: MessageKey
}

export default function PorosityTool() {
  const { language, t } = usePreferences()
  const [mode, setMode] = useState<Mode>('volumes')
  const [volumes, setVolumes] = useState<VolumesForm>(EMPTY_VOLUMES)
  const [densities, setDensities] = useState<DensitiesForm>(EMPTY_DENSITIES)
  const [volumeUnit, setVolumeUnit] = useState(VOLUME_UNITS[0] ?? 'cm³')
  const [densityUnit, setDensityUnit] = useState(DENSITY_UNITS[0] ?? 'kg/m³')

  const formatter = useMemo(
    () => new Intl.NumberFormat(language, { maximumSignificantDigits: 4 }),
    [language],
  )
  const fraction = (value: number): string =>
    `${formatter.format(value)} (${formatter.format(value * 100)} %)`

  const volumesData = Object.values(volumes).some((value) => value.trim() !== '')
  const densitiesData = Object.values(densities).some((value) => value.trim() !== '')
  const volumesOutcome = useMemo(
    () => (volumesData ? computeFromVolumes(volumes) : null),
    [volumes, volumesData],
  )
  const densitiesOutcome = useMemo(
    () => (densitiesData ? computeFromDensities(densities) : null),
    [densities, densitiesData],
  )

  const outcome = mode === 'volumes' ? volumesOutcome : densitiesOutcome
  const issues = outcome !== null && !outcome.ok ? outcome.issues : []

  const volumesResult = volumesOutcome !== null && volumesOutcome.ok ? volumesOutcome.value : null
  const densitiesResult = densitiesOutcome !== null && densitiesOutcome.ok ? densitiesOutcome.value : null

  let rows: ResultRow[] = []
  let context: PorosityContext | null = null
  if (mode === 'volumes' && volumesResult) {
    const r = volumesResult
    rows = [
      { id: 'vpore', label: 'porosity.q.vpore', value: r.vpore, unit: volumeUnit, formula: 'Vpore = Vbulk − Vgrain', isFraction: false },
      { id: 'phi', label: 'porosity.q.phi', value: r.phi, unit: null, formula: 'φ = Vpore / Vbulk', isFraction: true },
      {
        id: 'sw',
        label: 'porosity.q.sw',
        value: r.sw,
        unit: null,
        formula: 'Sw = Vwater / Vpore',
        isFraction: true,
        reason: r.swNotComputable ? SW_REASON_KEYS[r.swNotComputable] : undefined,
      },
      {
        id: 'nonWater',
        label: 'porosity.q.nonWater',
        value: r.nonWaterFraction,
        unit: null,
        formula: '1 − Sw',
        isFraction: true,
        reason: r.swNotComputable ? SW_REASON_KEYS[r.swNotComputable] : undefined,
      },
    ]
    context = { mode: 'volumes', phi: r.phi, sw: r.sw, waterProvided: r.vwater !== null }
  }
  if (mode === 'densities' && densitiesResult) {
    rows = [
      {
        id: 'phi',
        label: 'porosity.q.phi',
        value: densitiesResult.phi,
        unit: null,
        formula: 'φ = (ρgrain − ρbulk) / (ρgrain − ρfluid)',
        isFraction: true,
      },
    ]
    context = { mode: 'densities', phi: densitiesResult.phi }
  }

  const report = context ? evaluateRules(POROSITY_RULES, context, REFERENCES) : null

  const isExample =
    mode === 'volumes'
      ? JSON.stringify(volumes) === JSON.stringify(SYNTHETIC_VOLUMES)
      : JSON.stringify(densities) === JSON.stringify(SYNTHETIC_DENSITIES)

  return (
    <div className="tool">
      <div role="group" aria-label={t('porosity.mode')} className="mode-switcher">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={mode === item.id}
            onClick={() => setMode(item.id)}
          >
            {t(item.label)}
          </button>
        ))}
      </div>

      <section className="tool-section" aria-labelledby="porosity-inputs">
        <h2 id="porosity-inputs">{t('porosity.inputs')}</h2>
        <p className="muted">
          {t(mode === 'volumes' ? 'porosity.unitHint.volumes' : 'porosity.unitHint.densities')}{' '}
          {t('porosity.hint')}
        </p>

        <div className="field-grid">
          <div className="field">
            <label htmlFor="porosity-unit">
              {t(mode === 'volumes' ? 'porosity.unit.volume' : 'porosity.unit.density')}
            </label>
            <select
              id="porosity-unit"
              value={mode === 'volumes' ? volumeUnit : densityUnit}
              onChange={(event) =>
                mode === 'volumes' ? setVolumeUnit(event.target.value) : setDensityUnit(event.target.value)
              }
            >
              {(mode === 'volumes' ? VOLUME_UNITS : DENSITY_UNITS).map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          {mode === 'volumes'
            ? VOLUME_FIELDS.map((field) => (
                <div className="field" key={field.key}>
                  <label htmlFor={`porosity-${field.key}`}>
                    {t(field.label)} ({volumeUnit})
                  </label>
                  <input
                    id={`porosity-${field.key}`}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={volumes[field.key]}
                    onChange={(event) => setVolumes({ ...volumes, [field.key]: event.target.value })}
                  />
                </div>
              ))
            : DENSITY_FIELDS.map((field) => (
                <div className="field" key={field.key}>
                  <label htmlFor={`porosity-${field.key}`}>
                    {t(field.label)} ({densityUnit})
                  </label>
                  <input
                    id={`porosity-${field.key}`}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={densities[field.key]}
                    onChange={(event) => setDensities({ ...densities, [field.key]: event.target.value })}
                  />
                </div>
              ))}
        </div>

        <div className="actions">
          <button
            type="button"
            onClick={() =>
              mode === 'volumes' ? setVolumes(SYNTHETIC_VOLUMES) : setDensities(SYNTHETIC_DENSITIES)
            }
          >
            {t('porosity.loadExample')}
          </button>
          <button
            type="button"
            onClick={() => (mode === 'volumes' ? setVolumes(EMPTY_VOLUMES) : setDensities(EMPTY_DENSITIES))}
          >
            {t('porosity.clear')}
          </button>
        </div>
        {isExample && (
          <p className="notice" role="note">
            {t('porosity.exampleNote')}
          </p>
        )}
      </section>

      <section className="tool-section" aria-labelledby="porosity-results">
        <h2 id="porosity-results">{t('porosity.results')}</h2>
        {outcome === null && <p className="muted">{t('porosity.noInput')}</p>}
        <IssueList issues={issues} />

        {rows.length > 0 && (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">{t('porosity.col.quantity')}</th>
                  <th scope="col">{t('rockeval.col.value')}</th>
                  <th scope="col">{t('rockeval.col.unit')}</th>
                  <th scope="col">{t('rockeval.col.formula')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <th scope="row">{t(row.label)}</th>
                    <td>
                      {row.value === null
                        ? `${t('rockeval.notComputable')}${row.reason ? ` (${t(row.reason)})` : ''}`
                        : row.isFraction
                          ? fraction(row.value)
                          : formatter.format(row.value)}
                    </td>
                    <td>{row.unit ?? t('rockeval.dimensionless')}</td>
                    <td>
                      <code>{row.formula}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {mode === 'volumes' && volumesResult && <CompositionBar segments={volumeSegments(volumesResult)} />}
        {mode === 'densities' && densitiesResult && (
          <>
            <CompositionBar segments={densitySegments(densitiesResult)} />
            <PorosityLine
              rhoGrain={densitiesResult.rhoGrain}
              rhoFluid={densitiesResult.rhoFluid}
              rhoBulk={densitiesResult.rhoBulk}
              phi={densitiesResult.phi}
              unit={densityUnit}
            />
          </>
        )}
      </section>

      {report && <InterpretationPanel report={report} references={REFERENCES} />}
    </div>
  )
}
