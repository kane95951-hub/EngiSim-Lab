// Outils de validation des entrées numériques : fonctions pures, sans dépendance au navigateur.
// Une valeur manquante reste « manquante » : elle n'est jamais remplacée par zéro.

export type IssueCode =
  | 'missing'
  | 'notFinite'
  | 'belowMin'
  | 'notAboveMin'
  | 'aboveMax'
  | 'notBelowMax'

export interface Issue {
  field: string
  code: IssueCode
  bound?: number
}

export type Checked<T> = { ok: true; value: T } | { ok: false; issues: Issue[] }

export interface NumberRules {
  min?: number
  max?: number
  // Si vrai, la valeur doit être strictement supérieure à min (resp. inférieure à max).
  minExclusive?: boolean
  maxExclusive?: boolean
}

// Lit un nombre écrit par un humain : accepte le point ou la virgule décimale et la notation
// scientifique. Refuse les séparateurs de milliers (ambigus), le texte et les valeurs infinies.
export function parseDecimal(text: string): number | null {
  const trimmed = text.trim()
  if (!/^[+-]?(\d+([.,]\d*)?|[.,]\d+)([eE][+-]?\d+)?$/.test(trimmed)) return null
  const value = Number(trimmed.replace(',', '.'))
  return Number.isFinite(value) ? value : null
}

function fail(issue: Issue): Checked<never> {
  return { ok: false, issues: [issue] }
}

export function checkNumber(field: string, value: unknown, rules: NumberRules = {}): Checked<number> {
  if (value === undefined || value === null || value === '') return fail({ field, code: 'missing' })

  const parsed = typeof value === 'string' ? parseDecimal(value) : value
  if (typeof parsed !== 'number' || !Number.isFinite(parsed)) {
    return fail({ field, code: 'notFinite' })
  }

  if (rules.min !== undefined) {
    const tooSmall = rules.minExclusive ? parsed <= rules.min : parsed < rules.min
    if (tooSmall) {
      return fail({
        field,
        code: rules.minExclusive ? 'notAboveMin' : 'belowMin',
        bound: rules.min,
      })
    }
  }

  if (rules.max !== undefined) {
    const tooLarge = rules.maxExclusive ? parsed >= rules.max : parsed > rules.max
    if (tooLarge) {
      return fail({
        field,
        code: rules.maxExclusive ? 'notBelowMax' : 'aboveMax',
        bound: rules.max,
      })
    }
  }

  return { ok: true, value: parsed }
}

// Rassemble les problèmes de plusieurs champs pour les afficher tous en une fois.
export function gatherIssues(...results: Checked<unknown>[]): Issue[] {
  return results.flatMap((result) => (result.ok ? [] : result.issues))
}
