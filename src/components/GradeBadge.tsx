import type { Grade } from '../lib/types'
import { GRADE_COLORVAR, varc } from './common'

export default function GradeBadge({
  grade,
  size = 'md',
}: {
  grade: Grade
  size?: 'sm' | 'md' | 'lg'
}) {
  const color = GRADE_COLORVAR[grade]
  const dims = {
    sm: 'h-7 min-w-7 px-2 text-xs',
    md: 'h-9 min-w-9 px-2.5 text-sm',
    lg: 'h-12 min-w-12 px-3 text-lg',
  }[size]
  return (
    <span
      className={`inline-grid place-items-center rounded-xl font-bold text-white ${dims}`}
      style={{ background: varc(color) }}
    >
      {grade}
    </span>
  )
}
