import { varc } from './common'

export default function Logo({ size = 34, withWordmark = true }: { size?: number; withWordmark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={varc('--color-brand')} />
            <stop offset="100%" stopColor={varc('--color-dim-6')} />
          </linearGradient>
        </defs>
        <rect x="1.5" y="1.5" width="37" height="37" rx="11" fill="url(#logoGrad)" />
        <path
          d="M8 21 h6 l3 -8 l5 15 l3 -9 h7"
          fill="none"
          stroke="#fff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {withWordmark && (
        <div className="leading-tight">
          <div className="font-display text-[17px] font-bold tracking-tight">
            Udyam<span className="text-brand">Pulse</span>
          </div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-faint">
            MSME Financial Health
          </div>
        </div>
      )}
    </div>
  )
}
