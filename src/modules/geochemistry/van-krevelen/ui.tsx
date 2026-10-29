import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePreferences } from '../../../app/preferences-context'
import InterpretationPanel from '../../../components/scientific/InterpretationPanel'
import { downloadText } from '../../../services/import-export/download'
import { serializeEnvelope } from '../../../services/persistence/envelope'
import { evaluateRules } from '../../../science/interpretation'
import { REFERENCES } from '../../../science/references'
import type { Sample } from '../rock-eval/samples'
import { useSamples } from '../rock-eval/useSamples'
import { buildSamplesCsv, buildScenario } from './export'
import { VAN_KREVELEN_RULES } from './interpretation'
import ScatterChart from './ScatterChart'

export default function VanKrevelenTool() {
  const { language, t } = usePreferences()
  const { samples, excluded } = useSamples()
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())

  const formatter = useMemo(
    () => new Intl.NumberFormat(language, { maximumSignificantDigits: 4 }),
    [language],
  )
  const format = (value: number | null): string => (value === null ? '—' : formatter.format(value))

  function labelOf(sample: Sample): string {
    if (sample.label !== '') return sample.label
    return sample.line !== null ? t('vk.line', { line: sample.line }) : t('vk.manualSample')
  }

  function pointLabel(sample: Sample): string {
    return t('vk.pointLabel', {
      label: labelOf(sample),
      hi: format(sample.hi),
      oi: format(sample.oi),
    })
  }

  const selectedSamples = samples.filter((sample) => selected.has(sample.key))
  const report = useMemo(
    () =>
      evaluateRules(
        VAN_KREVELEN_RULES,
        { total: samples.length, selected: selectedSamples.length, excluded },
        REFERENCES,
      ),
    [samples.length, selectedSamples.length, excluded],
  )

  function toggle(key: string) {
    setSelected((previous) => {
      const next = new Set(previous)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function exportScenario() {
    const now = new Date()
    const scenario = buildScenario({
      samples,
      selectedKeys: selectedSamples.map((s) => s.key),
      name: t('vk.scenarioName', { date: now.toISOString().slice(0, 10) }),
      now,
    })
    downloadText('van-krevelen-scenario.json', serializeEnvelope(scenario), 'application/json;charset=utf-8')
  }

  function row(sample: Sample, withCheckbox: boolean) {
    return (
      <tr key={sample.key}>
        {withCheckbox && (
          <td>
            <input
              type="checkbox"
              checked={selected.has(sample.key)}
              onChange={() => toggle(sample.key)}
              aria-label={t('vk.selectSample', { label: labelOf(sample) })}
            />
          </td>
        )}
        <th scope="row">{labelOf(sample)}</th>
        <td>{format(sample.hi)}</td>
        <td>{format(sample.oi)}</td>
        <td>{format(sample.pi)}</td>
        <td>{format(sample.tmax)}</td>
        <td>{sample.origin === 'csv' ? t('vk.origin.csv') : t('vk.origin.manual')}</td>
      </tr>
    )
  }

  const head = (withCheckbox: boolean) => (
    <thead>
      <tr>
        {withCheckbox && <th scope="col">{t('vk.col.select')}</th>}
        <th scope="col">{t('vk.col.sample')}</th>
        <th scope="col">HI</th>
        <th scope="col">OI</th>
        <th scope="col">PI</th>
        <th scope="col">Tmax</th>
        <th scope="col">{t('vk.col.origin')}</th>
      </tr>
    </thead>
  )

  return (
    <div className="tool">
      <section className="tool-section" aria-labelledby="vk-chart-title">
        <h2 id="vk-chart-title">{t('vk.chartTitle')}</h2>
        <p className="muted">{t('vk.intro')}</p>

        {samples.length === 0 ? (
          <div className="notice" role="note">
            <p>{t('vk.empty')}</p>
            <p>
              <Link to="/outil/rock-eval">{t('vk.goToRockEval')}</Link>
            </p>
          </div>
        ) : (
          <>
            <ScatterChart
              samples={samples}
              selected={selected}
              onToggle={toggle}
              labelOf={labelOf}
              pointLabel={pointLabel}
              xTitle={t('vk.axis.oi')}
              yTitle={t('vk.axis.hi')}
              ariaLabel={t('vk.chartAria')}
            />
            <p className="muted">{t('vk.chartHint')}</p>
            <div className="actions">
              <button type="button" onClick={() => setSelected(new Set(samples.map((s) => s.key)))}>
                {t('vk.selectAll')}
              </button>
              <button type="button" onClick={() => setSelected(new Set())}>
                {t('vk.selectNone')}
              </button>
            </div>
          </>
        )}
        <p className="notice" role="note">
          {t('vk.noZones')}
        </p>
      </section>

      {samples.length > 0 && (
        <>
          <section className="tool-section" aria-labelledby="vk-compare-title">
            <h2 id="vk-compare-title">{t('vk.compareTitle', { count: selectedSamples.length })}</h2>
            {selectedSamples.length === 0 ? (
              <p className="muted">{t('vk.compareEmpty')}</p>
            ) : (
              <div className="table-scroll">
                <table>
                  {head(false)}
                  <tbody>{selectedSamples.map((sample) => row(sample, false))}</tbody>
                </table>
              </div>
            )}
          </section>

          <section className="tool-section" aria-labelledby="vk-data-title">
            <h2 id="vk-data-title">{t('vk.dataTitle', { count: samples.length })}</h2>
            <div className="table-scroll">
              <table>
                {head(true)}
                <tbody>{samples.map((sample) => row(sample, true))}</tbody>
              </table>
            </div>
            <div className="actions">
              <button
                type="button"
                onClick={() =>
                  downloadText(
                    'van-krevelen-echantillons.csv',
                    '\uFEFF' + buildSamplesCsv(samples, selected),
                  )
                }
              >
                {t('vk.exportCsv')}
              </button>
              <button type="button" onClick={exportScenario}>
                {t('vk.exportScenario')}
              </button>
            </div>
            <p className="muted">{t('vk.exportNote')}</p>
          </section>
        </>
      )}

      <InterpretationPanel report={report} references={REFERENCES} />
    </div>
  )
}
