import { createEnvelope, type ScenarioEnvelope } from '../../../services/persistence/envelope'
import { neutralizeFormula, toCsv } from '../../../services/import-export/csv'
import type { Sample } from '../rock-eval/samples'
import { meta } from './meta'

function numberText(value: number | null): string {
  return value === null ? '' : String(value)
}

// Noms de colonnes stables, identiques en français et en anglais.
export const SAMPLES_CSV_HEADER = [
  'key',
  'sample_label',
  'origin',
  'line',
  'HI_mg_HC_per_g_TOC',
  'OI_mg_CO2_per_g_TOC',
  'PI',
  'Tmax_C',
  'selected',
]

export function buildSamplesCsv(samples: Sample[], selectedKeys: ReadonlySet<string>): string {
  const table: string[][] = [SAMPLES_CSV_HEADER]
  for (const s of samples) {
    table.push([
      s.key,
      neutralizeFormula(s.label),
      s.origin,
      s.line === null ? '' : String(s.line),
      String(s.hi),
      String(s.oi),
      numberText(s.pi),
      numberText(s.tmax),
      selectedKeys.has(s.key) ? 'true' : 'false',
    ])
  }
  return toCsv(table, ',')
}

// Scénario exportable : échantillons tracés et sélection, dans l'enveloppe JSON versionnée.
export function buildScenario(input: {
  samples: Sample[]
  selectedKeys: string[]
  name: string
  now: Date
}): ScenarioEnvelope {
  return createEnvelope({
    simulatorId: meta.id,
    modelVersion: meta.modelVersion,
    name: input.name,
    parameters: {
      samples: input.samples.map((s) => ({ ...s })),
      selectedKeys: [...input.selectedKeys],
    },
    metadata: { generatedBy: 'EngiSim Lab', source: 'rock-eval' },
    now: input.now,
  })
}
