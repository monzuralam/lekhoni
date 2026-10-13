import { bn } from '@/lib/bn'
import { normalizePhone } from '../checkout/validation'
import { passwordError } from '../auth/validation'

// Account details form rules, shared by <DetailsForm /> and
// /api/account/details. Messages match design/assets/js/main.js (section 14).

export type DetailsFields = {
  name: string
  displayName: string
  phone: string
  email: string
  current: string
  password: string
  confirm: string
}

export type DetailsErrors = Partial<Record<keyof DetailsFields, string>>

export const DETAILS_FIELD_ORDER: (keyof DetailsFields)[] = [
  'name',
  'displayName',
  'phone',
  'email',
  'current',
  'password',
  'confirm'
]

const MESSAGES = {
  required: 'এই ঘরটি পূরণ করা আবশ্যক।',
  email: 'সঠিক ইমেইল ঠিকানা লিখুন।',
  mobile: 'সঠিক মোবাইল নম্বর লিখুন (যেমন ০১৭১২৩৪৫৬৭৮)।',
  match: 'পাসওয়ার্ড দুটি মিলছে না।'
}
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MOBILE_PATTERN = /^01[3-9]\d{8}$/
export const NAME_MIN = 3
export const PASSWORD_MIN = 8 // design: minlength="8" on the new password

const minLength = (min: number) => `কমপক্ষে ${bn(min)}টি অক্ষর লিখুন।`

// The password section is optional: it only counts when something is typed
export const wantsPasswordChange = (values: DetailsFields) =>
  Boolean(values.current || values.password || values.confirm)

export function validateDetailsField (name: keyof DetailsFields, values: DetailsFields) {
  const value = values[name].trim()
  switch (name) {
    case 'name':
      if (!value) return MESSAGES.required
      return value.length < NAME_MIN ? minLength(NAME_MIN) : ''
    case 'phone':
      if (!value) return MESSAGES.required
      return MOBILE_PATTERN.test(normalizePhone(value)) ? '' : MESSAGES.mobile
    case 'email':
      if (!value) return MESSAGES.required
      return EMAIL_PATTERN.test(value) ? '' : MESSAGES.email
    case 'current':
      return wantsPasswordChange(values) && !values.current ? MESSAGES.required : ''
    case 'password':
      if (!wantsPasswordChange(values)) return ''
      // Same rules as registration: 8+ characters and not "weak"
      return passwordError(values.password)
    case 'confirm':
      if (!wantsPasswordChange(values)) return ''
      if (!values.confirm) return MESSAGES.required
      return values.confirm !== values.password ? MESSAGES.match : ''
    default:
      return ''
  }
}

export function validateDetails (values: DetailsFields) {
  const errors: DetailsErrors = {}
  for (const name of DETAILS_FIELD_ORDER) {
    const message = validateDetailsField(name, values)
    if (message) errors[name] = message
  }
  return errors
}

export function readDetailsFields (source: unknown): DetailsFields {
  const data = (source && typeof source === 'object' ? source : {}) as Record<string, unknown>
  const text = (key: string) => (typeof data[key] === 'string' ? (data[key] as string) : '')
  return {
    name: text('name'),
    displayName: text('displayName'),
    phone: text('phone'),
    email: text('email'),
    current: text('current'),
    password: text('password'),
    confirm: text('confirm')
  }
}

