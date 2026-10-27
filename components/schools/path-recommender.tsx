'use client'

import { useState } from 'react'
import { BadgeIndianRupee, Briefcase, ChevronDown, Clock, Compass, Info, MapPin, Sparkles, UserCheck, Wallet } from 'lucide-react'
import type { Bi } from '@/lib/os/i18n'
import { institutionsByDistrict } from '@/lib/mock/institutions'
import { districtById } from '@/lib/mock/districts'
import { NUSRAT } from '@/lib/mock/personas'
import type { Institution } from '@/lib/mock/types'
import { AISurface } from '@/components/ai/ai-surface'
import { StreamingText } from '@/components/ai/streaming-text'
import { ScoreRing } from '@/components/ai/score-ring'
import { cn } from '@/lib/utils'
import { PATHS, PATH_CONFIDENCE, pathEvidence, pathWhy, type PathOption } from '@/components/schools/school-data'
import { RaastaTimeline } from '@/components/schools/raasta-timeline'
import { StepHeading, StepNav, T, useSchool } from '@/components/schools/school-shell'

const UI = {
  title: { en: 'My Path', hi: 'मेरा रास्ता' } as Bi,
  sub: {
    en: 'Four options, ranked by how well they fit your interests and abilities',
    hi: 'चार विकल्प, आपकी रुचि और क्षमता से मेल के हिसाब से',
  } as Bi,
  best: { en: 'Best fit', hi: 'सबसे अच्छा मेल' } as Bi,
  rec: { en: 'Sarthi AI recommendation', hi: 'सारथी AI की सलाह' } as Bi,
  fit: { en: 'fit', hi: 'मेल' } as Bi,
  why: { en: 'Why this path?', hi: 'यह रास्ता क्यों?' } as Bi,
  evidence: { en: 'Evidence', hi: 'आधार' } as Bi,
  confidence: { en: 'Confidence', hi: 'विश्वसनीयता' } as Bi,
  review: { en: 'Human review: school counsellor', hi: 'मानवीय समीक्षा: स्कूल काउंसलर' } as Bi,
  careers: { en: 'Careers', hi: 'करियर' } as Bi,
  cost: { en: 'Approx. cost', hi: 'अनुमानित खर्च' } as Bi,
  time: { en: 'Time to first job', hi: 'पहली नौकरी तक' } as Bi,
  salary: { en: 'Starting pay in Bihar (illustrative)', hi: 'बिहार में शुरुआती वेतन (उदाहरण)' } as Bi,
  near: { en: 'Near you', hi: 'आपके पास' } as Bi,
  details: { en: 'Details', hi: 'विवरण' } as Bi,
  hide: { en: 'Hide', hi: 'छिपाएँ' } as Bi,
  footer: {
    en: 'Advice only: the decision is yours and your family’s · illustrative pay bands, verify fees with the institute',
    hi: 'यह केवल सलाह है: फ़ैसला आपका और आपके परिवार का · वेतन उदाहरण हैं, फ़ीस संस्थान से पुष्टि करें',
  } as Bi,
  next: { en: 'Ask Sarthi Didi', hi: 'सारथी दीदी से पूछें' } as Bi,
}

const RANK_TONE = ['text-emerald-300', 'text-cyan-300', 'text-sky-300', 'text-gray-400']

/** Hindi-friendly institution label from the roster (the roster stores English names only). */
function placeLabel(inst: Institution): Bi {
  const d = districtById(inst.districtId)
  const hiDistrict = d?.nameHi ?? inst.short
  if (inst.type === 'GP') return { en: inst.name, hi: `सरकारी पॉलिटेक्निक, ${hiDistrict}` }
  return { en: inst.name, hi: `${hiDistrict} इंजीनियरिंग कॉलेज` }
}

function placesFor(path: PathOption, roster: Institution[]): Bi[] {
  const out: Bi[] = []
  for (const id of path.institutionIds) {
    const inst = roster.find((i) => i.id === id)
    if (inst) out.push(placeLabel(inst))
  }
  return [...out, ...(path.extraPlaces ?? [])]
}

export function PathRecommender() {
  const roster = institutionsByDistrict(NUSRAT.districtId)
  const gp = roster.find((i) => i.id === PATHS[0]?.institutionIds[0]) ?? roster.find((i) => i.type === 'GP')
  const gpHi = gp ? (placeLabel(gp).hi ?? '').replace(',', '') : 'सरकारी पॉलिटेक्निक पूर्णिया'
  const gpEn = gp ? gp.name : 'Government Polytechnic, Purnia'
  const why = pathWhy(gpHi, gpEn)

  return (
    <section>
      <StepHeading title={UI.title} sub={UI.sub} icon={Compass} />

      <ol className="space-y-4">
        {PATHS.map((p, i) => (
          <li key={p.id}>
            <PathCard path={p} rank={i + 1} places={placesFor(p, roster)} why={i === 0 ? why : undefined} />
          </li>
        ))}
      </ol>

      <p className="mt-3 text-[12px] leading-snug text-gray-500">
        <T b={UI.footer} />
      </p>

      <div className="mt-8">
        <RaastaTimeline />
      </div>

      <StepNav next={5} nextLabel={UI.next} />
    </section>
  )
}

function PathCard({ path, rank, places, why }: { path: PathOption; rank: number; places: Bi[]; why?: Bi }) {
  const { L, lite } = useSchool()
  const top = rank === 1
  const [open, setOpen] = useState(top)
  const [whyOpen, setWhyOpen] = useState(false)
  const [streamed, setStreamed] = useState(false)

  const body = (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center gap-3 sm:gap-4">
        <ScoreRing
          value={path.fit}
          size={top ? 84 : 64}
          stroke={top ? 8 : 6}
          showBand={false}
          label={L(UI.fit)}
          durationMs={lite ? 0 : 1100}
          className="shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('text-[12px] font-bold tabular-nums', RANK_TONE[rank - 1] ?? 'text-gray-400')}>#{rank}</span>
            {top && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[12px] font-semibold text-emerald-200">
                <Sparkles className="h-3 w-3" aria-hidden />
                <T b={UI.best} />
              </span>
            )}
          </div>
          <h3 className={cn('mt-0.5 font-semibold leading-snug text-white', top ? 'text-[19px] sm:text-[21px]' : 'text-[17px]')}>
            <T b={path.title} />
          </h3>
          <p className="text-[14px] leading-snug text-gray-400">
            <T b={path.via} />
          </p>
          <p className="mt-1 text-[13px] leading-snug text-gray-300">
            <T b={path.fitNote} />
          </p>
        </div>
      </div>

      {/* Streamed reason for #1 */}
      {why && (
        <div className="rounded-xl border border-cyan-300/15 bg-gradient-to-br from-blue-500/[0.07] via-transparent to-emerald-400/[0.06] p-3.5 sm:p-4">
          <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-cyan-300/90">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            <T b={UI.why} />
          </p>
          <StreamingText
            text={L(why)}
            startDelay={450}
            onDone={() => setStreamed(true)}
            className="text-[16px] leading-relaxed text-gray-100"
          />
          {streamed && (
            <div className="os-rise mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setWhyOpen((v) => !v)}
                aria-expanded={whyOpen}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-[13px] font-medium text-gray-200 transition-colors hover:border-cyan-300/40"
              >
                <Info className="h-4 w-4 text-cyan-300" aria-hidden />
                <T b={UI.evidence} />
                <ChevronDown className={cn('h-4 w-4 transition-transform', whyOpen && 'rotate-180')} aria-hidden />
              </button>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/[0.06] px-2.5 py-1 text-[12px] text-emerald-200">
                <UserCheck className="h-3.5 w-3.5" aria-hidden />
                <T b={UI.review} />
              </span>
            </div>
          )}
          {streamed && whyOpen && (
            <div className="os-rise mt-3 space-y-2">
              <ul className="space-y-1.5">
                {pathEvidence().map((e, i) => (
                  <li key={i} className="flex items-start gap-2 text-[14px] text-gray-300">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                    <T b={e} />
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[13px] text-gray-400">
                  <T b={UI.confidence} />
                </span>
                <span className="h-1.5 w-28 overflow-hidden rounded-full bg-white/[0.08]">
                  <span className="block h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${PATH_CONFIDENCE}%` }} />
                </span>
                <span className="text-[13px] font-semibold tabular-nums text-white">{PATH_CONFIDENCE}%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {open && (
        <div className={cn('space-y-4', !top && 'os-rise')}>
          {/* Facts */}
          <div className="grid gap-2 sm:grid-cols-3">
            <Fact icon={Wallet} label={UI.cost} value={path.cost} />
            <Fact icon={Clock} label={UI.time} value={path.time} />
            <Fact icon={BadgeIndianRupee} label={UI.salary} value={path.salary} />
          </div>

          {/* Careers */}
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-gray-500">
              <Briefcase className="h-3.5 w-3.5" aria-hidden />
              <T b={UI.careers} />
            </p>
            <div className="flex flex-wrap gap-2">
              {path.careers.map((c, i) => (
                <span key={i} className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[13px] text-gray-200">
                  <T b={c} />
                </span>
              ))}
            </div>
          </div>

          {/* Nearest institutions */}
          {places.length > 0 && (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-gray-500">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                <T b={UI.near} />
              </p>
              <div className="flex flex-wrap gap-2">
                {places.map((pl, i) => (
                  <span
                    key={i}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px]',
                      i === 0 && top ? 'border-emerald-400/35 bg-emerald-400/10 text-emerald-100' : 'border-sky-400/20 bg-sky-400/[0.05] text-sky-100',
                    )}
                  >
                    <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                    <T b={pl} />
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!top && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex h-11 items-center gap-1.5 rounded-lg px-2 text-[13px] font-medium text-gray-400 transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          <T b={open ? UI.hide : UI.details} />
          <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden />
        </button>
      )}
    </div>
  )

  if (top) {
    return (
      <AISurface title={L(UI.rec)} meta={false} bodyClassName="space-y-4">
        {body}
      </AISurface>
    )
  }
  return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">{body}</div>
}

function Fact({ icon: Icon, label, value }: { icon: typeof Wallet; label: Bi; value: Bi }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
      <p className="flex items-center gap-1.5 text-[12px] text-gray-500">
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <T b={label} />
      </p>
      <p className="mt-0.5 text-[14px] font-medium leading-snug text-gray-100">
        <T b={value} />
      </p>
    </div>
  )
}
