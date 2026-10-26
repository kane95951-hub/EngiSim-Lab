import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePreferences } from '../app/preferences-context'
import { STATUS_KEYS } from '../catalog/labels'
import { filterSimulators } from '../catalog/search'
import { DOMAINS, SIMULATORS } from '../catalog/simulators'
import type { Domain, Status } from '../catalog/types'
import StatusBadge from '../components/catalog/StatusBadge'
import FidelityBadge from '../components/scientific/FidelityBadge'

const STATUSES: Status[] = ['available', 'prototype', 'planned']

export default function Catalogue() {
  const { language, t } = usePreferences()
  const [query, setQuery] = useState('')
  const [domain, setDomain] = useState<Domain | 'all'>('all')
  const [status, setStatus] = useState<Status | 'all'>('all')

  const results = useMemo(
    () => filterSimulators(SIMULATORS, DOMAINS, { query, domain, status }),
    [query, domain, status],
  )

  function resetFilters() {
    setQuery('')
    setDomain('all')
    setStatus('all')
  }

  return (
    <main>
      <h1>{t('catalog.title')}</h1>

      <div className="filters">
        <label>
          {t('catalog.search')}
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('catalog.searchPlaceholder')}
          />
        </label>
        <label>
          {t('catalog.domain')}
          <select
            value={domain}
            onChange={(event) => setDomain(event.target.value as Domain | 'all')}
          >
            <option value="all">{t('catalog.allDomains')}</option>
            {DOMAINS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name[language]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('catalog.status')}
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as Status | 'all')}
          >
            <option value="all">{t('catalog.allStatuses')}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(STATUS_KEYS[s])}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p role="status">{t('catalog.count', { count: results.length, total: SIMULATORS.length })}</p>

      {results.length === 0 ? (
        <div className="notice">
          <p>{t('catalog.empty')}</p>
          <button type="button" onClick={resetFilters}>
            {t('catalog.reset')}
          </button>
        </div>
      ) : (
        <ul className="tool-grid">
          {results.map((simulator) => {
            const domainInfo = DOMAINS.find((d) => d.id === simulator.domain)
            return (
              <li key={simulator.id} className="tool-card">
                <h2>
                  <Link to={`/outil/${simulator.id}`}>{simulator.name[language]}</Link>
                </h2>
                <p>
                  <StatusBadge status={simulator.status} />{' '}
                  {simulator.fidelityLevel && <FidelityBadge level={simulator.fidelityLevel} />}
                </p>
                <p>{simulator.description[language]}</p>
                <p className="muted">{domainInfo?.name[language]}</p>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
