'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ban, Check, Flag, Lock } from 'lucide-react'
import { useDemo, type RoundState, type RoundStatus } from '@/lib/os/demo-store'
import { isDevanagari } from '@/lib/os/i18n'
import { ROUNDS, formatRoundScore, type RoundId } from '@/lib/os/rounds'
import { cn } from '@/lib/utils'

const OPTIONAL = { en: 'optional', hi: 'वैकल्पिक' }

export interface DriveRailProps {
  current?: RoundId | null
  compact?: boolean
  className?: string
}

const STATUS_STYLE: Record<RoundStatus, { chip: string; node: string; text: string }> = {
  locked: {
    chip: 'border-white/[0.07] bg-white/[0.02] text-gray-500',
    node: 'border-white/15 bg-white/[0.03] text-gray-500',
    text: 'text-gray-500',
  },
  live: {
    chip: 'border-cyan-400/40 bg-cyan-400/10 text-cyan-100',
    node: 'border-cyan-300 bg-cyan-400/15 text-cyan-200 shadow-[0_0_14px_-2px_rgba(34,211,238,0.7)]',
    text: 'text-cyan-100',
  },
  cleared: {
    chip: 'border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-100',
    node: 'border-emerald-400 bg-emerald-400 text-[#06281d]',
    text: 'text-emerald-100',
  },
  flagged: {
    chip: 'border-amber-400/40 bg-amber-400/10 text-amber-100',
    node: 'border-amber-400 bg-amber-400/20 text-amber-200',
    text: 'text-amber-100',
  },
  eliminated: {
    chip: 'border-rose-400/40 bg-rose-400/10 text-rose-100',
    node: 'border-rose-400 bg-rose-400/20 text-rose-200',
    text: 'text-rose-100',
  },
}

function StatusGlyph({ status, index }: { status: RoundStatus; index: number }) {
  if (status === 'cleared') return <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
  if (status === 'locked') return <Lock className="h-2.5 w-2.5" aria-hidden />
  if (status === 'flagged') return <Flag className="h-2.5 w-2.5" aria-hidden />
  if (status === 'eliminated') return <Ban className="h-2.5 w-2.5" aria-hidden />
  return <span className="text-[12px] font-bold leading-none">{index + 1}</span>
}

/** Scroll-aware edge fade for a horizontally scrolling strip; also centres the `active` child on change. */
function useScrollStrip<T extends HTMLElement>(activeSelector: string, dep: unknown) {
  const ref = useRef<T | null>(null)
  const [edges, setEdges] = useState<{ l: boolean; r: boolean }>({ l: false, r: false })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const l = el.scrollLeft > 2
      const r = el.scrollLeft + el.clientWidth < el.scrollWidth - 2
      setEdges((p) => (p.l === l && p.r === r ? p : { l, r }))
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(update)
      ro.observe(el)
    }
    return () => {
      el.removeEventListener('scroll', update)
      ro?.disconnect()
    }
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || el.scrollWidth <= el.clientWidth) return
    const a = el.querySelector<HTMLElement>(activeSelector)
    if (!a) return
    const er = el.getBoundingClientRect()
    const ar = a.getBoundingClientRect()
    const left = el.scrollLeft + (ar.left - er.left) - (el.clientWidth - ar.width) / 2
    el.scrollLeft = Math.max(0, left)
  }, [activeSelector, dep])

  const mask =
    edges.l && edges.r
      ? 'linear-gradient(to right, transparent, #000 24px, #000 calc(100% - 28px), transparent)'
      : edges.r
        ? 'linear-gradient(to right, #000 calc(100% - 28px), transparent)'
        : edges.l
          ? 'linear-gradient(to right, transparent, #000 24px)'
          : undefined
  const style = mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined
  return { ref, style }
}

/** Round progress for a placement drive. Cleared and live rounds are clickable. */
export function DriveRail({ current, compact, className }: DriveRailProps) {
  const router = useRouter()
  const { rounds, includeGd, t } = useDemo()
  const list = ROUNDS.filter((r) => r.id !== 'gd' || includeGd)
  const strip = useScrollStrip<HTMLElement>('[aria-current="step"]', `${current ?? ''}|${compact ? 1 : 0}|${list.length}`)

  const go = (route: string) => {
    try {
      router.push(route)
    } catch {
      /* ignore */
    }
  }

  if (compact) {
    return (
      <nav
        ref={strip.ref}
        style={strip.style}
        aria-label="Drive rounds"
        className={cn('flex min-w-0 items-center gap-1 overflow-x-auto scrollbar-hide', className)}
      >
        {list.map((r, i) => {
          const rs: RoundState = rounds?.[r.id] ?? { status: 'locked' }
          const status: RoundStatus = rs.status ?? 'locked'
          const st = STATUS_STYLE[status] ?? STATUS_STYLE.locked
          const isCurrent = current === r.id
          const clickable = (status === 'cleared' || status === 'live') && !isCurrent
          const score = status === 'cleared' || status === 'flagged' ? formatRoundScore(r.id, rs) : ''
          const label = t(r.label)
          return (
            <button
              key={r.id}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && go(r.route)}
              title={`${label}${score && score !== '—' ? ` · ${score}` : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
              className={cn(
                'group relative inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border pl-1 pr-2 text-[12px] font-medium transition-colors',
                st.chip,
                isCurrent && 'ring-1 ring-white/30',
                clickable ? 'cursor-pointer hover:bg-white/[0.08]' : 'cursor-default',
              )}
            >
              <span className={cn('grid h-5 w-5 place-items-center rounded-full border', st.node)}>
                <StatusGlyph status={status} index={i} />
              </span>
              <span className={cn('whitespace-nowrap', isCurrent ? 'inline' : 'hidden xl:inline')}>{r.short}</span>
              {score && score !== '—' && <span className="tabular-nums opacity-80">{score}</span>}
              {status === 'live' && isCurrent && (
                <span className="relative ml-0.5 flex h-1.5 w-1.5" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-300" />
                </span>
              )}
            </button>
          )
        })}
      </nav>
    )
  }

  return (
    <nav ref={strip.ref} style={strip.style} aria-label="Drive rounds" className={cn('w-full min-w-0 overflow-x-auto scrollbar-hide', className)}>
      <ol className="flex min-w-max items-start">
        {list.map((r, i) => {
          const rs: RoundState = rounds?.[r.id] ?? { status: 'locked' }
          const status: RoundStatus = rs.status ?? 'locked'
          const st = STATUS_STYLE[status] ?? STATUS_STYLE.locked
          const isCurrent = current === r.id
          const clickable = (status === 'cleared' || status === 'live') && !isCurrent
          const score = formatRoundScore(r.id, rs)
          const label = t(r.label)
          const deva = isDevanagari(label)
          const nextStatus = list[i + 1] ? rounds?.[list[i + 1].id]?.status ?? 'locked' : null
          return (
            <li key={r.id} className="flex items-start">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && go(r.route)}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'flex w-[104px] flex-col items-center gap-1.5 rounded-lg px-1 py-1.5 text-center transition-colors',
                  clickable ? 'cursor-pointer hover:bg-white/[0.04]' : 'cursor-default',
                )}
              >
                <span
                  className={cn(
                    'grid h-8 w-8 place-items-center rounded-full border-2 transition-shadow',
                    st.node,
                    isCurrent && 'ring-2 ring-white/25 ring-offset-2 ring-offset-[#0d1117]',
                  )}
                >
                  <StatusGlyph status={status} index={i} />
                </span>
                <span
                  lang={deva ? 'hi' : 'en'}
                  className={cn('text-[12px] font-medium leading-tight', st.text, deva && 'font-deva')}
                >
                  {label}
                </span>
                <span
                  lang={status === 'locked' && r.optional && isDevanagari(t(OPTIONAL)) ? 'hi' : undefined}
                  className={cn(
                    'min-h-[18px] text-[12px] tabular-nums text-gray-500',
                    status === 'locked' && r.optional && isDevanagari(t(OPTIONAL)) && 'font-deva',
                  )}
                >
                  {status === 'locked' ? (r.optional ? t(OPTIONAL) : '') : score}
                </span>
              </button>
              {nextStatus !== null && (
                <span
                  className={cn(
                    'mt-[22px] h-0.5 w-6 shrink-0 rounded-full sm:w-10',
                    status === 'cleared' && nextStatus !== 'locked'
                      ? 'bg-gradient-to-r from-emerald-400 to-cyan-300'
                      : status === 'cleared'
                        ? 'bg-emerald-400/50'
                        : 'bg-white/10',
                  )}
                  aria-hidden
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
