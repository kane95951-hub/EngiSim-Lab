import { usePreferences } from '../../app/preferences-context'
import { issueMessage } from '../../science/issues'
import type { Issue } from '../../science/validation'

// Liste des problèmes de saisie, annoncée aux lecteurs d'écran.
export default function IssueList({ issues }: { issues: Issue[] }) {
  const { t } = usePreferences()
  if (issues.length === 0) return null
  return (
    <ul className="issues" role="alert">
      {issues.map((issue, index) => (
        <li key={`${issue.field}-${issue.code}-${index}`}>{issueMessage(issue, t)}</li>
      ))}
    </ul>
  )
}
