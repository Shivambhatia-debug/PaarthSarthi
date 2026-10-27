'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SchoolShell, StepNav, T, useSchool } from '@/components/schools/school-shell'
import { SchoolLogin } from '@/components/schools/school-login'
import { DishaTest } from '@/components/schools/disha-test'
import { ShaktiReport } from '@/components/schools/shakti-report'
import { PathRecommender } from '@/components/schools/path-recommender'
import { SarthiDidi } from '@/components/schools/sarthi-didi'
import { YojanaRadar } from '@/components/schools/yojana-radar'
import { HandoffCard } from '@/components/schools/handoff-card'

/**
 * /schools: School-to-Skill feeder (with the Education Department / BEPC). Hindi-first, mobile-first,
 * one step-based page. ?step=1..6 opens a step on a cold load; the step also persists in state.school.step.
 */
export default function SchoolsPage() {
  return (
    <SchoolShell>
      <SchoolSteps />
    </SchoolShell>
  )
}

function SchoolSteps() {
  const { step, lite } = useSchool()
  return (
    <div key={step} className={lite ? undefined : 'os-rise'}>
      {step === 1 && <SchoolLogin />}
      {step === 2 && <DishaTest />}
      {step === 3 && <ShaktiReport />}
      {step === 4 && <PathRecommender />}
      {step === 5 && <SarthiDidi />}
      {step === 6 && (
        <>
          <YojanaRadar />
          <HandoffCard className="mt-8" />
          <StepNav />
          <SchoolNextStop />
        </>
      )}
    </div>
  )
}

/* Same look as components/os/next-stop, but follows the school's own language (Hindi-first),
 * not the global OS language. */
function SchoolNextStop() {
  return (
    <div className="no-print mt-10 flex justify-end">
      <Link
        href="/pilot/"
        className="group inline-flex max-w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left outline-none transition-colors hover:border-cyan-400/40 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-cyan-300"
      >
        <span className="min-w-0">
          <T b={{ en: 'Next view', hi: 'अगला दृश्य' }} className="block text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-500" />
          <T b={{ en: 'The 90-day pilot', hi: '90 दिन का पायलट' }} className="block text-[15px] font-semibold text-white" />
          <T b={{ en: 'Scope, KPIs and the ask', hi: 'दायरा, KPI और अनुरोध' }} className="block text-[12px] text-gray-400" />
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 text-cyan-300 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </div>
  )
}
