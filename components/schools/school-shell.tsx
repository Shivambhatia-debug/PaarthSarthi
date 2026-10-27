'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from 'react'
import {
  Building2,
  Check,
  FastForward,
  Lock,
  MonitorSmartphone,
  Signal,
  Sparkles,
  Volume2,
  VolumeX,
  type LucideIcon,
} from 'lucide-react'
import { useDemo, useDemoEvent } from '@/lib/os/demo-store'
import { tr, type Bi, type Lang } from '@/lib/os/i18n'
import { NUSRAT } from '@/lib/mock/personas'
import { setQueryParam, useQueryParam } from '@/hooks/use-query-param'
import { useSpeak } from '@/hooks/use-speech'
import { Tr } from '@/components/os/tr-text'
import { IllustrativeChip } from '@/components/os/illustrative-chip'
import { LanguageSwitcher } from '@/components/os/language-switcher'
import { aiToast } from '@/components/ai/ai-toast'
import { cn } from '@/lib/utils'
import { SCHOOL_NAME, SHARED_PROFILES, STEPS, type SchoolLang, type StepId } from '@/components/schools/school-data'

// -----------------------------------------------------------------------------
// Context: the page language is LOCAL (Hindi-first), independent of the global setting.
// -----------------------------------------------------------------------------

export interface SchoolApi {
  lang: SchoolLang
  setLang: (l: SchoolLang) => void
  /** tr() with the page's local language. */
  L: (b: Bi | string | null | undefined) => string
  step: StepId
  goTo: (s: StepId) => void
  /** Marks login + consent + Disha Test done (NUSRAT_PROFILE) and opens the report. */
  jumpToReport: () => void
  completeLogin: () => void
  completeTest: () => void
  loggedIn: boolean
  consent: boolean
  testDone: boolean
  lite: boolean
}

const SchoolCtx = createContext<SchoolApi | null>(null)

const FALLBACK: SchoolApi = {
  lang: 'hi',
  setLang: () => {},
  L: (b) => tr(b, 'hi'),
  step: 1,
  goTo: () => {},
  jumpToReport: () => {},
  completeLogin: () => {},
  completeTest: () => {},
  loggedIn: false,
  consent: false,
  testDone: false,
  lite: false,
}

export function useSchool(): SchoolApi {
  return useContext(SchoolCtx) ?? FALLBACK
}

/** Local-language text: resolves a Bi with the page language and renders it through the foundation <Tr>. */
export function T({ b, className, as }: { b: Bi | string | null | undefined; className?: string; as?: ElementType }) {
  const { L } = useSchool()
  return <Tr b={L(b)} className={className} as={as} />
}

function parseStep(v: string | null | undefined): StepId | null {
  if (!v) return null
  const n = parseInt(v, 10)
  return n >= 1 && n <= 6 ? (n as StepId) : null
}

function clampStep(n: number | undefined): StepId {
  const v = Math.round(typeof n === 'number' && Number.isFinite(n) ? n : 1)
  return Math.min(6, Math.max(1, v)) as StepId
}

const UI = {
  framingA: 'School-to-Skill feeder',
  framingB: { en: 'with the Education Department', hi: 'शिक्षा विभाग के साथ' } as Bi,
  framingC: '(with Education Department / BEPC)',
  title: { en: 'Disha: your path after Class 10', hi: 'दिशा: 10वीं के बाद का रास्ता' } as Bi,
  sub: {
    en: 'Interest test, strengths report, path, counsellor and schemes, in one place',
    hi: 'रुचि टेस्ट, शक्ति रिपोर्ट, रास्ता, काउंसलर और योजनाएँ — एक ही जगह',
  } as Bi,
  lite: { en: 'Lite mode · Works on 2G', hi: 'लाइट मोड · 2G पर भी चलता है' } as Bi,
  liteOn: { en: 'Lite mode on: no animations, instant text', hi: 'लाइट मोड चालू: बिना एनिमेशन, तुरंत टेक्स्ट' } as Bi,
  liteOff: { en: 'Lite mode off', hi: 'लाइट मोड बंद' } as Bi,
  shared: { en: 'Shared ICT-lab device', hi: 'साझा ICT-लैब डिवाइस' } as Bi,
  who: { en: 'Who is using this computer?', hi: 'इस कंप्यूटर पर कौन है?' } as Bi,
  sharedNote: {
    en: 'Each student opens with their own PIN · auto log-out after 5 minutes idle',
    hi: 'हर छात्र अपने PIN से खुलता है · 5 मिनट खाली रहने पर अपने-आप लॉग-आउट',
  } as Bi,
  locked: { en: 'needs PIN', hi: 'PIN चाहिए' } as Bi,
  lockedToast: {
    en: 'Each student has their own PIN; data never mixes on a shared device (demo)',
    hi: 'हर छात्र का अपना PIN है; साझा डिवाइस पर किसी का डेटा नहीं मिलता (डेमो)',
  } as Bi,
  jump: { en: 'Jump to report (demo)', hi: 'रिपोर्ट पर जाएँ (डेमो)' } as Bi,
  jumpShort: { en: 'Report (demo)', hi: 'रिपोर्ट (डेमो)' } as Bi,
  steps: { en: 'Steps', hi: 'चरण' } as Bi,
  listen: { en: 'Read aloud', hi: 'सुनें' } as Bi,
  stop: { en: 'Stop', hi: 'रोकें' } as Bi,
  classLine: { en: 'Class 10', hi: 'कक्षा 10' } as Bi,
}

// -----------------------------------------------------------------------------
// Shell
// -----------------------------------------------------------------------------

export function SchoolShell({ children }: { children: ReactNode }) {
  const { state, set } = useDemo()
  const lite = !!state.lite
  const school = state.school
  const [lang, setLangState] = useState<SchoolLang>('hi')
  const L = useCallback((b: Bi | string | null | undefined) => tr(b, lang), [lang])

  // Follow the global language when it changes while on this page (OS bar switch, presenter 'L').
  const globalLang = state.lang
  const seenGlobal = useRef<Lang>(globalLang)
  useEffect(() => {
    if (seenGlobal.current === globalLang) return
    seenGlobal.current = globalLang
    setLangState(globalLang === 'hi' ? 'hi' : 'en')
  }, [globalLang])

  // ?step= wins over the persisted step (cold load, presenter jumps); goTo keeps both in sync.
  const qp = useQueryParam('step')
  const qpStep = parseStep(qp)
  const step: StepId = qpStep ?? clampStep(school?.step)

  const applyStep = useCallback(
    (n: StepId) =>
      set((s) => {
        const cur = s.school
        const next = {
          loggedIn: cur.loggedIn || n >= 2,
          consent: cur.consent || n >= 2,
          step: n,
          done: cur.done || n >= 3,
        }
        if (next.loggedIn === cur.loggedIn && next.consent === cur.consent && next.step === cur.step && next.done === cur.done) {
          return {}
        }
        return { school: next }
      }),
    [set],
  )

  useEffect(() => {
    if (qpStep) applyStep(qpStep)
  }, [qpStep, applyStep])

  const goTo = useCallback(
    (n: StepId) => {
      applyStep(n)
      setQueryParam('step', String(n))
    },
    [applyStep],
  )

  const jumpToReport = useCallback(() => goTo(3), [goTo])

  const completeLogin = useCallback(() => {
    set((s) => ({ school: { ...s.school, loggedIn: true, consent: true, step: 2 } }))
    setQueryParam('step', '2')
  }, [set])

  const completeTest = useCallback(() => {
    set((s) => ({ school: { ...s.school, loggedIn: true, consent: true, done: true, step: 3 } }))
    setQueryParam('step', '3')
  }, [set])

  useDemoEvent('reset', () => {
    setLangState('hi')
    setQueryParam('step', null)
  })

  // Bring the new step into view when it changes (never on first mount).
  const anchorRef = useRef<HTMLDivElement>(null)
  const prevStep = useRef(step)
  useEffect(() => {
    if (prevStep.current === step) return
    prevStep.current = step
    const el = anchorRef.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 150
    if (window.scrollY > top + 8) window.scrollTo({ top: Math.max(0, top), behavior: lite ? 'auto' : 'smooth' })
  }, [step, lite])

  const api = useMemo<SchoolApi>(
    () => ({
      lang,
      setLang: setLangState,
      L,
      step,
      goTo,
      jumpToReport,
      completeLogin,
      completeTest,
      loggedIn: !!school?.loggedIn,
      consent: !!school?.consent,
      testDone: !!school?.done,
      lite,
    }),
    [lang, L, step, goTo, jumpToReport, completeLogin, completeTest, school?.loggedIn, school?.consent, school?.done, lite],
  )

  return (
    <SchoolCtx.Provider value={api}>
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-4 text-base sm:px-6 sm:pt-6">
        <FramingBanner />
        <ShellHeader />
        <div ref={anchorRef} aria-hidden className="h-0" />
        <StepRail />
        <div className="mt-5 sm:mt-6">{children}</div>
      </div>
    </SchoolCtx.Provider>
  )
}

// -----------------------------------------------------------------------------
// Pieces
// -----------------------------------------------------------------------------

function FramingBanner() {
  const { L } = useSchool()
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <p className="inline-flex min-w-0 max-w-full flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12px] leading-snug text-gray-300 sm:text-[13px]">
        <Building2 className="h-3.5 w-3.5 shrink-0 text-sky-300" aria-hidden />
        <span lang="en" className="font-semibold text-white">
          {UI.framingA}
        </span>
        <span aria-hidden className="text-gray-600">
          ·
        </span>
        <Tr b={L(UI.framingB)} className="text-gray-200" />
        <span lang="en" className="text-gray-400">
          {UI.framingC}
        </span>
      </p>
      <IllustrativeChip responsive />
    </div>
  )
}

function ShellHeader() {
  const { L, lang, setLang, lite } = useSchool()
  const { set } = useDemo()
  const [shared, setShared] = useState(false)

  const toggleLite = () => {
    const next = !lite
    set((s) => ({ lite: !s.lite }))
    aiToast(L(next ? UI.liteOn : UI.liteOff), { tone: next ? 'ok' : 'ai', duration: 2200, id: 'school-lite' })
  }

  return (
    <header className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -left-10 bottom-0 h-32 w-40 rounded-full bg-emerald-400/[0.06] blur-3xl" />

      <div className="relative flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1 basis-[16rem]">
          <p className="mb-1.5 inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-cyan-300/90">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            <span lang="en">Sarthi AI · School</span>
          </p>
          <div className="flex items-start gap-2">
            <h1 className="min-w-0 text-[22px] font-semibold leading-tight tracking-tight text-white sm:text-[26px]">
              <T b={UI.title} />
            </h1>
            <SpeakButton text={`${L(UI.title)}। ${L(UI.sub)}`} className="mt-0.5" />
          </div>
          <p className="mt-1 text-[14px] leading-relaxed text-gray-400">
            <T b={UI.sub} />
          </p>
        </div>

        {/* Student identity */}
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 via-cyan-300 to-emerald-400 p-[2px]">
            <span className="flex h-full w-full items-center justify-center rounded-full bg-[#0d1117] text-[14px] font-semibold text-white">
              {NUSRAT.avatarInitials}
            </span>
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-white">
              <T b={{ en: NUSRAT.name, hi: NUSRAT.nameHi }} />
            </p>
            <p className="truncate text-[12px] text-gray-400">
              <T b={UI.classLine} /> · <T b={SCHOOL_NAME} />
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="relative mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleLite}
          aria-pressed={lite}
          className={cn(
            'inline-flex h-11 items-center gap-2 rounded-xl border px-3 text-[13px] font-medium transition-colors',
            lite
              ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
              : 'border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/20 hover:text-white',
          )}
        >
          <Signal className="h-4 w-4 shrink-0" aria-hidden />
          <T b={UI.lite} />
          <span
            aria-hidden
            className={cn(
              'relative ml-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
              lite ? 'bg-emerald-400/80' : 'bg-white/15',
            )}
          >
            <span className={cn('absolute h-4 w-4 rounded-full bg-white shadow transition-transform', lite ? 'translate-x-[18px]' : 'translate-x-0.5')} />
          </span>
        </button>

        <button
          type="button"
          onClick={() => setShared((v) => !v)}
          aria-pressed={shared}
          aria-expanded={shared}
          className={cn(
            'inline-flex h-11 items-center gap-2 rounded-xl border px-3 text-[13px] font-medium transition-colors',
            shared
              ? 'border-sky-400/40 bg-sky-400/10 text-sky-100'
              : 'border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/20 hover:text-white',
          )}
        >
          <MonitorSmartphone className="h-4 w-4 shrink-0" aria-hidden />
          <T b={UI.shared} />
          <span
            aria-hidden
            className={cn(
              'relative ml-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
              shared ? 'bg-sky-400/80' : 'bg-white/15',
            )}
          >
            <span className={cn('absolute h-4 w-4 rounded-full bg-white shadow transition-transform', shared ? 'translate-x-[18px]' : 'translate-x-0.5')} />
          </span>
        </button>

        <LanguageSwitcher
          value={lang}
          onChange={(l) => setLang(l === 'hi' ? 'hi' : 'en')}
          options={['hi', 'en']}
          className="w-full sm:w-auto"
        />
      </div>

      {shared && <SharedPicker />}
    </header>
  )
}

function SharedPicker() {
  const { L } = useSchool()
  return (
    <div className="os-rise relative mt-3 rounded-xl border border-sky-400/20 bg-sky-400/[0.04] p-3">
      <p className="text-[13px] font-medium text-gray-200">
        <T b={UI.who} />
      </p>
      <div className="mt-2.5 flex flex-wrap items-center gap-3">
        {SHARED_PROFILES.map((p) => (
          <button
            key={p.initials}
            type="button"
            onClick={() => {
              if (!p.active) aiToast(L(UI.lockedToast), { tone: 'ai', id: 'school-shared' })
            }}
            aria-current={p.active ? 'true' : undefined}
            title={L(p.name)}
            className={cn(
              'group flex min-h-11 items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-[13px] transition-colors',
              p.active
                ? 'border-cyan-300/50 bg-cyan-300/10 text-white'
                : 'border-white/10 bg-white/[0.02] text-gray-400 hover:border-white/20 hover:text-gray-200',
            )}
          >
            <span
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold',
                p.active ? 'bg-gradient-to-br from-blue-400 via-cyan-300 to-emerald-400 text-[#06121a]' : 'bg-white/10 text-gray-300',
              )}
            >
              {p.initials}
            </span>
            {p.active ? (
              <span className="inline-flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
                <T b={p.name} />
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Lock className="h-3.5 w-3.5" aria-hidden />
                <T b={UI.locked} />
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="mt-2.5 text-[12px] leading-snug text-gray-400">
        <T b={UI.sharedNote} />
      </p>
    </div>
  )
}

function StepRail() {
  const { L, step, goTo, loggedIn, testDone, jumpToReport } = useSchool()
  const railRef = useRef<HTMLOListElement>(null)

  // Keep the active step visible inside the horizontally scrolling rail (never scrolls the page).
  useEffect(() => {
    const rail = railRef.current
    const el = rail?.querySelector<HTMLElement>('[data-active="true"]')
    if (!rail || !el) return
    const left = el.offsetLeft - rail.clientWidth / 2 + el.clientWidth / 2
    rail.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
  }, [step])

  const isDone = (id: StepId) => id < step || (id === 1 && loggedIn) || (id === 2 && testDone)

  return (
    <nav
      aria-label={L(UI.steps)}
      className="no-print sticky top-[92px] z-30 -mx-4 mt-4 border-b border-white/[0.06] bg-[#0d1117]/85 px-4 py-2 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border sm:border-white/10 sm:px-2"
    >
      <div className="flex items-center gap-2">
        <ol
          ref={railRef}
          className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {STEPS.map((s, i) => {
            const active = s.id === step
            const done = !active && isDone(s.id)
            return (
              <li key={s.id} className="flex shrink-0 items-center">
                {i > 0 && (
                  <span
                    aria-hidden
                    className={cn('mx-0.5 h-px w-3 shrink-0 sm:w-4', s.id <= step ? 'bg-cyan-300/50' : 'bg-white/10')}
                  />
                )}
                <button
                  type="button"
                  data-active={active ? 'true' : undefined}
                  aria-current={active ? 'step' : undefined}
                  onClick={() => goTo(s.id)}
                  className={cn(
                    'flex h-11 items-center gap-2 whitespace-nowrap rounded-xl px-2.5 text-[13px] font-medium transition-colors',
                    active
                      ? 'bg-gradient-to-r from-blue-500/20 via-cyan-400/15 to-emerald-400/20 text-white shadow-[inset_0_0_0_1px_rgba(103,232,249,0.35)]'
                      : done
                        ? 'text-gray-300 hover:bg-white/[0.05]'
                        : 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-300',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold tabular-nums',
                      active
                        ? 'bg-gradient-to-br from-blue-400 via-cyan-300 to-emerald-400 text-[#06121a]'
                        : done
                          ? 'bg-emerald-400/15 text-emerald-300'
                          : 'bg-white/[0.06] text-gray-500',
                    )}
                  >
                    {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : s.id}
                  </span>
                  <T b={s.label} />
                </button>
              </li>
            )
          })}
        </ol>
        {step < 3 && (
          <button
            type="button"
            onClick={jumpToReport}
            title={L(UI.jump)}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-dashed border-amber-300/40 bg-amber-300/[0.06] px-2.5 text-[12px] font-medium text-amber-200 transition-colors hover:border-amber-300/70 hover:bg-amber-300/10"
          >
            <FastForward className="h-4 w-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">
              <T b={UI.jump} />
            </span>
            <span className="sm:hidden">
              <T b={UI.jumpShort} />
            </span>
          </button>
        )}
      </div>
    </nav>
  )
}

// -----------------------------------------------------------------------------
// Shared bits used by every step
// -----------------------------------------------------------------------------

/** Speaker icon: reads text aloud in the page language (hi-IN voice for Hindi). */
export function SpeakButton({ text, className, label }: { text: string; className?: string; label?: Bi }) {
  const { L, lang } = useSchool()
  const { speak, cancel, speaking } = useSpeak()
  const Icon = speaking ? VolumeX : Volume2
  return (
    <button
      type="button"
      onClick={() => {
        if (speaking) cancel()
        else void speak(text, lang === 'hi' ? 'hi' : 'en')
      }}
      aria-label={L(speaking ? UI.stop : label ?? UI.listen)}
      title={L(speaking ? UI.stop : label ?? UI.listen)}
      className={cn(
        'no-print inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors',
        speaking
          ? 'border-cyan-300/50 bg-cyan-300/15 text-cyan-200'
          : 'border-white/10 bg-white/[0.03] text-gray-400 hover:border-cyan-300/40 hover:text-cyan-200',
        className,
      )}
    >
      <Icon className="h-[18px] w-[18px]" aria-hidden />
    </button>
  )
}

/** Step heading with an optional icon and a read-aloud speaker. */
export function StepHeading({ title, sub, icon: Icon, right }: { title: Bi; sub?: Bi; icon?: LucideIcon; right?: ReactNode }) {
  const { L } = useSchool()
  return (
    <div className="mb-4 flex items-start gap-3">
      {Icon && (
        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/15 via-cyan-400/10 to-emerald-400/15 text-cyan-200">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h2 className="text-[20px] font-semibold leading-snug tracking-tight text-white sm:text-[22px]">
          <T b={title} />
        </h2>
        {sub && (
          <p className="mt-0.5 text-[14px] leading-relaxed text-gray-400">
            <T b={sub} />
          </p>
        )}
      </div>
      {right}
      <SpeakButton text={sub ? `${L(title)}। ${L(sub)}` : L(title)} />
    </div>
  )
}

/** Back / next row at the bottom of a step. */
export function StepNav({ next, nextLabel, back = true, extra }: { next?: StepId; nextLabel?: Bi; back?: boolean; extra?: ReactNode }) {
  const { step, goTo } = useSchool()
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
      {back && step > 1 ? (
        <button
          type="button"
          onClick={() => goTo((step - 1) as StepId)}
          className="inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-[14px] text-gray-400 transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          <span aria-hidden>←</span>
          <T b={{ en: 'Back', hi: 'पीछे' }} />
        </button>
      ) : (
        <span />
      )}
      <div className="flex flex-wrap items-center gap-2">
        {extra}
        {next && nextLabel && <PrimaryButton onClick={() => goTo(next)} label={nextLabel} arrow />}
      </div>
    </div>
  )
}

export function PrimaryButton({
  onClick,
  label,
  icon: Icon,
  arrow,
  disabled,
  className,
}: {
  onClick: () => void
  label: Bi | string
  icon?: LucideIcon
  arrow?: boolean
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-[15px] font-semibold text-[#04121a]',
        'bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 shadow-[0_10px_30px_-12px_rgba(34,211,238,0.75)]',
        'transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-12px_rgba(34,211,238,0.9)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]',
        'disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
    >
      {Icon && <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />}
      <T b={label} />
      {arrow && <span aria-hidden>→</span>}
    </button>
  )
}

export function GhostButton({
  onClick,
  label,
  icon: Icon,
  className,
  disabled,
}: {
  onClick: () => void
  label: Bi | string
  icon?: LucideIcon
  className?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-[14px] font-medium text-gray-200',
        'transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
      <T b={label} />
    </button>
  )
}
