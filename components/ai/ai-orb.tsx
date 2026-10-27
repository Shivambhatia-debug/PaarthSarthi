'use client'

import { useId, type CSSProperties } from 'react'
import { useDemo } from '@/lib/os/demo-store'
import { useReducedMotion } from '@/lib/ai-sim'
import { cn } from '@/lib/utils'

type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking'

export interface AIOrbProps {
  state?: OrbState
  /** 0-1 (mic or speech level). Drives scale/glow while speaking and the listening ring. */
  level?: number
  size?: number
  className?: string
  /** Optional (additive): accessible label. */
  label?: string
}

// Component-scoped keyframes, hoisted to <head> once by React 19 (href + precedence).
const ORB_CSS = `
@keyframes psai-orb-spin { to { transform: rotate(360deg) } }
@keyframes psai-orb-breathe { 0%, 100% { transform: scale(1) } 50% { transform: scale(1.04) } }
@keyframes psai-orb-think { 0%, 100% { transform: scale(0.97) } 50% { transform: scale(1.0) } }
@keyframes psai-orb-talk {
  0% { transform: scale(1) } 14% { transform: scale(1.07) } 28% { transform: scale(1.015) }
  44% { transform: scale(1.1) } 60% { transform: scale(1.03) } 76% { transform: scale(1.08) } 100% { transform: scale(1) }
}
@keyframes psai-orb-glow { 0%, 100% { opacity: 0.5 } 50% { opacity: 0.85 } }
@keyframes psai-orb-ripple { 0% { transform: scale(0.94); opacity: 0.6 } 100% { transform: scale(1.5); opacity: 0 } }
@keyframes psai-orb-sheen { 0% { background-position: 160% 0 } 100% { background-position: -60% 0 } }
@media (prefers-reduced-motion: reduce) { .psai-orb-anim { animation: none !important } }
.os-lite .psai-orb-anim { animation: none !important }
`

type Palette = { core: string; swirl: string; halo: string; glow: string; rim: string }

const BRAND: Palette = {
  core: 'radial-gradient(circle at 34% 28%, #f0f9ff 0%, #a5f3fc 8%, #38bdf8 22%, #2563eb 46%, #1e3a8a 72%, #0a1330 100%)',
  swirl:
    'conic-gradient(from 0deg, rgba(52,211,153,0) 0deg, rgba(52,211,153,0.8) 55deg, rgba(34,211,238,0) 125deg, rgba(96,165,250,0.75) 200deg, rgba(129,140,248,0) 270deg, rgba(34,211,238,0.7) 325deg, rgba(52,211,153,0) 360deg)',
  halo: 'conic-gradient(from 90deg, #60a5fa, #22d3ee, #34d399, #22d3ee, #818cf8, #60a5fa)',
  glow: 'radial-gradient(circle, rgba(34,211,238,0.5) 0%, rgba(59,130,246,0.26) 38%, rgba(59,130,246,0) 70%)',
  rim: 'radial-gradient(circle at 62% 108%, rgba(52,211,153,0.6), rgba(52,211,153,0) 46%)',
}

const LISTEN: Palette = {
  core: 'radial-gradient(circle at 34% 28%, #f0fdfa 0%, #a7f3d0 8%, #2dd4bf 24%, #0891b2 48%, #164e63 74%, #061a22 100%)',
  swirl:
    'conic-gradient(from 0deg, rgba(110,231,183,0) 0deg, rgba(110,231,183,0.85) 60deg, rgba(34,211,238,0) 130deg, rgba(56,189,248,0.75) 210deg, rgba(45,212,191,0) 285deg, rgba(103,232,249,0.7) 330deg, rgba(110,231,183,0) 360deg)',
  halo: 'conic-gradient(from 90deg, #34d399, #22d3ee, #38bdf8, #22d3ee, #34d399)',
  glow: 'radial-gradient(circle, rgba(45,212,191,0.5) 0%, rgba(34,211,238,0.24) 40%, rgba(34,211,238,0) 70%)',
  rim: 'radial-gradient(circle at 62% 108%, rgba(56,189,248,0.6), rgba(56,189,248,0) 46%)',
}

const VIOLET: Palette = {
  core: 'radial-gradient(circle at 34% 28%, #faf5ff 0%, #e9d5ff 8%, #c084fc 22%, #7c3aed 46%, #4c1d95 72%, #150a2c 100%)',
  swirl:
    'conic-gradient(from 0deg, rgba(232,121,249,0) 0deg, rgba(232,121,249,0.8) 60deg, rgba(167,139,250,0) 130deg, rgba(129,140,248,0.75) 210deg, rgba(192,132,252,0) 280deg, rgba(244,114,182,0.6) 330deg, rgba(232,121,249,0) 360deg)',
  halo: 'conic-gradient(from 90deg, #a78bfa, #e879f9, #818cf8, #c084fc, #a78bfa)',
  glow: 'radial-gradient(circle, rgba(167,139,250,0.55) 0%, rgba(139,92,246,0.26) 40%, rgba(139,92,246,0) 70%)',
  rim: 'radial-gradient(circle at 62% 108%, rgba(232,121,249,0.55), rgba(232,121,249,0) 46%)',
}

const PALETTES: { key: 'brand' | 'listen' | 'violet'; p: Palette }[] = [
  { key: 'brand', p: BRAND },
  { key: 'listen', p: LISTEN },
  { key: 'violet', p: VIOLET },
]

const STATE_LABEL: Record<OrbState, string> = {
  idle: 'ready',
  listening: 'listening',
  thinking: 'thinking',
  speaking: 'speaking',
}

function ringMask(width: number): CSSProperties {
  const m = `radial-gradient(farthest-side, transparent calc(100% - ${width}px), #000 calc(100% - ${width - 0.5}px))`
  return { WebkitMaskImage: m, maskImage: m }
}

/**
 * The Sarthi AI orb: layered radial + conic gradients with a rotating halo.
 * idle breathes; speaking scales with `level` and glows; listening shows a dashed ring that
 * follows `level`; thinking turns violet with a sheen and orbiting sparks.
 * Lite mode renders a static circle; reduced motion freezes every animation.
 */
export function AIOrb({ state = 'idle', level, size = 160, className, label }: AIOrbProps) {
  const { state: demo } = useDemo()
  const reduced = useReducedMotion()
  const gradId = `psai-orb-dash-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const lite = !!demo.lite
  const s = Math.max(16, Math.round(Number.isFinite(size) ? size : 160))
  const st: OrbState = STATE_LABEL[state] ? state : 'idle'
  const lvl = typeof level === 'number' && Number.isFinite(level) ? Math.min(1, Math.max(0, level)) : undefined
  const active: 'brand' | 'listen' | 'violet' = st === 'thinking' ? 'violet' : st === 'listening' ? 'listen' : 'brand'
  const aria = label ?? `Sarthi AI ${STATE_LABEL[st]}`
  // label="" marks the orb as decorative (e.g. inside AIThinking, which has its own text).
  const a11y = label === '' ? { 'aria-hidden': true as const } : { role: 'img', 'aria-label': aria }

  // ---- Lite: one static circle (no filters, no animation) -----------------------------------
  if (lite) {
    const p = active === 'violet' ? VIOLET : active === 'listen' ? LISTEN : BRAND
    const ring = st === 'idle' ? 'rgba(255,255,255,0.10)' : active === 'violet' ? '#a78bfa' : active === 'listen' ? '#2dd4bf' : '#38bdf8'
    return (
      <div
        {...a11y}
        className={cn('relative shrink-0 rounded-full', className)}
        style={{ width: s, height: s, background: p.core, boxShadow: `0 0 0 ${Math.max(1, s * 0.012)}px ${ring}, inset 0 0 ${s * 0.12}px rgba(0,0,0,0.45)` }}
      />
    )
  }

  const still = reduced
  const small = s < 56
  const tiny = s < 32
  const ringW = Math.max(1.5, s * 0.018)
  const anim = (value: string): CSSProperties => (still ? {} : { animation: value })

  // Core transform per state
  let coreStyle: CSSProperties = {}
  if (!still) {
    if (st === 'idle') coreStyle = { animation: 'psai-orb-breathe 3s ease-in-out infinite' }
    else if (st === 'thinking') coreStyle = { animation: 'psai-orb-think 1.6s ease-in-out infinite' }
    else if (st === 'speaking') {
      coreStyle =
        lvl === undefined
          ? { animation: 'psai-orb-talk 1.5s ease-in-out infinite' }
          : { transform: `scale(${1 + lvl * 0.12})`, transition: 'transform 110ms linear' }
    } else if (st === 'listening') {
      coreStyle = { transform: `scale(${1 + (lvl ?? 0) * 0.04})`, transition: 'transform 120ms linear' }
    }
  }

  const glowOpacity =
    st === 'speaking' ? 0.7 + (lvl ?? 0.3) * 0.3 : st === 'listening' ? 0.45 + (lvl ?? 0) * 0.55 : st === 'thinking' ? 0.8 : 0.6
  const haloSpeed = st === 'thinking' ? '2.4s' : st === 'speaking' ? '4s' : '6s'
  const glowBlur = Math.max(4, s * 0.12)

  return (
    <div {...a11y} className={cn('relative shrink-0 select-none', className)} style={{ width: s, height: s }}>
      <style href="psai-orb" precedence="default">
        {ORB_CSS}
      </style>

      {/* 1. Ambient glow */}
      {PALETTES.map(({ key, p }) => (
        <div
          key={`glow-${key}`}
          aria-hidden
          className="pointer-events-none absolute rounded-full transition-opacity duration-500"
          style={{
            inset: `-${tiny ? 10 : 22}%`,
            background: p.glow,
            filter: `blur(${glowBlur}px)`,
            opacity: key === active ? glowOpacity : 0,
          }}
        />
      ))}
      {st === 'idle' && !still && (
        <div
          aria-hidden
          className="psai-orb-anim pointer-events-none absolute rounded-full"
          style={{ inset: '-12%', background: BRAND.glow, filter: `blur(${glowBlur}px)`, ...anim('psai-orb-glow 3s ease-in-out infinite') }}
        />
      )}

      {/* 2. Listening ripples */}
      {st === 'listening' && !small && !still && (
        <>
          {[0, 1].map((i) => (
            <div
              key={`ripple-${i}`}
              aria-hidden
              className="psai-orb-anim pointer-events-none absolute rounded-full border"
              style={{
                inset: '6%',
                borderColor: `rgba(45,212,191,${0.35 + (lvl ?? 0.2) * 0.5})`,
                animation: `psai-orb-ripple 2.4s cubic-bezier(0.2,0.6,0.3,1) ${i * 1.2}s infinite`,
              }}
            />
          ))}
        </>
      )}

      {/* 3. Rotating conic halo ring */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{ inset: tiny ? '0%' : '2%' }}
      >
        {PALETTES.map(({ key, p }) => (
          <div
            key={`halo-${key}`}
            className="psai-orb-anim absolute inset-0 rounded-full transition-opacity duration-500"
            style={{
              background: p.halo,
              opacity: key === active ? (st === 'idle' ? 0.75 : 1) : 0,
              ...ringMask(ringW),
              ...(key === active ? anim(`psai-orb-spin ${haloSpeed} linear infinite`) : {}),
            }}
          />
        ))}
      </div>

      {/* 4. Core sphere */}
      <div aria-hidden className="psai-orb-anim absolute rounded-full" style={{ inset: tiny ? '10%' : '9%', ...coreStyle }}>
        <div
          className="absolute inset-0 overflow-hidden rounded-full"
          style={{
            boxShadow:
              st === 'speaking'
                ? `0 0 ${s * 0.16}px ${s * 0.01}px rgba(56,189,248,${0.35 + (lvl ?? 0.4) * 0.4})`
                : st === 'thinking'
                  ? `0 0 ${s * 0.14}px rgba(167,139,250,0.45)`
                  : `0 0 ${s * 0.1}px rgba(34,211,238,0.25)`,
            transition: 'box-shadow 160ms linear',
          }}
        >
          {PALETTES.map(({ key, p }) => (
            <div
              key={`core-${key}`}
              className="absolute inset-0 transition-opacity duration-500"
              style={{ background: p.core, opacity: key === active ? 1 : 0 }}
            />
          ))}
          {/* swirling inner light */}
          {!tiny &&
            PALETTES.map(({ key, p }) => (
              <div
                key={`swirl-${key}`}
                className="psai-orb-anim absolute transition-opacity duration-500"
                style={{
                  inset: '-30%',
                  background: p.swirl,
                  filter: `blur(${Math.max(2, s * 0.07)}px)`,
                  mixBlendMode: 'screen',
                  opacity: key === active ? (st === 'idle' ? 0.55 : 0.75) : 0,
                  ...(key === active ? anim(`psai-orb-spin ${st === 'thinking' ? '3s' : '9s'} linear infinite reverse`) : {}),
                }}
              />
            ))}
          {/* rim light */}
          {PALETTES.map(({ key, p }) => (
            <div
              key={`rim-${key}`}
              className="absolute inset-0 transition-opacity duration-500"
              style={{ background: p.rim, mixBlendMode: 'screen', opacity: key === active ? 1 : 0 }}
            />
          ))}
          {/* specular highlight */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 42% 30% at 33% 22%, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.16) 45%, rgba(255,255,255,0) 72%)',
            }}
          />
          {/* depth */}
          <div className="absolute inset-0 rounded-full" style={{ boxShadow: `inset 0 ${-s * 0.04}px ${s * 0.12}px rgba(0,0,0,0.45)` }} />
          {/* thinking sheen */}
          {st === 'thinking' && !still && (
            <div
              className="psai-orb-anim absolute inset-0"
              style={{
                backgroundImage: 'linear-gradient(115deg, rgba(255,255,255,0) 32%, rgba(255,255,255,0.32) 48%, rgba(255,255,255,0) 64%)',
                backgroundSize: '260% 100%',
                animation: 'psai-orb-sheen 1.6s linear infinite',
              }}
            />
          )}
        </div>
      </div>

      {/* 5. Listening: dashed ring that follows the mic level */}
      {st === 'listening' && !tiny && (
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{ inset: '-7%', transform: `scale(${1 + (lvl ?? 0) * 0.22})`, transition: 'transform 90ms linear' }}
        >
          <svg viewBox="0 0 100 100" className="psai-orb-anim h-full w-full" style={anim('psai-orb-spin 10s linear infinite')}>
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth={small ? 2.2 : 1.4}
              strokeLinecap="round"
              strokeDasharray="1.5 5"
              opacity={0.55 + (lvl ?? 0) * 0.45}
            />
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#5eead4" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* 6. Thinking: orbiting sparks */}
      {st === 'thinking' && !small && !still && (
        <div aria-hidden className="psai-orb-anim pointer-events-none absolute inset-0" style={{ animation: 'psai-orb-spin 2.2s linear infinite' }}>
          {[0, 120, 240].map((deg, i) => (
            <div key={deg} className="absolute inset-0" style={{ transform: `rotate(${deg}deg)` }}>
              <span
                className="absolute left-1/2 top-0 block rounded-full bg-violet-200"
                style={{
                  width: Math.max(4, s * 0.035) * (i === 0 ? 1.3 : 1),
                  height: Math.max(4, s * 0.035) * (i === 0 ? 1.3 : 1),
                  transform: 'translate(-50%, -10%)',
                  boxShadow: '0 0 10px 2px rgba(196,181,253,0.85)',
                  opacity: i === 0 ? 1 : 0.7,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
