// UdyamPulse scoring engine.
//
// A transparent, deterministic six-pillar model. It is intentionally a
// glass-box: every point is traceable to a source signal, so a borrower can
// understand it and a regulator can audit it. In production the transparent
// formulas are replaced by a monitored gradient-boosted model that retains the
// same per-feature attribution (SHAP) — the interface here is identical.

import type {
  DimensionKey,
  DimensionScore,
  Grade,
  ReasonChip,
  ScoreResult,
  Signals,
} from './types'

const clamp = (x: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x))
const r1 = (x: number) => Math.round(x * 10) / 10

export interface DimensionMeta {
  key: DimensionKey
  label: string
  short: string
  source: string
  weight: number
}

export const DIMENSIONS: DimensionMeta[] = [
  { key: 'cashflow', label: 'Cash-Flow Vitality', short: 'Cash-Flow', source: 'Account Aggregator + UPI', weight: 0.25 },
  { key: 'momentum', label: 'Business Momentum', short: 'Momentum', source: 'GSTN · GSTR-1 / 3B', weight: 0.2 },
  { key: 'repayment', label: 'Repayment Discipline', short: 'Repayment', source: 'AA debits · NACH', weight: 0.2 },
  { key: 'compliance', label: 'Compliance & Formalization', short: 'Compliance', source: 'GST · ITR · Udyam · TDS', weight: 0.15 },
  { key: 'workforce', label: 'Workforce Stability', short: 'Workforce', source: 'EPFO · ECR', weight: 0.1 },
  { key: 'digital', label: 'Digital & Ecosystem Footprint', short: 'Digital', source: 'UPI · AA counterparties', weight: 0.1 },
]

export const DIM_COLORVAR: Record<DimensionKey, string> = {
  cashflow: '--color-dim-1',
  momentum: '--color-dim-2',
  repayment: '--color-dim-3',
  compliance: '--color-dim-4',
  workforce: '--color-dim-5',
  digital: '--color-dim-6',
}

// --- individual pillar computations, each returns score + reason breakdown ---

function scoreCashflow(s: Signals): { score: number; reasons: ReasonChip[] } {
  const surplusRatio =
    s.avgMonthlyInflow > 0
      ? (s.avgMonthlyInflow - s.avgMonthlyOutflow) / s.avgMonthlyInflow
      : 0
  const p1 = Math.min(surplusRatio * 250, 40)
  const p2 = (s.monthsPositiveClosingBalance / 12) * 30
  const p3 = (1 - s.inflowVolatilityCV) * 30
  const reasons: ReasonChip[] = [
    {
      text: `${(surplusRatio * 100).toFixed(0)}% average monthly cash surplus`,
      points: r1(p1),
      polarity: p1 >= 20 ? 'pos' : p1 <= 8 ? 'neg' : 'neutral',
    },
    {
      text: `${s.monthsPositiveClosingBalance}/12 months with a positive closing balance`,
      points: r1(p2),
      polarity: s.monthsPositiveClosingBalance >= 9 ? 'pos' : s.monthsPositiveClosingBalance <= 6 ? 'neg' : 'neutral',
    },
    {
      text: `Inflow stability (variation ${(s.inflowVolatilityCV * 100).toFixed(0)}%)`,
      points: r1(p3),
      polarity: s.inflowVolatilityCV <= 0.25 ? 'pos' : s.inflowVolatilityCV >= 0.5 ? 'neg' : 'neutral',
    },
  ]
  return { score: clamp(p1 + p2 + p3), reasons }
}

function scoreMomentum(s: Signals): { score: number; reasons: ReasonChip[] } {
  const p1 = Math.min(50 + s.gstTurnoverGrowthYoY * 1.5, 50)
  const p2 = (s.onTimeGstFilingStreak / 12) * 30
  const p3 = (1 - s.turnoverVolatilityCV) * 20
  const reasons: ReasonChip[] = [
    {
      text: `GST turnover ${s.gstTurnoverGrowthYoY >= 0 ? 'up' : 'down'} ${Math.abs(s.gstTurnoverGrowthYoY)}% YoY`,
      points: r1(p1),
      polarity: s.gstTurnoverGrowthYoY >= 8 ? 'pos' : s.gstTurnoverGrowthYoY < 0 ? 'neg' : 'neutral',
    },
    {
      text: `${s.onTimeGstFilingStreak}/12 on-time GST filings`,
      points: r1(p2),
      polarity: s.onTimeGstFilingStreak >= 10 ? 'pos' : s.onTimeGstFilingStreak <= 6 ? 'neg' : 'neutral',
    },
    {
      text: `Revenue consistency (variation ${(s.turnoverVolatilityCV * 100).toFixed(0)}%)`,
      points: r1(p3),
      polarity: s.turnoverVolatilityCV <= 0.25 ? 'pos' : s.turnoverVolatilityCV >= 0.5 ? 'neg' : 'neutral',
    },
  ]
  return { score: clamp(p1 + p2 + p3), reasons }
}

function scoreRepayment(s: Signals): { score: number; reasons: ReasonChip[] } {
  const p1 = s.onTimeObligationRatio * 50
  const p2 = Math.max(0, 30 - s.bounceCount12mo * 7.5)
  const p3 = Math.max(0, 20 - s.creditUtilization * 20)
  const reasons: ReasonChip[] = [
    {
      text: `${(s.onTimeObligationRatio * 100).toFixed(0)}% of obligations paid on time`,
      points: r1(p1),
      polarity: s.onTimeObligationRatio >= 0.9 ? 'pos' : s.onTimeObligationRatio <= 0.7 ? 'neg' : 'neutral',
    },
    {
      text:
        s.bounceCount12mo === 0
          ? 'No NACH / cheque bounces in 12 months'
          : `${s.bounceCount12mo} NACH / cheque bounce${s.bounceCount12mo > 1 ? 'es' : ''} in 12 months`,
      points: r1(p2),
      polarity: s.bounceCount12mo === 0 ? 'pos' : s.bounceCount12mo >= 3 ? 'neg' : 'neutral',
    },
    {
      text: `${(s.creditUtilization * 100).toFixed(0)}% credit-line utilization`,
      points: r1(p3),
      polarity: s.creditUtilization <= 0.35 ? 'pos' : s.creditUtilization >= 0.7 ? 'neg' : 'neutral',
    },
  ]
  return { score: clamp(p1 + p2 + p3), reasons }
}

function scoreCompliance(s: Signals): { score: number; reasons: ReasonChip[] } {
  const pUd = s.udyamRegistered ? 15 : 0
  const pGst = s.gstActive ? 15 : 0
  const pItr = s.itrFiledLast2Yrs ? 20 : 0
  const pTds = s.tdsCompliant ? 10 : 0
  const pRet = s.gstReturnsOnTimePct * 40
  const reasons: ReasonChip[] = [
    {
      text: s.udyamRegistered ? 'Udyam registered' : 'Not Udyam registered',
      points: pUd,
      polarity: s.udyamRegistered ? 'pos' : 'neg',
    },
    {
      text: s.gstActive ? 'Active GST registration' : 'GST inactive / cancelled',
      points: pGst,
      polarity: s.gstActive ? 'pos' : 'neg',
    },
    {
      text: s.itrFiledLast2Yrs ? 'ITR filed for last 2 years' : 'ITR not filed (last 2 years)',
      points: pItr,
      polarity: s.itrFiledLast2Yrs ? 'pos' : 'neg',
    },
    {
      text: `${(s.gstReturnsOnTimePct * 100).toFixed(0)}% GST returns filed on time`,
      points: r1(pRet),
      polarity: s.gstReturnsOnTimePct >= 0.85 ? 'pos' : s.gstReturnsOnTimePct <= 0.6 ? 'neg' : 'neutral',
    },
  ]
  return { score: clamp(pUd + pGst + pItr + pTds + pRet), reasons }
}

function scoreWorkforce(s: Signals): { score: number; reasons: ReasonChip[] } {
  const trendPts = s.employeeTrend === 'growing' ? 40 : s.employeeTrend === 'stable' ? 28 : 12
  const p2 = (s.pfContributionMonths / 12) * 35
  const p3 = Math.min(Math.max(s.wageGrowthYoY, 0) * 2, 25)
  const reasons: ReasonChip[] = [
    {
      text: `Headcount ${s.employeeTrend}`,
      points: trendPts,
      polarity: s.employeeTrend === 'growing' ? 'pos' : s.employeeTrend === 'declining' ? 'neg' : 'neutral',
    },
    {
      text: `${s.pfContributionMonths}/12 months of continuous PF contribution`,
      points: r1(p2),
      polarity: s.pfContributionMonths >= 10 ? 'pos' : s.pfContributionMonths <= 6 ? 'neg' : 'neutral',
    },
    {
      text: `Wage bill ${s.wageGrowthYoY >= 0 ? 'up' : 'down'} ${Math.abs(s.wageGrowthYoY)}% YoY`,
      points: r1(p3),
      polarity: s.wageGrowthYoY >= 5 ? 'pos' : s.wageGrowthYoY < 0 ? 'neg' : 'neutral',
    },
  ]
  return { score: clamp(trendPts + p2 + p3), reasons }
}

function scoreDigital(s: Signals): { score: number; reasons: ReasonChip[] } {
  const p1 = Math.min(s.upiTxnPerMonth / 2, 35)
  const p2 = Math.min(s.uniqueCounterparties / 1.5, 35)
  const p3 = s.digitalRevenueSharePct * 30
  const reasons: ReasonChip[] = [
    {
      text: `${s.upiTxnPerMonth} UPI transactions / month`,
      points: r1(p1),
      polarity: s.upiTxnPerMonth >= 50 ? 'pos' : s.upiTxnPerMonth <= 20 ? 'neg' : 'neutral',
    },
    {
      text: `${s.uniqueCounterparties} unique buyers & suppliers`,
      points: r1(p2),
      polarity: s.uniqueCounterparties >= 40 ? 'pos' : s.uniqueCounterparties <= 15 ? 'neg' : 'neutral',
    },
    {
      text: `${(s.digitalRevenueSharePct * 100).toFixed(0)}% of revenue is digital`,
      points: r1(p3),
      polarity: s.digitalRevenueSharePct >= 0.5 ? 'pos' : s.digitalRevenueSharePct <= 0.25 ? 'neg' : 'neutral',
    },
  ]
  return { score: clamp(p1 + p2 + p3), reasons }
}

const PILLAR_FN: Record<DimensionKey, (s: Signals) => { score: number; reasons: ReasonChip[] }> = {
  cashflow: scoreCashflow,
  momentum: scoreMomentum,
  repayment: scoreRepayment,
  compliance: scoreCompliance,
  workforce: scoreWorkforce,
  digital: scoreDigital,
}

export function gradeFor(score: number): { grade: Grade; verdict: string; action: string } {
  if (score >= 85) return { grade: 'A+', verdict: 'Prime — credit-ready', action: 'Straight-through pre-approval' }
  if (score >= 75) return { grade: 'A', verdict: 'Strong', action: 'Fast-track at standard pricing' }
  if (score >= 65) return { grade: 'B+', verdict: 'Healthy', action: 'Approve with standard checks' }
  if (score >= 55) return { grade: 'B', verdict: 'Emerging', action: 'Approve with CGTMSE cover / lower limit' }
  if (score >= 45) return { grade: 'C', verdict: 'Thin file — monitor', action: 'Small ticket to build history' }
  return { grade: 'D', verdict: 'Needs improvement', action: 'Nurture via improvement path, re-assess in 90 days' }
}

const GRADE_DAMPEN: Record<Grade, number> = {
  'A+': 1.0,
  A: 0.9,
  'B+': 0.75,
  B: 0.6,
  C: 0.4,
  D: 0,
}

export function eligibleLimit(monthlySurplus: number, annualTurnover: number, grade: Grade): number {
  const raw = Math.min(4 * monthlySurplus, 0.2 * annualTurnover)
  const damped = raw * GRADE_DAMPEN[grade]
  // round to nearest ₹10,000 for a clean offer figure
  return Math.round(damped / 10000) * 10000
}

export function dataConfidence(s: Signals): number {
  // More consented, fresher sources -> higher confidence in the score.
  const coverage =
    (s.onTimeGstFilingStreak / 12) * 25 +
    (s.pfContributionMonths / 12) * 15 +
    (s.monthsPositiveClosingBalance / 12) * 20 +
    (s.udyamRegistered ? 10 : 0) +
    (s.itrFiledLast2Yrs ? 10 : 0) +
    Math.min(s.uniqueCounterparties / 2, 20)
  return Math.round(clamp(coverage))
}

export function computeScore(signals: Signals): ScoreResult {
  const dimensions: DimensionScore[] = DIMENSIONS.map((meta) => {
    const { score, reasons } = PILLAR_FN[meta.key](signals)
    return {
      key: meta.key,
      label: meta.label,
      short: meta.short,
      source: meta.source,
      weight: meta.weight,
      score: Math.round(score),
      contribution: score * meta.weight,
      reasons,
    }
  })

  const overall = Math.round(dimensions.reduce((sum, d) => sum + d.score * d.weight, 0))
  const { grade, verdict, action } = gradeFor(overall)
  const monthlySurplus = Math.max(0, signals.avgMonthlyInflow - signals.avgMonthlyOutflow)
  const limit = eligibleLimit(monthlySurplus, signals.annualGstTurnover, grade)

  return {
    overall,
    grade,
    verdict,
    action,
    eligibleLimit: limit,
    monthlySurplus,
    confidence: dataConfidence(signals),
    dimensions,
  }
}
