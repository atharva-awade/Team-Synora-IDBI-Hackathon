import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cx, varc } from './common'

export default function KpiStat({
  label,
  value,
  sub,
  icon: Icon,
  colorVar = '--color-brand',
  className,
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  icon?: LucideIcon
  colorVar?: string
  className?: string
}) {
  return (
    <div className={cx('card card-lift p-4', className)}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-faint">{label}</span>
        {Icon && (
          <span
            className="grid h-8 w-8 place-items-center rounded-lg"
            style={{ background: `color-mix(in srgb, ${varc(colorVar)} 14%, transparent)`, color: varc(colorVar) }}
          >
            <Icon size={16} />
          </span>
        )}
      </div>
      <div className="mt-2 font-num text-2xl font-bold" style={{ color: varc(colorVar) }}>
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
    </div>
  )
}
