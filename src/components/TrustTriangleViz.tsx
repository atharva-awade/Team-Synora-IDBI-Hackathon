import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react'
import type { TrustTriangle } from '../lib/anomalyEngine'
import { inrCompact } from '../lib/format'
import { varc } from './common'

const edgeColor = (a: number) =>
  a >= 0.8 ? '--color-good' : a >= 0.65 ? '--color-warn' : '--color-danger'

function Node({ x, y, label, value }: { x: number; y: number; label: string; value: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r="34" fill={varc('--color-surface')} stroke={varc('--color-line-strong')} strokeWidth="1.5" />
      <text x={x} y={y - 4} textAnchor="middle" fontSize="12" fontWeight="700" fill={varc('--color-text')}>
        {label}
      </text>
      <text x={x} y={y + 12} textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono" fill={varc('--color-muted')}>
        {value}
      </text>
    </g>
  )
}

function EdgeBadge({ x, y, a }: { x: number; y: number; a: number }) {
  const c = edgeColor(a)
  return (
    <g>
      <rect x={x - 22} y={y - 11} width="44" height="22" rx="11" fill={varc(c)} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="JetBrains Mono">
        {Math.round(a * 100)}%
      </text>
    </g>
  )
}

export default function TrustTriangleViz({ t }: { t: TrustTriangle }) {
  const gstVsUpi = t.upi > 0 && t.gst > 0 ? Math.min(t.gst, t.upi) / Math.max(t.gst, t.upi) : 0
  // vertices
  const A = { x: 160, y: 44 } // GST (top)
  const B = { x: 44, y: 210 } // Bank (bottom-left)
  const C = { x: 276, y: 210 } // UPI (bottom-right)
  const mid = (p: { x: number; y: number }, q: { x: number; y: number }) => ({
    x: (p.x + q.x) / 2,
    y: (p.y + q.y) / 2,
  })

  const verdictMeta = {
    consistent: { icon: CheckCircle2, color: '--color-good', label: 'Sources reconcile' },
    review: { icon: AlertTriangle, color: '--color-warn', label: 'Needs review' },
    flagged: { icon: ShieldAlert, color: '--color-danger', label: 'Flagged' },
  }[t.verdict]

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 320 250" className="w-full max-w-[320px]">
          {/* edges */}
          <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={varc(edgeColor(t.gstVsBank))} strokeWidth="3" />
          <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} stroke={varc(edgeColor(t.bankVsUpi))} strokeWidth="3" />
          <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke={varc(edgeColor(gstVsUpi))} strokeWidth="3" />
          <EdgeBadge {...mid(A, B)} a={t.gstVsBank} />
          <EdgeBadge {...mid(B, C)} a={t.bankVsUpi} />
          <EdgeBadge {...mid(A, C)} a={gstVsUpi} />
          <Node x={A.x} y={A.y} label="GST" value={inrCompact(t.gst)} />
          <Node x={B.x} y={B.y} label="Bank" value={inrCompact(t.bank)} />
          <Node x={C.x} y={C.y} label="UPI" value={inrCompact(t.upi)} />
        </svg>
        <div
          className="mt-1 flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold text-white"
          style={{ background: varc(verdictMeta.color) }}
        >
          <verdictMeta.icon size={16} />
          {verdictMeta.label} · {t.consistencyScore}/100
        </div>
      </div>

      <div className="space-y-2.5">
        {t.flags.map((f) => {
          const tone =
            f.severity === 'high'
              ? '--color-danger'
              : f.severity === 'medium'
                ? '--color-warn'
                : f.severity === 'low'
                  ? '--color-accent'
                  : '--color-good'
          return (
            <div key={f.id} className="card flex gap-3 p-4">
              <span
                className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white"
                style={{ background: varc(tone) }}
              >
                {f.severity === 'clear' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{f.title}</span>
                  {f.severity !== 'clear' && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                      style={{ background: varc(tone) }}
                    >
                      {f.severity}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-muted">{f.detail}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
