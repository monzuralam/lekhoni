// Bangladesh divisions and districts. District codes are WooCommerce's state
// codes for country BD (ISO 3166-2:BD), so they can be sent as billing.state.

export type District = { code: string; name: string }
export type Division = { name: string; districts: District[] }

export const DIVISIONS: Division[] = [
  {
    name: 'ঢাকা',
    districts: [
      { code: 'BD-13', name: 'ঢাকা' },
      { code: 'BD-15', name: 'ফরিদপুর' },
      { code: 'BD-18', name: 'গাজীপুর' },
      { code: 'BD-17', name: 'গোপালগঞ্জ' },
      { code: 'BD-26', name: 'কিশোরগঞ্জ' },
      { code: 'BD-36', name: 'মাদারীপুর' },
      { code: 'BD-33', name: 'মানিকগঞ্জ' },
      { code: 'BD-35', name: 'মুন্সিগঞ্জ' },
      { code: 'BD-40', name: 'নারায়ণগঞ্জ' },
      { code: 'BD-42', name: 'নরসিংদী' },
      { code: 'BD-53', name: 'রাজবাড়ী' },
      { code: 'BD-62', name: 'শরীয়তপুর' },
      { code: 'BD-63', name: 'টাঙ্গাইল' }
    ]
  },
  {
    name: 'চট্টগ্রাম',
    districts: [
      { code: 'BD-10', name: 'চট্টগ্রাম' },
      { code: 'BD-01', name: 'বান্দরবান' },
      { code: 'BD-04', name: 'ব্রাহ্মণবাড়িয়া' },
      { code: 'BD-09', name: 'চাঁদপুর' },
      { code: 'BD-08', name: 'কুমিল্লা' },
      { code: 'BD-11', name: 'কক্সবাজার' },
      { code: 'BD-16', name: 'ফেনী' },
      { code: 'BD-29', name: 'খাগড়াছড়ি' },
      { code: 'BD-31', name: 'লক্ষ্মীপুর' },
      { code: 'BD-47', name: 'নোয়াখালী' },
      { code: 'BD-56', name: 'রাঙ্গামাটি' }
    ]
  },
  {
    name: 'রাজশাহী',
    districts: [
      { code: 'BD-54', name: 'রাজশাহী' },
      { code: 'BD-03', name: 'বগুড়া' },
      { code: 'BD-24', name: 'জয়পুরহাট' },
      { code: 'BD-48', name: 'নওগাঁ' },
      { code: 'BD-44', name: 'নাটোর' },
      { code: 'BD-45', name: 'চাঁপাইনবাবগঞ্জ' },
      { code: 'BD-49', name: 'পাবনা' },
      { code: 'BD-59', name: 'সিরাজগঞ্জ' }
    ]
  },
  {
    name: 'খুলনা',
    districts: [
      { code: 'BD-27', name: 'খুলনা' },
      { code: 'BD-05', name: 'বাগেরহাট' },
      { code: 'BD-12', name: 'চুয়াডাঙ্গা' },
      { code: 'BD-22', name: 'যশোর' },
      { code: 'BD-23', name: 'ঝিনাইদহ' },
      { code: 'BD-30', name: 'কুষ্টিয়া' },
      { code: 'BD-37', name: 'মাগুরা' },
      { code: 'BD-39', name: 'মেহেরপুর' },
      { code: 'BD-43', name: 'নড়াইল' },
      { code: 'BD-58', name: 'সাতক্ষীরা' }
    ]
  },
  {
    name: 'বরিশাল',
    districts: [
      { code: 'BD-06', name: 'বরিশাল' },
      { code: 'BD-02', name: 'বরগুনা' },
      { code: 'BD-07', name: 'ভোলা' },
      { code: 'BD-25', name: 'ঝালকাঠি' },
      { code: 'BD-51', name: 'পটুয়াখালী' },
      { code: 'BD-50', name: 'পিরোজপুর' }
    ]
  },
  {
    name: 'সিলেট',
    districts: [
      { code: 'BD-60', name: 'সিলেট' },
      { code: 'BD-20', name: 'হবিগঞ্জ' },
      { code: 'BD-38', name: 'মৌলভীবাজার' },
      { code: 'BD-61', name: 'সুনামগঞ্জ' }
    ]
  },
  {
    name: 'রংপুর',
    districts: [
      { code: 'BD-55', name: 'রংপুর' },
      { code: 'BD-14', name: 'দিনাজপুর' },
      { code: 'BD-19', name: 'গাইবান্ধা' },
      { code: 'BD-28', name: 'কুড়িগ্রাম' },
      { code: 'BD-32', name: 'লালমনিরহাট' },
      { code: 'BD-46', name: 'নীলফামারী' },
      { code: 'BD-52', name: 'পঞ্চগড়' },
      { code: 'BD-64', name: 'ঠাকুরগাঁও' }
    ]
  },
  {
    name: 'ময়মনসিংহ',
    districts: [
      { code: 'BD-34', name: 'ময়মনসিংহ' },
      { code: 'BD-21', name: 'জামালপুর' },
      { code: 'BD-41', name: 'নেত্রকোণা' },
      { code: 'BD-57', name: 'শেরপুর' }
    ]
  }
]

export function findDistrict (division: string, code: string) {
  return DIVISIONS.find(d => d.name === division)?.districts.find(d => d.code === code) ?? null
}
