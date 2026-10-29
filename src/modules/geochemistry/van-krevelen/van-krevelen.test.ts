import { describe, expect, it } from 'vitest'
import { parseCsv } from '../../../services/import-export/csv'
import { parseEnvelope } from '../../../services/persistence/envelope'
import { evaluateRules } from '../../../science/interpretation'
import { maxSupportedLevel } from '../../../science/fidelity'
import { REFERENCES } from '../../../science/references'
import type { Sample } from '../rock-eval/samples'
import { SAMPLES_CSV_HEADER, buildSamplesCsv, buildScenario } from './export'
import { VAN_KREVELEN_RULES } from './interpretation'
import { meta } from './meta'

const samples: Sample[] = [
  { key: 'csv:2', label: 'SYN-01', origin: 'csv', line: 2, hi: 400, oi: 50, pi: 0.05, tmax: 440 },
  { key: 'csv:3', label: '=cmd', origin: 'csv', line: 3, hi: 227, oi: 53, pi: null, tmax: null },
  { key: 'manual:1', label: '', origin: 'manual', line: null, hi: 100, oi: 10, pi: null, tmax: null },
]

describe('export des échantillons', () => {
  it('écrit un CSV relisible avec des colonnes stables et la sélection', () => {
    const table = parseCsv(buildSamplesCsv(samples, new Set(['csv:2'])), ',')
    expect(table.rows[0]).toEqual(SAMPLES_CSV_HEADER)
    expect(table.rows).toHaveLength(4)
    expect(table.rows[1]).toEqual(['csv:2', 'SYN-01', 'csv', '2', '400', '50', '0.05', '440', 'true'])
    expect(table.rows[3]).toEqual(['manual:1', '', 'manual', '', '100', '10', '', '', 'false'])
  })

  it('protège les identifiants qui ressemblent à une formule', () => {
    const table = parseCsv(buildSamplesCsv(samples, new Set()), ',')
    expect(table.rows[2]?.[1]).toBe("'=cmd")
  })
})

describe('scénario exporté', () => {
  const scenario = buildScenario({
    samples,
    selectedKeys: ['csv:2'],
    name: 'Essai',
    now: new Date('2026-10-29T08:00:00Z'),
  })

  it('utilise l’identifiant et la version du modèle', () => {
    expect(scenario.simulatorId).toBe('van-krevelen')
    expect(scenario.modelVersion).toBe(meta.modelVersion)
  })

  it('est relu sans avertissement par la validation d’import', () => {
    const parsed = parseEnvelope(JSON.stringify(scenario), { 'van-krevelen': meta.modelVersion })
    expect(parsed.ok).toBe(true)
    if (parsed.ok) {
      expect(parsed.warnings).toEqual([])
      expect(parsed.envelope.parameters['selectedKeys']).toEqual(['csv:2'])
      expect((parsed.envelope.parameters['samples'] as unknown[]).length).toBe(3)
    }
  })
})

describe('interprétation du diagramme', () => {
  it('pose les hypothèses et les mises en garde, sans aucune lecture de zone', () => {
    const report = evaluateRules(VAN_KREVELEN_RULES, { total: 5, selected: 2, excluded: 2 }, REFERENCES)
    expect(report.assumptions.map((f) => f.ruleId)).toEqual(['assume-source', 'assume-no-zones'])
    expect(report.warnings.map((f) => f.ruleId)).toEqual(['warn-maturation', 'warn-quality', 'warn-excluded'])
    expect(report.observations[0]?.params).toEqual({ total: 5, selected: 2 })
    expect(report.readings).toEqual([])
    expect(report.withheld).toEqual([])
  })

  it('n’affiche ni observation ni alerte de données quand il n’y a aucun point', () => {
    const report = evaluateRules(VAN_KREVELEN_RULES, { total: 0, selected: 0, excluded: 0 }, REFERENCES)
    expect(report.observations).toEqual([])
    expect(report.warnings).toEqual([])
  })
})

describe('fiche scientifique', () => {
  it('reste au niveau N1 tant que les références ne sont pas vérifiées', () => {
    expect(meta.id).toBe('van-krevelen')
    expect(maxSupportedLevel(meta, REFERENCES)).toBe('N1')
  })

  it('annonce qu’aucune zone n’est dessinée', () => {
    expect(meta.limitations.some((l) => l.fr.includes('Aucune zone'))).toBe(true)
  })
})
