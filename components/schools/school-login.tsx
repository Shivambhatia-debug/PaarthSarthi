'use client'

import { useEffect, useRef, useState } from 'react'
import { BadgeCheck, Check, Fingerprint, KeyRound, Loader2, RotateCcw, School, ShieldCheck, Smartphone } from 'lucide-react'
import { useDemoEvent } from '@/lib/os/demo-store'
import type { Bi } from '@/lib/os/i18n'
import { CONSENT_TEXT } from '@/lib/mock/state'
import { NUSRAT } from '@/lib/mock/personas'
import { AgentLog } from '@/components/ai/agent-log'
import { IntegrationChip } from '@/components/os/integration-chip'
import { cn } from '@/lib/utils'
import { SCHOOL_NAME, UDISE_MOCK } from '@/components/schools/school-data'
import { GhostButton, PrimaryButton, SpeakButton, StepHeading, T, useSchool } from '@/components/schools/school-shell'

type Phase = 'login' | 'verifying' | 'consent'
type Mode = 'apaar' | 'udise'

const UI = {
  title: { en: 'Login', hi: 'लॉगिन' } as Bi,
  sub: { en: 'With your APAAR ID, or your school UDISE code', hi: 'अपनी APAAR ID से, या स्कूल के UDISE कोड से' } as Bi,
  apaar: { en: 'APAAR ID', hi: 'APAAR ID' } as Bi,
  udise: { en: 'UDISE code + class + roll no.', hi: 'UDISE कोड + कक्षा + रोल नंबर' } as Bi,
  apaarHelp: { en: 'Your school has already linked this ID (mock)', hi: 'यह ID आपके स्कूल ने पहले से जोड़ी है (मॉक)' } as Bi,
  udiseCode: { en: 'School UDISE code', hi: 'स्कूल का UDISE कोड' } as Bi,
  cls: { en: 'Class', hi: 'कक्षा' } as Bi,
  roll: { en: 'Roll no.', hi: 'रोल नंबर' } as Bi,
  next: { en: 'Continue', hi: 'आगे बढ़ें' } as Bi,
  verifyTitle: { en: 'Checking school records', hi: 'स्कूल रिकॉर्ड जाँचे जा रहे हैं' } as Bi,
  found: { en: 'Student found', hi: 'छात्रा मिल गई' } as Bi,
  consentTitle: { en: 'Parent / guardian consent', hi: 'अभिभावक की सहमति' } as Bi,
  consentSub: {
    en: 'Please read this to a parent, or press the speaker to hear it',
    hi: 'कृपया यह अभिभावक को पढ़कर सुनाएँ, या स्पीकर दबाकर सुनें',
  } as Bi,
  pilot: { en: 'Pilot conditions', hi: 'पायलट की शर्तें' } as Bi,
  dpdp: { en: 'Verifiable parental consent for under-18 (DPDP)', hi: '18 वर्ष से कम के लिए सत्यापित अभिभावक सहमति (DPDP)' } as Bi,
  digi: { en: 'DigiLocker-style parental verification (mock)', hi: 'DigiLocker जैसा अभिभावक सत्यापन (मॉक)' } as Bi,
  digiBusy: { en: 'Sending OTP to the parent’s phone…', hi: 'अभिभावक के फ़ोन पर OTP भेजा जा रहा है…' } as Bi,
  digiDone: { en: 'Parent verified · mobile ••••• ••219 (mock)', hi: 'अभिभावक सत्यापित · मोबाइल ••••• ••219 (मॉक)' } as Bi,
  agree: { en: 'I am the parent / guardian and I agree', hi: 'मैं अभिभावक हूँ और ऊपर लिखी बातों से सहमत हूँ' } as Bi,
  start: { en: 'Give consent and start the test', hi: 'सहमति दें और टेस्ट शुरू करें' } as Bi,
  doneTitle: { en: 'Login and parent consent are done', hi: 'लॉगिन और अभिभावक की सहमति पूरी' } as Bi,
  doneSub: { en: 'Consent can be withdrawn at any time.', hi: 'सहमति कभी भी वापस ली जा सकती है।' } as Bi,
  toTest: { en: 'Go to the Disha Test', hi: 'दिशा टेस्ट पर जाएँ' } as Bi,
  again: { en: 'See the login again', hi: 'लॉगिन फिर से देखें' } as Bi,
}

const VERIFY_STEPS: Bi[] = [
  { en: 'Verifying APAAR ID…', hi: 'APAAR ID की पुष्टि हो रही है…' },
  { en: `School record found: ${SCHOOL_NAME.en}`, hi: `स्कूल रिकॉर्ड मिला: ${SCHOOL_NAME.hi}` },
  { en: 'Class 10 · Hindi medium · under 18: parent consent needed', hi: 'कक्षा 10 · हिंदी माध्यम · 18 से कम: अभिभावक की सहमति ज़रूरी' },
]

export function SchoolLogin() {
  const { L, loggedIn, consent, completeLogin, goTo, lite } = useSchool()
  const [review, setReview] = useState(false)
  const [phase, setPhase] = useState<Phase>('login')
  const [mode, setMode] = useState<Mode>('apaar')
  const [parentState, setParentState] = useState<'idle' | 'busy' | 'done'>('idle')
  const [agree, setAgree] = useState(false)
  const [auto, setAuto] = useState(false)
  const finished = useRef(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, lite ? Math.min(ms, 150) : ms))
  }

  const finish = () => {
    if (finished.current) return
    finished.current = true
    completeLogin()
  }

  const verifyParent = () => {
    if (parentState !== 'idle') return
    setParentState('busy')
    later(() => setParentState('done'), 1100)
  }

  // Presenter: F completes login + consent at once; A walks through it.
  useDemoEvent('fastforward', () => finish())
  useDemoEvent('autopilot', () => {
    if (finished.current) return
    if (loggedIn && consent && !review) {
      finish()
      return
    }
    setReview(true)
    setAuto(true)
    if (phase === 'login') setPhase('verifying')
  })

  useEffect(() => {
    if (!auto || phase !== 'consent') return
    if (parentState === 'idle') {
      later(verifyParent, 500)
      return
    }
    if (parentState === 'done' && !agree) {
      later(() => setAgree(true), 450)
      return
    }
    if (parentState === 'done' && agree) later(finish, 650)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, phase, parentState, agree])

  const showSummary = loggedIn && consent && !review

  return (
    <section>
      <StepHeading title={UI.title} sub={UI.sub} icon={Fingerprint} />

      {showSummary ? (
        <div className="os-rise rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.05] p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
              <BadgeCheck className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[16px] font-semibold text-white">
                <T b={UI.doneTitle} />
              </p>
              <p className="mt-0.5 text-[14px] text-gray-400">
                <T b={{ en: NUSRAT.name, hi: NUSRAT.nameHi }} /> · <T b={SCHOOL_NAME} />
              </p>
              <p className="mt-1 text-[13px] text-gray-500">
                <T b={UI.doneSub} />
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <PrimaryButton onClick={() => goTo(2)} label={UI.toTest} arrow />
            <GhostButton
              onClick={() => {
                finished.current = false
                setReview(true)
                setPhase('login')
                setParentState('idle')
                setAgree(false)
              }}
              label={UI.again}
              icon={RotateCcw}
            />
          </div>
        </div>
      ) : (
        <>
          {phase !== 'consent' && (
            <div className="os-rise rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
              {/* Mode tabs */}
              <div role="tablist" className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-black/20 p-1">
                {(['apaar', 'udise'] as Mode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={mode === m}
                    disabled={phase === 'verifying'}
                    onClick={() => setMode(m)}
                    className={cn(
                      'min-h-11 rounded-lg px-2 text-[13px] font-medium leading-tight transition-colors sm:text-[14px]',
                      mode === m ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]' : 'text-gray-400 hover:text-gray-200',
                    )}
                  >
                    <T b={m === 'apaar' ? UI.apaar : UI.udise} />
                  </button>
                ))}
              </div>

              {mode === 'apaar' ? (
                <div className="mt-4">
                  <label htmlFor="apaar-id" className="text-[13px] font-medium text-gray-300">
                    <T b={UI.apaar} />
                  </label>
                  <div className="relative mt-1.5">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden />
                    <input
                      id="apaar-id"
                      readOnly
                      value={NUSRAT.apaarMasked}
                      className="h-12 w-full rounded-xl border border-white/10 bg-black/30 pl-9 pr-3 font-mono text-[15px] tracking-wider text-white outline-none focus:border-cyan-300/50"
                    />
                  </div>
                  <p className="mt-1.5 text-[12px] text-gray-500">
                    <T b={UI.apaarHelp} />
                  </p>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-[1.6fr_0.7fr_0.8fr]">
                  <Field id="udise" label={UI.udiseCode} value={UDISE_MOCK.udise} className="col-span-2 sm:col-span-1" />
                  <Field id="cls" label={UI.cls} value={UDISE_MOCK.classLevel} />
                  <Field id="roll" label={UI.roll} value={UDISE_MOCK.roll} />
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <IntegrationChip name="DigiLocker / APAAR" status="Integration-ready" />
              </div>

              {phase === 'verifying' ? (
                <AgentLog
                  className="mt-4"
                  title={L(UI.verifyTitle)}
                  steps={VERIFY_STEPS.map((s) => L(s))}
                  stepMs={480}
                  onDone={() => later(() => setPhase('consent'), 350)}
                />
              ) : (
                <div className="mt-5">
                  <PrimaryButton onClick={() => setPhase('verifying')} label={UI.next} arrow className="w-full sm:w-auto" />
                </div>
              )}
            </div>
          )}

          {phase === 'consent' && (
            <div className="os-rise space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.05] px-3 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                  <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                </span>
                <div className="min-w-0 text-[14px]">
                  <p className="font-semibold text-white">
                    <T b={UI.found} />: <T b={{ en: NUSRAT.name, hi: NUSRAT.nameHi }} />
                  </p>
                  <p className="flex items-center gap-1.5 truncate text-[12px] text-gray-400">
                    <School className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <T b={SCHOOL_NAME} />
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
                    <ShieldCheck className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[17px] font-semibold text-white">
                      <T b={UI.consentTitle} />
                    </h3>
                    <p className="text-[13px] text-gray-400">
                      <T b={UI.consentSub} />
                    </p>
                  </div>
                  <SpeakButton text={L(CONSENT_TEXT.school)} />
                </div>

                <blockquote className="mt-4 rounded-xl border border-white/[0.08] bg-black/25 p-4 text-[15px] leading-relaxed text-gray-100">
                  <T b={CONSENT_TEXT.school} />
                </blockquote>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/[0.06] px-2.5 py-1 font-medium text-amber-200">
                    <T b={UI.pilot} />
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-gray-300">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
                    <T b={UI.dpdp} />
                  </span>
                </div>

                <div className="mt-4">
                  {parentState === 'done' ? (
                    <p className="os-rise flex min-h-12 items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.06] px-3 text-[14px] font-medium text-emerald-200">
                      <BadgeCheck className="h-5 w-5 shrink-0" aria-hidden />
                      <T b={UI.digiDone} />
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={verifyParent}
                      disabled={parentState === 'busy'}
                      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-sky-400/35 bg-sky-400/[0.07] px-4 text-[14px] font-medium text-sky-100 transition-colors hover:bg-sky-400/[0.12] disabled:cursor-wait sm:w-auto"
                    >
                      {parentState === 'busy' ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                      ) : (
                        <Smartphone className="h-4 w-4 shrink-0" aria-hidden />
                      )}
                      <T b={parentState === 'busy' ? UI.digiBusy : UI.digi} />
                    </button>
                  )}
                </div>

                <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-1 text-[14px] text-gray-200">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="h-5 w-5 shrink-0 cursor-pointer rounded border-white/20 bg-black/30 accent-cyan-400"
                  />
                  <T b={UI.agree} />
                </label>

                <div className="mt-4">
                  <PrimaryButton
                    onClick={finish}
                    disabled={!(agree && parentState === 'done')}
                    label={UI.start}
                    arrow
                    className="w-full sm:w-auto"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function Field({ id, label, value, className }: { id: string; label: Bi; value: string; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-[13px] font-medium text-gray-300">
        <T b={label} />
      </label>
      <input
        id={id}
        readOnly
        value={value}
        className="mt-1.5 h-12 w-full rounded-xl border border-white/10 bg-black/30 px-3 font-mono text-[15px] tracking-wide text-white outline-none focus:border-cyan-300/50"
      />
    </div>
  )
}
