// College T&P console (/tpo): data derived from the foundation mock (lib/mock/*).
// Pure module: no React, no browser APIs at import time (download helpers run only from click handlers).
// Every number that duplicates a foundation constant is computed here, never typed into copy.
// All figures are ILLUSTRATIVE pilot data. Student names are fictional. Sector names only, no employers.

import { batchOf, institutionById, TPO_SUPPORTED_COLLEGES } from '@/lib/mock/institutions'
import { branchSkillFor, PCE_BRANCH_STATS, studentsFor, type BranchStat, type PceBranch } from '@/lib/mock/students'
import { driveById, poolReady } from '@/lib/mock/drives'
import { blueprintById } from '@/lib/mock/blueprints'
import { PRIYA, RAHUL, latestAttempt } from '@/lib/mock/personas'
import { allocate, clamp, rng } from '@/lib/mock/seed'
import { DEMO_TODAY, isoDaysBefore } from '@/lib/mock/state'
import { pillarToVersant, PILLAR_KEYS, PILLAR_LABELS } from '@/lib/os/scoring'
import { fmtDate, fmtNum, type Bi } from '@/lib/os/i18n'
import type { RoundId } from '@/lib/os/rounds'
import type { BatchMetrics, BranchCode, Drive, Institution, PillarKey, StudentRow } from '@/lib/mock/types'

// ---------------------------------------------------------------------------
// College selection (fix 34)
// ---------------------------------------------------------------------------
export const DEFAULT_COLLEGE = 'pce-purnea'

/** ?college= value if it is one of the 4 supported colleges, else Purnea CE. */
export function resolveCollege(param: string | null | undefined): string {
  return param && TPO_SUPPORTED_COLLEGES.includes(param) ? param : DEFAULT_COLLEGE
}

export function isPolytechnic(inst: Institution | undefined | null): boolean {
  return inst?.type === 'GP'
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mean(xs: readonly number[]): number {
  return xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0
}

/** ISO date n days after `iso` (UTC arithmetic, so it never shifts with the viewer's time zone). */
export function addDaysIso(iso: string, n: number): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!m) return iso
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3] + n))
  return d.toISOString().slice(0, 10)
}

// ---------------------------------------------------------------------------
// Branch display names
// ---------------------------------------------------------------------------
export const BRANCH_NAME: Record<BranchCode, Bi> = {
  CSE: { en: 'CSE', hi: 'CSE' },
  ECE: { en: 'ECE', hi: 'ECE' },
  EE: { en: 'EE', hi: 'EE' },
  ME: { en: 'Mechanical', hi: 'मैकेनिकल' },
  CE: { en: 'Civil', hi: 'सिविल' },
  AI: { en: 'AI', hi: 'AI' },
  MNC: { en: 'M&C', hi: 'M&C' },
  'D-ME': { en: 'Dip. Mechanical', hi: 'डिप्लोमा मैकेनिकल' },
  'D-EE': { en: 'Dip. Electrical', hi: 'डिप्लोमा इलेक्ट्रिकल' },
  'D-CE': { en: 'Dip. Civil', hi: 'डिप्लोमा सिविल' },
  'D-ECE': { en: 'Dip. Electronics', hi: 'डिप्लोमा इलेक्ट्रॉनिक्स' },
  'D-AUTO': { en: 'Dip. Automobile', hi: 'डिप्लोमा ऑटोमोबाइल' },
  'D-FS': { en: 'Dip. Fire & Safety', hi: 'डिप्लोमा फ़ायर एवं सेफ़्टी' },
}

const PROGRAMME: Record<BranchCode, Bi> = {
  CSE: { en: 'B.Tech Computer Science', hi: 'बी.टेक कंप्यूटर साइंस' },
  ECE: { en: 'B.Tech Electronics & Comm.', hi: 'बी.टेक इलेक्ट्रॉनिक्स एवं संचार' },
  EE: { en: 'B.Tech Electrical', hi: 'बी.टेक इलेक्ट्रिकल' },
  ME: { en: 'B.Tech Mechanical', hi: 'बी.टेक मैकेनिकल' },
  CE: { en: 'B.Tech Civil', hi: 'बी.टेक सिविल' },
  AI: { en: 'B.Tech AI', hi: 'बी.टेक AI' },
  MNC: { en: 'B.Tech Mathematics & Computing', hi: 'बी.टेक गणित एवं कंप्यूटिंग' },
  'D-ME': { en: 'Diploma Mechanical', hi: 'डिप्लोमा मैकेनिकल' },
  'D-EE': { en: 'Diploma Electrical', hi: 'डिप्लोमा इलेक्ट्रिकल' },
  'D-CE': { en: 'Diploma Civil', hi: 'डिप्लोमा सिविल' },
  'D-ECE': { en: 'Diploma Electronics', hi: 'डिप्लोमा इलेक्ट्रॉनिक्स' },
  'D-AUTO': { en: 'Diploma Mechanical (Automobile)', hi: 'डिप्लोमा मैकेनिकल (ऑटोमोबाइल)' },
  'D-FS': { en: 'Diploma Fire & Safety', hi: 'डिप्लोमा फ़ायर एवं सेफ़्टी' },
}

export function programmeFor(branch: BranchCode): Bi {
  return PROGRAMME[branch] ?? { en: branch, hi: branch }
}

// ---------------------------------------------------------------------------
// Readiness histogram (Overview)
// ---------------------------------------------------------------------------
export interface HistBucket {
  id: string
  label: string
  /** Lower bound of the bucket, used for the band colour. */
  lo: number
  now: number
  before: number
}

const BUCKETS: { id: string; label: string; lo: number }[] = [
  { id: 'b0', label: '0-39', lo: 0 },
  { id: 'b40', label: '40-49', lo: 40 },
  { id: 'b50', label: '50-59', lo: 50 },
  { id: 'b60', label: '60-69', lo: 60 },
  { id: 'b70', label: '70-79', lo: 70 },
  { id: 'b80', label: '80+', lo: 80 },
]

/** Logistic approximation of the normal CDF (good to about 0.01, plenty for an illustrative shape). */
function ncdf(x: number, m: number, sd: number): number {
  return 1 / (1 + Math.exp((-1.702 * (x - m)) / sd))
}

function bucketShares(m: number, sd: number): number[] {
  const cuts = [40, 50, 60, 70, 80]
  const c = cuts.map((x) => ncdf(x, m, sd))
  return [c[0], c[1] - c[0], c[2] - c[1], c[3] - c[2], c[4] - c[3], 1 - c[4]].map((v) => Math.max(0.0005, v))
}

/**
 * PRI buckets for the batch. `now` sums to b.onboarded and its 70+ buckets sum to b.interviewReady.
 * `before` (ghost series) is the same students at their diagnostic, shaped around b.priBaseline.
 */
export function histogramFor(b: BatchMetrics): HistBucket[] {
  const onboarded = Math.max(0, b.onboarded)
  const ready = clamp(b.interviewReady, 0, onboarded)
  const now = bucketShares(b.pri - 3, 10)
  const low = allocate(onboarded - ready, now.slice(0, 4))
  const high = allocate(ready, [0.8, 0.2])
  const before = allocate(onboarded, bucketShares(b.priBaseline, 11))
  const nowCounts = [...low, ...high]
  return BUCKETS.map((k, i) => ({ ...k, now: nowCounts[i] ?? 0, before: before[i] ?? 0 }))
}

// ---------------------------------------------------------------------------
// Branch stats (PCE from the foundation; other colleges generated from their own numbers)
// ---------------------------------------------------------------------------
export interface TpoBranchStat extends BranchStat {
  branch: BranchCode
}

const STATS_CACHE = new Map<string, TpoBranchStat[]>()

export function branchStatsFor(collegeId: string): TpoBranchStat[] {
  const hit = STATS_CACHE.get(collegeId)
  if (hit) return hit
  let out: TpoBranchStat[]
  const inst = institutionById(collegeId)
  if (collegeId === DEFAULT_COLLEGE || !inst) {
    out = (Object.keys(PCE_BRANCH_STATS) as PceBranch[]).map((k) => ({ branch: k, ...PCE_BRANCH_STATS[k] }))
  } else {
    const b = batchOf(inst)
    const m = branchSkillFor(collegeId)
    const R = rng(hashStr(`${collegeId}:branch-stats`))
    const weights = m.rows.map(() => 0.85 + R.next() * 0.3)
    const fy = allocate(b.finalYear, weights)
    const onb = allocate(b.onboarded, weights)
    const commIdx = Math.max(0, m.cols.indexOf('communication'))
    const rowAvg = m.values.map((v) => mean(v))
    const overall = mean(rowAvg)
    out = m.rows.map((br, i) => {
      const avgPri = Math.round(b.pri + (rowAvg[i] - overall))
      const n = onb[i] ?? 0
      return {
        branch: br,
        finalYear: fy[i] ?? 0,
        onboarded: n,
        avgPri,
        // Share of a normal(avgPri, 9) below 50: matches Purnea CE's published branch shares within a few points.
        below50Pct: clamp(Math.round(100 * ncdf(50, avgPri, 9)), 4, 80),
        commVersant: pillarToVersant(m.values[i]?.[commIdx] ?? 40),
        inactive14d: Math.max(1, Math.round(n * clamp(0.32 - (avgPri - 45) * 0.012 + R.next() * 0.04, 0.05, 0.4))),
      }
    })
  }
  STATS_CACHE.set(collegeId, out)
  return out
}

/** Onboarded-weighted Versant-style communication average for the college. */
export function collegeCommAvg(stats: readonly TpoBranchStat[]): number {
  const w = stats.reduce((s, x) => s + x.onboarded, 0)
  if (w <= 0) return 0
  return Math.round(stats.reduce((s, x) => s + x.onboarded * x.commVersant, 0) / w)
}

/** Branch with the lowest communication score (the bottleneck insight). */
export function commBottleneck(stats: readonly TpoBranchStat[]): TpoBranchStat | undefined {
  return stats.reduce<TpoBranchStat | undefined>((a, x) => (!a || x.commVersant < a.commVersant ? x : a), undefined)
}

/** Branch with the largest share below PRI 50 (the risk insight). */
export function riskBranch(stats: readonly TpoBranchStat[]): TpoBranchStat | undefined {
  return stats.reduce<TpoBranchStat | undefined>((a, x) => (!a || x.below50Pct > a.below50Pct ? x : a), undefined)
}

/** Date of the recommended batch mock drive (Overview risk insight, bulk 'Schedule batch mock drive'). */
export const MOCK_DRIVE_DATE = '2026-11-12'

// ---------------------------------------------------------------------------
// PRI trend labels (6 weekly points ending on DEMO_TODAY)
// ---------------------------------------------------------------------------
export function trendSeries(inst: Institution, lang: 'en' | 'hi'): { label: string; pri: number }[] {
  const pts = Array.isArray(inst.priTrend) ? inst.priTrend : []
  const n = pts.length
  return pts.map((v, i) => ({
    label: i === n - 1 ? fmtDate(DEMO_TODAY, lang) : fmtDate(isoDaysBefore(7 * (n - 1 - i)), lang),
    pri: Math.round(v * 10) / 10,
  }))
}

// ---------------------------------------------------------------------------
// Student helpers (Students tab + StudentSheet)
// ---------------------------------------------------------------------------
const NON_INTEGRITY = PILLAR_KEYS.filter((k) => k !== 'integrity')

export function weakestPillar(row: Pick<StudentRow, 'pillars'>): PillarKey {
  let best: PillarKey = 'communication'
  let v = Infinity
  for (const k of NON_INTEGRITY) {
    const x = row.pillars?.[k]
    if (typeof x === 'number' && x < v) {
      v = x
      best = k
    }
  }
  return best
}

export function strongestPillar(row: Pick<StudentRow, 'pillars'>): PillarKey {
  let best: PillarKey = 'technical'
  let v = -Infinity
  for (const k of NON_INTEGRITY) {
    const x = row.pillars?.[k]
    if (typeof x === 'number' && x > v) {
      v = x
      best = k
    }
  }
  return best
}

/** Short AI-recommended action for the table. */
export function aiActionFor(row: StudentRow): Bi {
  if (row.risk === 'high' && row.lastActiveDays >= 14) return { en: 'Mentor call + 14-day sprint', hi: 'मेंटर कॉल + 14-दिन स्प्रिंट' }
  if (row.risk === 'high') return { en: 'Mentor + 14-day sprint', hi: 'मेंटर + 14-दिन स्प्रिंट' }
  if (row.pri >= 70) return { en: 'Shortlist for the next drive', hi: 'अगली ड्राइव के लिए शॉर्टलिस्ट' }
  const w = weakestPillar(row)
  if (w === 'communication') return { en: 'Versant-style speaking sprint', hi: 'Versant-शैली बोलने का स्प्रिंट' }
  if (w === 'aptitude') return { en: 'Aptitude drills + timed mock', hi: 'अभिरुचि अभ्यास + समयबद्ध मॉक' }
  if (w === 'technical' || w === 'techInterview') return { en: 'Core MCQ sprint + mock', hi: 'कोर MCQ स्प्रिंट + मॉक' }
  return { en: 'Resume + HR mock (Hindi)', hi: 'रिज़्यूमे + HR मॉक (हिंदी)' }
}

export interface SheetSignal {
  id: string
  kind: 'strength' | 'gap' | 'behaviour'
  round?: RoundId
  text: Bi
}

/** Shown for Priya until her own run has written signals (state.runs.priya.signals). */
export function priyaDefaultSignals(): SheetSignal[] {
  const a = latestAttempt(PRIYA)
  const kw = PRIYA.project?.keywords ?? []
  const k1 = kw[0] ?? 'ESP32'
  const k2 = kw[2] ?? 'MQTT'
  return [
    {
      id: 'p-def-1',
      kind: 'strength',
      round: 'techInterview',
      text: {
        en: `Explained her own IoT project end-to-end (${k1}, ${k2}); content ${a.content}`,
        hi: `अपना IoT प्रोजेक्ट शुरू से अंत तक समझाया (${k1}, ${k2}); कंटेंट ${a.content}`,
      },
    },
    {
      id: 'p-def-2',
      kind: 'gap',
      round: 'communication',
      text: {
        en: `Versant-style ${a.versant}/80: fluency up since the diagnostic, still pauses in English`,
        hi: `Versant-शैली ${a.versant}/80: डायग्नोस्टिक के बाद प्रवाह बेहतर, अंग्रेज़ी में अब भी रुकती हैं`,
      },
    },
    {
      id: 'p-def-3',
      kind: 'gap',
      round: 'technical',
      text: { en: 'Coding: used list.remove() inside a loop', hi: 'कोडिंग: लूप के अंदर list.remove() का उपयोग' },
    },
    {
      id: 'p-def-4',
      kind: 'behaviour',
      round: 'aptitude',
      text: {
        en: `Integrity ${a.pillars.integrity}: no tab switches, no paste attempts`,
        hi: `सत्यनिष्ठा ${a.pillars.integrity}: कोई टैब स्विच या पेस्ट नहीं`,
      },
    },
  ]
}

/** Signals for any other sample student, derived from the row. */
export function signalsForRow(row: StudentRow): SheetSignal[] {
  const out: SheetSignal[] = []
  const s = strongestPillar(row)
  const w = weakestPillar(row)
  const sl = PILLAR_LABELS[s]
  const wl = PILLAR_LABELS[w]
  out.push({
    id: `${row.id}-s`,
    kind: 'strength',
    text: { en: `Strongest pillar: ${sl.en} ${row.pillars[s]}`, hi: `सबसे मज़बूत स्तंभ: ${sl.hi} ${row.pillars[s]}` },
  })
  out.push({
    id: `${row.id}-w`,
    kind: 'gap',
    text: { en: `Weakest pillar: ${wl.en} ${row.pillars[w]}`, hi: `सबसे कमज़ोर स्तंभ: ${wl.hi} ${row.pillars[w]}` },
  })
  row.riskReasons.forEach((r, i) => out.push({ id: `${row.id}-r${i}`, kind: 'gap', text: r }))
  out.push({
    id: `${row.id}-b`,
    kind: 'behaviour',
    text:
      row.lastActiveDays === 0
        ? { en: 'Practised today', hi: 'आज अभ्यास किया' }
        : row.lastActiveDays >= 14
          ? { en: `No practice for ${row.lastActiveDays} days`, hi: `${row.lastActiveDays} दिन से कोई अभ्यास नहीं` }
          : { en: `Last practice ${row.lastActiveDays} days ago`, hi: `पिछला अभ्यास ${row.lastActiveDays} दिन पहले` },
  })
  return out
}

export interface AttemptPoint {
  id: string
  label: Bi
  date: string
  pri: number
}

export function attemptsForRow(row: StudentRow): AttemptPoint[] {
  const persona = row.id === 'priya' ? PRIYA : row.id === 'rahul' ? RAHUL : null
  if (persona) return persona.attempts.map((a) => ({ id: a.id, label: a.label, date: a.date, pri: a.pri }))
  const latestDays = Math.max(0, row.lastActiveDays)
  const diagDays = Math.max(22, latestDays + 6)
  const midDays = Math.round((diagDays + latestDays) / 2)
  const pts: AttemptPoint[] = [
    { id: `${row.id}-a1`, label: { en: 'Diagnostic', hi: 'डायग्नोस्टिक' }, date: isoDaysBefore(diagDays), pri: row.priPrev },
  ]
  if (row.pri !== row.priPrev) {
    pts.push({
      id: `${row.id}-a2`,
      label: { en: 'Attempt 2', hi: 'प्रयास 2' },
      date: isoDaysBefore(midDays),
      pri: Math.round((row.priPrev + row.pri) / 2),
    })
    pts.push({ id: `${row.id}-a3`, label: { en: 'Latest', hi: 'नवीनतम' }, date: isoDaysBefore(latestDays), pri: row.pri })
  }
  return pts
}

/** A streamed intervention plan for the StudentSheet, built from the row. */
export function interventionFor(row: StudentRow, blueprintLabel: string): Bi {
  const first = row.name.replace(/^Md\.\s*/, '').split(' ')[0] || row.name
  const w = weakestPillar(row)
  const wv = row.pillars[w]
  const wl = PILLAR_LABELS[w]
  const target = Math.min(100, wv + 10)
  const lift = row.risk === 'high' ? 6 : 4
  if (row.status === 'recovered') {
    return {
      en: `${first} recovered from PRI ${row.priPrev} to ${row.pri} in three attempts and is now interview-ready. Keep the momentum: register her for the next eligible Day-1 drive, one more HR mock this week, and two Versant-style sessions to lift ${wl.en.toLowerCase()} from ${wv} to ${target}. No mentor escalation needed.`,
      hi: `${first} ने तीन प्रयासों में PRI ${row.priPrev} से ${row.pri} तक सुधार किया और अब इंटरव्यू के लिए तैयार हैं। गति बनाए रखें: अगली पात्र डे-1 ड्राइव में पंजीकरण, इस हफ़्ते एक और HR मॉक, और ${wl.hi} को ${wv} से ${target} तक ले जाने के लिए दो Versant-शैली सत्र। मेंटर की ज़रूरत नहीं।`,
    }
  }
  const backlog =
    row.activeBacklogs > 0
      ? {
          en: ` First, clear the active backlog: it blocks eligibility for every ${blueprintLabel} drive.`,
          hi: ` पहले सक्रिय बैकलॉग हटाएँ: यह हर ${blueprintLabel} ड्राइव की पात्रता रोकता है।`,
        }
      : { en: '', hi: '' }
  const idle =
    row.lastActiveDays >= 14
      ? {
          en: ` No practice for ${row.lastActiveDays} days, so start with a mentor call within 48 hours.`,
          hi: ` ${row.lastActiveDays} दिन से कोई अभ्यास नहीं, इसलिए 48 घंटे में मेंटर कॉल से शुरुआत करें।`,
        }
      : { en: '', hi: '' }
  let plan: Bi
  if (w === 'communication') {
    plan = {
      en: `Days 1-7: four Versant-style speaking sprints (20 min, Hindi-to-English bridge). Days 8-14: two AI mock interviews, content scored language-neutral, plus one peer GD.`,
      hi: `दिन 1-7: चार Versant-शैली बोलने के स्प्रिंट (20 मिनट, हिंदी-से-अंग्रेज़ी ब्रिज)। दिन 8-14: दो AI मॉक इंटरव्यू, कंटेंट का स्कोर भाषा-निरपेक्ष, और एक पीयर GD।`,
    }
  } else if (w === 'aptitude') {
    plan = {
      en: `Days 1-7: 20-minute quant and reasoning drills every day. Days 8-14: two timed mocks in the ${blueprintLabel} pattern with sectional review.`,
      hi: `दिन 1-7: रोज़ 20 मिनट गणित और रीज़निंग अभ्यास। दिन 8-14: ${blueprintLabel} पैटर्न में दो समयबद्ध मॉक, सेक्शन-वार समीक्षा के साथ।`,
    }
  } else if (w === 'technical' || w === 'techInterview') {
    plan = {
      en: `Days 1-7: a core MCQ sprint on the three weakest topics. Days 8-14: two project walkthroughs with the AI interviewer and one technical mock.`,
      hi: `दिन 1-7: तीन सबसे कमज़ोर विषयों पर कोर MCQ स्प्रिंट। दिन 8-14: AI इंटरव्यूअर के साथ दो प्रोजेक्ट वॉकथ्रू और एक तकनीकी मॉक।`,
    }
  } else {
    plan = {
      en: `Days 1-7: rebuild the resume with the AI resume coach. Days 8-14: two HR mocks in Hindi, then one in English.`,
      hi: `दिन 1-7: AI रिज़्यूमे कोच से रिज़्यूमे दोबारा बनाएँ। दिन 8-14: हिंदी में दो HR मॉक, फिर एक अंग्रेज़ी में।`,
    }
  }
  return {
    en: `${first}'s gap is ${wl.en.toLowerCase()} (${wv}), not effort.${idle.en}${backlog.en} Plan for 14 days: ${plan.en} Mentor check-in every Friday. Projected: ${wl.en.toLowerCase()} ${wv} → ${target}, PRI ${row.pri} → ${row.pri + lift}.`,
    hi: `${first} की कमी ${wl.hi} (${wv}) में है, मेहनत में नहीं।${idle.hi}${backlog.hi} 14 दिन की योजना: ${plan.hi} हर शुक्रवार मेंटर से बातचीत। अनुमान: ${wl.hi} ${wv} → ${target}, PRI ${row.pri} → ${row.pri + lift}।`,
  }
}

// ---------------------------------------------------------------------------
// JD → shortlist (Drives tab)
// ---------------------------------------------------------------------------
export interface JdCriterion {
  id: string
  label: Bi
  /** Phrase highlighted in the JD copy (case-insensitive). */
  match: string
}

export interface JdSpec {
  kind: 'it' | 'core'
  text: string
  criteria: JdCriterion[]
  blueprintId: string
  branches: BranchCode[]
}

const JD_IT: JdSpec = {
  kind: 'it',
  blueprintId: 'tcs-nqt-style',
  branches: ['ECE', 'CSE', 'EE'],
  text:
    'Graduate Engineer Trainee — IT services (Day-1 campus drive, NQT-style assessment).\n' +
    'Eligibility: B.Tech ECE/CSE/EE 2027, CGPA ≥ 6.5, no active backlogs at the time of the drive, 60% in 10th & 12th (or diploma), max 1-year gap in education.\n' +
    'Skills: good communication (Versant-style ≥ 50/80), basics of DSA/SQL, one programming language (C, Python or Java) and clear logical reasoning.\n' +
    'Role: application support and development for enterprise clients. Twelve weeks of paid training, then project allocation anywhere in India; relocation required, no service bond.\n' +
    'Selection: online assessment (numerical, verbal, reasoning, coding), technical interview, HR interview.\n' +
    'Benefits: medical cover, a structured first-year mentor programme and certification support. Carry college ID, APAAR ID and marksheets.',
  criteria: [
    { id: 'cgpa', label: { en: 'CGPA ≥ 6.5', hi: 'CGPA ≥ 6.5' }, match: 'CGPA ≥ 6.5' },
    { id: 'backlog', label: { en: 'No active backlogs', hi: 'कोई सक्रिय बैकलॉग नहीं' }, match: 'no active backlogs' },
    { id: 'branch', label: { en: 'ECE/CSE/EE', hi: 'ECE/CSE/EE' }, match: 'B.Tech ECE/CSE/EE' },
    { id: 'school', label: { en: '10th/12th ≥ 60%', hi: '10वीं/12वीं ≥ 60%' }, match: '60% in 10th & 12th' },
    { id: 'gap', label: { en: 'Gap ≤ 1 yr', hi: 'अंतराल ≤ 1 वर्ष' }, match: '1-year gap' },
    { id: 'skills', label: { en: 'DSA, SQL', hi: 'DSA, SQL' }, match: 'DSA/SQL' },
    { id: 'comm', label: { en: 'Communication ≥ 50/80', hi: 'संवाद ≥ 50/80' }, match: 'Versant-style ≥ 50/80' },
  ],
}

const JD_CORE: JdSpec = {
  kind: 'core',
  blueprintId: 'core-mech-oem-style',
  branches: ['D-ME', 'D-AUTO', 'D-EE'],
  text:
    'Diploma Engineer Trainee — Auto / EV service network (core, shop-floor role).\n' +
    'Eligibility: Diploma Mechanical / Automobile / Electrical 2027, minimum 60% aggregate in diploma, no active backlogs, 60% in 10th, max 1-year gap in education.\n' +
    'Skills: workshop practice and measurement, basics of CAD and EV systems, shop-floor safety. HR interview can be in Hindi; communication is advisory, not eliminatory.\n' +
    'Role: service engineer-trainee at dealer workshops in Bihar and neighbouring states, six months of on-the-job training with a stipend.\n' +
    'Selection: aptitude test, core mechanical MCQ, shop-floor case, HR interview.',
  criteria: [
    { id: 'dip', label: { en: 'Diploma ≥ 60%', hi: 'डिप्लोमा ≥ 60%' }, match: '60% aggregate in diploma' },
    { id: 'backlog', label: { en: 'No active backlogs', hi: 'कोई सक्रिय बैकलॉग नहीं' }, match: 'no active backlogs' },
    { id: 'branch', label: { en: 'Mech/Auto/Electrical', hi: 'मैकेनिकल/ऑटो/इलेक्ट्रिकल' }, match: 'Diploma Mechanical / Automobile / Electrical' },
    { id: 'school', label: { en: '10th ≥ 60%', hi: '10वीं ≥ 60%' }, match: '60% in 10th' },
    { id: 'gap', label: { en: 'Gap ≤ 1 yr', hi: 'अंतराल ≤ 1 वर्ष' }, match: '1-year gap' },
    { id: 'skills', label: { en: 'CAD, EV basics', hi: 'CAD, EV की बुनियाद' }, match: 'CAD and EV systems' },
    { id: 'comm', label: { en: 'Communication advisory', hi: 'संवाद: केवल सलाह' }, match: 'communication is advisory' },
  ],
}

export function jdSpecFor(collegeId: string): JdSpec {
  return isPolytechnic(institutionById(collegeId)) ? JD_CORE : JD_IT
}

export interface JdCounts {
  eligible: number
  ready: number
  sprint: number
}

/** d1 numbers for its host college; other colleges are scaled from d1 by their own batch. */
export function jdCountsFor(collegeId: string): JdCounts {
  const d1 = driveById('d1')
  const host = institutionById(d1?.hostInstitutionId ?? DEFAULT_COLLEGE)
  const inst = institutionById(collegeId)
  if (!d1 || !host || !inst) return { eligible: 0, ready: 0, sprint: 0 }
  if (inst.id === host.id) {
    return { eligible: d1.eligibleCount, ready: d1.readyCount, sprint: d1.eligibleCount - d1.readyCount }
  }
  const hb = batchOf(host)
  const b = batchOf(inst)
  const eligible = Math.round((b.onboarded * d1.eligibleCount) / Math.max(1, hb.onboarded))
  const ready = Math.min(eligible, Math.round((b.interviewReady * d1.readyCount) / Math.max(1, hb.interviewReady)))
  return { eligible, ready, sprint: eligible - ready }
}

export interface JdCandidate {
  id: string
  name: string
  branch: BranchCode
  pri: number
  fit: number
  integrity: number
  versant: number
  ready: boolean
  sample: boolean
  score: number
  rank: number
}

const H_FIRST_F = ['Aarti', 'Sonali', 'Pallavi', 'Nikita', 'Priyanka', 'Rani', 'Shreya', 'Komal', 'Muskan', 'Tanya', 'Rupa', 'Juhi', 'Divya', 'Puja', 'Swati', 'Anamika', 'Kriti', 'Nandini']
const H_FIRST_M = ['Rupesh', 'Kundan', 'Sachin', 'Vivek', 'Sumit', 'Pankaj', 'Ranjeet', 'Abhay', 'Harsh', 'Akash', 'Chandan', 'Gautam', 'Himanshu', 'Mukesh', 'Navneet', 'Alok', 'Bipin', 'Satyam', 'Utkarsh', 'Vishal']
const H_LAST = ['Kumar', 'Singh', 'Jha', 'Mishra', 'Yadav', 'Thakur', 'Paswan', 'Sah', 'Gupta', 'Choudhary', 'Ranjan', 'Mandal', 'Prasad', 'Verma', 'Raj', 'Sinha']
const M_FIRST_F = ['Ayesha', 'Sana', 'Nazia', 'Rukhsar', 'Afreen', 'Zeba']
const M_FIRST_M = ['Md. Shahid', 'Md. Imran', 'Md. Sarfaraz', 'Md. Danish', 'Md. Nadeem', 'Md. Faisal']
const M_LAST_F = ['Parveen', 'Khatoon', 'Naaz', 'Fatima']
const M_LAST_M = ['Alam', 'Ansari', 'Hussain', 'Raza']

function genName(R: ReturnType<typeof rng>): string {
  const female = R.next() < 0.32
  if (R.next() < 0.17) {
    return female ? `${R.pick(M_FIRST_F)} ${R.pick(M_LAST_F)}` : `${R.pick(M_FIRST_M)} ${R.pick(M_LAST_M)}`
  }
  if (female) return `${R.pick(H_FIRST_F)} ${R.next() < 0.5 ? 'Kumari' : R.pick(H_LAST)}`
  return `${R.pick(H_FIRST_M)} ${R.pick(H_LAST)}`
}

function eligibleForJd(r: StudentRow, spec: JdSpec, poly: boolean): boolean {
  if (!spec.branches.includes(r.branch)) return false
  if (r.activeBacklogs > 0 || r.gapYears > 1 || r.tenth < 60) return false
  if (spec.kind === 'it') return r.cgpa >= 6.5 && r.twelfth >= 60
  // Polytechnic rows store the diploma % in `twelfth`.
  return poly ? r.twelfth >= 60 : r.cgpa >= 6.0
}

function fitFor(r: StudentRow, spec: JdSpec): number {
  const p = r.pillars
  return spec.kind === 'it'
    ? Math.round(0.4 * p.aptitude + 0.35 * p.technical + 0.25 * p.communication)
    : Math.round(0.3 * p.aptitude + 0.5 * p.technical + 0.2 * p.techInterview)
}

const SHORTLIST_CACHE = new Map<string, JdCandidate[]>()

/**
 * Every eligible candidate for the college's JD, ranked (interview-ready first, then by score).
 * The list length equals jdCountsFor().eligible and exactly `.ready` of them are interview-ready (PRI ≥ 70).
 * Sample students (incl. Priya / Rahul) keep their real numbers; the rest of the batch is generated.
 */
export function jdShortlistFor(collegeId: string): JdCandidate[] {
  const hit = SHORTLIST_CACHE.get(collegeId)
  if (hit) return hit
  const spec = jdSpecFor(collegeId)
  const counts = jdCountsFor(collegeId)
  const poly = isPolytechnic(institutionById(collegeId))
  const rows = studentsFor(collegeId).filter((r) => eligibleForJd(r, spec, poly))
  const R = rng(hashStr(`${collegeId}:jd-pool`))

  const fromRow = (r: StudentRow): Omit<JdCandidate, 'score' | 'rank'> => ({
    id: r.id,
    name: r.name,
    branch: r.branch,
    pri: r.pri,
    fit: fitFor(r, spec),
    integrity: r.pillars.integrity,
    versant: pillarToVersant(r.pillars.communication),
    ready: r.pri >= 70,
    sample: true,
  })
  const sReady = rows.filter((r) => r.pri >= 70).slice(0, counts.ready).map(fromRow)
  const sSprint = rows.filter((r) => r.pri < 70).slice(0, counts.sprint).map(fromRow)

  const used = new Set(studentsFor(collegeId).map((r) => r.name))
  const uniqueName = () => {
    for (let i = 0; i < 40; i++) {
      const n = genName(R)
      if (!used.has(n)) {
        used.add(n)
        return n
      }
    }
    const n = `${genName(R)} ${used.size}`
    used.add(n)
    return n
  }
  const gen = (i: number, ready: boolean): Omit<JdCandidate, 'score' | 'rank'> => {
    const pri = ready ? 70 + Math.floor(Math.pow(R.next(), 1.7) * 17) : R.int(47, 69)
    return {
      id: `${collegeId}-jd-${String(i + 1).padStart(3, '0')}`,
      name: uniqueName(),
      branch: spec.branches[R.int(0, spec.branches.length - 1)],
      pri,
      fit: clamp(pri + R.int(-7, 8), 35, 97),
      integrity: R.pick([100, 100, 100, 100, 96, 92]),
      versant: ready ? R.int(50, 63) : R.int(38, 53),
      ready,
      sample: false,
    }
  }
  const pool: Omit<JdCandidate, 'score' | 'rank'>[] = [...sReady, ...sSprint]
  let k = 0
  for (let i = sReady.length; i < counts.ready; i++) pool.push(gen(k++, true))
  for (let i = sSprint.length; i < counts.sprint; i++) pool.push(gen(k++, false))

  const ranked = pool
    .map((c) => ({ ...c, score: Math.round((0.5 * c.pri + 0.35 * c.fit + 0.15 * c.integrity) * 10) / 10, rank: 0 }))
    .sort((a, b) => Number(b.ready) - Number(a.ready) || b.score - a.score || a.name.localeCompare(b.name))
  ranked.forEach((c, i) => (c.rank = i + 1))
  SHORTLIST_CACHE.set(collegeId, ranked)
  return ranked
}

// ---------------------------------------------------------------------------
// Pool drive builder
// ---------------------------------------------------------------------------
/** Extra polytechnics the TPO may add to the d2 pool (not preselected). */
const POOL_EXTRAS = ['gp-madhubani', 'gp-siwan', 'gp-begusarai']

export function poolOptionsFor(collegeId: string): string[] {
  const d2 = driveById('d2')
  const base = d2 ? [...d2.institutionIds] : []
  const extra = [collegeId, ...POOL_EXTRAS].filter((id) => !base.includes(id) && !!institutionById(id))
  return [...base, ...Array.from(new Set(extra))]
}

export function poolDefaultSelection(): string[] {
  return [...(driveById('d2')?.institutionIds ?? [])]
}

export interface PoolPreviewRow {
  id: string
  name: string
  instShort: string
  pri: number
  branch: BranchCode
}

const CORE_MECH: BranchCode[] = ['ME', 'D-ME', 'D-AUTO']

/** A few AI-ranked names from the selected pool; Rahul (GP Muzaffarpur) first when his college is in. */
export function poolPreview(ids: readonly string[], limit = 6): PoolPreviewRow[] {
  const out: PoolPreviewRow[] = []
  const lists: PoolPreviewRow[][] = []
  for (const id of ids) {
    const inst = institutionById(id)
    if (!inst) continue
    const rows = studentsFor(id)
    const rahul = rows.find((r) => r.id === 'rahul')
    if (rahul) out.push({ id: rahul.id, name: rahul.name, instShort: inst.short, pri: rahul.pri, branch: rahul.branch })
    lists.push(
      rows
        .filter((r) => r.id !== 'rahul' && r.id !== 'priya' && CORE_MECH.includes(r.branch) && r.pri >= 66)
        .sort((a, b) => b.pri - a.pri)
        .slice(0, 2)
        .map((r) => ({ id: r.id, name: r.name, instShort: inst.short, pri: r.pri, branch: r.branch })),
    )
  }
  for (let round = 0; out.length < limit && round < 2; round++) {
    for (const l of lists) {
      if (out.length >= limit) break
      const r = l[round]
      if (r) out.push(r)
    }
  }
  return out.slice(0, limit)
}

/** Ready count of one institution inside a pool (same rule as poolReady). */
export function poolContribution(id: string): number {
  return poolReady([id])
}

// ---------------------------------------------------------------------------
// Drive notice (bilingual, for WhatsApp)
// ---------------------------------------------------------------------------
const SECTION_HI: Record<string, string> = {
  Aptitude: 'अभिरुचि',
  'Core Mechanical MCQ': 'कोर मैकेनिकल MCQ',
  'Shop-floor Case': 'शॉप-फ़्लोर केस',
  'HR Interview (in Hindi)': 'HR इंटरव्यू (हिंदी में)',
  'Core Electrical MCQ': 'कोर इलेक्ट्रिकल MCQ',
  'Electronics & Instrumentation': 'इलेक्ट्रॉनिक्स एवं इंस्ट्रूमेंटेशन',
  'Site Safety Case': 'साइट सेफ़्टी केस',
  'Core Civil MCQ': 'कोर सिविल MCQ',
  'Drawing & Estimation': 'ड्रॉइंग एवं एस्टिमेशन',
  'Site Execution Case': 'साइट एक्ज़ीक्यूशन केस',
  'Numerical Ability': 'संख्यात्मक योग्यता',
  'Verbal Ability': 'मौखिक योग्यता',
  'Reasoning Ability': 'तार्किक योग्यता',
  'Advanced Quant + Reasoning': 'एडवांस्ड क्वांट + रीज़निंग',
  Coding: 'कोडिंग',
  'Logical Reasoning': 'तार्किक रीज़निंग',
  'Mathematical Ability': 'गणितीय योग्यता',
  'Pseudo-code': 'स्यूडो-कोड',
  'Puzzle Solving': 'पहेली हल करना',
  'Quantitative Aptitude': 'मात्रात्मक अभिरुचि',
  'Walk-in interview': 'वॉक-इन इंटरव्यू',
}

export function driveNoticeFor(drive: Drive, college: Institution | undefined): Bi {
  const bp = blueprintById(drive.blueprintId)
  const host = institutionById(drive.hostInstitutionId)
  const venueEn = host?.name ?? ''
  const cell = college?.short ?? host?.short ?? ''
  const branchesEn = drive.branches.map((b) => BRANCH_NAME[b]?.en ?? b).join(', ')
  const branchesHi = drive.branches.map((b) => BRANCH_NAME[b]?.hi ?? b).join(', ')
  const roundsEn = bp.sections.map((s) => (s.questions > 1 ? `${s.name} (${s.questions} Q)` : s.name)).join(' → ')
  const roundsHi = bp.sections
    .map((s) => (s.questions > 1 ? `${SECTION_HI[s.name] ?? s.name} (${s.questions} प्रश्न)` : SECTION_HI[s.name] ?? s.name))
    .join(' → ')
  const e = bp.eligibility
  const regBy = addDaysIso(drive.date, -4)
  const pool = drive.pool ? drive.institutionIds.length : 0
  const en = [
    `CAMPUS DRIVE NOTICE · Batch 2027`,
    `${drive.title.en}${pool ? ` · pool drive, ${pool} institutions` : ''}`,
    `Date: ${fmtDate(drive.date, 'en', { year: true })} · Venue: ${venueEn}`,
    `Branches: ${branchesEn}`,
    `Pattern: ${roundsEn}`,
    `Eligibility: CGPA ≥ ${fmtNum(e.minCgpa, 1)}${e.minDiplomaPct ? ` or diploma ≥ ${e.minDiplomaPct}%` : ''}, no active backlogs, 10th & 12th ≥ ${e.min10th}%, gap ≤ ${e.maxGapYears} yr`,
    `Register by ${fmtDate(regBy, 'en')} on ParthSarthi Placement OS. Carry college ID, APAAR ID and marksheets.`,
    `Practise this exact pattern free in the app before the drive.`,
    `T&P Cell, ${cell}`,
  ].join('\n')
  const hi = [
    `कैंपस ड्राइव सूचना · बैच 2027`,
    `${drive.title.hi}${pool ? ` · पूल ड्राइव, ${pool} संस्थान` : ''}`,
    `तारीख़: ${fmtDate(drive.date, 'hi', { year: true })} · स्थान: ${venueEn}`,
    `शाखाएँ: ${branchesHi}`,
    `पैटर्न: ${roundsHi}`,
    `पात्रता: CGPA ≥ ${fmtNum(e.minCgpa, 1)}${e.minDiplomaPct ? ` या डिप्लोमा ≥ ${e.minDiplomaPct}%` : ''}, कोई सक्रिय बैकलॉग नहीं, 10वीं और 12वीं ≥ ${e.min10th}%, अंतराल ≤ ${e.maxGapYears} वर्ष`,
    `${fmtDate(regBy, 'hi')} तक ParthSarthi Placement OS पर पंजीकरण करें। कॉलेज ID, APAAR ID और अंकपत्र साथ लाएँ।`,
    `ड्राइव से पहले यही पैटर्न ऐप में मुफ़्त अभ्यास करें।`,
    `T&P प्रकोष्ठ, ${cell}`,
  ].join('\n')
  return { en, hi }
}

// ---------------------------------------------------------------------------
// Offers (Reports tab)
// ---------------------------------------------------------------------------
export type OfferStatus = 'Accepted' | 'Pending' | 'Declined' | 'Upgraded'
export type OfferTier = 'Regular' | 'Dream' | 'Super-Dream' | 'Core'

export interface OfferRow {
  id: string
  studentId: string
  name: string
  branch: BranchCode
  sector: Bi
  tier: OfferTier
  band: string
  status: OfferStatus
  rules: Bi[]
  date: string
}

const SECTORS: Record<string, Bi[]> = {
  CSE: [
    { en: 'IT services', hi: 'IT सेवाएँ' },
    { en: 'Product company', hi: 'प्रोडक्ट कंपनी' },
    { en: 'IT consulting', hi: 'IT कंसल्टिंग' },
  ],
  AI: [
    { en: 'IT services', hi: 'IT सेवाएँ' },
    { en: 'Analytics', hi: 'एनालिटिक्स' },
  ],
  ECE: [
    { en: 'Electronics manufacturing', hi: 'इलेक्ट्रॉनिक्स निर्माण' },
    { en: 'Telecom / network', hi: 'टेलीकॉम / नेटवर्क' },
    { en: 'Embedded / IoT startup', hi: 'एम्बेडेड / IoT स्टार्टअप' },
  ],
  EE: [
    { en: 'Power / EPC', hi: 'पावर / EPC' },
    { en: 'Electronics manufacturing', hi: 'इलेक्ट्रॉनिक्स निर्माण' },
  ],
  ME: [
    { en: 'Auto OEM', hi: 'ऑटो OEM' },
    { en: 'Manufacturing', hi: 'विनिर्माण' },
  ],
  CE: [
    { en: 'Construction / EPC', hi: 'निर्माण / EPC' },
    { en: 'Infrastructure', hi: 'इन्फ्रास्ट्रक्चर' },
  ],
  'D-ME': [
    { en: 'Manufacturing (shop floor)', hi: 'विनिर्माण (शॉप फ़्लोर)' },
    { en: 'Auto / EV service network', hi: 'ऑटो / EV सर्विस नेटवर्क' },
  ],
  'D-AUTO': [
    { en: 'Auto / EV service network', hi: 'ऑटो / EV सर्विस नेटवर्क' },
    { en: 'Two-wheeler dealer workshop', hi: 'दोपहिया डीलर वर्कशॉप' },
  ],
  'D-EE': [
    { en: 'Electrical contracting', hi: 'इलेक्ट्रिकल कॉन्ट्रैक्टिंग' },
    { en: 'Power distribution', hi: 'बिजली वितरण' },
  ],
  'D-CE': [
    { en: 'Construction site', hi: 'निर्माण साइट' },
    { en: 'Roads & infrastructure', hi: 'सड़क एवं इन्फ्रास्ट्रक्चर' },
  ],
  'D-ECE': [
    { en: 'Electronics manufacturing', hi: 'इलेक्ट्रॉनिक्स निर्माण' },
    { en: 'Telecom field services', hi: 'टेलीकॉम फ़ील्ड सेवाएँ' },
  ],
  'D-FS': [{ en: 'Industrial safety', hi: 'औद्योगिक सुरक्षा' }],
}

const TECH_BRANCHES: BranchCode[] = ['CSE', 'ECE', 'EE', 'AI', 'MNC']
const PRODUCT_SECTOR: Bi = { en: 'Product company', hi: 'प्रोडक्ट कंपनी' }

const RULE = {
  osoj: { en: 'One student, one job', hi: 'एक छात्र, एक नौकरी' },
  lockedRegular: { en: 'Locked out of Regular drives', hi: 'नियमित ड्राइव से बाहर' },
  dreamOpen: { en: 'May sit for Dream tier', hi: 'ड्रीम टियर के लिए पात्र' },
  upgraded: { en: 'Dream upgrade used (1 of 1)', hi: 'ड्रीम अपग्रेड उपयोग (1 में से 1)' },
  superDream: { en: 'Super-Dream: final', hi: 'सुपर-ड्रीम: अंतिम' },
  respond: { en: 'Respond within 7 days', hi: '7 दिन में जवाब दें' },
  declineCount: { en: 'Decline 1 of 2 allowed', hi: 'अस्वीकार: 2 में से 1' },
  stillEligible: { en: 'Stays eligible', hi: 'पात्रता बनी रहेगी' },
} satisfies Record<string, Bi>

const STATUS_PATTERN: OfferStatus[] = [
  'Accepted',
  'Accepted',
  'Upgraded',
  'Pending',
  'Accepted',
  'Declined',
  'Pending',
  'Accepted',
  'Upgraded',
  'Pending',
]

function bandFor(tier: OfferTier, diploma: boolean): string {
  if (diploma) return tier === 'Dream' ? '₹3.0–3.6 LPA' : '₹2.2–3.0 LPA'
  if (tier === 'Super-Dream') return '₹8–10 LPA'
  if (tier === 'Dream') return '₹6.0–7.5 LPA'
  if (tier === 'Core') return '₹3.6–4.8 LPA'
  return '₹3.4–4.0 LPA'
}

const OFFER_CACHE = new Map<string, OfferRow[]>()

/** 10 recent offers for the college: its strongest sample students (personas excluded). */
export function offersFor(collegeId: string): OfferRow[] {
  const hit = OFFER_CACHE.get(collegeId)
  if (hit) return hit
  const inst = institutionById(collegeId)
  const diploma = isPolytechnic(inst)
  const rows = studentsFor(collegeId)
    .filter((r) => r.id !== 'priya' && r.id !== 'rahul')
    .sort((a, b) => b.pri - a.pri || a.name.localeCompare(b.name))
    .slice(0, STATUS_PATTERN.length)
  const used: Record<string, number> = {}
  const out = rows.map<OfferRow>((r, i) => {
    const status = STATUS_PATTERN[i]
    const key = SECTORS[r.branch] ? r.branch : diploma ? 'D-ME' : 'CSE'
    const list = SECTORS[key]
    const n = used[key] ?? 0
    used[key] = n + 1
    const core = !diploma && (r.branch === 'ME' || r.branch === 'CE' || r.branch === 'EE')
    const tier: OfferTier =
      status === 'Upgraded' ? (i === 2 && !diploma && TECH_BRANCHES.includes(r.branch) ? 'Super-Dream' : 'Dream') : core || diploma ? 'Core' : 'Regular'
    const sector = tier === 'Super-Dream' ? PRODUCT_SECTOR : list[n % list.length]
    let rules: Bi[]
    if (status === 'Accepted') rules = tier === 'Core' || tier === 'Regular' ? [RULE.osoj, RULE.lockedRegular, RULE.dreamOpen] : [RULE.osoj]
    else if (status === 'Upgraded') rules = tier === 'Super-Dream' ? [RULE.upgraded, RULE.superDream] : [RULE.upgraded, RULE.osoj]
    else if (status === 'Pending') rules = [RULE.respond, RULE.osoj]
    else rules = [RULE.declineCount, RULE.stillEligible]
    return {
      id: `${collegeId}-offer-${i + 1}`,
      studentId: r.id,
      name: r.name,
      branch: r.branch,
      sector,
      tier,
      band: bandFor(tier, diploma),
      status,
      rules,
      date: isoDaysBefore(2 + i * 3),
    }
  })
  OFFER_CACHE.set(collegeId, out)
  return out
}

// ---------------------------------------------------------------------------
// Branch-wise placement table (illustrative)
// ---------------------------------------------------------------------------
export interface BranchPlacementRow {
  branch: BranchCode
  finalYear: number
  /** Batch 2027 offers so far; the column sums to batchOf(inst).offers. */
  offers: number
  /** Last batch (2026) placed %, illustrative. */
  placedPrev: number
  /** Last batch median CTC, LPA, illustrative. */
  medianCtc: number
}

export function branchPlacementFor(collegeId: string): BranchPlacementRow[] {
  const inst = institutionById(collegeId)
  if (!inst) return []
  const b = batchOf(inst)
  const stats = branchStatsFor(collegeId)
  const diploma = isPolytechnic(inst)
  const R = rng(hashStr(`${collegeId}:placement`))
  const offers = allocate(
    b.offers,
    stats.map((s) => s.finalYear * Math.max(1, s.avgPri - 40)),
  )
  return stats.map((s, i) => {
    const it = s.branch === 'CSE' || s.branch === 'AI'
    const placedPrev = clamp(Math.round(35 + (s.avgPri - 50) * 2.6 + R.int(-2, 2) + (diploma ? 4 : 0)), 15, 88)
    const base = diploma ? 2.4 : it ? 3.9 : 3.3
    const medianCtc = Math.round((base + Math.max(0, s.avgPri - 50) * 0.05 + R.next() * 0.2) * 10) / 10
    return { branch: s.branch, finalYear: s.finalYear, offers: offers[i] ?? 0, placedPrev, medianCtc }
  })
}

// ---------------------------------------------------------------------------
// CSV / download (call from click handlers only)
// ---------------------------------------------------------------------------
function csvCell(v: string | number): string {
  const s = String(v ?? '')
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(header: readonly string[], rows: ReadonlyArray<ReadonlyArray<string | number>>): string {
  return [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n')
}

/** Real Blob download. UTF-8 BOM so Excel shows Hindi and ₹ correctly. Returns false if the browser refused. */
export function downloadText(filename: string, text: string, mime = 'text/csv;charset=utf-8'): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false
  try {
    const blob = new Blob(['﻿', text], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.rel = 'noopener'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1500)
    return true
  } catch {
    return false
  }
}

/** Copy text; falls back to a hidden textarea when the async clipboard API is unavailable. */
export async function copyText(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  } catch {
    return false
  }
}

/** File-name slug for exports, e.g. 'purnea-ce'. */
export function slugFor(inst: Institution | undefined): string {
  return (inst?.short ?? 'college').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
