import { Link } from 'react-router-dom'
import { SIMULATORS } from '../catalog/simulators'
import type { Status } from '../catalog/types'

function countByStatus(status: Status): number {
  return SIMULATORS.filter((simulator) => simulator.status === status).length
}

export default function Accueil() {
  return (
    <main>
      <h1>EngiSim Lab</h1>
      <p>
        Atelier de simulation et de calcul pour l’ingénierie : on y saisit des données, on exécute
        un modèle, on compare des scénarios et on lit une interprétation prudente, avec ses
        sources et ses limites.
      </p>
      <p>
        État du catalogue : {countByStatus('available')} outil(s) disponible(s),{' '}
        {countByStatus('prototype')} prototype(s), {countByStatus('planned')} à venir. Les outils
        à venir n’effectuent aucun calcul.
      </p>
      <p>
        <Link to="/explorer">Explorer les simulateurs</Link>
      </p>
      <p>
        Ressource externe, projet distinct :{' '}
        <a
          href="https://kane95951-hub.github.io/Rock-Eval-Simulator/"
          target="_blank"
          rel="noopener noreferrer"
        >
          simulateur Rock-Eval existant
        </a>
        .
      </p>
    </main>
  )
}
