import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MessagesSquare, Send, Sparkles } from 'lucide-react'
import { useApp } from '../state/app'
import {
  ASSISTANT_GREETING,
  LANGUAGES,
  SUGGESTIONS,
  matchIntent,
  type Lang,
} from '../data/assistantScript'
import { SectionTitle, cx } from '../components/common'

interface Msg {
  role: 'user' | 'bot'
  text: string
}

export default function Assistant() {
  const { score, lang, setLang } = useApp()
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  // Greet (and re-greet) in the selected language.
  useEffect(() => {
    setMessages([{ role: 'bot', text: ASSISTANT_GREETING[lang] }])
  }, [lang])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const ask = (question: string, answer: string) => {
    setMessages((m) => [...m, { role: 'user', text: question }])
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages((m) => [...m, { role: 'bot', text: answer }])
    }, 650)
  }

  const onSuggestion = (id: string) => {
    const s = SUGGESTIONS.find((x) => x.id === id)!
    ask(s.q[lang], s.answer(score)[lang])
  }

  const onSend = () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    const s = matchIntent(text)
    ask(text, s.answer(score)[lang])
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Financial inclusion"
        icon={MessagesSquare}
        title="An advisor that speaks the owner's language"
        sub="Most credit-invisible MSME owners aren't served in English. The assistant explains the Health Card in plain, multilingual terms — grounded in the borrower's own numbers."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div className="card flex h-[560px] flex-col overflow-hidden">
          {/* header */}
          <div className="flex items-center gap-3 border-b border-line px-5 py-3">
            <span className="relative grid h-9 w-9 place-items-center rounded-full bg-brand text-white">
              <Sparkles size={16} />
            </span>
            <div>
              <div className="text-sm font-semibold">Pulse Assistant</div>
              <div className="flex items-center gap-1 text-xs text-good">
                <span className="h-1.5 w-1.5 rounded-full bg-good" /> Online
              </div>
            </div>
            <div className="ml-auto flex gap-1">
              {LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLang(l.id as Lang)}
                  className={cx(
                    'rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors',
                    lang === l.id ? 'bg-brand text-white' : 'bg-surface-2 text-muted hover:text-text',
                  )}
                >
                  {l.native}
                </button>
              ))}
            </div>
          </div>

          {/* messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cx('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cx(
                    'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
                    m.role === 'user'
                      ? 'rounded-br-sm bg-brand text-white'
                      : 'rounded-bl-sm bg-surface-2 text-text',
                  )}
                >
                  {m.text}
                </div>
              </motion.div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-surface-2 px-4 py-3">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="h-1.5 w-1.5 animate-pulse rounded-full bg-faint"
                        style={{ animationDelay: `${d * 0.15}s` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* input */}
          <div className="border-t border-line px-4 py-3">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSend()}
                placeholder="Ask about your score, loan or data…"
                className="flex-1 rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-brand"
              />
              <button
                className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl bg-brand text-white transition-colors hover:bg-brand-strong"
                onClick={onSend}
                aria-label="Send"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* suggestions */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-faint">Try asking</div>
          {SUGGESTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => onSuggestion(s.id)}
              className="card card-lift w-full px-4 py-3 text-left text-sm font-medium"
            >
              {s.q[lang]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
