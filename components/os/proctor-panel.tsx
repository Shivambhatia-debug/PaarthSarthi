'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, ClipboardX, Eye, EyeOff, Mic, MonitorX, ScanFace, ShieldCheck, UserX, Volume2 } from 'lucide-react'
import { useDemo, type ProctorEvent } from '@/lib/os/demo-store'
import { useProctor } from '@/hooks/use-proctor'
import { useMicLevel } from '@/hooks/use-speech'
import { isDevanagari, type Bi } from '@/lib/os/i18n'
import { cn } from '@/lib/utils'

const TXT = {
  title: { en: 'Proctoring', hi: 'प्रॉक्टरिंग' },
  never: { en: 'Video never leaves this device', hi: 'वीडियो इस डिवाइस से बाहर नहीं जाता' },
  turnOn: { en: 'Turn on camera', hi: 'कैमरा चालू करें' },
  denied: { en: 'Camera blocked: proctoring continues without video', hi: 'कैमरा बंद: बिना वीडियो प्रॉक्टरिंग जारी' },
  off: { en: 'Camera off', hi: 'कैमरा बंद' },
  face: { en: 'Face detected: 1 (estimate)', hi: 'चेहरा मिला: 1 (अनुमान)' },
  blur: { en: 'Privacy blur', hi: 'प्राइवेसी ब्लर' },
  mic: { en: 'Mic', hi: 'माइक' },
  micIdle: { en: 'idle', hi: 'निष्क्रिय' },
  tabs: { en: 'Tab switches', hi: 'टैब बदले' },
  paste: { en: 'Paste blocks', hi: 'पेस्ट रोके' },
  integrity: { en: 'Integrity', hi: 'सत्यनिष्ठा' },
  events: { en: 'Recent events', hi: 'हाल की घटनाएँ' },
  none: { en: 'No events. Stay on this tab.', hi: 'कोई घटना नहीं। इसी टैब पर रहें।' },
} satisfies Record<string, Bi>

type PermState = 'granted' | 'denied' | 'prompt' | 'unknown'

async function queryPermission(name: 'camera' | 'microphone'): Promise<PermState> {
  try {
    if (typeof navigator === 'undefined' || !navigator.permissions?.query) return 'unknown'
    const res = await navigator.permissions.query({ name: name as PermissionName })
    return (res.state as PermState) ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

const EVENT_ICON: Record<ProctorEvent['kind'], typeof MonitorX> = {
  tab: MonitorX,
  paste: ClipboardX,
  face: UserX,
  noise: Volume2,
}

export interface ProctorPanelProps {
  compact?: boolean
  detectTabs?: boolean
  className?: string
}

/** Webcam tile (local only), mic meter, tab-switch and paste counters, integrity and the last 5 events. */
export function ProctorPanel({ compact, detectTabs = false, className }: ProctorPanelProps) {
  const { integrity, t, lite } = useDemo()
  const { cameraStream, cameraStatus, startCamera, blur, setBlur } = useProctor({ active: true, detectTabs })
  const videoRef = useRef<HTMLVideoElement>(null)
  const [micPerm, setMicPerm] = useState<PermState>('unknown')
  const autoTried = useRef(false)

  // Webcam auto-starts only when the camera permission is already granted (no surprise prompts).
  useEffect(() => {
    let alive = true
    queryPermission('camera').then((st) => {
      if (!alive || autoTried.current) return
      autoTried.current = true
      if (st === 'granted' && cameraStatus !== 'on') startCamera().catch(() => {})
    })
    queryPermission('microphone').then((st) => {
      if (alive) setMicPerm(st)
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    try {
      if (v.srcObject !== cameraStream) v.srcObject = cameraStream
      if (cameraStream) v.play().catch(() => {})
    } catch {
      /* ignore */
    }
  }, [cameraStream])

  const micLevel = useMicLevel(micPerm === 'granted')
  const on = cameraStatus === 'on' && !!cameraStream
  const score = Math.round(integrity?.score ?? 100)
  const tabs = integrity?.tabSwitches ?? 0
  const pastes = integrity?.pasteBlocks ?? 0
  const events = (integrity?.events ?? []).slice(-5).reverse()
  const scoreTone = score >= 96 ? 'text-emerald-300' : score >= 92 ? 'text-amber-300' : 'text-rose-300'
  const bar = score >= 96 ? 'from-emerald-400 to-cyan-300' : score >= 92 ? 'from-amber-400 to-amber-200' : 'from-rose-500 to-rose-300'

  const lbl = (b: Bi, c?: string) => {
    const s = t(b)
    const d = isDevanagari(s)
    return (
      <span lang={d ? 'hi' : 'en'} className={cn(d && 'font-deva', c)}>
        {s}
      </span>
    )
  }

  return (
    <section
      aria-label="Proctoring"
      className={cn('flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3', className)}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-200">
          <ShieldCheck className="h-4 w-4 text-cyan-300" aria-hidden />
          {lbl(TXT.title)}
        </div>
        <span className="relative flex h-2 w-2" aria-hidden>
          {on && !lite && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-60" />}
          <span className={cn('relative inline-flex h-2 w-2 rounded-full', on ? 'bg-rose-400' : 'bg-gray-600')} />
        </span>
      </header>

      {/* Webcam tile */}
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border border-white/10 bg-[#070a0f]',
          compact ? 'aspect-[16/10]' : 'aspect-[4/3]',
        )}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          className={cn(
            'h-full w-full -scale-x-100 object-cover transition-[filter,opacity] duration-300',
            on ? 'opacity-100' : 'opacity-0',
            blur && 'blur-md',
          )}
        />
        {on ? (
          <>
            <span className="pointer-events-none absolute inset-3 rounded-md" aria-hidden>
              <span className="absolute left-0 top-0 h-4 w-4 rounded-tl-md border-l-2 border-t-2 border-cyan-300/80" />
              <span className="absolute right-0 top-0 h-4 w-4 rounded-tr-md border-r-2 border-t-2 border-cyan-300/80" />
              <span className="absolute bottom-0 left-0 h-4 w-4 rounded-bl-md border-b-2 border-l-2 border-cyan-300/80" />
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-br-md border-b-2 border-r-2 border-cyan-300/80" />
            </span>
            <span
              className="scan-sweep pointer-events-none absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-cyan-300/10 to-transparent"
              aria-hidden
            />
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[12px] font-medium text-emerald-200 backdrop-blur">
              <ScanFace className="h-3.5 w-3.5" aria-hidden />
              {lbl(TXT.face)}
            </span>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/5 ring-1 ring-white/10">
              <Camera className="h-4 w-4 text-gray-400" aria-hidden />
            </span>
            {cameraStatus === 'denied' ? (
              lbl(TXT.denied, 'text-[12px] leading-snug text-gray-400')
            ) : (
              <button
                type="button"
                onClick={() => startCamera().catch(() => {})}
                className="rounded-md border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-1 text-[12px] font-medium text-cyan-200 transition-colors hover:bg-cyan-400/20"
              >
                {lbl(TXT.turnOn)}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setBlur(!blur)}
          aria-pressed={blur}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[12px] font-medium transition-colors',
            blur ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200' : 'border-white/10 text-gray-400 hover:text-gray-200',
          )}
        >
          {blur ? <EyeOff className="h-3.5 w-3.5" aria-hidden /> : <Eye className="h-3.5 w-3.5" aria-hidden />}
          {lbl(TXT.blur)}
        </button>
        <div className="flex min-w-0 items-center gap-1.5 text-[12px] text-gray-400" title={t(TXT.mic)}>
          <Mic className={cn('h-3.5 w-3.5 shrink-0', micLevel > 0.05 ? 'text-cyan-300' : 'text-gray-500')} aria-hidden />
          {micPerm === 'granted' ? (
            <span className="flex h-3 items-end gap-[2px]" aria-label={`Mic level ${Math.round(micLevel * 100)}%`}>
              {[0.12, 0.28, 0.45, 0.62, 0.8].map((th, i) => (
                <span
                  key={i}
                  className={cn('w-[3px] rounded-sm transition-colors duration-100', micLevel >= th ? 'bg-cyan-300' : 'bg-white/10')}
                  style={{ height: `${40 + i * 15}%` }}
                />
              ))}
            </span>
          ) : (
            lbl(TXT.micIdle, 'text-gray-500')
          )}
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-[12px] leading-snug text-gray-500">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400/80" aria-hidden />
        {lbl(TXT.never)}
      </p>

      {/* Counters */}
      <div className={cn('grid gap-2', detectTabs ? 'grid-cols-3' : 'grid-cols-2')}>
        {detectTabs && (
          <div className="rounded-lg border border-white/10 bg-black/20 px-2 py-1.5">
            {lbl(TXT.tabs, 'block truncate text-[12px] text-gray-500')}
            <span className={cn('text-[15px] font-semibold tabular-nums', tabs > 0 ? 'text-rose-300' : 'text-gray-100')}>
              {tabs}/3
            </span>
          </div>
        )}
        <div className="rounded-lg border border-white/10 bg-black/20 px-2 py-1.5">
          {lbl(TXT.paste, 'block truncate text-[12px] text-gray-500')}
          <span className={cn('text-[15px] font-semibold tabular-nums', pastes > 0 ? 'text-amber-300' : 'text-gray-100')}>
            {pastes}
          </span>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/20 px-2 py-1.5">
          {lbl(TXT.integrity, 'block truncate text-[12px] text-gray-500')}
          <span className={cn('text-[15px] font-semibold tabular-nums', scoreTone)}>{score}</span>
        </div>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-white/5" aria-hidden>
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-[width] duration-700', bar)}
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>

      {/* Events */}
      {!compact || events.length > 0 ? (
        <div>
          {lbl(TXT.events, 'mb-1.5 block text-[12px] font-medium uppercase tracking-wide text-gray-500')}
          {events.length === 0 ? (
            lbl(TXT.none, 'block text-[12px] text-gray-500')
          ) : (
            <ul className="space-y-1">
              {events.map((e, i) => {
                const Icon = EVENT_ICON[e.kind] ?? MonitorX
                return (
                  <li
                    key={`${e.t}-${i}`}
                    className={cn(
                      'os-rise flex items-center gap-2 rounded-md border px-2 py-1 text-[12px]',
                      e.kind === 'tab'
                        ? 'border-rose-400/25 bg-rose-400/[0.06] text-rose-200'
                        : 'border-amber-400/20 bg-amber-400/[0.05] text-amber-200',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="truncate">{e.label || e.kind}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  )
}
