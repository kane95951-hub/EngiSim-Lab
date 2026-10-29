import { useEffect, useMemo, useState } from 'react'
import { usePreferences } from '../../../app/preferences-context'
import InterpretationPanel from '../../../components/scientific/InterpretationPanel'
import IssueList from '../../../components/scientific/IssueList'
import type { MessageKey } from '../../../i18n/fr'
import { decodeCsvBytes, parseCsv, type Delimiter } from '../../../services/import-export/csv'
import { downloadText } from '../../../services/import-export/download'
import { evaluateRules } from '../../../science/interpretation'
import { REFERENCES } from '../../../science/references'
import { SYNTHETIC_CSV } from './example-csv'
import {
  FIELD_KEYS,
  autoMapColumns,
  buildResultsCsv,
  filterImportedRows,
  hasMissingCore,
  importRockEval,
  summarize,
  type ColumnMapping,
  type FieldKey,
  type ImportedRow,
  type RowFilterStatus,
  type TocUnit,
} from './import'
import { ROCK_EVAL_RULES } from './interpretation'
import type { NotComputable } from './model'
import { sampleStore, samplesFromRows } from './samples'

const MAX_FILE_BYTES = 5 * 1024 * 1024
const MAX_DISPLAY_ROWS = 200
const PREVIEW_ROWS = 5

interface Source {
  name: string
  text: string
  encoding: string
}

const FIELD_LABEL_KEYS: Record<FieldKey, MessageKey> = {
  sampleId: 'csv.field.sampleId',
  s1: 'csv.field.s1',
  s2: 'csv.field.s2',
  s3: 'csv.field.s3',
  toc: 'csv.field.toc',
  tmax: 'csv.field.tmax',
  hi: 'csv.field.hi',
  oi: 'csv.field.oi',
}

const DELIMITER_OPTIONS: { value: 'auto' | Delimiter; label: MessageKey }[] = [
  { value: 'auto', label: 'csv.delimiter.auto' },
  { value: ';', label: 'csv.delimiter.semicolon' },
  { value: ',', label: 'csv.delimiter.comma' },
  { value: '\t', label: 'csv.delimiter.tab' },
]

const FILTER_OPTIONS: { value: RowFilterStatus; label: MessageKey }[] = [
  { value: 'all', label: 'csv.filter.all' },
  { value: 'ok', label: 'csv.filter.ok' },
  { value: 'invalid', label: 'csv.filter.invalid' },
  { value: 'attention', label: 'csv.filter.attention' },
  { value: 'duplicates', label: 'csv.filter.duplicates' },
]

const REASON_KEYS: Record<NotComputable['reason'], MessageKey> = {
  missingInput: 'rockeval.reason.missingInput',
  zeroToc: 'rockeval.reason.zeroToc',
  zeroDenominator: 'rockeval.reason.zeroDenominator',
}

function flagKeys(row: ImportedRow): MessageKey[] {
  const flags: MessageKey[] = []
  if (hasMissingCore(row)) flags.push('csv.flag.missing')
  if ((row.result?.notComputable.length ?? 0) > 0) flags.push('csv.flag.notComputable')
  if (row.duplicateLines.length > 0) flags.push('csv.flag.duplicate')
  if (row.hiDiscrepancy || row.oiDiscrepancy) flags.push('csv.flag.discrepancy')
  if (row.cellCountMismatch) flags.push('csv.flag.columns')
  return flags
}

export default function CsvImport() {
  const { language, t } = usePreferences()

  const [source, setSource] = useState<Source | null>(null)
  const [fileError, setFileError] = useState<MessageKey | null>(null)
  const [delimiterChoice, setDelimiterChoice] = useState<'auto' | Delimiter>('auto')
  const [manualMapping, setManualMapping] = useState<Partial<ColumnMapping>>({})
  const [tocUnit, setTocUnit] = useState<TocUnit>('percent')
  const [confirmed, setConfirmed] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<RowFilterStatus>('all')
  const [selectedLine, setSelectedLine] = useState<number | null>(null)

  const formatter = useMemo(
    () => new Intl.NumberFormat(language, { maximumSignificantDigits: 4 }),
    [language],
  )
  const format = (value: number | null | undefined): string =>
    value === null || value === undefined ? '—' : formatter.format(value)

  const parsed = useMemo(
    () =>
      source ? parseCsv(source.text, delimiterChoice === 'auto' ? undefined : delimiterChoice) : null,
    [source, delimiterChoice],
  )
  const auto = useMemo(() => autoMapColumns(parsed?.rows[0] ?? []), [parsed])
  const mapping = useMemo<ColumnMapping>(
    () => ({ ...auto.mapping, ...manualMapping }),
    [auto, manualMapping],
  )
  const rows = useMemo(
    () => (parsed && parsed.rows.length > 1 && confirmed ? importRockEval(parsed, mapping, { tocUnit }) : null),
    [parsed, mapping, tocUnit, confirmed],
  )
  // Publie les échantillons valides pour les autres outils (Van Krevelen). Rien n'est publié tant qu'aucun fichier
  // n'a été chargé, pour ne pas effacer les échantillons déjà partagés lorsqu'on revient sur l'outil.
  useEffect(() => {
    if (source === null) return
    if (rows === null) {
      sampleStore.set('csv', [], 0)
      return
    }
    const { samples, excluded } = samplesFromRows(rows)
    sampleStore.set('csv', samples, excluded)
  }, [source, rows])

  const summary = useMemo(() => (rows ? summarize(rows) : null), [rows])
  const filtered = useMemo(
    () => (rows ? filterImportedRows(rows, { query, status: statusFilter }) : []),
    [rows, query, statusFilter],
  )
  const selected = rows?.find((row) => row.line === selectedLine) ?? null
  const selectedReport = useMemo(
    () => (selected?.result ? evaluateRules(ROCK_EVAL_RULES, selected.result, REFERENCES) : null),
    [selected],
  )

  function resetForNewData() {
    setManualMapping({})
    setConfirmed(false)
    setQuery('')
    setStatusFilter('all')
    setSelectedLine(null)
  }

  function loadSource(next: Source) {
    setSource(next)
    setFileError(null)
    setDelimiterChoice('auto')
    setTocUnit('percent')
    resetForNewData()
  }

  async function handleFile(file: File) {
    if (file.size > MAX_FILE_BYTES) {
      setFileError('csv.error.tooLarge')
      return
    }
    try {
      const decoded = decodeCsvBytes(new Uint8Array(await file.arrayBuffer()))
      if (parseCsv(decoded.text).rows.length < 2) {
        setFileError('csv.error.empty')
        return
      }
      loadSource({ name: file.name, text: decoded.text, encoding: decoded.encoding })
    } catch {
      setFileError('csv.error.read')
    }
  }

  const delimiterLabel = DELIMITER_OPTIONS.find((o) => o.value === parsed?.delimiter)?.label
  const ambiguousNames = auto.ambiguous.map((key) => t(FIELD_LABEL_KEYS[key])).join(', ')

  return (
    <>
      <section className="tool-section" aria-labelledby="csv-title">
        <h2 id="csv-title">{t('csv.title')}</h2>
        <p className="muted">{t('csv.intro')}</p>

        <div className="actions">
          <label className="file-button">
            {t('csv.chooseFile')}
            <input
              type="file"
              accept=".csv,.tsv,.txt,text/csv,text/plain"
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (file) void handleFile(file)
              }}
            />
          </label>
          <button
            type="button"
            onClick={() =>
              loadSource({ name: 'rock-eval-synthetique.csv', text: SYNTHETIC_CSV, encoding: 'utf-8' })
            }
          >
            {t('csv.loadExample')}
          </button>
          <button
            type="button"
            onClick={() => downloadText('rock-eval-synthetique.csv', '\uFEFF' + SYNTHETIC_CSV)}
          >
            {t('csv.downloadExample')}
          </button>
        </div>

        {fileError && (
          <p className="notice" role="alert">
            {t(fileError)}
          </p>
        )}
        {source?.name === 'rock-eval-synthetique.csv' && (
          <p className="notice" role="note">
            {t('csv.exampleNote')}
          </p>
        )}
      </section>

      {source && parsed && (
        <>
          <section className="tool-section" aria-labelledby="csv-file">
            <h2 id="csv-file">{t('csv.file', { name: source.name })}</h2>
            <p>
              {t('csv.detected', {
                encoding: source.encoding,
                delimiter: delimiterLabel ? t(delimiterLabel) : parsed.delimiter,
                count: Math.max(parsed.rows.length - 1, 0),
              })}
            </p>
            <div className="field">
              <label htmlFor="csv-delimiter">{t('csv.delimiter')}</label>
              <select
                id="csv-delimiter"
                value={delimiterChoice}
                onChange={(event) => {
                  setDelimiterChoice(event.target.value as 'auto' | Delimiter)
                  resetForNewData()
                }}
              >
                {DELIMITER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.label)}
                  </option>
                ))}
              </select>
            </div>

            <h3>{t('csv.preview')}</h3>
            <div className="table-scroll">
              <table>
                <tbody>
                  {parsed.rows.slice(0, PREVIEW_ROWS + 1).map((cells, rowIndex) => (
                    <tr key={rowIndex}>
                      {cells.map((cell, cellIndex) =>
                        rowIndex === 0 ? (
                          <th scope="col" key={cellIndex}>
                            {cell}
                          </th>
                        ) : (
                          <td key={cellIndex}>{cell}</td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="tool-section" aria-labelledby="csv-mapping">
            <h2 id="csv-mapping">{t('csv.mapping')}</h2>
            <p className="muted">{t('csv.mapping.hint')}</p>
            {auto.ambiguous.length > 0 && (
              <p className="notice" role="note">
                {t('csv.mapping.ambiguous', { fields: ambiguousNames })}
              </p>
            )}
            <div className="field-grid">
              {FIELD_KEYS.map((key) => (
                <div className="field" key={key}>
                  <label htmlFor={`csv-map-${key}`}>{t(FIELD_LABEL_KEYS[key])}</label>
                  <select
                    id={`csv-map-${key}`}
                    value={mapping[key] === null ? '' : String(mapping[key])}
                    onChange={(event) => {
                      const value = event.target.value
                      setManualMapping((previous) => ({
                        ...previous,
                        [key]: value === '' ? null : Number(value),
                      }))
                      setConfirmed(false)
                      setSelectedLine(null)
                    }}
                  >
                    <option value="">{t('csv.mapping.unused')}</option>
                    {(parsed.rows[0] ?? []).map((header, index) => (
                      <option key={index} value={String(index)}>
                        {`${index + 1}. ${header}`}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </section>

          <section className="tool-section" aria-labelledby="csv-units">
            <h2 id="csv-units">{t('csv.units')}</h2>
            <p>{t('csv.units.peaks')}</p>
            <fieldset className="setting">
              <legend>{t('csv.units.toc')}</legend>
              {(['percent', 'fraction'] as const).map((unit) => (
                <label key={unit} className="choice">
                  <input
                    type="radio"
                    name="csv-toc-unit"
                    checked={tocUnit === unit}
                    onChange={() => {
                      setTocUnit(unit)
                      setConfirmed(false)
                      setSelectedLine(null)
                    }}
                  />
                  {t(unit === 'percent' ? 'csv.units.percent' : 'csv.units.fraction')}
                </label>
              ))}
            </fieldset>
            <label className="choice">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => {
                  setConfirmed(event.target.checked)
                  setSelectedLine(null)
                }}
              />
              {t('csv.units.confirm')}
            </label>
            {!confirmed && <p className="muted">{t('csv.units.required')}</p>}
          </section>
        </>
      )}

      {rows && summary && (
        <>
          <section className="tool-section" aria-labelledby="csv-summary">
            <h2 id="csv-summary">{t('csv.summary')}</h2>
            <ul>
              <li>{t('csv.summary.dataRows', { count: summary.dataRows })}</li>
              <li>{t('csv.summary.ok', { count: summary.ok })}</li>
              <li>{t('csv.summary.invalid', { count: summary.invalid })}</li>
              <li>{t('csv.summary.attention', { count: summary.attention })}</li>
              <li>{t('csv.summary.duplicates', { count: summary.duplicates })}</li>
              <li>{t('csv.summary.discrepancies', { count: summary.discrepancies })}</li>
              {summary.empty > 0 && <li>{t('csv.summary.empty', { count: summary.empty })}</li>}
            </ul>
          </section>

          <section className="tool-section" aria-labelledby="csv-results">
            <h2 id="csv-results">{t('rockeval.results')}</h2>

            <div className="field-grid">
              <div className="field">
                <label htmlFor="csv-filter-query">{t('csv.filter.query')}</label>
                <input
                  id="csv-filter-query"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="csv-filter-status">{t('csv.filter.status')}</label>
                <select
                  id="csv-filter-status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as RowFilterStatus)}
                >
                  {FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.label)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p role="status">
              {t('csv.table.count', {
                shown: Math.min(filtered.length, MAX_DISPLAY_ROWS),
                total: filtered.length,
              })}
            </p>
            {filtered.length > MAX_DISPLAY_ROWS && (
              <p className="muted">{t('csv.table.limited', { max: MAX_DISPLAY_ROWS })}</p>
            )}

            {filtered.length === 0 ? (
              <p className="muted">{t('csv.noMatch')}</p>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">{t('csv.col.line')}</th>
                      <th scope="col">{t('csv.col.sample')}</th>
                      <th scope="col">S1</th>
                      <th scope="col">S2</th>
                      <th scope="col">S3</th>
                      <th scope="col">TOC</th>
                      <th scope="col">Tmax</th>
                      <th scope="col">HI</th>
                      <th scope="col">OI</th>
                      <th scope="col">PI</th>
                      <th scope="col">{t('csv.col.status')}</th>
                      <th scope="col">{t('csv.col.flags')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, MAX_DISPLAY_ROWS).map((row) => (
                      <tr key={row.line} className={row.line === selectedLine ? 'row-selected' : undefined}>
                        <th scope="row">
                          <button
                            type="button"
                            aria-pressed={row.line === selectedLine}
                            aria-label={t('csv.select', { line: row.line })}
                            onClick={() => setSelectedLine(row.line === selectedLine ? null : row.line)}
                          >
                            {row.line}
                          </button>
                        </th>
                        <td>{row.raw.sampleId ?? '—'}</td>
                        <td>{row.raw.s1 ?? '—'}</td>
                        <td>{row.raw.s2 ?? '—'}</td>
                        <td>{row.raw.s3 ?? '—'}</td>
                        <td>{row.raw.toc ?? '—'}</td>
                        <td>{row.raw.tmax ?? '—'}</td>
                        <td>{format(row.result?.hi)}</td>
                        <td>{format(row.result?.oi)}</td>
                        <td>{format(row.result?.pi)}</td>
                        <td>{t(row.status === 'ok' ? 'csv.status.ok' : 'csv.status.invalid')}</td>
                        <td>{flagKeys(row).map((key) => t(key)).join(' · ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="actions">
              <button
                type="button"
                onClick={() => downloadText('rock-eval-resultats.csv', '\uFEFF' + buildResultsCsv(rows))}
              >
                {t('csv.export')}
              </button>
            </div>
            <p className="muted">{t('csv.export.note')}</p>
          </section>

          {selected && (
            <section className="tool-section" aria-labelledby="csv-detail">
              <h2 id="csv-detail">{t('csv.detail', { line: selected.line })}</h2>

              <h3>{t('csv.detail.original')}</h3>
              <ul>
                {FIELD_KEYS.filter((key) => selected.raw[key] !== undefined).map((key) => (
                  <li key={key}>
                    {t(FIELD_LABEL_KEYS[key])} : <code>{selected.raw[key] === '' ? '∅' : selected.raw[key]}</code>
                  </li>
                ))}
              </ul>

              <IssueList issues={selected.issues} />

              {selected.result && (
                <>
                  <h3>{t('csv.detail.computed')}</h3>
                  <ul>
                    <li>HI : {format(selected.result.hi)}</li>
                    <li>OI : {format(selected.result.oi)}</li>
                    <li>PI : {format(selected.result.pi)}</li>
                    <li>S2/S3 : {format(selected.result.s2s3)}</li>
                    {selected.result.notComputable.map((item) => (
                      <li key={item.index}>
                        {item.index} : {t('rockeval.notComputable')} ({t(REASON_KEYS[item.reason])})
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {(selected.importedHi !== null || selected.importedOi !== null) && (
                <>
                  <h3>{t('csv.detail.imported')}</h3>
                  <ul>
                    <li>
                      {t('csv.detail.compare', {
                        name: 'HI',
                        imported: format(selected.importedHi),
                        computed: format(selected.result?.hi),
                      })}
                      {selected.hiDiscrepancy ? ` — ${t('csv.flag.discrepancy')}` : ''}
                    </li>
                    <li>
                      {t('csv.detail.compare', {
                        name: 'OI',
                        imported: format(selected.importedOi),
                        computed: format(selected.result?.oi),
                      })}
                      {selected.oiDiscrepancy ? ` — ${t('csv.flag.discrepancy')}` : ''}
                    </li>
                  </ul>
                </>
              )}

              {selected.duplicateLines.length > 0 && (
                <p className="notice" role="note">
                  {t('csv.detail.duplicates', { lines: selected.duplicateLines.join(', ') })}
                </p>
              )}

              {selectedReport && <InterpretationPanel report={selectedReport} references={REFERENCES} />}
            </section>
          )}
        </>
      )}
    </>
  )
}
