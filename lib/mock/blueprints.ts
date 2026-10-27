// Recruiter-style test blueprints. Patterns are inspired by publicly reported formats;
// none is an official paper and there is no affiliation with any company.
import type { Blueprint, BlueprintSection } from '@/lib/mock/types'

const FOOTNOTE = 'Pattern inspired by publicly reported formats; not an official paper; no affiliation.'
const PACE = 'Demo pace: 6 of 65 questions'

const ELIG_IT: Blueprint['eligibility'] = {
  minCgpa: 6.5,
  maxActiveBacklogs: 0,
  min10th: 60,
  min12th: 60,
  maxGapYears: 1,
}
const ELIG_CORE: Blueprint['eligibility'] = {
  minCgpa: 6.0,
  maxActiveBacklogs: 0,
  min10th: 60,
  min12th: 60,
  maxGapYears: 1,
  minDiplomaPct: 60,
}

function s(
  name: string,
  questions: number,
  minutes: number,
  o: Partial<Pick<BlueprintSection, 'sectionalCutoff' | 'negativeMarking' | 'canRevisit' | 'eliminatory'>> = {},
): BlueprintSection {
  return {
    name,
    questions,
    minutes,
    sectionalCutoff: o.sectionalCutoff,
    negativeMarking: o.negativeMarking ?? false,
    canRevisit: o.canRevisit ?? true,
    eliminatory: o.eliminatory ?? false,
  }
}

export const BLUEPRINTS: Blueprint[] = [
  {
    id: 'tcs-nqt-style',
    label: 'TCS NQT-style',
    track: 'it',
    sections: [
      s('Numerical Ability', 20, 25),
      s('Verbal Ability', 25, 25),
      s('Reasoning Ability', 20, 25),
      s('Advanced Quant + Reasoning', 15, 25),
      s('Coding', 2, 90),
    ],
    typicalBand: 'Ninja/Digital/Prime-equivalent tracks',
    demoPaceNote: PACE,
    eligibility: ELIG_IT,
    commPolicy: 'eliminatory',
    footnote: FOOTNOTE,
  },
  {
    id: 'infosys-se-style',
    label: 'Infosys SE-style',
    track: 'it',
    sections: [
      s('Logical Reasoning', 15, 25, { sectionalCutoff: 40 }),
      s('Mathematical Ability', 10, 35, { sectionalCutoff: 40 }),
      s('Verbal Ability', 20, 20, { sectionalCutoff: 40 }),
      s('Pseudo-code', 5, 10, { sectionalCutoff: 40 }),
      s('Puzzle Solving', 4, 10, { sectionalCutoff: 40 }),
    ],
    typicalBand: 'Systems Engineer / Specialist-equivalent tracks',
    demoPaceNote: PACE,
    eligibility: ELIG_IT,
    commPolicy: 'eliminatory',
    footnote: FOOTNOTE,
  },
  {
    id: 'wipro-nth-style',
    label: 'Wipro NTH-style',
    track: 'it',
    sections: [
      s('Aptitude (Quant, Logical, Verbal)', 48, 48),
      s('Written Communication (Essay)', 1, 20),
      s('Coding', 2, 60),
    ],
    typicalBand: 'Project Engineer / Turbo-equivalent tracks',
    demoPaceNote: PACE,
    eligibility: ELIG_IT,
    commPolicy: 'eliminatory',
    footnote: FOOTNOTE,
  },
  {
    id: 'accenture-style',
    label: 'Accenture-style',
    track: 'it',
    sections: [
      s('Cognitive + Technical', 90, 90, { eliminatory: true }),
      s('Coding', 2, 45, { eliminatory: true }),
      s('Communication Assessment', 20, 20, { eliminatory: true }),
    ],
    typicalBand: 'Associate Software Engineer-equivalent tracks',
    demoPaceNote: PACE,
    eligibility: ELIG_IT,
    commPolicy: 'eliminatory',
    footnote: FOOTNOTE,
  },
  {
    id: 'cognizant-genc-style',
    label: 'Cognizant GenC-style',
    track: 'it',
    sections: [
      s('Quantitative Aptitude', 16, 16, { canRevisit: false }),
      s('Logical Reasoning', 14, 14, { canRevisit: false }),
      s('Verbal Ability', 25, 25, { canRevisit: false }),
    ],
    typicalBand: 'GenC / GenC Next-equivalent tracks',
    demoPaceNote: PACE,
    eligibility: ELIG_IT,
    commPolicy: 'eliminatory',
    footnote: FOOTNOTE,
  },
  {
    id: 'amazon-oa-style',
    label: 'Amazon OA-style',
    track: 'product',
    sections: [s('Coding (DSA)', 2, 90), s('Work-style Survey', 20, 10)],
    typicalBand: 'Product SDE-1-equivalent track',
    demoPaceNote: PACE,
    eligibility: ELIG_IT,
    commPolicy: 'eliminatory',
    footnote: FOOTNOTE,
  },
  {
    id: 'core-mech-oem-style',
    label: 'Core Mechanical (Auto-OEM-style pool drive)',
    track: 'core-mech',
    sections: [
      s('Aptitude', 20, 20),
      s('Core Mechanical MCQ', 30, 30),
      s('Shop-floor Case', 1, 10),
      s('HR Interview (in Hindi)', 1, 15),
    ],
    typicalBand: 'Graduate / Diploma Engineer Trainee-equivalent tracks',
    demoPaceNote: PACE,
    eligibility: ELIG_CORE,
    commPolicy: 'advisory',
    footnote: FOOTNOTE,
  },
  {
    id: 'core-elec-power-style',
    label: 'Core Electrical (Power/EPC-style)',
    track: 'core-elec',
    sections: [
      s('Aptitude', 20, 20),
      s('Core Electrical MCQ', 30, 30),
      s('Electronics & Instrumentation', 15, 15),
      s('Site Safety Case', 1, 10),
    ],
    typicalBand: 'Graduate / Diploma Engineer Trainee-equivalent tracks',
    demoPaceNote: PACE,
    eligibility: ELIG_CORE,
    commPolicy: 'advisory',
    footnote: FOOTNOTE,
  },
  {
    id: 'core-civil-style',
    label: 'Core Civil (Construction/EPC-style)',
    track: 'core-civil',
    sections: [
      s('Aptitude', 20, 20),
      s('Core Civil MCQ', 30, 30),
      s('Drawing & Estimation', 10, 15),
      s('Site Execution Case', 1, 10),
    ],
    typicalBand: 'Graduate / Diploma Engineer Trainee-equivalent tracks',
    demoPaceNote: PACE,
    eligibility: ELIG_CORE,
    commPolicy: 'advisory',
    footnote: FOOTNOTE,
  },
]

const BY_ID = new Map(BLUEPRINTS.map((b) => [b.id, b]))

/**
 * Placeholder for drives without a fixed blueprint (e.g. the MSME hiring mela) and unknown ids.
 * Not part of BLUEPRINTS; isCoreBlueprint() is false for it.
 */
export const OPEN_FORMAT_BLUEPRINT: Blueprint = {
  id: 'open-format',
  label: 'Open format (walk-in interviews)',
  track: 'it',
  sections: [s('Walk-in interview', 1, 15)],
  typicalBand: 'Varies by employer',
  demoPaceNote: PACE,
  eligibility: ELIG_CORE,
  commPolicy: 'advisory',
  footnote: 'Employers set their own process; no fixed test pattern.',
}

/** Never returns undefined: missing or unknown ids give OPEN_FORMAT_BLUEPRINT. */
export function blueprintById(id: string | null | undefined): Blueprint {
  return (id && BY_ID.get(id)) || OPEN_FORMAT_BLUEPRINT
}

export function isCoreBlueprint(id: string | null | undefined): boolean {
  const b = id ? BY_ID.get(id) : undefined
  return !!b && b.track.startsWith('core')
}
