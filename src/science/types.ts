import type { Localized } from '../catalog/types'

export type ReferenceStatus = 'to-source' | 'unverified' | 'verified'

export interface Reference {
  id: string
  // Citation telle que fournie par le cadrage. Ne jamais la compléter de mémoire (volume, pages, DOI).
  citation: string
  status: ReferenceStatus
  // Date (AAAA-MM-JJ) à laquelle le document a été réellement consulté. Obligatoire si status = 'verified'.
  verifiedOn?: string
}

export type VariableRole = 'input' | 'computed'

export interface VariableDef {
  symbol: string
  name: Localized
  unit: string
  role: VariableRole
  admissible?: Localized
}

export interface FormulaDef {
  id: string
  expression: string
  unit: string
  referenceIds: string[]
}

// Cas de validation externe (niveau N3) : la valeur attendue vient d'une source publiée vérifiée.
// `computed` doit être recalculé par un test du modèle et comparé à la valeur enregistrée ici.
export interface ValidationCase {
  id: string
  referenceId: string
  expected: number
  computed: number
  tolerance: number
}

// Métadonnées scientifiques d'un modèle. Elles complètent l'entrée du catalogue (même id).
export interface ModelMeta {
  id: string
  modelVersion: string
  variables: VariableDef[]
  formulas: FormulaDef[]
  assumptions: Localized[]
  limitations: Localized[]
  validityDomain: Localized
  validationCases: ValidationCase[]
}
