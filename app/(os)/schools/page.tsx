'use client'

import { SchoolShell, StepNav, useSchool } from '@/components/schools/school-shell'
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
        </>
      )}
    </div>
  )
}
