import { describe, expect, it } from 'vitest'
import { filterSimulators } from './search'
import { DOMAINS, SIMULATORS } from './simulators'
import type { CatalogFilters } from './types'

const base: CatalogFilters = { query: '', domain: 'all', status: 'all' }

function run(filters: CatalogFilters) {
  return filterSimulators(SIMULATORS, DOMAINS, filters)
}

describe('recherche dans le catalogue', () => {
  it('renvoie tous les outils quand aucun filtre n’est actif', () => {
    expect(run(base)).toHaveLength(SIMULATORS.length)
  })

  it('ignore les accents et la casse', () => {
    const ids = run({ ...base, query: 'POROSITE' }).map((s) => s.id)
    expect(ids).toContain('porosity-saturation')
  })

  it('exige tous les mots de la requête', () => {
    const withBoth = run({ ...base, query: 'darcy débit' }).map((s) => s.id)
    expect(withBoth).toContain('darcy-flow')
    expect(run({ ...base, query: 'darcy photovoltaïque' })).toEqual([])
  })

  it('filtre par domaine', () => {
    const results = run({ ...base, domain: 'petrophysics' })
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((s) => s.domain === 'petrophysics')).toBe(true)
  })

  it('filtre par statut', () => {
    const results = run({ ...base, status: 'planned' })
    expect(results.every((s) => s.status === 'planned')).toBe(true)
  })

  it('trouve un outil par le nom de sa discipline', () => {
    const ids = run({ ...base, query: 'géochimie' }).map((s) => s.id)
    expect(ids).toContain('rock-eval')
  })

  it('trouve un outil par un mot-clé', () => {
    const ids = run({ ...base, query: 'tmax' }).map((s) => s.id)
    expect(ids).toContain('rock-eval')
  })

  it('renvoie une liste vide quand rien ne correspond', () => {
    expect(run({ ...base, query: 'zzzzzz' })).toEqual([])
  })
})
