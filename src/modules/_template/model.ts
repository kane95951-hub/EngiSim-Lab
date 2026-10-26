import { checkNumber, gatherIssues, type Checked } from '../../science/validation'

// GABARIT de moteur de calcul : fonction pure, sans DOM ni React.
// Les entrées arrivent en `unknown` (champs de formulaire, CSV, JSON importé) et sont validées ici.
export function computeRatio(a: unknown, b: unknown): Checked<{ ratio: number }> {
  const checkedA = checkNumber('a', a, { min: 0 })
  const checkedB = checkNumber('b', b, { min: 0, minExclusive: true })
  if (!checkedA.ok || !checkedB.ok) {
    return { ok: false, issues: gatherIssues(checkedA, checkedB) }
  }

  const ratio = checkedA.value / checkedB.value
  // Un résultat non fini (débordement) est refusé, jamais affiché comme un nombre.
  if (!Number.isFinite(ratio)) return { ok: false, issues: [{ field: 'ratio', code: 'notFinite' }] }

  return { ok: true, value: { ratio } }
}
