import { describe, expect, it } from 'vitest'
import type { Checked } from '../../../science/validation'
import { SYNTHETIC_EXAMPLE } from './example'
import { computeRockEval, type RockEvalResult } from './model'

function must(result: Checked<RockEvalResult>): RockEvalResult {
  if (!result.ok) throw new Error('calcul refusé : ' + JSON.stringify(result.issues))
  return result.value
}

// Cas imposé par le cahier des charges (jeu SYNTHÉTIQUE) :
// S1 = 0,50 ; S2 = 8,00 ; S3 = 1,00 ; TOC = 2,00 ; Tmax = 440.
const imposed = { s1: 0.5, s2: 8, s3: 1, toc: 2, tmax: 440 }

describe('Rock-Eval : cas nominal imposé', () => {
  it('calcule HI = 400, OI = 50, PI ≈ 0,0588235 et S2/S3 = 8', () => {
    const r = must(computeRockEval(imposed))
    expect(r.hi).toBe(400)
    expect(r.oi).toBe(50)
    expect(r.pi).toBeCloseTo(0.0588235, 6)
    expect(r.s2s3).toBe(8)
    expect(r.notComputable).toEqual([])
  })

  it('conserve les valeurs saisies sans les modifier', () => {
    const r = must(computeRockEval(imposed))
    expect([r.s1, r.s2, r.s3, r.toc, r.tmax]).toEqual([0.5, 8, 1, 2, 440])
  })

  it('accepte des textes avec point ou virgule décimale', () => {
    const withComma = must(
      computeRockEval({ s1: '0,50', s2: '8,00', s3: '1,00', toc: '2,00', tmax: '440' }),
    )
    expect(withComma.hi).toBe(400)
    expect(withComma.pi).toBeCloseTo(0.0588235, 6)
  })

  it('reproduit les valeurs attendues avec l’exemple synthétique de l’interface', () => {
    const r = must(computeRockEval(SYNTHETIC_EXAMPLE))
    expect(r.hi).toBe(400)
    expect(r.oi).toBe(50)
    expect(r.pi).toBeCloseTo(0.0588235, 6)
    expect(r.sampleId).toBe('EXEMPLE-SYNTHÉTIQUE')
  })

  it('conserve l’identifiant de l’échantillon, vide s’il est absent', () => {
    expect(must(computeRockEval({ ...imposed, sampleId: '  A-12 ' })).sampleId).toBe('A-12')
    expect(must(computeRockEval(imposed)).sampleId).toBe('')
  })
})

describe('Rock-Eval : cas limites', () => {
  it('rend HI et OI non calculables quand TOC = 0, sans toucher à PI', () => {
    const r = must(computeRockEval({ ...imposed, toc: 0 }))
    expect(r.hi).toBeNull()
    expect(r.oi).toBeNull()
    expect(r.pi).toBeCloseTo(0.0588235, 6)
    expect(r.notComputable).toEqual([
      { index: 'HI', reason: 'zeroToc' },
      { index: 'OI', reason: 'zeroToc' },
    ])
  })

  it('traite un TOC absent comme manquant, jamais comme zéro', () => {
    const r = must(computeRockEval({ s1: 0.5, s2: 8, s3: 1 }))
    expect(r.toc).toBeNull()
    expect(r.hi).toBeNull()
    expect(r.oi).toBeNull()
    expect(r.notComputable).toContainEqual({ index: 'HI', reason: 'missingInput' })
  })

  it('rend PI indéfini quand S1 + S2 = 0', () => {
    const r = must(computeRockEval({ s1: 0, s2: 0, s3: 1, toc: 2 }))
    expect(r.pi).toBeNull()
    expect(r.hi).toBe(0)
    expect(r.notComputable).toContainEqual({ index: 'PI', reason: 'zeroDenominator' })
  })

  it('rend S2/S3 non calculable quand S3 = 0, tout en calculant OI = 0', () => {
    const r = must(computeRockEval({ ...imposed, s3: 0 }))
    expect(r.s2s3).toBeNull()
    expect(r.oi).toBe(0)
    expect(r.notComputable).toContainEqual({ index: 'S2/S3', reason: 'zeroDenominator' })
  })

  it('accepte un Tmax absent', () => {
    const r = must(computeRockEval({ s1: 0.5, s2: 8, s3: 1, toc: 2 }))
    expect(r.tmax).toBeNull()
    expect(r.hi).toBe(400)
  })

  it('accepte un TOC de 100 % mais pas au-delà', () => {
    expect(must(computeRockEval({ ...imposed, toc: 100 })).hi).toBe(8)
    expect(computeRockEval({ ...imposed, toc: 100.5 })).toEqual({
      ok: false,
      issues: [{ field: 'TOC', code: 'aboveMax', bound: 100 }],
    })
  })
})

describe('Rock-Eval : entrées invalides', () => {
  it('refuse les valeurs négatives des pics et du TOC', () => {
    expect(computeRockEval({ ...imposed, s1: -1 })).toEqual({
      ok: false,
      issues: [{ field: 'S1', code: 'belowMin', bound: 0 }],
    })
    expect(computeRockEval({ ...imposed, s2: -1 }).ok).toBe(false)
    expect(computeRockEval({ ...imposed, s3: -1 }).ok).toBe(false)
    expect(computeRockEval({ ...imposed, toc: -1 }).ok).toBe(false)
  })

  it('refuse les valeurs non numériques ou infinies', () => {
    for (const bad of ['abc', Number.NaN, Infinity, -Infinity]) {
      expect(computeRockEval({ ...imposed, s2: bad })).toEqual({
        ok: false,
        issues: [{ field: 'S2', code: 'notFinite' }],
      })
    }
  })

  it('refuse un Tmax nul ou négatif', () => {
    expect(computeRockEval({ ...imposed, tmax: 0 })).toEqual({
      ok: false,
      issues: [{ field: 'Tmax', code: 'notAboveMin', bound: 0 }],
    })
  })

  it('rapporte tous les champs invalides en une fois', () => {
    const result = computeRockEval({ s1: -1, s2: 'x', s3: 1, toc: 2 })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.issues.map((i) => i.field)).toEqual(['S1', 'S2'])
  })

  it('refuse un calcul sans aucune donnée S1, S2, S3 ni TOC', () => {
    const result = computeRockEval({ tmax: 440 })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.issues.map((i) => i.field)).toEqual(['S1', 'S2', 'S3', 'TOC'])
      expect(result.issues.every((i) => i.code === 'missing')).toBe(true)
    }
  })

  it('refuse un résultat qui déborde au lieu de l’afficher', () => {
    expect(computeRockEval({ s2: 1e308, toc: 1 })).toEqual({
      ok: false,
      issues: [{ field: 'HI', code: 'notFinite' }],
    })
    expect(computeRockEval({ s1: 1e308, s2: 1e308 })).toEqual({
      ok: false,
      issues: [{ field: 'PI', code: 'notFinite' }],
    })
  })
})

describe('Rock-Eval : propriétés', () => {
  it('HI double quand S2 double, et diminue quand TOC augmente', () => {
    const base = must(computeRockEval({ s2: 4, toc: 2 })).hi
    expect(must(computeRockEval({ s2: 8, toc: 2 })).hi).toBe((base ?? 0) * 2)
    expect(must(computeRockEval({ s2: 4, toc: 4 })).hi).toBe((base ?? 0) / 2)
  })

  it('PI reste entre 0 et 1', () => {
    for (const [s1, s2] of [
      [0, 5],
      [5, 0],
      [1, 1],
      [3, 100],
    ]) {
      const pi = must(computeRockEval({ s1, s2 })).pi
      expect(pi).not.toBeNull()
      expect((pi ?? -1) >= 0 && (pi ?? 2) <= 1).toBe(true)
    }
  })
})
