import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { computeScore } from '../lib/scoringEngine'
import { getPersona, HERO_PERSONA_ID } from '../data/personas'
import type { Lang } from '../data/assistantScript'
import type { MsmeProfile, ScoreResult } from '../lib/types'

export type Role = 'msme' | 'bank'
export type View =
  | 'home'
  | 'consent'
  | 'aggregate'
  | 'health'
  | 'explain'
  | 'whatif'
  | 'trust'
  | 'assistant'
  | 'portfolio'
  | 'applicant'

interface AppState {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  role: Role
  setRole: (r: Role) => void
  personaId: string
  setPersonaId: (id: string) => void
  persona: MsmeProfile
  score: ScoreResult
  view: View
  go: (v: View) => void
  lang: Lang
  setLang: (l: Lang) => void
}

const Ctx = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  )
  const [role, setRole] = useState<Role>('msme')
  const [personaId, setPersonaId] = useState<string>(HERO_PERSONA_ID)
  const [view, setView] = useState<View>('home')
  const [lang, setLang] = useState<Lang>('en')

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark'
      const root = document.documentElement
      if (next === 'dark') root.classList.add('dark')
      else root.classList.remove('dark')
      try {
        localStorage.setItem('up-theme', next)
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  const persona = useMemo(() => getPersona(personaId), [personaId])
  const score = useMemo(() => computeScore(persona.signals), [persona])

  const go = useCallback(
    (v: View) => {
      setView(v)
      if (v === 'portfolio' || v === 'applicant') setRole('bank')
      else setRole('msme')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [],
  )

  // Keep role and view coherent when the role switcher is used directly.
  const changeRole = useCallback((r: Role) => {
    setRole(r)
    setView(r === 'bank' ? 'portfolio' : 'health')
    window.scrollTo({ top: 0 })
  }, [])

  const value: AppState = {
    theme,
    toggleTheme,
    role,
    setRole: changeRole,
    personaId,
    setPersonaId,
    persona,
    score,
    view,
    go,
    lang,
    setLang,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp must be used within AppProvider')
  return v
}

/** Read the resolved CSS color for a token var, re-computed on theme change. */
// eslint-disable-next-line react-refresh/only-export-components
export function useTokenColors(vars: string[]): string[] {
  const { theme } = useApp()
  return useMemo(() => {
    const styles = getComputedStyle(document.documentElement)
    return vars.map((v) => styles.getPropertyValue(v).trim() || '#000')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, vars.join(',')])
}
