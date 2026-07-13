import { motion } from 'framer-motion'
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Building2,
  Layers,
  BadgeIndianRupee,
} from 'lucide-react'
import { useApp } from '../state/app'
import PulseGauge from '../components/PulseGauge'
import { Pill } from '../components/common'
import { inrCompact } from '../lib/format'
import { getPersona } from '../data/personas'
import { computeScore } from '../lib/scoringEngine'

const NATIONAL_STATS = [
  { value: '63M+', label: 'MSMEs in India', src: 'MoMSME' },
  { value: '~30%', label: 'of national GDP', src: 'MoMSME' },
  { value: '₹20–25L cr', label: 'unmet credit gap', src: 'RBI (U.K. Sinha)' },
  { value: '~110M', label: 'people employed', src: 'MoMSME' },
]

const HIGHLIGHTS = [
  { icon: Layers, title: 'Six-pillar health score', text: 'Cash-flow, momentum, repayment, compliance, workforce & digital footprint — fused from alternate data.' },
  { icon: ShieldCheck, title: 'Consent-first, India-Stack native', text: 'Account Aggregator (DEPA), GSTN, UPI, EPFO and ULI/OCEN — nothing pulled without granular consent.' },
  { icon: TrendingUp, title: 'A path, not a rejection', text: 'Every thin-file business gets a concrete route to a better grade and a larger credit line.' },
]

export default function Home() {
  const { go, setPersonaId } = useApp()
  const meena = getPersona('meena-textiles')
  const meenaScore = computeScore(meena.signals)

  const assessMeena = () => {
    setPersonaId('meena-textiles')
    go('consent')
  }

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Pill tone="brand">
              <Sparkles size={13} /> India-Stack-native credit intelligence
            </Pill>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] sm:text-5xl">
              Make every credit-invisible{' '}
              <span className="gradient-text">MSME bankable</span> — in minutes.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted">
              UdyamPulse reads a business's live economic heartbeat from GST, UPI, Account
              Aggregator and EPFO data, and turns it into an explainable Financial Health Card —
              a score the borrower understands and a decision the bank can trust.
            </p>
            <p className="mt-3 max-w-xl text-sm font-medium text-faint">
              “CIBIL tells a bank about a borrower's <em>past</em>. UdyamPulse tells a bank about a
              business's <em>present and trajectory</em> — from data the MSME already generates every day.”
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button className="btn btn-primary" onClick={assessMeena}>
                Assess Meena Textiles <ArrowRight size={17} />
              </button>
              <button className="btn btn-ghost" onClick={() => go('portfolio')}>
                <Building2 size={17} /> Open Bank cockpit
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="card relative mx-auto w-full max-w-sm p-6"
        >
          <div className="mb-1 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">{meena.name}</div>
              <div className="text-xs text-faint">{meena.city}, {meena.state} · {meena.sector}</div>
            </div>
            <span className="chip">Live</span>
          </div>
          <div className="flex flex-col items-center py-2">
            <PulseGauge score={meenaScore.overall} grade={meenaScore.grade} size={230} />
          </div>
          <div className="mt-2 flex items-center justify-between rounded-xl bg-brand-tint px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <BadgeIndianRupee size={16} className="text-brand" /> Eligible working capital
            </div>
            <div className="font-num text-lg font-bold text-brand-strong">
              {inrCompact(meenaScore.eligibleLimit)}
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-muted">
            A business three banks rejected — assessed as prime, with no audited balance sheet.
          </p>
        </motion.div>
      </section>

      {/* National stats */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {NATIONAL_STATS.map((s, i) => (
          <motion.div
            key={s.label}
            className="card card-lift p-5 text-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
          >
            <div className="font-num text-2xl font-bold text-brand sm:text-3xl">{s.value}</div>
            <div className="mt-1 text-sm font-medium">{s.label}</div>
            <div className="mt-1 text-[10px] uppercase tracking-wide text-faint">{s.src}</div>
          </motion.div>
        ))}
      </section>

      {/* Highlights */}
      <section className="grid gap-5 md:grid-cols-3">
        {HIGHLIGHTS.map((h, i) => (
          <motion.div
            key={h.title}
            className="card card-lift p-6"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand-strong">
              <h.icon size={20} />
            </span>
            <h3 className="mt-4 text-lg font-bold">{h.title}</h3>
            <p className="mt-2 text-sm text-muted">{h.text}</p>
          </motion.div>
        ))}
      </section>

      {/* CTA band */}
      <section className="card overflow-hidden">
        <div className="relative flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-bold">See the full journey</h3>
            <p className="mt-1 text-muted">
              Consent → aggregate → score → explain → offer → portfolio early-warning.
            </p>
          </div>
          <button className="btn btn-primary shrink-0" onClick={assessMeena}>
            Start assessment <ArrowRight size={17} />
          </button>
        </div>
      </section>
    </div>
  )
}
