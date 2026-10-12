'use client'

import { useState, type FormEvent } from 'react'
import { FormError, SubmitButton, SuccessPanel, TextField, postJson } from './fields'
import { MESSAGES, isEmail } from './validation'

// ForgotPasswordForm: POST /api/auth/forgot (sendPasswordResetEmail). The
// route always succeeds, so the page never reveals whether an account exists.
export default function ForgotPasswordForm () {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit (event: FormEvent) {
    event.preventDefault()
    if (pending) return
    const value = email.trim()
    const found = !value ? MESSAGES.required : isEmail(value) ? '' : MESSAGES.email
    setError(found)
    setFormError('')
    if (found) {
      document.getElementById('forgot-email')?.focus()
      return
    }

    setPending(true)
    const result = await postJson('/api/auth/forgot', { username: value })
    setPending(false)
    if ('error' in result) setFormError(result.error)
    else setSent(true)
  }

  if (sent) {
    return (
      <SuccessPanel title='ইমেইল পাঠানো হয়েছে'>
        <p className='mt-1 text-sm leading-relaxed text-ink-2'>
          ইনবক্স দেখুন। কয়েক মিনিটের মধ্যে না পেলে স্প্যাম ফোল্ডারও দেখে নিন।
        </p>
        <button
          type='button'
          onClick={() => setSent(false)}
          className='inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-link transition hover:bg-accent/10 mt-2'
        >
          অন্য ইমেইলে পাঠান
        </button>
      </SuccessPanel>
    )
  }

  return (
    <form noValidate onSubmit={submit} className='mt-6 space-y-5'>
      <TextField
        id='forgot-email'
        label='ইমেইল'
        type='email'
        required
        autoComplete='email'
        autoCapitalize='none'
        spellCheck={false}
        value={email}
        error={error}
        hint='এই ঠিকানায় পাসওয়ার্ড বদলানোর লিংক পাঠানো হবে।'
        onValue={value => {
          setEmail(value)
          if (error) setError('')
        }}
      />
      <FormError message={formError} />
      <SubmitButton pending={pending}>{pending ? 'পাঠানো হচ্ছে…' : 'রিসেট লিংক পাঠান'}</SubmitButton>
    </form>
  )
}
