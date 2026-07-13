import { useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'
import type { Grade } from '../lib/types'
import { GRADE_COLORVAR, varc } from './common'

interface Props {
  score: number
  grade: Grade
  verdict?: string
  size?: number
  /** re-runs the fill/count animation when this key changes */
  animKey?: string | number
}

export default function PulseGauge({ score, grade, verdict, size = 260, animKey }: Props) {
  const [display, setDisplay] = useState(0)
  const [progress, setProgress] = useState(0)
  const reduce = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (reduce.current) {
      setDisplay(score)
      setProgress(score)
      return
    }
    const c1 = animate(0, score, {
      duration: 1.3,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    const c2 = animate(0, score, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setProgress(v),
    })
    return () => {
      c1.stop()
      c2.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, animKey])

  const r = 82
  const C = 2 * Math.PI * r
  const arc = 0.75 * C // 270° gauge
  const colorVar = GRADE_COLORVAR[grade]
  const gid = `pulseGrad-${grade}`

  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size }}>
      <svg viewBox="0 0 200 200" width={size} height={size} className="overflow-visible">
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={varc(colorVar)} />
            <stop offset="100%" stopColor={varc('--color-dim-6')} />
          </linearGradient>
        </defs>
        {/* track */}
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke={varc('--color-surface-2')}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${arc} ${C - arc}`}
          transform="rotate(135 100 100)"
        />
        {/* value */}
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${(progress / 100) * arc} ${C}`}
          transform="rotate(135 100 100)"
          style={{ filter: `drop-shadow(0 0 8px ${varc(colorVar)}55)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-num text-[52px] font-bold leading-none tracking-tight" style={{ color: varc(colorVar) }}>
          {display}
        </div>
        <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
          Pulse Score
        </div>
        <div
          className="mt-2 rounded-full px-3 py-0.5 text-sm font-bold text-white"
          style={{ background: varc(colorVar) }}
        >
          Grade {grade}
        </div>
      </div>
      {verdict && (
        <div className="mt-1 text-center text-sm font-semibold" style={{ color: varc(colorVar) }}>
          {verdict}
        </div>
      )}
    </div>
  )
}
