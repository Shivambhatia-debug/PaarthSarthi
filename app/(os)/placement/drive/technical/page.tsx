'use client'

// Round 2 · Technical. Branch-aware: a coding IDE (hidden tests, hint ladder, AI review) for IT-services
// drives, or a core-technical round (MCQs + engineering drawing + shop-floor case) for core branches.

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type MutableRefObject, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Building2, CheckCircle2, Code2, Cog, Flame, Sparkles, Timer, Zap } from 'lucide-react'
import { useDemo, useDemoEvent } from '@/lib/os/demo-store'
import { ROUNDS, ROUND_TARGETS, nextRoute } from '@/lib/os/rounds'
import { isCoreBlueprint } from '@/lib/mock/blueprints'
import type { Bi } from '@/lib/os/i18n'
import { DriveShell } from '@/components/os/drive-shell'
import { Tr } from '@/components/os/tr-text'
import { aiToast } from '@/components/ai/ai-toast'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { CodeEditor } from '@/components/placement/technical/code-editor'
import { ProblemPanel, type LeftTab } from '@/components/placement/technical/problem-panel'
import { TestResults, type HiddenRunView, type ResultsView, type SampleRunView } from '@/components/placement/technical/test-results'
import { HintLadder, type ApplyState } from '@/components/placement/technical/hint-ladder'
import { CodeReview } from '@/components/placement/technical/code-review'
import { ScoreCard, type ScoreChip } from '@/components/placement/technical/score-card'
import { CoreRound, type CoreResult } from '@/components/placement/technical/core-round'
import { CORE_ITEMS, type CoreTrackId } from '@/components/placement/technical/core-items'
import {
  PROBLEMS,
  bruteSignal,
  classifyCode,
  gradeHidden,
  gradeSamples,
  problemById,
  type CodeClass,
  type CodeLang,
  type ProblemId,
} from '@/components/placement/technical/problems'
import { cn } from '@/lib/utils'

// -----------------------------------------------------------------------------
// Copy & constants
// -----------------------------------------------------------------------------

const TITLE = 'Technical Round · तकनीकी राउंड'
const SUBTITLE: Bi = {
  en: 'Branch-aware: coding for IT-services drives, a core-technical round for core branches. Proctored; tab switches are detected.',
  hi: 'ब्रांच के अनुसार: IT-सर्विसेज़ ड्राइव के लिए कोडिंग, कोर ब्रांच के लिए कोर-तकनीकी राउंड। प्रॉक्टर्ड; टैब बदलना पकड़ा जाता है।',
  hinglish: 'Branch-aware: IT-services drives ke liye coding, core branches ke liye core-technical round. Proctored; tab switch detect hota hai.',
}

const TXT = {
  next: { en: 'Next round', hi: 'अगला राउंड', hinglish: 'Next round' },
  cleared: { en: 'Technical cleared', hi: 'तकनीकी राउंड पास', hinglish: 'Technical cleared' },
  liveCoding: {
    en: 'Run → Submit → read the AI review. Hints cost points.',
    hi: 'Run → Submit → AI रिव्यू पढ़ें। संकेत के अंक कटते हैं।',
    hinglish: 'Run → Submit → AI review padho. Hints ke points katte hain.',
  },
  liveCore: {
    en: 'Answer the MCQs, then the shop-floor case by text or voice.',
    hi: 'MCQ के उत्तर दें, फिर शॉप-फ़्लोर केस लिखकर या बोलकर।',
    hinglish: 'MCQs answer karo, phir shop-floor case likhkar ya bolkar.',
  },
  left: { en: 'left', hi: 'शेष', hinglish: 'left' },
  submitted: { en: 'Submitted', hi: 'सबमिट हो गया', hinglish: 'Submitted' },
  recommended: { en: 'Recommended', hi: 'सुझाया गया', hinglish: 'Recommended' },
  coachIntro: {
    en: 'After your first Submit, Sarthi reviews complexity, edge cases and readability, and proposes a diff.',
    hi: 'पहले सबमिट के बाद सारथी complexity, एज केस और पठनीयता की समीक्षा करता है और एक diff सुझाता है।',
    hinglish: 'Pehle Submit ke baad Sarthi complexity, edge cases aur readability review karta hai, aur ek diff suggest karta hai.',
  },
  practiceToast: {
    en: 'Practice problem: sample tests only',
    hi: 'अभ्यास प्रश्न: केवल सैंपल टेस्ट',
    hinglish: 'Practice problem: sirf sample tests',
  },
  practiceDesc: {
    en: 'Hidden tests and the AI review run on Q1 in this demo.',
    hi: 'इस डेमो में छिपे टेस्ट और AI रिव्यू Q1 पर चलते हैं।',
    hinglish: 'Is demo mein hidden tests aur AI review Q1 par chalte hain.',
  },
  reviewing: { en: 'Sarthi is reviewing your code', hi: 'सारथी आपका कोड रिव्यू कर रहा है', hinglish: 'Sarthi aapka code review kar raha hai' },
  allPass: { en: '10/10 hidden tests passed', hi: '10/10 छिपे टेस्ट पास', hinglish: '10/10 hidden tests pass' },
  allPassDesc: { en: 'Now O(n) time, O(1) space. Round scored.', hi: 'अब O(n) समय, O(1) स्पेस। राउंड का स्कोर तैयार।', hinglish: 'Ab O(n) time, O(1) space. Round scored.' },
  fixApplied: { en: 'Fix applied: two-pointer', hi: 'सुधार लागू: टू-पॉइंटर', hinglish: 'Fix applied: two-pointer' },
  fixAppliedDesc: { en: 'Read the change, then Submit again.', hi: 'बदलाव पढ़ें, फिर से सबमिट करें।', hinglish: 'Change padho, phir Submit karo.' },
  scoredCoding: { en: 'Coding · scored by Sarthi AI', hi: 'कोडिंग · सारथी AI द्वारा स्कोर', hinglish: 'Coding · Sarthi AI ne score kiya' },
  codingSub: {
    en: 'Brute force first, fixed fast after one nudge: the pattern recruiters want to see in a fresher.',
    hi: 'पहले brute force, एक संकेत के बाद तुरंत सुधार: फ़्रेशर में भर्तीकर्ता यही देखना चाहते हैं।',
    hinglish: 'Pehle brute force, ek nudge ke baad turant fix: fresher mein recruiters yahi dekhna chahte hain.',
  },
} satisfies Record<string, Bi>

const SIG = {
  brute: { en: 'Reaches for brute force first; fixes fast after a nudge', hi: 'पहले brute force, संकेत मिलते ही सुधार', hinglish: 'Pehle brute force, nudge milte hi fix' },
  twoPointer: { en: 'Two-pointer pattern understood', hi: 'टू-पॉइंटर पैटर्न समझ लिया', hinglish: 'Two-pointer pattern samajh liya' },
} satisfies Record<string, Bi>

type TrackId = 'coding' | CoreTrackId

const TRACKS: { id: TrackId; label: Bi; Icon: typeof Code2 }[] = [
  { id: 'coding', label: { en: 'Coding (IT services)', hi: 'कोडिंग (IT सर्विसेज़)', hinglish: 'Coding (IT services)' }, Icon: Code2 },
  { id: 'mech', label: { en: 'Core Mechanical & Automobile', hi: 'कोर मैकेनिकल और ऑटोमोबाइल', hinglish: 'Core Mechanical & Automobile' }, Icon: Cog },
  { id: 'elec', label: { en: 'Core Electrical', hi: 'कोर इलेक्ट्रिकल', hinglish: 'Core Electrical' }, Icon: Zap },
  { id: 'civil', label: { en: 'Civil', hi: 'सिविल', hinglish: 'Civil' }, Icon: Building2 },
  { id: 'fire', label: { en: 'Fire & Safety', hi: 'फ़ायर और सेफ़्टी', hinglish: 'Fire & Safety' }, Icon: Flame },
]

const ROUND_SECONDS = 45 * 60
/** Reading time already used when the page opens (the candidate's first draft is in the editor). */
const START_ELAPSED = 580

const MZ = problemById('move-zeros')

// -----------------------------------------------------------------------------
// Small helpers
// -----------------------------------------------------------------------------

const LG_QUERY = '(min-width: 1024px)'
function subscribeLg(cb: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const mq = window.matchMedia(LG_QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
function useIsLg(): boolean {
  return useSyncExternalStore(
    subscribeLg,
    () => (typeof window !== 'undefined' && !!window.matchMedia ? window.matchMedia(LG_QUERY).matches : false),
    () => false,
  )
}

function initialCode(pid: ProblemId, lang: CodeLang): string {
  const p = problemById(pid)
  if (p.scripted && p.brute) return p.brute[lang] ?? p.starter[lang]
  return p.starter[lang]
}

const keyOf = (pid: ProblemId, lang: CodeLang) => `${pid}:${lang}`

function roundOfRoute(route: string) {
  return ROUNDS.find((r) => r.id !== 'eligibility' && r.route === route)
}

function RoundTimer({ elapsedRef, running }: { elapsedRef: MutableRefObject<number>; running: boolean }) {
  const [sec, setSec] = useState(() => elapsedRef.current)
  useEffect(() => {
    setSec(elapsedRef.current)
    if (!running) return
    const id = setInterval(() => {
      elapsedRef.current += 1
      setSec(elapsedRef.current)
    }, 1000)
    return () => clearInterval(id)
  }, [running, elapsedRef])
  if (!running) {
    return (
      <span className="inline-flex items-center gap-1.5 text-emerald-200">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
        <Tr b={TXT.submitted} />
      </span>
    )
  }
  const left = Math.max(0, ROUND_SECONDS - sec)
  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')
  return (
    <span className={cn('inline-flex items-center gap-1.5 tabular-nums', left < 300 ? 'text-amber-200' : 'text-gray-200')}>
      <Timer className="h-3.5 w-3.5 text-cyan-300" aria-hidden />
      {mm}:{ss}
      <span className="hidden text-gray-500 sm:inline">
        <Tr b={TXT.left} />
      </span>
    </span>
  )
}

function NextButton({ onClick, disabled, label, size = 'lg' }: { onClick: () => void; disabled?: boolean; label: Bi; size?: 'lg' | 'sm' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 font-semibold text-[#06121a] shadow-[0_10px_30px_-10px_rgba(34,211,238,0.7)] transition-[filter,opacity] hover:brightness-110 disabled:opacity-40',
        size === 'lg' ? 'h-11 px-4 text-[14px] sm:px-6' : 'h-10 px-4 text-[13.5px]',
      )}
    >
      <Tr b={TXT.next} />
      <span className="hidden sm:inline">:</span>
      <span className="hidden sm:inline">
        <Tr b={label} />
      </span>
      <ArrowRight className="h-4 w-4" aria-hidden />
    </button>
  )
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default function TechnicalPage() {
  const router = useRouter()
  const { state, hydrated, personaId, persona, includeGd, rounds, setRound, addSignal } = useDemo()
  const score = ROUND_TARGETS[personaId]?.technical ?? ROUND_TARGETS.priya.technical
  const recommended: TrackId = isCoreBlueprint(state.blueprintId) || personaId === 'rahul' ? 'mech' : 'coding'

  const [track, setTrack] = useState<TrackId>(recommended)
  const [visited, setVisited] = useState<TrackId[]>([recommended])
  const [doneFor, setDoneFor] = useState<string | null>(null)
  const elapsedRef = useRef(START_ELAPSED)

  // After hydration (or a persona switch) open the branch-appropriate track.
  useEffect(() => {
    if (!hydrated) return
    setTrack(recommended)
    setVisited((v) => (v.includes(recommended) ? v : [...v, recommended]))
  }, [hydrated, recommended])

  const rs = rounds.technical
  const status = rs?.status
  useEffect(() => {
    if (!hydrated) return
    if (!status || status === 'locked') setRound('technical', { status: 'live' })
  }, [hydrated, status, setRound])

  const storeDone = hydrated && (status === 'cleared' || status === 'flagged')
  const clearedTrack = typeof rs?.detail?.track === 'string' ? (rs.detail.track as TrackId) : recommended
  const done = storeDone || doneFor === personaId

  const next = nextRoute('technical', includeGd)
  const nextLabel: Bi = roundOfRoute(next)?.label ?? { en: 'Report', hi: 'रिपोर्ट' }
  const goNext = useCallback(() => router.push(next), [router, next])

  const personaRef = useRef(personaId)
  personaRef.current = personaId

  useDemoEvent('reset', () => setDoneFor(null))

  const onCodingFinish = useCallback(
    (info: { bruteLang: CodeLang | null }) => {
      const pid = personaRef.current
      const sc = ROUND_TARGETS[pid]?.technical ?? ROUND_TARGETS.priya.technical
      if (info.bruteLang) addSignal({ round: 'technical', kind: 'behaviour', text: SIG.brute })
      addSignal({ round: 'technical', kind: 'strength', text: SIG.twoPointer })
      const sig = info.bruteLang ? bruteSignal(info.bruteLang) : { bruteForce: 'none', signalChip: 'two-pointer on first submit' }
      setRound('technical', { status: 'cleared', score: sc, detail: { ...sig, track: 'coding' } })
      setDoneFor(pid)
    },
    [addSignal, setRound],
  )

  const onCoreFinish = useCallback(
    (r: CoreResult) => {
      const pid = personaRef.current
      const tk = CORE_ITEMS[r.trackId]
      for (const s of tk.signals) {
        if (s.kind === 'gap' && r.correct === r.total) continue
        addSignal({ round: 'technical', kind: s.kind, text: s.text })
      }
      const chip = r.hasCase && r.missed.length === 0 ? (tk.signalChipCovered ?? tk.signalChip) : tk.signalChip
      setRound('technical', {
        status: 'cleared',
        score: r.score,
        detail: { signalChip: chip, track: r.trackId, mcq: `${r.correct}/${r.total}`, answers: r.answers, caseText: r.caseText },
      })
      setDoneFor(pid)
    },
    [addSignal, setRound],
  )

  const selectTrack = (v: string) => {
    const id = TRACKS.find((x) => x.id === v)?.id
    if (!id) return
    setTrack(id)
    setVisited((cur) => (cur.includes(id) ? cur : [...cur, id]))
  }

  const recLabel = TRACKS.find((x) => x.id === recommended)?.label ?? TRACKS[0].label
  const firstName = persona.name.split(' ')[0] || persona.name
  const firstNameHi = persona.nameHi.split(' ')[0] || persona.nameHi
  const matchLine: Bi = {
    en: `Sarthi matched ${firstName} (${persona.branchLabel}) to the ${recLabel.en} track from the branch and the drive blueprint.`,
    hi: `सारथी ने ब्रांच और ड्राइव ब्लूप्रिंट देखकर ${firstNameHi} (${persona.branchLabel}) के लिए ${recLabel.hi} ट्रैक चुना।`,
    hinglish: `Sarthi ne branch aur drive blueprint dekhkar ${firstName} (${persona.branchLabel}) ke liye ${recLabel.en} track chuna.`,
  }

  const nextAction = <NextButton onClick={goNext} label={nextLabel} size="sm" />

  const footer = (
    <div className="flex items-center gap-3">
      {done ? (
        <span className="inline-flex items-center gap-2 text-[13px] text-emerald-200">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">
            <Tr b={TXT.cleared} />
          </span>
          <span className="font-semibold tabular-nums text-white">{rs?.score ?? score}</span>
        </span>
      ) : (
        <span className="inline-flex min-w-0 items-center gap-2 text-[13px] text-gray-400">
          <Sparkles className="h-4 w-4 shrink-0 text-violet-300" aria-hidden />
          <span className="hidden truncate sm:inline">
            <Tr b={track === 'coding' ? TXT.liveCoding : TXT.liveCore} />
          </span>
        </span>
      )}
      <div className="ml-auto">
        <NextButton onClick={goNext} disabled={!done} label={nextLabel} />
      </div>
    </div>
  )

  return (
    <DriveShell
      round="technical"
      title={TITLE}
      subtitle={SUBTITLE}
      detectTabs
      timer={<RoundTimer elapsedRef={elapsedRef} running={!done} />}
      footer={footer}
    >
      <div className="space-y-4">
        <div className="space-y-2.5">
          <Tabs value={track} onValueChange={selectTrack}>
            <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02] p-1 scrollbar-hide">
              {TRACKS.map(({ id, label, Icon }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="h-9 shrink-0 gap-1.5 rounded-lg px-3 text-[13px] text-gray-400 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white data-[state=active]:shadow-none"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  <Tr b={label} />
                  {id === recommended && (
                    <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400" title="Recommended" aria-label="Recommended" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <p className="flex items-start gap-2 text-[12.5px] leading-snug text-gray-400">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-300" aria-hidden />
            <Tr b={matchLine} />
          </p>
        </div>

        <div key={personaId}>
          {visited.includes('coding') && (
            <div className={track === 'coding' ? 'block' : 'hidden'}>
              <CodingRound
                active={track === 'coding'}
                restoreDone={storeDone && clearedTrack === 'coding'}
                score={score}
                personaName={{ en: firstName, hi: firstNameHi }}
                elapsedRef={elapsedRef}
                onFinish={onCodingFinish}
                onNext={goNext}
                nextAction={nextAction}
              />
            </div>
          )}
          {TRACKS.filter((x) => x.id !== 'coding' && visited.includes(x.id)).map(({ id }) => (
            <div key={id} className={track === id ? 'block' : 'hidden'}>
              <CoreRound
                track={CORE_ITEMS[id as CoreTrackId]}
                active={track === id}
                restoreDone={storeDone && clearedTrack === id}
                restoreAnswers={typeof rs?.detail?.answers === 'string' ? rs.detail.answers : undefined}
                restoreCaseText={typeof rs?.detail?.caseText === 'string' ? rs.detail.caseText : undefined}
                score={score}
                elapsedRef={elapsedRef}
                onFinish={onCoreFinish}
                onNext={goNext}
                nextAction={nextAction}
              />
            </div>
          ))}
        </div>
      </div>
    </DriveShell>
  )
}

// -----------------------------------------------------------------------------
// Coding track
// -----------------------------------------------------------------------------

interface ReviewState {
  cls: CodeClass
  lang: CodeLang
  before: string
}

interface CodingRoundProps {
  active: boolean
  restoreDone: boolean
  score: number
  personaName: { en: string; hi: string }
  elapsedRef: MutableRefObject<number>
  onFinish: (info: { bruteLang: CodeLang | null }) => void
  onNext: () => void
  nextAction?: ReactNode
}

function CodingRound({ active, restoreDone, score, personaName, elapsedRef, onFinish, onNext, nextAction }: CodingRoundProps) {
  const { t } = useDemo()
  const isLg = useIsLg()

  const [problemId, setProblemId] = useState<ProblemId>('move-zeros')
  const [codeLang, setCodeLang] = useState<CodeLang>('python')
  const [codes, setCodes] = useState<Record<string, string>>({})
  const [leftTab, setLeftTab] = useState<LeftTab>('problem')
  const [coachBadge, setCoachBadge] = useState(false)
  const [view, setView] = useState<ResultsView>('sample')
  const [sample, setSample] = useState<SampleRunView | null>(null)
  const [hidden, setHidden] = useState<HiddenRunView | null>(null)
  const [busy, setBusy] = useState<null | 'run' | 'submit' | 'typing'>(null)
  const [auto, setAuto] = useState(false)
  const [ghost, setGhost] = useState<number | null>(null)
  const [review, setReview] = useState<ReviewState | null>(null)
  const [hintMap, setHintMap] = useState<Record<string, number>>({})
  const [apply, setApply] = useState<ApplyState>('idle')
  const [passedAll, setPassedAll] = useState(false)
  const [finished, setFinished] = useState<{ minutes: number; hintsUsed: number; penalty: number } | null>(null)
  const [instant, setInstant] = useState(false)
  const [flash, setFlash] = useState(0)

  const genRef = useRef(0)
  const mountedRef = useRef(true)
  const autoRef = useRef(false)
  const finishedRef = useRef(false)
  const touchedRef = useRef(false)
  const codesRef = useRef<Record<string, string>>({})
  const attemptsRef = useRef(0)
  const bruteLangRef = useRef<CodeLang | null>(null)
  const reviewRef = useRef<ReviewState | null>(null)
  const reviewDoneRef = useRef(false)
  const hintMapRef = useRef<Record<string, number>>({})
  const applyRef = useRef<ApplyState>('idle')
  const langRef = useRef(codeLang)
  langRef.current = codeLang
  const scoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      genRef.current++
    }
  }, [])

  const problem = problemById(problemId)
  const code = codes[keyOf(problemId, codeLang)] ?? initialCode(problemId, codeLang)
  const curHints = hintMap[problemId] ?? 0

  const wait = useCallback(
    (ms: number, g: number) =>
      new Promise<boolean>((resolve) => setTimeout(() => resolve(mountedRef.current && genRef.current === g), ms)),
    [],
  )

  const waitUntil = useCallback(
    async (pred: () => boolean, g: number, maxMs: number) => {
      let waited = 0
      while (!pred()) {
        if (!(await wait(100, g))) return false
        waited += 100
        if (waited >= maxMs) break
      }
      return mountedRef.current && genRef.current === g
    },
    [wait],
  )

  const getCode = useCallback((pid: ProblemId, lang: CodeLang) => codesRef.current[keyOf(pid, lang)] ?? initialCode(pid, lang), [])

  const setCodeFor = useCallback((pid: ProblemId, lang: CodeLang, v: string) => {
    codesRef.current = { ...codesRef.current, [keyOf(pid, lang)]: v }
    setCodes(codesRef.current)
  }, [])

  const setApplyState = (s: ApplyState) => {
    applyRef.current = s
    setApply(s)
  }

  // Types `target` into the editor, replacing only the part that differs from the current code.
  const typeTo = useCallback(
    async (pid: ProblemId, lang: CodeLang, target: string, g: number, perTick: number, tickMs: number) => {
      const cur = getCode(pid, lang)
      let pre = 0
      const maxPre = Math.min(cur.length, target.length)
      while (pre < maxPre && cur[pre] === target[pre]) pre++
      let suf = 0
      const maxSuf = Math.min(cur.length, target.length) - pre
      while (suf < maxSuf && cur[cur.length - 1 - suf] === target[target.length - 1 - suf]) suf++
      const head = target.slice(0, pre)
      const tail = target.slice(target.length - suf)
      const mid = target.slice(pre, target.length - suf)
      setCodeFor(pid, lang, head + tail)
      setGhost(pre)
      for (let i = 0; i < mid.length; ) {
        if (!(await wait(tickMs, g))) return false
        i = Math.min(mid.length, i + perTick)
        setCodeFor(pid, lang, head + mid.slice(0, i) + tail)
        setGhost(pre + i)
      }
      setGhost(null)
      return true
    },
    [getCode, setCodeFor, wait],
  )

  const finish = useCallback(
    (silent: boolean) => {
      if (finishedRef.current) return
      finishedRef.current = true
      const used = hintMapRef.current['move-zeros'] ?? 0
      const penalty = MZ.hints.slice(0, used).reduce((s, h) => s + h.penalty, 0)
      const minutes = Math.max(1, Math.round((elapsedRef.current || 0) / 60))
      setFinished({ minutes, hintsUsed: used, penalty })
      if (!silent) onFinish({ bruteLang: bruteLangRef.current })
    },
    [elapsedRef, onFinish],
  )

  const doRun = useCallback(
    async (g: number, pid: ProblemId, lang: CodeLang) => {
      const p = problemById(pid)
      const cls = classifyCode(getCode(pid, lang), lang, p)
      const results = gradeSamples(p, cls, lang)
      setBusy('run')
      setView('sample')
      setSample({ phase: 'compiling', results, shown: 0 })
      if (!(await wait(900, g))) return false
      setSample((s) => (s ? { ...s, phase: 'revealing' } : s))
      for (let i = 1; i <= results.length; i++) {
        if (!(await wait(170, g))) return false
        setSample((s) => (s ? { ...s, shown: i } : s))
      }
      setSample((s) => (s ? { ...s, phase: 'done' } : s))
      setBusy(null)
      return true
    },
    [getCode, wait],
  )

  const doSubmit = useCallback(
    async (g: number, pid: ProblemId, lang: CodeLang) => {
      const p = problemById(pid)
      if (!p.scripted) {
        aiToast(t(TXT.practiceToast), { description: t(TXT.practiceDesc) })
        return doRun(g, pid, lang)
      }
      const before = getCode(pid, lang)
      const cls = classifyCode(before, lang, p)
      const results = gradeHidden(cls, lang)
      const attempt = ++attemptsRef.current
      setBusy('submit')
      setView('hidden')
      setHidden({ phase: 'running', results, shown: 0, attempt })
      if (!(await wait(450, g))) return false
      for (let i = 1; i <= results.length; i++) {
        if (!(await wait(120, g))) return false
        setHidden((h) => (h ? { ...h, shown: i } : h))
      }
      setHidden((h) => (h ? { ...h, phase: 'done' } : h))
      setBusy(null)
      const passed = results.filter((r) => r.verdict === 'pass').length
      const tle = results.filter((r) => r.verdict === 'tle').length
      if (cls === 'brute' && !bruteLangRef.current) bruteLangRef.current = lang
      if (!reviewRef.current) {
        const rv: ReviewState = { cls, lang, before }
        reviewRef.current = rv
        setReview(rv)
        setLeftTab('coach')
        setCoachBadge(true)
      }
      if (passed === results.length) {
        setPassedAll(true)
        aiToast(t(TXT.allPass), { tone: 'ok', description: t(TXT.allPassDesc) })
        finish(false)
      } else {
        aiToast(`${passed}/${results.length} hidden tests passed${tle ? ` · ${tle} TLE (N = 10⁵)` : ''}`, {
          tone: 'warn',
          description: t(TXT.reviewing),
        })
      }
      return true
    },
    [doRun, finish, getCode, t, wait],
  )

  const doApplyFix = useCallback(
    async (g: number) => {
      const lang = langRef.current
      const target = MZ.fixed?.[lang]
      if (!target) return true
      setProblemId('move-zeros')
      setApplyState('typing')
      setBusy('typing')
      const ok = await typeTo('move-zeros', lang, target, g, 8, 16)
      if (!ok) return false
      setBusy(null)
      setApplyState('applied')
      setFlash((f) => f + 1)
      aiToast(t(TXT.fixApplied), { description: t(TXT.fixAppliedDesc) })
      return true
    },
    [t, typeTo],
  )

  const unlockHint = useCallback((pid: ProblemId, level: number) => {
    const cur = hintMapRef.current[pid] ?? 0
    if (level !== cur + 1) return
    hintMapRef.current = { ...hintMapRef.current, [pid]: level }
    setHintMap(hintMapRef.current)
    setLeftTab('coach')
  }, [])

  // ---------------------------------------------------------------------------
  // Manual controls
  // ---------------------------------------------------------------------------
  const locked = auto || busy !== null || (finished !== null && problemId === 'move-zeros')
  const onRun = () => {
    if (busy || auto) return
    touchedRef.current = true
    const g = ++genRef.current
    void doRun(g, problemId, codeLang)
  }
  const onSubmit = () => {
    if (busy || auto || finishedRef.current) return
    touchedRef.current = true
    const g = ++genRef.current
    void doSubmit(g, problemId, codeLang)
  }
  const onApplyFix = () => {
    if (busy || auto || applyRef.current !== 'idle') return
    touchedRef.current = true
    const g = ++genRef.current
    void doApplyFix(g)
  }
  const onReset = () => {
    touchedRef.current = true
    setCodeFor(problemId, codeLang, problem.starter[codeLang])
  }

  // ---------------------------------------------------------------------------
  // Presenter: fast-forward, autopilot, reset
  // ---------------------------------------------------------------------------
  const jumpToEnd = useCallback(
    (silent: boolean) => {
      genRef.current++
      autoRef.current = false
      setAuto(false)
      const lang = langRef.current
      setProblemId('move-zeros')
      setCodeFor('move-zeros', lang, MZ.fixed?.[lang] ?? MZ.starter[lang])
      setGhost(null)
      setBusy(null)
      setSample({ phase: 'done', results: gradeSamples(MZ, 'optimal', lang), shown: MZ.samples.length })
      attemptsRef.current = Math.max(2, attemptsRef.current + 1)
      setHidden({ phase: 'done', results: gradeHidden('optimal', lang), shown: 10, attempt: attemptsRef.current })
      setView('hidden')
      if (!reviewRef.current) {
        const rv: ReviewState = { cls: 'brute', lang, before: MZ.brute?.[lang] ?? '' }
        reviewRef.current = rv
        setReview(rv)
      }
      if (!bruteLangRef.current && reviewRef.current.cls === 'brute') bruteLangRef.current = reviewRef.current.lang
      reviewDoneRef.current = true
      if ((hintMapRef.current['move-zeros'] ?? 0) < 1) {
        hintMapRef.current = { ...hintMapRef.current, 'move-zeros': 1 }
        setHintMap(hintMapRef.current)
      }
      setApplyState('applied')
      setPassedAll(true)
      setInstant(true)
      setLeftTab('coach')
      setCoachBadge(false)
      if (elapsedRef.current < 660) elapsedRef.current = 660
      finish(silent)
    },
    [elapsedRef, finish, setCodeFor],
  )

  const runAuto = useCallback(async () => {
    if (autoRef.current || finishedRef.current) return
    autoRef.current = true
    setAuto(true)
    touchedRef.current = true
    const g = ++genRef.current
    const lang = langRef.current
    try {
      setBusy(null)
      setProblemId('move-zeros')
      setLeftTab('problem')
      if (!reviewRef.current) {
        // 1. Type the first attempt (brute force) at ~25 chars/s.
        setCodeFor('move-zeros', lang, MZ.starter[lang])
        if (!(await wait(500, g))) return
        setBusy('typing')
        if (!(await typeTo('move-zeros', lang, MZ.brute?.[lang] ?? MZ.starter[lang], g, 1, 40))) return
        setBusy(null)
        if (!(await wait(450, g))) return
        // 2. Run, then Submit (8/10).
        if (!(await doRun(g, 'move-zeros', lang))) return
        if (!(await wait(700, g))) return
        if (!(await doSubmit(g, 'move-zeros', lang))) return
        if (finishedRef.current) return
      }
      // 3. Wait for the review to stream.
      if (!(await waitUntil(() => reviewDoneRef.current, g, 15000))) return
      if (!(await wait(800, g))) return
      // 4. Nudge → Apply fix → Submit (10/10).
      if ((hintMapRef.current['move-zeros'] ?? 0) < 1) unlockHint('move-zeros', 1)
      if (!(await wait(2600, g))) return
      if (applyRef.current !== 'applied') {
        if (!(await doApplyFix(g))) return
      }
      if (!(await wait(650, g))) return
      await doSubmit(g, 'move-zeros', lang)
    } finally {
      if (genRef.current === g) {
        autoRef.current = false
        setAuto(false)
      }
    }
  }, [doApplyFix, doRun, doSubmit, setCodeFor, typeTo, unlockHint, wait, waitUntil])

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
    codesRef.current = {}
    attemptsRef.current = 0
    bruteLangRef.current = null
    reviewRef.current = null
    reviewDoneRef.current = false
    hintMapRef.current = {}
    applyRef.current = 'idle'
    setProblemId('move-zeros')
    setCodes({})
    setLeftTab('problem')
    setCoachBadge(false)
    setView('sample')
    setSample(null)
    setHidden(null)
    setBusy(null)
    setAuto(false)
    setGhost(null)
    setReview(null)
    setHintMap({})
    setApply('idle')
    setPassedAll(false)
    setFinished(null)
    setInstant(false)
  })

  // Revisit after the round was cleared: show the final state without re-writing the store.
  useEffect(() => {
    if (restoreDone && !finishedRef.current && !touchedRef.current) jumpToEnd(true)
  }, [restoreDone, jumpToEnd])

  // Bring the score into view when it lands (not on a silent restore).
  useEffect(() => {
    if (!finished || instant || !active) return
    const id = setTimeout(() => {
      try {
        scoreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } catch {
        /* ignore */
      }
    }, 120)
    return () => clearTimeout(id)
  }, [finished, instant, active])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const draftLabel: Bi | null =
    problem.scripted && problem.brute && code === problem.brute[codeLang]
      ? { en: `${personaName.en}'s first attempt`, hi: `${personaName.hi} का पहला प्रयास`, hinglish: `${personaName.en} ka first attempt` }
      : null

  const scoreChips: ScoreChip[] = useMemo(() => {
    if (!finished) return []
    return [
      { id: 'tests', tone: 'ok', label: { en: 'Tests 10/10', hi: 'टेस्ट 10/10', hinglish: 'Tests 10/10' } },
      { id: 'eff', tone: 'info', label: { en: 'Efficiency O(n)', hi: 'दक्षता O(n)', hinglish: 'Efficiency O(n)' } },
      finished.hintsUsed > 0
        ? {
            id: 'hint',
            tone: 'penalty',
            label:
              finished.hintsUsed === 1
                ? { en: `Hint used (−${finished.penalty})`, hi: `संकेत लिया (−${finished.penalty})`, hinglish: `Hint used (−${finished.penalty})` }
                : { en: `Hints used (−${finished.penalty})`, hi: `संकेत लिए (−${finished.penalty})`, hinglish: `Hints used (−${finished.penalty})` },
          }
        : { id: 'hint', tone: 'ok', label: { en: 'No hints', hi: 'कोई संकेत नहीं', hinglish: 'No hints' } },
      { id: 'time', tone: 'time', label: { en: `Time ${finished.minutes}m`, hi: `समय ${finished.minutes} मि.`, hinglish: `Time ${finished.minutes}m` } },
    ]
  }, [finished])

  const reviewAfter = review ? (MZ.fixed?.[review.lang] ?? null) : null
  const showReview = review !== null && problemId === 'move-zeros'

  const coach = (
    <div className="space-y-4">
      {showReview && review ? (
        <CodeReview
          cls={review.cls}
          codeLang={review.lang}
          before={review.before}
          after={reviewAfter}
          fixed={passedAll}
          instant={instant}
          onStreamDone={() => {
            reviewDoneRef.current = true
          }}
          onApplyFix={onApplyFix}
          applyState={apply}
          locked={locked}
        />
      ) : (
        <div className="flex items-start gap-2.5 rounded-xl border border-dashed border-violet-400/25 bg-violet-500/[0.04] p-3.5">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" aria-hidden />
          <Tr b={TXT.coachIntro} as="p" className="block text-[13px] leading-relaxed text-gray-300" />
        </div>
      )}
      <HintLadder
        key={problemId}
        hints={problem.hints}
        codeLang={codeLang}
        unlocked={curHints}
        onUnlock={(lvl) => {
          touchedRef.current = true
          unlockHint(problemId, lvl)
        }}
        onApplyFix={onApplyFix}
        applyState={problemId === 'move-zeros' ? apply : 'idle'}
        canApply={problem.scripted && !!problem.fixed && !passedAll}
        locked={auto || busy !== null || (problemId === 'move-zeros' && finished !== null)}
        instant={instant}
      />
    </div>
  )

  const editor = (
    <CodeEditor
      value={code}
      onChange={(v) => {
        touchedRef.current = true
        setCodeFor(problemId, codeLang, v)
      }}
      lang={codeLang}
      onLangChange={(l) => setCodeLang(l)}
      onRun={onRun}
      onSubmit={onSubmit}
      onReset={onReset}
      readOnly={ghost !== null || auto || busy === 'typing'}
      ghostCaret={ghost}
      running={busy === 'run'}
      submitting={busy === 'submit'}
      locked={locked}
      draftLabel={draftLabel}
      flash={flash}
      className={isLg ? undefined : 'h-[340px] min-h-[260px]'}
    />
  )

  const results = (
    <TestResults
      view={view}
      onViewChange={setView}
      sample={sample}
      hidden={hidden}
      scripted={problem.scripted}
      hiddenCount={problem.hiddenCount}
      className={isLg ? undefined : 'h-auto'}
    />
  )

  const panel = (
    <ProblemPanel
      problems={PROBLEMS}
      problemId={problemId}
      onProblemChange={(id) => {
        touchedRef.current = true
        setProblemId(id)
        setView('sample')
        setSample(null)
      }}
      tab={leftTab}
      onTabChange={(tab) => {
        setLeftTab(tab)
        if (tab === 'coach') setCoachBadge(false)
      }}
      coach={isLg ? coach : undefined}
      coachBadge={coachBadge && leftTab !== 'coach'}
      locked={auto || busy !== null}
      className={isLg ? undefined : 'h-[min(460px,72vh)]'}
    />
  )

  return (
    <div className="space-y-4">
      {finished && (
        <div ref={scoreRef} className="scroll-mt-28">
          <ScoreCard
            score={score}
            title={TXT.scoredCoding}
            subtitle={bruteLangRef.current ? TXT.codingSub : undefined}
            chips={scoreChips}
            instant={instant}
            actions={nextAction}
          />
        </div>
      )}

      {isLg ? (
        <div className="h-[max(540px,calc(100dvh-300px))]">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={41} minSize={28} className="pr-1.5">
              {panel}
            </ResizablePanel>
            <ResizableHandle withHandle className="bg-white/[0.06]" />
            <ResizablePanel defaultSize={59} minSize={38} className="pl-1.5">
              <ResizablePanelGroup direction="vertical" className="h-full">
                <ResizablePanel defaultSize={60} minSize={30} className="pb-1.5">
                  {editor}
                </ResizablePanel>
                <ResizableHandle withHandle className="bg-white/[0.06]" />
                <ResizablePanel defaultSize={40} minSize={20} className="pt-1.5">
                  {results}
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      ) : (
        <div className="space-y-3">
          {panel}
          {editor}
          {results}
          <section className="rounded-xl border border-white/10 bg-white/[0.02] p-3">{coach}</section>
        </div>
      )}
    </div>
  )
}
