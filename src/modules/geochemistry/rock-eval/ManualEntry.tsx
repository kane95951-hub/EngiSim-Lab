import { useEffect, useMemo, useState } from 'react'
import { usePreferences } from '../../../app/preferences-context'
import InterpretationPanel from '../../../components/scientific/InterpretationPanel'
import IssueList from '../../../components/scientific/IssueList'
import type { MessageKey } from '../../../i18n/fr'
import { evaluateRules } from '../../../science/interpretation'
import { REFERENCES } from '../../../science/references'
import { SYNTHETIC_EXAMPLE } from './example'
import { ROCK_EVAL_RULES } from './interpretation'
import { sampleFromResult, sampleStore } from './samples'
import {
  computeRockEval,
  type NotComputable,
  type RockEvalIndex,
  type RockEvalResult,
} from './model'

type FormState = typeof SYNTHETIC_EXAMPLE
type NumericField = 's1' | 's2' | 's3' | 'toc' | 'tmax'

const EMPTY_FORM: FormState = { sampleId: '', s1: '', s2: '', s3: '', toc: '', tmax: '' }

const FIELDS: { key: NumericField; label: MessageKey }[] = [
  { key: 's1', label: 'rockeval.field.s1' },
  { key: 's2', label: 'rockeval.field.s2' },
  { key: 's3', label: 'rockeval.field.s3' },
  { key: 'toc', label: 'rockeval.field.toc' },
  { key: 'tmax', label: 'rockeval.field.tmax' },
]

const REASON_KEYS: Record<NotComputable['reason'], MessageKey> = {
  missingInput: 'rockeval.reason.missingInput',
  zeroToc: 'rockeval.reason.zeroToc',
  zeroDenominator: 'rockeval.reason.zeroDenominator',
}

interface Row {
  index: RockEvalIndex
  value: number | null
  unit: string | null
  formula: string
}

function buildRows(result: RockEvalResult): Row[] {
  return [
    { index: 'HI', value: result.hi, unit: 'mg HC/g TOC', formula: 'HI = 100 × S2 / TOC' },
    { index: 'OI', value: result.oi, unit: 'mg CO₂/g TOC', formula: 'OI = 100 × S3 / TOC' },
    { index: 'PI', value: result.pi, unit: null, formula: 'PI = S1 / (S1 + S2)' },
    { index: 'S2/S3', value: result.s2s3, unit: 'mg HC/mg CO₂', formula: 'S2 / S3' },
  ]
}

export default function ManualEntry() {
  const { language, t } = usePreferences()
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [touched, setTouched] = useState(false)

  const hasData = (['s1', 's2', 's3', 'toc'] as const).some((key) => form[key].trim() !== '')
  const outcome = useMemo(() => (hasData ? computeRockEval(form) : null), [form, hasData])
  const result = outcome !== null && outcome.ok ? outcome.value : null
  const issues = outcome !== null && !outcome.ok ? outcome.issues : []
  const report = useMemo(
    () => (result ? evaluateRules(ROCK_EVAL_RULES, result, REFERENCES) : null),
    [result],
  )
  const formatter = useMemo(
    () => new Intl.NumberFormat(language, { maximumSignificantDigits: 4 }),
    [language],
  )

  function update(key: keyof FormState, value: string) {
    setTouched(true)
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  // Publie l'échantillon valide pour les autres outils (Van Krevelen), seulement après une action de l'utilisateur
  // pour ne pas effacer un échantillon déjà partagé lorsqu'on revient sur l'outil.
  useEffect(() => {
    if (!touched) return
    const sample = result ? sampleFromResult(result) : null
    sampleStore.set('manual', sample ? [sample] : [], result && !sample ? 1 : 0)
  }, [touched, result])

  return (
    <>
      <section className="tool-section" aria-labelledby="rockeval-inputs">
        <h2 id="rockeval-inputs">{t('rockeval.inputs')}</h2>
        <p className="muted">{t('rockeval.optionalHint')}</p>

        <div className="field-grid">
          <div className="field">
            <label htmlFor="rockeval-sampleId">{t('rockeval.sampleId')}</label>
            <input
              id="rockeval-sampleId"
              type="text"
              autoComplete="off"
              value={form.sampleId}
              onChange={(event) => update('sampleId', event.target.value)}
            />
          </div>
          {FIELDS.map((field) => (
            <div className="field" key={field.key}>
              <label htmlFor={`rockeval-${field.key}`}>{t(field.label)}</label>
              <input
                id={`rockeval-${field.key}`}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={form[field.key]}
                onChange={(event) => update(field.key, event.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="actions">
          <button type="button" onClick={() => {
              setTouched(true)
              setForm(SYNTHETIC_EXAMPLE)
            }}>
            {t('rockeval.loadExample')}
          </button>
          <button type="button" onClick={() => {
              setTouched(true)
              setForm(EMPTY_FORM)
            }}>
            {t('rockeval.clear')}
          </button>
        </div>
        {form.sampleId === SYNTHETIC_EXAMPLE.sampleId && (
          <p className="notice" role="note">
            {t('rockeval.exampleNote')}
          </p>
        )}
      </section>

      <section className="tool-section" aria-labelledby="rockeval-results">
        <h2 id="rockeval-results">{t('rockeval.results')}</h2>

        {outcome === null && <p className="muted">{t('rockeval.noInput')}</p>}
        <IssueList issues={issues} />

        {result && (
          <>
            {result.sampleId !== '' && <p>{t('rockeval.sample', { id: result.sampleId })}</p>}
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th scope="col">{t('rockeval.col.index')}</th>
                    <th scope="col">{t('rockeval.col.value')}</th>
                    <th scope="col">{t('rockeval.col.unit')}</th>
                    <th scope="col">{t('rockeval.col.formula')}</th>
                  </tr>
                </thead>
                <tbody>
                  {buildRows(result).map((row) => {
                    const missing = result.notComputable.find((n) => n.index === row.index)
                    return (
                      <tr key={row.index}>
                        <th scope="row">{row.index}</th>
                        <td>
                          {row.value !== null
                            ? formatter.format(row.value)
                            : `${t('rockeval.notComputable')}${
                                missing ? ` (${t(REASON_KEYS[missing.reason])})` : ''
                              }`}
                        </td>
                        <td>{row.unit ?? t('rockeval.dimensionless')}</td>
                        <td>
                          <code>{row.formula}</code>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {report && <InterpretationPanel report={report} references={REFERENCES} />}
    </>
  )
}
