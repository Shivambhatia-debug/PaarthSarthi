// Round 3 · Versant/SVAR-style communication items (pure data, no React).
// Parts A and B carry small deliberate errors in their scripted transcripts so the live diff has
// something to colour. Part C's scripted answer contains 'basically' exactly twice (the AI tip counts it).
import type { Bi } from '@/lib/os/i18n'
import type { PersonaRunId } from '@/lib/mock/types'

export type CommPartId = 'A' | 'B' | 'C'
export type CommKind = 'read' | 'repeat' | 'open'

export interface CommItem {
  id: CommPartId
  kind: CommKind
  /** Short step label for the stepper. */
  step: Bi
  title: Bi
  instruction: Bi
  /** The sentence to read / repeat, or the open question. English (the test language). */
  prompt: string
  /** Hindi gloss of the open question, shown under it (C only). */
  promptHi?: string
  /** Recording limit in seconds. */
  seconds: number
  /** Scripted (demo) transcript per persona. */
  scripted: Record<PersonaRunId, string>
}

export const COMM_ITEMS: CommItem[] = [
  {
    id: 'A',
    kind: 'read',
    step: { en: 'Read aloud', hi: 'पढ़कर बोलें', hinglish: 'Read aloud' },
    title: { en: 'Part A · Read aloud', hi: 'भाग A · ज़ोर से पढ़ें', hinglish: 'Part A · Read aloud' },
    instruction: {
      en: 'Read the sentence aloud at a natural pace. Words light up as Sarthi hears them.',
      hi: 'वाक्य को सामान्य गति से ज़ोर से पढ़ें। सारथी जो शब्द सुनता है, वे हरे हो जाते हैं।',
      hinglish: 'Sentence ko natural pace mein zor se padhiye. Jo words Sarthi sunta hai, woh green ho jaate hain.',
    },
    prompt: "The quarterly report must be submitted before Friday's review meeting.",
    seconds: 15,
    scripted: {
      priya: 'The quarterly report must be submitted before Friday review meeting.',
      rahul: 'The quarterly report must be submit before Friday review meeting.',
    },
  },
  {
    id: 'B',
    kind: 'repeat',
    step: { en: 'Listen & repeat', hi: 'सुनें और दोहराएँ', hinglish: 'Listen & repeat' },
    title: { en: 'Part B · Listen & repeat', hi: 'भाग B · सुनें और दोहराएँ', hinglish: 'Part B · Listen & repeat' },
    instruction: {
      en: 'Listen once, then repeat the sentence exactly. The text stays hidden until you answer.',
      hi: 'एक बार सुनें, फिर वाक्य को हूबहू दोहराएँ। जवाब देने तक वाक्य छिपा रहेगा।',
      hinglish: 'Ek baar suniye, phir sentence ko exactly repeat kijiye. Jawab dene tak text chhupa rahega.',
    },
    prompt: 'Please confirm your interview slot by email before noon.',
    seconds: 12,
    scripted: {
      priya: 'Please confirm your interview slot on email before noon.',
      rahul: 'Please confirm interview slot on email before noon.',
    },
  },
  {
    id: 'C',
    kind: 'open',
    step: { en: 'Open answer', hi: 'खुला उत्तर', hinglish: 'Open answer' },
    title: { en: 'Part C · Open answer (30 s)', hi: 'भाग C · खुला उत्तर (30 सेकंड)', hinglish: 'Part C · Open answer (30 s)' },
    instruction: {
      en: 'Speak for up to 30 seconds. Sarthi measures pace, pauses and filler words.',
      hi: '30 सेकंड तक बोलें। सारथी गति, ठहराव और फ़िलर शब्द मापता है।',
      hinglish: '30 second tak boliye. Sarthi pace, pauses aur filler words measure karta hai.',
    },
    prompt: 'Describe your hometown to a new colleague.',
    promptHi: 'नए सहकर्मी को अपने शहर के बारे में बताइए।',
    seconds: 30,
    scripted: {
      priya:
        'My hometown is Purnia in north-east Bihar. Basically it is a calm city with maize and banana farms all around. The people are very warm and the food is simple, basically litti chokha and makhana. In winter the mornings are foggy. I would love to show you the old Kali temple.',
      rahul:
        'I am from Muzaffarpur in north Bihar. Basically it is famous for shahi litchi, and in May the whole city smells sweet. There are many small workshops and two-wheeler service centres, basically my favourite places. People are friendly and the markets stay open late.',
    },
  },
]

/** Versant-style subscores (20-80). Their mean equals VERSANT_TARGETS[persona] (Priya 50, Rahul 45). */
export interface VersantSubscores {
  pronunciation: number
  fluency: number
  sentenceMastery: number
  vocabulary: number
}

export const VERSANT_SUBSCORES: Record<PersonaRunId, VersantSubscores> = {
  priya: { pronunciation: 52, fluency: 47, sentenceMastery: 53, vocabulary: 49 },
  rahul: { pronunciation: 47, fluency: 43, sentenceMastery: 46, vocabulary: 44 },
}

export const SUBSCORE_LABELS: Record<keyof VersantSubscores, Bi> = {
  pronunciation: { en: 'Pronunciation', hi: 'उच्चारण' },
  fluency: { en: 'Fluency', hi: 'प्रवाह' },
  sentenceMastery: { en: 'Sentence mastery', hi: 'वाक्य-निपुणता' },
  vocabulary: { en: 'Vocabulary', hi: 'शब्दावली' },
}

export const SUBSCORE_KEYS: (keyof VersantSubscores)[] = ['pronunciation', 'fluency', 'sentenceMastery', 'vocabulary']

/** Versant-style communication cutoff used by communication-eliminatory blueprints. */
export const COMM_CUTOFF = 50

// ---------------------------------------------------------------------------
// Scripted speech simulation (deterministic, so WPM and pauses are stable across runs)
// ---------------------------------------------------------------------------

/** Simulated ms per spoken word (~130 WPM before pauses). */
export const SIM_WORD_MS = 460
/** Simulated pause after a comma (not counted as a long pause). */
export const SIM_COMMA_MS = 450
/** Simulated pause after a sentence end (counted as a long pause, ≥ 0.8 s). */
export const SIM_SENTENCE_MS = 1000
/** A gap at or above this counts as a long pause. */
export const LONG_PAUSE_MS = 800

export interface SimWord {
  word: string
  /** Simulated ms after the previous word before this one is heard. */
  gapMs: number
  /** True when the gap before this word is a long pause. */
  longPause: boolean
}

/** Splits a scripted transcript into words with simulated timing. */
export function simulateSpeech(text: string): { words: SimWord[]; totalMs: number; pauses: number } {
  const raw = (text || '').split(/\s+/).filter(Boolean)
  const words: SimWord[] = []
  let total = 0
  let pauses = 0
  raw.forEach((w, i) => {
    const prev = i > 0 ? raw[i - 1] : ''
    let gap = i === 0 ? 0 : SIM_WORD_MS
    let longPause = false
    if (/[.!?]$/.test(prev)) {
      gap += SIM_SENTENCE_MS
      longPause = SIM_SENTENCE_MS >= LONG_PAUSE_MS
    } else if (/[,;:]$/.test(prev)) {
      gap += SIM_COMMA_MS
    }
    if (longPause) pauses += 1
    total += gap
    words.push({ word: w, gapMs: gap, longPause })
  })
  // the last word itself takes a word-length to say
  if (raw.length) total += SIM_WORD_MS
  return { words, totalMs: total, pauses }
}
