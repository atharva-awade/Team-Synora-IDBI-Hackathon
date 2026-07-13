import { useState } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts'
import {
  LayoutDashboard,
  AlertTriangle,
  Wallet,
  TrendingDown,
  Activity,
  ShieldCheck,
} from 'lucide-react'
import { PORTFOLIO, portfolioStats, scoreDistribution } from '../data/portfolio'
import { useApp, useTokenColors } from '../state/app'
import { SectionTitle, Panel, varc, cx } from '../components/common'
import { GRADE_COLORVAR } from '../components/common'
import KpiStat from '../components/KpiStat'
import Sparkline from '../components/Sparkline'
import GradeBadge from '../components/GradeBadge'
import { inrCompact } from '../lib/format'

type Filter = 'all' | 'stress' | 'watch' | 'healthy'

export default function Portfolio() {
  const { go } = useApp()
  const stats = portfolioStats()
  const dist = scoreDistribution()
  const [filter, setFilter] = useState<Filter>('all')
  const [axis, grid] = useTokenColors(['--color-faint', '--color-line'])
  const distColors = useTokenColors(dist.map((d) => d.color))

  const rows = PORTFOLIO.filter((p) => filter === 'all' || p.status === filter).sort(
    (a, b) => (a.status === 'stress' ? -1 : 1) - (b.status === 'stress' ? -1 : 1) || b.exposure - a.exposure,
  )
  const alerts = PORTFOLIO.filter((p) => p.status === 'stress')

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Bank · Relationship Manager"
        icon={LayoutDashboard}
        title="Portfolio cockpit"
        sub="Monitor the whole book at a glance — score distribution, exposure at risk, and score-drift early-warnings that flag stress 60–90 days before a conventional default signal."
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiStat label="Accounts" value={stats.total} icon={Activity} colorVar="--color-dim-2" sub={`Avg score ${stats.avg}`} />
        <KpiStat label="Total exposure" value={inrCompact(stats.exposure)} icon={Wallet} colorVar="--color-brand" sub="Outstanding" />
        <KpiStat label="Exposure at risk" value={inrCompact(stats.atRisk)} icon={TrendingDown} colorVar="--color-danger" sub={`${stats.stress} stressed accounts`} />
        <KpiStat label="Early-warnings" value={stats.stress} icon={AlertTriangle} colorVar="--color-warn" sub={`${stats.watch} on watch`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        {/* Distribution */}
        <Panel>
          <div className="mb-3 text-sm font-bold">Score distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dist} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
              <XAxis dataKey="band" tick={{ fill: axis, fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: grid, opacity: 0.3 }} formatter={(value) => [`${Number(value)} accounts`, 'Count']} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {dist.map((_, i) => (
                  <Cell key={i} fill={distColors[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        {/* Early warnings */}
        <Panel>
          <div className="mb-3 flex items-center gap-2 text-sm font-bold">
            <AlertTriangle size={16} className="text-warn" /> Early-warning alerts
          </div>
          <div className="space-y-2.5">
            {alerts.map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-xl bg-danger-soft/60 px-4 py-3">
                <TrendingDown size={16} className="mt-0.5 shrink-0 text-danger" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{a.name}</span>
                    <span className="font-num text-xs text-muted">
                      {a.prevScore} → <b className="text-danger">{a.score}</b>
                    </span>
                  </div>
                  <p className="text-xs text-muted">{a.warning}</p>
                </div>
                <div className="text-right">
                  <div className="font-num text-xs font-semibold">{inrCompact(a.exposure)}</div>
                  <div className="text-[10px] text-faint">exposure</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <span className="text-sm font-bold">Book ({rows.length})</span>
          <div className="flex gap-1">
            {(['all', 'stress', 'watch', 'healthy'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cx(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors',
                  filter === f ? 'bg-brand text-white' : 'bg-surface-2 text-muted hover:text-text',
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-faint">
                <th className="px-5 py-3 font-semibold">Business</th>
                <th className="px-3 py-3 font-semibold">Score</th>
                <th className="px-3 py-3 font-semibold">Grade</th>
                <th className="px-3 py-3 font-semibold">6-mo trend</th>
                <th className="px-3 py-3 font-semibold">Exposure</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-t border-line transition-colors hover:bg-surface-2">
                  <td className="px-5 py-3">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-faint">{p.sector} · {p.city}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="font-num font-bold" style={{ color: varc(GRADE_COLORVAR[p.grade]) }}>
                      {p.score}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <GradeBadge grade={p.grade} size="sm" />
                  </td>
                  <td className="px-3 py-3">
                    <Sparkline data={p.trend} />
                  </td>
                  <td className="px-3 py-3 font-num">{inrCompact(p.exposure)}</td>
                  <td className="px-5 py-3">
                    <StatusPill status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-line px-5 py-4">
          <span className="flex items-center gap-2 text-xs text-muted">
            <ShieldCheck size={14} className="text-brand" /> Every score is explainable and consent-backed.
          </span>
          <button className="btn btn-primary" onClick={() => go('applicant')}>
            Open applicant 360°
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: 'healthy' | 'watch' | 'stress' }) {
  const map = {
    healthy: { c: '--color-good', label: 'Healthy' },
    watch: { c: '--color-warn', label: 'Watch' },
    stress: { c: '--color-danger', label: 'Stress' },
  }[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: `color-mix(in srgb, ${varc(map.c)} 15%, transparent)`, color: varc(map.c) }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: varc(map.c) }} />
      {map.label}
    </span>
  )
}
