import { useState, useEffect } from 'react'
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
import { findDepletionAge, findPeakBalance, ageFromBirthYear } from '@/lib/simulation'
import { formatDollars, formatDollarsWithSign } from '@/lib/formatting'
import { chartColors, darkChartColors } from '@/lib/tokens'
import type { SimulationDataPoint } from '@/data/types'

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

  const [chartResult, setChartResult] = useState(simulationResult)
  useEffect(() => {
    const id = setTimeout(() => setChartResult(simulationResult), 350)
    return () => clearTimeout(id)
  }, [simulationResult])

  const currentAge = ageFromBirthYear(birthYear)
  const c = dark ? darkChartColors : chartColors  // pick color set based on mode

  const depletionAge = findDepletionAge(chartResult)
  const peak = findPeakBalance(chartResult)
  const peakNominal = chartResult.find((p) => p.age === peak.age)?.balanceNominal ?? peak.balance
  const peakDisplay = showNominal ? peakNominal : peak.balance

  const dataKey = showNominal ? 'balanceNominal' : 'balance'

  return (
    <div className="flex flex-col h-full">
      {/* Header row: label · stat chips · toggle */}
      <div className="flex items-center gap-2 px-4 py-2.5 flex-wrap shrink-0">
        <span className="text-xs font-semibold text-ink-2 uppercase tracking-wider shrink-0">
          Nest Egg
        </span>

        <div className="flex items-center gap-2 flex-1 flex-wrap min-w-0">
          <span className="text-xs bg-subtle text-ink-2 px-2 py-0.5 rounded-full whitespace-nowrap">
            Peak {formatDollars(peakDisplay)} · age {peak.age}
          </span>
          {depletionAge ? (
            <span className="text-xs bg-warn-subtle text-warn px-2 py-0.5 rounded-full whitespace-nowrap">
              Depleted age {depletionAge}
            </span>
          ) : (
            <span className="text-xs bg-success-subtle text-success px-2 py-0.5 rounded-full whitespace-nowrap">
              {formatDollars(showNominal
                ? (chartResult[chartResult.length - 1]?.balanceNominal ?? 0)
                : (chartResult[chartResult.length - 1]?.balance ?? 0)
              )} at {planToAge}
            </span>
          )}
          <span className="text-xs text-ink-2 whitespace-nowrap">
            {showNominal ? 'nominal $' : "today's $"}
          </span>
        </div>

        <div className="flex rounded-lg border border-border overflow-hidden text-xs font-medium shrink-0">
          <button
            onClick={() => showNominal && toggleNominal()}
            className={`px-2.5 py-1 transition-colors ${
              !showNominal ? 'bg-brand text-white' : 'text-ink-2 hover:text-ink-2 hover:bg-subtle'
            }`}
          >
            Real
          </button>
          <button
            onClick={() => !showNominal && toggleNominal()}
            className={`px-2.5 py-1 transition-colors border-l border-border ${
              showNominal ? 'bg-brand text-white' : 'text-ink-2 hover:text-ink-2 hover:bg-subtle'
            }`}
          >
            Nominal
          </button>
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
