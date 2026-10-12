'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import {
  FormError,
  PasswordField,
  PasswordStrength,
  SubmitButton,
  TextField,
  focusFirstError,
  postJson,
  useFinishSignIn
} from './fields'
import { MESSAGES, isEmail, isMobile, passwordError } from './validation'

type Values = {
  'reg-name': string
  'reg-email': string
  'reg-phone': string
  'reg-password': string
  'reg-password2': string
}
type Errors = Partial<Record<keyof Values | 'terms', string>>

const ORDER: (keyof Values | 'terms')[] = [
  'reg-name',
  'reg-email',
  'reg-phone',
  'reg-password',
  'reg-password2',
  'terms'
]
const NAME_MIN = 3

function validate (values: Values, terms: boolean): Errors {
  const name = values['reg-name'].trim()
  const email = values['reg-email'].trim()
  const phone = values['reg-phone'].trim()
  const errors: Errors = {}
  if (!name) errors['reg-name'] = MESSAGES.required
  else if (name.length < NAME_MIN) errors['reg-name'] = MESSAGES.minLength(NAME_MIN)
  if (!email) errors['reg-email'] = MESSAGES.required
  else if (!isEmail(email)) errors['reg-email'] = MESSAGES.email
  if (!phone) errors['reg-phone'] = MESSAGES.required
  else if (!isMobile(phone)) errors['reg-phone'] = MESSAGES.mobile
  const password = passwordError(values['reg-password'])
  if (password) errors['reg-password'] = password
  if (!values['reg-password2']) errors['reg-password2'] = MESSAGES.required
  else if (values['reg-password2'] !== values['reg-password']) errors['reg-password2'] = MESSAGES.match
  if (!terms) errors.terms = MESSAGES.checkbox
  return errors
}

// "Full name" -> WooCommerce first/last name (first word / the rest)
function splitName (name: string) {
  const [firstName, ...rest] = name.trim().split(/\s+/)
  return { firstName, lastName: rest.join(' ') }
}

// RegisterForm: POST /api/auth/register (registerCustomer, then login)
export default function RegisterForm () {
  const [values, setValues] = useState<Values>({
    'reg-name': '',
    'reg-email': '',
    'reg-phone': '',
    'reg-password': '',
    'reg-password2': ''
  })
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState('')
  const [pending, setPending] = useState(false)
  const finish = useFinishSignIn()

  function field (id: keyof Values) {
    return {
      id,
      value: values[id],
      error: errors[id],
      onValue: (value: string) => {
        setValues(current => ({ ...current, [id]: value }))
        // Like the design: an invalid field clears its error once edited
        if (errors[id]) setErrors(current => ({ ...current, [id]: undefined }))
      }
    }
  }

  async function submit (event: FormEvent) {
    event.preventDefault()
    if (pending) return
    const found = validate(values, terms)
    setErrors(found)
    setFormError('')
    if (Object.keys(found).length) {
      focusFirstError(ORDER, found)
      return
    }

    setPending(true)
    const result = await postJson('/api/auth/register', {
      ...splitName(values['reg-name']),
      email: values['reg-email'].trim(),
      phone: values['reg-phone'].trim(),
      password: values['reg-password']
    })
    if ('error' in result) {
      setFormError(result.error)
      setPending(false)
      return
    }
    await finish()
  }

  return (
    <>
      <form noValidate onSubmit={submit} className='mt-6 space-y-5'>
        <TextField {...field('reg-name')} label='পুরো নাম' type='text' required autoComplete='name' />
        <TextField
          {...field('reg-email')}
          label='ইমেইল'
          type='email'
          required
          autoComplete='email'
          autoCapitalize='none'
          spellCheck={false}
        />
        <TextField
          {...field('reg-phone')}
          label='মোবাইল নম্বর'
          type='tel'
          required
          autoComplete='tel'
          placeholder='01XXXXXXXXX'
          inputMode='tel'
        />
        <PasswordField {...field('reg-password')} label='পাসওয়ার্ড' required autoComplete='new-password' />
        <PasswordStrength value={values['reg-password']} />
        <PasswordField
          {...field('reg-password2')}
          label='পাসওয়ার্ড আবার লিখুন'
          required
          autoComplete='new-password'
        />
        <div>
          <label className='flex cursor-pointer items-start gap-2.5 text-sm leading-relaxed text-ink-2'>
            <input
              id='terms'
              type='checkbox'
              name='terms'
              required
              checked={terms}
              onChange={event => {
                setTerms(event.target.checked)
                if (errors.terms) setErrors(current => ({ ...current, terms: undefined }))
              }}
              aria-invalid={errors.terms ? true : undefined}
              aria-describedby={errors.terms ? 'terms-error' : undefined}
              className='mt-1 size-4 shrink-0 rounded accent-accent'
            />
            <span>
              আমি{' '}
              <a href='#' className='font-semibold text-link hover:underline'>
                শর্তাবলি
              </a>{' '}
              ও{' '}
              <a href='#' className='font-semibold text-link hover:underline'>
                গোপনীয়তা নীতি
              </a>{' '}
              পড়েছি এবং মেনে নিচ্ছি।
            </span>
          </label>
          {errors.terms && (
            <p id='terms-error' className='mt-1.5 text-sm font-medium text-danger'>
              {errors.terms}
            </p>
          )}
        </div>
        <FormError message={formError} />
        <SubmitButton pending={pending}>{pending ? 'অ্যাকাউন্ট খোলা হচ্ছে…' : 'অ্যাকাউন্ট খুলুন'}</SubmitButton>
      </form>
      <p className='mt-6 text-center text-[0.95rem] text-ink-2'>
        আগে থেকেই অ্যাকাউন্ট আছে?{' '}
        <Link href='/login' className='font-semibold text-link hover:underline'>
          লগইন করুন
        </Link>
      </p>
    </>
  )
}
