import {
  checkNumber,
  gatherIssues,
  type Checked,
  type Issue,
  type NumberRules,
} from '../../../science/validation'

// Moteur de calcul Rock-Eval : fonctions pures, sans DOM ni React.
// Convention : S1 et S2 en mg HC / g de roche ; S3 en mg CO₂ / g de roche ;
// TOC en % massique ; Tmax en °C ; HI en mg HC / g TOC ; OI en mg CO₂ / g TOC ; PI sans dimension.
//   HI = 100 × S2 / TOC     OI = 100 × S3 / TOC     PI = S1 / (S1 + S2)     S2/S3 (indicateur auxiliaire)
// Une donnée absente reste absente (null) : elle n'est jamais remplacée par zéro.

export interface RockEvalInput {
  sampleId?: unknown
  s1?: unknown
  s2?: unknown
  s3?: unknown
  toc?: unknown
  tmax?: unknown
}

export type RockEvalIndex = 'HI' | 'OI' | 'PI' | 'S2/S3'
export type NotComputableReason = 'missingInput' | 'zeroToc' | 'zeroDenominator'

export interface NotComputable {
  index: RockEvalIndex
  reason: NotComputableReason
}

export interface RockEvalResult {
  sampleId: string
  // Valeurs saisies (ou importées), après validation.
  s1: number | null
  s2: number | null
  s3: number | null
  toc: number | null
  tmax: number | null
  // Grandeurs calculées ; null si l'indice n'est pas calculable (voir notComputable).
  hi: number | null
  oi: number | null
  pi: number | null
  s2s3: number | null
  notComputable: NotComputable[]
}

// Un champ vide est accepté (valeur manquante) ; un champ rempli doit être valide.
function readOptional(field: string, value: unknown, rules: NumberRules): Checked<number | null> {
  const checked = checkNumber(field, value, rules)
  if (checked.ok) return checked
  const onlyMissing = checked.issues.length === 1 && checked.issues[0]?.code === 'missing'
  return onlyMissing ? { ok: true, value: null } : checked
}

function readSampleId(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

export function computeRockEval(input: RockEvalInput): Checked<RockEvalResult> {
  const s1 = readOptional('S1', input.s1, { min: 0 })
  const s2 = readOptional('S2', input.s2, { min: 0 })
  const s3 = readOptional('S3', input.s3, { min: 0 })
  // Une teneur massique ne peut pas dépasser 100 %.
  const toc = readOptional('TOC', input.toc, { min: 0, max: 100 })
  const tmax = readOptional('Tmax', input.tmax, { min: 0, minExclusive: true })

  if (!s1.ok || !s2.ok || !s3.ok || !toc.ok || !tmax.ok) {
    return { ok: false, issues: gatherIssues(s1, s2, s3, toc, tmax) }
  }

  if (s1.value === null && s2.value === null && s3.value === null && toc.value === null) {
    return {
      ok: false,
      issues: ['S1', 'S2', 'S3', 'TOC'].map((field): Issue => ({ field, code: 'missing' })),
    }
  }

  const notComputable: NotComputable[] = []

  let hi: number | null = null
  if (s2.value === null || toc.value === null) {
    notComputable.push({ index: 'HI', reason: 'missingInput' })
  } else if (toc.value === 0) {
    notComputable.push({ index: 'HI', reason: 'zeroToc' })
  } else {
    hi = (100 * s2.value) / toc.value
  }

  let oi: number | null = null
  if (s3.value === null || toc.value === null) {
    notComputable.push({ index: 'OI', reason: 'missingInput' })
  } else if (toc.value === 0) {
    notComputable.push({ index: 'OI', reason: 'zeroToc' })
  } else {
    oi = (100 * s3.value) / toc.value
  }

  let pi: number | null = null
  let piSum = 0
  if (s1.value === null || s2.value === null) {
    notComputable.push({ index: 'PI', reason: 'missingInput' })
  } else {
    piSum = s1.value + s2.value
    if (piSum === 0) {
      notComputable.push({ index: 'PI', reason: 'zeroDenominator' })
    } else if (Number.isFinite(piSum)) {
      pi = s1.value / piSum
    }
  }

  let s2s3: number | null = null
  if (s2.value === null || s3.value === null) {
    notComputable.push({ index: 'S2/S3', reason: 'missingInput' })
  } else if (s3.value === 0) {
    notComputable.push({ index: 'S2/S3', reason: 'zeroDenominator' })
  } else {
    s2s3 = s2.value / s3.value
  }

  // Un résultat non fini (débordement) est refusé, jamais affiché comme un nombre.
  const overflow: Issue[] = []
  if (hi !== null && !Number.isFinite(hi)) overflow.push({ field: 'HI', code: 'notFinite' })
  if (oi !== null && !Number.isFinite(oi)) overflow.push({ field: 'OI', code: 'notFinite' })
  if (!Number.isFinite(piSum)) overflow.push({ field: 'PI', code: 'notFinite' })
  if (s2s3 !== null && !Number.isFinite(s2s3)) overflow.push({ field: 'S2/S3', code: 'notFinite' })
  if (overflow.length > 0) return { ok: false, issues: overflow }

  return {
    ok: true,
    value: {
      sampleId: readSampleId(input.sampleId),
      s1: s1.value,
      s2: s2.value,
      s3: s3.value,
      toc: toc.value,
      tmax: tmax.value,
      hi,
      oi,
      pi,
      s2s3,
      notComputable,
    },
  }
}
