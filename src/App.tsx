import { HashRouter, Link, Route, Routes } from 'react-router-dom'

function Accueil() {
  return (
    <main>
      <h1>EngiSim Lab</h1>
      <p>
        Atelier de simulation et de calcul pour l’ingénierie. Squelette technique du Jour 2 :
        aucun simulateur n’est encore disponible.
      </p>
      <Link to="/a-propos">À propos</Link>
    </main>
  )
}

function APropos() {
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

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/a-propos" element={<APropos />} />
      </Routes>
    </HashRouter>
  )
}