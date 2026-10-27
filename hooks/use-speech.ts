'use client'

/**
 * Browser speech plumbing for the demo (production: Bhashini ASR/TTS, India-hosted).
 *
 * - One shared AudioContext, unlocked by a user gesture (AudioGate / dock / hotkeys).
 * - useSpeak: chunked, queued speechSynthesis with a 12 s per-chunk watchdog
 *   (Chrome's Google voices stop after ~15 s and sometimes never fire onend).
 * - useSpeechRecognition: continuous hi-IN / en-IN recognition with auto-restart.
 * - useMicLevel: RMS level 0-1 from the microphone.
 *
 * Nothing here throws: unsupported browsers resolve or report `supported: false`.
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { Lang } from '@/lib/os/i18n'
import { markProctorGrace } from '@/hooks/use-proctor'

// ---------------------------------------------------------------------------
// Audio context + unlock
// ---------------------------------------------------------------------------

let sharedCtx: AudioContext | null = null
let unlocked = false

type WindowWithAudio = {
  AudioContext?: typeof AudioContext
  webkitAudioContext?: typeof AudioContext
  SpeechRecognition?: SpeechRecognitionCtor
  webkitSpeechRecognition?: SpeechRecognitionCtor
}

/** Lazily creates the one AudioContext the app uses. null on the server or when unsupported. */
export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (sharedCtx && sharedCtx.state !== 'closed') return sharedCtx
  const w = window as unknown as WindowWithAudio
  const Ctor = w.AudioContext ?? w.webkitAudioContext
  if (!Ctor) return null
  try {
    sharedCtx = new Ctor()
  } catch {
    sharedCtx = null
  }
  return sharedCtx
}

function getSynth(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null
  try {
    return 'speechSynthesis' in window ? window.speechSynthesis : null
  } catch {
    return null
  }
}

// Utterances referenced from module scope: Chrome garbage-collects unreferenced ones and onend never fires.
const liveUtterances: SpeechSynthesisUtterance[] = []
function keep(u: SpeechSynthesisUtterance) {
  liveUtterances.push(u)
  if (liveUtterances.length > 50) liveUtterances.splice(0, liveUtterances.length - 50)
}
function release(u: SpeechSynthesisUtterance) {
  const i = liveUtterances.indexOf(u)
  if (i >= 0) liveUtterances.splice(i, 1)
}

/**
 * Call from a user gesture. Resumes the shared AudioContext and primes speechSynthesis
 * (Chrome blocks both until the user interacts). Never throws.
 */
export async function unlockAudio(): Promise<void> {
  try {
    const ctx = getSharedAudioContext()
    if (ctx && ctx.state === 'suspended') {
      await Promise.race([ctx.resume().catch(() => {}), new Promise((r) => setTimeout(r, 600))])
    }
  } catch {
    /* ignore */
  }
  try {
    const synth = getSynth()
    if (synth) {
      synth.cancel()
      if (synth.paused) synth.resume()
      const u = new SpeechSynthesisUtterance(' ')
      u.volume = 0
      u.onend = () => release(u)
      u.onerror = () => release(u)
      keep(u)
      synth.speak(u)
      synth.getVoices()
    }
  } catch {
    /* ignore */
  }
  unlocked = true
}

export function isAudioUnlocked(): boolean {
  return unlocked
}

// ---------------------------------------------------------------------------
// Chunking
// ---------------------------------------------------------------------------

function splitLong(sentence: string, max: number): string[] {
  if (sentence.length <= max) return [sentence]
  const out: string[] = []
  // 1) commas (and semicolons): keep the mark on the left-hand piece
  const parts = sentence.replace(/([,;،])\s+/g, '$1\u0000').split('\u0000')
  let buf = ''
  const flush = () => {
    if (buf.trim()) out.push(buf.trim())
    buf = ''
  }
  for (const part of parts) {
    if (part.length > max) {
      flush()
      // 2) spaces
      let line = ''
      for (const word of part.split(/\s+/)) {
        if (!word) continue
        if (word.length > max) {
          if (line) out.push(line)
          line = ''
          for (let i = 0; i < word.length; i += max) out.push(word.slice(i, i + max))
          continue
        }
        if ((line ? line.length + 1 : 0) + word.length > max) {
          if (line) out.push(line)
          line = word
        } else line = line ? `${line} ${word}` : word
      }
      if (line) out.push(line)
    } else if ((buf ? buf.length + 1 : 0) + part.length > max) {
      flush()
      buf = part
    } else buf = buf ? `${buf} ${part}` : part
  }
  flush()
  return out
}

/**
 * Splits text into chunks of at most `max` characters: at sentence ends (. ? ! ।), then commas, then spaces.
 * '.' only ends a sentence before whitespace, so 'list.remove()' and '3.5' stay intact.
 */
export function splitForSpeech(text: string, max = 180): string[] {
  const src = (typeof text === 'string' ? text : '').replace(/\s+/g, ' ').trim()
  if (!src) return []
  const limit = Math.max(20, max)
  const sentences: string[] = []
  let start = 0
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    const next = src[i + 1]
    const end = ch === '।' || ch === '॥' || ((ch === '.' || ch === '?' || ch === '!') && (next === undefined || next === ' '))
    if (end) {
      // keep runs like '?!' or '...' together
      let j = i
      while (j + 1 < src.length && /[.?!।॥"'”’)]/.test(src[j + 1])) j++
      const s = src.slice(start, j + 1).trim()
      if (s) sentences.push(s)
      start = j + 1
      i = j
    }
  }
  const tail = src.slice(start).trim()
  if (tail) sentences.push(tail)
  return sentences.flatMap((s) => splitLong(s, limit)).filter((s) => s.trim().length > 0)
}

// ---------------------------------------------------------------------------
// useSpeak
// ---------------------------------------------------------------------------

const normLang = (l: string) => (l || '').replace('_', '-').toLowerCase()
const isHiVoice = (v: SpeechSynthesisVoice) => normLang(v.lang).startsWith('hi')
const isEnInVoice = (v: SpeechSynthesisVoice) => normLang(v.lang) === 'en-in'
const isEnVoice = (v: SpeechSynthesisVoice) => normLang(v.lang).startsWith('en')
const preferGoogle = (list: SpeechSynthesisVoice[]) => list.find((v) => /google/i.test(v.name)) ?? list[0]

function pickVoice(voices: SpeechSynthesisVoice[], lang: Lang): SpeechSynthesisVoice | null {
  if (!voices.length) return null
  if (lang === 'hi' || lang === 'hinglish') {
    const hi = voices.filter(isHiVoice)
    if (hi.length) return preferGoogle(hi)
  }
  const enIn = voices.filter(isEnInVoice)
  if (enIn.length) return preferGoogle(enIn)
  const en = voices.filter(isEnVoice)
  if (en.length) return preferGoogle(en)
  return null
}

const CHUNK_TIMEOUT_MS = 12000
const START_TIMEOUT_MS = 4000

export interface SpeakOptions {
  rate?: number
}

export interface UseSpeakResult {
  speak: (text: string, lang: Lang, opts?: SpeakOptions) => Promise<void>
  cancel: () => void
  speaking: boolean
  hasHindiVoice: boolean
  hasIndianEnglish: boolean
  voices: SpeechSynthesisVoice[]
}

// Voices survive page changes, so a new screen knows hasHindiVoice on its first render.
let voiceCache: SpeechSynthesisVoice[] = []

export function useSpeak(): UseSpeakResult {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => voiceCache)
  const [speaking, setSpeaking] = useState(false)
  const voicesRef = useRef<SpeechSynthesisVoice[]>(voiceCache)
  const tokenRef = useRef(0)
  const pendingFinish = useRef<Set<() => void>>(new Set())
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    const synth = getSynth()
    if (!synth) return
    const load = () => {
      try {
        const list = synth.getVoices() ?? []
        if (list.length || voicesRef.current.length === 0) {
          voicesRef.current = list
          if (list.length) voiceCache = list
          if (mountedRef.current) setVoices(list)
        }
      } catch {
        /* ignore */
      }
    }
    load()
    // Chrome loads voices asynchronously; some builds never fire voiceschanged.
    const t1 = setTimeout(load, 250)
    const t2 = setTimeout(load, 1200)
    try {
      synth.addEventListener('voiceschanged', load)
    } catch {
      /* ignore */
    }
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      try {
        synth.removeEventListener('voiceschanged', load)
      } catch {
        /* ignore */
      }
    }
  }, [])

  const cancel = useCallback(() => {
    tokenRef.current += 1
    try {
      getSynth()?.cancel()
    } catch {
      /* ignore */
    }
    const finishers = Array.from(pendingFinish.current)
    pendingFinish.current.clear()
    finishers.forEach((f) => f())
    if (mountedRef.current) setSpeaking(false)
  }, [])

  // Stop speaking when the component unmounts (page change).
  useEffect(
    () => () => {
      mountedRef.current = false
      tokenRef.current += 1
      try {
        getSynth()?.cancel()
      } catch {
        /* ignore */
      }
      const finishers = Array.from(pendingFinish.current)
      pendingFinish.current.clear()
      finishers.forEach((f) => f())
    },
    [],
  )

  const speak = useCallback(async (text: string, lang: Lang, opts: SpeakOptions = {}) => {
    const synth = getSynth()
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return
    const chunks = splitForSpeech(text)
    if (!chunks.length) return

    // A new speak() replaces whatever is being said.
    tokenRef.current += 1
    const token = tokenRef.current
    let wasBusy = false
    try {
      wasBusy = synth.speaking || synth.pending
      synth.cancel()
    } catch {
      /* ignore */
    }
    const prev = Array.from(pendingFinish.current)
    pendingFinish.current.clear()
    prev.forEach((f) => f())
    // Chrome can silently drop an utterance queued in the same tick as cancel().
    if (wasBusy) {
      await new Promise((r) => setTimeout(r, 90))
      if (tokenRef.current !== token) return
    }

    let list = voicesRef.current
    if (!list.length) {
      try {
        list = synth.getVoices() ?? []
        voicesRef.current = list
      } catch {
        list = []
      }
    }
    const voice = pickVoice(list, lang)
    const langTag = voice?.lang ?? (lang === 'en' ? 'en-IN' : 'hi-IN')
    const rate = typeof opts.rate === 'number' && opts.rate > 0 ? opts.rate : 1

    if (mountedRef.current) setSpeaking(true)
    for (const chunk of chunks) {
      if (tokenRef.current !== token) return
      await new Promise<void>((resolve) => {
        let settled = false
        let timer: ReturnType<typeof setTimeout> | undefined
        let startTimer: ReturnType<typeof setTimeout> | undefined
        const u = new SpeechSynthesisUtterance(chunk)
        const finish = () => {
          if (settled) return
          settled = true
          if (timer) clearTimeout(timer)
          if (startTimer) clearTimeout(startTimer)
          pendingFinish.current.delete(finish)
          release(u)
          resolve()
        }
        try {
          if (voice) u.voice = voice
          u.lang = langTag
          u.rate = rate
          u.pitch = 1
          u.volume = 1
          u.onend = finish
          u.onerror = finish
          u.onstart = () => {
            if (startTimer) clearTimeout(startTimer)
            startTimer = undefined
          }
          keep(u)
          pendingFinish.current.add(finish)
          timer = setTimeout(finish, CHUNK_TIMEOUT_MS)
          // If the engine never starts this chunk (dropped utterance), move on instead of stalling 12 s.
          startTimer = setTimeout(finish, START_TIMEOUT_MS)
          if (synth.paused) synth.resume()
          synth.speak(u)
        } catch {
          finish()
        }
      })
    }
    if (tokenRef.current === token && mountedRef.current) setSpeaking(false)
  }, [])

  return {
    speak,
    cancel,
    speaking,
    hasHindiVoice: voices.some(isHiVoice),
    hasIndianEnglish: voices.some(isEnInVoice),
    voices,
  }
}

// ---------------------------------------------------------------------------
// useSpeechRecognition
// ---------------------------------------------------------------------------

interface SRAlternative {
  transcript: string
}
interface SRResult {
  isFinal: boolean
  length: number
  [index: number]: SRAlternative
}
interface SRResultList {
  length: number
  [index: number]: SRResult
}
interface SREvent {
  resultIndex: number
  results: SRResultList
}
interface SRErrorEvent {
  error: string
}
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((e: SREvent) => void) | null
  onerror: ((e: SRErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as WindowWithAudio
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

const noopSubscribe = () => () => {}
const NON_FATAL = new Set(['no-speech', 'aborted'])

const joinText = (...parts: string[]) =>
  parts
    .map((p) => p.trim())
    .filter(Boolean)
    .join(' ')

export interface UseSpeechRecognitionResult {
  supported: boolean
  listening: boolean
  interim: string
  finalText: string
  /** Date.now() of the last result (interim or final), or null. */
  lastResultAt: number | null
  start: () => void
  stop: () => void
  reset: () => void
  error: string | null
}

/** Continuous recognition. hi-IN for 'hi' and 'hinglish'; en-IN for 'en'. */
export function useSpeechRecognition({ lang }: { lang: Lang }): UseSpeechRecognitionResult {
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => !!getRecognitionCtor(),
    () => false,
  )
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [finalText, setFinalText] = useState('')
  const [lastResultAt, setLastResultAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const recRef = useRef<SpeechRecognitionLike | null>(null)
  const wantRef = useRef(false)
  const committedRef = useRef('') // finals from earlier sessions
  const sessionFinalRef = useRef('')
  const interimRef = useRef('')
  const offsetRef = useRef(0) // results index to start from after reset()
  const lastLenRef = useRef(0)
  const restartTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const restartLog = useRef<number[]>([])
  const langRef = useRef(lang)
  langRef.current = lang
  const mountedRef = useRef(true)

  const tagFor = (l: Lang) => (l === 'en' ? 'en-IN' : 'hi-IN')

  const clearRestart = () => {
    if (restartTimer.current) clearTimeout(restartTimer.current)
    restartTimer.current = null
  }

  const detach = (rec: SpeechRecognitionLike | null) => {
    if (!rec) return
    rec.onresult = null
    rec.onerror = null
    rec.onend = null
    rec.onstart = null
  }

  const fail = useCallback((code: string) => {
    wantRef.current = false
    clearRestart()
    const rec = recRef.current
    recRef.current = null
    detach(rec)
    try {
      rec?.abort()
    } catch {
      /* ignore */
    }
    if (!mountedRef.current) return
    // keep whatever was heard
    const frozen = joinText(committedRef.current, sessionFinalRef.current, interimRef.current)
    committedRef.current = frozen
    sessionFinalRef.current = ''
    interimRef.current = ''
    setFinalText(frozen)
    setInterim('')
    setError(code)
    setListening(false)
  }, [])

  const begin = useCallback(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) {
      fail('not-supported')
      return
    }
    let rec = recRef.current
    if (!rec) {
      try {
        rec = new Ctor()
      } catch {
        fail('not-supported')
        return
      }
      recRef.current = rec
    }
    const self = rec
    self.lang = tagFor(langRef.current)
    self.continuous = true
    self.interimResults = true
    self.maxAlternatives = 1
    offsetRef.current = 0
    lastLenRef.current = 0
    sessionFinalRef.current = ''
    self.onresult = (e: SREvent) => {
      if (recRef.current !== self) return
      const results = e.results
      lastLenRef.current = results.length
      let fin = ''
      let int = ''
      for (let i = offsetRef.current; i < results.length; i++) {
        const r = results[i]
        const t = r?.[0]?.transcript ?? ''
        if (r?.isFinal) fin = joinText(fin, t)
        else int = joinText(int, t)
      }
      sessionFinalRef.current = fin
      interimRef.current = int
      if (!mountedRef.current) return
      setFinalText(joinText(committedRef.current, fin))
      setInterim(int)
      setLastResultAt(Date.now())
    }
    self.onerror = (e: SRErrorEvent) => {
      if (recRef.current !== self) return
      const code = e?.error || 'unknown'
      if (NON_FATAL.has(code)) return
      fail(code)
    }
    self.onend = () => {
      if (recRef.current !== self) return
      // Commit this session's finals; interim words that never finalised are kept too.
      committedRef.current = joinText(committedRef.current, sessionFinalRef.current, interimRef.current)
      sessionFinalRef.current = ''
      interimRef.current = ''
      if (mountedRef.current) {
        setFinalText(committedRef.current)
        setInterim('')
      }
      if (!wantRef.current) {
        if (mountedRef.current) setListening(false)
        return
      }
      // Auto-restart (Chrome ends sessions after silence or ~60 s). Guard against a tight failure loop.
      const now = Date.now()
      restartLog.current = restartLog.current.filter((t) => now - t < 6000)
      restartLog.current.push(now)
      if (restartLog.current.length > 8) {
        fail('network')
        return
      }
      clearRestart()
      restartTimer.current = setTimeout(() => {
        restartTimer.current = null
        if (!wantRef.current || recRef.current !== self) return
        try {
          self.lang = tagFor(langRef.current)
          offsetRef.current = 0
          lastLenRef.current = 0
          self.start()
        } catch {
          // InvalidStateError: already started; ignore
        }
      }, 250)
    }
    try {
      self.start()
    } catch {
      /* already started */
    }
  }, [fail])

  const start = useCallback(() => {
    // The mic permission prompt can blur the window: never count it as a tab switch.
    markProctorGrace(4000)
    setError(null)
    if (!getRecognitionCtor()) {
      fail('not-supported')
      return
    }
    if (wantRef.current && recRef.current) return
    wantRef.current = true
    restartLog.current = []
    setListening(true)
    begin()
  }, [begin, fail])

  const stop = useCallback(() => {
    wantRef.current = false
    clearRestart()
    const rec = recRef.current
    recRef.current = null
    // Freeze the transcript now (including interim words) so callers can score immediately.
    const frozen = joinText(committedRef.current, sessionFinalRef.current, interimRef.current)
    committedRef.current = frozen
    sessionFinalRef.current = ''
    interimRef.current = ''
    detach(rec)
    try {
      rec?.abort()
    } catch {
      /* ignore */
    }
    setFinalText(frozen)
    setInterim('')
    setListening(false)
  }, [])

  const reset = useCallback(() => {
    committedRef.current = ''
    sessionFinalRef.current = ''
    interimRef.current = ''
    // Ignore results already delivered in the running session.
    offsetRef.current = lastLenRef.current
    setFinalText('')
    setInterim('')
    setLastResultAt(null)
    setError(null)
  }, [])

  // Language change while listening: restart the session with the new language.
  useEffect(() => {
    const rec = recRef.current
    if (!rec || !wantRef.current) return
    try {
      rec.abort() // onend commits text and restarts with langRef
    } catch {
      /* ignore */
    }
  }, [lang])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      wantRef.current = false
      clearRestart()
      const rec = recRef.current
      recRef.current = null
      detach(rec)
      try {
        rec?.abort()
      } catch {
        /* ignore */
      }
    }
  }, [])

  return { supported, listening, interim, finalText, lastResultAt, start, stop, reset, error }
}

// ---------------------------------------------------------------------------
// useMicLevel
// ---------------------------------------------------------------------------

/** Microphone RMS level, 0-1 (perceptually scaled, noise-gated). 0 while inactive or denied. */
export function useMicLevel(active: boolean): number {
  const [level, setLevel] = useState(0)

  useEffect(() => {
    if (!active) {
      setLevel(0)
      return
    }
    let cancelled = false
    let raf = 0
    let stream: MediaStream | null = null
    let source: MediaStreamAudioSourceNode | null = null
    let analyser: AnalyserNode | null = null

    markProctorGrace(4000)
    ;(async () => {
      try {
        if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return
        const s = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        })
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        stream = s
        const ctx = getSharedAudioContext()
        if (!ctx) return
        if (ctx.state === 'suspended') ctx.resume().catch(() => {})
        source = ctx.createMediaStreamSource(s)
        analyser = ctx.createAnalyser()
        analyser.fftSize = 1024
        analyser.smoothingTimeConstant = 0.5
        source.connect(analyser)
        const buf = new Float32Array(analyser.fftSize)
        let smooth = 0
        let lastEmit = 0
        let lastValue = -1
        const loop = (now: number) => {
          if (cancelled || !analyser) return
          analyser.getFloatTimeDomainData(buf)
          let sum = 0
          for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i]
          const rms = Math.sqrt(sum / buf.length)
          const target = Math.min(1, Math.pow(Math.max(0, rms - 0.003) * 8, 0.75))
          // fast attack, slower release
          smooth = target > smooth ? smooth * 0.4 + target * 0.6 : smooth * 0.82 + target * 0.18
          // ~25 updates/s, and only when the change is visible
          if (now - lastEmit > 40 && Math.abs(smooth - lastValue) > 0.015) {
            lastEmit = now
            lastValue = smooth
            setLevel(Math.round(smooth * 100) / 100)
          }
          raf = requestAnimationFrame(loop)
        }
        raf = requestAnimationFrame(loop)
      } catch {
        /* permission denied or no device: level stays 0 */
      } finally {
        markProctorGrace(1500)
      }
    })()

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      try {
        source?.disconnect()
        analyser?.disconnect()
      } catch {
        /* ignore */
      }
      stream?.getTracks().forEach((t) => t.stop())
      setLevel(0)
    }
  }, [active])

  return level
}
