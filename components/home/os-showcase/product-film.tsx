'use client'

/* ProductFilm: the hero "product stage". A browser frame with the six recorded Placement OS scenes
 * shown FULL-FRAME (whole app screen, 16:10, no punch-in), a soft 3D tilt on larger screens, crisp
 * HTML callouts synced to each scene's key moment, and a story-style segmented progress bar.
 * Fallbacks, per scene: video -> poster (on error, stall, or data saver) -> animated mock (AIOrb + bars)
 * if the poster is missing too. Never a broken box.
 * `compact` (used inside the demo dialog): flat frame, no glow, no callouts. */

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { Lock, Pause, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MockVisual, useReducedMotion } from './shared'
import { SceneCallout } from './film-callouts'
import { SCENES, SITE_HOST, mediaUrl, sceneMs, type CueSlot } from './media'

const N = SCENES.length
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

/** Callouts straddle the frame's corners; the overhang shrinks where the container gutter is narrow
 * (at 1280px the right gutter is ~20px, so the full overhang waits for 1360px). */
const SLOT: Record<CueSlot, { pos: string; hidden: string }> = {
  tr: { pos: '-top-6 -right-2 md:-right-6 lg:-right-3 xl:-right-2 min-[1360px]:-right-8', hidden: '-translate-y-2' },
  bl: { pos: '-bottom-6 -left-2 md:-left-6 lg:-left-9 xl:-left-12', hidden: 'translate-y-2' },
  br: { pos: '-bottom-6 -right-2 md:-right-6 lg:-right-3', hidden: 'translate-y-2' },
}

export interface ProductFilmProps {
  className?: string
  /** Pause from outside (e.g. while the demo dialog is open). */
  externalPause?: boolean
  /** Lighter chrome for use inside a dialog: no tilt, glow or callouts. */
  compact?: boolean
}

export function ProductFilm({ className, externalPause = false, compact = false }: ProductFilmProps) {
  const reduced = useReducedMotion()
  const stage = !compact
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
  const [lite, setLite] = useState(false)
  /** The browser refused muted autoplay: show a play button on the poster instead of a silent timer. */
  const [blocked, setBlocked] = useState(false)
  /** How many of the active scene's callouts have been revealed (0-2). */
  const [step, setStep] = useState(0)
  /** Client facts (connection) known: until then render posters only, so no clip is fetched twice. */
  const [ready, setReady] = useState(false)

  const rootRef = useRef<HTMLDivElement | null>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([])
  const elapsedRef = useRef(0)
  /** ms the active clip has rested on its last frame (scene.hold). */
  const heldRef = useRef(0)
  const waitRef = useRef(0)
  const noSrcRef = useRef(0)
  const stepRef = useRef(0)

  const nextIdx = (idx + 1) % N
  const paused = !mounted || userPaused || hoverPaused || externalPause || !inView || docHidden
  const useVideo = ready && !lite && !videoFailed[idx] && !stalled[idx]
  const scene = SCENES[idx]

  // Latest values for the rAF loop and media event handlers.
  const live = useRef({ idx, paused, useVideo, userPaused })
  live.current = { idx, paused, useVideo, userPaused }

  // Mount: reduced motion means no autoplay (poster + play button). Save-Data / 2G: posters until play.
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
    setReady(true)
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
  const setCueStep = useCallback((n: number) => {
    if (stepRef.current === n) return
    stepRef.current = n
    setStep(n)
  }, [])

  const goTo = useCallback(
    (j: number) => {
      const target = ((j % N) + N) % N
      const cur = live.current.idx
      if (cur !== target) setPrevIdx(cur)
      setIdx(target)
      // Point the rAF loop at the new scene right away so it cannot double-advance before re-render.
      live.current = { ...live.current, idx: target }
      setActivation((a) => a + 1)
      // A fresh activation retries the clip (unless it hard-failed).
      setStalled((f) => (f[target] ? { ...f, [target]: false } : f))
      setCueStep(0)
      elapsedRef.current = 0
      heldRef.current = 0
      waitRef.current = 0
      noSrcRef.current = 0
    },
    [setCueStep],
  )

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
    // Resting on the last frame (hold): play() would restart the clip; the clock advances instead.
    if (v.ended) return
    v.muted = true
    const p = v.play()
    if (p && typeof p.catch === 'function') {
      p.catch((err: unknown) => {
        const name = (err as { name?: string } | null)?.name
        if (name === 'NotAllowedError') {
          // Autoplay genuinely blocked: rest on the poster with a play button.
          setBlocked(true)
          setUserPaused(true)
        } else if (name === 'NotSupportedError') markFailed(idx)
        // AbortError: a pause() raced the play() promise; harmless.
      })
    }
  }, [idx, activation, paused, useVideo, markFailed])

  // Progress clock: video time when the clip plays, else a 7 s timer on the poster.
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
    const cues = (i: number, sec: number) => {
      let n = 0
      for (const c of SCENES[i].cues) if (sec >= c.at) n += 1
      setCueStep(n)
    }
    const tick = (now: number) => {
      const dt = Math.min(120, now - last)
      last = now
      const { idx: i, paused: isPaused, useVideo: viaVideo } = live.current
      if (!isPaused) elapsedRef.current += dt
      let p = 0
      const v = videoRefs.current[i]
      const hold = SCENES[i].hold ?? 0
      if (viaVideo && v) {
        const d = v.duration
        if (v.error) {
          markFailed(i)
        } else if (Number.isFinite(d) && d > 0 && (v.readyState >= 2 || v.currentTime > 0)) {
          waitRef.current = 0
          // Rest on the last frame for `hold` s so a late callout stays readable.
          if (v.ended && !isPaused) heldRef.current += dt
          p = (v.currentTime + heldRef.current / 1000) / (d + hold)
          cues(i, v.currentTime)
          const done = v.ended && elapsedRef.current > 400 && heldRef.current >= hold * 1000
          if (done || elapsedRef.current > (d + hold) * 1000 + 2500) {
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
        p = elapsedRef.current / sceneMs(SCENES[i])
        cues(i, elapsedRef.current / 1000)
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
  }, [mounted, inView, advance, markFailed, markStalled, setCueStep])

  const togglePlay = useCallback(() => {
    const wasPaused = live.current.userPaused
    // Lite connection: the first explicit play is the opt-in to fetch video.
    setLite(false)
    setBlocked(false)
    if (wasPaused) {
      const i = live.current.idx
      setStalled((f) => (f[i] ? { ...f, [i]: false } : f))
      // Start inside the gesture so a browser that blocked autoplay accepts it now.
      const v = videoRefs.current[i]
      if (v && !v.ended) {
        v.muted = true
        v.play()?.catch(() => {})
      }
    }
    setUserPaused(!wasPaused)
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

  // Reduced motion rests on the poster with every callout already in place.
  const shownCues = reduced ? 2 : step
  /** Big centered play button only when the film cannot (or should not) start by itself. */
  const bigPlay = mounted && userPaused && (blocked || reduced || lite)
  const cornerPause = mounted && !bigPlay && (userPaused || hoverPaused)
  const chipCue = shownCues >= 2 ? 1 : 0

  const frame = (
    <div
      className={cn(
        'rounded-[14px] bg-gradient-to-b from-white/25 via-white/[0.08] to-white/[0.04] p-px',
        stage
          ? 'shadow-[0_50px_90px_-40px_rgba(2,6,23,0.95),0_24px_70px_-36px_rgba(34,211,238,0.55)]'
          : 'shadow-[0_30px_80px_-40px_rgba(34,211,238,0.4)]',
      )}
    >
      <div className="overflow-hidden rounded-[13px] bg-[#0a101c]">
        {/* Browser chrome */}
        <div className="flex h-8 items-center gap-3 border-b border-white/[0.06] bg-[#0d1525] px-3">
          <div aria-hidden className="flex w-12 shrink-0 gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          {/* Stage: URL pill sits left like a real browser (clear of the corner callout; its x never moves as
              the route changes, so no layout shift). */}
          <div
            className={cn(
              'flex min-w-0 items-center gap-1.5 rounded-md bg-white/[0.05] px-2.5 py-[3px] text-[11.5px] text-gray-400 ring-1 ring-inset ring-white/[0.05]',
              !stage && 'mx-auto',
            )}
          >
            <Lock className="h-3 w-3 shrink-0 text-emerald-400/80" aria-hidden />
            <span className="truncate">
              {SITE_HOST && (
                <span className={stage ? 'hidden md:inline lg:hidden xl:inline' : 'hidden sm:inline'}>{SITE_HOST}</span>
              )}
              <span key={scene.id} className="psx-anim text-gray-200" style={{ animation: 'psx-fade .5s ease-out' }}>
                {scene.route}
              </span>
            </span>
          </div>
          <span aria-hidden className={cn('w-12 shrink-0', stage && 'ml-auto')} />
        </div>

        {/* Footage: exact 16:10 box, full frame (object-contain), nothing cropped */}
        <div
          role="button"
          tabIndex={0}
          aria-label={paused && mounted ? 'Play product film' : 'Pause product film'}
          aria-roledescription="video player"
          onClick={togglePlay}
          onKeyDown={onFrameKey}
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
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaUrl(s.file, 'jpg')}
                      alt={isActive ? `${s.label}: ${s.caption}` : ''}
                      onError={() => setPosterFailed((f) => ({ ...f, [i]: true }))}
                      className="h-full w-full object-contain"
                    />
                  ))
                ) : keep ? (
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el
                      if (el) el.muted = true
                    }}
                    className="h-full w-full object-contain"
                    muted
                    playsInline
                    disablePictureInPicture
                    preload={isActive || i === nextIdx ? 'auto' : 'none'}
                    poster={mediaUrl(s.file, 'jpg')}
                    aria-label={`${s.label}: ${s.caption}`}
                    onEnded={() => {
                      // Scenes with a hold rest on the last frame; the progress clock advances them.
                      if (live.current.idx === i && !s.hold) advance()
                    }}
                    onError={() => markFailed(i)}
                  >
                    <source src={mediaUrl(s.file, 'webm')} type="video/webm" />
                    <source src={mediaUrl(s.file, 'mp4')} type="video/mp4" onError={() => markFailed(i)} />
                  </video>
                ) : null}
              </div>
            )
          })}

          {/* Faint glass glare */}
          {stage && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(118deg,rgba(255,255,255,0.045),transparent_26%,transparent_74%,rgba(255,255,255,0.02))]"
            />
          )}

          {/* Play / pause affordances */}
          {bigPlay && (
            <div aria-hidden className="pointer-events-none absolute inset-0 z-[4] flex items-center justify-center bg-[#050912]/25">
              <span className="flex flex-col items-center gap-2">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white shadow-2xl backdrop-blur-md transition-transform group-hover/film:scale-105">
                  <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
                </span>
                <span className="rounded-full border border-white/15 bg-black/60 px-2.5 py-1 text-xs font-medium text-gray-100 backdrop-blur-md">
                  {lite ? 'Data saver on · tap to play video' : 'Play the product tour'}
                </span>
              </span>
            </div>
          )}
          {cornerPause && (
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-2 right-2 z-[4] inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 p-1.5 text-[11px] sm:bottom-2.5 sm:right-2.5 sm:px-2.5 sm:py-1 font-medium text-gray-100 shadow-lg backdrop-blur-md"
            >
              {userPaused ? <Play className="h-3 w-3" fill="currentColor" /> : <Pause className="h-3 w-3" fill="currentColor" />}
              <span className="hidden sm:inline">{userPaused ? 'Paused · tap to play' : 'Paused'}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div ref={rootRef} className={cn('relative isolate', className)}>
      {stage ? (
        <div className="psf-stage relative" onPointerEnter={onEnter} onPointerLeave={onLeave}>
          {/* Glow behind the stage */}
          <div aria-hidden className="pointer-events-none absolute -inset-x-6 -inset-y-10 -z-10 sm:-inset-x-12 sm:-inset-y-14">
            <div className="absolute left-1/2 top-1/2 h-[78%] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(34,211,238,0.22),rgba(59,130,246,0.12)_55%,transparent)] blur-2xl" />
            <div className="absolute bottom-[6%] left-[14%] right-[10%] h-16 rounded-[50%] bg-cyan-400/[0.05] blur-3xl" />
          </div>

          <div className="psf-tilt relative">
            {frame}
            {/* Contact shadow */}
            <div aria-hidden className="pointer-events-none absolute inset-x-[8%] -bottom-7 -z-10 h-10 rounded-[50%] bg-black/60 blur-xl" />
          </div>

          {/* Floating callouts (sm+), flat so the text stays crisp */}
          {SCENES.map((s, i) =>
            i === idx || i === prevIdx
              ? s.cues.map((c, k) => {
                  const shown = i === idx && shownCues > k
                  return (
                    <div
                      key={`${s.id}-${k}`}
                      aria-hidden
                      className={cn(
                        'pointer-events-none absolute z-30 hidden transition-[opacity,transform] duration-300 ease-out sm:block',
                        SLOT[c.slot].pos,
                        shown ? 'translate-y-0 opacity-100' : cn('opacity-0', SLOT[c.slot].hidden),
                      )}
                    >
                      <SceneCallout sceneId={s.id} cue={k} />
                    </div>
                  )
                })
              : null,
          )}
        </div>
      ) : (
        frame
      )}

      {/* Mobile: one callout chip under the frame */}
      {stage && (
        <div aria-hidden className="mt-3 flex h-[76px] items-center justify-center sm:hidden">
          <div
            key={`${scene.id}-${chipCue}`}
            className="psx-anim max-w-full"
            style={{ animation: 'psx-pop .35s cubic-bezier(.2,.8,.2,1) both' }}
          >
            <SceneCallout sceneId={scene.id} cue={chipCue} />
          </div>
        </div>
      )}

      {/* Story progress bar */}
      <div className={cn('flex items-start gap-2.5', stage ? 'mt-2 sm:mt-9' : 'mt-4')}>
        <button
          type="button"
          onClick={togglePlay}
          aria-pressed={!userPaused}
          aria-label={userPaused ? 'Play' : 'Pause'}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-gray-200 transition hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 sm:mt-1"
        >
          {userPaused ? <Play className="ml-0.5 h-3 w-3" fill="currentColor" /> : <Pause className="h-3 w-3" fill="currentColor" />}
        </button>
        <div className="flex min-w-0 flex-1 gap-1.5" role="group" aria-label="Scenes">
          {SCENES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Scene ${i + 1}: ${s.label}`}
              aria-current={i === idx ? 'step' : undefined}
              className="group/seg min-w-0 flex-1 rounded py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 sm:py-1"
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
                  'mt-1.5 hidden truncate text-[11.5px] transition-colors sm:block',
                  i === idx ? 'font-medium text-white' : 'text-gray-400 group-hover/seg:text-gray-200',
                )}
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Current scene caption */}
      {/* One line from sm up (the segment label above already names the scene, so only the lead shows). */}
      <p className="mt-1.5 min-h-[60px] pl-[38px] text-[13px] leading-5 text-gray-400 sm:mt-2 sm:min-h-[20px] sm:text-[13.5px]">
        <span key={scene.id} className="psx-anim block sm:truncate" style={{ animation: 'psx-fade .45s ease-out' }}>
          <span className="font-medium text-gray-100">
            <span className="sm:hidden">{scene.lead === scene.label ? scene.label : `${scene.lead} · ${scene.label}`}</span>
            <span className="hidden sm:inline">{scene.lead}</span>
          </span>
          <span className="text-gray-600"> — </span>
          {scene.caption}
        </span>
      </p>
      <p className="sr-only" aria-live="polite">
        {scene.lead}: {scene.caption}
      </p>
    </div>
  )
}
