import { NestEggChart } from '@/features/chart/NestEggChart'
import { PlanEditor } from '@/features/editor/PlanEditor'
import { usePlanStore } from '@/store/planStore'
import { useDarkMode } from '@/hooks/useDarkMode'

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

function App() {
  const exportPlan = usePlanStore((s) => s.exportPlan)
  const importPlan = usePlanStore((s) => s.importPlan)
  const { dark, toggle: toggleDark } = useDarkMode()

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const plan = JSON.parse(ev.target?.result as string)
        importPlan(plan)
      } catch {
        alert('Could not parse plan file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="h-screen flex flex-col bg-canvas">

      {/* Header */}
      <header className="shrink-0 bg-surface border-b border-border px-4 py-2.5 flex items-center justify-between">
        <h1 className="text-sm font-semibold text-ink tracking-tight">Retirement Planner</h1>
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1.5 rounded-lg text-ink-2 hover:text-ink hover:bg-subtle border border-border transition-colors"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          <label className="text-xs text-ink-2 hover:text-ink px-3 py-1.5 rounded-lg border border-border hover:border-ink-2 transition-colors cursor-pointer">
            Import
            <input type="file" accept=".json" className="sr-only" onChange={handleImport} />
          </label>
          <button
            onClick={exportPlan}
            className="text-xs text-ink-2 hover:text-ink px-3 py-1.5 rounded-lg border border-border hover:border-ink-2 transition-colors"
          >
            Export
          </button>
        </div>
      </header>

      {/* Chart — fixed height, full width, always visible */}
      <div className="shrink-0 h-[200px] sm:h-[220px] bg-surface border-b border-border">
        <NestEggChart />
      </div>

      {/* Editor — fills remaining space, scrolls independently */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6">
        <PlanEditor />
      </div>

    </div>
  )
}

export default App
