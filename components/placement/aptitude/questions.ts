// Round 1 (adaptive proctored aptitude): question bank, adaptive rules and persona result constants.
// Pure module (no React). Patterns are inspired by publicly reported campus aptitude formats; not an official paper.
import type { Bi } from '@/lib/os/i18n'
import type { PersonaRunId } from '@/lib/mock/types'

export type AptSection = 'Numerical' | 'Reasoning' | 'Verbal'
export type Difficulty = 1 | 2 | 3

export interface AptQuestion {
  id: string
  section: AptSection
  difficulty: Difficulty
  q: Bi
  /** Language-neutral options (numbers, English words for the verbal section). */
  options: string[]
  /** Optional Hindi options when the options are words (additive to the spec shape). */
  optionsHi?: string[]
  answer: number
  explanation: Bi
  /** Bihar cohort average solve time, seconds (illustrative). */
  avgSec: number
  topic: string
}

export const APT_SECTIONS: { id: AptSection; label: Bi }[] = [
  { id: 'Numerical', label: { en: 'Numerical', hi: 'संख्यात्मक' } },
  { id: 'Reasoning', label: { en: 'Reasoning', hi: 'तार्किक' } },
  { id: 'Verbal', label: { en: 'Verbal', hi: 'भाषिक' } },
]

/** Demo pace: 6 questions, 2 per section. */
export const SLOTS_PER_SECTION = 2
export const TOTAL_SLOTS = APT_SECTIONS.length * SLOTS_PER_SECTION
/** 3:00 per section. */
export const SECTION_SECONDS = 180
export const START_LEVEL: Difficulty = 2
/** Sectional cutoff (percent). */
export const APT_CUTOFF = 60

export const DIFFICULTY_LABEL: Record<Difficulty, Bi> = {
  1: { en: 'Easy', hi: 'आसान' },
  2: { en: 'Medium', hi: 'मध्यम' },
  3: { en: 'Hard', hi: 'कठिन' },
}

export const TOPIC_LABEL: Record<string, Bi> = {
  'Speed & Distance': { en: 'Speed & Distance', hi: 'गति और दूरी' },
  'Time & Work': { en: 'Time & Work', hi: 'टाइम एंड वर्क' },
  Percentages: { en: 'Percentages', hi: 'प्रतिशत' },
  Probability: { en: 'Probability', hi: 'प्रायिकता' },
  'Ratio & Ages': { en: 'Ratio & Ages', hi: 'अनुपात और आयु' },
  'Number series': { en: 'Number series', hi: 'संख्या श्रृंखला' },
  'Coding-decoding': { en: 'Coding-decoding', hi: 'कोडिंग-डिकोडिंग' },
  'Blood relations': { en: 'Blood relations', hi: 'रक्त संबंध' },
  Syllogism: { en: 'Syllogism', hi: 'न्याय निगमन' },
  'Direction sense': { en: 'Direction sense', hi: 'दिशा ज्ञान' },
  Grammar: { en: 'Grammar', hi: 'व्याकरण' },
  Vocabulary: { en: 'Vocabulary', hi: 'शब्दावली' },
  'Sentence completion': { en: 'Sentence completion', hi: 'वाक्य पूर्ति' },
}

export function topicLabel(topic: string): Bi {
  return TOPIC_LABEL[topic] ?? { en: topic, hi: topic }
}

// Order matters inside each difficulty: the adaptive picker takes the first unused item.
export const APT_QUESTIONS: AptQuestion[] = [
  // ------------------------------------------------------------------ Numerical
  {
    id: 'n-train',
    section: 'Numerical',
    difficulty: 2,
    topic: 'Speed & Distance',
    q: {
      en: 'A train 240 m long passes a pole in 12 seconds. How long will it take to cross a platform 360 m long?',
      hi: '240 मीटर लंबी एक ट्रेन एक खंभे को 12 सेकंड में पार करती है। 360 मीटर लंबे प्लेटफ़ॉर्म को पार करने में उसे कितना समय लगेगा?',
    },
    options: ['24 s', '30 s', '36 s', '18 s'],
    optionsHi: ['24 सेकंड', '30 सेकंड', '36 सेकंड', '18 सेकंड'],
    answer: 1,
    explanation: {
      en: 'Speed = 240 ÷ 12 = 20 m/s. To clear the platform the train covers 240 + 360 = 600 m, so time = 600 ÷ 20 = 30 s.',
      hi: 'गति = 240 ÷ 12 = 20 मी/से। प्लेटफ़ॉर्म पार करने के लिए ट्रेन 240 + 360 = 600 मी चलती है, इसलिए समय = 600 ÷ 20 = 30 सेकंड।',
    },
    avgSec: 52,
  },
  {
    id: 'n-work',
    section: 'Numerical',
    difficulty: 2,
    topic: 'Time & Work',
    q: {
      en: 'A can finish a job in 12 days and B can finish it in 18 days. Working together, in how many days will they finish it?',
      hi: 'A किसी काम को 12 दिन में और B उसी काम को 18 दिन में पूरा करता है। दोनों साथ मिलकर वह काम कितने दिन में पूरा करेंगे?',
    },
    options: ['7.2 days', '15 days', '6 days', '7.5 days'],
    optionsHi: ['7.2 दिन', '15 दिन', '6 दिन', '7.5 दिन'],
    answer: 0,
    explanation: {
      en: 'LCM method: call the job 36 units. A does 3 units a day and B does 2, so together 5 a day: 36 ÷ 5 = 7.2 days.',
      hi: 'LCM तरीका: पूरे काम को 36 इकाई मानें। A रोज़ 3 और B रोज़ 2 इकाई करता है, यानी साथ में 5 इकाई: 36 ÷ 5 = 7.2 दिन।',
    },
    avgSec: 69,
  },
  {
    id: 'n-sugar',
    section: 'Numerical',
    difficulty: 1,
    topic: 'Percentages',
    q: {
      en: 'The price of sugar rises by 25%. By what percentage must a family cut its consumption so that its spending on sugar stays the same?',
      hi: 'चीनी का दाम 25% बढ़ जाता है। चीनी पर खर्च पहले जितना रखने के लिए परिवार को खपत कितने प्रतिशत घटानी होगी?',
    },
    options: ['20%', '25%', '15%', '22.5%'],
    answer: 0,
    explanation: {
      en: 'Cut = 25 ÷ (100 + 25) × 100 = 20%.',
      hi: 'कटौती = 25 ÷ (100 + 25) × 100 = 20%।',
    },
    avgSec: 40,
  },
  {
    id: 'n-pipes',
    section: 'Numerical',
    difficulty: 3,
    topic: 'Time & Work',
    q: {
      en: 'Pipe A fills a tank in 20 minutes and pipe B fills it in 30 minutes. Pipe C empties the full tank in 15 minutes. If all three are opened together, how long will the empty tank take to fill?',
      hi: 'पाइप A एक टंकी को 20 मिनट में और पाइप B 30 मिनट में भरता है। पाइप C भरी टंकी को 15 मिनट में खाली करता है। तीनों को एक साथ खोलने पर खाली टंकी कितने समय में भरेगी?',
    },
    options: ['60 min', '45 min', '30 min', 'It never fills'],
    optionsHi: ['60 मिनट', '45 मिनट', '30 मिनट', 'कभी नहीं भरेगी'],
    answer: 0,
    explanation: {
      en: 'Take the tank as 60 units (LCM). A adds 3, B adds 2 and C removes 4 units a minute: net 1 unit a minute, so 60 minutes.',
      hi: 'टंकी को 60 इकाई मानें (LCM)। A हर मिनट 3, B 2 इकाई भरता है और C 4 इकाई निकालता है: कुल 1 इकाई प्रति मिनट, यानी 60 मिनट।',
    },
    avgSec: 88,
  },
  {
    id: 'n-dice',
    section: 'Numerical',
    difficulty: 3,
    topic: 'Probability',
    q: {
      en: 'Two fair dice are thrown together. What is the probability that the numbers add up to 8?',
      hi: 'दो निष्पक्ष पासे एक साथ फेंके जाते हैं। दोनों संख्याओं का योग 8 आने की प्रायिकता क्या है?',
    },
    options: ['5/36', '1/6', '7/36', '1/9'],
    answer: 0,
    explanation: {
      en: 'Favourable pairs: (2,6), (3,5), (4,4), (5,3), (6,2). That is 5 of the 36 outcomes.',
      hi: 'अनुकूल जोड़े: (2,6), (3,5), (4,4), (5,3), (6,2)। यानी 36 में से 5 परिणाम।',
    },
    avgSec: 58,
  },
  {
    id: 'n-ages',
    section: 'Numerical',
    difficulty: 3,
    topic: 'Ratio & Ages',
    q: {
      en: 'The ages of A and B are in the ratio 3 : 5. After 6 years the ratio becomes 3 : 4. What is B’s present age?',
      hi: 'A और B की आयु का अनुपात 3 : 5 है। 6 साल बाद यह अनुपात 3 : 4 हो जाता है। B की वर्तमान आयु क्या है?',
    },
    options: ['10 years', '15 years', '20 years', '12 years'],
    optionsHi: ['10 वर्ष', '15 वर्ष', '20 वर्ष', '12 वर्ष'],
    answer: 0,
    explanation: {
      en: '(3x + 6) ÷ (5x + 6) = 3 ÷ 4 gives 12x + 24 = 15x + 18, so x = 2 and B = 5 × 2 = 10 years.',
      hi: '(3x + 6) ÷ (5x + 6) = 3 ÷ 4 से 12x + 24 = 15x + 18, यानी x = 2 और B = 5 × 2 = 10 वर्ष।',
    },
    avgSec: 75,
  },

  // ------------------------------------------------------------------ Reasoning
  {
    id: 'r-series',
    section: 'Reasoning',
    difficulty: 1,
    topic: 'Number series',
    q: {
      en: 'Find the next number in the series: 2, 6, 12, 20, 30, ?',
      hi: 'श्रृंखला की अगली संख्या ज्ञात करें: 2, 6, 12, 20, 30, ?',
    },
    options: ['40', '42', '44', '36'],
    answer: 1,
    explanation: {
      en: 'The gaps are 4, 6, 8, 10, so the next gap is 12: 30 + 12 = 42. (Each term is n × (n + 1).)',
      hi: 'अंतर 4, 6, 8, 10 हैं, इसलिए अगला अंतर 12: 30 + 12 = 42। (हर पद n × (n + 1) है।)',
    },
    avgSec: 30,
  },
  {
    id: 'r-code',
    section: 'Reasoning',
    difficulty: 2,
    topic: 'Coding-decoding',
    q: {
      en: 'If COMPUTER is written as DPNQVUFS, how is LAPTOP written in the same code?',
      hi: 'यदि COMPUTER को DPNQVUFS लिखा जाता है, तो उसी कोड में LAPTOP कैसे लिखा जाएगा?',
    },
    options: ['MBQUPQ', 'MBQTPQ', 'KZOSNO', 'MBRUPQ'],
    answer: 0,
    explanation: {
      en: 'Every letter moves one step forward: L→M, A→B, P→Q, T→U, O→P, P→Q.',
      hi: 'हर अक्षर एक स्थान आगे जाता है: L→M, A→B, P→Q, T→U, O→P, P→Q।',
    },
    avgSec: 45,
  },
  {
    id: 'r-blood',
    section: 'Reasoning',
    difficulty: 2,
    topic: 'Blood relations',
    q: {
      en: 'Pointing to a man, Sonu says, “He is the son of my grandfather’s only son.” How is the man related to Sonu?',
      hi: 'एक व्यक्ति की ओर इशारा करते हुए सोनू कहता है, “वह मेरे दादा के इकलौते बेटे का बेटा है।” वह व्यक्ति सोनू का क्या लगता है?',
    },
    options: ['Brother', 'Cousin', 'Uncle', 'Father'],
    optionsHi: ['भाई', 'चचेरा भाई', 'चाचा', 'पिता'],
    answer: 0,
    explanation: {
      en: 'Grandfather’s only son is Sonu’s father. The father’s son, other than Sonu, is Sonu’s brother.',
      hi: 'दादा का इकलौता बेटा सोनू के पिता हैं। पिता का बेटा (सोनू के अलावा) सोनू का भाई है।',
    },
    avgSec: 40,
  },
  {
    id: 'r-syllogism',
    section: 'Reasoning',
    difficulty: 3,
    topic: 'Syllogism',
    q: {
      en: 'Statements: All engineers are graduates. Some graduates are teachers.\nConclusions: I. Some teachers are engineers. II. Some graduates are engineers.',
      hi: 'कथन: सभी इंजीनियर स्नातक हैं। कुछ स्नातक शिक्षक हैं।\nनिष्कर्ष: I. कुछ शिक्षक इंजीनियर हैं। II. कुछ स्नातक इंजीनियर हैं।',
    },
    options: ['Only I follows', 'Only II follows', 'Both follow', 'Neither follows'],
    optionsHi: ['केवल I सही है', 'केवल II सही है', 'दोनों सही हैं', 'कोई सही नहीं'],
    answer: 1,
    explanation: {
      en: 'All engineers are graduates, so some graduates must be engineers: II follows. Nothing links teachers to engineers, so I does not.',
      hi: 'सभी इंजीनियर स्नातक हैं, इसलिए कुछ स्नातक इंजीनियर होंगे ही: II सही है। शिक्षकों और इंजीनियरों में कोई संबंध नहीं दिया गया, इसलिए I नहीं।',
    },
    avgSec: 50,
  },
  {
    id: 'r-direction',
    section: 'Reasoning',
    difficulty: 3,
    topic: 'Direction sense',
    q: {
      en: 'Ravi walks 10 m north, turns right and walks 6 m, turns right again and walks 18 m, then turns left and walks 9 m. How far is he from the start, and in which direction?',
      hi: 'रवि 10 मी उत्तर चलता है, दाएँ मुड़कर 6 मी चलता है, फिर दाएँ मुड़कर 18 मी चलता है और फिर बाएँ मुड़कर 9 मी चलता है। वह शुरुआती बिंदु से कितनी दूर और किस दिशा में है?',
    },
    options: ['17 m, south-east', '15 m, east', '17 m, north-east', '13 m, south-east'],
    optionsHi: ['17 मी, दक्षिण-पूर्व', '15 मी, पूर्व', '17 मी, उत्तर-पूर्व', '13 मी, दक्षिण-पूर्व'],
    answer: 0,
    explanation: {
      en: 'Net movement: 15 m east and 8 m south. Distance = √(15² + 8²) = 17 m, towards the south-east.',
      hi: 'कुल विस्थापन: 15 मी पूर्व और 8 मी दक्षिण। दूरी = √(15² + 8²) = 17 मी, दक्षिण-पूर्व दिशा में।',
    },
    avgSec: 70,
  },

  // ------------------------------------------------------------------ Verbal
  {
    id: 'v-error',
    section: 'Verbal',
    difficulty: 1,
    topic: 'Grammar',
    q: {
      en: 'Spot the part with the error: “Each of the students have submitted the assignment on time.”',
      hi: 'वाक्य का गलत भाग पहचानें: “Each of the students have submitted the assignment on time.”',
    },
    options: ['Each of the students', 'have submitted', 'the assignment', 'on time'],
    answer: 1,
    explanation: {
      en: '“Each” is singular, so the verb must be singular too: “has submitted”, not “have submitted”.',
      hi: '“Each” एकवचन है, इसलिए क्रिया भी एकवचन होगी: “have submitted” की जगह “has submitted”।',
    },
    avgSec: 35,
  },
  {
    id: 'v-syn',
    section: 'Verbal',
    difficulty: 2,
    topic: 'Vocabulary',
    q: {
      en: 'Choose the word closest in meaning to METICULOUS.',
      hi: 'METICULOUS के सबसे निकट अर्थ वाला शब्द चुनें।',
    },
    options: ['Thorough', 'Careless', 'Hasty', 'Generous'],
    answer: 0,
    explanation: {
      en: 'Meticulous means paying great attention to detail, which is “thorough”.',
      hi: 'Meticulous का अर्थ है हर बारीकी पर ध्यान देना, यानी “thorough”।',
    },
    avgSec: 25,
  },
  {
    id: 'v-complete',
    section: 'Verbal',
    difficulty: 3,
    topic: 'Sentence completion',
    q: {
      en: 'Choose the word that best completes the sentence: “The committee’s report was so ______ that even experts struggled to follow its argument.”',
      hi: 'वाक्य को सबसे सही ढंग से पूरा करने वाला शब्द चुनें: “The committee’s report was so ______ that even experts struggled to follow its argument.”',
    },
    options: ['convoluted', 'lucid', 'concise', 'candid'],
    answer: 0,
    explanation: {
      en: 'Experts struggled to follow it, so the report was complicated: “convoluted”. Lucid, concise and candid all point the other way.',
      hi: 'विशेषज्ञों को भी समझने में कठिनाई हुई, यानी रिपोर्ट उलझी हुई थी: “convoluted”। Lucid, concise और candid इसके उलट अर्थ देते हैं।',
    },
    avgSec: 55,
  },
]

const BY_ID = new Map(APT_QUESTIONS.map((q) => [q.id, q]))

export function questionById(id: string | null | undefined): AptQuestion | undefined {
  return id ? BY_ID.get(id) : undefined
}

export function sectionOfSlot(slot: number): number {
  return Math.max(0, Math.min(APT_SECTIONS.length - 1, Math.floor(slot / SLOTS_PER_SECTION)))
}

export function slotsOfSection(section: number): number[] {
  return Array.from({ length: SLOTS_PER_SECTION }, (_, i) => section * SLOTS_PER_SECTION + i)
}

/**
 * Adaptive picker: the first unused question in the section at the current level;
 * otherwise the nearest level (harder first when tied, so a strong run stays challenging).
 */
export function pickQuestion(section: AptSection, level: Difficulty, used: ReadonlyArray<string | null>): AptQuestion {
  const usedSet = new Set(used.filter(Boolean) as string[])
  const pool = APT_QUESTIONS.filter((q) => q.section === section && !usedSet.has(q.id))
  const exact = pool.find((q) => q.difficulty === level)
  if (exact) return exact
  const ranked = [...pool].sort((a, b) => {
    const da = Math.abs(a.difficulty - level)
    const db = Math.abs(b.difficulty - level)
    return da - db || b.difficulty - a.difficulty
  })
  return ranked[0] ?? APT_QUESTIONS.find((q) => q.section === section) ?? APT_QUESTIONS[0]
}

/** Correct: one level up (max Hard). Wrong: one level down (min Easy). */
export function nextLevel(level: Difficulty, correct: boolean): Difficulty {
  const n = correct ? level + 1 : level - 1
  return Math.max(1, Math.min(3, n)) as Difficulty
}

// ---------------------------------------------------------------------------
// Difficulty ladder: step line of difficulty + ability estimate with a narrowing confidence band
// ---------------------------------------------------------------------------

export interface LadderStep {
  difficulty: Difficulty
  correct: boolean
  topic: string
}

export interface LadderPoint {
  name: string
  /** Difficulty the question was asked at (Start = the starting level). */
  difficulty: number | null
  ability: number | null
  band: [number, number] | null
  correct: boolean | null
}

const ABILITY_START = 50
const BAND_START = 18
const BAND_END = 6
const GAIN: Record<Difficulty, number> = { 1: 0.5, 2: 0.75, 3: 1 }
const LOSS: Record<Difficulty, number> = { 1: 1, 2: 0.75, 3: 0.5 }

const r1 = (n: number) => Math.round(n * 10) / 10

/**
 * Ability starts at 50 and moves ±8 weighted by difficulty (a hard item answered right moves it most,
 * an easy item missed moves it most). Steps shrink as evidence builds; the band narrows ±18 → ±6.
 * Always returns Start + `slots` points so the axis stays stable while the test runs.
 */
export function buildLadder(steps: ReadonlyArray<LadderStep>, slots = TOTAL_SLOTS): LadderPoint[] {
  const out: LadderPoint[] = [
    { name: 'Start', difficulty: START_LEVEL, ability: ABILITY_START, band: [ABILITY_START - BAND_START, ABILITY_START + BAND_START], correct: null },
  ]
  let ability = ABILITY_START
  const n = Math.max(slots, steps.length)
  for (let i = 0; i < n; i++) {
    const s = steps[i]
    if (!s) {
      out.push({ name: `Q${i + 1}`, difficulty: null, ability: null, band: null, correct: null })
      continue
    }
    const shrink = Math.max(0.35, 1 - 0.08 * i)
    const delta = 8 * (s.correct ? GAIN[s.difficulty] : -LOSS[s.difficulty]) * shrink
    ability = Math.max(5, Math.min(95, ability + delta))
    const w = Math.max(BAND_END, BAND_START - ((BAND_START - BAND_END) * (i + 1)) / Math.max(1, slots))
    out.push({
      name: `Q${i + 1}`,
      difficulty: s.difficulty,
      ability: r1(ability),
      band: [r1(Math.max(0, ability - w)), r1(Math.min(100, ability + w))],
      correct: s.correct,
    })
  }
  return out
}

/** Autopilot / fast-forward pattern by answer order: Q1 right, Q2 wrong, the rest right. */
export const AUTOPILOT_PATTERN: boolean[] = [true, false, true, true, true, true]

export function autopilotCorrect(k: number): boolean {
  return AUTOPILOT_PATTERN[k] ?? true
}

/** A wrong option that is deterministic (the next option after the answer). */
export function wrongOption(q: AptQuestion): number {
  return (q.answer + 1) % Math.max(1, q.options.length)
}

/** The ladder an autopilot run produces (used when the result is opened without a fresh run). */
export function simulatedSteps(): LadderStep[] {
  const used: string[] = []
  const steps: LadderStep[] = []
  let level: Difficulty = START_LEVEL
  for (let slot = 0; slot < TOTAL_SLOTS; slot++) {
    const section = APT_SECTIONS[sectionOfSlot(slot)].id
    const q = pickQuestion(section, level, used)
    used.push(q.id)
    const correct = autopilotCorrect(slot)
    steps.push({ difficulty: q.difficulty, correct, topic: q.topic })
    level = nextLevel(level, correct)
  }
  return steps
}

// ---------------------------------------------------------------------------
// Result constants (scores are locked to persona targets; the total comes from ROUND_TARGETS)
// ---------------------------------------------------------------------------

export interface AptResultSpec {
  sections: Record<AptSection, number>
  /** 'Top N%' in the Bihar 2027 cohort (demo). */
  topPct: number
}

export const APT_RESULT: Record<PersonaRunId, AptResultSpec> = {
  priya: { sections: { Numerical: 78, Reasoning: 74, Verbal: 63 }, topPct: 31 },
  rahul: { sections: { Numerical: 70, Reasoning: 62, Verbal: 60 }, topPct: 44 },
}

/** Display-only elimination variant (never written to the store). */
export const ELIMINATION_VARIANT = { section: 'Verbal' as AptSection, score: 54 }

/** Time per topic, seconds per question: candidate vs Bihar cohort average (illustrative full-length estimate). */
export const TOPIC_TIMES: { topic: string; you: number; avg: number }[] = [
  { topic: 'Percentages', you: 31, avg: 40 },
  { topic: 'Number series', you: 22, avg: 30 },
  { topic: 'Time & Work', you: 96, avg: 69 },
  { topic: 'Speed & Distance', you: 50, avg: 52 },
  { topic: 'Coding-decoding', you: 43, avg: 45 },
  { topic: 'Syllogism', you: 57, avg: 50 },
  { topic: 'Grammar', you: 36, avg: 35 },
  { topic: 'Vocabulary', you: 21, avg: 25 },
]

export const APT_SIGNALS: { kind: 'strength' | 'gap'; text: Bi }[] = [
  {
    kind: 'strength',
    text: {
      en: 'Fast and accurate on series & percentages',
      hi: 'सीरीज़ और प्रतिशत में तेज़ और सटीक',
      hinglish: 'Series aur percentages mein fast aur accurate',
    },
  },
  {
    kind: 'gap',
    text: {
      en: 'Time & Work: slow (avg 96s)',
      hi: 'टाइम एंड वर्क: धीमा (औसत 96 सेकंड)',
      hinglish: 'Time & Work: slow (avg 96s)',
    },
  },
]
