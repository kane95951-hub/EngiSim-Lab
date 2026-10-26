import type { MessageKey } from '../i18n/fr'
import type { Reference } from './types'

// Mécanisme d'interprétation : règles explicites et déterministes, sans modèle de langage.
// Une règle « reading » (lecture prudente) n'est affichée que si TOUTES ses références sont vérifiées.
// Sinon elle est retenue (« withheld ») et l'interface l'indique, sans conclusion non sourcée.

export type FindingKind = 'observation' | 'reading' | 'assumption' | 'warning'

export interface Finding {
  ruleId: string
  kind: FindingKind
  messageKey: MessageKey
  params?: Record<string, string | number>
  referenceIds: string[]
}

export interface Rule<Context> {
  id: string
  kind: FindingKind
  referenceIds: string[]
  applies: (context: Context) => boolean
  messageKey: MessageKey
  params?: (context: Context) => Record<string, string | number>
}

export interface InterpretationReport {
  observations: Finding[]
  readings: Finding[]
  assumptions: Finding[]
  warnings: Finding[]
  withheld: string[]
  referenceIds: string[]
}

const LIST_BY_KIND = {
  observation: 'observations',
  reading: 'readings',
  assumption: 'assumptions',
  warning: 'warnings',
} as const

export function evaluateRules<Context>(
  rules: Rule<Context>[],
  context: Context,
  references: Reference[],
): InterpretationReport {
  const report: InterpretationReport = {
    observations: [],
    readings: [],
    assumptions: [],
    warnings: [],
    withheld: [],
    referenceIds: [],
  }
  const used = new Set<string>()

  for (const rule of rules) {
    if (!rule.applies(context)) continue

    if (rule.kind === 'reading') {
      const sourced =
        rule.referenceIds.length > 0 &&
        rule.referenceIds.every((id) =>
          references.some((reference) => reference.id === id && reference.status === 'verified'),
        )
      if (!sourced) {
        report.withheld.push(rule.id)
        continue
      }
    }

    report[LIST_BY_KIND[rule.kind]].push({
      ruleId: rule.id,
      kind: rule.kind,
      messageKey: rule.messageKey,
      params: rule.params ? rule.params(context) : undefined,
      referenceIds: rule.referenceIds,
    })
    for (const id of rule.referenceIds) used.add(id)
  }

  report.referenceIds = [...used].sort()
  return report
}
