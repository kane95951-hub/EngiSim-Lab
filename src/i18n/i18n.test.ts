import { describe, expect, it } from 'vitest'
import { en } from './en'
import { fr } from './fr'
import { detectLanguage, translate } from './translate'

function placeholders(text: string): string[] {
  return (text.match(/\{\w+\}/g) ?? []).sort()
}

describe('dictionnaires FR / EN', () => {
  it('ont exactement les mêmes clés', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(fr).sort())
  })

  it('ne contiennent aucune traduction vide', () => {
    for (const [key, value] of [...Object.entries(fr), ...Object.entries(en)]) {
      expect(value.trim(), key).not.toBe('')
    }
  })

  it('utilisent les mêmes variables {…} dans les deux langues', () => {
    for (const key of Object.keys(fr) as (keyof typeof fr)[]) {
      expect(placeholders(en[key]), key).toEqual(placeholders(fr[key]))
    }
  })
})

describe('translate', () => {
  it('remplace les variables par leurs valeurs', () => {
    expect(translate(fr, 'catalog.count', { count: 3, total: 20 })).toBe(
      'Outils affichés : 3 sur 20',
    )
    expect(translate(en, 'catalog.count', { count: 3, total: 20 })).toBe('Tools shown: 3 of 20')
  })

  it('laisse intacte une variable non fournie', () => {
    expect(translate(fr, 'catalog.count', { count: 3 })).toBe('Outils affichés : 3 sur {total}')
  })
})

describe('detectLanguage', () => {
  it('choisit le français pour les variantes de fr', () => {
    expect(detectLanguage('fr')).toBe('fr')
    expect(detectLanguage('fr-FR')).toBe('fr')
    expect(detectLanguage('FR-sn')).toBe('fr')
  })

  it('choisit l’anglais pour en et pour les autres langues', () => {
    expect(detectLanguage('en-US')).toBe('en')
    expect(detectLanguage('de-DE')).toBe('en')
    expect(detectLanguage(undefined)).toBe('en')
  })
})
