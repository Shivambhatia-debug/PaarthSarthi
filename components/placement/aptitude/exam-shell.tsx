'use client'

// Round 1 exam engine + layout (iON-like): sectional timers, adaptive difficulty, palette, Mark for review,
// Clear, Save & Next, live difficulty ladder and a rough-work pad. The page owns the hook so the DriveShell
// timer and sticky footer can read the same state.

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { ArrowRight, Bookmark, BookmarkCheck, Eraser, Lock, PenLine, ShieldCheck, Timer } from 'lucide-react'
import { useDemo, useDemoEvent } from '@/lib/os/demo-store'
import { sleep } from '@/lib/ai-sim'
import { aiToast } from '@/components/ai/ai-toast'
import { AIBadge } from '@/components/ai/ai-badge'
import { Tr } from '@/components/os/tr-text'
import { tr } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'
import {
  APT_SECTIONS,
  DIFFICULTY_LABEL,
  SECTION_SECONDS,
  START_LEVEL,
  TOTAL_SLOTS,
  autopilotCorrect,
  buildLadder,
  nextLevel,
  pickQuestion,
  questionById,
  sectionOfSlot,
  slotsOfSection,
  wrongOption,
  type Difficulty,
  type LadderStep,
} from '@/components/placement/aptitude/questions'
import { QuestionCard, type AdjustInfo } from '@/components/placement/aptitude/question-card'
import { QuestionPalette } from '@/components/placement/aptitude/question-palette'
import { DifficultyLadder, LADDER_TITLE } from '@/components/placement/aptitude/difficulty-ladder'

// ---------------------------------------------------------------------------
// State machine (pure)
// ---------------------------------------------------------------------------

export interface SlotState {
  qid: string | null
  /** Current selection (draft until saved). */
  answer: number | null
  /** Last saved answer. */
  saved: number | null
  marked: boolean
  visited: boolean
  /** First Save & Next with an answer happened (the adaptive step was applied). */
  committed: boolean
  correct: boolean | null
  difficulty: Difficulty | null
}

export interface ExamState {
  slots: SlotState[]
  current: number
  level: Difficulty
  section: number
  sectionLeft: number[]
  locked: boolean[]
  phase: 'answering' | 'adjusting' | 'done'
  adjust: (AdjustInfo & { next: number; seq: number }) | null
  steps: LadderStep[]
  endedBy: 'submit' | 'time' | 'fast' | null
  /** Section index whose timer just ran out (for a one-time toast). */
  timeout: { section: number; seq: number } | null
  seq: number
}

type Action =
  | { type: 'select'; option: number }
  | { type: 'clear' }
  | { type: 'mark' }
  | { type: 'goto'; slot: number }
  | { type: 'saveNext' }
  | { type: 'advance' }
  | { type: 'tick' }
  | { type: 'fastFill' }
  | { type: 'reset' }

const N_SECTIONS = APT_SECTIONS.length

function emptySlot(): SlotState {
  return { qid: null, answer: null, saved: null, marked: false, visited: false, committed: false, correct: null, difficulty: null }
}

function assign(slots: SlotState[], idx: number, level: Difficulty): SlotState[] {
  if (slots[idx]?.qid) {
    const next = slots.slice()
    next[idx] = { ...next[idx], visited: true }
    return next
  }
  const q = pickQuestion(APT_SECTIONS[sectionOfSlot(idx)].id, level, slots.map((s) => s.qid))
  const next = slots.slice()
  next[idx] = { ...emptySlot(), qid: q.id, visited: true, difficulty: q.difficulty }
  return next
}

export function initialExam(): ExamState {
  const slots = assign(Array.from({ length: TOTAL_SLOTS }, emptySlot), 0, START_LEVEL)
  return {
    slots,
    current: 0,
    level: START_LEVEL,
    section: 0,
    sectionLeft: Array.from({ length: N_SECTIONS }, () => SECTION_SECONDS),
    locked: Array.from({ length: N_SECTIONS }, () => false),
    phase: 'answering',
    adjust: null,
    steps: [],
    endedBy: null,
    timeout: null,
    seq: 0,
  }
}

/** Lock `sec` and enter the next section (or finish). */
function leaveSection(s: ExamState, sec: number, endedBy: ExamState['endedBy'], assignNow = true): ExamState {
  const locked = s.locked.slice()
  locked[sec] = true
  const nextSec = sec + 1
  if (nextSec >= N_SECTIONS) {
    return { ...s, locked, phase: 'done', adjust: null, endedBy, section: sec }
  }
  const first = slotsOfSection(nextSec)[0]
  return {
    ...s,
    locked,
    section: nextSec,
    current: first,
    slots: assignNow ? assign(s.slots, first, s.level) : s.slots,
    phase: 'answering',
    adjust: null,
  }
}

function commitSlot(s: ExamState, idx: number, option: number): ExamState {
  const slot = s.slots[idx]
  const q = questionById(slot?.qid)
  if (!slot || !q) return s
  const slots = s.slots.slice()
  if (slot.committed) {
    slots[idx] = { ...slot, answer: option, saved: option, visited: true }
    return { ...s, slots }
  }
  const correct = option === q.answer
  slots[idx] = { ...slot, answer: option, saved: option, visited: true, committed: true, correct }
  return {
    ...s,
    slots,
    steps: [...s.steps, { difficulty: q.difficulty, correct, topic: q.topic }],
    level: nextLevel(s.level, correct),
  }
}

function saveNext(s: ExamState): ExamState {
  if (s.phase !== 'answering') return s
  const cur = s.current
  const slot = s.slots[cur]
  if (!slot) return s
  const before = s.level
  let st: ExamState = s
  if (slot.answer !== null) st = commitSlot(s, cur, slot.answer)
  else {
    const slots = s.slots.slice()
    slots[cur] = { ...slot, visited: true }
    st = { ...s, slots }
  }

  const sec = sectionOfSlot(cur)
  const next = slotsOfSection(sec).find((i) => i > cur && !st.slots[i].committed)
  if (next === undefined) {
    const out = leaveSection(st, sec, 'submit', false)
    if (out.phase === 'done') return out
    // Entering a new section: show the adaptive pill, then reveal its first item.
    return {
      ...out,
      phase: 'adjusting',
      adjust: { from: before, to: out.level, next: out.current, seq: s.seq + 1 },
      seq: s.seq + 1,
    }
  }
  if (st.slots[next].qid) return { ...st, current: next }
  return { ...st, phase: 'adjusting', adjust: { from: before, to: st.level, next, seq: s.seq + 1 }, seq: s.seq + 1 }
}

function fastFill(s: ExamState): ExamState {
  if (s.phase === 'done') return s
  let st: ExamState = { ...s, adjust: null, phase: 'answering' }
  for (let idx = 0; idx < TOTAL_SLOTS; idx++) {
    const sec = sectionOfSlot(idx)
    if (st.locked[sec] || st.slots[idx].committed) continue
    st = { ...st, slots: assign(st.slots, idx, st.level) }
    const q = questionById(st.slots[idx].qid)
    if (!q) continue
    const option = autopilotCorrect(st.steps.length) ? q.answer : wrongOption(q)
    st = commitSlot(st, idx, option)
  }
  return {
    ...st,
    locked: st.locked.map(() => true),
    current: TOTAL_SLOTS - 1,
    section: N_SECTIONS - 1,
    phase: 'done',
    endedBy: 'fast',
  }
}

function reducer(s: ExamState, a: Action): ExamState {
  switch (a.type) {
    case 'select': {
      if (s.phase !== 'answering') return s
      const slots = s.slots.slice()
      slots[s.current] = { ...slots[s.current], answer: a.option }
      return { ...s, slots }
    }
    case 'clear': {
      if (s.phase !== 'answering') return s
      const slots = s.slots.slice()
      slots[s.current] = { ...slots[s.current], answer: null }
      return { ...s, slots }
    }
    case 'mark': {
      if (s.phase !== 'answering') return s
      const slots = s.slots.slice()
      slots[s.current] = { ...slots[s.current], marked: !slots[s.current].marked }
      return { ...s, slots }
    }
    case 'goto': {
      if (s.phase !== 'answering') return s
      const target = s.slots[a.slot]
      if (!target?.qid || sectionOfSlot(a.slot) !== s.section || s.locked[s.section]) return s
      return { ...s, current: a.slot }
    }
    case 'saveNext':
      return saveNext(s)
    case 'advance': {
      if (s.phase !== 'adjusting' || !s.adjust) return s
      const next = s.adjust.next
      return { ...s, slots: assign(s.slots, next, s.level), current: next, phase: 'answering', adjust: null }
    }
    case 'tick': {
      if (s.phase === 'done') return s
      const sec = s.section
      if (s.locked[sec]) return s
      const left = s.sectionLeft.slice()
      left[sec] = Math.max(0, left[sec] - 1)
      if (left[sec] > 0) return { ...s, sectionLeft: left }
      const out = leaveSection({ ...s, sectionLeft: left }, sec, 'time')
      return { ...out, timeout: { section: sec, seq: s.seq + 1 }, seq: s.seq + 1 }
    }
    case 'fastFill':
      return fastFill(s)
    case 'reset':
      return initialExam()
    default:
      return s
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface ExamSummary {
  steps: LadderStep[]
  answered: number
  correct: number
  endLevel: Difficulty
  endedBy: ExamState['endedBy']
}

export function summarize(s: ExamState): ExamSummary {
  return {
    steps: s.steps,
    answered: s.slots.filter((x) => x.saved !== null).length,
    correct: s.slots.filter((x) => x.correct === true).length,
    endLevel: s.level,
    endedBy: s.endedBy,
  }
}

export interface AptitudeExam {
  state: ExamState
  qLang: 'en' | 'hi'
  setQLang: (l: 'en' | 'hi') => void
  select: (option: number) => void
  clear: () => void
  toggleMark: () => void
  goto: (slot: number) => void
  saveNext: () => void
  fastForward: () => void
  reset: () => void
  overallLeft: number
  autopiloting: boolean
}

export interface UseAptitudeExamOptions {
  /** Timers and presenter events run only while active. */
  active: boolean
  onDone: (summary: ExamSummary, fast: boolean) => void
}

export function useAptitudeExam({ active, onDone }: UseAptitudeExamOptions): AptitudeExam {
  const { lang } = useDemo()
  const [state, dispatch] = useReducer(reducer, undefined, initialExam)
  const [qLang, setQLang] = useState<'en' | 'hi'>(() => (lang === 'hi' ? 'hi' : 'en'))
  const [autopiloting, setAutopiloting] = useState(false)

  const stateRef = useRef(state)
  stateRef.current = state
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const activeRef = useRef(active)
  activeRef.current = active

  // Section timers.
  const ticking = active && state.phase !== 'done'
  useEffect(() => {
    if (!ticking) return
    const id = setInterval(() => dispatch({ type: 'tick' }), 1000)
    return () => clearInterval(id)
  }, [ticking])

  // 700 ms "adjusting difficulty" pill, then reveal the next item.
  const adjustSeq = state.adjust?.seq ?? null
  useEffect(() => {
    if (state.phase !== 'adjusting' || adjustSeq === null) return
    const id = setTimeout(() => dispatch({ type: 'advance' }), 700)
    return () => clearTimeout(id)
  }, [state.phase, adjustSeq])

  // Toast only when difficulty is raised.
  const toasted = useRef(new Set<number>())
  useEffect(() => {
    const a = state.adjust
    if (!a || a.to <= a.from || toasted.current.has(a.seq)) return
    toasted.current.add(a.seq)
    aiToast(`Sarthi AI: difficulty raised to ${tr(DIFFICULTY_LABEL[a.to], 'en')}`, {
      tone: 'ai',
      id: `apt-diff-${a.seq}`,
      duration: 2600,
    })
  }, [state.adjust])

  // Section time over.
  const timeoutSeq = state.timeout?.seq ?? null
  useEffect(() => {
    const t0 = stateRef.current.timeout
    if (!t0 || timeoutSeq === null) return
    const label = tr(APT_SECTIONS[t0.section]?.label, 'en')
    aiToast(`${label}: section time over, section locked`, { tone: 'warn', id: `apt-timeout-${t0.seq}` })
  }, [timeoutSeq])

  // Completion (once per run).
  const doneFired = useRef(false)
  useEffect(() => {
    if (state.phase !== 'done') {
      doneFired.current = false
      return
    }
    if (doneFired.current) return
    doneFired.current = true
    onDoneRef.current(summarize(state), state.endedBy === 'fast')
  }, [state])

  const select = useCallback((option: number) => dispatch({ type: 'select', option }), [])
  const clear = useCallback(() => dispatch({ type: 'clear' }), [])
  const toggleMark = useCallback(() => dispatch({ type: 'mark' }), [])
  const goto = useCallback((slot: number) => dispatch({ type: 'goto', slot }), [])
  const doSave = useCallback(() => dispatch({ type: 'saveNext' }), [])
  const fastForward = useCallback(() => dispatch({ type: 'fastFill' }), [])

  // Autopilot driver: Q1 right after 1.2 s, Q2 wrong, the rest right at 900 ms intervals.
  const runId = useRef(0)
  const startAutopilot = useCallback(async () => {
    if (!activeRef.current || stateRef.current.phase === 'done') return
    const id = ++runId.current
    setAutopiloting(true)
    let first = stateRef.current.steps.length === 0
    const alive = () => runId.current === id && activeRef.current
    try {
      let guard = 0
      while (alive() && guard++ < 200) {
        const st = stateRef.current
        if (st.phase === 'done') break
        if (st.phase !== 'answering') {
          await sleep(60)
          continue
        }
        const slotIdx = st.current
        const q = questionById(st.slots[slotIdx]?.qid)
        if (!q) {
          await sleep(60)
          continue
        }
        await sleep(first ? 1200 : 900)
        first = false
        if (!alive()) break
        const now = stateRef.current
        if (now.phase !== 'answering' || now.current !== slotIdx) continue
        const option = autopilotCorrect(now.steps.length) ? q.answer : wrongOption(q)
        dispatch({ type: 'select', option })
        await sleep(280)
        if (!alive()) break
        dispatch({ type: 'saveNext' })
        await sleep(80)
      }
    } finally {
      if (runId.current === id) setAutopiloting(false)
    }
  }, [])

  useEffect(() => {
    return () => {
      runId.current++ // cancel any autopilot on unmount
    }
  }, [])

  const reset = useCallback(() => {
    runId.current++
    setAutopiloting(false)
    toasted.current = new Set()
    dispatch({ type: 'reset' })
  }, [])

  const autopilotingRef = useRef(autopiloting)
  autopilotingRef.current = autopiloting
  useDemoEvent('autopilot', () => {
    if (!activeRef.current || stateRef.current.phase === 'done' || autopilotingRef.current) return
    void startAutopilot()
  })

  useDemoEvent('fastforward', () => {
    if (!activeRef.current || stateRef.current.phase === 'done') return
    runId.current++
    setAutopiloting(false)
    dispatch({ type: 'fastFill' })
  })

  const overallLeft = useMemo(
    () => state.sectionLeft.reduce((sum, v, i) => sum + (state.locked[i] ? 0 : v), 0),
    [state.sectionLeft, state.locked],
  )

  return {
    state,
    qLang,
    setQLang,
    select,
    clear,
    toggleMark,
    goto,
    saveNext: doSave,
    fastForward,
    reset,
    overallLeft,
    autopiloting,
  }
}

// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------

export function fmtClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

const TXT = {
  overall: { en: 'Overall', hi: 'कुल' },
  pace: { en: 'Demo pace: 6 of 65 questions · adaptive', hi: 'डेमो गति: 65 में से 6 प्रश्न · अनुकूली' },
  tabs: { en: 'Tab-switch detection ON (3 strikes)', hi: 'टैब-स्विच जाँच चालू (3 चेतावनी)' },
  paste: { en: 'Copy / paste disabled', hi: 'कॉपी / पेस्ट बंद' },
  engine: { en: 'Adaptive engine', hi: 'अनुकूली इंजन' },
  now: { en: 'Now', hi: 'अभी' },
  rough: { en: 'Rough work', hi: 'रफ़ कार्य' },
  roughNote: { en: 'Stays on this device. Paste is blocked.', hi: 'इसी डिवाइस पर रहता है। पेस्ट बंद है।' },
  roughPh: { en: 'Work it out here…', hi: 'यहाँ हल करें…' },
  review: { en: 'Mark for review', hi: 'समीक्षा हेतु चिह्नित करें' },
  reviewShort: { en: 'Review', hi: 'समीक्षा' },
  unmark: { en: 'Unmark', hi: 'चिह्न हटाएँ' },
  clear: { en: 'Clear', hi: 'साफ़ करें' },
  saveNext: { en: 'Save & Next', hi: 'सेव करें और आगे' },
  submit: { en: 'Save & Submit', hi: 'सेव करें और जमा करें' },
  autopilot: { en: 'Autopilot answering…', hi: 'ऑटोपायलट उत्तर दे रहा है…' },
  correctSoFar: { en: 'correct so far', hi: 'अब तक सही' },
  locked: { en: 'Locked', hi: 'बंद' },
  done: { en: 'Done', hi: 'पूर्ण' },
}

/** Overall timer for the DriveShell top bar. */
export function ExamTimer({ exam }: { exam: AptitudeExam }) {
  const left = exam.overallLeft
  return (
    <span className={cn('inline-flex items-center gap-1.5', left <= 60 ? 'text-rose-300' : left <= 180 ? 'text-amber-200' : '')}>
      <Timer className="h-3.5 w-3.5 opacity-70" aria-hidden />
      <span className="tabular-nums">{fmtClock(left)}</span>
    </span>
  )
}

function SectionTabs({ exam }: { exam: AptitudeExam }) {
  const { state } = exam
  return (
    <div role="tablist" aria-label="Sections" className="grid grid-cols-3 gap-2">
      {APT_SECTIONS.map((sec, i) => {
        const active = i === state.section && !state.locked[i] && state.phase !== 'done'
        const locked = state.locked[i]
        const left = state.sectionLeft[i]
        const pct = Math.max(0, Math.min(1, left / SECTION_SECONDS))
        const low = active && left <= 30
        return (
          <div
            key={sec.id}
            role="tab"
            aria-selected={active}
            aria-disabled={!active}
            className={cn(
              'relative overflow-hidden rounded-xl border px-2.5 py-2 sm:px-3.5',
              active
                ? 'border-cyan-300/40 bg-cyan-400/[0.07] shadow-[0_0_24px_-10px_rgba(34,211,238,0.6)]'
                : locked
                  ? 'border-white/[0.06] bg-white/[0.015] opacity-70'
                  : 'border-white/[0.08] bg-white/[0.02]',
            )}
          >
            <div className="flex items-center justify-between gap-1.5">
              <span className={cn('truncate text-[12px] font-semibold sm:text-[13px]', active ? 'text-white' : 'text-gray-400')}>
                <Tr b={sec.label} />
              </span>
              {locked ? (
                <Lock className="h-3.5 w-3.5 shrink-0 text-gray-500" aria-label={tr(TXT.locked, 'en')} />
              ) : active ? (
                <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
                  <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-cyan-300" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
                </span>
              ) : null}
            </div>
            <div
              className={cn(
                'mt-0.5 font-mono text-[15px] font-semibold tabular-nums sm:text-base',
                low ? 'text-rose-300' : active ? 'text-cyan-100' : 'text-gray-500',
              )}
            >
              {fmtClock(left)}
            </div>
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-white/[0.05]">
              <div
                className={cn(
                  'h-full transition-[width] duration-1000 ease-linear',
                  low ? 'bg-rose-400' : active ? 'bg-gradient-to-r from-cyan-400 to-emerald-400' : 'bg-white/15',
                )}
                style={{ width: `${(locked ? 0 : pct) * 100}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Main exam content (inside DriveShell). */
export function ExamShell({ exam }: { exam: AptitudeExam }) {
  const { state, qLang, setQLang, select, goto } = exam
  const { t } = useDemo()
  const slot = state.slots[state.current]
  const question = questionById(slot?.qid)
  const ladder = useMemo(() => buildLadder(state.steps), [state.steps])
  const correctSoFar = state.steps.filter((s) => s.correct).length
  const paletteSlots = useMemo(
    () => state.slots.map((s) => ({ visited: s.visited, saved: s.saved, marked: s.marked })),
    [state.slots],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-[12px]">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-gray-300">
          <Tr b={TXT.pace} />
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/25 bg-rose-500/[0.07] px-2.5 py-1 text-rose-200">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          <Tr b={TXT.tabs} />
        </span>
        <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-gray-400 sm:inline-flex">
          <Tr b={TXT.paste} />
        </span>
        {exam.autopiloting && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/10 px-2.5 py-1 text-violet-200">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-300" aria-hidden />
            <Tr b={TXT.autopilot} />
          </span>
        )}
      </div>

      <SectionTabs exam={exam} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <QuestionCard
            question={question}
            slot={state.current}
            selected={slot?.answer ?? null}
            marked={!!slot?.marked}
            qLang={qLang}
            onQLang={setQLang}
            onSelect={select}
            adjust={state.phase === 'adjusting' && state.adjust ? state.adjust : null}
            disabled={state.phase !== 'answering'}
          />
        </div>

        <div className="space-y-4">
          <QuestionPalette
            slots={paletteSlots}
            current={state.current}
            activeSection={state.section}
            lockedSections={state.locked}
            onGoto={goto}
            disabled={state.phase !== 'answering'}
          />

          <section className="rounded-2xl border border-violet-400/20 bg-gradient-to-b from-violet-500/[0.06] to-transparent p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <AIBadge />
              <span className="text-[13px] font-semibold text-white">
                <Tr b={TXT.engine} />
              </span>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-violet-400/30 bg-violet-500/10 px-2 py-0.5 text-[12px] text-violet-100">
                <Tr b={TXT.now} />: <Tr b={DIFFICULTY_LABEL[state.level]} className="font-semibold" />
              </span>
            </div>
            <p className="mb-1 text-[12px] text-gray-400">
              <Tr b={LADDER_TITLE} /> · <span className="tabular-nums text-gray-200">{correctSoFar}</span>/
              <span className="tabular-nums">{state.steps.length}</span> <Tr b={TXT.correctSoFar} />
            </p>
            <DifficultyLadder data={ladder} height={170} compact />
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <label htmlFor="apt-rough" className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-white">
              <PenLine className="h-4 w-4 text-gray-400" aria-hidden />
              <Tr b={TXT.rough} />
            </label>
            <textarea
              id="apt-rough"
              rows={3}
              spellCheck={false}
              placeholder={t(TXT.roughPh)}
              className="w-full resize-none rounded-lg border border-white/10 bg-[#0a0e14] px-3 py-2 font-mono text-[13px] text-gray-200 placeholder:text-gray-600 focus:border-cyan-300/40 focus:outline-none"
            />
            <p className="mt-1.5 text-[12px] text-gray-500">
              <Tr b={TXT.roughNote} />
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

/** Sticky footer actions (DriveShell footer): Mark for review · Clear · Save & Next. */
export function ExamActions({ exam }: { exam: AptitudeExam }) {
  const { state, toggleMark, clear, saveNext } = exam
  const slot = state.slots[state.current]
  const answering = state.phase === 'answering'
  const sec = sectionOfSlot(state.current)
  const isLast =
    sec === N_SECTIONS - 1 && slotsOfSection(sec).every((i) => i === state.current || state.slots[i].committed)
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleMark}
        disabled={!answering}
        className={cn(
          'inline-flex h-11 items-center gap-2 rounded-xl border px-3 text-[13px] font-medium transition-colors disabled:opacity-50 sm:px-4',
          slot?.marked
            ? 'border-violet-300/60 bg-violet-500/20 text-violet-100'
            : 'border-violet-400/30 bg-violet-500/[0.07] text-violet-200 hover:bg-violet-500/15',
        )}
      >
        {slot?.marked ? <BookmarkCheck className="h-4 w-4" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}
        <span className="sm:hidden">
          <Tr b={slot?.marked ? TXT.unmark : TXT.reviewShort} />
        </span>
        <span className="hidden sm:inline">
          <Tr b={slot?.marked ? TXT.unmark : TXT.review} />
        </span>
      </button>
      <button
        type="button"
        onClick={clear}
        disabled={!answering || slot?.answer === null}
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 px-3 text-[13px] font-medium text-gray-300 transition-colors hover:border-white/25 hover:text-white disabled:opacity-40 sm:px-4"
      >
        <Eraser className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">
          <Tr b={TXT.clear} />
        </span>
      </button>
      <button
        type="button"
        onClick={saveNext}
        disabled={!answering}
        className="ml-auto inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 px-4 text-[14px] font-semibold text-[#06121a] shadow-[0_10px_30px_-10px_rgba(34,211,238,0.7)] transition-[filter,transform] hover:brightness-110 active:scale-[0.98] disabled:opacity-60 sm:px-6"
      >
        <Tr b={isLast ? TXT.submit : TXT.saveNext} />
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}
