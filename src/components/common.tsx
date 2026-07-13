import type { ReactNode } from 'react'
import {
  Landmark,
  ReceiptText,
  Smartphone,
  Users,
  FileCheck2,
  BadgeCheck,
  type LucideIcon,
} from 'lucide-react'
import type { Grade } from '../lib/types'

export const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(' ')

/** Icon registry for data-driven icon names (from source fixtures). */
export const ICONS: Record<string, LucideIcon> = {
  Landmark,
  ReceiptText,
  Smartphone,
  Users,
  FileCheck2,
  BadgeCheck,
}

export const GRADE_COLORVAR: Record<Grade, string> = {
  'A+': '--color-brand',
  A: '--color-good',
  'B+': '--color-dim-6',
  B: '--color-dim-2',
  C: '--color-warn',
  D: '--color-danger',
}

export const varc = (v: string) => `var(${v})`

export function SectionTitle({
  eyebrow,
  title,
  sub,
  icon: Icon,
}: {
  eyebrow?: string
  title: string
  sub?: string
  icon?: LucideIcon
}) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
          {Icon && <Icon size={14} />}
          {eyebrow}
        </div>
      )}
      <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
      {sub && <p className="mt-2 max-w-2xl text-muted">{sub}</p>}
    </div>
  )
}

export function Panel({
  children,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'article'
}) {
  return <Tag className={cx('card p-5 sm:p-6', className)}>{children}</Tag>
}

export function Pill({
  children,
  tone = 'muted',
}: {
  children: ReactNode
  tone?: 'muted' | 'brand' | 'good' | 'warn' | 'danger' | 'accent'
}) {
  const tones: Record<string, string> = {
    muted: 'bg-surface-2 text-muted border-line',
    brand: 'bg-brand-soft text-brand-strong border-transparent',
    good: 'text-good border-transparent',
    warn: 'text-warn border-transparent',
    danger: 'bg-danger-soft text-danger border-transparent',
    accent: 'text-accent-strong border-transparent',
  }
  const bg: Record<string, string> = {
    good: 'rgba(18,161,80,0.12)',
    warn: 'rgba(232,145,42,0.14)',
    accent: 'rgba(232,145,42,0.12)',
  }
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
        tones[tone],
      )}
      style={bg[tone] ? { background: bg[tone] } : undefined}
    >
      {children}
    </span>
  )
}

export function Meter({ value, colorVar = '--color-brand', height = 8 }: { value: number; colorVar?: string; height?: number }) {
  return (
    <div
      className="w-full overflow-hidden rounded-full bg-surface-2"
      style={{ height }}
      role="meter"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${Math.max(2, Math.min(100, value))}%`, background: varc(colorVar) }}
      />
    </div>
  )
}
