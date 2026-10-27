// Bilingual helpers + Indian number/date formatting.
// Pure module (no React, no browser APIs) so it is safe on server and client.

export type Lang = 'en' | 'hi' | 'hinglish'

export type Bi = { en: string; hi: string; hinglish?: string }

/** Pick the string for a language. Hinglish falls back to en; an empty hi falls back to en. */
export function tr(b: Bi | string | null | undefined, lang: Lang): string {
  if (b == null) return ''
  if (typeof b === 'string') return b
  if (lang === 'hi') return b.hi || b.en || ''
  if (lang === 'hinglish') return b.hinglish || b.en || ''
  return b.en || b.hi || ''
}

/** Officer screens (State / TPO) render English or Hindi only. */
export function officerLang(lang: Lang): 'en' | 'hi' {
  return lang === 'hi' ? 'hi' : 'en'
}

const DEVANAGARI_RE = /[ऀ-ॿ]/

export function isDevanagari(s: string | null | undefined): boolean {
  return typeof s === 'string' && DEVANAGARI_RE.test(s)
}

// ---------- numbers ----------

const NF_CACHE = new Map<number, Intl.NumberFormat>()
function nf(decimals: number): Intl.NumberFormat {
  const d = Math.max(0, Math.min(6, Math.floor(decimals)))
  let f = NF_CACHE.get(d)
  if (!f) {
    f = new Intl.NumberFormat('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d })
    NF_CACHE.set(d, f)
  }
  return f
}

function bad(n: unknown): boolean {
  return typeof n !== 'number' || !Number.isFinite(n)
}

/** Indian digit grouping: 112480 -> '1,12,480'. */
export function fmtIN(n: number, decimals = 0): string {
  if (bad(n)) return '—'
  return nf(decimals).format(n)
}

/** Fixed decimals with en-IN grouping: 58.4 -> '58.4', 1234.5 -> '1,234.5'. */
export function fmtNum(n: number, decimals = 1): string {
  if (bad(n)) return '—'
  return nf(decimals).format(n)
}

function trimDec(n: number, maxDec = 2): string {
  const s = n.toFixed(maxDec)
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s
}

/** '₹6,000', '₹4 lakh', '₹1.5 lakh', '₹1.5 Cr'. */
export function fmtINR(n: number): string {
  if (bad(n)) return '—'
  const sign = n < 0 ? '−' : ''
  const a = Math.abs(n)
  if (a >= 1e7) return `${sign}₹${trimDec(a / 1e7)} Cr`
  if (a >= 1e5) return `${sign}₹${trimDec(a / 1e5)} lakh`
  return `${sign}₹${nf(0).format(Math.round(a))}`
}

/** '64.2%'. */
export function fmtPct(n: number, d = 1): string {
  if (bad(n)) return '—'
  return `${nf(d).format(n)}%`
}

// ---------- dates ----------

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_HI = [
  'जनवरी',
  'फ़रवरी',
  'मार्च',
  'अप्रैल',
  'मई',
  'जून',
  'जुलाई',
  'अगस्त',
  'सितंबर',
  'अक्टूबर',
  'नवंबर',
  'दिसंबर',
]

/**
 * '28 Oct' (en / hinglish) or '28 अक्टूबर' (hi). opts.year appends the year.
 * Parses the YYYY-MM-DD prefix directly, so it never shifts with the viewer's time zone.
 */
export function fmtDate(iso: string, lang: Lang = 'en', opts?: { year?: boolean }): string {
  if (typeof iso !== 'string') return '—'
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!m) return iso
  const y = m[1]
  const mo = Math.min(12, Math.max(1, parseInt(m[2], 10))) - 1
  const d = parseInt(m[3], 10)
  const month = lang === 'hi' ? MONTHS_HI[mo] : MONTHS_EN[mo]
  return opts?.year ? `${d} ${month} ${y}` : `${d} ${month}`
}

/** Hindi verb agreement helper: bySex(g, 'bolti', 'bolte'). */
export function bySex<T>(gender: 'F' | 'M', f: T, m: T): T {
  return gender === 'F' ? f : m
}

export const LANG_LABEL: Record<Lang, string> = {
  en: 'English',
  hi: 'हिंदी',
  hinglish: 'Hinglish',
}

export type PlannedLang = {
  id: string
  label: string
  status: 'beta' | 'planned'
  lang: string
  dir?: 'rtl' | 'ltr'
}

export const PLANNED_LANGS: PlannedLang[] = [
  { id: 'mai', label: 'मैथिली', status: 'beta', lang: 'mai' },
  { id: 'ur', label: 'اردو', status: 'planned', lang: 'ur', dir: 'rtl' },
]
