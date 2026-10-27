'use client'

// Round 1 · Online Assessment (adaptive, proctored). Tab detection is ON here (fix 9).

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2, Flag, Loader2 } from 'lucide-react'
import { useDemo, useDemoEvent } from '@/lib/os/demo-store'
import { ROUNDS, ROUND_TARGETS, nextRoute } from '@/lib/os/rounds'
import type { Bi } from '@/lib/os/i18n'
import { DriveShell } from '@/components/os/drive-shell'
import { Tr } from '@/components/os/tr-text'
import {
  ExamActions,
  ExamShell,
  ExamTimer,
  useAptitudeExam,
  type ExamSummary,
} from '@/components/placement/aptitude/exam-shell'
import { SectionResult } from '@/components/placement/aptitude/section-result'

const TITLE: Bi = { en: 'Online Assessment · ऑनलाइन परीक्षा', hi: 'ऑनलाइन परीक्षा · Online Assessment' }
const SUBTITLE: Bi = {
  en: 'Round 1 · Numerical, Reasoning, Verbal · 3:00 per section · adaptive',
  hi: 'राउंड 1 · संख्यात्मक, तार्किक, भाषिक · हर सेक्शन 3:00 · अनुकूली',
}

const TXT = {
  submitted: { en: 'Submitted', hi: 'जमा' },
  scoring: { en: 'Sarthi AI is scoring…', hi: 'सारथी AI मूल्यांकन कर रहा है…' },
  cleared: { en: 'Aptitude cleared', hi: 'अभिरुचि राउंड पास' },
  flagged: { en: 'Aptitude · flagged for review', hi: 'अभिरुचि · समीक्षा हेतु चिह्नित' },
  next: { en: 'Next round', hi: 'अगला राउंड' },
}

export default function AptitudePage() {
  const router = useRouter()
  const { rounds, setRound, personaId, includeGd, integrity } = useDemo()

  // Opened again after the round was scored: show the result, no re-exam (Retake is available).
  const [phase, setPhase] = useState<'exam' | 'result'>(() =>
    rounds.aptitude.status === 'cleared' || rounds.aptitude.status === 'flagged' ? 'result' : 'exam',
  )
  const [summary, setSummary] = useState<ExamSummary | null>(null)
  const [fast, setFast] = useState(false)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (phase === 'exam') setRound('aptitude', { status: 'live' })
    // Run once on mount; later phase changes write their own status.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onDone = useCallback((s: ExamSummary, wasFast: boolean) => {
    setSummary(s)
    setFast(wasFast)
    setRevealed(false)
    setPhase('result')
  }, [])

  const exam = useAptitudeExam({ active: phase === 'exam', onDone })

  const next = nextRoute('aptitude', includeGd)
  const nextLabel: Bi = roundOfRoute(next)?.label ?? { en: 'Report', hi: 'रिपोर्ट' }

  const goNext = useCallback(() => router.push(next), [router, next])

  const retake = useCallback(() => {
    exam.reset()
    setSummary(null)
    setFast(false)
    setRevealed(false)
    setRound('aptitude', { status: 'live', score: undefined })
    setPhase('exam')
  }, [exam, setRound])

  // Autopilot on the result: continue to the next round once the score is on screen.
  useDemoEvent('autopilot', () => {
    if (phase === 'result' && revealed) goNext()
  })

  const score = ROUND_TARGETS[personaId].aptitude
  const isFlagged = integrity.tabSwitches >= 3

  const footer =
    phase === 'exam' ? (
      <ExamActions exam={exam} />
    ) : (
      <div className="flex items-center gap-3">
        {revealed ? (
          <span className={isFlagged ? 'inline-flex items-center gap-2 text-[13px] text-amber-200' : 'inline-flex items-center gap-2 text-[13px] text-emerald-200'}>
            {isFlagged ? <Flag className="h-4 w-4" aria-hidden /> : <CheckCircle2 className="h-4 w-4" aria-hidden />}
            <span className="hidden sm:inline">
              <Tr b={isFlagged ? TXT.flagged : TXT.cleared} />
            </span>
            <span className="font-semibold tabular-nums text-white">{score}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 text-[13px] text-violet-200">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            <Tr b={TXT.scoring} />
          </span>
        )}
        <button
          type="button"
          onClick={goNext}
          disabled={!revealed}
          className="ml-auto inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 px-4 text-[14px] font-semibold text-[#06121a] shadow-[0_10px_30px_-10px_rgba(34,211,238,0.7)] transition-[filter,opacity] hover:brightness-110 disabled:opacity-40 sm:px-6"
        >
          <Tr b={TXT.next} />
          <span className="hidden sm:inline">:</span>
          <span className="hidden sm:inline">
            <Tr b={nextLabel} />
          </span>
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    )

  return (
    <DriveShell
      round="aptitude"
      title={TITLE}
      subtitle={SUBTITLE}
      detectTabs
      timer={
        phase === 'exam' ? (
          <ExamTimer exam={exam} />
        ) : (
          <span className="text-emerald-200">
            <Tr b={TXT.submitted} />
          </span>
        )
      }
      footer={footer}
    >
      {phase === 'exam' ? (
        <div data-proctored="">
          <ExamShell exam={exam} />
        </div>
      ) : (
        <SectionResult summary={summary} instant={fast} onRevealed={() => setRevealed(true)} onRetake={retake} />
      )}
    </DriveShell>
  )
}

function roundOfRoute(route: string) {
  return ROUNDS.find((r) => r.id !== 'eligibility' && r.route === route)
}
