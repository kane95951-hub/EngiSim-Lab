import { Link, useParams } from 'react-router-dom'
import { DOMAINS, SIMULATORS } from '../catalog/simulators'
import StatusBadge from '../components/catalog/StatusBadge'

export default function Outil() {
  const { id } = useParams()
  const simulator = SIMULATORS.find((s) => s.id === id)

  if (!simulator) {
    return (
      <main>
        <h1>Outil introuvable</h1>
        <p>Cet outil n’existe pas dans le catalogue.</p>
        <Link to="/explorer">Retour au catalogue</Link>
      </main>
    )
  }

  const domain = DOMAINS.find((d) => d.id === simulator.domain)

  return (
    <main>
      <p>
        <Link to="/explorer">← Retour au catalogue</Link>
      </p>
      <h1>{simulator.name.fr}</h1>
      <p>
        <StatusBadge status={simulator.status} /> {domain?.name.fr}
      </p>
      <p>{simulator.description.fr}</p>
      {simulator.status === 'planned' && (
        <p className="notice" role="note">
          Cet outil n’est pas encore disponible. Aucun calcul ni résultat n’est proposé pour
          l’instant.
        </p>
      )}
      {simulator.status === 'prototype' && (
        <p className="notice" role="note">
          Cet outil est un prototype : ses résultats ne sont pas encore validés.
        </p>
      )}
    </main>
  )
}
