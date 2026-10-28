'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { AIBadge } from '@/components/ai/ai-badge'
import { ProductFilm } from './product-film'
import { DEMO_REEL, mediaUrl } from './media'
import { useReducedMotion } from './shared'

const clock = (sec: number) => {
  const s = Math.max(0, Math.floor(Number.isFinite(sec) ? sec : 0))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** "Watch 70-sec demo": the highlight reel; falls back to the six-scene film if the reel is missing.
 * Minimal controls sit BELOW the video so they never cover the reel's burned-in captions. */
export function DemoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const reduced = useReducedMotion()
  const [failed, setFailed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (!open) return
    setPlaying(false)
    setTime(0)
  }, [open])

  const toggle = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused || v.ended) {
      v.muted = true
      v.play()?.catch(() => {})
    } else {
      v.pause()
    }
  }, [])

  // Missing sources do not always fire onError on <video>: poll the settled state briefly.
  useEffect(() => {
    if (!open || failed) return
    // NETWORK_NO_SOURCE is also set briefly while a <source> is being chosen: require it to persist.
    let noSource = 0
    const id = window.setInterval(() => {
      const v = videoRef.current
      if (!v) return
      noSource = v.networkState === 3 ? noSource + 1 : 0
      if (v.error || noSource >= 3) setFailed(true)
    }, 400)
    return () => window.clearInterval(id)
  }, [open, failed])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] max-w-[1100px] gap-0 overflow-hidden rounded-2xl border-white/10 bg-[#070c16] p-0 text-white shadow-[0_40px_120px_-30px_rgba(34,211,238,0.35)] sm:rounded-2xl">
        <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-4 py-3 pr-12">
          <AIBadge />
          <DialogTitle className="truncate text-sm font-semibold text-white">Placement OS · 70-second demo</DialogTitle>
        </div>
        <DialogDescription className="sr-only">
          A muted highlight reel of ParthSarthi Placement OS: the student Placement Day, the TPO shortlist, the state
          dashboard and Sarthi Didi for government schools.
        </DialogDescription>
        {failed ? (
          <div className="p-3 sm:p-5">
            {/* Keep the 16:10 frame plus controls inside the viewport on short screens. */}
            <div className="mx-auto" style={{ maxWidth: 'min(100%, calc((100dvh - 320px) * 1.6))' }}>
              <ProductFilm compact />
            </div>
          </div>
        ) : (
          <>
            <video
              ref={(el) => {
                videoRef.current = el
                if (el) el.muted = true
              }}
              className="aspect-[16/10] max-h-[calc(100vh-170px)] w-full cursor-pointer bg-black object-contain"
              autoPlay={!reduced}
              muted
              playsInline
              disablePictureInPicture
              preload="metadata"
              poster={mediaUrl(DEMO_REEL, 'jpg')}
              aria-label="Placement OS highlight reel (muted, captioned)"
              onClick={toggle}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onDurationChange={(e) => setDuration(e.currentTarget.duration)}
              onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
              onError={() => setFailed(true)}
            >
              <source src={mediaUrl(DEMO_REEL, 'webm')} type="video/webm" />
              <source src={mediaUrl(DEMO_REEL, 'mp4')} type="video/mp4" onError={() => setFailed(true)} />
            </video>
            <div className="flex items-center gap-3 border-t border-white/[0.08] px-3 py-2 sm:px-4">
              <button
                type="button"
                onClick={toggle}
                aria-label={playing ? 'Pause demo' : 'Play demo'}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-gray-100 transition hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              >
                {playing ? <Pause className="h-3.5 w-3.5" fill="currentColor" /> : <Play className="ml-0.5 h-3.5 w-3.5" fill="currentColor" />}
              </button>
              <input
                type="range"
                aria-label="Seek"
                min={0}
                max={duration > 0 && Number.isFinite(duration) ? duration : 0}
                step={0.1}
                value={Math.min(time, duration || 0)}
                onChange={(e) => {
                  const v = videoRef.current
                  const t = Number(e.target.value)
                  if (v && Number.isFinite(t)) v.currentTime = t
                  setTime(t)
                }}
                className="h-1 min-w-0 flex-1 cursor-pointer accent-cyan-400"
              />
              <span className="shrink-0 text-xs tabular-nums text-gray-400">
                {clock(time)} / {clock(duration)}
              </span>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
