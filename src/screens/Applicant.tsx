import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  UserSearch,
  CheckCircle2,
  ShieldAlert,
  BadgeIndianRupee,
  FileCheck2,
  Landmark,
} from 'lucide-react'
import { useApp } from '../state/app'
import { analyzeTrust } from '../lib/anomalyEngine'
import { DIM_COLORVAR } from '../lib/scoringEngine'
import PulseGauge from '../components/PulseGauge'
import CashFlowChart from '../components/CashFlowChart'
import GradeBadge from '../components/GradeBadge'
import { SectionTitle, Panel, Pill, varc } from '../components/common'
import { PERSONAS } from '../data/personas'
import { inr, inrCompact } from '../lib/format'
import { logDecision } from '../lib/repository'

export default function Applicant() {
  const { persona, score, setPersonaId } = useApp()
  const trust = useMemo(() => analyzeTrust(persona.signals), [persona.signals])

  const needsGuarantee = ['B', 'C', 'D'].includes(score.grade)
  const [amount, setAmount] = useState(score.eligibleLimit)
  const [tenor, setTenor] = useState(24)
  const [cgtmse, setCgtmse] = useState(needsGuarantee)
  const [decided, setDecided] = useState<'approved' | 'review' | null>(null)

  // reset on persona change
  useEffect(() => {
    setAmount(score.eligibleLimit)
    setCgtmse(needsGuarantee)
    setDecided(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persona.id])

  const rate = 10.5 + (score.grade === 'A+' ? -0.5 : needsGuarantee ? 1.5 : 0) + (cgtmse ? -0.75 : 0)
  const emi = Math.round((amount * (rate / 1200) * Math.pow(1 + rate / 1200, tenor)) / (Math.pow(1 + rate / 1200, tenor) - 1))
  const flagged = trust.verdict === 'flagged'

  const decide = (action: 'approved' | 'review') => {
    setDecided(action)
    void logDecision({
      business_id: persona.id,
      business_name: persona.name,
      action,
      amount,
      tenor_months: tenor,
      rate: Number(rate.toFixed(2)),
      cgtmse,
    })
  }

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Bank · Underwriting"
        icon={UserSearch}
        title="Applicant 360°"
        sub="A single-borrower view that fuses the Pulse Score, cash-flow, and cross-source integrity into one decision — with a ready-to-emit OCEN offer."
      />

      {/* applicant switcher */}
      <div className="flex flex-wrap gap-2">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPersonaId(p.id)}
            className={`chip ${p.id === persona.id ? 'border-brand text-brand-strong' : ''}`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Profile + score */}
        <div className="space-y-6">
          <Panel>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand text-white font-bold">
                  {persona.initials}
                </span>
                <div>
                  <div className="text-lg font-bold">{persona.name}</div>
                  <div className="text-xs text-faint">
                    {persona.constitution} · {persona.sector} · {persona.city}
                  </div>
                </div>
              </div>
              <GradeBadge grade={score.grade} size="lg" />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {persona.tags.map((t) => (
                <Pill key={t} tone="brand">{t}</Pill>
              ))}
              {flagged ? <Pill tone="danger">Sources inconsistent</Pill> : <Pill tone="good">Sources verified</Pill>}
            </div>

            <div className="mt-4 flex flex-col items-center sm:flex-row sm:gap-6">
              <PulseGauge score={score.overall} grade={score.grade} size={190} animKey={persona.id} />
              <div className="w-full flex-1 space-y-2">
                {score.dimensions.map((d) => (
                  <div key={d.key} className="flex items-center gap-2 text-sm">
                    <span className="w-28 shrink-0 text-muted">{d.short}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${d.score}%`, background: varc(DIM_COLORVAR[d.key]) }}
                      />
                    </div>
                    <span className="font-num w-8 text-right text-xs font-semibold">{d.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel>
            <div className="mb-2 text-sm font-bold">Cash-flow serviceability</div>
            <CashFlowChart data={persona.cashflow} height={210} />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-lg bg-surface-2 py-2">
                <div className="font-num font-bold text-brand">{inrCompact(score.monthlySurplus)}</div>
                <div className="text-[11px] text-faint">Monthly surplus</div>
              </div>
              <div className="rounded-lg bg-surface-2 py-2">
                <div className="font-num font-bold">{trust.consistencyScore}/100</div>
                <div className="text-[11px] text-faint">Source integrity</div>
              </div>
              <div className="rounded-lg bg-surface-2 py-2">
                <div className="font-num font-bold">{score.confidence}%</div>
                <div className="text-[11px] text-faint">Data confidence</div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Decision + offer */}
        <div className="space-y-6">
          <Panel>
            <div className="mb-3 flex items-center gap-2 text-sm font-bold">
              <BadgeIndianRupee size={16} className="text-brand" /> OCEN offer generator
            </div>

            <div className="rounded-xl bg-brand-tint px-4 py-3">
              <div className="text-xs text-muted">Recommended action</div>
              <div className="font-semibold text-brand-strong">{score.action}</div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">Sanction amount</span>
                  <span className="font-num font-bold text-brand">{inr(amount)}</span>
                </div>
                <input
                  type="range"
                  min={50000}
                  max={Math.max(score.eligibleLimit, 100000)}
                  step={10000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full accent-[var(--color-brand)]"
                />
                <div className="mt-1 text-xs text-faint">
                  Cash-flow-eligible up to {inrCompact(score.eligibleLimit)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">
                  <span className="mb-1 block font-medium">Tenor</span>
                  <select
                    value={tenor}
                    onChange={(e) => setTenor(Number(e.target.value))}
                    className="w-full rounded-xl border border-line bg-surface-2 px-3 py-2 outline-none focus:border-brand"
                  >
                    {[12, 18, 24, 36, 48].map((t) => (
                      <option key={t} value={t}>{t} months</option>
                    ))}
                  </select>
                </label>
                <div className="text-sm">
                  <span className="mb-1 block font-medium">Indicative rate</span>
                  <div className="rounded-xl border border-line bg-surface-2 px-3 py-2 font-num font-semibold">
                    {rate.toFixed(2)}% p.a.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCgtmse(!cgtmse)}
                className="flex w-full items-center justify-between gap-3 rounded-xl bg-surface-2 px-4 py-3 text-left"
              >
                <span>
                  <span className="text-sm font-medium">CGTMSE credit-guarantee cover</span>
                  <span className="block text-xs text-faint">
                    De-risks thin-file tickets · {needsGuarantee ? 'recommended' : 'optional'}
                  </span>
                </span>
                <span
                  className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
                  style={{ background: cgtmse ? varc('--color-brand') : varc('--color-line-strong') }}
                >
                  <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all" style={{ left: cgtmse ? 22 : 2 }} />
                </span>
              </button>

              <div className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
                <span className="text-sm text-muted">Estimated EMI</span>
                <span className="font-num text-lg font-bold">{inr(emi)}/mo</span>
              </div>
            </div>
          </Panel>

          {/* Decision */}
          {flagged ? (
            <div className="flex items-start gap-3 rounded-2xl border border-danger/40 bg-danger-soft px-5 py-4">
              <ShieldAlert className="mt-0.5 shrink-0 text-danger" size={20} />
              <div>
                <div className="font-bold text-danger">Route to manual review</div>
                <p className="text-sm text-muted">
                  Trust Triangle flagged source inconsistencies. Disbursal is blocked pending verification.
                </p>
              </div>
            </div>
          ) : null}

          {decided === 'approved' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 rounded-2xl bg-brand-tint px-5 py-4"
            >
              <CheckCircle2 className="shrink-0 text-brand" size={22} />
              <div>
                <div className="font-bold text-brand-strong">Offer pushed to Loan Origination System</div>
                <p className="text-sm text-muted">
                  {inr(amount)} · {tenor} months · {rate.toFixed(2)}% {cgtmse ? '· CGTMSE-backed' : ''} — KFS generated for {persona.name}.
                </p>
              </div>
            </motion.div>
          ) : decided === 'review' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 rounded-2xl bg-surface-2 px-5 py-4"
            >
              <FileCheck2 className="shrink-0 text-warn" size={22} />
              <div className="text-sm">Sent to review queue with the integrity report attached.</div>
            </motion.div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <button
                className="btn btn-primary"
                disabled={flagged}
                onClick={() => decide('approved')}
              >
                <Landmark size={16} /> Approve &amp; push to LOS
              </button>
              <button className="btn btn-ghost" onClick={() => decide('review')}>
                Send to review
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
