// Domain model for UdyamPulse — the MSME Financial Health Card.

export type DimensionKey =
  | 'cashflow'
  | 'momentum'
  | 'repayment'
  | 'compliance'
  | 'workforce'
  | 'digital'

export type Grade = 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D'

export type EmployeeTrend = 'growing' | 'stable' | 'declining'

/** Raw, source-attributed signals — everything the score is built from. */
export interface Signals {
  // Cash-Flow Vitality (Account Aggregator statements + UPI)
  avgMonthlyInflow: number // ₹
  avgMonthlyOutflow: number // ₹
  monthsPositiveClosingBalance: number // 0..12
  inflowVolatilityCV: number // 0..1 coefficient of variation

  // Business Momentum (GSTN — GSTR-1 / GSTR-3B)
  gstTurnoverGrowthYoY: number // %
  onTimeGstFilingStreak: number // 0..12
  turnoverVolatilityCV: number // 0..1

  // Repayment Discipline (AA debits / NACH + bureau or proxies)
  onTimeObligationRatio: number // 0..1
  bounceCount12mo: number
  creditUtilization: number // 0..1

  // Compliance & Formalization (GST / ITR / Udyam / TDS)
  udyamRegistered: boolean
  gstActive: boolean
  itrFiledLast2Yrs: boolean
  tdsCompliant: boolean
  gstReturnsOnTimePct: number // 0..1

  // Workforce Stability (EPFO ECR)
  employeeTrend: EmployeeTrend
  pfContributionMonths: number // 0..12
  wageGrowthYoY: number // %

  // Digital & Ecosystem Footprint (UPI + AA counterparties)
  upiTxnPerMonth: number
  uniqueCounterparties: number
  digitalRevenueSharePct: number // 0..1

  // Underwriting reference
  annualGstTurnover: number // ₹

  // Cross-source reconciliation (for the Trust Triangle)
  bankCreditsAnnual: number // ₹ — total credits seen via AA
  upiInflowAnnual: number // ₹ — total UPI inflow
  circularTxnSharePct: number // 0..1 — share looping back to same counterparties
  topCounterpartyConcentration: number // 0..1 — revenue from single buyer
}

export interface ReasonChip {
  text: string
  points: number // signed contribution feel (+/-)
  polarity: 'pos' | 'neg' | 'neutral'
}

export interface DimensionScore {
  key: DimensionKey
  label: string
  short: string
  source: string
  weight: number // 0..1
  score: number // 0..100
  contribution: number // weight * score, points toward the 0..100 total
  reasons: ReasonChip[]
}

export interface ScoreResult {
  overall: number // 0..100
  grade: Grade
  verdict: string
  action: string
  eligibleLimit: number // ₹
  monthlySurplus: number // ₹
  confidence: number // 0..100 — data coverage/freshness
  dimensions: DimensionScore[]
}

export interface ConsentSource {
  id: string
  name: string
  short: string
  provider: string // e.g. "via Account Aggregator", "GSTN"
  icon: string // lucide icon name
  coverageMonths: number
  lastSyncDays: number
  connected: boolean
  dim: DimensionKey
}

export interface CashFlowMonth {
  month: string
  inflow: number
  outflow: number
  balance: number
}

export interface MsmeProfile {
  id: string
  name: string
  owner: string
  initials: string
  sector: string
  nicCode: string
  city: string
  state: string
  constitution: string // Proprietorship / Partnership / Pvt Ltd
  vintageMonths: number
  employees: number
  udyamNumber: string
  gstinMasked: string
  tags: string[] // e.g. ["NTC", "NTB"]
  headline: string // the human story
  rejectionNote?: string
  signals: Signals
  cashflow: CashFlowMonth[]
}
