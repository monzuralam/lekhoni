import { bn } from '@/lib/bn'
import { findDistrict } from './locations'

// Checkout form rules, shared by the client form and /api/checkout.
// Messages match design/assets/js/main.js (section 14, Form validation).

export type CheckoutFields = {
  name: string
  phone: string
  email: string
  division: string
  district: string // WooCommerce state code, e.g. BD-13
  thana: string
  address: string
  note: string
  paymentMethod: string
}

export type FieldErrors = Partial<Record<keyof CheckoutFields, string>>

export const FIELD_ORDER: (keyof CheckoutFields)[] = [
  'name',
  'phone',
  'email',
  'division',
  'district',
  'thana',
  'address',
  'note',
  'paymentMethod'
]

const MESSAGES = {
  required: 'এই ঘরটি পূরণ করা আবশ্যক।',
  choice: 'একটি অপশন বেছে নিন।',
  email: 'সঠিক ইমেইল ঠিকানা লিখুন।',
  mobile: 'সঠিক মোবাইল নম্বর লিখুন (যেমন ০১৭১২৩৪৫৬৭৮)।'
}
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MOBILE_PATTERN = /^01[3-9]\d{8}$/
const ADDRESS_MIN = 10

// Bangla digits -> Latin, then drop spaces and dashes
export function normalizePhone (value: string) {
  return value
    .replace(/[০-৯]/g, d => String('০১২৩৪৫৬৭৮৯'.indexOf(d)))
    .replace(/[\s-]/g, '')
    .replace(/^\+?88(?=01)/, '')
}

export function validateField (name: keyof CheckoutFields, values: CheckoutFields) {
  const value = values[name].trim()
  switch (name) {
    case 'name':
    case 'thana':
      return value ? '' : MESSAGES.required
    case 'phone':
      if (!value) return MESSAGES.required
      return MOBILE_PATTERN.test(normalizePhone(value)) ? '' : MESSAGES.mobile
    case 'email':
      return !value || EMAIL_PATTERN.test(value) ? '' : MESSAGES.email
    case 'division':
    case 'paymentMethod':
      return value ? '' : MESSAGES.choice
    case 'district':
      return value && findDistrict(values.division, value) ? '' : MESSAGES.choice
    case 'address':
      if (!value) return MESSAGES.required
      return value.length < ADDRESS_MIN ? `কমপক্ষে ${bn(ADDRESS_MIN)}টি অক্ষর লিখুন।` : ''
    default:
      return ''
  }
}

export function validateCheckout (values: CheckoutFields) {
  const errors: FieldErrors = {}
  for (const name of FIELD_ORDER) {
    const message = validateField(name, values)
    if (message) errors[name] = message
  }
  return errors
}

export function readFields (source: Record<string, unknown>): CheckoutFields {
  const text = (key: string) => (typeof source[key] === 'string' ? (source[key] as string) : '')
  return {
    name: text('name'),
    phone: text('phone'),
    email: text('email'),
    division: text('division'),
    district: text('district'),
    thana: text('thana'),
    address: text('address'),
    note: text('note'),
    paymentMethod: text('paymentMethod')
  }
}
