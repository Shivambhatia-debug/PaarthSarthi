'use client'

import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { AIBadge } from '@/components/ai/ai-badge'
import { ProductFilm } from './product-film'
import { DEMO_REEL, mediaUrl } from './media'
import { useReducedMotion } from './shared'

/** "Watch 70-sec demo": the highlight reel; falls back to the six-scene film if the reel is missing. */
export function DemoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const reduced = useReducedMotion()
  const [failed, setFailed] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

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
          <video
            ref={(el) => {
              videoRef.current = el
              if (el) el.muted = true
            }}
            className="aspect-[16/10] max-h-[calc(100vh-120px)] w-full bg-black object-contain"
            controls
            autoPlay={!reduced}
            muted
            playsInline
            preload="metadata"
            poster={mediaUrl(DEMO_REEL, 'jpg')}
            onError={() => setFailed(true)}
          >
            <source src={mediaUrl(DEMO_REEL, 'webm')} type="video/webm" />
            <source src={mediaUrl(DEMO_REEL, 'mp4')} type="video/mp4" onError={() => setFailed(true)} />
          </video>
        )}
      </DialogContent>
    </Dialog>
  )
}
