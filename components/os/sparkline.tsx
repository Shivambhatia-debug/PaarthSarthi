'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

export interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  stroke?: string
  showDot?: boolean
  className?: string
  /** Optional (additive): soft area fill under the line. Default true. */
  fill?: boolean
}

/** Pure-SVG sparkline (no recharts). Smooth line, soft area fill, glowing end dot. */
export function Sparkline({
  data,
  width = 80,
  height = 24,
  stroke = '#22d3ee',
  showDot = true,
  className,
  fill = true,
}: SparklineProps) {
  const rid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const pts = (Array.isArray(data) ? data : []).filter((v) => typeof v === 'number' && Number.isFinite(v))
  const w = Math.max(8, width)
  const h = Math.max(8, height)
  const pad = showDot ? 3 : 1.5

  if (pts.length === 0) {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={cn('overflow-visible', className)} aria-hidden>
        <line x1={pad} x2={w - pad} y1={h / 2} y2={h / 2} stroke="#475569" strokeWidth={1.5} strokeDasharray="2 3" />
      </svg>
    )
  }

  const series = pts.length === 1 ? [pts[0], pts[0]] : pts
  let lo = Math.min(...series)
  let hi = Math.max(...series)
  if (hi - lo < 1e-9) {
    lo -= 1
    hi += 1
  }
  const xs = (i: number) => pad + (i * (w - pad * 2)) / (series.length - 1)
  const ys = (v: number) => pad + (1 - (v - lo) / (hi - lo)) * (h - pad * 2)
  const coords = series.map((v, i) => [xs(i), ys(v)] as const)

  // Monotone-ish smoothing with Catmull-Rom -> cubic Bezier (tension 0.5, clamped to the box).
  let d = `M${coords[0][0].toFixed(2)},${coords[0][1].toFixed(2)}`
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(0, i - 1)]
    const p1 = coords[i]
    const p2 = coords[i + 1]
    const p3 = coords[Math.min(coords.length - 1, i + 2)]
    const t = 0.18
    const c1x = p1[0] + (p2[0] - p0[0]) * t
    const c1y = Math.min(h - pad, Math.max(pad, p1[1] + (p2[1] - p0[1]) * t))
    const c2x = p2[0] - (p3[0] - p1[0]) * t
    const c2y = Math.min(h - pad, Math.max(pad, p2[1] - (p3[1] - p1[1]) * t))
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`
  }
  const last = coords[coords.length - 1]
  const area = `${d} L${last[0].toFixed(2)},${h} L${coords[0][0].toFixed(2)},${h} Z`
  const gid = `spk-${rid}`

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={cn('overflow-visible', className)} aria-hidden>
      {fill && (
        <defs>
          <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
      )}
      {fill && <path d={area} fill={`url(#${gid})`} stroke="none" />}
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      {showDot && <circle cx={last[0]} cy={last[1]} r={4.5} fill={stroke} opacity={0.22} />}
      {showDot && <circle cx={last[0]} cy={last[1]} r={2.2} fill={stroke} stroke="#0d1117" strokeWidth={0.8} />}
    </svg>
  )
}
