// Shared mock-data types for ParthSarthi Placement OS. Type-only module.
import type { Bi } from '@/lib/os/i18n'

export type { Bi }

/** Kebab-case district slug, e.g. 'purnia', 'west-champaran'. */
export type DistrictId = string

export type PersonaId = 'priya' | 'rahul' | 'nusrat'
export type PersonaRunId = 'priya' | 'rahul'

export type SkillKey =
  | 'aptitude'
  | 'dsa'
  | 'sql'
  | 'python'
  | 'core'
  | 'cad'
  | 'plc'
  | 'communication'
  | 'excel'

export type BranchCode =
  | 'CSE'
  | 'ECE'
  | 'EE'
  | 'ME'
  | 'CE'
  | 'AI'
  | 'MNC'
  | 'D-ME'
  | 'D-EE'
  | 'D-CE'
  | 'D-ECE'
  | 'D-AUTO'
  | 'D-FS'

export interface DistrictGeo {
  id: DistrictId
  name: string
  nameHi: string
  /** English division name, e.g. 'Purnia'. Matches DIVISIONS[].name. */
  division: string
  divisionHi: string
  row: number
  col: number
  northOfGanga: boolean
  aspirational: boolean
}

export interface District extends DistrictGeo {
  pri: number
  priBaseline: number
  /** 6 points, baseline -> pri. */
  priTrend: number[]
  studentsAssessed: number
  weeklyActive: number
  interviewReady: number
  atRisk: number
  girlsPct: number
  topGap: SkillKey
  institutionIds: string[]
}

/** Pre-final + final year cohort. */
export interface CohortMetrics {
  onboarded: number
  weeklyActive: number
  interviewReady: number
  atRisk: number
  offers: number
}

export interface Institution extends CohortMetrics {
  id: string
  name: string
  short: string
  type: 'GEC' | 'GP'
  women: boolean
  districtId: DistrictId
  newer: boolean
  aiProgram2026: boolean
  finalYear: number
  /** Full precision; format for display. */
  pri: number
  priBaseline: number
  priTrend: number[]
  girlsPct: number
  stars: 1 | 2 | 3 | 4 | 5
  topGap: SkillKey
  branches: BranchCode[]
  /** 0-100 */
  tpoActivity: number
  /** Stable pseudonym code like 'E-07' or 'P-31'. */
  code: string
}

/** Batch 2027 (final year only). */
export interface BatchMetrics extends CohortMetrics {
  batch: '2027'
  finalYear: number
  pri: number
  priBaseline: number
}

export type PillarKey =
  | 'aptitude'
  | 'technical'
  | 'communication'
  | 'techInterview'
  | 'hr'
  | 'resume'
  | 'integrity'

export type Pillars = Record<PillarKey, number>

export interface Attempt {
  id: string
  /** ISO date YYYY-MM-DD */
  date: string
  label: Bi
  pillars: Pillars
  pri: number
  /** Versant-style 20-80 */
  versant: number
  content: number
  delivery: number
}

export interface Credential {
  id: string
  label: string
  issuer: string
  status: 'verified' | 'integration-ready'
}

export interface Persona {
  id: PersonaId
  name: string
  nameHi: string
  gender: 'F' | 'M'
  kind: 'engineering' | 'polytechnic' | 'school'
  institutionId?: string
  districtId: DistrictId
  branch?: BranchCode
  branchLabel: string
  batch?: string
  classLevel?: number
  medium: 'Hindi' | 'English'
  firstGen: boolean
  cgpa?: number
  tenth?: number
  twelfth?: number
  diplomaPct?: number
  activeBacklogs?: number
  gapYears?: number
  apaarMasked: string
  credentials: Credential[]
  project?: { title: string; summary: Bi; keywords: string[] }
  attempts: Attempt[]
  defaultBlueprintId?: string
  avatarInitials: string
}

export interface StudentRow {
  id: string
  name: string
  gender: 'F' | 'M'
  branch: BranchCode
  institutionId: string
  cgpa: number
  tenth: number
  /** For diploma rows this holds the diploma % (no 12th). */
  twelfth: number
  activeBacklogs: number
  gapYears: number
  pri: number
  priPrev: number
  pillars: Pillars
  risk: 'high' | 'medium' | 'low'
  riskReasons: Bi[]
  lastActiveDays: number
  medium: 'Hindi' | 'English'
  rural: boolean
  skills: string[]
  status: 'recovered' | 'improving' | 'stalled' | 'new'
}

export interface BlueprintSection {
  name: string
  questions: number
  minutes: number
  sectionalCutoff?: number
  negativeMarking: boolean
  canRevisit: boolean
  eliminatory: boolean
}

export interface Blueprint {
  id: string
  /** Ends in '-style' or names a sector. */
  label: string
  track: 'it' | 'product' | 'core-mech' | 'core-elec' | 'core-civil'
  sections: BlueprintSection[]
  typicalBand: string
  demoPaceNote: string
  eligibility: {
    minCgpa: number
    maxActiveBacklogs: number
    min10th: number
    min12th: number
    maxGapYears: number
    minDiplomaPct?: number
  }
  commPolicy: 'eliminatory' | 'advisory'
  footnote: string
}

export type DriveStage = 'Announced' | 'Registration' | 'Assessment' | 'Interview' | 'Offer'
export type DriveTier = 'Day-1' | 'Dream' | 'Regular' | 'Core'

export interface Drive {
  id: string
  /** Sector only, never a company name. */
  title: Bi
  blueprintId?: string
  hostInstitutionId: string
  /** ISO date */
  date: string
  tier: DriveTier
  branches: BranchCode[]
  pool: boolean
  open: boolean
  institutionIds: string[]
  eligibleCount: number
  readyCount: number
  stage: DriveStage
  eligibleFor: PersonaRunId[]
  stretchFor?: { persona: PersonaRunId; reason: Bi }[]
}

export interface Scheme {
  id: string
  name: Bi
  audience: 'college' | 'school' | 'both'
  amount: Bi
  status: 'open' | 'upcoming' | 'paused'
  deadline?: string
  verify: boolean
  docs: Bi[]
  portalLabel: string
  rule: Bi
  matchFor: PersonaId[]
  matchNote?: Partial<Record<PersonaId, Bi>>
}

export interface TickerEvent {
  id: string
  districtId: DistrictId
  /** Never contains a personal name. */
  text: Bi
  kind: 'interview' | 'ready' | 'drive' | 'offer' | 'school'
}

export interface SourceRef {
  label: string
  url?: string
}

export interface ReportedPoint {
  year: string
  value: number
  high?: number
  note?: string
}

export interface TrustItem {
  id: string
  label: Bi
  detail: Bi
  status: 'pilot-condition' | 'in-place' | 'planned'
}
