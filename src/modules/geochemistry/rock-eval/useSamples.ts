import { useSyncExternalStore } from 'react'
import { sampleStore, type SampleSnapshot } from './samples'

// Abonnement d'un composant aux échantillons Rock-Eval partagés.
export function useSamples(): SampleSnapshot {
  return useSyncExternalStore(sampleStore.subscribe, sampleStore.getSnapshot)
}
