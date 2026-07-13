import { ArrowRight, Gauge, Database } from 'lucide-react'
import { useApp } from '../state/app'
import { CONSENT_SOURCES } from '../data/consent'
import SourceTile from '../components/SourceTile'
import { SectionTitle, Meter, Panel } from '../components/common'

export default function Aggregate() {
  const { persona, score, go } = useApp()
  const s = persona.signals

  const features: { source: string; items: { k: string; v: string }[] }[] = [
    {
      source: 'Account Aggregator',
      items: [
        { k: 'Avg monthly inflow', v: '₹' + (s.avgMonthlyInflow / 100000).toFixed(1) + 'L' },
        { k: 'Positive-balance months', v: `${s.monthsPositiveClosingBalance}/12` },
        { k: 'Inflow variation', v: (s.inflowVolatilityCV * 100).toFixed(0) + '%' },
      ],
    },
    {
      source: 'GSTN',
      items: [
        { k: 'Turnover growth (YoY)', v: (s.gstTurnoverGrowthYoY >= 0 ? '+' : '') + s.gstTurnoverGrowthYoY + '%' },
        { k: 'On-time filing streak', v: `${s.onTimeGstFilingStreak}/12` },
        { k: 'Returns on time', v: (s.gstReturnsOnTimePct * 100).toFixed(0) + '%' },
      ],
    },
    {
      source: 'UPI',
      items: [
        { k: 'Transactions / month', v: String(s.upiTxnPerMonth) },
        { k: 'Unique counterparties', v: String(s.uniqueCounterparties) },
        { k: 'Digital revenue share', v: (s.digitalRevenueSharePct * 100).toFixed(0) + '%' },
      ],
    },
    {
      source: 'EPFO',
      items: [
        { k: 'PF contribution months', v: `${s.pfContributionMonths}/12` },
        { k: 'Headcount trend', v: s.employeeTrend },
        { k: 'Wage growth (YoY)', v: (s.wageGrowthYoY >= 0 ? '+' : '') + s.wageGrowthYoY + '%' },
      ],
    },
    {
      source: 'ITR / TDS',
      items: [
        { k: 'ITR filed (2 yrs)', v: s.itrFiledLast2Yrs ? 'Yes' : 'No' },
        { k: 'TDS compliant', v: s.tdsCompliant ? 'Yes' : 'No' },
      ],
    },
    {
      source: 'Udyam',
      items: [
        { k: 'Registered', v: s.udyamRegistered ? 'Yes' : 'No' },
        { k: 'Constitution', v: persona.constitution },
      ],
    },
  ]

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Step 2 · Unified data fabric"
        icon={Database}
        title="Six sources, one normalized view"
        sub="Raw records from each rail are normalized into comparable features. Data coverage and freshness feed a confidence score that travels with the decision."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CONSENT_SOURCES.map((src) => (
            <SourceTile key={src.id} source={src} connected />
          ))}
        </div>

        <Panel className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Gauge size={16} className="text-brand" /> Data confidence
            </div>
            <div className="mt-3 font-num text-4xl font-bold text-brand">{score.confidence}%</div>
            <p className="mt-1 text-xs text-muted">
              Based on coverage, recency and number of consented sources. Higher confidence = harder to game.
            </p>
            <div className="mt-4">
              <Meter value={score.confidence} />
            </div>
          </div>
          <button className="btn btn-primary mt-6 w-full" onClick={() => go('health')}>
            Generate Financial Health Card <ArrowRight size={16} />
          </button>
        </Panel>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Panel key={f.source} className="card-lift">
            <div className="mb-3 text-sm font-bold text-brand">{f.source}</div>
            <div className="space-y-2">
              {f.items.map((it) => (
                <div key={it.k} className="flex items-center justify-between text-sm">
                  <span className="text-muted">{it.k}</span>
                  <span className="font-num font-semibold capitalize">{it.v}</span>
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  )
}
