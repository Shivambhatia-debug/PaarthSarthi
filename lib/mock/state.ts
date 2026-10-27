// State-level constants for ParthSarthi Placement OS.
// CONSTANTS ONLY: no runtime imports from other lib/mock files (avoids import cycles).
// Everything except REPORTED / SOURCES is ILLUSTRATIVE pilot data.
import { fmtDate } from '@/lib/os/i18n'
import type { Bi } from '@/lib/os/i18n'
import type {
  BranchCode,
  DistrictId,
  ReportedPoint,
  SkillKey,
  SourceRef,
  TrustItem,
} from '@/lib/mock/types'

// ---------------------------------------------------------------------------
// Dates. If the pitch moves, change ONLY this constant.
// ---------------------------------------------------------------------------
export const DEMO_TODAY = '2026-10-27'

const DAY_MS = 86_400_000

function isoToUTC(iso: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!m) return NaN
  return Date.UTC(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10))
}

function utcToIso(t: number): string {
  return new Date(t).toISOString().slice(0, 10)
}

/** ISO date n days before DEMO_TODAY (negative n gives a future date). */
export function isoDaysBefore(n: number): string {
  return utcToIso(isoToUTC(DEMO_TODAY) - Math.round(n) * DAY_MS)
}

/** Whole days from a to b (b − a). */
export function daysBetween(a: string, b: string): number {
  const d = (isoToUTC(b) - isoToUTC(a)) / DAY_MS
  return Number.isFinite(d) ? Math.round(d) : 0
}

/** Whole days from DEMO_TODAY to iso (positive = in the future). */
export function daysFromToday(iso: string): number {
  return daysBetween(DEMO_TODAY, iso)
}

function isoWeek(iso: string): number {
  const t = isoToUTC(iso)
  const d = new Date(t)
  const dow = d.getUTCDay() || 7 // Mon=1..Sun=7
  const thursday = t + (4 - dow) * DAY_MS
  const yearStart = Date.UTC(new Date(thursday).getUTCFullYear(), 0, 1)
  return Math.ceil(((thursday - yearStart) / DAY_MS + 1) / 7)
}

const WEEK_NO = isoWeek(DEMO_TODAY)

/** 'Week 44 · 27 Oct 2026' */
export const WEEK_LABEL: Bi = {
  en: `Week ${WEEK_NO} · ${fmtDate(DEMO_TODAY, 'en', { year: true })}`,
  hi: `सप्ताह ${WEEK_NO} · ${fmtDate(DEMO_TODAY, 'hi', { year: true })}`,
}

// The frontend is hosted on Netlify (DEPLOYMENT.md); paarthsarthi.vercel.app is the Express API.
// Change only this constant if the frontend host differs.
export const PUBLIC_DEMO_URL = 'https://paarthsarthi.netlify.app/placement-os/'
export const QR_IMAGE_PATH = '/os/qr-placement-os.png'

// ---------------------------------------------------------------------------
// Sources (for the "As reported" figures only)
// ---------------------------------------------------------------------------
export const SOURCES: Record<'im' | 'pp' | 'isr' | 'apna' | 'aipolicy' | 'budget', SourceRef> = {
  im: {
    label: 'Indian Masterminds',
    url: 'https://indianmasterminds.com/news/bihar-government-technical-education-236101/',
  },
  pp: {
    label: 'Patna Press',
    url: 'https://patnapress.com/bihar-technical-colleges-campus-placements-15246-jobs/',
  },
  isr: { label: 'India Skills Report 2026' },
  apna: { label: 'Apna Interview Readiness Index 2025' },
  aipolicy: { label: 'ZeeBiz / Patna Press, AI Policy 2026' },
  budget: { label: 'Patna Press, Budget 2026' },
}

// ---------------------------------------------------------------------------
// REPORTED: figures as reported in public sources (tag 'reported')
// ---------------------------------------------------------------------------
export interface Reported {
  placements: ReportedPoint[]
  split2025: { engineering: number; polytechnic: number; altEngineering: number; altPolytechnic: number }
  institutions: { gec: number; gp: number }
  seats2026: {
    btech: { filled: number; total: number; pct: number }
    diploma: { filled: number; total: number; pct: number }
  }
  engEnrolment2022Pct: number
  coeTrained: number
  aiPolicy: { target5yr: number; perYear: number }
  aiLabLakhPerCollege: number
  facultyPostsPending: number
  girlsSeatReservationPct: number
  interviewReadyNationalPct: number
  freshersReadyPct: number
  tier3ReadyPct: number
  polytechnicEmployabilityPct: number
}

export const REPORTED: Reported = {
  placements: [
    { year: '2020-21', value: 1700 },
    { year: '2021-22', value: 4681 },
    { year: '2022-23', value: 4944 },
    { year: '2023-24', value: 8197 },
    { year: '2024-25', value: 11178 },
    {
      year: '2025-26',
      value: 15246,
      high: 20477,
      note: 'Sources differ: 15,246 (Patna Press, May 2026, later report) vs 20,477 (Indian Masterminds)',
    },
  ],
  split2025: { engineering: 4745, polytechnic: 10501, altEngineering: 5832, altPolytechnic: 14645 },
  institutions: { gec: 38, gp: 46 },
  seats2026: {
    btech: { filled: 14331, total: 15183, pct: 94.39 },
    diploma: { filled: 16897, total: 17227, pct: 98.08 },
  },
  engEnrolment2022Pct: 66,
  coeTrained: 26700,
  aiPolicy: { target5yr: 500000, perYear: 100000 },
  aiLabLakhPerCollege: 30,
  facultyPostsPending: 1239,
  girlsSeatReservationPct: 33,
  interviewReadyNationalPct: 32,
  freshersReadyPct: 21,
  tier3ReadyPct: 26,
  polytechnicEmployabilityPct: 32.92,
}

// ---------------------------------------------------------------------------
// PREVIEW: illustrative platform-preview numbers (single source of truth)
// ---------------------------------------------------------------------------
export interface FunnelStage {
  id: string
  stage: Bi
  /** alias of stage */
  label: Bi
  value: number
}

export interface MonthPoint {
  /** 'YYYY-MM' */
  month: string
  label: Bi
  value: number
}

export interface BranchRiskRow {
  branch: BranchCode
  label: Bi
  /** % of students below PRI 50 */
  below50Pct: number
  atRisk: number
}

export interface InputRow {
  id: 'fsp' | 'st' | 'google' | 'coe'
  label: Bi
  /** headline count for the row */
  value: number
  /** what the count measures */
  unit: Bi
  /** out-of total, when the value is a coverage count (google: 61 of 84) */
  total?: number
  /** avg PRI uplift of participants vs non-participants (illustrative) */
  upliftPri?: number
  tag: 'illustrative' | 'reported'
  // Named aliases of `value` / `total` (same numbers), for readability at call sites.
  enrolments?: number
  certificates?: number
  covered?: number
  trainees?: number
  reported?: boolean
}

export interface DemandSupplyRow {
  id: string
  sector: Bi
  /** alias of sector */
  label: Bi
  roles: number
  ready: number
}

export interface IntegrationRow {
  id: string
  name: string
  status: 'Integration-ready' | 'Planned'
  note: Bi
}

export interface Preview {
  asOf: Bi
  institutions: number
  onboarded: number
  onboardedLabel: Bi
  weeklyActive: number
  weeklyActivePct: number
  avgPri: number
  baselinePri: number
  aiInterviews: number
  mockDrives: number
  interviewReady: number
  atRisk: number
  atRiskMentored: number
  offersAndInternships: number
  girlsPct: number
  girlsTargetPct: number
  consentPct: number
  aiTrainedThisYear: number
  aiTrainedTargetYear: number
  aiTrainedByMonth: MonthPoint[]
  today: { aiInterviews: number; newlyReady: number }
  weekDelta: {
    onboarded: number
    weeklyActivePp: number
    avgPri: number
    aiInterviews: number
    interviewReady: number
    offers: number
  }
  funnel: FunnelStage[]
  branchSkill: { rows: BranchCode[]; cols: SkillKey[]; values: number[][] }
  branchRisk: BranchRiskRow[]
  inputs: { fsp: InputRow; st: InputRow; google: InputRow; coe: InputRow }
  demandSupply: DemandSupplyRow[]
  inclusion: {
    girlsPri: number
    boysPri: number
    ruralPri: number
    urbanPri: number
    hindiMediumContent: number
    hindiMediumEnglish: number
    englishMediumContent: number
  }
  integrations: IntegrationRow[]
  projection2026: { low: number; high: number; label: Bi }
}

export const PREVIEW: Preview = {
  asOf: WEEK_LABEL,
  institutions: 84,
  onboarded: 48620,
  onboardedLabel: {
    en: 'Students onboarded (pre-final + final year)',
    hi: 'जुड़े छात्र (प्री-फ़ाइनल + फ़ाइनल वर्ष)',
  },
  weeklyActive: 31204,
  weeklyActivePct: 64.2,
  avgPri: 58.4,
  baselinePri: 47.2,
  aiInterviews: 112480,
  mockDrives: 1240,
  interviewReady: 14930,
  atRisk: 9870,
  atRiskMentored: 3120,
  offersAndInternships: 6412,
  girlsPct: 31.8,
  girlsTargetPct: 33,
  consentPct: 98.7,
  aiTrainedThisYear: 38460,
  aiTrainedTargetYear: 100000,
  aiTrainedByMonth: [
    { month: '2026-06', label: { en: 'Jun', hi: 'जून' }, value: 2140 },
    { month: '2026-07', label: { en: 'Jul', hi: 'जुलाई' }, value: 4860 },
    { month: '2026-08', label: { en: 'Aug', hi: 'अगस्त' }, value: 6920 },
    { month: '2026-09', label: { en: 'Sep', hi: 'सितंबर' }, value: 9780 },
    { month: '2026-10', label: { en: 'Oct', hi: 'अक्टूबर' }, value: 14760 },
  ],
  today: { aiInterviews: 3214, newlyReady: 96 },
  weekDelta: {
    onboarded: 1180,
    weeklyActivePp: 2.1,
    avgPri: 1.4,
    aiInterviews: 18640,
    interviewReady: 612,
    offers: 214,
  },
  funnel: [
    { id: 'registered', stage: { en: 'Registered', hi: 'पंजीकृत' }, label: { en: 'Registered', hi: 'पंजीकृत' }, value: 48620 },
    { id: 'diagnosed', stage: { en: 'Diagnosed', hi: 'डायग्नोस्टिक पूरा' }, label: { en: 'Diagnosed', hi: 'डायग्नोस्टिक पूरा' }, value: 45310 },
    {
      id: 'trained',
      stage: { en: 'Trained (FSP / Spoken Tutorial hours)', hi: 'प्रशिक्षित (FSP / स्पोकन ट्यूटोरियल घंटे)' },
      label: { en: 'Trained (FSP / Spoken Tutorial hours)', hi: 'प्रशिक्षित (FSP / स्पोकन ट्यूटोरियल घंटे)' },
      value: 33870,
    },
    {
      id: 'ready',
      stage: { en: 'Interview-ready (PRI ≥ 70)', hi: 'इंटरव्यू के लिए तैयार (PRI ≥ 70)' },
      label: { en: 'Interview-ready (PRI ≥ 70)', hi: 'इंटरव्यू के लिए तैयार (PRI ≥ 70)' },
      value: 14930,
    },
    { id: 'applied', stage: { en: 'Applied', hi: 'आवेदन किया' }, label: { en: 'Applied', hi: 'आवेदन किया' }, value: 11240 },
    { id: 'shortlisted', stage: { en: 'Shortlisted', hi: 'शॉर्टलिस्ट' }, label: { en: 'Shortlisted', hi: 'शॉर्टलिस्ट' }, value: 7960 },
    { id: 'offer', stage: { en: 'Offer or internship', hi: 'ऑफ़र या इंटर्नशिप' }, label: { en: 'Offer or internship', hi: 'ऑफ़र या इंटर्नशिप' }, value: 6412 },
    { id: 'joined', stage: { en: 'Joined', hi: 'जॉइन किया' }, label: { en: 'Joined', hi: 'जॉइन किया' }, value: 4980 },
  ],
  // Pillar scale (0-100). Mechanical (ME, D-ME) weakest in CAD; Civil weak in aptitude;
  // communication column 40-52.
  branchSkill: {
    rows: ['CSE', 'ECE', 'EE', 'ME', 'CE', 'D-ME', 'D-EE', 'D-AUTO', 'D-FS'],
    cols: ['aptitude', 'dsa', 'sql', 'python', 'core', 'cad', 'plc', 'communication', 'excel'],
    values: [
      [63, 57, 62, 66, 60, 48, 45, 50, 64], // CSE
      [60, 51, 52, 55, 58, 47, 54, 44, 58], // ECE
      [58, 48, 49, 51, 57, 50, 56, 47, 57], // EE
      [55, 45, 46, 47, 56, 38, 49, 46, 53], // ME
      [44, 46, 47, 48, 53, 49, 46, 45, 52], // CE
      [52, 42, 43, 44, 55, 37, 50, 42, 48], // D-ME
      [53, 41, 42, 43, 56, 46, 55, 43, 49], // D-EE
      [54, 42, 43, 44, 58, 42, 51, 44, 47], // D-AUTO
      [51, 43, 44, 45, 52, 45, 44, 41, 55], // D-FS
    ],
  },
  branchRisk: [
    { branch: 'CE', label: { en: 'Civil', hi: 'सिविल' }, below50Pct: 54, atRisk: 2140 },
    { branch: 'ME', label: { en: 'Mechanical', hi: 'मैकेनिकल' }, below50Pct: 47, atRisk: 1980 },
    { branch: 'D-CE', label: { en: 'Diploma Civil', hi: 'डिप्लोमा सिविल' }, below50Pct: 44, atRisk: 1460 },
    {
      branch: 'D-ME',
      label: { en: 'Diploma Mechanical', hi: 'डिप्लोमा मैकेनिकल' },
      below50Pct: 41,
      atRisk: 1390,
    },
    { branch: 'EE', label: { en: 'Electrical', hi: 'इलेक्ट्रिकल' }, below50Pct: 33, atRisk: 1120 },
    { branch: 'ECE', label: { en: 'Electronics & Comm.', hi: 'इलेक्ट्रॉनिक्स एवं संचार' }, below50Pct: 29, atRisk: 980 },
    { branch: 'CSE', label: { en: 'Computer Science', hi: 'कंप्यूटर साइंस' }, below50Pct: 21, atRisk: 800 },
  ],
  inputs: {
    fsp: {
      id: 'fsp',
      label: { en: 'NASSCOM FutureSkills Prime', hi: 'NASSCOM फ्यूचरस्किल्स प्राइम' },
      value: 12840,
      enrolments: 12840,
      unit: { en: 'enrolments', hi: 'नामांकन' },
      upliftPri: 9.4,
      tag: 'illustrative',
    },
    st: {
      id: 'st',
      label: { en: 'IIT Bombay Spoken Tutorial', hi: 'IIT बॉम्बे स्पोकन ट्यूटोरियल' },
      value: 21560,
      certificates: 21560,
      unit: { en: 'certificates', hi: 'प्रमाणपत्र' },
      upliftPri: 6.1,
      tag: 'illustrative',
    },
    google: {
      id: 'google',
      label: { en: 'Google skilling MoU', hi: 'Google स्किलिंग MoU' },
      value: 61,
      covered: 61,
      total: 84,
      unit: { en: 'institutions covered', hi: 'संस्थान शामिल' },
      tag: 'illustrative',
    },
    coe: {
      id: 'coe',
      label: { en: 'Centres of Excellence', hi: 'सेंटर ऑफ़ एक्सीलेंस' },
      value: 26700,
      trainees: 26700,
      reported: true,
      unit: { en: 'trainees (as reported)', hi: 'प्रशिक्षु (रिपोर्ट के अनुसार)' },
      tag: 'reported',
    },
  },
  // Used only by Ask answers.
  demandSupply: [
    { id: 'it', sector: { en: 'IT services', hi: 'IT सेवाएँ' }, label: { en: 'IT services', hi: 'IT सेवाएँ' }, roles: 6200, ready: 5140 },
    { id: 'auto', sector: { en: 'Auto / core', hi: 'ऑटो / कोर' }, label: { en: 'Auto / core', hi: 'ऑटो / कोर' }, roles: 2850, ready: 3960 },
    { id: 'power', sector: { en: 'Power / EPC', hi: 'पावर / EPC' }, label: { en: 'Power / EPC', hi: 'पावर / EPC' }, roles: 1400, ready: 980 },
    { id: 'emfg', sector: { en: 'Electronics mfg', hi: 'इलेक्ट्रॉनिक्स निर्माण' }, label: { en: 'Electronics mfg', hi: 'इलेक्ट्रॉनिक्स निर्माण' }, roles: 1100, ready: 720 },
    { id: 'civil', sector: { en: 'Civil', hi: 'सिविल' }, label: { en: 'Civil', hi: 'सिविल' }, roles: 1600, ready: 640 },
    { id: 'msme', sector: { en: 'Bihar MSMEs', hi: 'बिहार MSME' }, label: { en: 'Bihar MSMEs', hi: 'बिहार MSME' }, roles: 900, ready: 1490 },
  ],
  // Used only by Ask answers.
  inclusion: {
    girlsPri: 57.1,
    boysPri: 59.0,
    ruralPri: 56.2,
    urbanPri: 61.9,
    hindiMediumContent: 71,
    hindiMediumEnglish: 46,
    englishMediumContent: 74,
  },
  integrations: [
    {
      id: 'digilocker',
      name: 'DigiLocker / APAAR',
      status: 'Integration-ready',
      note: { en: 'Verified marksheets and credentials', hi: 'सत्यापित अंकपत्र और प्रमाणपत्र' },
    },
    {
      id: 'bhashini',
      name: 'Bhashini (ASR/TTS)',
      status: 'Integration-ready',
      note: { en: 'India-hosted speech for Hindi interviews', hi: 'हिंदी इंटरव्यू के लिए भारत में होस्टेड स्पीच' },
    },
    {
      id: 'fsp',
      name: 'NASSCOM FSP import',
      status: 'Planned',
      note: { en: 'Course completions into the readiness profile', hi: 'कोर्स पूर्णता सीधे प्रोफ़ाइल में' },
    },
    {
      id: 'spoken-tutorial',
      name: 'Spoken Tutorial import',
      status: 'Planned',
      note: { en: 'Certificates into the readiness profile', hi: 'प्रमाणपत्र सीधे प्रोफ़ाइल में' },
    },
    {
      id: 'internship-bihar',
      name: 'internship.bihar.gov.in',
      status: 'Planned',
      note: { en: 'Internship listings and applications', hi: 'इंटर्नशिप सूची और आवेदन' },
    },
    {
      id: 'rozgar-setu',
      name: 'Rozgar Setu',
      status: 'Planned',
      note: { en: 'State job-linkage portal', hi: 'राज्य रोज़गार पोर्टल' },
    },
    {
      id: 'ncs-sidh',
      name: 'NCS / SIDH',
      status: 'Planned',
      note: { en: 'National career and skilling portals', hi: 'राष्ट्रीय करियर और कौशल पोर्टल' },
    },
  ],
  projection2026: {
    low: 22000,
    high: 26500,
    label: {
      en: 'Illustrative scenario with readiness uplift, not a forecast',
      hi: 'तैयारी में सुधार के साथ उदाहरणात्मक परिदृश्य, पूर्वानुमान नहीं',
    },
  },
}

/** District PRIs the back-solve must hit exactly (unfiltered districtPriMap). */
export const FIXED_DISTRICT_PRI: Record<DistrictId, number> = {
  patna: 66.8,
  muzaffarpur: 63.2,
  gaya: 57.9,
  purnia: 52.6,
  madhubani: 49.8,
}

// ---------------------------------------------------------------------------
// Trust & governance commitments (fix 51)
// ---------------------------------------------------------------------------
export const TRUST_COMMITMENTS: TrustItem[] = [
  {
    id: 'data-owner',
    label: { en: 'Data owned by DSTTE', hi: 'डेटा का स्वामित्व DSTTE के पास' },
    detail: {
      en: 'All student data in the pilot is owned by DSTTE, Bihar. ParthSarthi acts as a data processor.',
      hi: 'पायलट में सभी छात्र डेटा का स्वामित्व DSTTE, बिहार के पास रहेगा। ParthSarthi केवल डेटा प्रोसेसर होगा।',
    },
    status: 'pilot-condition',
  },
  {
    id: 'consent',
    label: { en: 'DPDP purpose-specific consent', hi: 'DPDP उद्देश्य-विशिष्ट सहमति' },
    detail: {
      en: 'Purpose-specific consent under the DPDP Act; verifiable parental consent for under-18s.',
      hi: 'DPDP अधिनियम के तहत उद्देश्य-विशिष्ट सहमति; 18 वर्ष से कम के लिए सत्यापन योग्य अभिभावक सहमति।',
    },
    status: 'pilot-condition',
  },
  {
    id: 'grievance',
    label: { en: 'Grievance Officer', hi: 'शिकायत अधिकारी' },
    detail: {
      en: 'Grievance Officer named at pilot start; acknowledgement within 48 hours; resolution within the DPDP Rules 2025 timeline (verify).',
      hi: 'पायलट शुरू होने पर शिकायत अधिकारी नामित; 48 घंटे में पावती; DPDP नियम 2025 की समय-सीमा में समाधान (पुष्टि करें)।',
    },
    status: 'pilot-condition',
  },
  {
    id: 'hosting',
    label: { en: 'India-region hosting', hi: 'भारत में होस्टिंग' },
    detail: {
      en: 'India-region hosting on MeghRaj/NIC or a MeitY-empanelled cloud, to be confirmed.',
      hi: 'MeghRaj/NIC या MeitY-सूचीबद्ध क्लाउड पर भारत में होस्टिंग, पुष्टि होनी बाकी।',
    },
    status: 'pilot-condition',
  },
  {
    id: 'audit',
    label: { en: 'CERT-In security audit', hi: 'CERT-In सुरक्षा ऑडिट' },
    detail: {
      en: 'CERT-In-empanelled security audit before go-live.',
      hi: 'लाइव होने से पहले CERT-In-सूचीबद्ध एजेंसी से सुरक्षा ऑडिट।',
    },
    status: 'pilot-condition',
  },
  {
    id: 'access',
    label: { en: 'GIGW 3.0 · WCAG 2.1 AA', hi: 'GIGW 3.0 · WCAG 2.1 AA' },
    detail: {
      en: 'GIGW 3.0 and WCAG 2.1 AA accessibility; Hindi content marked lang=hi. Formal audit planned.',
      hi: 'GIGW 3.0 और WCAG 2.1 AA सुलभता; हिंदी सामग्री lang=hi से चिह्नित। औपचारिक ऑडिट प्रस्तावित।',
    },
    status: 'planned',
  },
  {
    id: 'rbac',
    label: { en: 'Role-based access + audit log', hi: 'भूमिका-आधारित पहुँच + ऑडिट लॉग' },
    detail: {
      en: 'Names appear only in the college view; the State sees aggregates with a minimum cell of 20.',
      hi: 'नाम केवल कॉलेज व्यू में; राज्य केवल कुल आँकड़े देखता है (न्यूनतम सेल 20)।',
    },
    status: 'in-place',
  },
  {
    id: 'ai-gov',
    label: { en: 'No automated selection', hi: 'कोई स्वचालित चयन नहीं' },
    detail: {
      en: 'AI recommends, people decide: every score has a Why? and human review.',
      hi: 'AI सुझाव देता है, निर्णय मनुष्य लेते हैं: हर स्कोर के साथ "क्यों?" और मानवीय समीक्षा।',
    },
    status: 'in-place',
  },
  {
    id: 'exit',
    label: { en: 'Exit clause', hi: 'निकास प्रावधान' },
    detail: {
      en: 'Exit clause with full data export and verified deletion.',
      hi: 'पूरा डेटा निर्यात और सत्यापित विलोपन के साथ निकास प्रावधान।',
    },
    status: 'pilot-condition',
  },
  {
    id: 'speech',
    label: { en: 'Speech services', hi: 'स्पीच सेवाएँ' },
    detail: {
      en: 'Demo uses the browser speech service; production uses Bhashini ASR/TTS, India-hosted, with no audio stored.',
      hi: 'डेमो में ब्राउज़र की स्पीच सेवा; प्रोडक्शन में भाषिणी ASR/TTS, भारत में होस्टेड, कोई ऑडियो संग्रहीत नहीं।',
    },
    status: 'planned',
  },
]

// ---------------------------------------------------------------------------
// Consent text (fix 48): pilot conditions, never stated as fact.
// ---------------------------------------------------------------------------
export const CONSENT_TEXT: { college: Bi; school: Bi } = {
  college: {
    en: 'I agree that my scores and interview transcript are used only for placement readiness. My college T&P officer sees my name; the State sees only aggregates. In the pilot, data will be owned by DSTTE and hosted in India (to be confirmed). I can withdraw at any time and ask for deletion. Grievances go to the Grievance Officer named at pilot start.',
    hi: 'मैं सहमत हूँ कि मेरे अंक और इंटरव्यू ट्रांसक्रिप्ट केवल प्लेसमेंट तैयारी के लिए उपयोग होंगे। मेरे कॉलेज के T&P अधिकारी मेरा नाम देख सकते हैं; राज्य केवल कुल आँकड़े देखेगा। पायलट में डेटा का स्वामित्व DSTTE के पास होगा और इसे भारत में होस्ट किया जाएगा (पुष्टि होनी बाकी)। मैं कभी भी सहमति वापस लेकर डेटा हटाने को कह सकता/सकती हूँ। शिकायत: पायलट शुरू होने पर नामित शिकायत अधिकारी।',
    hinglish:
      'Main agree karta/karti hoon ki mere scores aur interview transcript sirf placement readiness ke liye use honge. Mere college ke T&P officer mera naam dekh sakte hain; State sirf aggregate data dekhega. Pilot mein data DSTTE ka hoga aur India mein host hoga (confirm hona baaki hai). Main kabhi bhi consent wapas lekar data delete karne ko keh sakta/sakti hoon. Shikayat: pilot shuru hone par named Grievance Officer.',
  },
  school: {
    hi: 'मैं, अभिभावक, सहमति देता/देती हूँ कि मेरे बच्चे के उत्तर केवल करियर मार्गदर्शन के लिए उपयोग होंगे। पायलट की शर्त: डेटा भारत में होस्ट होगा (पुष्टि होनी बाकी) और विभाग के स्वामित्व में रहेगा। मैं कभी भी सहमति वापस ले सकता/सकती हूँ।',
    en: "I, the parent or guardian, consent to my child's answers being used only for career guidance. Pilot condition: data will be hosted in India (to be confirmed) and owned by the Department. I can withdraw consent at any time.",
  },
}

export const SPEECH_NOTE: Bi = {
  en: 'Demo uses your browser speech service. Production: Bhashini, India-hosted.',
  hi: 'डेमो में ब्राउज़र की स्पीच सेवा उपयोग हो रही है। प्रोडक्शन में: भाषिणी, भारत में होस्टेड।',
}

export const SIMULATED_RANKING_NOTE: Bi = {
  en: 'Simulated ranking, not an assessment of any institution',
  hi: 'सिम्युलेटेड रैंकिंग — किसी संस्थान का आकलन नहीं',
}
