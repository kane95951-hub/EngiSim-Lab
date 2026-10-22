import { usePreferences } from '../../app/preferences-context'
import { STATUS_KEYS } from '../../catalog/labels'
import type { Status } from '../../catalog/types'

export default function StatusBadge({ status }: { status: Status }) {
  const { t } = usePreferences()
  return <span className={`badge badge--${status}`}>{t(STATUS_KEYS[status])}</span>
}
