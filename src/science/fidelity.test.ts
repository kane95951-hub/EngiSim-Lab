import { describe, expect, it } from 'vitest'
import { isLevelSupported, maxSupportedLevel } from './fidelity'
import type { ModelMeta, Reference } from './types'

const references: Reference[] = [
  { id: 'R1', citation: 'Source fictive de test', status: 'verified', verifiedOn: '2026-10-22' },
  { id: 'R2', citation: 'Source fictive non vérifiée', status: 'unverified' },
]

function metaWith(overrides: Partial<ModelMeta>): ModelMeta {
  return {
    id: 'test',
    modelVersion: '1.0.0',
    variables: [],
    formulas: [{ id: 'f', expression: 'y = x', unit: '1', referenceIds: ['R1'] }],
    assumptions: [],
    limitations: [],
    validityDomain: { fr: 'Test', en: 'Test' },
    validationCases: [],
    ...overrides,
  }
}

describe('maxSupportedLevel', () => {
  it('reste en N1 sans équation', () => {
    expect(maxSupportedLevel(metaWith({ formulas: [] }), references)).toBe('N1')
  })

  it('reste en N1 si une équation n’a aucune référence', () => {
    const meta = metaWith({ formulas: [{ id: 'f', expression: 'y = x', unit: '1', referenceIds: [] }] })
    expect(maxSupportedLevel(meta, references)).toBe('N1')
  })

  it('reste en N1 si une référence n’est pas vérifiée', () => {
    const meta = metaWith({ formulas: [{ id: 'f', expression: 'y = x', unit: '1', referenceIds: ['R2'] }] })
    expect(maxSupportedLevel(meta, references)).toBe('N1')
  })

  it('atteint N2 avec des références vérifiées et sans cas de validation', () => {
    expect(maxSupportedLevel(metaWith({}), references)).toBe('N2')
  })

  it('atteint N3 quand un cas validé est reproduit dans sa tolérance', () => {
    const meta = metaWith({
      validationCases: [{ id: 'v', referenceId: 'R1', expected: 1, computed: 1.0005, tolerance: 0.001 }],
    })
    expect(maxSupportedLevel(meta, references)).toBe('N3')
  })

  it('reste en N2 si l’écart dépasse la tolérance', () => {
    const meta = metaWith({
      validationCases: [{ id: 'v', referenceId: 'R1', expected: 1, computed: 1.01, tolerance: 0.001 }],
    })
    expect(maxSupportedLevel(meta, references)).toBe('N2')
  })

  it('reste en N2 si la source du cas de validation n’est pas vérifiée', () => {
    const meta = metaWith({
      validationCases: [{ id: 'v', referenceId: 'R2', expected: 1, computed: 1, tolerance: 0.001 }],
    })
    expect(maxSupportedLevel(meta, references)).toBe('N2')
  })

  it('reste en N2 si la tolérance est invalide', () => {
    const meta = metaWith({
      validationCases: [{ id: 'v', referenceId: 'R1', expected: 1, computed: 1, tolerance: Number.NaN }],
    })
    expect(maxSupportedLevel(meta, references)).toBe('N2')
  })
})

describe('isLevelSupported', () => {
  it('refuse un niveau supérieur aux preuves', () => {
    const meta = metaWith({ formulas: [] })
    expect(isLevelSupported('N2', meta, references)).toBe(false)
    expect(isLevelSupported('N3', meta, references)).toBe(false)
  })

  it('accepte un niveau inférieur ou égal aux preuves', () => {
    expect(isLevelSupported('N1', metaWith({}), references)).toBe(true)
    expect(isLevelSupported('N2', metaWith({}), references)).toBe(true)
  })
})
