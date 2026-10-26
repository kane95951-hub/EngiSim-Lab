import { usePreferences } from '../../app/preferences-context'
import type { FidelityLevel } from '../../catalog/types'
import type { MessageKey } from '../../i18n/fr'
import type { ModelMeta, Reference, ReferenceStatus } from '../../science/types'
import FidelityBadge from './FidelityBadge'

const STATUS_KEYS: Record<ReferenceStatus, MessageKey> = {
  verified: 'reference.status.verified',
  unverified: 'reference.status.unverified',
  'to-source': 'reference.status.to-source',
}

const HELP_KEYS: Record<FidelityLevel, MessageKey> = {
  N1: 'fidelity.N1.help',
  N2: 'fidelity.N2.help',
  N3: 'fidelity.N3.help',
}

interface ScientificSheetProps {
  meta: ModelMeta
  references: Reference[]
  level?: FidelityLevel
}

// Fiche scientifique générée à partir des métadonnées du modèle (équations, unités, hypothèses, limites, sources).
export default function ScientificSheet({ meta, references, level }: ScientificSheetProps) {
  const { language, t } = usePreferences()
  const referenceIds = [...new Set(meta.formulas.flatMap((formula) => formula.referenceIds))]

  return (
    <section className="sheet" aria-labelledby="sheet-title">
      <h2 id="sheet-title">{t('sheet.title')}</h2>

      <p>
        {t('sheet.modelVersion')} : <code>{meta.modelVersion}</code>
      </p>
      {level && (
        <p>
          {t('fidelity.label')} : <FidelityBadge level={level} /> {t(HELP_KEYS[level])}
        </p>
      )}
      <p>
        {t('sheet.validity')} : {meta.validityDomain[language]}
      </p>

      <h3>{t('sheet.equations')}</h3>
      <ul>
        {meta.formulas.map((formula) => (
          <li key={formula.id}>
            <code>{formula.expression}</code> [{formula.unit}]
          </li>
        ))}
      </ul>

      <h3>{t('sheet.variables')}</h3>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">{t('sheet.col.symbol')}</th>
              <th scope="col">{t('sheet.col.name')}</th>
              <th scope="col">{t('sheet.col.unit')}</th>
              <th scope="col">{t('sheet.col.role')}</th>
            </tr>
          </thead>
          <tbody>
            {meta.variables.map((variable) => (
              <tr key={variable.symbol}>
                <td>
                  <code>{variable.symbol}</code>
                </td>
                <td>{variable.name[language]}</td>
                <td>{variable.unit}</td>
                <td>
                  {variable.role === 'input' ? t('sheet.role.input') : t('sheet.role.computed')}
                  {variable.admissible ? ` — ${variable.admissible[language]}` : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>{t('sheet.assumptions')}</h3>
      <ul>
        {meta.assumptions.map((item, index) => (
          <li key={index}>{item[language]}</li>
        ))}
      </ul>

      <h3>{t('sheet.limitations')}</h3>
      <ul>
        {meta.limitations.map((item, index) => (
          <li key={index}>{item[language]}</li>
        ))}
      </ul>

      <h3>{t('sheet.references')}</h3>
      {referenceIds.length === 0 ? (
        <p className="muted">{t('sheet.noReferences')}</p>
      ) : (
        <ul>
          {referenceIds.map((id) => {
            const reference = references.find((r) => r.id === id)
            return (
              <li key={id}>
                {reference ? reference.citation : id} —{' '}
                <strong>{t(STATUS_KEYS[reference ? reference.status : 'to-source'])}</strong>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
