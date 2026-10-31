import type { ModelMeta } from '../science/types'
import { meta as rockEvalMeta } from './geochemistry/rock-eval/meta'
import { meta as vanKrevelenMeta } from './geochemistry/van-krevelen/meta'
import { meta as porosityMeta } from './petrophysics/porosity-saturation/meta'

// Registre des métadonnées scientifiques des outils réellement implémentés.
// Ajouter ici la fiche (meta) de chaque nouvel outil, voir docs/NOUVEL-OUTIL.md.
// Le dossier _template est un exemple à copier : il n'est volontairement PAS enregistré ici.
export const MODEL_METAS: ModelMeta[] = [rockEvalMeta, vanKrevelenMeta, porosityMeta]
