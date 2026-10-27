'use client'

// State A of /placement: DigiLocker / APAAR sign-in (integration-ready, demo), auto-filled OTP and the DPDP consent,
// worded as pilot conditions (fix 48). Autopilot plays the whole login; fast-forward completes it at once.

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, BadgeCheck, ChevronLeft, GraduationCap, KeyRound, ShieldCheck, Smartphone } from 'lucide-react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Checkbox } from '@/components/ui/checkbox'
import { useDemo, useDemoEvent } from '@/lib/os/demo-store'
import { CONSENT_TEXT, DEMO_TODAY } from '@/lib/mock/state'
import { institutionById } from '@/lib/mock/institutions'
import { fmtDate, type Bi } from '@/lib/os/i18n'
import { sleep } from '@/lib/ai-sim'
import { aiToast } from '@/components/ai/ai-toast'
import { LanguageSwitcher } from '@/components/os/language-switcher'
import { Tr } from '@/components/os/tr-text'
import { cn } from '@/lib/utils'

const OTP_CODE = '608315'
const OTP_STEP_MS = 120

const ROLL_NO: Record<string, string> = {
  priya: 'PCE/ECE/2027/047',
  rahul: 'GPM/D-AUTO/2027/031',
}

const TXT = {
  title: { en: 'Placement Arena', hi: 'प्लेसमेंट एरीना' },
  sub: {
    en: 'Sign in to start your Placement Day',
    hi: 'अपना प्लेसमेंट डे शुरू करने के लिए साइन इन करें',
    hinglish: 'Apna Placement Day shuru karne ke liye sign in karein',
  },
  day: { en: 'Placement Day', hi: 'प्लेसमेंट डे' },
  digilocker: { en: 'Continue with DigiLocker / APAAR', hi: 'DigiLocker / APAAR से आगे बढ़ें' },
  caption: { en: 'integration-ready · demo', hi: 'इंटीग्रेशन-तैयार · डेमो' },
  or: { en: 'or', hi: 'या' },
  roll: { en: 'College roll no. + OTP', hi: 'कॉलेज रोल नंबर + OTP' },
  apaarField: { en: 'APAAR ID', hi: 'APAAR आईडी' },
  rollField: { en: 'College roll no.', hi: 'कॉलेज रोल नंबर' },
  otp: { en: 'One-time password', hi: 'वन-टाइम पासवर्ड' },
  otpSent: { en: 'Sent to registered mobile ••••• •• 47 · auto-filled', hi: 'पंजीकृत मोबाइल ••••• •• 47 पर भेजा · स्वतः भरा गया' },
  matched: { en: 'Verified', hi: 'सत्यापित' },
  pilot: { en: 'DPDP-aligned consent · pilot conditions', hi: 'DPDP-अनुरूप सहमति · पायलट की शर्तें' },
  agree: { en: 'I agree', hi: 'मैं सहमत हूँ' },
  enter: { en: 'Enter', hi: 'प्रवेश करें' },
  back: { en: 'Use another method', hi: 'दूसरा तरीका चुनें' },
  demo: { en: 'Demo student', hi: 'डेमो छात्र' },
  illus: { en: 'illustrative data', hi: 'सांकेतिक डेटा' },
} satisfies Record<string, Bi>

type Mode = 'idle' | 'apaar' | 'roll'

export function LoginCard({ className }: { className?: string }) {
  const { persona, personaId, lang, set, state } = useDemo()
  const [mode, setMode] = useState<Mode>('idle')
  const [otp, setOtp] = useState('')
  const [filling, setFilling] = useState(false)
  const [consent, setConsent] = useState(false)
  const inst = institutionById(persona.institutionId)
  const verified = otp.length === 6
  const canEnter = verified && consent

  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const start = useCallback((m: Exclude<Mode, 'idle'>) => {
    setMode(m)
    setOtp('')
    setConsent(false)
    setFilling(true)
  }, [])

  // OTP "arrives" after a beat, then fills one slot every 120 ms.
  useEffect(() => {
    if (!filling || mode === 'idle') return
    if (otp.length >= OTP_CODE.length) {
      setFilling(false)
      return
    }
    const id = setTimeout(
      () => setOtp((o) => (OTP_CODE.startsWith(o) ? OTP_CODE.slice(0, o.length + 1) : o)),
      otp.length === 0 ? 420 : OTP_STEP_MS,
    )
    return () => clearTimeout(id)
  }, [filling, mode, otp])

  const enter = useCallback(() => {
    if (state.loggedIn) return
    set({ loggedIn: true, consent: true })
    aiToast('Signed in · consent recorded (demo)', { tone: 'ok', description: 'DigiLocker / APAAR is integration-ready; no real account was used.' })
  }, [set, state.loggedIn])

  // Presenter: autopilot plays the login; fast-forward completes it.
  const running = useRef(false)
  useDemoEvent('autopilot', () => {
    if (running.current || state.loggedIn) return
    running.current = true
    void (async () => {
      try {
        if (mode === 'idle') {
          await sleep(350)
          if (!alive.current) return
          start('apaar')
        }
        // Wait for the OTP to fill (6 × 120 ms after the first digit).
        for (let i = 0; i < 60 && alive.current; i++) {
          await sleep(80)
          if (otpRef.current.length >= 6) break
        }
        if (!alive.current) return
        if (otpRef.current.length < 6) setOtp(OTP_CODE)
        await sleep(450)
        if (!alive.current) return
        setConsent(true)
        await sleep(750)
        if (!alive.current) return
        enter()
      } finally {
        running.current = false
      }
    })()
  })
  useDemoEvent('fastforward', () => {
    if (state.loggedIn) return
    if (mode === 'idle') setMode('apaar')
    setOtp(OTP_CODE)
    setConsent(true)
    enter()
  })
  const otpRef = useRef(otp)
  otpRef.current = otp

  const fieldLabel = mode === 'roll' ? TXT.rollField : TXT.apaarField
  const fieldValue = mode === 'roll' ? (ROLL_NO[personaId] ?? ROLL_NO.priya) : persona.apaarMasked

  return (
    <div className={cn('relative mx-auto w-full max-w-md', className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-[32px] bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.16),transparent_60%)] blur-2xl"
      />
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f141c]/95 p-5 shadow-[0_30px_80px_-40px_rgba(34,211,238,0.45)] sm:p-7">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />

        {/* Title */}
        <div className="flex items-start gap-3.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 p-px shadow-[0_0_28px_-6px_rgba(34,211,238,0.7)]">
            <span className="grid h-full w-full place-items-center rounded-[11px] bg-[#0d1117]">
              <GraduationCap className="h-5 w-5 text-cyan-300" aria-hidden />
            </span>
          </span>
          <div className="min-w-0">
            <h1 className="text-[22px] font-semibold leading-tight text-white">
              <span lang="en">Placement Arena</span>{' '}
              <span className="text-gray-500">·</span>{' '}
              <span lang="hi" className="font-deva text-[20px] text-gray-200">
                प्लेसमेंट एरीना
              </span>
            </h1>
            <p className="mt-1 text-[13px] text-gray-400">
              <Tr b={TXT.sub} />
            </p>
          </div>
        </div>

        <div className="mt-5">
          <LanguageSwitcher size="sm" />
        </div>

        {mode === 'idle' ? (
          <div className="os-rise mt-6">
            <button
              type="button"
              onClick={() => start('apaar')}
              className="group relative flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 p-px text-[15px] font-semibold text-white shadow-[0_14px_40px_-16px_rgba(34,211,238,0.8)] transition-transform active:scale-[0.99]"
            >
              <span className="flex h-full w-full items-center justify-center gap-2.5 rounded-[11px] bg-[#0d1424] transition-colors group-hover:bg-[#0d1424]/70">
                <ShieldCheck className="h-5 w-5 text-cyan-300" aria-hidden />
                <Tr b={TXT.digilocker} />
              </span>
            </button>
            <p className="mt-2 text-center text-[12px] text-gray-500">
              <Tr b={TXT.caption} />
            </p>

            <div className="my-5 flex items-center gap-3 text-[12px] text-gray-500">
              <span className="h-px flex-1 bg-white/10" />
              <Tr b={TXT.or} />
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <button
              type="button"
              onClick={() => start('roll')}
              className="mx-auto flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-cyan-200 underline decoration-cyan-300/40 underline-offset-4 transition-colors hover:text-white"
            >
              <KeyRound className="h-4 w-4" aria-hidden />
              <Tr b={TXT.roll} />
            </button>
          </div>
        ) : (
          <div className="os-rise mt-6 space-y-4">
            {/* ID field */}
            <div>
              <label htmlFor="ps-login-id" className="mb-1.5 block text-[12px] font-medium text-gray-400">
                <Tr b={fieldLabel} />
              </label>
              <div className="relative">
                <input
                  id="ps-login-id"
                  readOnly
                  value={fieldValue}
                  className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 pr-28 font-mono text-[14px] tracking-wide text-gray-100 focus:outline-none"
                />
                {verified && (
                  <span className="os-rise absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1 text-[12px] font-medium text-emerald-300">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                    <Tr b={TXT.matched} />
                  </span>
                )}
              </div>
            </div>

            {/* OTP */}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-[12px] font-medium text-gray-400">
                  <Tr b={TXT.otp} />
                </span>
                <span className="inline-flex items-center gap-1 text-[12px] text-gray-500">
                  <Smartphone className="h-3.5 w-3.5" aria-hidden />
                  <span className="hidden sm:inline">
                    <Tr b={TXT.otpSent} />
                  </span>
                </span>
              </div>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(v) => {
                  setFilling(false)
                  setOtp(v.replace(/\D/g, '').slice(0, 6))
                }}
                containerClassName="justify-between"
                aria-label="One-time password"
              >
                <InputOTPGroup className="w-full justify-between gap-1.5 sm:gap-2">
                  {Array.from({ length: 6 }, (_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className={cn(
                        'h-12 flex-1 rounded-lg border border-white/12 bg-white/[0.03] font-mono text-lg font-semibold text-white first:rounded-l-lg last:rounded-r-lg',
                        'ring-offset-[#0f141c]',
                        i < otp.length && 'border-cyan-300/50 bg-cyan-400/[0.08]',
                        verified && 'border-emerald-400/50 bg-emerald-400/[0.08]',
                      )}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              {verified && (
                <p className="os-rise mt-2 inline-flex items-center gap-1.5 text-[12.5px] text-emerald-300">
                  <BadgeCheck className="h-4 w-4" aria-hidden />
                  <span>
                    {persona.name}
                    {inst ? ` · ${inst.short || inst.name}` : ''} · {persona.branchLabel}
                  </span>
                </p>
              )}
            </div>

            {/* Consent (pilot conditions) */}
            <div
              className={cn(
                'rounded-xl border p-3.5 transition-colors',
                consent ? 'border-cyan-300/30 bg-cyan-400/[0.05]' : 'border-white/10 bg-white/[0.02]',
              )}
            >
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/[0.08] px-2 py-0.5 text-[12px] font-medium text-amber-200">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                <Tr b={TXT.pilot} />
              </span>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="ps-consent"
                  checked={consent}
                  disabled={!verified}
                  onCheckedChange={(v) => setConsent(v === true)}
                  className="mt-1 h-5 w-5 shrink-0 rounded-md border-white/30 data-[state=checked]:border-cyan-300 data-[state=checked]:bg-cyan-400 data-[state=checked]:text-[#06121a]"
                />
                <label htmlFor="ps-consent" className={cn('cursor-pointer', !verified && 'cursor-not-allowed opacity-60')}>
                  <span className="mb-1 block text-[13px] font-semibold text-gray-100">
                    <Tr b={TXT.agree} />
                  </span>
                  <Tr b={CONSENT_TEXT.college} as="span" className="block text-[12.5px] leading-relaxed text-gray-400" />
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={enter}
              disabled={!canEnter}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-[15px] font-semibold text-[#06121a] shadow-[0_14px_40px_-16px_rgba(34,211,238,0.85)] transition-[filter,opacity,transform] hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none"
            >
              <Tr b={TXT.enter} />
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('idle')
                setFilling(false)
                setOtp('')
                setConsent(false)
              }}
              className="mx-auto flex items-center gap-1 text-[12px] text-gray-500 transition-colors hover:text-gray-300"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
              <Tr b={TXT.back} />
            </button>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-4 text-[12px] text-gray-500">
          <span>
            <Tr b={TXT.demo} />: <span className="text-gray-300">{persona.name}</span>
            {inst ? <span> · {inst.short || inst.name}</span> : null}
          </span>
          <span>
            <Tr b={TXT.day} /> · {fmtDate(DEMO_TODAY, lang === 'hi' ? 'hi' : 'en', { year: true })}
          </span>
        </div>
        <p className="mt-1 text-[12px] text-gray-600">
          <Tr b={TXT.illus} />
        </p>
      </div>
    </div>
  )
}
