'use client'

/* Audience cards + proof strip. Reported figures come from REPORTED/SOURCES and stay visually
 * separate from the illustrative PREVIEW numbers. No number on this page is typed by hand. */

import Link from 'next/link'
import { ArrowRight, ArrowUpRight, BadgeCheck, GraduationCap, Landmark, School, type LucideIcon } from 'lucide-react'
import { fmtIN, tr } from '@/lib/os/i18n'
import { PREVIEW, REPORTED, SOURCES } from '@/lib/mock/state'
import { cn } from '@/lib/utils'
import { GRADIENT_TEXT, Eyebrow, HonestyChip, Reveal, SafeImg, ShowcaseStyles } from './shared'
import { shotUrl, type ShotId } from './media'

interface Audience {
  id: string
  tag: string
  title: string
  hindi?: string
  body: string
  shot: ShotId
  inset?: ShotId
  icon: LucideIcon
  links: { href: string; label: string }[]
  glow: string
}

const AUDIENCES: Audience[] = [
  {
    id: 'students',
    tag: 'Engineering & Polytechnic students',
    title: 'Practise the whole campus drive',
    body: 'Aptitude, DSA, communication and AI interviews, then a readiness index and the drives you qualify for.',
    shot: 'interview',
    icon: GraduationCap,
    links: [{ href: '/placement/', label: 'Start Placement Day' }],
    glow: 'bg-cyan-400/20',
  },
  {
    id: 'schools',
    tag: 'Govt schools · Class 9–12',
    title: 'Sarthi Didi, career guidance in Hindi',
    hindi: 'सारथी दीदी से हिंदी में करियर की बात',
    body: 'Interest discovery, stream choice and ITI or polytechnic pathways, explained simply.',
    shot: 'schools',
    icon: School,
    links: [{ href: '/schools/', label: 'Explore for schools' }],
    glow: 'bg-emerald-400/20',
  },
  {
    id: 'institutions',
    tag: 'Colleges (TPO) & DSTTE',
    title: 'From JD shortlist to state dashboard',
    body: 'TPOs shortlist against a JD in minutes; DSTTE sees district readiness, risk and a weekly AI brief.',
    shot: 'tpo',
    inset: 'state',
    icon: Landmark,
    links: [
      { href: '/tpo/', label: 'TPO view' },
      { href: '/state/', label: 'State view' },
    ],
    glow: 'bg-blue-500/20',
  },
]

function AudienceCard({ a, delay }: { a: Audience; delay: number }) {
  const single = a.links.length === 1
  return (
    <Reveal delay={delay} className="h-full">
      <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0a0f1a] transition-colors duration-300 hover:border-white/[0.16]">
        <div className="relative aspect-[16/10] overflow-hidden">
          <SafeImg
            src={shotUrl(a.shot)}
            alt={`${a.tag}: product screenshot`}
            fallbackLabel={a.tag}
            className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/20 to-transparent" />
          {a.inset && (
            <div className="absolute bottom-3 right-3 w-[38%] overflow-hidden rounded-lg border border-white/15 shadow-2xl shadow-black/60 transition-transform duration-500 group-hover:-translate-y-1 sm:rotate-[-2deg]">
              <div className="aspect-[16/10]">
                <SafeImg src={shotUrl(a.inset)} alt="State view: product screenshot" fallbackLabel="State view" className="h-full w-full object-cover object-top" />
              </div>
            </div>
          )}
          <span className="absolute left-3 top-3 inline-flex max-w-[calc(100%-24px)] items-center gap-1.5 rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-xs font-medium text-gray-100 backdrop-blur-md">
            <a.icon className="h-3.5 w-3.5 shrink-0 text-cyan-300" aria-hidden />
            <span className="truncate">{a.tag}</span>
          </span>
        </div>
        <div className="flex flex-1 flex-col p-5 pt-3 sm:p-6 sm:pt-4">
          <div aria-hidden className={cn('pointer-events-none absolute left-6 top-[48%] h-20 w-40 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100', a.glow)} />
          <h3 className="relative text-lg font-semibold leading-snug text-white sm:text-xl">{a.title}</h3>
          {a.hindi && (
            <p lang="hi" className="relative mt-1 text-sm text-emerald-200/90">
              {a.hindi}
            </p>
          )}
          <p className="relative mt-2 text-sm leading-relaxed text-gray-400">{a.body}</p>
          <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-5">
            {a.links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded text-sm font-semibold text-cyan-200 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70',
                  single && 'after:absolute after:inset-0 after:content-[""]',
                )}
              >
                {l.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            ))}
          </div>
        </div>
      </article>
    </Reveal>
  )
}

/** Six reported years as thin bars; the 2025-26 alternate figure is drawn as a dashed extension. */
function PlacementBars() {
  const pts = REPORTED.placements
  const max = Math.max(...pts.map((p) => Math.max(p.value, p.high ?? 0)))
  return (
    <figure className="min-w-0 flex-1">
      <div className="flex h-28 items-end gap-1.5 sm:gap-2" role="img" aria-label="Campus placements by year, as reported">
        {pts.map((p, i) => {
          const last = i === pts.length - 1
          const h = (p.value / max) * 100
          const hh = p.high ? ((p.high - p.value) / max) * 100 : 0
          return (
            <div
              key={p.year}
              tabIndex={0}
              className="group/bar relative flex h-full min-w-0 flex-1 flex-col justify-end outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
            >
              {hh > 0 && (
                <div className="w-full rounded-t-[4px] border border-b-0 border-dashed border-emerald-300/40" style={{ height: `${hh}%` }} />
              )}
              <div
                className={cn(
                  'w-full transition-[filter] group-hover/bar:brightness-125',
                  hh > 0 ? '' : 'rounded-t-[4px]',
                  last ? 'bg-gradient-to-t from-emerald-500 to-cyan-300' : 'bg-emerald-400/35',
                )}
                style={{ height: `${h}%` }}
              />
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#0b1322] px-2 py-1 text-xs text-gray-100 shadow-xl group-hover/bar:block group-focus-visible/bar:block">
                {p.year}: {fmtIN(p.value)}
                {p.high ? ` (another source: ${fmtIN(p.high)})` : ''}
              </span>
            </div>
          )
        })}
      </div>
      <div aria-hidden className="mt-1.5 flex gap-1.5 sm:gap-2">
        {pts.map((p) => (
          <span key={p.year} className="min-w-0 flex-1 truncate text-center text-xs tabular-nums text-gray-500">
            {p.year.slice(2)}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>Campus placements, Bihar government technical colleges, as reported</caption>
        <tbody>
          {pts.map((p) => (
            <tr key={p.year}>
              <th scope="row">{p.year}</th>
              <td>{fmtIN(p.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

function ProofStrip() {
  const pts = REPORTED.placements
  const first = pts[0]
  const last = pts[pts.length - 1]
  const stats = [
    { v: fmtIN(REPORTED.institutions.gec), l: 'Govt. engineering colleges' },
    { v: fmtIN(REPORTED.institutions.gp), l: 'Govt. polytechnics' },
    { v: `${fmtIN(REPORTED.interviewReadyNationalPct)}%`, l: `Graduates interview-ready nationally (${SOURCES.apna.label})` },
  ]
  const preview = [
    { v: fmtIN(PREVIEW.institutions), l: 'Institutions in the pilot' },
    { v: fmtIN(PREVIEW.onboarded), l: 'Students onboarded' },
    { v: fmtIN(PREVIEW.aiInterviews), l: 'AI interviews' },
    { v: `${fmtIN(PREVIEW.baselinePri, 1)} → ${fmtIN(PREVIEW.avgPri, 1)}`, l: 'Average PRI' },
  ]
  return (
    <div className="mt-12 grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
      <Reveal className="min-w-0">
        <div className="h-full rounded-3xl border border-emerald-400/15 bg-gradient-to-br from-emerald-400/[0.05] to-transparent p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
              As reported
            </span>
            <span className="text-xs text-gray-500">Bihar govt. technical colleges · campus placements</span>
          </div>
          <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8">
            <div className="shrink-0">
              <p className="text-4xl font-semibold tabular-nums tracking-tight text-white sm:text-5xl">
                {fmtIN(first.value)} <span className="text-gray-600">→</span> <span className={GRADIENT_TEXT}>{fmtIN(last.value)}</span>
              </p>
              <p className="mt-1.5 text-sm text-gray-400">
                Placements, {first.year} to {last.year}
              </p>
            </div>
            <PlacementBars />
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-white/[0.06] pt-5 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.l} className="min-w-0 last:col-span-2 sm:last:col-span-1">
                <dt className="sr-only">{s.l}</dt>
                <dd className="text-2xl font-semibold tabular-nums text-white">{s.v}</dd>
                <dd className="mt-0.5 text-xs leading-snug text-gray-400">{s.l}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-xs leading-relaxed text-gray-500">
            Sources:{' '}
            <a href={SOURCES.pp.url} target="_blank" rel="noreferrer" className="underline decoration-white/20 underline-offset-2 hover:text-gray-300">
              {SOURCES.pp.label}
            </a>
            ,{' '}
            <a href={SOURCES.im.url} target="_blank" rel="noreferrer" className="underline decoration-white/20 underline-offset-2 hover:text-gray-300">
              {SOURCES.im.label}
            </a>
            , {SOURCES.apna.label}.{last.note ? ` ${last.year}: ${last.note}.` : ''}
          </p>
        </div>
      </Reveal>

      <Reveal className="min-w-0" delay={120}>
        <div className="flex h-full flex-col rounded-3xl border border-dashed border-amber-400/25 bg-amber-400/[0.02] p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <HonestyChip label="Illustrative pilot data" />
            <span className="text-xs text-gray-500">{tr(PREVIEW.asOf, 'en')}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-gray-400">
            What a statewide pilot dashboard could look like. Demo figures for illustration, not reported outcomes.
          </p>
          <dl className="mt-5 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            {preview.map((s) => (
              <div key={s.l} className="flex items-baseline justify-between gap-4 px-4 py-3">
                <dt className="text-sm text-gray-400">{s.l}</dt>
                <dd className="text-lg font-semibold tabular-nums text-gray-100 sm:text-xl">{s.v}</dd>
              </div>
            ))}
          </dl>
          <Link
            href="/state/"
            className="mt-auto inline-flex items-center gap-1.5 self-start rounded pt-5 text-sm font-semibold text-amber-100 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
          >
            Open the state view
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </Reveal>
    </div>
  )
}

export function Audience() {
  return (
    <section id="for-everyone" aria-labelledby="audience-title" className="relative scroll-mt-16 overflow-hidden pb-16 pt-6 sm:pb-24">
      <ShowcaseStyles />
      <div className="container relative mx-auto px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Built for Bihar</Eyebrow>
          <h2 id="audience-title" className="mt-4 text-[2rem] font-semibold leading-[1.1] tracking-[-0.02em] text-white sm:text-[2.5rem]">
            Students se State tak, <span className={GRADIENT_TEXT}>ek hi OS.</span>
          </h2>
          <p className="text-balance mt-4 text-[15px] leading-relaxed text-gray-400 sm:text-base">
            One readiness signal powers a student&apos;s practice, a TPO&apos;s shortlist and DSTTE&apos;s district view.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {AUDIENCES.map((a, i) => (
            <AudienceCard key={a.id} a={a} delay={i * 90} />
          ))}
        </div>
        <ProofStrip />
      </div>
    </section>
  )
}
