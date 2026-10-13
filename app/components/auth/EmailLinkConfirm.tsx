'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FormError, SubmitButton, postJson, useFinishSignIn } from './fields'

// The "লগইন করুন" step of email link login (/login/link). Signing in waits
// for this click because email scanners open links in emails automatically,
// which would use up the one-time link. On success: ?next= or /my-account.
export default function EmailLinkConfirm ({ token }: { token: string }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const finish = useFinishSignIn()

  async function confirm () {
    if (pending) return
    setPending(true)
    setError('')
    const result = await postJson('/api/auth/email-link/verify', { token })
    if ('error' in result) {
      setError(result.error)
      setPending(false)
      return
    }
    await finish()
  }

  if (error) {
    return (
      <div className='mt-6 space-y-4'>
        <FormError message={error} />
        <Link
          href='/login'
          className='inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-semibold text-accent-ink transition hover:brightness-110 active:scale-95 w-full'
        >
          নতুন লিংক নিন
        </Link>
      </div>
    )
  }

  return (
    <form
      className='mt-6'
      onSubmit={event => {
        event.preventDefault()
        confirm()
      }}
    >
      <SubmitButton pending={pending}>{pending ? 'লগইন হচ্ছে…' : 'লগইন করুন'}</SubmitButton>
    </form>
  )
}
