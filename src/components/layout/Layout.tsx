import { Link, NavLink, Outlet } from 'react-router-dom'
import { usePreferences } from '../../app/preferences-context'
import LanguageSwitcher from './LanguageSwitcher'

export default function Layout() {
  const { t } = usePreferences()
  return (
    <>
      <header className="site-header">
        <span className="brand">EngiSim Lab</span>
        <nav aria-label={t('nav.aria')}>
          <NavLink to="/" end>
            {t('nav.home')}
          </NavLink>
          <NavLink to="/explorer">{t('nav.explore')}</NavLink>
          <NavLink to="/parametres">{t('nav.settings')}</NavLink>
          <NavLink to="/a-propos">{t('nav.about')}</NavLink>
        </nav>
        <LanguageSwitcher />
      </header>
      <Outlet />
      <footer className="site-footer">
        <p>
          {t('footer.disclaimer')} <Link to="/a-propos">{t('footer.fullDisclaimer')}</Link>
        </p>
      </footer>
    </>
  )
}
