'use client'

/* Live AI strip: a self-playing mini interview built from foundation primitives (AIOrb, Waveform,
 * CountUp). Pure client component: no DemoProvider, no demo-store writes. Plays only while on screen;
 * reduced motion shows the finished exchange. */

import { useEffect, useRef, useState } from 'react'
import { CornerDownRight, Languages, ScanFace, Signal } from 'lucide-react'
import { AIOrb } from '@/components/ai/ai-orb'
import { CountUp } from '@/components/ai/count-up'
import { Waveform } from '@/components/ai/waveform'
import { cn } from '@/lib/utils'
import { GRADIENT_TEXT, Eyebrow, HonestyChip, Reveal, useInView, useReducedMotion, ShowcaseStyles } from './shared'
import { STORY } from './media'

type Seg = { t: string; kind?: 'filler' | 'kw'; kw?: string }

const Q1 = 'Apne final-year project ke baare mein batao. Usme aapka role kya tha?'
const ANSWER: Seg[] = [
  { t: 'Maine ek smart irrigation system banaya, ' },
  { t: 'matlab', kind: 'filler' },
  { t: ' ' },
  { t: 'ESP32', kind: 'kw', kw: 'ESP32' },
  { t: ' se ' },
  { t: 'soil moisture', kind: 'kw', kw: 'Sensor' },
  { t: ' read karke ' },
  { t: 'MQTT', kind: 'kw', kw: 'MQTT' },
  { t: ' pe ' },
  { t: 'dashboard', kind: 'kw', kw: 'Dashboard' },
  { t: ' tak data bheja.' },
]
const ANSWER_TEXT = ANSWER.map((s) => s.t).join('')
const KEYWORDS = ['ESP32', 'Sensor', 'MQTT', 'Dashboard']
const Q2 = 'ESP32 ka Wi-Fi drop ho jaaye, toh readings kaise bachaoge?'
const FIRST_NAME = STORY.name.split(' ')[0] || 'Student'

// Timeline (ms)
const MS_Q = 26
const MS_A = 30
const Q1_START = 500
const Q1_END = Q1_START + Q1.length * MS_Q
const A_START = Q1_END + 600
const A_END = A_START + ANSWER_TEXT.length * MS_A
const THINK_END = A_END + 1100
const Q2_START = THINK_END + 450
const Q2_END = Q2_START + Q2.length * MS_Q
const SCORE_AT = Q2_END + 600
const FADE_AT = SCORE_AT + 4400
const LOOP_MS = FADE_AT + 700

const chars = (t: number, start: number, ms: number, len: number) => Math.max(0, Math.min(len, Math.floor((t - start) / ms)))

/** Character offset at which each keyword segment is fully typed. */
const KW_DONE_AT: Record<string, number> = (() => {
  const out: Record<string, number> = {}
  let pos = 0
  for (const s of ANSWER) {
    pos += s.t.length
    if (s.kind === 'kw' && s.kw) out[s.kw] = pos
  }
  return out
})()

function Transcript({ n }: { n: number }) {
  let left = n
  return (
    <>
      {ANSWER.map((seg, i) => {
        if (left <= 0) return null
        const shown = seg.t.slice(0, left)
        left -= seg.t.length
        if (seg.kind === 'filler') {
          return (
            <span key={i} className="text-amber-200 underline decoration-amber-400 decoration-wavy decoration-[1.5px] underline-offset-[5px]">
              {shown}
            </span>
          )
        }
        if (seg.kind === 'kw') {
          const done = shown.length === seg.t.length
          return (
            <span key={i} className={cn('rounded px-0.5 transition-colors duration-300', done && 'bg-cyan-400/15 text-cyan-100')}>
              {shown}
            </span>
          )
        }
        return <span key={i}>{shown}</span>
      })}
    </>
  )
}

function Caret({ on }: { on: boolean }) {
  if (!on) return null
  return <span aria-hidden className="psx-caret ml-0.5 inline-block h-4 w-[2px] translate-y-[3px] bg-cyan-300" />
}

function InterviewWidget() {
  const reduced = useReducedMotion()
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, rootMargin: '0px', threshold: 0.2 })
  const [t, setT] = useState(0)
  const tRef = useRef(0)

  useEffect(() => {
    if (reduced) {
      tRef.current = FADE_AT - 1
      setT(FADE_AT - 1)
      return
    }
    if (!inView) return
    let raf = 0
    let last = performance.now()
    let lastPaint = 0
    const tick = (now: number) => {
      const dt = Math.min(100, now - last)
      last = now
      let next = tRef.current + dt
      if (next >= LOOP_MS) next = 0
      tRef.current = next
      if (now - lastPaint > 32 || next === 0) {
        lastPaint = now
        setT(next)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduced])

  const q1n = chars(t, Q1_START, MS_Q, Q1.length)
  const an = chars(t, A_START, MS_A, ANSWER_TEXT.length)
  const q2n = chars(t, Q2_START, MS_Q, Q2.length)
  const listening = t >= A_START && t < A_END
  const thinking = t >= A_END && t < THINK_END
  const speaking = (t >= Q1_START && t < Q1_END) || (t >= Q2_START && t < Q2_END)
  const followUp = t >= THINK_END
  const scored = t >= SCORE_AT
  const fading = t >= FADE_AT

  const orbState = listening ? 'listening' : thinking ? 'thinking' : speaking ? 'speaking' : 'idle'
  const status = scored
    ? 'Scored · feedback ready'
    : followUp
      ? 'Follow-up on your project'
      : thinking
        ? 'Thinking…'
        : listening
          ? 'Listening · Hinglish'
          : t < Q1_END
            ? 'Asking'
            : 'Your turn'

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(160deg,rgba(15,23,42,0.85),rgba(7,11,20,0.95))] shadow-[0_40px_100px_-50px_rgba(34,211,238,0.5)]"
    >
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
      {/* Header */}
      <div className="relative flex items-center gap-3 border-b border-white/[0.07] px-4 py-3.5 sm:px-5">
        <AIOrb state={orbState} size={42} label="" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">Sarthi · AI technical interview</p>
          <p className="truncate text-xs text-gray-400" aria-hidden>
            {status}
          </p>
        </div>
        <span className="hidden shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs text-gray-300 sm:inline">
          Hinglish
        </span>
        <HonestyChip label="Scripted replay · Priya" className="shrink-0 px-2 py-0.5" />
      </div>

      <div className={cn('relative space-y-4 p-4 transition-opacity duration-500 sm:p-5', fading ? 'opacity-0' : 'opacity-100')}>
        {/* Q1 */}
        <div className="max-w-[92%]">
          <p className="mb-1 text-xs font-medium text-cyan-300">Sarthi</p>
          <p className="grid rounded-2xl rounded-tl-md border border-white/[0.06] bg-white/[0.04] px-3.5 py-2.5 text-sm leading-relaxed text-gray-100">
            <span className="invisible col-start-1 row-start-1">{Q1}</span>
            <span className="col-start-1 row-start-1">
              {Q1.slice(0, q1n)}
              <Caret on={q1n > 0 && q1n < Q1.length} />
            </span>
          </p>
        </div>

        {/* Answer */}
        <div className="ml-auto max-w-[94%]">
          <div className="mb-1 flex items-center justify-end gap-2">
            <Waveform active={listening} bars={12} className="h-4 w-[72px]" />
            <p className="text-xs font-medium text-gray-400">{FIRST_NAME} · transcript</p>
          </div>
          <p className="grid rounded-2xl rounded-tr-md border border-cyan-300/10 bg-cyan-400/[0.05] px-3.5 py-2.5 text-sm leading-relaxed text-gray-100">
            <span className="invisible col-start-1 row-start-1">{ANSWER_TEXT}</span>
            <span className="col-start-1 row-start-1">
              <Transcript n={an} />
              <Caret on={an > 0 && an < ANSWER_TEXT.length} />
            </span>
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-end gap-1.5">
            {KEYWORDS.map((k) => {
              const on = an >= KW_DONE_AT[k]
              return (
                <span
                  key={k}
                  className={cn(
                    'rounded-md border px-1.5 py-0.5 text-xs font-medium transition-all duration-500',
                    on
                      ? 'border-cyan-300/40 bg-cyan-400/15 text-cyan-100 shadow-[0_0_16px_-4px_rgba(34,211,238,0.7)]'
                      : 'border-white/[0.08] bg-white/[0.02] text-gray-400',
                  )}
                >
                  {k}
                </span>
              )
            })}
          </div>
        </div>

        {/* Follow-up */}
        <div className={cn('max-w-[92%] transition-opacity duration-500', followUp ? 'opacity-100' : 'opacity-0')}>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border border-violet-300/30 bg-violet-500/15 px-2.5 py-1 text-xs font-semibold text-violet-100 transition-all duration-500',
              followUp ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
            )}
          >
            <CornerDownRight className="h-3.5 w-3.5" aria-hidden />
            Because you said: ESP32
          </span>
          <p className="mt-2 grid rounded-2xl rounded-tl-md border border-white/[0.06] bg-white/[0.04] px-3.5 py-2.5 text-sm leading-relaxed text-gray-100">
            <span className="invisible col-start-1 row-start-1">{Q2}</span>
            <span className="col-start-1 row-start-1">
              {Q2.slice(0, q2n)}
              <Caret on={q2n > 0 && q2n < Q2.length} />
            </span>
          </p>
        </div>

        {/* Score split */}
        <div
          className={cn(
            'grid grid-cols-2 gap-3 rounded-2xl border border-white/[0.07] bg-black/20 p-3 transition-opacity duration-500 sm:gap-4 sm:p-3.5',
            scored ? 'opacity-100' : 'opacity-60',
          )}
        >
          {[
            { label: 'Content', value: STORY.content, note: 'language-neutral', bar: 'from-blue-400 via-cyan-300 to-emerald-400' },
            { label: 'Delivery', value: STORY.delivery, note: '1 filler: “matlab”', bar: 'from-amber-500 to-amber-300' },
          ].map((s) => (
            <div key={s.label} className="min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs text-gray-400">{s.label}</span>
                <span className="text-lg font-semibold tabular-nums text-white">
                  {scored ? <CountUp value={s.value} durationMs={1100} /> : '—'}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className={cn('h-full rounded-full bg-gradient-to-r transition-[width] ease-out [transition-duration:1100ms]', s.bar)}
                  style={{ width: scored ? `${s.value}%` : '0%' }}
                />
              </div>
              <p className="mt-1.5 truncate text-xs text-gray-400">{s.note}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="sr-only">
        Example exchange. Sarthi asks: {Q1} {FIRST_NAME} answers: {ANSWER_TEXT} Sarthi notes the filler word “matlab”
        and the keywords {KEYWORDS.join(', ')}, then follows up because you said ESP32: {Q2} Content {STORY.content},
        delivery {STORY.delivery}.
      </p>
    </div>
  )
}

const CARDS = [
  {
    icon: Languages,
    title: 'Hindi-medium? Content scored language-neutral',
    body: 'What you know is scored separately from how fluent you sound, so English never hides real ability.',
    tone: 'from-cyan-400/20 to-blue-500/10 text-cyan-200',
  },
  {
    icon: ScanFace,
    title: 'Proctoring in-browser, video never leaves device',
    body: 'Face and tab checks run on the student’s own phone or laptop. Only flags and an integrity score are shared.',
    tone: 'from-emerald-400/20 to-teal-500/10 text-emerald-200',
  },
  {
    icon: Signal,
    title: 'Works on 2G Lite mode',
    body: 'A text-first Lite mode for patchy networks and entry-level phones, from Patna to Purnia.',
    tone: 'from-violet-400/20 to-indigo-500/10 text-violet-200',
  },
]

export function LiveAI() {
  return (
    <section id="sarthi-live" aria-labelledby="live-ai-title" className="relative scroll-mt-16 overflow-hidden py-16 sm:py-24">
      <ShowcaseStyles />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div aria-hidden className="pointer-events-none absolute -left-40 top-1/3 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.06] blur-[110px]" />
      <div className="container relative mx-auto px-4">
        {/* Mobile: header → widget → cards. Desktop: widget left (spans both rows), copy right. */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:grid-rows-[auto_auto] lg:gap-x-14 lg:gap-y-7">
          <Reveal className="order-1 min-w-0 lg:col-start-2 lg:row-start-1 lg:self-end">
            <Eyebrow>Live AI</Eyebrow>
            <h2 id="live-ai-title" className="mt-4 text-[2rem] font-semibold leading-[1.1] tracking-[-0.02em] text-white sm:text-[2.5rem]">
              Sarthi sunta hai. Samajhta hai. <span className={GRADIENT_TEXT}>Follow-up poochta hai.</span>
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-gray-400 sm:text-base">
              Not a quiz bot. Sarthi hears filler words, catches the keywords that matter and digs into your own project,
              in the language you think in.
            </p>
          </Reveal>
          <Reveal className="order-2 min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-center" delay={120}>
            <InterviewWidget />
          </Reveal>
          <Reveal className="order-3 min-w-0 lg:col-start-2 lg:row-start-2 lg:self-start" delay={80}>
            <ul className="space-y-3">
              {CARDS.map((c) => (
                <li
                  key={c.title}
                  className="flex gap-3.5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-colors hover:border-white/[0.14] hover:bg-white/[0.04]"
                >
                  <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset ring-white/10', c.tone)}>
                    <c.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold leading-snug text-white">{c.title}</span>
                    <span className="mt-1 block text-[13px] leading-relaxed text-gray-400">{c.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
