import type { FidelityLevel } from '../catalog/types'
import type { ModelMeta, Reference } from './types'

const RANK: Record<FidelityLevel, number> = { N1: 1, N2: 2, N3: 3 }

export function levelRank(level: FidelityLevel): number {
  return RANK[level]
}

function isVerified(referenceId: string, references: Reference[]): boolean {
  return references.some((reference) => reference.id === referenceId && reference.status === 'verified')
}

// Niveau maximal que les preuves enregistrées permettent d'annoncer :
// - N1 par défaut ;
// - N2 si toutes les équations ont au moins une référence et que toutes ces références sont vérifiées ;
// - N3 si, en plus, un cas de validation (source vérifiée) est reproduit dans sa tolérance.
// Les tests unitaires du modèle restent une condition du niveau N2, vérifiée lors de la revue du lot.
export function maxSupportedLevel(meta: ModelMeta, references: Reference[]): FidelityLevel {
  const equationsSourced =
    meta.formulas.length > 0 &&
    meta.formulas.every(
      (formula) =>
        formula.referenceIds.length > 0 &&
        formula.referenceIds.every((id) => isVerified(id, references)),
    )
  if (!equationsSourced) return 'N1'

  const hasValidation = meta.validationCases.some(
    (c) =>
      isVerified(c.referenceId, references) &&
      Number.isFinite(c.expected) &&
      Number.isFinite(c.computed) &&
      Number.isFinite(c.tolerance) &&
      c.tolerance >= 0 &&
      Math.abs(c.computed - c.expected) <= c.tolerance,
  )
  return hasValidation ? 'N3' : 'N2'
}

export function isLevelSupported(
  declared: FidelityLevel,
  meta: ModelMeta,
  references: Reference[],
): boolean {
  return levelRank(declared) <= levelRank(maxSupportedLevel(meta, references))
}
