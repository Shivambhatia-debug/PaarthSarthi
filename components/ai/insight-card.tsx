'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  Lightbulb,
  ShieldAlert,
  TrendingUp,
  UserCheck,
  type LucideIcon,
} from 'lucide-react'
import { useDemo } from '@/lib/os/demo-store'
import { isDevanagari, type Bi } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'
import { AIBadge } from '@/components/ai/ai-badge'
import { StreamingText } from '@/components/ai/streaming-text'

type Severity = 'info' | 'warn' | 'risk' | 'good'

export interface InsightCardProps {
  severity: Severity
  title: string | Bi
  body: string | Bi
  evidence?: ReadonlyArray<string | Bi>
  /** 0-1 or 0-100. Shown as 'Confidence 82%' inside Why?. */
  confidence?: number
  actionLabel?: string | Bi
  onAction?: () => void
  stream?: boolean
  humanReview?: boolean
  /** Optional (additive). */
  className?: string
  /** Optional (additive): extra content under the body (e.g. a mini chart). */
  children?: ReactNode
}

// Literal class strings (Tailwind only generates classes it can see).
const SEV: Record<Severity, { Icon: LucideIcon; hex: string; icon: string; chip: string; bar: string }> = {
  info: {
    Icon: Lightbulb,
    hex: '#38bdf8',
    icon: 'bg-sky-400/10 text-sky-300 ring-sky-400/25',
    chip: 'text-sky-300',
    bar: 'from-sky-400 to-cyan-300',
  },
  warn: {
    Icon: AlertTriangle,
    hex: '#fbbf24',
    icon: 'bg-amber-400/10 text-amber-300 ring-amber-400/25',
    chip: 'text-amber-300',
    bar: 'from-amber-400 to-amber-200',
  },
  risk: {
    Icon: ShieldAlert,
    hex: '#fb7185',
    icon: 'bg-rose-400/10 text-rose-300 ring-rose-400/25',
    chip: 'text-rose-300',
    bar: 'from-rose-400 to-rose-300',
  },
  good: {
    Icon: TrendingUp,
    hex: '#34d399',
    icon: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/25',
    chip: 'text-emerald-300',
    bar: 'from-emerald-400 to-cyan-300',
  },
}

const UI = {
  why: { en: 'Why?', hi: 'क्यों?' },
  review: { en: 'Human review', hi: 'मानवीय समीक्षा' },
  evidence: { en: 'Evidence', hi: 'आधार' },
  confidence: { en: 'Confidence', hi: 'विश्वसनीयता' },
  note: {
    en: 'Advisory only: a person reviews every flag before any action. Illustrative pilot data.',
    hi: 'केवल सलाह: किसी भी कार्रवाई से पहले हर संकेत की समीक्षा एक व्यक्ति करता है। उदाहरणात्मक पायलट डेटा।',
  },
  severity: {
    info: { en: 'Insight', hi: 'अंतर्दृष्टि' },
    warn: { en: 'Watch', hi: 'ध्यान दें' },
    risk: { en: 'Risk', hi: 'जोखिम' },
    good: { en: 'Win', hi: 'उपलब्धि' },
  } as Record<Severity, Bi>,
} satisfies Record<string, unknown>

function Txt({ s, className }: { s: string; className?: string }) {
  const deva = isDevanagari(s)
  return (
    <span lang={deva ? 'hi' : undefined} className={cn(className, deva && 'font-deva')}>
      {s}
    </span>
  )
}

/**
 * An AI insight with the full grammar: streamed explanation, a "Why?" panel with evidence and
 * confidence, a "Human review" tag, and an optional action.
 */
export function InsightCard({
  severity,
  title,
  body,
  evidence,
  confidence,
  actionLabel,
  onAction,
  stream = true,
  humanReview = true,
  className,
  children,
}: InsightCardProps) {
  const { t } = useDemo()
  const sev = SEV[severity] ?? SEV.info
  const Icon = sev.Icon
  const [open, setOpen] = useState(false)
  const [acted, setActed] = useState(false)
  const actedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const panelId = `insight-why-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  useEffect(
    () => () => {
      if (actedTimer.current) clearTimeout(actedTimer.current)
    },
    [],
  )

  const titleText = t(title)
  const bodyText = t(body)
  const evList: ReadonlyArray<string | Bi> = Array.isArray(evidence) ? evidence : []
  const ev = evList.map((e) => t(e)).filter(Boolean)
  const conf =
    typeof confidence === 'number' && Number.isFinite(confidence)
      ? Math.round(Math.min(100, Math.max(0, confidence <= 1 ? confidence * 100 : confidence)))
      : null
  const hasWhy = ev.length > 0 || conf !== null

  const handleAction = () => {
    onAction?.()
    setActed(true)
    if (actedTimer.current) clearTimeout(actedTimer.current)
    actedTimer.current = setTimeout(() => setActed(false), 1800)
  }

  return (
    <article
      className={cn(
        'group/insight relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/[0.16]',
        className,
      )}
    >
      {/* severity accent + glow */}
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ background: `linear-gradient(180deg, ${sev.hex}, ${sev.hex}55)` }} />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl"
        style={{ background: `${sev.hex}1f` }}
      />

      <div className="relative p-4 pl-5 sm:p-5 sm:pl-6">
        <div className="flex items-start gap-3">
          <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1', sev.icon)}>
            <Icon aria-hidden className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Txt
                s={t(UI.severity[severity] ?? UI.severity.info)}
                className={cn('text-[12px] font-semibold uppercase tracking-[0.12em]', sev.chip)}
              />
              <span aria-hidden className="text-[12px] text-gray-600">
                ·
              </span>
              <AIBadge />
            </div>
            <h3 className="mt-1.5 text-[15px] font-semibold leading-snug text-white">
              <Txt s={titleText} />
            </h3>
          </div>
        </div>

        <div className="mt-2.5 text-[13.5px] leading-relaxed text-gray-300">
          {stream ? <StreamingText text={bodyText} as="p" /> : <Txt s={bodyText} className="block" />}
        </div>

        {children && <div className="mt-3">{children}</div>}

        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          {hasWhy && (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls={panelId}
              className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-[12.5px] font-medium text-gray-300 ring-1 ring-white/10 transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
            >
              <Txt s={t(UI.why)} />
              <ChevronDown aria-hidden className={cn('h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-180')} />
            </button>
          )}
          {humanReview && (
            <span className="inline-flex h-8 items-center gap-1.5 rounded-md bg-slate-400/10 px-2 text-[12px] font-medium text-slate-300 ring-1 ring-slate-400/20">
              <UserCheck aria-hidden className="h-3.5 w-3.5" />
              <Txt s={t(UI.review)} />
            </span>
          )}
          {actionLabel && (
            <button
              type="button"
              onClick={handleAction}
              className={cn(
                'ml-auto inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[12.5px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60',
                acted
                  ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30'
                  : 'bg-gradient-to-r from-blue-500/90 via-cyan-500/90 to-emerald-500/90 text-white shadow-[0_6px_20px_-8px_rgba(34,211,238,0.7)] hover:brightness-110',
              )}
            >
              {acted ? <Check aria-hidden className="h-3.5 w-3.5" /> : null}
              <Txt s={t(actionLabel)} />
              {!acted && <ArrowRight aria-hidden className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>

        {hasWhy && (
          <div
            id={panelId}
            className={cn('grid transition-[grid-template-rows] duration-300 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
          >
            <div className="overflow-hidden">
              <div className="mt-3 rounded-lg border border-white/[0.07] bg-black/20 p-3.5">
                {ev.length > 0 && (
                  <>
                    <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                      <Txt s={t(UI.evidence)} />
                    </div>
                    <ul className="space-y-1.5">
                      {ev.map((e, i) => (
                        <li key={i} className="flex gap-2 text-[13px] leading-snug text-gray-300">
                          <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: sev.hex }} />
                          <Txt s={e} />
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {conf !== null && (
                  <div className={cn('flex items-center gap-3', ev.length > 0 && 'mt-3 border-t border-white/[0.06] pt-3')}>
                    <span className="text-[12.5px] font-medium text-gray-300">
                      <Txt s={`${t(UI.confidence)} ${conf}%`} />
                    </span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <span
                        className={cn('block h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ease-out', sev.bar)}
                        style={{ width: open ? `${conf}%` : '0%' }}
                      />
                    </span>
                  </div>
                )}
                <p className="mt-2.5 text-[12px] leading-snug text-gray-500">
                  <Txt s={t(UI.note)} />
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
