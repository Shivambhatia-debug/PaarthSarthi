'use client'

/**
 * Query-string state without next/navigation useSearchParams (which forces a
 * Suspense boundary and can bail out of static rendering).
 *
 * Pages under OSChrome mount only after hydration, so reading
 * window.location in the lazy initial state is safe.
 */

import { useEffect, useState } from 'react'

export const URL_CHANGE_EVENT = 'os:urlchange'

function readParam(name: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return new URLSearchParams(window.location.search).get(name)
  } catch {
    return null
  }
}

/** Current value of ?name=, kept in sync on back/forward, setQueryParam and notifyUrlChange. */
export function useQueryParam(name: string): string | null {
  const [value, setValue] = useState<string | null>(() => readParam(name))

  useEffect(() => {
    if (typeof window === 'undefined') return
    const timers: ReturnType<typeof setTimeout>[] = []
    const sync = () => setValue(readParam(name))
    // router.push() updates the URL asynchronously, so re-read shortly after a change notice too.
    const syncSoon = () => {
      sync()
      timers.push(setTimeout(sync, 60))
      timers.push(setTimeout(sync, 300))
    }
    sync()
    window.addEventListener('popstate', syncSoon)
    window.addEventListener(URL_CHANGE_EVENT, syncSoon)
    return () => {
      window.removeEventListener('popstate', syncSoon)
      window.removeEventListener(URL_CHANGE_EVENT, syncSoon)
      timers.forEach(clearTimeout)
    }
  }, [name])

  return value
}

/** Sets (or, with null/'' removes) ?name= via history.replaceState, then notifies listeners. */
export function setQueryParam(name: string, value: string | null): void {
  if (typeof window === 'undefined') return
  try {
    const url = new URL(window.location.href)
    if (value === null || value === undefined || value === '') url.searchParams.delete(name)
    else url.searchParams.set(name, value)
    const next = `${url.pathname}${url.search}${url.hash}`
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
    // Next.js (>= 14.1) patches replaceState and keeps its router state in sync; null is the documented argument.
    if (next !== current) window.history.replaceState(null, '', next)
  } catch {
    /* ignore malformed URLs */
  }
  notifyUrlChange()
}

/** Tells every useQueryParam to re-read the URL (call after router.push to the same pathname). */
export function notifyUrlChange(): void {
  if (typeof window === 'undefined') return
  try {
    window.dispatchEvent(new Event(URL_CHANGE_EVENT))
  } catch {
    /* very old browsers */
  }
}
