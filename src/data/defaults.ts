import type { RetirementPlan } from './types'

// Starter plan — gives the user something to work with immediately.
// birthYear 1981 → currentAge 45 in 2026. Phases start at 45.
export const DEFAULT_PLAN: RetirementPlan = {
  version: 1,
  lastModified: new Date().toISOString(),
  profile: {
    birthYear: 1981,
    currentNestEgg: 500_000,
    planToAge: 95,
    inflationRate: 0.03,
  },
  phases: [
    {
      id: 'phase-work',
      name: 'Working years',
      startAge: null,         // linked to Now
      endAge: 65,
      annualIncome: 150_000,
      annualSpending: 90_000,
      nominalReturnRate: 0.07,
      safeReturnRate: 0.02,
      safeYears: 0,
    },
    {
      id: 'phase-retire',
      name: 'Retirement',
      startAge: 65,
      endAge: null,           // linked to planToAge
      annualIncome: 0,
      annualSpending: 80_000,
      nominalReturnRate: 0.05,
      safeReturnRate: 0.02,
      safeYears: 2,
    },
  ],
  events: [
    {
      id: 'event-ss',
      name: 'Social Security',
      age: 67,
      amount: 0,
      recurring: {
        annualAmount: 24_000,
        untilAge: null,       // linked to planToAge
      },
    },
  ],
}
