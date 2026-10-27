/**
 * AI interview script (technical + HR phases, guest question, cue card).
 *
 * Pure data + tiny helpers: no React, no browser APIs (safe to import from server files, e.g. the runbook).
 *
 * - text: captions. hinglish is romanised.
 * - tts: what the hi-IN voice reads (Devanagari or Devanagari-mixed). With no hi-IN voice, en-IN reads text.hinglish.
 * - keywords: labels resolved through KEYWORD_ALIASES (lib/ai-sim); extra aliases inline where needed.
 * - scriptedAnswer: 40-60 words with 1-2 fillers and the keywords; used by scripted mode, Skip, autopilot, fast-forward.
 * - scores: narrative-locked (out of 10). Content average of each persona's tech phase matches INTERVIEW_SPLIT.
 */

import { bySex, tr, type Bi, type Lang } from '@/lib/os/i18n'
import type { KeywordSpec } from '@/lib/ai-sim'
import type { PersonaRunId } from '@/lib/mock/types'
import { PRIYA } from '@/lib/mock/personas'
import { VERSANT_TARGETS } from '@/lib/os/rounds'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Tri = { en: string; hi: string; hinglish: string }
export type Tts = { hi: string; hinglish: string }
export type Gender = 'F' | 'M'
export type Phase = 'tech' | 'hr'
export type Scores = { correctness: number; depth: number; clarity: number }
/** A tip, or a builder for Hindi verb agreement (bySex). */
export type TipSpec = Tri | ((g: Gender) => Tri)

/** How an answer to a question is detected and scored. */
export interface AnswerSpec {
  keywords: KeywordSpec[]
  scriptedAnswer: Tri
  modelAnswer: Bi
  scores: Scores
  tip: TipSpec
  /** Scripted-mode timing: first-word latency, a mid-answer pause, pace. */
  scripted?: { latencyMs?: number; pauseAfterWord?: number; pauseMs?: number; wpm?: number }
}

export interface FollowUpSpec {
  /** Triggers: keywords heard in the parent answer. */
  keywords: KeywordSpec[]
  text: Tri
  tts: Tts
  /** How the follow-up itself is answered and scored. */
  ask: AnswerSpec
}

export interface FallbackFollowUp {
  text: Tri
  tts: Tts
  ask: AnswerSpec
}

export interface IQ extends AnswerSpec {
  id: string
  phase: Phase
  /** Short topic for chips and the transcript. */
  topic: Bi
  text: Tri
  tts: Tts
  usesSignal?: { round: 'technical' | 'communication'; fallbackChip: string }
  followUps?: FollowUpSpec[]
  fallbackFollowUp?: FallbackFollowUp
  kind?: 'sql' | 'guest' | 'followup'
  /** HR relocation question: stream the measured hesitation flag after scoring. */
  hesitationCheck?: boolean
  /** Inserted follow-ups only. */
  parentId?: string
  /** Inserted follow-ups only: the keyword label that triggered it (null for the generic fallback). */
  because?: string | null
}

export interface PersonaScript {
  tech: IQ[]
  hr: IQ[]
  guest: IQ
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function labelOf(k: KeywordSpec): string {
  return typeof k === 'string' ? k : k.label
}

export function tipFor(tip: TipSpec, g: Gender): Tri {
  return typeof tip === 'function' ? tip(g) : tip
}

/** Caption / answer text for a language (hinglish falls back to en only if empty). */
export function triText(t: Tri | Bi, lang: Lang): string {
  return tr(t, lang)
}

const same = (en: string, hi: string, hinglish: string): Tri => ({ en, hi, hinglish })

// Extra aliases used by several questions (KEYWORD_ALIASES covers the shared vocabulary).
const K = {
  On2: { label: 'O(n²)', aliases: ['o(n^2)', 'o n square', 'n square', 'quadratic', 'एन स्क्वायर', 'ओ एन स्क्वायर', 'o(n²)'] },
  contextSwitch: { label: 'context switch', aliases: ['context switch', 'context switching', 'कॉन्टेक्स्ट स्विच'] },
  shared: { label: 'shared memory', aliases: ['shared', 'share', 'शेयर', 'साझा'] },
  MAX: { label: 'MAX', aliases: ['max', 'maximum', 'मैक्स', 'मैक्सिमम'] },
  denseRank: { label: 'DENSE_RANK', aliases: ['dense rank', 'dense_rank', 'denserank', 'डेंस रैंक'] },
  duplicate: { label: 'duplicates', aliases: ['duplicate', 'duplicates', 'डुप्लीकेट'] },
  wifi: { label: 'Wi-Fi', aliases: ['wifi', 'wi fi', 'wi-fi', 'वाईफाई', 'वाई-फाई', 'वाई फाई'] },
  deepSleep: { label: 'deep sleep', aliases: ['deep sleep', 'डीप स्लीप'] },
  cost: { label: 'cost', aliases: ['cost', 'sasta', 'price', 'सस्ता', 'कीमत', 'कॉस्ट'] },
  qos1: { label: 'QoS 1', aliases: ['qos 1', 'qos one', 'qos level 1', 'क्यूओएस 1', 'क्यू ओ एस 1'] },
  atLeastOnce: { label: 'at least once', aliases: ['at least once', 'कम से कम एक बार'] },
  retry: { label: 'retry', aliases: ['retry', 'retries', 'रीट्राई', 'दोबारा'] },
  buffer: { label: 'buffer', aliases: ['buffer', 'queue', 'बफ़र', 'बफर'] },
  calibration: { label: 'calibration', aliases: ['calibration', 'calibrate', 'कैलिब्रेशन', 'कैलिब्रेट'] },
  average: { label: 'moving average', aliases: ['moving average', 'average', 'एवरेज', 'औसत'] },
  ece: { label: 'ECE', aliases: ['ece', 'electronics', 'ईसीई', 'इलेक्ट्रॉनिक्स'] },
  project: { label: 'Khet-Nami', aliases: ['khet-nami', 'khet nami', 'project', 'खेत-नमी', 'खेत नमी', 'प्रोजेक्ट'] },
  iot: { label: 'IoT', aliases: ['iot', 'embedded', 'आईओटी', 'एम्बेडेड'] },
  firstGen: { label: 'first-generation', aliases: ['pehli', 'first in my family', 'first generation', 'पहली'] },
  family: { label: 'family', aliases: ['family', 'ghar', 'parivaar', 'परिवार', 'घर', 'फैमिली'] },
  ready: { label: 'ready', aliases: ['ready', 'taiyaar', 'taiyar', 'तैयार'] },
  bond: { label: 'bond', aliases: ['bond', 'agreement', 'बॉन्ड', 'एग्रीमेंट'] },
  training: { label: 'training', aliases: ['training', 'ट्रेनिंग', 'प्रशिक्षण'] },
  terms: { label: 'terms', aliases: ['terms', 'exit clause', 'duration', 'शर्तें', 'अवधि'] },
  lead: { label: 'lead', aliases: ['lead', 'team lead', 'लीड'] },
  bihar: { label: 'Bihar', aliases: ['bihar', 'बिहार', 'gaon', 'गाँव', 'village'] },
  learn: { label: 'learning', aliases: ['seekh', 'learn', 'learning', 'सीख', 'सीखना'] },
  coolant: { label: 'coolant', aliases: ['coolant', 'कूलेंट'] },
  feed: { label: 'feed rate', aliases: ['feed rate', 'feed', 'फ़ीड रेट', 'फीड रेट', 'फ़ीड'] },
  spindle: { label: 'spindle speed', aliases: ['spindle speed', 'spindle', 'rpm', 'स्पिंडल', 'आरपीएम'] },
  wear: { label: 'tool wear', aliases: ['tool wear', 'wear', 'ghisa', 'घिसाव', 'घिसा'] },
  temperature: { label: 'temperature', aliases: ['temperature', 'temp', 'तापमान', 'टेम्परेचर'] },
  cutoff: { label: 'cut-off', aliases: ['cut-off', 'cut off', 'cutoff', 'कट-ऑफ़', 'कट ऑफ', 'कट-ऑफ'] },
  rpm: { label: 'RPM', aliases: ['rpm', 'आरपीएम'] },
  lowGear: { label: 'low gear', aliases: ['low gear', 'neeche wala gear', 'first gear', 'निचला गियर', 'नीचे वाला गियर', 'पहला गियर'] },
  discipline: { label: 'routine', aliases: ['routine', 'discipline', 'अनुशासन', 'रूटीन'] },
  hostel: { label: 'stay', aliases: ['hostel', 'room', 'kamra', 'कमरा', 'हॉस्टल', 'रहने'] },
  apprentice: { label: 'apprenticeship', aliases: ['apprenticeship', 'apprentice', 'अप्रेंटिसशिप', 'अप्रेंटिस'] },
  skills: { label: 'skills', aliases: ['skill', 'skills', 'स्किल', 'स्किल्स'] },
  stipend: { label: 'stipend', aliases: ['stipend', 'स्टाइपेंड', 'वजीफ़ा'] },
  certificate: { label: 'certificate', aliases: ['certificate', 'सर्टिफ़िकेट', 'सर्टिफिकेट', 'प्रमाणपत्र'] },
  pilot: { label: 'pilot', aliases: ['pilot', 'पायलट'] },
  offline: { label: 'offline', aliases: ['offline', 'ऑफ़लाइन', 'ऑफलाइन', 'ivr', 'call', 'कॉल'] },
  panchayat: { label: 'panchayat', aliases: ['panchayat', 'पंचायत', 'mukhiya', 'मुखिया'] },
  measure: { label: 'measure', aliases: ['measure', 'naap', 'नापेंगे', 'नाप', 'track'] },
} satisfies Record<string, KeywordSpec>

// ---------------------------------------------------------------------------
// The cue card (Priya T2). The integration runbook prints it.
// ---------------------------------------------------------------------------

export const CUE_CARD: Tri = {
  en: 'Basically, on Khet-Nami I wrote the soil-moisture sensor firmware on the ESP32. Data goes to the cloud over MQTT, and when moisture drops below 30 percent the farmer gets a Hindi SMS. With deep sleep, battery life went from 3 days to 11 days.',
  hi: 'मतलब, खेत-नमी में मैंने ESP32 पर सॉइल-मॉइस्चर सेंसर का फ़र्मवेयर लिखा। डेटा MQTT से क्लाउड पर जाता है, और नमी 30 प्रतिशत से कम होने पर किसान को हिंदी SMS मिलता है। डीप स्लीप से बैटरी 3 दिन से 11 दिन तक चली।',
  hinglish:
    'Matlab, Khet-Nami mein maine ESP32 par soil-moisture sensor ka firmware likha. Data MQTT se cloud par jaata hai, aur nami 30 percent se kam hone par kisan ko Hindi SMS milta hai. Deep sleep se battery 3 din se 11 din tak chali.',
}

// ---------------------------------------------------------------------------
// Guest question (fix 10): for an invited official, both personas.
// ---------------------------------------------------------------------------

const GUEST_TIP: Tri = {
  en: 'Strong answers name one user, one problem and one number to track. "Farmers in Kosi villages, flood warnings, alerts delivered in under 10 minutes."',
  hi: 'अच्छे जवाब में एक उपयोगकर्ता, एक समस्या और मापने लायक एक आँकड़ा होता है: "कोसी के गाँवों के किसान, बाढ़ की चेतावनी, 10 मिनट के अंदर अलर्ट।"',
  hinglish:
    'Achhe jawab mein ek user, ek problem aur track karne layak ek number hota hai: "Kosi ke gaon ke kisan, baadh ki chetavani, 10 minute ke andar alert."',
}

const GUEST_FU_ASK = (scriptedAnswer: Tri, keywords: KeywordSpec[], modelAnswer: Bi): AnswerSpec => ({
  keywords,
  scriptedAnswer,
  modelAnswer,
  scores: { correctness: 8, depth: 7, clarity: 7 },
  tip: GUEST_TIP,
})

const GUEST: IQ = {
  id: 'G1',
  phase: 'tech',
  kind: 'guest',
  topic: { en: 'Guest question', hi: 'अतिथि प्रश्न', hinglish: 'Guest question' },
  text: {
    en: 'If you had to build one technology project for your district, what would it be and why?',
    hi: 'अगर आपको अपने ज़िले के लिए एक टेक्नोलॉजी प्रोजेक्ट बनाना हो, तो क्या बनाएँगे और क्यों?',
    hinglish: 'Agar aapko apne zile ke liye ek technology project banana ho, toh kya banayenge aur kyun?',
  },
  tts: {
    hi: 'अगर आपको अपने ज़िले के लिए एक टेक्नोलॉजी प्रोजेक्ट बनाना हो, तो क्या बनाएँगे और क्यों?',
    hinglish: 'अगर आपको अपने ज़िले के लिए एक टेक्नोलॉजी प्रोजेक्ट बनाना हो, तो क्या बनाएँगे और क्यों?',
  },
  keywords: ['farmer', 'water', 'school', 'hospital', 'app', 'solar', 'internet', 'data', 'road', 'flood'],
  scriptedAnswer: {
    en: 'My idea is a flood alert system. Basically, the Kosi area floods every year. River sensor data would reach villages through an app and SMS, so families can move out in time. It would run on solar, so power cuts are not a problem.',
    hi: 'मेरा आइडिया बाढ़ अलर्ट सिस्टम है। मतलब, कोसी इलाके में हर साल बाढ़ आती है। नदी के सेंसर का डेटा ऐप और SMS से गाँव तक पहुँचेगा, ताकि परिवार समय रहते निकल सकें। यह सोलर से चलेगा, तो बिजली कटने की दिक्कत नहीं होगी।',
    hinglish:
      'Mera idea ek flood alert system hai. Matlab, Kosi ilaake mein har saal baadh aati hai. River sensor ka data app aur SMS se gaon tak pahunchega, taaki parivaar samay rehte nikal sakein. Yeh solar se chalega, toh bijli katne ki dikkat nahi hogi.',
  },
  modelAnswer: {
    en: 'A strong pitch names the user (families in flood-prone Kosi villages), the problem (warnings arrive too late), the build (river-level sensors → cloud → app, SMS and IVR in Hindi and Maithili), why now (solar + 4G coverage), and one success metric (alert-to-evacuation time). It also says who runs it: the panchayat and the district disaster cell.',
    hi: 'मज़बूत जवाब में उपयोगकर्ता (कोसी के बाढ़ वाले गाँवों के परिवार), समस्या (चेतावनी देर से पहुँचती है), समाधान (नदी-स्तर सेंसर → क्लाउड → हिंदी और मैथिली में ऐप, SMS और IVR), अभी क्यों (सोलर और 4G), और सफलता का एक पैमाना (अलर्ट से निकासी तक का समय) होता है। साथ ही यह भी कि इसे कौन चलाएगा: पंचायत और ज़िला आपदा सेल।',
  },
  scores: { correctness: 8, depth: 7, clarity: 7 },
  tip: GUEST_TIP,
  followUps: [
    {
      keywords: ['farmer'],
      text: {
        en: 'How will this reach farmers, including those without a smartphone?',
        hi: 'यह किसानों तक कैसे पहुँचेगा, उन तक भी जिनके पास स्मार्टफ़ोन नहीं है?',
        hinglish: 'Yeh kisanon tak kaise pahunchega, unke paas bhi jinke paas smartphone nahi hai?',
      },
      tts: {
        hi: 'यह किसानों तक कैसे पहुँचेगा, उन तक भी जिनके पास स्मार्टफ़ोन नहीं है?',
        hinglish: 'ये किसानों तक कैसे पहुँचेगा, उनके पास भी जिनके पास स्मार्टफ़ोन नहीं है?',
      },
      ask: GUEST_FU_ASK(
        {
          en: 'Through a missed-call IVR in Hindi and a weekly SMS. The panchayat office keeps one shared tablet, and the agriculture volunteer shows it in village meetings. Basically, offline first, app second.',
          hi: 'हिंदी IVR मिस्ड कॉल और हर हफ़्ते SMS से। पंचायत ऑफ़िस में एक टैबलेट रहेगा और कृषि स्वयंसेवक गाँव की बैठक में दिखाएगा। मतलब, पहले ऑफ़लाइन, फिर ऐप।',
          hinglish:
            'Hindi IVR missed call aur har hafte SMS se. Panchayat office mein ek tablet rahega aur krishi volunteer gaon ki meeting mein dikhayega. Matlab, pehle offline, phir app.',
        },
        [K.offline, 'SMS', K.panchayat],
        {
          en: 'Design for feature phones first: IVR and SMS in Hindi and Maithili, a panchayat-level assisted channel, and the app as an add-on.',
          hi: 'पहले फ़ीचर फ़ोन के लिए डिज़ाइन करें: हिंदी और मैथिली में IVR और SMS, पंचायत स्तर पर सहायक, और ऐप बाद में।',
        },
      ),
    },
    {
      keywords: ['water'],
      text: {
        en: 'Who will collect the water data, and how will you keep it up to date?',
        hi: 'पानी का डेटा कौन इकट्ठा करेगा, और उसे अपडेट कैसे रखेंगे?',
        hinglish: 'Paani ka data kaun collect karega, aur use update kaise rakhenge?',
      },
      tts: {
        hi: 'पानी का डेटा कौन इकट्ठा करेगा, और उसे अपडेट कैसे रखेंगे?',
        hinglish: 'पानी का डेटा कौन कलेक्ट करेगा, और उसे अपडेट कैसे रखेंगे?',
      },
      ask: GUEST_FU_ASK(
        {
          en: 'Sensors send readings every hour on their own. Basically, the polytechnic students maintain them as a lab project, and the panchayat gets a monthly report.',
          hi: 'सेंसर हर घंटे खुद रीडिंग भेजेंगे। मतलब, पॉलिटेक्निक के छात्र इन्हें लैब प्रोजेक्ट की तरह संभालेंगे, और पंचायत को हर महीने रिपोर्ट मिलेगी।',
          hinglish:
            'Sensor har ghante khud reading bhejenge. Matlab, polytechnic ke students inhe lab project ki tarah sambhalenge, aur panchayat ko har mahine report milegi.',
        },
        ['sensor', 'data', K.panchayat],
        {
          en: 'Automate collection (sensors), assign ownership (local polytechnic + panchayat) and publish a simple monthly dashboard so the data stays trusted.',
          hi: 'डेटा अपने-आप इकट्ठा हो (सेंसर), ज़िम्मेदारी तय हो (स्थानीय पॉलिटेक्निक + पंचायत) और हर महीने एक सरल डैशबोर्ड बने, ताकि डेटा पर भरोसा बना रहे।',
        },
      ),
    },
    {
      keywords: ['school'],
      text: {
        en: 'Which one school would you pilot this in first, and how would you measure success?',
        hi: 'इसे सबसे पहले किस एक स्कूल में पायलट करेंगे, और सफलता कैसे नापेंगे?',
        hinglish: 'Ise sabse pehle kis ek school mein pilot karenge, aur success kaise naapenge?',
      },
      tts: {
        hi: 'इसे सबसे पहले किस एक स्कूल में पायलट करेंगे, और सफलता कैसे नापेंगे?',
        hinglish: 'इसे सबसे पहले किस एक स्कूल में पायलट करेंगे, और सक्सेस कैसे नापेंगे?',
      },
      ask: GUEST_FU_ASK(
        {
          en: 'The government school nearest the block office, because teachers there are willing. Basically, I would measure attendance and test scores after one term.',
          hi: 'ब्लॉक ऑफ़िस के सबसे पास वाला सरकारी स्कूल, क्योंकि वहाँ के शिक्षक तैयार हैं। मतलब, एक टर्म के बाद हाज़िरी और टेस्ट स्कोर नापूँगा।',
          hinglish:
            'Block office ke sabse paas wala sarkari school, kyunki wahan ke teachers taiyaar hain. Matlab, ek term ke baad attendance aur test score naapenge.',
        },
        ['school', K.pilot, K.measure],
        {
          en: 'Pick a willing, reachable school; fix 2 metrics before starting (attendance, learning score); compare against a similar school after one term.',
          hi: 'एक तैयार और पास का स्कूल चुनें; शुरू करने से पहले 2 पैमाने तय करें (हाज़िरी, सीखने का स्कोर); एक टर्म बाद मिलते-जुलते स्कूल से तुलना करें।',
        },
      ),
    },
    {
      keywords: ['app'],
      text: {
        en: 'How will this app work for people who have no internet?',
        hi: 'जिन लोगों के पास इंटरनेट नहीं है, उनके लिए यह ऐप कैसे काम करेगा?',
        hinglish: 'Jin logon ke paas internet nahi hai, unke liye yeh app kaise kaam karega?',
      },
      tts: {
        hi: 'जिन लोगों के पास इंटरनेट नहीं है, उनके लिए यह ऐप कैसे काम करेगा?',
        hinglish: 'जिन लोगों के पास इंटरनेट नहीं है, उनके लिए ये ऐप कैसे काम करेगा?',
      },
      ask: GUEST_FU_ASK(
        {
          en: 'The alert goes out by SMS and a voice call, not only the app. Basically, the app is for the panchayat and volunteers; families just need any basic phone.',
          hi: 'अलर्ट SMS और वॉइस कॉल से जाएगा, सिर्फ़ ऐप से नहीं। मतलब, ऐप पंचायत और स्वयंसेवकों के लिए है; परिवारों को बस कोई भी साधारण फ़ोन चाहिए।',
          hinglish:
            'Alert SMS aur voice call se jaayega, sirf app se nahi. Matlab, app panchayat aur volunteers ke liye hai; parivaaron ko bas koi bhi basic phone chahiye.',
        },
        ['SMS', K.offline, K.panchayat],
        {
          en: 'Offline-first: SMS, IVR and missed-call flows reach everyone; the app serves field workers and syncs when a network is available.',
          hi: 'ऑफ़लाइन-पहले: SMS, IVR और मिस्ड-कॉल से सब तक पहुँचें; ऐप फ़ील्ड कर्मचारियों के लिए हो और नेटवर्क मिलने पर सिंक करे।',
        },
      ),
    },
  ],
  fallbackFollowUp: {
    text: {
      en: 'How would you test this in the first 90 days?',
      hi: 'पहले 90 दिनों में आप इसे कैसे परखेंगे?',
      hinglish: 'Pehle 90 din mein aap ise kaise test karenge?',
    },
    tts: {
      hi: 'पहले 90 दिनों में आप इसे कैसे परखेंगे?',
      hinglish: 'पहले नब्बे दिन में आप इसे कैसे टेस्ट करेंगे?',
    },
    ask: GUEST_FU_ASK(
      {
        en: 'One block, one season. Basically, start with 5 villages, track how many people the alerts reach and how fast, then fix the gaps before scaling to the district.',
        hi: 'एक ब्लॉक, एक मौसम। मतलब, 5 गाँवों से शुरू करें, देखें कि अलर्ट कितने लोगों तक और कितनी जल्दी पहुँचता है, फिर ज़िले में फैलाने से पहले कमियाँ ठीक करें।',
        hinglish:
          'Ek block, ek season. Matlab, 5 gaon se shuru karenge, dekhenge alert kitne logon tak aur kitni jaldi pahunchta hai, phir zile mein failane se pehle kamiyan theek karenge.',
      },
      [K.pilot, K.measure, 'data'],
      {
        en: 'Small pilot (one block), 2-3 metrics fixed up front, weekly review, and a go / no-go decision at day 90.',
        hi: 'छोटा पायलट (एक ब्लॉक), पहले से तय 2-3 पैमाने, हर हफ़्ते समीक्षा, और 90वें दिन आगे बढ़ने या रुकने का फ़ैसला।',
      },
    ),
  },
}

// ---------------------------------------------------------------------------
// Priya (B.Tech ECE, Hindi medium, F)
// ---------------------------------------------------------------------------

const PRIYA_TECH: IQ[] = [
  {
    id: 'T1',
    phase: 'tech',
    topic: { en: 'list.remove() fix', hi: 'list.remove() सुधार', hinglish: 'list.remove() fix' },
    usesSignal: { round: 'technical', fallbackChip: 'brute force (list.remove)' },
    text: {
      en: 'In Round 2 you first used list.remove(). Why was that slow, and how did you fix it?',
      hi: 'राउंड 2 में आपने पहले list.remove() इस्तेमाल किया था — वह धीमा क्यों था, और आपने उसे कैसे ठीक किया?',
      hinglish: 'Round 2 mein aapne pehle list.remove() use kiya tha — woh slow kyun tha, aur aapne kaise fix kiya?',
    },
    tts: {
      hi: 'राउंड 2 में आपने पहले list.remove() इस्तेमाल किया था — वह धीमा क्यों था, और आपने उसे कैसे ठीक किया?',
      hinglish: 'राउंड 2 में आपने पहले list.remove() यूज़ किया था — वो स्लो क्यों था, और आपने उसे कैसे फ़िक्स किया?',
    },
    keywords: ['O(n)', 'shift', 'two pointer', 'linear', 'remove', K.On2],
    scriptedAnswer: {
      en: 'Basically, list.remove() shifts all the remaining elements every time, so one remove is O(n) and inside the loop the whole thing became O(n²). I switched to a two pointer approach: one pointer reads, the other writes. That made it a single linear pass, and all the test cases passed.',
      hi: 'बेसिकली, list.remove() हर बार बाकी एलिमेंट्स को शिफ्ट करता है, इसलिए एक remove O(n) है और लूप के अंदर पूरा O(n²) हो गया। मैंने टू पॉइंटर तरीका अपनाया: एक पॉइंटर पढ़ता है, दूसरा लिखता है। इससे एक ही लीनियर पास में काम हो गया और सारे टेस्ट केस पास हो गए।',
      hinglish:
        'Basically list.remove() har baar baaki elements ko shift karta hai, isliye ek remove O(n) hai aur loop ke andar poora O(n²) ho gaya. Maine two pointer approach use kiya: ek pointer padhta hai, doosra likhta hai. Isse ek hi linear pass mein kaam ho gaya aur saare test cases pass ho gaye.',
    },
    modelAnswer: {
      en: 'list.remove() is O(n) because every later element shifts left, so calling it inside a loop makes the solution O(n²). Fix: one two-pointer pass (a read pointer and a write pointer) that keeps the wanted elements in place, then truncate: O(n) time, O(1) extra space. Trade-off worth naming: a list comprehension is also O(n) but uses O(n) extra memory.',
      hi: 'list.remove() O(n) है क्योंकि उसके बाद के सारे एलिमेंट बाईं ओर खिसकते हैं, इसलिए लूप में इसे बुलाने से हल O(n²) हो जाता है। सुधार: टू-पॉइंटर (पढ़ने और लिखने वाला पॉइंटर) से एक ही पास, जिसमें ज़रूरी एलिमेंट अपनी जगह रहें, फिर बाकी हटा दें: O(n) समय, O(1) अतिरिक्त मेमोरी। एक तुलना भी बताएँ: list comprehension भी O(n) है पर O(n) अतिरिक्त मेमोरी लेता है।',
    },
    scores: { correctness: 8, depth: 7, clarity: 5 },
    tip: (g) => ({
      en: 'Lead with the complexity in one line ("remove() is O(n), so the loop was O(n²)"), then the fix. Interviewers want the headline first.',
      hi: `पहली पंक्ति में कॉम्प्लेक्सिटी बोलिए ("remove() O(n) है, इसलिए लूप O(n²) हो गया"), फिर समाधान। ऐसे आप 30 सेकंड में पूरा जवाब दे ${bySex(g, 'सकती', 'सकते')} हैं।`,
      hinglish: `Pehli line mein complexity boliye ("remove() O(n) hai, isliye loop O(n²) ho gaya"), phir fix. Aise aap 30 second mein poora jawab de ${bySex(g, 'sakti', 'sakte')} hain.`,
    }),
  },
  {
    id: 'T2',
    phase: 'tech',
    topic: { en: 'Khet-Nami project', hi: 'खेत-नमी प्रोजेक्ट', hinglish: 'Khet-Nami project' },
    text: {
      en: 'Tell me about your final-year project, Khet-Nami. What exactly was your contribution?',
      hi: 'अपने फ़ाइनल-ईयर प्रोजेक्ट खेत-नमी के बारे में बताइए — उसमें आपका ठीक-ठीक योगदान क्या था?',
      hinglish: 'Apne final-year project Khet-Nami ke baare mein bataiye — aapka exact contribution kya tha?',
    },
    tts: {
      hi: 'अपने फ़ाइनल-ईयर प्रोजेक्ट खेत-नमी के बारे में बताइए — उसमें आपका ठीक-ठीक योगदान क्या था?',
      hinglish: 'अपने फ़ाइनल-ईयर प्रोजेक्ट खेत-नमी के बारे में बताइए — आपका एग्ज़ैक्ट कॉन्ट्रिब्यूशन क्या था?',
    },
    keywords: [...(PRIYA?.project?.keywords ?? ['ESP32', 'sensor', 'MQTT', 'latency', 'battery', 'cloud', 'SMS'])],
    scriptedAnswer: CUE_CARD,
    modelAnswer: {
      en: 'Strong answers separate "I" from "we" and name owner-level decisions: "I wrote the ESP32 firmware and the MQTT pipeline; I chose deep sleep, which took battery life from 3 to 11 days, and a 30% moisture threshold for Hindi SMS alerts." Then add one impact number (farmers reached, water saved) and one thing you would change next.',
      hi: 'अच्छे जवाब में "मैंने" और "हमने" अलग होते हैं और अपने फ़ैसले बताए जाते हैं: "मैंने ESP32 फ़र्मवेयर और MQTT पाइपलाइन लिखी; मैंने डीप स्लीप चुना, जिससे बैटरी 3 से 11 दिन चली, और हिंदी SMS अलर्ट के लिए 30% नमी की सीमा रखी।" फिर असर का एक आँकड़ा (कितने किसान, कितना पानी बचा) और आगे क्या बदलेंगे, यह जोड़ें।',
    },
    scores: { correctness: 8, depth: 8, clarity: 6 },
    tip: {
      en: 'Great ownership. Add one impact number (farmers reached, water saved), and say "I" for your part and "we" for the team.',
      hi: 'ओनरशिप अच्छी दिखी। असर का एक आँकड़ा जोड़िए (कितने किसान, कितना पानी बचा), और अपने काम के लिए "मैंने", टीम के लिए "हमने" बोलिए।',
      hinglish:
        'Ownership achhi dikhi. Ek impact number jodiye (kitne kisan, kitna paani bacha), aur apne kaam ke liye "maine", team ke liye "humne" boliye.',
    },
    followUps: [
      {
        keywords: ['ESP32'],
        text: {
          en: 'Why did you choose the ESP32 and not an Arduino Uno?',
          hi: 'आपने ESP32 ही क्यों चुना, Arduino Uno क्यों नहीं?',
          hinglish: 'Aapne ESP32 kyun choose kiya, Arduino Uno kyun nahi?',
        },
        tts: {
          hi: 'आपने ESP32 ही क्यों चुना, Arduino Uno क्यों नहीं?',
          hinglish: 'आपने ESP32 क्यों चूज़ किया, Arduino Uno क्यों नहीं?',
        },
        ask: {
          keywords: [K.wifi, K.deepSleep, 'battery', K.cost],
          scriptedAnswer: {
            en: 'The ESP32 has Wi-Fi built in, so I did not need a separate module. Its deep sleep mode took the battery from 3 days to 11 days. The Uno has no Wi-Fi and much less RAM. Basically, the cost was almost the same, so the ESP32 was the clear choice.',
            hi: 'ESP32 में Wi-Fi पहले से है, तो अलग मॉड्यूल नहीं लगाना पड़ा। उसके डीप स्लीप मोड से बैटरी 3 दिन से 11 दिन तक चली। Uno में न Wi-Fi है, न इतनी RAM। मतलब, कीमत लगभग बराबर थी, इसलिए ESP32 सीधा बेहतर विकल्प था।',
            hinglish:
              'ESP32 mein Wi-Fi built-in hai, toh alag module nahi lagana pada. Deep sleep mode se battery 3 din se 11 din tak chali. Uno mein na Wi-Fi hai, na itni RAM. Matlab, cost lagbhag same thi, isliye ESP32 seedha better choice tha.',
          },
          modelAnswer: {
            en: 'Compare on the constraints that mattered: connectivity (ESP32 has Wi-Fi/BLE built in), power (deep-sleep current in microamps vs an always-on Uno), memory (520 KB SRAM vs 2 KB) and cost (similar). Close with the trade-off: the ESP32 is 3.3 V logic, so sensor levels had to match.',
            hi: 'जो शर्तें मायने रखती थीं उन पर तुलना करें: कनेक्टिविटी (ESP32 में Wi-Fi/BLE पहले से), बिजली (डीप स्लीप में माइक्रोएम्पियर करंट, जबकि Uno हमेशा चालू), मेमोरी (520 KB बनाम 2 KB SRAM) और कीमत (लगभग बराबर)। अंत में कमी भी बताएँ: ESP32 का लॉजिक 3.3 V है, इसलिए सेंसर के लेवल मिलाने पड़े।',
          },
          scores: { correctness: 8, depth: 8, clarity: 6 },
          tip: {
            en: 'Compare on 3 axes (connectivity, power, cost) and end with one trade-off. That is how senior engineers answer "why X over Y".',
            hi: '3 बातों पर तुलना कीजिए (कनेक्टिविटी, बिजली, कीमत) और अंत में एक कमी बताइए। सीनियर इंजीनियर "X क्यों, Y क्यों नहीं" का जवाब ऐसे ही देते हैं।',
            hinglish:
              '3 cheezon par compare kijiye (connectivity, power, cost) aur end mein ek trade-off boliye. Senior engineers "X kyun, Y kyun nahi" ka jawab aise hi dete hain.',
          },
        },
      },
      {
        keywords: ['MQTT'],
        text: {
          en: 'Which MQTT QoS level did you use, and why?',
          hi: 'MQTT में आपने कौन-सा QoS लेवल रखा और क्यों?',
          hinglish: 'MQTT mein QoS level kaunsa rakha aur kyun?',
        },
        tts: {
          hi: 'MQTT में आपने कौन-सा QoS लेवल रखा और क्यों?',
          hinglish: 'MQTT में QoS लेवल कौन-सा रखा और क्यों?',
        },
        ask: {
          keywords: [K.qos1, K.atLeastOnce, K.duplicate, 'battery'],
          scriptedAnswer: {
            en: 'I used QoS 1, at least once delivery. A soil reading should never be missed, and an occasional duplicate is dropped on the server using the timestamp. Basically, QoS 2 needs a longer handshake, which costs more battery and data.',
            hi: 'मैंने QoS 1 रखा, यानी at least once डिलीवरी। मिट्टी की कोई रीडिंग छूटनी नहीं चाहिए, और कभी-कभार आया डुप्लीकेट मैसेज सर्वर पर टाइमस्टैम्प से हटा दिया जाता है। मतलब, QoS 2 में हैंडशेक लंबा है, जिससे बैटरी और डेटा ज़्यादा लगते।',
            hinglish:
              'Maine QoS 1 rakha, yaani at least once delivery. Soil reading kabhi miss nahi honi chahiye, aur kabhi-kabhar aaya duplicate message server side pe timestamp se hata diya jaata hai. Matlab, QoS 2 mein handshake lamba hai, jisse battery aur data zyada lagte.',
          },
          modelAnswer: {
            en: 'QoS 0 = at most once, 1 = at least once, 2 = exactly once. For periodic sensor readings QoS 1 is the usual choice: no lost readings, duplicates are cheap to de-duplicate (timestamp or message id), and it avoids QoS 2\'s four-step handshake that costs battery on a sleeping device.',
            hi: 'QoS 0 = ज़्यादा से ज़्यादा एक बार, 1 = कम से कम एक बार, 2 = ठीक एक बार। समय-समय पर आने वाली सेंसर रीडिंग के लिए QoS 1 आम पसंद है: कोई रीडिंग नहीं खोती, डुप्लीकेट हटाना आसान है (टाइमस्टैम्प या मैसेज id), और QoS 2 का चार-चरण वाला हैंडशेक नहीं लगता जो सोते हुए डिवाइस की बैटरी खाता है।',
          },
          scores: { correctness: 8, depth: 7, clarity: 6 },
          tip: {
            en: 'Name all three QoS levels in one breath, then justify yours. It shows you chose, not copied.',
            hi: 'तीनों QoS लेवल एक साथ बताइए, फिर अपनी पसंद की वजह। इससे दिखता है कि आपने सोचकर चुना, कॉपी नहीं किया।',
            hinglish: 'Teeno QoS levels ek saath boliye, phir apni choice ki wajah. Isse dikhta hai ki aapne soch kar chuna, copy nahi kiya.',
          },
        },
      },
      {
        keywords: ['SMS', 'battery'],
        text: {
          en: 'If the network drops, how does the SMS alert still reach the farmer?',
          hi: 'नेटवर्क चला जाए तो किसान तक SMS अलर्ट कैसे पहुँचता है?',
          hinglish: 'Network chala jaaye toh kisan tak SMS alert kaise pahunchta hai?',
        },
        tts: {
          hi: 'नेटवर्क चला जाए तो किसान तक SMS अलर्ट कैसे पहुँचता है?',
          hinglish: 'नेटवर्क चला जाए तो किसान तक SMS अलर्ट कैसे पहुँचता है?',
        },
        ask: {
          keywords: [K.buffer, K.retry, 'SMS', 'latency'],
          scriptedAnswer: {
            en: 'The device keeps readings in a local buffer and retries as soon as the network is back. The cloud checks the threshold and sends the alert through an SMS gateway. Normal latency was under two minutes. Basically, not a single reading is lost.',
            hi: 'डिवाइस रीडिंग को लोकल बफ़र में रखता है और नेटवर्क आते ही दोबारा भेजता है। क्लाउड पर सीमा जाँची जाती है, फिर SMS गेटवे से अलर्ट जाता है। आम तौर पर लेटेंसी दो मिनट से कम थी। मतलब, एक भी रीडिंग नहीं खोती।',
            hinglish:
              'Device reading ko local buffer mein rakhta hai aur network aate hi retry karta hai. Cloud pe threshold check hota hai, phir SMS gateway se alert jaata hai. Normal latency do minute ke andar thi. Basically, ek bhi reading lost nahi hoti.',
          },
          modelAnswer: {
            en: 'Store-and-forward: buffer readings in flash with timestamps, retry with back-off when connectivity returns, and alert from the cloud so one gateway failure does not silence farmers. Mention the measured end-to-end latency and what happens after N failed retries (a fallback SMS from a neighbouring node).',
            hi: 'स्टोर-एंड-फ़ॉरवर्ड: रीडिंग टाइमस्टैम्प के साथ फ़्लैश में रखें, नेटवर्क लौटने पर रुक-रुककर दोबारा भेजें, और अलर्ट क्लाउड से भेजें ताकि एक गेटवे बंद होने से किसान तक सूचना न रुके। मापी गई लेटेंसी और कई बार असफल होने पर क्या होता है (पास के नोड से SMS), यह भी बताएँ।',
          },
          scores: { correctness: 8, depth: 7, clarity: 6 },
          tip: {
            en: 'Say the failure path out loud ("if retries fail, then…"). Reliability questions are about the unhappy path.',
            hi: 'असफल होने का रास्ता भी बोलिए ("अगर दोबारा भेजना भी फ़ेल हो, तो…")। भरोसे वाले सवाल असल में मुश्किल हालात के बारे में होते हैं।',
            hinglish: 'Failure path bhi boliye ("agar retry bhi fail ho, toh…"). Reliability wale sawaal asal mein mushkil haalat ke baare mein hote hain.',
          },
        },
      },
    ],
    fallbackFollowUp: {
      text: {
        en: 'What was the hardest bug in this project?',
        hi: 'इस प्रोजेक्ट में सबसे मुश्किल बग कौन-सा था?',
        hinglish: 'Is project mein sabse mushkil bug kaunsa tha?',
      },
      tts: {
        hi: 'इस प्रोजेक्ट में सबसे मुश्किल बग कौन-सा था?',
        hinglish: 'इस प्रोजेक्ट में सबसे मुश्किल बग कौन-सा था?',
      },
      ask: {
        keywords: ['sensor', K.calibration, K.average, 'SMS'],
        scriptedAnswer: {
          en: 'The hardest bug was sensor calibration. In wet soil the readings jumped by up to 20 percent. Basically, I calibrated on three soil types and added a moving average. After that, false SMS alerts almost stopped.',
          hi: 'सबसे मुश्किल बग सेंसर कैलिब्रेशन का था। गीली मिट्टी में रीडिंग 20 प्रतिशत तक ऊपर-नीचे हो रही थी। मतलब, मैंने तीन तरह की मिट्टी पर कैलिब्रेट किया और मूविंग एवरेज लगाया। उसके बाद गलत SMS अलर्ट लगभग बंद हो गए।',
          hinglish:
            'Sabse mushkil bug sensor calibration ka tha. Geeli mitti mein readings 20 percent tak upar-neeche ho rahi thi. Matlab, maine teen kism ki mitti pe calibrate kiya aur moving average lagaya. Uske baad false SMS alerts lagbhag band ho gaye.',
        },
        modelAnswer: {
          en: 'Use a mini-STAR: symptom (readings jumped 20% in wet soil), root cause (uncalibrated capacitive sensor + electrical noise), fix (per-soil calibration curve + moving average), result (false alerts down sharply), lesson (log raw data from day one).',
          hi: 'छोटा STAR बनाइए: लक्षण (गीली मिट्टी में रीडिंग 20% उछली), असली कारण (बिना कैलिब्रेशन का सेंसर + बिजली का शोर), सुधार (हर मिट्टी के लिए कैलिब्रेशन + मूविंग एवरेज), परिणाम (गलत अलर्ट बहुत कम), सीख (पहले दिन से कच्चा डेटा लॉग करें)।',
        },
        scores: { correctness: 8, depth: 7, clarity: 6 },
        tip: {
          en: 'Bug stories land best as symptom → cause → fix → result. You had all four; say them in that order.',
          hi: 'बग की कहानी लक्षण → कारण → सुधार → परिणाम के क्रम में सबसे अच्छी लगती है। चारों बातें आपके पास थीं; बस इसी क्रम में बोलिए।',
          hinglish: 'Bug ki kahani symptom → cause → fix → result order mein sabse achhi lagti hai. Chaaron baatein aapke paas thi; bas isi order mein boliye.',
        },
      },
    },
  },
  {
    id: 'T3',
    phase: 'tech',
    topic: { en: 'Process vs thread', hi: 'प्रोसेस बनाम थ्रेड', hinglish: 'Process vs thread' },
    text: {
      en: 'What is the difference between a process and a thread?',
      hi: 'प्रोसेस और थ्रेड में क्या फ़र्क है?',
      hinglish: 'Process aur thread mein kya fark hai?',
    },
    tts: {
      hi: 'प्रोसेस और थ्रेड में क्या फ़र्क है?',
      hinglish: 'प्रोसेस और थ्रेड में क्या फ़र्क है?',
    },
    keywords: ['process', 'thread', 'memory', K.contextSwitch, K.shared],
    scriptedAnswer: {
      en: 'A process is a running program with its own separate memory. A thread runs inside a process and shares the same memory, so creating a thread and doing a context switch is cheaper. But shared data needs locks, otherwise you get race conditions. Basically, process for isolation, thread for speed.',
      hi: 'प्रोसेस एक चलता हुआ प्रोग्राम है जिसकी अपनी अलग मेमोरी होती है। थ्रेड प्रोसेस के अंदर चलता है और वही मेमोरी शेयर करता है, इसलिए थ्रेड बनाना और कॉन्टेक्स्ट स्विच करना सस्ता है। लेकिन शेयर्ड डेटा पर लॉक लगाना पड़ता है, वरना रेस कंडीशन आ सकती है। मतलब, अलगाव चाहिए तो प्रोसेस, रफ़्तार चाहिए तो थ्रेड।',
      hinglish:
        'Process ek running program hai jiski apni alag memory hoti hai. Thread process ke andar chalta hai aur same memory share karta hai, isliye thread banana aur context switch karna sasta hai. Lekin shared data pe lock lagana padta hai, warna race condition aa sakti hai. Matlab, isolation chahiye toh process, speed chahiye toh thread.',
    },
    modelAnswer: {
      en: 'Process: an independent program in execution with its own address space, file handles and at least one thread. Isolation is strong, but creation and context switches are costly and processes talk via IPC. Thread: a unit of execution inside a process that shares its memory; cheap to create and switch, but shared data needs synchronisation (mutex, semaphore) to avoid race conditions. Example: browsers isolate tabs as processes; a web server uses a thread pool for throughput.',
      hi: 'प्रोसेस: चलता हुआ स्वतंत्र प्रोग्राम, जिसका अपना एड्रेस स्पेस, फ़ाइल हैंडल और कम से कम एक थ्रेड होता है। अलगाव मज़बूत है, पर बनाना और कॉन्टेक्स्ट स्विच महँगा है, और प्रोसेस आपस में IPC से बात करते हैं। थ्रेड: प्रोसेस के अंदर चलने वाली इकाई जो उसकी मेमोरी शेयर करती है; बनाना और बदलना सस्ता, पर शेयर्ड डेटा के लिए सिंक्रोनाइज़ेशन (mutex, semaphore) चाहिए, वरना रेस कंडीशन। उदाहरण: ब्राउज़र हर टैब को अलग प्रोसेस में रखते हैं; वेब सर्वर थ्रेड पूल से तेज़ी लाता है।',
    },
    scores: { correctness: 7, depth: 7, clarity: 5 },
    tip: {
      en: 'Close with one real example (browser tabs as processes, a web server\'s thread pool). One example turns a textbook answer into an engineer\'s answer.',
      hi: 'अंत में एक असली उदाहरण दीजिए (ब्राउज़र के टैब = प्रोसेस, वेब सर्वर का थ्रेड पूल)। एक उदाहरण किताबी जवाब को इंजीनियर का जवाब बना देता है।',
      hinglish:
        'End mein ek real example dijiye (browser tabs = process, web server ka thread pool). Ek example kitabi jawab ko engineer ka jawab bana deta hai.',
    },
  },
  {
    id: 'T4',
    phase: 'tech',
    kind: 'sql',
    topic: { en: 'SQL whiteboard', hi: 'SQL व्हाइटबोर्ड', hinglish: 'SQL whiteboard' },
    text: {
      en: 'From an Employee table, find the second-highest salary.',
      hi: 'Employee टेबल से दूसरी सबसे ज़्यादा सैलरी निकालिए।',
      hinglish: 'Employee table se second-highest salary nikaliye.',
    },
    tts: {
      hi: 'एम्प्लॉई टेबल से दूसरी सबसे ज़्यादा सैलरी निकालिए।',
      hinglish: 'एम्प्लॉई टेबल से सेकंड-हाईएस्ट सैलरी निकालिए।',
    },
    keywords: ['subquery', K.MAX, K.denseRank, K.duplicate],
    scriptedAnswer: {
      en: 'Basically, I would use a subquery. The inner query finds the MAX salary, and the outer query takes the MAX of the salaries below it. If salaries can have duplicates, a DENSE_RANK window function also works, because ties get the same rank.',
      hi: 'बेसिकली, मैं सब क्वेरी इस्तेमाल करूँगी। अंदर वाली क्वेरी MAX सैलरी निकालती है, और बाहर वाली क्वेरी उससे कम सैलरी में से MAX लेती है। अगर डुप्लीकेट सैलरी हो सकती हैं, तो DENSE_RANK विंडो फ़ंक्शन भी चलेगा, जो बराबर वालों को एक ही रैंक देता है।',
      hinglish:
        'Basically, main subquery use karungi. Andar wali query MAX salary nikaalti hai, aur bahar wali query usse kam salaries mein se MAX leti hai. Agar duplicate salaries ho sakti hain, toh DENSE_RANK window function bhi chalega, jo ties ko same rank deta hai.',
    },
    modelAnswer: {
      en: 'SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee); handles a repeated top salary and returns NULL when there is no second salary. Alternative: DENSE_RANK() OVER (ORDER BY salary DESC) and keep rank 2, which generalises to the Nth highest.',
      hi: 'SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee); सबसे ऊँची सैलरी दोहराई जाए तब भी सही चलता है, और दूसरी सैलरी न हो तो NULL देता है। दूसरा तरीका: DENSE_RANK() OVER (ORDER BY salary DESC) और रैंक 2 रखें; यह N-वीं सबसे ऊँची सैलरी के लिए भी काम करता है।',
    },
    scores: { correctness: 9, depth: 8, clarity: 6 },
    tip: {
      en: 'Say the edge case out loud: "if everyone earns the same, this returns NULL". Edge cases separate a 7 from a 9.',
      hi: 'एज केस बोलकर बताइए: "अगर सबकी सैलरी बराबर हो, तो यह NULL देगा"। एज केस ही 7 और 9 का फ़र्क बनाते हैं।',
      hinglish: 'Edge case bol kar bataiye: "agar sabki salary barabar ho, toh yeh NULL dega". Edge cases hi 7 aur 9 ka fark banate hain.',
    },
  },
]

const PRIYA_HR: IQ[] = [
  {
    id: 'H1',
    phase: 'hr',
    topic: { en: 'Tell me about yourself', hi: 'अपना परिचय', hinglish: 'Apna parichay' },
    text: {
      en: 'Tell me about yourself: where you are now, what you have done so far, and where you want to go next.',
      hi: 'अपने बारे में बताइए — अभी आप क्या कर रही हैं, अब तक क्या किया, और आगे क्या करना चाहती हैं?',
      hinglish: 'Apne baare mein bataiye — abhi aap kya kar rahi hain, ab tak kya kiya, aur aage kya karna chahti hain?',
    },
    tts: {
      hi: 'अपने बारे में बताइए — अभी आप क्या कर रही हैं, अब तक क्या किया, और आगे क्या करना चाहती हैं?',
      hinglish: 'अपने बारे में बताइए — अभी आप क्या कर रही हैं, अब तक क्या किया, और आगे क्या करना चाहती हैं?',
    },
    keywords: [K.ece, K.firstGen, K.project, K.iot],
    scriptedAnswer: {
      en: 'I am Priya, a final-year ECE student at Purnea College of Engineering, and the first in my family to go to college. I built Khet-Nami, which sends Hindi SMS alerts to farmers. Basically, next I want to work in IoT and embedded systems and build things for the field.',
      hi: 'मैं प्रिया हूँ, पूर्णिया कॉलेज ऑफ़ इंजीनियरिंग में ECE फ़ाइनल ईयर में हूँ, और अपने परिवार में कॉलेज जाने वाली पहली हूँ। मैंने खेत-नमी बनाया, जो किसानों को हिंदी SMS अलर्ट भेजता है। मतलब, आगे मैं IoT और एम्बेडेड सिस्टम में काम करना चाहती हूँ और खेतों के लिए चीज़ें बनाना चाहती हूँ।',
      hinglish:
        'Main Priya hoon, Purnea College of Engineering mein ECE final year mein hoon, aur apne parivaar mein college jaane wali pehli hoon. Maine Khet-Nami banaya, jo kisanon ko Hindi SMS alert bhejta hai. Basically, aage main IoT aur embedded systems mein kaam karna chahti hoon, field ke liye solutions banana.',
    },
    modelAnswer: {
      en: 'Present → Past → Future in about 60 seconds. Present: final-year ECE, Purnea CE. Past: one proof point with a number (Khet-Nami: ESP32 + MQTT, battery 3 → 11 days, Hindi SMS alerts). Future: tie the goal to this role ("I want to grow as an IoT engineer, which is exactly what this role builds").',
      hi: 'वर्तमान → अतीत → भविष्य, लगभग 60 सेकंड में। वर्तमान: ECE फ़ाइनल ईयर, पूर्णिया CE। अतीत: आँकड़े वाला एक सबूत (खेत-नमी: ESP32 + MQTT, बैटरी 3 → 11 दिन, हिंदी SMS अलर्ट)। भविष्य: लक्ष्य को इस नौकरी से जोड़ें ("मैं IoT इंजीनियर बनना चाहती हूँ, और यह भूमिका वही सिखाती है")।',
    },
    scores: { correctness: 7, depth: 6, clarity: 6 },
    tip: (g) => ({
      en: 'Use Present → Past → Future in three sentences and finish in 60 seconds. End on how this role fits your goal.',
      hi: `वर्तमान → अतीत → भविष्य, तीन वाक्यों में। 60 सेकंड में ख़त्म कीजिए और आख़िर में बताइए कि यह नौकरी आपके लक्ष्य से कैसे जुड़ती है। आप यह आसानी से कर ${bySex(g, 'सकती', 'सकते')} हैं।`,
      hinglish: `Present → Past → Future, teen sentences mein. 60 second mein khatam kijiye aur end mein bataiye ki yeh role aapke goal se kaise judta hai. Aap yeh aasani se kar ${bySex(g, 'sakti', 'sakte')} hain.`,
    }),
  },
  {
    id: 'H2',
    phase: 'hr',
    topic: { en: 'Relocation & shifts', hi: 'रीलोकेशन और शिफ्ट', hinglish: 'Relocation aur shifts' },
    usesSignal: { round: 'communication', fallbackChip: `English fluency ${VERSANT_TARGETS.priya}/80` },
    hesitationCheck: true,
    text: {
      en: 'Are you ready to relocate anywhere in India and work rotational or night shifts?',
      hi: 'क्या आप भारत में कहीं भी रीलोकेट होने और रोटेशनल या नाइट शिफ्ट में काम करने के लिए तैयार हैं?',
      hinglish: 'Kya aap India mein kahin bhi relocate aur rotational/night shifts mein kaam karne ke liye taiyaar hain?',
    },
    tts: {
      hi: 'क्या आप भारत में कहीं भी रीलोकेट होने और रोटेशनल या नाइट शिफ्ट में काम करने के लिए तैयार हैं?',
      hinglish: 'क्या आप इंडिया में कहीं भी रीलोकेट और रोटेशनल या नाइट शिफ्ट्स में काम करने के लिए तैयार हैं?',
    },
    keywords: ['relocate', 'night shift', K.family, K.ready],
    scripted: { latencyMs: 3100, pauseAfterWord: 1, pauseMs: 2300, wpm: 126 },
    scriptedAnswer: {
      en: 'Umm, yes, I am ready to relocate. My family will be a little worried, but I have spoken to them. I can work night shifts too, it will just take me some time to adjust at first. Basically, I will go anywhere to learn.',
      hi: 'हम्म, हाँ, मैं रीलोकेट करने के लिए तैयार हूँ। मतलब, घर वाले थोड़े चिंतित होंगे, पर मैंने उनसे बात कर ली है। नाइट शिफ्ट में भी काम कर सकती हूँ, बस शुरू में एडजस्ट करने में थोड़ा समय लगेगा। सीखने के लिए कहीं भी जाऊँगी।',
      hinglish:
        'Umm, haan, main relocate karne ke liye taiyaar hoon. Matlab, ghar wale thode chintit honge, par maine unse baat kar li hai. Night shift mein bhi kaam kar sakti hoon, bas shuru mein adjust karne mein thoda time lagega. Seekhne ke liye kahin bhi jaaungi.',
    },
    modelAnswer: {
      en: 'Lead with a clear yes, then one line of reasoning and one line of preparation: "Yes, I am ready to relocate and work rotational shifts. I want hands-on plant experience early in my career, and I have already discussed it with my family." Short, certain and specific beats long and hesitant.',
      hi: 'पहले साफ़ "हाँ", फिर एक पंक्ति में वजह और एक पंक्ति में तैयारी: "हाँ, मैं रीलोकेट होने और रोटेशनल शिफ्ट के लिए तैयार हूँ। करियर की शुरुआत में ही मुझे असली काम का अनुभव चाहिए, और मैंने परिवार से बात कर ली है।" छोटा, पक्का और साफ़ जवाब लंबे और झिझक भरे जवाब से बेहतर है।',
    },
    scores: { correctness: 7, depth: 6, clarity: 4 },
    tip: (g) => ({
      en: 'Lead with a clear yes: "Yes, I am ready to relocate and work shifts." Then one line on why. Hesitation reads as doubt.',
      hi: `पहले सीधा जवाब: "हाँ, मैं रीलोकेट और शिफ्ट के लिए तैयार हूँ।" फिर एक पंक्ति में वजह। झिझक से लगता है कि आप ${bySex(g, 'पक्की', 'पक्के')} नहीं हैं।`,
      hinglish: `Pehle seedha jawab: "Haan, main relocate aur shifts ke liye taiyaar hoon." Phir ek line mein wajah. Jhijhak se lagta hai ki aap ${bySex(g, 'pakki', 'pakke')} nahi hain.`,
    }),
  },
  {
    id: 'H3',
    phase: 'hr',
    topic: { en: 'Service bond', hi: 'सर्विस बॉन्ड', hinglish: 'Service bond' },
    text: {
      en: 'Are you comfortable signing a service agreement (bond)?',
      hi: 'क्या आप सर्विस एग्रीमेंट (बॉन्ड) साइन करने में सहज हैं?',
      hinglish: 'Service agreement (bond) sign karne mein aap comfortable hain?',
    },
    tts: {
      hi: 'क्या आप सर्विस एग्रीमेंट, यानी बॉन्ड, साइन करने में सहज हैं?',
      hinglish: 'सर्विस एग्रीमेंट, यानी बॉन्ड, साइन करने में आप कम्फ़र्टेबल हैं?',
    },
    keywords: [K.bond, K.training, K.terms, K.learn],
    scriptedAnswer: {
      en: 'Yes, I am comfortable. The company spends on my training, so a two-year bond makes sense. I will just read the terms carefully before signing, like the duration and the exit clause. Basically, learning and a long-term commitment both matter to me.',
      hi: 'हाँ, मैं सहज हूँ। कंपनी मेरी ट्रेनिंग पर खर्च करती है, तो दो साल का बॉन्ड समझ में आता है। बस साइन करने से पहले शर्तें ध्यान से पढ़ूँगी, जैसे अवधि और बाहर निकलने का नियम। मतलब, मेरे लिए सीखना और लंबे समय की प्रतिबद्धता दोनों ज़रूरी हैं।',
      hinglish:
        'Haan, main comfortable hoon. Company training par kharcha karti hai, toh do saal ka bond samajh mein aata hai. Bas sign karne se pehle terms dhyan se padhungi, jaise duration aur exit clause. Basically, mere liye seekhna aur lambe samay ka commitment dono zaroori hain.',
    },
    modelAnswer: {
      en: 'Show maturity, not reluctance: accept the logic (the company invests in training), then show you read before you sign (duration, exit terms, any training cost recovery). Avoid both a nervous "no" and a careless "yes, anything".',
      hi: 'झिझक नहीं, समझदारी दिखाएँ: तर्क मानें (कंपनी ट्रेनिंग पर निवेश करती है), फिर बताएँ कि आप साइन करने से पहले पढ़ते हैं (अवधि, बाहर निकलने की शर्तें, ट्रेनिंग खर्च की वसूली)। घबराया हुआ "नहीं" और लापरवाह "हाँ, कुछ भी" दोनों से बचें।',
    },
    scores: { correctness: 7, depth: 6, clarity: 6 },
    tip: {
      en: 'Good balance. Name one term you would check (exit clause or training-cost recovery). It sounds informed, not reluctant.',
      hi: 'संतुलन अच्छा है। एक शर्त का नाम लीजिए जो आप जाँचेंगी (बाहर निकलने का नियम या ट्रेनिंग खर्च की वसूली)। इससे आप जानकार लगती हैं, झिझकती नहीं।',
      hinglish: 'Balance achha hai. Ek term ka naam lijiye jo aap check karengi (exit clause ya training cost recovery). Isse aap informed lagti hain, hichkichaati nahi.',
    },
  },
  {
    id: 'H4',
    phase: 'hr',
    topic: { en: 'Five years from now', hi: 'पाँच साल बाद', hinglish: '5 saal baad' },
    text: {
      en: 'Where do you see yourself in five years?',
      hi: '5 साल बाद आप ख़ुद को कहाँ देखती हैं?',
      hinglish: '5 saal baad aap khud ko kahan dekhti hain?',
    },
    tts: {
      hi: 'पाँच साल बाद आप ख़ुद को कहाँ देखती हैं?',
      hinglish: 'पाँच साल बाद आप ख़ुद को कहाँ देखती हैं?',
    },
    keywords: [K.iot, K.lead, K.learn, K.bihar],
    scriptedAnswer: {
      en: 'In five years I see myself as a lead engineer in an IoT product team. For the first two years I want to learn properly. Basically, my dream is to build products for the villages of Bihar that help farmers.',
      hi: 'पाँच साल बाद मैं ख़ुद को एक IoT प्रोडक्ट टीम में लीड इंजीनियर के रूप में देखती हूँ। पहले दो साल मैं अच्छे से सीखना चाहती हूँ। मतलब, मेरा सपना है कि बिहार के गाँवों के लिए ऐसे प्रोडक्ट बनाऊँ जो किसानों की मदद करें।',
      hinglish:
        'Paanch saal baad main khud ko ek IoT product team mein lead engineer ke roop mein dekhti hoon. Pehle do saal achhi tarah seekhna chahti hoon. Matlab, mera sapna hai ki Bihar ke gaon ke liye aise products banaun jo kisanon ki madad karein.',
    },
    modelAnswer: {
      en: 'Connect ambition to this employer: "In five years I want to lead a small IoT team. The first two years here would give me production experience, then I want to own a product line." Show growth inside the company, not a plan to leave.',
      hi: 'महत्वाकांक्षा को इसी कंपनी से जोड़ें: "पाँच साल में मैं एक छोटी IoT टीम लीड करना चाहती हूँ। यहाँ पहले दो साल मुझे असली प्रोडक्शन का अनुभव देंगे, फिर मैं एक प्रोडक्ट लाइन संभालना चाहती हूँ।" कंपनी के अंदर तरक्की दिखाएँ, छोड़ने की योजना नहीं।',
    },
    scores: { correctness: 7, depth: 7, clarity: 6 },
    tip: (g) => ({
      en: 'Tie the 5-year goal to this role: "This role builds exactly the IoT skills I need to lead a team." Growth inside the company sounds loyal.',
      hi: `5 साल के लक्ष्य को इस नौकरी से जोड़िए: "यह भूमिका वही IoT स्किल देती है जो टीम लीड करने के लिए चाहिए।" ऐसे आप भरोसेमंद ${bySex(g, 'लगती', 'लगते')} हैं।`,
      hinglish: `5 saal ke goal ko is role se jodiye: "Yeh role wahi IoT skills deta hai jo team lead karne ke liye chahiye." Aise aap bharosemand ${bySex(g, 'lagti', 'lagte')} hain.`,
    }),
  },
]

// ---------------------------------------------------------------------------
// Rahul (Diploma Mechanical / Automobile, Hindi medium, M). Hindi first.
// ---------------------------------------------------------------------------

const RAHUL_TECH: IQ[] = [
  {
    id: 'T1',
    phase: 'tech',
    topic: { en: 'CNC: coolant & feed', hi: 'CNC: कूलेंट और फ़ीड', hinglish: 'CNC: coolant aur feed' },
    usesSignal: { round: 'technical', fallbackChip: 'CNC case: missed coolant / feed rate' },
    text: {
      en: 'In the Round 2 CNC case you missed coolant and feed rate. If the tool is overheating, what will you check first?',
      hi: 'राउंड 2 के CNC केस में आपसे कूलेंट और फ़ीड रेट छूट गए थे। अगर टूल ज़्यादा गरम हो रहा हो, तो आप सबसे पहले क्या जाँचेंगे?',
      hinglish: 'Round 2 ke CNC case mein aapne coolant aur feed rate miss kiya tha. Agar tool zyada garam ho raha ho, toh aap pehle kya check karenge?',
    },
    tts: {
      hi: 'राउंड 2 के सीएनसी केस में आपसे कूलेंट और फ़ीड रेट छूट गए थे। अगर टूल ज़्यादा गरम हो रहा हो, तो आप सबसे पहले क्या जाँचेंगे?',
      hinglish: 'राउंड 2 के सीएनसी केस में आपने कूलेंट और फ़ीड रेट मिस किया था। अगर टूल ज़्यादा गरम हो रहा हो, तो आप पहले क्या चेक करेंगे?',
    },
    keywords: [K.coolant, K.feed, K.spindle, K.wear, 'safety'],
    scriptedAnswer: {
      en: 'First I will stop the machine and check the coolant flow, in case the nozzle is blocked. Then I will match the feed rate and spindle speed with the drawing. Basically, I will also check tool wear, because a worn tool heats up more. For safety, I check only with PPE on.',
      hi: 'सबसे पहले मैं मशीन रोकूँगा और कूलेंट का फ़्लो चेक करूँगा, कहीं नोज़ल बंद तो नहीं। फिर फ़ीड रेट और स्पिंडल स्पीड ड्रॉइंग के हिसाब से मिलाऊँगा। बेसिकली, टूल का घिसाव भी देखूँगा, क्योंकि घिसा हुआ टूल ज़्यादा गरम होता है। सुरक्षा के लिए PPE पहनकर ही चेक करूँगा।',
      hinglish:
        'Sabse pehle main machine rokunga aur coolant flow check karunga, kahin nozzle band toh nahi. Phir feed rate aur spindle speed drawing ke hisaab se milaunga. Basically, tool wear bhi dekhunga, kyunki ghisa hua tool zyada garam hota hai. Safety ke liye PPE pehen ke hi check karunga.',
    },
    modelAnswer: {
      en: 'A sequence beats a list: (1) stop the spindle safely, (2) coolant: flow, concentration, nozzle aim, (3) cutting parameters: feed and speed against the tool maker\'s chart, depth of cut, (4) tool: wear, edge chipping, correct grade, (5) restart with a test cut. Mention lockout and PPE before touching the machine.',
      hi: 'सूची से बेहतर है क्रम: (1) स्पिंडल सुरक्षित तरीके से रोकें, (2) कूलेंट: फ़्लो, घोल, नोज़ल की दिशा, (3) कटिंग पैरामीटर: फ़ीड और स्पीड टूल चार्ट से मिलाएँ, कट की गहराई, (4) टूल: घिसाव, धार टूटी तो नहीं, सही ग्रेड, (5) टेस्ट कट से दोबारा शुरू करें। मशीन छूने से पहले लॉकआउट और PPE का ज़िक्र करें।',
    },
    scores: { correctness: 8, depth: 8, clarity: 5 },
    tip: (g) => ({
      en: 'Number your steps: stop → coolant → feed and speed → tool. A numbered sequence sounds like a shop-floor professional.',
      hi: `अपने कदम गिनकर बोलिए: रोकना → कूलेंट → फ़ीड और स्पीड → टूल। क्रम से बोलने पर आप शॉप-फ़्लोर के अनुभवी ${bySex(g, 'लगती', 'लगते')} हैं।`,
      hinglish: `Apne steps gin kar boliye: rokna → coolant → feed aur speed → tool. Order mein bolne par aap shop-floor ke anubhavi ${bySex(g, 'lagti', 'lagte')} hain.`,
    }),
  },
  {
    id: 'T2',
    phase: 'tech',
    topic: { en: 'CoE EV lab', hi: 'CoE EV लैब', hinglish: 'CoE EV lab' },
    text: {
      en: 'In the CoE EV lab you worked on a battery-pack thermal rig. What does a BMS do, and how did you keep testing safe?',
      hi: 'CoE की EV लैब में आपने बैटरी-पैक थर्मल रिग पर काम किया। BMS का काम क्या होता है, और टेस्टिंग के समय आप सुरक्षा कैसे पक्की करते थे?',
      hinglish: 'CoE ke EV lab mein aapne battery-pack thermal rig par kaam kiya. BMS ka kaam kya hota hai, aur testing ke time aap safety kaise ensure karte the?',
    },
    tts: {
      hi: 'सीओई की ईवी लैब में आपने बैटरी-पैक थर्मल रिग पर काम किया। बीएमएस का काम क्या होता है, और टेस्टिंग के समय आप सुरक्षा कैसे पक्की करते थे?',
      hinglish: 'सीओई के ईवी लैब में आपने बैटरी-पैक थर्मल रिग पर काम किया। बीएमएस का काम क्या होता है, और टेस्टिंग के टाइम आप सेफ़्टी कैसे इंश्योर करते थे?',
    },
    keywords: ['EV', 'battery', 'BMS', 'safety', K.temperature],
    scriptedAnswer: {
      en: 'A BMS monitors every cell\'s voltage and temperature, and cuts off the pack when a limit is crossed. In our EV lab I logged the thermal data. During testing we wore PPE and kept a fire extinguisher close. Basically, safety first, test later.',
      hi: 'BMS हर सेल का वोल्टेज और तापमान देखता है, और सीमा पार होते ही पैक को कट-ऑफ़ कर देता है। हमारी EV लैब में मैंने थर्मल डेटा लॉग किया। टेस्टिंग के समय हम PPE पहनते थे और आग बुझाने वाला यंत्र पास रखते थे। मतलब, पहले सुरक्षा, फिर टेस्ट।',
      hinglish:
        'BMS har cell ka voltage aur temperature monitor karta hai, aur limit cross hone par pack ko cut-off kar deta hai. Hamare EV lab mein maine thermal data log kiya. Testing ke time hum PPE pehente the aur fire extinguisher paas rakhte the. Matlab, safety pehle, test baad mein.',
    },
    modelAnswer: {
      en: 'BMS: monitors cell voltage, current and temperature; balances cells; estimates state of charge; and protects the pack (over-voltage, under-voltage, over-temperature, short-circuit cut-off). Lab safety: PPE, insulated tools, a Class D or CO₂ extinguisher, thermal runaway limits set below the cell datasheet, and never testing alone.',
      hi: 'BMS: सेल का वोल्टेज, करंट और तापमान देखता है; सेल बैलेंस करता है; चार्ज का अनुमान लगाता है; और पैक को बचाता है (ज़्यादा या कम वोल्टेज, ज़्यादा तापमान, शॉर्ट-सर्किट पर कट-ऑफ़)। लैब सुरक्षा: PPE, इंसुलेटेड औज़ार, सही अग्निशामक, डेटाशीट से कम तापमान सीमा, और कभी अकेले टेस्ट नहीं।',
    },
    scores: { correctness: 8, depth: 8, clarity: 6 },
    tip: {
      en: 'Add one number from your rig (for example "cut-off at 55 °C"). Numbers prove you actually ran the tests.',
      hi: 'अपने रिग का एक आँकड़ा जोड़िए (जैसे "55 °C पर कट-ऑफ़")। आँकड़े साबित करते हैं कि टेस्ट आपने ख़ुद चलाए।',
      hinglish: 'Apne rig ka ek number jodiye (jaise "55 °C par cut-off"). Numbers saabit karte hain ki test aapne khud chalaye.',
    },
    followUps: [
      {
        keywords: ['BMS'],
        text: {
          en: 'If the BMS shows one cell at 60 °C, what should the system do?',
          hi: 'अगर BMS एक सेल का तापमान 60 डिग्री दिखाए, तो सिस्टम को क्या करना चाहिए?',
          hinglish: 'Agar BMS ek cell ka temperature 60 degree dikhaye, toh system ko kya karna chahiye?',
        },
        tts: {
          hi: 'अगर बीएमएस एक सेल का तापमान साठ डिग्री दिखाए, तो सिस्टम को क्या करना चाहिए?',
          hinglish: 'अगर बीएमएस एक सेल का टेम्परेचर साठ डिग्री दिखाए, तो सिस्टम को क्या करना चाहिए?',
        },
        ask: {
          keywords: [K.cutoff, K.temperature, 'safety', 'BMS'],
          scriptedAnswer: {
            en: 'First the BMS should reduce the current, and if the temperature keeps rising it should cut off the pack. Basically, it should warn the driver and log the event. After that, we check that cell separately for safety.',
            hi: 'पहले BMS को करंट कम करना चाहिए, और तापमान फिर भी बढ़े तो पैक को कट-ऑफ़ करना चाहिए। मतलब, ड्राइवर को चेतावनी देनी चाहिए और घटना लॉग करनी चाहिए। उसके बाद सुरक्षा के लिए उस सेल को अलग से जाँचते हैं।',
            hinglish:
              'Pehle BMS ko current kam karna chahiye, aur temperature phir bhi badhe toh pack ko cut-off karna chahiye. Matlab, driver ko warning deni chahiye aur event log karna chahiye. Uske baad safety ke liye us cell ko alag se check karte hain.',
          },
          modelAnswer: {
            en: 'Graded response: derate current, then open the contactor (cut-off) if the temperature keeps rising, alert the driver, log the event, and quarantine the cell for inspection. 60 °C is above most Li-ion operating limits, so cut-off is correct.',
            hi: 'क्रम से कदम: पहले करंट घटाएँ, तापमान बढ़ता रहे तो कॉन्टैक्टर खोलें (कट-ऑफ़), ड्राइवर को चेतावनी दें, घटना लॉग करें और सेल को जाँच के लिए अलग करें। 60 °C ज़्यादातर Li-ion सेल की सीमा से ऊपर है, इसलिए कट-ऑफ़ सही है।',
          },
          scores: { correctness: 8, depth: 8, clarity: 6 },
          tip: {
            en: 'Say it as levels: warn → reduce current → cut off. Graded responses show system thinking.',
            hi: 'स्तरों में बोलिए: चेतावनी → करंट कम → कट-ऑफ़। क्रम से जवाब देने से सिस्टम की समझ दिखती है।',
            hinglish: 'Levels mein boliye: warning → current kam → cut-off. Order mein jawab dene se system ki samajh dikhti hai.',
          },
        },
      },
      {
        keywords: ['safety'],
        text: {
          en: 'Which PPE and lockout steps did you follow in the lab?',
          hi: 'लैब में आपने कौन-से PPE और लॉकआउट कदम अपनाए?',
          hinglish: 'Lab mein aapne kaunse PPE aur lockout steps follow kiye?',
        },
        tts: {
          hi: 'लैब में आपने कौन-से पीपीई और लॉकआउट कदम अपनाए?',
          hinglish: 'लैब में आपने कौन-से पीपीई और लॉकआउट स्टेप्स फ़ॉलो किए?',
        },
        ask: {
          keywords: ['PPE', 'lockout', 'safety'],
          scriptedAnswer: {
            en: 'We wore insulated gloves and safety glasses. Before touching the pack we did lockout: switched off the main isolator and put our own tag on it. Basically, one person always watched the temperature screen.',
            hi: 'हम इंसुलेटेड दस्ताने और सेफ़्टी चश्मा पहनते थे। पैक छूने से पहले लॉकआउट करते थे: मेन आइसोलेटर बंद करके उस पर अपना टैग लगाते थे। मतलब, एक व्यक्ति हमेशा तापमान वाली स्क्रीन देखता था।',
            hinglish:
              'Hum insulated gloves aur safety glasses pehente the. Pack chhoone se pehle lockout karte the: main isolator band karke us par apna tag lagate the. Matlab, ek banda hamesha temperature screen dekhta tha.',
          },
          modelAnswer: {
            en: 'PPE: insulated gloves rated for the pack voltage, face shield or glasses, no metal jewellery. Lockout-tagout: isolate, lock, tag, verify zero energy with a meter, then work. Add a buddy system for high-voltage work.',
            hi: 'PPE: पैक के वोल्टेज के हिसाब से इंसुलेटेड दस्ताने, फ़ेस शील्ड या चश्मा, कोई धातु का गहना नहीं। लॉकआउट-टैगआउट: अलग करें, ताला लगाएँ, टैग लगाएँ, मीटर से शून्य ऊर्जा जाँचें, फिर काम करें। हाई-वोल्टेज काम में साथी ज़रूर रखें।',
          },
          scores: { correctness: 8, depth: 7, clarity: 6 },
          tip: {
            en: 'Add "verify zero energy with a meter". That one step is what supervisors listen for.',
            hi: '"मीटर से शून्य ऊर्जा जाँचना" ज़रूर जोड़िए। सुपरवाइज़र यही एक कदम सुनना चाहते हैं।',
            hinglish: '"Meter se zero energy check karna" zaroor jodiye. Supervisor yahi ek step sunna chahte hain.',
          },
        },
      },
    ],
    fallbackFollowUp: {
      text: {
        en: 'What was your biggest contribution to this rig?',
        hi: 'इस रिग में आपका सबसे बड़ा योगदान क्या था?',
        hinglish: 'Is rig mein aapka sabse bada contribution kya tha?',
      },
      tts: {
        hi: 'इस रिग में आपका सबसे बड़ा योगदान क्या था?',
        hinglish: 'इस रिग में आपका सबसे बड़ा कॉन्ट्रिब्यूशन क्या था?',
      },
      ask: {
        keywords: [K.temperature, 'battery', 'data'],
        scriptedAnswer: {
          en: 'I set up the temperature sensors on every cell and wrote the data logging sheet. Basically, because of that we found one weak cell that heated faster than the others, and we replaced it.',
          hi: 'मैंने हर सेल पर तापमान सेंसर लगाए और डेटा लॉगिंग शीट बनाई। मतलब, उसी से हमें एक कमज़ोर सेल मिला जो बाकियों से जल्दी गरम होता था, और हमने उसे बदला।',
          hinglish:
            'Maine har cell par temperature sensor lagaye aur data logging sheet banayi. Matlab, usi se humein ek kamzor cell mila jo baaki se jaldi garam hota tha, aur humne use badla.',
        },
        modelAnswer: {
          en: 'Use "I" for your part with one result: "I instrumented 16 cells and built the logging sheet; that found one weak cell heating 8 °C faster, which we replaced."',
          hi: 'अपने हिस्से के लिए "मैंने" बोलें और एक नतीजा बताएँ: "मैंने 16 सेल पर सेंसर लगाए और लॉगिंग शीट बनाई; उससे एक कमज़ोर सेल मिला जो 8 °C ज़्यादा गरम होता था, जिसे हमने बदला।"',
        },
        scores: { correctness: 8, depth: 7, clarity: 6 },
        tip: {
          en: 'One result with a number makes a contribution memorable.',
          hi: 'आँकड़े वाला एक नतीजा योगदान को यादगार बनाता है।',
          hinglish: 'Number wala ek result contribution ko yaadgaar banata hai.',
        },
      },
    },
  },
  {
    id: 'T3',
    phase: 'tech',
    topic: { en: 'Torque vs power', hi: 'टॉर्क बनाम पावर', hinglish: 'Torque vs power' },
    text: {
      en: 'What is the difference between torque and power? Which gear do you use to take a loaded truck up a hill, and why?',
      hi: 'टॉर्क और पावर में क्या फ़र्क है? भरे हुए ट्रक को पहाड़ी पर चढ़ाने के लिए किस गियर में रखते हैं, और क्यों?',
      hinglish: 'Torque aur power mein kya fark hai? Bhare hue truck ko pahadi chadhane ke liye kaunse gear mein rakhte hain, aur kyun?',
    },
    tts: {
      hi: 'टॉर्क और पावर में क्या फ़र्क है? भरे हुए ट्रक को पहाड़ी पर चढ़ाने के लिए किस गियर में रखते हैं, और क्यों?',
      hinglish: 'टॉर्क और पावर में क्या फ़र्क है? भरे हुए ट्रक को पहाड़ी चढ़ाने के लिए कौन-से गियर में रखते हैं, और क्यों?',
    },
    keywords: ['torque', 'power', 'gear', K.rpm, K.lowGear],
    scriptedAnswer: {
      en: 'Torque is the turning force, and power is how fast the work gets done, that is torque times RPM. On a hill we use a low gear, because a low gear gives more torque at the wheels. Speed drops, but the truck climbs easily. Basically, torque to climb, power for speed.',
      hi: 'टॉर्क घुमाने वाली ताक़त है, और पावर बताती है कि काम कितनी जल्दी होता है, यानी टॉर्क गुणा RPM। पहाड़ी पर निचला गियर लगाते हैं, क्योंकि निचले गियर में पहियों पर टॉर्क ज़्यादा मिलता है। स्पीड कम होती है, पर ट्रक आराम से चढ़ता है। मतलब, चढ़ाई के लिए टॉर्क, रफ़्तार के लिए पावर।',
      hinglish:
        'Torque ghumane wali taakat hai, aur power yeh batata hai ki kaam kitni jaldi hota hai, yaani torque guna RPM. Pahadi par neeche wala gear lagate hain, kyunki low gear mein wheel par torque zyada milta hai. Speed kam hoti hai, par truck aaram se chadhta hai. Basically, torque se chadhai, power se raftaar.',
    },
    modelAnswer: {
      en: 'Torque is rotational force (N·m); power is the rate of doing work, P = torque × angular speed (P[kW] = T × RPM / 9550). A low gear multiplies engine torque at the wheels (higher gear ratio) at the cost of road speed, which is what a loaded truck needs on a gradient. Bonus: keep the engine near its peak-torque RPM band.',
      hi: 'टॉर्क घुमाने वाला बल है (N·m); पावर काम करने की दर है, P = टॉर्क × कोणीय गति (P[kW] = T × RPM / 9550)। निचला गियर पहियों पर इंजन का टॉर्क कई गुना कर देता है (बड़ा गियर अनुपात), पर रफ़्तार घटती है; भरे ट्रक को चढ़ाई पर यही चाहिए। अतिरिक्त: इंजन को उसके सबसे ज़्यादा टॉर्क वाले RPM के आसपास रखें।',
    },
    scores: { correctness: 8, depth: 8, clarity: 6 },
    tip: (g) => ({
      en: 'Give the formula in one line (P = T × RPM / 9550), then the truck example. Formula plus example is a complete answer.',
      hi: `एक पंक्ति में फ़ॉर्मूला (P = T × RPM / 9550), फिर ट्रक का उदाहरण। आप फ़ॉर्मूला और उदाहरण दोनों दे ${bySex(g, 'सकती', 'सकते')} हैं, यही पूरा जवाब है।`,
      hinglish: `Ek line mein formula (P = T × RPM / 9550), phir truck ka example. Aap formula aur example dono de ${bySex(g, 'sakti', 'sakte')} hain, yahi poora jawab hai.`,
    }),
  },
]

const RAHUL_HR: IQ[] = [
  {
    id: 'H1',
    phase: 'hr',
    topic: { en: 'Shift work', hi: 'शिफ्ट में काम', hinglish: 'Shift work' },
    text: {
      en: 'The plant runs three shifts. Can you work rotating shifts, including nights?',
      hi: 'प्लांट में तीन शिफ्ट चलती हैं — क्या आप रोटेटिंग शिफ्ट में, रात की शिफ्ट समेत, काम कर सकते हैं?',
      hinglish: 'Plant mein teen shift chalti hain — kya aap rotating shifts mein, night shift bhi, kaam kar sakte hain?',
    },
    tts: {
      hi: 'प्लांट में तीन शिफ्ट चलती हैं — क्या आप रोटेटिंग शिफ्ट में, रात की शिफ्ट समेत, काम कर सकते हैं?',
      hinglish: 'प्लांट में तीन शिफ्ट चलती हैं — क्या आप रोटेटिंग शिफ्ट्स में, नाइट शिफ्ट भी, काम कर सकते हैं?',
    },
    keywords: ['night shift', 'shift', K.discipline, 'safety'],
    scriptedAnswer: {
      en: 'Yes, I can work all three shifts. In the polytechnic workshop I have done practicals early in the morning and late in the evening. On night shift I keep a fixed routine for sleep and food. Basically, I will take care of both discipline and safety.',
      hi: 'हाँ, मैं तीनों शिफ्ट में काम कर सकता हूँ। पॉलिटेक्निक की वर्कशॉप में सुबह जल्दी और देर शाम तक प्रैक्टिकल किया है। नाइट शिफ्ट में नींद और खाने का रूटीन तय रखता हूँ। मतलब, अनुशासन और सुरक्षा दोनों का ध्यान रखूँगा।',
      hinglish:
        'Haan, main teeno shift mein kaam kar sakta hoon. Polytechnic ke workshop mein subah jaldi aur der shaam tak practical kiya hai. Night shift mein neend aur khaane ka routine fix rakhta hoon. Matlab, discipline aur safety dono ka dhyan rakhunga.',
    },
    modelAnswer: {
      en: 'Clear yes + proof + plan: "Yes. I have handled early and late workshop sessions, and on nights I keep a fixed sleep routine so I stay alert around machines." Mentioning safety on night shift is a plus for any plant.',
      hi: 'साफ़ हाँ + सबूत + योजना: "हाँ। मैंने सुबह और देर शाम की वर्कशॉप संभाली है, और रात में तय रूटीन रखता हूँ ताकि मशीनों के पास सतर्क रहूँ।" रात की शिफ्ट में सुरक्षा का ज़िक्र किसी भी प्लांट के लिए अच्छा है।',
    },
    scores: { correctness: 7, depth: 7, clarity: 6 },
    tip: (g) => ({
      en: 'Great clear yes. Add one line on alertness ("I never skip the shift handover check"). Plants value safe habits.',
      hi: `साफ़ "हाँ" अच्छा था। सतर्कता की एक पंक्ति जोड़िए ("मैं शिफ्ट हैंडओवर जाँच कभी नहीं छोड़ता")। इससे आप भरोसेमंद ${bySex(g, 'लगती', 'लगते')} हैं।`,
      hinglish: `Saaf "haan" achha tha. Alertness ki ek line jodiye ("main shift handover check kabhi nahi chhodta"). Isse aap bharosemand ${bySex(g, 'lagti', 'lagte')} hain.`,
    }),
  },
  {
    id: 'H2',
    phase: 'hr',
    topic: { en: 'Relocation', hi: 'रीलोकेशन', hinglish: 'Relocation' },
    usesSignal: { round: 'communication', fallbackChip: `English fluency ${VERSANT_TARGETS.rahul}/80` },
    hesitationCheck: true,
    text: {
      en: 'Are you ready to relocate outside Bihar for an auto plant in a hub like Manesar or Gurugram?',
      hi: 'क्या आप मानेसर या गुरुग्राम जैसे ऑटो हब के किसी प्लांट के लिए बिहार से बाहर जाने को तैयार हैं?',
      hinglish: 'Kya aap Manesar ya Gurugram jaise auto hub ke kisi plant ke liye Bihar se bahar relocate karne ko taiyaar hain?',
    },
    tts: {
      hi: 'क्या आप मानेसर या गुरुग्राम जैसे ऑटो हब के किसी प्लांट के लिए बिहार से बाहर जाने को तैयार हैं?',
      hinglish: 'क्या आप मानेसर या गुरुग्राम जैसे ऑटो हब के किसी प्लांट के लिए बिहार से बाहर रीलोकेट करने को तैयार हैं?',
    },
    keywords: ['relocate', K.family, K.ready, K.hostel],
    scripted: { latencyMs: 2800, pauseAfterWord: 1, pauseMs: 2200, wpm: 124 },
    scriptedAnswer: {
      en: 'Umm, yes, I am ready. It will be my first time so far from home, so I had to think about it. Basically, if the company gives a hostel or room it will be easier. Going to Manesar is good experience for my career.',
      hi: 'हम्म, हाँ, मैं तैयार हूँ। पहली बार घर से इतनी दूर जाऊँगा, तो थोड़ा सोचना पड़ा। मतलब, कंपनी हॉस्टल या कमरा दे दे तो आसान रहेगा। अनुभव के लिए मानेसर जाना मेरे करियर के लिए अच्छा है।',
      hinglish:
        'Umm, haan, main taiyaar hoon. Pehli baar ghar se itna door jaaunga, toh thoda sochna pada. Matlab, company hostel ya room de de toh aasaan rahega. Experience ke liye Manesar jaana mere career ke liye achha hai.',
    },
    modelAnswer: {
      en: 'Clear yes first, then show you have planned: "Yes, I am ready. My family supports it, and I have already looked at company hostel and transport options." Practical planning sounds confident.',
      hi: 'पहले साफ़ हाँ, फिर दिखाएँ कि योजना बनाई है: "हाँ, मैं तैयार हूँ। परिवार साथ है, और मैंने कंपनी हॉस्टल और आने-जाने के विकल्प देख लिए हैं।" व्यावहारिक तैयारी आत्मविश्वास दिखाती है।',
    },
    scores: { correctness: 7, depth: 6, clarity: 4 },
    tip: (g) => ({
      en: 'Start with "Yes, I am ready" before anything else. Then one line of planning (hostel, travel). Hesitation reads as doubt.',
      hi: `सबसे पहले "हाँ, मैं तैयार हूँ" बोलिए। फिर योजना की एक पंक्ति (हॉस्टल, सफ़र)। झिझक से लगता है कि आप ${bySex(g, 'पक्की', 'पक्के')} नहीं हैं।`,
      hinglish: `Sabse pehle "Haan, main taiyaar hoon" boliye. Phir planning ki ek line (hostel, travel). Jhijhak se lagta hai ki aap ${bySex(g, 'pakki', 'pakke')} nahi hain.`,
    }),
  },
  {
    id: 'H3',
    phase: 'hr',
    topic: { en: 'Apprenticeship vs job', hi: 'अप्रेंटिसशिप या नौकरी', hinglish: 'Apprenticeship ya job' },
    text: {
      en: 'If you got both a one-year apprenticeship and a direct job offer, which would you choose, and why?',
      hi: 'अगर आपको एक साल की अप्रेंटिसशिप और एक सीधी नौकरी, दोनों के ऑफ़र मिलें, तो आप क्या चुनेंगे और क्यों?',
      hinglish: 'Agar aapko ek saal ki apprenticeship aur ek seedhi job, dono offer milein, toh aap kya chunenge aur kyun?',
    },
    tts: {
      hi: 'अगर आपको एक साल की अप्रेंटिसशिप और एक सीधी नौकरी, दोनों के ऑफ़र मिलें, तो आप क्या चुनेंगे और क्यों?',
      hinglish: 'अगर आपको एक साल की अप्रेंटिसशिप और एक सीधी जॉब, दोनों ऑफ़र मिलें, तो आप क्या चुनेंगे और क्यों?',
    },
    keywords: [K.apprentice, K.skills, K.stipend, K.certificate],
    scriptedAnswer: {
      en: 'If the company is good, I will choose the apprenticeship. In one year I will learn real shop-floor skills, I get a stipend, and the certificate makes a permanent job easier later. Basically, learning matters more now; the money will grow later.',
      hi: 'अगर कंपनी अच्छी है तो मैं अप्रेंटिसशिप चुनूँगा। एक साल में शॉप-फ़्लोर की असली स्किल सीखने को मिलेगी, स्टाइपेंड भी मिलता है, और सर्टिफ़िकेट से आगे पक्की नौकरी आसान होती है। मतलब, अभी सीखना ज़्यादा ज़रूरी है, पैसा बाद में बढ़ेगा।',
      hinglish:
        'Agar company achhi hai toh main apprenticeship chunuga. Ek saal mein shop floor ki asli skills seekhne ko milengi, stipend bhi milta hai, aur certificate se aage permanent job aasaan hoti hai. Basically, abhi seekhna zyada zaroori hai, paisa baad mein badhega.',
    },
    modelAnswer: {
      en: 'There is no single right answer; the reasoning is scored. Compare on learning (structured training), money (stipend vs salary), and the path to a permanent role, then decide: "a structured apprenticeship at a strong plant, because skills compound."',
      hi: 'कोई एक सही जवाब नहीं है; तर्क पर अंक मिलते हैं। सीखने (व्यवस्थित ट्रेनिंग), पैसे (स्टाइपेंड बनाम सैलरी) और पक्की नौकरी के रास्ते पर तुलना करें, फिर फ़ैसला बताएँ: "अच्छे प्लांट में व्यवस्थित अप्रेंटिसशिप, क्योंकि स्किल समय के साथ बढ़ती है।"',
    },
    scores: { correctness: 8, depth: 7, clarity: 6 },
    tip: {
      en: 'Good reasoning. Say "it depends on the training plan" and name what you would check. That sounds like a decision, not a guess.',
      hi: 'तर्क अच्छा है। कहिए "यह ट्रेनिंग प्लान पर निर्भर है" और बताइए कि आप क्या जाँचेंगे। इससे जवाब फ़ैसला लगता है, अंदाज़ा नहीं।',
      hinglish: 'Reasoning achhi hai. Kahiye "yeh training plan par depend karta hai" aur bataiye ki aap kya check karenge. Isse jawab faisla lagta hai, andaaza nahi.',
    },
  },
]

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const SCRIPTS: Record<'priya' | 'rahul', PersonaScript> = {
  priya: { tech: PRIYA_TECH, hr: PRIYA_HR, guest: GUEST },
  rahul: { tech: RAHUL_TECH, hr: RAHUL_HR, guest: GUEST },
}

export function scriptFor(personaId: PersonaRunId | string | null | undefined): PersonaScript {
  return personaId === 'rahul' ? SCRIPTS.rahul : SCRIPTS.priya
}

/** Base question count for a phase (follow-ups and the guest question are extra). */
export function questionCount(personaId: PersonaRunId | string | null | undefined, phase: Phase): number {
  const s = scriptFor(personaId)
  return (phase === 'hr' ? s.hr : s.tech).length
}

/** Builds the inserted follow-up question from its spec. */
export function makeFollowUp(parent: IQ, spec: FollowUpSpec | FallbackFollowUp, because: string | null): IQ {
  return {
    ...spec.ask,
    id: `${parent.id}·F`,
    phase: parent.phase,
    kind: 'followup',
    topic: { en: `Follow-up on ${parent.topic.en}`, hi: `${parent.topic.hi}: फ़ॉलो-अप`, hinglish: `${tr(parent.topic, 'hinglish')}: follow-up` },
    text: spec.text,
    tts: spec.tts,
    parentId: parent.id,
    because,
  }
}

/** Signals written when a phase ends (Sarthi's notes). */
export const PHASE_SIGNALS: Record<'priya' | 'rahul', Record<Phase, { kind: 'strength' | 'gap'; text: Bi }[]>> = {
  priya: {
    tech: [
      {
        kind: 'strength',
        text: {
          en: 'Explains her own project with specifics (ESP32, MQTT, deep sleep)',
          hi: 'अपने प्रोजेक्ट को बारीकी से समझाती हैं (ESP32, MQTT, डीप स्लीप)',
        },
      },
      {
        kind: 'gap',
        text: { en: 'English delivery lags technical content', hi: 'अंग्रेज़ी डिलीवरी तकनीकी समझ से पीछे' },
      },
    ],
    hr: [
      {
        kind: 'strength',
        text: { en: 'Clear Present–Past–Future story with a real project', hi: 'असली प्रोजेक्ट के साथ साफ़ परिचय (वर्तमान–अतीत–भविष्य)' },
      },
    ],
  },
  rahul: {
    tech: [
      {
        kind: 'strength',
        text: { en: 'Shop-floor sense: coolant, feed and spindle checks in order', hi: 'शॉप-फ़्लोर की समझ: कूलेंट, फ़ीड और स्पिंडल की जाँच क्रम से' },
      },
      {
        kind: 'gap',
        text: { en: 'English delivery lags technical content', hi: 'अंग्रेज़ी डिलीवरी तकनीकी समझ से पीछे' },
      },
    ],
    hr: [
      {
        kind: 'strength',
        text: { en: 'Clear yes on shift work, with a safety routine', hi: 'शिफ्ट के लिए साफ़ हाँ, सुरक्षा रूटीन के साथ' },
      },
    ],
  },
}

/** The behaviour signal written when the relocation answer shows hesitation. */
export const HESITATION_SIGNAL: Bi = { en: 'Hesitant on relocation questions', hi: 'रीलोकेशन सवाल पर झिझक' }

/** Strengths shown in the end-of-phase summary (the gap is built from measured values). */
export const SUMMARY_STRENGTHS: Record<'priya' | 'rahul', Record<Phase, Tri[]>> = {
  priya: {
    tech: [
      {
        en: 'Project ownership: explains Khet-Nami design choices (ESP32, MQTT, deep sleep) with real numbers.',
        hi: 'प्रोजेक्ट पर पकड़: खेत-नमी के फ़ैसले (ESP32, MQTT, डीप स्लीप) असली आँकड़ों के साथ समझाती हैं।',
        hinglish: 'Project ownership: Khet-Nami ke design choices (ESP32, MQTT, deep sleep) real numbers ke saath samjhati hain.',
      },
      {
        en: 'Complexity reasoning: moves from O(n²) to O(n) with a two-pointer pass and says why.',
        hi: 'कॉम्प्लेक्सिटी की समझ: टू-पॉइंटर से O(n²) से O(n) तक जाती हैं और वजह बताती हैं।',
        hinglish: 'Complexity reasoning: two-pointer se O(n²) se O(n) tak jaati hain aur wajah batati hain.',
      },
    ],
    hr: [
      {
        en: 'Authentic story: first-generation engineer with a farmer-facing project.',
        hi: 'सच्ची कहानी: परिवार की पहली इंजीनियर, किसानों के लिए प्रोजेक्ट के साथ।',
        hinglish: 'Authentic story: parivaar ki pehli engineer, kisanon ke liye project ke saath.',
      },
      {
        en: 'Mature on commitments: accepts a bond and reads the terms first.',
        hi: 'प्रतिबद्धता पर समझदारी: बॉन्ड स्वीकार, पर पहले शर्तें पढ़ती हैं।',
        hinglish: 'Commitments par samajhdaari: bond accept, par pehle terms padhti hain.',
      },
    ],
  },
  rahul: {
    tech: [
      {
        en: 'Shop-floor sense: checks coolant, feed rate and spindle speed in a safe order.',
        hi: 'शॉप-फ़्लोर की समझ: कूलेंट, फ़ीड रेट और स्पिंडल स्पीड सुरक्षित क्रम में जाँचते हैं।',
        hinglish: 'Shop-floor sense: coolant, feed rate aur spindle speed safe order mein check karte hain.',
      },
      {
        en: 'EV safety: explains BMS cut-offs and PPE from hands-on CoE lab work.',
        hi: 'EV सुरक्षा: CoE लैब के अनुभव से BMS कट-ऑफ़ और PPE समझाते हैं।',
        hinglish: 'EV safety: CoE lab ke experience se BMS cut-off aur PPE samjhate hain.',
      },
    ],
    hr: [
      {
        en: 'Ready for shift work, with a sleep and safety routine.',
        hi: 'शिफ्ट के काम के लिए तैयार, नींद और सुरक्षा रूटीन के साथ।',
        hinglish: 'Shift work ke liye taiyaar, neend aur safety routine ke saath.',
      },
      {
        en: 'Thinks long-term: values apprenticeship skills over a quick salary.',
        hi: 'लंबी सोच: जल्दी सैलरी से ज़्यादा अप्रेंटिसशिप की स्किल को अहमियत।',
        hinglish: 'Long-term soch: jaldi salary se zyada apprenticeship skills ko ahmiyat.',
      },
    ],
  },
}
