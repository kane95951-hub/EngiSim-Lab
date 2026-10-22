import { usePreferences } from '../app/preferences-context'
import type { MessageKey } from '../i18n/fr'
import type { Language } from '../i18n/translate'
import {
  ACCENTS,
  ACCENT_IDS,
  type AccentId,
  type ThemePreference,
} from '../services/preferences'

const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'fr', label: 'Français' },
  { id: 'en', label: 'English' },
]

const THEME_OPTIONS: { id: ThemePreference; key: MessageKey }[] = [
  { id: 'system', key: 'settings.themeSystem' },
  { id: 'light', key: 'settings.themeLight' },
  { id: 'dark', key: 'settings.themeDark' },
]

const ACCENT_KEYS: Record<AccentId, MessageKey> = {
  blue: 'settings.accent.blue',
  teal: 'settings.accent.teal',
  green: 'settings.accent.green',
  orange: 'settings.accent.orange',
  purple: 'settings.accent.purple',
  rose: 'settings.accent.rose',
}

export default function Parametres() {
  const { language, theme, accent, resolvedTheme, setLanguage, setTheme, setAccent, t } =
    usePreferences()

  return (
    <main>
      <h1>{t('settings.title')}</h1>

      <fieldset className="setting">
        <legend>{t('settings.language')}</legend>
        {LANGUAGES.map((item) => (
          <label key={item.id} className="choice" lang={item.id}>
            <input
              type="radio"
              name="language"
              checked={language === item.id}
              onChange={() => setLanguage(item.id)}
            />
            {item.label}
          </label>
        ))}
      </fieldset>

      <fieldset className="setting">
        <legend>{t('settings.theme')}</legend>
        {THEME_OPTIONS.map((item) => (
          <label key={item.id} className="choice">
            <input
              type="radio"
              name="theme"
              checked={theme === item.id}
              onChange={() => setTheme(item.id)}
            />
            {t(item.key)}
          </label>
        ))}
      </fieldset>

      <fieldset className="setting">
        <legend>{t('settings.accent')}</legend>
        {ACCENT_IDS.map((id) => (
          <label key={id} className="choice">
            <input
              type="radio"
              name="accent"
              checked={accent === id}
              onChange={() => setAccent(id)}
            />
            <span
              className="swatch"
              aria-hidden="true"
              style={{ background: ACCENTS[id][resolvedTheme] }}
            />
            {t(ACCENT_KEYS[id])}
          </label>
        ))}
      </fieldset>

      <p className="muted">{t('settings.storageNote')}</p>
    </main>
  )
}
