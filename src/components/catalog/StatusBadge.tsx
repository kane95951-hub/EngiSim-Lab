import { STATUS_LABELS_FR } from '../../catalog/labels'
import type { Status } from '../../catalog/types'

export default function StatusBadge({ status }: { status: Status }) {
  return <span className={`badge badge--${status}`}>{STATUS_LABELS_FR[status]}</span>
}
