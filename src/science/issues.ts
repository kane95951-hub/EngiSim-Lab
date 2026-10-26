import type { MessageKey } from '../i18n/fr'
import type { Issue, IssueCode } from './validation'

// Associe chaque code de problème de saisie à son message traduit (FR/EN).
export const ISSUE_KEYS: Record<IssueCode, MessageKey> = {
  missing: 'issue.missing',
  notFinite: 'issue.notFinite',
  belowMin: 'issue.belowMin',
  notAboveMin: 'issue.notAboveMin',
  aboveMax: 'issue.aboveMax',
  notBelowMax: 'issue.notBelowMax',
}

export type Translator = (key: MessageKey, params?: Record<string, string | number>) => string

export function issueMessage(issue: Issue, t: Translator): string {
  return t(ISSUE_KEYS[issue.code], { field: issue.field, bound: issue.bound ?? '' })
}
