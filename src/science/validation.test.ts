import { describe, expect, it } from 'vitest'
import { checkNumber, checkOptionalNumber, gatherIssues, parseDecimal } from './validation'

describe('parseDecimal', () => {
  it('accepte le point, la virgule et la notation scientifique', () => {
    expect(parseDecimal('12')).toBe(12)
    expect(parseDecimal('0,5')).toBe(0.5)
    expect(parseDecimal('0.5')).toBe(0.5)
    expect(parseDecimal(' 3.25 ')).toBe(3.25)
    expect(parseDecimal('-2')).toBe(-2)
    expect(parseDecimal('1e3')).toBe(1000)
    expect(parseDecimal('1,5e2')).toBe(150)
    expect(parseDecimal('.5')).toBe(0.5)
    expect(parseDecimal('5.')).toBe(5)
  })

  it('refuse le texte, les séparateurs de milliers et les formes ambiguës', () => {
    for (const text of ['', 'abc', '1,234.5', '1 000', '--1', '1e', '0x10', 'Infinity', 'NaN']) {
      expect(parseDecimal(text), text).toBeNull()
    }
  })

  it('refuse un nombre qui dépasse la capacité de calcul', () => {
    expect(parseDecimal('1e999')).toBeNull()
  })
})

describe('checkNumber', () => {
  it('signale une valeur manquante sans la remplacer par zéro', () => {
    for (const value of [undefined, null, '']) {
      expect(checkNumber('x', value)).toEqual({
        ok: false,
        issues: [{ field: 'x', code: 'missing' }],
      })
    }
  })

  it('refuse les valeurs non numériques ou infinies', () => {
    for (const value of [Number.NaN, Infinity, -Infinity, 'abc', {}, true]) {
      expect(checkNumber('x', value)).toEqual({
        ok: false,
        issues: [{ field: 'x', code: 'notFinite' }],
      })
    }
  })

  it('lit un texte avec virgule décimale', () => {
    expect(checkNumber('x', '7,5')).toEqual({ ok: true, value: 7.5 })
  })

  it('applique une borne minimale inclusive', () => {
    expect(checkNumber('x', 0, { min: 0 })).toEqual({ ok: true, value: 0 })
    expect(checkNumber('x', -1, { min: 0 })).toEqual({
      ok: false,
      issues: [{ field: 'x', code: 'belowMin', bound: 0 }],
    })
  })

  it('applique une borne minimale exclusive', () => {
    expect(checkNumber('x', 0, { min: 0, minExclusive: true })).toEqual({
      ok: false,
      issues: [{ field: 'x', code: 'notAboveMin', bound: 0 }],
    })
    expect(checkNumber('x', 0.1, { min: 0, minExclusive: true })).toEqual({ ok: true, value: 0.1 })
  })

  it('applique une borne maximale, inclusive ou exclusive', () => {
    expect(checkNumber('x', 1, { max: 1 })).toEqual({ ok: true, value: 1 })
    expect(checkNumber('x', 1.1, { max: 1 })).toEqual({
      ok: false,
      issues: [{ field: 'x', code: 'aboveMax', bound: 1 }],
    })
    expect(checkNumber('x', 1, { max: 1, maxExclusive: true })).toEqual({
      ok: false,
      issues: [{ field: 'x', code: 'notBelowMax', bound: 1 }],
    })
  })
})

describe('gatherIssues', () => {
  it('rassemble les problèmes de plusieurs champs dans l’ordre', () => {
    const issues = gatherIssues(
      checkNumber('a', 1),
      checkNumber('b', undefined),
      checkNumber('c', -5, { min: 0 }),
    )
    expect(issues).toEqual([
      { field: 'b', code: 'missing' },
      { field: 'c', code: 'belowMin', bound: 0 },
    ])
  })
})

describe('checkOptionalNumber', () => {
  it('renvoie null pour un champ vide, sans le remplacer par zéro', () => {
    for (const value of [undefined, null, '']) {
      expect(checkOptionalNumber('x', value, { min: 0 })).toEqual({ ok: true, value: null })
    }
  })

  it('valide un champ rempli comme checkNumber', () => {
    expect(checkOptionalNumber('x', '2,5', { min: 0 })).toEqual({ ok: true, value: 2.5 })
    expect(checkOptionalNumber('x', -1, { min: 0 })).toEqual({
      ok: false,
      issues: [{ field: 'x', code: 'belowMin', bound: 0 }],
    })
    expect(checkOptionalNumber('x', 'abc')).toEqual({
      ok: false,
      issues: [{ field: 'x', code: 'notFinite' }],
    })
  })
})
