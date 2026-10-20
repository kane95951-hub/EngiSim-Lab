import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main>
      <h1>Page introuvable</h1>
      <p>L’adresse demandée n’existe pas dans EngiSim Lab.</p>
      <Link to="/">Retour à l’accueil</Link>
    </main>
  )
}
