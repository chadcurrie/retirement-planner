import { usePlanStore } from '@/store/planStore'
import { ageFromBirthYear } from '@/lib/simulation'
import { Field } from './Field'

export function ProfileEditor() {
  const profile = usePlanStore((s) => s.plan.profile)
  const updateProfile = usePlanStore((s) => s.updateProfile)

  const currentAge = ageFromBirthYear(profile.birthYear)

  return (
    <section>
      <h2 className="section-heading mb-3">Profile</h2>
      <div className="bg-surface rounded-xl border border-border p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <Field
              label="Birth year"
              plain
              value={profile.birthYear}
              onChangeValue={(v) => updateProfile({ birthYear: v })}
            />
            {/* Derived age — no editable field, just a confirmation */}
            <p className="text-[10px] text-ink-2 mt-1 pl-0.5">Age {currentAge} in {new Date().getFullYear()}</p>
          </div>
          <Field
            label="Current nest egg"
            prefix="$"
            value={profile.currentNestEgg}
            onChangeValue={(v) => updateProfile({ currentNestEgg: v })}
          />
          <Field
            label="Plan to age"
            value={profile.planToAge}
            onChangeValue={(v) => updateProfile({ planToAge: v })}
          />
          <Field
            label="Inflation rate"
            step={0.1}
            suffix="%"
            value={Math.round(profile.inflationRate * 1000) / 10}
            onChangeValue={(v) => updateProfile({ inflationRate: v / 100 })}
          />
        </div>
      </div>
    </section>
  )
}
