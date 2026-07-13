import { motion } from 'framer-motion'
import { FileSignature, Layers, Gauge, HandCoins } from 'lucide-react'

const STEPS = [
  { icon: FileSignature, label: 'Consent', time: '~30 sec' },
  { icon: Layers, label: 'Aggregate', time: '~2 min' },
  { icon: Gauge, label: 'Score', time: '<1 sec' },
  { icon: HandCoins, label: 'Offer', time: 'instant' },
]

export default function TatTimeline() {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-semibold">Time-to-decision</span>
        <span className="text-muted">
          <span className="text-faint line-through">15–20 days</span>{' '}
          <span className="font-bold text-brand">→ under 5 minutes</span>
        </span>
      </div>
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-surface-2" />
        <motion.div
          className="absolute left-0 top-5 h-0.5 bg-brand"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.6, ease: 'easeInOut' }}
        />
        {STEPS.map((s, i) => (
          <motion.div
            key={s.label}
            className="relative z-10 flex flex-col items-center gap-1"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.35 }}
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-white shadow">
              <s.icon size={16} />
            </span>
            <span className="text-xs font-semibold">{s.label}</span>
            <span className="font-num text-[10px] text-faint">{s.time}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
