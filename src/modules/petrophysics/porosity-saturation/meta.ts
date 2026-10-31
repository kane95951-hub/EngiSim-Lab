import type { ModelMeta } from '../../../science/types'

// Fiche scientifique : porosité et saturation en eau volumétrique.
// La référence (REF-PETROPHYSICS) est à identifier : niveau N1 tant qu'elle n'est pas vérifiée.
export const meta: ModelMeta = {
  id: 'porosity-saturation',
  modelVersion: '0.1.0',
  variables: [
    {
      symbol: 'Vbulk',
      name: { fr: 'Volume total (roche)', en: 'Bulk volume (rock)' },
      unit: 'm³, cm³, mL ou L (une seule unité)',
      role: 'input',
      admissible: { fr: 'Vbulk > 0', en: 'Vbulk > 0' },
    },
    {
      symbol: 'Vgrain',
      name: { fr: 'Volume des grains (solide)', en: 'Grain (solid) volume' },
      unit: 'même unité que Vbulk',
      role: 'input',
      admissible: { fr: '0 ≤ Vgrain ≤ Vbulk', en: '0 ≤ Vgrain ≤ Vbulk' },
    },
    {
      symbol: 'Vwater',
      name: { fr: 'Volume d’eau (optionnel)', en: 'Water volume (optional)' },
      unit: 'même unité que Vbulk',
      role: 'input',
      admissible: { fr: '0 ≤ Vwater ≤ Vpore', en: '0 ≤ Vwater ≤ Vpore' },
    },
    {
      symbol: 'Vpore',
      name: { fr: 'Volume poreux', en: 'Pore volume' },
      unit: 'même unité que Vbulk',
      role: 'computed',
    },
    {
      symbol: 'φ',
      name: { fr: 'Porosité', en: 'Porosity' },
      unit: '1 (fraction ; × 100 pour des %)',
      role: 'computed',
    },
    {
      symbol: 'Sw',
      name: { fr: 'Saturation en eau volumétrique', en: 'Volumetric water saturation' },
      unit: '1 (fraction ; × 100 pour des %)',
      role: 'computed',
    },
    {
      symbol: 'ρgrain',
      name: { fr: 'Masse volumique des grains (matrice)', en: 'Grain (matrix) density' },
      unit: 'kg/m³ ou g/cm³ (une seule unité)',
      role: 'input',
      admissible: { fr: 'ρgrain > ρfluid > 0', en: 'ρgrain > ρfluid > 0' },
    },
    {
      symbol: 'ρbulk',
      name: { fr: 'Masse volumique globale de la roche', en: 'Bulk density of the rock' },
      unit: 'même unité que ρgrain',
      role: 'input',
      admissible: { fr: 'ρfluid ≤ ρbulk ≤ ρgrain', en: 'ρfluid ≤ ρbulk ≤ ρgrain' },
    },
    {
      symbol: 'ρfluid',
      name: { fr: 'Masse volumique du fluide des pores', en: 'Pore-fluid density' },
      unit: 'même unité que ρgrain',
      role: 'input',
      admissible: { fr: '0 < ρfluid < ρgrain', en: '0 < ρfluid < ρgrain' },
    },
  ],
  formulas: [
    {
      id: 'vpore',
      expression: 'Vpore = Vbulk − Vgrain',
      unit: 'même unité que Vbulk',
      referenceIds: ['REF-PETROPHYSICS'],
    },
    { id: 'phi-volumes', expression: 'φ = Vpore / Vbulk', unit: '1', referenceIds: ['REF-PETROPHYSICS'] },
    { id: 'sw', expression: 'Sw = Vwater / Vpore, si Vpore > 0', unit: '1', referenceIds: ['REF-PETROPHYSICS'] },
    {
      id: 'phi-densities',
      expression: 'φ = (ρgrain − ρbulk) / (ρgrain − ρfluid)',
      unit: '1',
      referenceIds: ['REF-PETROPHYSICS'],
    },
  ],
  assumptions: [
    {
      fr: 'Mode volumes : les trois volumes sont exprimés dans la même unité ; φ et Sw sont des fractions sans dimension.',
      en: 'Volumes mode: the three volumes use the same unit; φ and Sw are dimensionless fractions.',
    },
    {
      fr: 'Mode densités : matrice homogène de masse volumique connue, pores remplis d’un seul fluide de masse volumique connue.',
      en: 'Densities mode: homogeneous matrix of known density, pores filled with a single fluid of known density.',
    },
    {
      fr: 'Sw est la saturation volumétrique (eau / volume poreux) ; elle est distincte de la saturation déduite des résistivités (loi d’Archie).',
      en: 'Sw is the volumetric saturation (water / pore volume); it differs from the saturation derived from resistivities (Archie’s law).',
    },
  ],
  limitations: [
    {
      fr: 'La porosité reflète le volume poreux saisi : elle ne distingue pas pores connectés et isolés.',
      en: 'Porosity reflects the entered pore volume: it does not distinguish connected from isolated pores.',
    },
    {
      fr: 'La porosité par densités dépend directement de ρgrain et ρfluid, supposés connus.',
      en: 'Density porosity depends directly on ρgrain and ρfluid, which are assumed known.',
    },
    {
      fr: 'Des valeurs incohérentes (par exemple ρbulk hors de [ρfluid, ρgrain]) sont refusées, jamais corrigées.',
      en: 'Inconsistent values (for example ρbulk outside [ρfluid, ρgrain]) are rejected, never corrected.',
    },
    {
      fr: 'La référence des formules n’est pas encore identifiée : niveau N1.',
      en: 'The reference for the formulas is not identified yet: level N1.',
    },
  ],
  validityDomain: {
    fr: 'Échantillons de roche dont les volumes ou les masses volumiques sont connus dans une unité commune.',
    en: 'Rock samples whose volumes or densities are known in a common unit.',
  },
  validationCases: [],
}
