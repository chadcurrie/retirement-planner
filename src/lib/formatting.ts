// Formats a dollar value into a compact, readable string.
// Handles negative values correctly (e.g. -$45K for drawdown contributions).
export function formatDollars(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`
  return `${sign}$${abs.toFixed(0)}`
}

// Same as formatDollars but always shows a +/- sign — for annual contributions.
export function formatDollarsWithSign(value: number): string {
  const prefix = value >= 0 ? '+' : ''
  return `${prefix}${formatDollars(value)}`
}
