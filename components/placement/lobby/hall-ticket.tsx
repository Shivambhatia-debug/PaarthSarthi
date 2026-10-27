'use client'

// Hub step 6: perforated hall ticket with the round schedule, proctoring rules and the optional AI GD preview.

import { forwardRef, useMemo, type ReactNode } from 'react'
import { ArrowRight, Camera, ClipboardX, MonitorX, Ticket, VideoOff } from 'lucide-react'
import { useDemo } from '@/lib/os/demo-store'
import { ROUNDS, type RoundId } from '@/lib/os/rounds'
import { DEMO_TODAY } from '@/lib/mock/state'
import { institutionById } from '@/lib/mock/institutions'
import { fmtDate, type Bi } from '@/lib/os/i18n'
import { Tr } from '@/components/os/tr-text'
import { cn } from '@/lib/utils'

/** PS-BR-<DDMM of DEMO_TODAY>-0471 (gives PS-BR-2810-0471). */
export function driveIdFor(today: string = DEMO_TODAY): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(today)
  const ddmm = m ? `${m[3]}${m[2]}` : '0000'
  return `PS-BR-${ddmm}-0471`
}

const SLOT_MIN: Record<RoundId, number> = {
  eligibility: 0,
  aptitude: 30,
  technical: 45,
  communication: 25,
  gd: 25,
  techInterview: 35,
  hrInterview: 25,
}
const START_MIN = 10 * 60 // 10:00 AM, after 09:30 reporting
const BREAK_MIN = 10

function clock(mins: number): string {
  const h24 = Math.floor(mins / 60) % 24
  const m = mins % 60
  const h = h24 % 12 === 0 ? 12 : h24 % 12
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`
}

const TXT = {
  title: { en: 'Hall Ticket', hi: 'प्रवेश पत्र' },
  driveId: { en: 'Drive ID', hi: 'ड्राइव ID' },
  candidate: { en: 'Candidate', hi: 'उम्मीदवार' },
  college: { en: 'College', hi: 'कॉलेज' },
  blueprint: { en: 'Blueprint', hi: 'ब्लूप्रिंट' },
  date: { en: 'Date', hi: 'तारीख' },
  reporting: { en: 'Reporting time', hi: 'रिपोर्टिंग समय' },
  mode: { en: 'Mode', hi: 'माध्यम' },
  modeVal: { en: 'Online · proctored on this device', hi: 'ऑनलाइन · इसी डिवाइस पर प्रॉक्टर्ड' },
  schedule: { en: 'Round schedule', hi: 'राउंड का समय' },
  rules: { en: 'Rules', hi: 'नियम' },
  r1: { en: 'Webcam on', hi: 'वेबकैम चालू' },
  r2: {
    en: 'No tab switching in aptitude & coding (3 strikes)',
    hi: 'अभिरुचि और कोडिंग में टैब बदलना मना (3 स्ट्राइक)',
  },
  r3: { en: 'Copy/paste disabled', hi: 'कॉपी/पेस्ट बंद' },
  r4: { en: 'Video never leaves this device', hi: 'वीडियो इस डिवाइस से बाहर नहीं जाता' },
  gd: { en: 'Include AI Group Discussion (preview)', hi: 'AI समूह चर्चा शामिल करें (प्रीव्यू)' },
  gdNote: { en: 'Optional round · not scored in PRI', hi: 'वैकल्पिक राउंड · PRI में नहीं गिना जाता' },
  enter: { en: 'Enter exam hall', hi: 'परीक्षा हॉल में प्रवेश करें' },
  optional: { en: 'preview', hi: 'प्रीव्यू' },
  report: { en: 'Readiness report', hi: 'रेडीनेस रिपोर्ट' },
} satisfies Record<string, Bi>

interface Props {
  onEnter: () => void
  /** Overrides the CTA label (e.g. 'Resume drive' when the run is already under way). */
  ctaLabel?: Bi
  className?: string
}

export const HallTicket = forwardRef<HTMLElement, Props>(function HallTicket({ onEnter, ctaLabel, className }, ref) {
  const { persona, blueprint, includeGd, set, lang, t } = useDemo()
  const inst = institutionById(persona.institutionId)
  const dateLang = lang === 'hi' ? 'hi' : 'en'
  const driveId = driveIdFor()

  const schedule = useMemo(() => {
    let at = START_MIN
    const out: { id: RoundId; label: Bi; time: string; optional: boolean }[] = []
    for (const r of ROUNDS) {
      if (r.id === 'eligibility') continue
      if (r.id === 'gd' && !includeGd) continue
      out.push({ id: r.id, label: r.label, time: clock(at), optional: !!r.optional })
      at += SLOT_MIN[r.id] + BREAK_MIN
    }
    return { rows: out, reportAt: clock(at) }
  }, [includeGd])

  // Deterministic barcode from the drive ID (no randomness during render).
  const bars = useMemo(
    () =>
      Array.from(driveId + persona.apaarMasked.slice(-4) + driveId.split('').reverse().join('')).map((ch, i) => {
        const c = ch.charCodeAt(0)
        return { w: (c % 3) + 1, gap: ((c >> 2) % 2) + 1, key: i }
      }),
    [driveId, persona.apaarMasked],
  )

  const rules = [
    { icon: Camera, b: TXT.r1 },
    { icon: MonitorX, b: TXT.r2 },
    { icon: ClipboardX, b: TXT.r3 },
    { icon: VideoOff, b: TXT.r4 },
  ]

  return (
    <section ref={ref} className={cn('os-rise scroll-mt-24', className)} aria-label={t(TXT.title)}>
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#111a26] via-[#0f141c] to-[#0f1a17] shadow-[0_30px_70px_-40px_rgba(34,211,238,0.55)]">
        <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-300 to-emerald-400" />

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-3 pt-5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-400/10 text-cyan-200">
              <Ticket className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <div>
              <p className="text-[15px] font-semibold text-white">
                <Tr b={TXT.title} /> <span className="text-gray-500">·</span>{' '}
                <span className="text-gray-300">ParthSarthi Placement Day</span>
              </p>
              <p className="text-[12px] text-gray-500">
                <Tr b={TXT.driveId} />{' '}
                <span className="font-mono text-[12.5px] tracking-wide text-cyan-200">{driveId}</span>
              </p>
            </div>
          </div>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[12px] font-medium text-emerald-200">
            <Tr b={{ en: 'Eligible ✓', hi: 'पात्र ✓' }} />
          </span>
        </div>

        {/* Details */}
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 px-4 pb-4 text-[13px] sm:grid-cols-2 sm:px-6">
          <Field label={TXT.candidate}>
            <span className="font-semibold text-white">{persona.name}</span>{' '}
            <span lang="hi" className="font-deva text-gray-400">
              {persona.nameHi}
            </span>
            <span className="block font-mono text-[12px] text-gray-500">{persona.apaarMasked}</span>
          </Field>
          <Field label={TXT.college}>
            <span className="text-gray-100">{inst?.name ?? '—'}</span>
            <span className="block text-[12px] text-gray-500">{persona.branchLabel}</span>
          </Field>
          <Field label={TXT.blueprint}>
            <span className="text-gray-100">{blueprint.label}</span>
          </Field>
          <Field label={TXT.date}>
            <span className="text-gray-100">{fmtDate(DEMO_TODAY, dateLang, { year: true })}</span>
            <span className="text-gray-500"> · </span>
            <Tr b={TXT.reporting} className="text-gray-400" />{' '}
            <span className="font-semibold tabular-nums text-white">09:30 AM</span>
            <span className="block text-[12px] text-gray-500">
              <Tr b={TXT.modeVal} />
            </span>
          </Field>
        </dl>

        {/* Perforation */}
        <div aria-hidden className="relative h-5">
          <span className="absolute -left-2.5 top-0 h-5 w-5 rounded-full border border-white/10 bg-[#0d1117]" />
          <span className="absolute -right-2.5 top-0 h-5 w-5 rounded-full border border-white/10 bg-[#0d1117]" />
          <span className="absolute inset-x-5 top-1/2 border-t-2 border-dashed border-white/15" />
        </div>

        {/* Stub: schedule + rules */}
        <div className="grid grid-cols-1 gap-5 px-4 pb-5 pt-3 sm:px-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-[12px] font-medium uppercase tracking-wider text-gray-500">
              <Tr b={TXT.schedule} />
            </p>
            <ol className="space-y-1.5">
              {schedule.rows.map((r, i) => (
                <li key={r.id} className="flex items-center gap-2.5 text-[13px]">
                  <span className="w-[72px] shrink-0 font-mono text-[12px] tabular-nums text-cyan-200">{r.time}</span>
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/[0.06] text-[12px] tabular-nums text-gray-400">
                    {i + 1}
                  </span>
                  <span className="min-w-0 truncate text-gray-200">
                    <Tr b={r.label} />
                  </span>
                  {r.optional && (
                    <span className="shrink-0 rounded border border-violet-400/30 bg-violet-500/10 px-1.5 text-[12px] text-violet-200">
                      <Tr b={TXT.optional} />
                    </span>
                  )}
                </li>
              ))}
              <li className="flex items-center gap-2.5 text-[13px]">
                <span className="w-[72px] shrink-0 font-mono text-[12px] tabular-nums text-emerald-200">{schedule.reportAt}</span>
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-[12px] text-emerald-300">
                  ★
                </span>
                <span className="text-gray-300">
                  <Tr b={TXT.report} />
                </span>
              </li>
            </ol>
          </div>

          <div>
            <p className="mb-2 text-[12px] font-medium uppercase tracking-wider text-gray-500">
              <Tr b={TXT.rules} />
            </p>
            <ul className="space-y-1.5">
              {rules.map(({ icon: Icon, b }) => (
                <li key={b.en} className="flex items-start gap-2 text-[13px] text-gray-300">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-200/80" aria-hidden />
                  <Tr b={b} />
                </li>
              ))}
            </ul>

            <button
              type="button"
              role="switch"
              aria-checked={includeGd}
              onClick={() => set({ includeGd: !includeGd })}
              className={cn(
                'mt-4 flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                includeGd ? 'border-violet-400/40 bg-violet-500/[0.09]' : 'border-white/10 bg-white/[0.02] hover:border-white/20',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'relative h-5 w-9 shrink-0 rounded-full transition-colors',
                  includeGd ? 'bg-violet-400' : 'bg-white/15',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-[left] duration-200',
                    includeGd ? 'left-[18px]' : 'left-0.5',
                  )}
                />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-medium text-gray-100">
                  <Tr b={TXT.gd} />
                </span>
                <span className="block text-[12px] text-gray-500">
                  <Tr b={TXT.gdNote} />
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* Barcode + CTA */}
        <div className="flex flex-col gap-4 border-t border-white/[0.06] bg-black/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div aria-hidden className="flex h-9 items-stretch overflow-hidden opacity-70">
            {bars.map((b) => (
              <span key={b.key} className="bg-gray-300" style={{ width: b.w, marginRight: b.gap }} />
            ))}
          </div>
          <button
            type="button"
            onClick={onEnter}
            data-enter-hall=""
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 px-6 text-[15px] font-semibold text-[#06121a] shadow-[0_14px_40px_-16px_rgba(34,211,238,0.85)] transition-[filter,transform] hover:brightness-110 active:scale-[0.99]"
          >
            <Tr b={ctaLabel ?? TXT.enter} />
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  )
})

function Field({ label, children }: { label: Bi; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[12px] text-gray-500">
        <Tr b={label} />
      </dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  )
}
