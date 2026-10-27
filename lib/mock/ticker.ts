// Live-ticker events (illustrative). NEVER contains a personal name.
import type { TickerEvent } from '@/lib/mock/types'

export const TICKER: TickerEvent[] = [
  {
    id: 't1',
    districtId: 'purnia',
    kind: 'ready',
    text: {
      en: 'Purnea CE: 14 students crossed PRI 70 this week',
      hi: 'पूर्णिया CE: इस सप्ताह 14 छात्रों ने PRI 70 पार किया',
    },
  },
  {
    id: 't2',
    districtId: 'muzaffarpur',
    kind: 'drive',
    text: {
      en: 'GP Muzaffarpur: 34 students added to auto-OEM-style pool drive',
      hi: 'GP मुजफ्फरपुर: ऑटो-OEM-शैली पूल ड्राइव में 34 छात्र जोड़े गए',
    },
  },
  {
    id: 't3',
    districtId: 'gaya',
    kind: 'interview',
    text: { en: 'Gaya CE: 128 AI mock interviews today', hi: 'गया CE: आज 128 AI मॉक इंटरव्यू' },
  },
  {
    id: 't4',
    districtId: 'purnia',
    kind: 'school',
    text: {
      en: 'Govt +2 School Kasba: 46 students took Disha Test',
      hi: 'राजकीय +2 विद्यालय कसबा: 46 छात्रों ने दिशा टेस्ट दिया',
    },
  },
  {
    id: 't5',
    districtId: 'patna',
    kind: 'offer',
    text: {
      en: 'BCE Bakhtiyarpur: 9 internship offers logged today',
      hi: 'BCE बख्तियारपुर: आज 9 इंटर्नशिप ऑफ़र दर्ज हुए',
    },
  },
  {
    id: 't6',
    districtId: 'darbhanga',
    kind: 'interview',
    text: {
      en: 'DCE Darbhanga: 96 Hindi-mode mock interviews completed',
      hi: 'DCE दरभंगा: 96 हिंदी-मोड मॉक इंटरव्यू पूरे हुए',
    },
  },
  {
    id: 't7',
    districtId: 'saran',
    kind: 'ready',
    text: {
      en: 'LNJPIT Chapra: ECE batch average PRI up 3.2 this week',
      hi: 'LNJPIT छपरा: ECE बैच का औसत PRI इस सप्ताह 3.2 बढ़ा',
    },
  },
  {
    id: 't8',
    districtId: 'madhubani',
    kind: 'ready',
    text: {
      en: 'GEC Madhubani: 21 students moved out of the at-risk band',
      hi: 'GEC मधुबनी: 21 छात्र जोखिम श्रेणी से बाहर निकले',
    },
  },
  {
    id: 't9',
    districtId: 'bhagalpur',
    kind: 'drive',
    text: {
      en: 'BCE Bhagalpur: civil core drive registrations open',
      hi: 'BCE भागलपुर: सिविल कोर ड्राइव के लिए पंजीकरण शुरू',
    },
  },
  {
    id: 't10',
    districtId: 'kishanganj',
    kind: 'interview',
    text: {
      en: 'GEC Kishanganj: Versant-style communication sprint started for 2027 batch',
      hi: 'GEC किशनगंज: 2027 बैच के लिए Versant-शैली संवाद स्प्रिंट शुरू',
    },
  },
  {
    id: 't11',
    districtId: 'katihar',
    kind: 'ready',
    text: {
      en: 'KEC Katihar: 11 students crossed PRI 70 this week',
      hi: 'KEC कटिहार: इस सप्ताह 11 छात्रों ने PRI 70 पार किया',
    },
  },
  {
    id: 't12',
    districtId: 'araria',
    kind: 'school',
    text: {
      en: 'Araria: 3 government +2 schools joined the Disha career-guidance pilot',
      hi: 'अररिया: 3 राजकीय +2 विद्यालय दिशा करियर-मार्गदर्शन पायलट से जुड़े',
    },
  },
  {
    id: 't13',
    districtId: 'nalanda',
    kind: 'offer',
    text: {
      en: 'NCE Chandi: 6 core-engineering offers confirmed',
      hi: 'NCE चंडी: 6 कोर-इंजीनियरिंग ऑफ़र पक्के हुए',
    },
  },
  {
    id: 't14',
    districtId: 'saharsa',
    kind: 'interview',
    text: {
      en: "GWP Saharsa: 58 AI mock interviews today",
      hi: 'GWP सहरसा: आज 58 AI मॉक इंटरव्यू',
    },
  },
  {
    id: 't15',
    districtId: 'east-champaran',
    kind: 'drive',
    text: {
      en: 'MCE Motihari: 41 students shortlisted for an IT services drive',
      hi: 'MCE मोतिहारी: IT सेवा ड्राइव के लिए 41 छात्र शॉर्टलिस्ट',
    },
  },
  {
    id: 't16',
    districtId: 'supaul',
    kind: 'ready',
    text: {
      en: 'SCE Supaul: communication pillar +5 after a 2-week sprint',
      hi: 'SCE सुपौल: 2 सप्ताह के स्प्रिंट के बाद संवाद स्कोर +5',
    },
  },
]
