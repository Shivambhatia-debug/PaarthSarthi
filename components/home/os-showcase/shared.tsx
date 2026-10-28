'use client'

/* Shared bits for the home-page Placement OS showcase.
 * PURE for "/": no DemoProvider, toasts or demo-store writes. Foundation primitives used here
 * (AIOrb) fall back to a constant default store outside the (os) route group. */

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Info } from 'lucide-react'
import { AIOrb } from '@/components/ai/ai-orb'
import { cn } from '@/lib/utils'

export { useReducedMotion } from '@/lib/ai-sim'

// ---------------------------------------------------------------------------
// Keyframes (hoisted to <head> once by React 19 via href + precedence)
// ---------------------------------------------------------------------------
const SHOWCASE_CSS = `
@keyframes psx-kenburns { from { transform: scale(1.02) translate3d(0,0,0) } to { transform: scale(1.12) translate3d(-2%,-1.5%,0) } }
@keyframes psx-spin { to { transform: rotate(360deg) } }
@keyframes psx-float { 0%,100% { transform: translate3d(0,0,0) } 50% { transform: translate3d(0,-7px,0) } }
@keyframes psx-pop { 0% { opacity: 0; transform: translate3d(0,8px,0) scale(.94) } 100% { opacity: 1; transform: none } }
@keyframes psx-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes psx-bar { 0%,100% { transform: scaleY(.3) } 50% { transform: scaleY(1) } }
@keyframes psx-caret { 0%,49% { opacity: 1 } 50%,100% { opacity: 0 } }
@keyframes psx-ping { 0% { transform: scale(1); opacity: .65 } 100% { transform: scale(2.1); opacity: 0 } }
@keyframes psx-sheen { from { background-position: 200% 0 } to { background-position: -200% 0 } }
@keyframes psx-scan { 0% { transform: translate3d(0,-110%,0) } 100% { transform: translate3d(0,110%,0) } }
.psx-reveal { opacity: 0; transform: translate3d(0,18px,0); transition: opacity .7s cubic-bezier(.2,.7,.2,1), transform .7s cubic-bezier(.2,.7,.2,1) }
.psx-reveal.psx-in { opacity: 1; transform: none }
.psx-caret { animation: psx-caret 1s steps(1) infinite }
.psx-sheen { background-size: 200% 100%; animation: psx-sheen 6s linear infinite }
@media (prefers-reduced-motion: reduce) {
  .psx-anim, .psx-caret, .psx-sheen { animation: none !important }
  .psx-reveal { opacity: 1 !important; transform: none !important; transition: none !important }
}
`

export function ShowcaseStyles() {
  return (
    <style href="psx-showcase" precedence="default">
      {SHOWCASE_CSS}
    </style>
  )
}

// ---------------------------------------------------------------------------
// In-view hook
// ---------------------------------------------------------------------------
/** true once (or while, with once=false) the element intersects the viewport. */
export function useInView<T extends Element>(
  opts: { once?: boolean; rootMargin?: string; threshold?: number } = {},
): [RefObject<T | null>, boolean] {
  const { once = true, rootMargin = '0px 0px -8% 0px', threshold = 0 } = opts
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true)
          if (once) obs.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin, threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [once, rootMargin, threshold])
  return [ref, inView]
}

/** Fade-up on first view (always visible under reduced motion). */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'li' | 'section' | 'header'
}) {
  const [ref, inView] = useInView<HTMLDivElement>()
  return (
    <Tag
      ref={ref as never}
      className={cn('psx-reveal', inView && 'psx-in', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}

// ---------------------------------------------------------------------------
// Small UI atoms
// ---------------------------------------------------------------------------
export function HonestyChip({ label = 'Illustrative demo data', className }: { label?: string; className?: string }) {
  return (
    <span
      title="All numbers in the demo are illustrative unless marked “as reported”."
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/[0.06] px-2.5 py-1 text-xs font-medium text-amber-200',
        className,
      )}
    >
      <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {label}
    </span>
  )
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300',
        className,
      )}
    >
      <span aria-hidden className="h-px w-6 bg-gradient-to-r from-transparent to-cyan-300/80" />
      {children}
    </p>
  )
}

export const GRADIENT_TEXT = 'bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent'

// ---------------------------------------------------------------------------
// Media with graceful fallbacks
// ---------------------------------------------------------------------------
/** Animated stand-in when a still or poster is missing: never a broken box. */
export function MockVisual({ label, className, orb = 72 }: { label?: string; className?: string; orb?: number }) {
  return (
    <div
      className={cn(
        'relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden bg-[radial-gradient(ellipse_at_50%_35%,rgba(34,211,238,0.16),transparent_60%),linear-gradient(160deg,#0b1424,#070b14)]',
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:28px_28px]"
      />
      <AIOrb state="speaking" size={orb} label="" />
      <div aria-hidden className="relative flex h-6 items-end gap-1">
        {[0.5, 0.9, 0.6, 1, 0.7, 0.45, 0.85, 0.55].map((h, i) => (
          <span
            key={i}
            className="psx-anim block w-1.5 origin-bottom rounded-full bg-gradient-to-t from-blue-400 via-cyan-300 to-emerald-300"
            style={{ height: `${h * 100}%`, animation: `psx-bar ${0.9 + (i % 4) * 0.18}s ease-in-out ${i * 0.08}s infinite` }}
          />
        ))}
      </div>
      {label ? <p className="relative px-3 text-center text-xs font-medium text-gray-300">{label}</p> : null}
    </div>
  )
}

/** <img> that swaps to a fallback (default: MockVisual) if the file is missing. */
export function SafeImg({
  src,
  alt,
  className,
  fallback,
  loading = 'lazy',
  fallbackLabel,
}: {
  src: string
  alt: string
  className?: string
  fallback?: ReactNode
  loading?: 'lazy' | 'eager'
  fallbackLabel?: string
}) {
  const [failed, setFailed] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)
  // An error can fire before hydration attaches onError: check the settled state once mounted.
  useEffect(() => {
    const img = imgRef.current
    if (img && img.complete && img.naturalWidth === 0 && img.currentSrc) setFailed(true)
  }, [src])
  if (failed) return <>{fallback ?? <MockVisual label={fallbackLabel ?? alt} orb={44} />}</>
  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  )
}
