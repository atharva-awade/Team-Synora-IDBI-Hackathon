import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ListTree,
  TrendingUp,
  BadgeIndianRupee,
  Wallet,
  ShieldCheck,
  Download,
  MapPin,
  CalendarClock,
} from 'lucide-react'
import { useApp } from '../state/app'
import PulseGauge from '../components/PulseGauge'
import DimensionRadar from '../components/DimensionRadar'
import ScoreWaterfall from '../components/ScoreWaterfall'
import CashFlowChart from '../components/CashFlowChart'
import TatTimeline from '../components/TatTimeline'
import KpiStat from '../components/KpiStat'
import { Panel, SectionTitle, varc } from '../components/common'
import { GRADE_COLORVAR } from '../components/common'
import { inrCompact, monthsToYears } from '../lib/format'
import { logAssessment } from '../lib/repository'

export default function HealthCard() {
  const { persona, score, go } = useApp()
  const gradeColor = GRADE_COLORVAR[score.grade]

  // Persist a consent-backed assessment record when a card is generated.
  useEffect(() => {
    void logAssessment(persona, score)
  }, [persona, score])

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Step 3 · The Financial Health Card"
        icon={ShieldCheck}
        title={persona.name}
        sub={persona.headline}
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* The card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden"
        >
          <div
            className="flex items-center justify-between px-6 py-4 text-white"
            style={{ background: `linear-gradient(120deg, ${varc(gradeColor)}, ${varc('--color-dim-6')})` }}
          >
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest opacity-90">
                Financial Health Card
              </div>
              <div className="text-lg font-bold">{persona.name}</div>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/20 text-sm font-bold backdrop-blur">
              {persona.initials}
            </span>
          </div>

          <div className="flex flex-col items-center px-6 pb-2 pt-6">
            <PulseGauge score={score.overall} grade={score.grade} verdict={score.verdict} size={250} animKey={persona.id} />
          </div>

          <div className="space-y-3 px-6 pb-6 pt-2">
            <div
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: varc('--color-brand-tint') }}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <BadgeIndianRupee size={16} className="text-brand" /> Eligible working capital
              </span>
              <span className="font-num text-xl font-bold text-brand-strong">
                {inrCompact(score.eligibleLimit)}
              </span>
            </div>
            <p className="rounded-lg bg-surface-2 px-4 py-2.5 text-sm">
              <span className="font-semibold">Recommended action: </span>
              {score.action}
            </p>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-surface-2 py-2">
                <MapPin size={14} className="mx-auto text-faint" />
                <div className="mt-1 font-medium">{persona.city}</div>
              </div>
              <div className="rounded-lg bg-surface-2 py-2">
                <CalendarClock size={14} className="mx-auto text-faint" />
                <div className="mt-1 font-medium">{monthsToYears(persona.vintageMonths)} old</div>
              </div>
              <div className="rounded-lg bg-surface-2 py-2">
                <ShieldCheck size={14} className="mx-auto text-faint" />
                <div className="mt-1 font-medium">{score.confidence}% conf.</div>
              </div>
            </div>

            <button className="btn btn-ghost w-full" onClick={() => window.print()}>
              <Download size={15} /> Download / share card
            </button>
          </div>
        </motion.div>

        {/* Radar + breakdown */}
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Panel>
              <div className="mb-1 text-sm font-bold">Six-pillar health profile</div>
              <p className="mb-2 text-xs text-muted">Each axis scored 0–100 from its source data.</p>
              <DimensionRadar dimensions={score.dimensions} height={260} />
            </Panel>
            <Panel>
              <div className="mb-3 text-sm font-bold">Weighted contribution</div>
              <ScoreWaterfall dimensions={score.dimensions} />
            </Panel>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KpiStat label="Monthly surplus" value={inrCompact(score.monthlySurplus)} icon={Wallet} colorVar="--color-dim-1" sub="From real cash-flow" />
            <KpiStat label="GST growth" value={(persona.signals.gstTurnoverGrowthYoY >= 0 ? '+' : '') + persona.signals.gstTurnoverGrowthYoY + '%'} icon={TrendingUp} colorVar="--color-dim-2" sub="Year on year" />
            <KpiStat label="On-time obligations" value={(persona.signals.onTimeObligationRatio * 100).toFixed(0) + '%'} icon={ShieldCheck} colorVar="--color-dim-3" sub="12-month record" />
            <KpiStat label="Data confidence" value={score.confidence + '%'} icon={ShieldCheck} colorVar="--color-brand" sub="Source coverage" />
          </div>

          <Panel>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-bold">Cash-flow (last 12 months)</div>
              <span className="chip">Cash-flow-based underwriting</span>
            </div>
            <CashFlowChart data={persona.cashflow} height={240} />
          </Panel>

          <Panel>
            <TatTimeline />
          </Panel>

          <div className="flex flex-wrap gap-3">
            <button className="btn btn-primary" onClick={() => go('explain')}>
              <ListTree size={16} /> Why this score?
            </button>
            <button className="btn btn-ghost" onClick={() => go('whatif')}>
              <TrendingUp size={16} /> Path to a better grade
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
