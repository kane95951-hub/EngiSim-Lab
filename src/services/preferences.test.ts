import { describe, expect, it } from 'vitest'
import {
  ACCENTS,
  ACCENT_IDS,
  STORAGE_KEY,
  defaultPreferences,
  loadPreferences,
  resolveTheme,
  savePreferences,
  type StorageLike,
} from './preferences'

function fakeStorage(initial?: string): StorageLike & { value: string | null } {
  const box = { value: initial ?? null }
  return {
    get value() {
      return box.value
    },
    getItem: () => box.value,
    setItem: (_key: string, value: string) => {
      box.value = value
    },
  }
}

describe('loadPreferences', () => {
  it('renvoie les valeurs par défaut sans stockage', () => {
    expect(loadPreferences(null, 'fr')).toEqual({ language: 'fr', theme: 'system', accent: 'blue' })
  })

  it('utilise la langue du système quand rien n’est enregistré', () => {
    expect(loadPreferences(fakeStorage(), 'en').language).toBe('en')
  })

  it('relit des préférences valides', () => {
    const stored = JSON.stringify({ language: 'en', theme: 'dark', accent: 'rose' })
    expect(loadPreferences(fakeStorage(stored), 'fr')).toEqual({
      language: 'en',
      theme: 'dark',
      accent: 'rose',
    })
  })

  it('ignore un JSON invalide', () => {
    expect(loadPreferences(fakeStorage('{pas du json'), 'fr')).toEqual(defaultPreferences('fr'))
  })

  it('remplace chaque valeur inconnue par sa valeur par défaut, sans toucher aux autres', () => {
    const stored = JSON.stringify({ language: 'de', theme: 'dark', accent: 'jaune' })
    expect(loadPreferences(fakeStorage(stored), 'fr')).toEqual({
      language: 'fr',
      theme: 'dark',
      accent: 'blue',
    })
  })

  it('résiste à un stockage qui lève une erreur', () => {
    const broken: StorageLike = {
      getItem: () => {
        throw new Error('stockage bloqué')
      },
      setItem: () => {},
    }
    expect(loadPreferences(broken, 'fr')).toEqual(defaultPreferences('fr'))
  })
})

describe('savePreferences', () => {
  it('écrit des préférences relisibles à l’identique', () => {
    const storage = fakeStorage()
    const preferences = { language: 'en', theme: 'light', accent: 'teal' } as const
    savePreferences(storage, preferences)
    expect(storage.value).not.toBeNull()
    expect(loadPreferences(storage, 'fr')).toEqual(preferences)
  })

  it('ignore une erreur d’écriture', () => {
    const broken: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota dépassé')
      },
    }
    expect(() => savePreferences(broken, defaultPreferences('fr'))).not.toThrow()
  })

  it('utilise une clé de stockage versionnée', () => {
    expect(STORAGE_KEY).toContain('.v1')
  })
})

describe('resolveTheme', () => {
  it('suit le système quand le thème est « system »', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
  })

  it('respecte un choix explicite quel que soit le système', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })
})

describe('palette d’accent', () => {
  it('définit pour chaque accent une couleur claire et une couleur sombre valides', () => {
    for (const id of ACCENT_IDS) {
      expect(ACCENTS[id].light).toMatch(/^#[0-9a-f]{6}$/i)
      expect(ACCENTS[id].dark).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})
