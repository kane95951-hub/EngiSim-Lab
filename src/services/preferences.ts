import type { Language } from '../i18n/translate'

export type ThemePreference = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

export const ACCENT_IDS = ['blue', 'teal', 'green', 'orange', 'purple', 'rose'] as const
export type AccentId = (typeof ACCENT_IDS)[number]

// Palette prédéfinie, avec une variante par thème pour conserver un contraste de lecture suffisant.
// Les contrastes seront mesurés avec un outil lors de la recette (Jour 13).
export const ACCENTS: Record<AccentId, Record<ResolvedTheme, string>> = {
  blue: { light: '#0b6bcb', dark: '#5aa9ff' },
  teal: { light: '#0b7a75', dark: '#4fd1c5' },
  green: { light: '#2f7a2f', dark: '#7bd47b' },
  orange: { light: '#b45309', dark: '#fbb040' },
  purple: { light: '#6d28d9', dark: '#b794f6' },
  rose: { light: '#be185d', dark: '#f472b6' },
}

export interface Preferences {
  language: Language
  theme: ThemePreference
  accent: AccentId
}

export const STORAGE_KEY = 'engisim.preferences.v1'

export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

export function defaultPreferences(language: Language): Preferences {
  return { language, theme: 'system', accent: 'blue' }
}

// Lit les préférences ; toute valeur absente, invalide ou inconnue retombe sur la valeur par défaut.
export function loadPreferences(storage: StorageLike | null, systemLanguage: Language): Preferences {
  const defaults = defaultPreferences(systemLanguage)
  if (!storage) return defaults
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return defaults
    const data: unknown = JSON.parse(raw)
    if (typeof data !== 'object' || data === null) return defaults
    const record = data as Record<string, unknown>
    const language = record['language']
    const theme = record['theme']
    const accent = record['accent']
    return {
      language: language === 'fr' || language === 'en' ? language : defaults.language,
      theme:
        theme === 'system' || theme === 'light' || theme === 'dark' ? theme : defaults.theme,
      accent: ACCENT_IDS.find((id) => id === accent) ?? defaults.accent,
    }
  } catch {
    return defaults
  }
}

// Écrit les préférences ; une erreur de stockage (mode privé, quota) est ignorée sans bloquer l'application.
export function savePreferences(storage: StorageLike | null, preferences: Preferences): void {
  if (!storage) return
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    // Stockage indisponible : les préférences restent valables pour la session en cours.
  }
}

export function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): ResolvedTheme {
  if (preference === 'system') return systemPrefersDark ? 'dark' : 'light'
  return preference
}
