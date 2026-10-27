'use client'

/* Path to scale & economics (for Q&A). Static, collapsed by default (fix 37: no live ROI slider).
 * The worked example is computed from three local constants. */

import { Calculator, IndianRupee, Map as MapIcon } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tr } from '@/components/os/tr-text'
import { fmtIN, fmtINR, type Bi } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'

/** Worked example inputs (our calculation, not a forecast). */
const EXAMPLE = { students: 30000, pricePerStudent: 500, upliftPp: 8 } as const

/** Price bands in ₹. */
const PRICE = {
  b2g: [300, 600],
  college: [999, 1999],
  perInterview: [99, 149],
  humanMock: [1200, 1800],
  skilling: [10000, 75000],
} as const

const band = (r: readonly [number, number]) => `${fmtINR(r[0])}–${fmtIN(r[1])}`

const annualCost = EXAMPLE.students * EXAMPLE.pricePerStudent
const extraPlacements = Math.round((EXAMPLE.students * EXAMPLE.upliftPp) / 100)
const perPlacement = extraPlacements > 0 ? annualCost / extraPlacements : 0

const TRIGGER: Bi = { en: 'Path to scale & economics (for Q&A)', hi: 'विस्तार का रास्ता और अर्थशास्त्र (प्रश्नोत्तर के लिए)' }

const PRICING: { id: string; label: Bi; value: Bi; note?: Bi }[] = [
  {
    id: 'b2g',
    label: { en: 'State licence (B2G)', hi: 'राज्य लाइसेंस (B2G)' },
    value: { en: `${band(PRICE.b2g)} / student / year`, hi: `${band(PRICE.b2g)} / छात्र / वर्ष` },
  },
  {
    id: 'schools',
    label: { en: 'Government school students', hi: 'सरकारी स्कूल के छात्र' },
    value: { en: 'Free', hi: 'निःशुल्क' },
  },
  {
    id: 'college',
    label: { en: 'College SaaS', hi: 'कॉलेज SaaS' },
    value: { en: `${band(PRICE.college)} / student / year`, hi: `${band(PRICE.college)} / छात्र / वर्ष` },
  },
  {
    id: 'interview',
    label: { en: 'Pay-per-AI-interview', hi: 'प्रति AI इंटरव्यू भुगतान' },
    value: { en: band(PRICE.perInterview), hi: band(PRICE.perInterview) },
    note: {
      en: `vs ${band(PRICE.humanMock)} for a human mock interview`,
      hi: `मानव मॉक इंटरव्यू के ${band(PRICE.humanMock)} की तुलना में`,
    },
  },
]

const EX_TITLE: Bi = { en: 'Worked example (our calculation)', hi: 'उदाहरण गणना (हमारी गणना)' }
const EX_ROWS: { id: string; label: Bi; value: string; strong?: boolean }[] = [
  {
    id: 'cost',
    label: {
      en: `${fmtIN(EXAMPLE.students)} students × ${fmtINR(EXAMPLE.pricePerStudent)} a year`,
      hi: `${fmtIN(EXAMPLE.students)} छात्र × ${fmtINR(EXAMPLE.pricePerStudent)} प्रति वर्ष`,
    },
    value: fmtINR(annualCost),
  },
  {
    id: 'uplift',
    label: {
      en: `+${EXAMPLE.upliftPp} pp placement uplift`,
      hi: `+${EXAMPLE.upliftPp} pp प्लेसमेंट वृद्धि`,
    },
    value: fmtIN(extraPlacements),
  },
  {
    id: 'per',
    label: { en: 'Cost per additional placement', hi: 'प्रति अतिरिक्त प्लेसमेंट लागत' },
    value: `≈${fmtINR(perPlacement)}`,
    strong: true,
  },
]
const EX_VALUE_NOTE: Bi[] = [
  { en: 'annual cost', hi: 'वार्षिक लागत' },
  { en: 'additional placements', hi: 'अतिरिक्त प्लेसमेंट' },
  { en: 'per placement', hi: 'प्रति प्लेसमेंट' },
]
const COMPARE: Bi = {
  en: `Typical skilling cost: ${band(PRICE.skilling)} per trainee (our calculation)`,
  hi: `सामान्य कौशल प्रशिक्षण लागत: ${band(PRICE.skilling)} प्रति प्रशिक्षु (हमारी गणना)`,
}
const ROADMAP: Bi = {
  en: 'Next modules: Faculty Copilot, industry & MoU tracker, alumni mentors, startup pipeline.',
  hi: 'अगले मॉड्यूल: फ़ैकल्टी कोपायलट, उद्योग और MoU ट्रैकर, पूर्व छात्र मेंटर, स्टार्टअप पाइपलाइन।',
}
const PRICING_H: Bi = { en: 'Pricing at scale', hi: 'बड़े पैमाने पर मूल्य' }

export function EconomicsPanel({ className }: { className?: string }) {
  return (
    <Accordion type="single" collapsible className={cn('min-w-0', className)}>
      <AccordionItem value="economics" className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
        <AccordionTrigger className="no-print gap-3 px-4 py-3.5 text-left text-[15px] font-semibold text-gray-100 hover:bg-white/[0.03] hover:no-underline sm:px-5 [&>svg]:text-gray-400">
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.05] ring-1 ring-white/10">
              <IndianRupee className="h-4 w-4 text-gray-300" aria-hidden />
            </span>
            <Tr b={TRIGGER} className="min-w-0" />
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-5 pt-1 sm:px-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="min-w-0 rounded-lg border border-white/[0.07] bg-black/20 p-4">
              <Tr as="h3" b={PRICING_H} className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-gray-400" />
              <dl className="divide-y divide-white/[0.06]">
                {PRICING.map((p) => (
                  <div key={p.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2">
                    <Tr as="dt" b={p.label} className="text-[13px] text-gray-300" />
                    <dd className="text-right">
                      <Tr b={p.value} className="text-[14px] font-semibold tabular-nums text-white" />
                      {p.note && <Tr as="span" b={p.note} className="block text-[12px] text-gray-500" />}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="min-w-0 rounded-lg border border-white/[0.07] bg-black/20 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Calculator className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                <Tr as="h3" b={EX_TITLE} className="text-[13px] font-semibold uppercase tracking-wide text-gray-400" />
              </div>
              <ol className="space-y-2">
                {EX_ROWS.map((r, i) => (
                  <li
                    key={r.id}
                    className={cn(
                      'flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 rounded-md px-3 py-2',
                      r.strong ? 'bg-emerald-400/[0.07] ring-1 ring-emerald-400/25' : 'bg-white/[0.03]',
                    )}
                  >
                    <Tr b={r.label} className="text-[13px] text-gray-300" />
                    <span className="text-right">
                      <span className={cn('text-[16px] font-semibold tabular-nums', r.strong ? 'text-emerald-200' : 'text-white')}>
                        {r.value}
                      </span>{' '}
                      <Tr b={EX_VALUE_NOTE[i]} className="text-[12px] text-gray-500" />
                    </span>
                  </li>
                ))}
              </ol>
              <Tr as="p" b={COMPARE} className="mt-3 text-[13px] leading-snug text-gray-400" />
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-dashed border-white/15 px-4 py-3">
            <MapIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            <Tr as="p" b={ROADMAP} className="text-[13px] leading-snug text-gray-300" />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
