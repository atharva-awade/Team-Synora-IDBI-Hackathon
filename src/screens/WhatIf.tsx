import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Sparkles, RotateCcw, ArrowRight } from 'lucide-react'
import { useApp } from '../state/app'
import { defaultWhatIf, estimateDays, runWhatIf, type WhatIfState } from '../lib/whatIfEngine'
import PulseGauge from '../components/PulseGauge'
import DimensionRadar from '../components/DimensionRadar'
import { SectionTitle, Panel, varc } from '../components/common'
import { inrCompact } from '../lib/format'

function Toggle({
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  label: string
  hint?: string
  checked: boolean
  disabled?: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl bg-surface-2 px-4 py-3 text-left disabled:opacity-40"
    >
      <span>
        <span className="text-sm font-medium">{label}</span>
        {hint && <span className="block text-xs text-faint">{hint}</span>}
      </span>
      <span
        className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
        style={{ background: checked ? varc('--color-brand') : varc('--color-line-strong') }}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all"
          style={{ left: checked ? 22 : 2 }}
        />
      </span>
    </button>
  )
}

function Slider({
  label,
  value,
  onChange,
  suffix = '%',
}: {
  label: string
  value: number
  onChange: (v: number) => void
  suffix?: string
}) {
  return (
    <div className="rounded-xl bg-surface-2 px-4 py-3">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-num font-semibold text-brand">{Math.round(value * 100)}{suffix}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-full accent-[var(--color-brand)]"
      />
    </div>
  )
}

export default function WhatIf() {
  const { persona, go } = useApp()
  const [w, setW] = useState<WhatIfState>(() => defaultWhatIf(persona.signals))

  // reset when persona changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setW(defaultWhatIf(persona.signals)), [persona.id])

  const result = useMemo(() => runWhatIf(persona.signals, w), [persona.signals, w])
  const days = estimateDays(w)
  const patch = (p: Partial<WhatIfState>) => setW((prev) => ({ ...prev, ...p }))

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Step 5 · The nurture engine"
        icon={TrendingUp}
        title="Turn a “no” into a path to “yes”"
        sub="Instead of a flat rejection, a thin-file business sees exactly what to change — and how much credit it unlocks. This reframes rejection as a pipeline."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Controls */}
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-bold">Actions this business can take</span>
            <button
              className="flex items-center gap-1 text-xs font-semibold text-muted hover:text-brand"
              onClick={() => setW(defaultWhatIf(persona.signals))}
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>
          <div className="space-y-3">
            <Toggle
              label="File the next 3 GST returns on time"
              hint="Lifts momentum & compliance"
              checked={w.fileGstOnTime}
              onChange={(v) => patch({ fileGstOnTime: v })}
            />
            <Toggle
              label="Clear the outstanding NACH bounce"
              hint={persona.signals.bounceCount12mo > 0 ? 'Improves repayment discipline' : 'No bounce on record'}
              checked={w.clearBounce}
              disabled={persona.signals.bounceCount12mo === 0}
              onChange={(v) => patch({ clearBounce: v })}
            />
            <Toggle
              label="Connect full bank history via Account Aggregator"
              hint="Raises data confidence & cash-flow signal"
              checked={w.addAaConsent}
              onChange={(v) => patch({ addAaConsent: v })}
            />
            <Slider
              label="Lower credit-line utilization to"
              value={w.lowerUtilization}
              onChange={(v) => patch({ lowerUtilization: v })}
            />
            <Slider
              label="Raise digital-revenue share to"
              value={w.raiseDigitalRevenue}
              onChange={(v) => patch({ raiseDigitalRevenue: v })}
            />
          </div>
        </Panel>

        {/* Projection */}
        <div className="space-y-6">
          <Panel>
            <div className="grid grid-cols-2 items-center gap-4">
              <div className="flex flex-col items-center">
                <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-faint">Today</span>
                <PulseGauge score={result.base.overall} grade={result.base.grade} size={190} animKey={'base' + persona.id} />
              </div>
              <div className="flex flex-col items-center">
                <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand">Projected</span>
                <PulseGauge
                  score={result.projected.overall}
                  grade={result.projected.grade}
                  size={190}
                  animKey={'proj' + result.projected.overall}
                />
              </div>
            </div>

            {result.active && result.delta !== 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex flex-wrap items-center justify-center gap-2 rounded-xl bg-brand-tint px-4 py-3 text-center text-sm"
              >
                <Sparkles size={16} className="text-brand" />
                <span>
                  <b className="text-brand-strong">+{result.delta} points</b> → Grade{' '}
                  <b>{result.projected.grade}</b>
                  {result.limitDelta > 0 && (
                    <>
                      {' '}unlocks{' '}
                      <b className="text-brand-strong">{inrCompact(result.limitDelta)}</b> more credit
                    </>
                  )}
                  {days > 0 && <> in about <b>{days} days</b></>}.
                </span>
              </motion.div>
            )}
          </Panel>

          <Panel>
            <div className="mb-1 text-sm font-bold">Projected vs current profile</div>
            <p className="mb-2 text-xs text-muted">Dashed = projected after the actions above.</p>
            <DimensionRadar
              dimensions={result.base.dimensions}
              compareDims={result.projected.dimensions}
              height={260}
            />
          </Panel>

          <div className="flex flex-wrap gap-3">
            <button className="btn btn-primary" onClick={() => go('trust')}>
              Next: verify integrity <ArrowRight size={16} />
            </button>
            <button className="btn btn-ghost" onClick={() => go('assistant')}>
              Ask the assistant
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
