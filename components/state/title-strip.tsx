'use client'

import type { CSSProperties, ReactNode } from 'react'
import { Building2, Compass, Landmark, Target, type LucideIcon } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { IllustrativeChip } from '@/components/os/illustrative-chip'
import { Tr } from '@/components/os/tr-text'
import { useDemo } from '@/lib/os/demo-store'
import { useReducedMotion } from '@/lib/ai-sim'
import { WEEK_LABEL } from '@/lib/mock/state'
import type { Bi } from '@/lib/os/i18n'
import type { StateFilter } from '@/components/state/state-data'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Shared panel chrome for every /state card (kept here: one owned file for the frame).
// ---------------------------------------------------------------------------

export interface PanelCardProps {
  title: Bi | string
  subtitle?: Bi | string
  icon?: LucideIcon
  /** Right side of the header (chips, buttons). */
  right?: ReactNode
  children?: ReactNode
  className?: string
  bodyClassName?: string
  id?: string
  /** Accent for the icon tile. */
  accent?: 'cyan' | 'violet' | 'amber' | 'emerald' | 'slate' | 'rose'
  /** Stagger index for the entrance animation (60 ms steps). */
  index?: number
}

const ACCENT: Record<NonNullable<PanelCardProps['accent']>, string> = {
  cyan: 'bg-cyan-400/10 text-cyan-300 ring-cyan-400/25',
  violet: 'bg-violet-400/10 text-violet-300 ring-violet-400/25',
  amber: 'bg-amber-400/10 text-amber-300 ring-amber-400/25',
  emerald: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/25',
  slate: 'bg-slate-400/10 text-slate-300 ring-slate-400/25',
  rose: 'bg-rose-400/10 text-rose-300 ring-rose-400/25',
}

/** Stagger delay for os-rise entrances (respects Lite / reduced motion through the global CSS). */
export function riseStyle(index = 0, step = 60): CSSProperties {
  return { animationDelay: `${Math.max(0, index) * step}ms` }
}

export function PanelCard({
  title,
  subtitle,
  icon: Icon,
  right,
  children,
  className,
  bodyClassName,
  id,
  accent = 'cyan',
  index = 0,
}: PanelCardProps) {
  return (
    <section
      id={id}
      style={riseStyle(index)}
      className={cn(
        'os-rise relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.9)] sm:p-5',
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
      <header className="mb-4 flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {Icon && (
            <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1', ACCENT[accent])}>
              <Icon aria-hidden className="h-[18px] w-[18px]" />
            </span>
          )}
          <div className="min-w-0">
            <Tr as="h2" b={title} className="block text-[15px] font-semibold leading-snug text-white sm:text-base" />
            {subtitle && <Tr as="p" b={subtitle} className="mt-0.5 block text-[12.5px] leading-snug text-gray-400" />}
          </div>
        </div>
        {right && <div className="flex max-w-full shrink-0 flex-wrap items-center gap-2">{right}</div>}
      </header>
      <div className={cn('relative min-w-0 flex-1', bodyClassName)}>{children}</div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Title strip
// ---------------------------------------------------------------------------

const T = {
  title: { en: 'DSTTE Bihar · Placement Readiness Command Centre', hi: 'DSTTE बिहार · प्लेसमेंट तैयारी कमांड सेंटर' },
  prepared: {
    en: 'Prepared for DSTTE, Bihar · concept preview',
    hi: 'DSTTE, बिहार के लिए तैयार · कॉन्सेप्ट प्रीव्यू',
  },
  lede: {
    en: 'Who is interview-ready today, in which district, and what is stopping the rest.',
    hi: 'आज कौन इंटरव्यू के लिए तैयार है, किस ज़िले में, और बाक़ी को क्या रोक रहा है।',
  },
  live: { en: 'Live', hi: 'लाइव' },
  institutions: { en: 'Institutions', hi: 'संस्थान' },
  region: { en: 'Region', hi: 'क्षेत्र' },
  focus: { en: 'Focus', hi: 'फ़ोकस' },
  all: { en: 'All', hi: 'सभी' },
  eng: { en: 'Engineering', hi: 'इंजीनियरिंग' },
  poly: { en: 'Polytechnic', hi: 'पॉलिटेक्निक' },
  whole: { en: 'Whole state', hi: 'पूरा राज्य' },
  north: { en: 'North of Ganga', hi: 'गंगा के उत्तर' },
  south: { en: 'South of Ganga', hi: 'गंगा के दक्षिण' },
  asp: { en: 'Aspirational districts', hi: 'आकांक्षी ज़िले' },
  filterNote: {
    en: 'Filters change the map and the leaderboard. KPI tiles stay state-wide.',
    hi: 'फ़िल्टर से मानचित्र और रैंकिंग बदलती है। KPI टाइल पूरे राज्य की रहती हैं।',
  },
} satisfies Record<string, Bi>

const ITEM =
  'h-8 min-w-0 rounded-lg px-3 text-[12.5px] font-medium text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-0 data-[state=on]:bg-cyan-400/[0.14] data-[state=on]:text-cyan-50 data-[state=on]:shadow-[inset_0_0_0_1px_rgba(34,211,238,0.45)]'

function GroupLabel({ icon: Icon, b }: { icon: LucideIcon; b: Bi }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.12em] text-gray-500">
      <Icon aria-hidden className="h-3.5 w-3.5" />
      <Tr b={b} />
    </span>
  )
}

export interface TitleStripProps {
  filter: StateFilter
  onFilterChange: (f: StateFilter) => void
  showFilters?: boolean
  /** Ask Sarthi box (right column on desktop, below on mobile). */
  aside?: ReactNode
  className?: string
}

export function TitleStrip({ filter, onFilterChange, showFilters = true, aside, className }: TitleStripProps) {
  const { t, lite } = useDemo()
  const reduced = useReducedMotion() || lite
  const set = (patch: Partial<StateFilter>) => onFilterChange({ ...filter, ...patch })

  return (
    <section
      className={cn(
        'os-rise relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.025] to-transparent',
        className,
      )}
    >
      {/* soft glows */}
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-500/[0.12] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 right-[30%] h-72 w-72 rounded-full bg-emerald-500/[0.07] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />

      <div className="relative grid gap-5 p-4 sm:p-6 lg:grid-cols-12 lg:gap-6">
        <div className="flex min-w-0 flex-col lg:col-span-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-7 items-center gap-2 rounded-full bg-emerald-400/10 px-2.5 ring-1 ring-emerald-400/25">
              <span className="relative flex h-2 w-2">
                {!reduced && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <Tr b={T.live} className="text-[12px] font-semibold uppercase tracking-[0.14em] text-emerald-300" />
            </span>
            <span className="inline-flex h-7 items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 text-[12px] font-medium tabular-nums text-gray-300">
              <Tr b={WEEK_LABEL} />
            </span>
            <IllustrativeChip />
          </div>

          <h1 className="mt-4 text-[26px] font-semibold leading-[1.15] tracking-tight text-white sm:text-[32px] xl:text-[36px]">
            <Tr b={T.title} className="bg-gradient-to-r from-white via-white to-cyan-100 bg-clip-text text-transparent" />
          </h1>
          <Tr as="p" b={T.prepared} className="mt-2 block text-[13px] font-medium text-cyan-200/80" />
          <Tr as="p" b={T.lede} className="mt-1.5 block max-w-[60ch] text-[14px] leading-relaxed text-gray-400" />

          {showFilters && (
            <div className="mt-auto pt-5">
              <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <GroupLabel icon={Building2} b={T.institutions} />
                  <ToggleGroup
                    type="single"
                    value={filter.type}
                    onValueChange={(v) => v && set({ type: v as StateFilter['type'] })}
                    aria-label={t(T.institutions)}
                    className="flex-wrap justify-start gap-1 rounded-xl border border-white/10 bg-black/25 p-1"
                  >
                    <ToggleGroupItem value="all" className={ITEM}>
                      <Tr b={T.all} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="GEC" className={ITEM}>
                      <Tr b={T.eng} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="GP" className={ITEM}>
                      <Tr b={T.poly} />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <GroupLabel icon={Compass} b={T.region} />
                  <ToggleGroup
                    type="single"
                    value={filter.region}
                    onValueChange={(v) => v && set({ region: v as StateFilter['region'] })}
                    aria-label={t(T.region)}
                    className="flex-wrap justify-start gap-1 rounded-xl border border-white/10 bg-black/25 p-1"
                  >
                    <ToggleGroupItem value="all" className={ITEM}>
                      <Tr b={T.whole} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="north" className={ITEM}>
                      <Tr b={T.north} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="south" className={ITEM}>
                      <Tr b={T.south} />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <GroupLabel icon={Target} b={T.focus} />
                  <ToggleGroup
                    type="multiple"
                    value={filter.aspirational ? ['asp'] : []}
                    onValueChange={(v) => set({ aspirational: Array.isArray(v) && v.includes('asp') })}
                    aria-label={t(T.asp)}
                    className="justify-start gap-1 rounded-xl border border-white/10 bg-black/25 p-1"
                  >
                    <ToggleGroupItem value="asp" className={cn(ITEM, 'data-[state=on]:bg-amber-400/[0.14] data-[state=on]:text-amber-100 data-[state=on]:shadow-[inset_0_0_0_1px_rgba(251,191,36,0.45)]')}>
                      <Landmark aria-hidden className="h-3.5 w-3.5" />
                      <Tr b={T.asp} />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
              <Tr as="p" b={T.filterNote} className="mt-2.5 block text-[12px] text-gray-500" />
            </div>
          )}
        </div>

        {aside && <div className="min-w-0 lg:col-span-5">{aside}</div>}
      </div>
    </section>
  )
}
