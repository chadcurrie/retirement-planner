import { useState, useEffect, useRef } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { usePlanStore } from '@/store/planStore'
import { findDepletionAge, ageFromBirthYear } from '@/lib/simulation'
import { formatDollars, formatDollarsWithSign } from '@/lib/formatting'
import { chartColors, darkChartColors } from '@/lib/tokens'
import type { SimulationDataPoint, SimulationResult } from '@/data/types'

// ─── Plan health meter ────────────────────────────────────────────────────────

const METER_RANGE = 20  // ±years mapped to 0–100% of track

function runwayLabel(years: number, depletionAge: number | null, planToAge: number) {
  if (depletionAge !== null) {
    const short = planToAge - depletionAge
    return { text: `Runs dry at ${depletionAge} · ${short} yrs short`, hex: '#e11d48' }
  }
  const yrs = Math.round(years)
  if (yrs <= 1)  return { text: 'Sweet spot',         hex: '#059669' }
  if (yrs <= 5)  return { text: `${yrs} yr cushion`,  hex: '#059669' }
  if (yrs <= 15) return { text: `+${yrs} yr surplus`, hex: '#f97316' }
  return           { text: 'Healthy legacy',           hex: '#f97316' }
}

interface MeterProps {
  result: SimulationResult
  planToAge: number
  lastPhaseSpending: number
  dotColor: string
  dark: boolean
}

function PlanHealthMeter({ result, planToAge, lastPhaseSpending, dotColor, dark }: MeterProps) {
  const depletionAge = findDepletionAge(result)
  const endBalance = result[result.length - 1]?.balance ?? 0

  const runwayYears = depletionAge !== null
    ? depletionAge - planToAge
    : endBalance / Math.max(1, lastPhaseSpending)

  const position = Math.max(0, Math.min(1, (runwayYears + METER_RANGE) / (2 * METER_RANGE)))
  const { text, hex } = runwayLabel(runwayYears, depletionAge, planToAge)

  const gradient = dark
    ? 'linear-gradient(to right, #1e3a8a, #030712 50%, #7c2d12)'
    : 'linear-gradient(to right, #bfdbfe, #ffffff 50%, #fed7aa)'

  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <span className="text-[10px] text-ink-3 shrink-0">Poor</span>
      {/* Track — overflow-hidden keeps the dot contained */}
      <div className="relative w-[200px] h-2 rounded-full overflow-hidden" style={{ background: gradient }}>
        {/* Sweet-spot notch */}
        <div className="absolute left-1/2 inset-y-0 w-px -translate-x-px bg-white/40" />
        {/* Dot */}
        <div
          className="absolute top-1/2 w-2 h-2 rounded-full -translate-y-1/2 -translate-x-1/2 transition-[left] duration-500 ease-out"
          style={{ left: `${position * 100}%`, backgroundColor: dotColor }}
        />
      </div>
      <span className="text-[10px] text-ink-3 shrink-0">Rich</span>
      <span className="text-xs font-medium whitespace-nowrap shrink-0" style={{ color: hex }}>
        {text}
      </span>
    </div>
  )
}

// ─── Nominal info popover ─────────────────────────────────────────────────────

function NominalInfoButton() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-semibold text-ink-3 hover:text-ink-2 border border-border hover:border-ink-2 transition-colors leading-none"
        aria-label="Explain Today's $ vs Future $"
      >
        i
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-surface border border-border rounded-xl shadow-lg p-4 z-50 space-y-2.5">
          <p className="text-xs font-semibold text-ink">Today's $ vs Future $</p>
          <p className="text-xs text-ink-2 leading-relaxed">
            Both views show the exact same plan — just through different lenses.
          </p>
          <p className="text-xs text-ink-2 leading-relaxed">
            <span className="font-medium text-ink">Today's $</span> adjusts every number for inflation so each dollar on the chart represents the same purchasing power as right now. If it shows $1.2M at age 80, that's roughly what $1.2M buys today.
          </p>
          <p className="text-xs text-ink-2 leading-relaxed">
            <span className="font-medium text-ink">Future $</span> shows the actual numbers that will appear on your account statements — larger, because inflation compounds over decades. The curve looks steeper, but that doesn't mean the plan improved.
          </p>
          <p className="text-xs text-ink-3 leading-relaxed">
            Whether your plan works or runs short is identical in both views. This is purely a display preference.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

interface TooltipProps {
  active?: boolean
  payload?: Array<{ payload: SimulationDataPoint }>
  showNominal: boolean
}

function ChartTooltip({ active, payload, showNominal }: TooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload

  return (
    <div className="bg-surface border border-border rounded-lg shadow-lg p-3 text-sm min-w-36">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <span className="font-semibold text-ink">Age {d.age}</span>
        <span className="text-xs text-ink-2">{d.year}</span>
      </div>
      {d.activePhase && (
        <div className="text-xs text-brand mb-2 truncate">{d.activePhase}</div>
      )}
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-ink-2 text-xs">Balance</span>
          <span className="font-medium text-ink text-xs tabular-nums">
            {formatDollars(showNominal ? d.balanceNominal : d.balance)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-ink-2 text-xs">Net this year</span>
          <span className={`font-medium text-xs tabular-nums ${d.annualContribution >= 0 ? 'text-success' : 'text-danger'}`}>
            {formatDollarsWithSign(d.annualContribution)}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main chart ───────────────────────────────────────────────────────────────

export function NestEggChart() {
  const simulationResult = usePlanStore((s) => s.simulationResult)
  const showNominal = usePlanStore((s) => s.display.showNominal)
  const dark = usePlanStore((s) => s.display.dark)
  const toggleNominal = usePlanStore((s) => s.toggleNominal)
  const birthYear = usePlanStore((s) => s.plan.profile.birthYear)
  const planToAge = usePlanStore((s) => s.plan.profile.planToAge)
  const lastPhaseSpending = usePlanStore((s) => {
    const phases = s.plan.phases
    return phases[phases.length - 1]?.annualSpending ?? 80_000
  })

  const [chartResult, setChartResult] = useState(simulationResult)
  useEffect(() => {
    const id = setTimeout(() => setChartResult(simulationResult), 350)
    return () => clearTimeout(id)
  }, [simulationResult])

  const currentAge = ageFromBirthYear(birthYear)
  const c = dark ? darkChartColors : chartColors

  const depletionAge = findDepletionAge(chartResult)
  const dataKey = showNominal ? 'balanceNominal' : 'balance'

  return (
    <div className="flex flex-col h-full">
      {/* Header row: label · stat chips · toggle */}
      <div className="flex items-center px-4 py-2.5 w-full shrink-0">
        <span className="flex-1 text-xs font-semibold text-ink-2 uppercase tracking-wider">
          Nest Egg
        </span>

        <PlanHealthMeter
          result={chartResult}
          planToAge={planToAge}
          lastPhaseSpending={lastPhaseSpending}
          dotColor={c.nestEgg}
          dark={dark}
        />

        <div className="flex-1 flex justify-end items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden text-xs font-medium">
            <button
              onClick={() => showNominal && toggleNominal()}
              className={`px-2.5 py-1 transition-colors ${
                !showNominal ? 'bg-brand text-white' : 'text-ink-2 hover:text-ink-2 hover:bg-subtle'
              }`}
            >
              Today's $
            </button>
            <button
              onClick={() => !showNominal && toggleNominal()}
              className={`px-2.5 py-1 transition-colors border-l border-border ${
                showNominal ? 'bg-brand text-white' : 'text-ink-2 hover:text-ink-2 hover:bg-subtle'
              }`}
            >
              Future $
            </button>
          </div>
          <NominalInfoButton />
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0 px-2 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartResult} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={c.nestEgg} stopOpacity={0.1} />
                <stop offset="95%" stopColor={c.nestEgg} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />

            <XAxis
              dataKey="age"
              tick={{ fontSize: 10, fill: c.axis }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />

            <YAxis
              tick={{ fontSize: 10, fill: c.axis }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatDollars}
              width={50}
            />

            <Tooltip
              content={<ChartTooltip showNominal={showNominal} />}
              cursor={{ stroke: c.cursor, strokeWidth: 1 }}
            />

            <ReferenceLine
              x={currentAge}
              stroke={c.referenceLine}
              strokeDasharray="4 3"
              label={{ value: 'Now', position: 'insideTopRight', fontSize: 9, fill: c.axis, dy: -2 }}
            />

            {depletionAge && (
              <ReferenceLine
                x={depletionAge}
                stroke={c.depletionLine}
                strokeDasharray="4 3"
                strokeWidth={1.5}
              />
            )}

            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={c.nestEgg}
              strokeWidth={2}
              fill="url(#balanceGradient)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: c.nestEgg }}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
