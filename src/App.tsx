import { HashRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import APropos from './pages/APropos'
import Accueil from './pages/Accueil'
import Catalogue from './pages/Catalogue'
import NotFound from './pages/NotFound'
import Outil from './pages/Outil'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Accueil />} />
          <Route path="explorer" element={<Catalogue />} />
          <Route path="outil/:id" element={<Outil />} />
          <Route path="a-propos" element={<APropos />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
