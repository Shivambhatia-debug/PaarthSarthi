'use client'

// Hub step 2: verified profile, readiness history (Priya) or baseline-pending (Rahul), 7 pillar mini bars.

import { useMemo } from 'react'
import { ArrowLeftRight, BadgeCheck, Link2, MapPin, School, Target } from 'lucide-react'
import { useDemo } from '@/lib/os/demo-store'
import { DEMO_TODAY } from '@/lib/mock/state'
import { institutionById } from '@/lib/mock/institutions'
import { districtById } from '@/lib/mock/districts'
import { PILLAR_KEYS, PILLAR_LABELS, bandClasses } from '@/lib/os/scoring'
import { fmtDate, type Bi } from '@/lib/os/i18n'
import { ScoreRing } from '@/components/ai/score-ring'
import { Sparkline } from '@/components/os/sparkline'
import { Tr } from '@/components/os/tr-text'
import { cn } from '@/lib/utils'

const TXT = {
  cgpa: { en: 'CGPA', hi: 'CGPA' },
  diploma: { en: 'Diploma', hi: 'डिप्लोमा' },
  tenth: { en: '10th', hi: '10वीं' },
  twelfth: { en: '12th', hi: '12वीं' },
  backlogs: { en: 'Backlogs', hi: 'बैकलॉग' },
  verified: { en: 'verified', hi: 'सत्यापित' },
  ready: { en: 'integration-ready', hi: 'इंटीग्रेशन-तैयार' },
  readiness: { en: 'Placement Readiness Index', hi: 'प्लेसमेंट रेडीनेस इंडेक्स' },
  pending: { en: 'Baseline', hi: 'बेसलाइन', hinglish: 'Baseline' },
  pendingNote: {
    en: "Baseline diagnostic pending: today's run sets it",
    hi: 'बेसलाइन डायग्नोस्टिक बाकी: आज का रन इसे तय करेगा',
    hinglish: 'Baseline diagnostic pending: aaj ka run ise set karega',
  },
  history: { en: 'Readiness history', hi: 'तैयारी का इतिहास' },
  pillars: { en: 'Pillars · last attempt', hi: 'स्तंभ · पिछला प्रयास' },
  pillarsPending: { en: 'Pillars · set after today', hi: 'स्तंभ · आज के बाद तय होंगे' },
  gaps: { en: 'Top gaps last time', hi: 'पिछली बार की मुख्य कमियाँ' },
  firstGen: { en: 'First in family in college', hi: 'परिवार में कॉलेज जाने वाली पहली', hinglish: 'Family mein college jaane wali pehli' },
  firstGenM: { en: 'First in family in college', hi: 'परिवार में कॉलेज जाने वाले पहले', hinglish: 'Family mein college jaane wale pehle' },
} satisfies Record<string, Bi>

export function ProfileHeader({ className }: { className?: string }) {
  const { persona, personaId, prevAttempt, lang, setPersona, t } = useDemo()
  const inst = institutionById(persona.institutionId)
  const district = districtById(persona.districtId)
  const isDiploma = persona.kind === 'polytechnic'

  const history = useMemo(
    () => persona.attempts.filter((a) => a.date !== DEMO_TODAY).map((a) => a.pri),
    [persona.attempts],
  )
  const firstPri = history.length > 0 ? history[0] : 0

  const stats: { k: Bi; v: string }[] = [
    isDiploma
      ? { k: TXT.diploma, v: typeof persona.diplomaPct === 'number' ? `${persona.diplomaPct}%` : '—' }
      : { k: TXT.cgpa, v: typeof persona.cgpa === 'number' ? persona.cgpa.toFixed(1) : '—' },
    { k: TXT.tenth, v: typeof persona.tenth === 'number' ? `${persona.tenth}%` : '—' },
    ...(isDiploma ? [] : [{ k: TXT.twelfth, v: typeof persona.twelfth === 'number' ? `${persona.twelfth}%` : '—' }]),
    { k: TXT.backlogs, v: String(persona.activeBacklogs ?? 0) },
  ]

  const other = personaId === 'priya' ? 'rahul' : 'priya'
  const firstName = persona.name.split(' ')[0]
  const switchLabel: Bi =
    personaId === 'priya'
      ? { en: 'Viewing as Priya · switch to Rahul (polytechnic)', hi: 'प्रिया के रूप में · राहुल (पॉलिटेक्निक) पर जाएँ' }
      : { en: 'Viewing as Rahul · switch to Priya (B.Tech)', hi: 'राहुल के रूप में · प्रिया (B.Tech) पर जाएँ' }

  const gapText: Bi | null = prevAttempt
    ? {
        en: `Communication (Versant-style ${prevAttempt.versant}/80), DSA`,
        hi: `संवाद (Versant-style ${prevAttempt.versant}/80), DSA`,
      }
    : null

  return (
    <section
      className={cn(
        'os-rise relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6',
        className,
      )}
      aria-label={t({ en: 'Student profile', hi: 'छात्र प्रोफ़ाइल' })}
    >
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* Identity */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3.5">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 p-px">
              <span className="grid h-full w-full place-items-center rounded-[15px] bg-[#0d1117] text-lg font-semibold text-white">
                {persona.avatarInitials}
              </span>
            </span>
            <div className="min-w-0">
              <h2 className="flex flex-wrap items-baseline gap-x-2 text-xl font-semibold leading-tight text-white sm:text-2xl">
                <span>{persona.name}</span>
                <span lang="hi" className="font-deva text-base font-medium text-gray-400">
                  {persona.nameHi}
                </span>
              </h2>
              <p className="mt-1 text-[13px] text-gray-300">{persona.branchLabel}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-gray-400">
                {inst && (
                  <span className="inline-flex items-center gap-1">
                    <School className="h-3.5 w-3.5 text-gray-500" aria-hidden />
                    {inst.name}
                  </span>
                )}
                {district && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-gray-500" aria-hidden />
                    {lang === 'hi' ? (
                      <span lang="hi" className="font-deva">
                        {district.nameHi}
                      </span>
                    ) : (
                      district.name
                    )}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5 text-[12px]">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-gray-300">
              <Tr
                b={{
                  en: `${persona.medium}-medium`,
                  hi: persona.medium === 'Hindi' ? 'हिंदी माध्यम' : 'अंग्रेज़ी माध्यम',
                }}
              />
            </span>
            {persona.firstGen && (
              <span className="rounded-full border border-amber-300/25 bg-amber-300/[0.06] px-2.5 py-1 text-amber-100">
                <Tr b={persona.gender === 'F' ? TXT.firstGen : TXT.firstGenM} />
              </span>
            )}
            <button
              type="button"
              onClick={() => setPersona(other)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-300/30 text-left bg-cyan-400/[0.07] px-2.5 py-1 font-medium text-cyan-100 transition-colors hover:border-cyan-300/60 hover:bg-cyan-400/[0.14]"
              title={t({ en: `${firstName}'s run is kept separately`, hi: 'हर छात्र का रन अलग रखा जाता है' })}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden />
              <Tr b={switchLabel} />
            </button>
          </div>

          {/* Academic stats */}
          <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.k.en} className="rounded-xl border border-white/[0.08] bg-[#0d1117]/60 px-3 py-2">
                <dt className="text-[12px] text-gray-500">
                  <Tr b={s.k} />
                </dt>
                <dd className="text-lg font-semibold tabular-nums text-white">{s.v}</dd>
              </div>
            ))}
          </dl>

          {/* Credentials */}
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {persona.credentials.map((c) => {
              const ok = c.status === 'verified'
              return (
                <li
                  key={c.id}
                  className={cn(
                    'inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2 py-1 text-[12px]',
                    ok
                      ? 'border-emerald-400/30 bg-emerald-400/[0.07] text-emerald-100'
                      : 'border-blue-400/30 bg-blue-400/[0.07] text-blue-100',
                  )}
                >
                  {ok ? (
                    <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-300" aria-hidden />
                  ) : (
                    <Link2 className="h-3.5 w-3.5 shrink-0 text-blue-300" aria-hidden />
                  )}
                  <span className="truncate">
                    {c.label} · <span className="text-gray-400">{c.issuer}</span>
                  </span>
                  <span className={cn('shrink-0', ok ? 'text-emerald-300/80' : 'text-blue-300/80')}>
                    · <Tr b={ok ? TXT.verified : TXT.ready} />
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Readiness */}
        <div className="flex w-full shrink-0 flex-col items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0d1117]/50 p-4 lg:w-[260px]">
          <p className="text-center text-[12px] font-medium uppercase tracking-wider text-gray-500">
            <Tr b={TXT.readiness} />
          </p>
          {prevAttempt ? (
            <>
              <ScoreRing
                value={prevAttempt.pri}
                from={firstPri}
                size={132}
                label="PRI"
                sublabel={{
                  en: `Last attempt · ${fmtDate(prevAttempt.date, 'en')}`,
                  hi: `पिछला प्रयास · ${fmtDate(prevAttempt.date, 'hi')}`,
                }}
              />
              {history.length > 1 && (
                <div className="flex items-center gap-2 text-[12px] text-gray-400">
                  <Tr b={TXT.history} />
                  <Sparkline data={history} width={72} height={22} />
                  <span className="tabular-nums text-gray-200">{history.join(' → ')}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <ScoreRing value={null} size={132} label={TXT.pending} showBand={false} />
              <p className="max-w-[220px] text-center text-[12.5px] leading-relaxed text-gray-400">
                <Tr b={TXT.pendingNote} />
              </p>
            </>
          )}
        </div>
      </div>

      {/* Pillars */}
      <div className="relative mt-5 border-t border-white/[0.06] pt-4">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] font-medium text-gray-400">
            <Tr b={prevAttempt ? TXT.pillars : TXT.pillarsPending} />
          </p>
          {gapText && (
            <p className="inline-flex items-center gap-1.5 text-[12px] text-amber-200">
              <Target className="h-3.5 w-3.5" aria-hidden />
              <span>
                <Tr b={TXT.gaps} />: <Tr b={gapText} />
              </span>
            </p>
          )}
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-4 lg:grid-cols-7">
          {PILLAR_KEYS.map((k) => {
            const v = prevAttempt ? prevAttempt.pillars[k] : null
            const hex = v === null ? undefined : bandClasses(v).hex
            return (
              <li key={k} className="min-w-0">
                <div className="flex items-baseline justify-between gap-1 text-[12px]">
                  <span className="truncate text-gray-400">
                    <Tr b={PILLAR_LABELS[k]} />
                  </span>
                  <span className="tabular-nums text-gray-200">{v === null ? '—' : Math.round(v)}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  {v !== null && (
                    <div
                      className="h-full rounded-full transition-[width] duration-700"
                      style={{ width: `${Math.max(2, Math.min(100, v))}%`, backgroundColor: hex }}
                    />
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
