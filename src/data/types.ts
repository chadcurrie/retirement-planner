// ─── Core domain types ────────────────────────────────────────────────────────
// All monetary values are in TODAY'S dollars (real terms).
// The simulation engine handles inflation internally via the real return rate.

export interface Profile {
  birthYear: number
  // currentAge is never stored — always derived via ageFromBirthYear() in simulation.ts
  currentNestEgg: number    // today's dollars
  planToAge: number         // single source of truth for plan horizon (e.g. 95)
  inflationRate: number     // e.g. 0.03 for 3%
}

// A contiguous time period with its own financial characteristics.
// Phases cover the full planning horizon — gaps are allowed but flagged in UI.
export interface Phase {
  id: string
  name: string              // e.g. "Tech job", "Startup years", "Retirement"
  startAge: number
  endAge: number | null     // null = "until end of plan" — resolves to planToAge at runtime
  annualIncome: number      // today's dollars
  annualSpending: number    // today's dollars
  nominalReturnRate: number // e.g. 0.07 for 7% (engine subtracts inflation)
  safeReturnRate: number   // e.g. 0.02 for 2% — return on the cash/bond "safe" pool
  safeYears: number        // how many years of net outflow to keep in the safe pool (0 = disabled)
  notes?: string
}

// A one-time or recurring financial event at a specific age.
export interface PlanEvent {
  id: string
  name: string              // e.g. "House sale", "Social Security"
  age: number               // when it fires
  amount: number            // today's dollars — positive=windfall, negative=expense
  recurring?: {
    annualAmount: number    // today's dollars per year after initial event
    untilAge: number | null // null = "until end of plan" — resolves to planToAge at runtime
  }
  notes?: string
}

// ─── Simulation output ────────────────────────────────────────────────────────

export interface SimulationDataPoint {
  age: number
  year: number
  balance: number           // real (today's dollars) by default
  balanceNominal: number    // nominal (future dollars) — for toggle view
  annualContribution: number // income - spending for this year (real)
  activePhase?: string      // phase name for tooltip context
}

export type SimulationResult = SimulationDataPoint[]

// ─── Full plan (what gets saved to localStorage / exported as JSON) ────────────

export interface RetirementPlan {
  version: 1
  lastModified: string      // ISO date string
  profile: Profile
  phases: Phase[]
  events: PlanEvent[]
}
