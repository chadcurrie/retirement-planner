/*
  Chart color tokens — used by Recharts (SVG-based, can't read CSS classes).

  KEEP IN SYNC with the CSS custom properties in src/index.css.
  When you rebrand, update both files.

  chartColors     → light mode  (matches :root values in index.css)
  darkChartColors → dark mode   (matches .dark values in index.css)
*/

export const chartColors = {
  nestEgg:       '#0f172a',   // slate-900 — neutral line, no semantic meaning
  brand:         '#3b82f6',   // --brand (kept for UI accents)
  grid:          '#f1f5f9',   // lighter than --subtle, very soft gridlines
  axis:          '#4b5563',   // --ink-2
  cursor:        '#e2e8f0',   // between --border and --subtle
  referenceLine: '#cbd5e1',   // muted slate
  depletionLine: '#d97706',   // --warn
  success:       '#059669',   // --success  ← event positive
  warn:          '#d97706',   // --warn
  danger:        '#e11d48',   // --danger   ← event negative
} as const

export const darkChartColors = {
  nestEgg:       '#f1f5f9',   // slate-100 — light line on dark bg
  brand:         '#60a5fa',   // --brand (dark)
  grid:          '#1f2937',   // --subtle (dark)
  axis:          '#d1d5db',   // --ink-2 (dark)
  cursor:        '#374151',   // --border (dark)
  referenceLine: '#374151',   // --border (dark)
  depletionLine: '#fbbf24',   // --warn (dark)
  success:       '#34d399',   // --success (dark)
  warn:          '#fbbf24',   // --warn (dark)
  danger:        '#fb7185',   // --danger (dark)
} as const

// Per-phase color palette — wraps at 6.
// Avoids green/red (event semantics) and amber (warn/depletion).
// Blue is fine here — the nest egg line is now neutral, not blue.
export const PHASE_COLORS = [
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#f97316', // orange-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#6366f1', // indigo-500
] as const
