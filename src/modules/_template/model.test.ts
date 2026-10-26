import { describe, expect, it } from 'vitest'
import { maxSupportedLevel } from '../../science/fidelity'
import { REFERENCES } from '../../science/references'
import { meta } from './meta'
import { computeRatio } from './model'

describe('gabarit : computeRatio', () => {
  it('calcule un cas nominal (valeur attendue calculée à la main : 6 / 3 = 2)', () => {
    expect(computeRatio(6, 3)).toEqual({ ok: true, value: { ratio: 2 } })
  })

  it('accepte des textes avec virgule décimale (7,5 / 2,5 = 3)', () => {
    expect(computeRatio('7,5', '2,5')).toEqual({ ok: true, value: { ratio: 3 } })
  })

  it('refuse un dénominateur nul', () => {
    expect(computeRatio(1, 0)).toEqual({
      ok: false,
      issues: [{ field: 'b', code: 'notAboveMin', bound: 0 }],
    })
  })

  it('refuse un numérateur négatif', () => {
    expect(computeRatio(-1, 2)).toEqual({
      ok: false,
      issues: [{ field: 'a', code: 'belowMin', bound: 0 }],
    })
  })

  it('signale une valeur manquante sans la remplacer par zéro', () => {
    expect(computeRatio(undefined, 2)).toEqual({
      ok: false,
      issues: [{ field: 'a', code: 'missing' }],
    })
  })

  it('rapporte tous les champs invalides en une fois', () => {
    const result = computeRatio(Number.NaN, 0)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.issues.map((i) => i.field)).toEqual(['a', 'b'])
  })

  it('refuse les valeurs infinies', () => {
    expect(computeRatio(Infinity, 1).ok).toBe(false)
    expect(computeRatio(1, Infinity).ok).toBe(false)
  })

  it('refuse un résultat qui déborde', () => {
    expect(computeRatio(1e308, 1e-308)).toEqual({
      ok: false,
      issues: [{ field: 'ratio', code: 'notFinite' }],
    })
  })

  it('ne peut pas dépasser N1 tant qu’aucune référence n’est vérifiée', () => {
    expect(maxSupportedLevel(meta, REFERENCES)).toBe('N1')
  })
})
