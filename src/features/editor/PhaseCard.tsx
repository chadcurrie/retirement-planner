import { usePlanStore } from '@/store/planStore'
import type { Phase } from '@/data/types'
import { ageFromBirthYear } from '@/lib/simulation'
import { Field } from './Field'
import { TimelineBar } from './TimelineBar'
import { PHASE_COLORS } from '@/lib/tokens'

interface PhaseCardProps {
  phase: Phase
  index: number
}

export function PhaseCard({ phase, index }: PhaseCardProps) {
  const updatePhase = usePlanStore((s) => s.updatePhase)
  const removePhase = usePlanStore((s) => s.removePhase)
  const birthYear = usePlanStore((s) => s.plan.profile.birthYear)
  const planToAge = usePlanStore((s) => s.plan.profile.planToAge)
  const currentAge = ageFromBirthYear(birthYear)
  const color = PHASE_COLORS[index % PHASE_COLORS.length]

  const safePoolTarget = phase.annualSpending * phase.safeYears

  return (
    <div className="bg-surface rounded-2xl p-4 space-y-3">
      {/* Name + delete */}
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <input
          type="text"
          value={phase.name}
          placeholder="Phase name"
          onChange={(e) => updatePhase(phase.id, { name: e.target.value })}
          className="flex-1 text-sm font-medium text-ink bg-transparent outline-none placeholder:text-ink-3 min-w-0"
        />
        <button
          onClick={() => removePhase(phase.id)}
          className="text-ink-2 hover:text-danger transition-colors text-lg leading-none shrink-0"
          title="Remove phase"
        >
          ×
        </button>
      </div>

      {/* Timeline bar */}
      <TimelineBar startAge={phase.startAge ?? currentAge} endAge={phase.endAge ?? planToAge} color={color} />

      {/* Row 1: timing + cash flows */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        <Field
          label="Start age"
          value={phase.startAge ?? currentAge}
          linked={phase.startAge === null}
          linkLabel="Now"
          onLinkToggle={() => updatePhase(phase.id, { startAge: phase.startAge === null ? currentAge : null })}
          onChangeValue={(v) => updatePhase(phase.id, { startAge: v })}
        />
        <Field
          label="End age"
          value={phase.endAge ?? planToAge}
          linked={phase.endAge === null}
          onLinkToggle={() => updatePhase(phase.id, { endAge: phase.endAge === null ? planToAge : null })}
          onChangeValue={(v) => updatePhase(phase.id, { endAge: v })}
        />
        <Field
          label="Take-home / yr"
          prefix="$"
          value={phase.annualIncome}
          onChangeValue={(v) => updatePhase(phase.id, { annualIncome: v })}
        />
        <Field
          label="Spending / yr"
          prefix="$"
          value={phase.annualSpending}
          onChangeValue={(v) => updatePhase(phase.id, { annualSpending: v })}
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-ink-2 uppercase tracking-wider whitespace-nowrap">Portfolio returns</span>
        <div className="flex-1 border-t border-dashed border-border" />
      </div>

      {/* Row 2: portfolio allocation */}
      <div className="grid grid-cols-3 gap-5">
        <Field
          label="Growth rate"
          step={0.1}
          suffix="%"
          value={Math.round(phase.nominalReturnRate * 1000) / 10}
          onChangeValue={(v) => updatePhase(phase.id, { nominalReturnRate: v / 100 })}
        />
        <Field
          label="Cash reserve rate"
          step={0.1}
          suffix="%"
          value={Math.round(phase.safeReturnRate * 1000) / 10}
          onChangeValue={(v) => updatePhase(phase.id, { safeReturnRate: v / 100 })}
        />
        <div>
          <Field
            label="Cash reserve (yrs)"
            value={phase.safeYears}
            onChangeValue={(v) => updatePhase(phase.id, { safeYears: Math.round(v) })}
          />
          <p className="text-[10px] text-ink-2 mt-1 pl-0.5">${safePoolTarget.toLocaleString('en-US', { maximumFractionDigits: 0 })} target</p>
        </div>
      </div>

    </div>
  )
}
