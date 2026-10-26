import { describe, expect, it } from 'vitest'
import {
  ENVELOPE_KIND,
  ENVELOPE_SCHEMA_VERSION,
  createEnvelope,
  parseEnvelope,
  serializeEnvelope,
} from './envelope'

const known = { demo: '1.0.0' }

const base = createEnvelope({
  simulatorId: 'demo',
  modelVersion: '1.0.0',
  name: 'Essai',
  parameters: { a: 1, b: 'deux' },
  metadata: { note: 'synthétique' },
  now: new Date('2026-10-22T10:00:00Z'),
})

function parseModified(changes: Record<string, unknown>) {
  return parseEnvelope(JSON.stringify({ ...base, ...changes }), known)
}

describe('enveloppe de scénario', () => {
  it('relit à l’identique un scénario exporté', () => {
    const result = parseEnvelope(serializeEnvelope(base), known)
    expect(result).toEqual({ ok: true, envelope: base, warnings: [] })
  })

  it('crée une enveloppe versionnée avec des dates identiques', () => {
    expect(base.kind).toBe(ENVELOPE_KIND)
    expect(base.schemaVersion).toBe(ENVELOPE_SCHEMA_VERSION)
    expect(base.createdAt).toBe('2026-10-22T10:00:00.000Z')
    expect(base.updatedAt).toBe(base.createdAt)
  })

  it('refuse un texte qui n’est pas du JSON', () => {
    expect(parseEnvelope('{pas du json', known)).toEqual({
      ok: false,
      issues: [{ code: 'invalidJson' }],
    })
  })

  it('refuse un JSON qui n’est pas un objet', () => {
    for (const text of ['[]', 'null', '42', '"texte"']) {
      expect(parseEnvelope(text, known)).toEqual({ ok: false, issues: [{ code: 'notAnObject' }] })
    }
  })

  it('refuse un fichier d’un autre type', () => {
    expect(parseModified({ kind: 'autre-chose' })).toEqual({
      ok: false,
      issues: [{ code: 'wrongKind', field: 'kind' }],
    })
  })

  it('refuse une version de format inconnue', () => {
    expect(parseModified({ schemaVersion: 2 })).toEqual({
      ok: false,
      issues: [{ code: 'unsupportedSchemaVersion', field: 'schemaVersion' }],
    })
  })

  it('signale un champ obligatoire manquant', () => {
    const copy: Record<string, unknown> = { ...base }
    delete copy['name']
    const result = parseEnvelope(JSON.stringify(copy), known)
    expect(result).toEqual({ ok: false, issues: [{ code: 'missingField', field: 'name' }] })
  })

  it('signale un nom vide, trop long ou une date invalide', () => {
    expect(parseModified({ name: '   ' })).toEqual({
      ok: false,
      issues: [{ code: 'invalidField', field: 'name' }],
    })
    expect(parseModified({ name: 'x'.repeat(201) })).toEqual({
      ok: false,
      issues: [{ code: 'invalidField', field: 'name' }],
    })
    expect(parseModified({ createdAt: 'pas une date' })).toEqual({
      ok: false,
      issues: [{ code: 'invalidField', field: 'createdAt' }],
    })
  })

  it('refuse des paramètres ou des métadonnées qui ne sont pas des objets', () => {
    expect(parseModified({ parameters: [1, 2] })).toEqual({
      ok: false,
      issues: [{ code: 'invalidField', field: 'parameters' }],
    })
    expect(parseModified({ metadata: 'texte' })).toEqual({
      ok: false,
      issues: [{ code: 'invalidField', field: 'metadata' }],
    })
  })

  it('refuse un simulateur inconnu', () => {
    expect(parseModified({ simulatorId: 'inconnu' })).toEqual({
      ok: false,
      issues: [{ code: 'unknownSimulator', field: 'simulatorId' }],
    })
    expect(parseModified({ simulatorId: 'toString' })).toEqual({
      ok: false,
      issues: [{ code: 'unknownSimulator', field: 'simulatorId' }],
    })
  })

  it('signale un changement de version du modèle sans charger en silence', () => {
    const result = parseModified({ modelVersion: '0.9.0' })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.warnings).toEqual(['modelVersionMismatch'])
  })

  it('ne conserve pas les champs inattendus', () => {
    const result = parseModified({ intrus: 'x' })
    expect(result.ok).toBe(true)
    if (result.ok) expect(Object.keys(result.envelope)).not.toContain('intrus')
  })
})
