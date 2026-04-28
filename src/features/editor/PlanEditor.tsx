import { usePlanStore } from '@/store/planStore'
import { ageFromBirthYear } from '@/lib/simulation'
import { ProfileEditor } from './ProfileEditor'
import { PhaseCard } from './PhaseCard'
import { EventCard } from './EventCard'

function newPhaseId() { return `phase-${crypto.randomUUID()}` }
function newEventId() { return `event-${crypto.randomUUID()}` }

export function PlanEditor() {
  const phases = usePlanStore((s) => s.plan.phases)
  const events = usePlanStore((s) => s.plan.events)
  const profile = usePlanStore((s) => s.plan.profile)
  const addPhase = usePlanStore((s) => s.addPhase)
  const addEvent = usePlanStore((s) => s.addEvent)

  function handleAddPhase() {
    const currentAge = ageFromBirthYear(profile.birthYear)
    const lastPhase = phases[phases.length - 1]
    const startAge = lastPhase ? (lastPhase.endAge ?? profile.planToAge) : currentAge
    const endAge = Math.min(startAge + 10, profile.planToAge)
    addPhase({
      id: newPhaseId(),
      name: 'New phase',
      startAge,
      endAge,
      annualIncome: 0,
      annualSpending: 80_000,
      nominalReturnRate: 0.06,
      safeReturnRate: 0.02,
      safeYears: 0,
    })
  }

  function handleAddEvent() {
    const currentAge = ageFromBirthYear(profile.birthYear)
    addEvent({
      id: newEventId(),
      name: 'New event',
      age: currentAge + 5,
      amount: 0,
    })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <ProfileEditor />

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-heading">Phases</h2>
          <span className="text-xs text-ink-2">{phases.length} phase{phases.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="space-y-5">
          {phases.map((phase, i) => (
            <PhaseCard key={phase.id} phase={phase} index={i} />
          ))}
        </div>
        <button
          onClick={handleAddPhase}
          className="mt-3 w-full py-2 text-sm text-ink-2 hover:text-ink border border-dashed border-border hover:border-ink-2 rounded-xl transition-colors"
        >
          + Add phase
        </button>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-heading">Events</h2>
          <span className="text-xs text-ink-2">{events.length} event{events.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="space-y-5">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
        <button
          onClick={handleAddEvent}
          className="mt-3 w-full py-2 text-sm text-ink-2 hover:text-ink border border-dashed border-border hover:border-ink-2 rounded-xl transition-colors"
        >
          + Add event
        </button>
      </section>
    </div>
  )
}
