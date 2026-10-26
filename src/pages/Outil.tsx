import { Link, useParams } from 'react-router-dom'
import { usePreferences } from '../app/preferences-context'
import { DOMAINS, SIMULATORS } from '../catalog/simulators'
import StatusBadge from '../components/catalog/StatusBadge'
import FidelityBadge from '../components/scientific/FidelityBadge'
import ScientificSheet from '../components/scientific/ScientificSheet'
import { MODEL_METAS } from '../modules'
import { REFERENCES } from '../science/references'
import ToolWorkspace from './ToolWorkspace'

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
  const meta = MODEL_METAS.find((m) => m.id === simulator.id)

  return (
    <main>
      <p>
        <Link to="/explorer">← {t('tool.backToCatalog')}</Link>
      </p>
      <h1>{simulator.name[language]}</h1>
      <p>
        <StatusBadge status={simulator.status} />{' '}
        {simulator.fidelityLevel && <FidelityBadge level={simulator.fidelityLevel} />}{' '}
        {domain?.name[language]}
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
      {simulator.status !== 'planned' && <ToolWorkspace id={simulator.id} />}
      {meta && (
        <ScientificSheet meta={meta} references={REFERENCES} level={simulator.fidelityLevel} />
      )}
    </main>
  )
}
