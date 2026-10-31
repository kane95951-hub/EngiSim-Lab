import {
  checkNumber,
  checkOptionalNumber,
  gatherIssues,
  type Checked,
  type Issue,
} from '../../../science/validation'

// Moteur de calcul : porosité et saturation en eau (fonctions pures, sans DOM ni React).
//
// Mode volumes :   Vpore = Vbulk − Vgrain    φ = Vpore / Vbulk    Sw = Vwater / Vpore
// Mode densités :  φ = (ρgrain − ρbulk) / (ρgrain − ρfluid)
//
// Hypothèses : les volumes (resp. les masses volumiques) sont exprimés dans la même unité, φ et Sw sont sans
// dimension. Sw est ici la saturation VOLUMÉTRIQUE (eau mesurée / volume poreux), distincte de la saturation
// déduite des résistivités (loi d'Archie, outil ultérieur). En mode densités, la matrice est supposée homogène et les
// pores remplis d'un seul fluide de masse volumique connue.

// Tolérance relative (à Vbulk) qui absorbe uniquement le bruit d'arrondi flottant dans la comparaison Vwater ≤ Vpore.
const FLOAT_TOLERANCE = 1e-9

export interface VolumesInput {
  vbulk?: unknown
  vgrain?: unknown
  vwater?: unknown
}

export type SwReason = 'missingInput' | 'zeroPoreVolume'

export interface VolumesResult {
  vbulk: number
  vgrain: number
  vwater: number | null
  vpore: number
  phi: number
  // Saturation en eau (fraction) ; null si elle n'est pas calculable.
  sw: number | null
  // 1 − Sw : part du volume poreux non occupée par l'eau.
  nonWaterFraction: number | null
  swNotComputable: SwReason | null
}

export function computeFromVolumes(input: VolumesInput): Checked<VolumesResult> {
  const vbulk = checkNumber('Vbulk', input.vbulk, { min: 0, minExclusive: true })
  const vgrain = checkNumber('Vgrain', input.vgrain, { min: 0 })
  const vwater = checkOptionalNumber('Vwater', input.vwater, { min: 0 })
  if (!vbulk.ok || !vgrain.ok || !vwater.ok) {
    return { ok: false, issues: gatherIssues(vbulk, vgrain, vwater) }
  }

  if (vgrain.value > vbulk.value) {
    return {
      ok: false,
      issues: [{ field: 'Vgrain', code: 'aboveMax', bound: vbulk.value }],
    }
  }

  const vpore = vbulk.value - vgrain.value
  const phi = vpore / vbulk.value

  if (vwater.value !== null && vwater.value - vpore > FLOAT_TOLERANCE * vbulk.value) {
    return { ok: false, issues: [{ field: 'Vwater', code: 'aboveMax', bound: vpore }] }
  }

  let sw: number | null = null
  let swNotComputable: SwReason | null = null
  if (vwater.value === null) {
    swNotComputable = 'missingInput'
  } else if (vpore === 0) {
    swNotComputable = 'zeroPoreVolume'
  } else {
    // Le minimum ramène à 1 un dépassement dû uniquement à l'arrondi flottant.
    sw = Math.min(1, vwater.value / vpore)
  }

  return {
    ok: true,
    value: {
      vbulk: vbulk.value,
      vgrain: vgrain.value,
      vwater: vwater.value,
      vpore,
      phi,
      sw,
      nonWaterFraction: sw === null ? null : 1 - sw,
      swNotComputable,
    },
  }
}

export interface DensitiesInput {
  rhoGrain?: unknown
  rhoBulk?: unknown
  rhoFluid?: unknown
}

export interface DensitiesResult {
  rhoGrain: number
  rhoBulk: number
  rhoFluid: number
  phi: number
}

export function computeFromDensities(input: DensitiesInput): Checked<DensitiesResult> {
  const rhoGrain = checkNumber('ρgrain', input.rhoGrain, { min: 0, minExclusive: true })
  const rhoBulk = checkNumber('ρbulk', input.rhoBulk, { min: 0, minExclusive: true })
  const rhoFluid = checkNumber('ρfluid', input.rhoFluid, { min: 0, minExclusive: true })
  if (!rhoGrain.ok || !rhoBulk.ok || !rhoFluid.ok) {
    return { ok: false, issues: gatherIssues(rhoGrain, rhoBulk, rhoFluid) }
  }

  // Le fluide doit être moins dense que les grains, sinon le dénominateur est nul ou négatif.
  if (rhoFluid.value >= rhoGrain.value) {
    return {
      ok: false,
      issues: [{ field: 'ρfluid', code: 'notBelowMax', bound: rhoGrain.value }],
    }
  }

  // ρbulk entre ρfluid et ρgrain garantit 0 ≤ φ ≤ 1 : toute autre valeur est physiquement incohérente.
  const issues: Issue[] = []
  if (rhoBulk.value > rhoGrain.value) {
    issues.push({ field: 'ρbulk', code: 'aboveMax', bound: rhoGrain.value })
  }
  if (rhoBulk.value < rhoFluid.value) {
    issues.push({ field: 'ρbulk', code: 'belowMin', bound: rhoFluid.value })
  }
  if (issues.length > 0) return { ok: false, issues }

  const phi = (rhoGrain.value - rhoBulk.value) / (rhoGrain.value - rhoFluid.value)
  return {
    ok: true,
    value: { rhoGrain: rhoGrain.value, rhoBulk: rhoBulk.value, rhoFluid: rhoFluid.value, phi },
  }
}

// Données des graphiques ---------------------------------------------------------------------------------

export type SegmentId = 'grain' | 'water' | 'otherPore' | 'pore'

export interface Segment {
  id: SegmentId
  // Fraction du volume total (0 à 1).
  fraction: number
}

export function volumeSegments(result: VolumesResult): Segment[] {
  const grain: Segment = { id: 'grain', fraction: 1 - result.phi }
  if (result.sw === null) return [grain, { id: 'pore', fraction: result.phi }]
  return [
    grain,
    { id: 'water', fraction: result.phi * result.sw },
    { id: 'otherPore', fraction: result.phi * (1 - result.sw) },
  ]
}

export function densitySegments(result: DensitiesResult): Segment[] {
  return [
    { id: 'grain', fraction: 1 - result.phi },
    { id: 'pore', fraction: result.phi },
  ]
}

export interface LinePoint {
  rho: number
  phi: number
}

// Droite φ(ρbulk) : φ = 1 pour ρbulk = ρfluid et φ = 0 pour ρbulk = ρgrain.
export function porosityLine(rhoFluid: number, rhoGrain: number): [LinePoint, LinePoint] {
  return [
    { rho: rhoFluid, phi: 1 },
    { rho: rhoGrain, phi: 0 },
  ]
}
