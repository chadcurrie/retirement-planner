import { usePlanStore } from '@/store/planStore'
import { ageFromBirthYear } from '@/lib/simulation'

// ─── Phase bar ─────────────────────────────────────────────────────────────

interface TimelineBarProps {
  startAge: number
  endAge: number
  color: string
}

export function TimelineBar({ startAge, endAge, color }: TimelineBarProps) {
  const birthYear = usePlanStore((s) => s.plan.profile.birthYear)
  const planStart = ageFromBirthYear(birthYear)
  const planEnd = usePlanStore((s) => s.plan.profile.planToAge)
  const range = planEnd - planStart || 1

  const leftPct = Math.max(0, Math.min(100, ((startAge - planStart) / range) * 100))
  const widthPct = Math.max(0, Math.min(100 - leftPct, ((endAge - startAge) / range) * 100))
  const rightPct = leftPct + widthPct

  // Hide a phase label when it would collide with the range endpoint labels
  const showStartLabel = leftPct > 7
  const showEndLabel = rightPct < 93

  return (
    <div className="mt-3">
      {/* Track */}
      <div className="relative h-5">
        {/* Full-width baseline */}
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
        {/* Phase segment */}
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full"
          style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 0.5)}%`, backgroundColor: color, opacity: 0.8 }}
        />
        {/* Start tick */}
        <div
          className="absolute top-1/2 w-px h-4 -translate-y-1/2 -translate-x-px"
          style={{ left: `${leftPct}%`, backgroundColor: color }}
        />
        {/* End tick */}
        <div
          className="absolute top-1/2 w-px h-4 -translate-y-1/2 -translate-x-px"
          style={{ left: `${rightPct}%`, backgroundColor: color }}
        />
      </div>

      {/* Labels */}
      <div className="relative h-3 mt-0.5">
        <span className="absolute left-0 text-[10px] text-ink-2">{planStart}</span>
        {showStartLabel && (
          <span className="absolute text-[10px] font-medium -translate-x-1/2" style={{ left: `${leftPct}%`, color }}>
            {startAge}
          </span>
        )}
        {showEndLabel && (
          <span className="absolute text-[10px] font-medium -translate-x-1/2" style={{ left: `${rightPct}%`, color }}>
            {endAge}
          </span>
        )}
        <span className="absolute right-0 text-[10px] text-ink-2">{planEnd}</span>
      </div>
    </div>
  )
}

// ─── Event dot ─────────────────────────────────────────────────────────────

interface TimelineDotProps {
  age: number
  color: string
}

export function TimelineDot({ age, color }: TimelineDotProps) {
  const birthYear = usePlanStore((s) => s.plan.profile.birthYear)
  const planStart = ageFromBirthYear(birthYear)
  const planEnd = usePlanStore((s) => s.plan.profile.planToAge)
  const range = planEnd - planStart || 1

  const leftPct = Math.max(2, Math.min(98, ((age - planStart) / range) * 100))
  const showLabel = leftPct > 7 && leftPct < 93

  return (
    <div className="mt-3">
      <div className="relative h-5">
        {/* Full-width baseline */}
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
        {/* Tick */}
        <div
          className="absolute top-1/2 w-px h-4 -translate-y-1/2 -translate-x-px"
          style={{ left: `${leftPct}%`, backgroundColor: color }}
        />
        {/* Dot */}
        <div
          className="absolute top-1/2 w-2.5 h-2.5 rounded-full border-2 border-surface -translate-y-1/2 -translate-x-1/2 shadow-sm"
          style={{ left: `${leftPct}%`, backgroundColor: color }}
        />
      </div>

      {/* Labels */}
      <div className="relative h-3 mt-0.5">
        <span className="absolute left-0 text-[10px] text-ink-2">{planStart}</span>
        {showLabel && (
          <span className="absolute text-[10px] font-medium -translate-x-1/2" style={{ left: `${leftPct}%`, color }}>
            {age}
          </span>
        )}
        <span className="absolute right-0 text-[10px] text-ink-2">{planEnd}</span>
      </div>
    </div>
  )
}
