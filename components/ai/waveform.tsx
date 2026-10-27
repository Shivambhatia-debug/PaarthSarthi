'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useDemo } from '@/lib/os/demo-store'
import { useReducedMotion } from '@/lib/ai-sim'
import { cn } from '@/lib/utils'

export interface WaveformProps {
  /** 0-1 audio level. Omit for a synthetic "voice" pattern while active. */
  level?: number
  active: boolean
  bars?: number
  className?: string
  /** Optional (additive): 'ai' (blue → cyan → emerald) or 'violet'. */
  tone?: 'ai' | 'violet'
}

const AI_STOPS = [
  [96, 165, 250],
  [34, 211, 238],
  [52, 211, 153],
]
const VIOLET_STOPS = [
  [129, 140, 248],
  [167, 139, 250],
  [232, 121, 249],
]

function mix(stops: number[][], t: number): string {
  const x = Math.min(1, Math.max(0, t)) * (stops.length - 1)
  const i = Math.min(stops.length - 2, Math.floor(x))
  const f = x - i
  const a = stops[i]
  const b = stops[i + 1]
  const ch = (k: number) => Math.round(a[k] + (b[k] - a[k]) * f)
  return `rgb(${ch(0)}, ${ch(1)}, ${ch(2)})`
}

const MIN = 0.12

/**
 * Live audio bars. Heights follow `level` (mic RMS) with a per-bar wobble, animated on the
 * compositor (transform: scaleY) via requestAnimationFrame without React re-renders.
 * Inactive: a calm flat line. Lite / reduced motion: static bars that still reflect the level.
 */
export function Waveform({ level, active, bars = 24, className, tone = 'ai' }: WaveformProps) {
  const { state } = useDemo()
  const reduced = useReducedMotion()
  const still = reduced || !!state.lite
  const n = Math.max(4, Math.min(64, Math.floor(Number.isFinite(bars) ? bars : 24)))
  const lvl = typeof level === 'number' && Number.isFinite(level) ? Math.min(1, Math.max(0, level)) : undefined

  const refs = useRef<(HTMLSpanElement | null)[]>([])
  const levelRef = useRef(lvl)
  levelRef.current = lvl
  const staticRef = useRef<string[]>([])

  // Bell-shaped envelope (centre bars louder) and deterministic per-bar motion parameters.
  const shape = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => ({
        env: 0.42 + 0.58 * Math.sin((Math.PI * (i + 0.5)) / n),
        speed: 5.5 + ((i * 37) % 11) * 0.75,
        phase: i * 1.7,
        speed2: 2.1 + ((i * 13) % 7) * 0.35,
        color: mix(tone === 'violet' ? VIOLET_STOPS : AI_STOPS, n === 1 ? 0 : i / (n - 1)),
      })),
    [n, tone],
  )

  useEffect(() => {
    if (!active || still) return
    let raf = 0
    const cur = new Array<number>(n).fill(MIN)
    const loop = (now: number) => {
      const t = now / 1000
      const lv = levelRef.current
      // Without a measured level, synthesise a speech-like envelope.
      const amp = lv === undefined ? 0.42 + 0.28 * Math.sin(t * 2.3) * Math.sin(t * 0.9 + 1) : Math.max(0.05, lv)
      for (let i = 0; i < n; i++) {
        const p = shape[i]
        const wobble = 0.55 + 0.3 * Math.sin(t * p.speed + p.phase) + 0.15 * Math.sin(t * p.speed2 + p.phase * 0.5)
        const target = Math.min(1, MIN + amp * p.env * wobble * 1.15)
        cur[i] += (target - cur[i]) * 0.35
        const el = refs.current[i]
        if (el) el.style.transform = `scaleY(${cur[i].toFixed(3)})`
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      // Hand the bars back to React's static value (the DOM still holds the last animated frame).
      refs.current.forEach((el, i) => {
        if (el) el.style.transform = staticRef.current[i] ?? `scaleY(${MIN})`
      })
    }
  }, [active, still, n, shape])

  // Static heights (inactive, Lite, reduced motion): React-rendered.
  const staticScale = (i: number) => {
    if (!active) return MIN
    const amp = lvl === undefined ? 0.5 : lvl
    return Math.min(1, MIN + amp * shape[i].env * 0.9)
  }
  const animated = active && !still
  // Constant while animated, so React never overwrites the rAF-driven value.
  const statics = shape.map((_, i) => (animated ? `scaleY(${MIN})` : `scaleY(${staticScale(i).toFixed(3)})`))
  staticRef.current = statics

  return (
    <div
      aria-hidden
      className={cn('flex h-10 items-center justify-center gap-[3px]', className)}
      data-active={active ? '' : undefined}
    >
      {shape.map((p, i) => (
        <span
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          className={cn(
            'block h-full w-[3px] shrink-0 origin-center rounded-full',
            !animated && 'transition-transform duration-300 ease-out',
          )}
          style={{
            background: p.color,
            opacity: active ? 0.95 : 0.35,
            boxShadow: active ? `0 0 6px ${p.color.replace('rgb', 'rgba').replace(')', ', 0.45)')}` : undefined,
            transform: statics[i],
          }}
        />
      ))}
    </div>
  )
}
