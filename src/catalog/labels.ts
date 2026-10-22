import type { MessageKey } from '../i18n/fr'
import type { Status } from './types'

// Associe chaque statut à la clé de traduction de son libellé.
export const STATUS_KEYS: Record<Status, MessageKey> = {
  available: 'status.available',
  prototype: 'status.prototype',
  planned: 'status.planned',
}
