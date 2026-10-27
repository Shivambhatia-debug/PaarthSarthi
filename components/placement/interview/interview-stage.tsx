'use client'

/**
 * AI interview stage (technical + HR phases). One component, two routes:
 *   /placement/drive/interview → <InterviewStage phase="tech" />
 *   /placement/drive/hr        → <InterviewStage phase="hr" />
 * Phase tabs are Links, so each phase mounts fresh (no query param, no tech flash on a cold HR load).
 */

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import {
  ArrowRight,
  Bot,
  CircleStop,
  FastForward,
  FileText,
  GitBranch,
  Loader2,
  Mic,
  Play,
  Radio,
  RotateCcw,
  SkipForward,
  Sparkles,
  TriangleAlert,
  UserRound,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react'
import { tr, isDevanagari, type Bi, type Lang } from '@/lib/os/i18n'
import { useDemo, useDemoEvent } from '@/lib/os/demo-store'
import { ROUND_TARGETS, type RoundId } from '@/lib/os/rounds'
import { DriveShell } from '@/components/os/drive-shell'
import { AudioGate } from '@/components/os/audio-gate'
import { LanguageSwitcher } from '@/components/os/language-switcher'
import { Tr } from '@/components/os/tr-text'
import { AIOrb } from '@/components/ai/ai-orb'
import { AISurface } from '@/components/ai/ai-surface'
import { AIThinking } from '@/components/ai/ai-thinking'
import { StreamingText } from '@/components/ai/streaming-text'
import { Waveform } from '@/components/ai/waveform'
import { questionCount, SUMMARY_STRENGTHS, type Phase, type Tri } from '@/components/placement/interview/script'
import { useInterviewEngine, type AnswerResult } from '@/components/placement/interview/use-interview-engine'
import { QuestionChips } from '@/components/placement/interview/question-chips'
import { TranscriptPanel, type TranscriptEntry } from '@/components/placement/interview/transcript-panel'
import { DeliveryMeters } from '@/components/placement/interview/delivery-meters'
import { KeywordChips } from '@/components/placement/interview/keyword-chips'
import { AnswerScorecard } from '@/components/placement/interview/answer-scorecard'
import { SqlWhiteboard } from '@/components/placement/interview/sql-whiteboard'
import { FairnessCard } from '@/components/placement/interview/fairness-card'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------

const TITLE: Bi = { en: 'AI Interview · एआई इंटरव्यू', hi: 'AI Interview · एआई इंटरव्यू', hinglish: 'AI Interview · एआई इंटरव्यू' }

const C = {
  subtitleTech: {
    en: 'Technical round · Sarthi asks in your language, listens, and follows up on what you actually said',
    hi: 'तकनीकी राउंड · सारथी आपकी भाषा में पूछता है, सुनता है, और आपके जवाब पर अगला सवाल बनाता है',
    hinglish: 'Technical round · Sarthi aapki bhasha mein poochhta hai, sunta hai, aur aapke jawab par follow-up banata hai',
  },
  subtitleHr: {
    en: 'HR round · relocation, shifts, bond and goals, with language-fair scoring',
    hi: 'HR राउंड · रीलोकेशन, शिफ्ट, बॉन्ड और लक्ष्य, भाषा-निष्पक्ष स्कोरिंग के साथ',
    hinglish: 'HR round · relocation, shifts, bond aur goals, language-fair scoring ke saath',
  },
  tabTech: { en: 'Technical', hi: 'तकनीकी', hinglish: 'Technical' },
  tabHr: { en: 'HR', hi: 'HR', hinglish: 'HR' },
  gateTitle: { en: 'AI Interview with Sarthi', hi: 'सारथी के साथ AI इंटरव्यू', hinglish: 'Sarthi ke saath AI Interview' },
  start: { en: 'Start interview', hi: 'इंटरव्यू शुरू करें', hinglish: 'Interview shuru karein' },
  live: { en: 'Live mic', hi: 'लाइव माइक', hinglish: 'Live mic' },
  scripted: { en: 'Scripted', hi: 'स्क्रिप्टेड', hinglish: 'Scripted' },
  chromeOnly: { en: 'Live transcription works in Chrome', hi: 'लाइव ट्रांसक्रिप्शन Chrome में चलता है', hinglish: 'Live transcription Chrome mein chalta hai' },
  question: { en: 'Question', hi: 'प्रश्न', hinglish: 'Question' },
  ready: { en: 'Sarthi is getting ready…', hi: 'सारथी तैयार हो रहा है…', hinglish: 'Sarthi taiyaar ho raha hai…' },
  asking: { en: 'Sarthi is asking…', hi: 'सारथी पूछ रहा है…', hinglish: 'Sarthi poochh raha hai…' },
  listeningLive: { en: 'Listening · speak now', hi: 'सुन रहा है · अब बोलिए', hinglish: 'Sun raha hai · ab boliye' },
  listeningScripted: { en: 'Scripted answer (demo)', hi: 'स्क्रिप्टेड उत्तर (डेमो)', hinglish: 'Scripted answer (demo)' },
  analysing: { en: 'Analysing your answer…', hi: 'आपके उत्तर का विश्लेषण हो रहा है…', hinglish: 'Aapke answer ka analysis ho raha hai…' },
  scored: { en: 'Answer scored', hi: 'उत्तर का स्कोर तैयार', hinglish: 'Answer score ho gaya' },
  followUpComing: { en: 'Follow-up generated from your answer', hi: 'आपके जवाब से अगला सवाल बना', hinglish: 'Aapke jawab se follow-up bana' },
  followTag: { en: 'Follow-up generated from your answer', hi: 'आपके जवाब से बना फ़ॉलो-अप', hinglish: 'Aapke jawab se bana follow-up' },
  genericFollow: { en: 'No trigger keyword heard: generic follow-up', hi: 'कोई ट्रिगर कीवर्ड नहीं सुना: सामान्य फ़ॉलो-अप', hinglish: 'Koi trigger keyword nahi suna: generic follow-up' },
  guestTag: { en: 'Guest question · for an invited official', hi: 'अतिथि प्रश्न · आमंत्रित अधिकारी के लिए', hinglish: 'Guest question · invited official ke liye' },
  answerNow: { en: 'Answer now', hi: 'अभी जवाब दें', hinglish: 'Abhi jawab dein' },
  done: { en: 'Done answering', hi: 'जवाब पूरा', hinglish: 'Jawab poora' },
  next: { en: 'Next question', hi: 'अगला सवाल', hinglish: 'Agla sawaal' },
  startQ: { en: 'Start', hi: 'शुरू करें', hinglish: 'Start' },
  useScripted: { en: 'Use scripted answer', hi: 'स्क्रिप्टेड उत्तर लें', hinglish: 'Scripted answer use karein' },
  skip: { en: 'Skip (scripted, instant)', hi: 'छोड़ें (स्क्रिप्टेड, तुरंत)', hinglish: 'Skip (scripted, instant)' },
  replay: { en: 'Replay question', hi: 'सवाल दोबारा सुनें', hinglish: 'Question replay karein' },
  voiceOn: { en: 'Voice on', hi: 'आवाज़ चालू', hinglish: 'Voice on' },
  voiceOff: { en: 'Voice off', hi: 'आवाज़ बंद', hinglish: 'Voice off' },
  autopilot: { en: 'Autopilot', hi: 'ऑटोपायलट', hinglish: 'Autopilot' },
  stop: { en: 'Stop', hi: 'रोकें', hinglish: 'Stop' },
  noHindiVoice: {
    en: 'No Hindi voice on this device: an Indian-English voice reads the romanised question. Captions stay on.',
    hi: 'इस डिवाइस पर हिंदी आवाज़ नहीं है: भारतीय-अंग्रेज़ी आवाज़ रोमन में सवाल पढ़ेगी। कैप्शन हमेशा दिखेंगे।',
    hinglish: 'Is device par Hindi voice nahi hai: Indian-English voice romanised sawaal padhegi. Captions hamesha on.',
  },
  techDone: { en: 'Technical interview complete', hi: 'तकनीकी इंटरव्यू पूरा', hinglish: 'Technical interview complete' },
  hrDone: { en: 'HR interview complete', hi: 'HR इंटरव्यू पूरा', hinglish: 'HR interview complete' },
  cleared: { en: 'Cleared', hi: 'पास', hinglish: 'Cleared' },
  toHr: { en: 'Continue to HR round →', hi: 'HR राउंड पर चलें →', hinglish: 'HR round par chalein →' },
  toReport: { en: 'View my report →', hi: 'मेरी रिपोर्ट देखें →', hinglish: 'Meri report dekhein →' },
  summary: { en: 'Sarthi’s summary', hi: 'सारथी का सारांश', hinglish: 'Sarthi ka summary' },
  strength: { en: 'Strength', hi: 'ताक़त', hinglish: 'Strength' },
  gap: { en: 'Gap to work on', hi: 'सुधार की ज़रूरत', hinglish: 'Sudhaar ki zaroorat' },
  behaviour: { en: 'Behaviour flag', hi: 'व्यवहार संकेत', hinglish: 'Behaviour flag' },
  noHesitation: { en: 'No hesitation', hi: 'कोई झिझक नहीं', hinglish: 'Koi jhijhak nahi' },
  finish: { en: 'Finish & score (F)', hi: 'इंटरव्यू पूरा करें (F)', hinglish: 'Finish & score (F)' },
  followShort: { en: 'follow-up', hi: 'फ़ॉलो-अप', hinglish: 'follow-up' },
  guestShort: { en: 'guest', hi: 'अतिथि', hinglish: 'guest' },
} satisfies Record<string, Bi>

// Chip sizing: 12px on phones, projector-readable 14px from lg up.
const CHIP = 'px-2.5 py-1 text-[12px] lg:px-3 lg:py-1.5 lg:text-[14px]'
const CHIP_ICON = 'h-3.5 w-3.5 lg:h-4 lg:w-4'

function useMedia(query: string, fallback: boolean): boolean {
  return useSyncExternalStore(
    (cb) => {
      try {
        const mq = window.matchMedia(query)
        mq.addEventListener('change', cb)
        return () => mq.removeEventListener('change', cb)
      } catch {
        return () => {}
      }
    },
    () => {
      try {
        return window.matchMedia(query).matches
      } catch {
        return fallback
      }
    },
    () => fallback,
  )
}

/** Rahul (Hindi-medium diploma) defaults to हिंदी once per browser session, unless a language was already chosen. */
const HI_AUTO_KEY = 'ps_interview_hi_auto'

const ROUND_FOR: Record<Phase, RoundId> = { tech: 'techInterview', hr: 'hrInterview' }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtClock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`
}

/** HR relocation flag, built from MEASURED values. */
function hesitationText(r: AnswerResult): Tri {
  const s = (r.firstLatencyMs / 1000).toFixed(1)
  const f = r.fillers.total
  return {
    en: `Hesitation detected on relocation question (${s}s pause${f ? `, ${plural(f, 'filler', 'fillers')}` : ''}) → practise a confident 2-line answer.`,
    hi: `रीलोकेशन सवाल पर झिझक दिखी (${s} सेकंड का ठहराव${f ? `, ${f} फ़िलर` : ''}) → 2 लाइन का आत्मविश्वास भरा जवाब तैयार करें।`,
    hinglish: `Relocation sawaal par jhijhak dikhi (${s}s pause${f ? `, ${plural(f, 'filler', 'fillers')}` : ''}) → 2-line confident jawab practise karein.`,
  }
}

function confidentText(r: AnswerResult): Tri {
  const s = (r.firstLatencyMs / 1000).toFixed(1)
  return {
    en: `Clear answer on relocation: first word in ${s}s, ${plural(r.fillers.total, 'filler', 'fillers')}.`,
    hi: `रीलोकेशन पर साफ़ जवाब: ${s} सेकंड में पहला शब्द, ${r.fillers.total} फ़िलर।`,
    hinglish: `Relocation par saaf jawab: ${s}s mein pehla shabd, ${plural(r.fillers.total, 'filler', 'fillers')}.`,
  }
}

/** The summary gap, from the measured answers of this phase. */
function gapText(results: AnswerResult[]): Tri {
  const hes = results.find((r) => r.hesitant)
  if (hes) return hesitationText(hes)
  const n = results.length
  const fillers = results.reduce((a, r) => a + r.fillers.total, 0)
  const paced = results.filter((r) => r.wpm > 0)
  const avg = paced.length ? Math.round(paced.reduce((a, r) => a + r.wpm, 0) / paced.length) : 0
  const pace = avg ? `, average pace ${avg} WPM (target 130–160)` : ''
  const paceHi = avg ? `, औसत गति ${avg} शब्द/मिनट (लक्ष्य 130–160)` : ''
  return {
    en: `English delivery: ${plural(fillers, 'filler', 'fillers')} across ${plural(n, 'answer', 'answers')}${pace}. Practise 2-line English openers before the real panel.`,
    hi: `अंग्रेज़ी डिलीवरी: ${n} जवाबों में ${fillers} फ़िलर${paceHi}। असली पैनल से पहले अंग्रेज़ी में 2 लाइन की शुरुआत का अभ्यास करें।`,
    hinglish: `English delivery: ${n} answers mein ${plural(fillers, 'filler', 'fillers')}${pace}. Asli panel se pehle 2-line English openers practise karein.`,
  }
}

const noopSubscribe = () => () => {}
function recSupportedNow(): boolean {
  if (typeof window === 'undefined') return true
  const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition)
}

// ---------------------------------------------------------------------------
// Top bar (outside the gate): phase tabs, language, mic pill
// ---------------------------------------------------------------------------

function PhaseTabs({ phase }: { phase: Phase }) {
  const tabs: { id: Phase; href: string; label: Bi; icon: ReactNode }[] = [
    { id: 'tech', href: '/placement/drive/interview', label: C.tabTech, icon: <Bot className="h-3.5 w-3.5" aria-hidden /> },
    { id: 'hr', href: '/placement/drive/hr', label: C.tabHr, icon: <UserRound className="h-3.5 w-3.5" aria-hidden /> },
  ]
  return (
    <nav aria-label="Interview phase" className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
      {tabs.map((t) => {
        const on = t.id === phase
        return (
          <Link
            key={t.id}
            href={t.href}
            aria-current={on ? 'page' : undefined}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-colors',
              on
                ? 'bg-gradient-to-r from-blue-500/30 via-cyan-500/25 to-emerald-500/25 text-white shadow-[inset_0_0_0_1px_rgba(103,232,249,0.35)]'
                : 'text-gray-400 hover:bg-white/5 hover:text-white',
            )}
          >
            {t.icon}
            <Tr b={t.label} />
          </Link>
        )
      })}
    </nav>
  )
}

function MicPill() {
  const { voiceMode, set } = useDemo()
  const supported = useSyncExternalStore(noopSubscribe, recSupportedNow, () => true)
  const live = supported && voiceMode === 'live'
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div role="group" aria-label="Answer mode" className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-0.5">
        <button
          type="button"
          aria-pressed={live}
          disabled={!supported}
          onClick={() => set({ voiceMode: 'live' })}
          className={cn(
            'inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40',
            live ? 'bg-emerald-400/15 text-emerald-200' : 'text-gray-400 hover:text-white',
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', live ? 'animate-pulse bg-emerald-400' : 'bg-gray-500')} aria-hidden />
          <Tr b={C.live} />
        </button>
        <button
          type="button"
          aria-pressed={!live}
          onClick={() => set({ voiceMode: 'scripted' })}
          className={cn(
            'inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold transition-colors',
            !live ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white',
          )}
        >
          <FileText className="h-3 w-3" aria-hidden />
          <Tr b={C.scripted} />
        </button>
      </div>
      {!supported && (
        <span className="inline-flex items-center gap-1 text-[12px] text-amber-300">
          <TriangleAlert className="h-3.5 w-3.5" aria-hidden />
          <Tr b={C.chromeOnly} />
        </span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stage
// ---------------------------------------------------------------------------

export function InterviewStage({ phase }: { phase: Phase }) {
  const { personaId, persona, lang, rounds, setRound, set } = useDemo()
  const [resetKey, setResetKey] = useState(0)
  const rid = ROUND_FOR[phase]
  const status = rounds[rid]?.status

  // Mark the round live on mount (never downgrade a cleared / flagged round).
  useEffect(() => {
    if (!status || status === 'locked') setRound(rid, { status: 'live' })
  }, [rid, status, setRound])

  useDemoEvent('reset', () => setResetKey((k) => k + 1))

  const n = questionCount(personaId, phase)
  const gateBody: Bi = {
    en: `Sarthi will ask ${n} questions. Answer in Hindi, English or Hinglish.`,
    hi: `सारथी ${n} सवाल पूछेगा। हिंदी, अंग्रेज़ी या हिंग्लिश में जवाब दीजिए।`,
    hinglish: `Sarthi ${n} sawaal poochhega. Hindi, English ya Hinglish mein jawab dijiye.`,
  }

  return (
    <DriveShell
      round={rid}
      title={TITLE}
      subtitle={phase === 'hr' ? C.subtitleHr : C.subtitleTech}
      detectTabs={false}
      showProctor={false}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <PhaseTabs phase={phase} />
          <LanguageSwitcher size="sm" showPlanned={false} />
          <MicPill />
        </div>
        <AudioGate
          key={`${personaId}:${phase}:${resetKey}`}
          title={C.gateTitle}
          body={gateBody}
          startLabel={C.start}
          onStart={() => {
            // Plan Flow 2: Rahul's interview runs in Hindi. Only from the default Hinglish, once per session.
            if (persona?.kind !== 'polytechnic' || lang !== 'hinglish') return
            try {
              if (window.sessionStorage.getItem(HI_AUTO_KEY)) return
              window.sessionStorage.setItem(HI_AUTO_KEY, '1')
            } catch {
              /* storage blocked: still switch */
            }
            set({ lang: 'hi' })
          }}
        >
          <InterviewRoom phase={phase} />
        </AudioGate>
      </div>
    </DriveShell>
  )
}

// ---------------------------------------------------------------------------
// Room (mounted after the gate)
// ---------------------------------------------------------------------------

function SecondaryButton({
  onClick,
  disabled,
  icon,
  label,
  tone = 'default',
}: {
  onClick: () => void
  disabled?: boolean
  icon: ReactNode
  label: Bi
  tone?: 'default' | 'violet'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-[12px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        tone === 'violet'
          ? 'border-violet-400/25 bg-violet-500/[0.08] text-violet-100 hover:border-violet-300/50 hover:bg-violet-500/15'
          : 'border-white/10 bg-white/[0.03] text-gray-200 hover:border-white/25 hover:text-white',
      )}
    >
      {icon}
      <Tr b={label} />
    </button>
  )
}

function Caption({ text, count }: { text: string; count: number }) {
  const words = text.split(/\s+/).filter(Boolean)
  const shown = count >= words.length ? words : words.slice(0, count)
  const rest = words.slice(shown.length)
  const deva = isDevanagari(text)
  return (
    <p
      lang={deva ? 'hi' : 'en'}
      className={cn('text-balance text-center text-lg font-medium leading-relaxed text-white sm:text-xl', deva && 'font-deva')}
      aria-live="polite"
    >
      {shown.join(' ')}
      {rest.length > 0 && (
        <span aria-hidden className="text-white/0">
          {' '}
          {rest.join(' ')}
        </span>
      )}
    </p>
  )
}

function InterviewRoom({ phase }: { phase: Phase }) {
  const router = useRouter()
  const { lang, persona, rounds, presenter, voiceMode } = useDemo()
  const [muted, setMuted] = useState(false)
  const eng = useInterviewEngine({ phase, voiceOn: !muted })
  const { snap, current, actions, currentResult } = eng
  const gender = persona?.gender === 'M' ? 'M' : 'F'
  const isSm = useMedia('(min-width: 640px)', true)
  const isXl = useMedia('(min-width: 1280px)', false)
  const orbSize = !isSm ? 120 : isXl ? 160 : 200

  // Question badge: N = planned questions only, so the denominator never changes when a follow-up / guest is inserted.
  const planned = snap.queue.filter((q) => q.kind !== 'followup' && q.kind !== 'guest')
  const plannedIdx = current
    ? planned.findIndex((q) => q.id === (current.kind === 'followup' ? current.parentId : current.id))
    : -1
  const badgeNum = plannedIdx >= 0 ? plannedIdx + 1 : Math.min(snap.index + 1, planned.length)

  const stage = snap.stage
  const listening = stage === 'listening'
  const showEnd = snap.phaseDone && stage === 'scored'
  const qText = current ? tr(current.text, lang) : ''

  // Orb
  const orbState = stage === 'speaking' ? 'speaking' : listening ? 'listening' : stage === 'thinking' ? 'thinking' : 'idle'
  const orbLevel = listening ? (snap.source === 'live' ? eng.micLevel : 0.45) : stage === 'speaking' ? (eng.speaking ? 0.6 : 0.35) : 0

  // Timer
  const answerMs = stage === 'listening' || stage === 'thinking' ? snap.answerMs : currentResult?.durationMs ?? 0

  // Signal chip (persona-specific: the round detail, else this persona's fallback).
  let signal: { round: number; chip: string } | null = null
  if (current?.usesSignal) {
    const detail = rounds[current.usesSignal.round]?.detail
    const raw = detail?.signalChip
    signal = {
      round: current.usesSignal.round === 'technical' ? 2 : 3,
      chip: raw != null && String(raw).trim() ? String(raw) : current.usesSignal.fallbackChip,
    }
  }

  // Transcript
  const entries: TranscriptEntry[] = snap.queue
    .filter((q) => snap.asked.includes(q.id) || !!snap.results[q.id])
    .map((q) => {
      const isCur = q.id === current?.id
      const r = snap.results[q.id]
      const full = tr(q.text, lang)
      let question = full
      if (isCur && stage === 'speaking') {
        const w = full.split(/\s+/).filter(Boolean)
        question = w.slice(0, Math.min(w.length, snap.captionCount)).join(' ')
      }
      let answer: TranscriptEntry['answer'] = null
      if (isCur && (stage === 'listening' || stage === 'thinking')) answer = eng.answer
      else if (r) answer = { final: r.transcript, interim: '' }
      return {
        q,
        question,
        answer,
        source: isCur && stage !== 'scored' ? snap.source : r?.source ?? null,
        active: isCur,
        listening: isCur && listening,
      }
    })

  // Follow-up queued right after the current answer (shown while waiting to ask it).
  const pendingFollow =
    stage === 'scored' && currentResult?.followUp && !snap.results[currentResult.followUp.id] ? currentResult.followUp : null

  const hesitationResult = current?.hesitationCheck ? currentResult : undefined
  const hesRef = useRef<HTMLDivElement>(null)
  const hasHes = !!hesitationResult
  useEffect(() => {
    if (!hasHes) return
    const t = window.setTimeout(() => hesRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 120)
    return () => window.clearTimeout(t)
  }, [hasHes])

  const canScripted = !snap.phaseDone && (stage === 'speaking' || (listening && snap.source === 'live'))
  const canSkip = snap.started && !!current && stage !== 'thinking' && !(snap.phaseDone && stage === 'scored')
  // Follow-up in a demo (presenter / scripted): one click to fill the rest and show the split card (same as 'F').
  const showFinish =
    snap.started && !snap.phaseDone && current?.kind === 'followup' && (presenter || voiceMode === 'scripted')
  const onSkip = () => {
    if (presenter && phase === 'tech' && current?.kind === 'followup') actions.fastForward()
    else actions.skip()
  }

  // Big button
  let big: { icon: ReactNode; label: Bi; onClick?: () => void; tone: 'ai' | 'rec' | 'muted' } | null = null
  if (!showEnd) {
    switch (stage) {
      case 'idle':
        big = { icon: <Play className="h-7 w-7" />, label: C.startQ, onClick: actions.replay, tone: 'ai' }
        break
      case 'speaking':
        big = { icon: <Mic className="h-7 w-7" />, label: C.answerNow, onClick: actions.answerNow, tone: 'ai' }
        break
      case 'listening':
        big = { icon: <CircleStop className="h-7 w-7" />, label: C.done, onClick: actions.done, tone: 'rec' }
        break
      case 'thinking':
        big = { icon: <Loader2 className="h-7 w-7 animate-spin" />, label: C.analysing, tone: 'muted' }
        break
      case 'scored':
        big = { icon: <ArrowRight className="h-7 w-7" />, label: C.next, onClick: actions.next, tone: 'ai' }
        break
    }
  }

  return (
    <div className="space-y-4">
      {/* Question chips + autopilot */}
      <div className="flex items-center gap-3">
        <QuestionChips
          className="min-w-0 flex-1"
          queue={snap.queue}
          index={snap.index}
          results={snap.results}
          guestId={eng.script.guest.id}
          onJump={actions.jumpTo}
          onGuest={actions.askGuest}
        />
        {snap.autopilot && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 py-1 pl-2.5 pr-1 text-[12px] font-semibold text-cyan-100">
            <Zap className="h-3.5 w-3.5" aria-hidden />
            <Tr b={C.autopilot} />
            <button
              type="button"
              onClick={actions.stopAutopilot}
              className="rounded-full bg-white/10 px-2 py-0.5 text-[12px] font-medium text-white hover:bg-white/20"
            >
              <Tr b={C.stop} />
            </button>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[260px_minmax(0,1fr)_340px]">
        {/* Left: delivery meters (last on mobile) */}
        <div className="order-3 xl:order-1">
          <DeliveryMeters meters={eng.meters} className="xl:sticky xl:top-[120px]" />
        </div>

        {/* Centre: Sarthi */}
        <div className="order-1 min-w-0 space-y-4 xl:order-2">
          {showEnd ? (
            <PhaseEnd
              phase={phase}
              personaId={eng.personaId}
              results={snap.queue.map((q) => snap.results[q.id]).filter((r): r is AnswerResult => !!r)}
              lang={lang}
              onContinue={() => router.push(phase === 'tech' ? '/placement/drive/hr' : '/placement/report')}
            />
          ) : (
            <section
              className={cn(
                'relative overflow-hidden rounded-3xl border bg-gradient-to-b from-white/[0.05] to-white/[0.015] px-4 pb-5 pt-4 transition-colors sm:px-6',
                current?.kind === 'followup' ? 'border-violet-400/25' : 'border-white/10',
              )}
            >
              <div
                aria-hidden
                className={cn(
                  'pointer-events-none absolute inset-x-0 top-0 h-64 transition-opacity duration-700',
                  stage === 'thinking'
                    ? 'bg-[radial-gradient(ellipse_60%_70%_at_50%_10%,rgba(139,92,246,0.18),transparent_70%)]'
                    : 'bg-[radial-gradient(ellipse_60%_70%_at_50%_10%,rgba(34,211,238,0.12),transparent_70%)]',
                )}
              />

              {/* Meta row */}
              <div className="relative flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0d1117]/60 px-2.5 py-1 text-[12px] font-semibold text-gray-200">
                  <Tr b={C.question} />
                  {current?.kind === 'followup' || current?.kind === 'guest' ? (
                    <span className="text-white">
                      {current.kind === 'followup' && <span className="tabular-nums">{badgeNum} · </span>}
                      <Tr b={current.kind === 'followup' ? C.followShort : C.guestShort} />
                    </span>
                  ) : (
                    <span className="tabular-nums text-white">
                      {badgeNum}/{planned.length}
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[12px] tabular-nums',
                      listening ? 'border-rose-400/30 bg-rose-500/10 text-rose-100' : 'border-white/10 bg-[#0d1117]/60 text-gray-300',
                    )}
                    aria-label="Answer time"
                  >
                    {listening && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" aria-hidden />}
                    {fmtClock(answerMs)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMuted((m) => !m)}
                    aria-pressed={!muted}
                    title={tr(muted ? C.voiceOff : C.voiceOn, lang)}
                    className="grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-[#0d1117]/60 text-gray-300 transition-colors hover:text-white"
                  >
                    {muted ? <VolumeX className="h-3.5 w-3.5" aria-hidden /> : <Volume2 className="h-3.5 w-3.5" aria-hidden />}
                    <span className="sr-only">
                      <Tr b={muted ? C.voiceOff : C.voiceOn} />
                    </span>
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="relative mt-3 flex min-h-[28px] flex-wrap items-center justify-center gap-1.5">
                {signal && (
                  <span className={cn('animate-in fade-in inline-flex max-w-full items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/[0.07] text-cyan-100 duration-300', CHIP)}>
                    <Radio className={cn(CHIP_ICON, 'shrink-0 text-cyan-300')} aria-hidden />
                    <span className="min-w-0 truncate">
                      {tr(
                        {
                          en: `Using signal from Round ${signal.round}: `,
                          hi: `राउंड ${signal.round} के सिग्नल से: `,
                          hinglish: `Round ${signal.round} ka signal: `,
                        },
                        lang,
                      )}
                      <span className="font-semibold text-white">{signal.chip}</span>
                    </span>
                  </span>
                )}
                {current?.kind === 'followup' && (
                  <>
                    <span className={cn('animate-in fade-in zoom-in-95 inline-flex items-center gap-1.5 rounded-full border border-violet-400/35 bg-violet-500/15 font-semibold text-violet-100 duration-300', CHIP)}>
                      <GitBranch className={CHIP_ICON} aria-hidden />
                      <Tr b={C.followTag} />
                    </span>
                    <span className={cn('animate-in fade-in inline-flex max-w-full items-center rounded-full border border-violet-400/20 bg-violet-500/[0.06] text-violet-200 duration-500', CHIP)}>
                      {current.because ? (
                        <span className="min-w-0 truncate">
                          {tr(
                            {
                              en: `Because you said: "${current.because}"`,
                              hi: `क्योंकि आपने कहा: "${current.because}"`,
                              hinglish: `Kyunki aapne kaha: "${current.because}"`,
                            },
                            lang,
                          )}
                        </span>
                      ) : (
                        <Tr b={C.genericFollow} className="min-w-0 truncate" />
                      )}
                    </span>
                  </>
                )}
                {current?.kind === 'guest' && (
                  <span className={cn('inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/[0.08] font-semibold text-amber-100', CHIP)}>
                    <UserRound className={CHIP_ICON} aria-hidden />
                    <Tr b={C.guestTag} />
                  </span>
                )}
              </div>

              {/* Orb */}
              <div className="relative mt-2 flex justify-center">
                <AIOrb state={orbState} level={orbLevel} size={orbSize} label={`Sarthi ${orbState}`} />
              </div>

              {/* Status */}
              <div className="relative mt-1 flex min-h-[32px] items-center justify-center gap-2 text-[13px]">
                {stage === 'idle' && (
                  <span className="inline-flex items-center gap-2 text-gray-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    <Tr b={C.ready} />
                  </span>
                )}
                {stage === 'speaking' && (
                  <>
                    <Waveform active={eng.speaking || muted} bars={14} className="h-6" />
                    <Tr b={C.asking} className="text-cyan-200" />
                  </>
                )}
                {listening && (
                  <>
                    <Waveform active level={snap.source === 'live' ? eng.micLevel : undefined} bars={14} className="h-6" tone="ai" />
                    <Tr b={snap.source === 'live' ? C.listeningLive : C.listeningScripted} className={snap.source === 'live' ? 'text-emerald-200' : 'text-gray-300'} />
                  </>
                )}
                {stage === 'thinking' && <AIThinking label={C.analysing} lines={0} className="border-0 bg-none px-2 py-1" />}
                {stage === 'scored' &&
                  (pendingFollow ? (
                    <span className="animate-in fade-in inline-flex items-center gap-1.5 text-violet-200 duration-300">
                      <GitBranch className="h-3.5 w-3.5" aria-hidden />
                      <Tr b={C.followUpComing} />
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-emerald-300">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden />
                      <Tr b={C.scored} />
                    </span>
                  ))}
              </div>

              {/* Caption */}
              <div className="relative mx-auto mt-2 min-h-[84px] max-w-xl">{current && <Caption text={qText} count={snap.captionCount} />}</div>

              {/* Controls */}
              {big && (
                <div className="relative mt-4 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={big.onClick}
                    disabled={!big.onClick}
                    className={cn(
                      'relative grid h-16 w-16 place-items-center rounded-full text-white transition-transform active:scale-95 disabled:cursor-default',
                      big.tone === 'rec' &&
                        'bg-gradient-to-br from-rose-500 to-rose-600 shadow-[0_0_0_6px_rgba(244,63,94,0.15),0_0_30px_-4px_rgba(244,63,94,0.7)]',
                      big.tone === 'ai' &&
                        'bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-500 shadow-[0_0_0_6px_rgba(34,211,238,0.12),0_0_30px_-6px_rgba(34,211,238,0.8)] hover:scale-105',
                      big.tone === 'muted' && 'bg-violet-500/30 text-violet-100',
                    )}
                  >
                    {big.tone === 'rec' && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-rose-500/25" />}
                    <span className="relative" aria-hidden>
                      {big.icon}
                    </span>
                    <span className="sr-only">
                      <Tr b={big.label} />
                    </span>
                  </button>
                  <Tr b={big.label} className="text-[13px] font-medium text-gray-200" />
                </div>
              )}

              <div className="relative mt-4 flex flex-wrap items-center justify-center gap-2">
                <SecondaryButton
                  onClick={actions.useScripted}
                  disabled={!canScripted}
                  icon={<FileText className="h-3.5 w-3.5" aria-hidden />}
                  label={C.useScripted}
                />
                {showFinish && (
                  <button
                    type="button"
                    onClick={actions.fastForward}
                    className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-3.5 text-[13px] font-semibold text-white shadow-[0_0_24px_-8px_rgba(139,92,246,0.9)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <FastForward className="h-3.5 w-3.5" aria-hidden />
                    <Tr b={C.finish} />
                  </button>
                )}
                <SecondaryButton
                  onClick={onSkip}
                  disabled={!canSkip}
                  icon={<SkipForward className="h-3.5 w-3.5" aria-hidden />}
                  label={C.skip}
                  tone="violet"
                />
                <SecondaryButton
                  onClick={actions.replay}
                  disabled={!current || !snap.started}
                  icon={<RotateCcw className="h-3.5 w-3.5" aria-hidden />}
                  label={C.replay}
                />
              </div>

              {(!eng.recSupported || (snap.started && lang !== 'en' && !eng.hasHindiVoice)) && (
                <div className="relative mt-4 space-y-1 text-center text-[12px] text-gray-500">
                  {!eng.recSupported && <Tr b={C.chromeOnly} as="p" className="text-amber-300/90" />}
                  {snap.started && lang !== 'en' && !eng.hasHindiVoice && <Tr b={C.noHindiVoice} as="p" />}
                </div>
              )}
            </section>
          )}

          {current?.kind === 'sql' && !showEnd && <SqlWhiteboard sql={snap.sql} />}
        </div>

        {/* Right: transcript, keywords, scorecard */}
        <div className="order-2 min-w-0 space-y-4 xl:order-3">
          {hesitationResult && (
            <div ref={hesRef} className="scroll-mt-24">
            <AISurface
              key={`hes:${current?.id}`}
              tone="violet"
              title={hesitationResult.hesitant ? C.behaviour : C.noHesitation}
              meta={false}
            >
              <StreamingText
                text={hesitationResult.hesitant ? hesitationText(hesitationResult) : confidentText(hesitationResult)}
                cps={60}
                startDelay={300}
                className={cn('text-[13px] leading-relaxed', hesitationResult.hesitant ? 'text-amber-100' : 'text-emerald-100')}
              />
            </AISurface>
            </div>
          )}
          <TranscriptPanel entries={entries} />
          {current && <KeywordChips keywords={current.keywords} hit={eng.keywordsHit} />}
          {current && (
            <AnswerScorecard
              key={current.id}
              q={current}
              result={currentResult}
              stage={stage}
              liveStar={eng.liveStar}
              gender={gender}
              showLangFair={lang !== 'en'}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Phase end
// ---------------------------------------------------------------------------

function PhaseEnd({
  phase,
  personaId,
  results,
  lang,
  onContinue,
}: {
  phase: Phase
  personaId: 'priya' | 'rahul'
  results: AnswerResult[]
  lang: Lang
  onContinue: () => void
}) {
  const score = (ROUND_TARGETS[personaId] ?? ROUND_TARGETS.priya)[phase === 'hr' ? 'hrInterview' : 'techInterview']
  const strengths = (SUMMARY_STRENGTHS[personaId]?.[phase] ?? []).slice(0, 2)
  const gap = gapText(results)

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4 duration-500">
      <section className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-b from-emerald-400/[0.07] to-white/[0.015] px-5 py-6 text-center">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-10 mx-auto h-40 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative flex justify-center">
          <AIOrb state="idle" size={96} label="" />
        </div>
        <Tr b={phase === 'hr' ? C.hrDone : C.techDone} as="h2" className="relative mt-3 text-xl font-semibold text-white" />
        <p className="relative mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[13px] font-semibold text-emerald-200">
          <Tr b={C.cleared} />
          <span className="tabular-nums text-white">{score}</span>
        </p>
        <div className="relative mt-5 flex justify-center">
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 px-5 text-[14px] font-semibold text-white shadow-[0_0_30px_-8px_rgba(34,211,238,0.9)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Tr b={phase === 'tech' ? C.toHr : C.toReport} />
          </button>
        </div>
      </section>

      <FairnessCard personaId={personaId} />

      <AISurface title={C.summary}>
        <ul className="space-y-3">
          {strengths.map((s, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0 rounded-md bg-emerald-400/15 px-1.5 py-0.5 text-[12px] font-semibold text-emerald-300">
                <Tr b={C.strength} />
              </span>
              <StreamingText text={s} cps={75} startDelay={300 + i * 1300} className="text-[13px] leading-relaxed text-gray-100" />
            </li>
          ))}
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0 rounded-md bg-amber-400/15 px-1.5 py-0.5 text-[12px] font-semibold text-amber-300">
              <Tr b={C.gap} />
            </span>
            <StreamingText
              key={tr(gap, lang)}
              text={gap}
              cps={75}
              startDelay={300 + strengths.length * 1300}
              className="text-[13px] leading-relaxed text-gray-100"
            />
          </li>
        </ul>
      </AISurface>
    </div>
  )
}

