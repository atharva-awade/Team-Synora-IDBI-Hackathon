import { gradeFor } from '../lib/scoringEngine'
import type { Grade } from '../lib/types'

export interface PortfolioMsme {
  id: string
  name: string
  sector: string
  city: string
  score: number
  prevScore: number
  grade: Grade
  exposure: number // ₹ outstanding
  trend: number[] // last 6 monthly scores
  status: 'healthy' | 'watch' | 'stress'
  warning?: string
}

const NAMES = [
  'Ganesh Hardware', 'Lakshmi Garments', 'Verma Steel Works', 'Coastal Seafoods', 'Nova Plastics',
  'Bright Pharma Distributors', 'Deccan Auto Parts', 'Sunrise Dairy', 'Iyer Timbers', 'Royal Furnishings',
  'Patel Agro Traders', 'Metro Print House', 'Green Valley Spices', 'Apex Electricals', 'Shakti Fabrication',
  'Bansal Textiles', 'Konkan Tiles', 'Prime Packaging', 'Anmol Sweets', 'Vaishno Cement Agency',
  'Orbit Stationers', 'Kisan Fertilizers', 'Sagar Marine', 'Trident Tools', 'Millennium Footwear',
  'Chola Handlooms', 'Everest Chemicals', 'Blue Ridge Foods', 'Sri Balaji Traders', 'Unique Engineering',
  'Zaika Foods', 'Modern Tailors', 'Highland Tea Co', 'Vega Solar Solutions', 'Amrit Provisions',
]
const SECTORS = [
  'Hardware retail', 'Apparel manufacturing', 'Metal fabrication', 'Seafood processing', 'Plastics',
  'Pharma distribution', 'Auto components', 'Dairy', 'Timber trading', 'Home furnishings',
  'Agri trading', 'Printing', 'Spices & condiments', 'Electricals', 'Fabrication',
]
const CITIES = [
  'Pune', 'Ludhiana', 'Rajkot', 'Kochi', 'Indore', 'Jaipur', 'Ahmedabad', 'Vadodara', 'Madurai',
  'Nashik', 'Ludhiana', 'Guwahati', 'Bhopal', 'Coimbatore', 'Kolkata',
]

// Deterministic pseudo-random from an index (no Math.random -> reproducible).
function rng(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

function buildTrend(base: number, drift: number): number[] {
  const arr: number[] = []
  for (let m = 0; m < 6; m++) {
    const noise = (rng(base, m) - 0.5) * 3
    arr.push(Math.round(base - drift * (5 - m) + noise))
  }
  arr[5] = base
  return arr
}

function make(i: number): PortfolioMsme {
  const base = Math.round(42 + rng(i, 1) * 52) // 42..94
  const declining = rng(i, 2) > 0.78
  const drift = declining ? 3 + Math.round(rng(i, 3) * 5) : Math.round((rng(i, 4) - 0.6) * 2)
  const trend = buildTrend(base, drift)
  const prevScore = trend[4]
  const grade = gradeFor(base).grade
  const exposure = Math.round((3 + rng(i, 5) * 45)) * 100000
  let status: PortfolioMsme['status'] = 'healthy'
  let warning: string | undefined
  const slip = base - prevScore
  if (declining && slip <= -4) {
    status = 'stress'
    warning = warningText(i)
  } else if (base < 58 || slip <= -3) {
    status = 'watch'
    if (base < 58) warning = 'Thin cash-flow buffer — monitor'
  }
  return {
    id: `pf-${i}`,
    name: NAMES[i % NAMES.length],
    sector: SECTORS[i % SECTORS.length],
    city: CITIES[i % CITIES.length],
    score: base,
    prevScore,
    grade,
    exposure,
    trend,
    status,
    warning,
  }
}

const WARNINGS = [
  'GST filing lapsed + falling inflows — stress 60–90 days out',
  'Utilization rose to 88% while receipts dropped 22%',
  'Two NACH bounces this quarter; surplus turned negative',
  'Turnover down 3 straight months; buyer concentration rising',
  'PF contributions paused; wage outflow up, inflow down',
]
function warningText(i: number): string {
  return WARNINGS[i % WARNINGS.length]
}

export const PORTFOLIO: PortfolioMsme[] = Array.from({ length: 34 }, (_, i) => make(i + 1))

// A couple of hand-placed stress accounts so the early-warning story always lands.
PORTFOLIO.unshift(
  {
    id: 'pf-alert-1',
    name: 'Deccan Poly Weaves',
    sector: 'Textile weaving',
    city: 'Solapur',
    score: 58,
    prevScore: 71,
    grade: gradeFor(58).grade,
    exposure: 3200000,
    trend: [76, 74, 72, 70, 71, 58],
    status: 'stress',
    warning: 'GST filing lapsed 2 months + inflows down 24% — projected stress in ~75 days',
  },
  {
    id: 'pf-alert-2',
    name: 'Fortune Agro Mills',
    sector: 'Food processing',
    city: 'Karnal',
    score: 61,
    prevScore: 69,
    grade: gradeFor(61).grade,
    exposure: 5400000,
    trend: [70, 71, 69, 68, 69, 61],
    status: 'stress',
    warning: 'Utilization at 91% with a NACH bounce this month — early-warning triggered',
  },
)

export const portfolioStats = () => {
  const total = PORTFOLIO.length
  const stress = PORTFOLIO.filter((p) => p.status === 'stress').length
  const watch = PORTFOLIO.filter((p) => p.status === 'watch').length
  const healthy = total - stress - watch
  const exposure = PORTFOLIO.reduce((s, p) => s + p.exposure, 0)
  const atRisk = PORTFOLIO.filter((p) => p.status === 'stress').reduce((s, p) => s + p.exposure, 0)
  const avg = Math.round(PORTFOLIO.reduce((s, p) => s + p.score, 0) / total)
  return { total, stress, watch, healthy, exposure, atRisk, avg }
}

export const scoreDistribution = () => {
  const bins = [
    { band: 'D', range: '<45', count: 0, color: '--color-danger' },
    { band: 'C', range: '45–54', count: 0, color: '--color-warn' },
    { band: 'B', range: '55–64', count: 0, color: '--color-dim-4' },
    { band: 'B+', range: '65–74', count: 0, color: '--color-dim-6' },
    { band: 'A', range: '75–84', count: 0, color: '--color-dim-2' },
    { band: 'A+', range: '85+', count: 0, color: '--color-brand' },
  ]
  for (const p of PORTFOLIO) {
    if (p.score < 45) bins[0].count++
    else if (p.score < 55) bins[1].count++
    else if (p.score < 65) bins[2].count++
    else if (p.score < 75) bins[3].count++
    else if (p.score < 85) bins[4].count++
    else bins[5].count++
  }
  return bins
}
