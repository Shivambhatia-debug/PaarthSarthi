// School feeder (/schools) content: RIASEC cards, NMMS-MAT-style items, paths, Sarthi Didi Q&A,
// Yojana Radar matching and copy. Pure data + tiny pure helpers (no React).
// Hindi is written simple and natural for a Class 10 student and her parents.
// Every number here is ILLUSTRATIVE pilot data unless it is imported from lib/mock.
import {
  Calculator,
  CircuitBoard,
  ClipboardList,
  FlaskConical,
  Megaphone,
  Microscope,
  Music,
  Palette,
  Presentation,
  Stethoscope,
  Store,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { fmtINR, type Bi } from '@/lib/os/i18n'
import type { KeywordSpec } from '@/lib/ai-sim'
import { DEMO_TODAY, REPORTED } from '@/lib/mock/state'
import { NUSRAT_PROFILE } from '@/lib/mock/personas'
import { INSTITUTIONS } from '@/lib/mock/institutions'
import { SCHEMES } from '@/lib/mock/schemes'
import type { Scheme } from '@/lib/mock/types'

export type SchoolLang = 'hi' | 'en'
export type StepId = 1 | 2 | 3 | 4 | 5 | 6

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** '₹10,000' / '₹4 lakh' (en) or '₹10,000' / '₹4 लाख' (hi). */
export function inr(n: number, lang: SchoolLang): string {
  const s = fmtINR(n)
  return lang === 'hi' ? s.replace('lakh', 'लाख').replace('Cr', 'करोड़') : s
}

/** Devanagari-friendly speech text: spells out Latin acronyms and reads ₹ amounts as रुपये. */
export function ttsHi(text: string): string {
  if (!text) return ''
  const map: [RegExp, string][] = [
    [/INSPIRE-MANAK/g, 'इंस्पायर मानक'],
    [/DCECE/g, 'डी सी ई सी ई'],
    [/BCECEB/g, 'बी सी ई सी ई बी'],
    [/BCECE/g, 'बी सी ई सी ई'],
    [/B\.Tech/g, 'बी टेक'],
    [/B\.Com/g, 'बी कॉम'],
    [/\bJEE\b/g, 'जे ई ई'],
    [/\bPCM\b/g, 'पी सी एम'],
    [/\bITI\b/g, 'आई टी आई'],
    [/\bBSEB\b/g, 'बी एस ई बी'],
    [/\bAPAAR\b/g, 'अपार'],
    [/\bScience\b/g, 'साइंस'],
    [/\bArts\b/g, 'आर्ट्स'],
    [/\bCommerce\b/g, 'कॉमर्स'],
    [/\bPolytechnic\b/gi, 'पॉलिटेक्निक'],
  ]
  let out = text
  for (const [re, rep] of map) out = out.replace(re, rep)
  // ₹10,000 -> 10,000 रुपये ; ₹4 लाख -> 4 लाख रुपये
  out = out.replace(/₹\s?([\d,]+(?:\.\d+)?(?:\s?(?:लाख|करोड़))?)/g, '$1 रुपये')
  out = out.replace(/(\d+)%/g, '$1 प्रतिशत')
  return out.replace(/\s+/g, ' ').trim()
}

const DEMO_YEAR = parseInt(DEMO_TODAY.slice(0, 4), 10) || 2026

// ---------------------------------------------------------------------------
// Shell copy
// ---------------------------------------------------------------------------

export const STEPS: { id: StepId; label: Bi }[] = [
  { id: 1, label: { en: 'Login', hi: 'लॉगिन' } },
  { id: 2, label: { en: 'Disha Test', hi: 'दिशा टेस्ट' } },
  { id: 3, label: { en: 'My Shakti Report', hi: 'मेरी शक्ति रिपोर्ट' } },
  { id: 4, label: { en: 'My Path', hi: 'मेरा रास्ता' } },
  { id: 5, label: { en: 'Sarthi Didi', hi: 'सारथी दीदी' } },
  { id: 6, label: { en: 'Yojana Radar', hi: 'योजना रडार' } },
]

export const SCHOOL_NAME: Bi = {
  en: 'Govt +2 School, Kasba (Purnia)',
  hi: 'राजकीय +2 विद्यालय, कसबा (पूर्णिया)',
}

export const SHARED_PROFILES: { initials: string; name: Bi; active?: boolean }[] = [
  { initials: 'NP', name: { en: 'Nusrat Parveen', hi: 'नुसरत परवीन' }, active: true },
  { initials: 'RK', name: { en: 'Riya Kumari', hi: 'रिया कुमारी' } },
  { initials: 'AA', name: { en: 'Aman Alam', hi: 'अमन आलम' } },
]

// ---------------------------------------------------------------------------
// Step 1: login
// ---------------------------------------------------------------------------

export const UDISE_MOCK = { udise: '1011 •••• •07', classLevel: '10', roll: '23' }

// ---------------------------------------------------------------------------
// Step 2: Disha Test (two tiles only, fix 37)
// ---------------------------------------------------------------------------

export type RiasecKey = 'R' | 'I' | 'A' | 'S' | 'E' | 'C'
export const RIASEC_KEYS: RiasecKey[] = ['R', 'I', 'A', 'S', 'E', 'C']

export const RIASEC_LABELS: Record<RiasecKey, { short: Bi; long: Bi }> = {
  R: { short: { en: 'Realistic', hi: 'व्यावहारिक' }, long: { en: 'Realistic: hands-on, machines', hi: 'व्यावहारिक: हाथ से काम, मशीनें' } },
  I: { short: { en: 'Investigative', hi: 'खोजी' }, long: { en: 'Investigative: curious, experiments', hi: 'खोजी: जिज्ञासा, प्रयोग' } },
  A: { short: { en: 'Artistic', hi: 'रचनात्मक' }, long: { en: 'Artistic: drawing, music', hi: 'रचनात्मक: चित्र, संगीत' } },
  S: { short: { en: 'Social', hi: 'सामाजिक' }, long: { en: 'Social: helping, teaching', hi: 'सामाजिक: मदद, पढ़ाना' } },
  E: { short: { en: 'Enterprising', hi: 'उद्यमी' }, long: { en: 'Enterprising: leading, selling', hi: 'उद्यमी: अगुवाई, व्यापार' } },
  C: { short: { en: 'Conventional', hi: 'व्यवस्थित' }, long: { en: 'Conventional: accounts, records', hi: 'व्यवस्थित: हिसाब, रिकॉर्ड' } },
}

export interface RiasecCard {
  id: string
  type: RiasecKey
  Icon: LucideIcon
  label: Bi
  /** Nusrat's answer, consistent with NUSRAT_PROFILE (used by fast-forward / autopilot). */
  demoLike: boolean
}

/** 12 cards, interleaved R I A S E C so the first six cover every type. */
export const RIASEC_CARDS: RiasecCard[] = [
  { id: 'r1', type: 'R', Icon: Wrench, label: { en: 'Fixing machines', hi: 'मशीन ठीक करना' }, demoLike: true },
  { id: 'i1', type: 'I', Icon: FlaskConical, label: { en: 'Doing experiments', hi: 'प्रयोग करना' }, demoLike: true },
  { id: 'a1', type: 'A', Icon: Palette, label: { en: 'Drawing pictures', hi: 'चित्र बनाना' }, demoLike: false },
  { id: 's1', type: 'S', Icon: Presentation, label: { en: 'Teaching others', hi: 'दूसरों को पढ़ाना' }, demoLike: true },
  { id: 'e1', type: 'E', Icon: Store, label: { en: 'Running a shop', hi: 'दुकान चलाना' }, demoLike: false },
  { id: 'c1', type: 'C', Icon: Calculator, label: { en: 'Keeping accounts', hi: 'हिसाब रखना' }, demoLike: true },
  { id: 'r2', type: 'R', Icon: CircuitBoard, label: { en: 'Wiring a circuit', hi: 'बिजली का सर्किट जोड़ना' }, demoLike: true },
  {
    id: 'i2',
    type: 'I',
    Icon: Microscope,
    label: { en: 'Opening things up to see how they work', hi: 'चीज़ें खोलकर समझना कि कैसे चलती हैं' },
    demoLike: true,
  },
  { id: 'a2', type: 'A', Icon: Music, label: { en: 'Writing songs or poems', hi: 'गाना या कविता लिखना' }, demoLike: false },
  { id: 's2', type: 'S', Icon: Stethoscope, label: { en: 'Caring for the sick', hi: 'बीमार की देखभाल करना' }, demoLike: false },
  { id: 'e2', type: 'E', Icon: Megaphone, label: { en: 'Leading a team', hi: 'टीम की अगुवाई करना' }, demoLike: false },
  { id: 'c2', type: 'C', Icon: ClipboardList, label: { en: 'Keeping records in order', hi: 'रिकॉर्ड सँभालकर रखना' }, demoLike: false },
]

export type AptKey = 'numerical' | 'verbal' | 'spatial' | 'mechanical' | 'logical'
export const APT_KEYS: AptKey[] = ['numerical', 'verbal', 'spatial', 'mechanical', 'logical']

export const APT_LABELS: Record<AptKey, Bi> = {
  numerical: { en: 'Numerical', hi: 'संख्यात्मक' },
  verbal: { en: 'Verbal', hi: 'भाषा' },
  spatial: { en: 'Spatial', hi: 'आकृति व दिशा' },
  mechanical: { en: 'Mechanical', hi: 'यांत्रिक' },
  logical: { en: 'Logical', hi: 'तार्किक' },
}

/** Illustrative Class 10 averages for the comparison bars (pilot data, not a survey). */
export const APT_DISTRICT_AVG: Record<AptKey, number> = { numerical: 61, verbal: 58, spatial: 57, mechanical: 55, logical: 59 }
export const APT_STATE_AVG: Record<AptKey, number> = { numerical: 64, verbal: 61, spatial: 60, mechanical: 58, logical: 62 }

export interface AptItem {
  id: string
  skill: AptKey
  kind: Bi
  prompt: Bi
  /** Large monospace line under the prompt, e.g. a number series. */
  display?: string
  visual?: 'gears'
  options: Bi[]
  answer: number
}

const same = (s: string): Bi => ({ en: s, hi: s })

/** The four core NMMS-MAT-style items. A fifth is chosen adaptively (harder or easier). */
export const APT_ITEMS: AptItem[] = [
  {
    id: 'series',
    skill: 'numerical',
    kind: { en: 'Number series', hi: 'संख्या श्रृंखला' },
    prompt: { en: 'Which number comes next?', hi: 'अगली संख्या कौन-सी होगी?' },
    display: '2, 6, 12, 20, 30, ?',
    options: [same('36'), same('40'), same('42'), same('44')],
    answer: 2,
  },
  {
    id: 'analogy',
    skill: 'verbal',
    kind: { en: 'Analogy', hi: 'समानता' },
    prompt: { en: 'Pen : write :: knife : ?', hi: 'कलम : लिखना :: चाकू : ?' },
    options: [
      { en: 'Eat', hi: 'खाना' },
      { en: 'Cut', hi: 'काटना' },
      { en: 'Kitchen', hi: 'रसोई' },
      { en: 'Iron', hi: 'लोहा' },
    ],
    answer: 1,
  },
  {
    id: 'gears',
    skill: 'mechanical',
    kind: { en: 'Gear direction', hi: 'गियर की दिशा' },
    prompt: {
      en: 'Gear A turns clockwise. Which way will gear C turn?',
      hi: 'गियर A घड़ी की दिशा में घूम रहा है। गियर C किस दिशा में घूमेगा?',
    },
    visual: 'gears',
    options: [
      { en: 'Clockwise', hi: 'घड़ी की दिशा में' },
      { en: 'Anticlockwise', hi: 'घड़ी की उल्टी दिशा में' },
      { en: 'It will not turn', hi: 'नहीं घूमेगा' },
      { en: 'Cannot say', hi: 'कह नहीं सकते' },
    ],
    answer: 0,
  },
  {
    id: 'odd',
    skill: 'logical',
    kind: { en: 'Odd one out', hi: 'कौन अलग है' },
    prompt: { en: 'Which number is different from the others?', hi: 'कौन-सी संख्या बाकी से अलग है?' },
    display: '3, 5, 9, 11',
    options: [same('3'), same('5'), same('9'), same('11')],
    answer: 2,
  },
]

export const APT_ADAPTIVE: { harder: AptItem; easier: AptItem } = {
  harder: {
    id: 'code',
    skill: 'logical',
    kind: { en: 'Coding-decoding', hi: 'कूट-भाषा' },
    prompt: {
      en: 'If CAT = 24 (C = 3, A = 1, T = 20), then DOG = ?',
      hi: 'अगर CAT = 24 (C = 3, A = 1, T = 20), तो DOG = ?',
    },
    options: [same('24'), same('26'), same('28'), same('30')],
    answer: 1,
  },
  easier: {
    id: 'series-easy',
    skill: 'numerical',
    kind: { en: 'Number series', hi: 'संख्या श्रृंखला' },
    prompt: { en: 'Which number comes next?', hi: 'अगली संख्या कौन-सी होगी?' },
    display: '5, 10, 15, 20, ?',
    options: [same('22'), same('25'), same('30'), same('35')],
    answer: 1,
  },
}

export const SCAN_STEPS: Bi[] = [
  { en: 'Reading 12 interest cards', hi: '12 रुचि कार्ड पढ़े जा रहे हैं' },
  { en: 'Checking your answer patterns', hi: 'सवालों के जवाबों का पैटर्न देखा जा रहा है' },
  { en: 'Comparing with Class 10 students in Purnia', hi: 'पूर्णिया के कक्षा 10 के छात्रों से तुलना' },
  { en: 'Building your Shakti report', hi: 'आपकी शक्ति रिपोर्ट बन रही है' },
]

// ---------------------------------------------------------------------------
// Step 3: Meri Shakti report
// ---------------------------------------------------------------------------

export const TOP_PERCENT = 100 - NUSRAT_PROFILE.districtPercentile

export function strengthsFor(p = NUSRAT_PROFILE): Bi[] {
  const top = 100 - p.districtPercentile
  return [
    { en: 'Deep interest in machines and circuits', hi: 'मशीनों और सर्किट में गहरी रुचि' },
    {
      en: `Numerical aptitude ${p.aptitude.numerical}: top ${top}% in the district`,
      hi: `संख्यात्मक योग्यता ${p.aptitude.numerical} — ज़िले में शीर्ष ${top}%`,
    },
    { en: 'A habit of opening things up to understand them', hi: 'चीज़ों को खोलकर समझने की आदत' },
  ]
}

export function reportEvidence(p = NUSRAT_PROFILE): Bi[] {
  return [
    {
      en: 'Liked: fixing machines, wiring a circuit, opening things up',
      hi: 'पसंद किए: मशीन ठीक करना, सर्किट जोड़ना, चीज़ें खोलकर समझना',
    },
    {
      en: `Interest scores: R ${p.riasec.R} and I ${p.riasec.I} are your two highest`,
      hi: `रुचि अंक: R ${p.riasec.R} और I ${p.riasec.I} आपके दो सबसे ऊँचे`,
    },
    {
      en: `Numerical ${p.aptitude.numerical} and mechanical ${p.aptitude.mechanical} vs district averages ${APT_DISTRICT_AVG.numerical} and ${APT_DISTRICT_AVG.mechanical}`,
      hi: `संख्यात्मक ${p.aptitude.numerical} और यांत्रिक ${p.aptitude.mechanical}, ज़िले के औसत ${APT_DISTRICT_AVG.numerical} और ${APT_DISTRICT_AVG.mechanical} से ऊपर`,
    },
  ]
}

export const REPORT_CONFIDENCE = 84

// ---------------------------------------------------------------------------
// Step 4: paths
// ---------------------------------------------------------------------------

/** Approximate distance from Nusrat's home (Kasba) to GP Purnia. Illustrative. */
export const HOME_TO_GP_KM = 18

export interface PathOption {
  id: string
  fit: number
  title: Bi
  via: Bi
  careers: Bi[]
  cost: Bi
  time: Bi
  salary: Bi
  /** Institution ids from institutionsByDistrict('purnia'), nearest first. */
  institutionIds: string[]
  /** Extra non-roster chips (ITI, +2 school). */
  extraPlaces?: Bi[]
  fitNote: Bi
}

export const PATHS: PathOption[] = [
  {
    id: 'poly-ece',
    fit: 86,
    title: { en: 'Polytechnic Electronics', hi: 'पॉलिटेक्निक इलेक्ट्रॉनिक्स' },
    via: { en: 'via DCECE, right after Class 10', hi: '10वीं के बाद DCECE परीक्षा से' },
    careers: [
      { en: 'Electronics technician', hi: 'इलेक्ट्रॉनिक्स टेक्नीशियन' },
      { en: 'Junior engineer', hi: 'जूनियर इंजीनियर' },
      { en: 'Solar / mobile service engineer', hi: 'सोलर / मोबाइल सर्विस इंजीनियर' },
    ],
    cost: { en: 'Low: government polytechnic fees (verify)', hi: 'कम: सरकारी पॉलिटेक्निक की फ़ीस (पुष्टि करें)' },
    time: { en: 'First job in about 3 years', hi: 'लगभग 3 साल में पहली नौकरी' },
    salary: { en: '₹12-18k / month to start', hi: '₹12-18 हज़ार / माह, शुरुआत में' },
    institutionIds: ['gp-purnia', 'pce-purnea'],
    fitNote: { en: 'Machines + circuits + strong maths', hi: 'मशीनें + सर्किट + अच्छा गणित' },
  },
  {
    id: 'pcm',
    fit: 78,
    title: { en: 'Science (PCM) → JEE / BCECE', hi: 'साइंस (PCM) → JEE / BCECE' },
    via: { en: 'Class 11-12, then an engineering entrance', hi: '11वीं-12वीं, फिर इंजीनियरिंग प्रवेश परीक्षा' },
    careers: [
      { en: 'Engineer (B.Tech)', hi: 'इंजीनियर (B.Tech)' },
      { en: 'Scientist / research', hi: 'वैज्ञानिक / शोध' },
      { en: 'Science teacher', hi: 'विज्ञान शिक्षक' },
    ],
    cost: { en: 'Medium: 2 years +2, then a 4-year B.Tech', hi: 'मध्यम: 2 साल +2, फिर 4 साल B.Tech' },
    time: { en: 'First job in about 6 years', hi: 'लगभग 6 साल में पहली नौकरी' },
    salary: { en: '₹20-35k / month to start', hi: '₹20-35 हज़ार / माह, शुरुआत में' },
    institutionIds: ['pce-purnea'],
    fitNote: { en: 'Strong fit, but a longer and costlier road', hi: 'अच्छा मेल, पर रास्ता लंबा और महँगा' },
  },
  {
    id: 'iti',
    fit: 64,
    title: { en: 'ITI Electrician', hi: 'ITI इलेक्ट्रीशियन' },
    via: { en: 'After Class 10, 2 years', hi: '10वीं के बाद, 2 साल' },
    careers: [
      { en: 'Electrician', hi: 'इलेक्ट्रीशियन' },
      { en: 'Apprentice (power / railways)', hi: 'अप्रेंटिस (बिजली / रेलवे)' },
      { en: 'Own repair business', hi: 'अपना मरम्मत का काम' },
    ],
    cost: { en: 'Very low', hi: 'बहुत कम' },
    time: { en: 'First job in about 2 years', hi: 'लगभग 2 साल में पहली नौकरी' },
    salary: { en: '₹10-15k / month to start', hi: '₹10-15 हज़ार / माह, शुरुआत में' },
    institutionIds: [],
    extraPlaces: [{ en: 'Govt ITI, Purnia', hi: 'सरकारी ITI, पूर्णिया' }],
    fitNote: { en: 'Quick job, but uses less of your maths', hi: 'जल्दी नौकरी, पर आपके गणित का कम उपयोग' },
  },
  {
    id: 'commerce',
    fit: 41,
    title: { en: 'Commerce', hi: 'कॉमर्स' },
    via: { en: 'Class 11-12 Commerce, then B.Com', hi: '11वीं-12वीं कॉमर्स, फिर B.Com' },
    careers: [
      { en: 'Accountant', hi: 'अकाउंटेंट' },
      { en: 'Bank / insurance', hi: 'बैंक / बीमा' },
      { en: 'Own business', hi: 'अपना व्यवसाय' },
    ],
    cost: { en: 'Low to medium', hi: 'कम से मध्यम' },
    time: { en: 'First job in about 5 years', hi: 'लगभग 5 साल में पहली नौकरी' },
    salary: { en: '₹12-20k / month to start', hi: '₹12-20 हज़ार / माह, शुरुआत में' },
    institutionIds: [],
    extraPlaces: [{ en: '+2 school (Commerce)', hi: '+2 विद्यालय (कॉमर्स)' }],
    fitNote: { en: 'Your E and C interests are lower', hi: 'आपकी E और C रुचि कम है' },
  },
]

/** The streamed 'why' for path #1. Numbers come from the profile; the place from the institution roster. */
export function pathWhy(placeHi: string, placeEn: string, p = NUSRAT_PROFILE, km = HOME_TO_GP_KM): Bi {
  return {
    hi: `आपको मशीनें और सर्किट पसंद हैं (R + I), संख्यात्मक योग्यता ${p.aptitude.numerical}%; ${placeHi} में इलेक्ट्रॉनिक्स आपके घर से लगभग ${km} किमी है।`,
    en: `You like machines and circuits (R + I), with numerical aptitude of ${p.aptitude.numerical}%; ${placeEn} offers Electronics about ${km} km from your home.`,
  }
}

export function pathEvidence(p = NUSRAT_PROFILE, km = HOME_TO_GP_KM): Bi[] {
  return [
    { en: `Interest: R ${p.riasec.R}, I ${p.riasec.I} (top two)`, hi: `रुचि: R ${p.riasec.R}, I ${p.riasec.I} (सबसे ऊँची दो)` },
    {
      en: `Aptitude: numerical ${p.aptitude.numerical}, mechanical ${p.aptitude.mechanical}`,
      hi: `योग्यता: संख्यात्मक ${p.aptitude.numerical}, यांत्रिक ${p.aptitude.mechanical}`,
    },
    { en: `Distance: about ${km} km, daily travel possible`, hi: `दूरी: लगभग ${km} किमी, रोज़ आना-जाना संभव` },
    { en: 'Cost: lowest of the top two paths', hi: 'खर्च: ऊपर के दो रास्तों में सबसे कम' },
  ]
}

export const PATH_CONFIDENCE = 82

export interface TimelineStage {
  id: string
  when: Bi
  title: Bi
  detail: Bi
}

export const TIMELINE: TimelineStage[] = [
  {
    id: 'now',
    when: { en: `Now – Apr ${DEMO_YEAR + 1}`, hi: `अभी – अप्रैल ${DEMO_YEAR + 1}` },
    title: { en: 'Class 10 + DCECE preparation', hi: 'कक्षा 10 + DCECE की तैयारी' },
    detail: {
      en: 'Board exams first; 30 minutes of DCECE practice a day',
      hi: 'पहले बोर्ड परीक्षा; रोज़ 30 मिनट DCECE का अभ्यास',
    },
  },
  {
    id: 'dcece',
    when: { en: `May – Jul ${DEMO_YEAR + 1} (expected)`, hi: `मई – जुलाई ${DEMO_YEAR + 1} (अनुमानित)` },
    title: { en: 'DCECE → Govt Polytechnic, Purnia', hi: 'DCECE → सरकारी पॉलिटेक्निक, पूर्णिया' },
    detail: { en: 'Electronics branch; girls have reserved seats', hi: 'इलेक्ट्रॉनिक्स शाखा; लड़कियों के लिए आरक्षित सीटें' },
  },
  {
    id: 'diploma',
    when: { en: `${DEMO_YEAR + 1} – ${DEMO_YEAR + 4}`, hi: `${DEMO_YEAR + 1} – ${DEMO_YEAR + 4}` },
    title: { en: 'Diploma (3 years)', hi: 'डिप्लोमा (3 साल)' },
    detail: { en: 'Labs, an internship and a final-year project', hi: 'लैब, इंटर्नशिप और फ़ाइनल-ईयर प्रोजेक्ट' },
  },
  {
    id: 'then',
    when: { en: `${DEMO_YEAR + 4} onwards`, hi: `${DEMO_YEAR + 4} के बाद` },
    title: { en: 'Lateral-entry B.Tech or a job', hi: 'सीधे B.Tech के दूसरे साल में, या नौकरी' },
    detail: {
      en: 'Placement Day on ParthSarthi with the same APAAR profile',
      hi: 'उसी APAAR प्रोफ़ाइल से ParthSarthi पर प्लेसमेंट डे',
    },
  },
]

export const MICRO_TASKS: { id: string; label: Bi; done: boolean }[] = [
  { id: 't1', label: { en: '20 maths questions: algebra', hi: '20 गणित सवाल: बीजगणित' }, done: true },
  { id: 't2', label: { en: 'BSEB free coaching: 1 video on electric current', hi: 'BSEB निःशुल्क कोचिंग: विद्युत धारा का 1 वीडियो' }, done: true },
  { id: 't3', label: { en: 'DCECE past paper: 1 timed set', hi: 'DCECE पुराना पेपर: 1 सेट, समय लगाकर' }, done: false },
  {
    id: 't4',
    label: { en: 'At home: find the switch, fuse and earth wire', hi: 'घर पर: स्विच, फ़्यूज़ और अर्थ तार पहचानें' },
    done: false,
  },
]

export const STREAK_DAYS = 4

// ---------------------------------------------------------------------------
// Step 5: Sarthi Didi
// ---------------------------------------------------------------------------

export const BALIKA_AMOUNT = 10_000
export const INSPIRE_AMOUNT = 10_000
export const SCC_MAX = 400_000
const GIRLS_PCT = REPORTED.girlsSeatReservationPct
const WOMEN_POLYS = INSTITUTIONS.filter((i) => i.women).length

function portal(id: string): Bi {
  const s = SCHEMES.find((x) => x.id === id)
  const name = s?.name ?? { en: id, hi: id }
  const label = s?.portalLabel ?? ''
  return { en: `${name.en} · ${label}`, hi: `${name.hi} · ${label}` }
}

const DSTTE_SOURCE: Bi = {
  en: 'Dept of Science, Technology & Technical Education, Bihar',
  hi: 'विज्ञान, प्रावैधिकी एवं तकनीकी शिक्षा विभाग, बिहार',
}
const REPORT_SOURCE: Bi = { en: 'Your Disha Test (Shakti report)', hi: 'आपका दिशा टेस्ट (शक्ति रिपोर्ट)' }

export interface DidiQA {
  id: string
  keywords: KeywordSpec[]
  answer: Bi
  parent: Bi
  sources: Bi[]
}

const KW_POLY: KeywordSpec = {
  label: 'polytechnic',
  aliases: ['polytechnic', 'पॉलिटेक्निक', 'पोलिटेक्निक', 'पालिटेक्निक', 'पॉलीटेक्निक', 'पोलीटेक्निक', 'diploma', 'डिप्लोमा', 'dcece'],
}
const KW_ENGINEER: KeywordSpec = {
  label: 'engineer',
  aliases: ['engineer', 'engineering', 'इंजीनियर', 'इंजीनियरिंग', 'इंजिनियर', 'इंजिनियरिंग', 'b tech', 'btech', 'बीटेक'],
}
const KW_MONEY: KeywordSpec = {
  label: 'money',
  aliases: ['money', 'fees', 'fee', 'paisa', 'paise', 'पैसे', 'पैसा', 'पैसों', 'फ़ीस', 'फीस', 'खर्च', 'खर्चा', 'गरीब', 'loan', 'लोन', 'afford', 'ऋण'],
}
const KW_SCHOLAR: KeywordSpec = {
  label: 'scholarship',
  aliases: ['scholarship', 'छात्रवृत्ति', 'स्कॉलरशिप', 'योजना', 'yojana', 'scheme', 'schemes'],
}
const KW_STREAM: KeywordSpec = {
  label: 'stream',
  aliases: ['science', 'साइंस', 'विज्ञान', 'pcm', 'arts', 'आर्ट्स', 'आर्ट', 'कला', 'commerce', 'कॉमर्स', 'stream', 'स्ट्रीम', 'विषय'],
}
const KW_SAFETY: KeywordSpec = {
  label: 'safety',
  aliases: ['hostel', 'हॉस्टल', 'होस्टल', 'छात्रावास', 'safety', 'safe', 'सुरक्षा', 'सुरक्षित', 'लड़कियों', 'लड़की', 'girls', 'girl'],
}

const amt = (n: number, l: SchoolLang) => inr(n, l)

export const DIDI_QA: DidiQA[] = [
  {
    id: 'polytechnic',
    keywords: [KW_POLY],
    answer: {
      hi: 'पॉलिटेक्निक 3 साल का डिप्लोमा है, जो 10वीं के बाद DCECE परीक्षा से मिलता है। सरकारी पॉलिटेक्निक में फ़ीस कम है, और डिप्लोमा के बाद आप नौकरी कर सकती हैं या सीधे B.Tech के दूसरे साल में जा सकती हैं।',
      en: 'A polytechnic is a 3-year diploma you can join after Class 10 through the DCECE exam. Fees at government polytechnics are low, and after the diploma you can take a job or go straight into the second year of a B.Tech.',
    },
    parent: {
      hi: `पॉलिटेक्निक में 10वीं के बाद 3 साल की तकनीकी पढ़ाई होती है। सरकारी पॉलिटेक्निक की फ़ीस बहुत कम है। पूर्णिया में ही सरकारी पॉलिटेक्निक है, तो बेटी घर के पास पढ़ सकती है। ${GIRLS_PCT}% सीटें लड़कियों के लिए आरक्षित हैं। पढ़ाई के बाद नौकरी या आगे इंजीनियरिंग, दोनों रास्ते खुले हैं।`,
      en: `A polytechnic is 3 years of technical study after Class 10. Government polytechnic fees are very low, and there is one in Purnia itself, so your daughter can study close to home. ${GIRLS_PCT}% of seats are reserved for girls. Afterwards she can take a job or continue to engineering.`,
    },
    sources: [portal('dcece'), DSTTE_SOURCE],
  },
  {
    id: 'engineer-money',
    keywords: [KW_ENGINEER, KW_MONEY],
    answer: {
      hi: `बिल्कुल बन सकती हैं, पैसे की कमी रास्ता नहीं रोकेगी। सबसे किफ़ायती रास्ता: 10वीं के बाद DCECE देकर सरकारी पॉलिटेक्निक, जहाँ फ़ीस कम है; फिर डिप्लोमा के बाद सीधे B.Tech के दूसरे साल में। मदद भी है: 10वीं प्रथम श्रेणी पर मुख्यमंत्री बालिका प्रोत्साहन योजना से ${amt(BALIKA_AMOUNT, 'hi')}, और आगे की पढ़ाई के लिए बिहार स्टूडेंट क्रेडिट कार्ड से ${amt(SCC_MAX, 'hi')} तक का शिक्षा ऋण। राशि आधिकारिक पोर्टल पर जाँचें।`,
      en: `Yes, you can, and money will not block the way. The most affordable route: take DCECE after Class 10 for a government polytechnic, where fees are low, then join a B.Tech directly in the second year. There is help too: ${amt(BALIKA_AMOUNT, 'en')} from the Mukhyamantri Balika Protsahan Yojana for a first division in Class 10, and an education loan of up to ${amt(SCC_MAX, 'en')} through the Bihar Student Credit Card for higher studies. Check the amounts on the official portal.`,
    },
    parent: {
      hi: `फ़ीस की चिंता न करें। सरकारी पॉलिटेक्निक की फ़ीस बहुत कम है। बेटी 10वीं प्रथम श्रेणी में पास हो, तो बालिका प्रोत्साहन योजना से ${amt(BALIKA_AMOUNT, 'hi')} मिल सकते हैं। आगे इंजीनियरिंग के लिए स्टूडेंट क्रेडिट कार्ड से ${amt(SCC_MAX, 'hi')} तक का शिक्षा ऋण मिलता है, जो पढ़ाई पूरी होने के बाद किस्तों में चुकाना होता है। राशि आधिकारिक पोर्टल पर जाँचें।`,
      en: `Do not worry about fees. Government polytechnic fees are very low. If your daughter passes Class 10 in first division, the Balika Protsahan Yojana can give ${amt(BALIKA_AMOUNT, 'en')}. For engineering later, the Student Credit Card gives an education loan of up to ${amt(SCC_MAX, 'en')}, repaid in instalments after the course. Check the amounts on the official portal.`,
    },
    sources: [portal('balika-protsahan'), portal('student-credit-card')],
  },
  {
    id: 'money',
    keywords: [KW_MONEY, KW_SCHOLAR],
    answer: {
      hi: `आपके लिए कई मदद दिख रही हैं: 10वीं प्रथम श्रेणी पर बालिका प्रोत्साहन से ${amt(BALIKA_AMOUNT, 'hi')}, INSPIRE-MANAK में आइडिया चुने जाने पर ${amt(INSPIRE_AMOUNT, 'hi')}, और 12वीं के बाद स्टूडेंट क्रेडिट कार्ड से ${amt(SCC_MAX, 'hi')} तक का शिक्षा ऋण। पूरी सूची योजना रडार में है। राशि आधिकारिक पोर्टल पर जाँचें।`,
      en: `I can see several kinds of help for you: ${amt(BALIKA_AMOUNT, 'en')} from Balika Protsahan for a first division in Class 10, ${amt(INSPIRE_AMOUNT, 'en')} if your idea is selected in INSPIRE-MANAK, and an education loan of up to ${amt(SCC_MAX, 'en')} through the Student Credit Card after Class 12. The full list is in Yojana Radar. Check the amounts on the official portal.`,
    },
    parent: {
      hi: `बेटी की पढ़ाई के लिए सरकारी मदद है: 10वीं प्रथम श्रेणी पर ${amt(BALIKA_AMOUNT, 'hi')}, अच्छे आइडिया पर ${amt(INSPIRE_AMOUNT, 'hi')}, और आगे की पढ़ाई के लिए ${amt(SCC_MAX, 'hi')} तक का शिक्षा ऋण। कागज़ों की सूची योजना रडार में है। राशि आधिकारिक पोर्टल पर जाँचें।`,
      en: `There is government help for your daughter's studies: ${amt(BALIKA_AMOUNT, 'en')} for a first division in Class 10, ${amt(INSPIRE_AMOUNT, 'en')} for a selected idea, and an education loan of up to ${amt(SCC_MAX, 'en')} for further study. The document list is in Yojana Radar. Check the amounts on the official portal.`,
    },
    sources: [portal('balika-protsahan'), portal('inspire-manak'), portal('student-credit-card')],
  },
  {
    id: 'stream',
    keywords: [KW_STREAM, { label: 'choose', aliases: ['लूँ', 'लूं', 'choose', 'चुनूँ', 'चुनूं'] }],
    answer: {
      hi: `आपकी रिपोर्ट में मशीनों और गणित की तरफ़ साफ़ झुकाव है (संख्यात्मक योग्यता ${NUSRAT_PROFILE.aptitude.numerical}), इसलिए Arts से ज़्यादा Science या पॉलिटेक्निक आपके लिए ठीक बैठता है। जल्दी कमाई शुरू करनी हो तो पॉलिटेक्निक, और लंबी पढ़ाई का समय हो तो Science लेकर JEE या BCECE। Arts भी अच्छा विषय है, बस आपकी रुचियाँ उससे कम मेल खाती हैं।`,
      en: `Your report shows a clear pull towards machines and maths (numerical aptitude ${NUSRAT_PROFILE.aptitude.numerical}), so Science or a polytechnic suits you better than Arts. If you want to start earning sooner, choose the polytechnic; if you have time for longer study, take Science and aim for JEE or BCECE. Arts is a good subject too, it just matches your interests less.`,
    },
    parent: {
      hi: 'बेटी को गणित और मशीनों में अच्छी रुचि है, इसलिए Science या पॉलिटेक्निक उसके लिए बेहतर है। पॉलिटेक्निक से लगभग 3 साल में कमाई शुरू हो सकती है; Science से इंजीनियरिंग में लगभग 6 साल लगते हैं। दोनों की पढ़ाई पूर्णिया में ही हो सकती है।',
      en: 'Your daughter has a strong interest in maths and machines, so Science or a polytechnic is better for her. A polytechnic can lead to earning in about 3 years; Science and then engineering takes about 6. Both can be studied in Purnia itself.',
    },
    sources: [REPORT_SOURCE, { en: 'BSEB', hi: 'BSEB' }],
  },
  {
    id: 'safety',
    keywords: [KW_SAFETY],
    answer: {
      hi: `लड़कियों के लिए अच्छे इंतज़ाम हैं: इंजीनियरिंग और पॉलिटेक्निक में ${GIRLS_PCT}% सीटें लड़कियों के लिए आरक्षित हैं, और बिहार में ${WOMEN_POLYS} सरकारी महिला पॉलिटेक्निक भी हैं। दाख़िले से पहले कॉलेज से छात्रा हॉस्टल की जानकारी ज़रूर लें।`,
      en: `There is good support for girls: ${GIRLS_PCT}% of engineering and polytechnic seats are reserved for girls, and Bihar also has ${WOMEN_POLYS} government women's polytechnics. Ask the college about the girls' hostel before admission.`,
    },
    parent: {
      hi: `बेटी की सुरक्षा का ध्यान रखा जाता है। ${GIRLS_PCT}% सीटें लड़कियों के लिए आरक्षित हैं और बिहार में ${WOMEN_POLYS} सरकारी महिला पॉलिटेक्निक हैं। पूर्णिया का पॉलिटेक्निक घर से रोज़ आने-जाने लायक दूरी पर है। हॉस्टल की जानकारी दाख़िले से पहले कॉलेज से लें।`,
      en: `Your daughter's safety is looked after. ${GIRLS_PCT}% of seats are reserved for girls and Bihar has ${WOMEN_POLYS} government women's polytechnics. The Purnia polytechnic is close enough for daily travel. Ask the college about the hostel before admission.`,
    },
    sources: [DSTTE_SOURCE],
  },
]

export const DIDI_FALLBACK: DidiQA = {
  id: 'fallback',
  keywords: [],
  answer: {
    hi: 'अच्छा सवाल! इसका पक्का जवाब आपके स्कूल के करियर काउंसलर देंगे; नीचे के बटन से उनसे जुड़ सकती हैं। तब तक आप पॉलिटेक्निक, पैसे, हॉस्टल या Science और Arts के बारे में पूछ सकती हैं।',
    en: 'Good question! Your school career counsellor can answer this properly; you can reach them with the button below. Meanwhile, ask me about polytechnics, money, hostels, or Science versus Arts.',
  },
  parent: {
    hi: 'अच्छा सवाल! इसका सही जवाब स्कूल के करियर काउंसलर देंगे; नीचे के बटन से उनसे बात करें। फ़ीस, सुरक्षा या हॉस्टल के बारे में आप मुझसे अभी पूछ सकते हैं।',
    en: 'Good question! The school career counsellor can answer this properly; use the button below to talk to them. You can ask me about fees, safety or hostels right now.',
  },
  sources: [{ en: 'School career counsellor', hi: 'स्कूल के करियर काउंसलर' }],
}

export const DIDI_GREETING: Bi = {
  hi: 'नमस्ते नुसरत! मैं सारथी दीदी हूँ। पढ़ाई, पैसे या आगे के रास्ते के बारे में कुछ भी पूछिए।',
  en: 'Hello Nusrat! I am Sarthi Didi. Ask me anything about studies, money or your next steps.',
}

export const DIDI_PARENT_INTRO: Bi = {
  hi: 'अभिभावक मोड चालू है। अब मैं फ़ीस, सुरक्षा और लड़कियों के हॉस्टल के बारे में आसान भाषा में बताऊँगी।',
  en: "Parent mode is on. I will now explain fees, safety and girls' hostels in simple words.",
}

/** Suggestion chips. The second one is the demo chip. */
export const DIDI_CHIPS: Bi[] = [
  { hi: 'मुझे इंजीनियर बनना है पर पैसे कम हैं', en: 'I want to be an engineer but money is tight' },
  { hi: 'Polytechnic क्या होता है?', en: 'What is a polytechnic?' },
  { hi: 'Science लूँ या Arts?', en: 'Should I take Science or Arts?' },
]
export const DIDI_DEMO_CHIP = 1

// ---------------------------------------------------------------------------
// Step 6: Yojana Radar
// ---------------------------------------------------------------------------

export type MatchStatus = 'eligible' | 'maybe' | 'no' | 'paused'

export const MATCH_LABEL: Record<MatchStatus, Bi> = {
  eligible: { en: 'Eligible', hi: 'पात्र' },
  maybe: { en: 'Maybe', hi: 'शायद' },
  no: { en: 'Not eligible', hi: 'पात्र नहीं' },
  paused: { en: 'Paused', hi: 'स्थगित' },
}

export interface SchemeMatch {
  id: string
  status: MatchStatus
  note: Bi
  /** Cash value counted in '₹ unlocked for you' (grants only, never loans). */
  grant?: number
  loan?: number
}

/** Display order and honest status for Nusrat (Class 10, girl, Purnia). */
export const YOJANA_MATCH: SchemeMatch[] = [
  {
    id: 'nmms',
    status: 'no',
    note: {
      en: 'Class 8 exam only — missed for you; shown for your siblings',
      hi: 'सिर्फ़ कक्षा 8 की परीक्षा से — आपके लिए यह मौका निकल गया; छोटे भाई-बहनों के लिए दिखाया गया',
    },
  },
  {
    id: 'balika-protsahan',
    status: 'maybe',
    note: { en: 'If you pass Class 10 in first division (verify amount)', hi: '10वीं प्रथम श्रेणी में पास होने पर (राशि की पुष्टि करें)' },
    grant: BALIKA_AMOUNT,
  },
  {
    id: 'student-credit-card',
    status: 'maybe',
    note: { en: 'After Class 12, for further study such as a B.Tech', hi: '12वीं के बाद, आगे की पढ़ाई (जैसे B.Tech) के लिए' },
    loan: SCC_MAX,
  },
  {
    id: 'inspire-manak',
    status: 'eligible',
    note: { en: 'Your school can nominate your circuit idea', hi: 'आपका स्कूल आपके सर्किट वाले आइडिया को नामांकित कर सकता है' },
    grant: INSPIRE_AMOUNT,
  },
  {
    id: 'bseb-coaching',
    status: 'eligible',
    note: { en: 'Free online classes, starting this week', hi: 'इसी हफ़्ते से मुफ़्त ऑनलाइन कक्षाएँ' },
  },
  {
    id: 'dcece',
    status: 'eligible',
    note: {
      en: 'Upcoming: we will alert you when forms open',
      hi: 'आने वाली परीक्षा: फ़ॉर्म खुलते ही हम सूचना देंगे',
    },
  },
  {
    id: 'post-matric',
    status: 'maybe',
    note: { en: 'Depends on SC/ST/BC/EBC category and income limit', hi: 'SC/ST/BC/EBC श्रेणी और आय-सीमा पर निर्भर' },
  },
  {
    id: 'ntse',
    status: 'paused',
    note: { en: 'Paused since 2021 — we will alert if revived', hi: '2021 से स्थगित — दोबारा शुरू होने पर हम सूचना देंगे' },
  },
]

export interface YojanaRow {
  scheme: Scheme
  match: SchemeMatch
}

/** Cards for audience 'school' or 'both', in YOJANA_MATCH order (unknown ids are skipped). */
export function yojanaRows(): YojanaRow[] {
  const rows: YojanaRow[] = []
  for (const m of YOJANA_MATCH) {
    const scheme = SCHEMES.find((s) => s.id === m.id)
    if (scheme && scheme.audience !== 'college') rows.push({ scheme, match: m })
  }
  return rows
}

// ---------------------------------------------------------------------------
// Handoff (fix 47)
// ---------------------------------------------------------------------------

export const HANDOFF = {
  title: {
    en: 'One APAAR-linked profile: school → polytechnic/engineering → placement',
    hi: 'एक APAAR-लिंक्ड प्रोफ़ाइल: स्कूल → पॉलिटेक्निक/इंजीनियरिंग → प्लेसमेंट',
  } as Bi,
  body: {
    en: 'See where this path leads: a polytechnic final-year like Rahul',
    hi: 'देखिए यह रास्ता कहाँ ले जाता है: राहुल जैसे पॉलिटेक्निक फ़ाइनल-ईयर छात्र तक',
  } as Bi,
  cta: { en: "Open Rahul's Placement Day", hi: 'राहुल का प्लेसमेंट डे खोलें' } as Bi,
}
