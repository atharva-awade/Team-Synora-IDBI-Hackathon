// Trust Triangle — cross-source consistency & fraud checks.
//
// Reconciles three independent views of the same business: GST-declared
// turnover, bank credits seen via Account Aggregator, and UPI inflow. A genuine
// business shows these three roughly agreeing; inflated or round-tripped
// revenue breaks the triangle. This gives fraud detection WITHOUT a black box.

import type { Signals } from './types'

export type Severity = 'high' | 'medium' | 'low' | 'clear'

export interface AnomalyFlag {
  id: string
  title: string
  detail: string
  severity: Severity
}

export interface TrustTriangle {
  gst: number // annual, ₹
  bank: number // annual, ₹
  upi: number // annual, ₹
  // pairwise agreement 0..1 (1 = perfectly aligned)
  gstVsBank: number
  bankVsUpi: number
  consistencyScore: number // 0..100
  flags: AnomalyFlag[]
  verdict: 'consistent' | 'review' | 'flagged'
}

function agreement(a: number, b: number): number {
  if (a <= 0 || b <= 0) return 0
  const ratio = Math.min(a, b) / Math.max(a, b)
  return ratio
}

export function analyzeTrust(s: Signals): TrustTriangle {
  const gst = s.annualGstTurnover
  const bank = s.bankCreditsAnnual
  const upi = s.upiInflowAnnual

  const gstVsBank = agreement(gst, bank)
  const bankVsUpi = agreement(bank, upi)

  const flags: AnomalyFlag[] = []

  // 1. Revenue inflation: GST turnover materially exceeds money actually banked.
  if (gstVsBank < 0.7) {
    const gap = Math.round((1 - gstVsBank) * 100)
    flags.push({
      id: 'inflation',
      title: 'Declared turnover exceeds banked receipts',
      detail: `GST-declared turnover is ${gap}% higher than credits seen in bank statements — possible revenue inflation.`,
      severity: gstVsBank < 0.55 ? 'high' : 'medium',
    })
  }

  // 2. Circular / round-tripping transactions.
  if (s.circularTxnSharePct >= 0.15) {
    flags.push({
      id: 'circular',
      title: 'Circular transaction pattern',
      detail: `${Math.round(s.circularTxnSharePct * 100)}% of inflow loops back to the same counterparties — indicative of round-tripping.`,
      severity: s.circularTxnSharePct >= 0.3 ? 'high' : 'medium',
    })
  }

  // 3. Buyer concentration risk.
  if (s.topCounterpartyConcentration >= 0.5) {
    flags.push({
      id: 'concentration',
      title: 'High single-buyer concentration',
      detail: `${Math.round(s.topCounterpartyConcentration * 100)}% of revenue comes from one counterparty — concentration risk.`,
      severity: s.topCounterpartyConcentration >= 0.7 ? 'medium' : 'low',
    })
  }

  // Consistency score blends the two agreements, penalised by circularity.
  const consistencyScore = Math.round(
    Math.max(
      0,
      (gstVsBank * 55 + bankVsUpi * 45) * (1 - s.circularTxnSharePct * 0.8),
    ),
  )

  let verdict: TrustTriangle['verdict'] = 'consistent'
  if (flags.some((f) => f.severity === 'high')) verdict = 'flagged'
  else if (flags.length > 0) verdict = 'review'

  if (flags.length === 0) {
    flags.push({
      id: 'clear',
      title: 'All three sources reconcile',
      detail: 'GST, bank credits and UPI inflow agree within tolerance. No inconsistencies detected.',
      severity: 'clear',
    })
  }

  return { gst, bank, upi, gstVsBank, bankVsUpi, consistencyScore, flags, verdict }
}
