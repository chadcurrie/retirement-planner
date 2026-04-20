import type { RetirementPlan } from '@/data/types'
import { DEFAULT_PLAN } from '@/data/defaults'

/*
  Schema migration — called on every load from localStorage and (eventually) imports.

  HOW TO ADD A NEW VERSION:
  1. Bump `version` in RetirementPlan from `1` to `2` (or whatever).
  2. Write a `migrate_v1_to_v2(raw)` function below.
  3. Add a `case 1:` branch in `migrate()` that calls it and falls through.
  4. The chain handles users who are multiple versions behind.

  WHY THIS MATTERS:
  Old data in localStorage won't have fields you add later. Without migration,
  those fields silently become `undefined` and the app misbehaves. With migration,
  old data gets backfilled with sensible defaults before it's used.
*/

export function migrate(raw: unknown): RetirementPlan {
  if (!raw || typeof raw !== 'object') {
    console.warn('[migration] stored plan is not an object — using default')
    return { ...DEFAULT_PLAN }
  }

  const data = raw as Record<string, unknown>

  switch (data.version) {
    case 1: {
      const plan = data as RetirementPlan
      const profile = plan.profile as Record<string, unknown>
      // Restore planToAge if it was stripped by an earlier migration — derive from phase ends.
      if (profile.planToAge === undefined) {
        const maxAge = plan.phases.reduce((m, p) => {
          const ea = (p as unknown as { endAge: number | null }).endAge
          return Math.max(m, ea ?? 0)
        }, 0)
        profile.planToAge = maxAge > 0 ? maxAge : 95
      }
      // Backfill safeReturnRate and safeYears added in the safe-years portfolio model.
      for (const phase of plan.phases) {
        const p = phase as Partial<typeof phase>
        if (p.safeReturnRate === undefined) p.safeReturnRate = 0.02
        if (p.safeYears === undefined) p.safeYears = 0
      }
      return plan
    }

    default:
      console.warn(`[migration] unknown plan version "${data.version}" — using default`)
      return { ...DEFAULT_PLAN }
  }
}
