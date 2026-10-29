import type { ModelMeta } from '../../../science/types'

// Fiche scientifique du diagramme HI–OI. Les références ne sont PAS vérifiées : niveau N1.
// Aucune zone de type de matière organique n'est dessinée (ADR-08) : source à identifier (REF-VK).
export const meta: ModelMeta = {
  id: 'van-krevelen',
  modelVersion: '0.1.0',
  variables: [
    {
      symbol: 'HI',
      name: { fr: 'Indice d’hydrogène (axe vertical)', en: 'Hydrogen index (vertical axis)' },
      unit: 'mg HC / g TOC',
      role: 'input',
      admissible: { fr: 'Valeur calculée par l’outil Rock-Eval', en: 'Value computed by the Rock-Eval tool' },
    },
    {
      symbol: 'OI',
      name: { fr: 'Indice d’oxygène (axe horizontal)', en: 'Oxygen index (horizontal axis)' },
      unit: 'mg CO₂ / g TOC',
      role: 'input',
      admissible: { fr: 'Valeur calculée par l’outil Rock-Eval', en: 'Value computed by the Rock-Eval tool' },
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
  ],
  assumptions: [
    {
      fr: 'Seuls les échantillons valides dont HI et OI sont calculables sont tracés ; HI et OI proviennent de l’outil Rock-Eval, jamais des valeurs importées.',
      en: 'Only valid samples whose HI and OI can be computed are plotted; HI and OI come from the Rock-Eval tool, never from imported values.',
    },
    {
      fr: 'Échelles linéaires de 0 à un peu plus que la plus grande valeur.',
      en: 'Linear scales from 0 to slightly above the largest value.',
    },
  ],
  limitations: [
    {
      fr: 'Aucune zone de type de matière organique n’est dessinée : leurs limites doivent provenir d’une référence identifiable, non encore trouvée.',
      en: 'No organic-matter type zone is drawn: their limits must come from an identifiable reference, not found yet.',
    },
    {
      fr: 'La position d’un point dépend aussi de la maturation, de l’altération et de la qualité des données : elle ne suffit pas à déterminer un type de kérogène.',
      en: 'A point’s position also depends on maturation, alteration and data quality: it is not enough to determine a kerogen type.',
    },
    {
      fr: 'Les références du cadrage ne sont pas encore vérifiées : niveau N1.',
      en: 'The references from the project brief are not verified yet: level N1.',
    },
  ],
  validityDomain: {
    fr: 'Échantillons dont HI et OI sont calculés dans la convention de l’outil Rock-Eval.',
    en: 'Samples whose HI and OI are computed in the convention of the Rock-Eval tool.',
  },
  validationCases: [],
}
