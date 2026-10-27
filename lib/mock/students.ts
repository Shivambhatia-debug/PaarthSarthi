// Sample student rows for the College T&P console. Fictional names; illustrative data.
// Names are shown ONLY in the college view (never at State level).
import { batchOf, institutionById } from '@/lib/mock/institutions'
import { PRIYA, RAHUL, latestAttempt } from '@/lib/mock/personas'
import { clamp, rng, type Rng } from '@/lib/mock/seed'
import { computePRI, versantToPillar } from '@/lib/os/scoring'
import type { Bi } from '@/lib/os/i18n'
import type { BranchCode, Institution, Pillars, SkillKey, StudentRow } from '@/lib/mock/types'

// ---------------------------------------------------------------------------
// Risk reasons
// ---------------------------------------------------------------------------
export const RISK_REASONS = {
  noMock: { en: 'No mock in 14 days', hi: '14 दिन से कोई मॉक नहीं' },
  lowComm: { en: 'Communication below 40', hi: 'संवाद 40 से कम' },
  backlog: { en: 'Active backlog', hi: 'सक्रिय बैकलॉग' },
  noInternship: { en: 'No internship', hi: 'कोई इंटर्नशिप नहीं' },
  noOffer: { en: 'Final year, no offer', hi: 'अंतिम वर्ष, कोई ऑफ़र नहीं' },
} satisfies Record<string, Bi>

type Risk = StudentRow['risk']

// ---------------------------------------------------------------------------
// Purnea CE branch stats (Batch 2027). finalYear sums to 268, onboarded to 241,
// onboarded-weighted avgPri rounds to 54 (asserted in checks.ts).
// ---------------------------------------------------------------------------
export type PceBranch = 'CSE' | 'ECE' | 'EE' | 'ME' | 'CE'

export interface BranchStat {
  finalYear: number
  onboarded: number
  avgPri: number
  below50Pct: number
  /** Versant-style 20-80 */
  commVersant: number
  inactive14d: number
}

export const PCE_BRANCH_STATS: Record<PceBranch, BranchStat> = {
  CSE: { finalYear: 62, onboarded: 57, avgPri: 58, below50Pct: 22, commVersant: 49, inactive14d: 9 },
  ECE: { finalYear: 58, onboarded: 52, avgPri: 55, below50Pct: 30, commVersant: 44, inactive14d: 23 },
  EE: { finalYear: 52, onboarded: 47, avgPri: 54, below50Pct: 34, commVersant: 47, inactive14d: 12 },
  ME: { finalYear: 50, onboarded: 45, avgPri: 52, below50Pct: 41, commVersant: 46, inactive14d: 14 },
  CE: { finalYear: 46, onboarded: 40, avgPri: 49, below50Pct: 61, commVersant: 45, inactive14d: 17 },
}

export const SKILL_COLS: SkillKey[] = [
  'aptitude',
  'dsa',
  'sql',
  'python',
  'core',
  'cad',
  'plc',
  'communication',
  'excel',
]

export interface BranchSkillMatrix {
  rows: BranchCode[]
  cols: SkillKey[]
  values: number[][]
}

const PCE_ROWS: PceBranch[] = ['CSE', 'ECE', 'EE', 'ME', 'CE']
// Columns: aptitude, dsa, sql, python, core, cad, plc, (communication from Versant), excel
const PCE_RAW: Record<PceBranch, number[]> = {
  CSE: [61, 57, 60, 63, 58, 47, 44, 0, 62],
  ECE: [58, 49, 51, 55, 57, 46, 53, 0, 56],
  EE: [57, 45, 47, 49, 56, 49, 55, 0, 55],
  ME: [55, 41, 43, 44, 54, 39, 47, 0, 51],
  CE: [48, 40, 42, 43, 51, 46, 41, 0, 50],
}

/** Communication column = versantToPillar(commVersant) (ECE = 40). */
export const PCE_BRANCH_SKILL: BranchSkillMatrix = {
  rows: [...PCE_ROWS],
  cols: [...SKILL_COLS],
  values: PCE_ROWS.map((b) =>
    PCE_RAW[b].map((v, j) => (SKILL_COLS[j] === 'communication' ? versantToPillar(PCE_BRANCH_STATS[b].commVersant) : v)),
  ),
}

// ---------------------------------------------------------------------------
// Row generator
// ---------------------------------------------------------------------------
const SKILLS_BY_BRANCH: Record<BranchCode, string[]> = {
  CSE: ['Python', 'DSA', 'SQL', 'Java', 'React', 'Git'],
  ECE: ['Embedded C', 'IoT', 'MATLAB', 'Python', 'Arduino', 'VLSI basics'],
  EE: ['MATLAB', 'PLC', 'AutoCAD Electrical', 'Power systems', 'Excel'],
  ME: ['AutoCAD', 'SolidWorks', 'CNC basics', 'Thermal', 'Excel'],
  CE: ['AutoCAD', 'STAAD.Pro', 'Estimation', 'Surveying', 'Excel'],
  AI: ['Python', 'Pandas', 'ML basics', 'SQL', 'Prompting'],
  MNC: ['Python', 'Statistics', 'SQL', 'DSA'],
  'D-ME': ['AutoCAD', 'Workshop', 'CNC basics', 'Measurement'],
  'D-EE': ['Wiring', 'PLC', 'Motors', 'Safety'],
  'D-CE': ['AutoCAD', 'Surveying', 'Estimation', 'Site safety'],
  'D-ECE': ['Soldering', 'Arduino', 'Embedded C', 'Testing'],
  'D-AUTO': ['EV basics', 'Engine overhaul', 'Diagnostics', 'Workshop safety'],
  'D-FS': ['Fire safety', 'First aid', 'Safety audit', 'Hazmat basics'],
}

const PRI_RANGE: Record<Risk, [number, number]> = {
  high: [36, 48],
  medium: [50, 61],
  low: [63, 79],
}

function pillarsFor(R: Rng, target: number): Pillars {
  const c = (n: number) => clamp(Math.round(n), 10, 98)
  const p: Pillars = {
    aptitude: c(target + R.int(-6, 8)),
    technical: c(target + R.int(-6, 8)),
    communication: c(target - R.int(8, 18)),
    techInterview: c(target + R.int(-6, 6)),
    hr: c(target + R.int(-3, 9)),
    resume: c(target + R.int(-8, 8)),
    integrity: R.pick([100, 100, 100, 96, 92]),
  }
  // Nudge technical (then aptitude) until the weighted PRI equals target exactly.
  for (let i = 0; i < 80 && computePRI(p) !== target; i++) {
    const dir = computePRI(p) < target ? 1 : -1
    if ((dir > 0 && p.technical < 98) || (dir < 0 && p.technical > 10)) p.technical += dir
    else p.aptitude = c(p.aptitude + dir)
  }
  return p
}

interface Seedling {
  id: string
  name: string
  gender: 'F' | 'M'
  branch: BranchCode
  risk: Risk
}

function makeRow(R: Rng, s: Seedling, inst: Institution, priShift: number): StudentRow {
  const [lo, hi] = PRI_RANGE[s.risk]
  const pri = clamp(R.int(lo, hi) + priShift, lo, hi)
  const prevDrop =
    s.risk === 'high' ? R.int(-2, 4) : s.risk === 'medium' ? R.int(3, 10) : R.int(5, 16)
  const priPrev = clamp(pri - prevDrop, 25, 95)
  const pillars = pillarsFor(R, pri)
  const diploma = inst.type === 'GP'
  const cgpa =
    Math.round(
      (s.risk === 'high' ? 5.6 + R.next() * 1.4 : s.risk === 'medium' ? 6.4 + R.next() * 1.2 : 7.0 + R.next() * 1.6) * 10,
    ) / 10
  const tenth = R.int(60, 88)
  const twelfth = diploma ? Math.round(cgpa * 10) : R.int(58, 84)
  const activeBacklogs = s.risk === 'high' ? (R.next() < 0.5 ? R.int(1, 2) : 0) : s.risk === 'medium' ? (R.next() < 0.15 ? 1 : 0) : 0
  const gapYears = R.next() < 0.1 ? 1 : 0
  const lastActiveDays = s.risk === 'high' ? R.int(9, 24) : s.risk === 'medium' ? R.int(2, 12) : R.int(0, 4)
  const medium: StudentRow['medium'] = R.next() < 0.75 ? 'Hindi' : 'English'
  const rural = R.next() < 0.7

  const reasons: Bi[] = []
  if (lastActiveDays >= 14) reasons.push(RISK_REASONS.noMock)
  if (pillars.communication < 40) reasons.push(RISK_REASONS.lowComm)
  if (activeBacklogs > 0) reasons.push(RISK_REASONS.backlog)
  if (s.risk === 'high') {
    if (reasons.length < 3) reasons.push(RISK_REASONS.noOffer)
    if (reasons.length < 2) reasons.push(RISK_REASONS.noInternship)
  } else if (s.risk === 'medium') {
    if (reasons.length === 0) reasons.push(R.next() < 0.5 ? RISK_REASONS.noInternship : RISK_REASONS.noOffer)
  }
  const riskReasons = s.risk === 'low' ? [] : reasons.slice(0, 3)

  const delta = pri - priPrev
  const status: StudentRow['status'] =
    priPrev < 50 && pri >= 70 ? 'recovered' : delta >= 4 ? 'improving' : 'stalled'

  const pool = SKILLS_BY_BRANCH[s.branch] ?? SKILLS_BY_BRANCH.CSE
  const skills = R.shuffle(pool).slice(0, 3)

  return {
    id: s.id,
    name: s.name,
    gender: s.gender,
    branch: s.branch,
    institutionId: inst.id,
    cgpa,
    tenth,
    twelfth,
    activeBacklogs,
    gapYears,
    pri,
    priPrev,
    pillars,
    risk: s.risk,
    riskReasons,
    lastActiveDays,
    medium,
    rural,
    skills,
    status,
  }
}

// [name, gender, branch, risk] for Purnea CE (Priya is prepended separately).
// Risk mix with Priya: exactly 12 high, 10 medium, 8 low.
const PCE_SEEDLINGS: [string, 'F' | 'M', PceBranch, Risk][] = [
  ['Aman Raj', 'M', 'CSE', 'low'],
  ['Sneha Kumari', 'F', 'ECE', 'medium'],
  ['Rohit Kumar', 'M', 'CE', 'high'],
  ['Anjali Kumari', 'F', 'EE', 'medium'],
  ['Md. Faizan Alam', 'M', 'ME', 'high'],
  ['Khushboo Kumari', 'F', 'CE', 'high'],
  ['Vikash Kumar', 'M', 'ME', 'medium'],
  ['Pooja Bharti', 'F', 'CSE', 'low'],
  ['Abhishek Anand', 'M', 'EE', 'high'],
  ['Ritika Singh', 'F', 'CSE', 'medium'],
  ['Saurabh Jha', 'M', 'ECE', 'low'],
  ['Neha Parveen', 'F', 'ECE', 'high'],
  ['Gaurav Mandal', 'M', 'CE', 'high'],
  ['Shalini Kumari', 'F', 'EE', 'medium'],
  ['Rajnish Paswan', 'M', 'ME', 'high'],
  ['Ankit Yadav', 'M', 'CSE', 'low'],
  ['Md. Arif Hussain', 'M', 'CE', 'high'],
  ['Deepak Mehta', 'M', 'EE', 'low'],
  ['Kajal Kumari', 'F', 'ECE', 'medium'],
  ['Nitish Kumar', 'M', 'ME', 'high'],
  ['Manish Choudhary', 'M', 'CSE', 'medium'],
  ['Sanjeev Ranjan', 'M', 'CE', 'high'],
  ['Aditya Prakash', 'M', 'ECE', 'low'],
  ['Raushan Kumar', 'M', 'ME', 'medium'],
  ['Shubham Raj', 'M', 'EE', 'high'],
  ['Prince Kumar', 'M', 'CSE', 'medium'],
  ['Rakhi Kumari', 'F', 'ME', 'medium'],
  ['Amit Kumar Sah', 'M', 'EE', 'high'],
  ['Shabnam Khatoon', 'F', 'CSE', 'low'],
]

const EXTRA_NAMES: [string, 'F' | 'M'][] = [
  ['Shweta Kumari', 'F'],
  ['Md. Tabrez Alam', 'M'],
  ['Ravi Shankar', 'M'],
]

const PRIYA_ROW: StudentRow = {
  id: 'priya',
  name: PRIYA.name,
  gender: 'F',
  branch: 'ECE',
  institutionId: 'pce-purnea',
  cgpa: PRIYA.cgpa ?? 7.1,
  tenth: PRIYA.tenth ?? 78,
  twelfth: PRIYA.twelfth ?? 71,
  activeBacklogs: 0,
  gapYears: 0,
  pri: 71,
  priPrev: 42,
  pillars: { ...latestAttempt(PRIYA).pillars },
  risk: 'low',
  riskReasons: [],
  lastActiveDays: 0,
  medium: 'Hindi',
  rural: true,
  skills: ['ESP32', 'MQTT', 'Python', 'IoT'],
  status: 'recovered',
}

const RAHUL_ROW: StudentRow = {
  id: 'rahul',
  name: RAHUL.name,
  gender: 'M',
  branch: 'D-AUTO',
  institutionId: 'gp-muzaffarpur',
  cgpa: 7.2,
  tenth: RAHUL.tenth ?? 74,
  twelfth: RAHUL.diplomaPct ?? 72, // diploma %
  activeBacklogs: 0,
  gapYears: 0,
  pri: 68,
  priPrev: 68,
  pillars: { ...latestAttempt(RAHUL).pillars },
  risk: 'low',
  riskReasons: [],
  lastActiveDays: 0,
  medium: 'Hindi',
  rural: true,
  skills: ['EV basics', 'BMS', 'LibreCAD', 'Workshop safety'],
  status: 'new',
}

function buildPce(): StudentRow[] {
  const inst = institutionById('pce-purnea')
  if (!inst) return [PRIYA_ROW]
  const R = rng(4100)
  const rows = PCE_SEEDLINGS.map(([name, gender, branch, risk], i) =>
    makeRow(R, { id: `pce-s${String(i + 1).padStart(2, '0')}`, name, gender, branch, risk }, inst, 0),
  )
  return [PRIYA_ROW, ...rows]
}

/** 30 Purnea CE final-years. First row is Priya (recovered 42 -> 71). 12 high / 10 medium / 8 low. */
export const PCE_STUDENTS: StudentRow[] = buildPce()

function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function buildFor(inst: Institution): StudentRow[] {
  const R = rng(hashStr(inst.id))
  const lead = inst.id === 'gp-muzaffarpur' ? [RAHUL_ROW] : []
  const n = 30 - lead.length
  const names = R.shuffle([
    ...PCE_SEEDLINGS.map(([name, gender]) => [name, gender] as [string, 'F' | 'M']),
    ...EXTRA_NAMES,
  ]).slice(0, n)
  // Risk mix like Purnea (12 / 10 / 8 overall), capped by the batch's at-risk count.
  const b = batchOf(inst)
  const highN = Math.max(0, Math.min(12, b.atRisk))
  const lowN = 8 - lead.length
  const medN = n - highN - lowN
  const risks = R.shuffle<Risk>([
    ...Array<Risk>(highN).fill('high'),
    ...Array<Risk>(Math.max(0, medN)).fill('medium'),
    ...Array<Risk>(lowN).fill('low'),
  ]).slice(0, n)
  const branches = inst.branches.filter((x) => x !== 'MNC')
  const shift = Math.round((inst.pri - 54) * 0.5)
  const rows = names.map(([name, gender], i) =>
    makeRow(
      R,
      {
        id: `${inst.id}-s${String(i + 1).padStart(2, '0')}`,
        name,
        gender,
        branch: branches[i % branches.length] ?? 'CSE',
        risk: risks[i] ?? 'medium',
      },
      inst,
      shift,
    ),
  )
  return [...lead, ...rows]
}

const CACHE = new Map<string, StudentRow[]>()

/**
 * Sample rows for a college. pce-purnea -> PCE_STUDENTS; other colleges get a seeded reshuffle
 * mapped to their branches (gp-muzaffarpur starts with Rahul). Unknown ids -> [].
 */
export function studentsFor(collegeId: string | null | undefined): StudentRow[] {
  if (!collegeId) return []
  // Always a fresh array, so callers may sort/filter in place without reordering shared data.
  if (collegeId === 'pce-purnea') return PCE_STUDENTS.slice()
  const hit = CACHE.get(collegeId)
  if (hit) return hit.slice()
  const inst = institutionById(collegeId)
  if (!inst) return []
  const rows = buildFor(inst)
  CACHE.set(collegeId, rows)
  return rows.slice()
}

const SKILL_CACHE = new Map<string, BranchSkillMatrix>()

/** Branch × skill heatmap (pillar scale). pce-purnea -> PCE_BRANCH_SKILL; others are seeded. */
export function branchSkillFor(collegeId: string | null | undefined): BranchSkillMatrix {
  if (!collegeId || collegeId === 'pce-purnea') return PCE_BRANCH_SKILL
  const hit = SKILL_CACHE.get(collegeId)
  if (hit) return hit
  const inst = institutionById(collegeId)
  if (!inst) return PCE_BRANCH_SKILL
  const R = rng(hashStr(`${collegeId}:skill`))
  const rows = inst.branches.filter((x) => x !== 'MNC')
  const base = inst.pri - 3
  const values = rows.map((br) =>
    SKILL_COLS.map((col) => {
      let v = base + R.normal(0, 4)
      if (col === 'communication') v -= 9
      if (col === inst.topGap) v -= 7
      const mech = br === 'ME' || br === 'D-ME' || br === 'D-AUTO'
      if (col === 'cad' && mech) v -= 8
      if ((col === 'dsa' || col === 'sql' || col === 'python') && br.startsWith('D-')) v -= 8
      if ((col === 'dsa' || col === 'python') && (br === 'CSE' || br === 'AI')) v += 5
      if (col === 'plc' && (br === 'CSE' || br === 'AI')) v -= 6
      if (col === 'core' && br.startsWith('D-')) v += 3
      return Math.round(clamp(v, 30, 82))
    }),
  )
  const m: BranchSkillMatrix = { rows, cols: [...SKILL_COLS], values }
  SKILL_CACHE.set(collegeId, m)
  return m
}
