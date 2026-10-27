'use client'

/**
 * Proctoring for drive rounds: webcam tile (never leaves the device), tab-switch
 * detection and paste/copy blocking inside [data-proctored].
 *
 * Several panels can mount useProctor at once (desktop rail + mobile sheet), so the
 * window listeners and the camera stream are shared module-level singletons:
 * a tab switch is struck exactly once, and the camera opens once.
 */

import { useCallback, useEffect, useId, useRef, useSyncExternalStore } from 'react'
import { useDemo, type ProctorInput } from '@/lib/os/demo-store'
import { aiToast } from '@/components/ai/ai-toast'

// ---------------------------------------------------------------------------
// Grace window (permission prompts, confirm dialogs, file pickers blur the window)
// ---------------------------------------------------------------------------

let graceUntil = 0

function nowMs(): number {
  return typeof performance !== 'undefined' ? performance.now() : 0
}

/** Ignore window blur for the next `ms` milliseconds (call before anything that opens a browser prompt). */
export function markProctorGrace(ms = 2000): void {
  graceUntil = Math.max(graceUntil, nowMs() + Math.max(0, ms))
}

function inGrace(): boolean {
  return nowMs() < graceUntil
}

// ---------------------------------------------------------------------------
// Shared listeners (ref-counted registrations)
// ---------------------------------------------------------------------------

interface Registration {
  detectTabs: boolean
  log: (e: ProctorInput) => void
  getTabSwitches: () => number
}

const registrations = new Map<string, Registration>()
let installed = false
let lastStrikeAt = -Infinity
let episodeStruck = false
let blurTimer: ReturnType<typeof setTimeout> | null = null
let lastBlockToastAt = -Infinity

function latest(): Registration | null {
  const all = Array.from(registrations.values())
  return all.length ? all[all.length - 1] : null
}

function tabsEnabled(): boolean {
  let on = false
  registrations.forEach((r) => {
    if (r.detectTabs) on = true
  })
  return on
}

function strike() {
  const reg = latest()
  if (!reg || !tabsEnabled()) return
  const now = nowMs()
  if (episodeStruck || now - lastStrikeAt < 1000) return
  episodeStruck = true
  lastStrikeAt = now
  // Strikes are >= 1 s apart, so the store (and getTabSwitches) is always current here.
  const n = reg.getTabSwitches() + 1
  reg.log({ kind: 'tab', label: 'Tab switch / focus lost' })
  // Longer than default: the toast may appear while the tab is hidden.
  aiToast(`Proctor: tab switch detected (${n}/3), logged`, { tone: 'risk', duration: 7000 })
}

function onVisibility() {
  if (document.visibilityState === 'hidden') {
    strike()
  } else {
    if (document.hasFocus()) episodeStruck = false
  }
}

function onBlur() {
  if (blurTimer) clearTimeout(blurTimer)
  blurTimer = setTimeout(() => {
    blurTimer = null
    if (!document.hasFocus() && !inGrace()) strike()
  }, 1500)
}

function onFocus() {
  if (blurTimer) {
    clearTimeout(blurTimer)
    blurTimer = null
  }
  if (document.visibilityState === 'visible') episodeStruck = false
}

const BLOCK_LABEL: Record<string, { log: string; toast: string }> = {
  paste: { log: 'Paste blocked', toast: 'Paste blocked: proctored round' },
  copy: { log: 'Copy blocked', toast: 'Copy blocked: proctored round' },
  cut: { log: 'Cut blocked', toast: 'Cut blocked: proctored round' },
  drop: { log: 'Drop blocked', toast: 'Paste blocked: proctored round' },
  contextmenu: { log: 'Right-click blocked', toast: 'Right-click blocked: proctored round' },
}

function onClipboardLike(e: Event) {
  const target = e.target
  const el = target instanceof Element ? target : target instanceof Node ? target.parentElement : null
  if (!el || !el.closest('[data-proctored]')) return
  e.preventDefault()
  const reg = latest()
  if (!reg) return
  const labels = BLOCK_LABEL[e.type] ?? BLOCK_LABEL.paste
  reg.log({ kind: 'paste', label: labels.log })
  const now = nowMs()
  // A drag-drop can fire several events; one toast per 600 ms is enough.
  if (now - lastBlockToastAt > 600) {
    lastBlockToastAt = now
    aiToast(labels.toast, { tone: 'risk' })
  }
}

const CLIP_EVENTS = ['paste', 'copy', 'cut', 'drop', 'contextmenu'] as const

function install() {
  if (installed || typeof window === 'undefined') return
  installed = true
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('blur', onBlur)
  window.addEventListener('focus', onFocus)
  for (const ev of CLIP_EVENTS) document.addEventListener(ev, onClipboardLike, true)
}

function uninstall() {
  if (!installed || registrations.size > 0) return
  installed = false
  document.removeEventListener('visibilitychange', onVisibility)
  window.removeEventListener('blur', onBlur)
  window.removeEventListener('focus', onFocus)
  for (const ev of CLIP_EVENTS) document.removeEventListener(ev, onClipboardLike, true)
  if (blurTimer) clearTimeout(blurTimer)
  blurTimer = null
  episodeStruck = false
}

// ---------------------------------------------------------------------------
// Shared camera store
// ---------------------------------------------------------------------------

type CameraStatus = 'idle' | 'on' | 'denied'
interface CamSnap {
  stream: MediaStream | null
  status: CameraStatus
  blur: boolean
}

const SERVER_CAM: CamSnap = { stream: null, status: 'idle', blur: false }
let cam: CamSnap = SERVER_CAM
const camListeners = new Set<() => void>()
let camUsers = 0
let camStopTimer: ReturnType<typeof setTimeout> | null = null
let camPending: Promise<void> | null = null

function setCam(patch: Partial<CamSnap>) {
  cam = { ...cam, ...patch }
  camListeners.forEach((l) => l())
}

function subscribeCam(l: () => void) {
  camListeners.add(l)
  return () => {
    camListeners.delete(l)
  }
}

function stopStream() {
  const s = cam.stream
  if (s) {
    try {
      s.getTracks().forEach((t) => t.stop())
    } catch {
      /* ignore */
    }
  }
  setCam({ stream: null, status: cam.status === 'denied' ? 'denied' : 'idle' })
}

async function openCamera(): Promise<void> {
  if (cam.stream && cam.stream.active) {
    if (cam.status !== 'on') setCam({ status: 'on' })
    return
  }
  if (camPending) return camPending
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    setCam({ status: 'denied' })
    return
  }
  // The permission prompt can blur the window: never count that as a tab switch.
  markProctorGrace(6000)
  camPending = (async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      })
      if (camUsers <= 0) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }
      stream.getVideoTracks().forEach((t) =>
        t.addEventListener('ended', () => {
          if (cam.stream === stream) setCam({ stream: null, status: 'idle' })
        }),
      )
      setCam({ stream, status: 'on' })
    } catch {
      setCam({ stream: null, status: 'denied' })
    } finally {
      camPending = null
      markProctorGrace(1500)
    }
  })()
  return camPending
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseProctorResult {
  cameraStream: MediaStream | null
  cameraStatus: CameraStatus
  startCamera: () => Promise<void>
  stopCamera: () => void
  blur: boolean
  setBlur: (b: boolean) => void
}

export function useProctor({ active, detectTabs = false }: { active: boolean; detectTabs?: boolean }): UseProctorResult {
  const { logProctor, integrity } = useDemo()
  const id = useId()

  const tabsRef = useRef(integrity.tabSwitches)
  tabsRef.current = integrity.tabSwitches
  const logRef = useRef(logProctor)
  logRef.current = logProctor

  // Register with the shared listeners while active.
  useEffect(() => {
    if (!active || typeof window === 'undefined') return
    registrations.set(id, {
      detectTabs: !!detectTabs,
      log: (e) => logRef.current(e),
      getTabSwitches: () => tabsRef.current,
    })
    install()
    return () => {
      registrations.delete(id)
      uninstall()
    }
  }, [active, detectTabs, id])

  // Camera usage is ref-counted across every mounted useProctor.
  useEffect(() => {
    camUsers += 1
    if (camStopTimer) {
      clearTimeout(camStopTimer)
      camStopTimer = null
    }
    return () => {
      camUsers -= 1
      if (camUsers <= 0) {
        camUsers = 0
        // Short delay so moving between rounds (unmount + mount) keeps the camera on.
        if (camStopTimer) clearTimeout(camStopTimer)
        camStopTimer = setTimeout(() => {
          camStopTimer = null
          if (camUsers <= 0) stopStream()
        }, 600)
      }
    }
  }, [])

  const snap = useSyncExternalStore(subscribeCam, () => cam, () => SERVER_CAM)

  const startCamera = useCallback(async () => {
    markProctorGrace()
    await openCamera()
  }, [])

  const stopCamera = useCallback(() => stopStream(), [])

  const setBlur = useCallback((b: boolean) => setCam({ blur: !!b }), [])

  return {
    cameraStream: snap.stream,
    cameraStatus: snap.status,
    startCamera,
    stopCamera,
    blur: snap.blur,
    setBlur,
  }
}
