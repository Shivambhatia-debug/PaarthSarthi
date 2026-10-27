// Inline-SVG engineering drawing for the core-technical MCQ (L-bracket, first-angle projection).
// Pure presentational, no hooks. Dimensions in mm; 1 mm = S px.

import type { DrawingOptionId } from '@/components/placement/technical/core-items'
import { cn } from '@/lib/utils'

const S = 1.6
const LINE = '#a5f3fc' // cyan-200: visible edges
const HIDDEN = '#67e8f9' // cyan-300: hidden edges (dashed)
const DIM = '#6b7280' // gray-500: dimensions / labels
const LABEL = '#9ca3af' // gray-400

// Part: base 60 (x) × 40 (y) × 10 (z), upright 10 (x) × 40 (y) × 50 (z) on the LEFT.
const W = 60
const D = 40
const H = 50
const T = 10

type Pt = [number, number]

/** Polygon points for a front view (x right, z up) inside a box of height H, at origin (ox, oy) in px. */
function poly(points: Pt[], ox: number, oy: number, s = S): string {
  return points.map(([x, z]) => `${(ox + x * s).toFixed(1)},${(oy + (H - z) * s).toFixed(1)}`).join(' ')
}

const FRONT_SHAPES: Record<DrawingOptionId, { outline: Pt[]; extra?: { from: Pt; to: Pt; hidden?: boolean }[] }> = {
  // Γ: leg on the left, flange at the top (upside-down part).
  gamma: { outline: [[0, H], [W, H], [W, H - T], [T, H - T], [T, 0], [0, 0]] },
  // Correct: L with the upright on the left.
  'l-left': { outline: [[0, 0], [W, 0], [W, T], [T, T], [T, H], [0, H]] },
  // Mirror image: the view from the rear.
  'l-right': { outline: [[0, 0], [W, 0], [W, H], [W - T, H], [W - T, T], [0, T]] },
  // Rectangle with a visible line: reads the base as a through-slab.
  rect: { outline: [[0, 0], [W, 0], [W, H], [0, H]], extra: [{ from: [0, T], to: [W, T] }] },
}

function DimH({ x1, x2, y, label, below = false }: { x1: number; x2: number; y: number; label: string; below?: boolean }) {
  return (
    <g stroke={DIM} strokeWidth={0.8} fill="none">
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <line x1={x1} y1={y - 3} x2={x1} y2={y + 3} />
      <line x1={x2} y1={y - 3} x2={x2} y2={y + 3} />
      <text x={(x1 + x2) / 2} y={below ? y + 14 : y - 4} fill={DIM} stroke="none" fontSize={12} textAnchor="middle" fontFamily="ui-monospace, monospace">
        {label}
      </text>
    </g>
  )
}

function DimV({ y1, y2, x, label, left = false }: { y1: number; y2: number; x: number; label: string; left?: boolean }) {
  return (
    <g stroke={DIM} strokeWidth={0.8} fill="none">
      <line x1={x} y1={y1} x2={x} y2={y2} />
      <line x1={x - 3} y1={y1} x2={x + 3} y2={y1} />
      <line x1={x - 3} y1={y2} x2={x + 3} y2={y2} />
      <text
        x={left ? x - 5 : x + 5}
        y={(y1 + y2) / 2 + 4}
        fill={DIM}
        stroke="none"
        fontSize={12}
        textAnchor={left ? 'end' : 'start'}
        fontFamily="ui-monospace, monospace"
      >
        {label}
      </text>
    </g>
  )
}

export interface EngineeringDrawingProps {
  className?: string
  /** Show the correct front view in the empty slot (review / answer reveal). */
  reveal?: boolean
}

/**
 * The question figure: TOP and LEFT views of an L-bracket in first-angle projection, with the FRONT
 * view left blank ("?"). First angle: the top view sits below the front view, the left view to its right.
 */
export function EngineeringDrawing({ className, reveal = false }: EngineeringDrawingProps) {
  // Layout (px)
  const fx = 34 // front view origin x
  const fy = 30 // front view origin y (top of the H box)
  const fw = W * S
  const fh = H * S
  const gap = 40
  const sx = fx + fw + gap // left view x
  const ty = fy + fh + gap // top view y
  const sw = D * S
  const tw = W * S
  const th = D * S
  const vbW = sx + sw + 44
  const vbH = ty + th + 50

  return (
    <figure className={cn('w-full', className)}>
      <div className="overflow-hidden rounded-xl border border-cyan-300/15 bg-[#07121a] p-2 [background-image:linear-gradient(rgba(103,232,249,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.05)_1px,transparent_1px)] [background-size:16px_16px]">
        <svg
          viewBox={`0 0 ${vbW} ${vbH}`}
          className="mx-auto block h-auto w-full max-w-[340px]"
          role="img"
          aria-label="L-bracket: top view and left side view in first-angle projection; front view to be identified"
        >
          {/* Front view slot */}
          {reveal ? (
            <polygon points={poly(FRONT_SHAPES['l-left'].outline, fx, fy)} fill="rgba(52,211,153,0.10)" stroke="#6ee7b7" strokeWidth={1.6} />
          ) : (
            <g>
              <rect x={fx} y={fy} width={fw} height={fh} rx={4} fill="rgba(167,139,250,0.06)" stroke="#a78bfa" strokeDasharray="5 4" strokeWidth={1.2} />
              <text x={fx + fw / 2} y={fy + fh / 2 + 9} fill="#c4b5fd" fontSize={26} fontWeight={700} textAnchor="middle">
                ?
              </text>
            </g>
          )}
          <text x={fx} y={fy - 12} fill={LABEL} fontSize={12} fontWeight={600} letterSpacing={1}>
            FRONT
          </text>

          {/* Left side view (right of front, first angle): upright face 40 × 50, hidden base top at z = 10 */}
          <rect x={sx} y={fy} width={sw} height={fh} fill="rgba(165,243,252,0.04)" stroke={LINE} strokeWidth={1.6} />
          <line x1={sx} y1={fy + (H - T) * S} x2={sx + sw} y2={fy + (H - T) * S} stroke={HIDDEN} strokeWidth={1.2} strokeDasharray="5 3" />
          <text x={sx} y={fy - 12} fill={LABEL} fontSize={12} fontWeight={600} letterSpacing={1}>
            LEFT
          </text>
          <DimV y1={fy + (H - T) * S} y2={fy + fh} x={sx + sw + 8} label="10" />

          {/* Top view (below front): 60 × 40 with the upright strip on the left */}
          <rect x={fx} y={ty} width={tw} height={th} fill="rgba(165,243,252,0.04)" stroke={LINE} strokeWidth={1.6} />
          <rect x={fx} y={ty} width={T * S} height={th} fill="rgba(165,243,252,0.10)" stroke="none" />
          <line x1={fx + T * S} y1={ty} x2={fx + T * S} y2={ty + th} stroke={LINE} strokeWidth={1.6} />
          <text x={fx} y={ty + th + 42} fill={LABEL} fontSize={12} fontWeight={600} letterSpacing={1}>
            TOP
          </text>
          <DimH x1={fx} x2={fx + T * S} y={ty - 8} label="10" />
          <DimH x1={fx} x2={fx + tw} y={ty + th + 10} label="60" below />
          <DimV y1={ty} y2={ty + th} x={fx + tw + 8} label="40" />

          {/* Projection lines (thin) */}
          <g stroke="rgba(148,163,184,0.18)" strokeWidth={0.8} strokeDasharray="2 4">
            <line x1={fx + fw + 4} y1={fy} x2={sx - 4} y2={fy} />
            <line x1={fx + fw + 4} y1={fy + fh} x2={sx - 4} y2={fy + fh} />
            <line x1={fx} y1={fy + fh + 4} x2={fx} y2={ty - 16} />
            <line x1={fx + tw} y1={fy + fh + 4} x2={fx + tw} y2={ty - 16} />
          </g>
          <DimV y1={fy} y2={fy + fh} x={fx - 10} label="50" left />

          {/* First-angle symbol */}
          <g transform={`translate(${sx + 4}, ${ty + 12})`} stroke={DIM} strokeWidth={1} fill="none">
            <polygon points="0,6 16,0 16,24 0,18" />
            <circle cx={34} cy={12} r={10} />
            <circle cx={34} cy={12} r={4} />
            <line x1={-4} y1={12} x2={48} y2={12} strokeDasharray="4 2" />
          </g>
        </svg>
      </div>
    </figure>
  )
}

export interface DrawingOptionProps {
  id: DrawingOptionId
  className?: string
}

/** One candidate FRONT view (options A–D). */
export function DrawingOption({ id, className }: DrawingOptionProps) {
  const s = 1.25
  const pad = 12
  const vbW = W * s + pad * 2
  const vbH = H * s + pad * 2
  const shape = FRONT_SHAPES[id] ?? FRONT_SHAPES.rect
  const pts = shape.outline.map(([x, z]) => `${(pad + x * s).toFixed(1)},${(pad + (H - z) * s).toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} className={cn('block h-auto w-full max-w-[120px]', className)} aria-hidden>
      <polygon points={pts} fill="rgba(165,243,252,0.06)" stroke={LINE} strokeWidth={1.6} strokeLinejoin="round" />
      {shape.extra?.map((l, i) => (
        <line
          key={i}
          x1={pad + l.from[0] * s}
          y1={pad + (H - l.from[1]) * s}
          x2={pad + l.to[0] * s}
          y2={pad + (H - l.to[1]) * s}
          stroke={l.hidden ? HIDDEN : LINE}
          strokeWidth={1.4}
          strokeDasharray={l.hidden ? '5 3' : undefined}
        />
      ))}
    </svg>
  )
}
