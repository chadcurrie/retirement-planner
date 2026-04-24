import { usePlanStore } from '@/store/planStore'
import type { PlanEvent } from '@/data/types'
import { ageFromBirthYear } from '@/lib/simulation'
import { Field } from './Field'
import { TimelineDot } from './TimelineBar'
import { chartColors } from '@/lib/tokens'

interface EventCardProps {
  event: PlanEvent
}

export function EventCard({ event }: EventCardProps) {
  const updateEvent = usePlanStore((s) => s.updateEvent)
  const removeEvent = usePlanStore((s) => s.removeEvent)
  const birthYear = usePlanStore((s) => s.plan.profile.birthYear)
  const planToAge = usePlanStore((s) => s.plan.profile.planToAge)
  const currentAge = ageFromBirthYear(birthYear)

  const isYearly = !!event.recurring
  // Single display amount — whichever field is active in the current mode
  const amount = isYearly ? (event.recurring?.annualAmount ?? 0) : event.amount
  const dotColor = amount >= 0 ? chartColors.success : chartColors.danger

  function setOneTime() {
    // Carry the yearly amount back into the one-time field
    updateEvent(event.id, {
      amount: event.recurring?.annualAmount ?? event.amount,
      recurring: undefined,
    })
  }

  function setYearly() {
    // Carry the one-time amount into the yearly field
    updateEvent(event.id, {
      amount: 0,
      recurring: { annualAmount: event.amount, untilAge: event.recurring?.untilAge ?? 95 },
    })
  }

  function handleAmount(v: number) {
    if (isYearly) {
      updateEvent(event.id, { recurring: { ...event.recurring!, annualAmount: v } })
    } else {
      updateEvent(event.id, { amount: v })
    }
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
      {/* Name + delete */}
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
        <input
          type="text"
          value={event.name}
          placeholder="Event name"
          onChange={(e) => updateEvent(event.id, { name: e.target.value })}
          className="flex-1 text-sm font-medium text-ink bg-transparent outline-none placeholder:text-ink-3 min-w-0"
        />
        <button
          onClick={() => removeEvent(event.id)}
          className="text-ink-2 hover:text-danger transition-colors text-lg leading-none shrink-0"
          title="Remove event"
        >
          ×
        </button>
      </div>

      {/* Timeline */}
      <TimelineDot age={event.age ?? currentAge} color={dotColor} />

      {/* All fields in one row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        <Field
          label="At age"
          value={event.age ?? currentAge}
          linked={event.age === null}
          linkLabel="Now"
          onLinkToggle={() => updateEvent(event.id, { age: event.age === null ? currentAge : null })}
          onChangeValue={(v) => updateEvent(event.id, { age: v })}
        />
        <Field
          label={isYearly ? 'After-tax / yr' : 'After-tax amount'}
          prefix="$"
          placeholder="0"
          value={amount}
          onChangeValue={handleAmount}
        />

        {/* Frequency toggle — invisible label spacer aligns it with the Field inputs */}
        <div>
          <div className="text-xs mb-1 invisible select-none" aria-hidden>x</div>
          <div className="flex rounded-lg border border-border overflow-hidden text-xs font-medium h-[34px]">
            <button
              onClick={setOneTime}
              className={`flex-1 transition-colors ${
                !isYearly ? 'bg-brand text-white' : 'text-ink-2 hover:text-ink hover:bg-subtle'
              }`}
            >
              One-time
            </button>
            <button
              onClick={setYearly}
              className={`flex-1 transition-colors border-l border-border ${
                isYearly ? 'bg-brand text-white' : 'text-ink-2 hover:text-ink hover:bg-subtle'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Until age — greyed when one-time so layout stays stable */}
        <div className={!isYearly ? 'opacity-40 pointer-events-none' : ''}>
          <Field
            label="Until age"
            value={event.recurring?.untilAge ?? planToAge}
            linked={isYearly && event.recurring?.untilAge === null}
            onLinkToggle={isYearly ? () => updateEvent(event.id, {
              recurring: {
                ...event.recurring!,
                untilAge: event.recurring?.untilAge === null ? planToAge : null,
              },
            }) : undefined}
            onChangeValue={(v) => updateEvent(event.id, { recurring: { ...event.recurring!, untilAge: v } })}
          />
        </div>
      </div>
    </div>
  )
}
