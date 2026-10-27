// Bihar's 38 districts on a schematic tile grid (not a geographic map), with divisions.
import type { DistrictGeo } from '@/lib/mock/types'

export interface Division {
  /** lowercase slug, e.g. 'purnia' */
  id: string
  /** English name, e.g. 'Purnia'. DistrictGeo.division holds this value. */
  name: string
  nameHi: string
  districts: string[]
}

export const DIVISIONS: Division[] = [
  { id: 'patna', name: 'Patna', nameHi: 'पटना', districts: ['patna', 'nalanda', 'bhojpur', 'buxar', 'rohtas', 'kaimur'] },
  { id: 'magadh', name: 'Magadh', nameHi: 'मगध', districts: ['gaya', 'nawada', 'aurangabad', 'jehanabad', 'arwal'] },
  { id: 'saran', name: 'Saran', nameHi: 'सारण', districts: ['saran', 'siwan', 'gopalganj'] },
  {
    id: 'tirhut',
    name: 'Tirhut',
    nameHi: 'तिरहुत',
    districts: ['muzaffarpur', 'vaishali', 'sitamarhi', 'sheohar', 'east-champaran', 'west-champaran'],
  },
  { id: 'darbhanga', name: 'Darbhanga', nameHi: 'दरभंगा', districts: ['darbhanga', 'madhubani', 'samastipur'] },
  { id: 'kosi', name: 'Kosi', nameHi: 'कोसी', districts: ['saharsa', 'supaul', 'madhepura'] },
  { id: 'purnia', name: 'Purnia', nameHi: 'पूर्णिया', districts: ['purnia', 'araria', 'kishanganj', 'katihar'] },
  { id: 'bhagalpur', name: 'Bhagalpur', nameHi: 'भागलपुर', districts: ['bhagalpur', 'banka'] },
  {
    id: 'munger',
    name: 'Munger',
    nameHi: 'मुंगेर',
    districts: ['munger', 'jamui', 'khagaria', 'lakhisarai', 'sheikhpura', 'begusarai'],
  },
]

// Aspirational districts (verify against the current NITI Aayog list).
const ASPIRATIONAL = new Set([
  'araria',
  'aurangabad',
  'banka',
  'begusarai',
  'gaya',
  'jamui',
  'katihar',
  'khagaria',
  'muzaffarpur',
  'nawada',
  'purnia',
  'sheikhpura',
  'sitamarhi',
])

// [id, name, nameHi, row, col] in grid order.
const GRID: [string, string, string, number, number][] = [
  ['west-champaran', 'West Champaran', 'पश्चिम चंपारण', 0, 0],
  ['east-champaran', 'East Champaran', 'पूर्वी चंपारण', 0, 1],
  ['sheohar', 'Sheohar', 'शिवहर', 0, 2],
  ['sitamarhi', 'Sitamarhi', 'सीतामढ़ी', 0, 3],
  ['madhubani', 'Madhubani', 'मधुबनी', 0, 4],
  ['supaul', 'Supaul', 'सुपौल', 0, 5],
  ['araria', 'Araria', 'अररिया', 0, 6],
  ['kishanganj', 'Kishanganj', 'किशनगंज', 0, 7],
  ['siwan', 'Siwan', 'सिवान', 1, 0],
  ['gopalganj', 'Gopalganj', 'गोपालगंज', 1, 1],
  ['muzaffarpur', 'Muzaffarpur', 'मुजफ्फरपुर', 1, 2],
  ['darbhanga', 'Darbhanga', 'दरभंगा', 1, 3],
  ['saharsa', 'Saharsa', 'सहरसा', 1, 4],
  ['madhepura', 'Madhepura', 'मधेपुरा', 1, 5],
  ['purnia', 'Purnia', 'पूर्णिया', 1, 6],
  ['katihar', 'Katihar', 'कटिहार', 1, 7],
  ['saran', 'Saran', 'सारण', 2, 1],
  ['vaishali', 'Vaishali', 'वैशाली', 2, 2],
  ['samastipur', 'Samastipur', 'समस्तीपुर', 2, 3],
  ['begusarai', 'Begusarai', 'बेगूसराय', 2, 4],
  ['khagaria', 'Khagaria', 'खगड़िया', 2, 5],
  ['buxar', 'Buxar', 'बक्सर', 3, 0],
  ['bhojpur', 'Bhojpur', 'भोजपुर', 3, 1],
  ['patna', 'Patna', 'पटना', 3, 2],
  ['nalanda', 'Nalanda', 'नालंदा', 3, 3],
  ['lakhisarai', 'Lakhisarai', 'लखीसराय', 3, 4],
  ['munger', 'Munger', 'मुंगेर', 3, 5],
  ['bhagalpur', 'Bhagalpur', 'भागलपुर', 3, 6],
  ['kaimur', 'Kaimur', 'कैमूर', 4, 0],
  ['rohtas', 'Rohtas', 'रोहतास', 4, 1],
  ['arwal', 'Arwal', 'अरवल', 4, 2],
  ['jehanabad', 'Jehanabad', 'जहानाबाद', 4, 3],
  ['sheikhpura', 'Sheikhpura', 'शेखपुरा', 4, 4],
  ['jamui', 'Jamui', 'जमुई', 4, 5],
  ['banka', 'Banka', 'बांका', 4, 6],
  ['aurangabad', 'Aurangabad', 'औरंगाबाद', 5, 1],
  ['gaya', 'Gaya', 'गया', 5, 2],
  ['nawada', 'Nawada', 'नवादा', 5, 3],
]

function divisionOf(id: string): Division {
  return DIVISIONS.find((d) => d.districts.includes(id)) ?? DIVISIONS[0]
}

export const DISTRICT_GEO: DistrictGeo[] = GRID.map(([id, name, nameHi, row, col]) => {
  const div = divisionOf(id)
  return {
    id,
    name,
    nameHi,
    division: div.name,
    divisionHi: div.nameHi,
    row,
    col,
    northOfGanga: row <= 2,
    aspirational: ASPIRATIONAL.has(id),
  }
})

/** Division record for a district id (falls back to the first division). */
export function divisionForDistrict(id: string): Division {
  return divisionOf(id)
}
