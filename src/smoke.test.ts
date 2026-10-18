import { describe, expect, it } from 'vitest'

// Test de fumée du Jour 2 : il vérifie seulement que l'outil de test fonctionne.
// Il ne valide aucun modèle scientifique. À supprimer quand les vrais tests arrivent.
describe('outil de test', () => {
  it('exécute un test simple', () => {
    expect(1 + 1).toBe(2)
  })
})