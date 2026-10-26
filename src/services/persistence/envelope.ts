// Enveloppe JSON versionnée des scénarios exportés/importés.
// Un fichier importé n'est jamais exécuté : il est validé (structure, version, simulateur connu).

export const ENVELOPE_KIND = 'engisim-scenario'
export const ENVELOPE_SCHEMA_VERSION = 1

export interface ScenarioEnvelope {
  kind: typeof ENVELOPE_KIND
  schemaVersion: number
  simulatorId: string
  modelVersion: string
  name: string
  createdAt: string
  updatedAt: string
  parameters: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export type EnvelopeIssueCode =
  | 'invalidJson'
  | 'notAnObject'
  | 'wrongKind'
  | 'unsupportedSchemaVersion'
  | 'missingField'
  | 'invalidField'
  | 'unknownSimulator'

export interface EnvelopeIssue {
  code: EnvelopeIssueCode
  field?: string
}

export type EnvelopeWarning = 'modelVersionMismatch'

export type EnvelopeParseResult =
  | { ok: true; envelope: ScenarioEnvelope; warnings: EnvelopeWarning[] }
  | { ok: false; issues: EnvelopeIssue[] }

const MAX_NAME_LENGTH = 200

export function createEnvelope(input: {
  simulatorId: string
  modelVersion: string
  name: string
  parameters: Record<string, unknown>
  metadata?: Record<string, unknown>
  now: Date
}): ScenarioEnvelope {
  const timestamp = input.now.toISOString()
  return {
    kind: ENVELOPE_KIND,
    schemaVersion: ENVELOPE_SCHEMA_VERSION,
    simulatorId: input.simulatorId,
    modelVersion: input.modelVersion,
    name: input.name,
    createdAt: timestamp,
    updatedAt: timestamp,
    parameters: input.parameters,
    metadata: input.metadata,
  }
}

export function serializeEnvelope(envelope: ScenarioEnvelope): string {
  return JSON.stringify(envelope, null, 2)
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readText(
  data: Record<string, unknown>,
  field: string,
  issues: EnvelopeIssue[],
): string | null {
  const value = data[field]
  if (value === undefined) {
    issues.push({ code: 'missingField', field })
    return null
  }
  if (typeof value !== 'string' || value.trim() === '') {
    issues.push({ code: 'invalidField', field })
    return null
  }
  return value
}

function readDate(
  data: Record<string, unknown>,
  field: string,
  issues: EnvelopeIssue[],
): string | null {
  const text = readText(data, field, issues)
  if (text === null) return null
  if (Number.isNaN(Date.parse(text))) {
    issues.push({ code: 'invalidField', field })
    return null
  }
  return text
}

// `knownModels` associe l'identifiant de chaque simulateur à la version actuelle de son modèle.
export function parseEnvelope(
  text: string,
  knownModels: Record<string, string>,
): EnvelopeParseResult {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, issues: [{ code: 'invalidJson' }] }
  }

  if (!isPlainObject(data)) return { ok: false, issues: [{ code: 'notAnObject' }] }
  if (data['kind'] !== ENVELOPE_KIND) {
    return { ok: false, issues: [{ code: 'wrongKind', field: 'kind' }] }
  }
  if (data['schemaVersion'] !== ENVELOPE_SCHEMA_VERSION) {
    return { ok: false, issues: [{ code: 'unsupportedSchemaVersion', field: 'schemaVersion' }] }
  }

  const issues: EnvelopeIssue[] = []
  const simulatorId = readText(data, 'simulatorId', issues)
  const modelVersion = readText(data, 'modelVersion', issues)
  const name = readText(data, 'name', issues)
  const createdAt = readDate(data, 'createdAt', issues)
  const updatedAt = readDate(data, 'updatedAt', issues)

  if (name !== null && name.length > MAX_NAME_LENGTH) {
    issues.push({ code: 'invalidField', field: 'name' })
  }

  const parameters = data['parameters']
  if (parameters === undefined) {
    issues.push({ code: 'missingField', field: 'parameters' })
  } else if (!isPlainObject(parameters)) {
    issues.push({ code: 'invalidField', field: 'parameters' })
  }

  const metadata = data['metadata']
  if (metadata !== undefined && !isPlainObject(metadata)) {
    issues.push({ code: 'invalidField', field: 'metadata' })
  }

  if (
    simulatorId !== null &&
    !Object.prototype.hasOwnProperty.call(knownModels, simulatorId)
  ) {
    issues.push({ code: 'unknownSimulator', field: 'simulatorId' })
  }

  if (
    issues.length > 0 ||
    simulatorId === null ||
    modelVersion === null ||
    name === null ||
    createdAt === null ||
    updatedAt === null ||
    !isPlainObject(parameters)
  ) {
    return { ok: false, issues }
  }

  const warnings: EnvelopeWarning[] = []
  if (knownModels[simulatorId] !== modelVersion) warnings.push('modelVersionMismatch')

  return {
    ok: true,
    warnings,
    envelope: {
      kind: ENVELOPE_KIND,
      schemaVersion: ENVELOPE_SCHEMA_VERSION,
      simulatorId,
      modelVersion,
      name,
      createdAt,
      updatedAt,
      parameters,
      metadata: isPlainObject(metadata) ? metadata : undefined,
    },
  }
}
