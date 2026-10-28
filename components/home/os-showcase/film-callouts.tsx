'use client'

/* Crisp HTML callouts for the hero product film: 1-2 per scene, timed to the moment the footage
 * shows the same thing (cue times in media.ts). PURE for "/": no DemoProvider writes. */

import type { ReactNode } from 'react'
import { Briefcase, CheckCircle2, Languages, MapPin, ShieldAlert, ShieldCheck, Sparkles, Ticket } from 'lucide-react'
import { AIOrb } from '@/components/ai/ai-orb'
import { cn } from '@/lib/utils'
import { STORY } from './media'

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 rounded-xl border border-white/[0.12] bg-[#0b1322]/[0.92] px-3 py-2 text-left shadow-[0_18px_44px_-14px_rgba(0,0,0,0.85),0_0_0_1px_rgba(0,0,0,0.25)] backdrop-blur-md',
        className,
      )}
    >
      {children}
    </div>
  )
}

function IconTile({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset', className)}>
      {children}
    </span>
  )
}

const Kicker = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn('block text-[11px] font-medium leading-4 text-gray-400', className)}>{children}</span>
)
const Line = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn('block text-[13px] font-semibold sm:whitespace-nowrap leading-[18px] text-white', className)}>{children}</span>
)

/** Small static readiness ring (amber band for 50-69). */
function MiniRing({ value, color = '#fbbf24' }: { value: number; color?: string }) {
  const r = 14
  const C = 2 * Math.PI * r
  return (
    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
      <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden className="absolute inset-0 -rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3.5" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={`${(C * value) / 100} ${C}`}
          style={{ filter: `drop-shadow(0 0 3px ${color}88)` }}
        />
      </svg>
      <span className="relative text-[12px] font-semibold tabular-nums text-white">{value}</span>
    </span>
  )
}

function Waveform() {
  const h = [0.45, 0.8, 0.55, 1, 0.65, 0.9, 0.4]
  return (
    <span aria-hidden className="flex h-6 shrink-0 items-center gap-[3px]">
      {h.map((v, i) => (
        <span
          key={i}
          className="psx-anim block w-[3px] origin-center rounded-full bg-gradient-to-t from-cyan-400 to-emerald-300"
          style={{ height: `${v * 100}%`, animation: `psx-bar ${0.7 + (i % 3) * 0.18}s ease-in-out ${i * 0.07}s infinite` }}
        />
      ))}
    </span>
  )
}

function Meter({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <span className="block min-w-[78px]">
      <span className="flex items-baseline justify-between gap-2 text-[11px] text-gray-400">
        {label}
        <span className="text-[13px] font-semibold tabular-nums text-white">{value}</span>
      </span>
      <span className="mt-1 block h-1 overflow-hidden rounded-full bg-white/10">
        <span className={cn('block h-full rounded-full', tone)} style={{ width: `${value}%` }} />
      </span>
    </span>
  )
}

function Spark({ values }: { values: number[] }) {
  const w = 54
  const h = 28
  const pts = values.map((v, i) => [3 + (i * (w - 6)) / (values.length - 1), h - 3 - ((v - 30) / 50) * (h - 6)] as const)
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="shrink-0">
      <polyline
        points={pts.map((p) => p.join(',')).join(' ')}
        fill="none"
        stroke="url(#psf-spark)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="psf-spark" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
      </defs>
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 2.8 : 2} fill={i === pts.length - 1 ? '#34d399' : '#e2e8f0'} />
      ))}
    </svg>
  )
}

const HINDI_GAP = 'पूर्णिया प्रमंडल: संवाद कौशल सबसे बड़ी कमी'

/** Callout content per scene id: [cue 0, cue 1]. */
const CALLOUTS: Record<string, [() => ReactNode, () => ReactNode]> = {
  hallticket: [
    () => (
      <Card>
        <MiniRing value={STORY.priMid} />
        <span>
          <Kicker>Placement Readiness Index</Kicker>
          <Line>
            PRI {STORY.priMid} · <span className="text-amber-300">Developing</span>
          </Line>
        </span>
      </Card>
    ),
    () => (
      <Card>
        <IconTile className="bg-cyan-400/10 text-cyan-200 ring-cyan-300/20">
          <Ticket className="h-4 w-4" />
        </IconTile>
        <span>
          <Kicker>Hall ticket issued</Kicker>
          <Line>Hall ticket · {STORY.blueprint}</Line>
        </span>
        <span className="ml-1 inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[12px] font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-300/25">
          Eligible ✓
        </span>
      </Card>
    ),
  ],
  aptitude: [
    () => (
      <Card className="border-rose-400/30 bg-[#1a0c14]/[0.94]">
        <IconTile className="bg-rose-500/15 text-rose-300 ring-rose-400/25">
          <ShieldAlert className="h-4 w-4" />
        </IconTile>
        <span>
          <Kicker className="text-rose-300/80">Live proctoring · in the browser</Kicker>
          <Line className="text-rose-50">Proctor: tab switch detected (1/3)</Line>
        </span>
      </Card>
    ),
    () => (
      <Card>
        <IconTile className="bg-emerald-400/10 text-emerald-300 ring-emerald-300/20">
          <ShieldCheck className="h-4 w-4" />
        </IconTile>
        <span className="block min-w-[120px]">
          <span className="flex items-baseline justify-between gap-3">
            <Line>Integrity {STORY.integrity}</Line>
            <span className="text-[11px] text-gray-400">Aptitude {STORY.aptitude}</span>
          </span>
          <span className="mt-1 block h-1 overflow-hidden rounded-full bg-white/10">
            <span className="block h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300" style={{ width: `${STORY.integrity}%` }} />
          </span>
        </span>
      </Card>
    ),
  ],
  coding: [
    () => (
      <Card>
        <IconTile className="bg-gradient-to-br from-blue-500/25 to-emerald-400/25 text-cyan-200 ring-white/10">
          <Sparkles className="h-4 w-4" />
        </IconTile>
        <span>
          <Kicker className="text-cyan-200/80">Sarthi AI code review</Kicker>
          <Line className="font-mono tracking-tight">
            <span className="text-rose-300">O(n²)</span> <span className="text-gray-500">→</span>{' '}
            <span className="text-emerald-300">O(n)</span>
          </Line>
        </span>
      </Card>
    ),
    () => (
      <Card>
        <IconTile className="bg-emerald-400/10 text-emerald-300 ring-emerald-300/20">
          <CheckCircle2 className="h-4 w-4" />
        </IconTile>
        <span>
          <Kicker>Hidden tests · Technical round</Kicker>
          <Line>
            10/10 tests · <span className="text-cyan-200">{STORY.technical}</span>
          </Line>
        </span>
      </Card>
    ),
  ],
  interview: [
    () => (
      <Card className="gap-2">
        <AIOrb state="speaking" size={30} label="" />
        <Waveform />
        <span className="ml-0.5 rounded-full bg-cyan-400/10 sm:whitespace-nowrap px-2.5 py-1 text-[12px] font-medium text-cyan-100 ring-1 ring-inset ring-cyan-300/25">
          Because you said: <span className="font-semibold text-white">ESP32</span>
        </span>
      </Card>
    ),
    () => (
      <Card className="flex-col items-stretch gap-1.5 py-2.5">
        <Kicker>Language-fair interview score</Kicker>
        <span className="flex gap-4">
          <Meter label="Content" value={STORY.interviewContent} tone="bg-emerald-400" />
          <Meter label="Delivery" value={STORY.interviewDelivery} tone="bg-amber-400" />
        </span>
      </Card>
    ),
  ],
  // The footage already shows the big 71 and the 42 → 58 → 71 history: the cards add the trend, then the payoff.
  report: [
    () => (
      <Card>
        <Spark values={[STORY.priStart, STORY.priMid, STORY.priNow]} />
        <span>
          <Line className="tabular-nums">
            PRI {STORY.priStart} → {STORY.priMid} → {STORY.priNow}
          </Line>
          <Kicker className="text-emerald-300/90">in {STORY.days} days</Kicker>
        </span>
      </Card>
    ),
    () => (
      <Card>
        <IconTile className="bg-emerald-400/10 text-emerald-300 ring-emerald-300/20">
          <Briefcase className="h-4 w-4" />
        </IconTile>
        <span>
          <Kicker>New drives open up</Kicker>
          <Line className="tabular-nums">
            Eligible drives {STORY.drivesBefore} <span className="text-gray-500">→</span>{' '}
            <span className="text-emerald-300">{STORY.drivesNow}</span>
          </Line>
        </span>
      </Card>
    ),
  ],
  state: [
    () => (
      <Card>
        <IconTile className="bg-violet-400/10 text-violet-200 ring-violet-300/20">
          <Languages className="h-4 w-4" />
        </IconTile>
        <span>
          <Kicker>DSTTE command centre</Kicker>
          <Line>Ask Sarthi · Hindi</Line>
        </span>
      </Card>
    ),
    () => (
      <Card>
        <IconTile className="bg-amber-400/10 text-amber-200 ring-amber-300/20">
          <MapPin className="h-4 w-4" />
        </IconTile>
        <span lang="hi" className="font-deva block text-[13.5px] sm:whitespace-nowrap font-semibold leading-5 text-white">
          {HINDI_GAP}
        </span>
      </Card>
    ),
  ],
}

export function SceneCallout({ sceneId, cue }: { sceneId: string; cue: number }) {
  const render = CALLOUTS[sceneId]?.[cue]
  return render ? <>{render()}</> : null
}
