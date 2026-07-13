import { motion } from 'framer-motion'
import { Check, RefreshCw } from 'lucide-react'
import type { ConsentSource } from '../lib/types'
import { ICONS, cx } from './common'

export default function SourceTile({
  source,
  connected,
  connecting,
}: {
  source: ConsentSource
  connected: boolean
  connecting?: boolean
}) {
  const Icon = ICONS[source.icon]
  return (
    <motion.div
      layout
      className={cx(
        'card relative overflow-hidden p-4 transition-colors',
        connected ? 'border-brand/50' : 'opacity-90',
      )}
      style={connected ? { boxShadow: '0 0 0 1px var(--brand-soft)' } : undefined}
    >
      {connecting && (
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-brand/10 to-transparent"
          style={{ animation: 'shimmer 1.1s infinite' }} />
      )}
      <div className="flex items-start justify-between">
        <span
          className={cx(
            'grid h-10 w-10 place-items-center rounded-xl transition-colors',
            connected ? 'bg-brand text-white' : 'bg-surface-2 text-muted',
          )}
        >
          {Icon && <Icon size={18} />}
        </span>
        <span
          className={cx(
            'grid h-6 w-6 place-items-center rounded-full text-white transition-all',
            connected ? 'bg-good scale-100' : 'scale-0',
          )}
        >
          <Check size={14} strokeWidth={3} />
        </span>
        {connecting && !connected && (
          <RefreshCw size={16} className="animate-spin text-brand" />
        )}
      </div>
      <div className="mt-3 font-semibold">{source.name}</div>
      <div className="text-xs text-faint">{source.provider}</div>
      {connected && (
        <div className="mt-3 flex items-center gap-3 text-[11px] text-muted">
          {source.coverageMonths > 0 && (
            <span className="font-num">{source.coverageMonths}/12 mo</span>
          )}
          <span className="font-num">synced {source.lastSyncDays}d ago</span>
        </div>
      )}
    </motion.div>
  )
}
