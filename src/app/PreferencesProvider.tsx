import { useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { MESSAGES, detectLanguage, translate } from '../i18n/translate'
import {
  ACCENTS,
  loadPreferences,
  resolveTheme,
  savePreferences,
  type Preferences,
} from '../services/preferences'
import { PreferencesContext, type PreferencesContextValue } from './preferences-context'

function getStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function systemPrefersDark(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

export default function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(() =>
    loadPreferences(getStorage(), detectLanguage(navigator.language)),
  )
  const [systemDark, setSystemDark] = useState<boolean>(() => systemPrefersDark())

  // Suit le changement de thème du système quand le choix est « Suivre le système ».
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const resolvedTheme = resolveTheme(prefs.theme, systemDark)

  // Applique langue, thème, couleur d'accent et titre de la page au document.
  useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.theme = resolvedTheme
    root.lang = prefs.language
    root.style.setProperty('--accent', ACCENTS[prefs.accent][resolvedTheme])
    document.title = translate(MESSAGES[prefs.language], 'app.title')
  }, [resolvedTheme, prefs.language, prefs.accent])

  const value = useMemo<PreferencesContextValue>(() => {
    function update(patch: Partial<Preferences>) {
      const next = { ...prefs, ...patch }
      setPrefs(next)
      savePreferences(getStorage(), next)
    }
    return {
      ...prefs,
      resolvedTheme,
      setLanguage: (language) => update({ language }),
      setTheme: (theme) => update({ theme }),
      setAccent: (accent) => update({ accent }),
      t: (key, params) => translate(MESSAGES[prefs.language], key, params),
    }
  }, [prefs, resolvedTheme])

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}
