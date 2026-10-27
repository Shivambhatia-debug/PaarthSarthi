'use client'

/* Round 3 · Versant/SVAR-style communication (P0-lite, on the demo path).
 * Part A read aloud (live word diff), Part B listen & repeat (en-IN TTS, text hidden until answered),
 * Part C 30-second open answer (pace, pauses, fillers). Works live (en-IN speech recognition) or scripted.
 * Autopilot plays all three parts with scripted transcripts; fast-forward jumps straight to the result.
 * Scores are locked to the persona (VERSANT_TARGETS); transcript metrics are measured on the real transcript. */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  BookOpenText,
  Check,
  Ear,
  EyeOff,
  Gauge,
  Keyboard,
  Mic,
  MessageSquareText,
  NotebookPen,
  PauseCircle,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Timer,
  Volume2,
  Wand2,
  type LucideIcon,
} from 'lucide-react'
import { useDemo, useDemoEvent } from '@/lib/os/demo-store'
import { bySex, type Bi } from '@/lib/os/i18n'
import { VERSANT_TARGETS } from '@/lib/os/rounds'
import { versantToPillar } from '@/lib/os/scoring'
import { isCoreBlueprint } from '@/lib/mock/blueprints'
import { countFillers, diffWords, markFillers, sleep, wordsPerMinute } from '@/lib/ai-sim'
import { useMicLevel, useSpeak, useSpeechRecognition } from '@/hooks/use-speech'
import { AgentLog } from '@/components/ai/agent-log'
import { AIOrb } from '@/components/ai/ai-orb'
import { CountUp } from '@/components/ai/count-up'
import { InsightCard } from '@/components/ai/insight-card'
import { Waveform } from '@/components/ai/waveform'
import { aiToast } from '@/components/ai/ai-toast'
import { Tr } from '@/components/os/tr-text'
import { cn } from '@/lib/utils'
import {
  COMM_CUTOFF,
  COMM_ITEMS,
  SIM_WORD_MS,
  SUBSCORE_KEYS,
  SUBSCORE_LABELS,
  VERSANT_SUBSCORES,
  simulateSpeech,
  type CommItem,
} from '@/components/placement/communication/comm-items'

// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------

const TXT = {
  result: { en: 'Result', hi: 'परिणाम', hinglish: 'Result' },
  hidden: { en: 'Sentence hidden until you answer', hi: 'जवाब देने तक वाक्य छिपा है', hinglish: 'Jawab dene tak sentence hidden hai' },
  listenFirst: { en: 'Listen to the sentence first', hi: 'पहले वाक्य सुनें', hinglish: 'Pehle sentence suniye' },
  play: { en: 'Play sentence', hi: 'वाक्य सुनें', hinglish: 'Sentence suniye' },
  replay: { en: 'Replay once', hi: 'एक बार फिर सुनें', hinglish: 'Ek baar phir suniye' },
  playing: { en: 'Sarthi is speaking (en-IN)…', hi: 'सारथी बोल रहा है (en-IN)…', hinglish: 'Sarthi bol raha hai (en-IN)…' },
  noTts: {
    en: 'Audio is unavailable on this device, so the sentence is shown instead.',
    hi: 'इस डिवाइस पर ऑडियो उपलब्ध नहीं है, इसलिए वाक्य दिखाया गया है।',
  },
  record: { en: 'Record answer', hi: 'जवाब रिकॉर्ड करें', hinglish: 'Answer record kijiye' },
  stop: { en: 'Stop', hi: 'रोकें', hinglish: 'Stop' },
  playScripted: { en: 'Play scripted answer', hi: 'स्क्रिप्टेड जवाब चलाएँ', hinglish: 'Scripted answer chalaiye' },
  useScripted: { en: 'Use scripted answer (demo)', hi: 'स्क्रिप्टेड जवाब (डेमो)', hinglish: 'Scripted answer use karein (demo)' },
  listening: { en: 'Listening · en-IN', hi: 'सुन रहा है · en-IN', hinglish: 'Sun raha hai · en-IN' },
  typing: { en: 'Scripted answer', hi: 'स्क्रिप्टेड जवाब', hinglish: 'Scripted answer' },
  liveMic: { en: 'Live mic · en-IN', hi: 'लाइव माइक · en-IN', hinglish: 'Live mic · en-IN' },
  scriptedMode: { en: 'Scripted voice mode', hi: 'स्क्रिप्टेड वॉइस मोड', hinglish: 'Scripted voice mode' },
  transcript: { en: 'Live transcript', hi: 'लाइव ट्रांसक्रिप्ट', hinglish: 'Live transcript' },
  yourAnswer: { en: 'Your answer', hi: 'आपका जवाब', hinglish: 'Aapka answer' },
  sentenceWas: { en: 'The sentence was', hi: 'वाक्य था', hinglish: 'Sentence tha' },
  youSaid: { en: 'You said', hi: 'आपने कहा', hinglish: 'Aapne kaha' },
  waiting: { en: 'Your words will appear here as you speak.', hi: 'बोलते ही आपके शब्द यहाँ दिखेंगे।', hinglish: 'Bolte hi aapke words yahan dikhenge.' },
  retry: { en: 'Try again', hi: 'फिर से', hinglish: 'Dobara' },
  nextPart: { en: 'Next part', hi: 'अगला भाग', hinglish: 'Next part' },
  getScore: { en: 'Get my score', hi: 'मेरा स्कोर', hinglish: 'Mera score' },
  wpm: { en: 'WPM', hi: 'WPM' },
  pauses: { en: 'Long pauses', hi: 'लंबे ठहराव', hinglish: 'Long pauses' },
  words: { en: 'Words', hi: 'शब्द', hinglish: 'Words' },
  fillers: { en: 'Fillers', hi: 'फ़िलर', hinglish: 'Fillers' },
  matched: { en: 'matched', hi: 'मिले', hinglish: 'match' },
  autopilot: { en: 'Autopilot running…', hi: 'ऑटोपायलट चल रहा है…', hinglish: 'Autopilot chal raha hai…' },
  speakFor: { en: 'Speak for up to 30 seconds', hi: '30 सेकंड तक बोलें', hinglish: '30 second tak boliye' },
  scoringTitle: { en: 'Sarthi AI · scoring Round 3', hi: 'सारथी AI · राउंड 3 का स्कोर', hinglish: 'Sarthi AI · Round 3 scoring' },
  versantScore: { en: 'Versant-style score', hi: 'Versant-शैली स्कोर', hinglish: 'Versant-style score' },
  scale: { en: '20-80 scale', hi: '20-80 स्केल', hinglish: '20-80 scale' },
  pillar: { en: 'Communication pillar', hi: 'संवाद स्तंभ', hinglish: 'Communication pillar' },
  subscores: { en: 'Subscores (20-80)', hi: 'उप-स्कोर (20-80)', hinglish: 'Subscores (20-80)' },
  cutoffLine: { en: 'Cutoff', hi: 'कटऑफ़', hinglish: 'Cutoff' },
  tipTitle: { en: 'Coaching tip, in Hindi', hi: 'कोचिंग टिप', hinglish: 'Coaching tip (Hindi mein)' },
  tipAction: { en: 'Add drill to my plan', hi: 'योजना में अभ्यास जोड़ें', hinglish: 'Plan mein drill jodiye' },
  signalWritten: { en: "Written to Sarthi's notes", hi: 'सारथी के नोट्स में दर्ज', hinglish: "Sarthi's notes mein likha" },
  measured: {
    en: 'Score calibrated to the demo persona; pace, pauses and fillers are measured on your transcript.',
    hi: 'स्कोर डेमो पर्सोना के अनुसार; गति, ठहराव और फ़िलर आपके ट्रांसक्रिप्ट से मापे गए।',
    hinglish: 'Score demo persona ke hisaab se; pace, pauses aur fillers aapke transcript se measure hue.',
  },
  scripted: { en: 'scripted', hi: 'स्क्रिप्टेड', hinglish: 'scripted' },
  live: { en: 'live', hi: 'लाइव', hinglish: 'live' },
} satisfies Record<string, Bi>

const SCORING_STEPS: Bi[] = [
  { en: 'Aligning your audio with the reference text…', hi: 'ऑडियो को संदर्भ पाठ से मिलाया जा रहा है…', hinglish: 'Audio ko reference text se align kar rahe hain…' },
  { en: 'Measuring pace, pauses and filler words…', hi: 'गति, ठहराव और फ़िलर शब्द मापे जा रहे हैं…', hinglish: 'Pace, pauses aur filler words measure ho rahe hain…' },
  { en: 'Scoring pronunciation and sentence mastery…', hi: 'उच्चारण और वाक्य-निपुणता का स्कोर…', hinglish: 'Pronunciation aur sentence mastery score ho rahe hain…' },
  { en: 'Mapping to the 20-80 Versant-style scale…', hi: '20-80 Versant-शैली स्केल पर मैपिंग…', hinglish: '20-80 Versant-style scale par mapping…' },
]

const MIC_ERRORS: Record<string, Bi> = {
  'not-allowed': { en: 'Microphone blocked', hi: 'माइक्रोफ़ोन ब्लॉक है' },
  'service-not-allowed': { en: 'Speech service blocked', hi: 'स्पीच सेवा ब्लॉक है' },
  'not-supported': { en: 'Live speech is not supported in this browser', hi: 'इस ब्राउज़र में लाइव स्पीच उपलब्ध नहीं' },
  'audio-capture': { en: 'No microphone found', hi: 'माइक्रोफ़ोन नहीं मिला' },
  network: { en: 'Speech service unreachable', hi: 'स्पीच सेवा से संपर्क नहीं हो पाया' },
}

function micNotice(code: string | null): Bi {
  const head = (code && MIC_ERRORS[code]) || { en: 'Live speech stopped', hi: 'लाइव स्पीच रुक गई' }
  return {
    en: `${head.en}: switched to the scripted answer so the round continues.`,
    hi: `${head.hi}: राउंड जारी रखने के लिए स्क्रिप्टेड जवाब पर स्विच किया।`,
  }
}

const NOTHING_HEARD: Bi = {
  en: 'Nothing was heard, so the scripted answer is used instead.',
  hi: 'कुछ सुनाई नहीं दिया, इसलिए स्क्रिप्टेड जवाब उपयोग किया गया।',
  hinglish: 'Kuch sunai nahi diya, isliye scripted answer use kiya.',
}

const PART_ICON: Record<CommItem['kind'], LucideIcon> = { read: BookOpenText, repeat: Ear, open: MessageSquareText }

/** Scripted typing speed-ups (simulated time / real time). */
const MANUAL_SPEED = [1.5, 1.5, 3]
const AUTO_SPEED = [2, 2, 5]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Phase = 'ready' | 'playing' | 'recording' | 'review'
type Stage = 'parts' | 'scoring' | 'result'
type Source = 'live' | 'scripted'

interface PartResult {
  text: string
  ms: number
  pauses: number
  source: Source
}

const join = (...parts: string[]) => parts.filter((p) => p && p.trim()).join(' ').replace(/\s+/g, ' ').trim()
/** diffWords splits "Friday's" into "friday s"; strip apostrophes from the spoken side so it still matches. */
const cleanSpoken = (s: string) => s.replace(/['’]/g, '')

function fmtClock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function scriptedResult(item: CommItem, personaId: 'priya' | 'rahul'): PartResult {
  const text = item.scripted[personaId]
  const sim = simulateSpeech(text)
  return { text, ms: sim.totalMs, pauses: sim.pauses, source: 'scripted' }
}

function accuracy(reference: string, spoken: string): { ok: number; total: number; missed: string[] } {
  const d = diffWords(reference, cleanSpoken(spoken))
  const missed = d.filter((w) => !w.ok).map((w) => w.word.replace(/[.,!?;:]+$/, ''))
  return { ok: d.length - missed.length, total: d.length, missed }
}

function ttsAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export interface CommRoundProps {
  /** Called with true once the result is on screen (the page shows the next-round footer). */
  onDone?: (done: boolean) => void
}

export function CommRound({ onDone }: CommRoundProps) {
  const { personaId, persona, voiceMode, blueprint, setRound, addSignal, lang, t } = useDemo()
  const speech = useSpeak()
  const rec = useSpeechRecognition({ lang: 'en' })

  const [stage, setStage] = useState<Stage>('parts')
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('ready')
  const [results, setResults] = useState<(PartResult | null)[]>([null, null, null])
  const [source, setSource] = useState<Source>('scripted')
  const [draft, setDraft] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [pauses, setPauses] = useState(0)
  const [plays, setPlays] = useState(0)
  const [notice, setNotice] = useState<Bi | null>(null)
  const [auto, setAuto] = useState(false)
  const [tts] = useState(ttsAvailable)

  const item = COMM_ITEMS[idx]
  const liveText = join(rec.finalText, rec.interim)
  const recording = phase === 'recording'
  const isLive = recording && source === 'live'
  const micLevel = useMicLevel(isLive)

  // ---- refs for timers, async flows and event handlers --------------------------------------
  const flowRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoRef = useRef(false)
  const startedAtRef = useRef(0)
  const lastResultRef = useRef<number | null>(null)
  const resultsRef = useRef(results)
  const S = useRef({ stage, idx, phase, source, liveText, pauses, elapsed })
  S.current = { stage, idx, phase, source, liveText, pauses, elapsed }

  const setResultsBoth = useCallback((next: (PartResult | null)[]) => {
    resultsRef.current = next
    setResults(next)
  }, [])

  const commit = useCallback(
    (i: number, r: PartResult) => {
      const next = resultsRef.current.slice()
      next[i] = r
      setResultsBoth(next)
      setPhase('review')
    },
    [setResultsBoth],
  )

  /** Cancels any running flow (scripted typing, autopilot, TTS playback, live recording). */
  const cancelFlow = useCallback(() => {
    flowRef.current += 1
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    autoRef.current = false
    setAuto(false)
    const cur = S.current
    if (cur.phase === 'recording' && cur.source === 'live') rec.stop()
    if (cur.phase === 'playing') speech.cancel()
    // rec.stop and speech.cancel are stable callbacks
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rec.stop, speech.cancel])

  // Clean up on unmount.
  useEffect(
    () => () => {
      flowRef.current += 1
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  /** Types a scripted transcript word by word with simulated timing. Resolves false if cancelled. */
  const typeScripted = useCallback(
    (i: number, speed: number, token = flowRef.current): Promise<boolean> => {
      const it = COMM_ITEMS[i]
      const text = it.scripted[personaId]
      const sim = simulateSpeech(text)
      setSource('scripted')
      setDraft('')
      setElapsed(0)
      setPauses(0)
      setPhase('recording')
      return new Promise<boolean>((resolve) => {
        let k = 0
        let simMs = 0
        let p = 0
        const step = () => {
          timerRef.current = null
          if (flowRef.current !== token) return resolve(false)
          if (k >= sim.words.length) {
            commit(i, { text, ms: sim.totalMs, pauses: sim.pauses, source: 'scripted' })
            return resolve(true)
          }
          const w = sim.words[k]
          simMs += w.gapMs
          if (w.longPause) p += 1
          k += 1
          setDraft(sim.words.slice(0, k).map((x) => x.word).join(' '))
          setElapsed(simMs + SIM_WORD_MS)
          setPauses(p)
          const nxt = sim.words[k]
          timerRef.current = setTimeout(step, Math.max(40, (nxt ? nxt.gapMs : SIM_WORD_MS) / speed))
        }
        timerRef.current = setTimeout(step, 260)
      })
    },
    [personaId, commit],
  )

  /** Plays Part B's sentence through en-IN TTS (capped so a stuck voice never stalls the round). */
  const playPrompt = useCallback(
    async (token = flowRef.current, rate = 0.95): Promise<boolean> => {
      setPhase('playing')
      setPlays((n) => n + 1)
      await Promise.race([speech.speak(COMM_ITEMS[1].prompt, 'en', { rate }), sleep(7000)])
      if (flowRef.current !== token) return false
      setPhase('ready')
      return true
    },
    [speech],
  )

  const goTo = useCallback((i: number) => {
    setIdx(i)
    setPhase(resultsRef.current[i] ? 'review' : 'ready')
    setDraft('')
    setElapsed(0)
    setPauses(0)
    setNotice(null)
  }, [])

  // ---- live recording -----------------------------------------------------------------------
  const startScripted = useCallback(
    (i: number) => {
      cancelFlow()
      void typeScripted(i, MANUAL_SPEED[i] ?? 1.5)
    },
    [cancelFlow, typeScripted],
  )

  const startLive = useCallback(() => {
    cancelFlow()
    if (!rec.supported) {
      setNotice(micNotice('not-supported'))
      void typeScripted(S.current.idx, MANUAL_SPEED[S.current.idx] ?? 1.5)
      return
    }
    rec.reset()
    setNotice(null)
    setSource('live')
    setElapsed(0)
    setPauses(0)
    lastResultRef.current = null
    startedAtRef.current = performance.now()
    setPhase('recording')
    rec.start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancelFlow, typeScripted, rec.supported, rec.reset, rec.start])

  const stopLive = useCallback(() => {
    const cur = S.current
    if (cur.phase !== 'recording' || cur.source !== 'live') return
    const text = cur.liveText.trim()
    const ms = Math.max(1, performance.now() - startedAtRef.current)
    rec.stop()
    if (!text) {
      setNotice(NOTHING_HEARD)
      void typeScripted(cur.idx, MANUAL_SPEED[cur.idx] ?? 1.5, flowRef.current)
      return
    }
    commit(cur.idx, { text, ms, pauses: cur.pauses, source: 'live' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rec.stop, typeScripted, commit])

  const stopLiveRef = useRef(stopLive)
  stopLiveRef.current = stopLive

  // Elapsed timer and auto-stop at the part limit (live only; scripted typing drives its own clock).
  useEffect(() => {
    if (!isLive) return
    const id = setInterval(() => {
      const e = performance.now() - startedAtRef.current
      setElapsed(e)
      if (e >= COMM_ITEMS[S.current.idx].seconds * 1000) stopLiveRef.current()
    }, 200)
    return () => clearInterval(id)
  }, [isLive])

  // Long pauses: gaps of 1.2 s or more between recognition results.
  useEffect(() => {
    const cur = S.current
    if (cur.phase !== 'recording' || cur.source !== 'live') return
    const at = rec.lastResultAt
    if (at == null) return
    const prev = lastResultRef.current
    lastResultRef.current = at
    if (prev != null && at - prev >= 1200) setPauses((p) => p + 1)
  }, [rec.lastResultAt])

  // Fatal speech error while recording: fall back to the scripted answer for this part.
  useEffect(() => {
    if (!rec.error) return
    const cur = S.current
    if (cur.phase === 'recording' && cur.source === 'live') {
      setNotice(micNotice(rec.error))
      flowRef.current += 1
      void typeScripted(cur.idx, MANUAL_SPEED[cur.idx] ?? 1.5, flowRef.current)
    }
  }, [rec.error, typeScripted])

  // Part B: play the sentence automatically the first time the part opens (manual mode).
  useEffect(() => {
    if (stage !== 'parts' || idx !== 1 || phase !== 'ready' || plays > 0 || !tts || autoRef.current) return
    const id = setTimeout(() => {
      if (autoRef.current || S.current.phase !== 'ready' || S.current.idx !== 1) return
      void playPrompt(flowRef.current)
    }, 650)
    return () => clearTimeout(id)
  }, [stage, idx, phase, plays, tts, playPrompt])

  const beginScoring = useCallback(() => {
    // Safety: any part without an answer gets its scripted transcript.
    const filled = resultsRef.current.map((r, i) => r ?? scriptedResult(COMM_ITEMS[i], personaId))
    setResultsBoth(filled)
    setStage('scoring')
  }, [personaId, setResultsBoth])

  // ---- presenter events ---------------------------------------------------------------------
  const runAutopilot = useCallback(async () => {
    if (autoRef.current || S.current.stage !== 'parts') return
    cancelFlow()
    autoRef.current = true
    setAuto(true)
    const tok = flowRef.current
    try {
      for (let i = S.current.idx; i < COMM_ITEMS.length; i++) {
        if (flowRef.current !== tok) return
        if (resultsRef.current[i]) continue
        goTo(i)
        await sleep(380)
        if (flowRef.current !== tok) return
        if (i === 1 && tts) {
          const ok = await playPrompt(tok, 1.05)
          if (!ok) return
          await sleep(250)
        }
        const ok = await typeScripted(i, AUTO_SPEED[i] ?? 2, tok)
        if (!ok) return
        await sleep(950)
      }
      if (flowRef.current !== tok) return
      beginScoring()
    } finally {
      if (flowRef.current === tok) {
        autoRef.current = false
        setAuto(false)
      }
    }
  }, [cancelFlow, goTo, playPrompt, typeScripted, beginScoring, tts])

  // Handlers must be idempotent: AudioGate replays the event that opened it.
  useDemoEvent('autopilot', () => {
    void runAutopilot()
  })
  useDemoEvent('fastforward', () => {
    if (S.current.stage === 'result') return
    cancelFlow()
    const filled = resultsRef.current.map((r, i) => r ?? scriptedResult(COMM_ITEMS[i], personaId))
    setResultsBoth(filled)
    setIdx(COMM_ITEMS.length - 1)
    setPhase('review')
    setStage('result')
  })

  // ---- result ---------------------------------------------------------------------------------
  const versant = VERSANT_TARGETS[personaId] ?? 50
  const pillar = versantToPillar(versant)
  const core = isCoreBlueprint(blueprint?.id)

  const wroteRef = useRef(false)
  useEffect(() => {
    if (stage !== 'result' || wroteRef.current) return
    wroteRef.current = true
    setRound('communication', {
      status: 'cleared',
      score: pillar,
      detail: { versant, signalChip: `English fluency ${versant}/80` },
    })
    addSignal({
      round: 'communication',
      kind: 'gap',
      text: {
        en: `Spoken English fluency is the biggest gap (${versant}/80)`,
        hi: `अंग्रेज़ी बोलने का प्रवाह सबसे बड़ी कमी (${versant}/80)`,
      },
    })
  }, [stage, pillar, versant, setRound, addSignal])

  useEffect(() => {
    onDone?.(stage === 'result')
  }, [stage, onDone])

  // ---- render ---------------------------------------------------------------------------------
  const shownText = recording ? (source === 'live' ? liveText : draft) : (results[idx]?.text ?? '')
  const shownMs = recording ? elapsed : (results[idx]?.ms ?? 0)
  const shownPauses = recording ? pauses : (results[idx]?.pauses ?? 0)
  const wpm = shownMs >= 1500 ? wordsPerMinute(shownText, shownMs) : 0
  const wordCount = shownText ? shownText.split(/\s+/).filter(Boolean).length : 0
  const fillerCount = useMemo(() => (item.kind === 'open' ? countFillers(shownText).total : 0), [item.kind, shownText])
  const matched = useMemo(() => {
    if (item.kind === 'open') return '—'
    // Part B's sentence stays hidden until the answer is in, so its count is shown only in review.
    if (item.kind === 'repeat' && phase !== 'review') return '—'
    if (!shownText) return '—'
    const a = accuracy(item.prompt, shownText)
    return `${a.ok}/${a.total}`
  }, [item.kind, item.prompt, phase, shownText])

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 sm:space-y-5">
      <Stepper idx={idx} phase={phase} stage={stage} />

      {auto && stage === 'parts' && (
        <div className="flex items-center gap-2 rounded-lg border border-violet-400/25 bg-violet-500/[0.07] px-3 py-2 text-[12.5px] text-violet-200">
          <Sparkles className="h-3.5 w-3.5 text-violet-300" aria-hidden />
          <Tr b={TXT.autopilot} />
        </div>
      )}

      {stage === 'parts' && (
        <div key={item.id} className="os-rise space-y-4 sm:space-y-5">
          <PartCard
            item={item}
            phase={phase}
            source={source}
            shownText={shownText}
            tts={tts}
            plays={plays}
            voiceMode={voiceMode}
            disabled={auto}
            onPlay={() => {
              cancelFlow()
              void playPrompt(flowRef.current)
            }}
          />

          <RecorderCard
            item={item}
            phase={phase}
            source={source}
            voiceMode={voiceMode}
            micLevel={micLevel}
            elapsed={shownMs}
            wpm={wpm}
            pauses={shownPauses}
            words={wordCount}
            fillers={fillerCount}
            matched={matched}
            notice={notice}
            disabled={auto}
            needsListen={item.kind === 'repeat' && tts && plays === 0}
            isLast={idx === COMM_ITEMS.length - 1}
            onRecord={() => (voiceMode === 'scripted' ? startScripted(idx) : startLive())}
            onStop={stopLive}
            onScripted={() => startScripted(idx)}
            onRetry={() => {
              cancelFlow()
              const next = resultsRef.current.slice()
              next[idx] = null
              setResultsBoth(next)
              setDraft('')
              setElapsed(0)
              setPauses(0)
              setNotice(null)
              setPhase('ready')
            }}
            onNext={() => (idx < COMM_ITEMS.length - 1 ? goTo(idx + 1) : beginScoring())}
          />

          <TranscriptCard item={item} phase={phase} source={source} text={shownText} />
        </div>
      )}

      {stage === 'scoring' && (
        <div className="os-rise mx-auto max-w-xl py-4">
          <AgentLog title={TXT.scoringTitle} steps={SCORING_STEPS} stepMs={430} onDone={() => setStage('result')} />
        </div>
      )}

      {stage === 'result' && (
        <ResultView
          versant={versant}
          pillar={pillar}
          core={core}
          results={results}
          gender={persona.gender}
          lang={lang}
          t={t}
          personaId={personaId}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stepper
// ---------------------------------------------------------------------------

function Stepper({ idx, phase, stage }: { idx: number; phase: Phase; stage: Stage }) {
  const steps = [...COMM_ITEMS.map((it) => ({ key: it.id, label: it.step, Icon: PART_ICON[it.kind] })), { key: 'R', label: TXT.result, Icon: Gauge }]
  return (
    <ol className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2" aria-label="Round 3 parts">
      {steps.map((s, i) => {
        const isResult = i === steps.length - 1
        let state: 'done' | 'current' | 'todo'
        if (isResult) state = stage === 'parts' ? 'todo' : stage === 'result' ? 'done' : 'current'
        else if (stage !== 'parts' || i < idx) state = 'done'
        else if (i === idx) state = phase === 'review' ? 'done' : 'current'
        else state = 'todo'
        const current = !isResult ? stage === 'parts' && i === idx : stage !== 'parts'
        return (
          <li
            key={s.key}
            aria-current={current ? 'step' : undefined}
            className={cn(
              'relative flex min-w-0 items-center gap-2 rounded-xl border px-2 py-2 transition-colors duration-300 sm:px-3',
              current
                ? 'border-cyan-400/40 bg-cyan-400/[0.07] shadow-[0_0_24px_-10px_rgba(34,211,238,0.7)]'
                : state === 'done'
                  ? 'border-emerald-400/20 bg-emerald-400/[0.04]'
                  : 'border-white/[0.07] bg-white/[0.02]',
            )}
          >
            <span
              className={cn(
                'grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-semibold',
                state === 'done'
                  ? 'bg-emerald-400/15 text-emerald-300'
                  : current
                    ? 'bg-cyan-400/15 text-cyan-200'
                    : 'bg-white/[0.05] text-gray-500',
              )}
            >
              {state === 'done' ? <Check className="h-3.5 w-3.5" aria-hidden /> : <s.Icon className="h-3.5 w-3.5" aria-hidden />}
            </span>
            <span className="min-w-0">
              <Tr
                b={isResult ? { en: 'Round 3', hi: 'राउंड 3' } : { en: `Part ${s.key}`, hi: `भाग ${s.key}` }}
                className="block text-[12px] font-semibold leading-none text-gray-500"
              />
              <Tr
                b={s.label}
                className={cn(
                  'mt-1 block truncate text-[12px] font-medium leading-tight sm:text-[13px]',
                  current ? 'text-white' : state === 'done' ? 'text-gray-300' : 'text-gray-500',
                )}
              />
            </span>
          </li>
        )
      })}
    </ol>
  )
}

// ---------------------------------------------------------------------------
// Target card (what to read / hear / answer)
// ---------------------------------------------------------------------------

function PartCard({
  item,
  phase,
  source,
  shownText,
  tts,
  plays,
  voiceMode,
  disabled,
  onPlay,
}: {
  item: CommItem
  phase: Phase
  source: Source
  shownText: string
  tts: boolean
  plays: number
  voiceMode: 'live' | 'scripted'
  disabled: boolean
  onPlay: () => void
}) {
  const Icon = PART_ICON[item.kind]
  const { lang } = useDemo()
  const review = phase === 'review'
  const hiddenSentence = item.kind === 'repeat' && tts && !review

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-cyan-400/[0.07] blur-3xl"
      />
      <div className="relative flex flex-wrap items-center gap-2 border-b border-white/[0.06] px-4 py-3 sm:px-5">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500/20 to-emerald-500/20 ring-1 ring-cyan-400/25">
          <Icon className="h-4 w-4 text-cyan-200" aria-hidden />
        </span>
        <Tr b={item.title} as="h2" className="flex-1 text-[15px] font-semibold text-white" />
        <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 text-[12px] text-gray-300">
          <Timer className="h-3.5 w-3.5 text-gray-400" aria-hidden />
          {item.seconds}s
        </span>
        <span
          className={cn(
            'inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12px]',
            voiceMode === 'scripted'
              ? 'border-amber-400/30 bg-amber-400/[0.06] text-amber-200'
              : 'border-emerald-400/25 bg-emerald-400/[0.06] text-emerald-200',
          )}
        >
          {voiceMode === 'scripted' ? <Keyboard className="h-3.5 w-3.5" aria-hidden /> : <Mic className="h-3.5 w-3.5" aria-hidden />}
          <Tr b={voiceMode === 'scripted' ? TXT.scriptedMode : TXT.liveMic} />
        </span>
      </div>

      <div className="relative px-4 py-5 sm:px-6 sm:py-6">
        <Tr b={item.instruction} as="p" className="max-w-2xl text-[13.5px] leading-relaxed text-gray-400" />

        <div className="mt-4 rounded-xl border border-white/[0.07] bg-black/25 px-4 py-5 sm:px-6 sm:py-6">
          {item.kind === 'read' && (
            <DiffSentence reference={item.prompt} spoken={shownText} final={review} />
          )}

          {item.kind === 'repeat' &&
            (hiddenSentence ? (
              <div className="flex flex-col items-center gap-4 py-2 text-center sm:flex-row sm:text-left">
                <div className="relative shrink-0">
                  <AIOrb state={phase === 'playing' ? 'speaking' : 'idle'} size={72} label="" />
                </div>
                <div className="min-w-0 flex-1">
                  {phase === 'playing' ? (
                    <div className="flex flex-col items-center gap-2 sm:items-start">
                      <Tr b={TXT.playing} className="text-[14px] font-medium text-cyan-200" />
                      <Waveform active tone="ai" bars={28} className="h-8" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-2 text-[14px] text-gray-300 sm:justify-start">
                        <EyeOff className="h-4 w-4 text-gray-500" aria-hidden />
                        <Tr b={plays === 0 ? TXT.listenFirst : TXT.hidden} />
                      </div>
                      <div aria-hidden className="mt-3 flex flex-wrap items-center justify-center gap-1.5 blur-[1.5px] sm:justify-start">
                        {[46, 30, 58, 40, 64, 34, 52, 44].map((w, i) => (
                          <span key={i} className="h-3.5 rounded bg-white/[0.12]" style={{ width: w }} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className="shrink-0">
                  {phase !== 'playing' && phase !== 'recording' && plays < 2 && (
                    <button
                      type="button"
                      onClick={onPlay}
                      disabled={disabled}
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-400/[0.08] px-3.5 text-[13px] font-semibold text-cyan-100 transition-colors hover:bg-cyan-400/15 disabled:opacity-50"
                    >
                      {plays === 0 ? <Play className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
                      <Tr b={plays === 0 ? TXT.play : TXT.replay} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {!tts && !review && (
                  <p className="mb-3 text-[12.5px] text-amber-200/90">
                    <Tr b={TXT.noTts} />
                  </p>
                )}
                {review && <Tr b={TXT.sentenceWas} as="p" className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-500" />}
                <DiffSentence reference={item.prompt} spoken={shownText} final={review} />
              </div>
            ))}

          {item.kind === 'open' && (
            <div className="flex items-start gap-3">
              <span className="mt-1 hidden h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-500/15 ring-1 ring-violet-400/30 sm:grid">
                <Sparkles className="h-4 w-4 text-violet-200" aria-hidden />
              </span>
              <div className="min-w-0">
                <p lang="en" className="text-[21px] font-semibold leading-snug tracking-tight text-white sm:text-[25px]">
                  {item.prompt}
                </p>
                {lang !== 'en' && item.promptHi && (
                  <p lang="hi" className="font-deva mt-1.5 text-[14px] text-gray-400">
                    {item.promptHi}
                  </p>
                )}
                <p className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] text-gray-500">
                  <Timer className="h-3.5 w-3.5" aria-hidden />
                  <Tr b={TXT.speakFor} />
                </p>
              </div>
            </div>
          )}
        </div>
        {source === 'live' && phase === 'recording' && item.kind === 'read' && (
          <p className="mt-2 text-[12px] text-gray-500">
            <Tr b={{ en: 'Green = heard. Missed words turn red when you stop.', hi: 'हरा = सुना गया। रुकने पर छूटे शब्द लाल हो जाएँगे।', hinglish: 'Green = suna gaya. Stop karne par chhoote words red ho jaayenge.' }} />
          </p>
        )}
      </div>
    </section>
  )
}

function DiffSentence({ reference, spoken, final }: { reference: string; spoken: string; final: boolean }) {
  const words = useMemo(() => diffWords(reference, cleanSpoken(spoken)), [reference, spoken])
  return (
    <p lang="en" className="text-[21px] font-semibold leading-[1.6] tracking-tight sm:text-[25px]">
      {words.map((w, i) => (
        <span key={`${i}-${w.word}`}>
          {i > 0 && ' '}
          <span
            className={cn(
              'rounded-md px-0.5 transition-colors duration-300',
              w.ok
                ? 'bg-emerald-400/[0.12] text-emerald-300'
                : final
                  ? 'bg-rose-500/[0.08] text-rose-300/90 line-through decoration-rose-400 decoration-2'
                  : 'text-gray-200',
            )}
          >
            {w.word}
          </span>
        </span>
      ))}
    </p>
  )
}

// ---------------------------------------------------------------------------
// Recorder card
// ---------------------------------------------------------------------------

function RecorderCard({
  item,
  phase,
  source,
  voiceMode,
  micLevel,
  elapsed,
  wpm,
  pauses,
  words,
  fillers,
  matched,
  notice,
  disabled,
  needsListen,
  isLast,
  onRecord,
  onStop,
  onScripted,
  onRetry,
  onNext,
}: {
  item: CommItem
  phase: Phase
  source: Source
  voiceMode: 'live' | 'scripted'
  micLevel: number
  elapsed: number
  wpm: number
  pauses: number
  words: number
  fillers: number
  matched: string
  notice: Bi | null
  disabled: boolean
  needsListen: boolean
  isLast: boolean
  onRecord: () => void
  onStop: () => void
  onScripted: () => void
  onRetry: () => void
  onNext: () => void
}) {
  const recording = phase === 'recording'
  const review = phase === 'review'
  const live = recording && source === 'live'
  const limit = item.seconds * 1000
  const pct = Math.min(100, (elapsed / limit) * 100)
  const canRecord = !disabled && !needsListen && (phase === 'ready' || phase === 'review')

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-center gap-4">
        {/* Record / stop */}
        {!review && (
          <div className="relative shrink-0">
            {live && (
              <span aria-hidden className="pulse-ring pointer-events-none absolute inset-0 rounded-full border-2 border-rose-400/70" />
            )}
            {recording ? (
              <button
                type="button"
                onClick={live ? onStop : undefined}
                disabled={!live || disabled}
                aria-label="Stop recording"
                className={cn(
                  'relative grid h-16 w-16 place-items-center rounded-full transition-transform',
                  live
                    ? 'bg-rose-500 text-white shadow-[0_0_30px_-4px_rgba(244,63,94,0.8)] hover:scale-105'
                    : 'bg-violet-500/80 text-white shadow-[0_0_30px_-6px_rgba(139,92,246,0.8)]',
                )}
              >
                {live ? <Square className="h-6 w-6 fill-current" aria-hidden /> : <Keyboard className="h-6 w-6" aria-hidden />}
              </button>
            ) : (
              <button
                type="button"
                onClick={onRecord}
                disabled={!canRecord}
                aria-label="Record answer"
                className="relative grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-blue-400 via-cyan-300 to-emerald-400 text-[#031018] shadow-[0_12px_36px_-10px_rgba(34,211,238,0.9)] transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                {voiceMode === 'scripted' ? <Wand2 className="h-6 w-6" aria-hidden /> : <Mic className="h-7 w-7" aria-hidden />}
              </button>
            )}
          </div>
        )}

        <div className="min-w-0 flex-1">
          {review ? (
            <div className="flex items-center gap-2 text-[14px] font-semibold text-emerald-300">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-400/15">
                <Check className="h-4 w-4" aria-hidden />
              </span>
              <Tr b={{ en: `Part ${item.id} captured`, hi: `भाग ${item.id} दर्ज`, hinglish: `Part ${item.id} captured` }} />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Waveform active={recording} level={live ? micLevel : undefined} bars={30} tone={recording && !live ? 'violet' : 'ai'} className="h-10" />
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-gray-200">
                  {recording ? (
                    <Tr b={live ? TXT.listening : TXT.typing} />
                  ) : needsListen ? (
                    <Tr b={TXT.listenFirst} />
                  ) : (
                    <Tr b={voiceMode === 'scripted' ? TXT.playScripted : TXT.record} />
                  )}
                </p>
                <p className="font-mono text-[13px] tabular-nums text-gray-400">
                  {fmtClock(elapsed)} / {fmtClock(limit)}
                </p>
              </div>
            </div>
          )}
          <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={cn(
                'h-full rounded-full bg-gradient-to-r transition-[width] duration-200 ease-linear',
                review ? 'from-emerald-400 to-emerald-300' : 'from-blue-400 via-cyan-300 to-emerald-400',
              )}
              style={{ width: `${review ? Math.max(pct, 100) : pct}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {review ? (
            <>
              <button
                type="button"
                onClick={onRetry}
                disabled={disabled}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-[13px] font-medium text-gray-300 transition-colors hover:border-white/25 hover:text-white disabled:opacity-40"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                <Tr b={TXT.retry} />
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={disabled}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 px-4 text-[14px] font-semibold text-white shadow-[0_8px_24px_-10px_rgba(34,211,238,0.8)] transition-[filter] hover:brightness-110 disabled:opacity-50 sm:flex-none"
              >
                <Tr b={isLast ? TXT.getScore : TXT.nextPart} />
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </>
          ) : (
            voiceMode === 'live' &&
            !recording && (
              <button
                type="button"
                onClick={onScripted}
                disabled={disabled || needsListen}
                className="h-9 rounded-md px-2 text-[12.5px] text-gray-400 underline decoration-gray-600 underline-offset-2 transition-colors hover:text-gray-100 disabled:opacity-40"
              >
                <Tr b={TXT.useScripted} />
              </button>
            )
          )}
        </div>
      </div>

      {/* Live metrics */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric icon={Gauge} label={TXT.wpm} value={wpm > 0 ? String(wpm) : '—'} hint={wpm > 0 ? (wpm < 105 ? 'slow' : wpm > 165 ? 'fast' : 'ok') : undefined} />
        <Metric icon={PauseCircle} label={TXT.pauses} value={String(pauses)} />
        <Metric icon={MessageSquareText} label={TXT.words} value={String(words)} />
        {item.kind === 'open' ? (
          <Metric icon={Sparkles} label={TXT.fillers} value={String(fillers)} hint={fillers > 0 ? 'warn' : undefined} />
        ) : (
          <Metric
            icon={Check}
            label={{ en: 'Words matched', hi: 'मिले शब्द', hinglish: 'Words matched' }}
            value={matched}
          />
        )}
      </div>

      {notice && (
        <p className="mt-3 rounded-lg border border-amber-400/25 bg-amber-400/[0.06] px-3 py-2 text-[12.5px] text-amber-100">
          <Tr b={notice} />
        </p>
      )}
    </section>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon
  label: Bi
  value: string
  hint?: 'slow' | 'fast' | 'ok' | 'warn'
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-black/20 px-3 py-2">
      <Icon
        className={cn(
          'h-4 w-4 shrink-0',
          hint === 'warn' || hint === 'slow' || hint === 'fast' ? 'text-amber-300' : hint === 'ok' ? 'text-emerald-300' : 'text-gray-500',
        )}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-[18px] font-semibold leading-none tabular-nums text-white">{value}</p>
        <Tr b={label} className="mt-1 block truncate text-[12px] leading-none text-gray-500" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Transcript card
// ---------------------------------------------------------------------------

function TranscriptCard({ item, phase, source, text }: { item: CommItem; phase: Phase; source: Source; text: string }) {
  const recording = phase === 'recording'
  const review = phase === 'review'
  const segs = useMemo(() => (item.kind === 'open' ? markFillers(text) : []), [item.kind, text])
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 sm:px-5">
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            recording ? (source === 'live' ? 'animate-pulse bg-rose-400' : 'animate-pulse bg-violet-400') : review ? 'bg-emerald-400' : 'bg-gray-600',
          )}
          aria-hidden
        />
        <Tr b={review ? TXT.youSaid : TXT.transcript} className="text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-400" />
        {(recording || review) && (
          <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[12px] text-gray-500">
            <Tr b={source === 'live' ? TXT.live : TXT.scripted} />
          </span>
        )}
      </div>
      {text ? (
        <p lang="en" className="min-h-[3.2em] text-[15px] leading-relaxed text-gray-100">
          {item.kind === 'open'
            ? segs.map((s, i) =>
                s.filler ? (
                  <mark
                    key={i}
                    className="rounded bg-amber-400/15 px-0.5 text-amber-200 underline decoration-amber-400 decoration-2 underline-offset-4"
                  >
                    {s.text}
                  </mark>
                ) : (
                  <span key={i}>{s.text}</span>
                ),
              )
            : text}
          {recording && (
            <span aria-hidden className="caret-blink ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.18em] rounded-full bg-cyan-300" />
          )}
        </p>
      ) : (
        <p className="min-h-[3.2em] text-[14px] italic text-gray-500">
          <Tr b={TXT.waiting} />
        </p>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Result
// ---------------------------------------------------------------------------

function ResultView({
  versant,
  pillar,
  core,
  results,
  gender,
  lang,
  t,
  personaId,
}: {
  versant: number
  pillar: number
  core: boolean
  results: (PartResult | null)[]
  gender: 'F' | 'M'
  lang: 'en' | 'hi' | 'hinglish'
  t: (b: Bi | string | null | undefined) => string
  personaId: 'priya' | 'rahul'
}) {
  const subs = VERSANT_SUBSCORES[personaId]
  const [grow, setGrow] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setGrow(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const a = results[0] ?? scriptedResult(COMM_ITEMS[0], personaId)
  const b = results[1] ?? scriptedResult(COMM_ITEMS[1], personaId)
  const c = results[2] ?? scriptedResult(COMM_ITEMS[2], personaId)
  const accA = accuracy(COMM_ITEMS[0].prompt, a.text)
  const accB = accuracy(COMM_ITEMS[1].prompt, b.text)
  const fill = useMemo(() => countFillers(c.text), [c.text])
  const wpmC = wordsPerMinute(c.text, c.ms)
  const met = versant >= COMM_CUTOFF

  // ---- computed coaching tip (fix 27): from the Part C transcript ----
  const tip = useMemo<{ hi: string; hinglish: string; en: string }>(() => {
    const basically = fill.byWord.basically ?? 0
    let label = 'basically'
    let n = basically
    if (n === 0) {
      // another filler, if any (top count)
      const top = Object.entries(fill.byWord).sort((x, y) => y[1] - x[1])[0]
      if (top && top[1] > 0) {
        label = top[0]
        n = top[1]
      }
    }
    const verbHl = bySex(gender, 'bolti', 'bolte')
    const verbHi = bySex(gender, 'बोलती', 'बोलते')
    if (n > 0) {
      return {
        hinglish: `Aap '${label}' ${n} baar ${verbHl} hain — har vakya ke baad 1 second rukiye.`,
        hi: `आप '${label}' ${n} बार ${verbHi} हैं — हर वाक्य के बाद 1 सेकंड रुकिए।`,
        en: `You said '${label}' ${n} ${n === 1 ? 'time' : 'times'}: pause for 1 second after each sentence instead.`,
      }
    }
    const speaking = bySex(gender, 'bol rahi', 'bol rahe')
    const speakingHi = bySex(gender, 'बोल रही', 'बोल रहे')
    if (wpmC > 0 && wpmC < 105) {
      return {
        hinglish: `Aap ${wpmC} WPM par ${speaking} hain — 120-140 WPM ka lakshya rakhiye: chhote vakya, saaf shuruaat.`,
        hi: `आप ${wpmC} WPM पर ${speakingHi} हैं — 120-140 WPM का लक्ष्य रखिए: छोटे वाक्य, साफ़ शुरुआत।`,
        en: `You spoke at ${wpmC} WPM: aim for 120-140 WPM with short sentences and a clear start.`,
      }
    }
    if (wpmC > 165) {
      return {
        hinglish: `Aap ${wpmC} WPM par ${speaking} hain — thoda dheere boliye, har vakya ke baad 1 second rukiye.`,
        hi: `आप ${wpmC} WPM पर ${speakingHi} हैं — थोड़ा धीरे बोलिए, हर वाक्य के बाद 1 सेकंड रुकिए।`,
        en: `You spoke at ${wpmC} WPM: slow down a little and pause for 1 second after each sentence.`,
      }
    }
    return {
      hinglish: `Speed achhi hai (${wpmC} WPM). Ab har vakya ek clear point se shuru kijiye — fluency khud badhegi.`,
      hi: `गति अच्छी है (${wpmC} WPM)। अब हर वाक्य एक साफ़ बात से शुरू कीजिए — प्रवाह अपने-आप बढ़ेगा।`,
      en: `Good pace (${wpmC} WPM). Now start each sentence with one clear point and fluency will follow.`,
    }
  }, [fill, gender, wpmC])

  const tipText = lang === 'hi' ? tip.hi : tip.hinglish
  const fillerList = Object.entries(fill.byWord)
    .map(([k, v]) => `${k} ×${v}`)
    .join(', ')

  const evidence: Bi[] = [
    {
      en: `Read aloud: ${accA.ok}/${accA.total} words matched${accA.missed.length ? ` (missed: ${accA.missed.join(', ')})` : ''}`,
      hi: `पढ़कर बोलना: ${accA.ok}/${accA.total} शब्द मिले${accA.missed.length ? ` (छूटे: ${accA.missed.join(', ')})` : ''}`,
    },
    {
      en: `Listen & repeat: ${accB.ok}/${accB.total} words matched${accB.missed.length ? ` (missed: ${accB.missed.join(', ')})` : ''}`,
      hi: `सुनकर दोहराना: ${accB.ok}/${accB.total} शब्द मिले${accB.missed.length ? ` (छूटे: ${accB.missed.join(', ')})` : ''}`,
    },
    {
      en: `Open answer: ${wpmC} WPM, ${c.pauses} long ${c.pauses === 1 ? 'pause' : 'pauses'}, fillers: ${fillerList || 'none'}`,
      hi: `खुला उत्तर: ${wpmC} WPM, ${c.pauses} लंबे ठहराव, फ़िलर: ${fillerList || 'कोई नहीं'}`,
    },
    {
      en: `Subscores: Pronunciation ${subs.pronunciation} · Fluency ${subs.fluency} · Sentence mastery ${subs.sentenceMastery} · Vocabulary ${subs.vocabulary}`,
      hi: `उप-स्कोर: उच्चारण ${subs.pronunciation} · प्रवाह ${subs.fluency} · वाक्य-निपुणता ${subs.sentenceMastery} · शब्दावली ${subs.vocabulary}`,
    },
  ]

  const cutoff: { text: Bi; tone: 'ok' | 'amber' | 'rose' } = core
    ? met
      ? {
          text: { en: `Cutoff ${COMM_CUTOFF}: met · advisory for this drive`, hi: `कटऑफ़ ${COMM_CUTOFF}: पूरा · इस ड्राइव के लिए सलाहकारी` },
          tone: 'ok',
        }
      : {
          text: {
            en: `Cutoff ${COMM_CUTOFF}: not met · advisory for this drive, not eliminatory`,
            hi: `कटऑफ़ ${COMM_CUTOFF}: पूरा नहीं · इस ड्राइव के लिए सलाहकारी, बाहर करने वाला नहीं`,
          },
          tone: 'amber',
        }
    : met
      ? {
          text: {
            en: `Cutoff ${COMM_CUTOFF} (communication-eliminatory pattern): met, just`,
            hi: `कटऑफ़ ${COMM_CUTOFF} (संवाद-निर्णायक पैटर्न): पूरा, बस मुश्किल से`,
          },
          tone: 'ok',
        }
      : {
          text: {
            en: `Cutoff ${COMM_CUTOFF} (communication-eliminatory pattern): not met · practice plan added`,
            hi: `कटऑफ़ ${COMM_CUTOFF} (संवाद-निर्णायक पैटर्न): पूरा नहीं · अभ्यास योजना जोड़ी गई`,
          },
          tone: 'rose',
        }

  const pos = (v: number) => `${Math.min(100, Math.max(0, ((v - 20) / 60) * 100))}%`
  const gapSignal: Bi = {
    en: `Spoken English fluency is the biggest gap (${versant}/80)`,
    hi: `अंग्रेज़ी बोलने का प्रवाह सबसे बड़ी कमी (${versant}/80)`,
  }

  return (
    <div className="os-rise space-y-4 sm:space-y-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        {/* Overall */}
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <div aria-hidden className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-cyan-400/[0.10] blur-3xl" />
          <div className="relative">
            <Tr b={TXT.versantScore} className="text-[12px] font-semibold uppercase tracking-[0.14em] text-gray-400" />
            <div className="mt-2 flex items-end gap-2">
              <CountUp value={versant} from={20} durationMs={1100} className="ai-gradient-text text-[64px] font-bold leading-none tracking-tight" />
              <span className="pb-2 text-[26px] font-semibold text-gray-500">/80</span>
            </div>
            <Tr b={TXT.scale} className="mt-1 block text-[12px] text-gray-500" />

            {/* 20-80 scale with cutoff marker */}
            <div className="relative mt-5 h-3 rounded-full bg-white/[0.06]">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 transition-[width] duration-1000 ease-out"
                style={{ width: grow ? pos(versant) : '0%' }}
              />
              <div className="absolute -top-1.5 bottom-[-6px] w-0.5 rounded bg-amber-300" style={{ left: pos(COMM_CUTOFF) }} aria-hidden />
            </div>
            <div className="relative mt-1.5 h-4 text-[12px] tabular-nums text-gray-500">
              <span className="absolute left-0">20</span>
              <span className="absolute -translate-x-1/2 text-amber-300" style={{ left: pos(COMM_CUTOFF) }}>
                {COMM_CUTOFF}
              </span>
              <span className="absolute right-0">80</span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/[0.07] px-3 text-[12.5px] font-medium text-cyan-100">
                <Tr b={TXT.pillar} />
                <span className="font-semibold tabular-nums text-white">{pillar}/100</span>
              </span>
              <span
                className={cn(
                  'inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px] font-medium',
                  cutoff.tone === 'ok'
                    ? 'border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-200'
                    : cutoff.tone === 'amber'
                      ? 'border-amber-400/35 bg-amber-400/[0.08] text-amber-200'
                      : 'border-rose-400/35 bg-rose-400/[0.08] text-rose-200',
                )}
              >
                {cutoff.tone === 'ok' ? <Check className="h-3.5 w-3.5 shrink-0" aria-hidden /> : <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden />}
                <Tr b={cutoff.text} />
              </span>
            </div>
          </div>
        </section>

        {/* Subscores */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <Tr b={TXT.subscores} className="text-[12px] font-semibold uppercase tracking-[0.14em] text-gray-400" />
            <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-500">
              <span className="h-2.5 w-0.5 rounded bg-amber-300" aria-hidden />
              <Tr b={TXT.cutoffLine} /> {COMM_CUTOFF}
            </span>
          </div>
          <ul className="mt-4 space-y-4">
            {SUBSCORE_KEYS.map((k, i) => {
              const v = subs[k]
              return (
                <li key={k}>
                  <div className="flex items-baseline justify-between gap-2">
                    <Tr b={SUBSCORE_LABELS[k]} className="text-[13.5px] font-medium text-gray-200" />
                    <span className="text-[15px] font-semibold tabular-nums text-white">
                      <CountUp value={v} from={20} durationMs={900 + i * 120} />
                      <span className="text-[12px] font-normal text-gray-500">/80</span>
                    </span>
                  </div>
                  <div className="relative mt-1.5 h-2.5 rounded-full bg-white/[0.06]">
                    <div
                      className={cn(
                        'absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ease-out',
                        v >= COMM_CUTOFF ? 'from-cyan-400 to-emerald-400' : 'from-amber-500 to-amber-300',
                      )}
                      style={{ width: grow ? pos(v) : '0%', transition: `width ${900 + i * 120}ms cubic-bezier(0.16,1,0.3,1)` }}
                    />
                    <div className="absolute -top-1 bottom-[-4px] w-0.5 rounded bg-amber-300/80" style={{ left: pos(COMM_CUTOFF) }} aria-hidden />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      {/* AI coaching tip, computed from the Part C transcript */}
      <InsightCard
        severity="info"
        title={TXT.tipTitle}
        body={tipText}
        evidence={evidence}
        confidence={0.84}
        actionLabel={TXT.tipAction}
        onAction={() =>
          aiToast(t({ en: 'Added to your 30-day plan', hi: 'आपकी 30-दिन की योजना में जोड़ा गया' }), {
            tone: 'ai',
            description: t({ en: 'Versant-style drills · 20 min/day', hi: 'Versant-शैली अभ्यास · 20 मिनट/दिन' }),
          })
        }
      >
        {lang === 'en' && <p className="text-[12.5px] leading-snug text-gray-500">{tip.en}</p>}
      </InsightCard>

      {/* Signal written */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/[0.06] px-3.5 py-2.5">
        <NotebookPen className="h-4 w-4 shrink-0 text-violet-300" aria-hidden />
        <Tr b={TXT.signalWritten} className="text-[12px] font-semibold uppercase tracking-[0.12em] text-violet-300" />
        <Tr b={gapSignal} className="min-w-0 text-[13.5px] text-violet-50" />
      </div>

      <p className="text-[12px] leading-snug text-gray-500">
        <Tr b={TXT.measured} />
      </p>
    </div>
  )
}
