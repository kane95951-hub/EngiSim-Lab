import type { Reference } from './types'

// Registre des références (miroir de docs/SOURCES.md).
// Règle : passer un statut à « verified » seulement après consultation réelle du document,
// avec la date dans `verifiedOn` et la citation complète.
export const REFERENCES: Reference[] = [
  {
    id: 'REF-PETERS-1986',
    citation:
      'Peters, 1986, Guidelines for Evaluating Petroleum Source Rock Using Programmed Pyrolysis',
    status: 'unverified',
  },
  {
    id: 'REF-ESPITALIE',
    citation: 'Espitalié et collaborateurs, travaux sur la pyrolyse Rock-Eval (article à identifier)',
    status: 'unverified',
  },
  {
    id: 'REF-ARCHIE-1942',
    citation:
      'Archie, 1942, The Electrical Resistivity Log as an Aid in Determining Some Reservoir Characteristics',
    status: 'unverified',
  },
  {
    id: 'REF-DARCY',
    citation: 'Formulation de la loi de Darcy (manuel de référence à identifier)',
    status: 'to-source',
  },
  {
    id: 'REF-PETROPHYSICS',
    citation:
      'Définitions de la porosité, de la saturation et de la porosité par densités (manuel de pétrophysique à identifier)',
    status: 'to-source',
  },
  {
    id: 'REF-VK',
    citation: 'Source des domaines de types de matière organique du diagramme HI–OI (à identifier)',
    status: 'to-source',
  },
  {
    id: 'REF-ARRH',
    citation: 'Cinétique d’Arrhenius et paramètres A et Ea (source à identifier)',
    status: 'to-source',
  },
]

export function findReference(id: string): Reference | undefined {
  return REFERENCES.find((reference) => reference.id === id)
}
