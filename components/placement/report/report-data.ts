// Report-only illustrative data and pure builders (no React). Headline numbers are never typed here:
// persona scores come from lib/mock (attempts, ROUND_TARGETS, VERSANT_TARGETS, INTERVIEW_SPLIT, drives).
import type { Bi } from '@/lib/os/i18n'
import { fmtDate } from '@/lib/os/i18n'
import type { RoundId } from '@/lib/os/rounds'
import { PILLAR_KEYS, PILLAR_LABELS, offerBandFor } from '@/lib/os/scoring'
import { isoDaysBefore } from '@/lib/mock/state'
import type { Attempt, Drive, PersonaRunId, PillarKey, Pillars } from '@/lib/mock/types'

// ---------------------------------------------------------------------------
// Cohort and ranking (illustrative)
// ---------------------------------------------------------------------------

/** Average pillars across the Bihar 2027 cohort (illustrative). */
export const COHORT_AVG: Pillars = {
  aptitude: 58,
  technical: 55,
  communication: 44,
  techInterview: 56,
  hr: 57,
  resume: 52,
  integrity: 95,
}

/** Short axis labels for the radar (fit at 390px). */
export const PILLAR_SHORT: Record<PillarKey, Bi> = {
  aptitude: { en: 'Aptitude', hi: 'अभिरुचि' },
  technical: { en: 'Technical', hi: 'तकनीकी' },
  communication: { en: 'Comm.', hi: 'संवाद' },
  techInterview: { en: 'Tech int.', hi: 'टेक इंटरव्यू' },
  hr: { en: 'HR', hi: 'एचआर' },
  resume: { en: 'Resume', hi: 'रिज़्यूमे' },
  integrity: { en: 'Integrity', hi: 'सत्यनिष्ठा' },
}

/** 'Top X%' per round (illustrative; aptitude matches the aptitude result screen). */
export const ROUND_TOP_PCT: Record<PersonaRunId, Partial<Record<RoundId, number>>> = {
  priya: { aptitude: 31, technical: 24, communication: 46, gd: 35, techInterview: 27, hrInterview: 33 },
  rahul: { aptitude: 44, technical: 14, communication: 57, gd: 40, techInterview: 22, hrInterview: 25 },
}

export const OVERALL_RANK: Record<PersonaRunId, { topPct: number; cohort: Bi }> = {
  priya: { topPct: 18, cohort: { en: 'Bihar 2027 batch', hi: 'बिहार 2027 बैच' } },
  rahul: { topPct: 21, cohort: { en: 'Bihar 2027 diploma batch', hi: 'बिहार 2027 डिप्लोमा बैच' } },
}

/** Round cutoffs on the round's own scale (communication: Versant-style 20-80). Eligibility uses criteria text. */
export const ROUND_CUTOFF: Partial<Record<RoundId, number>> = {
  aptitude: 60,
  technical: 60,
  communication: 50,
  gd: 50,
  techInterview: 60,
  hrInterview: 60,
}

// ---------------------------------------------------------------------------
// Offer letter, company fit, streak
// ---------------------------------------------------------------------------

/** Generic role per persona. No company names. */
export const OFFER_ROLE: Record<PersonaRunId, Bi> = {
  priya: {
    en: 'Graduate Engineer Trainee — IT services (NQT-style drive)',
    hi: 'ग्रेजुएट इंजीनियर ट्रेनी — IT सेवाएँ (NQT-शैली ड्राइव)',
  },
  rahul: {
    en: 'Trainee Technician — Auto-OEM-style pool drive',
    hi: 'ट्रेनी टेक्नीशियन — ऑटो-OEM-शैली पूल ड्राइव',
  },
}

/** Drive the persona is already shortlisted for (Rahul: the auto-OEM-style pool drive). */
export const SHORTLISTED_DRIVE: Record<PersonaRunId, string | null> = { priya: null, rahul: 'd2' }

/** Practice streak (days) and which of the last 7 days were active (oldest first). */
export const STREAK: Record<PersonaRunId, { days: number; week: boolean[] }> = {
  priya: { days: 6, week: [false, true, true, true, true, true, true] },
  rahul: { days: 1, week: [false, false, false, false, false, false, true] },
}

/** Filler words per minute in the open answer, first attempt vs today (Priya's change story). */
export const FILLER_RATE: Record<PersonaRunId, { first: number; now: number }> = {
  priya: { first: 14, now: 4 },
  rahul: { first: 9, now: 9 },
}

// ---------------------------------------------------------------------------
// AI summary (hero)
// ---------------------------------------------------------------------------

const AND: Bi = { en: 'and', hi: 'और', hinglish: 'aur' }

function plabel(k: PillarKey, lang: 'en' | 'hi' | 'hinglish'): string {
  return lang === 'hi' ? PILLAR_LABELS[k].hi : PILLAR_LABELS[k].en
}

function list(items: string[], lang: 'en' | 'hi' | 'hinglish'): string {
  if (items.length <= 1) return items.join('')
  const and = lang === 'hi' ? AND.hi : lang === 'hinglish' ? AND.hinglish! : AND.en
  return `${items.slice(0, -1).join(', ')} ${and} ${items[items.length - 1]}`
}

/** Top-2 strengths and bottom-3 gaps (integrity excluded), stable by pillar order on ties. */
export function strengthsAndGaps(p: Pillars): { strengths: PillarKey[]; gaps: PillarKey[] } {
  const keys = PILLAR_KEYS.filter((k) => k !== 'integrity')
  const desc = [...keys].sort((a, b) => p[b] - p[a] || keys.indexOf(a) - keys.indexOf(b))
  const asc = [...keys].sort((a, b) => p[a] - p[b] || keys.indexOf(a) - keys.indexOf(b))
  return { strengths: desc.slice(0, 2), gaps: asc.slice(0, 3) }
}

/** Builds the streamed hero summary in all three languages from the attempts. */
export function buildSummary(args: {
  personaId: PersonaRunId
  live: Pillars
  first: Attempt
  attempt: Attempt
  baseline: boolean
}): Bi {
  const { personaId, live, first, attempt, baseline } = args
  const { strengths, gaps } = strengthsAndGaps(live)
  const nextVersant = Math.min(80, attempt.versant + 10)
  const fr = FILLER_RATE[personaId]

  const make = (lang: 'en' | 'hi' | 'hinglish'): string => {
    const s = list(strengths.map((k) => `${plabel(k, lang)} ${live[k]}`), lang)
    const g = list(gaps.map((k) => `${plabel(k, lang)} ${live[k]}`), lang)
    const c0 = first.pillars.communication
    const c1 = live.communication
    const t0 = first.pillars.technical
    const t1 = live.technical
    const since = fmtDate(first.date, lang === 'hi' ? 'hi' : 'en')

    if (baseline) {
      const next =
        personaId === 'rahul'
          ? { en: 'shop-floor case answers', hi: 'शॉप-फ़्लोर केस के जवाब', hinglish: 'shop-floor case answers' }
          : { en: 'DP basics', hi: 'DP की बुनियाद', hinglish: 'DP basics' }
      if (lang === 'hi')
        return `आज बेसलाइन तय हुई। मज़बूती: ${s}। कमियाँ: ${g}।\nअगले प्रयास में दिखेगा क्या बदला; योजना spoken English से शुरू होती है।\nअगला लक्ष्य: spoken English ${nextVersant}/80 और ${next.hi}।`
      if (lang === 'hinglish')
        return `Baseline aaj set hua. Strengths: ${s}. Gaps: ${g}.\nAgle attempt mein dikhega kya badla; plan spoken English se shuru hota hai.\nAb agla lakshya: spoken English ${nextVersant}/80 aur ${next.hinglish}.`
      return `Baseline set today. Strengths: ${s}. Gaps: ${g}.\nYour next attempt will show what changed; the plan starts with spoken English.\nNext target: spoken English ${nextVersant}/80 and ${next.en}.`
    }

    if (lang === 'hi')
      return `मज़बूती: ${s}। कमियाँ: ${g}।\n${since} से अब तक: संवाद ${c0} → ${c1}, फ़िलर शब्द ${fr.first} से घटकर ${fr.now} प्रति मिनट। तकनीकी ${t0} → ${t1}, two-pointer और hashing पैटर्न पक्के।\nअगला लक्ष्य: spoken English ${nextVersant}/80 और DP की बुनियाद।`
    if (lang === 'hinglish')
      return `Strengths: ${s}. Gaps: ${g}.\n${since} se ab tak — Communication ${c0} → ${c1}: filler words ${fr.first} se ${fr.now} per minute. Technical ${t0} → ${t1}: two-pointer aur hashing patterns pakke.\nAb agla lakshya: spoken English ${nextVersant}/80 aur DP basics.`
    return `Strengths: ${s}. Gaps: ${g}.\nSince ${since}: Communication ${c0} → ${c1}, filler words down from ${fr.first} to ${fr.now} per minute. Technical ${t0} → ${t1}, two-pointer and hashing patterns now solid.\nNext target: spoken English ${nextVersant}/80 and DP basics.`
  }

  return { en: make('en'), hi: make('hi'), hinglish: make('hinglish') }
}

// ---------------------------------------------------------------------------
// 30-day roadmap
// ---------------------------------------------------------------------------

export interface PlanTask {
  id: string
  title: Bi
  effort: Bi
  reason: Bi
  href?: string
  /** External module (NASSCOM FSP / Spoken Tutorial, integration-ready). */
  external?: boolean
  milestone?: boolean
}

export interface PlanWeek {
  id: string
  label: Bi
  range: Bi
  focus: Bi
  tasks: PlanTask[]
}

export interface PlanCtx {
  personaId: PersonaRunId
  versant: number
  techChip: string
  aptGap: Bi | null
  hrFlag: Bi | null
  content: number
  delivery: number
  hrScore: number
  pri: number
  stretch: { title: Bi; reason: Bi } | null
  drives: Drive[]
  shortlist: Drive | null
}

/** Rescore date: DEMO_TODAY + 28 days. */
export const RESCORE_ISO = isoDaysBefore(-28)

function range(week: number): Bi {
  const a = isoDaysBefore(-(week * 7))
  const b = isoDaysBefore(-(week * 7 + 6))
  return { en: `${fmtDate(a, 'en')} – ${fmtDate(b, 'en')}`, hi: `${fmtDate(a, 'hi')} – ${fmtDate(b, 'hi')}` }
}

const lc = (s: string) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s)

/** Builds the 4-week plan. `light` = the 2 hrs/day variant. Every task carries a reason tied to a signal. */
export function buildPlan(ctx: PlanCtx, light: boolean): PlanWeek[] {
  const { personaId, versant } = ctx
  const target = Math.min(80, versant + 10)
  const rescoreEn = fmtDate(RESCORE_ISO, 'en')
  const rescoreHi = fmtDate(RESCORE_ISO, 'hi')
  const afterRescore = ctx.drives.filter((d) => d.date > RESCORE_ISO).length

  const rFluency: Bi = {
    en: `because Round 3 fluency was ${versant}/80`,
    hi: `क्योंकि राउंड 3 में प्रवाह ${versant}/80 था`,
    hinglish: `kyunki Round 3 fluency ${versant}/80 thi`,
  }
  const rAptitude: Bi = ctx.aptGap
    ? { en: `because Aptitude flagged ${lc(ctx.aptGap.en)}`, hi: `क्योंकि अभिरुचि में: ${ctx.aptGap.hi}`, hinglish: `kyunki Aptitude mein: ${ctx.aptGap.en}` }
    : {
        en: 'because Time & Work was your slowest aptitude topic',
        hi: 'क्योंकि टाइम एंड वर्क आपका सबसे धीमा विषय था',
        hinglish: 'kyunki Time & Work aapka sabse slow topic tha',
      }
  const rTech: Bi = {
    en: `because Round 2 signal: ${ctx.techChip}`,
    hi: `क्योंकि राउंड 2 संकेत: ${ctx.techChip}`,
    hinglish: `kyunki Round 2 signal: ${ctx.techChip}`,
  }
  const rDelivery: Bi = {
    en: `because interview delivery was ${ctx.delivery} (content ${ctx.content})`,
    hi: `क्योंकि इंटरव्यू में डिलीवरी ${ctx.delivery} थी (कंटेंट ${ctx.content})`,
    hinglish: `kyunki interview delivery ${ctx.delivery} thi (content ${ctx.content})`,
  }
  const rHr: Bi = ctx.hrFlag
    ? { en: `because HR noted: ${lc(ctx.hrFlag.en)}`, hi: `क्योंकि एचआर में: ${ctx.hrFlag.hi}`, hinglish: `kyunki HR mein: ${lc(ctx.hrFlag.en)}` }
    : {
        en: `because HR (${ctx.hrScore}) was your lowest interview score`,
        hi: `क्योंकि एचआर (${ctx.hrScore}) आपका सबसे कम इंटरव्यू स्कोर था`,
        hinglish: `kyunki HR (${ctx.hrScore}) aapka sabse kam interview score tha`,
      }
  const rCourse: Bi = {
    en: `to reach ${target}/80 by ${rescoreEn}`,
    hi: `${rescoreHi} तक ${target}/80 तक पहुँचने के लिए`,
    hinglish: `${rescoreEn} tak ${target}/80 tak pahunchne ke liye`,
  }
  const rescore: PlanTask = {
    id: 'rescore',
    title: { en: `Rescore: next Placement Day on ${rescoreEn}`, hi: `दोबारा स्कोर: ${rescoreHi} को अगला प्लेसमेंट डे`, hinglish: `Rescore: ${rescoreEn} ko agla Placement Day` },
    effort: { en: '2 hrs, once', hi: '2 घंटे, एक बार', hinglish: '2 hrs, ek baar' },
    reason: { en: `to measure the change from PRI ${ctx.pri}`, hi: `PRI ${ctx.pri} से बदलाव मापने के लिए`, hinglish: `PRI ${ctx.pri} se badlav measure karne ke liye` },
    milestone: true,
  }

  const drills: PlanTask = {
    id: 'versant',
    title: { en: 'Versant-style speaking drills', hi: 'Versant-शैली बोलने का अभ्यास', hinglish: 'Versant-style speaking drills' },
    effort: light ? { en: '10 min/day', hi: '10 मिनट/दिन' } : { en: '20 min/day', hi: '20 मिनट/दिन' },
    reason: rFluency,
    external: true,
  }
  const timeWork: PlanTask = {
    id: 'time-work',
    title: { en: 'Time & Work: LCM-method sets', hi: 'टाइम एंड वर्क: LCM विधि के सेट', hinglish: 'Time & Work: LCM-method sets' },
    effort: light ? { en: '1 set/week', hi: '1 सेट/सप्ताह' } : { en: '3 sets', hi: '3 सेट' },
    reason: rAptitude,
  }
  const mocks: PlanTask = {
    id: 'mocks',
    title: light
      ? { en: '1 AI mock interview', hi: '1 AI मॉक इंटरव्यू', hinglish: '1 AI mock interview' }
      : { en: '2 AI mock interviews', hi: '2 AI मॉक इंटरव्यू', hinglish: '2 AI mock interviews' },
    effort: { en: '30 min each', hi: '30 मिनट प्रत्येक', hinglish: '30 min each' },
    reason: rDelivery,
  }
  const mentor: PlanTask = {
    id: 'mentor',
    title: { en: 'Mentor session: HR answers', hi: 'मेंटर सत्र: एचआर के जवाब', hinglish: 'Mentor session: HR answers' },
    effort: { en: '45 min', hi: '45 मिनट' },
    reason: rHr,
    href: '/mentorship',
  }
  const course: PlanTask = {
    id: 'course',
    title: { en: 'Spoken-English course', hi: 'स्पोकन इंग्लिश कोर्स', hinglish: 'Spoken-English course' },
    effort: light ? { en: '10 min/day', hi: '10 मिनट/दिन' } : { en: '15 min/day', hi: '15 मिनट/दिन' },
    reason: rCourse,
    href: '/courses',
    external: true,
  }

  if (personaId === 'rahul') {
    const pool = ctx.shortlist
    const shopFloor: PlanTask = {
      id: 'shop-floor',
      title: { en: 'Shop-floor case drills: coolant & feed rate', hi: 'शॉप-फ़्लोर केस अभ्यास: कूलेंट और फ़ीड रेट', hinglish: 'Shop-floor case drills: coolant & feed rate' },
      effort: light ? { en: '2 cases', hi: '2 केस' } : { en: '5 cases', hi: '5 केस' },
      reason: rTech,
    }
    const mockPool: PlanTask = {
      id: 'mock-pool',
      title: light
        ? { en: 'Half mock pool drive', hi: 'आधी मॉक पूल ड्राइव', hinglish: 'Half mock pool drive' }
        : { en: 'Full mock pool drive (Auto-OEM-style)', hi: 'पूरी मॉक पूल ड्राइव (ऑटो-OEM-शैली)', hinglish: 'Full mock pool drive (Auto-OEM-style)' },
      effort: light ? { en: '1.5 hrs', hi: '1.5 घंटे' } : { en: '3 hrs', hi: '3 घंटे' },
      reason: pool
        ? {
            en: `before your shortlisted pool drive on ${fmtDate(pool.date, 'en')}`,
            hi: `${fmtDate(pool.date, 'hi')} की शॉर्टलिस्टेड पूल ड्राइव से पहले`,
            hinglish: `${fmtDate(pool.date, 'en')} ki shortlisted pool drive se pehle`,
          }
        : { en: 'to rehearse every round once', hi: 'हर राउंड का एक बार अभ्यास करने के लिए' },
    }
    return [
      week(0, { en: 'Fluency + speed', hi: 'प्रवाह + गति' }, [drills, timeWork]),
      week(1, { en: 'Core cases + interviews', hi: 'कोर केस + इंटरव्यू' }, light ? [shopFloor] : [shopFloor, mocks]),
      week(2, { en: 'Rehearse the pool drive', hi: 'पूल ड्राइव का अभ्यास' }, light ? [mockPool] : [mockPool, mentor]),
      week(3, { en: 'Polish + rescore', hi: 'निखार + दोबारा स्कोर' }, light ? [course, rescore] : [course, mocks, rescore]),
    ]
  }

  const dp: PlanTask = {
    id: 'dp',
    title: { en: 'DP basics: 1-D DP and knapsack', hi: 'DP की बुनियाद: 1-D DP और नैपसैक', hinglish: 'DP basics: 1-D DP aur knapsack' },
    effort: light ? { en: '6 problems', hi: '6 प्रश्न' } : { en: '12 problems', hi: '12 प्रश्न' },
    reason: ctx.stretch
      ? {
          en: `because ${ctx.stretch.title.en} ${lc(ctx.stretch.reason.en)}`,
          hi: `क्योंकि ${ctx.stretch.title.hi} ${ctx.stretch.reason.hi}`,
          hinglish: `kyunki ${ctx.stretch.title.en} ${lc(ctx.stretch.reason.en)}`,
        }
      : rTech,
    external: true,
  }
  const mockDrive: PlanTask = {
    id: 'mock-drive',
    title: light
      ? { en: 'Half mock drive (2 rounds)', hi: 'आधी मॉक ड्राइव (2 राउंड)', hinglish: 'Half mock drive (2 rounds)' }
      : { en: 'Full mock drive (NQT-style, all rounds)', hi: 'पूरी मॉक ड्राइव (NQT-शैली, सभी राउंड)', hinglish: 'Full mock drive (NQT-style, saare rounds)' },
    effort: light ? { en: '1.5 hrs', hi: '1.5 घंटे' } : { en: '3 hrs', hi: '3 घंटे' },
    reason:
      afterRescore > 0
        ? {
            en: `because ${afterRescore} of your drives come after ${rescoreEn}`,
            hi: `क्योंकि आपकी ${afterRescore} ड्राइव ${rescoreHi} के बाद हैं`,
            hinglish: `kyunki aapki ${afterRescore} drives ${rescoreEn} ke baad hain`,
          }
        : { en: 'to rehearse every round once', hi: 'हर राउंड का एक बार अभ्यास करने के लिए' },
  }
  return [
    week(0, { en: 'Fluency + speed', hi: 'प्रवाह + गति' }, [drills, timeWork]),
    week(1, { en: 'DSA + interviews', hi: 'DSA + इंटरव्यू' }, [dp, mocks]),
    week(2, { en: 'Mentor + spoken English', hi: 'मेंटर + स्पोकन इंग्लिश' }, light ? [course] : [mentor, course]),
    week(3, { en: 'Mock drive + rescore', hi: 'मॉक ड्राइव + दोबारा स्कोर' }, [mockDrive, rescore]),
  ]
}

function week(i: number, focus: Bi, tasks: PlanTask[]): PlanWeek {
  return {
    id: `w${i + 1}`,
    label: { en: `Week ${i + 1}`, hi: `सप्ताह ${i + 1}` },
    range: range(i),
    focus,
    tasks,
  }
}

/**
 * Simulated offer band. Diploma (polytechnic) students are benchmarked on diploma pool-drive salaries
 * (≈ ₹1.8-3.6 LPA), never on the engineering bands that offerBandFor() uses.
 */
export function offerBandForPersona(kind: string | undefined, pri: number): { full: Bi; short: Bi } {
  if (kind === 'polytechnic') {
    return pri < 65
      ? {
          full: { en: 'Diploma trainee band (≈ ₹1.8-2.4 LPA equivalent)', hi: 'डिप्लोमा ट्रेनी बैंड (≈ ₹1.8-2.4 LPA समतुल्य)' },
          short: { en: 'Diploma trainee · ₹1.8-2.4 LPA', hi: 'डिप्लोमा ट्रेनी · ₹1.8-2.4 LPA' },
        }
      : {
          full: { en: 'Diploma core band (≈ ₹2.4-3.6 LPA equivalent)', hi: 'डिप्लोमा कोर बैंड (≈ ₹2.4-3.6 LPA समतुल्य)' },
          short: { en: 'Diploma core · ₹2.4-3.6 LPA', hi: 'डिप्लोमा कोर · ₹2.4-3.6 LPA' },
        }
  }
  const full = offerBandFor(pri)
  const short: Bi =
    pri < 50
      ? { en: 'Not yet · 30-day plan', hi: 'अभी नहीं · 30-दिन योजना' }
      : pri < 65
        ? { en: 'Mass-recruiter · ₹3.3-4.5 LPA', hi: 'मास-रिक्रूटर · ₹3.3-4.5 LPA' }
        : pri < 80
          ? { en: 'Higher-tier · ₹6-7.5 LPA', hi: 'उच्च-स्तरीय · ₹6-7.5 LPA' }
          : { en: 'Top-track · ₹9 LPA+', hi: 'टॉप-ट्रैक · ₹9 LPA+' }
  return { full, short }
}

/** Mock strings that are still plain English in lib/mock: Hindi for the ones shown in the student area. */
const MOCK_HI: Record<string, string> = {
  'Official CM Pratigya portal': 'आधिकारिक मुख्यमंत्री प्रतिज्ञा पोर्टल',
  'Pattern inspired by publicly reported formats; not an official paper; no affiliation.':
    'सार्वजनिक रूप से रिपोर्ट किए गए प्रारूपों से प्रेरित पैटर्न; आधिकारिक पेपर नहीं; कोई संबद्धता नहीं।',
}

/** Accepts a mock string or an already-bilingual value, so it keeps working once lib/mock ships Bi objects. */
export function mockBi(x: string | Bi | null | undefined): Bi {
  if (x == null) return { en: '', hi: '' }
  if (typeof x !== 'string') return x
  return { en: x, hi: MOCK_HI[x] ?? x }
}
