'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CircleHelp, FileText, Languages, ListPlus, SendHorizonal, Sparkles, X } from 'lucide-react'
import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { AIOrb } from '@/components/ai/ai-orb'
import { AIBadge } from '@/components/ai/ai-badge'
import { AgentLog } from '@/components/ai/agent-log'
import { AISurface } from '@/components/ai/ai-surface'
import { StreamingText } from '@/components/ai/streaming-text'
import { aiToast } from '@/components/ai/ai-toast'
import { SimulatedNotice } from '@/components/os/illustrative-chip'
import { Tr } from '@/components/os/tr-text'
import { useDemo, useDemoEvent } from '@/lib/os/demo-store'
import { fmtIN, fmtNum, tr, type Bi } from '@/lib/os/i18n'
import { ASK_QA, askSteps, findAsk, type AskQA, type OfficerLang } from '@/components/state/state-data'
import { cn } from '@/lib/utils'

const T = {
  title: { en: 'Ask Sarthi', hi: 'सारथी से पूछें' },
  sub: { en: 'Ask about any district, branch or drive', hi: 'किसी भी ज़िले, शाखा या ड्राइव के बारे में पूछें' },
  placeholder: 'पूछिए… / Ask in Hindi or English',
  ask: { en: 'Ask', hi: 'पूछें' },
  try: { en: 'Try', hi: 'आज़माएँ' },
  meta: { en: 'Answered in 0.8s · illustrative data', hi: '0.8 सेकंड में उत्तर · सांकेतिक डेटा' },
  why: { en: 'Why?', hi: 'क्यों?' },
  filters: { en: 'Filters', hi: 'फ़िल्टर' },
  basis: { en: 'Based on', hi: 'आधार' },
  confidence: { en: 'Confidence', hi: 'विश्वास स्तर' },
  addBrief: { en: 'Add to weekly brief', hi: 'साप्ताहिक ब्रीफ़ में जोड़ें' },
  added: { en: 'Added to the weekly brief', hi: 'साप्ताहिक ब्रीफ़ में जोड़ा गया' },
  queued: { en: 'Action queued (simulated)', hi: 'कार्रवाई कतार में (सिम्युलेटेड)' },
  queuedSub: { en: 'Demo only · nothing is sent', hi: 'केवल डेमो · कुछ भी भेजा नहीं गया' },
  brief: { en: "Generate Secretary's weekly brief", hi: 'सचिव का साप्ताहिक ब्रीफ़ बनाएँ' },
  clear: { en: 'Clear answer', hi: 'उत्तर हटाएँ' },
  log: { en: 'Sarthi is working', hi: 'सारथी काम कर रहा है' },
} satisfies Record<string, Bi | string>

interface Current {
  nonce: number
  item: AskQA
  lang: OfficerLang
  question: string
}

const LANG_BTN =
  'h-7 rounded-md px-2 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60'

export interface AskSarthiProps {
  /** Districts the current answer is about (null clears). */
  onFocus?: (ids: string[] | null) => void
  className?: string
}

export function AskSarthi({ onFocus, className }: AskSarthiProps) {
  const { t } = useDemo()
  const [input, setInput] = useState('')
  const [cur, setCur] = useState<Current | null>(null)
  const [phase, setPhase] = useState<'log' | 'answer'>('log')
  const [viewLang, setViewLang] = useState<OfficerLang>('hi')
  const [instant, setInstant] = useState(false)
  const [streamDone, setStreamDone] = useState(false)
  const [whyOpen, setWhyOpen] = useState(false)
  const nonceRef = useRef(0)
  const onFocusRef = useRef(onFocus)
  onFocusRef.current = onFocus

  const answer = useMemo(() => (cur ? cur.item.answer() : null), [cur])
  const chart = useMemo(() => (cur ? cur.item.chart() : null), [cur])
  const why = useMemo(() => (cur ? cur.item.why() : null), [cur])
  const steps = useMemo(() => askSteps(cur?.lang ?? 'hi'), [cur])

  const skip = () => {
    if (cur) setInstant(true)
  }
  useDemoEvent('fastforward', skip)
  useDemoEvent('finish', skip)

  const ask = (raw: string, forced?: AskQA) => {
    const text = raw.trim()
    if (!text) return
    const res = forced ? { item: forced, lang: forced.qLang } : findAsk(text)
    nonceRef.current += 1
    setCur({ nonce: nonceRef.current, item: res.item, lang: res.lang, question: text })
    setViewLang(res.lang)
    setPhase('log')
    setInstant(false)
    setStreamDone(false)
    setWhyOpen(false)
    onFocusRef.current?.(null)
  }

  const clear = () => {
    setCur(null)
    setStreamDone(false)
    onFocusRef.current?.(null)
  }

  const onLogDone = () => {
    setPhase('answer')
    const ids = cur?.item.focus?.() ?? null
    onFocusRef.current?.(ids && ids.length ? ids : null)
  }

  const rows = useMemo(
    () => (chart ? chart.data.map((r) => ({ id: r.id, name: tr(r.name, viewLang), value: r.value, hl: !!r.hl })) : []),
    [chart, viewLang],
  )
  const decimals = chart?.decimals ?? 0
  const fmtV = (v: number) => `${decimals > 0 ? fmtNum(v, decimals) : fmtIN(v)}${chart?.suffix ?? ''}`
  const chartH = Math.max(110, Math.min(320, rows.length * 30 + 26 + (chart?.ref ? 16 : 0)))
  const showExtras = phase === 'answer' && (streamDone || instant || viewLang !== cur?.lang)

  return (
    <div
      className={cn(
        'relative flex h-full flex-col overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#0b111a]/80 p-4 shadow-[0_0_0_1px_rgba(34,211,238,0.05),0_30px_80px_-40px_rgba(34,211,238,0.35)] sm:p-5',
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/[0.10] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-violet-500/[0.08] blur-3xl" />

      <header className="relative mb-3 flex items-center gap-2.5">
        <AIOrb size={28} state={cur && phase === 'log' ? 'thinking' : 'idle'} label="" />
        <div className="min-w-0 flex-1">
          <Tr as="h2" b={T.title} className="block text-[15px] font-semibold leading-tight text-white" />
          <Tr as="p" b={T.sub} className="block truncate text-[12px] text-gray-400" />
        </div>
        <AIBadge />
      </header>

      <form
        className="relative"
        onSubmit={(e) => {
          e.preventDefault()
          ask(input)
        }}
      >
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 p-1.5 pl-3 transition-colors focus-within:border-cyan-400/50 focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]">
          <Sparkles aria-hidden className="h-4 w-4 shrink-0 text-cyan-300" />
          <input
            data-hotkeys-off
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={T.placeholder}
            aria-label={T.placeholder}
            lang="hi"
            className="font-deva min-w-0 flex-1 bg-transparent py-1.5 text-[14px] text-white placeholder:text-gray-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 px-3 text-[13px] font-semibold text-white transition hover:brightness-110 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            <SendHorizonal aria-hidden className="h-3.5 w-3.5" />
            <Tr b={T.ask} />
          </button>
        </div>
      </form>

      <div className="relative mt-3 flex flex-wrap gap-1.5">
        {ASK_QA.map((q, i) => {
          const label = tr(q.q, q.qLang)
          const active = cur?.item.id === q.id
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => {
                setInput('')
                ask(label, q)
              }}
              className={cn(
                'max-w-full rounded-full border px-3 py-1.5 text-left text-[12.5px] leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60',
                active
                  ? 'border-cyan-300/60 bg-cyan-400/15 text-cyan-50'
                  : i === 0
                    ? 'border-cyan-400/30 bg-gradient-to-r from-blue-500/[0.12] via-cyan-400/[0.10] to-emerald-400/[0.08] text-cyan-50 hover:border-cyan-300/60'
                    : 'border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/25 hover:text-white',
              )}
            >
              <Tr b={label} />
            </button>
          )
        })}
      </div>

      {cur && (
        <div className="relative mt-4 space-y-3" key={cur.nonce}>
          <div className="flex items-start gap-2 rounded-xl bg-white/[0.04] px-3 py-2 text-[13px] text-gray-200">
            <span className="mt-0.5 shrink-0 text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-500">Q</span>
            <Tr b={cur.question} className="min-w-0 flex-1" />
            <button
              type="button"
              onClick={clear}
              aria-label={t(T.clear)}
              className="-mr-1 grid h-6 w-6 shrink-0 place-items-center rounded-md text-gray-500 hover:bg-white/[0.08] hover:text-white"
            >
              <X aria-hidden className="h-3.5 w-3.5" />
            </button>
          </div>

          {phase === 'log' ? (
            <AgentLog steps={steps} stepMs={380} title={T.log} onDone={onLogDone} />
          ) : (
            <AISurface
              className="os-rise"
              meta={T.meta}
              actions={
                <div
                  role="group"
                  aria-label="Answer language"
                  className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-black/30 p-0.5"
                >
                  <Languages aria-hidden className="mx-1 h-3.5 w-3.5 text-gray-500" />
                  <button
                    type="button"
                    lang="hi"
                    onClick={() => setViewLang('hi')}
                    aria-pressed={viewLang === 'hi'}
                    className={cn(LANG_BTN, 'font-deva', viewLang === 'hi' ? 'bg-white/[0.1] text-white' : 'text-gray-400 hover:text-white')}
                  >
                    हिंदी
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewLang('en')}
                    aria-pressed={viewLang === 'en'}
                    className={cn(LANG_BTN, viewLang === 'en' ? 'bg-white/[0.1] text-white' : 'text-gray-400 hover:text-white')}
                  >
                    English
                  </button>
                </div>
              }
            >
              {answer && (
                <StreamingText
                  key={`${cur.nonce}-${viewLang}`}
                  text={tr(answer, viewLang)}
                  cps={120}
                  startDelay={120}
                  instant={instant || viewLang !== cur.lang}
                  onDone={() => setStreamDone(true)}
                  className="whitespace-pre-line text-[14px] leading-relaxed text-gray-100"
                />
              )}

              {chart && rows.length > 0 && (
                <div className="os-rise mt-4 rounded-xl border border-white/[0.08] bg-black/25 p-3">
                  <Tr
                    as="p"
                    b={tr(chart.unit, viewLang)}
                    className="mb-1 block text-[12px] font-medium uppercase tracking-[0.1em] text-gray-500"
                  />
                  <div style={{ height: chartH }} className="w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={rows} layout="vertical" margin={{ top: chart.ref ? 20 : 4, right: 44, bottom: 0, left: 0 }}>
                        <XAxis type="number" hide domain={[0, 'auto']} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={104}
                          tick={{ fill: '#cbd5e1', fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          interval={0}
                        />
                        {chart.ref ? (
                          <ReferenceLine
                            x={chart.ref.value}
                            stroke="#a78bfa"
                            strokeDasharray="4 3"
                            label={{
                              value: `${tr(chart.ref.label, viewLang)} ${fmtV(chart.ref.value)}`,
                              position: 'top',
                              fill: '#c4b5fd',
                              fontSize: 12,
                            }}
                          />
                        ) : null}
                        <Bar
                          dataKey="value"
                          radius={[0, 5, 5, 0]}
                          maxBarSize={18}
                          animationDuration={700}
                          label={{ position: 'right', fill: '#e5e7eb', fontSize: 12, formatter: (v: number) => fmtV(v) }}
                        >
                          {rows.map((r) => (
                            <Cell key={`ask-${r.id}`} fill={r.hl ? '#fbbf24' : '#22d3ee'} fillOpacity={r.hl ? 0.95 : 0.75} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div
                className={cn(
                  'mt-3 transition-opacity duration-300',
                  showExtras ? 'opacity-100' : 'pointer-events-none opacity-0',
                )}
                aria-hidden={!showExtras}
              >
                <div className="flex flex-wrap gap-1.5">
                  {cur.item.actions.slice(0, 3).map((a) => (
                    <button
                      key={a.en}
                      type="button"
                      tabIndex={showExtras ? 0 : -1}
                      onClick={() => aiToast(`${tr(a, viewLang)} · ${t(T.queued)}`, { description: t(T.queuedSub) })}
                      className="inline-flex items-center gap-1 rounded-full border border-cyan-400/25 bg-cyan-400/[0.08] px-2.5 py-1 text-[12.5px] text-cyan-50 transition-colors hover:border-cyan-300/60 hover:bg-cyan-400/15"
                    >
                      <ArrowRight aria-hidden className="h-3 w-3 text-cyan-300" />
                      <Tr b={tr(a, viewLang)} />
                    </button>
                  ))}
                  <button
                    type="button"
                    tabIndex={showExtras ? 0 : -1}
                    onClick={() => setWhyOpen((v) => !v)}
                    aria-expanded={whyOpen}
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[12.5px] text-gray-300 hover:text-white"
                  >
                    <CircleHelp aria-hidden className="h-3 w-3" />
                    <Tr b={T.why} />
                  </button>
                </div>
                {whyOpen && why && (
                  <dl className="os-rise mt-2 grid gap-1.5 rounded-xl border border-white/[0.08] bg-black/25 p-3 text-[12.5px] sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-3">
                    <dt className="text-gray-500">
                      <Tr b={T.filters} />
                    </dt>
                    <dd className="text-gray-200">
                      <Tr b={tr(why.filters, viewLang)} />
                    </dd>
                    <dt className="text-gray-500">
                      <Tr b={T.basis} />
                    </dt>
                    <dd className="tabular-nums text-gray-200">
                      {fmtIN(why.n)} <Tr b={tr(why.nLabel, viewLang)} />
                    </dd>
                    <dt className="text-gray-500">
                      <Tr b={T.confidence} />
                    </dt>
                    <dd className="tabular-nums text-gray-200">
                      {Math.round(why.confidence <= 1 ? why.confidence * 100 : why.confidence)}%
                    </dd>
                  </dl>
                )}
              </div>
            </AISurface>
          )}

          {phase === 'answer' && (
            <div className="os-rise space-y-2">
              <SimulatedNotice />
              <button
                type="button"
                onClick={() => aiToast(t(T.added), { tone: 'ok', description: cur.question })}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 text-[12.5px] text-gray-200 transition-colors hover:border-emerald-400/40 hover:text-white"
              >
                <ListPlus aria-hidden className="h-3.5 w-3.5 text-emerald-300" />
                <Tr b={T.addBrief} />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="relative mt-auto pt-4">
        <Link
          href="/state/brief"
          className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-gradient-to-r from-blue-500/20 via-cyan-500/15 to-emerald-500/20 px-4 py-2.5 text-[14px] font-semibold text-white transition hover:border-cyan-300/60 hover:from-blue-500/30 hover:to-emerald-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          <FileText aria-hidden className="h-4 w-4 text-cyan-200" />
          <Tr b={T.brief} />
          <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}
