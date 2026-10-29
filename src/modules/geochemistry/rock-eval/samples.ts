import type { ImportedRow } from './import'
import type { RockEvalResult } from './model'

// Échantillons Rock-Eval valides, partagés entre les outils (Rock-Eval → Van Krevelen).
// Un échantillon n'est publié que si HI et OI sont calculables. Rien n'est écrit sur disque :
// les données restent en mémoire pendant la session.

export type SampleOrigin = 'csv' | 'manual'

export interface Sample {
  key: string
  // Identifiant d'échantillon tel que saisi ; peut être vide.
  label: string
  origin: SampleOrigin
  // Numéro de ligne du fichier CSV d'origine, null pour une saisie manuelle.
  line: number | null
  hi: number
  oi: number
  pi: number | null
  tmax: number | null
}

export interface SampleSnapshot {
  samples: Sample[]
  // Nombre d'échantillons non tracés (invalides, ou HI/OI non calculables).
  excluded: number
}

export interface SampleStore {
  getSnapshot: () => SampleSnapshot
  subscribe: (listener: () => void) => () => void
  set: (origin: SampleOrigin, samples: Sample[], excluded?: number) => void
}

interface Slot {
  samples: Sample[]
  excluded: number
}

export function createSampleStore(): SampleStore {
  let slots: Record<SampleOrigin, Slot> = {
    csv: { samples: [], excluded: 0 },
    manual: { samples: [], excluded: 0 },
  }
  const listeners = new Set<() => void>()

  function compute(): SampleSnapshot {
    return {
      samples: [...slots.csv.samples, ...slots.manual.samples],
      excluded: slots.csv.excluded + slots.manual.excluded,
    }
  }
  let snapshot = compute()

  return {
    // La référence du snapshot ne change qu'à chaque modification (exigé par useSyncExternalStore).
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    set: (origin, samples, excluded = 0) => {
      slots = { ...slots, [origin]: { samples, excluded } }
      snapshot = compute()
      listeners.forEach((listener) => listener())
    },
  }
}

// Magasin partagé de l'application.
export const sampleStore = createSampleStore()

export function samplesFromRows(rows: ImportedRow[]): { samples: Sample[]; excluded: number } {
  const samples: Sample[] = []
  let excluded = 0
  for (const row of rows) {
    if (row.status === 'empty') continue
    const result = row.result
    if (row.status === 'ok' && result !== null && result.hi !== null && result.oi !== null) {
      samples.push({
        key: `csv:${row.line}`,
        label: (row.raw.sampleId ?? '').trim(),
        origin: 'csv',
        line: row.line,
        hi: result.hi,
        oi: result.oi,
        pi: result.pi,
        tmax: result.tmax,
      })
    } else {
      excluded++
    }
  }
  return { samples, excluded }
}

export function sampleFromResult(result: RockEvalResult): Sample | null {
  if (result.hi === null || result.oi === null) return null
  return {
    key: 'manual:1',
    label: result.sampleId,
    origin: 'manual',
    line: null,
    hi: result.hi,
    oi: result.oi,
    pi: result.pi,
    tmax: result.tmax,
  }
}
