import type { CatalogFilters, DomainInfo, SimulatorMeta } from './types'

// Met en minuscules et retire les accents pour que « porosite » trouve « Porosité ».
export function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function buildSearchText(simulator: SimulatorMeta, domains: DomainInfo[]): string {
  const domain = domains.find((d) => d.id === simulator.domain)
  const parts = [
    simulator.id,
    simulator.name.fr,
    simulator.name.en,
    simulator.description.fr,
    simulator.description.en,
    ...simulator.keywords,
    domain?.name.fr ?? '',
    domain?.name.en ?? '',
  ]
  return normalizeText(parts.join(' '))
}

// Fonction pure : tous les mots de la requête doivent être trouvés (ET logique).
export function filterSimulators(
  simulators: SimulatorMeta[],
  domains: DomainInfo[],
  filters: CatalogFilters,
): SimulatorMeta[] {
  const tokens = normalizeText(filters.query)
    .split(/\s+/)
    .filter((token) => token.length > 0)

  return simulators.filter((simulator) => {
    if (filters.domain !== 'all' && simulator.domain !== filters.domain) return false
    if (filters.status !== 'all' && simulator.status !== filters.status) return false
    if (tokens.length === 0) return true
    const text = buildSearchText(simulator, domains)
    return tokens.every((token) => text.includes(token))
  })
}
