'use client'

/* ProductFilm: a browser-framed player for the six recorded Placement OS scenes with a
 * story-style segmented progress bar and a streaming caption.
 * Fallbacks, per scene: video -> poster with a slow Ken Burns zoom (on error, stall, or blocked
 * autoplay) -> animated mock (AIOrb + bars) if the poster is missing too. Never a broken box. */

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { ChevronRight, Lock, Pause, Play, Sparkles } from 'lucide-react'
import { AIOrb } from '@/components/ai/ai-orb'
import { cn } from '@/lib/utils'
import { MockVisual, useReducedMotion } from './shared'
import { MOBILE_CUT_SUFFIX, SCENES, SCENE_MS, SITE_HOST, mediaUrl } from './media'

const N = SCENES.length
const SMALL_MQ = '(max-width: 639px)'
/** How long an active clip may sit without frames before we switch to its poster. */
const STALL_MS = 2600

type Flags = Record<number, boolean>

type NetInfo = { saveData?: boolean; effectiveType?: string }
/** Save-Data or a 2G-class connection: start on posters and fetch video only when asked. */
function isLiteConnection(): boolean {
  try {
    const c = (navigator as Navigator & { connection?: NetInfo }).connection
    return !!c && (c.saveData === true || /(^|-)2g$/.test(c.effectiveType ?? ''))
  } catch {
    return false
  }
}

function useStreamed(text: string, enabled: boolean, msPerChar = 20): number {
  const [n, setN] = useState(text.length)
  const shownText = useRef(text)
  useEffect(() => {
    // The first caption renders complete (SSR and first paint); only a new caption streams in.
    if (!enabled || shownText.current === text) {
      shownText.current = text
      setN(text.length)
      return
    }
    shownText.current = text
    setN(0)
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setN(i)
      if (i >= text.length) window.clearInterval(id)
    }, msPerChar)
    return () => window.clearInterval(id)
  }, [text, enabled, msPerChar])
  return Math.min(n, text.length)
}

export interface ProductFilmProps {
  className?: string
  /** Pause from outside (e.g. while the demo dialog is open). */
  externalPause?: boolean
  /** Lighter chrome for use inside a dialog: no glow, orb or floating chip. */
  compact?: boolean
}

export function ProductFilm({ className, externalPause = false, compact = false }: ProductFilmProps) {
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [idx, setIdx] = useState(0)
  const [prevIdx, setPrevIdx] = useState<number | null>(null)
  const [activation, setActivation] = useState(0)
  const [userPaused, setUserPaused] = useState(false)
  const [hoverPaused, setHoverPaused] = useState(false)
  const [inView, setInView] = useState(true)
  const [docHidden, setDocHidden] = useState(false)
  const [videoFailed, setVideoFailed] = useState<Flags>({})
  const [stalled, setStalled] = useState<Flags>({})
  const [posterFailed, setPosterFailed] = useState<Flags>({})
  /** '' = desktop cut; MOBILE_CUT_SUFFIX = tighter punch-in cut for small screens. */
  const [variant, setVariant] = useState('')
  const [lite, setLite] = useState(false)
  /** Client facts (variant, connection) known: until then render posters only, so no clip is fetched twice. */
  const [ready, setReady] = useState(false)

  const rootRef = useRef<HTMLDivElement | null>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([])
  const elapsedRef = useRef(0)
  const waitRef = useRef(0)
  const noSrcRef = useRef(0)

  const nextIdx = (idx + 1) % N
  const paused = !mounted || userPaused || hoverPaused || externalPause || !inView || docHidden
  const useVideo = ready && !lite && !videoFailed[idx] && !stalled[idx]
  const scene = SCENES[idx]

  // Latest values for the rAF loop and media event handlers.
  const live = useRef({ idx, paused, useVideo })
  live.current = { idx, paused, useVideo }

  // Mount: reduced motion means no autoplay (posters + manual next). Save-Data / 2G: posters until play.
  useEffect(() => {
    setMounted(true)
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setUserPaused(true)
    } catch {
      /* ignore */
    }
    if (isLiteConnection()) {
      setLite(true)
      setUserPaused(true)
    }
    // Small screens get the tighter punch-in cut of each scene.
    let mq: MediaQueryList | null = null
    const apply = () => setVariant(mq?.matches ? MOBILE_CUT_SUFFIX : '')
    if (MOBILE_CUT_SUFFIX && typeof window.matchMedia === 'function') {
      mq = window.matchMedia(SMALL_MQ)
      apply()
      mq.addEventListener?.('change', apply)
    }
    setReady(true)
    return () => mq?.removeEventListener?.('change', apply)
  }, [])
  useEffect(() => {
    if (reduced) setUserPaused(true)
  }, [reduced])

  // Only play while on screen and the tab is visible.
  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.15 })
    obs.observe(el)
    const onVis = () => setDocHidden(document.visibilityState === 'hidden')
    onVis()
    document.addEventListener('visibilitychange', onVis)
    return () => {
      obs.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  const markFailed = useCallback((i: number) => {
    setVideoFailed((f) => (f[i] ? f : { ...f, [i]: true }))
  }, [])
  const markStalled = useCallback((i: number) => {
    setStalled((f) => (f[i] ? f : { ...f, [i]: true }))
  }, [])

  const goTo = useCallback((j: number) => {
    const target = ((j % N) + N) % N
    const cur = live.current.idx
    if (cur !== target) setPrevIdx(cur)
    setIdx(target)
    // Point the rAF loop at the new scene right away so it cannot double-advance before re-render.
    live.current = { ...live.current, idx: target }
    setActivation((a) => a + 1)
    // A fresh activation retries the clip (unless it hard-failed).
    setStalled((f) => (f[target] ? { ...f, [target]: false } : f))
    elapsedRef.current = 0
    waitRef.current = 0
    noSrcRef.current = 0
  }, [])

  const advance = useCallback(() => goTo(live.current.idx + 1), [goTo])

  // New active clip: rewind it, pause the others.
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      if (i === idx) {
        if (v.currentTime > 0) {
          try {
            v.currentTime = 0
          } catch {
            /* ignore */
          }
        }
      } else if (!v.paused) {
        v.pause()
      }
    })
  }, [idx, activation])

  // Play / pause the active clip.
  useEffect(() => {
    const v = videoRefs.current[idx]
    if (!v || !useVideo) return
    if (paused) {
      v.pause()
      return
    }
    v.muted = true
    const p = v.play()
    if (p && typeof p.catch === 'function') {
      p.catch((err: unknown) => {
        const name = (err as { name?: string } | null)?.name
        if (name === 'NotAllowedError') markStalled(idx) // autoplay blocked: poster + timer
        else if (name === 'NotSupportedError') markFailed(idx)
        // AbortError: a pause() raced the play() promise; harmless.
      })
    }
  }, [idx, activation, paused, useVideo, variant, markFailed, markStalled])

  // Progress clock: video time when the clip plays, else a 7.2 s timer (Ken Burns poster).
  useEffect(() => {
    if (!mounted || !inView) return
    let raf = 0
    let last = performance.now()
    const paint = (i: number, p: number) => {
      for (let j = 0; j < N; j++) {
        const el = fillRefs.current[j]
        if (!el) continue
        const f = j < i ? 1 : j === i ? Math.max(0, Math.min(1, p)) : 0
        el.style.transform = `scaleX(${f.toFixed(4)})`
      }
    }
    const tick = (now: number) => {
      const dt = Math.min(120, now - last)
      last = now
      const { idx: i, paused: isPaused, useVideo: viaVideo } = live.current
      if (!isPaused) elapsedRef.current += dt
      let p = 0
      const v = videoRefs.current[i]
      if (viaVideo && v) {
        const d = v.duration
        if (v.error) {
          markFailed(i)
        } else if (Number.isFinite(d) && d > 0 && (v.readyState >= 2 || v.currentTime > 0)) {
          waitRef.current = 0
          p = v.currentTime / d
          if ((v.ended && elapsedRef.current > 400) || elapsedRef.current > d * 1000 + 2500) {
            advance()
            raf = requestAnimationFrame(tick)
            return
          }
        } else {
          // NETWORK_NO_SOURCE is also set briefly while the browser picks a <source>: only trust it
          // once it persists. Counted while paused too, so a missing clip never leaves a blank frame.
          noSrcRef.current = v.networkState === 3 ? noSrcRef.current + dt : 0
          if (noSrcRef.current > 1200) markFailed(i)
          if (!isPaused) {
            waitRef.current += dt
            if (waitRef.current > STALL_MS) markStalled(i)
          }
        }
      } else if (!viaVideo) {
        p = elapsedRef.current / SCENE_MS
        if (p >= 1) {
          advance()
          raf = requestAnimationFrame(tick)
          return
        }
      }
      paint(i, p)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [mounted, inView, advance, markFailed, markStalled])

  const togglePlay = useCallback(() => {
    // Lite connection: the first explicit play is the opt-in to fetch video.
    setLite(false)
    setUserPaused((p) => {
      if (p) setStalled((f) => (f[live.current.idx] ? { ...f, [live.current.idx]: false } : f))
      return !p
    })
  }, [])

  const onFrameKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      togglePlay()
    } else if (e.key === 'ArrowRight') {
      goTo(idx + 1)
    } else if (e.key === 'ArrowLeft') {
      goTo(idx - 1)
    }
  }
  const onEnter = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') setHoverPaused(true)
  }
  const onLeave = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') setHoverPaused(false)
  }

  const posterOf = (file: string) => mediaUrl(file + variant, 'jpg')
  const streamed = useStreamed(scene.caption, mounted && !reduced)
  const showPausedUi = mounted && (userPaused || hoverPaused)

  return (
    <div ref={rootRef} className={cn('relative isolate', className)}>
      {!compact && (
        <>
          {/* Glow + orb behind the frame */}
          <div aria-hidden className="pointer-events-none absolute -inset-x-6 -inset-y-8 -z-10 sm:-inset-x-10 sm:-inset-y-12">
            <div
              className="psx-anim absolute left-1/2 top-1/2 aspect-square w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.28] blur-3xl"
              style={{
                background: 'conic-gradient(from 0deg, #3b82f6, #22d3ee, #34d399, #8b5cf6, #3b82f6)',
                animation: 'psx-spin 22s linear infinite',
              }}
            />
            <div className="absolute inset-x-[15%] bottom-0 h-1/3 rounded-full bg-cyan-400/10 blur-3xl" />
          </div>
          <div
            aria-hidden
            className="psx-anim pointer-events-none absolute -right-6 -top-8 z-20 hidden md:block"
            style={{ animation: 'psx-float 6s ease-in-out infinite' }}
          >
            <AIOrb state={paused ? 'idle' : 'speaking'} size={58} label="" />
          </div>
        </>
      )}

      {/* Browser frame */}
      <div className="rounded-[18px] bg-gradient-to-b from-white/20 via-white/[0.07] to-white/[0.03] p-px shadow-[0_40px_100px_-40px_rgba(34,211,238,0.45)]">
        <div className="overflow-hidden rounded-[17px] bg-[#0a101c]">
          <div className="flex h-9 items-center gap-3 border-b border-white/[0.06] bg-[#0d1525] px-3 sm:px-3.5">
            <div aria-hidden className="flex shrink-0 gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </div>
            <div className={cn('mx-auto flex min-w-0 items-center gap-1.5 rounded-md bg-white/[0.05] px-2.5 py-1 text-xs text-gray-400 ring-1 ring-inset ring-white/[0.04]', !compact && 'md:mx-0')}>
              <Lock className="h-3 w-3 shrink-0 text-emerald-400/80" aria-hidden />
              <span className="truncate">
                <span className="hidden sm:inline">{SITE_HOST}</span>
                <span key={scene.id} className="psx-anim text-gray-200" style={{ animation: 'psx-fade .5s ease-out' }}>
                  {scene.route}
                </span>
              </span>
            </div>
            <span className={cn('hidden shrink-0 items-center gap-1.5 text-xs text-gray-400 md:inline-flex', !compact && 'md:hidden')}>
              <span aria-hidden className="relative flex h-1.5 w-1.5">
                <span className="psx-anim absolute inset-0 rounded-full bg-emerald-400" style={{ animation: 'psx-ping 1.6s ease-out infinite' }} />
                <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Real product
            </span>
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-label={paused && mounted ? 'Play product film' : 'Pause product film'}
            aria-roledescription="video player"
            onClick={togglePlay}
            onKeyDown={onFrameKey}
            onPointerEnter={onEnter}
            onPointerLeave={onLeave}
            className="group/film relative aspect-[16/10] w-full cursor-pointer overflow-hidden bg-[#070b14] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300/70"
          >
            {SCENES.map((s, i) => {
              const isActive = i === idx
              const isPrev = i === prevIdx
              const keep = isActive || i === nextIdx || isPrev
              const fallback = !ready || lite || videoFailed[i] || (isActive && stalled[i])
              return (
                <div
                  key={s.id}
                  aria-hidden={!isActive}
                  className={cn(
                    'absolute inset-0 transition-opacity duration-700 ease-out',
                    isActive ? 'z-[2] opacity-100' : isPrev ? 'z-[1] opacity-0' : 'z-0 opacity-0',
                  )}
                >
                  {fallback ? (
                    (isActive || isPrev) &&
                    (posterFailed[i] ? (
                      <MockVisual label={s.lead === s.label ? s.label : `${s.lead} · ${s.label}`} orb={compact ? 64 : 84} />
                    ) : (
                      <picture key={`${s.id}-${activation}`} className="block h-full w-full">
                        {/* Responsive without JS, so first paint already fetches the right poster. */}
                        {MOBILE_CUT_SUFFIX && <source media={SMALL_MQ} srcSet={mediaUrl(s.file + MOBILE_CUT_SUFFIX, 'jpg')} />}
                        <img
                          src={mediaUrl(s.file, 'jpg')}
                          alt={isActive ? `${s.label}: ${s.caption}` : ''}
                          onError={() => setPosterFailed((f) => ({ ...f, [i]: true }))}
                          className="psx-anim h-full w-full object-cover"
                          style={{
                            animation: `psx-kenburns ${SCENE_MS}ms ease-out forwards`,
                            animationPlayState: paused ? 'paused' : 'running',
                          }}
                        />
                      </picture>
                    ))
                  ) : keep ? (
                    <video
                      key={variant}
                      ref={(el) => {
                        videoRefs.current[i] = el
                        if (el) el.muted = true
                      }}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      disablePictureInPicture
                      preload={isActive || i === nextIdx ? 'auto' : 'none'}
                      poster={posterOf(s.file)}
                      aria-label={`${s.label}: ${s.caption}`}
                      onEnded={() => {
                        if (live.current.idx === i) advance()
                      }}
                      onError={() => markFailed(i)}
                    >
                      <source src={mediaUrl(s.file + variant, 'webm')} type="video/webm" />
                      <source src={mediaUrl(s.file + variant, 'mp4')} type="video/mp4" onError={() => markFailed(i)} />
                    </video>
                  ) : null}
                </div>
              )
            })}

            {/* Soft vignette for depth */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(3,6,12,0.45))]"
            />

            {/* Pause affordances */}
            {showPausedUi && (
              <div aria-hidden className="pointer-events-none absolute inset-0 z-[4] flex items-center justify-center">
                {userPaused ? (
                  <span className="flex flex-col items-center gap-2">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white shadow-2xl backdrop-blur-md">
                      <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
                    </span>
                    {lite && (
                      <span className="rounded-full border border-white/15 bg-black/60 px-2.5 py-1 text-xs font-medium text-gray-100 backdrop-blur-md">
                        Data saver on · tap to play video
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-xs font-medium text-gray-100 backdrop-blur-md">
                    <Pause className="h-3 w-3" fill="currentColor" /> Paused
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {!compact && (
        // Metric chip sits astride the frame's top edge (over the browser bar), never over the footage.
        <div
          key={scene.id}
          aria-hidden
          className="psx-anim absolute -top-6 right-14 z-20 hidden max-w-[260px] items-center gap-2.5 rounded-xl border border-white/10 bg-[#0b1322]/95 px-3 py-2 shadow-2xl shadow-black/50 backdrop-blur-md md:flex"
          style={{ animation: 'psx-pop .55s cubic-bezier(.2,.8,.2,1) both' }}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/30 to-emerald-400/30 ring-1 ring-inset ring-white/10">
            <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs text-gray-400">Sarthi AI</span>
            <span className="block truncate text-[13px] font-semibold text-white">{scene.metric}</span>
          </span>
        </div>
      )}

      {/* Story progress bar */}
      <div className="mt-4 flex items-start gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={togglePlay}
          aria-pressed={!userPaused}
          aria-label={userPaused ? 'Play' : 'Pause'}
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-gray-200 transition hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
        >
          {userPaused ? <Play className="ml-0.5 h-3.5 w-3.5" fill="currentColor" /> : <Pause className="h-3.5 w-3.5" fill="currentColor" />}
        </button>
        <div className="flex min-w-0 flex-1 gap-1.5" role="group" aria-label="Scenes">
          {SCENES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Scene ${i + 1}: ${s.label}`}
              aria-current={i === idx ? 'step' : undefined}
              className="group/seg min-w-0 flex-1 rounded py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 sm:pb-1 sm:pt-3"
            >
              <span className="block h-[3px] overflow-hidden rounded-full bg-white/[0.12] transition-colors group-hover/seg:bg-white/25">
                <span
                  ref={(el) => {
                    fillRefs.current[i] = el
                  }}
                  className="block h-full origin-left rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400"
                  style={{ transform: `scaleX(${i < idx ? 1 : 0})` }}
                />
              </span>
              <span
                className={cn(
                  'mt-2 hidden truncate text-xs transition-colors sm:block',
                  i === idx ? 'font-medium text-white' : 'text-gray-400 group-hover/seg:text-gray-200',
                )}
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => goTo(idx + 1)}
          aria-label="Next scene"
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-gray-200 transition hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Streaming caption */}
      <div className="mt-2 flex min-h-[64px] items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 backdrop-blur-sm sm:px-3.5">
        <span className="shrink-0 self-start rounded-md bg-cyan-400/10 px-2 py-0.5 text-xs font-semibold text-cyan-200 ring-1 ring-inset ring-cyan-300/15">
          {scene.lead}
          <span className="sm:hidden"> · {scene.label}</span>
        </span>
        <p aria-hidden className="grid min-w-0 text-[13px] leading-5 text-gray-200 sm:text-sm">
          <span className="invisible col-start-1 row-start-1">{scene.caption}</span>
          <span className="col-start-1 row-start-1">
            {scene.caption.slice(0, streamed)}
            {streamed < scene.caption.length && (
              <span className="psx-caret ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 bg-cyan-300" />
            )}
          </span>
        </p>
        <p className="sr-only" aria-live="polite">
          {scene.lead}: {scene.caption}
        </p>
      </div>
    </div>
  )
}
