import { useState } from 'react'
import { usePreferences } from '../../../app/preferences-context'
import type { MessageKey } from '../../../i18n/fr'
import CsvImport from './CsvImport'
import ManualEntry from './ManualEntry'

type Mode = 'manual' | 'csv'

const MODES: { id: Mode; label: MessageKey }[] = [
  { id: 'manual', label: 'rockeval.mode.manual' },
  { id: 'csv', label: 'rockeval.mode.csv' },
]

export default function RockEvalTool() {
  const { t } = usePreferences()
  const [mode, setMode] = useState<Mode>('manual')

  return (
    <div className="tool">
      <div role="group" aria-label={t('rockeval.mode')} className="mode-switcher">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={mode === item.id}
            onClick={() => setMode(item.id)}
          >
            {t(item.label)}
          </button>
        ))}
      </div>
      {mode === 'manual' ? <ManualEntry /> : <CsvImport />}
    </div>
  )
}
