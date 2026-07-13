import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ListTree, Minus, Plus, TrendingUp } from 'lucide-react'
import { useApp } from '../state/app'
import { DIM_COLORVAR } from '../lib/scoringEngine'
import { SectionTitle, varc, cx } from '../components/common'

export default function Explain() {
  const { score, go } = useApp()
  const [open, setOpen] = useState<string | null>(score.dimensions[0].key)

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Step 4 · Explainable AI"
        icon={ListTree}
        title="Every point, traced to a source"
        sub="No black box. Each pillar decomposes into plain-language reasons tied to a real data event — auditable for a regulator, understandable for the borrower."
      />

      <div className="grid gap-3">
        {score.dimensions.map((d) => {
          const color = DIM_COLORVAR[d.key]
          const isOpen = open === d.key
          return (
            <div key={d.key} className="card overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : d.key)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left"
              >
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl font-num text-sm font-bold text-white"
                  style={{ background: varc(color) }}
                >
                  {d.score}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{d.label}</span>
                    <span className="chip hidden sm:inline-flex">{d.source}</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${d.score}%`, background: varc(color) }}
                    />
                  </div>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <div className="font-num text-sm font-bold" style={{ color: varc(color) }}>
                    +{d.contribution.toFixed(1)}
                  </div>
                  <div className="text-[11px] text-faint">weight {Math.round(d.weight * 100)}%</div>
                </div>
                <ChevronDown
                  size={18}
                  className={cx('shrink-0 text-faint transition-transform', isOpen && 'rotate-180')}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-2 border-t border-line px-5 py-4 sm:grid-cols-2 lg:grid-cols-3">
                      {d.reasons.map((r, i) => {
                        const rc =
                          r.polarity === 'pos' ? '--color-good' : r.polarity === 'neg' ? '--color-danger' : '--color-faint'
                        return (
                          <div
                            key={i}
                            className="flex items-start gap-2.5 rounded-xl bg-surface-2 px-3 py-2.5"
                          >
                            <span
                              className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-white"
                              style={{ background: varc(rc) }}
                            >
                              {r.polarity === 'neg' ? <Minus size={13} /> : <Plus size={13} />}
                            </span>
                            <div>
                              <div className="text-sm">{r.text}</div>
                              <div className="font-num text-xs font-semibold" style={{ color: varc(rc) }}>
                                {r.polarity === 'neg' ? '' : '+'}
                                {r.points} pts
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-brand-tint px-6 py-5">
        <div>
          <div className="text-sm text-muted">Total Pulse Score</div>
          <div className="font-num text-3xl font-bold text-brand-strong">
            {score.overall}
            <span className="text-lg text-muted"> / 100 · Grade {score.grade}</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => go('whatif')}>
          <TrendingUp size={16} /> Improve this score
        </button>
      </div>
    </div>
  )
}
