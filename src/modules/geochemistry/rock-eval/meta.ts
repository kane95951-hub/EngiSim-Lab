import type { ModelMeta } from '../../../science/types'

// Fiche scientifique de l'interpréteur Rock-Eval.
// Les références ci-dessous sont celles du cadrage ; elles ne sont PAS encore vérifiées
// (voir docs/SOURCES.md). Tant qu'elles ne le sont pas, l'outil reste au niveau N1.
export const meta: ModelMeta = {
  id: 'rock-eval',
  modelVersion: '0.1.0',
  variables: [
    {
      symbol: 'S1',
      name: { fr: 'Hydrocarbures libres', en: 'Free hydrocarbons' },
      unit: 'mg HC / g roche',
      role: 'input',
      admissible: { fr: 'S1 ≥ 0', en: 'S1 ≥ 0' },
    },
    {
      symbol: 'S2',
      name: { fr: 'Hydrocarbures de pyrolyse', en: 'Pyrolysis hydrocarbons' },
      unit: 'mg HC / g roche',
      role: 'input',
      admissible: { fr: 'S2 ≥ 0', en: 'S2 ≥ 0' },
    },
    {
      symbol: 'S3',
      name: { fr: 'CO₂ organique', en: 'Organic CO₂' },
      unit: 'mg CO₂ / g roche',
      role: 'input',
      admissible: { fr: 'S3 ≥ 0', en: 'S3 ≥ 0' },
    },
    {
      symbol: 'TOC',
      name: { fr: 'Carbone organique total', en: 'Total organic carbon' },
      unit: '% massique',
      role: 'input',
      admissible: { fr: '0 ≤ TOC ≤ 100', en: '0 ≤ TOC ≤ 100' },
    },
    {
      symbol: 'Tmax',
      name: { fr: 'Température au maximum de S2', en: 'Temperature at maximum of S2' },
      unit: '°C',
      role: 'input',
      admissible: { fr: 'Tmax > 0 ; fiabilité à examiner', en: 'Tmax > 0; reliability to be examined' },
    },
    {
      symbol: 'HI',
      name: { fr: 'Indice d’hydrogène', en: 'Hydrogen index' },
      unit: 'mg HC / g TOC',
      role: 'computed',
    },
    {
      symbol: 'OI',
      name: { fr: 'Indice d’oxygène', en: 'Oxygen index' },
      unit: 'mg CO₂ / g TOC',
      role: 'computed',
    },
    {
      symbol: 'PI',
      name: { fr: 'Indice de production', en: 'Production index' },
      unit: '1',
      role: 'computed',
    },
    {
      symbol: 'S2/S3',
      name: { fr: 'Rapport auxiliaire S2/S3', en: 'Auxiliary S2/S3 ratio' },
      unit: 'mg HC / mg CO₂',
      role: 'computed',
    },
  ],
  formulas: [
    {
      id: 'hi',
      expression: 'HI = 100 × S2 / TOC',
      unit: 'mg HC / g TOC',
      referenceIds: ['REF-PETERS-1986', 'REF-ESPITALIE'],
    },
    {
      id: 'oi',
      expression: 'OI = 100 × S3 / TOC',
      unit: 'mg CO₂ / g TOC',
      referenceIds: ['REF-PETERS-1986', 'REF-ESPITALIE'],
    },
    {
      id: 'pi',
      expression: 'PI = S1 / (S1 + S2), si S1 + S2 > 0',
      unit: '1',
      referenceIds: ['REF-PETERS-1986', 'REF-ESPITALIE'],
    },
    {
      id: 's2s3',
      expression: 'S2/S3, si S3 > 0 (indicateur auxiliaire)',
      unit: 'mg HC / mg CO₂',
      referenceIds: ['REF-PETERS-1986'],
    },
  ],
  assumptions: [
    {
      fr: 'Convention : S1 et S2 en mg HC/g de roche, S3 en mg CO₂/g de roche, TOC en % massique.',
      en: 'Convention: S1 and S2 in mg HC/g rock, S3 in mg CO₂/g rock, TOC in mass %.',
    },
    {
      fr: 'Les données saisies sont prises telles quelles : aucune correction ni valeur par défaut.',
      en: 'Entered data are used as given: no correction and no default value.',
    },
  ],
  limitations: [
    {
      fr: 'Aucune classification de maturité ou de type de kérogène n’est appliquée : les seuils ne sont pas encore sourcés.',
      en: 'No maturity or kerogen-type classification is applied: thresholds are not sourced yet.',
    },
    {
      fr: 'HI et OI dépendent aussi de la maturation, des altérations et de la qualité du TOC ; Tmax est fragile quand S2 est faible ou atypique.',
      en: 'HI and OI also depend on maturation, alteration and TOC quality; Tmax is fragile when S2 is low or atypical.',
    },
    {
      fr: 'Les références du cadrage ne sont pas encore vérifiées : niveau N1.',
      en: 'The references from the project brief are not verified yet: level N1.',
    },
  ],
  validityDomain: {
    fr: 'Analyses de pyrolyse programmée rapportées dans la convention ci-dessus.',
    en: 'Programmed-pyrolysis analyses reported in the convention above.',
  },
  validationCases: [],
}
