import { Link } from 'react-router-dom'
import { usePreferences } from '../app/preferences-context'

export default function NotFound() {
  const { t } = usePreferences()
  return (
    <main>
      <h1>{t('notFound.title')}</h1>
      <p>{t('notFound.text')}</p>
      <Link to="/">{t('notFound.backHome')}</Link>
    </main>
  )
}
