import { Link } from 'react-router-dom'

export default function APropos() {
  return (
    <main>
      <h1>À propos</h1>
      <p>
        EngiSim Lab est un atelier de simulation et de calcul à vocation pédagogique et
        exploratoire. Les résultats dépendent des hypothèses, des données et du domaine de
        validité de chaque modèle. Ils ne remplacent ni une mesure expérimentale, ni une
        validation indépendante, ni un logiciel certifié, ni l’avis d’un ingénieur qualifié.
      </p>
      <Link to="/">Retour à l’accueil</Link>
    </main>
  )
}
