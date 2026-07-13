// Indian-format helpers (lakh / crore, ₹ grouping).

export function inr(value: number): string {
  return '₹' + Math.round(value).toLocaleString('en-IN')
}

/** Compact Indian currency: ₹5.6L, ₹1.1Cr, ₹85K. */
export function inrCompact(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1e7) return '₹' + trimZero(value / 1e7) + 'Cr'
  if (abs >= 1e5) return '₹' + trimZero(value / 1e5) + 'L'
  if (abs >= 1e3) return '₹' + trimZero(value / 1e3) + 'K'
  return '₹' + Math.round(value)
}

function trimZero(n: number): string {
  const s = n.toFixed(n < 10 ? 2 : 1)
  return s.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')
}

export function pct(value: number, digits = 0): string {
  return value.toFixed(digits) + '%'
}

export function monthsToYears(m: number): string {
  const y = Math.floor(m / 12)
  const rem = m % 12
  if (y === 0) return `${rem} mo`
  if (rem === 0) return `${y} yr`
  return `${y}y ${rem}m`
}
