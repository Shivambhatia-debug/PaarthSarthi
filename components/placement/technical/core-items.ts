// Round 2 · core-technical track (polytechnic / core branches). Pattern-inspired items, Bi text.
// Only Mechanical & Automobile has the full content (6 MCQs + shop-floor case); Electrical, Civil and
// Fire & Safety reuse the same UI with 3 items each. Pure module.

import type { Bi } from '@/lib/os/i18n'
import type { KeywordSpec } from '@/lib/ai-sim'

export type CoreTrackId = 'mech' | 'elec' | 'civil' | 'fire'
export type DrawingOptionId = 'gamma' | 'l-left' | 'l-right' | 'rect'

export interface CoreMcq {
  id: string
  topic: Bi
  q: Bi
  options: Bi[]
  /** Index of the correct option. */
  answer: number
  explain: Bi
  /** The option autopilot / fast-forward picks (Rahul misses the drawing question). Defaults to `answer`. */
  autopick?: number
  /** Render the L-bracket drawing; options become drawn front views. */
  figure?: 'l-bracket'
  figureOptions?: DrawingOptionId[]
  tag: string
}

export interface RubricCheck {
  id: string
  label: Bi
  keywords: KeywordSpec[]
}

export interface CoreCase {
  prompt: Bi
  /** Typed by 'Use scripted answer' (Hinglish, as Rahul would say it). */
  scripted: string
  modelAnswer: Bi
  /** Root-cause ordering score shown for a complete answer. */
  orderScore: number
  safety: RubricCheck
  terms: RubricCheck[]
  /** Items the rubric expects; any not mentioned are listed as 'Missed'. */
  expected: RubricCheck[]
}

export interface CoreSignal {
  kind: 'strength' | 'gap' | 'behaviour'
  text: Bi
}

export interface CoreTrack {
  id: CoreTrackId
  label: Bi
  short: Bi
  tag: string
  branches: string
  blueprintId: string
  items: CoreMcq[]
  case?: CoreCase
  signals: CoreSignal[]
  signalChip: string
  /** Chip when the case answer covered every expected item. */
  signalChipCovered?: string
}

const OEM = 'Auto-OEM-style'

// -----------------------------------------------------------------------------
// Mechanical & Automobile (full)
// -----------------------------------------------------------------------------

const MECH: CoreTrack = {
  id: 'mech',
  label: { en: 'Core Mechanical & Automobile', hi: 'कोर मैकेनिकल और ऑटोमोबाइल', hinglish: 'Core Mechanical & Automobile' },
  short: { en: 'Mechanical', hi: 'मैकेनिकल', hinglish: 'Mechanical' },
  tag: OEM,
  branches: 'Diploma ME · AUTO · B.Tech ME',
  blueprintId: 'core-mech-oem-style',
  items: [
    {
      id: 'm1',
      tag: OEM,
      topic: { en: 'IC engines', hi: 'आईसी इंजन', hinglish: 'IC engines' },
      q: {
        en: 'What is the correct order of strokes in a four-stroke petrol engine?',
        hi: 'चार-स्ट्रोक पेट्रोल इंजन में स्ट्रोक का सही क्रम क्या है?',
        hinglish: 'Four-stroke petrol engine mein strokes ka sahi order kya hai?',
      },
      options: [
        { en: 'Suction → Compression → Power → Exhaust', hi: 'सक्शन → कम्प्रेशन → पावर → एग्ज़ॉस्ट' },
        { en: 'Compression → Suction → Power → Exhaust', hi: 'कम्प्रेशन → सक्शन → पावर → एग्ज़ॉस्ट' },
        { en: 'Suction → Power → Compression → Exhaust', hi: 'सक्शन → पावर → कम्प्रेशन → एग्ज़ॉस्ट' },
        { en: 'Power → Exhaust → Suction → Compression', hi: 'पावर → एग्ज़ॉस्ट → सक्शन → कम्प्रेशन' },
      ],
      answer: 0,
      explain: {
        en: 'Intake, compression, power (expansion), exhaust: one power stroke every two crank revolutions.',
        hi: 'सक्शन, कम्प्रेशन, पावर (प्रसार), एग्ज़ॉस्ट: क्रैंक के हर दो चक्कर में एक पावर स्ट्रोक।',
        hinglish: 'Suction, compression, power, exhaust: crank ke har do chakkar mein ek power stroke.',
      },
    },
    {
      id: 'm2',
      tag: OEM,
      topic: { en: 'Power transmission', hi: 'शक्ति संचरण', hinglish: 'Power transmission' },
      q: {
        en: 'A driver gear with 20 teeth drives a gear with 60 teeth. What are the gear ratio and the output torque (ignoring losses)?',
        hi: '20 दाँतों वाला ड्राइवर गियर 60 दाँतों वाले गियर को चलाता है। गियर अनुपात और आउटपुट टॉर्क (हानि छोड़कर) क्या होगा?',
        hinglish: '20 daant wala driver gear 60 daant wale gear ko chalata hai. Gear ratio aur output torque (losses chhodkar) kya hoga?',
      },
      options: [
        { en: '1 : 3, torque ÷ 3', hi: '1 : 3, टॉर्क ÷ 3' },
        { en: '3 : 1, torque × 3', hi: '3 : 1, टॉर्क × 3' },
        { en: '3 : 1, torque ÷ 3', hi: '3 : 1, टॉर्क ÷ 3' },
        { en: '1 : 3, torque × 3', hi: '1 : 3, टॉर्क × 3' },
      ],
      answer: 1,
      explain: {
        en: 'Ratio = driven ÷ driver = 60 ÷ 20 = 3 : 1. Speed falls 3 times, so torque rises 3 times.',
        hi: 'अनुपात = ड्रिवन ÷ ड्राइवर = 60 ÷ 20 = 3 : 1। गति 3 गुना घटती है, इसलिए टॉर्क 3 गुना बढ़ता है।',
        hinglish: 'Ratio = driven ÷ driver = 60 ÷ 20 = 3 : 1. Speed 3 guna kam, isliye torque 3 guna zyada.',
      },
    },
    {
      id: 'm3',
      tag: OEM,
      topic: { en: 'Metrology · fits', hi: 'मेट्रोलॉजी · फ़िट', hinglish: 'Metrology · fits' },
      q: {
        en: 'In the hole-basis system, a shaft and hole are specified as H7/g6. What type of fit is this?',
        hi: 'होल-बेसिस प्रणाली में शाफ़्ट और छेद H7/g6 दिए गए हैं। यह किस प्रकार का फ़िट है?',
        hinglish: 'Hole-basis system mein shaft aur hole H7/g6 diye hain. Yeh kis type ka fit hai?',
      },
      options: [
        { en: 'Clearance fit', hi: 'क्लियरेंस फ़िट' },
        { en: 'Interference fit', hi: 'इंटरफ़ेरेंस फ़िट' },
        { en: 'Transition fit', hi: 'ट्रांज़िशन फ़िट' },
        { en: 'Shrink fit', hi: 'श्रिंक फ़िट' },
      ],
      answer: 0,
      explain: {
        en: 'In H7 the hole’s lower deviation is zero; a g-shaft is always slightly undersize, so there is always clearance (a sliding fit).',
        hi: 'H7 में छेद का निचला विचलन शून्य है; g-शाफ़्ट हमेशा थोड़ा छोटा होता है, इसलिए हमेशा क्लियरेंस रहता है (स्लाइडिंग फ़िट)।',
        hinglish: 'H7 mein hole ka lower deviation zero hai; g-shaft hamesha thoda chhota hota hai, isliye clearance rehta hai (sliding fit).',
      },
    },
    {
      id: 'm4',
      tag: OEM,
      topic: { en: 'Lean shop floor', hi: 'लीन शॉप-फ़्लोर', hinglish: 'Lean shop floor' },
      q: {
        en: 'What is the first step of 5S on a shop floor?',
        hi: 'शॉप-फ़्लोर पर 5S का पहला चरण क्या है?',
        hinglish: 'Shop floor par 5S ka pehla step kya hai?',
      },
      options: [
        { en: 'Sort (Seiri)', hi: 'सॉर्ट (छँटाई)' },
        { en: 'Set in order (Seiton)', hi: 'सेट इन ऑर्डर (व्यवस्था)' },
        { en: 'Shine (Seiso)', hi: 'शाइन (सफ़ाई)' },
        { en: 'Standardise (Seiketsu)', hi: 'स्टैंडर्डाइज़ (मानकीकरण)' },
      ],
      answer: 0,
      explain: {
        en: 'Sort first: remove what is not needed, then set in order, shine, standardise and sustain.',
        hi: 'पहले सॉर्ट: जो ज़रूरी नहीं उसे हटाएँ, फिर व्यवस्था, सफ़ाई, मानकीकरण और अनुशासन।',
        hinglish: 'Pehle Sort: jo zaroori nahi use hatao, phir set in order, shine, standardise, sustain.',
      },
    },
    {
      id: 'm5',
      tag: OEM,
      topic: { en: 'Safety · PPE', hi: 'सुरक्षा · पीपीई', hinglish: 'Safety · PPE' },
      q: {
        en: 'Which PPE is essential while working on a bench grinder?',
        hi: 'बेंच ग्राइंडर पर काम करते समय कौन-सा पीपीई ज़रूरी है?',
        hinglish: 'Bench grinder par kaam karte waqt kaun-sa PPE zaroori hai?',
      },
      options: [
        { en: 'Loose cotton gloves', hi: 'ढीले सूती दस्ताने' },
        { en: 'Safety goggles or a face shield', hi: 'सेफ़्टी गॉगल्स या फ़ेस शील्ड' },
        { en: 'Rubber apron only', hi: 'केवल रबर एप्रन' },
        { en: 'Dust mask only', hi: 'केवल डस्ट मास्क' },
      ],
      answer: 1,
      explain: {
        en: 'Sparks and abrasive particles fly towards the face: eye protection is mandatory. Loose gloves can be pulled into the wheel.',
        hi: 'चिंगारी और कण चेहरे की ओर उड़ते हैं: आँखों की सुरक्षा अनिवार्य है। ढीले दस्ताने पहिए में फँस सकते हैं।',
        hinglish: 'Sparks aur particles chehre ki taraf udte hain: aankhon ki safety zaroori. Dheele gloves wheel mein phans sakte hain.',
      },
    },
    {
      id: 'm6',
      tag: OEM,
      topic: { en: 'Engineering drawing', hi: 'इंजीनियरिंग ड्रॉइंग', hinglish: 'Engineering drawing' },
      q: {
        en: 'The top view and left side view of an L-bracket are drawn in first-angle projection. Which option is the correct front view?',
        hi: 'एक L-ब्रैकेट का टॉप व्यू और लेफ़्ट साइड व्यू फ़र्स्ट-एंगल प्रोजेक्शन में बना है। सही फ़्रंट व्यू कौन-सा है?',
        hinglish: 'Ek L-bracket ka top view aur left side view first-angle projection mein bana hai. Sahi front view kaun-sa hai?',
      },
      options: [
        { en: 'Option A', hi: 'विकल्प A' },
        { en: 'Option B', hi: 'विकल्प B' },
        { en: 'Option C', hi: 'विकल्प C' },
        { en: 'Option D', hi: 'विकल्प D' },
      ],
      figure: 'l-bracket',
      figureOptions: ['gamma', 'l-left', 'l-right', 'rect'],
      answer: 1,
      autopick: 2,
      explain: {
        en: 'The top view shows the 10 mm upright strip on the LEFT, and the side view’s hidden line marks a 10 mm base. So the front view is an L with the leg on the left (B). C is the view from the rear.',
        hi: 'टॉप व्यू में 10 mm की खड़ी पट्टी बाईं ओर है, और साइड व्यू की छिपी रेखा 10 mm का बेस दिखाती है। इसलिए फ़्रंट व्यू बाईं ओर पैर वाला L है (B)। C पीछे से दिखने वाला व्यू है।',
        hinglish: 'Top view mein 10 mm ki khadi strip LEFT mein hai, aur side view ki hidden line 10 mm base dikhati hai. Isliye front view left leg wala L hai (B). C peeche se dikhne wala view hai.',
      },
    },
  ],
  case: {
    prompt: {
      en: 'A CNC lathe vibrates and surface finish drops. What do you check first?',
      hi: 'CNC लेथ में कंपन है और सरफेस फिनिश खराब हो रही है। सबसे पहले क्या जाँचेंगे?',
      hinglish: 'CNC lathe vibrate kar rahi hai aur surface finish kharab ho rahi hai. Sabse pehle kya check karoge?',
    },
    scripted:
      'Sabse pehle machine band karke safety check, phir tool wear aur tool holder ki tightness, uske baad spindle bearing aur workpiece clamping dekhunga.',
    modelAnswer: {
      en: '1) Stop the spindle, isolate the machine (lockout) and wear PPE. 2) Check tool wear and insert / tool-holder tightness and overhang. 3) Check workpiece clamping, chuck pressure and tailstock support. 4) Check cutting conditions: speed, feed rate, depth of cut and coolant flow. 5) Then spindle bearings, gibs and machine levelling. Finish with a trial cut and measure Ra.',
      hi: '1) स्पिंडल रोकें, मशीन आइसोलेट (लॉकआउट) करें और पीपीई पहनें। 2) टूल वियर, इंसर्ट / टूल-होल्डर की कसावट और ओवरहैंग जाँचें। 3) वर्कपीस क्लैम्पिंग, चक प्रेशर और टेलस्टॉक सपोर्ट देखें। 4) कटिंग कंडीशन जाँचें: स्पीड, फ़ीड रेट, डेप्थ ऑफ़ कट और कूलेंट का बहाव। 5) फिर स्पिंडल बेयरिंग, गिब्स और मशीन लेवलिंग। अंत में ट्रायल कट लेकर Ra मापें।',
      hinglish:
        '1) Spindle roko, machine isolate (lockout) karo aur PPE pehno. 2) Tool wear, insert / tool-holder ki tightness aur overhang check karo. 3) Workpiece clamping, chuck pressure aur tailstock support dekho. 4) Cutting conditions: speed, feed rate, depth of cut aur coolant flow. 5) Phir spindle bearing, gibs aur machine levelling. End mein trial cut lekar Ra measure karo.',
    },
    orderScore: 8,
    safety: {
      id: 'safety',
      label: { en: 'Safety first', hi: 'पहले सुरक्षा', hinglish: 'Safety first' },
      keywords: [
        { label: 'safety', aliases: ['safety', 'सेफ्टी', 'सेफ़्टी', 'सुरक्षा', 'suraksha', 'band karke', 'बंद करके', 'machine band', 'मशीन बंद', 'lockout', 'लॉकआउट', 'ppe', 'पीपीई', 'stop the machine', 'switch off'] },
      ],
    },
    terms: [
      { id: 'tool-wear', label: { en: 'tool wear', hi: 'टूल वियर' }, keywords: [{ label: 'tool wear', aliases: ['tool wear', 'टूल वियर', 'insert', 'इंसर्ट', 'tool ghis', 'घिसाव'] }] },
      { id: 'holder', label: { en: 'tool holder', hi: 'टूल होल्डर' }, keywords: [{ label: 'holder', aliases: ['tool holder', 'holder', 'होल्डर', 'tightness', 'टाइटनेस', 'overhang', 'ओवरहैंग'] }] },
      { id: 'spindle', label: { en: 'spindle bearing', hi: 'स्पिंडल बेयरिंग' }, keywords: [{ label: 'spindle', aliases: ['spindle', 'स्पिंडल', 'bearing', 'bearings', 'बेयरिंग'] }] },
      { id: 'clamping', label: { en: 'workpiece clamping', hi: 'वर्कपीस क्लैम्पिंग' }, keywords: [{ label: 'clamping', aliases: ['clamping', 'clamp', 'क्लैम्पिंग', 'क्लैंपिंग', 'chuck', 'चक', 'tailstock', 'टेलस्टॉक'] }] },
    ],
    expected: [
      { id: 'coolant', label: { en: 'coolant', hi: 'कूलेंट' }, keywords: [{ label: 'coolant', aliases: ['coolant', 'कूलेंट', 'cutting fluid', 'कटिंग फ़्लूइड'] }] },
      { id: 'feed', label: { en: 'feed rate', hi: 'फ़ीड रेट' }, keywords: [{ label: 'feed', aliases: ['feed rate', 'feed', 'फ़ीड', 'फीड', 'cutting speed', 'depth of cut'] }] },
    ],
  },
  signals: [
    { kind: 'strength', text: { en: 'Strong on shop-floor safety', hi: 'शॉप-फ़्लोर सुरक्षा में मज़बूत', hinglish: 'Shop-floor safety mein strong' } },
    { kind: 'gap', text: { en: 'CAD drawing reading', hi: 'CAD ड्रॉइंग पढ़ना', hinglish: 'CAD drawing reading' } },
  ],
  signalChip: 'CNC case: missed coolant / feed rate',
  signalChipCovered: 'CNC case: complete root-cause order',
}

// -----------------------------------------------------------------------------
// Electrical (3 items)
// -----------------------------------------------------------------------------

const POWER = 'Power/EPC-style'

const ELEC: CoreTrack = {
  id: 'elec',
  label: { en: 'Core Electrical', hi: 'कोर इलेक्ट्रिकल', hinglish: 'Core Electrical' },
  short: { en: 'Electrical', hi: 'इलेक्ट्रिकल', hinglish: 'Electrical' },
  tag: POWER,
  branches: 'Diploma EE · B.Tech EE',
  blueprintId: 'core-elec-power-style',
  items: [
    {
      id: 'e1',
      tag: POWER,
      topic: { en: 'Transformers', hi: 'ट्रांसफ़ॉर्मर', hinglish: 'Transformers' },
      q: {
        en: 'Which transformer loss stays nearly constant from no load to full load?',
        hi: 'ट्रांसफ़ॉर्मर की कौन-सी हानि बिना लोड से फ़ुल लोड तक लगभग स्थिर रहती है?',
        hinglish: 'Transformer ka kaun-sa loss no load se full load tak lagbhag constant rehta hai?',
      },
      options: [
        { en: 'Copper (I²R) loss', hi: 'कॉपर (I²R) हानि' },
        { en: 'Core (iron) loss', hi: 'कोर (आयरन) हानि' },
        { en: 'Stray load loss', hi: 'स्ट्रे लोड हानि' },
        { en: 'Load-dependent dielectric loss', hi: 'लोड पर निर्भर डाइइलेक्ट्रिक हानि' },
      ],
      answer: 1,
      explain: {
        en: 'Core loss (hysteresis + eddy current) depends on voltage and frequency, not on load current.',
        hi: 'कोर हानि (हिस्टेरिसिस + एडी करंट) वोल्टेज और फ़्रीक्वेंसी पर निर्भर है, लोड करंट पर नहीं।',
        hinglish: 'Core loss (hysteresis + eddy current) voltage aur frequency par depend karta hai, load current par nahi.',
      },
    },
    {
      id: 'e2',
      tag: POWER,
      topic: { en: 'Motor starters', hi: 'मोटर स्टार्टर', hinglish: 'Motor starters' },
      q: {
        en: 'Why is a star-delta starter used with a 3-phase induction motor?',
        hi: '3-फ़ेज़ इंडक्शन मोटर के साथ स्टार-डेल्टा स्टार्टर क्यों लगाया जाता है?',
        hinglish: '3-phase induction motor ke saath star-delta starter kyun lagate hain?',
      },
      options: [
        { en: 'To increase the starting torque', hi: 'स्टार्टिंग टॉर्क बढ़ाने के लिए' },
        { en: 'To reverse the direction of rotation', hi: 'घूमने की दिशा उलटने के लिए' },
        { en: 'To cut the starting line current to about one-third', hi: 'स्टार्टिंग लाइन करंट को लगभग एक-तिहाई करने के लिए' },
        { en: 'To improve the power factor', hi: 'पावर फ़ैक्टर सुधारने के लिए' },
      ],
      answer: 2,
      explain: {
        en: 'In star, each winding gets 1/√3 of line voltage, so starting line current (and torque) fall to one-third.',
        hi: 'स्टार में हर वाइंडिंग को लाइन वोल्टेज का 1/√3 मिलता है, इसलिए स्टार्टिंग लाइन करंट (और टॉर्क) एक-तिहाई हो जाता है।',
        hinglish: 'Star mein har winding ko line voltage ka 1/√3 milta hai, isliye starting line current (aur torque) ek-tihai.',
      },
    },
    {
      id: 'e3',
      tag: POWER,
      topic: { en: 'Earthing', hi: 'अर्थिंग', hinglish: 'Earthing' },
      q: {
        en: 'What is the main purpose of equipment earthing?',
        hi: 'उपकरण की अर्थिंग का मुख्य उद्देश्य क्या है?',
        hinglish: 'Equipment earthing ka main purpose kya hai?',
      },
      options: [
        { en: 'To save energy', hi: 'ऊर्जा बचाने के लिए' },
        { en: 'To give fault current a low-resistance path and protect people from shock', hi: 'फ़ॉल्ट करंट को कम प्रतिरोध वाला रास्ता देकर लोगों को झटके से बचाना' },
        { en: 'To raise the supply voltage', hi: 'सप्लाई वोल्टेज बढ़ाने के लिए' },
        { en: 'To reduce the electricity bill', hi: 'बिजली का बिल कम करने के लिए' },
      ],
      answer: 1,
      explain: {
        en: 'Earthing keeps exposed metal near earth potential and lets the fault current trip the protection quickly.',
        hi: 'अर्थिंग खुले धातु भागों को पृथ्वी विभव के पास रखती है और फ़ॉल्ट करंट से सुरक्षा उपकरण जल्दी ट्रिप होता है।',
        hinglish: 'Earthing metal body ko earth potential ke paas rakhti hai aur fault current se protection jaldi trip hota hai.',
      },
    },
  ],
  signals: [
    { kind: 'strength', text: { en: 'Clear on motor starting basics', hi: 'मोटर स्टार्टिंग की बुनियादी समझ साफ़', hinglish: 'Motor starting basics clear' } },
  ],
  signalChip: 'Core electrical: starters & earthing',
}

// -----------------------------------------------------------------------------
// Civil (3 items)
// -----------------------------------------------------------------------------

const CIVIL_TAG = 'Construction/EPC-style'

const CIVIL: CoreTrack = {
  id: 'civil',
  label: { en: 'Civil', hi: 'सिविल', hinglish: 'Civil' },
  short: { en: 'Civil', hi: 'सिविल', hinglish: 'Civil' },
  tag: CIVIL_TAG,
  branches: 'Diploma CE · B.Tech CE',
  blueprintId: 'core-civil-style',
  items: [
    {
      id: 'c1',
      tag: CIVIL_TAG,
      topic: { en: 'Concrete', hi: 'कंक्रीट', hinglish: 'Concrete' },
      q: {
        en: 'The slump test measures which property of fresh concrete?',
        hi: 'स्लंप टेस्ट ताज़ा कंक्रीट का कौन-सा गुण मापता है?',
        hinglish: 'Slump test fresh concrete ki kaun-si property measure karta hai?',
      },
      options: [
        { en: 'Compressive strength', hi: 'संपीडन सामर्थ्य' },
        { en: 'Workability', hi: 'कार्यशीलता (वर्केबिलिटी)' },
        { en: 'Setting time', hi: 'सेटिंग टाइम' },
        { en: 'Durability', hi: 'टिकाऊपन' },
      ],
      answer: 1,
      explain: {
        en: 'Slump shows how easily fresh concrete can be placed and compacted: its workability.',
        hi: 'स्लंप बताता है कि ताज़ा कंक्रीट को कितनी आसानी से डाला और दबाया जा सकता है: उसकी कार्यशीलता।',
        hinglish: 'Slump batata hai fresh concrete kitni aasani se place aur compact hota hai: workability.',
      },
    },
    {
      id: 'c2',
      tag: CIVIL_TAG,
      topic: { en: 'Curing', hi: 'क्योरिंग', hinglish: 'Curing' },
      q: {
        en: 'Under IS 456, what is the minimum moist-curing period for concrete made with ordinary Portland cement?',
        hi: 'IS 456 के अनुसार साधारण पोर्टलैंड सीमेंट वाली कंक्रीट की न्यूनतम नम क्योरिंग अवधि कितनी है?',
        hinglish: 'IS 456 ke hisaab se OPC concrete ki minimum moist curing kitne din?',
      },
      options: [
        { en: '1 day', hi: '1 दिन' },
        { en: '3 days', hi: '3 दिन' },
        { en: 'At least 7 days', hi: 'कम से कम 7 दिन' },
        { en: '28 days', hi: '28 दिन' },
      ],
      answer: 2,
      explain: {
        en: 'At least 7 days for OPC (10 days with mineral admixtures or blended cement; longer in hot, dry weather).',
        hi: 'OPC के लिए कम से कम 7 दिन (मिनरल एडमिक्सचर या ब्लेंडेड सीमेंट के साथ 10 दिन; गर्म-सूखे मौसम में और ज़्यादा)।',
        hinglish: 'OPC ke liye kam se kam 7 din (blended cement ke saath 10 din; garmi mein aur zyada).',
      },
    },
    {
      id: 'c3',
      tag: CIVIL_TAG,
      topic: { en: 'Foundations', hi: 'नींव', hinglish: 'Foundations' },
      q: {
        en: 'How is the safe bearing capacity of a soil obtained?',
        hi: 'मिट्टी की सुरक्षित भार-वहन क्षमता कैसे निकाली जाती है?',
        hinglish: 'Soil ki safe bearing capacity kaise nikalte hain?',
      },
      options: [
        { en: 'Ultimate bearing capacity × factor of safety', hi: 'अंतिम भार-वहन क्षमता × सुरक्षा गुणांक' },
        { en: 'Ultimate bearing capacity ÷ factor of safety', hi: 'अंतिम भार-वहन क्षमता ÷ सुरक्षा गुणांक' },
        { en: 'Column load ÷ footing depth', hi: 'कॉलम लोड ÷ फ़ुटिंग की गहराई' },
        { en: 'Allowable settlement ÷ footing width', hi: 'स्वीकार्य धँसाव ÷ फ़ुटिंग की चौड़ाई' },
      ],
      answer: 1,
      explain: {
        en: 'Safe bearing capacity = ultimate (net) bearing capacity ÷ factor of safety, usually 2.5 to 3.',
        hi: 'सुरक्षित भार-वहन क्षमता = अंतिम (नेट) भार-वहन क्षमता ÷ सुरक्षा गुणांक, सामान्यतः 2.5 से 3।',
        hinglish: 'Safe bearing capacity = ultimate (net) bearing capacity ÷ factor of safety, aam taur par 2.5 se 3.',
      },
    },
  ],
  signals: [
    { kind: 'strength', text: { en: 'Solid on concrete basics', hi: 'कंक्रीट की बुनियाद में मज़बूत', hinglish: 'Concrete basics mein solid' } },
  ],
  signalChip: 'Core civil: concrete & foundations',
}

// -----------------------------------------------------------------------------
// Fire & Safety (3 items)
// -----------------------------------------------------------------------------

const SAFETY_TAG = 'Industrial-safety-style'

const FIRE: CoreTrack = {
  id: 'fire',
  label: { en: 'Fire & Safety', hi: 'फ़ायर और सेफ़्टी', hinglish: 'Fire & Safety' },
  short: { en: 'Fire & Safety', hi: 'फ़ायर और सेफ़्टी', hinglish: 'Fire & Safety' },
  tag: SAFETY_TAG,
  branches: 'Diploma Fire & Safety',
  blueprintId: 'core-mech-oem-style',
  items: [
    {
      id: 'f1',
      tag: SAFETY_TAG,
      topic: { en: 'Fire classes', hi: 'आग की श्रेणियाँ', hinglish: 'Fire classes' },
      q: {
        en: 'Under IS 2190, a Class B fire involves:',
        hi: 'IS 2190 के अनुसार क्लास B की आग किससे जुड़ी है?',
        hinglish: 'IS 2190 ke hisaab se Class B fire kisse judi hai?',
      },
      options: [
        { en: 'Ordinary solids: wood, paper, cloth', hi: 'साधारण ठोस: लकड़ी, कागज़, कपड़ा' },
        { en: 'Flammable liquids: petrol, oil, paint', hi: 'ज्वलनशील द्रव: पेट्रोल, तेल, पेंट' },
        { en: 'Flammable gases: LPG', hi: 'ज्वलनशील गैसें: एलपीजी' },
        { en: 'Burning metals: magnesium', hi: 'जलती धातुएँ: मैग्नीशियम' },
      ],
      answer: 1,
      explain: {
        en: 'A: solids · B: flammable liquids · C: gases · D: metals.',
        hi: 'A: ठोस · B: ज्वलनशील द्रव · C: गैसें · D: धातुएँ।',
        hinglish: 'A: solids · B: flammable liquids · C: gases · D: metals.',
      },
    },
    {
      id: 'f2',
      tag: SAFETY_TAG,
      topic: { en: 'Extinguishers', hi: 'अग्निशामक', hinglish: 'Extinguishers' },
      q: {
        en: 'Which extinguisher suits a fire in live electrical equipment?',
        hi: 'चालू बिजली उपकरण में लगी आग के लिए कौन-सा अग्निशामक सही है?',
        hinglish: 'Live electrical equipment ki aag ke liye kaun-sa extinguisher sahi hai?',
      },
      options: [
        { en: 'Water type', hi: 'वॉटर टाइप' },
        { en: 'Mechanical foam', hi: 'मैकेनिकल फ़ोम' },
        { en: 'CO₂', hi: 'CO₂' },
        { en: 'Soda-acid', hi: 'सोडा-एसिड' },
      ],
      answer: 2,
      explain: {
        en: 'CO₂ (or dry chemical powder) does not conduct electricity and leaves no residue. Water and foam conduct.',
        hi: 'CO₂ (या ड्राई केमिकल पाउडर) बिजली का संचालन नहीं करता और कोई अवशेष नहीं छोड़ता। पानी और फ़ोम बिजली चलाते हैं।',
        hinglish: 'CO₂ (ya DCP) bijli conduct nahi karta aur residue nahi chhodta. Paani aur foam conduct karte hain.',
      },
    },
    {
      id: 'f3',
      tag: SAFETY_TAG,
      topic: { en: 'Extinguisher use', hi: 'अग्निशामक का उपयोग', hinglish: 'Extinguisher use' },
      q: {
        en: 'In the PASS technique, what does “A” stand for?',
        hi: 'PASS तकनीक में “A” का क्या अर्थ है?',
        hinglish: 'PASS technique mein “A” ka matlab kya hai?',
      },
      options: [
        { en: 'Activate the alarm', hi: 'अलार्म चालू करें' },
        { en: 'Approach the fire quickly', hi: 'आग के पास जल्दी जाएँ' },
        { en: 'Alert the supervisor', hi: 'सुपरवाइज़र को बताएँ' },
        { en: 'Aim at the base of the fire', hi: 'आग के आधार पर निशाना लगाएँ' },
      ],
      answer: 3,
      explain: {
        en: 'Pull the pin, Aim at the base, Squeeze the handle, Sweep side to side.',
        hi: 'पिन खींचें, आधार पर निशाना लगाएँ, हैंडल दबाएँ, दाएँ-बाएँ घुमाएँ।',
        hinglish: 'Pin kheencho, base par aim karo, handle dabao, side-to-side sweep karo.',
      },
    },
  ],
  signals: [
    { kind: 'strength', text: { en: 'Knows fire classes and PASS', hi: 'आग की श्रेणियाँ और PASS की जानकारी', hinglish: 'Fire classes aur PASS clear' } },
  ],
  signalChip: 'Fire & safety: classes & PASS',
}

export const CORE_ITEMS: Record<CoreTrackId, CoreTrack> = { mech: MECH, elec: ELEC, civil: CIVIL, fire: FIRE }

export const CORE_TRACK_IDS: CoreTrackId[] = ['mech', 'elec', 'civil', 'fire']
