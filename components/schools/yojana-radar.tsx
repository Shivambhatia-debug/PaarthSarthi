'use client'

import { useState } from 'react'
import {
  Bell,
  BellRing,
  CalendarClock,
  Check,
  ExternalLink,
  IndianRupee,
  MessageSquare,
  PhoneCall,
  Radar,
  ShieldAlert,
  Smartphone,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useDemoEvent } from '@/lib/os/demo-store'
import { fmtDate, type Bi } from '@/lib/os/i18n'
import { SCHEMES } from '@/lib/mock/schemes'
import { daysFromToday } from '@/lib/mock/state'
import { AgentLog } from '@/components/ai/agent-log'
import { CountUp } from '@/components/ai/count-up'
import { aiToast } from '@/components/ai/ai-toast'
import { cn } from '@/lib/utils'
import { MATCH_LABEL, inr, yojanaRows, type MatchStatus, type YojanaRow } from '@/components/schools/school-data'
import { StepHeading, T, useSchool } from '@/components/schools/school-shell'

const UI = {
  title: { en: 'Yojana Radar', hi: 'योजना रडार' } as Bi,
  sub: {
    en: 'Government schemes that can help you, matched to your profile',
    hi: 'सरकारी योजनाएँ जो आपकी मदद कर सकती हैं, आपकी प्रोफ़ाइल से मिलाकर',
  } as Bi,
  logTitle: { en: 'Yojana Radar agent', hi: 'योजना रडार एजेंट' } as Bi,
  unlocked: { en: '₹ unlocked for you', hi: 'आपके लिए ₹ खुले' } as Bi,
  unlockedNote: { en: 'Grants only, if conditions are met · loans not counted', hi: 'सिर्फ़ अनुदान, शर्तें पूरी होने पर · ऋण नहीं जोड़ा गया' } as Bi,
  loan: { en: 'plus an education loan of up to', hi: 'साथ में शिक्षा ऋण, अधिकतम' } as Bi,
  alerts: { en: 'Alert me by', hi: 'सूचना कैसे मिले' } as Bi,
  alertOn: { en: 'alerts on (demo)', hi: 'सूचना चालू (डेमो)' } as Bi,
  alertOff: { en: 'alerts off', hi: 'सूचना बंद' } as Bi,
  amount: { en: 'Amount', hi: 'राशि' } as Bi,
  daysLeft: { en: 'days left', hi: 'दिन बाकी' } as Bi,
  closed: { en: 'Deadline passed', hi: 'अंतिम तिथि निकल गई' } as Bi,
  upcoming: { en: 'Opens soon: we will alert you', hi: 'जल्द खुलेगी: हम सूचना देंगे' } as Bi,
  open: { en: 'Open now', hi: 'अभी खुली है' } as Bi,
  paused: { en: 'Scheme paused', hi: 'योजना स्थगित' } as Bi,
  verify: { en: 'Verify on the official portal', hi: 'आधिकारिक पोर्टल पर पुष्टि करें' } as Bi,
  docs: { en: 'Documents', hi: 'ज़रूरी कागज़' } as Bi,
  apply: { en: 'Apply on official portal', hi: 'आधिकारिक पोर्टल पर आवेदन' } as Bi,
  applyToast: { en: 'Demo: applications happen only on the official portal', hi: 'डेमो: आवेदन केवल आधिकारिक पोर्टल पर होता है' } as Bi,
  sibling: { en: 'Remind for my siblings', hi: 'भाई-बहन के लिए याद रखें' } as Bi,
  siblingToast: { en: 'Saved: we will remind your family before the Class 8 exam (demo)', hi: 'सेव हुआ: कक्षा 8 की परीक्षा से पहले परिवार को याद दिलाएँगे (डेमो)' } as Bi,
  revive: { en: 'Alert me if revived', hi: 'दोबारा शुरू होने पर बताएँ' } as Bi,
  reviveOn: { en: 'Revival alert on', hi: 'सूचना चालू' } as Bi,
  footer: {
    en: 'Illustrative matching · amounts and rules change: always check the official portal',
    hi: 'उदाहरणात्मक मिलान · राशि और नियम बदल सकते हैं: हमेशा आधिकारिक पोर्टल पर जाँचें',
  } as Bi,
}

const STATUS_STYLE: Record<MatchStatus, string> = {
  eligible: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200',
  maybe: 'border-amber-300/40 bg-amber-300/15 text-amber-200',
  no: 'border-rose-400/40 bg-rose-400/15 text-rose-200',
  paused: 'border-slate-400/30 bg-slate-400/10 text-slate-300',
}

const CARD_STYLE: Record<MatchStatus, string> = {
  eligible: 'border-emerald-400/20 bg-emerald-400/[0.03]',
  maybe: 'border-white/10 bg-white/[0.03]',
  no: 'border-white/10 bg-white/[0.02]',
  paused: 'border-dashed border-white/10 bg-transparent',
}

const CHANNELS: { id: 'sms' | 'whatsapp' | 'ivr'; label: Bi; Icon: LucideIcon }[] = [
  { id: 'sms', label: { en: 'SMS', hi: 'SMS' }, Icon: Smartphone },
  { id: 'whatsapp', label: { en: 'WhatsApp', hi: 'WhatsApp' }, Icon: MessageSquare },
  { id: 'ivr', label: { en: 'IVR call', hi: 'IVR कॉल' }, Icon: PhoneCall },
]

export function YojanaRadar() {
  const { L, lang, lite } = useSchool()
  const rows = yojanaRows()
  const [scanned, setScanned] = useState(lite)
  const total = rows.reduce((s, r) => s + (r.match.status === 'eligible' || r.match.status === 'maybe' ? r.match.grant ?? 0 : 0), 0)
  const loan = rows.reduce((m, r) => Math.max(m, r.match.loan ?? 0), 0)
  const counts = (['eligible', 'maybe', 'no', 'paused'] as MatchStatus[])
    .map((s) => ({ s, n: rows.filter((r) => r.match.status === s).length }))
    .filter((c) => c.n > 0)

  useDemoEvent('fastforward', () => setScanned(true))
  useDemoEvent('finish', () => setScanned(true))

  const steps: Bi[] = [
    { en: `Scanning ${SCHEMES.length} schemes…`, hi: `${SCHEMES.length} योजनाएँ स्कैन हो रही हैं…` },
    { en: 'Matching: Class 10 · girl student · Purnia', hi: 'मिलान: कक्षा 10 · छात्रा · पूर्णिया' },
    { en: 'Checking eligibility rules', hi: 'पात्रता के नियम जाँचे जा रहे हैं' },
    { en: 'Adding deadlines and documents', hi: 'अंतिम तिथि और कागज़ जोड़े जा रहे हैं' },
  ]

  return (
    <section>
      <StepHeading title={UI.title} sub={UI.sub} icon={Radar} />

      {!scanned ? (
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-start">
          <RadarSweep />
          <AgentLog className="w-full min-w-0 flex-1" title={L(UI.logTitle)} steps={steps.map((s) => L(s))} stepMs={420} onDone={() => setScanned(true)} />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          <div className="os-rise relative overflow-hidden rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-blue-500/[0.10] via-cyan-400/[0.05] to-emerald-400/[0.08] p-4 sm:p-5">
            <div aria-hidden className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="relative flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-cyan-200/90">
                  <T b={UI.unlocked} />
                </p>
                <CountUp
                  value={total}
                  durationMs={lite ? 0 : 1100}
                  format={(n) => inr(Math.round(n), lang)}
                  className="mt-0.5 block bg-gradient-to-r from-blue-300 via-cyan-200 to-emerald-300 bg-clip-text text-[34px] font-bold leading-none tracking-tight text-transparent sm:text-[40px]"
                />
                <p className="mt-1.5 text-[12px] text-gray-400">
                  <T b={UI.unlockedNote} />
                </p>
                {loan > 0 && (
                  <p className="mt-1 text-[14px] text-gray-200">
                    + <T b={UI.loan} /> <span className="font-semibold text-white">{inr(loan, lang)}</span>
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {counts.map((c) => (
                  <span key={c.s} className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-semibold', STATUS_STYLE[c.s])}>
                    <span className="tabular-nums">{c.n}</span>
                    <T b={MATCH_LABEL[c.s]} />
                  </span>
                ))}
              </div>
            </div>
            <AlertToggles />
          </div>

          {/* Scheme cards */}
          <ul className="space-y-3">
            {rows.map((r, i) => (
              <li key={r.scheme.id} className={cn(!lite && 'os-rise')} style={lite ? undefined : { animationDelay: `${i * 60}ms` }}>
                <SchemeCard row={r} />
              </li>
            ))}
          </ul>

          <p className="text-[12px] leading-snug text-gray-500">
            <T b={UI.footer} />
          </p>
        </div>
      )}
    </section>
  )
}

function RadarSweep() {
  const { lite } = useSchool()
  return (
    <div aria-hidden className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-cyan-300/25 bg-[#0b1520]">
      <span className="absolute inset-3 rounded-full border border-cyan-300/15" />
      <span className="absolute inset-7 rounded-full border border-cyan-300/15" />
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-cyan-300/10" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-cyan-300/10" />
      <span
        className={cn('absolute inset-0 rounded-full', !lite && 'animate-spin')}
        style={{
          background: 'conic-gradient(from 0deg, rgba(34,211,238,0) 0deg, rgba(34,211,238,0) 270deg, rgba(34,211,238,0.55) 360deg)',
          animationDuration: '1.8s',
        }}
      />
      <span className="absolute left-[30%] top-[34%] h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_#6ee7b7]" />
      <span className="absolute left-[64%] top-[58%] h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_#fcd34d]" />
      <span className="absolute left-[48%] top-[72%] h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_#6ee7b7]" />
    </div>
  )
}

function AlertToggles() {
  const { L } = useSchool()
  const [on, setOn] = useState<Record<string, boolean>>({ sms: true, whatsapp: true, ivr: false })
  return (
    <div className="relative mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.08] pt-3">
      <span className="mr-1 inline-flex items-center gap-1.5 text-[13px] text-gray-300">
        <Bell className="h-4 w-4 text-cyan-300" aria-hidden />
        <T b={UI.alerts} />
      </span>
      {CHANNELS.map(({ id, label, Icon }) => {
        const active = !!on[id]
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => {
              setOn((o) => ({ ...o, [id]: !active }))
              aiToast(`${L(label)} · ${L(active ? UI.alertOff : UI.alertOn)}`, { tone: active ? 'ai' : 'ok', id: `yojana-${id}`, duration: 2200 })
            }}
            className={cn(
              'inline-flex h-11 items-center gap-1.5 rounded-xl border px-3 text-[13px] font-medium transition-colors',
              active ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100' : 'border-white/10 bg-white/[0.03] text-gray-400 hover:text-white',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            <T b={label} />
            {active && <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />}
          </button>
        )
      })}
    </div>
  )
}

function SchemeCard({ row }: { row: YojanaRow }) {
  const { L, lang } = useSchool()
  const { scheme, match } = row
  const [checked, setChecked] = useState<number[]>([])
  const [revive, setRevive] = useState(false)
  const st = match.status
  const days = scheme.deadline ? daysFromToday(scheme.deadline) : null

  let when: { text: string; tone: string } | null = null
  if (st === 'paused' || scheme.status === 'paused') when = { text: L(UI.paused), tone: 'text-slate-400' }
  else if (days != null && scheme.deadline) {
    when =
      days >= 0
        ? { text: `${days} ${L(UI.daysLeft)} · ${fmtDate(scheme.deadline, lang)}`, tone: days <= 30 ? 'text-amber-200' : 'text-gray-300' }
        : { text: L(UI.closed), tone: 'text-rose-300' }
  } else if (scheme.status === 'upcoming') when = { text: L(UI.upcoming), tone: 'text-sky-200' }
  else if (scheme.status === 'open') when = { text: L(UI.open), tone: 'text-emerald-200' }

  return (
    <article className={cn('rounded-2xl border p-4 sm:p-5', CARD_STYLE[st])}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className={cn('min-w-0 flex-1 basis-56 text-[16px] font-semibold leading-snug', st === 'paused' || st === 'no' ? 'text-gray-300' : 'text-white')}>
          <T b={scheme.name} />
        </h3>
        <span className={cn('inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[13px] font-semibold', STATUS_STYLE[st])}>
          <T b={MATCH_LABEL[st]} />
        </span>
      </div>

      <p className="mt-2 flex items-start gap-2 text-[14px] leading-snug text-gray-200">
        <IndianRupee className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
        <T b={scheme.amount} />
      </p>

      <p
        className={cn(
          'mt-2 flex items-start gap-2 rounded-lg px-2.5 py-2 text-[14px] leading-snug',
          st === 'no' ? 'bg-rose-400/[0.06] text-rose-100' : st === 'paused' ? 'bg-white/[0.03] text-gray-300' : 'bg-white/[0.03] text-gray-200',
        )}
      >
        {st === 'no' ? (
          <Users className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" aria-hidden />
        ) : st === 'paused' ? (
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        ) : (
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden />
        )}
        <T b={match.note} />
      </p>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px]">
        {when && (
          <span className={cn('inline-flex items-center gap-1.5', when.tone)}>
            <CalendarClock className="h-4 w-4 shrink-0" aria-hidden />
            <T b={when.text} />
          </span>
        )}
        {scheme.verify && st !== 'paused' && (
          <span className="inline-flex items-center gap-1.5 text-amber-200/90">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <T b={UI.verify} />
          </span>
        )}
      </div>

      {scheme.docs.length > 0 && st !== 'paused' && (
        <div className="mt-3">
          <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-wider text-gray-500">
            <T b={UI.docs} /> <span className="tabular-nums">({checked.length}/{scheme.docs.length})</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {scheme.docs.map((d, i) => {
              const on = checked.includes(i)
              return (
                <button
                  key={i}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setChecked((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]))}
                  className={cn(
                    'inline-flex min-h-11 items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[13px] transition-colors',
                    on ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100' : 'border-white/10 bg-white/[0.02] text-gray-300 hover:border-white/20',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                      on ? 'border-emerald-400/60 bg-emerald-400/25' : 'border-white/25',
                    )}
                  >
                    {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </span>
                  <T b={d} />
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {st === 'no' ? (
          <button
            type="button"
            onClick={() => aiToast(L(UI.siblingToast), { tone: 'ok', id: `yojana-sib-${scheme.id}` })}
            className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-[14px] font-medium text-gray-200 transition-colors hover:border-white/20 hover:text-white"
          >
            <Users className="h-4 w-4" aria-hidden />
            <T b={UI.sibling} />
          </button>
        ) : st === 'paused' ? (
          <button
            type="button"
            aria-pressed={revive}
            onClick={() => {
              setRevive((v) => !v)
              if (!revive) aiToast(`${L(scheme.name)} · ${L(UI.reviveOn)}`, { tone: 'ai', id: `yojana-rev-${scheme.id}` })
            }}
            className={cn(
              'inline-flex h-11 items-center gap-1.5 rounded-xl border px-3.5 text-[14px] font-medium transition-colors',
              revive ? 'border-cyan-300/40 bg-cyan-300/10 text-cyan-100' : 'border-white/10 bg-white/[0.03] text-gray-300 hover:text-white',
            )}
          >
            {revive ? <BellRing className="h-4 w-4" aria-hidden /> : <Bell className="h-4 w-4" aria-hidden />}
            <T b={revive ? UI.reviveOn : UI.revive} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => aiToast(L(UI.applyToast), { description: scheme.portalLabel, tone: 'ai', id: `yojana-apply-${scheme.id}` })}
            className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-cyan-300/35 bg-cyan-300/10 px-3.5 text-[14px] font-semibold text-cyan-50 transition-colors hover:bg-cyan-300/15"
          >
            <T b={UI.apply} />
            <ExternalLink className="h-4 w-4" aria-hidden />
          </button>
        )}
        {scheme.portalLabel && st !== 'paused' && (
          <span lang="en" className="text-[12px] text-gray-500">
            {scheme.portalLabel}
          </span>
        )}
      </div>
    </article>
  )
}
