// Placement Readiness Index (PRI): pillars, weights, bands and colour helpers. Pure module.
import type { Bi } from '@/lib/os/i18n'
import type { PillarKey, Pillars } from '@/lib/mock/types'

export const PILLAR_KEYS: PillarKey[] = [
  'aptitude',
  'technical',
  'communication',
  'techInterview',
  'hr',
  'resume',
  'integrity',
]

/** Weights sum to 100. */
export const PILLAR_WEIGHTS: Record<PillarKey, number> = {
  aptitude: 20,
  technical: 25,
  communication: 15,
  techInterview: 15,
  hr: 10,
  resume: 10,
  integrity: 5,
}

export const PILLAR_LABELS: Record<PillarKey, Bi> = {
  aptitude: { en: 'Aptitude', hi: 'अभिरुचि' },
  technical: { en: 'Technical', hi: 'तकनीकी' },
  communication: { en: 'Communication', hi: 'संवाद' },
  techInterview: { en: 'Tech Interview', hi: 'तकनीकी इंटरव्यू' },
  hr: { en: 'HR', hi: 'एचआर' },
  resume: { en: 'Resume', hi: 'रिज़्यूमे' },
  integrity: { en: 'Integrity', hi: 'सत्यनिष्ठा' },
}

/**
 * Integrity never drops below this. 88, not 86: at 86 Rahul's PRI would fall to 67.
 * Priya stays 71 and Rahul 68 for any integrity in 88..100.
 */
export const INTEGRITY_FLOOR = 88

function cl(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

/** Weighted PRI, rounded to an integer. Missing pillars count as 0. */
export function computePRI(p: Partial<Pillars> | null | undefined): number {
  if (!p) return 0
  let s = 0
  for (const k of PILLAR_KEYS) {
    const v = p[k]
    s += (typeof v === 'number' && Number.isFinite(v) ? v : 0) * PILLAR_WEIGHTS[k]
  }
  return Math.round(s / 100)
}

export function withLiveIntegrity(p: Pillars, integrity: number): Pillars {
  return { ...p, integrity }
}

/** Versant-style 20-80 -> pillar 0-100. 50 -> 50, 45 -> 42, 44 -> 40. */
export function versantToPillar(v: number): number {
  return cl(Math.round(((v - 20) / 60) * 100), 0, 100)
}

/** Pillar 0-100 -> Versant-style 20-80. */
export function pillarToVersant(p: number): number {
  return Math.round(20 + p * 0.6)
}

/** Tech-interview pillar = 70% content + 30% delivery. */
export function interviewPillar(content: number, delivery: number): number {
  return Math.round(0.7 * content + 0.3 * delivery)
}

// ---------------------------------------------------------------------------
// Bands
// ---------------------------------------------------------------------------
export type BandId = 'foundation' | 'developing' | 'ready' | 'drive-ready'

export interface Band {
  id: BandId
  min: number
  label: Bi
  color: 'rose' | 'amber' | 'cyan' | 'emerald'
  hex: string
}

/** Ascending by min. */
export const BANDS: Band[] = [
  { id: 'foundation', min: 0, label: { en: 'Needs foundation', hi: 'बुनियाद मज़बूत करें' }, color: 'rose', hex: '#fb7185' },
  { id: 'developing', min: 50, label: { en: 'Developing', hi: 'प्रगति पर' }, color: 'amber', hex: '#fbbf24' },
  { id: 'ready', min: 70, label: { en: 'Interview-ready', hi: 'इंटरव्यू के लिए तैयार' }, color: 'cyan', hex: '#22d3ee' },
  {
    id: 'drive-ready',
    min: 85,
    label: { en: 'Drive-ready', hi: 'ड्राइव के लिए तैयार' },
    color: 'emerald',
    hex: '#34d399',
  },
]

export function bandFor(pri: number | null | undefined): Band {
  const v = typeof pri === 'number' && Number.isFinite(pri) ? pri : 0
  let out = BANDS[0]
  for (const b of BANDS) if (v >= b.min) out = b
  return out
}

// NOTE: tailwind.config content does not scan lib/, so these class strings are kept to the
// common text-*-400 / bg-*-500/10 / border-*-500/30 forms that components also use. Use `hex`
// for inline styles when in doubt.
const BAND_CLASSES: Record<BandId, { text: string; bg: string; border: string; hex: string }> = {
  foundation: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', hex: '#fb7185' },
  developing: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', hex: '#fbbf24' },
  ready: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', hex: '#22d3ee' },
  'drive-ready': { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', hex: '#34d399' },
}

export function bandClasses(pri: number | null | undefined): { text: string; bg: string; border: string; hex: string } {
  return BAND_CLASSES[bandFor(pri).id]
}

/** Indicative offer band for a PRI (pattern inspired by publicly reported fresher tracks). */
export function offerBandFor(pri: number): Bi {
  if (pri < 50) return { en: 'Not yet: follow the 30-day plan', hi: 'अभी नहीं: 30-दिन की योजना अपनाएँ' }
  if (pri < 65)
    return {
      en: 'Mass-recruiter band (≈ ₹3.3-4.5 LPA equivalent)',
      hi: 'मास-रिक्रूटर बैंड (≈ ₹3.3-4.5 LPA समतुल्य)',
    }
  if (pri < 80)
    return {
      en: 'Higher-tier band (≈ ₹6-7.5 LPA equivalent)',
      hi: 'उच्च-स्तरीय बैंड (≈ ₹6-7.5 LPA समतुल्य)',
    }
  return { en: 'Top-track band (≈ ₹9 LPA+ equivalent)', hi: 'टॉप-ट्रैक बैंड (≈ ₹9 LPA+ समतुल्य)' }
}

export const OFFER_BAND_NOTE: Bi = {
  en: 'Pattern inspired by publicly reported fresher tracks',
  hi: 'सार्वजनिक रूप से रिपोर्ट किए गए फ्रेशर ट्रैक से प्रेरित पैटर्न',
}

// ---------------------------------------------------------------------------
// Sequential colour scale for maps / heatmaps
// ---------------------------------------------------------------------------
const SEQ_STOPS: [number, number, number][] = [
  [0x1e, 0x29, 0x3b], // #1e293b slate
  [0x1d, 0x4e, 0xd8], // #1d4ed8 blue
  [0x08, 0x91, 0xb2], // #0891b2 cyan
  [0x10, 0xb9, 0x81], // #10b981 emerald
]

function hex2(n: number): string {
  return Math.round(cl(n, 0, 255)).toString(16).padStart(2, '0')
}

/** t in 0..1 -> hex colour along slate -> blue -> cyan -> emerald. */
export function seqColor(t: number): string {
  const v = Number.isFinite(t) ? cl(t, 0, 1) : 0
  const segs = SEQ_STOPS.length - 1
  const pos = v * segs
  const i = Math.min(segs - 1, Math.floor(pos))
  const f = pos - i
  const a = SEQ_STOPS[i]
  const b = SEQ_STOPS[i + 1]
  return `#${hex2(a[0] + (b[0] - a[0]) * f)}${hex2(a[1] + (b[1] - a[1]) * f)}${hex2(a[2] + (b[2] - a[2]) * f)}`
}
