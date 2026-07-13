import { useMemo } from 'react'
import { Triangle, ShieldAlert, ArrowRight } from 'lucide-react'
import { useApp } from '../state/app'
import { analyzeTrust } from '../lib/anomalyEngine'
import TrustTriangleViz from '../components/TrustTriangleViz'
import { SectionTitle, Panel, Pill } from '../components/common'
import { PERSONAS } from '../data/personas'

export default function Trust() {
  const { persona, setPersonaId, go } = useApp()
  const t = useMemo(() => analyzeTrust(persona.signals), [persona.signals])

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Step 6 · Fraud & consistency"
        icon={Triangle}
        title="The Trust Triangle"
        sub="Three independent views of the same business — GST-declared turnover, bank credits and UPI inflow — must agree. Inflated or round-tripped revenue breaks the triangle. Fraud detection without a black box."
      />

      <Panel>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">
              {persona.initials}
            </span>
            <div>
              <div className="text-sm font-semibold">{persona.name}</div>
              <div className="text-xs text-faint">{persona.sector}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPersonaId(p.id)}
                className={`chip ${p.id === persona.id ? 'border-brand text-brand-strong' : ''}`}
              >
                {p.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <TrustTriangleViz t={t} />
      </Panel>

      {t.verdict === 'flagged' && (
        <div className="flex items-start gap-3 rounded-2xl border border-danger/40 bg-danger-soft px-6 py-5">
          <ShieldAlert className="mt-0.5 shrink-0 text-danger" size={22} />
          <div>
            <div className="font-bold text-danger">Hold — inconsistencies detected</div>
            <p className="mt-1 text-sm text-muted">
              This applicant may look approvable on the score alone, but its sources do not reconcile.
              UdyamPulse routes it to manual review <b>before</b> a rupee is disbursed — protecting portfolio quality.
            </p>
          </div>
        </div>
      )}

      {t.verdict === 'consistent' && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-tint px-6 py-5">
          <div className="flex items-center gap-2 text-sm">
            <Pill tone="good">Verified</Pill>
            <span className="text-muted">
              All three sources reconcile within tolerance. This business is exactly who it says it is.
            </span>
          </div>
          <button className="btn btn-primary" onClick={() => go('assistant')}>
            Talk to the assistant <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
