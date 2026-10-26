import { usePreferences } from '../../app/preferences-context'
import type { MessageKey } from '../../i18n/fr'
import type { Finding, InterpretationReport } from '../../science/interpretation'
import type { Reference } from '../../science/types'

interface Section {
  key: MessageKey
  findings: Finding[]
}

// Affiche un rapport d'interprétation en distinguant observations, lecture prudente,
// hypothèses, alertes et références (SPEC.md §17).
export default function InterpretationPanel({
  report,
  references,
}: {
  report: InterpretationReport
  references: Reference[]
}) {
  const { t } = usePreferences()

  const sections: Section[] = [
    { key: 'interpretation.observations', findings: report.observations },
    { key: 'interpretation.readings', findings: report.readings },
    { key: 'interpretation.assumptions', findings: report.assumptions },
    { key: 'interpretation.warnings', findings: report.warnings },
  ]
  const visible = sections.filter((section) => section.findings.length > 0)
  const isEmpty = visible.length === 0 && report.withheld.length === 0

  return (
    <section className="interpretation" aria-labelledby="interpretation-title">
      <h2 id="interpretation-title">{t('interpretation.title')}</h2>

      {isEmpty && <p className="muted">{t('interpretation.none')}</p>}

      {visible.map((section) => (
        <div key={section.key}>
          <h3>{t(section.key)}</h3>
          <ul>
            {section.findings.map((finding) => (
              <li key={finding.ruleId}>{t(finding.messageKey, finding.params)}</li>
            ))}
          </ul>
        </div>
      ))}

      {report.withheld.length > 0 && (
        <p className="notice" role="note">
          {t('interpretation.withheld')}
        </p>
      )}

      {report.referenceIds.length > 0 && (
        <div>
          <h3>{t('interpretation.references')}</h3>
          <ul>
            {report.referenceIds.map((id) => {
              const reference = references.find((r) => r.id === id)
              return <li key={id}>{reference ? reference.citation : id}</li>
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
