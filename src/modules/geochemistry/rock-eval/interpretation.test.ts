import { describe, expect, it } from 'vitest'
import { evaluateRules } from '../../../science/interpretation'
import { REFERENCES } from '../../../science/references'
import { maxSupportedLevel } from '../../../science/fidelity'
import type { Checked } from '../../../science/validation'
import { ROCK_EVAL_RULES } from './interpretation'
import { meta } from './meta'
import { computeRockEval, type RockEvalResult } from './model'

function must(result: Checked<RockEvalResult>): RockEvalResult {
  if (!result.ok) throw new Error('calcul refusé : ' + JSON.stringify(result.issues))
  return result.value
}

function ids(findings: { ruleId: string }[]): string[] {
  return findings.map((f) => f.ruleId)
}

describe('Rock-Eval : interprétation', () => {
  it('pose les hypothèses d’unités et l’absence de seuils, sans lecture', () => {
    const r = must(computeRockEval({ s1: 0.5, s2: 8, s3: 1, toc: 2, tmax: 440 }))
    const report = evaluateRules(ROCK_EVAL_RULES, r, REFERENCES)
    expect(ids(report.assumptions)).toEqual(['assume-units', 'assume-no-thresholds'])
    expect(report.readings).toEqual([])
    expect(report.withheld).toEqual([])
  })

  it('met en garde sur Tmax, PI, HI et OI pour le cas nominal', () => {
    const r = must(computeRockEval({ s1: 0.5, s2: 8, s3: 1, toc: 2, tmax: 440 }))
    const report = evaluateRules(ROCK_EVAL_RULES, r, REFERENCES)
    expect(ids(report.warnings)).toEqual(['warn-tmax-fragile', 'warn-indices-depend', 'warn-pi-causes'])
  })

  it('signale un Tmax absent au lieu d’évaluer la maturité', () => {
    const r = must(computeRockEval({ s1: 0.5, s2: 8, s3: 1, toc: 2 }))
    const warnings = ids(evaluateRules(ROCK_EVAL_RULES, r, REFERENCES).warnings)
    expect(warnings).toContain('warn-tmax-missing')
    expect(warnings).not.toContain('warn-tmax-fragile')
  })

  it('signale HI/OI non calculables et un PI indéfini', () => {
    const r = must(computeRockEval({ s1: 0, s2: 0, toc: 0 }))
    const warnings = ids(evaluateRules(ROCK_EVAL_RULES, r, REFERENCES).warnings)
    expect(warnings).toContain('warn-hi-oi-missing')
    expect(warnings).toContain('warn-pi-undefined')
    expect(warnings).not.toContain('warn-pi-causes')
  })

  it('signale S3 nul', () => {
    const r = must(computeRockEval({ s1: 0.5, s2: 8, s3: 0, toc: 2, tmax: 440 }))
    const warnings = ids(evaluateRules(ROCK_EVAL_RULES, r, REFERENCES).warnings)
    expect(warnings).toContain('warn-s2s3-zero')
  })

  it('est déterministe', () => {
    const r = must(computeRockEval({ s1: 0.5, s2: 8, s3: 1, toc: 2, tmax: 440 }))
    expect(evaluateRules(ROCK_EVAL_RULES, r, REFERENCES)).toEqual(
      evaluateRules(ROCK_EVAL_RULES, r, REFERENCES),
    )
  })
})

describe('Rock-Eval : fiche scientifique', () => {
  it('reste au niveau N1 tant que les références ne sont pas vérifiées', () => {
    expect(maxSupportedLevel(meta, REFERENCES)).toBe('N1')
  })

  it('décrit chaque grandeur avec une unité et un identifiant de modèle cohérent', () => {
    expect(meta.id).toBe('rock-eval')
    const symbols = meta.variables.map((v) => v.symbol)
    expect(new Set(symbols).size).toBe(symbols.length)
    for (const symbol of ['S1', 'S2', 'S3', 'TOC', 'Tmax', 'HI', 'OI', 'PI']) {
      expect(symbols).toContain(symbol)
    }
    for (const variable of meta.variables) expect(variable.unit.trim()).not.toBe('')
  })
})
