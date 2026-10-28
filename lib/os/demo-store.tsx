'use client'

/* =============================================================================
 * ParthSarthi Placement OS · FOUNDATION CONTRACT
 * =============================================================================
 *
 * EXPORT INDEX (everything other units may import)
 * - lib/os/i18n.ts: Lang, Bi, tr, officerLang, isDevanagari, fmtIN, fmtNum, fmtINR, fmtPct, fmtDate, bySex,
 *   LANG_LABEL, PLANNED_LANGS
 * - lib/os/scoring.ts: PILLAR_KEYS, PILLAR_WEIGHTS, PILLAR_LABELS, INTEGRITY_FLOOR, computePRI, withLiveIntegrity,
 *   versantToPillar, pillarToVersant, interviewPillar, BandId, BANDS, bandFor, bandClasses, offerBandFor, seqColor
 * - lib/os/rounds.ts: RoundId, ROUNDS, roundById, REPORT_ROUTE, nextRoute, ROUND_TARGETS, VERSANT_TARGETS,
 *   INTERVIEW_SPLIT, formatRoundScore
 * - lib/os/demo-store.tsx: RoundStatus, RoundState, Signal, ProctorEvent, Integrity, RunState, DemoState,
 *   DemoEventName, DEFAULT_RUN, DEFAULT_DEMO_STATE, DemoProvider, useDemo, OfficerScope, useLang, emitDemo,
 *   useDemoEvent
 * - lib/os/print.ts: printOnly
 * - lib/ai-sim.ts: sleep, fakeLatency, useReducedMotion, useTypewriter, useAgentSteps, useCountUp, KeywordSpec,
 *   KEYWORD_ALIASES, normalizeText, detectKeywords, firstKeyword, matchCanned, FILLERS, countFillers, markFillers,
 *   wordsPerMinute, detectStar, diffWords
 * - lib/mock/types.ts: all shared data types
 * - lib/mock/seed.ts: mulberry32, rng, allocate, clamp, round1
 * - lib/mock/state.ts: DEMO_TODAY, isoDaysBefore, daysFromToday, daysBetween, WEEK_LABEL, PUBLIC_DEMO_URL,
 *   QR_IMAGE_PATH, SOURCES, REPORTED, PREVIEW, FIXED_DISTRICT_PRI, TRUST_COMMITMENTS, CONSENT_TEXT, SPEECH_NOTE,
 *   SIMULATED_RANKING_NOTE
 * - lib/mock/geo.ts: DISTRICT_GEO, DIVISIONS
 * - lib/mock/institutions.ts: INSTITUTIONS, institutionById, institutionsByDistrict, batchOf, TPO_SUPPORTED_COLLEGES,
 *   pseudonymFor
 * - lib/mock/districts.ts: DISTRICTS, districtById, districtPriMap, districtsRanked
 * - lib/mock/personas.ts: PERSONAS, PRIYA, RAHUL, NUSRAT, NUSRAT_PROFILE, latestAttempt, previousAttempt
 * - lib/mock/students.ts: PCE_STUDENTS, PCE_BRANCH_STATS, PCE_BRANCH_SKILL, studentsFor, branchSkillFor
 * - lib/mock/blueprints.ts: BLUEPRINTS, blueprintById, isCoreBlueprint
 * - lib/mock/drives.ts: DRIVES, driveById, drivesFor, stretchDrivesFor, DRIVE_COUNTS, drivesForInstitution,
 *   POOL_CONTRIB, poolReady
 * - lib/mock/schemes.ts: SCHEMES, schemesFor
 * - lib/mock/ticker.ts: TICKER
 * - lib/mock/checks.ts: runMockAsserts
 * - hooks/use-speech.ts: getSharedAudioContext, unlockAudio, isAudioUnlocked, splitForSpeech, useSpeak,
 *   useSpeechRecognition, useMicLevel
 * - hooks/use-proctor.ts: useProctor, markProctorGrace
 * - hooks/use-query-param.ts: useQueryParam, setQueryParam, notifyUrlChange
 * - components/ai: AIOrb, StreamingText, AgentLog, AIThinking, AISurface, AIBadge, ScoreRing, CountUp, Waveform,
 *   InsightCard, LiveTicker, aiToast (one named export per file, matching the file name)
 * - components/os: OSChrome, OSPageSkeleton, OSBar, PresenterDock, IllustrativeChip + SimulatedNotice (both in
 *   illustrative-chip.tsx), SourceNote, KpiTile, Sparkline, Heatmap, BiharTileMap, BandBadge, DriveShell, DriveRail,
 *   ProctorPanel, SignalsDrawer, TrustStrip, IntegrationChip, AudioGate, LanguageSwitcher, Tr (in tr-text.tsx)
 *
 * RULES FOR ALL UNITS
 *  1. Any file using hooks or browser APIs starts with 'use client'.
 *  2. No Math.random or Date.now during render. Use rng(). All dates derive from DEMO_TODAY.
 *  3. localStorage only inside effects or lazy initialisers under OSChrome, always in try/catch.
 *  4. Never import lib/api.ts.
 *  5. Never use next/navigation useSearchParams. Use useQueryParam.
 *  6. Never type headline numbers, district values or drive counts into copy. Build strings with template
 *     functions from lib/mock constants.
 *  7. Recharts: never wrap chart children (Bar, Line, Area, Cell, ErrorBar, ReferenceArea, ReferenceLine, RadialBar,
 *     PolarAngleAxis and so on) in fragments or custom wrapper components. react-is 18 under React 19 drops them.
 *     Use keyed arrays.
 *  8. Minimum 12px text. Every Hindi string sits in an element with lang='hi' and font-deva (use <Tr>).
 *  9. Officer screens (/state, /state/brief, /tpo) wrap their content in <OfficerScope>.
 * 10. Print only through printOnly(). Never call window.print directly.
 * 11. Overlays come from components/ui. Foundation raises them to z-[100] so they open above DriveShell.
 * 12. No real recruiter names in drive titles, offers or spoken copy. Blueprints may say 'X-style'.
 * 13. Persona numbers come from ROUND_TARGETS[personaId], VERSANT_TARGETS[personaId] and INTERVIEW_SPLIT[personaId].
 * 14. Always guard previousAttempt() returning null (Rahul).
 * ========================================================================== */

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { officerLang, tr, type Bi, type Lang } from '@/lib/os/i18n'
import { INTEGRITY_FLOOR, TAB_SWITCH_PENALTY } from '@/lib/os/scoring'
import type { RoundId } from '@/lib/os/rounds'
import type { Attempt, Blueprint, Persona, PersonaRunId } from '@/lib/mock/types'
import { PRIYA, RAHUL, latestAttempt, previousAttempt } from '@/lib/mock/personas'
import { blueprintById } from '@/lib/mock/blueprints'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type RoundStatus = 'locked' | 'live' | 'cleared' | 'flagged' | 'eliminated'

/**
 * detail conventions: technical.detail.signalChip; communication.detail.versant and detail.signalChip;
 * techInterview.detail.content and detail.delivery.
 */
export interface RoundState {
  status: RoundStatus
  score?: number
  detail?: Record<string, number | string>
}

export interface Signal {
  id: string
  round: RoundId
  kind: 'strength' | 'gap' | 'behaviour'
  text: Bi
}

export interface ProctorEvent {
  /** performance.now() at the time of the event (page-relative). */
  t: number
  kind: 'tab' | 'paste' | 'face' | 'noise'
  label: string
}

export interface Integrity {
  score: number
  tabSwitches: number
  pasteBlocks: number
  events: ProctorEvent[]
}

export interface RunState {
  rounds: Record<RoundId, RoundState>
  signals: Signal[]
  integrity: Integrity
}

export interface DemoState {
  v: 2
  lang: Lang
  personaId: PersonaRunId
  loggedIn: boolean
  consent: boolean
  blueprintId: string
  runs: Record<PersonaRunId, RunState>
  voiceMode: 'live' | 'scripted'
  lite: boolean
  includeGd: boolean
  tpoAssigned: string[]
  school: { loggedIn: boolean; consent: boolean; step: number; done: boolean }
}

export type DemoEventName = 'fastforward' | 'autopilot' | 'reset' | 'finish'

// -----------------------------------------------------------------------------
// Defaults
// -----------------------------------------------------------------------------

const ROUND_IDS: RoundId[] = ['eligibility', 'aptitude', 'technical', 'communication', 'gd', 'techInterview', 'hrInterview']
const STATUSES: RoundStatus[] = ['locked', 'live', 'cleared', 'flagged', 'eliminated']
const LANGS: Lang[] = ['en', 'hi', 'hinglish']
const MAX_EVENTS = 60

const STORAGE_KEY = 'ps_os_demo_v2'
const PRESENTER_KEY = 'ps_os_presenter'

function makeRun(): RunState {
  const rounds = {} as Record<RoundId, RoundState>
  for (const id of ROUND_IDS) rounds[id] = { status: id === 'eligibility' ? 'live' : 'locked' }
  return { rounds, signals: [], integrity: { score: 100, tabSwitches: 0, pasteBlocks: 0, events: [] } }
}

function makeDefaultState(): DemoState {
  return {
    v: 2,
    lang: 'hinglish',
    personaId: 'priya',
    loggedIn: false,
    consent: false,
    blueprintId: 'tcs-nqt-style',
    runs: { priya: makeRun(), rahul: makeRun() },
    voiceMode: 'live',
    lite: false,
    includeGd: false,
    tpoAssigned: [],
    school: { loggedIn: false, consent: false, step: 1, done: false },
  }
}

/** Every round locked except eligibility ('live'); no signals; integrity 100. Treat as read-only. */
export const DEFAULT_RUN: RunState = makeRun()

/** lang 'hinglish', persona 'priya', blueprint 'tcs-nqt-style', voice 'live', lite off, GD off. Treat as read-only. */
export const DEFAULT_DEMO_STATE: DemoState = makeDefaultState()

function defaultBlueprintFor(id: PersonaRunId): string {
  const p = id === 'rahul' ? RAHUL : PRIYA
  return p?.defaultBlueprintId || (id === 'rahul' ? 'core-mech-oem-style' : 'tcs-nqt-style')
}

// -----------------------------------------------------------------------------
// Sanitising persisted state
// -----------------------------------------------------------------------------

type Obj = Record<string, unknown>
const isObj = (x: unknown): x is Obj => !!x && typeof x === 'object' && !Array.isArray(x)
const bool = (x: unknown, d: boolean) => (typeof x === 'boolean' ? x : d)
const num = (x: unknown): number | undefined => (typeof x === 'number' && Number.isFinite(x) ? x : undefined)

function sanitizeBi(x: unknown): Bi | null {
  if (!isObj(x) || typeof x.en !== 'string') return null
  const out: Bi = { en: x.en, hi: typeof x.hi === 'string' ? x.hi : '' }
  if (typeof x.hinglish === 'string') out.hinglish = x.hinglish
  return out
}

function sanitizeRound(x: unknown, d: RoundState): RoundState {
  if (!isObj(x)) return { ...d }
  const status = STATUSES.includes(x.status as RoundStatus) ? (x.status as RoundStatus) : d.status
  const out: RoundState = { status }
  const score = num(x.score)
  if (score !== undefined) out.score = score
  if (isObj(x.detail)) {
    const detail: Record<string, number | string> = {}
    for (const [k, v] of Object.entries(x.detail)) {
      if (typeof v === 'string' || (typeof v === 'number' && Number.isFinite(v))) detail[k] = v
    }
    out.detail = detail
  }
  return out
}

function sanitizeRun(x: unknown): RunState {
  const d = makeRun()
  if (!isObj(x)) return d
  const rounds = {} as Record<RoundId, RoundState>
  const rx = isObj(x.rounds) ? x.rounds : {}
  for (const id of ROUND_IDS) rounds[id] = sanitizeRound(rx[id], d.rounds[id])

  const signals: Signal[] = []
  if (Array.isArray(x.signals)) {
    for (const s of x.signals) {
      if (!isObj(s)) continue
      const text = sanitizeBi(s.text)
      if (!text || !ROUND_IDS.includes(s.round as RoundId)) continue
      const kind = s.kind === 'strength' || s.kind === 'gap' || s.kind === 'behaviour' ? s.kind : 'gap'
      signals.push({ id: typeof s.id === 'string' ? s.id : `${String(s.round)}-${signals.length + 1}`, round: s.round as RoundId, kind, text })
    }
  }

  const ix = isObj(x.integrity) ? x.integrity : {}
  const events: ProctorEvent[] = []
  if (Array.isArray(ix.events)) {
    for (const e of ix.events.slice(-MAX_EVENTS)) {
      if (!isObj(e)) continue
      const kind = e.kind === 'tab' || e.kind === 'paste' || e.kind === 'face' || e.kind === 'noise' ? e.kind : null
      if (!kind) continue
      events.push({ t: num(e.t) ?? 0, kind, label: typeof e.label === 'string' ? e.label : '' })
    }
  }
  const score = num(ix.score)
  const integrity: Integrity = {
    score: score === undefined ? 100 : Math.max(INTEGRITY_FLOOR, Math.min(100, score)),
    tabSwitches: Math.max(0, Math.floor(num(ix.tabSwitches) ?? 0)),
    pasteBlocks: Math.max(0, Math.floor(num(ix.pasteBlocks) ?? 0)),
    events,
  }
  return { rounds, signals, integrity }
}

function sanitizeState(raw: unknown): DemoState {
  const d = makeDefaultState()
  if (!isObj(raw) || raw.v !== 2) return d
  const runs = isObj(raw.runs) ? raw.runs : {}
  const school = isObj(raw.school) ? raw.school : {}
  const step = num(school.step)
  return {
    v: 2,
    lang: LANGS.includes(raw.lang as Lang) ? (raw.lang as Lang) : d.lang,
    personaId: raw.personaId === 'rahul' ? 'rahul' : 'priya',
    loggedIn: bool(raw.loggedIn, d.loggedIn),
    consent: bool(raw.consent, d.consent),
    blueprintId: typeof raw.blueprintId === 'string' && raw.blueprintId ? raw.blueprintId : d.blueprintId,
    runs: { priya: sanitizeRun(runs.priya), rahul: sanitizeRun(runs.rahul) },
    voiceMode: raw.voiceMode === 'scripted' ? 'scripted' : 'live',
    lite: bool(raw.lite, d.lite),
    includeGd: bool(raw.includeGd, d.includeGd),
    tpoAssigned: Array.isArray(raw.tpoAssigned) ? raw.tpoAssigned.filter((x): x is string => typeof x === 'string') : [],
    school: {
      loggedIn: bool(school.loggedIn, d.school.loggedIn),
      consent: bool(school.consent, d.school.consent),
      step: step === undefined ? d.school.step : Math.max(1, Math.min(6, Math.round(step))),
      done: bool(school.done, d.school.done),
    },
  }
}

function writeState(s: DemoState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* private mode / quota */
  }
}

// -----------------------------------------------------------------------------
// Pure updaters
// -----------------------------------------------------------------------------

function updateRun(s: DemoState, fn: (run: RunState) => RunState): DemoState {
  const id = s.personaId
  const prev = s.runs[id] ?? makeRun()
  const next = fn(prev)
  if (next === prev) return s
  return { ...s, runs: { ...s.runs, [id]: next } }
}

function mergeRound(prev: RoundState | undefined, patch: Partial<RoundState>): RoundState {
  const base: RoundState = prev ?? { status: 'locked' }
  const merged: RoundState = { ...base, ...patch, status: patch.status ?? base.status }
  if (patch.detail || base.detail) merged.detail = { ...(base.detail ?? {}), ...(patch.detail ?? {}) }
  return prev && sameRound(prev, merged) ? prev : merged
}

/** One level deep: primitives by value, arrays element-wise, plain objects key-wise. */
function shallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => Object.is(x, b[i]))
  if (isObj(a) && isObj(b)) {
    const ka = Object.keys(a)
    return ka.length === Object.keys(b).length && ka.every((k) => Object.is(a[k], b[k]))
  }
  return false
}

function sameRound(a: RoundState, b: RoundState): boolean {
  if (a.status !== b.status || a.score !== b.score) return false
  const da = a.detail ?? {}
  const db = b.detail ?? {}
  const ka = Object.keys(da)
  if (ka.length !== Object.keys(db).length) return false
  return ka.every((k) => da[k] === db[k])
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

export type SignalInput = Omit<Signal, 'id'> & { id?: string }
export type ProctorInput = { kind: ProctorEvent['kind']; label: string }
type SetArg = Partial<DemoState> | ((s: DemoState) => Partial<DemoState>)

interface Actions {
  set: (partial: SetArg) => void
  setPresenter: (b: boolean) => void
  setPersona: (id: PersonaRunId) => void
  setRound: (id: RoundId, patch: Partial<RoundState>) => void
  addSignal: (s: SignalInput) => void
  logProctor: (e: ProctorInput) => void
  resetRun: () => void
  reset: () => void
}

interface CtxValue {
  state: DemoState
  hydrated: boolean
  presenter: boolean
  actions: Actions
}

const DemoCtx = createContext<CtxValue | null>(null)
const OfficerCtx = createContext(false)

let assertsRan = false

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(makeDefaultState)
  const [hydrated, setHydrated] = useState(false)
  const [presenter, setPresenterState] = useState(false)

  // Hydrate once from localStorage.
  useEffect(() => {
    let next = makeDefaultState()
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) next = sanitizeState(JSON.parse(raw))
    } catch {
      next = makeDefaultState()
    }
    let p = false
    try {
      p = window.localStorage.getItem(PRESENTER_KEY) === '1'
    } catch {
      p = false
    }
    setState(next)
    setPresenterState(p)
    setHydrated(true)
  }, [])

  // Persist, debounced 150 ms.
  const stateRef = useRef(state)
  stateRef.current = state
  useEffect(() => {
    if (!hydrated) return
    const id = setTimeout(() => writeState(state), 150)
    return () => clearTimeout(id)
  }, [state, hydrated])

  // Flush on page hide / unmount so a fast navigation or reload never loses the last change.
  useEffect(() => {
    if (!hydrated) return
    const flush = () => writeState(stateRef.current)
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [hydrated])

  // Development-only data checks.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || assertsRan) return
    assertsRan = true
    import('@/lib/mock/checks')
      .then((m) => {
        const rows = typeof m.runMockAsserts === 'function' ? m.runMockAsserts() : []
        let failed = 0
        for (const r of rows) {
          if (!r.ok) failed++
          console.assert(r.ok, `[mock] ${r.name}: ${r.detail}`)
        }
        if (rows.length) console.info(`[mock] ${rows.length - failed}/${rows.length} data checks passed`)
      })
      .catch(() => {
        /* checks module unavailable */
      })
  }, [])

  const actions = useMemo<Actions>(
    () => ({
      set: (partial) =>
        setState((s) => {
          const patch = typeof partial === 'function' ? partial(s) : partial
          if (!patch || typeof patch !== 'object') return s
          // No-op patches keep the same state object, so effects that call set() cannot loop.
          const keys = Object.keys(patch) as (keyof DemoState)[]
          if (keys.every((k) => shallowEqual(s[k], patch[k]))) return s
          return { ...s, ...patch, v: 2 }
        }),
      setPresenter: (b) => {
        setPresenterState(!!b)
        try {
          window.localStorage.setItem(PRESENTER_KEY, b ? '1' : '0')
        } catch {
          /* ignore */
        }
      },
      setPersona: (id) => {
        if (id !== 'priya' && id !== 'rahul') return
        setState((s) => {
          const blueprintId = defaultBlueprintFor(id)
          if (s.personaId === id && s.blueprintId === blueprintId) return s
          return { ...s, personaId: id, blueprintId }
        })
      },
      setRound: (id, patch) => {
        if (!ROUND_IDS.includes(id)) return
        setState((s) =>
          updateRun(s, (run) => {
            const next = mergeRound(run.rounds[id], patch ?? {})
            return next === run.rounds[id] ? run : { ...run, rounds: { ...run.rounds, [id]: next } }
          }),
        )
      },
      addSignal: (sig) => {
        if (!sig || !sig.text || typeof sig.text.en !== 'string') return
        setState((s) =>
          updateRun(s, (run) => {
            if (run.signals.some((x) => x.round === sig.round && x.text.en === sig.text.en)) return run
            const id = sig.id ?? `${sig.round}-${run.signals.length + 1}`
            return { ...run, signals: [...run.signals, { id, round: sig.round, kind: sig.kind, text: sig.text }] }
          }),
        )
      },
      logProctor: (e) => {
        if (!e) return
        const t = typeof performance !== 'undefined' ? Math.round(performance.now()) : 0
        setState((s) =>
          updateRun(s, (run) => {
            const ig = run.integrity
            let score = ig.score
            let tabSwitches = ig.tabSwitches
            let pasteBlocks = ig.pasteBlocks
            if (e.kind === 'tab') {
              score -= TAB_SWITCH_PENALTY
              tabSwitches += 1
            } else if (e.kind === 'paste') {
              score -= 2
              pasteBlocks += 1
            }
            score = Math.max(INTEGRITY_FLOOR, Math.min(100, score))
            const events = [...ig.events, { t, kind: e.kind, label: e.label ?? '' }].slice(-MAX_EVENTS)
            return { ...run, integrity: { score, tabSwitches, pasteBlocks, events } }
          }),
        )
      },
      resetRun: () => setState((s) => ({ ...s, runs: { ...s.runs, [s.personaId]: makeRun() } })),
      reset: () => setState(makeDefaultState()),
    }),
    [],
  )

  const value = useMemo<CtxValue>(() => ({ state, hydrated, presenter, actions }), [state, hydrated, presenter, actions])

  return <DemoCtx.Provider value={value}>{children}</DemoCtx.Provider>
}

// -----------------------------------------------------------------------------
// Officer scope + language
// -----------------------------------------------------------------------------

/** Officer screens (/state, /state/brief, /tpo): Hinglish maps to English inside this scope. */
export function OfficerScope({ children }: { children: ReactNode }) {
  return <OfficerCtx.Provider value={true}>{children}</OfficerCtx.Provider>
}

/** Effective language: officerLang(state.lang) inside OfficerScope, otherwise state.lang ('en' outside DemoProvider). */
export function useLang(): Lang {
  const ctx = useContext(DemoCtx)
  const officer = useContext(OfficerCtx)
  const lang: Lang = ctx ? ctx.state.lang : 'en'
  return officer ? officerLang(lang) : lang
}

// -----------------------------------------------------------------------------
// useDemo
// -----------------------------------------------------------------------------

export interface DemoApi extends Actions {
  state: DemoState
  hydrated: boolean
  presenter: boolean
  /** tr() with the effective language (officer-aware). */
  t: (b: Bi | string | null | undefined) => string
  lang: Lang
  persona: Persona
  attempt: Attempt
  /** null for Rahul (single attempt). Always guard. */
  prevAttempt: Attempt | null
  blueprint: Blueprint
  run: RunState
  rounds: Record<RoundId, RoundState>
  signals: Signal[]
  integrity: Integrity
  // Convenience shortcuts (additive)
  personaId: PersonaRunId
  voiceMode: 'live' | 'scripted'
  lite: boolean
  includeGd: boolean
}

const noop = () => {}
const NOOP_ACTIONS: Actions = {
  set: noop,
  setPresenter: noop,
  setPersona: noop,
  setRound: noop,
  addSignal: noop,
  logProctor: noop,
  resetRun: noop,
  reset: noop,
}

function personaFor(id: PersonaRunId): Persona {
  return (id === 'rahul' ? RAHUL : PRIYA) ?? PRIYA
}

// One stable t() per language, so pages can list it in effect deps without re-running on every state change.
const T_CACHE = new Map<Lang, DemoApi['t']>()
function tFor(lang: Lang): DemoApi['t'] {
  let fn = T_CACHE.get(lang)
  if (!fn) {
    fn = (b) => tr(b as Bi | string, lang)
    T_CACHE.set(lang, fn)
  }
  return fn
}

function buildApi(state: DemoState, hydrated: boolean, presenter: boolean, actions: Actions, lang: Lang): DemoApi {
  const persona = personaFor(state.personaId)
  const attempt = latestAttempt(persona) as Attempt
  const prev = previousAttempt(persona)
  const run = state.runs?.[state.personaId] ?? DEFAULT_RUN
  return {
    ...actions,
    state,
    hydrated,
    presenter,
    t: tFor(lang),
    lang,
    persona,
    attempt,
    prevAttempt: prev ?? null,
    blueprint: blueprintById(state.blueprintId || persona.defaultBlueprintId),
    run,
    rounds: run.rounds,
    signals: run.signals,
    integrity: run.integrity,
    personaId: state.personaId,
    voiceMode: state.voiceMode,
    lite: state.lite,
    includeGd: state.includeGd,
  }
}

let fallbackApi: DemoApi | null = null
function getFallbackApi(lang: Lang): DemoApi {
  if (lang !== 'en') return buildApi({ ...DEFAULT_DEMO_STATE, lang: 'en' }, true, false, NOOP_ACTIONS, lang)
  if (!fallbackApi) fallbackApi = buildApi({ ...DEFAULT_DEMO_STATE, lang: 'en' }, true, false, NOOP_ACTIONS, 'en')
  return fallbackApi
}

/** The demo store. Never throws outside a DemoProvider: returns a constant default (lang 'en', no-op setters). */
export function useDemo(): DemoApi {
  const ctx = useContext(DemoCtx)
  const lang = useLang()
  return useMemo(
    () => (ctx ? buildApi(ctx.state, ctx.hydrated, ctx.presenter, ctx.actions, lang) : getFallbackApi(lang)),
    [ctx, lang],
  )
}

// -----------------------------------------------------------------------------
// Demo events (presenter fast-forward / autopilot / reset / finish)
// -----------------------------------------------------------------------------

/** Dispatches window CustomEvent 'os:<name>'. 'finish' completes streams and agent logs only. */
export function emitDemo(name: DemoEventName): void {
  if (typeof window === 'undefined') return
  try {
    window.dispatchEvent(new CustomEvent(`os:${name}`))
  } catch {
    /* ignore */
  }
}

/** Subscribes to a demo event; always calls the latest handler. */
export function useDemoEvent(name: DemoEventName, handler: (e: Event) => void): void {
  const ref = useRef(handler)
  useEffect(() => {
    ref.current = handler
  })
  useEffect(() => {
    if (typeof window === 'undefined') return
    const fn = (e: Event) => ref.current?.(e)
    window.addEventListener(`os:${name}`, fn)
    return () => window.removeEventListener(`os:${name}`, fn)
  }, [name])
}
