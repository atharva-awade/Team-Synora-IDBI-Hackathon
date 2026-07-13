// Data access layer. Every write is best-effort and non-blocking: if the
// datastore is unreachable, the UI is unaffected. This keeps the experience
// resilient while still persisting a real audit trail when configured.

import { supabase, isSupabaseEnabled } from './supabase'
import type { MsmeProfile, ScoreResult } from './types'

export interface AssessmentRecord {
  business_id: string
  business_name: string
  sector: string
  city: string
  score: number
  grade: string
  eligible_limit: number
  confidence: number
}

export interface DecisionRecord {
  business_id: string
  business_name: string
  action: 'approved' | 'review'
  amount: number
  tenor_months: number
  rate: number
  cgtmse: boolean
}

/** Persist an assessment event (consent-backed audit trail). */
export async function logAssessment(profile: MsmeProfile, score: ScoreResult): Promise<void> {
  if (!isSupabaseEnabled || !supabase) return
  const row: AssessmentRecord = {
    business_id: profile.id,
    business_name: profile.name,
    sector: profile.sector,
    city: profile.city,
    score: score.overall,
    grade: score.grade,
    eligible_limit: score.eligibleLimit,
    confidence: score.confidence,
  }
  try {
    await supabase.from('assessments').insert(row)
  } catch {
    /* non-blocking */
  }
}

/** Persist an underwriting decision emitted from the RM console. */
export async function logDecision(record: DecisionRecord): Promise<void> {
  if (!isSupabaseEnabled || !supabase) return
  try {
    await supabase.from('decisions').insert(record)
  } catch {
    /* non-blocking */
  }
}

/** Count of assessments run so far — used for a live "assessments" stat. */
export async function assessmentCount(): Promise<number | null> {
  if (!isSupabaseEnabled || !supabase) return null
  try {
    const { count } = await supabase
      .from('assessments')
      .select('*', { count: 'exact', head: true })
    return count ?? null
  } catch {
    return null
  }
}
