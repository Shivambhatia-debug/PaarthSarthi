'use client'

// /tpo: College T&P Officer console. Batch 2027 KPIs, Overview / Students / Drives / Reports.
// Officer screen: wrapped in OfficerScope (English or हिंदी only; Hinglish maps to English).
// College from ?college= (4 supported; anything else falls back to Purnea CE).

import { useCallback, useMemo, useState } from 'react'
import { AlertTriangle, BadgeIndianRupee, BrainCircuit, CalendarRange, GraduationCap, LayoutDashboard, UserCheck, Users, Activity, FileBarChart2, Target } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KpiTile } from '@/components/os/kpi-tile'
import { Tr } from '@/components/os/tr-text'
import { IllustrativeChip } from '@/components/os/illustrative-chip'
import { OfficerScope } from '@/lib/os/demo-store'
import { useQueryParam } from '@/hooks/use-query-param'
import { batchOf, institutionById } from '@/lib/mock/institutions'
import { drivesForInstitution } from '@/lib/mock/drives'
import { fmtPct, type Bi } from '@/lib/os/i18n'
import type { Institution } from '@/lib/mock/types'
import { TpoHeader } from '@/components/tpo/tpo-header'
import { OverviewTab } from '@/components/tpo/overview-tab'
import { StudentsTab } from '@/components/tpo/students-tab'
import { DrivesTab } from '@/components/tpo/drives-tab'
import { ReportsTab } from '@/components/tpo/reports-tab'
import { DEFAULT_COLLEGE, resolveCollege } from '@/components/tpo/tpo-data'
import { NextStop } from '@/components/os/next-stop'

type TabId = 'overview' | 'students' | 'drives' | 'reports'
const TAB_IDS: TabId[] = ['overview', 'students', 'drives', 'reports']

const TABS: { id: TabId; label: Bi; icon: typeof Users }[] = [
  { id: 'overview', label: { en: 'Overview', hi: 'सारांश' }, icon: LayoutDashboard },
  { id: 'students', label: { en: 'Students', hi: 'छात्र' }, icon: Users },
  { id: 'drives', label: { en: 'Drives', hi: 'ड्राइव' }, icon: CalendarRange },
  { id: 'reports', label: { en: 'Reports', hi: 'रिपोर्ट' }, icon: FileBarChart2 },
]

export default function TpoPage() {
  return (
    <OfficerScope>
      <TpoConsole />
    </OfficerScope>
  )
}

function TpoConsole() {
  const collegeParam = useQueryParam('college')
  const tabParam = useQueryParam('tab')
  const collegeId = resolveCollege(collegeParam)
  const inst: Institution | undefined = institutionById(collegeId) ?? institutionById(DEFAULT_COLLEGE)
  const [tab, setTab] = useState<TabId>(() => (TAB_IDS.includes(tabParam as TabId) ? (tabParam as TabId) : 'overview'))
  const [seen, setSeen] = useState<Record<string, true>>({})
  const markSeen = useCallback(() => setSeen((s) => (s[collegeId] ? s : { ...s, [collegeId]: true })), [collegeId])

  const b = useMemo(() => (inst ? batchOf(inst) : null), [inst])
  const upcoming = useMemo(() => drivesForInstitution(inst?.id).length, [inst])

  if (!inst || !b) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-16 text-center text-[14px] text-gray-400 sm:px-6">
        <Tr b={{ en: 'College not found.', hi: 'कॉलेज नहीं मिला।' }} />
      </div>
    )
  }

  const pct = (n: number, d: number) => fmtPct(d > 0 ? (n / d) * 100 : 0, 0)
  const priDelta = Math.round((b.pri - b.priBaseline) * 10) / 10
  const priDecimals = Number.isInteger(Math.round(b.pri * 10) / 10) ? 0 : 1

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-5 sm:px-6 sm:pt-6">
      <TpoHeader inst={inst} b={b} />

      {/* KPI tiles (fix 23): all from batchOf(inst), tagged illustrative */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Tr b={{ en: 'Batch 2027 · final year', hi: 'बैच 2027 · अंतिम वर्ष' }} className="text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-400" />
        <IllustrativeChip />
      </div>
      <section aria-label="Batch 2027 KPIs" className="mt-2 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-4">
        <KpiTile
          key={`fy-${inst.id}`}
          label={{ en: 'Final-year', hi: 'अंतिम वर्ष' }}
          value={b.finalYear}
          icon={GraduationCap}
        />
        <KpiTile
          key={`on-${inst.id}`}
          label={{ en: 'Onboarded', hi: 'ऑनबोर्ड' }}
          value={b.onboarded}
          sub={{ en: `${pct(b.onboarded, b.finalYear)} of final-year`, hi: `अंतिम वर्ष का ${pct(b.onboarded, b.finalYear)}` }}
          icon={UserCheck}
        />
        <KpiTile
          key={`wa-${inst.id}`}
          label={{ en: 'Weekly active', hi: 'साप्ताहिक सक्रिय' }}
          value={b.weeklyActive}
          sub={`(${pct(b.weeklyActive, b.onboarded)})`}
          icon={Activity}
        />
        <KpiTile
          key={`pri-${inst.id}`}
          label={{ en: 'Avg PRI', hi: 'औसत PRI' }}
          value={b.pri}
          decimals={priDecimals}
          format={priDecimals ? 'decimal' : 'int'}
          delta={priDelta}
          deltaDecimals={1}
          deltaLabel={{ en: 'since the diagnostic', hi: 'डायग्नोस्टिक से' }}
          icon={BrainCircuit}
          tone="ai"
        />
        <KpiTile
          key={`ir-${inst.id}`}
          label={{ en: 'Interview-ready', hi: 'इंटरव्यू के लिए तैयार' }}
          value={b.interviewReady}
          sub={{ en: `${pct(b.interviewReady, b.onboarded)} of onboarded`, hi: `ऑनबोर्ड का ${pct(b.interviewReady, b.onboarded)}` }}
          icon={Target}
          tone="good"
        />
        <KpiTile
          key={`ar-${inst.id}`}
          label={{ en: 'At-risk', hi: 'जोखिम में' }}
          value={b.atRisk}
          icon={AlertTriangle}
          tone="warn"
        />
        <KpiTile
          key={`dr-${inst.id}`}
          label={{ en: 'Upcoming drives', hi: 'आगामी ड्राइव' }}
          value={upcoming}
          icon={CalendarRange}
        />
        <KpiTile
          key={`of-${inst.id}`}
          label={{ en: 'Offers', hi: 'ऑफ़र' }}
          value={b.offers}
          icon={BadgeIndianRupee}
          tone="good"
        />
      </section>

      <Tabs value={tab} onValueChange={(v) => setTab(TAB_IDS.includes(v as TabId) ? (v as TabId) : 'overview')} className="mt-6">
        <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex h-11 w-max min-w-full gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1 sm:min-w-0">
            {TABS.map(({ id, label, icon: Icon }) => (
              <TabsTrigger
                key={id}
                value={id}
                className="h-9 flex-1 gap-1.5 rounded-lg px-3.5 text-[13.5px] font-medium text-gray-400 transition-colors hover:text-gray-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/25 data-[state=active]:via-cyan-400/15 data-[state=active]:to-emerald-400/20 data-[state=active]:text-white data-[state=active]:shadow-[inset_0_0_0_1px_rgba(34,211,238,0.3)] sm:flex-none"
              >
                <Icon aria-hidden className="h-4 w-4" />
                <Tr b={label} />
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-4 focus-visible:outline-none focus-visible:ring-0">
          <OverviewTab key={inst.id} collegeId={inst.id} inst={inst} b={b} firstView={!seen[inst.id]} onSeen={markSeen} />
        </TabsContent>
        <TabsContent value="students" className="mt-4 focus-visible:outline-none focus-visible:ring-0">
          <StudentsTab key={inst.id} collegeId={inst.id} inst={inst} b={b} />
        </TabsContent>
        <TabsContent value="drives" className="mt-4 focus-visible:outline-none focus-visible:ring-0">
          <DrivesTab key={inst.id} collegeId={inst.id} inst={inst} b={b} />
        </TabsContent>
        <TabsContent value="reports" className="mt-4 focus-visible:outline-none focus-visible:ring-0">
          <ReportsTab key={inst.id} collegeId={inst.id} inst={inst} b={b} />
        </TabsContent>
      </Tabs>
      <NextStop href="/state/" label={{ en: 'DSTTE State view', hi: 'DSTTE राज्य दृश्य' }} sub={{ en: 'Every college, one dashboard', hi: 'हर कॉलेज, एक डैशबोर्ड' }} />
    </div>
  )
}
