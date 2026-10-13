'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { bn } from '@/lib/bn'
import {
  FormError,
  PasswordField,
  SubmitButton,
  SuccessPanel,
  TextField,
  focusFirstError,
  postJson,
  useFinishSignIn
} from './fields'
import { MESSAGES, isEmail } from './validation'

type Errors = { 'login-id'?: string; 'login-password'?: string }

// Theme Settings → Login: email link login on/off and how long a link works
export type EmailLinkSettings = { enabled: boolean; lifetime: number }

// LoginForm: POST /api/auth/login (WPGraphQL JWT `login`), tokens are stored in
// httpOnly cookies by the route. Redirects to ?next= or /my-account.
// With email link login switched on, "ইমেইল লিংক দিয়ে" swaps the form for
// <EmailLinkForm /> instead.
export default function LoginForm ({ emailLink }: { emailLink: EmailLinkSettings }) {
  const [mode, setMode] = useState<'password' | 'link'>('password')
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

  if (mode === 'link') {
    return (
      <EmailLinkForm
        lifetime={emailLink.lifetime}
        // Carry over what was typed in the password form, when it is an email
        initialEmail={isEmail(username) ? username.trim() : ''}
        onBack={() => setMode('password')}
      />
    )
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
      {/* SocialLogin (design). Email link: Theme Settings → Login. Mobile OTP has no provider yet. */}
      <div className='grid gap-3 sm:grid-cols-2'>
        <SocialButton
          icon='mail'
          label='ইমেইল লিংক দিয়ে'
          onClick={emailLink.enabled ? () => setMode('link') : undefined}
        />
        <SocialButton icon='phone' label='মোবাইল OTP দিয়ে' />
      </div>
      <p className='mt-2 text-center text-xs text-muted'>
        {emailLink.enabled ? 'মোবাইল OTP শিগগিরই চালু হবে।' : 'এই দুই পদ্ধতি শিগগিরই চালু হবে।'}
      </p>
      <p className='mt-6 text-center text-[0.95rem] text-ink-2'>
        অ্যাকাউন্ট নেই?{' '}
        <Link href='/register' className='font-semibold text-link hover:underline'>
          নতুন অ্যাকাউন্ট খুলুন
        </Link>
      </p>
    </>
  )
}

// Disabled (as in the design) unless it has an onClick
function SocialButton ({ icon, label, onClick }: { icon: 'mail' | 'phone'; label: string; onClick?: () => void }) {
  return (
    <button
      type='button'
      disabled={!onClick}
      onClick={onClick}
      className='inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition w-full hover:border-accent hover:text-link disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-line disabled:hover:text-ink'
    >
      <svg className='icon size-4' aria-hidden='true'>
        <use href={`#i-${icon}`} />
      </svg>
      {label}
    </button>
  )
}

// EmailLinkForm: POST /api/auth/email-link. The answer is the same whether or
// not the email has an account; the email links to /login/link.
function EmailLinkForm ({ lifetime, initialEmail, onBack }: { lifetime: number; initialEmail: string; onBack: () => void }) {
  const [email, setEmail] = useState(initialEmail)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [pending, setPending] = useState(false)
  const [sentTo, setSentTo] = useState('')

  async function submit (event: FormEvent) {
    event.preventDefault()
    if (pending) return
    const value = email.trim()
    const found = !value ? MESSAGES.required : !isEmail(value) ? MESSAGES.email : ''
    setError(found)
    setFormError('')
    if (found) {
      document.getElementById('link-email')?.focus()
      return
    }

    setPending(true)
    const next = new URLSearchParams(window.location.search).get('next') ?? ''
    const result = await postJson('/api/auth/email-link', { email: value, next })
    setPending(false)
    if ('error' in result) setFormError(result.error)
    else setSentTo(value)
  }

  const back = (
    <button
      type='button'
      onClick={onBack}
      className='mx-auto mt-6 flex items-center gap-1.5 text-[0.95rem] font-semibold text-link hover:underline'
    >
      <svg className='icon size-4' aria-hidden='true'>
        <use href='#i-arrow-left' />
      </svg>
      পাসওয়ার্ড দিয়ে লগইন করুন
    </button>
  )

  if (sentTo) {
    return (
      <>
        <SuccessPanel title='ইমেইল দেখুন'>
          <p className='mt-1 text-sm leading-relaxed text-ink-2'>
            <strong className='text-ink'>{sentTo}</strong> ঠিকানায় অ্যাকাউন্ট থাকলে একটি লগইন লিংক পাঠানো হয়েছে।
            লিংকটি {bn(lifetime)} মিনিট পর্যন্ত কাজ করবে, একবারই। ইনবক্সে না পেলে স্প্যাম ফোল্ডার দেখুন।
          </p>
          <button
            type='button'
            onClick={() => setSentTo('')}
            className='mt-3 text-sm font-semibold text-link hover:underline'
          >
            অন্য ইমেইলে পাঠান
          </button>
        </SuccessPanel>
        {back}
      </>
    )
  }

  return (
    <>
      <form noValidate onSubmit={submit} className='mt-6 space-y-5'>
        <TextField
          id='link-email'
          label='ইমেইল'
          type='email'
          required
          autoComplete='email'
          autoCapitalize='none'
          spellCheck={false}
          autoFocus
          value={email}
          error={error}
          hint='পাসওয়ার্ড ছাড়াই লগইন করার জন্য এই ঠিকানায় একটি লিংক পাঠানো হবে।'
          onValue={value => {
            setEmail(value)
            if (error) setError('')
          }}
        />
        <FormError message={formError} />
        <SubmitButton pending={pending}>{pending ? 'পাঠানো হচ্ছে…' : 'লগইন লিংক পাঠান'}</SubmitButton>
      </form>
      {back}
    </>
  )
}
