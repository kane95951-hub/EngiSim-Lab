import { lazy, Suspense } from 'react'
import { usePreferences } from '../app/preferences-context'

// Chaque interface d'outil est chargée à la demande, pour garder la page d'accueil légère.
const RockEvalTool = lazy(() => import('../modules/geochemistry/rock-eval/ui'))
const VanKrevelenTool = lazy(() => import('../modules/geochemistry/van-krevelen/ui'))
const PorosityTool = lazy(() => import('../modules/petrophysics/porosity-saturation/ui'))

function renderTool(id: string) {
  switch (id) {
    case 'rock-eval':
      return <RockEvalTool />
    case 'van-krevelen':
      return <VanKrevelenTool />
    case 'porosity-saturation':
      return <PorosityTool />
    default:
      return null
  }
}

export default function ToolWorkspace({ id }: { id: string }) {
  const { t } = usePreferences()
  const tool = renderTool(id)
  if (!tool) return null
  return <Suspense fallback={<p className="muted">{t('tool.loading')}</p>}>{tool}</Suspense>
}
