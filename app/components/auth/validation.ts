import { bn } from '@/lib/bn'

// Form rules shared by the auth forms and /api/auth/*.
// Field messages match design/assets/js/main.js (section 14, Form validation).

export const PASSWORD_MIN = 8

export const MESSAGES = {
  required: 'এই ঘরটি পূরণ করা আবশ্যক।',
  checkbox: 'এগিয়ে যেতে এটিতে টিক দিন।',
  email: 'সঠিক ইমেইল ঠিকানা লিখুন।',
  mobile: 'সঠিক মোবাইল নম্বর লিখুন (যেমন ০১৭১২৩৪৫৬৭৮)।',
  match: 'পাসওয়ার্ড দুটি মিলছে না।',
  minLength: (min: number) => `কমপক্ষে ${bn(min)}টি অক্ষর লিখুন।`
}

// Server responses (WordPress errors mapped to Bangla)
export const AUTH_MESSAGES = {
  loginEmpty: 'ইমেইল (বা ইউজারনেম) ও পাসওয়ার্ড দুটোই লিখুন।',
  unknownUser: 'এই ইমেইল বা ইউজারনেমে কোনো অ্যাকাউন্ট পাওয়া যায়নি।',
  wrongPassword: 'পাসওয়ার্ড সঠিক নয়। আবার চেষ্টা করুন অথবা পাসওয়ার্ড রিসেট করুন।',
  loginFailed: 'লগইন করা যায়নি, আবার চেষ্টা করুন।',
  emailTaken: 'এই ইমেইলে আগেই একটি অ্যাকাউন্ট খোলা আছে। লগইন করুন অথবা অন্য ইমেইল ব্যবহার করুন।',
  registerFailed: 'অ্যাকাউন্ট খোলা যায়নি, আবার চেষ্টা করুন।',
  registeredNoLogin: 'অ্যাকাউন্ট তৈরি হয়েছে, কিন্তু স্বয়ংক্রিয় লগইন হয়নি। অনুগ্রহ করে লগইন করুন।',
  resetInvalid: 'রিসেট লিংকটি অকার্যকর বা মেয়াদোত্তীর্ণ। নতুন লিংক নিন।',
  resetFailed: 'পাসওয়ার্ড বদলানো যায়নি, আবার চেষ্টা করুন।',
  invalidInput: 'তথ্যগুলো সঠিকভাবে পূরণ করুন।',
  serverDown: 'সার্ভারে সংযোগ করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।',
  network: 'সংযোগে সমস্যা হয়েছে। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।'
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MOBILE_PATTERN = /^01[3-9]\d{8}$/

export function isEmail (value: string) {
  return EMAIL_PATTERN.test(value.trim())
}

// Bangla digits -> Latin, drop spaces/dashes and a +88 prefix
export function normalizePhone (value: string) {
  return value
    .replace(/[০-৯]/g, d => String('০১২৩৪৫৬৭৮৯'.indexOf(d)))
    .replace(/[\s-]/g, '')
    .replace(/^\+?88(?=01)/, '')
}

export function isMobile (value: string) {
  return MOBILE_PATTERN.test(normalizePhone(value))
}

export function passwordError (value: string) {
  if (!value) return MESSAGES.required
  return value.length < PASSWORD_MIN ? MESSAGES.minLength(PASSWORD_MIN) : ''
}

// 0 = empty, 1 = weak, 2 = medium, 3 = strong (same scoring as the design)
export function passwordStrength (value: string) {
  if (!value) return 0
  let score = 0
  if (value.length >= 8) score++
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++
  if (/\d|[০-৯]/.test(value)) score++
  if (/[^A-Za-z0-9০-৯]/.test(value)) score++
  if (value.length >= 12) score++
  return score <= 2 ? 1 : score <= 3 ? 2 : 3
}

// Only same-site relative paths ("/my-account"), never "//evil.com" or "/\evil.com"
export function safeNext (value: string | null | undefined, fallback = '/my-account') {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return fallback
  }
  return value
}
