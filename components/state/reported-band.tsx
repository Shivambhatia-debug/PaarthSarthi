'use client'

import { Building, FileText, GraduationCap, Landmark, Users } from 'lucide-react'
import { KpiTile } from '@/components/os/kpi-tile'
import { SourceNote } from '@/components/os/source-note'
import { Tr } from '@/components/os/tr-text'
import { fmtIN, fmtNum, type Bi } from '@/lib/os/i18n'
import { REPORTED, SOURCES } from '@/lib/mock/state'
import { riseStyle } from '@/components/state/title-strip'
import { cn } from '@/lib/utils'

const T = {
  band: { en: 'Reported by the Department', hi: 'विभाग द्वारा रिपोर्ट' },
  bandSub: {
    en: 'Public figures, as reported, with sources. Not computed by this platform.',
    hi: 'सार्वजनिक आँकड़े, जैसा रिपोर्ट हुआ, स्रोत सहित। यह प्लेटफ़ॉर्म इनकी गणना नहीं करता।',
  },
  placements: { en: 'Placements', hi: 'प्लेसमेंट' },
  sourcesDiffer: { en: 'sources differ', hi: 'स्रोतों में अंतर' },
  seats: { en: 'Seats filled', hi: 'भरी गई सीटें' },
  seatsSub: { en: 'B.Tech / Diploma', hi: 'B.Tech / डिप्लोमा' },
  btech: { en: 'B.Tech', hi: 'B.Tech' },
  diploma: { en: 'Diploma', hi: 'डिप्लोमा' },
  coe: { en: 'Trained at Centres of Excellence', hi: 'सेंटर ऑफ़ एक्सीलेंस में प्रशिक्षित' },
  coeSub: { en: 'students', hi: 'छात्र' },
  inst: { en: 'Government institutions', hi: 'सरकारी संस्थान' },
  instSub: { en: 'engineering colleges + polytechnics', hi: 'इंजीनियरिंग कॉलेज + पॉलिटेक्निक' },
  oneEach: { en: 'An engineering college in every district', hi: 'हर ज़िले में एक इंजीनियरिंग कॉलेज' },
} satisfies Record<string, Bi>

/** '2025-26' with a non-breaking hyphen so the year never splits across lines next to the chip. */
function nbYear(y: string): string {
  return y.replace(/-/g, '\u2011')
}

function SeatBar({ label, pct, filled, total }: { label: Bi; pct: number; filled: number; total: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-[12px]">
        <Tr b={label} className="text-gray-400" />
        <span className="tabular-nums text-gray-500">
          {fmtIN(filled)} / {fmtIN(total)}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full bg-gradient-to-r from-slate-500 to-slate-300" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  )
}

/** Grey 'Reported by the Department' band. Tag 'reported'. Never computes a placement rate. */
export function ReportedBand({ className }: { className?: string }) {
  const last = REPORTED.placements[REPORTED.placements.length - 1]
  const { btech, diploma } = REPORTED.seats2026
  const { gec, gp } = REPORTED.institutions

  return (
    <section
      style={riseStyle(1)}
      className={cn(
        'os-rise relative overflow-hidden rounded-2xl border border-slate-500/25 bg-gradient-to-b from-slate-400/[0.07] to-slate-400/[0.02] p-4 sm:p-5',
        className,
      )}
      aria-label="Reported by the Department"
    >
      <header className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-400/10 text-slate-300 ring-1 ring-slate-400/25">
            <FileText aria-hidden className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <Tr as="h2" b={T.band} className="block text-[15px] font-semibold text-slate-100 sm:text-base" />
            <Tr as="p" b={T.bandSub} className="block text-[12.5px] text-slate-400" />
          </div>
        </div>
        <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-500/30 bg-slate-500/10 px-2.5 text-[12px] font-medium text-slate-300">
          <FileText aria-hidden className="h-3.5 w-3.5" />
          <Tr b={{ en: 'As reported', hi: 'रिपोर्ट के अनुसार' }} />
        </span>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="os-rise min-w-0" style={riseStyle(2)}>
          <KpiTile
            className="h-full"
            icon={Users}
            label={{ en: `${T.placements.en} ${nbYear(last.year)}`, hi: `${T.placements.hi} ${nbYear(last.year)}` }}
            valueText={`${fmtIN(last.value)}–${fmtIN(last.high ?? last.value)}`}
            sub={T.sourcesDiffer}
            tag="reported"
            sourceLabel={`${SOURCES.pp.label} · ${SOURCES.im.label}`}
          />
        </div>
        <div className="os-rise min-w-0" style={riseStyle(3)}>
          <KpiTile
            className="h-full"
            icon={GraduationCap}
            label={T.seats}
            valueText={`${fmtNum(btech.pct, 2)}% / ${fmtNum(diploma.pct, 2)}%`}
            sub={T.seatsSub}
            tag="reported"
          >
            <div className="space-y-2">
              <SeatBar label={T.btech} pct={btech.pct} filled={btech.filled} total={btech.total} />
              <SeatBar label={T.diploma} pct={diploma.pct} filled={diploma.filled} total={diploma.total} />
            </div>
          </KpiTile>
        </div>
        <div className="os-rise min-w-0" style={riseStyle(4)}>
          <KpiTile
            className="h-full"
            icon={Building}
            label={T.coe}
            valueText={`${fmtIN(REPORTED.coeTrained)}+`}
            sub={T.coeSub}
            tag="reported"
            sourceLabel={SOURCES.budget.label}
          />
        </div>
        <div className="os-rise min-w-0" style={riseStyle(5)}>
          <KpiTile
            className="h-full"
            icon={Landmark}
            label={T.inst}
            valueText={`${gec} + ${gp}`}
            sub={T.instSub}
            tag="reported"
          >
            <Tr as="p" b={T.oneEach} className="block text-[12px] text-slate-400" />
          </KpiTile>
        </div>
      </div>

      <SourceNote
        className="mt-3"
        sources={[SOURCES.pp, SOURCES.im, SOURCES.budget]}
        note={{
          en: last.note ?? '',
          hi: `स्रोतों में अंतर: ${fmtIN(last.value)} (${SOURCES.pp.label}, बाद की रिपोर्ट) बनाम ${fmtIN(last.high ?? last.value)} (${SOURCES.im.label})`,
        }}
      />
    </section>
  )
}
