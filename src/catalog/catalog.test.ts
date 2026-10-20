import { describe, expect, it } from 'vitest'
import { DOMAINS, SIMULATORS } from './simulators'

describe('intégrité du registre des simulateurs', () => {
  it('couvre les 15 domaines du cahier des charges', () => {
    expect(DOMAINS).toHaveLength(15)
  })

  it('utilise des identifiants uniques', () => {
    const ids = SIMULATORS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('rattache chaque outil à un domaine existant', () => {
    const domainIds = new Set(DOMAINS.map((d) => d.id))
    for (const simulator of SIMULATORS) {
      expect(domainIds.has(simulator.domain)).toBe(true)
    }
  })

  it('renseigne noms et descriptions en français et en anglais', () => {
    for (const simulator of SIMULATORS) {
      expect(simulator.name.fr.trim()).not.toBe('')
      expect(simulator.name.en.trim()).not.toBe('')
      expect(simulator.description.fr.trim()).not.toBe('')
      expect(simulator.description.en.trim()).not.toBe('')
    }
  })

  it('n’annonce aucun niveau de fidélité pour un outil à venir', () => {
    for (const simulator of SIMULATORS.filter((s) => s.status === 'planned')) {
      expect(simulator.fidelityLevel).toBeUndefined()
    }
  })

  it('exige un niveau de fidélité pour un outil disponible ou en prototype', () => {
    for (const simulator of SIMULATORS.filter((s) => s.status !== 'planned')) {
      expect(simulator.fidelityLevel).toBeDefined()
    }
  })
})
