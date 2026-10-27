'use client'

// Drives tab: upcoming drives for the college as a LIST grouped by stage (not a Kanban, fix 37),
// "New drive from JD" (JdShortlistDialog), the bilingual DriveNotice and the PoolDriveBuilder.

import { useMemo, useState } from 'react'
import { CalendarDays, CalendarRange, Layers, Wand2 } from 'lucide-react'
import { Tr } from '@/components/os/tr-text'
import { useDemo } from '@/lib/os/demo-store'
import { drivesForInstitution } from '@/lib/mock/drives'
import { blueprintById } from '@/lib/mock/blueprints'
import { institutionById } from '@/lib/mock/institutions'
import { fmtDate, fmtIN, type Bi } from '@/lib/os/i18n'
import type { BatchMetrics, Drive, DriveStage, DriveTier, Institution } from '@/lib/mock/types'
import { cn } from '@/lib/utils'
import { TpoCard, btnAi } from '@/components/tpo/tpo-header'
import { JdShortlistDialog } from '@/components/tpo/jd-shortlist-dialog'
import { PoolDriveBuilder } from '@/components/tpo/pool-drive-builder'
import { DriveNotice } from '@/components/tpo/drive-notice'

const UI = {
  title: { en: 'Upcoming drives · Batch 2027', hi: 'आगामी ड्राइव · बैच 2027' },
  sub: { en: 'Grouped by stage. Select a drive to draft its notice.', hi: 'चरण के अनुसार। सूचना बनाने के लिए ड्राइव चुनें।' },
  newJd: { en: 'New drive from JD', hi: 'JD से नई ड्राइव' },
  eligible: { en: 'eligible', hi: 'पात्र' },
  ready: { en: 'ready', hi: 'तैयार' },
  empty: {
    en: 'No upcoming drives match this college yet. Create one from a JD.',
    hi: 'इस कॉलेज के लिए अभी कोई आगामी ड्राइव नहीं। JD से एक बनाएँ।',
  },
} satisfies Record<string, Bi>

const STAGES: { id: DriveStage; label: Bi; dot: string }[] = [
  { id: 'Announced', label: { en: 'Announced', hi: 'घोषित' }, dot: 'bg-blue-400' },
  { id: 'Registration', label: { en: 'Registration open', hi: 'पंजीकरण खुला' }, dot: 'bg-cyan-400' },
  { id: 'Assessment', label: { en: 'Assessment', hi: 'मूल्यांकन' }, dot: 'bg-violet-400' },
  { id: 'Interview', label: { en: 'Interviews', hi: 'इंटरव्यू' }, dot: 'bg-amber-400' },
  { id: 'Offer', label: { en: 'Offers', hi: 'ऑफ़र' }, dot: 'bg-emerald-400' },
]

const TIER: Record<DriveTier, { label: Bi; cls: string }> = {
  'Day-1': { label: { en: 'Day-1', hi: 'डे-1' }, cls: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200' },
  Dream: { label: { en: 'Dream', hi: 'ड्रीम' }, cls: 'border-violet-400/30 bg-violet-400/10 text-violet-200' },
  Regular: { label: { en: 'Regular', hi: 'नियमित' }, cls: 'border-white/15 bg-white/[0.05] text-gray-300' },
  Core: { label: { en: 'Core', hi: 'कोर' }, cls: 'border-amber-400/30 bg-amber-400/10 text-amber-200' },
}

export interface DrivesTabProps {
  collegeId: string
  inst: Institution
  b: BatchMetrics
}

export function DrivesTab({ collegeId, inst, b }: DrivesTabProps) {
  const { lang } = useDemo()
  const ol: 'en' | 'hi' = lang === 'hi' ? 'hi' : 'en'
  const drives = useMemo(() => drivesForInstitution(collegeId), [collegeId])
  const groups = useMemo(
    () =>
      STAGES.map((s) => ({
        ...s,
        items: drives.filter((d) => d.stage === s.id).sort((x, y) => x.date.localeCompare(y.date)),
      })).filter((g) => g.items.length > 0),
    [drives],
  )
  const [selId, setSelId] = useState<string | null>(null)
  const earliest = useMemo(() => [...drives].sort((x, y) => x.date.localeCompare(y.date))[0], [drives])
  const selected = drives.find((d) => d.id === selId) ?? earliest
  const [jdOpen, setJdOpen] = useState(false)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <TpoCard
        title={UI.title}
        sub={UI.sub}
        icon={CalendarRange}
        tone="ai"
        className="lg:col-span-7"
        actions={
          <button type="button" onClick={() => setJdOpen(true)} className={btnAi}>
            <Wand2 aria-hidden className="h-4 w-4" />
            <Tr b={UI.newJd} />
          </button>
        }
      >
        {groups.length === 0 ? (
          <Tr as="p" b={UI.empty} className="rounded-lg border border-dashed border-white/10 px-4 py-6 text-center text-[13px] text-gray-400" />
        ) : (
          <div className="space-y-4">
            {groups.map((g) => (
              <section key={g.id}>
                <h3 className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                  <span aria-hidden className={cn('h-2 w-2 rounded-full', g.dot)} />
                  <Tr b={g.label} />
                  <span className="rounded-full bg-white/[0.06] px-1.5 py-px text-[12px] font-medium normal-case tracking-normal text-gray-400">
                    {g.items.length}
                  </span>
                </h3>
                <ul className="space-y-2">
                  {g.items.map((d) => (
                    <li key={d.id}>
                      <DriveRow d={d} lang={ol} active={selected?.id === d.id} onSelect={() => setSelId(d.id)} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </TpoCard>

      <div className="min-w-0 lg:col-span-5">
        <DriveNotice drive={selected} inst={inst} />
      </div>

      <PoolDriveBuilder collegeId={collegeId} className="lg:col-span-12" />

      <JdShortlistDialog key={collegeId} collegeId={collegeId} inst={inst} b={b} open={jdOpen} onOpenChange={setJdOpen} />
    </div>
  )
}

function DriveRow({ d, lang, active, onSelect }: { d: Drive; lang: 'en' | 'hi'; active: boolean; onSelect: () => void }) {
  const bp = blueprintById(d.blueprintId)
  const host = institutionById(d.hostInstitutionId)
  const tier = TIER[d.tier] ?? TIER.Regular
  const pct = d.eligibleCount > 0 ? Math.round((d.readyCount / d.eligibleCount) * 100) : 0
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        'group grid w-full grid-cols-1 gap-3 rounded-lg border px-3 py-3 text-left transition-colors sm:grid-cols-[1fr_auto] sm:items-center',
        active ? 'border-cyan-400/40 bg-cyan-400/[0.06] shadow-[0_0_0_1px_rgba(34,211,238,0.12)]' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]',
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <Tr b={d.title} className="mr-1 text-[14px] font-medium leading-snug text-white" />
          <span className={cn('rounded-full border px-2 py-px text-[12px] font-medium', tier.cls)}>
            <Tr b={tier.label} />
          </span>
          {d.pool && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-px text-[12px] font-medium text-emerald-200">
              <Layers aria-hidden className="h-3 w-3" />
              <Tr b={{ en: `Pool · ${d.institutionIds.length} institutions`, hi: `पूल · ${d.institutionIds.length} संस्थान` }} />
            </span>
          )}
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12.5px] text-gray-400">
          <span className="inline-flex items-center gap-1">
            <CalendarDays aria-hidden className="h-3.5 w-3.5 text-gray-500" />
            {fmtDate(d.date, lang)}
          </span>
          <span aria-hidden className="text-gray-600">
            ·
          </span>
          <span className="min-w-0 truncate">{bp.label}</span>
          {host && (
            <>
              <span aria-hidden className="text-gray-600">
                ·
              </span>
              <span>{host.short}</span>
            </>
          )}
        </p>
      </div>
      <div className="flex items-center gap-3 sm:justify-end">
        <div className="text-[12.5px] tabular-nums">
          <span className="font-semibold text-gray-100">{fmtIN(d.eligibleCount)}</span>{' '}
          <Tr b={UI.eligible} className="text-gray-500" />
          <span className="mx-1.5 text-gray-600">·</span>
          <span className="font-semibold text-emerald-300">{fmtIN(d.readyCount)}</span> <Tr b={UI.ready} className="text-gray-500" />
        </div>
        <div className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-white/[0.07]" title={`${pct}%`}>
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </button>
  )
}
