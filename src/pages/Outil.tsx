import { Link, useParams } from 'react-router-dom'
import { usePreferences } from '../app/preferences-context'
import { DOMAINS, SIMULATORS } from '../catalog/simulators'
import StatusBadge from '../components/catalog/StatusBadge'

export default function Outil() {
  const { id } = useParams()
  const { language, t } = usePreferences()
  const simulator = SIMULATORS.find((s) => s.id === id)

  if (!simulator) {
    return (
      <main>
        <h1>{t('tool.notFoundTitle')}</h1>
        <p>{t('tool.notFoundText')}</p>
        <Link to="/explorer">{t('tool.backToCatalog')}</Link>
      </main>
    )
  }

  const domain = DOMAINS.find((d) => d.id === simulator.domain)

  return (
    <main>
      <p>
        <Link to="/explorer">← {t('tool.backToCatalog')}</Link>
      </p>
      <h1>{simulator.name[language]}</h1>
      <p>
        <StatusBadge status={simulator.status} /> {domain?.name[language]}
      </p>
      <p>{simulator.description[language]}</p>
      {simulator.status === 'planned' && (
        <p className="notice" role="note">
          {t('tool.plannedNotice')}
        </p>
      )}
      {simulator.status === 'prototype' && (
        <p className="notice" role="note">
          {t('tool.prototypeNotice')}
        </p>
      )}
    </main>
  )
}
