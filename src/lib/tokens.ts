/*
  Chart color tokens — used by Recharts (SVG-based, can't read CSS classes).

  KEEP IN SYNC with the CSS custom properties in src/index.css.
  When you rebrand, update both files.

  chartColors     → light mode  (matches :root values in index.css)
  darkChartColors → dark mode   (matches .dark values in index.css)
*/

export const chartColors = {
  nestEgg:       '#000000',   // pure black — maximum contrast on white surface
  brand:         '#00b4d8',   // --brand: process cyan
  grid:          '#b8b8b8',   // visible mid-gray gridlines
  axis:          '#4a4a4a',   // --ink-2
  cursor:        '#888888',   // neutral hover line
  referenceLine: '#888888',   // muted rule
  depletionLine: '#e0003c',   // --danger: process red
  success:       '#00c853',   // acid green
  warn:          '#d4900a',   // --warn
  danger:        '#ff1744',   // acid red
} as const

export const darkChartColors = {
  nestEgg:       '#ffffff',   // pure white — maximum contrast on dark surface
  brand:         '#00d0f0',   // --brand (dark): bright cyan
  grid:          '#2e2e2e',   // subtle dark gridlines
  axis:          '#aaaaaa',   // --ink-2 (dark)
  cursor:        '#3a3a3a',   // neutral hover line
  referenceLine: '#3a3a3a',   // muted rule
  depletionLine: '#ff1744',   // acid red
  success:       '#00ff7f',   // neon spring green
  warn:          '#ffd600',   // acid yellow
  danger:        '#ff1744',   // acid red
} as const

// Per-phase color palette — CMYK acidic. Wraps at 6.
// Used as decorative swatches (timeline bars, dots) — not as text colors.
export const PHASE_COLORS = [
  '#00b4d8', // process cyan
  '#d500f9', // electric magenta-violet
  '#ffb300', // vivid amber
  '#00c853', // acid green
  '#ff6d00', // vivid orange
  '#6200ea', // electric violet
] as const
