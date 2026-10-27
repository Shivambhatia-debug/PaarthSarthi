'use client'

/**
 * Interview engine: one state machine per question.
 *
 *   idle → speaking → listening → thinking → scored → (next | follow-up | phase end)
 *
 * - speaking: Sarthi asks (hi-IN voice reads Devanagari tts; en-IN reads the romanised caption when no Hindi voice).
 *   Captions stream word by word (~2.6 words/s). Recognition is never running while Sarthi speaks (no echo).
 * - listening: live browser recognition (voiceMode 'live' + supported) or a scripted answer typed in word by word
 *   at 150 WPM as if transcribed. Ends on Done, or after 6 s of silence once 8+ words were heard.
 * - thinking: 1.2 s violet "Analysing your answer…".
 * - scored: fillers / WPM / keywords / STAR from the REAL transcript; narrative-locked rubric scores;
 *   a follow-up is generated from the first trigger keyword actually heard.
 *
 * Every async flow carries a generation number; cancelling (skip, replay, chip jump, fast-forward, unmount)
 * bumps the generation, clears timers, stops speech and recognition, so stale flows exit at their next check.
 * Demo events (autopilot / fast-forward) are idempotent because AudioGate may replay them.
 */

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { useDemo, useDemoEvent, type RoundState, type SignalInput } from '@/lib/os/demo-store'
import { tr, type Lang } from '@/lib/os/i18n'
import { INTERVIEW_SPLIT, ROUND_TARGETS, type RoundId } from '@/lib/os/rounds'
import { rng } from '@/lib/mock/seed'
import { countFillers, detectKeywords, detectStar, firstKeyword, wordsPerMinute } from '@/lib/ai-sim'
import { useMicLevel, useSpeak, useSpeechRecognition, type UseSpeechRecognitionResult } from '@/hooks/use-speech'
import { aiToast } from '@/components/ai/ai-toast'
import {
  HESITATION_SIGNAL,
  PHASE_SIGNALS,
  labelOf,
  makeFollowUp,
  scriptFor,
  type IQ,
  type Phase,
  type Scores,
} from '@/components/placement/interview/script'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CAPTION_WPS = 2.6
const THINK_MS = 1200
const SILENCE_END_MS = 6000
const MIN_WORDS_FOR_SILENCE_END = 8
const PAUSE_GAP_MS = 2000
const MAX_ANSWER_MS = 120000
const MIC_SETTLE_MS = 300
const FOLLOWUP_DELAY_MS = 2200
const AUTOPILOT_DWELL_MS = 2600
const AUTOPILOT_SPEED = 1.8
const PHASE_END_DELAY_MS = 900
/** Caption count meaning "show everything". */
export const CAPTION_FULL = 1_000_000

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Stage = 'idle' | 'speaking' | 'listening' | 'thinking' | 'scored'
export type AnswerSource = 'live' | 'scripted'

export interface Star {
  S: boolean
  T: boolean
  A: boolean
  R: boolean
}

export interface AnswerResult {
  qid: string
  transcript: string
  lang: Lang
  source: AnswerSource
  /** From the end of the question to the end of the answer. */
  durationMs: number
  /** First word to last word (pace is measured over this). */
  speakingMs: number
  firstLatencyMs: number
  pauses: number
  fillers: { total: number; byWord: Record<string, number> }
  wpm: number
  keywordsHit: string[]
  keywordsTotal: number
  star: Star
  scores: Scores
  /** 0-100, language-neutral (correctness + depth). */
  content: number
  /** 0-100, delivery (clarity adjusted by fillers / pauses / pace). */
  delivery: number
  confidence: number
  sarthiMs: number
  followUp: { id: string; because: string | null } | null
  hesitant: boolean
}

export interface EngineSnap {
  queue: IQ[]
  index: number
  stage: Stage
  source: AnswerSource | null
  captionCount: number
  /** Scripted / frozen answer text (live text is read from recognition while listening). */
  answer: { final: string; interim: string }
  results: Record<string, AnswerResult>
  lastScoredId: string | null
  asked: string[]
  phaseDone: boolean
  autopilot: boolean
  started: boolean
  listenStartAt: number
  answerMs: number
  speechMs: number
  pauses: number
  firstLatencyMs: number | null
  curSarthiMs: number
  sql: { mode: 'type' | 'fill'; key: number } | null
}

interface AnswerInput {
  text: string
  source: AnswerSource
  durationMs: number
  speakingMs: number
  firstLatencyMs: number
  pauses: number
}

type DemoSetRound = (id: RoundId, patch: Partial<RoundState>) => void

interface Ctx {
  lang: Lang
  mode: 'live' | 'scripted'
  voiceOn: boolean
  phase: Phase
  personaId: 'priya' | 'rahul'
  guest: IQ
  speak: (text: string, lang: Lang) => Promise<void>
  cancelSpeak: () => void
  rec: UseSpeechRecognitionResult
  setRound: DemoSetRound
  addSignal: (s: SignalInput) => void
  setVoiceMode: (m: 'live' | 'scripted') => void
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

const EMPTY_ANSWER = { final: '', interim: '' }

export function joinText(...parts: string[]): string {
  return parts
    .map((p) => (p ?? '').trim())
    .filter(Boolean)
    .join(' ')
}

export function countWords(s: string): number {
  return (s ?? '').split(/\s+/).filter(Boolean).length
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/** Confidence heuristic (shown as such): fillers, pauses, first-word latency and pace. */
export function confidenceOf(m: { fillers: number; pauses: number; latencyMs: number | null; wpm: number }): number {
  let c = 90
  c -= m.fillers * 5
  c -= m.pauses * 7
  if (m.latencyMs != null) c -= (Math.max(0, m.latencyMs - 1500) / 1000) * 6
  if (m.wpm > 0) {
    if (m.wpm < 120) c -= (120 - m.wpm) * 0.4
    if (m.wpm > 170) c -= (m.wpm - 170) * 0.4
  }
  return Math.round(clamp(c, 30, 95))
}

/** Seeded eye-contact estimate (70-85), stable per persona / phase / question. */
export function eyeContactFor(seedKey: string): number {
  let h = 2166136261
  for (let i = 0; i < seedKey.length; i++) {
    h ^= seedKey.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return rng(h >>> 0).int(70, 85)
}

function scriptedTiming(q: IQ, words: number) {
  const wpm = q.scripted?.wpm ?? 150
  const latencyMs = q.scripted?.latencyMs ?? 700
  const pauseAfterWord = q.scripted?.pauseAfterWord ?? 0
  const pauseMs = pauseAfterWord > 0 ? q.scripted?.pauseMs ?? 0 : 0
  const speakingMs = Math.round((words * 60000) / wpm)
  return {
    wpm,
    latencyMs,
    pauseAfterWord,
    pauseMs,
    pauses: pauseMs >= PAUSE_GAP_MS ? 1 : 0,
    speakingMs,
    durationMs: latencyMs + speakingMs + pauseMs,
  }
}

function estimateSarthiMs(q: IQ, lang: Lang): number {
  return Math.round((countWords(tr(q.text, lang)) / CAPTION_WPS) * 1000)
}

function hindiVoiceNow(): boolean {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false
    return window.speechSynthesis
      .getVoices()
      .some((v) => (v.lang || '').replace('_', '-').toLowerCase().startsWith('hi'))
  } catch {
    return false
  }
}

/** What Sarthi says, and with which voice language (fix 5). */
function speechFor(q: IQ, lang: Lang): { text: string; lang: Lang } {
  if (lang === 'en') return { text: q.text.en, lang: 'en' }
  if (hindiVoiceNow()) return { text: lang === 'hi' ? q.tts.hi : q.tts.hinglish, lang }
  // No hi-IN voice: en-IN reads the romanised caption.
  return { text: q.text.hinglish, lang: 'en' }
}

function describeError(code: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone permission was denied. Scripted answers keep the demo running.'
    case 'audio-capture':
      return 'No microphone was found. Scripted answers keep the demo running.'
    case 'network':
      return 'The speech service could not be reached. Scripted answers keep the demo running.'
    case 'not-supported':
      return 'Live transcription works in Chrome.'
    default:
      return 'Speech recognition stopped. Scripted answers keep the demo running.'
  }
}

function findNext(s: EngineSnap): number {
  const n = s.queue.length
  for (let k = 1; k <= n; k++) {
    const i = (s.index + k) % n
    if (!s.results[s.queue[i].id]) return i
  }
  return -1
}

function hasPending(s: EngineSnap): boolean {
  return s.queue.some((q) => !s.results[q.id])
}

function computeResult(q: IQ, a: AnswerInput, lang: Lang, sarthiMs: number): { result: AnswerResult; followUp: IQ | null } {
  const text = a.text
  const fillers = countFillers(text)
  const wpm = wordsPerMinute(text, a.speakingMs)
  const keywordsHit = detectKeywords(text, q.keywords)
  const star = detectStar(text)
  const confidence = confidenceOf({ fillers: fillers.total, pauses: a.pauses, latencyMs: a.firstLatencyMs, wpm })
  const content = Math.round(((q.scores.correctness + q.scores.depth) / 2) * 10)
  const inBand = wpm >= 130 && wpm <= 160
  const delivery = Math.round(clamp(q.scores.clarity * 10 - fillers.total * 2 - a.pauses * 3 + (inBand ? 2 : 0), 20, 95))

  // Adaptive follow-up: the first trigger keyword actually heard in THIS transcript.
  let followUp: IQ | null = null
  if (q.kind !== 'followup') {
    const specs = q.followUps ?? []
    const triggers = specs.flatMap((f) => f.keywords)
    const label = triggers.length ? firstKeyword(text, triggers) : null
    const spec = label ? specs.find((f) => f.keywords.some((k) => labelOf(k) === label)) : undefined
    if (spec && label) followUp = makeFollowUp(q, spec, label)
    else if (q.fallbackFollowUp) followUp = makeFollowUp(q, q.fallbackFollowUp, null)
  }

  const hesitant = !!q.hesitationCheck && (a.firstLatencyMs >= 2000 || fillers.total >= 2 || a.pauses >= 1)

  return {
    result: {
      qid: q.id,
      transcript: text,
      lang,
      source: a.source,
      durationMs: Math.max(0, Math.round(a.durationMs)),
      speakingMs: Math.max(0, Math.round(a.speakingMs)),
      firstLatencyMs: Math.max(0, Math.round(a.firstLatencyMs)),
      pauses: a.pauses,
      fillers,
      wpm,
      keywordsHit,
      keywordsTotal: q.keywords.length,
      star,
      scores: q.scores,
      content,
      delivery,
      confidence,
      sarthiMs,
      followUp: followUp ? { id: followUp.id, because: followUp.because ?? null } : null,
      hesitant,
    },
    followUp,
  }
}

// ---------------------------------------------------------------------------
// Tiny external store (render reads a snapshot; async flows read the latest)
// ---------------------------------------------------------------------------

interface Store<T> {
  get: () => T
  set: (patch: Partial<T> | ((s: T) => Partial<T>)) => void
  subscribe: (l: () => void) => () => void
}

function createStore<T extends object>(initial: T): Store<T> {
  let snap = initial
  const listeners = new Set<() => void>()
  return {
    get: () => snap,
    set: (patch) => {
      const p = typeof patch === 'function' ? patch(snap) : patch
      if (!p) return
      snap = { ...snap, ...p }
      listeners.forEach((l) => l())
    },
    subscribe: (l) => {
      listeners.add(l)
      return () => {
        listeners.delete(l)
      }
    },
  }
}

function initialSnap(queue: IQ[]): EngineSnap {
  return {
    queue,
    index: 0,
    stage: 'idle',
    source: null,
    captionCount: 0,
    answer: EMPTY_ANSWER,
    results: {},
    lastScoredId: null,
    asked: [],
    phaseDone: false,
    autopilot: false,
    started: false,
    listenStartAt: 0,
    answerMs: 0,
    speechMs: 0,
    pauses: 0,
    firstLatencyMs: null,
    curSarthiMs: 0,
    sql: null,
  }
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

function createEngine(store: Store<EngineSnap>, getCtx: () => Ctx) {
  const E = {
    gen: 0,
    mounted: false,
    waiters: new Map<ReturnType<typeof setTimeout>, () => void>(),
    intervals: new Set<ReturnType<typeof setInterval>>(),
    listenStartAt: 0,
    firstResultAt: 0,
    prevResultAt: 0,
    sarthiMs: {} as Record<string, number>,
  }

  const alive = (g: number) => E.mounted && g === E.gen

  function wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const id = setTimeout(() => {
        E.waiters.delete(id)
        resolve()
      }, Math.max(0, ms))
      E.waiters.set(id, resolve)
    })
  }

  function every(fn: () => void, ms: number) {
    const id = setInterval(fn, ms)
    E.intervals.add(id)
  }

  function clearTimers() {
    E.waiters.forEach((resolve, id) => {
      clearTimeout(id)
      resolve()
    })
    E.waiters.clear()
    E.intervals.forEach((id) => clearInterval(id))
    E.intervals.clear()
  }

  /** New generation: every running flow stops at its next check. */
  function bump(): number {
    E.gen += 1
    clearTimers()
    return E.gen
  }

  function stopAudio() {
    const c = getCtx()
    try {
      c.cancelSpeak()
    } catch {
      /* ignore */
    }
    try {
      c.rec.stop()
    } catch {
      /* ignore */
    }
  }

  function cancelAll(): number {
    const g = bump()
    stopAudio()
    return g
  }

  function roundId(): RoundId {
    return getCtx().phase === 'hr' ? 'hrInterview' : 'techInterview'
  }

  function sarthiFor(q: IQ): number {
    return E.sarthiMs[q.id] ?? estimateSarthiMs(q, getCtx().lang)
  }

  // ---- speaking -------------------------------------------------------------------------------

  async function ask(idx: number) {
    const g = cancelAll()
    const s0 = store.get()
    const q = s0.queue[idx]
    if (!q) return
    const c = getCtx()
    store.set({
      index: idx,
      stage: 'speaking',
      source: null,
      captionCount: 0,
      answer: EMPTY_ANSWER,
      answerMs: 0,
      speechMs: 0,
      pauses: 0,
      firstLatencyMs: null,
      curSarthiMs: 0,
      started: true,
      asked: s0.asked.includes(q.id) ? s0.asked : [...s0.asked, q.id],
    })

    const words = Math.max(1, countWords(tr(q.text, c.lang)))
    const fast = !c.voiceOn && s0.autopilot
    const perWord = fast ? 120 : Math.round(1000 / CAPTION_WPS)
    const t0 = Date.now()

    const captions = (async () => {
      for (let n = 1; n <= words; n++) {
        if (!alive(g)) return
        store.set({ captionCount: n })
        await wait(perWord)
      }
    })()

    let spoken: Promise<void> = Promise.resolve()
    if (c.voiceOn) {
      const say = speechFor(q, c.lang)
      spoken = c.speak(say.text, say.lang).catch(() => {})
    }
    await Promise.all([spoken, captions])
    if (!alive(g)) return
    const ms = Date.now() - t0
    E.sarthiMs[q.id] = ms
    store.set({ captionCount: CAPTION_FULL, curSarthiMs: ms })
    // Let the speaker tail die out before the microphone opens (TTS must never be transcribed).
    await wait(MIC_SETTLE_MS)
    if (!alive(g)) return
    beginAnswer(g)
  }

  function beginAnswer(g: number) {
    if (!alive(g)) return
    const c = getCtx()
    if (store.get().autopilot || c.mode !== 'live') {
      void injectScripted(g)
      return
    }
    startLive(g)
  }

  // ---- listening: live ------------------------------------------------------------------------

  function startLive(g: number) {
    const c = getCtx()
    try {
      c.rec.reset()
    } catch {
      /* ignore */
    }
    const now = Date.now()
    E.listenStartAt = now
    E.firstResultAt = 0
    E.prevResultAt = 0
    store.set({
      stage: 'listening',
      source: 'live',
      answer: EMPTY_ANSWER,
      answerMs: 0,
      speechMs: 0,
      pauses: 0,
      firstLatencyMs: null,
      listenStartAt: now,
    })
    try {
      c.rec.start()
    } catch {
      /* the error effect switches to scripted */
    }
    every(() => {
      if (!alive(g)) return
      const s = store.get()
      if (s.stage !== 'listening' || s.source !== 'live') return
      const t = Date.now()
      const r = getCtx().rec
      const last = r.lastResultAt ?? 0
      const fresh = last >= E.listenStartAt
      const patch: Partial<EngineSnap> = { answerMs: t - E.listenStartAt }
      if (E.firstResultAt && fresh) patch.speechMs = Math.max(0, last - E.firstResultAt)
      store.set(patch)
      const words = fresh ? countWords(joinText(r.finalText, r.interim)) : 0
      if ((words >= MIN_WORDS_FOR_SILENCE_END && t - last > SILENCE_END_MS) || t - E.listenStartAt > MAX_ANSWER_MS) {
        void finishLive(g)
      }
    }, 250)
  }

  /** Called with every recognition result timestamp (interim or final). */
  function onResult(t: number | null) {
    if (!t) return
    const s = store.get()
    if (s.stage !== 'listening' || s.source !== 'live' || t < E.listenStartAt) return
    if (!E.firstResultAt) {
      E.firstResultAt = t
      store.set({ firstLatencyMs: t - E.listenStartAt })
    } else if (E.prevResultAt && t - E.prevResultAt > PAUSE_GAP_MS) {
      store.set({ pauses: s.pauses + 1 })
    }
    E.prevResultAt = t
  }

  async function finishLive(g: number) {
    if (!alive(g)) return
    const s = store.get()
    if (s.stage !== 'listening' || s.source !== 'live') return
    const c = getCtx()
    const r = c.rec
    const now = Date.now()
    const last = r.lastResultAt ?? 0
    const fresh = last >= E.listenStartAt
    const text = fresh ? joinText(r.finalText, r.interim) : ''
    const g2 = bump()
    try {
      r.stop()
    } catch {
      /* ignore */
    }
    if (countWords(text) < 3) {
      aiToast('No speech heard: using the scripted answer', { tone: 'warn', id: 'iv-nospeech' })
      void injectScripted(g2)
      return
    }
    const durationMs = now - E.listenStartAt
    const firstLatencyMs = E.firstResultAt ? E.firstResultAt - E.listenStartAt : 0
    const speakingMs = E.firstResultAt ? Math.max(1500, (fresh ? last : now) - E.firstResultAt) : durationMs
    await analyse(g2, { text, source: 'live', durationMs, speakingMs, firstLatencyMs, pauses: s.pauses })
  }

  /** Fatal recognition error while listening live: scripted mode + toast + scripted answer. */
  function onRecError(code: string | null) {
    if (!code) return
    const s = store.get()
    if (s.stage !== 'listening' || s.source !== 'live') return
    const c = getCtx()
    c.setVoiceMode('scripted')
    aiToast('Switched to scripted mode', { tone: 'warn', description: describeError(code), id: 'iv-scripted' })
    const g = bump()
    try {
      c.rec.stop()
    } catch {
      /* ignore */
    }
    void injectScripted(g)
  }

  /** Mic pill switched to Scripted mid-answer: finish this answer scripted. */
  function onModeChange(mode: 'live' | 'scripted') {
    if (mode !== 'scripted') return
    const s = store.get()
    if (s.stage !== 'listening' || s.source !== 'live') return
    const g = bump()
    try {
      getCtx().rec.stop()
    } catch {
      /* ignore */
    }
    void injectScripted(g)
  }

  // ---- listening: scripted --------------------------------------------------------------------

  async function injectScripted(g: number) {
    if (!alive(g)) return
    const s = store.get()
    const q = s.queue[s.index]
    if (!q) return
    const c = getCtx()
    const text = tr(q.scriptedAnswer, c.lang)
    const words = text.split(/\s+/).filter(Boolean)
    const sim = scriptedTiming(q, words.length)
    const speed = s.autopilot ? AUTOPILOT_SPEED : 1
    const now = Date.now()
    E.listenStartAt = now
    store.set({
      stage: 'listening',
      source: 'scripted',
      answer: EMPTY_ANSWER,
      answerMs: 0,
      speechMs: 0,
      pauses: 0,
      firstLatencyMs: null,
      listenStartAt: now,
      captionCount: CAPTION_FULL,
    })
    if (q.kind === 'sql') store.set((x) => ({ sql: { mode: 'type', key: (x.sql?.key ?? 0) + 1 } }))
    every(() => {
      if (alive(g) && store.get().stage === 'listening') store.set({ answerMs: Date.now() - E.listenStartAt })
    }, 250)

    await wait(sim.latencyMs / speed)
    if (!alive(g)) return
    store.set({ firstLatencyMs: sim.latencyMs })
    const per = 60000 / sim.wpm
    let pauses = 0
    for (let k = 1; k <= words.length; k++) {
      store.set({
        answer: { final: words.slice(0, k - 1).join(' '), interim: words[k - 1] },
        speechMs: Math.round(k * per),
      })
      await wait(per / speed)
      if (!alive(g)) return
      if (sim.pauseAfterWord === k && sim.pauseMs > 0) {
        store.set({ answer: { final: words.slice(0, k).join(' '), interim: '' } })
        await wait(sim.pauseMs / speed)
        if (!alive(g)) return
        if (sim.pauseMs >= PAUSE_GAP_MS) {
          pauses += 1
          store.set({ pauses })
        }
      }
    }
    store.set({ answer: { final: text, interim: '' } })
    await analyse(g, {
      text,
      source: 'scripted',
      durationMs: sim.durationMs,
      speakingMs: sim.speakingMs,
      firstLatencyMs: sim.latencyMs,
      pauses: sim.pauses,
    })
  }

  // ---- thinking + scored ----------------------------------------------------------------------

  function commit(q: IQ, result: AnswerResult, followUp: IQ | null) {
    store.set((s) => {
      const results = { ...s.results, [q.id]: result }
      const hadFollowUp = s.queue.some((x) => x.parentId === q.id)
      let queue = s.queue.filter((x) => x.parentId !== q.id)
      if (hadFollowUp || followUp) delete results[`${q.id}·F`]
      if (followUp) {
        const at = queue.findIndex((x) => x.id === q.id)
        queue = [...queue.slice(0, at + 1), followUp, ...queue.slice(at + 1)]
      }
      const index = Math.max(0, queue.findIndex((x) => x.id === q.id))
      return {
        queue,
        results,
        index,
        stage: 'scored',
        lastScoredId: q.id,
        answer: { final: result.transcript, interim: '' },
        captionCount: CAPTION_FULL,
      }
    })
  }

  function afterCommit(q: IQ, result: AnswerResult) {
    if (q.hesitationCheck && result.hesitant) {
      getCtx().addSignal({ round: roundId(), kind: 'behaviour', text: HESITATION_SIGNAL })
    }
  }

  async function analyse(g: number, a: AnswerInput) {
    if (!alive(g)) return
    store.set({ stage: 'thinking', answer: { final: a.text, interim: '' } })
    await wait(THINK_MS)
    if (!alive(g)) return
    const s = store.get()
    const q = s.queue[s.index]
    if (!q) return
    const { result, followUp } = computeResult(q, a, getCtx().lang, sarthiFor(q))
    commit(q, result, followUp)
    afterCommit(q, result)

    const after = store.get()
    if (findNext(after) < 0) {
      await wait(PHASE_END_DELAY_MS)
      if (!alive(g)) return
      finishPhase()
      return
    }
    if (after.autopilot) {
      await wait(AUTOPILOT_DWELL_MS)
      if (!alive(g)) return
      const i = findNext(store.get())
      if (i >= 0) void ask(i)
      else finishPhase()
    } else if (followUp) {
      // The interviewer reacts to what was just said.
      await wait(FOLLOWUP_DELAY_MS)
      if (!alive(g)) return
      const i = store.get().queue.findIndex((x) => x.id === followUp.id)
      if (i >= 0) void ask(i)
    }
  }

  function finishPhase() {
    const s = store.get()
    if (s.phaseDone) return
    store.set({ phaseDone: true, autopilot: false, stage: 'scored', captionCount: CAPTION_FULL })
    const c = getCtx()
    const pid = c.personaId
    const split = INTERVIEW_SPLIT[pid] ?? INTERVIEW_SPLIT.priya
    const targets = ROUND_TARGETS[pid] ?? ROUND_TARGETS.priya
    if (c.phase === 'tech') {
      c.setRound('techInterview', {
        status: 'cleared',
        score: targets.techInterview,
        detail: { content: split.content, delivery: split.delivery },
      })
      aiToast(`Technical interview cleared · ${targets.techInterview}`, {
        tone: 'ok',
        description: `Content ${split.content} (language-neutral) · delivery ${split.delivery} (scored separately)`,
        id: 'iv-phase',
      })
    } else {
      c.setRound('hrInterview', { status: 'cleared', score: targets.hrInterview })
      aiToast(`HR interview cleared · ${targets.hrInterview}`, { tone: 'ok', id: 'iv-phase' })
    }
    const sigs = PHASE_SIGNALS[pid]?.[c.phase] ?? []
    for (const sig of sigs) c.addSignal({ round: roundId(), kind: sig.kind, text: sig.text })
  }

  // ---- controls -------------------------------------------------------------------------------

  function next() {
    const i = findNext(store.get())
    if (i < 0) {
      cancelAll()
      finishPhase()
      return
    }
    void ask(i)
  }

  function scriptedInputFor(q: IQ): AnswerInput {
    const text = tr(q.scriptedAnswer, getCtx().lang)
    const sim = scriptedTiming(q, countWords(text))
    return {
      text,
      source: 'scripted',
      durationMs: sim.durationMs,
      speakingMs: sim.speakingMs,
      firstLatencyMs: sim.latencyMs,
      pauses: sim.pauses,
    }
  }

  /** 'Skip (scripted, instant)': cancel, fill the scripted answer, score, advance (follow-up logic still runs). */
  function skip() {
    const s = store.get()
    const q = s.queue[s.index]
    if (!q || !s.started) return
    if (s.stage === 'scored' && s.results[q.id]) {
      next()
      return
    }
    cancelAll()
    if (q.kind === 'sql') store.set((x) => ({ sql: { mode: 'fill', key: (x.sql?.key ?? 0) + 1 } }))
    const { result, followUp } = computeResult(q, scriptedInputFor(q), getCtx().lang, sarthiFor(q))
    commit(q, result, followUp)
    afterCommit(q, result)
    next()
  }

  function replay() {
    const s = store.get()
    if (s.queue[s.index]) void ask(s.index)
  }

  /** 'Use scripted answer': stop speech / recognition and type the scripted answer at 150 WPM. */
  function useScripted() {
    const s = store.get()
    if (!s.started || s.stage === 'idle' || s.stage === 'thinking' || s.stage === 'scored') return
    if (s.stage === 'listening' && s.source === 'scripted') return
    const g = cancelAll()
    store.set({ captionCount: CAPTION_FULL })
    void injectScripted(g)
  }

  /** Big mic button while Sarthi is speaking: stop talking and listen now. */
  function answerNow() {
    const s = store.get()
    if (s.stage !== 'speaking') return
    const q = s.queue[s.index]
    const g = cancelAll()
    if (q && !E.sarthiMs[q.id]) E.sarthiMs[q.id] = estimateSarthiMs(q, getCtx().lang)
    store.set({ captionCount: CAPTION_FULL })
    beginAnswer(g)
  }

  /** 'Done answering'. Live: score what was heard. Scripted typing: complete it instantly. */
  function done() {
    const s = store.get()
    if (s.stage !== 'listening') return
    if (s.source === 'live') {
      void finishLive(E.gen)
      return
    }
    const q = s.queue[s.index]
    if (!q) return
    const g = bump()
    void analyse(g, scriptedInputFor(q))
  }

  function jumpTo(id: string) {
    const i = store.get().queue.findIndex((x) => x.id === id)
    if (i >= 0) void ask(i)
  }

  function askGuest() {
    const s = store.get()
    const guest = getCtx().guest
    const existing = s.queue.findIndex((x) => x.id === guest.id)
    if (existing >= 0) {
      void ask(existing)
      return
    }
    const at = Math.min(s.queue.length, s.index + 1)
    store.set({ queue: [...s.queue.slice(0, at), guest, ...s.queue.slice(at)] })
    void ask(at)
  }

  /** Fill every remaining answer instantly and end the phase. Idempotent. */
  function fastForward() {
    const s0 = store.get()
    if (s0.phaseDone && !hasPending(s0)) return
    cancelAll()
    const lang = getCtx().lang
    let queue = [...s0.queue]
    const results = { ...s0.results }
    let sql = s0.sql
    for (let i = 0; i < queue.length; i++) {
      const q = queue[i]
      if (results[q.id]) continue
      if (!E.sarthiMs[q.id]) E.sarthiMs[q.id] = estimateSarthiMs(q, lang)
      const { result, followUp } = computeResult(q, scriptedInputFor(q), lang, sarthiFor(q))
      results[q.id] = result
      if (q.kind === 'sql') sql = { mode: 'fill', key: (sql?.key ?? 0) + 1 }
      if (queue.some((x) => x.parentId === q.id)) {
        queue = queue.filter((x) => x.parentId !== q.id)
        delete results[`${q.id}·F`]
      }
      if (followUp) {
        delete results[followUp.id]
        queue.splice(i + 1, 0, followUp)
      }
      afterCommit(q, result)
    }
    const index = Math.max(0, queue.length - 1)
    const last = queue[index]
    store.set({
      queue,
      results,
      index,
      stage: 'scored',
      source: results[last?.id]?.source ?? 'scripted',
      lastScoredId: last?.id ?? null,
      answer: { final: results[last?.id]?.transcript ?? '', interim: '' },
      asked: queue.map((q) => q.id),
      captionCount: CAPTION_FULL,
      sql,
      autopilot: false,
      started: true,
    })
    finishPhase()
  }

  /** Autopilot: scripted answers for every remaining question, then stop at the phase end. Idempotent. */
  function startAutopilot() {
    const s = store.get()
    if (s.autopilot) return
    if (!hasPending(s)) {
      if (!s.phaseDone) finishPhase()
      return
    }
    store.set({ autopilot: true })
    switch (s.stage) {
      case 'idle':
        void ask(s.index)
        break
      case 'listening':
        if (s.source === 'live') {
          const g = cancelAll()
          void injectScripted(g)
        }
        break
      case 'scored':
        next()
        break
      default:
        // speaking / thinking pick the flag up at their next step
        break
    }
  }

  function stopAutopilot() {
    store.set({ autopilot: false })
  }

  // ---- lifecycle ------------------------------------------------------------------------------

  async function waitForVoices(g: number, maxMs: number) {
    const t0 = Date.now()
    while (Date.now() - t0 < maxMs) {
      if (!alive(g)) return
      try {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
        if (window.speechSynthesis.getVoices().length > 0) return
      } catch {
        return
      }
      await wait(100)
    }
  }

  function mount() {
    E.mounted = true
    const g = bump()
    const s = store.get()
    if (s.phaseDone && !hasPending(s)) return
    void (async () => {
      // Chrome loads voices asynchronously: give the hi-IN voice a moment so T1 is spoken in Hindi.
      await waitForVoices(g, 900)
      if (!alive(g)) return
      const cur = store.get()
      if (cur.stage === 'idle' || cur.stage === 'speaking' || cur.stage === 'listening' || cur.stage === 'thinking') {
        void ask(cur.index)
      }
    })()
  }

  function unmount() {
    E.mounted = false
    bump()
    stopAudio()
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
    } catch {
      /* ignore */
    }
  }

  return {
    mount,
    unmount,
    onResult,
    onRecError,
    onModeChange,
    skip,
    replay,
    useScripted,
    answerNow,
    done,
    next,
    jumpTo,
    askGuest,
    fastForward,
    startAutopilot,
    stopAutopilot,
  }
}

export type InterviewActions = ReturnType<typeof createEngine>

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface Meters {
  wpm: number
  fillers: { total: number; byWord: Record<string, number> }
  pauses: number
  firstLatencyMs: number | null
  confidence: number | null
  eyeContact: number
  talkRatio: number | null
  /** 'live' while answering, 'result' for the scored answer of this question, 'last' for the previous answer. */
  from: 'live' | 'result' | 'last' | 'none'
}

export function useInterviewEngine({ phase, voiceOn }: { phase: Phase; voiceOn: boolean }) {
  const { lang, personaId, set, setRound, addSignal, state } = useDemo()
  const speech = useSpeak()
  const rec = useSpeechRecognition({ lang })
  const mode: 'live' | 'scripted' = state.voiceMode === 'live' && rec.supported ? 'live' : 'scripted'
  const pid: 'priya' | 'rahul' = personaId === 'rahul' ? 'rahul' : 'priya'
  const script = scriptFor(pid)

  const [store] = useState(() => createStore<EngineSnap>(initialSnap(phase === 'hr' ? script.hr : script.tech)))
  const snap = useSyncExternalStore(store.subscribe, store.get, store.get)

  // Latest values for async flows (read only from handlers, effects and timers).
  const ctxRef = useRef<Ctx | null>(null)
  ctxRef.current = {
    lang,
    mode,
    voiceOn,
    phase,
    personaId: pid,
    guest: script.guest,
    speak: speech.speak,
    cancelSpeak: speech.cancel,
    rec,
    setRound,
    addSignal,
    setVoiceMode: (m) => set({ voiceMode: m }),
  }

  const engine = useMemo(() => createEngine(store, () => ctxRef.current as Ctx), [store])

  useEffect(() => {
    engine.mount()
    return () => engine.unmount()
  }, [engine])

  useEffect(() => {
    engine.onResult(rec.lastResultAt)
  }, [rec.lastResultAt, engine])

  useEffect(() => {
    engine.onRecError(rec.error)
  }, [rec.error, engine])

  useEffect(() => {
    engine.onModeChange(mode)
  }, [mode, engine])

  useDemoEvent('fastforward', () => engine.fastForward())
  useDemoEvent('autopilot', () => engine.startAutopilot())

  // Mic stays open for the whole phase in live mode (one permission, no per-question re-acquire).
  const micLevel = useMicLevel(mode === 'live' && snap.started && !snap.phaseDone)

  const current: IQ | undefined = snap.queue[snap.index]
  const liveListening = snap.stage === 'listening' && snap.source === 'live'
  const freshRec = (rec.lastResultAt ?? 0) >= snap.listenStartAt && snap.listenStartAt > 0
  const answer = liveListening ? (freshRec ? { final: rec.finalText, interim: rec.interim } : EMPTY_ANSWER) : snap.answer
  const answerText = joinText(answer.final, answer.interim)
  const answering = snap.stage === 'listening' || snap.stage === 'thinking'

  const liveFillers = useMemo(() => countFillers(answerText), [answerText])
  const liveWpm = snap.speechMs >= 2500 ? wordsPerMinute(answerText, snap.speechMs) : 0
  const liveKeywords = useMemo(
    () => (current && answerText ? detectKeywords(answerText, current.keywords) : []),
    [current, answerText],
  )
  const liveStar = useMemo(() => detectStar(answerText), [answerText])

  const currentResult = current ? snap.results[current.id] : undefined
  const lastResult = snap.lastScoredId ? snap.results[snap.lastScoredId] : undefined

  const eyeContact = eyeContactFor(`${pid}:${phase}:${current?.id ?? 'x'}`)

  // Talk ratio over the phase (answered questions + the one in progress).
  let student = 0
  let sarthi = 0
  for (const r of Object.values(snap.results)) {
    student += r.durationMs
    sarthi += r.sarthiMs
  }
  if (answering && !currentResult) {
    student += snap.answerMs
    sarthi += snap.curSarthiMs
  }
  const talkRatio = student + sarthi > 0 ? student / (student + sarthi) : null

  let meters: Meters
  if (snap.stage === 'listening' || (snap.stage === 'thinking' && !currentResult)) {
    meters = {
      wpm: liveWpm,
      fillers: liveFillers,
      pauses: snap.pauses,
      firstLatencyMs: snap.firstLatencyMs,
      confidence:
        countWords(answerText) >= 4
          ? confidenceOf({ fillers: liveFillers.total, pauses: snap.pauses, latencyMs: snap.firstLatencyMs, wpm: liveWpm })
          : null,
      eyeContact,
      talkRatio,
      from: 'live',
    }
  } else {
    const r = currentResult ?? lastResult
    meters = r
      ? {
          wpm: r.wpm,
          fillers: r.fillers,
          pauses: r.pauses,
          firstLatencyMs: r.firstLatencyMs,
          confidence: r.confidence,
          eyeContact,
          talkRatio,
          from: currentResult ? 'result' : 'last',
        }
      : {
          wpm: 0,
          fillers: { total: 0, byWord: {} },
          pauses: 0,
          firstLatencyMs: null,
          confidence: null,
          eyeContact,
          talkRatio,
          from: 'none',
        }
  }

  const keywordsHit = answering ? liveKeywords : currentResult?.keywordsHit ?? []

  return {
    snap,
    current,
    answer,
    answerText,
    meters,
    keywordsHit,
    liveStar,
    currentResult,
    lastResult,
    micLevel,
    speaking: speech.speaking,
    hasHindiVoice: speech.hasHindiVoice,
    hasIndianEnglish: speech.hasIndianEnglish,
    recSupported: rec.supported,
    mode,
    personaId: pid,
    script,
    actions: engine,
  }
}

export type InterviewEngine = ReturnType<typeof useInterviewEngine>
