'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { FileText, LayoutDashboard, ShieldCheck } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LiveTicker } from '@/components/ai/live-ticker'
import { IllustrativeChip } from '@/components/os/illustrative-chip'
import { Tr } from '@/components/os/tr-text'
import { OfficerScope } from '@/lib/os/demo-store'
import { setQueryParam, useQueryParam } from '@/hooks/use-query-param'
import { WEEK_LABEL } from '@/lib/mock/state'
import type { TickerEvent } from '@/lib/mock/types'
import type { Bi } from '@/lib/os/i18n'
import { TitleStrip } from '@/components/state/title-strip'
import { ReportedBand } from '@/components/state/reported-band'
import { PreviewBand } from '@/components/state/preview-band'
import { TrendChart } from '@/components/state/trend-chart'
import { DistrictMapPanel } from '@/components/state/district-map-panel'
import { CollegeLeaderboard } from '@/components/state/college-leaderboard'
import { SkillGapPanel } from '@/components/state/skill-gap-panel'
import { FunnelPanel } from '@/components/state/funnel-panel'
import { AiPolicyTracker } from '@/components/state/ai-policy-tracker'
import { InputsOutcomesPanel } from '@/components/state/inputs-outcomes-panel'
import { AtRiskPanel } from '@/components/state/at-risk-panel'
import { TrustTab } from '@/components/state/trust-tab'
import { AskSarthi } from '@/components/state/ask-sarthi'
import { DEFAULT_FILTER, type StateFilter } from '@/components/state/state-data'

const T = {
  command: { en: 'Command Centre', hi: 'कमांड सेंटर' },
  trust: { en: 'Trust & Compliance', hi: 'विश्वास और अनुपालन' },
  brief: { en: 'Weekly brief', hi: 'साप्ताहिक ब्रीफ़' },
  trustTitle: { en: 'Trust & Compliance', hi: 'विश्वास और अनुपालन' },
  trustSub: {
    en: 'Consent, access control, audit and hosting commitments for the DSTTE pilot',
    hi: 'DSTTE पायलट के लिए सहमति, पहुँच नियंत्रण, ऑडिट और होस्टिंग प्रतिबद्धताएँ',
  },
} satisfies Record<string, Bi>

const TRIGGER =
  'h-8 gap-1.5 rounded-lg px-3 text-[13px] font-medium text-gray-400 transition-colors hover:text-white data-[state=active]:bg-white/[0.09] data-[state=active]:text-white data-[state=active]:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]'

export default function StatePage() {
  return (
    <OfficerScope>
      <StateCommandCentre />
    </OfficerScope>
  )
}

function StateCommandCentre() {
  const tabParam = useQueryParam('tab')
  const tab = tabParam === 'trust' ? 'trust' : 'command'
  const [filter, setFilter] = useState<StateFilter>(DEFAULT_FILTER)
  const [focusIds, setFocusIds] = useState<string[] | null>(null)
  const [pulse, setPulse] = useState<string | null>(null)

  const onTicker = useCallback((e: TickerEvent) => setPulse(e.districtId ?? null), [])
  const clearFocus = useCallback(() => setFocusIds(null), [])

  // Memoised so the ticker's pulse (every few seconds) only re-renders the map.
  const ask = useMemo(() => <AskSarthi onFocus={setFocusIds} />, [])
  const top = useMemo(
    () => (
      <>
        <TitleStrip className="xl:col-span-12" filter={filter} onFilterChange={setFilter} aside={ask} />
        <ReportedBand className="xl:col-span-12" />
        <PreviewBand className="xl:col-span-12" />
      </>
    ),
    [filter, ask],
  )
  const side = useMemo(
    () => (
      <div className="flex min-w-0 flex-col gap-4 xl:col-span-5">
        <TrendChart index={4} />
        <AiPolicyTracker index={5} className="flex-1" />
      </div>
    ),
    [],
  )
  const lower = useMemo(
    () => (
      <>
        <CollegeLeaderboard className="xl:col-span-12" filter={filter} index={6} />
        <SkillGapPanel className="xl:col-span-7" index={7} />
        <FunnelPanel className="xl:col-span-5" index={8} />
        <InputsOutcomesPanel className="xl:col-span-5" index={9} />
        <AtRiskPanel className="xl:col-span-7" index={10} />
      </>
    ),
    [filter],
  )

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pb-12 pt-4 sm:px-6 lg:pt-6">
      <Tabs value={tab} onValueChange={(v) => setQueryParam('tab', v === 'trust' ? 'trust' : null)}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <TabsList className="h-10 rounded-xl border border-white/10 bg-white/[0.03] p-1">
            <TabsTrigger value="command" className={TRIGGER}>
              <LayoutDashboard aria-hidden className="h-4 w-4" />
              <Tr b={T.command} />
            </TabsTrigger>
            <TabsTrigger value="trust" className={TRIGGER}>
              <ShieldCheck aria-hidden className="h-4 w-4" />
              <Tr b={T.trust} />
            </TabsTrigger>
          </TabsList>
          <Link
            href="/state/brief"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-[13px] font-medium text-gray-200 transition-colors hover:border-cyan-400/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            <FileText aria-hidden className="h-4 w-4 text-cyan-300" />
            <Tr b={T.brief} />
          </Link>
        </div>

        <TabsContent value="command" className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            {top}
            <LiveTicker className="xl:col-span-12" onEvent={onTicker} />
            <DistrictMapPanel
              className="xl:col-span-7"
              index={3}
              filter={filter}
              pulseId={pulse}
              focusIds={focusIds}
              onClearFocus={clearFocus}
            />
            {side}
            {lower}
          </div>
        </TabsContent>

        <TabsContent value="trust" className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0">
          <section className="os-rise relative mb-4 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.025] to-transparent p-4 sm:p-6">
            <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/[0.10] blur-3xl" />
            <div className="relative flex flex-wrap items-center gap-2">
              <span className="inline-flex h-7 items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 text-[12px] tabular-nums text-gray-300">
                <Tr b={WEEK_LABEL} />
              </span>
              <IllustrativeChip />
            </div>
            <h1 className="relative mt-3 text-[26px] font-semibold tracking-tight text-white sm:text-[30px]">
              <Tr b={T.trustTitle} />
            </h1>
            <Tr as="p" b={T.trustSub} className="relative mt-1 block max-w-[70ch] text-[14px] text-gray-400" />
          </section>
          <TrustTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
