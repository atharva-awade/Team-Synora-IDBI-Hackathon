import { type ReactNode } from 'react'
import {
  Home,
  ShieldCheck,
  Layers,
  IdCard,
  ListTree,
  TrendingUp,
  Triangle,
  MessagesSquare,
  LayoutDashboard,
  UserSearch,
  Moon,
  Sun,
  Building2,
  Store,
  type LucideIcon,
} from 'lucide-react'
import Logo from './Logo'
import { cx } from './common'
import { useApp, type Role, type View } from '../state/app'
import { PERSONAS } from '../data/personas'

interface NavItem {
  view: View
  label: string
  icon: LucideIcon
}

const MSME_NAV: NavItem[] = [
  { view: 'home', label: 'Overview', icon: Home },
  { view: 'consent', label: 'Consent', icon: ShieldCheck },
  { view: 'aggregate', label: 'Data Sources', icon: Layers },
  { view: 'health', label: 'Health Card', icon: IdCard },
  { view: 'explain', label: 'Why this score', icon: ListTree },
  { view: 'whatif', label: 'Path to a better grade', icon: TrendingUp },
  { view: 'trust', label: 'Trust Triangle', icon: Triangle },
  { view: 'assistant', label: 'Assistant', icon: MessagesSquare },
]

const BANK_NAV: NavItem[] = [
  { view: 'portfolio', label: 'Portfolio Cockpit', icon: LayoutDashboard },
  { view: 'applicant', label: 'Applicant 360°', icon: UserSearch },
]

export default function AppShell({ children }: { children: ReactNode }) {
  const { role, setRole, view, go, theme, toggleTheme, personaId, setPersonaId } = useApp()
  const nav = role === 'bank' ? BANK_NAV : MSME_NAV

  return (
    <div className="min-h-screen bg-fabric">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
          <button onClick={() => go('home')} className="shrink-0" aria-label="UdyamPulse home">
            <Logo />
          </button>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <RoleSwitch role={role} onChange={setRole} />

            <label className="hidden items-center md:flex">
              <span className="sr-only">Select business</span>
              <select
                value={personaId}
                onChange={(e) => setPersonaId(e.target.value)}
                className="max-w-[180px] rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm font-medium outline-none focus:border-brand"
              >
                {PERSONAS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <button
              onClick={toggleTheme}
              className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface-2 text-muted transition-colors hover:text-brand"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 sm:px-6">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <nav className="sticky top-24 space-y-1">
            <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-faint">
              {role === 'bank' ? 'Bank · Relationship Manager' : 'MSME · Borrower'}
            </div>
            {nav.map((item) => (
              <NavButton key={item.view} item={item} active={view === item.view} onClick={() => go(item.view)} />
            ))}
          </nav>
        </aside>

        {/* Mobile nav (horizontal scroll) */}
        <nav className="fixed inset-x-0 bottom-0 z-40 flex gap-1 overflow-x-auto border-t border-line bg-surface/95 px-2 py-2 backdrop-blur lg:hidden">
          {nav.map((item) => (
            <button
              key={item.view}
              onClick={() => go(item.view)}
              className={cx(
                'flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium',
                view === item.view ? 'bg-brand-soft text-brand-strong' : 'text-muted',
              )}
            >
              <item.icon size={18} />
              {item.label.split(' ')[0]}
            </button>
          ))}
        </nav>

        <main className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</main>
      </div>
    </div>
  )
}

function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
        active ? 'bg-brand-soft text-brand-strong' : 'text-muted hover:bg-surface-2 hover:text-text',
      )}
    >
      <item.icon size={18} className={active ? 'text-brand' : ''} />
      {item.label}
    </button>
  )
}

function RoleSwitch({ role, onChange }: { role: Role; onChange: (r: Role) => void }) {
  return (
    <div className="flex rounded-xl border border-line bg-surface-2 p-1">
      {(
        [
          { id: 'msme', label: 'MSME', icon: Store },
          { id: 'bank', label: 'Bank', icon: Building2 },
        ] as const
      ).map((r) => (
        <button
          key={r.id}
          onClick={() => onChange(r.id)}
          className={cx(
            'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors sm:px-3',
            role === r.id ? 'bg-brand text-white shadow-sm' : 'text-muted hover:text-text',
          )}
        >
          <r.icon size={15} />
          <span className="hidden sm:inline">{r.label}</span>
        </button>
      ))}
    </div>
  )
}
