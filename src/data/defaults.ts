import type { RetirementPlan } from './types'

// Starter plan — realistic "on track" American household, 2025 data.
//
// Profile:   Age 43 (median US worker age), $83k gross income (2024 Census median),
//            $240k nest egg (~3× salary — Fidelity benchmark for age 40).
//
// Phases:    Working → Active retirement → Quiet retirement (age 80+, lower spend).
//            Return rates: 7% nominal working, 5% nominal retirement (60/40 portfolio).
//
// Events:    Social Security at 67 (FRA for 1960+ cohort), ~$2,400/mo —
//            realistic for a median earner's full-retirement-age benefit.
//
// What's not modeled: taxes, Medicare premiums (~$2,200/yr at 65+),
// home equity, RMDs at 73, or long-term care costs.

export const DEFAULT_PLAN: RetirementPlan = {
  version: 1,
  lastModified: new Date().toISOString(),
  profile: {
    birthYear: 1983,            // age 43 in 2026 — median US worker age
    currentNestEgg: 240_000,    // ~3× salary — Fidelity "on track" benchmark at 40
    planToAge: 90,              // robust plan — life expectancy avg is 79, plan longer
    inflationRate: 0.03,
  },
  phases: [
    {
      id: 'phase-work',
      name: 'Working years',
      startAge: null,           // linked to Now
      endAge: 65,
      annualIncome: 83_000,     // ~median US household income (2024 Census)
      annualSpending: 65_000,   // leaves ~$18k/yr flowing to nest egg (≈15% savings rate)
      nominalReturnRate: 0.07,  // diversified growth portfolio
      safeReturnRate: 0.02,
      safeYears: 0,
    },
    {
      id: 'phase-retire-active',
      name: 'Active retirement',
      startAge: 65,
      endAge: 80,
      annualIncome: 0,
      annualSpending: 62_000,   // ~80% income replacement — travel, leisure, healthcare
      nominalReturnRate: 0.05,  // conservative 60/40 portfolio
      safeReturnRate: 0.02,
      safeYears: 2,
    },
    {
      id: 'phase-retire-quiet',
      name: 'Quiet retirement',
      startAge: 80,
      endAge: null,             // linked to planToAge
      annualIncome: 0,
      annualSpending: 48_000,   // lower activity, less travel — but higher healthcare
      nominalReturnRate: 0.04,  // more conservative as horizon shortens
      safeReturnRate: 0.02,
      safeYears: 3,
    },
  ],
  events: [
    {
      id: 'event-ss',
      name: 'Social Security',
      age: 67,                  // full retirement age for 1960+ cohort
      amount: 0,
      recurring: {
        annualAmount: 28_800,   // ~$2,400/mo — median earner at full retirement age
        untilAge: null,         // linked to planToAge
      },
    },
  ],
}
