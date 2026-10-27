'use client'

// /placement · Placement Arena lobby. step = loggedIn ? 'hub' : 'login'.
// Hub: AgentLog -> ProfileHeader -> AI recommendation -> BlueprintPicker -> EligibilityCheck -> HallTicket,
// with RoundStepper + SideCards alongside. Autopilot: pick the default blueprint, wait for eligibility, Enter.
// Fast-forward: the same, instantly.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useDemo, useDemoEvent, type RoundStatus } from '@/lib/os/demo-store'
import { REPORT_ROUTE, ROUNDS, type RoundId } from '@/lib/os/rounds'
import { BLUEPRINTS, blueprintById } from '@/lib/mock/blueprints'
import { drivesFor } from '@/lib/mock/drives'
import { DEMO_TODAY } from '@/lib/mock/state'
import { fmtDate, type Bi } from '@/lib/os/i18n'
import type { Persona } from '@/lib/mock/types'
import { AgentLog } from '@/components/ai/agent-log'
import { AISurface } from '@/components/ai/ai-surface'
import { StreamingText } from '@/components/ai/streaming-text'
import { IllustrativeChip } from '@/components/os/illustrative-chip'
import { Tr } from '@/components/os/tr-text'
import { LoginCard } from '@/components/placement/lobby/login-card'
import { ProfileHeader } from '@/components/placement/lobby/profile-header'
import { BlueprintPicker } from '@/components/placement/lobby/blueprint-picker'
import { EligibilityCheck } from '@/components/placement/lobby/eligibility-check'
import { HallTicket } from '@/components/placement/lobby/hall-ticket'
import { RoundStepper } from '@/components/placement/lobby/round-stepper'
import { SideCards } from '@/components/placement/lobby/side-cards'

const APTITUDE_ROUTE = '/placement/drive/aptitude'
const DONE: RoundStatus[] = ['cleared', 'flagged', 'eliminated']

const TXT = {
  title: { en: 'Placement Arena', hi: 'प्लेसमेंट एरीना' },
  day: { en: 'Placement Day', hi: 'प्लेसमेंट डे' },
  agent: { en: 'Sarthi AI · profile agent', hi: 'सारथी AI · प्रोफ़ाइल एजेंट' },
  rec: { en: 'Sarthi AI recommendation', hi: 'सारथी AI की सलाह', hinglish: 'Sarthi AI ki salah' },
  usePick: { en: 'Use this blueprint', hi: 'यह ब्लूप्रिंट चुनें', hinglish: 'Yeh blueprint chunein' },
  enter: { en: 'Enter exam hall', hi: 'परीक्षा हॉल में प्रवेश करें' },
  resume: { en: 'Resume drive', hi: 'ड्राइव जारी रखें' },
  report: { en: 'Open report', hi: 'रिपोर्ट खोलें' },
} satisfies Record<string, Bi>

export default function PlacementPage() {
  const { state, personaId } = useDemo()
  if (!state.loggedIn) {
    return (
      <div className="relative mx-auto flex min-h-[calc(100vh-140px)] w-full max-w-7xl overflow-x-clip items-start justify-center px-4 py-8 sm:items-center sm:px-6 sm:py-12">
        <LoginCard />
      </div>
    )
  }
  // Keyed by persona: Rahul's run is separate, so the hub restarts for him.
  return <Hub key={personaId} />
}

function agentSteps(p: Persona): Bi[] {
  const n = p.credentials.length
  const cert = p.credentials.find((c) => /NASSCOM/i.test(c.issuer)) ?? p.credentials.find((c) => c.status === 'verified') ?? p.credentials[0]
  const certName = cert ? (/NASSCOM/i.test(cert.issuer) ? 'NASSCOM FSP' : cert.issuer) : 'skill'
  return [
    { en: 'Fetching verified credentials via DigiLocker…', hi: 'DigiLocker से सत्यापित प्रमाणपत्र लाए जा रहे हैं…' },
    { en: `${n} documents found`, hi: `${n} दस्तावेज़ मिले` },
    { en: `Reading ${certName} certificate…`, hi: `${certName} प्रमाणपत्र पढ़ा जा रहा है…` },
    {
      en: `Mapping profile to ${BLUEPRINTS.length} recruiter blueprints…`,
      hi: `प्रोफ़ाइल को ${BLUEPRINTS.length} भर्ती ब्लूप्रिंट से मिलाया जा रहा है…`,
    },
    { en: 'Loading readiness history…', hi: 'तैयारी का इतिहास लोड हो रहा है…' },
  ]
}

function recommendation(p: Persona, personaId: 'priya' | 'rahul'): Bi {
  const d = drivesFor(personaId)[0]
  const en = d ? fmtDate(d.date, 'en') : ''
  const hi = d ? fmtDate(d.date, 'hi') : ''
  if (personaId === 'rahul') {
    return {
      en: `Fastest path: the Auto-OEM-style core pool drive${en ? ` on ${en}` : ''}. Your EV lab hours and diploma score already clear the bar; today's Placement Day sets your baseline so Sarthi can plan the next 3 weeks.`,
      hi: `राहुल, आपका सबसे तेज़ रास्ता: ${hi ? `${hi} की ` : ''}ऑटो-OEM-शैली कोर पूल ड्राइव। EV लैब का अनुभव और डिप्लोमा अंक पहले से योग्यता पूरी करते हैं; आज का प्लेसमेंट डे आपका बेसलाइन तय करेगा, ताकि सारथी अगले 3 हफ्तों की योजना बना सके।`,
      hinglish: `Rahul, aapka sabse tez raasta: Auto-OEM-style core pool drive${en ? ` (${en})` : ''}. EV lab ka experience aur diploma score pehle se bar paar karte hain; aaj ka Placement Day aapka baseline set karega, taaki Sarthi agle 3 hafte plan kar sake.`,
    }
  }
  const first = p.name.split(' ')[0]
  return {
    en: `Fastest path: the NQT-style IT services drive${en ? ` on ${en}` : ''}. Last time, Communication and arrays held you back; today's Placement Day will show how much 3 weeks of practice changed.`,
    hi: `प्रिया, आपका सबसे तेज़ रास्ता: ${hi ? `${hi} की ` : ''}NQT-style आईटी ड्राइव। पिछली बार संवाद और Arrays में कमी थी; आज का प्लेसमेंट डे दिखाएगा कि 3 हफ्तों की प्रैक्टिस से कितना फ़र्क पड़ा।`,
    hinglish: `${first}, aapka sabse tez raasta: IT services NQT-style drive${en ? ` (${en})` : ''}. Pichhli baar Communication aur Arrays mein kami thi; aaj ka Placement Day dikhayega ki 3 hafte ki practice ne kitna farak dala.`,
  }
}

function Hub() {
  const router = useRouter()
  const { persona, personaId, rounds, state, set, setRound, includeGd, lang, t } = useDemo()

  // Login / persona switch: start at the top (name + header), not mid-profile where the login card was.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Opened again after eligibility was cleared: show the check as done, hall ticket ready.
  const [initiallyCleared] = useState(() => rounds.eligibility?.status === 'cleared')
  const [ready, setReady] = useState(false)
  const [picked, setPicked] = useState(initiallyCleared)
  const [eligRun, setEligRun] = useState(0)
  const [eligInstant, setEligInstant] = useState(initiallyCleared)
  const [eligible, setEligible] = useState<boolean | null>(initiallyCleared ? true : null)
  const [auto, setAuto] = useState<'off' | 'auto' | 'ff'>('off')
  const [scrollTo, setScrollTo] = useState<'elig' | 'ticket' | null>(null)

  const eligRef = useRef<HTMLElement>(null)
  const ticketRef = useRef<HTMLElement>(null)
  const entering = useRef(false)

  const steps = useMemo(() => agentSteps(persona), [persona])
  const rec = useMemo(() => recommendation(persona, personaId), [persona, personaId])
  const defaultId = persona.defaultBlueprintId ?? state.blueprintId
  const defaultLabel = blueprintById(defaultId).label

  const pick = useCallback(
    (id: string, opts: { instant?: boolean; scroll?: boolean } = {}) => {
      const same = picked && id === state.blueprintId
      if (id !== state.blueprintId) set({ blueprintId: id })
      if (same) return
      setPicked(true)
      setEligible(null)
      setEligInstant(!!opts.instant)
      setEligRun((n) => n + 1)
      if (opts.scroll) setScrollTo('elig')
    },
    [picked, state.blueprintId, set],
  )

  const onEligDone = useCallback(
    (ok: boolean) => {
      setEligible(ok)
      if (ok && !eligInstant) setScrollTo('ticket')
    },
    [eligInstant],
  )

  // First round not yet finished (gd only when included); report when all are done.
  const resumeRoute = useMemo(() => {
    for (const r of ROUNDS) {
      if (r.id === 'eligibility' || (r.id === 'gd' && !includeGd)) continue
      const st = rounds[r.id as RoundId]?.status ?? 'locked'
      if (!DONE.includes(st)) return r.route
    }
    return REPORT_ROUTE
  }, [rounds, includeGd])
  const aptitudeDone = DONE.includes(rounds.aptitude?.status ?? 'locked')

  const enterHall = useCallback(() => {
    if (entering.current) return
    entering.current = true
    if (aptitudeDone) {
      router.push(resumeRoute)
      return
    }
    setRound('aptitude', { status: 'live' })
    router.push(APTITUDE_ROUTE)
  }, [aptitudeDone, resumeRoute, router, setRound])

  // Smooth-scroll the next step into view after a click (not on fast-forward).
  useEffect(() => {
    if (!scrollTo) return
    const el = scrollTo === 'elig' ? eligRef.current : ticketRef.current
    const id = window.setTimeout(() => {
      el?.scrollIntoView({ behavior: state.lite ? 'auto' : 'smooth', block: scrollTo === 'elig' ? 'center' : 'nearest' })
      setScrollTo(null)
    }, 80)
    return () => window.clearTimeout(id)
  }, [scrollTo, state.lite, eligRun, eligible])

  // Presenter: A plays the hub; F does it instantly. Handlers only set a mode, so a replayed event is harmless.
  useDemoEvent('autopilot', () => setAuto((a) => (a === 'ff' ? a : 'auto')))
  useDemoEvent('fastforward', () => setAuto('ff'))

  const pickRef = useRef(pick)
  pickRef.current = pick
  const enterRef = useRef(enterHall)
  enterRef.current = enterHall
  useEffect(() => {
    if (auto === 'off' || !ready) return
    const ff = auto === 'ff'
    if (!picked) {
      const id = window.setTimeout(() => pickRef.current(defaultId, { instant: ff, scroll: !ff }), ff ? 0 : 900)
      return () => window.clearTimeout(id)
    }
    if (eligible === true) {
      const id = window.setTimeout(() => enterRef.current(), ff ? 0 : 1400)
      return () => window.clearTimeout(id)
    }
  }, [auto, ready, picked, eligible, defaultId])

  const ctaLabel: Bi | undefined = aptitudeDone
    ? resumeRoute === REPORT_ROUTE
      ? TXT.report
      : TXT.resume
    : undefined

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      {/* Title */}
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
        <div className="min-w-0">
          <p className="text-[12px] font-medium uppercase tracking-wider text-cyan-300/80">
            <Tr b={TXT.day} /> · {fmtDate(DEMO_TODAY, lang === 'hi' ? 'hi' : 'en', { year: true })}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-white sm:text-[28px]">
            <span>Placement Arena</span> <span className="text-gray-600">·</span>{' '}
            <span lang="hi" className="font-deva text-[22px] font-medium text-gray-300 sm:text-2xl">
              प्लेसमेंट एरीना
            </span>
          </h1>
        </div>
        <IllustrativeChip responsive />
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <AgentLog key={personaId} steps={steps} stepMs={420} title={TXT.agent} onDone={() => setReady(true)} />

          {!ready ? (
            <div aria-hidden className="space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-3">
                <div className="os-skel h-14 w-14 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="os-skel h-5 w-48 max-w-full rounded" />
                  <div className="os-skel h-3.5 w-64 max-w-full rounded" />
                </div>
              </div>
              <div className="os-skel h-16 w-full rounded-xl" />
            </div>
          ) : (
            <>
              <ProfileHeader />

              <AISurface
                title={TXT.rec}
                className="os-rise"
                actions={
                  !picked ? (
                    <button
                      type="button"
                      onClick={() => pick(defaultId, { scroll: true })}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300/40 bg-cyan-400/10 px-3 py-1.5 text-[12.5px] font-medium text-cyan-100 transition-colors hover:bg-cyan-400/20"
                    >
                      <Sparkles className="h-3.5 w-3.5" aria-hidden />
                      <Tr b={TXT.usePick} />
                      <span className="hidden sm:inline">· {defaultLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  ) : undefined
                }
              >
                <StreamingText text={rec} className="text-[15px] leading-relaxed text-gray-100" />
              </AISurface>

              <BlueprintPicker
                selectedId={state.blueprintId}
                recommendedId={defaultId}
                picked={picked}
                onPick={(id) => pick(id, { scroll: true })}
              />

              {picked && (
                <EligibilityCheck
                  key={`${state.blueprintId}:${eligRun}`}
                  ref={eligRef}
                  blueprint={blueprintById(state.blueprintId)}
                  instant={eligInstant}
                  onDone={onEligDone}
                />
              )}

              {picked && eligible === true && <HallTicket ref={ticketRef} onEnter={enterHall} ctaLabel={ctaLabel} />}
            </>
          )}
        </div>

        <aside className="min-w-0 space-y-4" aria-label={t({ en: 'Your drive', hi: 'आपकी ड्राइव' })}>
          <RoundStepper />
          <SideCards />
        </aside>
      </div>
    </div>
  )
}
