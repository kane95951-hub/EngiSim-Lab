import type { Rule } from '../../../science/interpretation'
import type { RockEvalResult } from './model'

// Règles d'interprétation Rock-Eval.
// Pour l'instant : hypothèses et mises en garde qualitatives uniquement. Aucune « lecture » (maturité,
// type de kérogène, origine des hydrocarbures) n'est produite : les seuils ne sont pas sourcés.
// Une future règle de type 'reading' devra citer des références vérifiées pour être affichée.
export const ROCK_EVAL_RULES: Rule<RockEvalResult>[] = [
  {
    id: 'assume-units',
    kind: 'assumption',
    referenceIds: [],
    applies: () => true,
    messageKey: 'rockeval.convention',
  },
  {
    id: 'assume-no-thresholds',
    kind: 'assumption',
    referenceIds: [],
    applies: () => true,
    messageKey: 'rockeval.assume.noThresholds',
  },
  {
    id: 'warn-tmax-missing',
    kind: 'warning',
    referenceIds: [],
    applies: (r) => r.tmax === null,
    messageKey: 'rockeval.warn.tmaxMissing',
  },
  {
    id: 'warn-tmax-fragile',
    kind: 'warning',
    referenceIds: [],
    applies: (r) => r.tmax !== null,
    messageKey: 'rockeval.warn.tmaxFragile',
  },
  {
    id: 'warn-hi-oi-missing',
    kind: 'warning',
    referenceIds: [],
    applies: (r) => r.hi === null || r.oi === null,
    messageKey: 'rockeval.warn.hiOiMissing',
  },
  {
    id: 'warn-indices-depend',
    kind: 'warning',
    referenceIds: [],
    applies: (r) => r.hi !== null || r.oi !== null,
    messageKey: 'rockeval.warn.indicesDepend',
  },
  {
    id: 'warn-pi-undefined',
    kind: 'warning',
    referenceIds: [],
    applies: (r) => r.pi === null,
    messageKey: 'rockeval.warn.piUndefined',
  },
  {
    id: 'warn-pi-causes',
    kind: 'warning',
    referenceIds: [],
    applies: (r) => r.pi !== null,
    messageKey: 'rockeval.warn.piCauses',
  },
  {
    id: 'warn-s2s3-zero',
    kind: 'warning',
    referenceIds: [],
    applies: (r) => r.s3 === 0,
    messageKey: 'rockeval.warn.s2s3Zero',
  },
]
