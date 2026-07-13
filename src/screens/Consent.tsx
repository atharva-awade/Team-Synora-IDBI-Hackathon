import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Fingerprint, RefreshCw } from 'lucide-react'
import { useApp } from '../state/app'
import { CONSENT_SOURCES } from '../data/consent'
import ConsentArtifactCard from '../components/ConsentArtifactCard'
import SourceTile from '../components/SourceTile'
import { SectionTitle, Pill } from '../components/common'

export default function Consent() {
  const { persona, go } = useApp()
  const [connected, setConnected] = useState<Set<string>>(new Set())
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)

  const runConsent = () => {
    setConnected(new Set())
    setDone(false)
    setRunning(true)
  }

  // Reset the animation whenever the business changes so the moment always lands.
  useEffect(() => {
    setConnected(new Set())
    setDone(false)
    setRunning(false)
  }, [persona.id])

  useEffect(() => {
    if (!running) return
    let i = 0
    const timer = setInterval(() => {
      setConnected((prev) => {
        const next = new Set(prev)
        next.add(CONSENT_SOURCES[i].id)
        return next
      })
      i += 1
      if (i >= CONSENT_SOURCES.length) {
        clearInterval(timer)
        setRunning(false)
        setTimeout(() => setDone(true), 400)
      }
    }, 520)
    return () => clearInterval(timer)
  }, [running])

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Step 1 · Consent-first onboarding"
        icon={Fingerprint}
        title="One consent unlocks the whole picture"
        sub={`${persona.owner} grants a granular, time-bound consent through the Account Aggregator framework. Every source below is pulled only under that consent — and purged after the decision.`}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-white text-sm font-bold">
                {persona.initials}
              </span>
              <div>
                <div className="font-semibold">{persona.name}</div>
                <div className="text-xs text-faint">
                  Udyam {persona.udyamNumber} · GSTIN {persona.gstinMasked}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {persona.tags.map((t) => (
                <Pill key={t} tone="brand">{t}</Pill>
              ))}
            </div>
            {persona.rejectionNote && (
              <p className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                {persona.rejectionNote}
              </p>
            )}
          </div>

          <ConsentArtifactCard />

          <div className="flex flex-wrap items-center gap-3">
            {!done ? (
              <button className="btn btn-primary" onClick={runConsent} disabled={running}>
                {running ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Pulling consented data…
                  </>
                ) : (
                  <>
                    Grant consent &amp; aggregate <ArrowRight size={16} />
                  </>
                )}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => go('aggregate')}>
                View aggregated sources <ArrowRight size={16} />
              </button>
            )}
            {done && (
              <button className="btn btn-ghost" onClick={runConsent}>
                <RefreshCw size={15} /> Replay
              </button>
            )}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold">Consented sources</span>
            <span className="font-num text-sm text-muted">
              {connected.size}/{CONSENT_SOURCES.length} connected
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CONSENT_SOURCES.map((s) => (
              <SourceTile
                key={s.id}
                source={s}
                connected={connected.has(s.id)}
                connecting={running && !connected.has(s.id)}
              />
            ))}
          </div>

          {done && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-3 rounded-xl bg-brand-tint px-4 py-3 text-sm"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-white">✓</span>
              <span>
                All six sources aggregated under consent <b>{'CONSENT-AA-7F3C9A21'}</b>. Ready to score.
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
