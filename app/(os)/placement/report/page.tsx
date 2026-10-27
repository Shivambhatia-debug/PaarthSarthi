'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { useDemo } from '@/lib/os/demo-store'
import { fmtIN, type Bi } from '@/lib/os/i18n'
import { INTEGRITY_FLOOR, computePRI, withLiveIntegrity } from '@/lib/os/scoring'
import { PREVIEW } from '@/lib/mock/state'
import { AgentLog } from '@/components/ai/agent-log'
import { Tr } from '@/components/os/tr-text'
import { ReportHero } from '@/components/placement/report/report-hero'
import { AttemptHistory } from '@/components/placement/report/attempt-history'
import { PillarRadar } from '@/components/placement/report/pillar-radar'
import { LanguageFair, RoundTable } from '@/components/placement/report/round-table'
import { CompanyFit } from '@/components/placement/report/company-fit'
import { OfferLetter } from '@/components/placement/report/offer-letter'
import { Roadmap } from '@/components/placement/report/roadmap'
import { Opportunities } from '@/components/placement/report/opportunities'
import { NextStop } from '@/components/os/next-stop'

const STUDENTS = fmtIN(PREVIEW.onboarded)

const STEPS: Bi[] = [
  { en: 'Aggregating rounds…', hi: 'राउंड जोड़े जा रहे हैं…', hinglish: 'Rounds aggregate ho rahe hain…' },
  { en: 'Weighting pillars…', hi: 'स्तंभों को भार दिया जा रहा है…', hinglish: 'Pillars ko weight diya ja raha hai…' },
  {
    en: `Benchmarking vs ${STUDENTS} Bihar students…`,
    hi: `${STUDENTS} बिहार छात्रों से तुलना…`,
    hinglish: `${STUDENTS} Bihar students se benchmark…`,
  },
  { en: 'Writing your 30-day plan…', hi: 'आपकी 30-दिन की योजना लिखी जा रही है…', hinglish: 'Aapka 30-day plan likha ja raha hai…' },
]

const TXT = {
  back: { en: 'Placement Day', hi: 'प्लेसमेंट डे', hinglish: 'Placement Day' },
  logTitle: { en: 'Sarthi is compiling your report', hi: 'सारथी आपकी रिपोर्ट बना रहा है', hinglish: 'Sarthi aapki report bana raha hai' },
  compiled: {
    en: `Report compiled by Sarthi AI · benchmarked against ${STUDENTS} Bihar students (illustrative)`,
    hi: `सारथी AI द्वारा तैयार · ${STUDENTS} बिहार छात्रों से तुलना (उदाहरणात्मक)`,
    hinglish: `Sarthi AI ne report banayi · ${STUDENTS} Bihar students se benchmark (illustrative)`,
  },
} satisfies Record<string, Bi>

const STEP_MS = 480

function Reveal({ i, children, className }: { i: number; children: ReactNode; className?: string }) {
  return (
    <div className={`os-rise min-w-0 ${className ?? ''}`} style={{ animationDelay: `${i * 110}ms` }}>
      {children}
    </div>
  )
}

export default function ReportPage() {
  const { persona, personaId, attempt, prevAttempt, integrity, hydrated, lite } = useDemo()
  const [logDone, setLogDone] = useState(false)
  const [forced, setForced] = useState(false)

  // Arriving from 'View my report' keeps the old scroll: always open at the top (back link visible).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Safety net: the report always appears, even if the agent log never reports done.
  useEffect(() => {
    const id = setTimeout(() => setForced(true), STEPS.length * STEP_MS + 2500)
    return () => clearTimeout(id)
  }, [])

  const onLogDone = useCallback(() => setLogDone(true), [])
  const ready = forced || (logDone && hydrated)

  const attempts = useMemo(() => (Array.isArray(persona?.attempts) ? persona.attempts : []), [persona])
  const first = attempts[0] ?? attempt
  const integrityScore = Math.max(INTEGRITY_FLOOR, Math.min(100, Math.round(integrity?.score ?? 100)))
  const live = useMemo(() => withLiveIntegrity(attempt.pillars, integrityScore), [attempt, integrityScore])
  const pri = computePRI(live)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/placement"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-[13px] text-gray-400 transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          <Tr b={TXT.back} />
        </Link>
        {ready && (
          <span className="os-rise inline-flex min-w-0 items-center gap-1.5 text-[12px] text-gray-500">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-violet-300" aria-hidden />
            <Tr b={TXT.compiled} className="min-w-0" />
          </span>
        )}
      </div>

      {!ready ? (
        <div className="space-y-5">
          <div className="mx-auto w-full max-w-xl">
            <AgentLog steps={STEPS} stepMs={lite ? 140 : STEP_MS} onDone={onLogDone} title={TXT.logTitle} />
          </div>
          <div aria-hidden className="space-y-5">
            <div className="os-skel h-[320px] rounded-3xl border border-white/[0.06]" />
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="os-skel h-[260px] rounded-2xl border border-white/[0.06]" />
              <div className="os-skel h-[260px] rounded-2xl border border-white/[0.06]" />
            </div>
          </div>
        </div>
      ) : (
        <div key={personaId} className="space-y-5">
          <Reveal i={0}>
            <ReportHero live={live} pri={pri} attempt={attempt} first={first} prev={prevAttempt} />
          </Reveal>

          <div className="grid gap-5 lg:grid-cols-2">
            <Reveal i={1}>
              <AttemptHistory attempts={attempts} live={live} pri={pri} />
            </Reveal>
            <Reveal i={2}>
              <PillarRadar live={live} />
            </Reveal>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Reveal i={3}>
              <RoundTable />
            </Reveal>
            <Reveal i={4}>
              <LanguageFair />
            </Reveal>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
            <Reveal i={5}>
              <CompanyFit first={first} />
            </Reveal>
            <Reveal i={6}>
              <OfferLetter pri={pri} />
            </Reveal>
          </div>

          <Reveal i={7}>
            <Roadmap pri={pri} />
          </Reveal>

          <Reveal i={8}>
            <Opportunities />
          </Reveal>
          <NextStop href="/tpo/" label={{ en: 'College T&P view', hi: 'कॉलेज T&P दृश्य', hinglish: 'College T&P view' }} sub={{ en: 'The whole batch, as the TPO sees it', hi: 'पूरा बैच, जैसा TPO देखते हैं', hinglish: 'Poora batch, jaise TPO dekhte hain' }} className="mt-4" />
        </div>
      )}
    </div>
  )
}
