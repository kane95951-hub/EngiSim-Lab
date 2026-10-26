import { usePreferences } from '../../app/preferences-context'
import type { FidelityLevel } from '../../catalog/types'
import type { MessageKey } from '../../i18n/fr'

const LABEL_KEYS: Record<FidelityLevel, MessageKey> = {
  N1: 'fidelity.N1',
  N2: 'fidelity.N2',
  N3: 'fidelity.N3',
}

const HELP_KEYS: Record<FidelityLevel, MessageKey> = {
  N1: 'fidelity.N1.help',
  N2: 'fidelity.N2.help',
  N3: 'fidelity.N3.help',
}

export default function FidelityBadge({ level }: { level: FidelityLevel }) {
  const { t } = usePreferences()
  return (
    <span className="badge badge--fidelity" title={t(HELP_KEYS[level])}>
      {t(LABEL_KEYS[level])}
    </span>
  )
}
