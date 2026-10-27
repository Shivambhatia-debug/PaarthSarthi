'use client'

/* Presenter pre-flight (only with ?preflight=1). Run at T-30 min on localhost AND on the deployed origin:
 * unlock audio, grant mic + camera, check hi-IN voices, run the Hindi alias recognition test,
 * confirm online + Chrome, pick voice mode / Lite, reset demo state. Operator-facing English only. */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Camera,
  CheckCircle2,
  Chrome,
  Globe,
  Mic,
  Play,
  RotateCcw,
  ShieldCheck,
  Volume2,
  Wifi,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { aiToast } from '@/components/ai/ai-toast'
import { useDemo } from '@/lib/os/demo-store'
import { detectKeywords, countFillers } from '@/lib/ai-sim'
import { unlockAudio, isAudioUnlocked, useSpeak, useSpeechRecognition } from '@/hooks/use-speech'
import { markProctorGrace } from '@/hooks/use-proctor'
import { setQueryParam } from '@/hooks/use-query-param'
import { cn } from '@/lib/utils'

type Status = 'idle' | 'ok' | 'fail' | 'warn'

const HINDI_TEST = 'नमस्ते, मैं सारथी हूँ। आज हम प्लेसमेंट डे शुरू करेंगे।'
const REC_KEYWORDS = ['ESP32', 'MQTT'] as const
const REC_SECONDS = 5

const DOT: Record<Status, string> = {
  idle: 'bg-slate-500',
  ok: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]',
  fail: 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.8)]',
  warn: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.7)]',
}

const BTN =
  'inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 text-[13px] font-medium text-gray-100 outline-none transition-colors hover:border-white/30 hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-50'

function normLang(l: string | undefined): string {
  return (l ?? '').replace('_', '-').toLowerCase()
}

function Row({
  status,
  Icon,
  title,
  children,
  action,
}: {
  status: Status
  Icon: LucideIcon
  title: string
  children?: ReactNode
  action?: ReactNode
}) {
  return (
    <li className="flex flex-col gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-1.5 flex h-2.5 w-2.5 shrink-0 items-center justify-center">
          <span aria-hidden className={cn('h-2.5 w-2.5 rounded-full', DOT[status])} />
          <span className="sr-only">{status === 'ok' ? 'Pass' : status === 'fail' ? 'Fail' : status === 'warn' ? 'Warning' : 'Not checked'}</span>
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[14px] font-medium text-white">
            <Icon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            {title}
          </div>
          {children && <div className="mt-1 text-[12px] leading-relaxed text-gray-400">{children}</div>}
        </div>
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2 pl-5 sm:pl-0">{action}</div>}
    </li>
  )
}

export function PreflightPanel({ className }: { className?: string }) {
  const { presenter, voiceMode, lite, set, reset, setPresenter } = useDemo()
  const { speak, speaking, voices } = useSpeak()
  const rec = useSpeechRecognition({ lang: 'hi' })
  const recRef = useRef(rec)
  recRef.current = rec

  // Browser facts are read after mount (never during render: no hydration mismatch).
  const [mounted, setMounted] = useState(false)
  const [origin, setOrigin] = useState('')
  const [online, setOnline] = useState(true)
  const [isChrome, setIsChrome] = useState(true)
  const [audio, setAudio] = useState<Status>('idle')
  const [mic, setMic] = useState<Status>('idle')
  const [cam, setCam] = useState<Status>('idle')
  const [micErr, setMicErr] = useState('')
  const [camErr, setCamErr] = useState('')
  const [voiceTest, setVoiceTest] = useState<Status>('idle')
  const [recPhase, setRecPhase] = useState<'idle' | 'listening' | 'done'>('idle')
  const [left, setLeft] = useState(0)
  const timers = useRef<{ stop: ReturnType<typeof setTimeout> | null; tick: ReturnType<typeof setInterval> | null }>({
    stop: null,
    tick: null,
  })

  useEffect(() => {
    setMounted(true)
    try {
      setOrigin(window.location.origin)
      setOnline(navigator.onLine)
      const ua = navigator.userAgent
      setIsChrome(/Chrome\//.test(ua) && !/Edg\/|OPR\/|SamsungBrowser|YaBrowser/.test(ua) && navigator.vendor === 'Google Inc.')
      if (isAudioUnlocked()) setAudio('ok')
    } catch {
      /* ignore */
    }
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)

    // Current permission state (Chrome supports these names; others may throw).
    let alive = true
    const query = (name: string, setter: (s: Status) => void) => {
      try {
        navigator.permissions
          ?.query({ name: name as PermissionName })
          .then((p) => {
            if (!alive) return
            if (p.state === 'granted') setter('ok')
            else if (p.state === 'denied') setter('fail')
          })
          .catch(() => {})
      } catch {
        /* ignore */
      }
    }
    query('microphone', setMic)
    query('camera', setCam)

    const t = timers.current
    return () => {
      alive = false
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
      if (t.stop) clearTimeout(t.stop)
      if (t.tick) clearInterval(t.tick)
      t.stop = null
      t.tick = null
      try {
        recRef.current.stop()
      } catch {
        /* ignore */
      }
    }
  }, [])

  const doUnlock = async () => {
    try {
      await unlockAudio()
      setAudio(isAudioUnlocked() ? 'ok' : 'fail')
    } catch {
      setAudio('fail')
    }
  }

  const askMedia = async (kind: 'mic' | 'cam') => {
    const setS = kind === 'mic' ? setMic : setCam
    const setE = kind === 'mic' ? setMicErr : setCamErr
    setE('')
    // The browser prompt blurs the window; tell the proctor to ignore it.
    markProctorGrace(15000)
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('getUserMedia unavailable (needs https or localhost)')
      const stream = await navigator.mediaDevices.getUserMedia(kind === 'mic' ? { audio: true } : { video: true })
      stream.getTracks().forEach((t) => t.stop())
      setS('ok')
    } catch (e) {
      setS('fail')
      setE(e instanceof Error ? e.name && e.name !== 'Error' ? e.name : e.message : 'Permission failed')
    }
  }

  const hiVoices = voices.filter((v) => normLang(v.lang).startsWith('hi'))
  const enInVoices = voices.filter((v) => normLang(v.lang) === 'en-in')

  const testVoice = async () => {
    setVoiceTest('idle')
    try {
      await unlockAudio()
      setAudio('ok')
      await speak(HINDI_TEST, 'hi')
      setVoiceTest('ok')
    } catch {
      setVoiceTest('fail')
    }
  }

  const clearTimers = () => {
    const t = timers.current
    if (t.stop) clearTimeout(t.stop)
    if (t.tick) clearInterval(t.tick)
    t.stop = null
    t.tick = null
  }

  const startRec = useCallback(() => {
    clearTimers()
    markProctorGrace(8000)
    recRef.current.reset()
    recRef.current.start()
    setRecPhase('listening')
    setLeft(REC_SECONDS)
    timers.current.tick = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000)
    timers.current.stop = setTimeout(() => {
      clearTimers()
      recRef.current.stop()
      setLeft(0)
      setRecPhase('done')
    }, REC_SECONDS * 1000)
  }, [])

  const transcript = [rec.finalText, rec.interim].map((s) => s.trim()).filter(Boolean).join(' ')
  const kwHits = detectKeywords(transcript, REC_KEYWORDS)
  const fillers = countFillers(transcript).total
  const recPass = REC_KEYWORDS.every((k) => kwHits.includes(k)) && fillers >= 1
  const recStatus: Status = recPass ? 'ok' : recPhase === 'done' || rec.error ? 'fail' : 'idle'

  const voiceStatus: Status = !mounted ? 'idle' : voiceTest === 'fail' ? 'fail' : hiVoices.length ? 'ok' : voices.length ? 'fail' : 'idle'
  const originStatus: Status = !origin ? 'idle' : /^https:|^http:\/\/(localhost|127\.0\.0\.1)/.test(origin) ? 'ok' : 'warn'

  const checks: Status[] = [
    originStatus,
    audio,
    mic,
    cam,
    voiceStatus,
    recStatus,
    mounted ? (online ? 'ok' : 'fail') : 'idle',
    mounted ? (isChrome ? 'ok' : 'warn') : 'idle',
  ]
  const passed = checks.filter((s) => s === 'ok').length

  const doReset = () => {
    reset()
    aiToast('Demo state reset', { tone: 'ok', id: 'preflight-reset', duration: 2500 })
  }

  return (
    <section
      aria-label="Presenter pre-flight"
      className={cn(
        'no-print rounded-2xl border border-cyan-400/20 bg-[#0b1220] p-4 shadow-[0_24px_60px_-34px_rgba(34,211,238,0.45)] sm:p-5',
        className,
      )}
    >
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/25">
            <ShieldCheck className="h-[18px] w-[18px]" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-[17px] font-semibold text-white">Pre-flight checklist</h2>
            <p className="text-[12px] text-gray-400">Run on localhost and on the deployed URL, in the browser you will present from.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-[12px] font-semibold tabular-nums ring-1',
              passed === checks.length
                ? 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/30'
                : 'bg-white/[0.04] text-gray-300 ring-white/15',
            )}
          >
            {passed}/{checks.length} ready
          </span>
          <button type="button" onClick={() => setQueryParam('preflight', null)} className={BTN} aria-label="Hide pre-flight">
            <X className="h-4 w-4" aria-hidden />
            Hide
          </button>
        </div>
      </header>

      <ul className="grid gap-2.5 lg:grid-cols-2">
        <Row status={originStatus} Icon={Globe} title="Origin">
          <code className="break-all rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-cyan-200">
            {origin || '…'}
          </code>
          <div className="mt-1">Grant mic and camera on THIS origin (do it on localhost and on the deployed URL).</div>
        </Row>

        <Row
          status={audio}
          Icon={Volume2}
          title="Audio unlocked"
          action={
            <button type="button" onClick={doUnlock} className={BTN}>
              <Volume2 className="h-4 w-4" aria-hidden />
              Unlock audio
            </button>
          }
        >
          Click once so speech and sounds can play without a gesture later.
        </Row>

        <Row
          status={mic}
          Icon={Mic}
          title="Microphone permission"
          action={
            <button type="button" onClick={() => askMedia('mic')} className={BTN}>
              <Mic className="h-4 w-4" aria-hidden />
              Grant mic
            </button>
          }
        >
          {mic === 'fail' ? <span className="text-rose-300">Blocked{micErr ? `: ${micErr}` : ''}. Allow it in the site settings.</span> : 'Needed for live interview rounds.'}
        </Row>

        <Row
          status={cam}
          Icon={Camera}
          title="Camera permission"
          action={
            <button type="button" onClick={() => askMedia('cam')} className={BTN}>
              <Camera className="h-4 w-4" aria-hidden />
              Grant camera
            </button>
          }
        >
          {cam === 'fail' ? <span className="text-rose-300">Blocked{camErr ? `: ${camErr}` : ''}. Allow it in the site settings.</span> : 'Needed for the proctoring preview.'}
        </Row>

        <Row
          status={voiceStatus}
          Icon={Volume2}
          title="Voices (hi-IN / en-IN)"
          action={
            <button type="button" onClick={testVoice} disabled={speaking} className={BTN}>
              <Play className="h-4 w-4" aria-hidden />
              {speaking ? 'Speaking…' : 'Test Hindi voice'}
            </button>
          }
        >
          <div>
            <span className="text-gray-300">hi-IN:</span>{' '}
            {hiVoices.length ? hiVoices.map((v) => v.name).join(', ') : <span className="text-rose-300">none found</span>}
          </div>
          <div>
            <span className="text-gray-300">en-IN:</span>{' '}
            {enInVoices.length ? enInVoices.map((v) => v.name).join(', ') : <span className="text-amber-300">none found</span>}
          </div>
        </Row>

        <Row
          status={recStatus}
          Icon={Mic}
          title={`Recognition test (${REC_SECONDS} s, hi-IN)`}
          action={
            <button type="button" onClick={startRec} disabled={recPhase === 'listening' || !rec.supported} className={BTN}>
              <Mic className={cn('h-4 w-4', recPhase === 'listening' && 'animate-pulse text-rose-300')} aria-hidden />
              {recPhase === 'listening' ? `Listening… ${left}s` : recPhase === 'done' ? 'Run again' : 'Start test'}
            </button>
          }
        >
          {!rec.supported && mounted ? (
            <span className="text-rose-300">Speech recognition is not supported in this browser. Use Chrome.</span>
          ) : (
            <>
              <div>
                Say: <span className="font-medium text-gray-200">&lsquo;matlab ESP32 aur MQTT&rsquo;</span>
              </div>
              <div className="mt-1.5 min-h-[20px] rounded-md bg-white/[0.04] px-2 py-1 font-mono text-[12px] text-gray-200" lang="hi">
                {transcript || <span className="text-gray-500">transcript appears here</span>}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {REC_KEYWORDS.map((k) => {
                  const hit = kwHits.includes(k)
                  return (
                    <span
                      key={k}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium ring-1',
                        hit ? 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/30' : 'bg-white/[0.03] text-gray-500 ring-white/10',
                      )}
                    >
                      {hit && <CheckCircle2 className="h-3 w-3" aria-hidden />}
                      {k}
                    </span>
                  )
                })}
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[12px] font-medium tabular-nums ring-1',
                    fillers >= 1 ? 'bg-violet-400/10 text-violet-200 ring-violet-400/30' : 'bg-white/[0.03] text-gray-500 ring-white/10',
                  )}
                >
                  Fillers: {fillers}
                </span>
                {rec.error && <span className="text-[12px] text-rose-300">Error: {rec.error}</span>}
              </div>
            </>
          )}
        </Row>

        <Row status={mounted ? (online ? 'ok' : 'fail') : 'idle'} Icon={Wifi} title="Network">
          {mounted ? (online ? 'navigator.onLine: online' : 'Offline. Switch to the phone hotspot.') : '…'}
        </Row>

        <Row status={mounted ? (isChrome ? 'ok' : 'warn') : 'idle'} Icon={Chrome} title="Browser">
          {isChrome ? 'Google Chrome detected.' : <span className="text-amber-300">Not Chrome. Live voice and recognition are only tested in Chrome.</span>}
        </Row>
      </ul>

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-gray-300">Voice mode</span>
            <div role="radiogroup" aria-label="Voice mode" className="inline-flex rounded-lg border border-white/15 bg-white/[0.03] p-0.5">
              {(['live', 'scripted'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={voiceMode === m}
                  onClick={() => set({ voiceMode: m })}
                  className={cn(
                    'h-8 rounded-md px-3 text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-300',
                    voiceMode === m ? 'bg-cyan-500/20 text-cyan-100' : 'text-gray-400 hover:text-gray-200',
                  )}
                >
                  {m === 'live' ? 'Live mic' : 'Scripted'}
                </button>
              ))}
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-gray-300">
            <Switch checked={lite} onCheckedChange={(v) => set({ lite: !!v })} aria-label="Lite mode" />
            Lite mode
          </label>
          <button type="button" onClick={doReset} className={BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            Reset demo state
          </button>
        </div>
        {presenter ? (
          <p className="text-[12px] text-emerald-300/90">Presenter mode is ON (dock visible). Visitors never see it.</p>
        ) : (
          <p className="flex flex-wrap items-center gap-2 text-[12px] text-amber-300/90">
            Presenter mode is OFF.
            <button type="button" onClick={() => setPresenter(true)} className="underline underline-offset-2 hover:text-amber-200">
              Turn it on
            </button>
          </p>
        )}
      </div>
    </section>
  )
}
