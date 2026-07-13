import type { ComponentType } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AppProvider, useApp, type View } from './state/app'
import AppShell from './components/AppShell'
import Home from './screens/Home'
import Consent from './screens/Consent'
import Aggregate from './screens/Aggregate'
import HealthCard from './screens/HealthCard'
import Explain from './screens/Explain'
import WhatIf from './screens/WhatIf'
import Trust from './screens/Trust'
import Assistant from './screens/Assistant'
import Portfolio from './screens/Portfolio'
import Applicant from './screens/Applicant'

const SCREENS: Record<View, ComponentType> = {
  home: Home,
  consent: Consent,
  aggregate: Aggregate,
  health: HealthCard,
  explain: Explain,
  whatif: WhatIf,
  trust: Trust,
  assistant: Assistant,
  portfolio: Portfolio,
  applicant: Applicant,
}

function Router() {
  const { view } = useApp()
  const Screen = SCREENS[view]
  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <Screen />
        </motion.div>
      </AnimatePresence>
    </AppShell>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}
