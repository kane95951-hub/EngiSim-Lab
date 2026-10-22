import { Link } from 'react-router-dom'
import { usePreferences } from '../app/preferences-context'

export default function APropos() {
  const { t } = usePreferences()
  return (
    <main>
      <h1>{t('about.title')}</h1>
      <p>{t('about.disclaimer')}</p>
      <Link to="/">{t('about.backHome')}</Link>
    </main>
  )
}
