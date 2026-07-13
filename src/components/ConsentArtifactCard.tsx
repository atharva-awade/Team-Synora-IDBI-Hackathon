import { ShieldCheck, Clock, FileKey, Trash2, RefreshCw } from 'lucide-react'
import { CONSENT_TERMS } from '../data/consent'

const ROWS = [
  { icon: FileKey, label: 'Purpose', value: CONSENT_TERMS.purpose },
  { icon: RefreshCw, label: 'Frequency', value: CONSENT_TERMS.frequency },
  { icon: Clock, label: 'Consent duration', value: CONSENT_TERMS.duration },
  { icon: Trash2, label: 'Data life', value: CONSENT_TERMS.dataLife },
]

export default function ConsentArtifactCard() {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 border-b border-line bg-brand-tint px-5 py-4">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white">
          <ShieldCheck size={20} />
        </span>
        <div>
          <div className="font-semibold">Account Aggregator Consent</div>
          <div className="text-xs text-muted">DEPA framework · consent-first data access</div>
        </div>
        <span className="ml-auto rounded-full bg-good/15 px-3 py-1 text-xs font-semibold text-good">
          Granted
        </span>
      </div>
      <div className="divide-y divide-line">
        {ROWS.map((r) => (
          <div key={r.label} className="flex items-center gap-3 px-5 py-3">
            <r.icon size={16} className="text-brand" />
            <span className="w-36 shrink-0 text-sm text-muted">{r.label}</span>
            <span className="text-sm font-medium">{r.value}</span>
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-2 px-5 py-3">
          <span className="w-36 shrink-0 text-sm text-muted">Financial info types</span>
          <div className="flex flex-wrap gap-1.5">
            {CONSENT_TERMS.fiTypes.map((t) => (
              <span key={t} className="chip">{t}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-line px-5 py-3 text-xs text-faint">
        <span className="font-num">Consent ID · {CONSENT_TERMS.consentId}</span>
        <span>Revocable anytime · DPDP Act 2023 compliant</span>
      </div>
    </div>
  )
}
