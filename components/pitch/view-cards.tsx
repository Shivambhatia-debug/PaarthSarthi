'use client'

/* Five view cards that launch the demo screens. Keyboard hints (the OS digit keys) show only in presenter
 * mode. Thumbnails are live foundation primitives built from mock data (no typed numbers). */

import { useMemo, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, Building2, GraduationCap, Landmark, Rocket, School, type LucideIcon } from 'lucide-react'
import { ScoreRing } from '@/components/ai/score-ring'
import { BiharTileMap } from '@/components/os/bihar-tile-map'
import { Sparkline } from '@/components/os/sparkline'
import { Tr } from '@/components/os/tr-text'
import { useDemo } from '@/lib/os/demo-store'
import { fmtIN, fmtNum, type Bi } from '@/lib/os/i18n'
import { PRIYA } from '@/lib/mock/personas'
import { institutionById } from '@/lib/mock/institutions'
import { districtPriMap } from '@/lib/mock/districts'
import { DISTRICT_GEO } from '@/lib/mock/geo'
import { PREVIEW } from '@/lib/mock/state'
import { PILOT_DAYS } from '@/components/pitch/pilot-timeline'
import { PILOT_GECS, PILOT_POLYS } from '@/components/pitch/pilot-scope'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Data (module scope: deterministic, no typed headline numbers)
// ---------------------------------------------------------------------------

const PRIYA_FIRST = PRIYA.attempts[0]?.pri ?? 0
const PRIYA_LATEST = PRIYA.attempts[PRIYA.attempts.length - 1]?.pri ?? PRIYA_FIRST
const PCE = institutionById('pce-purnea')
const PCE_TREND = PCE?.priTrend ?? []
const PCE_FIRST = PCE_TREND[0]
const PCE_LAST = PCE_TREND[PCE_TREND.length - 1]
const DISTRICT_COUNT = DISTRICT_GEO.length

interface ViewCard {
  key: string
  href: string
  title: Bi
  who: Bi
  blurb: Bi
  Icon: LucideIcon
  tone: string
  glow: string
  /** Wide cards span 3 of 6 columns on desktop; the rest span 2. */
  wide?: boolean
}

const CARDS: ViewCard[] = [
  {
    key: '1',
    href: '/placement',
    title: { en: 'Student Placement Arena', hi: 'छात्र प्लेसमेंट एरीना' },
    who: { en: 'For students', hi: 'छात्रों के लिए' },
    blurb: {
      en: 'Eligibility to HR round in one proctored Placement Day, with an AI interviewer that speaks Hinglish.',
      hi: 'एक प्रॉक्टर्ड प्लेसमेंट डे में पात्रता से HR राउंड तक, हिंग्लिश बोलने वाले AI इंटरव्यूअर के साथ।',
    },
    Icon: GraduationCap,
    tone: 'text-cyan-300 bg-cyan-400/10 ring-cyan-400/25',
    glow: 'group-hover:shadow-[0_18px_50px_-24px_rgba(34,211,238,0.55)]',
  },
  {
    key: '2',
    href: '/tpo',
    title: { en: 'College T&P Console', hi: 'कॉलेज T&P कंसोल' },
    who: { en: 'For T&P officers', hi: 'T&P अधिकारियों के लिए' },
    blurb: {
      en: 'Batch readiness, at-risk students and AI-matched drives for every branch.',
      hi: 'हर ब्रांच के लिए बैच की तैयारी, जोखिम वाले छात्र और AI-मिलान वाली ड्राइव।',
    },
    Icon: Building2,
    tone: 'text-blue-300 bg-blue-400/10 ring-blue-400/25',
    glow: 'group-hover:shadow-[0_18px_50px_-24px_rgba(96,165,250,0.55)]',
  },
  {
    key: '3',
    href: '/state',
    title: { en: 'DSTTE Command Centre', hi: 'DSTTE कमांड सेंटर' },
    who: { en: 'For the Department', hi: 'विभाग के लिए' },
    blurb: {
      en: `Placement Readiness Index for all ${DISTRICT_COUNT} districts, live, with an AI brief for the Secretary.`,
      hi: `सभी ${DISTRICT_COUNT} ज़िलों का प्लेसमेंट रेडीनेस इंडेक्स, लाइव, सचिव के लिए AI ब्रीफ़ के साथ।`,
    },
    Icon: Landmark,
    tone: 'text-emerald-300 bg-emerald-400/10 ring-emerald-400/25',
    glow: 'group-hover:shadow-[0_18px_50px_-24px_rgba(52,211,153,0.55)]',
  },
  {
    key: '4',
    href: '/schools',
    title: { en: 'School Feeder · Disha', hi: 'स्कूल फ़ीडर · दिशा' },
    who: { en: 'Govt schools, classes 9-12', hi: 'सरकारी स्कूल, कक्षा 9-12' },
    blurb: {
      en: 'Apna career khojo: a Hindi-first career explorer that feeds polytechnic and engineering pathways.',
      hi: 'अपना करियर खोजो: हिंदी-प्रथम करियर खोज, जो पॉलिटेक्निक और इंजीनियरिंग की राह से जोड़ती है।',
    },
    Icon: School,
    tone: 'text-violet-300 bg-violet-400/10 ring-violet-400/25',
    glow: 'group-hover:shadow-[0_18px_50px_-24px_rgba(167,139,250,0.55)]',
    wide: true,
  },
  {
    key: '5',
    href: '/pilot',
    title: { en: 'Pilot proposal', hi: 'पायलट प्रस्ताव' },
    who: { en: 'For decision', hi: 'निर्णय के लिए' },
    blurb: {
      en: `${PILOT_DAYS} days, zero cost to the State, measured on your KPIs.`,
      hi: `${PILOT_DAYS} दिन, राज्य पर शून्य लागत, आपके KPI पर मापा गया।`,
    },
    Icon: Rocket,
    tone: 'text-amber-300 bg-amber-400/10 ring-amber-400/25',
    glow: 'group-hover:shadow-[0_18px_50px_-24px_rgba(251,191,36,0.45)]',
    wide: true,
  },
]

const HEADING: Bi = { en: 'Launch the views', hi: 'व्यू खोलें' }
const SUB: Bi = {
  en: 'One readiness layer, five views: student, college, State, school and the pilot.',
  hi: 'एक रेडीनेस लेयर, पाँच व्यू: छात्र, कॉलेज, राज्य, स्कूल और पायलट।',
}
const OPEN: Bi = { en: 'Open', hi: 'खोलें' }
const PRI_LABEL: Bi = { en: 'PRI', hi: 'PRI' }

// ---------------------------------------------------------------------------
// Thumbnails
// ---------------------------------------------------------------------------

function Thumb({ id, mapValues }: { id: string; mapValues: ReturnType<typeof districtPriMap> }): ReactNode {
  switch (id) {
    case '1':
      return (
        <div className="flex items-center gap-3">
          <ScoreRing value={PRIYA_LATEST} from={PRIYA_FIRST} size={64} label="PRI" showBand={false} />
          <div className="min-w-0 text-[12px] leading-snug text-gray-400">
            <Tr as="div" b={{ en: PRIYA.name, hi: PRIYA.nameHi }} className="font-medium text-gray-200" />
            <div className="tabular-nums">
              {fmtNum(PRIYA_FIRST, 0)} <span aria-hidden>→</span> <span className="text-emerald-300">{fmtNum(PRIYA_LATEST, 0)}</span>
            </div>
          </div>
        </div>
      )
    case '2':
      return (
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-2 text-[12px] text-gray-400">
            <span className="truncate font-medium text-gray-200">{PCE?.short ?? 'PCE'}</span>
            {PCE_FIRST != null && PCE_LAST != null && (
              <span className="shrink-0 tabular-nums">
                {fmtNum(PCE_FIRST, 1)} <span aria-hidden>→</span> <span className="text-emerald-300">{fmtNum(PCE_LAST, 1)}</span>
              </span>
            )}
          </div>
          <Sparkline data={PCE_TREND} width={280} height={44} stroke="#60a5fa" className="mt-2 h-11 w-full" />
        </div>
      )
    case '3':
      return (
        <div className="pointer-events-none mx-auto w-full max-w-[220px]" aria-hidden inert>
          <BiharTileMap values={mapValues} metricLabel={PRI_LABEL} size="sm" showLabels={false} />
        </div>
      )
    case '4':
      return (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-400/10 px-2.5 py-1 text-[12px] font-medium text-violet-200 ring-1 ring-violet-400/25">
            <Tr b={{ en: 'with Education Dept', hi: 'शिक्षा विभाग के साथ' }} />
          </span>
          <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[12px] text-gray-400 ring-1 ring-white/10">
            <Tr b={{ en: 'Hindi-first', hi: 'हिंदी-प्रथम' }} />
          </span>
        </div>
      )
    default:
      return (
        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          <span className="rounded-full bg-amber-400/10 px-2.5 py-1 font-medium text-amber-200 ring-1 ring-amber-400/25 tabular-nums">
            <Tr
              b={{
                en: `${fmtIN(PILOT_GECS.length)} GECs + ${fmtIN(PILOT_POLYS.length)} polytechnics`,
                hi: `${fmtIN(PILOT_GECS.length)} GEC + ${fmtIN(PILOT_POLYS.length)} पॉलिटेक्निक`,
              }}
            />
          </span>
          <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-gray-400 ring-1 ring-white/10">
            <Tr b={{ en: 'Independent evaluation', hi: 'स्वतंत्र मूल्यांकन' }} />
          </span>
        </div>
      )
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface ViewCardsProps {
  /** Stagger the cards in (60 ms) once the page reveals this section. Default true. */
  active?: boolean
  className?: string
}

export function ViewCards({ active = true, className }: ViewCardsProps) {
  const { presenter } = useDemo()
  const mapValues = useMemo(() => districtPriMap(), [])

  return (
    <section aria-labelledby="ps-views-h" className={cn('min-w-0', className)}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <Tr as="h2" b={HEADING} className="text-[22px] font-semibold tracking-tight text-white sm:text-[26px]" />
          <Tr as="p" b={SUB} className="mt-1 text-[14px] text-gray-400" />
        </div>
        <span className="text-[12px] text-gray-500 tabular-nums">
          <Tr
            b={{
              en: `${fmtIN(PREVIEW.institutions)} institutions · ${fmtIN(PREVIEW.onboarded)} students (illustrative)`,
              hi: `${fmtIN(PREVIEW.institutions)} संस्थान · ${fmtIN(PREVIEW.onboarded)} छात्र (उदाहरण)`,
            }}
          />
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {CARDS.map((c, i) => (
          <Link
            key={c.key}
            href={c.href}
            className={cn(
              'group relative flex min-w-0 flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4 outline-none transition-[transform,border-color,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05] focus-visible:ring-2 focus-visible:ring-cyan-300 sm:p-5',
              c.glow,
              c.wide ? 'lg:col-span-3' : 'lg:col-span-2',
              c.key === '5' && 'sm:col-span-2 lg:col-span-3',
              active ? 'os-rise' : 'opacity-0',
            )}
            style={active ? { animationDelay: `${i * 60}ms` } : undefined}
          >
            <div className="flex items-start gap-3">
              <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1', c.tone)}>
                <c.Icon className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <Tr as="h3" b={c.title} className="block text-[16px] font-semibold leading-snug text-white" />
                <Tr b={c.who} className="mt-0.5 block text-[12px] text-gray-500" />
              </div>
              {presenter && (
                <kbd
                  className="shrink-0 rounded border border-white/15 bg-white/5 px-1.5 font-mono text-[12px] leading-5 text-gray-400"
                  title={`Press ${c.key}`}
                >
                  {c.key}
                </kbd>
              )}
            </div>

            <Tr as="p" b={c.blurb} className="mt-3 block text-[13px] leading-relaxed text-gray-400" />

            <div className="mt-4 flex min-h-[64px] flex-1 items-end">
              <div className="w-full min-w-0">
                <Thumb id={c.key} mapValues={mapValues} />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-cyan-300 transition-colors group-hover:text-cyan-200">
              <Tr b={OPEN} />
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
