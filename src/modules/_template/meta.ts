import type { ModelMeta } from '../../science/types'

// GABARIT : copier ce dossier pour créer un outil (voir docs/NOUVEL-OUTIL.md).
// Cet exemple est purement illustratif (un simple rapport a / b). Il n'est PAS enregistré
// dans le catalogue ni dans src/modules/index.ts, et ne doit jamais être publié.
export const meta: ModelMeta = {
  id: 'template-example',
  modelVersion: '0.0.0',
  variables: [
    {
      symbol: 'a',
      name: { fr: 'Numérateur', en: 'Numerator' },
      unit: '1',
      role: 'input',
      admissible: { fr: 'a ≥ 0', en: 'a ≥ 0' },
    },
    {
      symbol: 'b',
      name: { fr: 'Dénominateur', en: 'Denominator' },
      unit: '1',
      role: 'input',
      admissible: { fr: 'b > 0', en: 'b > 0' },
    },
    { symbol: 'r', name: { fr: 'Rapport', en: 'Ratio' }, unit: '1', role: 'computed' },
  ],
  formulas: [{ id: 'ratio', expression: 'r = a / b', unit: '1', referenceIds: [] }],
  assumptions: [{ fr: 'Exemple purement illustratif.', en: 'Purely illustrative example.' }],
  limitations: [{ fr: 'Aucune référence : niveau N1 au maximum.', en: 'No reference: N1 at most.' }],
  validityDomain: { fr: 'Aucun : exemple de gabarit.', en: 'None: template example.' },
  validationCases: [],
}
