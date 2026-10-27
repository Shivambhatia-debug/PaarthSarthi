// 13 upcoming campus / pool drives. Sector titles only: no company names anywhere (rule 12).
// Counts are illustrative; d1 and d2 numbers are fixed, the rest are seeded within sensible pools.
import { batchOf, institutionById } from '@/lib/mock/institutions'
import { allocate, rng } from '@/lib/mock/seed'
import { DEMO_TODAY } from '@/lib/mock/state'
import type { BranchCode, Drive, PersonaId, PersonaRunId } from '@/lib/mock/types'

const ALL_BRANCHES: BranchCode[] = [
  'CSE',
  'ECE',
  'EE',
  'ME',
  'CE',
  'AI',
  'MNC',
  'D-ME',
  'D-EE',
  'D-CE',
  'D-ECE',
  'D-AUTO',
  'D-FS',
]

const D2_INSTITUTIONS = [
  'gp-muzaffarpur',
  'gwp-muzaffarpur',
  'gp-vaishali',
  'gp-samastipur',
  'gp-darbhanga',
  'gp-sitamarhi',
  'gp-east-champaran',
  'gp-saran',
  'gp-purnia',
  'mit-muzaffarpur',
  'pce-purnea',
]

const D10_INSTITUTIONS = ['pce-purnea', 'kec-katihar', 'spnrec-araria', 'gec-kishanganj']

type DriveSeed = Omit<Drive, 'eligibleCount' | 'readyCount'> & { eligibleCount?: number; readyCount?: number }

const SEEDS: DriveSeed[] = [
  {
    id: 'd1',
    title: {
      en: 'IT services mass-recruiter drive (NQT-style)',
      hi: 'IT सेवा मास-रिक्रूटर ड्राइव (NQT-शैली)',
    },
    blueprintId: 'tcs-nqt-style',
    hostInstitutionId: 'pce-purnea',
    date: '2026-11-14',
    tier: 'Day-1',
    branches: ['CSE', 'ECE', 'EE'],
    pool: false,
    open: false,
    institutionIds: ['pce-purnea'],
    eligibleCount: 142,
    readyCount: 51,
    stage: 'Registration',
    eligibleFor: ['priya'],
  },
  {
    id: 'd2',
    title: { en: 'Auto-OEM-style core pool drive', hi: 'ऑटो-OEM-शैली कोर पूल ड्राइव' },
    blueprintId: 'core-mech-oem-style',
    hostInstitutionId: 'gp-muzaffarpur',
    date: '2026-11-18',
    tier: 'Core',
    branches: ['ME', 'D-ME', 'D-AUTO'],
    pool: true,
    open: false,
    institutionIds: D2_INSTITUTIONS,
    eligibleCount: 640,
    readyCount: 412,
    stage: 'Announced',
    eligibleFor: ['rahul'],
  },
  {
    id: 'd3',
    title: { en: 'Electronics manufacturing pool drive', hi: 'इलेक्ट्रॉनिक्स निर्माण पूल ड्राइव' },
    blueprintId: 'core-elec-power-style',
    hostInstitutionId: 'bce-bakhtiyarpur',
    date: '2026-11-21',
    tier: 'Regular',
    branches: ['ECE', 'EE', 'D-ECE', 'D-EE'],
    pool: true,
    open: true,
    institutionIds: ['bce-bakhtiyarpur'],
    stage: 'Registration',
    eligibleFor: ['priya'],
  },
  {
    id: 'd4',
    title: { en: 'Power/EPC-style core drive', hi: 'पावर/EPC-शैली कोर ड्राइव' },
    blueprintId: 'core-elec-power-style',
    hostInstitutionId: 'mit-muzaffarpur',
    date: '2026-11-25',
    tier: 'Core',
    branches: ['EE', 'ECE', 'D-EE'],
    pool: false,
    open: true,
    institutionIds: ['mit-muzaffarpur'],
    stage: 'Announced',
    eligibleFor: ['priya'],
  },
  {
    id: 'd5',
    title: { en: 'IT services drive, Magadh cluster', hi: 'IT सेवा ड्राइव, मगध क्लस्टर' },
    blueprintId: 'cognizant-genc-style',
    hostInstitutionId: 'gce-gaya',
    date: '2026-11-28',
    tier: 'Regular',
    branches: ['CSE', 'ECE', 'EE', 'AI'],
    pool: false,
    open: true,
    institutionIds: ['gce-gaya'],
    stage: 'Announced',
    eligibleFor: ['priya'],
  },
  {
    id: 'd6',
    title: { en: 'Construction/Civil core drive', hi: 'निर्माण/सिविल कोर ड्राइव' },
    blueprintId: 'core-civil-style',
    hostInstitutionId: 'bce-bhagalpur',
    date: '2026-12-02',
    tier: 'Core',
    branches: ['CE', 'D-CE'],
    pool: false,
    open: true,
    institutionIds: ['bce-bhagalpur'],
    stage: 'Announced',
    eligibleFor: [],
  },
  {
    id: 'd7',
    title: {
      en: 'IT consulting drive (communication-eliminatory pattern)',
      hi: 'IT कंसल्टिंग ड्राइव (संवाद-निर्णायक पैटर्न)',
    },
    blueprintId: 'accenture-style',
    hostInstitutionId: 'dce-darbhanga',
    date: '2026-12-05',
    tier: 'Regular',
    branches: ['CSE', 'ECE', 'EE', 'ME', 'CE', 'AI'],
    pool: false,
    open: true,
    institutionIds: ['dce-darbhanga'],
    stage: 'Announced',
    eligibleFor: ['priya'],
  },
  {
    id: 'd8',
    title: { en: 'Bihar MSME hiring mela (illustrative)', hi: 'बिहार MSME भर्ती मेला (उदाहरणात्मक)' },
    hostInstitutionId: 'gp-patna',
    date: '2026-12-09',
    tier: 'Regular',
    branches: ALL_BRANCHES,
    pool: false,
    open: true,
    institutionIds: ['gp-patna'],
    stage: 'Announced',
    eligibleFor: ['priya', 'rahul'],
  },
  {
    id: 'd9',
    title: { en: 'Telecom / network field-engineer drive', hi: 'टेलीकॉम / नेटवर्क फ़ील्ड-इंजीनियर ड्राइव' },
    blueprintId: 'wipro-nth-style',
    hostInstitutionId: 'lnjpit-chapra',
    date: '2026-12-11',
    tier: 'Regular',
    branches: ['ECE', 'EE', 'D-ECE'],
    pool: false,
    open: true,
    institutionIds: ['lnjpit-chapra'],
    stage: 'Announced',
    eligibleFor: ['priya'],
  },
  {
    id: 'd10',
    title: { en: 'Embedded / IoT startup pool drive', hi: 'एम्बेडेड / IoT स्टार्टअप पूल ड्राइव' },
    blueprintId: 'infosys-se-style',
    hostInstitutionId: 'pce-purnea',
    date: '2026-12-14',
    tier: 'Dream',
    branches: ['ECE', 'CSE', 'EE'],
    pool: true,
    open: false,
    institutionIds: D10_INSTITUTIONS,
    stage: 'Registration',
    eligibleFor: ['priya'],
  },
  {
    id: 'd11',
    title: { en: 'EV / two-wheeler service-network drive', hi: 'EV / दोपहिया सर्विस-नेटवर्क ड्राइव' },
    blueprintId: 'core-mech-oem-style',
    hostInstitutionId: 'gp-patna',
    date: '2026-12-16',
    tier: 'Core',
    branches: ['D-AUTO', 'D-ME'],
    pool: false,
    open: true,
    institutionIds: ['gp-patna'],
    stage: 'Announced',
    eligibleFor: ['rahul'],
  },
  {
    id: 'd12',
    title: { en: 'Product-company OA-style drive', hi: 'प्रोडक्ट-कंपनी OA-शैली ड्राइव' },
    blueprintId: 'amazon-oa-style',
    hostInstitutionId: 'bce-bakhtiyarpur',
    date: '2026-12-18',
    tier: 'Dream',
    branches: ['CSE', 'ECE', 'AI'],
    pool: false,
    open: true,
    institutionIds: ['bce-bakhtiyarpur'],
    stage: 'Announced',
    eligibleFor: [],
    stretchFor: [{ persona: 'priya', reason: { en: 'Unlocks after DSA +10', hi: 'DSA +10 के बाद खुलेगा' } }],
  },
  {
    id: 'd13',
    title: {
      en: 'Railway-signalling / metro-systems drive (illustrative)',
      hi: 'रेलवे-सिग्नलिंग / मेट्रो-सिस्टम ड्राइव (उदाहरणात्मक)',
    },
    blueprintId: 'core-elec-power-style',
    hostInstitutionId: 'dce-darbhanga',
    date: '2026-12-21',
    tier: 'Regular',
    branches: ['ECE', 'EE', 'D-ECE', 'D-EE'],
    pool: false,
    open: true,
    institutionIds: ['dce-darbhanga'],
    stage: 'Announced',
    eligibleFor: ['priya'],
  },
]

function sumBatch(ids: string[], key: 'onboarded' | 'interviewReady'): number {
  let s = 0
  for (const id of ids) {
    const inst = institutionById(id)
    if (inst) s += batchOf(inst)[key]
  }
  return s
}

function buildDrives(): Drive[] {
  const R = rng(1314)
  return SEEDS.map((d) => {
    if (d.eligibleCount != null && d.readyCount != null) return d as Drive
    let eligibleCount: number
    if (!d.open) {
      // Closed pool: a share of the participating colleges' Batch 2027.
      eligibleCount = Math.round(sumBatch(d.institutionIds, 'onboarded') * (0.38 + R.next() * 0.08))
    } else {
      // Open drive: state-wide, branch-limited. Kept to a few hundred.
      const width = Math.min(1, d.branches.length / 6)
      eligibleCount = Math.round((180 + R.int(0, 300) * width) / 5) * 5
    }
    const readyCount = Math.round(eligibleCount * (0.3 + R.next() * 0.12))
    return { ...d, eligibleCount, readyCount }
  })
}

export const DRIVES: Drive[] = buildDrives()

const BY_ID = new Map(DRIVES.map((d) => [d.id, d]))

export function driveById(id: string | null | undefined): Drive | undefined {
  return id ? BY_ID.get(id) : undefined
}

const byDate = (a: Drive, b: Drive) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id)

/** Upcoming drives the persona is eligible for, by date. Priya 9, Rahul 3. */
export function drivesFor(personaId: PersonaId | PersonaRunId | null | undefined): Drive[] {
  if (!personaId) return []
  return DRIVES.filter((d) => d.date >= DEMO_TODAY && (d.eligibleFor as string[]).includes(personaId)).sort(byDate)
}

/** Upcoming drives that unlock for the persona after a gap closes (see drive.stretchFor[].reason). */
export function stretchDrivesFor(personaId: PersonaId | PersonaRunId | null | undefined): Drive[] {
  if (!personaId) return []
  return DRIVES.filter((d) => d.date >= DEMO_TODAY && (d.stretchFor ?? []).some((s) => s.persona === personaId)).sort(
    byDate,
  )
}

/** 'before' = eligible drives on the diagnostic date (Priya: 2 on 6 Oct); 'now' is computed. */
export const DRIVE_COUNTS: Record<PersonaRunId, { before: number | null; now: number }> = {
  priya: { before: 2, now: drivesFor('priya').length },
  rahul: { before: null, now: drivesFor('rahul').length },
}

/** Upcoming drives visible to an institution: open or including it, with a branch overlap. */
export function drivesForInstitution(instId: string | null | undefined): Drive[] {
  const inst = institutionById(instId)
  if (!inst) return []
  const mine = new Set(inst.branches)
  return DRIVES.filter(
    (d) =>
      d.date >= DEMO_TODAY &&
      (d.open || d.institutionIds.includes(inst.id)) &&
      d.branches.some((b) => mine.has(b)),
  ).sort(byDate)
}

function buildPoolContrib(): Record<string, number> {
  const d2 = BY_ID.get('d2')
  if (!d2) return {}
  const ids = d2.institutionIds.filter((id) => !!institutionById(id))
  const weights = ids.map((id) => batchOf(institutionById(id)!).interviewReady)
  const parts = allocate(d2.readyCount, weights)
  const out: Record<string, number> = {}
  ids.forEach((id, i) => (out[id] = parts[i]))
  return out
}

/** Interview-ready contribution of each d2 institution; sums to d2.readyCount (412). */
export const POOL_CONTRIB: Record<string, number> = buildPoolContrib()

/** Ready pool for a selection of institutions; equals 412 for d2's default selection. */
export function poolReady(ids: readonly string[] | null | undefined): number {
  if (!ids) return 0
  let s = 0
  for (const id of new Set(ids)) {
    const c = POOL_CONTRIB[id]
    if (typeof c === 'number') {
      s += c
      continue
    }
    const inst = institutionById(id)
    if (inst) s += Math.round(batchOf(inst).interviewReady * 0.35)
  }
  return s
}
