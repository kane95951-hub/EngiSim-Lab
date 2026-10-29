import { describe, expect, it } from 'vitest'
import { parseCsv } from '../../../services/import-export/csv'
import { SYNTHETIC_CSV } from './example-csv'
import { autoMapColumns, importRockEval } from './import'
import { computeRockEval } from './model'
import { createSampleStore, sampleFromResult, samplesFromRows, type Sample } from './samples'

const table = parseCsv(SYNTHETIC_CSV)
const rows = importRockEval(table, autoMapColumns(table.rows[0] ?? []).mapping, { tocUnit: 'percent' })

function sample(key: string, origin: 'csv' | 'manual' = 'csv'): Sample {
  return { key, label: key, origin, line: null, hi: 1, oi: 2, pi: null, tmax: null }
}

describe('samplesFromRows', () => {
  it('ne garde que les lignes valides dont HI et OI sont calculables', () => {
    const { samples, excluded } = samplesFromRows(rows)
    expect(samples.map((s) => s.key)).toEqual(['csv:2', 'csv:3', 'csv:4', 'csv:7', 'csv:8'])
    expect(excluded).toBe(2)
  })

  it('reprend les valeurs recalculées, pas les valeurs importées', () => {
    const { samples } = samplesFromRows(rows)
    const last = samples.find((s) => s.key === 'csv:8')
    expect(last?.hi).toBe(200)
    expect(last?.oi).toBe(50)
    expect(samples[0]).toMatchObject({ label: 'SYN-01', hi: 400, oi: 50, origin: 'csv', line: 2 })
  })

  it('conserve un Tmax absent comme null', () => {
    const { samples } = samplesFromRows(rows)
    expect(samples.find((s) => s.key === 'csv:4')?.tmax).toBeNull()
  })
})

describe('sampleFromResult', () => {
  it('crée un échantillon pour une saisie manuelle complète', () => {
    const outcome = computeRockEval({ sampleId: 'M1', s1: 0.5, s2: 8, s3: 1, toc: 2, tmax: 440 })
    expect(outcome.ok && sampleFromResult(outcome.value)).toMatchObject({
      key: 'manual:1',
      label: 'M1',
      hi: 400,
      oi: 50,
      origin: 'manual',
    })
  })

  it('renvoie null quand HI ou OI n’est pas calculable', () => {
    const outcome = computeRockEval({ s1: 0.5, s2: 8, s3: 1 })
    expect(outcome.ok && sampleFromResult(outcome.value)).toBeNull()
  })
})

describe('createSampleStore', () => {
  it('démarre vide', () => {
    expect(createSampleStore().getSnapshot()).toEqual({ samples: [], excluded: 0 })
  })

  it('regroupe les échantillons CSV puis manuels et additionne les exclus', () => {
    const store = createSampleStore()
    store.set('manual', [sample('m')], 1)
    store.set('csv', [sample('a'), sample('b')], 2)
    expect(store.getSnapshot().samples.map((s) => s.key)).toEqual(['a', 'b', 'm'])
    expect(store.getSnapshot().excluded).toBe(3)
  })

  it('remplace les échantillons d’une origine sans toucher aux autres', () => {
    const store = createSampleStore()
    store.set('csv', [sample('a')])
    store.set('manual', [sample('m')])
    store.set('csv', [])
    expect(store.getSnapshot().samples.map((s) => s.key)).toEqual(['m'])
  })

  it('prévient les abonnés à chaque modification et plus après désabonnement', () => {
    const store = createSampleStore()
    let calls = 0
    const unsubscribe = store.subscribe(() => {
      calls++
    })
    store.set('csv', [sample('a')])
    store.set('csv', [])
    expect(calls).toBe(2)
    unsubscribe()
    store.set('csv', [sample('b')])
    expect(calls).toBe(2)
  })

  it('garde la même référence de snapshot tant que rien ne change', () => {
    const store = createSampleStore()
    const first = store.getSnapshot()
    expect(store.getSnapshot()).toBe(first)
    store.set('csv', [sample('a')])
    expect(store.getSnapshot()).not.toBe(first)
  })
})
