'use client'

/* Pilot plan data (single source for /pilot and the printed leave-behind) + the 90-day timeline.
 * Every number in copy is built from the constants below or from lib/mock (fix 24). */

import { CalendarCheck2, FileSignature, Flag, Rocket, type LucideIcon } from 'lucide-react'
import { Tr } from '@/components/os/tr-text'
import { useLang } from '@/lib/os/demo-store'
import { fmtIN, tr, type Bi } from '@/lib/os/i18n'
import { REPORTED } from '@/lib/mock/state'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const PILOT_DAYS = 90

/** Phase boundaries in days: Day 0 · 1-15 · 15-75 · 75-90. */
const D = { mou: 0, start: 1, baselineEnd: 15, sprintEnd: 75, end: PILOT_DAYS } as const

/** KPI targets (the proposal's own targets, not demo data). */
export const PILOT_TARGETS = {
  onboardedPct: 80,
  weeklyActivePct: 50,
  priUplift: 15,
  aiInterviews: 10000,
  girlsPct: REPORTED.girlsSeatReservationPct,
  poolDrives: 1,
} as const

export interface PilotPhase {
  id: string
  from: number
  to: number
  days: Bi
  title: Bi
  detail: Bi
  Icon: LucideIcon
}

const range = (a: number, b: number): Bi => ({ en: `Days ${a}–${b}`, hi: `दिन ${a}–${b}` })

export const PILOT_PHASES: PilotPhase[] = [
  {
    id: 'mou',
    from: D.mou,
    to: D.mou,
    days: { en: `Day ${D.mou}`, hi: `दिन ${D.mou}` },
    title: { en: 'MoU and nodal officers', hi: 'MoU और नोडल अधिकारी' },
    detail: {
      en: 'Zero-cost MoU signed; DSTTE and college nodal officers named',
      hi: 'शून्य-लागत MoU; DSTTE और कॉलेज नोडल अधिकारी नामित',
    },
    Icon: FileSignature,
  },
  {
    id: 'baseline',
    from: D.start,
    to: D.baselineEnd,
    days: range(D.start, D.baselineEnd),
    title: { en: 'Onboarding and baseline', hi: 'ऑनबोर्डिंग और बेसलाइन' },
    detail: {
      en: 'Consent, onboarding and a diagnostic PRI for every final-year student',
      hi: 'सहमति, ऑनबोर्डिंग और हर फ़ाइनल-वर्ष छात्र का डायग्नोस्टिक PRI',
    },
    Icon: CalendarCheck2,
  },
  {
    id: 'sprints',
    from: D.baselineEnd,
    to: D.sprintEnd,
    days: range(D.baselineEnd, D.sprintEnd),
    title: { en: 'Sprints and mock drives', hi: 'स्प्रिंट और मॉक ड्राइव' },
    detail: {
      en: `Practice sprints, AI mock drives and ${PILOT_TARGETS.poolDrives} pool drive across colleges`,
      hi: `अभ्यास स्प्रिंट, AI मॉक ड्राइव और कॉलेजों की ${PILOT_TARGETS.poolDrives} पूल ड्राइव`,
    },
    Icon: Rocket,
  },
  {
    id: 'evaluate',
    from: D.sprintEnd,
    to: D.end,
    days: range(D.sprintEnd, D.end),
    title: { en: 'Retake and independent evaluation', hi: 'दोबारा आकलन और स्वतंत्र मूल्यांकन' },
    detail: {
      en: 'EdTech Tulna-style / NITI results-based evaluation; report to the Secretary',
      hi: 'EdTech Tulna-शैली / NITI परिणाम-आधारित मूल्यांकन; सचिव को रिपोर्ट',
    },
    Icon: Flag,
  },
]

export interface PilotKpi {
  id: string
  metric: Bi
  target: Bi
  /** Compact target for the printed leave-behind. */
  targetShort?: Bi
  how: Bi
}

export const PILOT_KPIS: PilotKpi[] = [
  {
    id: 'onboarded',
    metric: { en: 'Final-year students onboarded', hi: 'जुड़े फ़ाइनल-वर्ष छात्र' },
    target: { en: `≥${PILOT_TARGETS.onboardedPct}%`, hi: `≥${PILOT_TARGETS.onboardedPct}%` },
    how: { en: 'Registrations vs college rolls', hi: 'पंजीकरण बनाम कॉलेज रोल' },
  },
  {
    id: 'active',
    metric: { en: 'Weekly active students', hi: 'साप्ताहिक सक्रिय छात्र' },
    target: { en: `≥${PILOT_TARGETS.weeklyActivePct}%`, hi: `≥${PILOT_TARGETS.weeklyActivePct}%` },
    how: { en: 'Platform activity logs', hi: 'प्लेटफ़ॉर्म गतिविधि लॉग' },
  },
  {
    id: 'pri',
    metric: { en: 'Average PRI of active students', hi: 'सक्रिय छात्रों का औसत PRI' },
    target: { en: `+${PILOT_TARGETS.priUplift} points`, hi: `+${PILOT_TARGETS.priUplift} अंक` },
    how: { en: 'Baseline vs retake, same blueprint', hi: 'बेसलाइन बनाम दोबारा आकलन, एक ही ब्लूप्रिंट' },
  },
  {
    id: 'interviews',
    metric: { en: 'AI mock interviews', hi: 'AI मॉक इंटरव्यू' },
    target: { en: `≥${fmtIN(PILOT_TARGETS.aiInterviews)}`, hi: `≥${fmtIN(PILOT_TARGETS.aiInterviews)}` },
    how: { en: 'Platform logs', hi: 'प्लेटफ़ॉर्म लॉग' },
  },
  {
    id: 'girls',
    metric: { en: "Girls' participation", hi: 'छात्राओं की भागीदारी' },
    target: { en: `≥${PILOT_TARGETS.girlsPct}%`, hi: `≥${PILOT_TARGETS.girlsPct}%` },
    how: { en: 'In line with the seat reservation for girls', hi: 'छात्राओं के सीट आरक्षण के अनुरूप' },
  },
  {
    id: 'offers',
    metric: { en: 'Offers and internships', hi: 'ऑफ़र और इंटर्नशिप' },
    target: { en: 'Up vs previous batch', hi: 'पिछले बैच से अधिक' },
    targetShort: { en: 'Above last batch', hi: 'पिछले बैच से ऊपर' },
    how: { en: "Colleges' own records", hi: 'कॉलेजों के अपने रिकॉर्ड' },
  },
  {
    id: 'evaluator',
    metric: { en: 'Independent evaluator', hi: 'स्वतंत्र मूल्यांकनकर्ता' },
    target: { en: 'Nominated by the Department', hi: 'विभाग द्वारा नामित' },
    targetShort: { en: 'Dept-nominated', hi: 'विभाग द्वारा' },
    how: { en: 'EdTech Tulna-style / NITI results-based', hi: 'EdTech Tulna-शैली / NITI परिणाम-आधारित' },
  },
]

export interface PilotAsk {
  id: string
  title: Bi
  detail: Bi
}

export const PILOT_ASKS: PilotAsk[] = [
  {
    id: 'mou',
    title: { en: 'Zero-cost MoU', hi: 'शून्य-लागत MoU' },
    detail: {
      en: `A non-financial ${PILOT_DAYS}-day pilot MoU. No cost to the State.`,
      hi: `${PILOT_DAYS} दिन का गैर-वित्तीय पायलट MoU। राज्य पर कोई लागत नहीं।`,
    },
  },
  {
    id: 'nodal',
    title: { en: 'Nodal officers', hi: 'नोडल अधिकारी' },
    detail: {
      en: 'One DSTTE nodal officer and one per pilot college.',
      hi: 'DSTTE का एक नोडल अधिकारी और हर पायलट कॉलेज में एक।',
    },
  },
  {
    id: 'letter',
    title: { en: 'Data-sharing and consent letter', hi: 'डेटा-साझाकरण और सहमति पत्र' },
    detail: {
      en: 'Plus co-branding with the State T&P Cell.',
      hi: 'साथ में राज्य T&P सेल के साथ सह-ब्रांडिंग।',
    },
  },
  {
    id: 'scale',
    title: { en: 'On success: a path to scale', hi: 'सफलता पर: विस्तार का रास्ता' },
    detail: {
      en: 'Startup work order under applicable rules (verify), then GeM, then a statewide licence with CSR co-funding.',
      hi: 'लागू नियमों के तहत स्टार्टअप वर्क ऑर्डर (पुष्टि करें), फिर GeM, फिर CSR सह-वित्तपोषण के साथ राज्यव्यापी लाइसेंस।',
    },
  },
]

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

const TITLE: Bi = { en: `${PILOT_DAYS}-day plan`, hi: `${PILOT_DAYS} दिन की योजना` }
const SUB: Bi = {
  en: 'Measured from a baseline, evaluated independently',
  hi: 'बेसलाइन से मापा गया, स्वतंत्र रूप से मूल्यांकित',
}

const PHASE_TONE = ['bg-slate-300', 'bg-sky-400', 'bg-cyan-300', 'bg-emerald-400']
const PHASE_RING = [
  'ring-slate-400/30 text-slate-200 bg-slate-400/10',
  'ring-sky-400/30 text-sky-200 bg-sky-400/10',
  'ring-cyan-300/30 text-cyan-200 bg-cyan-300/10',
  'ring-emerald-400/30 text-emerald-200 bg-emerald-400/10',
]

export function PilotTimeline({ className }: { className?: string }) {
  const lang = useLang()
  const total = Math.max(1, D.end - D.mou)
  // The proportional bar gives Day 0 a sliver so it stays visible.
  const widths = PILOT_PHASES.map((p) => Math.max(2, ((p.to - p.from) / total) * 100))
  const sum = widths.reduce((a, b) => a + b, 0)
  const ticks = [D.mou, D.baselineEnd, D.sprintEnd, D.end]

  return (
    <section aria-label={tr(TITLE, lang)} className={cn('min-w-0', className)}>
      <div className="mb-4">
        <Tr as="h2" b={TITLE} className="text-[20px] font-semibold tracking-tight text-white" />
        <Tr as="p" b={SUB} className="mt-0.5 text-[13px] text-gray-400" />
      </div>

      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PILOT_PHASES.map((p, i) => (
          <li
            key={p.id}
            className="relative flex min-w-0 flex-col rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="flex items-center gap-2.5">
              <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg ring-1', PHASE_RING[i] ?? PHASE_RING[0])}>
                <p.Icon className="h-4 w-4" aria-hidden />
              </span>
              <Tr b={p.days} className="text-[13px] font-semibold tabular-nums text-gray-200" />
              <span className="ml-auto font-mono text-[12px] text-gray-600">{i + 1}/4</span>
            </div>
            <Tr as="h3" b={p.title} className="mt-3 text-[15px] font-semibold leading-snug text-white" />
            <Tr as="p" b={p.detail} className="mt-1 text-[13px] leading-relaxed text-gray-400" />
          </li>
        ))}
      </ol>

      {/* Proportional 90-day bar */}
      <div className="mt-4" aria-hidden>
        <div className="flex h-2 w-full gap-[3px] overflow-hidden rounded-full">
          {PILOT_PHASES.map((p, i) => (
            <span
              key={p.id}
              className={cn('h-full rounded-full opacity-80', PHASE_TONE[i] ?? PHASE_TONE[0])}
              style={{ width: `${(widths[i] / sum) * 100}%` }}
            />
          ))}
        </div>
        <div className="relative mt-1.5 h-4 text-[12px] tabular-nums text-gray-500">
          {ticks.map((d, i) => {
            const left = (d / total) * 100
            return (
              <span
                key={d}
                className={cn(
                  'absolute top-0 whitespace-nowrap',
                  i === 0 ? 'left-0' : i === ticks.length - 1 ? 'right-0' : '-translate-x-1/2',
                )}
                style={i === 0 || i === ticks.length - 1 ? undefined : { left: `${left}%` }}
              >
                {i === 0 ? <Tr b={PILOT_PHASES[0].days} /> : d}
              </span>
            )
          })}
        </div>
      </div>
    </section>
  )
}
