'use client'

/**
 * Simulated-AI helpers shared by every unit.
 *
 * - Timing: sleep, fakeLatency, useTypewriter, useAgentSteps, useCountUp.
 * - Motion: useReducedMotion (SSR-safe, hydration-safe).
 * - Language analysis on REAL transcripts: keyword aliases (Latin, spaced and
 *   Devanagari forms), filler words, words per minute, STAR cues, word diff.
 *
 * Everything here is deterministic. Math.random is only used inside
 * fakeLatency, which runs in handlers/effects, never during render.
 */

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { Bi } from '@/lib/os/i18n'
import { useDemo } from '@/lib/os/demo-store'

// ---------------------------------------------------------------------------
// Timing
// ---------------------------------------------------------------------------

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms || 0)))
}

/** A plausible "model latency" pause. Call from handlers or effects only. */
export function fakeLatency(min = 300, max = 900): Promise<void> {
  const lo = Math.min(min, max)
  const hi = Math.max(min, max)
  return sleep(lo + Math.random() * (hi - lo))
}

// ---------------------------------------------------------------------------
// Reduced motion
// ---------------------------------------------------------------------------

const RM_QUERY = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(cb: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {}
  const mq = window.matchMedia(RM_QUERY)
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', cb)
    return () => mq.removeEventListener('change', cb)
  }
  // Safari < 14
  mq.addListener(cb)
  return () => mq.removeListener(cb)
}

function getReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  try {
    return window.matchMedia(RM_QUERY).matches
  } catch {
    return false
  }
}

/** true when the OS asks for reduced motion. Returns false on the server and during hydration. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false)
}

// ---------------------------------------------------------------------------
// Grapheme splitting (keeps Devanagari matras and conjuncts intact while streaming)
// ---------------------------------------------------------------------------

const VIRAMA = '्'
const COMBINING_RE = /[ऀ-ःऺ-ॏ॑-ॗॢॣ̀-ͯ‌‍️]/

type SegmenterLike = { segment(input: string): Iterable<{ segment: string }> }
let segmenter: SegmenterLike | null | undefined

function getSegmenter(): SegmenterLike | null {
  if (segmenter !== undefined) return segmenter
  try {
    const Seg = (Intl as unknown as { Segmenter?: new (l?: string, o?: { granularity: string }) => SegmenterLike }).Segmenter
    segmenter = Seg ? new Seg(undefined, { granularity: 'grapheme' }) : null
  } catch {
    segmenter = null
  }
  return segmenter
}

/** Split text into user-perceived characters. Conjuncts (consonant + virama + consonant) stay together. */
export function splitGraphemes(text: string): string[] {
  if (!text) return []
  let parts: string[]
  const seg = getSegmenter()
  if (seg) {
    parts = []
    for (const s of seg.segment(text)) parts.push(s.segment)
  } else {
    parts = []
    for (const ch of Array.from(text)) {
      if (parts.length && COMBINING_RE.test(ch)) parts[parts.length - 1] += ch
      else parts.push(ch)
    }
  }
  const out: string[] = []
  for (const p of parts) {
    if (out.length && out[out.length - 1].endsWith(VIRAMA)) out[out.length - 1] += p
    else out.push(p)
  }
  return out
}

// ---------------------------------------------------------------------------
// useTypewriter
// ---------------------------------------------------------------------------

export interface TypewriterOptions {
  /** Characters per second. Default 45. */
  cps?: number
  /** Delay before the first character. Default 300 ms. */
  startDelay?: number
  /** false shows the full text at once (no animation). Default true. Lite mode is always instant. */
  enabled?: boolean
  /** Called once per run when the full text is shown (also for instant runs). */
  onDone?: () => void
}

const PAUSE_CHARS = new Set(['.', ',', '?', '!', '।', ';', '॥'])

/**
 * Streams `text` at ~45 cps with a 120 ms pause after . , ? ! । ;
 * Instant when reduced motion is requested, in Lite mode, or when `enabled` is false.
 * Restarts automatically when `text` changes.
 */
export function useTypewriter(
  text: string,
  opts: TypewriterOptions = {},
): { output: string; done: boolean; finish: () => void; restart: () => void } {
  const { cps = 45, startDelay = 300, enabled = true, onDone } = opts
  const safeText = typeof text === 'string' ? text : text == null ? '' : String(text)
  const reduced = useReducedMotion()
  const lite = !!useDemo().state.lite
  const instant = !enabled || reduced || lite
  const units = useMemo(() => splitGraphemes(safeText), [safeText])
  const total = units.length

  const [run, setRun] = useState(0)
  const [shown, setShown] = useState(() => (instant ? total : 0))
  // Reset synchronously during render when the text changes, so the new text never flashes at the old length.
  const [prevText, setPrevText] = useState(safeText)
  if (prevText !== safeText) {
    setPrevText(safeText)
    setShown(instant ? total : 0)
  }

  const shownRef = useRef(shown)
  shownRef.current = shown

  useEffect(() => {
    if (instant) {
      setShown(total)
      return
    }
    let i = Math.min(shownRef.current, total)
    if (i >= total) return
    const perChar = 1000 / Math.max(1, cps)
    let timer: ReturnType<typeof setTimeout> | undefined
    const tick = () => {
      // finish() may have jumped to the end between ticks.
      if (shownRef.current >= total) return
      i = Math.min(total, i + 1)
      setShown(i)
      if (i >= total) return
      const prev = units[i - 1]
      const next = units[i]
      const pause = PAUSE_CHARS.has(prev) && (next === undefined || /\s/.test(next) || prev === '।') ? 120 : 0
      timer = setTimeout(tick, perChar + pause)
    }
    timer = setTimeout(tick, i === 0 ? Math.max(0, startDelay) : perChar)
    return () => {
      if (timer) clearTimeout(timer)
    }
    // `units` identity follows `safeText`.
  }, [units, total, instant, cps, startDelay, run])

  const done = shown >= total

  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const firedKey = useRef<string | null>(null)
  useEffect(() => {
    const key = `${run}\u0001${safeText}`
    if (done) {
      if (firedKey.current !== key) {
        firedKey.current = key
        onDoneRef.current?.()
      }
    }
  }, [done, run, safeText])

  const finish = useCallback(() => {
    shownRef.current = Number.MAX_SAFE_INTEGER
    setShown(Number.MAX_SAFE_INTEGER)
  }, [])
  const restart = useCallback(() => {
    firedKey.current = null
    shownRef.current = 0
    setShown(0)
    setRun((r) => r + 1)
  }, [])

  const clamped = Math.min(shown, total)
  const output = clamped >= total ? safeText : units.slice(0, clamped).join('')
  return { output, done, finish, restart }
}

// ---------------------------------------------------------------------------
// useAgentSteps
// ---------------------------------------------------------------------------

export interface AgentStepsOptions {
  /** Time per step. Default 420 ms. */
  stepMs?: number
  /** false holds the log before the first step. Default true. */
  start?: boolean
  onDone?: () => void
}

function stepsKey(steps: ReadonlyArray<unknown>): string {
  return steps
    .map((s) => {
      if (typeof s === 'string') return s
      if (s && typeof s === 'object' && 'en' in (s as Record<string, unknown>)) return String((s as Bi).en)
      return String(s)
    })
    .join('\u0001')
}

/**
 * Advances through `steps` one at a time.
 * `current` is the index of the step in progress; steps below it are complete.
 * When done, current === steps.length.
 * Restarts when the steps' (English) content changes, not when the array identity changes.
 */
export function useAgentSteps(
  steps: ReadonlyArray<string | Bi>,
  opts: AgentStepsOptions = {},
): { current: number; done: boolean; finish: () => void; started: boolean } {
  const { stepMs = 420, start = true, onDone } = opts
  const list: ReadonlyArray<string | Bi> = Array.isArray(steps) ? steps : []
  const count = list.length
  const key = stepsKey(list)

  const [current, setCurrent] = useState(0)
  const [prevKey, setPrevKey] = useState(key)
  if (prevKey !== key) {
    setPrevKey(key)
    setCurrent(0)
  }

  useEffect(() => {
    if (!start || current >= count) return
    const id = setTimeout(() => setCurrent((c) => Math.min(c + 1, count)), Math.max(0, stepMs))
    return () => clearTimeout(id)
  }, [start, current, count, stepMs, key])

  const done = start && current >= count

  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const firedKey = useRef<string | null>(null)
  useEffect(() => {
    if (done && firedKey.current !== key) {
      firedKey.current = key
      onDoneRef.current?.()
    }
  }, [done, key])

  const finish = useCallback(() => setCurrent(count), [count])
  return { current: Math.min(current, count), done, finish, started: start }
}

// ---------------------------------------------------------------------------
// useCountUp
// ---------------------------------------------------------------------------

export interface CountUpOptions {
  durationMs?: number
  from?: number
  start?: boolean
  decimals?: number
}

function roundTo(n: number, decimals: number): number {
  const f = Math.pow(10, Math.max(0, Math.min(6, Math.floor(decimals))))
  return Math.round(n * f) / f
}

/**
 * Animates a number from `from` (first run) or from the currently shown value (later target changes)
 * to `target` with an ease-out curve. Instant under reduced motion.
 */
export function useCountUp(target: number, opts: CountUpOptions = {}): number {
  const { durationMs = 900, from = 0, start = true, decimals = 0 } = opts
  const reduced = useReducedMotion()
  const safeTarget = typeof target === 'number' && Number.isFinite(target) ? target : 0
  const safeFrom = typeof from === 'number' && Number.isFinite(from) ? from : 0

  const [value, setValue] = useState(() => roundTo(safeFrom, decimals))
  const rawRef = useRef(safeFrom)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!start) return
    const set = (v: number) => {
      rawRef.current = v
      const r = roundTo(v, decimals)
      setValue((prev) => (prev === r ? prev : r))
    }
    if (reduced || durationMs <= 0) {
      startedRef.current = true
      set(safeTarget)
      return
    }
    const origin = startedRef.current ? rawRef.current : safeFrom
    startedRef.current = true
    if (origin === safeTarget) {
      set(safeTarget)
      return
    }
    let raf = 0
    let t0 = -1
    const step = (now: number) => {
      if (t0 < 0) t0 = now
      const p = Math.min(1, (now - t0) / durationMs)
      const e = 1 - Math.pow(1 - p, 3)
      set(origin + (safeTarget - origin) * e)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [safeTarget, safeFrom, start, reduced, durationMs, decimals])

  return start ? value : roundTo(safeFrom, decimals)
}

// ---------------------------------------------------------------------------
// Text normalisation and keyword matching
// ---------------------------------------------------------------------------

export type KeywordSpec = string | { label: string; aliases?: string[] }

export const KEYWORD_ALIASES: Record<string, string[]> = {
  ESP32: ['esp32', 'esp 32', 'e s p 32', 'esp-32', 'ईएसपी 32', 'ईएसपी32', 'ई एस पी 32', 'इएसपी 32', 'ईएसपी बत्तीस'],
  MQTT: ['mqtt', 'm q t t', 'एमक्यूटीटी', 'एम क्यू टी टी', 'एमक्यूटी'],
  SMS: ['sms', 's m s', 'एसएमएस', 'एस एम एस', 'मैसेज'],
  sensor: ['sensor', 'sensors', 'सेंसर'],
  battery: ['battery', 'बैटरी'],
  cloud: ['cloud', 'क्लाउड'],
  latency: ['latency', 'लेटेंसी', 'delay', 'डिले'],
  'O(n)': ['o(n)', 'o n', 'order n', 'order of n', 'ओ एन', 'linear time'],
  'two pointer': ['two pointer', 'two pointers', '2 pointer', 'टू पॉइंटर', 'दो पॉइंटर'],
  shift: ['shift', 'shifting', 'शिफ्ट'],
  remove: ['remove', 'रिमूव'],
  linear: ['linear', 'लीनियर'],
  thread: ['thread', 'threads', 'थ्रेड'],
  process: ['process', 'प्रोसेस'],
  memory: ['memory', 'मेमोरी'],
  subquery: ['subquery', 'sub query', 'सब क्वेरी'],
  relocate: ['relocate', 'relocation', 'रिलोकेट', 'कहीं भी'],
  'night shift': ['night shift', 'shifts', 'नाइट शिफ्ट'],
  torque: ['torque', 'टॉर्क'],
  power: ['power', 'पावर'],
  EV: ['ev', 'e v', 'ईवी', 'इलेक्ट्रिक'],
  BMS: ['bms', 'b m s', 'बीएमएस'],
  safety: ['safety', 'सेफ्टी', 'सुरक्षा'],
  PPE: ['ppe', 'पीपीई'],
  lockout: ['lockout', 'लॉकआउट'],
  gear: ['gear', 'गियर'],
  farmer: ['farmer', 'farmers', 'kisan', 'किसान'],
  water: ['water', 'paani', 'पानी'],
  school: ['school', 'स्कूल'],
  hospital: ['hospital', 'अस्पताल'],
  app: ['app', 'ऐप', 'एप'],
  solar: ['solar', 'सोलर'],
  internet: ['internet', 'इंटरनेट'],
  data: ['data', 'डेटा', 'डाटा'],
  road: ['road', 'सड़क'],
  flood: ['flood', 'baadh', 'बाढ़'],
}

const PUNCT_RE = new RegExp('[\\p{P}\\p{S}\\u0964\\u0965]', 'gu')
const ZW_RE = /[​-‍﻿]/g

/** NFC; lowercase; punctuation (including । and ॥) becomes a space; spaces collapsed. */
export function normalizeText(s: string): string {
  if (typeof s !== 'string' || !s) return ''
  return s
    .normalize('NFC')
    .replace(ZW_RE, '')
    .toLowerCase()
    .replace(PUNCT_RE, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Looser key used for matching only: also folds nukta and chandrabindu, which ASR outputs inconsistently. */
function matchKey(s: string): string {
  return normalizeText(s).replace(/़/g, '').replace(/ँ/g, 'ं')
}

function aliasesFor(spec: KeywordSpec): { label: string; aliases: string[] } {
  if (typeof spec === 'string') {
    const direct = KEYWORD_ALIASES[spec]
    const ci = direct ?? lookupAliasCI(spec)
    return { label: spec, aliases: uniq([spec, ...(ci ?? [spec])]) }
  }
  if (spec && typeof spec === 'object' && typeof spec.label === 'string') {
    const base = KEYWORD_ALIASES[spec.label] ?? lookupAliasCI(spec.label) ?? []
    return { label: spec.label, aliases: uniq([spec.label, ...(spec.aliases ?? []), ...base]) }
  }
  return { label: String(spec), aliases: [String(spec)] }
}

function lookupAliasCI(label: string): string[] | undefined {
  const lower = label.toLowerCase()
  for (const k of Object.keys(KEYWORD_ALIASES)) if (k.toLowerCase() === lower) return KEYWORD_ALIASES[k]
  return undefined
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

interface Prepared {
  norm: string
  padded: string
  stripped: string
}

function prepare(text: string): Prepared {
  const norm = matchKey(text)
  return { norm, padded: ` ${norm} `, stripped: norm.replace(/ /g, '') }
}

function nonSpaceCountBefore(s: string, idx: number): number {
  let n = 0
  for (let i = 0; i < idx && i < s.length; i++) if (s[i] !== ' ') n++
  return n
}

/** Position of an alias in stripped-text coordinates, or -1. */
function findAlias(p: Prepared, alias: string): number {
  const a = matchKey(alias)
  if (!a) return -1
  let best = -1
  const tokenIdx = p.padded.indexOf(` ${a} `)
  if (tokenIdx >= 0) best = nonSpaceCountBefore(p.norm, tokenIdx)
  const sa = a.replace(/ /g, '')
  if (sa.length >= 4) {
    const si = p.stripped.indexOf(sa)
    if (si >= 0 && (best < 0 || si < best)) best = si
  }
  return best
}

function keywordPosition(p: Prepared, spec: KeywordSpec): { label: string; pos: number } {
  const { label, aliases } = aliasesFor(spec)
  let pos = -1
  for (const al of aliases) {
    const i = findAlias(p, al)
    if (i >= 0 && (pos < 0 || i < pos)) pos = i
  }
  return { label, pos }
}

/**
 * Labels of the keywords present in `text`. An alias matches as whole tokens, or, when it is at least
 * 4 characters long, anywhere in the space-stripped text ("e s p 32" and "ईएसपी32" both hit ESP32).
 */
export function detectKeywords(text: string, keywords: ReadonlyArray<KeywordSpec>): string[] {
  if (!text || !Array.isArray(keywords) || keywords.length === 0) return []
  const p = prepare(text)
  if (!p.norm) return []
  const hits: string[] = []
  for (const k of keywords) {
    const { label, pos } = keywordPosition(p, k)
    if (pos >= 0 && !hits.includes(label)) hits.push(label)
  }
  return hits
}

/** The label whose earliest occurrence comes first in `text`, or null. */
export function firstKeyword(text: string, keywords: ReadonlyArray<KeywordSpec>): string | null {
  if (!text || !Array.isArray(keywords) || keywords.length === 0) return null
  const p = prepare(text)
  if (!p.norm) return null
  let best: { label: string; pos: number } | null = null
  for (const k of keywords) {
    const r = keywordPosition(p, k)
    if (r.pos >= 0 && (best === null || r.pos < best.pos)) best = r
  }
  return best ? best.label : null
}

/** The option with the most keyword hits (first wins ties), else `fallback`. */
export function matchCanned<T extends { keywords: ReadonlyArray<KeywordSpec> }, F = T>(
  input: string,
  options: ReadonlyArray<T>,
  fallback: F,
): T | F {
  if (!input || !Array.isArray(options)) return fallback
  let best: T | null = null
  let bestHits = 0
  for (const o of options) {
    const hits = detectKeywords(input, o?.keywords ?? []).length
    if (hits > bestHits) {
      best = o
      bestHits = hits
    }
  }
  return best ?? fallback
}

// ---------------------------------------------------------------------------
// Fillers, pace, STAR, diff
// ---------------------------------------------------------------------------

export const FILLERS: ReadonlyArray<{ label: string; forms: string[] }> = [
  { label: 'matlab', forms: ['matlab', 'मतलब'] },
  { label: 'basically', forms: ['basically', 'बेसिकली'] },
  { label: 'actually', forms: ['actually', 'एक्चुअली'] },
  { label: 'you know', forms: ['you know', 'यू नो'] },
  { label: 'um', forms: ['um', 'umm', 'hmm', 'हम्म'] },
  { label: 'uh', forms: ['uh', 'uhh'] },
]

const FILLER_FORMS: { label: string; tokens: string[] }[] = FILLERS.flatMap((f) =>
  f.forms.map((form) => ({ label: f.label, tokens: matchKey(form).split(' ').filter(Boolean) })),
)
  // longest sequences first, so 'you know' wins over shorter forms
  .sort((a, b) => b.tokens.length - a.tokens.length)

const WORD_RE = new RegExp('[^\\s\\p{P}\\p{S}\\u0964\\u0965]+', 'gu')

interface Tok {
  start: number
  end: number
  key: string
}

function tokenize(text: string): Tok[] {
  const out: Tok[] = []
  if (!text) return out
  WORD_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = WORD_RE.exec(text)) !== null) {
    const key = matchKey(m[0])
    if (key) out.push({ start: m.index, end: m.index + m[0].length, key })
  }
  return out
}

function fillerSpans(text: string): { start: number; end: number; label: string }[] {
  const toks = tokenize(text)
  const spans: { start: number; end: number; label: string }[] = []
  let i = 0
  while (i < toks.length) {
    let matched = false
    for (const f of FILLER_FORMS) {
      const n = f.tokens.length
      if (n === 0 || i + n > toks.length) continue
      let ok = true
      for (let j = 0; j < n; j++) {
        if (toks[i + j].key !== f.tokens[j]) {
          ok = false
          break
        }
      }
      if (ok) {
        spans.push({ start: toks[i].start, end: toks[i + n - 1].end, label: f.label })
        i += n
        matched = true
        break
      }
    }
    if (!matched) i++
  }
  return spans
}

/** Counts only the listed fillers, at token boundaries. byWord holds labels with a count above zero. */
export function countFillers(text: string): { total: number; byWord: Record<string, number> } {
  const byWord: Record<string, number> = {}
  const spans = fillerSpans(typeof text === 'string' ? text : '')
  for (const s of spans) byWord[s.label] = (byWord[s.label] ?? 0) + 1
  return { total: spans.length, byWord }
}

/** Splits the ORIGINAL text into segments, flagging fillers (for amber underlines). */
export function markFillers(text: string): { text: string; filler: boolean }[] {
  const src = typeof text === 'string' ? text : ''
  if (!src) return []
  const spans = fillerSpans(src)
  const out: { text: string; filler: boolean }[] = []
  let cursor = 0
  for (const s of spans) {
    if (s.start > cursor) out.push({ text: src.slice(cursor, s.start), filler: false })
    out.push({ text: src.slice(s.start, s.end), filler: true })
    cursor = s.end
  }
  if (cursor < src.length) out.push({ text: src.slice(cursor), filler: false })
  return out
}

/** Words per minute over `ms` milliseconds. 0 when there is no time or no words. */
export function wordsPerMinute(text: string, ms: number): number {
  if (!text || !Number.isFinite(ms) || ms <= 0) return 0
  const words = tokenize(text).length
  if (!words) return 0
  return Math.round(words / (ms / 60000))
}

const STAR_CUES: Record<'S' | 'T' | 'A' | 'R', string[]> = {
  S: ['when', 'during', 'project', 'jab', 'hamare', 'जब', 'प्रोजेक्ट', 'हमारे', 'के दौरान'],
  T: ['goal', 'task', 'needed', 'had to', 'karna tha', 'लक्ष्य', 'करना था', 'ज़रूरत', 'जरूरत'],
  A: ['i built', 'i wrote', 'implemented', 'maine', 'banaya', 'likha', 'use kiya', 'मैंने', 'बनाया', 'लिखा', 'इस्तेमाल किया'],
  R: ['result', 'reduced', 'improved', '%', 'percent', 'kam hua', 'badh', 'परिणाम', 'कम हुआ', 'बढ़', 'प्रतिशत'],
}

const STAR_KEYS: Record<'S' | 'T' | 'A' | 'R', string[]> = {
  S: STAR_CUES.S.map(matchKey),
  T: STAR_CUES.T.map(matchKey),
  A: STAR_CUES.A.map(matchKey),
  R: STAR_CUES.R.map((c) => (c === '%' ? '%' : matchKey(c))),
}

/** STAR structure cues (Situation, Task, Action, Result) in Latin or Devanagari. */
export function detectStar(text: string): { S: boolean; T: boolean; A: boolean; R: boolean } {
  const res = { S: false, T: false, A: false, R: false }
  if (!text || typeof text !== 'string') return res
  const padded = ` ${matchKey(text)} `
  const raw = text
  ;(Object.keys(STAR_KEYS) as ('S' | 'T' | 'A' | 'R')[]).forEach((k) => {
    res[k] = STAR_KEYS[k].some((cue) => {
      if (!cue) return false
      if (cue === '%') return raw.includes('%')
      // Latin cues match at a word start; Devanagari cues as substrings (inflections attach to the stem).
      if (/^[a-z0-9 ]+$/.test(cue)) return padded.includes(` ${cue}`)
      return padded.includes(cue)
    })
  })
  return res
}

/** Marks each reference word as spoken (ok) or missed, via LCS on normalised tokens. */
export function diffWords(reference: string, spoken: string): { word: string; ok: boolean }[] {
  const refWords = (typeof reference === 'string' ? reference : '').split(/\s+/).filter(Boolean)
  if (!refWords.length) return []
  const refKeys = refWords.map((w) => matchKey(w).replace(/ /g, ''))
  const spokenKeys = matchKey(typeof spoken === 'string' ? spoken : '')
    .split(' ')
    .filter(Boolean)
  const n = refKeys.length
  const m = spokenKeys.length
  if (!m) return refWords.map((word, i) => ({ word, ok: refKeys[i] === '' }))
  // dp[i][j] = LCS of refKeys[i..] and spokenKeys[j..]
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = refKeys[i] && refKeys[i] === spokenKeys[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const ok = new Array<boolean>(n).fill(false)
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (refKeys[i] && refKeys[i] === spokenKeys[j]) {
      ok[i] = true
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++
    else j++
  }
  return refWords.map((word, k) => ({ word, ok: ok[k] || refKeys[k] === '' }))
}
