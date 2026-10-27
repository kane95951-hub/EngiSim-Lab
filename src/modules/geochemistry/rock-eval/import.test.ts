import { describe, expect, it } from 'vitest'
import { parseCsv } from '../../../services/import-export/csv'
import { SYNTHETIC_CSV } from './example-csv'
import {
  EXPORT_HEADER,
  autoMapColumns,
  buildResultsCsv,
  filterImportedRows,
  importRockEval,
  needsAttention,
  summarize,
  type ColumnMapping,
} from './import'

const parsed = parseCsv(SYNTHETIC_CSV)
const headers = parsed.rows[0] ?? []
const { mapping: frMapping } = autoMapColumns(headers)
const rows = importRockEval(parsed, frMapping, { tocUnit: 'percent' })
const byId = (id: string, nth = 0) =>
  rows.filter((r) => (r.raw.sampleId ?? '') === id)[nth] ?? (() => { throw new Error('ligne absente : ' + id) })()

describe('autoMapColumns', () => {
  it('reconnaît les en-têtes français de l’exemple synthétique', () => {
    expect(frMapping).toEqual({
      sampleId: 0,
      s1: 1,
      s2: 2,
      s3: 3,
      toc: 4,
      tmax: 5,
      hi: 6,
      oi: 7,
    })
  })

  it('reconnaît des en-têtes anglais et leurs variantes', () => {
    const { mapping } = autoMapColumns(['Sample ID', 'S1', 'S2', 'S3', 'TOC wt%', 'T max', 'Hydrogen index'])
    expect(mapping.sampleId).toBe(0)
    expect(mapping.s1).toBe(1)
    expect(mapping.toc).toBe(4)
    expect(mapping.tmax).toBe(5)
    expect(mapping.hi).toBeNull()
  })

  it('ignore un rapport S2/S3 et les colonnes inconnues', () => {
    const { mapping } = autoMapColumns(['Depth', 'S2/S3', 'S2'])
    expect(mapping.s2).toBe(2)
    expect(mapping.s3).toBeNull()
  })

  it('signale les champs trouvés dans plusieurs colonnes et garde la première', () => {
    const result = autoMapColumns(['S1', 'S1 bis', 'S2'])
    expect(result.mapping.s1).toBe(0)
    expect(result.ambiguous).toEqual(['s1'])
  })
})

describe('importRockEval : exemple synthétique', () => {
  it('lit 7 lignes de données avec leurs numéros de ligne dans le fichier', () => {
    expect(rows).toHaveLength(7)
    expect(rows.map((r) => r.line)).toEqual([2, 3, 4, 5, 6, 7, 8])
  })

  it('calcule le cas imposé : HI = 400, OI = 50', () => {
    const row = byId('SYN-01', 0)
    expect(row.status).toBe('ok')
    expect(row.result?.hi).toBe(400)
    expect(row.result?.oi).toBe(50)
    expect(row.result?.pi).toBeCloseTo(0.0588235, 6)
  })

  it('accepte une valeur importée arrondie sans la signaler comme écart', () => {
    const row = byId('SYN-02')
    expect(row.importedHi).toBe(227)
    expect(row.hiDiscrepancy).toBe(false)
    expect(row.oiDiscrepancy).toBe(false)
  })

  it('signale un Tmax vide sans le remplacer', () => {
    const row = byId('SYN-03')
    expect(row.status).toBe('ok')
    expect(row.emptyFields).toContain('tmax')
    expect(row.result?.tmax).toBeNull()
    expect(needsAttention(row)).toBe(true)
  })

  it('rend HI et OI non calculables quand TOC = 0, sans écraser les cellules vides importées', () => {
    const row = byId('SYN-04')
    expect(row.result?.hi).toBeNull()
    expect(row.result?.oi).toBeNull()
    expect(row.importedHi).toBeNull()
    expect(row.emptyFields).toEqual(['hi', 'oi'])
  })

  it('rejette une ligne dont une valeur n’est pas numérique, en gardant la cellule d’origine', () => {
    const row = byId('SYN-05')
    expect(row.status).toBe('invalid')
    expect(row.issues).toEqual([{ field: 'S3', code: 'notFinite' }])
    expect(row.raw.s3).toBe('abc')
    expect(row.result).toBeNull()
  })

  it('signale les identifiants en double des deux côtés', () => {
    const first = byId('SYN-01', 0)
    const second = byId('SYN-01', 1)
    expect(first.duplicateLines).toEqual([second.line])
    expect(second.duplicateLines).toEqual([first.line])
  })

  it('signale un HI importé très différent du HI recalculé, sans l’écraser', () => {
    const row = byId('SYN-07')
    expect(row.result?.hi).toBe(200)
    expect(row.importedHi).toBe(999)
    expect(row.hiDiscrepancy).toBe(true)
    expect(row.oiDiscrepancy).toBe(false)
  })
})

describe('importRockEval : unités et cas particuliers', () => {
  const table = parseCsv('id,s1,s2,s3,toc,tmax\nA,0.5,8,1,0.035,440\n', ',')
  const mapping = autoMapColumns(table.rows[0] ?? []).mapping

  it('convertit un TOC en fraction vers des % sans bruit de calcul', () => {
    const [row] = importRockEval(table, mapping, { tocUnit: 'fraction' })
    expect(row?.result?.toc).toBe(3.5)
  })

  it('refuse un TOC en % choisi par erreur en « fraction » (valeur > 100 %)', () => {
    const wrong = parseCsv('id,s1,s2,s3,toc,tmax\nA,0.5,8,1,2,440\n', ',')
    const [row] = importRockEval(wrong, mapping, { tocUnit: 'fraction' })
    expect(row?.status).toBe('invalid')
    expect(row?.issues[0]).toEqual({ field: 'TOC', code: 'aboveMax', bound: 100 })
  })

  it('traite une cellule contenant seulement des espaces comme manquante', () => {
    const blank = parseCsv('id,s1,s2,s3,toc,tmax\nA,0.5,8,1,   ,440\n', ',')
    const [row] = importRockEval(blank, mapping, { tocUnit: 'percent' })
    expect(row?.status).toBe('ok')
    expect(row?.result?.toc).toBeNull()
    expect(row?.result?.hi).toBeNull()
  })

  it('signale une ligne dont le nombre de cellules diffère de l’en-tête', () => {
    const short = parseCsv('id,s1,s2,s3,toc,tmax\nA,0.5,8\n', ',')
    const [row] = importRockEval(short, mapping, { tocUnit: 'percent' })
    expect(row?.cellCountMismatch).toBe(true)
    expect(row?.result?.s3).toBeNull()
  })

  it('ignore une ligne entièrement vide dans les colonnes associées', () => {
    const emptyRow = parseCsv('id,s1,s2,s3,toc,tmax\n,,,,,\nA,0.5,8,1,2,440\n', ',')
    const result = importRockEval(emptyRow, mapping, { tocUnit: 'percent' })
    expect(result.map((r) => r.status)).toEqual(['empty', 'ok'])
  })

  it('traite une colonne non associée comme manquante, jamais comme zéro', () => {
    const partial: ColumnMapping = { ...mapping, s3: null }
    const [row] = importRockEval(table, partial, { tocUnit: 'percent' })
    expect(row?.result?.s3).toBeNull()
    expect(row?.result?.oi).toBeNull()
  })
})

describe('résumé, filtres et export', () => {
  it('résume la qualité des données importées', () => {
    expect(summarize(rows)).toEqual({
      dataRows: 7,
      empty: 0,
      ok: 6,
      invalid: 1,
      attention: 5,
      duplicates: 2,
      discrepancies: 1,
    })
  })

  it('filtre par statut et par identifiant', () => {
    expect(filterImportedRows(rows, { query: '', status: 'invalid' }).map((r) => r.line)).toEqual([6])
    expect(filterImportedRows(rows, { query: 'syn-01', status: 'all' })).toHaveLength(2)
    expect(filterImportedRows(rows, { query: '', status: 'duplicates' })).toHaveLength(2)
    expect(filterImportedRows(rows, { query: 'zzz', status: 'all' })).toEqual([])
  })

  it('exporte un CSV relisible avec des colonnes stables et les cellules d’origine', () => {
    const exported = parseCsv(buildResultsCsv(rows), ',')
    expect(exported.rows[0]).toEqual(EXPORT_HEADER)
    expect(exported.rows).toHaveLength(8)
    const invalid = exported.rows.find((r) => r[0] === '6')
    expect(invalid?.[11]).toBe('invalid')
    expect(invalid?.[12]).toBe('S3:notFinite')
    expect(invalid?.[18]).toBe('abc')
    const nominal = exported.rows.find((r) => r[0] === '2')
    expect(nominal?.[7]).toBe('400')
    expect(nominal?.[8]).toBe('50')
  })

  it('protège l’export contre les formules sans modifier les nombres', () => {
    const risky = parseCsv('id,s1,s2,s3,toc,tmax\n=1+1,-1,8,1,2,440\n', ',')
    const mapping = autoMapColumns(risky.rows[0] ?? []).mapping
    const exported = parseCsv(buildResultsCsv(importRockEval(risky, mapping, { tocUnit: 'percent' })), ',')
    expect(exported.rows[1]?.[1]).toBe("'=1+1")
    expect(exported.rows[1]?.[16]).toBe('-1')
  })
})
