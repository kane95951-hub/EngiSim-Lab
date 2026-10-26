import { describe, expect, it } from 'vitest'
import { evaluateRules, type Rule } from './interpretation'
import type { Reference } from './types'

interface Context {
  value: number
}

const references: Reference[] = [
  { id: 'R1', citation: 'Source fictive de test', status: 'verified', verifiedOn: '2026-10-22' },
  { id: 'R2', citation: 'Source fictive non vérifiée', status: 'unverified' },
  { id: 'R3', citation: 'Autre source fictive de test', status: 'verified', verifiedOn: '2026-10-22' },
]

// Les clés de message ci-dessous existent déjà dans le dictionnaire ; leur texte n'a pas d'importance ici.
const rules: Rule<Context>[] = [
  {
    id: 'obs-high',
    kind: 'observation',
    referenceIds: [],
    applies: (c) => c.value > 3,
    messageKey: 'status.available',
    params: (c) => ({ value: c.value }),
  },
  {
    id: 'reading-ok',
    kind: 'reading',
    referenceIds: ['R1'],
    applies: (c) => c.value > 3,
    messageKey: 'status.prototype',
  },
  {
    id: 'reading-unverified',
    kind: 'reading',
    referenceIds: ['R2'],
    applies: (c) => c.value > 3,
    messageKey: 'status.planned',
  },
  {
    id: 'reading-unsourced',
    kind: 'reading',
    referenceIds: [],
    applies: () => true,
    messageKey: 'status.planned',
  },
  {
    id: 'warn-negative',
    kind: 'warning',
    referenceIds: [],
    applies: (c) => c.value < 0,
    messageKey: 'catalog.empty',
  },
  {
    id: 'assume',
    kind: 'assumption',
    referenceIds: ['R1'],
    applies: () => true,
    messageKey: 'catalog.reset',
  },
]

describe('evaluateRules', () => {
  it('classe les résultats par nature et calcule les paramètres', () => {
    const report = evaluateRules(rules, { value: 5 }, references)
    expect(report.observations.map((f) => f.ruleId)).toEqual(['obs-high'])
    expect(report.observations[0]?.params).toEqual({ value: 5 })
    expect(report.assumptions.map((f) => f.ruleId)).toEqual(['assume'])
    expect(report.warnings).toEqual([])
  })

  it('affiche une lecture prudente seulement si toutes ses références sont vérifiées', () => {
    const report = evaluateRules(rules, { value: 5 }, references)
    expect(report.readings.map((f) => f.ruleId)).toEqual(['reading-ok'])
  })

  it('retient une lecture dont la source n’est pas vérifiée ou absente', () => {
    const report = evaluateRules(rules, { value: 5 }, references)
    expect(report.withheld).toEqual(['reading-unverified', 'reading-unsourced'])
  })

  it('ignore les règles qui ne s’appliquent pas', () => {
    const report = evaluateRules(rules, { value: 1 }, references)
    expect(report.observations).toEqual([])
    expect(report.readings).toEqual([])
    expect(report.withheld).toEqual(['reading-unsourced'])
  })

  it('liste sans doublon et dans l’ordre les références effectivement utilisées', () => {
    const custom: Rule<Context>[] = [
      {
        id: 'r',
        kind: 'reading',
        referenceIds: ['R3', 'R1'],
        applies: () => true,
        messageKey: 'status.available',
      },
    ]
    expect(evaluateRules(custom, { value: 0 }, references).referenceIds).toEqual(['R1', 'R3'])
    expect(evaluateRules(rules, { value: 5 }, references).referenceIds).toEqual(['R1'])
  })

  it('est déterministe : mêmes entrées, même rapport', () => {
    expect(evaluateRules(rules, { value: 5 }, references)).toEqual(
      evaluateRules(rules, { value: 5 }, references),
    )
  })
})
