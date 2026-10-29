import type { Rule } from '../../../science/interpretation'

export interface VanKrevelenContext {
  total: number
  selected: number
  excluded: number
}

// Aucune « lecture » (type de kérogène, maturité) : les limites de zones ne sont pas sourcées.
export const VAN_KREVELEN_RULES: Rule<VanKrevelenContext>[] = [
  {
    id: 'obs-count',
    kind: 'observation',
    referenceIds: [],
    applies: (c) => c.total > 0,
    messageKey: 'vk.obs.count',
    params: (c) => ({ total: c.total, selected: c.selected }),
  },
  {
    id: 'assume-source',
    kind: 'assumption',
    referenceIds: [],
    applies: () => true,
    messageKey: 'vk.assume.source',
  },
  {
    id: 'assume-no-zones',
    kind: 'assumption',
    referenceIds: [],
    applies: () => true,
    messageKey: 'vk.assume.noZones',
  },
  {
    id: 'warn-maturation',
    kind: 'warning',
    referenceIds: [],
    applies: (c) => c.total > 0,
    messageKey: 'vk.warn.maturation',
  },
  {
    id: 'warn-quality',
    kind: 'warning',
    referenceIds: [],
    applies: (c) => c.total > 0,
    messageKey: 'vk.warn.quality',
  },
  {
    id: 'warn-excluded',
    kind: 'warning',
    referenceIds: [],
    applies: (c) => c.excluded > 0,
    messageKey: 'vk.warn.excluded',
    params: (c) => ({ count: c.excluded }),
  },
]
