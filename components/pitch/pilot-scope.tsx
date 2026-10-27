'use client'

/* Pilot scope: the GECs launching B.Tech AI / M&C in 2026-27 (verify list) plus 5 polytechnics,
 * highlighted on the Bihar tile map. Lists are derived from lib/mock (never typed). */

import { useMemo } from 'react'
import { Building2, GraduationCap, MapPinned, School } from 'lucide-react'
import { BiharTileMap } from '@/components/os/bihar-tile-map'
import { Tr } from '@/components/os/tr-text'
import { useLang } from '@/lib/os/demo-store'
import { tr, type Bi } from '@/lib/os/i18n'
import { DISTRICT_GEO } from '@/lib/mock/geo'
import { INSTITUTIONS, institutionById } from '@/lib/mock/institutions'
import { districtPriMap } from '@/lib/mock/districts'
import type { Institution } from '@/lib/mock/types'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Scope data (shared with the leave-behind)
// ---------------------------------------------------------------------------

/** Polytechnic districts in the pilot (one district polytechnic each). */
export const PILOT_POLY_DISTRICTS = ['muzaffarpur', 'gaya', 'purnia', 'bhagalpur', 'patna'] as const

/** GECs launching B.Tech AI / M&C in 2026-27 (indicative; verify). */
export const PILOT_GECS: Institution[] = INSTITUTIONS.filter((i) => i.aiProgram2026)

export const PILOT_POLYS: Institution[] = PILOT_POLY_DISTRICTS.map((d) => institutionById(`gp-${d}`)).filter(
  (i): i is Institution => !!i,
)

export const PILOT_DISTRICTS: string[] = Array.from(
  new Set<string>([...PILOT_GECS.map((i) => i.districtId), ...PILOT_POLY_DISTRICTS]),
)

/** Optional school add-on with the Education Department. */
export const PILOT_SCHOOLS = { count: 10, districts: ['purnia', 'gaya', 'muzaffarpur'] } as const

const GEO = new Map(DISTRICT_GEO.map((g) => [g.id, g] as const))

export function districtName(id: string, lang: 'en' | 'hi'): string {
  const g = GEO.get(id)
  if (!g) return id
  return lang === 'hi' ? g.nameHi : g.name
}

function schoolDistricts(lang: 'en' | 'hi'): string {
  return PILOT_SCHOOLS.districts.map((d) => districtName(d, lang)).join(', ')
}

export const SCOPE_SUMMARY: Bi = {
  en: `${PILOT_GECS.length} GECs launching B.Tech AI / M&C + ${PILOT_POLYS.length} polytechnics`,
  hi: `B.Tech AI / M&C शुरू करने वाले ${PILOT_GECS.length} GEC + ${PILOT_POLYS.length} पॉलिटेक्निक`,
}

export const SCHOOLS_CHIP: Bi = {
  en: `Optional: ${PILOT_SCHOOLS.count} Govt +2 schools with Education Dept (${schoolDistricts('en')})`,
  hi: `वैकल्पिक: शिक्षा विभाग के साथ ${PILOT_SCHOOLS.count} सरकारी +2 स्कूल (${schoolDistricts('hi')})`,
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const TITLE: Bi = { en: 'Pilot scope', hi: 'पायलट का दायरा' }
const GEC_H: Bi = {
  en: 'Engineering colleges · B.Tech AI / M&C from 2026-27',
  hi: 'इंजीनियरिंग कॉलेज · 2026-27 से B.Tech AI / M&C',
}
const POLY_H: Bi = { en: 'Polytechnics', hi: 'पॉलिटेक्निक' }
const VERIFY: Bi = { en: 'verify list', hi: 'सूची की पुष्टि करें' }
const MAP_LABEL: Bi = { en: 'Avg PRI (illustrative)', hi: 'औसत PRI (सांकेतिक)' }
const MAP_NOTE: Bi = {
  en: 'Highlighted: pilot districts. Tile colour is illustrative readiness.',
  hi: 'चिह्नित: पायलट ज़िले। टाइल का रंग सांकेतिक तैयारी दिखाता है।',
}

function InstRow({ inst, index }: { inst: Institution; index: number }) {
  const lang = useLang()
  const l = lang === 'hi' ? 'hi' : 'en'
  return (
    <li className="flex min-w-0 items-baseline gap-2 py-1.5">
      <span className="w-5 shrink-0 text-right font-mono text-[12px] tabular-nums text-gray-600">{index + 1}</span>
      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-gray-200" title={inst.name}>
        {inst.short}
      </span>
      <span lang={l} className={cn('shrink-0 text-[12px] text-gray-500', l === 'hi' && 'font-deva')}>
        {districtName(inst.districtId, l)}
      </span>
    </li>
  )
}

export function PilotScope({ className }: { className?: string }) {
  const lang = useLang()
  const values = useMemo(() => districtPriMap(), [])

  return (
    <section aria-label={tr(TITLE, lang)} className={cn('min-w-0', className)}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <Tr as="h2" b={TITLE} className="text-[20px] font-semibold tracking-tight text-white" />
          <Tr as="p" b={SCOPE_SUMMARY} className="mt-0.5 text-[13px] text-gray-400" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2 text-[13px] font-medium text-gray-300">
            <MapPinned className="h-4 w-4 text-emerald-300" aria-hidden />
            <Tr b={{ en: `${PILOT_DISTRICTS.length} pilot districts`, hi: `${PILOT_DISTRICTS.length} पायलट ज़िले` }} />
          </div>
          <BiharTileMap
            values={values}
            metricLabel={MAP_LABEL}
            highlight={PILOT_DISTRICTS}
            size="md"
            className="mx-auto"
          />
          <Tr as="p" b={MAP_NOTE} className="mt-3 text-[12px] leading-snug text-gray-500" />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <GraduationCap className="h-4 w-4 shrink-0 text-sky-300" aria-hidden />
              <Tr as="h3" b={GEC_H} className="min-w-0 text-[14px] font-semibold text-white" />
              <span className="inline-flex items-center rounded-md border border-amber-400/30 bg-amber-400/[0.07] px-1.5 py-0.5 text-[12px] font-medium text-amber-300">
                <Tr b={VERIFY} />
              </span>
            </div>
            <ol className="mt-2 grid gap-x-6 divide-y divide-white/[0.05] sm:grid-cols-2 sm:divide-y-0">
              {PILOT_GECS.map((inst, i) => (
                <InstRow key={inst.id} inst={inst} index={i} />
              ))}
            </ol>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 shrink-0 text-cyan-300" aria-hidden />
              <Tr as="h3" b={POLY_H} className="text-[14px] font-semibold text-white" />
            </div>
            <ol className="mt-2 grid gap-x-6 divide-y divide-white/[0.05] sm:grid-cols-2 sm:divide-y-0">
              {PILOT_POLYS.map((inst, i) => (
                <InstRow key={inst.id} inst={inst} index={i} />
              ))}
            </ol>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-dashed border-white/15 bg-white/[0.015] px-4 py-3">
            <School className="mt-0.5 h-4 w-4 shrink-0 text-amber-300/90" aria-hidden />
            <Tr as="p" b={SCHOOLS_CHIP} className="text-[13px] leading-snug text-gray-300" />
          </div>
        </div>
      </div>
    </section>
  )
}
