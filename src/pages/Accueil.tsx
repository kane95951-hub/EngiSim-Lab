import { Link } from 'react-router-dom'
import { usePreferences } from '../app/preferences-context'
import { SIMULATORS } from '../catalog/simulators'
import type { Status } from '../catalog/types'

function countByStatus(status: Status): number {
  return SIMULATORS.filter((simulator) => simulator.status === status).length
}

export default function Accueil() {
  const { t } = usePreferences()
  return (
    <main>
      <h1>EngiSim Lab</h1>
      <p>{t('home.intro')}</p>
      <p>
        {t('home.catalogState', {
          available: countByStatus('available'),
          prototype: countByStatus('prototype'),
          planned: countByStatus('planned'),
        })}{' '}
        {t('home.plannedNote')}
      </p>
      <p>
        <Link to="/explorer">{t('home.exploreLink')}</Link>
      </p>
      <p>
        {t('home.externalIntro')}{' '}
        <a
          href="https://kane95951-hub.github.io/Rock-Eval-Simulator/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('home.externalLink')}
        </a>
        .
      </p>
    </main>
  )
}
