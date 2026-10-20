import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { STATUS_LABELS_FR } from '../catalog/labels'
import { filterSimulators } from '../catalog/search'
import { DOMAINS, SIMULATORS } from '../catalog/simulators'
import type { Domain, Status } from '../catalog/types'
import StatusBadge from '../components/catalog/StatusBadge'

const STATUSES: Status[] = ['available', 'prototype', 'planned']

export default function Catalogue() {
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
      <h1>Explorer les simulateurs</h1>

      <div className="filters">
        <label>
          Recherche
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nom, mot-clé, variable…"
          />
        </label>
        <label>
          Domaine
          <select
            value={domain}
            onChange={(event) => setDomain(event.target.value as Domain | 'all')}
          >
            <option value="all">Tous les domaines</option>
            {DOMAINS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name.fr}
              </option>
            ))}
          </select>
        </label>
        <label>
          Disponibilité
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as Status | 'all')}
          >
            <option value="all">Toutes</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS_FR[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p role="status">
        {results.length} outil(s) affiché(s) sur {SIMULATORS.length}
      </p>

      {results.length === 0 ? (
        <div className="notice">
          <p>Aucun outil ne correspond à votre recherche.</p>
          <button type="button" onClick={resetFilters}>
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <ul className="tool-grid">
          {results.map((simulator) => {
            const domainInfo = DOMAINS.find((d) => d.id === simulator.domain)
            return (
              <li key={simulator.id} className="tool-card">
                <h2>
                  <Link to={`/outil/${simulator.id}`}>{simulator.name.fr}</Link>
                </h2>
                <p>
                  <StatusBadge status={simulator.status} />
                </p>
                <p>{simulator.description.fr}</p>
                <p className="muted">{domainInfo?.name.fr}</p>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
