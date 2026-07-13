import { motion } from 'framer-motion'
import type { DimensionScore } from '../lib/types'
import { DIM_COLORVAR } from '../lib/scoringEngine'
import { varc } from './common'

/** Weighted contribution of each pillar toward the 0–100 Pulse Score. */
export default function ScoreWaterfall({ dimensions }: { dimensions: DimensionScore[] }) {
  const maxContribution = Math.max(...dimensions.map((d) => d.weight * 100))

  return (
    <div className="space-y-3">
      {dimensions.map((d, i) => {
        const color = DIM_COLORVAR[d.key]
        const fill = (d.contribution / maxContribution) * 100
        return (
          <div key={d.key} className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: varc(color) }} />
                  {d.label}
                </span>
                <span className="text-xs text-faint">weight {Math.round(d.weight * 100)}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: varc(color) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${fill}%` }}
                  transition={{ duration: 0.9, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
            <div className="text-right">
              <div className="font-num text-sm font-bold" style={{ color: varc(color) }}>
                +{d.contribution.toFixed(1)}
              </div>
              <div className="font-num text-[11px] text-faint">{d.score}/100</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
