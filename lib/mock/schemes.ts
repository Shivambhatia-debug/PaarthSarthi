// Government schemes surfaced to students and parents. Amounts and rules are indicative:
// every card says 'verify on the official portal'.
import type { PersonaId, Scheme } from '@/lib/mock/types'

const AADHAAR = { en: 'Aadhaar', hi: 'आधार' }
const BANK = { en: 'Bank account (DBT-linked)', hi: 'बैंक खाता (DBT से जुड़ा)' }
const MARKSHEET = { en: 'Latest marksheet', hi: 'नवीनतम अंकपत्र' }
const RESIDENCE = { en: 'Residence certificate', hi: 'निवास प्रमाण पत्र' }
const INCOME = { en: 'Income certificate', hi: 'आय प्रमाण पत्र' }
const CASTE = { en: 'Caste certificate', hi: 'जाति प्रमाण पत्र' }
const SCHOOL_ID = { en: 'School ID / UDISE details', hi: 'स्कूल पहचान / UDISE विवरण' }

export const SCHEMES: Scheme[] = [
  {
    id: 'cm-pratigya',
    name: { en: 'Mukhyamantri Pratigya Yojana', hi: 'मुख्यमंत्री प्रतिज्ञा योजना' },
    audience: 'college',
    amount: {
      en: '₹4,000 (12th) / ₹5,000 (ITI or diploma) / ₹6,000 (graduate) per month; +₹2,000 outside district; +₹5,000 outside state',
      hi: '₹4,000 (12वीं) / ₹5,000 (ITI या डिप्लोमा) / ₹6,000 (स्नातक) प्रति माह; ज़िले से बाहर +₹2,000; राज्य से बाहर +₹5,000',
    },
    status: 'open',
    verify: true,
    docs: [AADHAAR, MARKSHEET, RESIDENCE, BANK],
    portalLabel: 'Official CM Pratigya portal',
    rule: {
      en: 'For eligible youth not in full-time study; verify on the official portal',
      hi: 'पूर्णकालिक पढ़ाई में न लगे पात्र युवाओं के लिए; आधिकारिक पोर्टल पर पुष्टि करें',
    },
    matchFor: ['priya', 'rahul'],
    matchNote: {
      priya: {
        en: 'Likely eligible after graduation (verify): ₹6,000/month',
        hi: 'स्नातक के बाद संभवतः पात्र (पुष्टि करें): ₹6,000/माह',
        hinglish: 'Graduation ke baad shayad eligible (verify karein): ₹6,000/month',
      },
      rahul: {
        en: 'Likely eligible after your diploma (verify): ₹5,000/month',
        hi: 'डिप्लोमा के बाद संभवतः पात्र (पुष्टि करें): ₹5,000/माह',
        hinglish: 'Diploma ke baad shayad eligible (verify karein): ₹5,000/month',
      },
    },
  },
  {
    id: 'student-credit-card',
    name: { en: 'Bihar Student Credit Card', hi: 'बिहार स्टूडेंट क्रेडिट कार्ड' },
    audience: 'both',
    amount: { en: 'Education loan up to ₹4 lakh', hi: '₹4 लाख तक का शिक्षा ऋण' },
    status: 'open',
    verify: true,
    docs: [AADHAAR, MARKSHEET, RESIDENCE, { en: 'Admission letter', hi: 'प्रवेश पत्र' }],
    portalLabel: '7 Nischay / MNSSBY portal',
    rule: {
      en: 'For Bihar students pursuing higher or technical education after Class 12; verify on the official portal',
      hi: '12वीं के बाद उच्च या तकनीकी शिक्षा ले रहे बिहार के छात्रों के लिए; आधिकारिक पोर्टल पर पुष्टि करें',
    },
    matchFor: ['priya', 'rahul', 'nusrat'],
    matchNote: {
      nusrat: {
        en: 'For later: after Class 12, for diploma or degree fees (verify)',
        hi: 'आगे के लिए: 12वीं के बाद डिप्लोमा या डिग्री की फ़ीस के लिए (पुष्टि करें)',
      },
    },
  },
  {
    id: 'kushal-yuva',
    name: { en: 'Kushal Yuva Program (BSDM)', hi: 'कुशल युवा कार्यक्रम (BSDM)' },
    audience: 'college',
    amount: {
      en: 'Free training: communication, computer basics and soft skills',
      hi: 'निःशुल्क प्रशिक्षण: संवाद कौशल, कंप्यूटर की बुनियादी जानकारी और सॉफ्ट स्किल्स',
    },
    status: 'open',
    verify: true,
    docs: [AADHAAR, MARKSHEET, RESIDENCE],
    portalLabel: 'BSDM / 7 Nischay portal',
    rule: {
      en: 'For youth aged 15-28 who have passed Class 10 or above; verify on the official portal',
      hi: '10वीं या उससे ऊपर उत्तीर्ण 15-28 वर्ष के युवाओं के लिए; आधिकारिक पोर्टल पर पुष्टि करें',
    },
    matchFor: ['priya', 'rahul'],
  },
  {
    id: 'swayam-sahayata',
    name: { en: 'Swayam Sahayata Bhatta', hi: 'स्वयं सहायता भत्ता' },
    audience: 'college',
    amount: { en: '₹1,000/month for up to 2 years', hi: '₹1,000/माह, अधिकतम 2 वर्ष' },
    status: 'open',
    verify: true,
    docs: [AADHAAR, MARKSHEET, BANK, RESIDENCE],
    portalLabel: '7 Nischay / MNSSBY portal',
    rule: {
      en: 'For job-seeking youth aged 20-25 not in study or employment; verify on the official portal',
      hi: 'पढ़ाई या रोज़गार में न लगे 20-25 वर्ष के रोज़गार खोजने वाले युवाओं के लिए; आधिकारिक पोर्टल पर पुष्टि करें',
    },
    matchFor: ['priya', 'rahul'],
  },
  {
    id: 'rozgar-setu',
    name: { en: 'Bihar Rozgar Setu', hi: 'बिहार रोज़गार सेतु' },
    audience: 'college',
    amount: { en: 'Job and apprenticeship matching', hi: 'नौकरी और अप्रेंटिसशिप मिलान' },
    status: 'open',
    verify: true,
    docs: [AADHAAR, MARKSHEET],
    portalLabel: 'Rozgar Setu portal',
    rule: {
      en: 'Register to receive verified job and apprenticeship openings; verify on the official portal',
      hi: 'सत्यापित नौकरी और अप्रेंटिसशिप के अवसर पाने के लिए पंजीकरण करें; आधिकारिक पोर्टल पर पुष्टि करें',
    },
    matchFor: ['priya', 'rahul'],
  },
  {
    id: 'nmms',
    name: { en: 'NMMS Scholarship', hi: 'राष्ट्रीय साधन-सह-मेधा छात्रवृत्ति (NMMS)' },
    audience: 'school',
    amount: { en: '₹12,000/year (Class 9-12)', hi: '₹12,000/वर्ष (कक्षा 9-12)' },
    status: 'open',
    deadline: '2026-11-30',
    verify: true,
    docs: [AADHAAR, MARKSHEET, INCOME, SCHOOL_ID],
    portalLabel: 'National Scholarship Portal',
    rule: {
      en: 'For students selected in the Class 8 NMMS exam; renew every year on NSP; verify on the official portal',
      hi: 'कक्षा 8 की NMMS परीक्षा में चयनित छात्रों के लिए; हर वर्ष NSP पर नवीनीकरण; आधिकारिक पोर्टल पर पुष्टि करें',
    },
    matchFor: ['nusrat'],
    matchNote: {
      nusrat: {
        en: 'Renewal if selected in Class 8 (verify)',
        hi: 'कक्षा 8 में चयनित होने पर नवीनीकरण (पुष्टि करें)',
      },
    },
  },
  {
    id: 'balika-protsahan',
    name: { en: 'Mukhyamantri Balika Protsahan Yojana', hi: 'मुख्यमंत्री बालिका प्रोत्साहन योजना' },
    audience: 'school',
    amount: {
      en: '₹10,000 for passing Class 10 in first division',
      hi: '10वीं प्रथम श्रेणी में उत्तीर्ण होने पर ₹10,000',
    },
    status: 'upcoming',
    verify: true,
    docs: [AADHAAR, MARKSHEET, BANK],
    portalLabel: 'Official e-Kalyan portal',
    rule: {
      en: 'For girl students of Bihar after the Class 10 result; verify on the official portal',
      hi: '10वीं के परिणाम के बाद बिहार की छात्राओं के लिए; आधिकारिक पोर्टल पर पुष्टि करें',
    },
    matchFor: ['nusrat'],
    matchNote: {
      nusrat: {
        en: 'If you pass Class 10 in first division (verify): ₹10,000',
        hi: '10वीं प्रथम श्रेणी में पास होने पर (पुष्टि करें): ₹10,000',
      },
    },
  },
  {
    id: 'post-matric',
    name: { en: 'Post-Matric Scholarship (SC/ST/BC/EBC)', hi: 'पोस्ट-मैट्रिक छात्रवृत्ति (SC/ST/BC/EBC)' },
    audience: 'both',
    amount: { en: 'Tuition and maintenance support (category-wise)', hi: 'शिक्षण शुल्क और भरण-पोषण सहायता (श्रेणी-वार)' },
    status: 'open',
    verify: true,
    docs: [AADHAAR, MARKSHEET, CASTE, INCOME, BANK],
    portalLabel: 'PMS Bihar / NSP portal',
    rule: {
      en: 'For eligible SC/ST/BC/EBC students after Class 10, within the income limit; verify on the official portal',
      hi: '10वीं के बाद आय-सीमा के भीतर पात्र SC/ST/BC/EBC छात्रों के लिए; आधिकारिक पोर्टल पर पुष्टि करें',
    },
    matchFor: [],
  },
  {
    id: 'inspire-manak',
    name: { en: 'INSPIRE-MANAK', hi: 'इंस्पायर-मानक (INSPIRE-MANAK)' },
    audience: 'school',
    amount: { en: '₹10,000 per selected idea', hi: 'हर चयनित आइडिया पर ₹10,000' },
    status: 'open',
    deadline: '2026-12-15',
    verify: true,
    docs: [SCHOOL_ID, { en: 'Idea summary (school nomination)', hi: 'आइडिया का सारांश (स्कूल द्वारा नामांकन)' }],
    portalLabel: 'INSPIRE-MANAK e-MIAS portal',
    rule: {
      en: 'Schools nominate student ideas (Class 6-12); verify on the official portal',
      hi: 'स्कूल छात्रों के आइडिया नामांकित करते हैं (कक्षा 6-12); आधिकारिक पोर्टल पर पुष्टि करें',
    },
    matchFor: ['nusrat'],
  },
  {
    id: 'bseb-coaching',
    name: { en: 'BSEB free online coaching', hi: 'BSEB निःशुल्क ऑनलाइन कोचिंग' },
    audience: 'school',
    amount: { en: 'Free (Class 9-12)', hi: 'निःशुल्क (कक्षा 9-12)' },
    status: 'open',
    verify: true,
    docs: [SCHOOL_ID],
    portalLabel: 'BSEB official portal',
    rule: {
      en: 'Free online classes for BSEB students of Class 9-12; verify on the official portal',
      hi: 'कक्षा 9-12 के BSEB छात्रों के लिए निःशुल्क ऑनलाइन कक्षाएँ; आधिकारिक पोर्टल पर पुष्टि करें',
    },
    matchFor: ['nusrat'],
  },
  {
    id: 'dcece',
    name: { en: 'DCECE (polytechnic entrance)', hi: 'DCECE (पॉलिटेक्निक प्रवेश परीक्षा)' },
    audience: 'school',
    amount: { en: 'Entrance to government polytechnics after Class 10', hi: '10वीं के बाद सरकारी पॉलिटेक्निक में प्रवेश' },
    status: 'upcoming',
    verify: true,
    docs: [AADHAAR, MARKSHEET, RESIDENCE],
    portalLabel: 'BCECEB official portal',
    rule: {
      en: 'Notification expected in spring; we will alert you when forms open (verify on the official portal)',
      hi: 'अधिसूचना वसंत में अपेक्षित; फ़ॉर्म खुलने पर हम सूचना देंगे (आधिकारिक पोर्टल पर पुष्टि करें)',
    },
    matchFor: ['nusrat'],
    matchNote: {
      nusrat: {
        en: 'Your Disha Test points to Polytechnic Electronics via DCECE',
        hi: 'आपका दिशा टेस्ट DCECE से पॉलिटेक्निक इलेक्ट्रॉनिक्स की ओर इशारा करता है',
      },
    },
  },
  {
    id: 'ntse',
    name: { en: 'NTSE', hi: 'राष्ट्रीय प्रतिभा खोज परीक्षा (NTSE)' },
    audience: 'school',
    amount: { en: 'Scholarship (scheme paused)', hi: 'छात्रवृत्ति (योजना स्थगित)' },
    status: 'paused',
    verify: true,
    docs: [],
    portalLabel: 'NCERT',
    rule: {
      en: 'Paused since 2021 — we will alert if revived',
      hi: '2021 से स्थगित — दोबारा शुरू होने पर हम सूचना देंगे',
    },
    matchFor: [],
  },
]

const STATUS_ORDER: Record<Scheme['status'], number> = { open: 0, upcoming: 1, paused: 2 }

/** Schemes matched to a persona, open first. */
export function schemesFor(personaId: PersonaId | null | undefined): Scheme[] {
  if (!personaId) return []
  return SCHEMES.filter((s) => s.matchFor.includes(personaId)).sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
  )
}
