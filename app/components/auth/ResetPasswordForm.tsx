'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import {
  FormError,
  PasswordField,
  PasswordStrength,
  SubmitButton,
  SuccessPanel,
  focusFirstError,
  postJson
} from './fields'
import { MESSAGES, PASSWORD_MIN, isWeakPassword, passwordError } from './validation'
import { bn } from '@/lib/bn'

type Errors = { 'new-password'?: string; 'new-password2'?: string }

// ResetPasswordForm: POST /api/auth/reset (resetUserPassword). `resetKey` and
// `login` come from the emailed link.
export default function ResetPasswordForm ({ resetKey, login }: { resetKey: string; login: string }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState('')
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)

  async function submit (event: FormEvent) {
    event.preventDefault()
    if (pending) return
    const found: Errors = {
      'new-password': passwordError(password) || undefined,
      'new-password2': !confirm ? MESSAGES.required : confirm !== password ? MESSAGES.match : undefined
    }
    setErrors(found)
    setFormError('')
    if (found['new-password'] || found['new-password2']) {
      focusFirstError(['new-password', 'new-password2'], found)
      return
    }

    setPending(true)
    const result = await postJson('/api/auth/reset', { key: resetKey, login, password })
    setPending(false)
    if ('error' in result) setFormError(result.error)
    else setDone(true)
  }

  if (done) {
    return (
      <SuccessPanel title='পাসওয়ার্ড বদলানো হয়েছে'>
        <p className='mt-1 text-sm leading-relaxed text-ink-2'>এবার নতুন পাসওয়ার্ড দিয়ে লগইন করুন।</p>
        <Link
          href='/login'
          className='mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-semibold text-accent-ink transition hover:brightness-110 active:scale-95'
        >
          লগইন করুন
          <svg className='icon size-4' aria-hidden='true'>
            <use href='#i-arrow-right' />
          </svg>
        </Link>
      </SuccessPanel>
    )
  }

  return (
    <form noValidate onSubmit={submit} className='mt-6 space-y-5'>
      <PasswordField
        id='new-password'
        label='নতুন পাসওয়ার্ড'
        required
        autoComplete='new-password'
        value={password}
        error={errors['new-password']}
        hint={`কমপক্ষে ${bn(PASSWORD_MIN)} অক্ষর, আর দুর্বল হলে চলবে না। বড় ও ছোট হাতের অক্ষর, সংখ্যা আর চিহ্ন মেশালে পাসওয়ার্ড শক্তিশালী হয়।`}
        onValue={value => {
          setPassword(value)
          if (errors['new-password']) setErrors(e => ({ ...e, 'new-password': undefined }))
        }}
      />
      <PasswordStrength id='new-password-strength' value={password} />
      <PasswordField
        id='new-password2'
        label='নতুন পাসওয়ার্ড আবার লিখুন'
        required
        autoComplete='new-password'
        value={confirm}
        error={errors['new-password2']}
        onValue={value => {
          setConfirm(value)
          if (errors['new-password2']) setErrors(e => ({ ...e, 'new-password2': undefined }))
        }}
      />
      <FormError message={formError} />
      <SubmitButton pending={pending} disabled={isWeakPassword(password)} describedBy='new-password-strength'>
        {pending ? 'সংরক্ষণ হচ্ছে…' : 'পাসওয়ার্ড সংরক্ষণ করুন'}
      </SubmitButton>
    </form>
  )
}
