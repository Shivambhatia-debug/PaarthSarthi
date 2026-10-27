'use client'

import type { ReactNode } from 'react'
import { Activity, Award, BadgeCheck, Gauge, Mic, ShieldCheck, UserPlus, Users2 } from 'lucide-react'
import { KpiTile } from '@/components/os/kpi-tile'
import { IllustrativeChip } from '@/components/os/illustrative-chip'
import { Tr } from '@/components/os/tr-text'
import { fmtIN, fmtNum, type Bi } from '@/lib/os/i18n'
import { PREVIEW, WEEK_LABEL } from '@/lib/mock/state'
import { riseStyle } from '@/components/state/title-strip'
import { cn } from '@/lib/utils'

const T = {
  band: { en: 'Platform preview (illustrative)', hi: 'प्लेटफ़ॉर्म प्रीव्यू (सांकेतिक)' },
  bandSub: {
    en: 'What this centre shows once the pilot fills it. Illustrative today.',
    hi: 'पायलट शुरू होने पर यह केंद्र क्या दिखाएगा। आज के आँकड़े सांकेतिक हैं।',
  },
  thisWeek: { en: 'this week', hi: 'इस सप्ताह' },
  weekly: { en: 'Weekly active', hi: 'साप्ताहिक सक्रिय' },
  avgPri: { en: 'Average PRI', hi: 'औसत PRI' },
  vsBaseline: { en: 'vs baseline', hi: 'बेसलाइन से' },
  ai: { en: 'AI mock interviews', hi: 'AI मॉक इंटरव्यू' },
  ready: { en: 'Interview-ready (PRI ≥ 70)', hi: 'इंटरव्यू के लिए तैयार (PRI ≥ 70)' },
  offers: { en: 'Offers + internships', hi: 'ऑफ़र + इंटर्नशिप' },
  girls: { en: 'Girls among onboarded', hi: 'जुड़े छात्रों में छात्राएँ' },
  consent: { en: 'DPDP consent recorded', hi: 'DPDP सहमति दर्ज' },
  consentSub: { en: 'purpose-specific', hi: 'उद्देश्य-विशिष्ट' },
} satisfies Record<string, Bi>

function Tile({ index, children }: { index: number; children: ReactNode }) {
  return (
    <div className="os-rise min-w-0" style={riseStyle(index)}>
      {children}
    </div>
  )
}

/** 'Platform preview (illustrative)' band: eight KPI tiles with count-ups and week deltas. */
export function PreviewBand({ className }: { className?: string }) {
  const wd = PREVIEW.weekDelta
  const priGain = PREVIEW.avgPri - PREVIEW.baselinePri
  const girlsGap = PREVIEW.girlsTargetPct - PREVIEW.girlsPct

  return (
    <section
      style={riseStyle(2)}
      className={cn(
        'os-rise relative overflow-hidden rounded-2xl border border-cyan-400/15 bg-gradient-to-b from-cyan-400/[0.045] via-white/[0.02] to-transparent p-4 sm:p-5',
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-cyan-400/[0.08] blur-3xl" />
      <header className="relative mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/25">
            <Gauge aria-hidden className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <Tr as="h2" b={T.band} className="block text-[15px] font-semibold text-white sm:text-base" />
            <Tr as="p" b={T.bandSub} className="block text-[12.5px] text-gray-400" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-7 items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 text-[12px] tabular-nums text-gray-300">
            <Tr b={WEEK_LABEL} />
          </span>
          <IllustrativeChip />
        </div>
      </header>

      <div className="relative grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
        <Tile index={3}>
          <KpiTile
            className="h-full"
            icon={UserPlus}
            label={PREVIEW.onboardedLabel}
            value={PREVIEW.onboarded}
            delta={wd.onboarded}
            deltaLabel={T.thisWeek}
          />
        </Tile>
        <Tile index={4}>
          <KpiTile
            className="h-full"
            icon={Activity}
            label={T.weekly}
            value={PREVIEW.weeklyActive}
            sub={`(${fmtNum(PREVIEW.weeklyActivePct)}%)`}
            delta={wd.weeklyActivePp}
            deltaFormat="pp"
            deltaLabel={T.thisWeek}
          />
        </Tile>
        <Tile index={5}>
          <KpiTile
            className="h-full"
            icon={Gauge}
            tone="ai"
            label={T.avgPri}
            value={PREVIEW.avgPri}
            format="decimal"
            decimals={1}
            delta={priGain}
            deltaFormat="decimal"
            deltaDecimals={1}
            deltaLabel={{ en: `vs baseline ${fmtNum(PREVIEW.baselinePri)}`, hi: `बेसलाइन ${fmtNum(PREVIEW.baselinePri)} से` }}
          />
        </Tile>
        <Tile index={6}>
          <KpiTile
            className="h-full"
            icon={Mic}
            tone="ai"
            label={T.ai}
            value={PREVIEW.aiInterviews}
            delta={wd.aiInterviews}
            deltaLabel={T.thisWeek}
          >
            <p className="flex items-center gap-1.5 text-[12px] text-gray-500">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_8px_rgba(167,139,250,0.9)]" aria-hidden />
              <Tr b={{ en: `Today: ${fmtIN(PREVIEW.today.aiInterviews)}`, hi: `आज: ${fmtIN(PREVIEW.today.aiInterviews)}` }} />
            </p>
          </KpiTile>
        </Tile>
        <Tile index={7}>
          <KpiTile
            className="h-full"
            icon={BadgeCheck}
            tone="good"
            label={T.ready}
            value={PREVIEW.interviewReady}
            delta={wd.interviewReady}
            deltaLabel={T.thisWeek}
          >
            <p className="text-[12px] text-gray-500">
              <Tr
                b={{
                  en: `${fmtIN(PREVIEW.today.newlyReady)} newly ready today`,
                  hi: `आज ${fmtIN(PREVIEW.today.newlyReady)} नए तैयार`,
                }}
              />
            </p>
          </KpiTile>
        </Tile>
        <Tile index={8}>
          <KpiTile
            className="h-full"
            icon={Award}
            tone="good"
            label={T.offers}
            value={PREVIEW.offersAndInternships}
            delta={wd.offers}
            deltaLabel={T.thisWeek}
          />
        </Tile>
        <Tile index={9}>
          <KpiTile
            className="h-full"
            icon={Users2}
            tone="warn"
            label={T.girls}
            value={PREVIEW.girlsPct}
            format="pct"
            decimals={1}
            sub={{ en: `vs ≥${PREVIEW.girlsTargetPct}% target`, hi: `लक्ष्य ≥${PREVIEW.girlsTargetPct}%` }}
          >
            <div className="space-y-1.5">
              <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
                  style={{ width: `${Math.min(100, (PREVIEW.girlsPct / PREVIEW.girlsTargetPct) * 100)}%` }}
                />
              </div>
              <p className="text-[12px] text-amber-200/80">
                <Tr
                  b={{
                    en: `${fmtNum(girlsGap)} pp below target`,
                    hi: `लक्ष्य से ${fmtNum(girlsGap)} pp कम`,
                  }}
                />
              </p>
            </div>
          </KpiTile>
        </Tile>
        <Tile index={10}>
          <KpiTile
            className="h-full"
            icon={ShieldCheck}
            label={T.consent}
            value={PREVIEW.consentPct}
            format="pct"
            decimals={1}
            sub={T.consentSub}
          >
            <p className="text-[12px] text-gray-500">
              <Tr b={{ en: `of ${fmtIN(PREVIEW.onboarded)} students`, hi: `${fmtIN(PREVIEW.onboarded)} छात्रों में` }} />
            </p>
          </KpiTile>
        </Tile>
      </div>
    </section>
  )
}
