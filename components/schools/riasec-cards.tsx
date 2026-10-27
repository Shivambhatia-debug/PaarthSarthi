'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { Check, Hand, ThumbsDown, ThumbsUp, Undo2 } from 'lucide-react'
import type { Bi } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'
import { RIASEC_CARDS } from '@/components/schools/school-data'
import { T, useSchool } from '@/components/schools/school-shell'

const UI = {
  like: { en: 'Like', hi: 'पसंद' } as Bi,
  dislike: { en: 'Dislike', hi: 'नापसंद' } as Bi,
  undo: { en: 'Change last', hi: 'पिछला बदलें' } as Bi,
  hint: { en: 'Swipe right if you like it, left if you do not', hi: 'पसंद है तो दाएँ खिसकाएँ, नहीं तो बाएँ' } as Bi,
  ask: { en: 'Would you enjoy this?', hi: 'क्या आपको यह करना अच्छा लगेगा?' } as Bi,
  done: { en: 'All 12 interest cards done', hi: '12 रुचि कार्ड पूरे' } as Bi,
  liked: { en: 'liked', hi: 'पसंद' } as Bi,
  noWrong: { en: 'There are no right or wrong answers here.', hi: 'इसमें कोई जवाब सही या गलत नहीं है।' } as Bi,
}

const THRESHOLD = 90

export interface RiasecCardsProps {
  answers: Record<string, boolean>
  onAnswer: (id: string, like: boolean) => void
  onUndo: () => void
}

/** 12 RIASEC interest cards: पसंद / नापसंद buttons, arrow keys, or swipe (pointer events). */
export function RiasecCards({ answers, onAnswer, onUndo }: RiasecCardsProps) {
  const { L, lang, lite } = useSchool()
  const idx = RIASEC_CARDS.findIndex((c) => answers[c.id] === undefined)
  const current = idx >= 0 ? RIASEC_CARDS[idx] : null
  const answeredCount = RIASEC_CARDS.filter((c) => answers[c.id] !== undefined).length
  const likedCount = RIASEC_CARDS.filter((c) => answers[c.id] === true).length

  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [leaving, setLeaving] = useState<{ id: string; like: boolean } | null>(null)
  const drag = useRef<{ x0: number; pointerId: number } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  // A card answered from outside (fast-forward / autopilot) must not leave a half-swiped card behind.
  useEffect(() => {
    setDx(0)
    setLeaving(null)
    drag.current = null
    setDragging(false)
  }, [current?.id])

  const decide = (like: boolean) => {
    if (!current || leaving) return
    if (lite) {
      onAnswer(current.id, like)
      return
    }
    const id = current.id
    setLeaving({ id, like })
    timer.current = setTimeout(() => {
      timer.current = null
      onAnswer(id, like)
    }, 210)
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!current || leaving) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    drag.current = { x0: e.clientX, pointerId: e.pointerId }
    setDragging(true)
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || drag.current.pointerId !== e.pointerId) return
    setDx(e.clientX - drag.current.x0)
  }
  const endDrag = (e: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    if (!drag.current || drag.current.pointerId !== e.pointerId) return
    const d = e.clientX - drag.current.x0
    drag.current = null
    setDragging(false)
    if (!cancelled && Math.abs(d) > THRESHOLD) decide(d > 0)
    else setDx(0)
  }
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      decide(true)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      decide(false)
    }
  }

  const offset = leaving ? (leaving.like ? 1 : -1) * 520 : dx
  const rot = leaving ? (leaving.like ? 14 : -14) : dx / 16
  const likeOpacity = Math.min(1, Math.max(0, (leaving?.like ? 140 : dx) / 110))
  const dislikeOpacity = Math.min(1, Math.max(0, (leaving && !leaving.like ? 140 : -dx) / 110))

  return (
    <div>
      {/* Progress strip: one dot per card */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5" aria-hidden>
          {RIASEC_CARDS.map((c) => {
            const a = answers[c.id]
            const Icon = c.Icon
            return (
              <span
                key={c.id}
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-md border transition-colors',
                  a === true
                    ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-300'
                    : a === false
                      ? 'border-white/10 bg-white/[0.03] text-gray-600'
                      : c.id === current?.id
                        ? 'border-cyan-300/60 bg-cyan-300/10 text-cyan-200'
                        : 'border-white/[0.06] bg-transparent text-gray-700',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
            )
          })}
        </div>
        <span className="shrink-0 text-[13px] tabular-nums text-gray-400">
          {Math.min(answeredCount + (current ? 1 : 0), RIASEC_CARDS.length)} / {RIASEC_CARDS.length}
        </span>
      </div>

      {current ? (
        <>
          <div className="relative mx-auto h-[248px] w-full max-w-md select-none sm:h-[264px]">
            {/* Peeking cards behind */}
            {[2, 1].map((k) => {
              const c = RIASEC_CARDS[idx + k]
              if (!c) return null
              return (
                <div
                  key={c.id}
                  aria-hidden
                  className="absolute inset-0 rounded-3xl border border-white/[0.07] bg-[#121821]"
                  style={{ transform: `translateY(${k * 10}px) scale(${1 - k * 0.045})`, opacity: 1 - k * 0.3 }}
                />
              )
            })}

            {/* Top card (the pop-in lives on a wrapper so dragging never restarts it) */}
            <div key={current.id} className={cn('absolute inset-0', !lite && 'tile-pop')}>
            <div
              role="group"
              tabIndex={0}
              aria-label={`${L(current.label)} — ${L(UI.ask)}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={(e) => endDrag(e, false)}
              onPointerCancel={(e) => endDrag(e, true)}
              onKeyDown={onKeyDown}
              className={cn(
                'absolute inset-0 flex cursor-grab touch-pan-y flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/[0.12] px-5 text-center outline-none active:cursor-grabbing',
                'bg-gradient-to-b from-[#18202b] to-[#10151d] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]',
                'focus-visible:ring-2 focus-visible:ring-cyan-300/60',
                !lite && !dragging && 'transition-[transform,opacity] duration-200 ease-out',
              )}
              style={{
                transform: `translateX(${offset}px) rotate(${rot}deg)`,
                opacity: leaving ? 0 : 1,
              }}
            >
              <div aria-hidden className="pointer-events-none absolute -top-16 left-1/2 h-40 w-56 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

              {/* Swipe stamps */}
              <span
                aria-hidden
                className="pointer-events-none absolute left-4 top-4 -rotate-12 rounded-lg border-2 border-emerald-400 px-2.5 py-0.5 text-[15px] font-bold text-emerald-300"
                style={{ opacity: likeOpacity }}
              >
                <T b={UI.like} />
              </span>
              <span
                aria-hidden
                className="pointer-events-none absolute right-4 top-4 rotate-12 rounded-lg border-2 border-rose-400 px-2.5 py-0.5 text-[15px] font-bold text-rose-300"
                style={{ opacity: dislikeOpacity }}
              >
                <T b={UI.dislike} />
              </span>

              <span className="relative flex h-[76px] w-[76px] items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/25 via-cyan-400/15 to-emerald-400/25 text-cyan-100 ring-1 ring-white/10">
                <current.Icon className="h-9 w-9" strokeWidth={1.75} aria-hidden />
              </span>
              <p className="relative mt-5 text-[22px] font-semibold leading-snug text-white sm:text-[24px]">
                <T b={current.label} />
              </p>
              {lang === 'hi' && (
                <p lang="en" className="relative mt-1 text-[13px] text-gray-500">
                  {current.label.en}
                </p>
              )}
              <p className="relative mt-3 text-[13px] text-gray-400">
                <T b={UI.ask} />
              </p>
            </div>
            </div>
          </div>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[12px] text-gray-500">
            <Hand className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <T b={UI.hint} />
          </p>

          <div className="mx-auto mt-3 grid max-w-md grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => decide(false)}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-rose-400/35 bg-rose-400/[0.06] text-[16px] font-semibold text-rose-200 transition-colors hover:bg-rose-400/[0.12] active:scale-[0.98]"
            >
              <ThumbsDown className="h-5 w-5" aria-hidden />
              <T b={UI.dislike} />
            </button>
            <button
              type="button"
              onClick={() => decide(true)}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-400/[0.12] text-[16px] font-semibold text-emerald-100 transition-colors hover:bg-emerald-400/[0.2] active:scale-[0.98]"
            >
              <ThumbsUp className="h-5 w-5" aria-hidden />
              <T b={UI.like} />
            </button>
          </div>

          <div className="mx-auto mt-2 flex max-w-md items-center justify-between gap-2">
            <p className="text-[12px] text-gray-500">
              <T b={UI.noWrong} />
            </p>
            <button
              type="button"
              onClick={onUndo}
              disabled={answeredCount === 0 || !!leaving}
              className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-[13px] text-gray-400 transition-colors hover:bg-white/[0.04] hover:text-white disabled:opacity-30"
            >
              <Undo2 className="h-4 w-4" aria-hidden />
              <T b={UI.undo} />
            </button>
          </div>
        </>
      ) : (
        <div className="os-rise flex flex-col items-center justify-center rounded-3xl border border-emerald-400/25 bg-emerald-400/[0.05] px-5 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
            <Check className="h-6 w-6" strokeWidth={2.5} aria-hidden />
          </span>
          <p className="mt-3 text-[17px] font-semibold text-white">
            <T b={UI.done} />
          </p>
          <p className="mt-1 text-[13px] text-gray-400">
            {likedCount} / {RIASEC_CARDS.length} <T b={UI.liked} />
          </p>
          <button
            type="button"
            onClick={onUndo}
            className="mt-3 inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-[13px] text-gray-400 transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            <Undo2 className="h-4 w-4" aria-hidden />
            <T b={UI.undo} />
          </button>
        </div>
      )}
    </div>
  )
}
