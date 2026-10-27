'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Info, Lock, Star, Trophy } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SimulatedNotice } from '@/components/os/illustrative-chip'
import { Sparkline } from '@/components/os/sparkline'
import { Tr } from '@/components/os/tr-text'
import { useDemo } from '@/lib/os/demo-store'
import { fmtNum, type Bi } from '@/lib/os/i18n'
import { bandClasses } from '@/lib/os/scoring'
import { INSTITUTIONS, pseudonymFor } from '@/lib/mock/institutions'
import { districtById } from '@/lib/mock/districts'
import type { Institution } from '@/lib/mock/types'
import { PanelCard } from '@/components/state/title-strip'
import { filterKey, filterLabel, filterPredicate, isDefaultFilter, priGain, signed, type StateFilter } from '@/components/state/state-data'
import { cn } from '@/lib/utils'

const T = {
  title: { en: 'College leaderboard', hi: 'कॉलेज लीडरबोर्ड' },
  sub: {
    en: 'Ranked by simulated PRI · lower half shown under pseudonyms',
    hi: 'सिम्युलेटेड PRI के क्रम में · निचला आधा हिस्सा छद्म नाम से',
  },
  eng: { en: 'Engineering', hi: 'इंजीनियरिंग' },
  poly: { en: 'Polytechnic', hi: 'पॉलिटेक्निक' },
  rank: { en: '#', hi: '#' },
  inst: { en: 'Institution', hi: 'संस्थान' },
  where: { en: 'District / division', hi: 'ज़िला / प्रमंडल' },
  pri: { en: 'PRI', hi: 'PRI' },
  delta: { en: 'Δ baseline', hi: 'Δ बेसलाइन' },
  ready: { en: 'Interview-ready', hi: 'इंटरव्यू-तैयार' },
  active: { en: 'Weekly active', hi: 'साप्ताहिक सक्रिय' },
  tpo: { en: 'TPO activity', hi: 'TPO गतिविधि' },
  stars: { en: 'Stars', hi: 'स्टार' },
  starsTip: { en: 'TASK-style stars · readiness-based, simulated', hi: 'TASK-शैली स्टार · तैयारी पर आधारित, सिम्युलेटेड' },
  trend: { en: 'Trend', hi: 'रुझान' },
  pseudo: { en: 'Pseudonymised (lower half)', hi: 'छद्म नाम (निचला आधा)' },
  division: { en: 'division', hi: 'प्रमंडल' },
  empty: { en: 'No institutions of this type in the current filter.', hi: 'मौजूदा फ़िल्टर में इस प्रकार का कोई संस्थान नहीं।' },
  count: { en: 'institutions', hi: 'संस्थान' },
} satisfies Record<string, Bi>

type SortKey = 'rank' | 'delta' | 'ready' | 'active' | 'tpo' | 'stars'
type Kind = 'GEC' | 'GP'

interface Row {
  inst: Institution
  rank: number
  named: boolean
  delta: number
  ready: number
  active: number
}

function pct(part: number, whole: number) {
  return whole > 0 ? (part / whole) * 100 : 0
}

const SORT_VALUE: Record<SortKey, (r: Row) => number> = {
  rank: (r) => -r.rank,
  delta: (r) => r.delta,
  ready: (r) => r.ready,
  active: (r) => r.active,
  tpo: (r) => r.inst.tpoActivity,
  stars: (r) => r.inst.stars,
}

export function CollegeLeaderboard({ filter, className, index = 0 }: { filter: StateFilter; className?: string; index?: number }) {
  const { t, lang } = useDemo()
  const [kind, setKind] = useState<Kind>(filter.type === 'GP' ? 'GP' : 'GEC')
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: 'rank', desc: true })
  const key = filterKey(filter)

  // Follow the title-strip type filter.
  useEffect(() => {
    if (filter.type === 'GEC' || filter.type === 'GP') setKind(filter.type)
  }, [filter.type])

  const rows = useMemo<Row[]>(() => {
    const pred = filterPredicate(filter)
    const list = INSTITUTIONS.filter((i) => i.type === kind && (!pred || pred(i))).sort(
      (a, b) => b.pri - a.pri || a.id.localeCompare(b.id),
    )
    const namedUpTo = Math.floor(list.length / 2)
    return list.map((inst, i) => ({
      inst,
      rank: i + 1,
      named: i + 1 <= namedUpTo,
      delta: priGain(inst),
      ready: pct(inst.interviewReady, inst.onboarded),
      active: pct(inst.weeklyActive, inst.onboarded),
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, kind])

  const sorted = useMemo(() => {
    const f = SORT_VALUE[sort.key]
    const dir = sort.desc ? -1 : 1
    return [...rows].sort((a, b) => dir * (f(a) - f(b)) || a.rank - b.rank)
  }, [rows, sort])

  const toggleSort = (k: SortKey) =>
    setSort((s) => (s.key === k ? { key: k, desc: !s.desc } : { key: k, desc: true }))

  const head = ({ k, label, className: cls, tip }: { k?: SortKey; label: Bi; className?: string; tip?: Bi }) => {
    const active = k && sort.key === k
    const Icon = !k ? null : active ? (sort.desc ? ArrowDown : ArrowUp) : ArrowUpDown
    return (
      <th scope="col" className={cn('whitespace-nowrap px-2.5 py-2.5 text-left text-[12px] font-medium text-gray-400', cls)}>
        <span className="inline-flex items-center gap-1">
          {k ? (
            <button
              type="button"
              onClick={() => toggleSort(k)}
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-1 py-0.5 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60',
                active && 'text-cyan-200',
              )}
            >
              <Tr b={label} />
              {Icon && <Icon aria-hidden className="h-3 w-3" />}
            </button>
          ) : (
            <Tr b={label} />
          )}
          {tip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" aria-label={t(tip)} className="rounded text-gray-500 hover:text-gray-200">
                  <Info aria-hidden className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <Tr b={tip} />
              </TooltipContent>
            </Tooltip>
          )}
        </span>
      </th>
    )
  }

  return (
    <PanelCard
      index={index}
      className={className}
      icon={Trophy}
      accent="emerald"
      title={T.title}
      subtitle={T.sub}
      right={
        <Tabs value={kind} onValueChange={(v) => setKind(v === 'GP' ? 'GP' : 'GEC')}>
          <TabsList className="h-9 rounded-xl border border-white/10 bg-black/30 p-1">
            <TabsTrigger
              value="GEC"
              className="h-7 rounded-lg px-3 text-[12.5px] text-gray-400 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white"
            >
              <Tr b={T.eng} />
            </TabsTrigger>
            <TabsTrigger
              value="GP"
              className="h-7 rounded-lg px-3 text-[12.5px] text-gray-400 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white"
            >
              <Tr b={T.poly} />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      }
    >
      <SimulatedNotice className="mb-3" />
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-gray-500">
        <span className="tabular-nums">
          {rows.length} <Tr b={T.count} />
        </span>
        {!isDefaultFilter(filter) && <Tr b={filterLabel(filter)} className="text-cyan-200/80" />}
        <span className="inline-flex items-center gap-1">
          <Lock aria-hidden className="h-3 w-3" />
          <Tr b={T.pseudo} />
        </span>
      </div>

      {rows.length === 0 ? (
        <Tr as="p" b={T.empty} className="block rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center text-[13px] text-gray-500" />
      ) : (
        <div className="max-h-[420px] overflow-auto rounded-xl border border-white/10 [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
          <table className="w-full min-w-[920px] border-collapse text-[13px]">
            <thead className="sticky top-0 z-10 bg-[#121821]/95 backdrop-blur">
              <tr className="border-b border-white/10">
                {head({ k: "rank", label: T.rank, className: "w-12 pl-3" })}
                {head({ label: T.inst })}
                {head({ label: T.where })}
                {head({ k: "rank", label: T.pri })}
                {head({ k: "delta", label: T.delta })}
                {head({ k: "ready", label: T.ready })}
                {head({ k: "active", label: T.active })}
                {head({ k: "tpo", label: T.tpo })}
                {head({ k: "stars", label: T.stars, tip: T.starsTip })}
                {head({ label: T.trend, className: "pr-3" })}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => {
                const i = r.inst
                const d = districtById(i.districtId)
                const color = bandClasses(i.pri).hex
                return (
                  <tr key={i.id} className="border-b border-white/[0.05] transition-colors last:border-0 hover:bg-white/[0.03]">
                    <td className="px-2.5 py-2 pl-3 tabular-nums text-gray-500">{r.rank}</td>
                    <td className="max-w-[300px] px-2.5 py-2">
                      {r.named ? (
                        <span className="block truncate font-medium text-white" title={i.name}>
                          {i.name}
                        </span>
                      ) : (
                        <span className="inline-flex max-w-full items-center gap-1.5 text-gray-300">
                          <Lock aria-hidden className="h-3 w-3 shrink-0 text-gray-500" />
                          <span
                            lang={lang === 'hi' ? 'hi' : 'en'}
                            className={cn('truncate', lang === 'hi' && 'font-deva')}
                          >
                            {pseudonymFor(i, lang)}
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-2.5 py-2 text-gray-400">
                      {d ? (
                        r.named ? (
                          <Tr b={{ en: d.name, hi: d.nameHi }} />
                        ) : (
                          <Tr b={{ en: `${d.division} division`, hi: `${d.divisionHi} प्रमंडल` }} />
                        )
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-2.5 py-2">
                      <span className="text-[14px] font-semibold tabular-nums" style={{ color }}>
                        {fmtNum(i.pri)}
                      </span>
                    </td>
                    <td className={cn('px-2.5 py-2 tabular-nums', r.delta >= 0 ? 'text-emerald-300' : 'text-rose-300')}>
                      {signed(r.delta)}
                    </td>
                    <td className="px-2.5 py-2 tabular-nums text-gray-200">{fmtNum(r.ready, 0)}%</td>
                    <td className="px-2.5 py-2 tabular-nums text-gray-200">{fmtNum(r.active, 0)}%</td>
                    <td className="px-2.5 py-2">
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 w-14 overflow-hidden rounded-full bg-white/[0.07]">
                          <span
                            className={cn(
                              'block h-full rounded-full',
                              i.tpoActivity >= 60 ? 'bg-emerald-400/80' : i.tpoActivity >= 35 ? 'bg-amber-400/80' : 'bg-rose-400/80',
                            )}
                            style={{ width: `${Math.max(4, Math.min(100, i.tpoActivity))}%` }}
                          />
                        </span>
                        <span className="tabular-nums text-gray-400">{Math.round(i.tpoActivity)}</span>
                      </span>
                    </td>
                    <td className="px-2.5 py-2" title={t(T.starsTip)}>
                      <span className="inline-flex items-center gap-0.5" aria-label={`${i.stars}/5`}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            aria-hidden
                            className={cn('h-3 w-3', n <= i.stars ? 'fill-amber-300 text-amber-300' : 'text-white/15')}
                          />
                        ))}
                      </span>
                    </td>
                    <td className="px-2.5 py-2 pr-3">
                      <Sparkline data={i.priTrend} width={72} height={24} stroke={color} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </PanelCard>
  )
}
