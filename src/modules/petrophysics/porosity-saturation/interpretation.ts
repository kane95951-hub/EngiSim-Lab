import type { Rule } from '../../../science/interpretation'

export type PorosityContext =
  | { mode: 'volumes'; phi: number; sw: number | null; waterProvided: boolean }
  | { mode: 'densities'; phi: number }

// Aucune « lecture » (qualité de réservoir, classe de porosité) : aucune classification n'est sourcée.
export const POROSITY_RULES: Rule<PorosityContext>[] = [
  {
    id: 'assume-same-unit',
    kind: 'assumption',
    referenceIds: [],
    applies: (c) => c.mode === 'volumes',
    messageKey: 'porosity.assume.sameUnit',
  },
  {
    id: 'assume-density',
    kind: 'assumption',
    referenceIds: [],
    applies: (c) => c.mode === 'densities',
    messageKey: 'porosity.assume.density',
  },
  {
    id: 'warn-zero-porosity',
    kind: 'warning',
    referenceIds: [],
    applies: (c) => c.phi === 0,
    messageKey: 'porosity.warn.zeroPorosity',
  },
  {
    id: 'warn-sw-not-computable',
    kind: 'warning',
    referenceIds: [],
    applies: (c) => c.mode === 'volumes' && c.waterProvided && c.sw === null,
    messageKey: 'porosity.warn.swNotComputable',
  },
  {
    id: 'warn-volumetric-sw',
    kind: 'warning',
    referenceIds: [],
    applies: (c) => c.mode === 'volumes' && c.sw !== null,
    messageKey: 'porosity.warn.volumetricSw',
  },
  {
    id: 'warn-pores',
    kind: 'warning',
    referenceIds: [],
    applies: () => true,
    messageKey: 'porosity.warn.pores',
  },
  {
    id: 'warn-density-inputs',
    kind: 'warning',
    referenceIds: [],
    applies: (c) => c.mode === 'densities',
    messageKey: 'porosity.warn.densityInputs',
  },
]
