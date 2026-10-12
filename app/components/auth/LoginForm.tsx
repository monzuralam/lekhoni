'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import {
  FormError,
  PasswordField,
  SubmitButton,
  TextField,
  focusFirstError,
  postJson,
  useFinishSignIn
} from './fields'
import { MESSAGES } from './validation'

type Errors = { 'login-id'?: string; 'login-password'?: string }

// LoginForm: POST /api/auth/login (WPGraphQL JWT `login`), tokens are stored in
// httpOnly cookies by the route. Redirects to ?next= or /account.
export default function LoginForm () {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  // Unchecked (as in the design): the refresh cookie ends with the browser session
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState('')
  const [pending, setPending] = useState(false)
  const finish = useFinishSignIn()

  async function submit (event: FormEvent) {
    event.preventDefault()
    if (pending) return
    const found: Errors = {
      'login-id': username.trim() ? undefined : MESSAGES.required,
      'login-password': password ? undefined : MESSAGES.required
    }
    setErrors(found)
    setFormError('')
    if (found['login-id'] || found['login-password']) {
      focusFirstError(['login-id', 'login-password'], found)
      return
    }

    setPending(true)
    const result = await postJson('/api/auth/login', { username: username.trim(), password, remember })
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
        <TextField
          id='login-id'
          label='ইমেইল অথবা ইউজারনেম'
          type='text'
          required
          autoComplete='username'
          autoCapitalize='none'
          spellCheck={false}
          value={username}
          error={errors['login-id']}
          onValue={value => {
            setUsername(value)
            if (errors['login-id']) setErrors(e => ({ ...e, 'login-id': undefined }))
          }}
        />
        <PasswordField
          id='login-password'
          label='পাসওয়ার্ড'
          required
          autoComplete='current-password'
          value={password}
          error={errors['login-password']}
          onValue={value => {
            setPassword(value)
            if (errors['login-password']) setErrors(e => ({ ...e, 'login-password': undefined }))
          }}
        />
        <div className='flex items-center justify-between gap-3 text-sm'>
          <label className='flex cursor-pointer items-center gap-2 text-ink-2'>
            <input
              type='checkbox'
              name='remember'
              checked={remember}
              onChange={event => setRemember(event.target.checked)}
              className='size-4 rounded accent-accent'
            />
            আমাকে মনে রাখুন
          </label>
          <Link href='/forgot-password' className='font-semibold text-link hover:underline'>
            পাসওয়ার্ড ভুলে গেছেন?
          </Link>
        </div>
        <FormError message={formError} />
        <SubmitButton pending={pending}>{pending ? 'লগইন হচ্ছে…' : 'লগইন করুন'}</SubmitButton>
      </form>
      <p className='my-6 flex items-center gap-4 text-sm text-muted before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line'>
        অথবা
      </p>
      {/* SocialLogin: UI only in the design. Disabled until an email-link / OTP provider is wired up. */}
      <div className='grid gap-3 sm:grid-cols-2'>
        <SocialButton icon='mail' label='ইমেইল লিংক দিয়ে' />
        <SocialButton icon='phone' label='মোবাইল OTP দিয়ে' />
      </div>
      <p className='mt-2 text-center text-xs text-muted'>এই দুই পদ্ধতি শিগগিরই চালু হবে।</p>
      <p className='mt-6 text-center text-[0.95rem] text-ink-2'>
        অ্যাকাউন্ট নেই?{' '}
        <Link href='/register' className='font-semibold text-link hover:underline'>
          নতুন অ্যাকাউন্ট খুলুন
        </Link>
      </p>
    </>
  )
}

function SocialButton ({ icon, label }: { icon: 'mail' | 'phone'; label: string }) {
  return (
    <button
      type='button'
      disabled
      className='inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition w-full disabled:cursor-not-allowed disabled:opacity-60'
    >
      <svg className='icon size-4' aria-hidden='true'>
        <use href={`#i-${icon}`} />
      </svg>
      {label}
    </button>
  )
}
