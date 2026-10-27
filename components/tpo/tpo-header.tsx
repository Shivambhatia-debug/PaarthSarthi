'use client'

// College T&P console header, plus small UI helpers shared by the /tpo tab components
// (TpoCard shell, button styles, useAiDelay for "thinking" pauses that respect fast-forward and Lite).

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { BadgeCheck, Building2, GraduationCap, MapPin, UserCog, type LucideIcon } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { IllustrativeChip } from '@/components/os/illustrative-chip'
import { Tr } from '@/components/os/tr-text'
import { useDemo, useDemoEvent } from '@/lib/os/demo-store'
import { setQueryParam } from '@/hooks/use-query-param'
import { institutionById, TPO_SUPPORTED_COLLEGES } from '@/lib/mock/institutions'
import { DISTRICT_GEO } from '@/lib/mock/geo'
import type { Bi } from '@/lib/os/i18n'
import type { BatchMetrics, Institution } from '@/lib/mock/types'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Shared styles (literal class strings so Tailwind generates them)
// ---------------------------------------------------------------------------
export const btnAi =
  'inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 px-3.5 text-[13px] font-semibold text-white shadow-[0_8px_24px_-10px_rgba(34,211,238,0.8)] transition-[filter,opacity,transform] hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 disabled:pointer-events-none disabled:opacity-40'

export const btnGhost =
  'inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-white/10 bg-white/[0.04] px-3 text-[13px] font-medium text-gray-200 transition-colors hover:border-white/25 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 disabled:pointer-events-none disabled:opacity-40'

export const btnSmall =
  'inline-flex h-8 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-white/10 bg-white/[0.04] px-2.5 text-[12.5px] font-medium text-gray-200 transition-colors hover:border-white/25 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 disabled:pointer-events-none disabled:opacity-40'

/** Dark recharts tooltip box. */
export const chartTipClass = 'rounded-lg border border-white/10 bg-[#11161f]/95 px-3 py-2 text-[12px] text-gray-200 shadow-xl backdrop-blur'

// ---------------------------------------------------------------------------
// Card shell
// ---------------------------------------------------------------------------
export interface TpoCardProps {
  title?: Bi | string
  sub?: Bi | string
  icon?: LucideIcon
  actions?: ReactNode
  children?: ReactNode
  className?: string
  /** Accent for the icon tile. */
  tone?: 'default' | 'ai' | 'warn' | 'good'
  id?: string
}

const ICON_TONE: Record<NonNullable<TpoCardProps['tone']>, string> = {
  default: 'bg-white/[0.05] text-gray-300 ring-white/10',
  ai: 'bg-cyan-400/10 text-cyan-300 ring-cyan-400/25',
  warn: 'bg-amber-400/10 text-amber-300 ring-amber-400/25',
  good: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/25',
}

export function TpoCard({ title, sub, icon: Icon, actions, children, className, tone = 'default', id }: TpoCardProps) {
  return (
    <section
      id={id}
      className={cn(
        'relative min-w-0 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/[0.14] sm:p-5',
        className,
      )}
    >
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
          <div className="flex min-w-0 items-start gap-2.5">
            {Icon && (
              <span className={cn('mt-px grid h-8 w-8 shrink-0 place-items-center rounded-lg ring-1', ICON_TONE[tone])}>
                <Icon aria-hidden className="h-4 w-4" />
              </span>
            )}
            <div className="min-w-0">
              {title && <Tr as="h2" b={title} className="block text-[15px] font-semibold leading-snug text-white" />}
              {sub && <Tr as="p" b={sub} className="mt-0.5 block text-[12.5px] leading-snug text-gray-400" />}
            </div>
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

// ---------------------------------------------------------------------------
// useAiDelay: a "Sarthi AI is thinking" pause before an action lands.
// Fast-forward / finish complete it at once (safe to fire twice); Lite shortens it; unmount cancels it.
// ---------------------------------------------------------------------------
export function useAiDelay() {
  const { state } = useDemo()
  const lite = !!state.lite
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pending = useRef<(() => void) | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    const fn = pending.current
    pending.current = null
    setBusy(null)
    fn?.()
  }, [])

  const run = useCallback(
    (key: string, ms: number, fn: () => void) => {
      if (timer.current) clearTimeout(timer.current)
      pending.current = fn
      setBusy(key)
      timer.current = setTimeout(flush, lite ? Math.min(ms, 250) : ms)
    },
    [flush, lite],
  )

  const skip = useCallback(() => {
    if (pending.current) flush()
  }, [flush])
  useDemoEvent('fastforward', skip)
  useDemoEvent('finish', skip)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
      pending.current = null
    },
    [],
  )

  return { busy, run, skip }
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
const UI = {
  console: { en: 'College T&P Console', hi: 'कॉलेज T&P कंसोल' },
  batch: { en: 'Batch 2027', hi: 'बैच 2027' },
  nodal: { en: 'Nodal officer (NASSCOM FSP MoU): TPO (demo user)', hi: 'नोडल अधिकारी (NASSCOM FSP MoU): TPO (डेमो उपयोगकर्ता)' },
  switchCollege: { en: 'Switch college (4 demo colleges)', hi: 'कॉलेज बदलें (4 डेमो कॉलेज)' },
  engineering: { en: 'Engineering college', hi: 'इंजीनियरिंग कॉलेज' },
  polytechnic: { en: 'Polytechnic', hi: 'पॉलिटेक्निक' },
  aiProgram: { en: 'B.Tech AI launch 2026', hi: 'बी.टेक AI शुरुआत 2026' },
} satisfies Record<string, Bi>

function districtLine(inst: Institution): Bi {
  const g = DISTRICT_GEO.find((d) => d.id === inst.districtId)
  if (!g) return { en: '', hi: '' }
  return { en: `${g.name} district · ${g.division} division`, hi: `${g.nameHi} ज़िला · ${g.divisionHi} प्रमंडल` }
}

export interface TpoHeaderProps {
  inst: Institution
  b: BatchMetrics
}

export function TpoHeader({ inst }: TpoHeaderProps) {
  const { t } = useDemo()
  const colleges = TPO_SUPPORTED_COLLEGES.map((id) => institutionById(id)).filter((x): x is Institution => !!x)

  return (
    <header className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent px-4 py-5 sm:px-6 sm:py-6">
      <div aria-hidden className="pointer-events-none absolute -left-28 -top-28 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-emerald-500/[0.08] blur-3xl" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-blue-400/0 via-cyan-300/60 to-emerald-400/0" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3.5 sm:gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500/30 via-cyan-400/15 to-emerald-400/25 ring-1 ring-cyan-300/30 sm:h-12 sm:w-12">
            <Building2 aria-hidden className="h-5 w-5 text-cyan-100 sm:h-6 sm:w-6" />
          </span>
          <div className="min-w-0">
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-cyan-300/90">
              <Tr b={UI.console} />
              <span aria-hidden className="text-gray-600">
                ·
              </span>
              <span lang="hi" className="font-deva text-[13px] font-medium normal-case tracking-normal text-gray-300">
                प्रशिक्षण एवं प्लेसमेंट प्रकोष्ठ
              </span>
            </p>
            <h1 className="mt-1.5 text-[22px] font-semibold leading-tight tracking-tight text-white sm:text-[28px]">{inst.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[12.5px]">
              <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 font-semibold text-cyan-200">
                <GraduationCap aria-hidden className="h-3.5 w-3.5" />
                <Tr b={UI.batch} />
              </span>
              <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 text-gray-300">
                <MapPin aria-hidden className="h-3.5 w-3.5 text-gray-400" />
                <Tr b={districtLine(inst)} />
              </span>
              <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 text-gray-300">
                <Tr b={inst.type === 'GEC' ? UI.engineering : UI.polytechnic} />
              </span>
              {inst.aiProgram2026 && (
                <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-400/10 px-2.5 text-violet-200">
                  <BadgeCheck aria-hidden className="h-3.5 w-3.5" />
                  <Tr b={UI.aiProgram} />
                </span>
              )}
            </div>
            <p className="mt-2.5 flex items-start gap-1.5 text-[12.5px] leading-snug text-gray-400">
              <UserCog aria-hidden className="mt-px h-3.5 w-3.5 shrink-0 text-gray-500" />
              <Tr b={UI.nodal} />
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center lg:w-auto lg:flex-col lg:items-end">
          <Select value={inst.id} onValueChange={(id) => setQueryParam('college', id)}>
            <SelectTrigger
              aria-label={t(UI.switchCollege)}
              className="h-11 w-full justify-start gap-2 rounded-xl border-white/15 bg-[#0b0f16]/80 px-3 text-[13.5px] font-medium text-gray-100 shadow-[0_0_0_1px_rgba(34,211,238,0.06)] hover:border-cyan-300/40 focus:ring-cyan-300/40 focus:ring-offset-0 sm:w-[300px]"
            >
              <Building2 aria-hidden className="h-4 w-4 shrink-0 text-cyan-300" />
              <SelectValue className="min-w-0 flex-1 text-left">{inst.short}</SelectValue>
            </SelectTrigger>
            <SelectContent className="z-[100] border-white/10 bg-[#11161f] text-gray-100">
              {colleges.map((c) => {
                const d = districtLine(c)
                return (
                  <SelectItem key={c.id} value={c.id} className="cursor-pointer py-2 focus:bg-white/[0.07] focus:text-white">
                    <span className="flex flex-col">
                      <span className="text-[13.5px] font-medium">{c.short}</span>
                      <Tr b={d} className="text-[12px] text-gray-400" />
                    </span>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <IllustrativeChip className="self-start sm:self-auto lg:self-end" />
        </div>
      </div>
    </header>
  )
}
