// 84 institutions (38 GECs + 46 polytechnics), seeded with rng(2026) and back-solved so every
// aggregate matches PREVIEW / FIXED_DISTRICT_PRI exactly (fixes 21, 22, 23).
// Institution names are indicative (verify); the polytechnic mapping is illustrative.
// All metrics are ILLUSTRATIVE pilot data, not an assessment of any institution.
import type { Lang } from '@/lib/os/i18n'
import { DISTRICT_GEO } from '@/lib/mock/geo'
import { FIXED_DISTRICT_PRI, PREVIEW } from '@/lib/mock/state'
import { allocate, clamp, rng } from '@/lib/mock/seed'
import type { BatchMetrics, BranchCode, DistrictGeo, DistrictId, Institution, SkillKey } from '@/lib/mock/types'

export const TPO_SUPPORTED_COLLEGES: string[] = ['pce-purnea', 'mit-muzaffarpur', 'gce-gaya', 'gp-muzaffarpur']

// ---------------------------------------------------------------------------
// Static roster
// ---------------------------------------------------------------------------

// Known GEC names per district (indicative; verify). [id, name, short]
const GEC_KNOWN: Record<string, [string, string, string]> = {
  patna: ['bce-bakhtiyarpur', 'Bakhtiyarpur College of Engineering', 'BCE Bakhtiyarpur'],
  muzaffarpur: ['mit-muzaffarpur', 'Muzaffarpur Institute of Technology', 'MIT Muzaffarpur'],
  bhagalpur: ['bce-bhagalpur', 'Bhagalpur College of Engineering', 'BCE Bhagalpur'],
  gaya: ['gce-gaya', 'Gaya College of Engineering', 'Gaya CE'],
  nalanda: ['nce-chandi', 'Nalanda College of Engineering, Chandi', 'NCE Chandi'],
  darbhanga: ['dce-darbhanga', 'Darbhanga College of Engineering', 'DCE Darbhanga'],
  'east-champaran': ['mce-motihari', 'Motihari College of Engineering', 'MCE Motihari'],
  saran: ['lnjpit-chapra', 'Loknayak Jai Prakash Institute of Technology, Chapra', 'LNJPIT Chapra'],
  purnia: ['pce-purnea', 'Purnea College of Engineering', 'Purnea CE'],
  supaul: ['sce-supaul', 'Supaul College of Engineering', 'SCE Supaul'],
  katihar: ['kec-katihar', 'Katihar Engineering College', 'KEC Katihar'],
  saharsa: ['sce-saharsa', 'Saharsa College of Engineering', 'SCE Saharsa'],
  sitamarhi: ['sit-sitamarhi', 'Sitamarhi Institute of Technology', 'SIT Sitamarhi'],
  rohtas: ['sec-sasaram', 'Shershah Engineering College, Sasaram', 'SEC Sasaram'],
  begusarai: [
    'rrsdce-begusarai',
    'Rashtrakavi Ramdhari Singh Dinkar College of Engineering',
    'RRSDCE Begusarai',
  ],
  madhepura: ['bpmce-madhepura', 'B.P. Mandal College of Engineering', 'BPMCE Madhepura'],
  araria: ['spnrec-araria', 'Shri Phanishwar Nath Renu Engineering College', 'SPNREC Araria'],
}

const AI_PROGRAM_2026 = new Set([
  'bce-bakhtiyarpur',
  'mit-muzaffarpur',
  'gce-gaya',
  'lnjpit-chapra',
  'sce-supaul',
  'dce-darbhanga',
  'gec-munger',
  'pce-purnea',
  'bce-bhagalpur',
  'mce-motihari',
])

/** The 8 oldest colleges; every other institution is 'newer'. */
const OLDEST = new Set([
  'mit-muzaffarpur',
  'bce-bhagalpur',
  'nce-chandi',
  'gce-gaya',
  'dce-darbhanga',
  'mce-motihari',
  'lnjpit-chapra',
  'bce-bakhtiyarpur',
])

const WOMEN_POLY_DISTRICTS = ['patna', 'muzaffarpur', 'bhagalpur', 'gaya', 'darbhanga', 'saharsa']

const LOW_DIVISIONS = new Set(['Kosi', 'Purnia', 'Darbhanga'])
const COMM_GAP_DIVISIONS = new Set(['Purnia', 'Kosi'])
const GAP_POOL: SkillKey[] = ['communication', 'dsa', 'cad', 'aptitude', 'core']

const PRI_LO = 44
const PRI_HI = 74

interface Draft {
  id: string
  name: string
  short: string
  type: 'GEC' | 'GP'
  women: boolean
  geo: DistrictGeo
  newer: boolean
  aiProgram2026: boolean
  branches: BranchCode[]
  finalYear: number
  pri: number
  gain: number
  girls: number
  activity: number
  tpoActivity: number
  topGap: SkillKey
  code: string
  override: boolean
  onboarded: number
  weeklyActive: number
  interviewReady: number
  atRisk: number
  offers: number
  priBaseline: number
  priTrend: number[]
}

function roster(): Omit<
  Draft,
  | 'finalYear'
  | 'pri'
  | 'gain'
  | 'girls'
  | 'activity'
  | 'tpoActivity'
  | 'topGap'
  | 'code'
  | 'onboarded'
  | 'weeklyActive'
  | 'interviewReady'
  | 'atRisk'
  | 'offers'
  | 'priBaseline'
  | 'priTrend'
  | 'branches'
>[] {
  const out: ReturnType<typeof roster> = []
  // 38 GECs, one per district, grid order.
  for (const g of DISTRICT_GEO) {
    const known = GEC_KNOWN[g.id]
    const id = known ? known[0] : `gec-${g.id}`
    out.push({
      id,
      name: known ? known[1] : `Government Engineering College, ${g.name}`,
      short: known ? known[2] : `GEC ${g.name}`,
      type: 'GEC',
      women: false,
      geo: g,
      newer: !OLDEST.has(id),
      aiProgram2026: AI_PROGRAM_2026.has(id),
      override: id === 'pce-purnea',
    })
  }
  // 38 district polytechnics.
  for (const g of DISTRICT_GEO) {
    const id = `gp-${g.id}`
    out.push({
      id,
      name: `Government Polytechnic, ${g.name}`,
      short: `GP ${g.name}`,
      type: 'GP',
      women: false,
      geo: g,
      newer: true,
      aiProgram2026: false,
      override: id === 'gp-muzaffarpur',
    })
  }
  // 8 more polytechnics.
  const patna = DISTRICT_GEO.find((d) => d.id === 'patna')!
  out.push({
    id: 'ngp-patna-13',
    name: 'New Government Polytechnic, Patna-13',
    short: 'NGP Patna-13',
    type: 'GP',
    women: false,
    geo: patna,
    newer: true,
    aiProgram2026: false,
    override: false,
  })
  out.push({
    id: 'gp-patna-7',
    name: 'Government Polytechnic, Patna-7',
    short: 'GP Patna-7',
    type: 'GP',
    women: false,
    geo: patna,
    newer: true,
    aiProgram2026: false,
    override: false,
  })
  for (const did of WOMEN_POLY_DISTRICTS) {
    const g = DISTRICT_GEO.find((d) => d.id === did)!
    out.push({
      id: `gwp-${did}`,
      name: `Government Women's Polytechnic, ${g.name}`,
      short: `GWP ${g.name}`,
      type: 'GP',
      women: true,
      geo: g,
      newer: true,
      aiProgram2026: false,
      override: false,
    })
  }
  return out
}

// ---------------------------------------------------------------------------
// Seeding + back-solve
// ---------------------------------------------------------------------------

function wmean(list: Draft[], get: (d: Draft) => number): number {
  let s = 0
  let w = 0
  for (const d of list) {
    s += d.onboarded * get(d)
    w += d.onboarded
  }
  return w > 0 ? s / w : 0
}

/**
 * Shift `movers` by one common delta (each clamped to [PRI_LO, PRI_HI]) so the onboarded-weighted
 * mean of pri over `scope` (movers ⊆ scope) equals target. Monotone in delta -> bisection.
 */
function shiftToMean(scope: Draft[], movers: Draft[], target: number): void {
  if (movers.length === 0) return
  const moverSet = new Set(movers)
  const base = movers.map((d) => d.pri)
  let W = 0
  let fixedSum = 0
  for (const d of scope) {
    W += d.onboarded
    if (!moverSet.has(d)) fixedSum += d.onboarded * d.pri
  }
  if (W <= 0) return
  const meanAt = (delta: number) => {
    let s = fixedSum
    for (let i = 0; i < movers.length; i++) s += movers[i].onboarded * clamp(base[i] + delta, PRI_LO, PRI_HI)
    return s / W
  }
  let lo = -60
  let hi = 60
  for (let it = 0; it < 200; it++) {
    const mid = (lo + hi) / 2
    if (meanAt(mid) < target) lo = mid
    else hi = mid
  }
  const delta = (lo + hi) / 2
  movers.forEach((d, i) => {
    d.pri = clamp(base[i] + delta, PRI_LO, PRI_HI)
  })
}

function starsFor(pri: number): 1 | 2 | 3 | 4 | 5 {
  if (pri < 50) return 1
  if (pri < 55) return 2
  if (pri < 60) return 3
  if (pri < 66) return 4
  return 5
}

function build(): Institution[] {
  const R = rng(2026)
  const base = roster()

  // 1. Raw values (fixed rng consumption order).
  const drafts: Draft[] = base.map((b) => {
    let branches: BranchCode[]
    if (b.type === 'GEC') {
      branches = ['CSE', 'ECE', 'EE', 'ME', 'CE']
      if (b.aiProgram2026) branches.push('AI')
    } else if (b.women) {
      branches = ['D-ECE', 'D-EE', 'D-CE', 'D-ME', 'D-FS']
    } else {
      branches = ['D-ME', 'D-EE', 'D-CE']
      if (R.next() < 0.55) branches.push('D-ECE')
      if (R.next() < 0.3) branches.push('D-AUTO')
      if (R.next() < 0.15) branches.push('D-FS')
    }
    const coreHeavy = b.type === 'GP' && !branches.includes('D-ECE')
    // Women's polytechnics sit at the low end of the GP range (smaller intakes), which keeps
    // district girls-share figures plausible.
    const finalYear = b.type === 'GEC' ? R.int(150, 320) : b.women ? R.int(120, 160) : R.int(120, 260)
    let pri = b.type === 'GEC' ? R.normal(60, 5) : R.normal(58, 5)
    if (b.newer) pri -= 4
    if (LOW_DIVISIONS.has(b.geo.division)) pri -= 3
    if (coreHeavy) pri -= 2
    const gain = 6 + R.next() * 9
    const girls = b.women ? 100 : b.type === 'GEC' ? 22 + R.next() * 12 : 18 + R.next() * 12
    const activity = 0.8 + R.next() * 0.4
    const tpoActivity = R.int(40, 95)
    const pickedGap = R.pick(GAP_POOL)
    const topGap: SkillKey = COMM_GAP_DIVISIONS.has(b.geo.division) ? 'communication' : pickedGap
    return {
      ...b,
      branches,
      finalYear,
      pri: clamp(pri, PRI_LO, PRI_HI),
      gain,
      girls,
      activity,
      tpoActivity,
      topGap,
      code: '',
      onboarded: 0,
      weeklyActive: 0,
      interviewReady: 0,
      atRisk: 0,
      offers: 0,
      priBaseline: 0,
      priTrend: [],
    }
  })

  // Stable pseudonym codes, seeded shuffled order.
  const gecs = drafts.filter((d) => d.type === 'GEC')
  const gps = drafts.filter((d) => d.type === 'GP')
  const eCodes = R.shuffle(gecs.map((_, i) => `E-${String(i + 1).padStart(2, '0')}`))
  const pCodes = R.shuffle(gps.map((_, i) => `P-${String(i + 1).padStart(2, '0')}`))
  gecs.forEach((d, i) => (d.code = eCodes[i]))
  gps.forEach((d, i) => (d.code = pCodes[i]))

  // 2. Individual overrides (kept out of every shift / scale).
  const pce = drafts.find((d) => d.id === 'pce-purnea')!
  Object.assign(pce, {
    finalYear: 268,
    pri: 54,
    priBaseline: 43.8,
    onboarded: 498,
    weeklyActive: 330,
    interviewReady: 104,
    atRisk: 71,
    offers: 34,
    girls: 29.5,
    topGap: 'communication' as SkillKey,
    branches: ['CSE', 'ECE', 'EE', 'ME', 'CE'] as BranchCode[],
    tpoActivity: 74,
  })
  const gpm = drafts.find((d) => d.id === 'gp-muzaffarpur')!
  Object.assign(gpm, {
    finalYear: 240,
    pri: 63,
    topGap: 'cad' as SkillKey,
    branches: ['D-ME', 'D-AUTO', 'D-EE', 'D-CE'] as BranchCode[],
  })

  const others = drafts.filter((d) => d !== pce)

  // 3. Onboarded (pre-final + final year).
  const onb = allocate(
    PREVIEW.onboarded - pce.onboarded,
    others.map((d) => d.finalYear * 1.6),
  )
  others.forEach((d, i) => (d.onboarded = onb[i]))

  // 4. Back-solve each fixed district via its free (non-override) institutions.
  const byDistrict = new Map<DistrictId, Draft[]>()
  for (const d of drafts) {
    const arr = byDistrict.get(d.geo.id) ?? []
    arr.push(d)
    byDistrict.set(d.geo.id, arr)
  }
  const fixedIds = Object.keys(FIXED_DISTRICT_PRI)
  for (const did of fixedIds) {
    const scope = byDistrict.get(did) ?? []
    shiftToMean(
      scope,
      scope.filter((d) => !d.override),
      FIXED_DISTRICT_PRI[did],
    )
  }

  // 5. State mean 58.4 via non-fixed districts; lift free districts below 53.0; repeat.
  //    Polish (deviation, keeps every invariant): a lifted district lands a little ABOVE the
  //    floor (53.2-54.1, seeded per district) so the map never shows a wall of identical 53.0s,
  //    and free districts are kept below the capital (> 65.5 is eased to 64.6-65.5).
  const freeDistricts = DISTRICT_GEO.map((g) => g.id).filter((id) => !(id in FIXED_DISTRICT_PRI))
  const free = drafts.filter((d) => !(d.geo.id in FIXED_DISTRICT_PRI))
  const FLOOR = 53.0
  const CEIL = 65.5
  const jitter = (did: string) => (DISTRICT_GEO.findIndex((g) => g.id === did) * 37 % 10) / 10
  for (let iter = 0; iter < 10; iter++) {
    shiftToMean(drafts, free, PREVIEW.avgPri)
    let moved = false
    for (const did of freeDistricts) {
      const scope = byDistrict.get(did) ?? []
      const m = wmean(scope, (d) => d.pri)
      if (m < FLOOR - 1e-9) {
        shiftToMean(scope, scope, FLOOR + 0.2 + jitter(did))
        moved = true
      } else if (m > CEIL + 1e-9) {
        shiftToMean(scope, scope, CEIL - 0.9 + jitter(did))
        moved = true
      }
    }
    if (!moved) break
  }
  // Final pass guarantees the state mean exactly (any residual floor drift is ~1e-3).
  shiftToMean(drafts, free, PREVIEW.avgPri)

  // 6. Baseline: scale gains of non-override institutions so the weighted baseline is 47.2.
  pce.gain = pce.pri - pce.priBaseline
  const W = drafts.reduce((s, d) => s + d.onboarded, 0)
  const sumWPri = drafts.reduce((s, d) => s + d.onboarded * d.pri, 0)
  const scaled = drafts.filter((d) => !d.override)
  const fixedGain = drafts.filter((d) => d.override).reduce((s, d) => s + d.onboarded * d.gain, 0)
  const scaledGain = scaled.reduce((s, d) => s + d.onboarded * d.gain, 0)
  const gainK = (sumWPri - PREVIEW.baselinePri * W - fixedGain) / scaledGain
  for (const d of scaled) d.gain *= gainK
  for (const d of drafts) if (d !== pce) d.priBaseline = d.pri - d.gain

  // 7. Girls share 31.8 (scale non-women, non-override institutions by one factor).
  const girlScaled = drafts.filter((d) => !d.women && !d.override)
  const girlFixed = drafts.filter((d) => d.women || d.override).reduce((s, d) => s + d.onboarded * d.girls, 0)
  const girlBase = girlScaled.reduce((s, d) => s + d.onboarded * d.girls, 0)
  const girlK = (PREVIEW.girlsPct * W - girlFixed) / girlBase
  for (const d of girlScaled) d.girls = clamp(d.girls * girlK, 0, 100)

  // 8. Counts for non-pce institutions.
  const wa = allocate(
    PREVIEW.weeklyActive - pce.weeklyActive,
    others.map((d) => d.onboarded * d.activity),
  )
  const rOf = (d: Draft) => clamp((d.pri - 40) / 40, 0.1, 0.9)
  const ir = allocate(
    PREVIEW.interviewReady - pce.interviewReady,
    others.map((d) => d.onboarded * rOf(d)),
  )
  const ar = allocate(
    PREVIEW.atRisk - pce.atRisk,
    others.map((d) => d.onboarded * (1 - rOf(d))),
  )
  others.forEach((d, i) => {
    d.weeklyActive = wa[i]
    d.interviewReady = ir[i]
    d.atRisk = ar[i]
  })
  const of = allocate(
    PREVIEW.offersAndInternships - pce.offers,
    others.map((d) => d.interviewReady),
  )
  others.forEach((d, i) => (d.offers = of[i]))

  // 9. priTrend: 6 points baseline -> pri with a small seeded wobble; last point = pri.
  for (const d of drafts) {
    const pts: number[] = []
    for (let k = 0; k < 6; k++) {
      if (k === 0) pts.push(d.priBaseline)
      else if (k === 5) pts.push(d.pri)
      else {
        const f = k / 5
        const eased = f * (0.85 + 0.15 * f)
        const v = d.priBaseline + (d.pri - d.priBaseline) * eased + R.normal(0, 0.45)
        pts.push(Math.round(v * 10) / 10)
      }
    }
    d.priTrend = pts
  }

  // 10. Output.
  return drafts.map<Institution>((d) => ({
    id: d.id,
    name: d.name,
    short: d.short,
    type: d.type,
    women: d.women,
    districtId: d.geo.id,
    newer: d.newer,
    aiProgram2026: d.aiProgram2026,
    finalYear: d.finalYear,
    onboarded: d.onboarded,
    weeklyActive: d.weeklyActive,
    interviewReady: d.interviewReady,
    atRisk: d.atRisk,
    offers: d.offers,
    pri: d.pri,
    priBaseline: d.priBaseline,
    priTrend: d.priTrend,
    girlsPct: d.girls,
    stars: starsFor(d.pri),
    topGap: d.topGap,
    branches: d.branches,
    tpoActivity: d.tpoActivity,
    code: d.code,
  }))
}

export const INSTITUTIONS: Institution[] = build()

const BY_ID = new Map(INSTITUTIONS.map((i) => [i.id, i]))

export function institutionById(id: string | null | undefined): Institution | undefined {
  return id ? BY_ID.get(id) : undefined
}

/** GEC first, then polytechnics, in roster order. */
export function institutionsByDistrict(districtId: DistrictId): Institution[] {
  return INSTITUTIONS.filter((i) => i.districtId === districtId)
}

// ---------------------------------------------------------------------------
// Batch 2027 (final year) view used by the TPO console (fix 23)
// ---------------------------------------------------------------------------
const PCE_BATCH: BatchMetrics = {
  batch: '2027',
  finalYear: 268,
  onboarded: 241,
  weeklyActive: 172,
  interviewReady: 63,
  atRisk: 37,
  offers: 21,
  pri: 54,
  priBaseline: 43.8,
}

export function batchOf(inst: Institution): BatchMetrics {
  if (inst.id === 'pce-purnea') return { ...PCE_BATCH }
  const onboarded = Math.min(inst.onboarded, Math.round(inst.finalYear * 0.9))
  const ratio = inst.onboarded > 0 ? onboarded / inst.onboarded : 0
  const part = (n: number) => Math.min(n, Math.floor(n * ratio))
  return {
    batch: '2027',
    finalYear: inst.finalYear,
    onboarded,
    weeklyActive: part(inst.weeklyActive),
    interviewReady: part(inst.interviewReady),
    atRisk: part(inst.atRisk),
    offers: part(inst.offers),
    pri: inst.pri,
    priBaseline: inst.priBaseline,
  }
}

/** 'Engineering college · Purnia division · E-07' / 'पॉलिटेक्निक · कोसी प्रमंडल · P-31'. */
export function pseudonymFor(inst: Institution, lang: Lang): string {
  const g = DISTRICT_GEO.find((d) => d.id === inst.districtId)
  if (lang === 'hi') {
    const kind = inst.type === 'GEC' ? 'इंजीनियरिंग कॉलेज' : 'पॉलिटेक्निक'
    return `${kind} · ${g?.divisionHi ?? ''} प्रमंडल · ${inst.code}`
  }
  const kind = inst.type === 'GEC' ? 'Engineering college' : 'Polytechnic'
  return `${kind} · ${g?.division ?? ''} division · ${inst.code}`
}
