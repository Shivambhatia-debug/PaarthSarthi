'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Factory,
  Loader2,
  Mic,
  Send,
  ShieldCheck,
  Sparkles,
  Square,
  Wand2,
  XCircle,
} from 'lucide-react'
import { useDemo, useDemoEvent } from '@/lib/os/demo-store'
import { detectKeywords } from '@/lib/ai-sim'
import { useSpeechRecognition } from '@/hooks/use-speech'
import { tr, type Bi } from '@/lib/os/i18n'
import { AISurface } from '@/components/ai/ai-surface'
import { AIThinking } from '@/components/ai/ai-thinking'
import { StreamingText } from '@/components/ai/streaming-text'
import { aiToast } from '@/components/ai/ai-toast'
import { Tr } from '@/components/os/tr-text'
import { cn } from '@/lib/utils'
import type { CoreCase, CoreMcq, CoreTrack, CoreTrackId, RubricCheck } from '@/components/placement/technical/core-items'
import { DrawingOption, EngineeringDrawing } from '@/components/placement/technical/engineering-drawing'
import { ScoreCard, type ScoreChip } from '@/components/placement/technical/score-card'

// -----------------------------------------------------------------------------
// Copy
// -----------------------------------------------------------------------------

const T = {
  q: { en: 'Question', hi: 'प्रश्न', hinglish: 'Question' },
  prev: { en: 'Previous', hi: 'पिछला', hinglish: 'Previous' },
  next: { en: 'Next', hi: 'अगला', hinglish: 'Next' },
  toCase: { en: 'Go to shop-floor case', hi: 'शॉप-फ़्लोर केस पर जाएँ', hinglish: 'Shop-floor case par chalo' },
  finishMcq: { en: 'Finish section', hi: 'सेक्शन पूरा करें', hinglish: 'Section finish karo' },
  pickFront: { en: 'Pick the correct FRONT view', hi: 'सही फ़्रंट व्यू चुनें', hinglish: 'Sahi FRONT view chuno' },
  caseTitle: { en: 'Shop-floor case', hi: 'शॉप-फ़्लोर केस', hinglish: 'Shop-floor case' },
  caseHint: {
    en: 'Answer in Hindi, Hinglish or English. Sarthi scores the engineering content, not the language.',
    hi: 'हिंदी, हिंग्लिश या अंग्रेज़ी में उत्तर दें। सारथी इंजीनियरिंग समझ को अंक देता है, भाषा को नहीं।',
    hinglish: 'Hindi, Hinglish ya English mein jawab do. Sarthi engineering content ko score karta hai, language ko nahi.',
  },
  placeholder: {
    en: 'Type or speak your answer… e.g. first stop the machine, then…',
    hi: 'उत्तर लिखें या बोलें… जैसे पहले मशीन बंद करके…',
    hinglish: 'Jawab likho ya bolo… jaise pehle machine band karke…',
  },
  mic: { en: 'Answer by voice', hi: 'बोलकर उत्तर दें', hinglish: 'Bolkar jawab do' },
  micStop: { en: 'Stop', hi: 'रोकें', hinglish: 'Stop' },
  listening: { en: 'Listening in Hindi…', hi: 'हिंदी में सुन रहा है…', hinglish: 'Hindi mein sun raha hai…' },
  scripted: { en: 'Use scripted answer', hi: 'स्क्रिप्टेड उत्तर लें', hinglish: 'Scripted answer use karo' },
  submit: { en: 'Submit answer', hi: 'उत्तर सबमिट करें', hinglish: 'Answer submit karo' },
  evaluating: { en: 'Sarthi is checking your root-cause order…', hi: 'सारथी आपके मूल-कारण क्रम की जाँच कर रहा है…', hinglish: 'Sarthi aapka root-cause order check kar raha hai…' },
  rubric: { en: 'Rubric', hi: 'रूब्रिक', hinglish: 'Rubric' },
  model: { en: 'Model answer', hi: 'आदर्श उत्तर', hinglish: 'Model answer' },
  review: { en: 'MCQ review', hi: 'MCQ समीक्षा', hinglish: 'MCQ review' },
  explains: { en: 'Sarthi explains', hi: 'सारथी समझाता है', hinglish: 'Sarthi samjhata hai' },
  yours: { en: 'Your answer', hi: 'आपका उत्तर', hinglish: 'Your answer' },
  correctIs: { en: 'Correct', hi: 'सही', hinglish: 'Correct' },
  answered: { en: 'MCQs answered', hi: 'MCQ के उत्तर दिए', hinglish: 'MCQs answered' },
  micOff: {
    en: 'Voice is in scripted mode here. Use the scripted answer or type.',
    hi: 'यहाँ आवाज़ स्क्रिप्टेड मोड में है। स्क्रिप्टेड उत्तर लें या टाइप करें।',
    hinglish: 'Yahan voice scripted mode mein hai. Scripted answer lo ya type karo.',
  },
  micNA: {
    en: 'Speech recognition is not available in this browser. Type or use the scripted answer.',
    hi: 'इस ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं है। टाइप करें या स्क्रिप्टेड उत्तर लें।',
    hinglish: 'Is browser mein speech recognition nahi hai. Type karo ya scripted answer lo.',
  },
  scoredBy: { en: 'Core technical · scored by Sarthi AI', hi: 'कोर तकनीकी · सारथी AI द्वारा स्कोर', hinglish: 'Core technical · Sarthi AI ne score kiya' },
  weighted: {
    en: 'MCQs 30% · case 70% (safety-first root-cause order). Language-neutral: Hinglish answers lose no marks.',
    hi: 'MCQ 30% · केस 70% (पहले सुरक्षा, फिर मूल कारण का क्रम)। भाषा-निरपेक्ष: हिंग्लिश जवाब पर कोई अंक नहीं कटते।',
    hinglish: 'MCQs 30% · case 70% (safety-first root-cause order). Language-neutral: Hinglish jawab par koi marks nahi kate.',
  },
  langNeutral: {
    en: 'Language-neutral scoring: the answer was in Hinglish and lost no marks for it.',
    hi: 'भाषा-निरपेक्ष स्कोरिंग: उत्तर हिंग्लिश में था, इसके लिए कोई अंक नहीं कटे।',
    hinglish: 'Language-neutral scoring: jawab Hinglish mein tha, uske liye koi marks nahi kate.',
  },
} satisfies Record<string, Bi>

const LETTERS = ['A', 'B', 'C', 'D', 'E']

// -----------------------------------------------------------------------------
// Case rubric
// -----------------------------------------------------------------------------

export interface CaseEval {
  order: number
  safety: boolean
  terms: RubricCheck[]
  missed: RubricCheck[]
}

export function evaluateCase(c: CoreCase, text: string): CaseEval {
  const hit = (r: RubricCheck) => detectKeywords(text, r.keywords).length > 0
  const safety = hit(c.safety)
  const terms = c.terms.filter(hit)
  const missed = c.expected.filter((r) => !hit(r))
  const order =
    safety && terms.length >= 3
      ? c.orderScore + (missed.length === 0 ? 1 : 0)
      : safety || terms.length >= 2
        ? 6
        : terms.length >= 1
          ? 4
          : 2
  return { order: Math.min(10, order), safety, terms, missed }
}

function joinLabels(list: RubricCheck[], lang: 'en' | 'hi'): string {
  return list.map((r) => r.label[lang] || r.label.en).join(' / ')
}

interface RubricChip {
  id: string
  tone: 'ok' | 'warn'
  label: Bi
  detail?: Bi
}

function rubricChips(ev: CaseEval): RubricChip[] {
  const chips: RubricChip[] = [
    {
      id: 'order',
      tone: ev.order >= 7 ? 'ok' : 'warn',
      label: { en: `Root-cause order ${ev.order}/10`, hi: `मूल-कारण क्रम ${ev.order}/10`, hinglish: `Root-cause order ${ev.order}/10` },
    },
    ev.safety
      ? { id: 'safety', tone: 'ok', label: { en: 'Safety first ✓', hi: 'पहले सुरक्षा ✓', hinglish: 'Safety first ✓' } }
      : { id: 'safety', tone: 'warn', label: { en: 'Safety step missing', hi: 'सुरक्षा कदम छूटा', hinglish: 'Safety step missing' } },
    ev.terms.length >= 2
      ? {
          id: 'terms',
          tone: 'ok',
          label: { en: 'Correct terms ✓', hi: 'सही शब्दावली ✓', hinglish: 'Correct terms ✓' },
          detail: { en: joinLabels(ev.terms, 'en'), hi: joinLabels(ev.terms, 'hi') },
        }
      : { id: 'terms', tone: 'warn', label: { en: 'Few technical terms', hi: 'तकनीकी शब्द कम', hinglish: 'Technical terms kam' } },
    ev.missed.length > 0
      ? {
          id: 'missed',
          tone: 'warn',
          label: {
            en: `Missed: ${joinLabels(ev.missed, 'en')}`,
            hi: `छूटा: ${joinLabels(ev.missed, 'hi')}`,
            hinglish: `Missed: ${joinLabels(ev.missed, 'en')}`,
          },
        }
      : { id: 'missed', tone: 'ok', label: { en: 'Nothing major missed ✓', hi: 'कुछ बड़ा नहीं छूटा ✓', hinglish: 'Kuch bada nahi chhoota ✓' } },
  ]
  return chips
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export interface CoreResult {
  trackId: CoreTrackId
  correct: number
  total: number
  /** Expected rubric items not mentioned in the case answer. */
  missed: string[]
  hasCase: boolean
  minutes: number
  /** Shown + stored round score: MCQs 30% · case 70% (MCQ-only tracks: MCQs scale the target). */
  score: number
  /** Picked options, comma-separated (-1 = unanswered), so a revisit restores this exact run. */
  answers: string
  /** Case answer text (restored on revisit). */
  caseText: string
}

/**
 * Round score from the actual answers. Calibrated so the scripted / autopilot run lands exactly on the
 * persona's target (e.g. Rahul 5/6 + scripted case = 81), and wrong MCQs or a weaker case pull it down.
 */
export function coreScore(target: number, track: CoreTrack, correct: number, ev: CaseEval | null): number {
  const items = track.items
  const total = Math.max(1, items.length)
  const autoCorrect = Math.max(1, items.filter((it) => (it.autopick ?? it.answer) === it.answer).length)
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))
  const kase = track.case
  if (!kase) return clamp(target * (0.5 + (0.5 * correct) / autoCorrect))
  const mcqPart = (n: number) => (30 * n) / total
  let caseScore = (target - mcqPart(autoCorrect)) / 0.7
  if (ev) {
    const ref = evaluateCase(kase, kase.scripted)
    caseScore -= 8 * Math.max(0, ev.missed.length - ref.missed.length)
    caseScore -= 6 * Math.max(0, ref.terms.length - ev.terms.length)
    if (ref.safety && !ev.safety) caseScore -= 12
  }
  return clamp(mcqPart(correct) + 0.7 * Math.max(0, Math.min(100, caseScore)))
}

export interface CoreRoundProps {
  track: CoreTrack
  /** Only the visible track reacts to presenter events. */
  active: boolean
  /** The store already has this track cleared: open in the final state. */
  restoreDone: boolean
  /** Stored run (detail.answers / detail.caseText): restore exactly what was answered, not the autopick. */
  restoreAnswers?: string
  restoreCaseText?: string
  score: number
  /** Seconds used so far (owned by the page's round timer). */
  elapsedRef: MutableRefObject<number>
  onFinish: (r: CoreResult) => void
  /** Autopilot after the score is on screen. */
  onNext: () => void
  /** Rendered inside the score card (e.g. the Next round CTA). */
  nextAction?: ReactNode
  className?: string
}

type Stage = 'mcq' | 'case' | 'summary'
type CaseStage = 'answer' | 'thinking' | 'rubric' | 'model' | 'done'

function joinText(...parts: string[]): string {
  return parts
    .map((p) => (p || '').trim())
    .filter(Boolean)
    .join(' ')
}

/** Core-technical round: MCQs (incl. an engineering drawing) + a shop-floor case answered by text or voice. */
export function CoreRound({
  track,
  active,
  restoreDone,
  restoreAnswers,
  restoreCaseText,
  score,
  elapsedRef,
  onFinish,
  onNext,
  nextAction,
  className,
}: CoreRoundProps) {
  const { voiceMode, lang } = useDemo()
  const items = track.items
  const total = items.length
  const kase = track.case

  const [stage, setStage] = useState<Stage>('mcq')
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(() => items.map(() => null))
  const [caseText, setCaseText] = useState('')
  const [caseStage, setCaseStage] = useState<CaseStage>('answer')
  const [ev, setEv] = useState<CaseEval | null>(null)
  const [rubricShown, setRubricShown] = useState(0)
  const [typing, setTyping] = useState(false)
  const [auto, setAuto] = useState(false)
  const [instant, setInstant] = useState(false)
  const [result, setResult] = useState<CoreResult | null>(null)

  const genRef = useRef(0)
  const mountedRef = useRef(true)
  const autoRef = useRef(false)
  const finishedRef = useRef(false)
  const touchedRef = useRef(false)
  const answersRef = useRef(answers)
  answersRef.current = answers
  const evRef = useRef(ev)
  evRef.current = ev
  const caseTextRef = useRef(caseText)
  caseTextRef.current = caseText
  const stageRef = useRef(stage)
  stageRef.current = stage
  const idxRef = useRef(idx)
  idxRef.current = idx
  const caseStageRef = useRef(caseStage)
  caseStageRef.current = caseStage

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      genRef.current++
    }
  }, [])

  const wait = useCallback(
    (ms: number, g: number) =>
      new Promise<boolean>((resolve) => setTimeout(() => resolve(mountedRef.current && genRef.current === g), ms)),
    [],
  )

  // ---------------------------------------------------------------------------
  // Mic (live voice mode only)
  // ---------------------------------------------------------------------------
  const sr = useSpeechRecognition({ lang: 'hi' })
  const [micOn, setMicOn] = useState(false)
  const micBaseRef = useRef('')
  const stoppingRef = useRef(false)
  const srRef = useRef(sr)
  srRef.current = sr

  useEffect(() => {
    if (!micOn) return
    setCaseText(joinText(micBaseRef.current, sr.finalText, sr.interim))
  }, [micOn, sr.finalText, sr.interim])

  useEffect(() => {
    if (micOn && stoppingRef.current && !sr.listening) {
      stoppingRef.current = false
      setCaseText(joinText(micBaseRef.current, sr.finalText))
      setMicOn(false)
    }
  }, [micOn, sr.listening, sr.finalText])

  useEffect(() => {
    if (!micOn || !sr.error) return
    stoppingRef.current = false
    setMicOn(false)
    aiToast(sr.error === 'not-supported' ? 'Speech recognition not available' : `Mic: ${sr.error}`, { tone: 'warn' })
  }, [micOn, sr.error])

  const stopMicNow = useCallback(() => {
    if (srRef.current.listening) srRef.current.stop()
    stoppingRef.current = false
    setMicOn(false)
  }, [])

  const toggleMic = () => {
    if (micOn) {
      stoppingRef.current = true
      sr.stop()
      return
    }
    if (voiceMode !== 'live') {
      aiToast(tr(T.micOff, lang), { tone: 'ai' })
      return
    }
    if (!sr.supported) {
      aiToast(tr(T.micNA, lang), { tone: 'warn' })
      return
    }
    touchedRef.current = true
    micBaseRef.current = caseText
    sr.reset()
    sr.start()
    setMicOn(true)
  }

  // ---------------------------------------------------------------------------
  // Finish
  // ---------------------------------------------------------------------------
  const finish = useCallback(
    (ans: (number | null)[], evaluation: CaseEval | null, silent = false, text = '') => {
      if (finishedRef.current) return
      finishedRef.current = true
      const correct = items.filter((it, i) => ans[i] === it.answer).length
      const minutes = Math.max(1, Math.round((elapsedRef.current || 0) / 60))
      const r: CoreResult = {
        trackId: track.id,
        correct,
        total,
        missed: evaluation ? evaluation.missed.map((m) => m.id) : [],
        hasCase: !!kase,
        minutes,
        score: coreScore(score, track, correct, evaluation),
        answers: ans.map((a) => (a === null ? -1 : a)).join(','),
        caseText: text.slice(0, 1500),
      }
      setResult(r)
      if (!silent) onFinish(r)
    },
    [items, elapsedRef, track, total, kase, onFinish, score],
  )

  // ---------------------------------------------------------------------------
  // MCQ actions
  // ---------------------------------------------------------------------------
  const pick = (i: number, opt: number) => {
    setAnswers((a) => {
      if (a[i] === opt) return a
      const next = a.slice()
      next[i] = opt
      return next
    })
  }

  const goNextItem = () => {
    touchedRef.current = true
    if (idx < total - 1) {
      setIdx(idx + 1)
      return
    }
    if (kase) setStage('case')
    else {
      setStage('summary')
      finish(answersRef.current, null)
    }
  }

  // ---------------------------------------------------------------------------
  // Case actions
  // ---------------------------------------------------------------------------
  const typeScripted = useCallback(
    async (g: number): Promise<boolean> => {
      if (!kase) return true
      const target = kase.scripted
      setTyping(true)
      setCaseText('')
      for (let i = 0; i < target.length; ) {
        if (!(await wait(40, g))) return false
        i = Math.min(target.length, i + 2)
        setCaseText(target.slice(0, i))
      }
      setTyping(false)
      return true
    },
    [kase, wait],
  )

  const submitCase = useCallback(
    async (text: string, g: number): Promise<boolean> => {
      if (!kase) return true
      const evaluation = evaluateCase(kase, text)
      setEv(evaluation)
      setRubricShown(0)
      setCaseStage('thinking')
      if (!(await wait(900, g))) return false
      setCaseStage('rubric')
      for (let i = 1; i <= 4; i++) {
        if (!(await wait(i === 1 ? 120 : 380, g))) return false
        setRubricShown(i)
      }
      if (!(await wait(450, g))) return false
      setCaseStage('model')
      return true
    },
    [kase, wait],
  )

  const onScripted = () => {
    touchedRef.current = true
    stopMicNow()
    const g = ++genRef.current
    void typeScripted(g)
  }

  const onSubmitCase = () => {
    touchedRef.current = true
    stopMicNow()
    const g = ++genRef.current
    setTyping(false)
    void submitCase(caseText, g)
  }

  const onModelDone = useCallback(() => {
    setCaseStage((s) => (s === 'model' ? 'done' : s))
    finish(answersRef.current, evRef.current, false, caseTextRef.current)
  }, [finish])

  // ---------------------------------------------------------------------------
  // Presenter: fast-forward, autopilot, reset
  // ---------------------------------------------------------------------------
  const jumpToEnd = useCallback(
    (silent: boolean, restore?: { answers?: string; caseText?: string }) => {
      genRef.current++
      autoRef.current = false
      setAuto(false)
      setTyping(false)
      stopMicNow()
      const stored = restore?.answers?.split(',').map((x) => Number(x))
      const valid = !!stored && stored.length === total && stored.every((n) => Number.isInteger(n))
      const ans: (number | null)[] = valid
        ? stored!.map((n) => (n < 0 ? null : n))
        : items.map((it) => it.autopick ?? it.answer)
      setAnswers(ans)
      setIdx(total - 1)
      let evaluation: CaseEval | null = null
      let text = ''
      if (kase) {
        text = restore?.caseText?.trim() ? restore.caseText : kase.scripted
        evaluation = evaluateCase(kase, text)
        setCaseText(text)
        setEv(evaluation)
        setRubricShown(4)
        setCaseStage('done')
        setStage('case')
      } else {
        setStage('summary')
      }
      setInstant(true)
      finish(ans, evaluation, silent, text)
    },
    [items, total, kase, finish, stopMicNow],
  )

  const runAuto = useCallback(async () => {
    if (autoRef.current || finishedRef.current) return
    autoRef.current = true
    setAuto(true)
    touchedRef.current = true
    stopMicNow()
    const g = ++genRef.current
    try {
      const start = stageRef.current === 'mcq' ? idxRef.current : total
      for (let i = start; i < total; i++) {
        setStage('mcq')
        setIdx(i)
        if (!(await wait(400, g))) return
        const it = items[i]
        pick(i, it.autopick ?? it.answer)
        if (!(await wait(400, g))) return
      }
      if (!kase) {
        setStage('summary')
        finish(answersRef.current, null)
        return
      }
      setStage('case')
      if (!(await wait(600, g))) return
      if (caseStageRef.current === 'answer') {
        if (!(await typeScripted(g))) return
        if (!(await wait(400, g))) return
        await submitCase(caseTextRef.current, g)
      }
    } finally {
      if (genRef.current === g) {
        autoRef.current = false
        setAuto(false)
      }
    }
  }, [items, total, kase, wait, typeScripted, submitCase, finish, stopMicNow])

  useDemoEvent('fastforward', () => {
    if (!active || finishedRef.current) return
    touchedRef.current = true
    jumpToEnd(false)
  })

  useDemoEvent('autopilot', () => {
    if (!active) return
    if (finishedRef.current) {
      onNext()
      return
    }
    void runAuto()
  })

  useDemoEvent('reset', () => {
    genRef.current++
    autoRef.current = false
    finishedRef.current = false
    touchedRef.current = false
    stopMicNow()
    setAuto(false)
    setTyping(false)
    setInstant(false)
    setStage('mcq')
    setIdx(0)
    setAnswers(items.map(() => null))
    setCaseText('')
    setCaseStage('answer')
    setEv(null)
    setRubricShown(0)
    setResult(null)
  })

  // Revisit after the round was cleared: show the final state without re-writing the store.
  useEffect(() => {
    if (restoreDone && !finishedRef.current && !touchedRef.current)
      jumpToEnd(true, { answers: restoreAnswers, caseText: restoreCaseText })
  }, [restoreDone, jumpToEnd, restoreAnswers, restoreCaseText])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const finished = result !== null
  const busy = auto || typing
  const item = items[Math.min(idx, total - 1)]
  const answeredCount = answers.filter((a) => a !== null).length
  const chips = useMemo(() => (ev ? rubricChips(ev) : []), [ev])

  const scoreChips: ScoreChip[] = useMemo(() => {
    if (!result) return []
    const list: ScoreChip[] = [
      {
        id: 'mcq',
        tone: result.correct === result.total ? 'ok' : result.correct < result.total - 1 ? 'warn' : 'info',
        label: { en: `MCQs ${result.correct}/${result.total}`, hi: `MCQ ${result.correct}/${result.total}`, hinglish: `MCQs ${result.correct}/${result.total}` },
      },
    ]
    if (ev) {
      list.push(
        ev.safety
          ? { id: 'safety', tone: 'ok', label: { en: 'Safety first ✓', hi: 'पहले सुरक्षा ✓', hinglish: 'Safety first ✓' } }
          : { id: 'safety', tone: 'warn', label: { en: 'Safety step missing', hi: 'सुरक्षा कदम छूटा', hinglish: 'Safety step missing' } },
      )
      if (ev.missed.length > 0) {
        list.push({
          id: 'missed',
          tone: 'warn',
          label: { en: `Missed ${joinLabels(ev.missed, 'en')}`, hi: `छूटा: ${joinLabels(ev.missed, 'hi')}`, hinglish: `Missed ${joinLabels(ev.missed, 'en')}` },
        })
      }
    }
    list.push({ id: 'time', tone: 'time', label: { en: `Time ${result.minutes}m`, hi: `समय ${result.minutes} मि.`, hinglish: `Time ${result.minutes}m` } })
    return list
  }, [result, ev])

  const wrongItems = items.map((it, i) => ({ it, i })).filter(({ it, i }) => answers[i] !== null && answers[i] !== it.answer)

  return (
    <div className={cn('mx-auto w-full max-w-[920px] space-y-4', className)}>
      {finished && result && (
        <ScoreCard
          score={result.score}
          title={T.scoredBy}
          subtitle={kase ? T.weighted : undefined}
          chips={scoreChips}
          instant={instant}
          actions={nextAction}
        />
      )}

      {/* Progress strip */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[12px] text-gray-300">
          <Sparkles className="h-3.5 w-3.5 text-cyan-300" aria-hidden />
          {track.tag}
        </span>
        <span className="text-[12.5px] text-gray-400">{track.branches}</span>
        <ol className="ml-auto flex items-center gap-1.5" aria-label="Progress">
          {items.map((it, i) => {
            const isCur = stage === 'mcq' && i === idx
            const ans = answers[i]
            const mark = finished ? (ans === it.answer ? 'ok' : 'bad') : ans !== null ? 'done' : 'todo'
            return (
              <li key={it.id}>
                <button
                  type="button"
                  disabled={busy || finished || (ans === null && i > answeredCount)}
                  onClick={() => {
                    touchedRef.current = true
                    setStage('mcq')
                    setIdx(i)
                  }}
                  aria-label={`Question ${i + 1}`}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full border text-[12px] font-semibold tabular-nums transition-colors',
                    isCur && 'ring-2 ring-cyan-300/50 ring-offset-1 ring-offset-[#0d1117]',
                    mark === 'ok' && 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200',
                    mark === 'bad' && 'border-rose-400/40 bg-rose-400/15 text-rose-200',
                    mark === 'done' && 'border-cyan-300/40 bg-cyan-300/10 text-cyan-100',
                    mark === 'todo' && 'border-white/10 text-gray-500',
                  )}
                >
                  {i + 1}
                </button>
              </li>
            )
          })}
          {kase && (
            <li>
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border',
                  stage === 'case' ? 'border-violet-400/50 bg-violet-400/15 text-violet-200' : 'border-white/10 text-gray-500',
                )}
                aria-label="Case"
              >
                <Factory className="h-3.5 w-3.5" aria-hidden />
              </span>
            </li>
          )}
        </ol>
      </div>

      {/* MCQ card */}
      {stage === 'mcq' && !finished && item && (
        <McqCard
          key={item.id}
          item={item}
          index={idx}
          total={total}
          value={answers[idx]}
          disabled={busy}
          onPick={(opt) => {
            touchedRef.current = true
            pick(idx, opt)
          }}
          onPrev={idx > 0 ? () => setIdx(idx - 1) : undefined}
          onNext={goNextItem}
          nextLabel={idx < total - 1 ? T.next : kase ? T.toCase : T.finishMcq}
        />
      )}

      {/* Case */}
      {kase && stage === 'case' && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6" data-proctored="">
          {!finished && (
            <p className="mb-3 inline-flex items-center gap-1.5 text-[12.5px] text-gray-400">
              <ClipboardCheck className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
              <Tr b={T.answered} /> {answeredCount}/{total}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-400/10 px-2.5 py-1 text-[12px] font-medium text-violet-200">
              <Factory className="h-3.5 w-3.5" aria-hidden />
              <Tr b={T.caseTitle} />
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[12px] text-gray-300">{track.tag}</span>
          </div>
          <Tr b={kase.prompt} as="h3" className="mt-3 block text-[17px] font-semibold leading-snug text-white sm:text-[19px]" />
          <Tr b={T.caseHint} as="p" className="mt-1.5 block text-[13px] text-gray-400" />

          <div className="relative mt-4">
            <textarea
              data-hotkeys-off=""
              value={caseText}
              readOnly={typing || micOn || caseStage !== 'answer' || auto}
              onChange={(e) => {
                touchedRef.current = true
                setCaseText(e.target.value)
              }}
              rows={4}
              placeholder={tr(T.placeholder, lang)}
              aria-label={tr(kase.prompt, lang)}
              className={cn(
                'block min-h-[112px] w-full resize-y rounded-xl border bg-[#0a0e14] px-3.5 py-3 text-[14.5px] leading-relaxed text-gray-100 outline-none transition-colors placeholder:text-gray-600',
                micOn ? 'border-violet-400/50 shadow-[0_0_0_3px_rgba(167,139,250,0.12)]' : 'border-white/10 focus:border-cyan-300/40',
              )}
            />
            {micOn && (
              <span className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-2 py-0.5 text-[12px] text-violet-200">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-300" aria-hidden />
                <Tr b={T.listening} />
              </span>
            )}
          </div>

          {caseStage === 'answer' && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggleMic}
                disabled={typing || auto}
                className={cn(
                  'inline-flex h-10 items-center gap-2 rounded-lg border px-3.5 text-[13.5px] font-medium transition-colors disabled:opacity-50',
                  micOn
                    ? 'border-violet-400/50 bg-violet-500/20 text-violet-100'
                    : 'border-white/10 bg-white/[0.04] text-gray-200 hover:bg-white/[0.08]',
                )}
              >
                {micOn ? <Square className="h-4 w-4" aria-hidden /> : <Mic className="h-4 w-4" aria-hidden />}
                <Tr b={micOn ? T.micStop : T.mic} />
              </button>
              <button
                type="button"
                onClick={onScripted}
                disabled={typing || auto || micOn}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-violet-400/30 bg-violet-500/[0.08] px-3.5 text-[13.5px] font-medium text-violet-100 transition-colors hover:bg-violet-500/[0.15] disabled:opacity-50"
              >
                {typing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Wand2 className="h-4 w-4" aria-hidden />}
                <Tr b={T.scripted} />
              </button>
              <button
                type="button"
                onClick={onSubmitCase}
                disabled={typing || auto || micOn || caseText.trim().length < 10}
                className="ml-auto inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 px-4 text-[13.5px] font-semibold text-[#06121a] transition-[filter,opacity] hover:brightness-110 disabled:opacity-40"
              >
                <Send className="h-4 w-4" aria-hidden />
                <Tr b={T.submit} />
              </button>
            </div>
          )}

          {caseStage === 'thinking' && <AIThinking label={T.evaluating} lines={2} className="mt-4" />}

          {(caseStage === 'rubric' || caseStage === 'model' || caseStage === 'done') && ev && (
            <div className="mt-4 space-y-3">
              <div>
                <Tr b={T.rubric} as="h4" className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-500" />
                <ul className="flex flex-wrap gap-2">
                  {chips.slice(0, instant ? chips.length : rubricShown).map((c) => (
                    <li
                      key={c.id}
                      className={cn(
                        'inline-flex max-w-full flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-lg border px-2.5 py-1.5 text-[13px] font-medium',
                        !instant && 'motion-safe:animate-[tile-pop_260ms_ease-out_both]',
                        c.tone === 'ok' ? 'border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-100' : 'border-amber-400/30 bg-amber-400/[0.08] text-amber-100',
                      )}
                    >
                      {c.tone === 'ok' ? (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden />
                      ) : (
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden />
                      )}
                      <Tr b={c.label} />
                      {c.detail && (
                        <span className="text-[12px] font-normal text-gray-400">
                          · <Tr b={c.detail} />
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              {(caseStage === 'model' || caseStage === 'done') && (
                <AISurface title={<Tr b={T.model} />} meta={false}>
                  <StreamingText
                    text={kase.modelAnswer}
                    cps={110}
                    instant={instant || caseStage === 'done'}
                    className="text-[13.5px] leading-relaxed text-gray-200"
                    onDone={onModelDone}
                  />
                </AISurface>
              )}
            </div>
          )}
        </section>
      )}

      {/* MCQ review (after the round) */}
      {finished && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
          <Tr b={T.review} as="h3" className="block text-[14px] font-semibold text-white" />
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {items.map((it, i) => {
              const ok = answers[i] === it.answer
              return (
                <li key={it.id} className="flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[13px]">
                  {ok ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden />
                  )}
                  <span className="min-w-0 flex-1">
                    <Tr b={it.topic} className="font-medium text-gray-200" />
                    <span className="block text-[12px] text-gray-500">
                      <Tr b={T.yours} />: {answers[i] === null ? '—' : LETTERS[answers[i] as number]}
                      {!ok && (
                        <>
                          {' · '}
                          <Tr b={T.correctIs} />: {LETTERS[it.answer]}
                        </>
                      )}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
          {wrongItems.map(({ it }) => (
            <AISurface key={it.id} tone="violet" title={<Tr b={T.explains} />} meta={false} className="mt-3" bodyClassName="space-y-3">
              {it.figure === 'l-bracket' && <EngineeringDrawing reveal className="max-w-[360px]" />}
              <StreamingText text={it.explain} instant={instant} className="text-[13.5px] leading-relaxed text-gray-200" />
            </AISurface>
          ))}
        </section>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------------
// MCQ card
// -----------------------------------------------------------------------------

interface McqCardProps {
  item: CoreMcq
  index: number
  total: number
  value: number | null
  disabled: boolean
  onPick: (opt: number) => void
  onPrev?: () => void
  onNext: () => void
  nextLabel: Bi
}

function McqCard({ item, index, total, value, disabled, onPick, onPrev, onNext, nextLabel }: McqCardProps) {
  const drawn = item.figure === 'l-bracket' && Array.isArray(item.figureOptions) && item.figureOptions.length > 0
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 motion-safe:animate-[tile-pop_240ms_ease-out_both] sm:p-6" data-proctored="">
      <div className="flex flex-wrap items-center gap-2 text-[12px]">
        <span className="font-semibold tabular-nums text-gray-300">
          <Tr b={T.q} /> {index + 1}/{total}
        </span>
        <span className="rounded-full border border-cyan-300/25 bg-cyan-300/[0.07] px-2.5 py-0.5 text-cyan-100">
          <Tr b={item.topic} />
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-gray-400">{item.tag}</span>
      </div>
      <Tr b={item.q} as="h3" className="mt-3 block text-[16px] font-semibold leading-snug text-white sm:text-[17px]" />

      {drawn ? (
        <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:items-start">
          <EngineeringDrawing />
          <div>
            <Tr b={T.pickFront} as="p" className="mb-2 block text-[12.5px] text-gray-400" />
            <div className="grid grid-cols-2 gap-2">
              {item.figureOptions!.map((fo, i) => {
                const sel = value === i
                return (
                  <button
                    key={fo}
                    type="button"
                    disabled={disabled}
                    onClick={() => onPick(i)}
                    aria-pressed={sel}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition-colors',
                      sel
                        ? 'border-cyan-300/60 bg-cyan-300/[0.08] shadow-[0_0_0_3px_rgba(103,232,249,0.10)]'
                        : 'border-white/10 bg-[#07121a] hover:border-white/25',
                    )}
                  >
                    <DrawingOption id={fo} className="max-w-[110px]" />
                    <span className={cn('text-[12.5px] font-semibold', sel ? 'text-cyan-100' : 'text-gray-400')}>
                      {LETTERS[i]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <ul className="mt-4 grid gap-2">
          {item.options.map((o, i) => {
            const sel = value === i
            return (
              <li key={i}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onPick(i)}
                  aria-pressed={sel}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-[14px] transition-colors',
                    sel
                      ? 'border-cyan-300/60 bg-cyan-300/[0.08] text-white shadow-[0_0_0_3px_rgba(103,232,249,0.10)]'
                      : 'border-white/10 bg-white/[0.02] text-gray-200 hover:border-white/25 hover:bg-white/[0.04]',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[12.5px] font-semibold',
                      sel ? 'border-cyan-300/60 bg-cyan-300/15 text-cyan-100' : 'border-white/10 text-gray-400',
                    )}
                  >
                    {LETTERS[i]}
                  </span>
                  <Tr b={o} className="min-w-0 flex-1" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-5 flex items-center gap-2">
        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            disabled={disabled}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-[13.5px] text-gray-300 transition-colors hover:bg-white/[0.05] disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            <Tr b={T.prev} />
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={disabled || value === null}
          className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-lg bg-white/[0.08] px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-white/[0.14] disabled:opacity-40"
        >
          <Tr b={nextLabel} />
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </section>
  )
}
