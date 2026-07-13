// What-If simulator — deterministic re-scoring under borrower-controllable
// actions. This turns a rejection into a concrete "path to a better grade",
// which reframes high rejection rates as a nurture funnel.

import { computeScore } from './scoringEngine'
import type { ScoreResult, Signals } from './types'

export interface WhatIfState {
  fileGstOnTime: boolean // file the next 3 GST returns on time
  clearBounce: boolean // clear the outstanding NACH bounce
  lowerUtilization: number // target credit utilization 0..1
  raiseDigitalRevenue: number // target digital-revenue share 0..1
  addAaConsent: boolean // connect full bank history via AA
}

export function defaultWhatIf(signals: Signals): WhatIfState {
  return {
    fileGstOnTime: false,
    clearBounce: false,
    lowerUtilization: signals.creditUtilization,
    raiseDigitalRevenue: signals.digitalRevenueSharePct,
    addAaConsent: false,
  }
}

/** Apply the what-if actions to produce a projected signal set. */
export function applyWhatIf(base: Signals, w: WhatIfState): Signals {
  const next: Signals = { ...base }

  if (w.fileGstOnTime) {
    next.onTimeGstFilingStreak = Math.min(12, base.onTimeGstFilingStreak + 3)
    next.gstReturnsOnTimePct = Math.min(1, base.gstReturnsOnTimePct + 0.15)
  }
  if (w.clearBounce && base.bounceCount12mo > 0) {
    next.bounceCount12mo = Math.max(0, base.bounceCount12mo - 1)
    next.onTimeObligationRatio = Math.min(1, base.onTimeObligationRatio + 0.06)
  }
  next.creditUtilization = w.lowerUtilization
  next.digitalRevenueSharePct = w.raiseDigitalRevenue
  if (w.raiseDigitalRevenue > base.digitalRevenueSharePct) {
    // more digital revenue tends to bring more counterparties + UPI activity
    const lift = (w.raiseDigitalRevenue - base.digitalRevenueSharePct) * 40
    next.upiTxnPerMonth = Math.round(base.upiTxnPerMonth + lift)
    next.uniqueCounterparties = Math.round(base.uniqueCounterparties + lift * 0.5)
  }
  if (w.addAaConsent) {
    next.monthsPositiveClosingBalance = Math.min(12, base.monthsPositiveClosingBalance + 1)
    next.inflowVolatilityCV = Math.max(0, base.inflowVolatilityCV - 0.03)
  }

  return next
}

export interface WhatIfResult {
  base: ScoreResult
  projected: ScoreResult
  delta: number
  limitDelta: number
  active: boolean
}

export function runWhatIf(base: Signals, w: WhatIfState): WhatIfResult {
  const baseResult = computeScore(base)
  const projectedSignals = applyWhatIf(base, w)
  const projected = computeScore(projectedSignals)
  const active =
    w.fileGstOnTime ||
    w.clearBounce ||
    w.addAaConsent ||
    Math.abs(w.lowerUtilization - base.creditUtilization) > 0.001 ||
    Math.abs(w.raiseDigitalRevenue - base.digitalRevenueSharePct) > 0.001
  return {
    base: baseResult,
    projected,
    delta: projected.overall - baseResult.overall,
    limitDelta: projected.eligibleLimit - baseResult.eligibleLimit,
    active,
  }
}

/** Estimate time-to-target from the actions selected (for "reach A in ~90 days"). */
export function estimateDays(w: WhatIfState): number {
  let days = 0
  if (w.fileGstOnTime) days = Math.max(days, 90) // three monthly cycles
  if (w.clearBounce) days = Math.max(days, 30)
  if (w.addAaConsent) days = Math.max(days, 2)
  if (w.lowerUtilization >= 0 || w.raiseDigitalRevenue >= 0) days = Math.max(days, 60)
  return days
}
