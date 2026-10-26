import { describe, expect, it } from 'vitest'
import { SIMULATORS } from '../catalog/simulators'
import { MODEL_METAS } from '../modules'
import { isLevelSupported } from './fidelity'
import { REFERENCES } from './references'

describe('cohérence entre catalogue, fiches scientifiques et références', () => {
  it('rattache chaque fiche scientifique à un outil du catalogue', () => {
    const ids = new Set(SIMULATORS.map((s) => s.id))
    for (const meta of MODEL_METAS) {
      expect(ids.has(meta.id), meta.id).toBe(true)
    }
  })

  it('exige une fiche scientifique pour tout outil disponible ou en prototype', () => {
    for (const simulator of SIMULATORS.filter((s) => s.status !== 'planned')) {
      expect(MODEL_METAS.some((m) => m.id === simulator.id), simulator.id).toBe(true)
    }
  })

  it('n’annonce jamais un niveau de fidélité supérieur aux preuves', () => {
    for (const simulator of SIMULATORS) {
      if (!simulator.fidelityLevel) continue
      const meta = MODEL_METAS.find((m) => m.id === simulator.id)
      expect(meta, simulator.id).toBeDefined()
      if (meta) {
        expect(isLevelSupported(simulator.fidelityLevel, meta, REFERENCES), simulator.id).toBe(true)
      }
    }
  })

  it('n’utilise que des références connues du registre', () => {
    const known = new Set(REFERENCES.map((r) => r.id))
    for (const meta of MODEL_METAS) {
      for (const formula of meta.formulas) {
        for (const id of formula.referenceIds) expect(known.has(id), id).toBe(true)
      }
      for (const c of meta.validationCases) expect(known.has(c.referenceId), c.referenceId).toBe(true)
    }
  })

  it('utilise des identifiants de références uniques', () => {
    const ids = REFERENCES.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('exige une date de consultation pour toute référence vérifiée', () => {
    for (const reference of REFERENCES.filter((r) => r.status === 'verified')) {
      expect(reference.verifiedOn, reference.id).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })
})
