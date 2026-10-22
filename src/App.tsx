import { HashRouter, Route, Routes } from 'react-router-dom'
import PreferencesProvider from './app/PreferencesProvider'
import Layout from './components/layout/Layout'
import APropos from './pages/APropos'
import Accueil from './pages/Accueil'
import Catalogue from './pages/Catalogue'
import NotFound from './pages/NotFound'
import Outil from './pages/Outil'
import Parametres from './pages/Parametres'

export default function App() {
  return (
    <PreferencesProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Accueil />} />
            <Route path="explorer" element={<Catalogue />} />
            <Route path="outil/:id" element={<Outil />} />
            <Route path="parametres" element={<Parametres />} />
            <Route path="a-propos" element={<APropos />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </PreferencesProvider>
  )
}
