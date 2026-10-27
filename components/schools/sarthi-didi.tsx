'use client'

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { BookOpen, Headset, MessageCircleHeart, Mic, Send, Square, Users, Volume2 } from 'lucide-react'
import { useDemo, useDemoEvent } from '@/lib/os/demo-store'
import type { Bi } from '@/lib/os/i18n'
import { matchCanned } from '@/lib/ai-sim'
import { SPEECH_NOTE } from '@/lib/mock/state'
import { useMicLevel, useSpeak, useSpeechRecognition } from '@/hooks/use-speech'
import { AIOrb } from '@/components/ai/ai-orb'
import { AIThinking } from '@/components/ai/ai-thinking'
import { StreamingText } from '@/components/ai/streaming-text'
import { Waveform } from '@/components/ai/waveform'
import { aiToast } from '@/components/ai/ai-toast'
import { AudioGate } from '@/components/os/audio-gate'
import { IntegrationChip } from '@/components/os/integration-chip'
import { cn } from '@/lib/utils'
import {
  DIDI_CHIPS,
  DIDI_DEMO_CHIP,
  DIDI_FALLBACK,
  DIDI_GREETING,
  DIDI_PARENT_INTRO,
  DIDI_QA,
  ttsHi,
  type DidiQA,
} from '@/components/schools/school-data'
import { StepHeading, StepNav, T, useSchool } from '@/components/schools/school-shell'

const UI = {
  title: { en: 'Sarthi Didi', hi: 'सारथी दीदी' } as Bi,
  sub: {
    en: 'Your AI career counsellor: ask by voice or text, in Hindi',
    hi: 'आपकी AI करियर काउंसलर: बोलकर या लिखकर, हिंदी में पूछें',
  } as Bi,
  gateTitle: { en: 'Talk to Sarthi Didi', hi: 'सारथी दीदी से बात करें' } as Bi,
  gateBody: {
    en: 'She answers aloud in Hindi, and every answer is also shown as text.',
    hi: 'दीदी हिंदी में बोलकर जवाब देंगी, और हर जवाब लिखा हुआ भी दिखेगा।',
  } as Bi,
  start: { en: 'Start', hi: 'शुरू करें' } as Bi,
  ready: { en: 'Ready: ask anything', hi: 'तैयार: कुछ भी पूछिए' } as Bi,
  listening: { en: 'Listening…', hi: 'सुन रही हूँ…' } as Bi,
  thinking: { en: 'Thinking…', hi: 'सोच रही हूँ…' } as Bi,
  speaking: { en: 'Speaking…', hi: 'बोल रही हूँ…' } as Bi,
  parent: { en: 'Parent mode', hi: 'अभिभावक मोड' } as Bi,
  parentHint: { en: 'Simpler words: fees, safety, girls’ hostels', hi: 'आसान भाषा: फ़ीस, सुरक्षा, लड़कियों के हॉस्टल' } as Bi,
  parentTag: { en: 'Parent mode · simple words', hi: 'अभिभावक मोड · आसान भाषा' } as Bi,
  tryAsk: { en: 'Try asking', hi: 'ऐसे पूछें' } as Bi,
  placeholder: { en: 'Type your question…', hi: 'अपना सवाल लिखें…' } as Bi,
  send: { en: 'Send', hi: 'भेजें' } as Bi,
  mic: { en: 'Tap and speak', hi: 'दबाएँ और बोलें' } as Bi,
  micStop: { en: 'Tap to stop', hi: 'रोकने के लिए दबाएँ' } as Bi,
  micScripted: { en: 'Scripted voice (demo)', hi: 'स्क्रिप्टेड आवाज़ (डेमो)' } as Bi,
  notHeard: { en: 'I could not hear that. Tap a question below or type it.', hi: 'आवाज़ साफ़ नहीं आई। नीचे का सवाल दबाएँ या लिखें।' } as Bi,
  micBlocked: {
    en: 'Microphone not available: tap a question or type instead',
    hi: 'माइक्रोफ़ोन उपलब्ध नहीं: सवाल दबाएँ या लिखकर पूछें',
  } as Bi,
  sources: { en: 'Sources', hi: 'स्रोत' } as Bi,
  replay: { en: 'Hear again', hi: 'फिर से सुनें' } as Bi,
  stopVoice: { en: 'Stop voice', hi: 'आवाज़ रोकें' } as Bi,
  human: { en: 'Talk to a human counsellor', hi: 'मानव काउंसलर से बात करें' } as Bi,
  humanToast: {
    en: 'Request sent to your school counsellor · call-back within 24 hours (demo)',
    hi: 'स्कूल काउंसलर को अनुरोध भेजा गया · 24 घंटे में कॉल-बैक (डेमो)',
  } as Bi,
  noVoice: {
    en: 'No Hindi voice on this device: answers are shown as text',
    hi: 'इस डिवाइस पर हिंदी आवाज़ नहीं मिली: जवाब लिखकर दिखेंगे',
  } as Bi,
  captions: { en: 'Captions always on', hi: 'हर जवाब लिखा भी दिखता है' } as Bi,
  next: { en: 'See my schemes', hi: 'योजना रडार देखें' } as Bi,
}

const qaById = (id: string): DidiQA => DIDI_QA.find((q) => q.id === id) ?? DIDI_FALLBACK

interface Chip {
  text: Bi
  qa: string
}

/** Student chips (spec order); the second is the demo chip. */
const STUDENT_CHIPS: Chip[] = DIDI_CHIPS.map((text, i) => ({ text, qa: ['engineer-money', 'polytechnic', 'stream'][i] ?? 'fallback' }))

/** Parent-mode chips: fees, safety / hostels, what a polytechnic is. */
const PARENT_CHIPS: Chip[] = [
  { text: { hi: 'फ़ीस और खर्च की चिंता है', en: 'We are worried about fees' }, qa: 'engineer-money' },
  { text: { hi: 'बेटी की सुरक्षा और हॉस्टल?', en: 'Our daughter’s safety and hostel?' }, qa: 'safety' },
  { text: { hi: 'Polytechnic क्या होता है?', en: 'What is a polytechnic?' }, qa: 'polytechnic' },
]

type Msg =
  | { id: number; role: 'user'; text: string }
  | { id: number; role: 'didi'; text: Bi; sources: Bi[]; parent: boolean }

export function SarthiDidi() {
  const { L } = useSchool()
  return (
    <section>
      <StepHeading title={UI.title} sub={UI.sub} icon={MessageCircleHeart} />
      <AudioGate title={L(UI.gateTitle)} body={L(UI.gateBody)} startLabel={L(UI.start)} note={L(SPEECH_NOTE)} className="min-h-[46vh] py-2">
        <DidiChat />
      </AudioGate>
      <StepNav next={6} nextLabel={UI.next} />
    </section>
  )
}

function DidiChat() {
  const { L, lang, lite } = useSchool()
  const { voiceMode } = useDemo()
  const { speak, cancel, speaking, hasHindiVoice, voices } = useSpeak()
  const recLang = lang === 'hi' ? 'hi' : 'en'
  const rec = useSpeechRecognition({ lang: recLang })
  const [micFailed, setMicFailed] = useState(false)
  const live = voiceMode === 'live' && rec.supported && !micFailed
  const [fakeListening, setFakeListening] = useState(false)
  const listening = rec.listening || fakeListening
  const level = useMicLevel(rec.listening)

  const [parentMode, setParentMode] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>(() => [{ id: 0, role: 'didi', text: DIDI_GREETING, sources: [], parent: false }])
  const [thinking, setThinking] = useState(false)
  const [doneIds, setDoneIds] = useState<number[]>([])
  const [input, setInput] = useState('')

  const nextId = useRef(1)
  const timers = useRef<number[]>([])
  const asked = useRef(false)
  const busy = useRef(false)
  const lastQa = useRef<DidiQA | null>(null)
  const parentRef = useRef(false)
  const langRef = useRef(lang)
  langRef.current = lang
  const scrollRef = useRef<HTMLDivElement>(null)

  const chips = parentMode ? PARENT_CHIPS : STUDENT_CHIPS
  const orbState = listening ? 'listening' : thinking ? 'thinking' : speaking ? 'speaking' : 'idle'
  const status = listening ? UI.listening : thinking ? UI.thinking : speaking ? UI.speaking : UI.ready

  // Clear timers on unmount.
  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []
    },
    [],
  )

  /** Speaks a Bi in the page language (Devanagari text is made TTS-friendly; long text is chunked by foundation). */
  const say = useCallback(
    (b: Bi) => {
      const l = langRef.current
      const text = l === 'hi' ? ttsHi(b.hi ?? b.en) : b.en
      if (text) void speak(text, l === 'hi' ? 'hi' : 'en')
    },
    [speak],
  )

  // Greet once the gate opens (the Start tap is the user gesture). StrictMode re-runs are harmless: speak() replaces.
  useEffect(() => {
    say(DIDI_GREETING)
  }, [say])

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current = timers.current.filter((x) => x !== id)
      fn()
    }, ms)
    timers.current.push(id)
  }

  const pushDidi = useCallback(
    (text: Bi, sources: Bi[], parent: boolean) => {
      const id = nextId.current++
      setMsgs((m) => [...m, { id, role: 'didi', text, sources, parent }])
      say(text)
    },
    [say],
  )

  const answer = useCallback(
    (qa: DidiQA, parent: boolean) => {
      lastQa.current = qa
      pushDidi(parent ? qa.parent : qa.answer, qa.sources, parent)
    },
    [pushDidi],
  )

  const ask = (raw: string, qa?: DidiQA) => {
    const q = raw.trim()
    if (!q || busy.current) return
    busy.current = true
    asked.current = true
    cancel()
    const id = nextId.current++
    setMsgs((m) => [...m, { id, role: 'user', text: q }])
    setThinking(true)
    const match = qa ?? matchCanned(q, DIDI_QA, DIDI_FALLBACK)
    later(
      () => {
        setThinking(false)
        busy.current = false
        answer(match, parentRef.current)
      },
      lite ? 200 : 800,
    )
  }
  const askRef = useRef(ask)
  askRef.current = ask

  const askChip = (c: Chip) => ask(L(c.text), qaById(c.qa))

  const toggleParent = () => {
    const next = !parentRef.current
    parentRef.current = next
    setParentMode(next)
    if (!next || busy.current) return
    cancel()
    busy.current = true
    setThinking(true)
    later(
      () => {
        setThinking(false)
        busy.current = false
        const qa = lastQa.current
        if (qa) answer(qa, true)
        else pushDidi(DIDI_PARENT_INTRO, [], true)
      },
      lite ? 150 : 600,
    )
  }

  // Autopilot (also replayed by AudioGate after it opens): ask the demo chip once.
  useDemoEvent('autopilot', () => {
    if (asked.current) return
    const c = STUDENT_CHIPS[DIDI_DEMO_CHIP] ?? STUDENT_CHIPS[0]
    if (c) askRef.current(tr2(c.text, langRef.current), qaById(c.qa))
  })

  // ---- Voice input --------------------------------------------------------
  const recRef = useRef(rec)
  recRef.current = rec
  const wasListening = useRef(false)
  const scriptedIdx = useRef(0)

  // When live recognition ends, send what was heard.
  useEffect(() => {
    if (rec.listening) {
      wasListening.current = true
      return
    }
    if (!wasListening.current) return
    wasListening.current = false
    const r = recRef.current
    const heard = `${r.finalText} ${r.interim}`.trim()
    r.reset()
    if (heard) askRef.current(heard)
    else if (!r.error || r.error === 'no-speech') aiToast(tr2(UI.notHeard, langRef.current), { tone: 'warn', id: 'didi-mic' })
  }, [rec.listening])

  // Auto-stop after a short silence once something was heard, and after 15 s at most.
  useEffect(() => {
    if (!rec.listening) return
    const startedAt = Date.now()
    const id = window.setInterval(() => {
      const r = recRef.current
      const now = Date.now()
      const quiet = r.lastResultAt != null && now - r.lastResultAt > 1800 && `${r.finalText}${r.interim}`.trim().length > 0
      if (quiet || now - startedAt > 15000) r.stop()
    }, 300)
    return () => window.clearInterval(id)
  }, [rec.listening])

  // Mic errors (denied, no device): say so once and keep chips/typing available.
  useEffect(() => {
    const e = rec.error
    if (!e || e === 'no-speech' || e === 'aborted') return
    setMicFailed(true)
    aiToast(tr2(UI.micBlocked, langRef.current), { tone: 'warn', id: 'didi-mic' })
  }, [rec.error])

  const onMic = () => {
    if (busy.current) return
    if (live) {
      if (rec.listening) {
        rec.stop()
        return
      }
      cancel()
      rec.reset()
      rec.start()
      return
    }
    // Scripted (no mic / presenter 'Scripted'): simulate a short listen, then ask the next question.
    if (fakeListening) return
    cancel()
    setFakeListening(true)
    const order = [DIDI_DEMO_CHIP, 0, 2]
    const c = chips[order[scriptedIdx.current % order.length] ?? 0] ?? chips[0]
    scriptedIdx.current += 1
    later(() => {
      setFakeListening(false)
      if (c) askRef.current(tr2(c.text, langRef.current), qaById(c.qa))
    }, lite ? 400 : 1600)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    ask(input)
    setInput('')
  }

  // Keep the newest message in view inside the chat box (never scrolls the page).
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: lite ? 'auto' : 'smooth' })
  }, [msgs.length, thinking, lite])

  const lastDidiId = [...msgs].reverse().find((m) => m.role === 'didi')?.id ?? -1
  const heardNow = `${rec.finalText} ${rec.interim}`.trim()
  const showNoVoice = lang === 'hi' && voices.length > 0 && !hasHindiVoice

  return (
    <div className="space-y-4">
      {/* Counsellor header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <div aria-hidden className="pointer-events-none absolute -left-12 -top-16 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <AIOrb state={orbState} level={rec.listening ? level : undefined} size={104} label={L(status)} className="shrink-0" />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-[19px] font-semibold text-white">
              <T b={UI.title} />
            </p>
            <p
              aria-live="polite"
              className={cn('mt-0.5 text-[14px]', listening ? 'text-rose-200' : thinking ? 'text-violet-200' : speaking ? 'text-cyan-200' : 'text-gray-400')}
            >
              <T b={status} />
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <button
                type="button"
                onClick={toggleParent}
                aria-pressed={parentMode}
                title={L(UI.parentHint)}
                className={cn(
                  'inline-flex h-11 items-center gap-2 rounded-xl border px-3 text-[13px] font-medium transition-colors',
                  parentMode
                    ? 'border-amber-300/40 bg-amber-300/10 text-amber-100'
                    : 'border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/20 hover:text-white',
                )}
              >
                <Users className="h-4 w-4 shrink-0" aria-hidden />
                <T b={UI.parent} />
                <span
                  aria-hidden
                  className={cn('relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors', parentMode ? 'bg-amber-300/80' : 'bg-white/15')}
                >
                  <span className={cn('absolute h-4 w-4 rounded-full bg-white shadow transition-transform', parentMode ? 'translate-x-[18px]' : 'translate-x-0.5')} />
                </span>
              </button>
              {speaking && (
                <button
                  type="button"
                  onClick={cancel}
                  className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-[13px] text-gray-300 transition-colors hover:text-white"
                >
                  <Square className="h-3.5 w-3.5" aria-hidden />
                  <T b={UI.stopVoice} />
                </button>
              )}
              <IntegrationChip name="Bhashini (ASR/TTS)" status="Integration-ready" />
            </div>
          </div>
        </div>
        {parentMode && (
          <p className="os-rise relative mt-3 rounded-lg border border-amber-300/20 bg-amber-300/[0.05] px-3 py-2 text-center text-[13px] text-amber-100/90 sm:text-left">
            <T b={UI.parentHint} />
          </p>
        )}
      </div>

      {/* Conversation */}
      <div
        ref={scrollRef}
        className="max-h-[440px] space-y-3 overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-4"
        aria-live="polite"
      >
        {msgs.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-md border border-cyan-300/20 bg-cyan-300/10 px-3.5 py-2.5 text-[15px] leading-relaxed text-cyan-50">
                <T b={m.text} />
              </p>
            </div>
          ) : (
            <DidiBubble
              key={m.id}
              text={L(m.text)}
              sources={m.sources}
              parent={m.parent}
              live={m.id === lastDidiId}
              done={doneIds.includes(m.id) || m.id !== lastDidiId}
              onDone={() => setDoneIds((d) => (d.includes(m.id) ? d : [...d, m.id]))}
              onReplay={() => say(m.text)}
            />
          ),
        )}
        {thinking && (
          <div className="flex justify-start">
            <AIThinking label={L(UI.thinking)} lines={1} className="w-full max-w-[85%] py-3" />
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-gray-500">
          <T b={UI.tryAsk} />
        </p>
        <div className="flex flex-wrap gap-2">
          {chips.map((c, i) => (
            <button
              key={`${parentMode ? 'p' : 's'}-${i}`}
              type="button"
              disabled={thinking || listening}
              onClick={() => askChip(c)}
              className={cn(
                'min-h-11 rounded-xl border px-3.5 py-2 text-left text-[14px] transition-colors disabled:opacity-50',
                !parentMode && i === DIDI_DEMO_CHIP
                  ? 'border-cyan-300/40 bg-cyan-300/[0.08] text-cyan-50 hover:bg-cyan-300/15'
                  : 'border-white/10 bg-white/[0.03] text-gray-200 hover:border-white/20 hover:bg-white/[0.06]',
              )}
            >
              <T b={c.text} />
            </button>
          ))}
        </div>
      </div>

      {/* Input: push-to-talk mic + typing */}
      <form onSubmit={onSubmit} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
        <button
          type="button"
          onClick={onMic}
          aria-pressed={listening}
          aria-label={L(listening ? UI.micStop : UI.mic)}
          title={L(live ? (listening ? UI.micStop : UI.mic) : UI.micScripted)}
          className={cn(
            'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors',
            listening
              ? 'bg-rose-500/90 text-white shadow-[0_0_24px_rgba(244,63,94,0.55)]'
              : 'bg-gradient-to-br from-blue-400 via-cyan-300 to-emerald-400 text-[#04121a]',
          )}
        >
          {listening && !lite && <span aria-hidden className="pulse-ring absolute inset-0 rounded-full border-2 border-rose-300/70" />}
          {listening ? <Square className="h-5 w-5" aria-hidden /> : <Mic className="h-5 w-5" aria-hidden />}
        </button>
        {listening ? (
          <div className="flex min-w-0 flex-1 items-center gap-3 px-1">
            <Waveform active level={rec.listening ? level : undefined} bars={20} className="h-8 w-24 shrink-0 sm:w-32" />
            <p className="min-w-0 flex-1 truncate text-[14px] text-gray-300">
              <T b={heardNow || L(UI.listening)} />
            </p>
          </div>
        ) : (
          <>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={L(UI.placeholder)}
              lang={lang === 'hi' ? 'hi' : 'en'}
              aria-label={L(UI.placeholder)}
              className={cn(
                'h-12 min-w-0 flex-1 rounded-xl bg-transparent px-2 text-base text-white outline-none placeholder:text-gray-500',
                lang === 'hi' && 'font-deva',
              )}
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              aria-label={L(UI.send)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-gray-200 transition-colors hover:border-cyan-300/40 hover:text-white disabled:opacity-40"
            >
              <Send className="h-[18px] w-[18px]" aria-hidden />
            </button>
          </>
        )}
      </form>
      {!live && (
        <p className="-mt-2 text-[12px] text-gray-500">
          <T b={UI.micScripted} />
        </p>
      )}

      {/* Human handover + notes */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => aiToast(L(UI.humanToast), { tone: 'ok', id: 'didi-human' })}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.07] px-4 text-[14px] font-medium text-emerald-100 transition-colors hover:bg-emerald-400/15"
        >
          <Headset className="h-4 w-4" aria-hidden />
          <T b={UI.human} />
        </button>
        <p className="text-[12px] text-gray-500">
          <T b={showNoVoice ? UI.noVoice : UI.captions} />
        </p>
      </div>
    </div>
  )
}

/** tr() for a Bi with a plain language, used inside event handlers (no hook). */
function tr2(b: Bi, l: string): string {
  return (l === 'hi' ? b.hi : b.en) ?? b.en ?? ''
}

function DidiBubble({
  text,
  sources,
  parent,
  live,
  done,
  onDone,
  onReplay,
}: {
  text: string
  sources: Bi[]
  parent: boolean
  live: boolean
  done: boolean
  onDone: () => void
  onReplay: () => void
}) {
  const { L } = useSchool()
  return (
    <div className="flex items-start gap-2.5">
      <AIOrb size={30} label="" className="mt-1 shrink-0" />
      <div className="min-w-0 max-w-[88%] flex-1">
        <div className="rounded-2xl rounded-tl-md border border-white/10 bg-gradient-to-br from-blue-500/[0.08] via-white/[0.03] to-emerald-400/[0.05] px-3.5 py-2.5">
          {parent && (
            <p className="mb-1 inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 text-[12px] font-medium text-amber-100">
              <Users className="h-3 w-3" aria-hidden />
              <T b={UI.parentTag} />
            </p>
          )}
          {live ? (
            <StreamingText text={text} onDone={onDone} className="text-[16px] leading-relaxed text-gray-100" />
          ) : (
            <p className="text-[16px] leading-relaxed text-gray-100">
              <T b={text} />
            </p>
          )}
        </div>
        {done && (
          <div className="os-rise mt-1.5 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={onReplay}
              aria-label={L(UI.replay)}
              title={L(UI.replay)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-gray-400 transition-colors hover:border-cyan-300/40 hover:text-cyan-200"
            >
              <Volume2 className="h-4 w-4" aria-hidden />
            </button>
            {sources.map((s, i) => (
              <span
                key={i}
                className="inline-flex max-w-full items-center gap-1 rounded-full border border-sky-400/20 bg-sky-400/[0.06] px-2.5 py-1 text-[12px] text-sky-100"
              >
                <BookOpen className="h-3 w-3 shrink-0" aria-hidden />
                <span className="sr-only">
                  <T b={UI.sources} />:
                </span>
                <T b={s} className="min-w-0 truncate" />
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
