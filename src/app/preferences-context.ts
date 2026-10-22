import { createContext, useContext } from 'react'
import type { MessageKey } from '../i18n/fr'
import type { Language } from '../i18n/translate'
import type { AccentId, Preferences, ResolvedTheme, ThemePreference } from '../services/preferences'

export interface PreferencesContextValue extends Preferences {
  resolvedTheme: ResolvedTheme
  setLanguage: (language: Language) => void
  setTheme: (theme: ThemePreference) => void
  setAccent: (accent: AccentId) => void
  t: (key: MessageKey, params?: Record<string, string | number>) => string
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function usePreferences(): PreferencesContextValue {
  const value = useContext(PreferencesContext)
  if (!value) {
    throw new Error('usePreferences doit être utilisé à l’intérieur de PreferencesProvider.')
  }
  return value
}
