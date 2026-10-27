// Demo personas. All fictional; every screen is labelled illustrative demo data.
// Numbers are hand-checked: computePRI(pillars) === pri for every attempt (asserted in checks.ts).
import { DEMO_TODAY, isoDaysBefore } from '@/lib/mock/state'
import type { Attempt, Persona, PersonaId, Pillars } from '@/lib/mock/types'

function P(
  aptitude: number,
  technical: number,
  communication: number,
  techInterview: number,
  hr: number,
  resume: number,
  integrity: number,
): Pillars {
  return { aptitude, technical, communication, techInterview, hr, resume, integrity }
}

export const PRIYA: Persona = {
  id: 'priya',
  name: 'Priya Kumari',
  nameHi: 'प्रिया कुमारी',
  gender: 'F',
  kind: 'engineering',
  institutionId: 'pce-purnea',
  districtId: 'purnia',
  branch: 'ECE',
  branchLabel: 'B.Tech ECE · 2027 batch',
  batch: '2027',
  medium: 'Hindi',
  firstGen: true,
  cgpa: 7.1,
  tenth: 78,
  twelfth: 71,
  activeBacklogs: 0,
  gapYears: 0,
  apaarMasked: 'APAAR •••• •••• 4821',
  credentials: [
    { id: 'priya-10th', label: '10th marksheet', issuer: 'BSEB', status: 'verified' },
    { id: 'priya-12th', label: '12th marksheet', issuer: 'BSEB', status: 'verified' },
    {
      id: 'priya-fsp',
      label: 'AI Foundations',
      issuer: 'NASSCOM FutureSkills Prime',
      status: 'integration-ready',
    },
    { id: 'priya-st', label: 'Python', issuer: 'IIT Bombay Spoken Tutorial', status: 'integration-ready' },
    { id: 'priya-coe', label: 'IoT lab · 40h', issuer: 'Centre of Excellence', status: 'verified' },
  ],
  project: {
    title: 'Khet-Nami: IoT soil-moisture alerts for farmers',
    summary: {
      en: 'ESP32 sensors send soil moisture over MQTT; farmers get Hindi SMS alerts',
      hi: 'ESP32 सेंसर MQTT से नमी का डेटा भेजते हैं; किसानों को हिंदी SMS अलर्ट मिलता है',
      hinglish: 'ESP32 sensors MQTT se soil moisture bhejte hain; kisaanon ko Hindi SMS alert milta hai',
    },
    keywords: ['ESP32', 'sensor', 'MQTT', 'latency', 'battery', 'cloud', 'SMS'],
  },
  attempts: [
    {
      id: 'priya-a1',
      date: isoDaysBefore(22), // 2026-10-06
      label: { en: 'Diagnostic', hi: 'डायग्नोस्टिक' },
      pillars: P(52, 38, 25, 38, 40, 40, 100),
      pri: 42,
      versant: 35,
      content: 42,
      delivery: 30,
    },
    {
      id: 'priya-a2',
      date: isoDaysBefore(12), // 2026-10-16
      label: { en: 'Attempt 2', hi: 'प्रयास 2' },
      pillars: P(64, 60, 37, 56, 52, 58, 100),
      pri: 58,
      versant: 42,
      content: 63,
      delivery: 40,
    },
    {
      id: 'priya-a3',
      date: DEMO_TODAY,
      label: { en: 'Placement Day (today)', hi: 'प्लेसमेंट डे (आज)', hinglish: 'Placement Day (aaj)' },
      pillars: P(72, 78, 50, 70, 66, 78, 100),
      pri: 71,
      versant: 50,
      content: 78,
      delivery: 52,
    },
  ],
  defaultBlueprintId: 'tcs-nqt-style',
  avatarInitials: 'PK',
}

export const RAHUL: Persona = {
  id: 'rahul',
  name: 'Rahul Kumar',
  nameHi: 'राहुल कुमार',
  gender: 'M',
  kind: 'polytechnic',
  institutionId: 'gp-muzaffarpur',
  districtId: 'muzaffarpur',
  branch: 'D-AUTO',
  branchLabel: 'Diploma Mechanical (Automobile) · 2027',
  batch: '2027',
  medium: 'Hindi',
  firstGen: true,
  diplomaPct: 72,
  tenth: 74,
  activeBacklogs: 0,
  gapYears: 0,
  apaarMasked: 'APAAR •••• •••• 3356',
  credentials: [
    { id: 'rahul-coe', label: 'EV lab · 60h', issuer: 'Centre of Excellence', status: 'verified' },
    { id: 'rahul-st', label: 'LibreCAD', issuer: 'IIT Bombay Spoken Tutorial', status: 'integration-ready' },
  ],
  project: {
    title: 'EV battery-pack thermal check rig (CoE)',
    summary: {
      en: 'A bench rig that logs cell temperatures and BMS cut-offs while an EV battery pack is load-tested',
      hi: 'एक बेंच रिग जो EV बैटरी पैक की लोड टेस्टिंग के दौरान सेल का तापमान और BMS कट-ऑफ़ रिकॉर्ड करता है',
      hinglish: 'Ek bench rig jo EV battery pack ki load testing ke time cell temperature aur BMS cut-off log karta hai',
    },
    keywords: ['EV', 'battery', 'BMS', 'torque', 'safety'],
  },
  attempts: [
    {
      id: 'rahul-a1',
      date: DEMO_TODAY,
      label: { en: 'Placement Day (today)', hi: 'प्लेसमेंट डे (आज)', hinglish: 'Placement Day (aaj)' },
      pillars: P(64, 81, 42, 72, 70, 60, 100),
      pri: 68,
      versant: 45,
      content: 80,
      delivery: 54,
    },
  ],
  defaultBlueprintId: 'core-mech-oem-style',
  avatarInitials: 'RK',
}

export const NUSRAT: Persona = {
  id: 'nusrat',
  name: 'Nusrat Parveen',
  nameHi: 'नुसरत परवीन',
  gender: 'F',
  kind: 'school',
  districtId: 'purnia',
  branchLabel: 'Class 10 · Govt +2 School, Kasba (Purnia)',
  classLevel: 10,
  medium: 'Hindi',
  firstGen: true,
  apaarMasked: 'APAAR •••• •••• 1907',
  credentials: [],
  attempts: [],
  avatarInitials: 'NP',
}

export const NUSRAT_PROFILE = {
  riasec: { R: 78, I: 72, A: 34, S: 52, E: 40, C: 58 },
  aptitude: { numerical: 82, verbal: 64, spatial: 76, mechanical: 71, logical: 69 },
  districtPercentile: 88,
}

/**
 * Works both ways: PERSONAS[personaId] (keyed, non-enumerable) and PERSONAS.map / .find /
 * Object.values (array of PRIYA, RAHUL, NUSRAT).
 */
export const PERSONAS = Object.defineProperties([PRIYA, RAHUL, NUSRAT], {
  priya: { value: PRIYA, enumerable: false },
  rahul: { value: RAHUL, enumerable: false },
  nusrat: { value: NUSRAT, enumerable: false },
}) as Persona[] & Record<PersonaId, Persona>

const EMPTY_ATTEMPT: Attempt = {
  id: 'none',
  date: DEMO_TODAY,
  label: { en: 'No attempt yet', hi: 'अभी कोई प्रयास नहीं' },
  pillars: P(0, 0, 0, 0, 0, 0, 100),
  pri: 0,
  versant: 20,
  content: 0,
  delivery: 0,
}

/** The most recent attempt. Never undefined (a persona with no attempts gets an empty placeholder). */
export function latestAttempt(p: Persona | null | undefined): Attempt {
  const a = p?.attempts
  return a && a.length > 0 ? a[a.length - 1] : EMPTY_ATTEMPT
}

/** The attempt before the latest, or null (Rahul has one attempt). Always guard. */
export function previousAttempt(p: Persona | null | undefined): Attempt | null {
  const a = p?.attempts
  return a && a.length > 1 ? a[a.length - 2] : null
}
