import type { Profile, Phase, PlanEvent, SimulationDataPoint, SimulationResult } from '@/data/types'

// ─── Age helper ───────────────────────────────────────────────────────────────
// Single source of truth for deriving current age from birth year.
// currentAge is never stored in the plan — always computed fresh.

export function ageFromBirthYear(birthYear: number): number {
  return Math.max(0, new Date().getFullYear() - birthYear)
}

// ─── Pure simulation engine ───────────────────────────────────────────────────
// No React, no side effects. Takes a plan and returns a year-by-year projection.
//
// All inputs are in TODAY'S dollars (real terms).
// Internally uses real return rate = nominalReturn - inflationRate per phase.
// Output includes both real and nominal values for the chart toggle.

// Blends returns across the "safe" cash/bond pool and the growth portfolio.
// When safeYears === 0 (or accumulating), falls back to the plain real return rate.
function computeEffectiveRealReturn(phase: Phase, balance: number, inflationRate: number): number {
  const realGrowthRate = phase.nominalReturnRate - inflationRate
  if (phase.safeYears === 0 || balance <= 0 || phase.annualSpending === 0) return realGrowthRate
  const safePool = Math.min(balance, phase.annualSpending * phase.safeYears)
  const growthPool = balance - safePool
  const realSafeRate = phase.safeReturnRate - inflationRate
  return (safePool * realSafeRate + growthPool * realGrowthRate) / balance
}

function findActivePhase(phases: Phase[], age: number): Phase | undefined {
  return phases.find(p => age >= p.startAge && age <= p.endAge)
}

function getEventContribution(events: PlanEvent[], age: number): number {
  return events.reduce((total, event) => {
    if (event.age === age) {
      total += event.amount
    }
    if (event.recurring && age >= event.age && age <= event.recurring.untilAge) {
      total += event.recurring.annualAmount
    }
    return total
  }, 0)
}

export function simulate(
  profile: Profile,
  phases: Phase[],
  events: PlanEvent[],
): SimulationResult {
  const { birthYear, currentNestEgg, planToAge, inflationRate } = profile
  const currentAge = ageFromBirthYear(birthYear)

  // Resolve null endAge / untilAge → planToAge so the rest of the engine works with plain numbers
  const resolvedPhases = phases.map(p => ({ ...p, endAge: p.endAge ?? planToAge }))
  const resolvedEvents = events.map(e => ({
    ...e,
    recurring: e.recurring ? { ...e.recurring, untilAge: e.recurring.untilAge ?? planToAge } : undefined,
  }))
  const results: SimulationDataPoint[] = []

  let realBalance = currentNestEgg
  const startYear = new Date().getFullYear()

  for (let age = currentAge; age <= planToAge; age++) {
    const year = startYear + (age - currentAge)
    const yearsFromNow = age - currentAge

    const phase = findActivePhase(resolvedPhases, age)
    const realReturnRate = phase ? computeEffectiveRealReturn(phase, realBalance, inflationRate) : 0

    const realEventContribution = getEventContribution(resolvedEvents, age)
    const realNetContribution = phase
      ? phase.annualIncome - phase.annualSpending + realEventContribution
      : realEventContribution

    const realInvestmentReturn = realBalance * realReturnRate
    const inflationFactor = Math.pow(1 + inflationRate, yearsFromNow)

    results.push({
      age,
      year,
      balance: realBalance,
      balanceNominal: realBalance * inflationFactor,
      annualContribution: realNetContribution,
      activePhase: phase?.name,
    })

    realBalance = realBalance + realNetContribution + realInvestmentReturn

    if (realBalance < 0) realBalance = 0
  }

  return results
}

export function findDepletionAge(result: SimulationResult): number | null {
  const depleted = result.find(p => p.balance <= 0)
  return depleted ? depleted.age : null
}

export function findPeakBalance(result: SimulationResult): { balance: number; age: number } {
  return result.reduce(
    (peak, p) => (p.balance > peak.balance ? { balance: p.balance, age: p.age } : peak),
    { balance: 0, age: 0 },
  )
}
