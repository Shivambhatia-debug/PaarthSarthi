'use client'

// Print exactly one element (fix 15). Works with the body[data-print] / .print-active rules in
// app/globals.css, including content inside Radix Dialog portals (Chrome :has()).
// Never call window.print directly elsewhere.

let pendingCleanup: (() => void) | null = null

export function printOnly(target: HTMLElement | null): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  // Finish any previous print that never fired afterprint.
  if (pendingCleanup) pendingCleanup()

  const body = document.body
  if (target) {
    target.classList.add('print-active')
    body.dataset.print = '1'
  }

  let done = false
  const cleanup = () => {
    if (done) return
    done = true
    try {
      target?.classList.remove('print-active')
      delete body.dataset.print
    } catch {
      /* ignore */
    }
    window.removeEventListener('afterprint', cleanup)
    if (pendingCleanup === cleanup) pendingCleanup = null
  }
  pendingCleanup = cleanup
  window.addEventListener('afterprint', cleanup)

  try {
    window.print()
  } catch {
    cleanup()
    return
  }
  // Fallback for browsers that never fire afterprint (window.print blocks in Chrome, so this
  // timer only starts once the dialog has closed).
  window.setTimeout(cleanup, 1000)
}
