import { neutralizeFormula, toCsv, type ParsedCsv } from '../../../services/import-export/csv'
import { parseDecimal, type Issue } from '../../../science/validation'
import { computeRockEval, type RockEvalResult } from './model'

// Import de plusieurs échantillons Rock-Eval depuis un CSV.
// Principes : aucune correction silencieuse (les cellules d'origine sont conservées), aucune valeur
// manquante remplacée par zéro, unités confirmées par l'utilisateur, HI/OI du fichier traités comme
// valeurs importées et comparées aux valeurs recalculées sans jamais les écraser.

export type FieldKey = 'sampleId' | 's1' | 's2' | 's3' | 'toc' | 'tmax' | 'hi' | 'oi'

export const FIELD_KEYS: FieldKey[] = ['sampleId', 's1', 's2', 's3', 'toc', 'tmax', 'hi', 'oi']

export type ColumnMapping = Record<FieldKey, number | null>

export type TocUnit = 'percent' | 'fraction'

const CORE_FIELDS: FieldKey[] = ['s1', 's2', 's3', 'toc', 'tmax']

// Tolérance d'AFFICHAGE (non scientifique) pour signaler un HI ou OI importé différent de la valeur recalculée :
// on admet un arrondi à l'unité (0,5) plus 1 % de la valeur recalculée.
export const DISCREPANCY_ABSOLUTE = 0.5
export const DISCREPANCY_RELATIVE = 0.01

export const EMPTY_MAPPING: ColumnMapping = {
  sampleId: null,
  s1: null,
  s2: null,
  s3: null,
  toc: null,
  tmax: null,
  hi: null,
  oi: null,
}

const SAMPLE_ID_WORDS = new Set([
  'sample',
  'samples',
  'echantillon',
  'echantillons',
  'ech',
  'id',
  'name',
  'nom',
  'identifiant',
])

function headerTokens(header: string): string[] {
  return header
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 0)
}

function matchField(header: string): FieldKey | null {
  const tokens = headerTokens(header)
  const first = tokens[0]
  if (first === undefined) return null
  // Un rapport « S2/S3 » n'est pas une colonne de données de base.
  if (tokens.includes('s2') && tokens.includes('s3')) return null

  if (first === 's1') return 's1'
  if (first === 's2') return 's2'
  if (first === 's3') return 's3'
  if (first === 'toc' || first === 'cot') return 'toc'
  if (first === 'tmax' || (first === 't' && tokens[1] === 'max')) return 'tmax'
  if (first === 'hi') return 'hi'
  if (first === 'oi') return 'oi'
  if (tokens.includes('organic') && tokens.includes('carbon')) return 'toc'
  if (tokens.includes('carbone') && tokens.includes('organique')) return 'toc'
  if (SAMPLE_ID_WORDS.has(first)) return 'sampleId'
  return null
}

export interface AutoMapResult {
  mapping: ColumnMapping
  // Champs pour lesquels plusieurs colonnes correspondaient : la première a été retenue.
  ambiguous: FieldKey[]
}

export function autoMapColumns(headers: string[]): AutoMapResult {
  const mapping: ColumnMapping = { ...EMPTY_MAPPING }
  const ambiguous = new Set<FieldKey>()
  headers.forEach((header, index) => {
    const field = matchField(header)
    if (field === null) return
    if (mapping[field] === null) mapping[field] = index
    else ambiguous.add(field)
  })
  return { mapping, ambiguous: [...ambiguous] }
}

export type RowStatus = 'ok' | 'invalid' | 'empty'

export interface ImportedRow {
  // Numéro de ligne dans le fichier d'origine (l'en-tête est la ligne 1).
  line: number
  // Cellules d'origine des colonnes associées, sans aucune correction.
  raw: Partial<Record<FieldKey, string>>
  status: RowStatus
  result: RockEvalResult | null
  issues: Issue[]
  // Colonnes associées dont la cellule est vide.
  emptyFields: FieldKey[]
  // Vrai si le nombre de cellules de la ligne diffère de celui de l'en-tête.
  cellCountMismatch: boolean
  // Autres lignes qui portent le même identifiant d'échantillon.
  duplicateLines: number[]
  importedHi: number | null
  importedOi: number | null
  hiDiscrepancy: boolean
  oiDiscrepancy: boolean
}

// Convertit un TOC exprimé en fraction (0–1) vers des % massiques. L'arrondi à 12 chiffres significatifs
// supprime le bruit de calcul flottant (0,035 × 100 = 3,5000000000000004).
function tocToPercent(raw: string, unit: TocUnit): string | number {
  if (unit === 'percent') return raw
  const value = parseDecimal(raw)
  return value === null ? raw : Number((value * 100).toPrecision(12))
}

function differs(imported: number | null, computed: number | null | undefined): boolean {
  if (imported === null || computed === null || computed === undefined) return false
  return Math.abs(imported - computed) > DISCREPANCY_ABSOLUTE + DISCREPANCY_RELATIVE * Math.abs(computed)
}

export function importRockEval(
  table: ParsedCsv,
  mapping: ColumnMapping,
  options: { tocUnit: TocUnit },
): ImportedRow[] {
  const headerLength = table.rows[0]?.length ?? 0
  const rows: ImportedRow[] = []
  const idIndex = new Map<string, number[]>()

  for (let r = 1; r < table.rows.length; r++) {
    const cells = table.rows[r] ?? []
    const line = table.lineNumbers[r] ?? r + 1

    const raw: Partial<Record<FieldKey, string>> = {}
    const emptyFields: FieldKey[] = []
    for (const key of FIELD_KEYS) {
      const column = mapping[key]
      if (column === null) continue
      const text = cells[column] ?? ''
      raw[key] = text
      if (text.trim() === '') emptyFields.push(key)
    }

    const mappedCount = FIELD_KEYS.filter((key) => mapping[key] !== null).length
    const base = {
      line,
      raw,
      emptyFields,
      cellCountMismatch: cells.length !== headerLength,
      duplicateLines: [] as number[],
      importedHi: null as number | null,
      importedOi: null as number | null,
      hiDiscrepancy: false,
      oiDiscrepancy: false,
    }

    if (mappedCount > 0 && emptyFields.length === mappedCount) {
      rows.push({ ...base, status: 'empty', result: null, issues: [] })
      continue
    }

    const text = (key: FieldKey): string => (raw[key] ?? '').trim()
    const outcome = computeRockEval({
      sampleId: text('sampleId'),
      s1: text('s1'),
      s2: text('s2'),
      s3: text('s3'),
      toc: tocToPercent(text('toc'), options.tocUnit),
      tmax: text('tmax'),
    })

    const importedHi = text('hi') === '' ? null : parseDecimal(text('hi'))
    const importedOi = text('oi') === '' ? null : parseDecimal(text('oi'))
    const result = outcome.ok ? outcome.value : null

    rows.push({
      ...base,
      status: outcome.ok ? 'ok' : 'invalid',
      result,
      issues: outcome.ok ? [] : outcome.issues,
      importedHi,
      importedOi,
      hiDiscrepancy: differs(importedHi, result?.hi),
      oiDiscrepancy: differs(importedOi, result?.oi),
    })

    const id = text('sampleId').toLowerCase()
    if (id !== '') idIndex.set(id, [...(idIndex.get(id) ?? []), line])
  }

  // Signale les identifiants en double, des deux côtés.
  for (const row of rows) {
    if (row.status === 'empty') continue
    const id = (row.raw.sampleId ?? '').trim().toLowerCase()
    if (id === '') continue
    row.duplicateLines = (idIndex.get(id) ?? []).filter((line) => line !== row.line)
  }

  return rows
}

export function hasMissingCore(row: ImportedRow): boolean {
  return row.emptyFields.some((field) => CORE_FIELDS.includes(field))
}

// Une ligne valide mais à examiner : donnée manquante, indice non calculable, doublon, écart HI/OI ou colonnes irrégulières.
export function needsAttention(row: ImportedRow): boolean {
  if (row.status !== 'ok') return false
  return (
    hasMissingCore(row) ||
    (row.result?.notComputable.length ?? 0) > 0 ||
    row.duplicateLines.length > 0 ||
    row.hiDiscrepancy ||
    row.oiDiscrepancy ||
    row.cellCountMismatch
  )
}

export interface ImportSummary {
  dataRows: number
  empty: number
  ok: number
  invalid: number
  attention: number
  duplicates: number
  discrepancies: number
}

export function summarize(rows: ImportedRow[]): ImportSummary {
  const nonEmpty = rows.filter((row) => row.status !== 'empty')
  return {
    dataRows: rows.length,
    empty: rows.length - nonEmpty.length,
    ok: nonEmpty.filter((row) => row.status === 'ok').length,
    invalid: nonEmpty.filter((row) => row.status === 'invalid').length,
    attention: nonEmpty.filter(needsAttention).length,
    duplicates: nonEmpty.filter((row) => row.duplicateLines.length > 0).length,
    discrepancies: nonEmpty.filter((row) => row.hiDiscrepancy || row.oiDiscrepancy).length,
  }
}

export type RowFilterStatus = 'all' | 'ok' | 'invalid' | 'attention' | 'duplicates'

export function filterImportedRows(
  rows: ImportedRow[],
  filter: { query: string; status: RowFilterStatus },
): ImportedRow[] {
  const query = filter.query.trim().toLowerCase()
  return rows.filter((row) => {
    if (row.status === 'empty') return false
    if (filter.status === 'ok' && row.status !== 'ok') return false
    if (filter.status === 'invalid' && row.status !== 'invalid') return false
    if (filter.status === 'attention' && !needsAttention(row)) return false
    if (filter.status === 'duplicates' && row.duplicateLines.length === 0) return false
    if (query !== '' && !(row.raw.sampleId ?? '').toLowerCase().includes(query)) return false
    return true
  })
}

function numberText(value: number | null | undefined): string {
  return value === null || value === undefined ? '' : String(value)
}

// Une cellule d'origine qui est un nombre (même négatif) reste inchangée ; tout autre texte est protégé
// contre l'interprétation comme formule par un tableur.
function safeRaw(text: string | undefined): string {
  const value = text ?? ''
  return parseDecimal(value) !== null ? value : neutralizeFormula(value)
}

// Export CSV des résultats. Les noms de colonnes sont stables (identiques en français et en anglais).
export const EXPORT_HEADER = [
  'line',
  'sample_id',
  'S1_mg_per_g_rock',
  'S2_mg_per_g_rock',
  'S3_mg_per_g_rock',
  'TOC_percent',
  'Tmax_C',
  'HI_mg_HC_per_g_TOC',
  'OI_mg_CO2_per_g_TOC',
  'PI',
  'S2_over_S3',
  'status',
  'notes',
  'duplicate_lines',
  'imported_HI',
  'imported_OI',
  'raw_S1',
  'raw_S2',
  'raw_S3',
  'raw_TOC',
  'raw_Tmax',
]

export function buildResultsCsv(rows: ImportedRow[]): string {
  const table: string[][] = [EXPORT_HEADER]
  for (const row of rows) {
    if (row.status === 'empty') continue
    const r = row.result
    const notes = [
      ...row.issues.map((issue) => `${issue.field}:${issue.code}`),
      ...(r?.notComputable.map((n) => `${n.index}:${n.reason}`) ?? []),
      ...(row.hiDiscrepancy ? ['HI:importedDiffers'] : []),
      ...(row.oiDiscrepancy ? ['OI:importedDiffers'] : []),
      ...(row.cellCountMismatch ? ['row:cellCountMismatch'] : []),
    ]
    table.push([
      String(row.line),
      neutralizeFormula((row.raw.sampleId ?? '').trim()),
      numberText(r?.s1),
      numberText(r?.s2),
      numberText(r?.s3),
      numberText(r?.toc),
      numberText(r?.tmax),
      numberText(r?.hi),
      numberText(r?.oi),
      numberText(r?.pi),
      numberText(r?.s2s3),
      row.status,
      neutralizeFormula(notes.join(' ')),
      row.duplicateLines.join(' '),
      numberText(row.importedHi),
      numberText(row.importedOi),
      safeRaw(row.raw.s1),
      safeRaw(row.raw.s2),
      safeRaw(row.raw.s3),
      safeRaw(row.raw.toc),
      safeRaw(row.raw.tmax),
    ])
  }
  return toCsv(table, ',')
}
