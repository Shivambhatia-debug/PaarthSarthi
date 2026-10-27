'use client'

import { useId } from 'react'
import { useDemo } from '@/lib/os/demo-store'
import { useCountUp } from '@/lib/ai-sim'
import { bandFor } from '@/lib/os/scoring'
import { fmtIN, isDevanagari, type Bi } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'

export interface ScoreRingProps {
  /** PRI or pillar score (0-100). null renders '—' with a slate ring. */
  value: number | null
  from?: number
  size?: number
  stroke?: number
  label?: string | Bi
  sublabel?: string | Bi
  showBand?: boolean
  durationMs?: number
  /** Optional (additive). */
  className?: string
}

// Light tint per band for the arc gradient (hex of the band itself comes from scoring.ts).
const TINT: Record<string, string> = {
  foundation: '#fecdd3',
  developing: '#fde68a',
  ready: '#a5f3fc',
  'drive-ready': '#a7f3d0',
}

const BAND_TICKS = [50, 70, 85]

function hexA(hex: string, a: number): string {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g, '$1$1') : h, 16)
  if (!Number.isFinite(n)) return `rgba(148,163,184,${a})`
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/**
 * Animated score ring (AI grammar step 3). The arc counts up from `from` to `value` over 1.2 s,
 * shifting colour as it crosses PRI bands (rose → amber → cyan → emerald), with band notches
 * at 50 / 70 / 85 and the band label underneath.
 */
export function ScoreRing({
  value,
  from = 0,
  size = 140,
  stroke = 10,
  label,
  sublabel,
  showBand = true,
  durationMs = 1200,
  className,
}: ScoreRingProps) {
  const { t } = useDemo()
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const has = typeof value === 'number' && Number.isFinite(value)
  const target = has ? clamp(value as number, 0, 100) : 0
  const decimals = has && !Number.isInteger(value) ? 1 : 0
  const start = typeof from === 'number' && Number.isFinite(from) ? clamp(from, 0, 100) : 0
  // Fine-grained value for a smooth arc; the label rounds it.
  const raw = useCountUp(target, { from: start, durationMs, start: has, decimals: 2 })
  const shown = has ? Math.round(raw * Math.pow(10, decimals)) / Math.pow(10, decimals) : null

  const s = Math.max(40, Math.round(Number.isFinite(size) ? size : 140))
  const sw = clamp(Number.isFinite(stroke) ? stroke : 10, 2, s / 4)
  const c = s / 2
  const r = c - sw / 2 - 1
  const C = 2 * Math.PI * r
  const pct = has ? clamp(raw / 100, 0, 1) : 0
  const band = bandFor(has ? raw : 0)
  const finalBand = has ? bandFor(target) : null
  const hex = band.hex
  const tint = TINT[band.id] ?? '#e2e8f0'
  const angle = pct * Math.PI * 2

  const labelText = label ? t(label) : ''
  const subText = sublabel ? t(sublabel) : ''
  const bandText = finalBand ? t(finalBand.label) : ''
  const big = s >= 104
  const numberSize = Math.max(14, Math.round(s * (big ? 0.26 : 0.29)))

  const aria = `${labelText || 'Score'}: ${has ? fmtIN(target, decimals) : 'pending'}${bandText ? `, ${bandText}` : ''}`

  return (
    <div className={cn('inline-flex shrink-0 flex-col items-center', className)}>
      <div role="img" aria-label={aria} className="relative" style={{ width: s, height: s }}>
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className="overflow-visible" aria-hidden>
          <defs>
            <linearGradient id={`psr-g-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={tint} style={{ transition: 'stop-color 400ms ease' }} />
              <stop offset="100%" stopColor={hex} style={{ transition: 'stop-color 400ms ease' }} />
            </linearGradient>
            <filter id={`psr-f-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={Math.max(1.5, sw * 0.55)} />
            </filter>
          </defs>

          {/* soft inner disc */}
          <circle cx={c} cy={c} r={Math.max(0, r - sw / 2 - 1)} fill={has ? hexA(hex, 0.05) : 'rgba(148,163,184,0.04)'} />

          <g transform={`rotate(-90 ${c} ${c})`}>
            {/* track */}
            <circle
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={has ? 'rgba(255,255,255,0.07)' : 'rgba(148,163,184,0.28)'}
              strokeWidth={sw}
              strokeLinecap="round"
              strokeDasharray={has ? undefined : `${Math.max(1, sw * 0.35)} ${Math.max(3, sw * 0.9)}`}
            />

            {/* band notches */}
            {has &&
              showBand &&
              s >= 96 &&
              BAND_TICKS.map((th) => {
                const a = (th / 100) * Math.PI * 2
                const r1 = r - sw / 2 - 5
                const r2 = r - sw / 2 - 1.5
                return (
                  <line
                    key={th}
                    x1={c + r1 * Math.cos(a)}
                    y1={c + r1 * Math.sin(a)}
                    x2={c + r2 * Math.cos(a)}
                    y2={c + r2 * Math.sin(a)}
                    stroke={bandFor(th).hex}
                    strokeOpacity={raw >= th ? 0.9 : 0.4}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                  />
                )
              })}

            {has && pct > 0 && (
              <>
                {/* glow */}
                <circle
                  cx={c}
                  cy={c}
                  r={r}
                  fill="none"
                  stroke={hex}
                  strokeOpacity={0.45}
                  strokeWidth={sw}
                  strokeLinecap="round"
                  strokeDasharray={`${C * pct} ${C}`}
                  filter={`url(#psr-f-${uid})`}
                />
                {/* arc */}
                <circle
                  cx={c}
                  cy={c}
                  r={r}
                  fill="none"
                  stroke={`url(#psr-g-${uid})`}
                  strokeWidth={sw}
                  strokeLinecap="round"
                  strokeDasharray={`${C * pct} ${C}`}
                />
                {/* leading cap */}
                {pct > 0.015 && (
                  <circle
                    cx={c + r * Math.cos(angle)}
                    cy={c + r * Math.sin(angle)}
                    r={Math.max(1.5, sw * 0.28)}
                    fill="#ffffff"
                    fillOpacity={0.9}
                  />
                )}
              </>
            )}
          </g>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn('font-semibold leading-none tabular-nums tracking-tight', has ? 'text-white' : 'text-slate-500')}
            style={{ fontSize: numberSize }}
          >
            {shown === null ? '—' : fmtIN(shown, decimals)}
          </span>
          {big && labelText && (
            <span
              lang={isDevanagari(labelText) ? 'hi' : undefined}
              className={cn(
                'mt-1.5 max-w-[80%] truncate text-center text-[12px] font-medium uppercase tracking-[0.12em] text-gray-400',
                isDevanagari(labelText) && 'font-deva normal-case tracking-normal',
              )}
            >
              {labelText}
            </span>
          )}
        </div>
      </div>

      {!big && labelText && (
        <span
          lang={isDevanagari(labelText) ? 'hi' : undefined}
          className={cn('mt-1.5 text-center text-[12px] font-medium text-gray-400', isDevanagari(labelText) && 'font-deva')}
        >
          {labelText}
        </span>
      )}

      {showBand && finalBand && (
        <span
          lang={isDevanagari(bandText) ? 'hi' : undefined}
          className={cn(
            'mt-2 inline-flex items-center gap-1.5 whitespace-nowrap font-medium',
            big ? 'rounded-full border px-2.5 py-0.5 text-[12px]' : 'text-[12px]',
            isDevanagari(bandText) && 'font-deva',
          )}
          style={
            big
              ? { color: finalBand.hex, background: hexA(finalBand.hex, 0.1), borderColor: hexA(finalBand.hex, 0.3) }
              : { color: finalBand.hex }
          }
        >
          <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: finalBand.hex, boxShadow: `0 0 6px ${finalBand.hex}` }} />
          {bandText}
        </span>
      )}

      {subText && (
        <span
          lang={isDevanagari(subText) ? 'hi' : undefined}
          className={cn('mt-1.5 max-w-[16rem] text-center text-[12px] leading-snug text-gray-400', isDevanagari(subText) && 'font-deva')}
        >
          {subText}
        </span>
      )}
    </div>
  )
}
