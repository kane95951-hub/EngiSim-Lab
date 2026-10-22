import { usePreferences } from '../../app/preferences-context'
import type { Language } from '../../i18n/translate'

const LANGUAGES: { id: Language; label: string; name: string }[] = [
  { id: 'fr', label: 'FR', name: 'Français' },
  { id: 'en', label: 'EN', name: 'English' },
]

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = usePreferences()
  return (
    <div role="group" aria-label={t('lang.switcher')} className="lang-switcher">
      {LANGUAGES.map((item) => (
        <button
          key={item.id}
          type="button"
          lang={item.id}
          title={item.name}
          aria-pressed={language === item.id}
          onClick={() => setLanguage(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
