export type Domain =
  | 'geochemistry'
  | 'geology'
  | 'seismic-geophysics'
  | 'petrophysics'
  | 'reservoir'
  | 'drilling-production'
  | 'geomechanics'
  | 'fluid-mechanics'
  | 'thermodynamics'
  | 'civil-structures'
  | 'materials'
  | 'renewables'
  | 'process'
  | 'environment-co2'
  | 'math-data'

export type Status = 'available' | 'prototype' | 'planned'

export type FidelityLevel = 'N1' | 'N2' | 'N3'

export interface Localized {
  fr: string
  en: string
}

export interface DomainInfo {
  id: Domain
  name: Localized
}

export interface SimulatorMeta {
  id: string
  domain: Domain
  name: Localized
  description: Localized
  keywords: string[]
  status: Status
  // Renseigné uniquement pour les outils « available » ou « prototype ».
  fidelityLevel?: FidelityLevel
}

export interface CatalogFilters {
  query: string
  domain: Domain | 'all'
  status: Status | 'all'
}
