import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RetirementPlan, Profile, Phase, PlanEvent } from '@/data/types'
import { DEFAULT_PLAN } from '@/data/defaults'
import { simulate } from '@/lib/simulation'
import { migrate } from '@/lib/migration'
import type { SimulationResult } from '@/data/types'

// ─── Display settings ─────────────────────────────────────────────────────────

interface DisplaySettings {
  showNominal: boolean  // false = today's dollars, true = nominal/future dollars
  dark: boolean         // mirrors .dark class on <html> — source of truth for theme
}

// ─── Store shape ──────────────────────────────────────────────────────────────

interface PlanStore {
  plan: RetirementPlan
  display: DisplaySettings
  simulationResult: SimulationResult

  updateProfile: (profile: Partial<Profile>) => void
  addPhase: (phase: Phase) => void
  updatePhase: (id: string, updates: Partial<Phase>) => void
  removePhase: (id: string) => void
  addEvent: (event: PlanEvent) => void
  updateEvent: (id: string, updates: Partial<PlanEvent>) => void
  removeEvent: (id: string) => void

  toggleNominal: () => void
  setDark: (dark: boolean) => void

  importPlan: (plan: RetirementPlan) => void
  exportPlan: () => void
  resetToDefaults: () => void
}

function runSimulation(plan: RetirementPlan): SimulationResult {
  return simulate(plan.profile, plan.phases, plan.events)
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const usePlanStore = create<PlanStore>()(
  persist(
    (set, get) => ({
      plan: DEFAULT_PLAN,
      display: { showNominal: false, dark: false },
      simulationResult: runSimulation(DEFAULT_PLAN),

      updateProfile: (updates) =>
        set((state) => {
          const plan = { ...state.plan, profile: { ...state.plan.profile, ...updates }, lastModified: new Date().toISOString() }
          return { plan, simulationResult: runSimulation(plan) }
        }),

      addPhase: (phase) =>
        set((state) => {
          const plan = { ...state.plan, phases: [...state.plan.phases, phase], lastModified: new Date().toISOString() }
          return { plan, simulationResult: runSimulation(plan) }
        }),

      updatePhase: (id, updates) =>
        set((state) => {
          const plan = {
            ...state.plan,
            phases: state.plan.phases.map(p => p.id === id ? { ...p, ...updates } : p),
            lastModified: new Date().toISOString(),
          }
          return { plan, simulationResult: runSimulation(plan) }
        }),

      removePhase: (id) =>
        set((state) => {
          const plan = { ...state.plan, phases: state.plan.phases.filter(p => p.id !== id), lastModified: new Date().toISOString() }
          return { plan, simulationResult: runSimulation(plan) }
        }),

      addEvent: (event) =>
        set((state) => {
          const plan = { ...state.plan, events: [...state.plan.events, event], lastModified: new Date().toISOString() }
          return { plan, simulationResult: runSimulation(plan) }
        }),

      updateEvent: (id, updates) =>
        set((state) => {
          const plan = {
            ...state.plan,
            events: state.plan.events.map(e => e.id === id ? { ...e, ...updates } : e),
            lastModified: new Date().toISOString(),
          }
          return { plan, simulationResult: runSimulation(plan) }
        }),

      removeEvent: (id) =>
        set((state) => {
          const plan = { ...state.plan, events: state.plan.events.filter(e => e.id !== id), lastModified: new Date().toISOString() }
          return { plan, simulationResult: runSimulation(plan) }
        }),

      toggleNominal: () =>
        set((state) => ({ display: { ...state.display, showNominal: !state.display.showNominal } })),

      setDark: (dark) =>
        set((state) => ({ display: { ...state.display, dark } })),

      importPlan: (plan) =>
        set({ plan, simulationResult: runSimulation(plan) }),

      exportPlan: () => {
        const plan = get().plan
        const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `retirement-plan-${new Date().toISOString().slice(0, 10)}.json`
        a.click()
        URL.revokeObjectURL(url)
      },

      resetToDefaults: () =>
        set({ plan: DEFAULT_PLAN, simulationResult: runSimulation(DEFAULT_PLAN) }),
    }),
    {
      name: 'retirement-planner-v1',
      // Persist plan + display (dark preference survives sessions; showNominal is a bonus)
      partialize: (state) => ({ plan: state.plan, display: state.display }),
      merge: (persisted, current) => ({
        // Deep-merge display so new display fields added later get their initial values
        ...current,
        ...(persisted as typeof current),
        display: {
          ...current.display,
          ...((persisted as typeof current).display ?? {}),
        },
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        // Run migration in case schema changed since data was saved
        state.plan = migrate(state.plan)
        // Recompute simulation from stored plan
        state.simulationResult = runSimulation(state.plan)
        // Sync dark class — belt-and-suspenders alongside the index.html pre-render script
        document.documentElement.classList.toggle('dark', state.display.dark)
      },
    },
  ),
)
