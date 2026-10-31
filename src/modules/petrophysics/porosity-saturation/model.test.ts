import { describe, expect, it } from 'vitest'
import { maxSupportedLevel } from '../../../science/fidelity'
import { evaluateRules } from '../../../science/interpretation'
import { REFERENCES } from '../../../science/references'
import type { Checked } from '../../../science/validation'
import { SYNTHETIC_DENSITIES, SYNTHETIC_VOLUMES } from './example'
import { POROSITY_RULES } from './interpretation'
import { meta } from './meta'
import {
  computeFromDensities,
  computeFromVolumes,
  densitySegments,
  porosityLine,
  volumeSegments,
  type DensitiesResult,
  type VolumesResult,
} from './model'

function must<T>(result: Checked<T>): T {
  if (!result.ok) throw new Error('calcul refusé : ' + JSON.stringify(result.issues))
  return result.value
}

describe('porosité par volumes', () => {
  it('calcule le cas nominal : Vpore = 20, φ = 0,20, Sw = 0,25 (valeurs calculées à la main)', () => {
    const r = must(computeFromVolumes({ vbulk: 100, vgrain: 80, vwater: 5 }))
    expect(r.vpore).toBe(20)
    expect(r.phi).toBe(0.2)
    expect(r.sw).toBe(0.25)
    expect(r.nonWaterFraction).toBe(0.75)
    expect(r.swNotComputable).toBeNull()
  })

  it('reproduit les valeurs attendues avec l’exemple synthétique de l’interface', () => {
    const r = must(computeFromVolumes(SYNTHETIC_VOLUMES))
    expect(r.phi).toBeCloseTo(0.2, 12)
    expect(r.sw).toBeCloseTo(0.25, 12)
  })

  it('accepte des textes avec virgule décimale', () => {
    const r = must(computeFromVolumes({ vbulk: '100,0', vgrain: '80,0', vwater: '5,0' }))
    expect(r.phi).toBeCloseTo(0.2, 12)
  })

  it('ne calcule pas Sw sans volume d’eau, sans le remplacer par zéro', () => {
    const r = must(computeFromVolumes({ vbulk: 100, vgrain: 80 }))
    expect(r.vwater).toBeNull()
    expect(r.sw).toBeNull()
    expect(r.swNotComputable).toBe('missingInput')
  })

  it('donne φ = 0 quand le volume des grains égale le volume total, et Sw non calculable', () => {
    const r = must(computeFromVolumes({ vbulk: 100, vgrain: 100, vwater: 0 }))
    expect(r.phi).toBe(0)
    expect(r.sw).toBeNull()
    expect(r.swNotComputable).toBe('zeroPoreVolume')
  })

  it('donne Sw = 1 quand l’eau occupe tout le volume poreux', () => {
    expect(must(computeFromVolumes({ vbulk: 100, vgrain: 80, vwater: 20 })).sw).toBe(1)
  })

  it('absorbe le bruit d’arrondi flottant sans refuser Vwater = Vpore', () => {
    // 1 − 0,8 = 0,19999999999999996 en arithmétique flottante.
    const r = must(computeFromVolumes({ vbulk: 1, vgrain: 0.8, vwater: 0.2 }))
    expect(r.sw).toBe(1)
  })

  it('refuse un volume de grains supérieur au volume total', () => {
    expect(computeFromVolumes({ vbulk: 100, vgrain: 120 })).toEqual({
      ok: false,
      issues: [{ field: 'Vgrain', code: 'aboveMax', bound: 100 }],
    })
  })

  it('refuse un volume d’eau supérieur au volume poreux', () => {
    expect(computeFromVolumes({ vbulk: 100, vgrain: 80, vwater: 25 })).toEqual({
      ok: false,
      issues: [{ field: 'Vwater', code: 'aboveMax', bound: 20 }],
    })
    expect(computeFromVolumes({ vbulk: 100, vgrain: 100, vwater: 1 }).ok).toBe(false)
  })

  it('refuse un volume total nul ou négatif et des volumes négatifs', () => {
    expect(computeFromVolumes({ vbulk: 0, vgrain: 0 })).toEqual({
      ok: false,
      issues: [{ field: 'Vbulk', code: 'notAboveMin', bound: 0 }],
    })
    expect(computeFromVolumes({ vbulk: 100, vgrain: -1 }).ok).toBe(false)
    expect(computeFromVolumes({ vbulk: 100, vgrain: 10, vwater: -1 }).ok).toBe(false)
  })

  it('signale les valeurs manquantes et non numériques, tous champs confondus', () => {
    const result = computeFromVolumes({ vbulk: 'abc', vwater: Infinity })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.issues).toEqual([
        { field: 'Vbulk', code: 'notFinite' },
        { field: 'Vgrain', code: 'missing' },
        { field: 'Vwater', code: 'notFinite' },
      ])
    }
  })

  it('ne dépend pas de l’unité de volume : φ et Sw sont inchangés quand tout est multiplié par 1000', () => {
    const small = must(computeFromVolumes({ vbulk: 100, vgrain: 80, vwater: 5 }))
    const large = must(computeFromVolumes({ vbulk: 100000, vgrain: 80000, vwater: 5000 }))
    expect(large.phi).toBeCloseTo(small.phi, 12)
    expect(large.sw).toBeCloseTo(small.sw ?? -1, 12)
  })
})

describe('porosité par densités', () => {
  it('calcule le cas nominal : φ = 350 / 1650 ≈ 0,212121', () => {
    const r = must(computeFromDensities({ rhoGrain: 2650, rhoBulk: 2300, rhoFluid: 1000 }))
    expect(r.phi).toBeCloseTo(0.2121212, 6)
  })

  it('reproduit les valeurs attendues avec l’exemple synthétique de l’interface', () => {
    expect(must(computeFromDensities(SYNTHETIC_DENSITIES)).phi).toBeCloseTo(0.2121212, 6)
  })

  it('donne φ = 0 pour ρbulk = ρgrain et φ = 1 pour ρbulk = ρfluid', () => {
    expect(must(computeFromDensities({ rhoGrain: 2650, rhoBulk: 2650, rhoFluid: 1000 })).phi).toBe(0)
    expect(must(computeFromDensities({ rhoGrain: 2650, rhoBulk: 1000, rhoFluid: 1000 })).phi).toBe(1)
  })

  it('ne dépend pas de l’unité de masse volumique (g/cm³ ou kg/m³)', () => {
    const si = must(computeFromDensities({ rhoGrain: 2650, rhoBulk: 2300, rhoFluid: 1000 }))
    const cgs = must(computeFromDensities({ rhoGrain: 2.65, rhoBulk: 2.3, rhoFluid: 1 }))
    expect(cgs.phi).toBeCloseTo(si.phi, 12)
  })

  it('refuse une masse volumique globale supérieure à celle des grains (φ négative)', () => {
    expect(computeFromDensities({ rhoGrain: 2650, rhoBulk: 2700, rhoFluid: 1000 })).toEqual({
      ok: false,
      issues: [{ field: 'ρbulk', code: 'aboveMax', bound: 2650 }],
    })
  })

  it('refuse une masse volumique globale inférieure à celle du fluide (φ > 1)', () => {
    expect(computeFromDensities({ rhoGrain: 2650, rhoBulk: 900, rhoFluid: 1000 })).toEqual({
      ok: false,
      issues: [{ field: 'ρbulk', code: 'belowMin', bound: 1000 }],
    })
  })

  it('refuse un fluide aussi dense ou plus dense que les grains', () => {
    for (const rhoFluid of [2650, 3000]) {
      expect(computeFromDensities({ rhoGrain: 2650, rhoBulk: 2300, rhoFluid })).toEqual({
        ok: false,
        issues: [{ field: 'ρfluid', code: 'notBelowMax', bound: 2650 }],
      })
    }
  })

  it('refuse des masses volumiques nulles, négatives, manquantes ou non numériques', () => {
    expect(computeFromDensities({ rhoGrain: 0, rhoBulk: 2300, rhoFluid: 1000 }).ok).toBe(false)
    expect(computeFromDensities({ rhoGrain: 2650, rhoBulk: -5, rhoFluid: 1000 }).ok).toBe(false)
    expect(computeFromDensities({ rhoGrain: 2650, rhoBulk: 2300 }).ok).toBe(false)
    expect(computeFromDensities({ rhoGrain: 'abc', rhoBulk: 2300, rhoFluid: 1000 }).ok).toBe(false)
  })

  it('diminue quand la masse volumique globale augmente', () => {
    const phi = (rhoBulk: number) =>
      must(computeFromDensities({ rhoGrain: 2650, rhoBulk, rhoFluid: 1000 })).phi
    expect(phi(2000)).toBeGreaterThan(phi(2300))
    expect(phi(2300)).toBeGreaterThan(phi(2600))
  })
})

describe('données des graphiques', () => {
  it('compose le volume total en grains, eau et pores non occupés par l’eau', () => {
    const r: VolumesResult = must(computeFromVolumes({ vbulk: 100, vgrain: 80, vwater: 5 }))
    const segments = volumeSegments(r)
    expect(segments.map((s) => s.id)).toEqual(['grain', 'water', 'otherPore'])
    const expected = [0.8, 0.05, 0.15]
    segments.forEach((segment, index) => expect(segment.fraction).toBeCloseTo(expected[index] ?? -1, 12))
    expect(segments.reduce((sum, s) => sum + s.fraction, 0)).toBeCloseTo(1, 12)
  })

  it('regroupe l’eau et les autres fluides en « pores » quand Sw n’est pas calculable', () => {
    const r = must(computeFromVolumes({ vbulk: 100, vgrain: 80 }))
    expect(volumeSegments(r).map((s) => s.id)).toEqual(['grain', 'pore'])
  })

  it('compose le volume en grains et pores pour le mode densités', () => {
    const r: DensitiesResult = must(computeFromDensities({ rhoGrain: 2650, rhoBulk: 2650, rhoFluid: 1000 }))
    expect(densitySegments(r)).toEqual([
      { id: 'grain', fraction: 1 },
      { id: 'pore', fraction: 0 },
    ])
  })

  it('trace la droite φ(ρbulk) de (ρfluid, 1) à (ρgrain, 0)', () => {
    expect(porosityLine(1000, 2650)).toEqual([
      { rho: 1000, phi: 1 },
      { rho: 2650, phi: 0 },
    ])
  })
})

describe('interprétation et fiche scientifique', () => {
  it('pose les hypothèses du mode volumes et alerte sur la saturation volumétrique', () => {
    const report = evaluateRules(
      POROSITY_RULES,
      { mode: 'volumes', phi: 0.2, sw: 0.25, waterProvided: true },
      REFERENCES,
    )
    expect(report.assumptions.map((f) => f.ruleId)).toEqual(['assume-same-unit'])
    expect(report.warnings.map((f) => f.ruleId)).toEqual(['warn-volumetric-sw', 'warn-pores'])
    expect(report.readings).toEqual([])
  })

  it('signale une porosité nulle et une saturation non calculable', () => {
    const report = evaluateRules(
      POROSITY_RULES,
      { mode: 'volumes', phi: 0, sw: null, waterProvided: true },
      REFERENCES,
    )
    expect(report.warnings.map((f) => f.ruleId)).toEqual([
      'warn-zero-porosity',
      'warn-sw-not-computable',
      'warn-pores',
    ])
  })

  it('pose les hypothèses du mode densités', () => {
    const report = evaluateRules(POROSITY_RULES, { mode: 'densities', phi: 0.21 }, REFERENCES)
    expect(report.assumptions.map((f) => f.ruleId)).toEqual(['assume-density'])
    expect(report.warnings.map((f) => f.ruleId)).toEqual(['warn-pores', 'warn-density-inputs'])
  })

  it('reste au niveau N1 tant que la référence n’est pas vérifiée', () => {
    expect(meta.id).toBe('porosity-saturation')
    expect(maxSupportedLevel(meta, REFERENCES)).toBe('N1')
  })

  it('décrit chaque grandeur avec une unité, sans symbole en double', () => {
    const symbols = meta.variables.map((v) => v.symbol)
    expect(new Set(symbols).size).toBe(symbols.length)
    for (const variable of meta.variables) expect(variable.unit.trim()).not.toBe('')
  })
})
