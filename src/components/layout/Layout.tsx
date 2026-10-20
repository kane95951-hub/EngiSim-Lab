import { Link, NavLink, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <>
      <header className="site-header">
        <span className="brand">EngiSim Lab</span>
        <nav aria-label="Navigation principale">
          <NavLink to="/" end>
            Accueil
          </NavLink>
          <NavLink to="/explorer">Explorer les simulateurs</NavLink>
          <NavLink to="/a-propos">À propos</NavLink>
        </nav>
      </header>
      <Outlet />
      <footer className="site-footer">
        <p>
          Atelier pédagogique et exploratoire : les résultats ne remplacent ni une mesure, ni une
          validation indépendante, ni un logiciel certifié, ni l’avis d’un ingénieur qualifié.{' '}
          <Link to="/a-propos">Avertissement complet</Link>
        </p>
      </footer>
    </>
  )
}
