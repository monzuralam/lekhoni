import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import AuthCard, { BackToLogin } from '../components/auth/AuthCard'
import ResetPasswordForm from '../components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'নতুন পাসওয়ার্ড দিন',
  robots: { index: false },
  // The reset key is in the URL: don't leak it to other sites
  referrer: 'no-referrer'
}

function first (value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? ''
}

// `key` and `login` come from the emailed link (an `id` param is ignored)
async function ResetContent ({ searchParams }: { searchParams: PageProps<'/reset-password'>['searchParams'] }) {
  const params = await searchParams
  const resetKey = first(params.key)
  const login = first(params.login)

  if (!resetKey || !login) {
    return (
      <AuthCard
        icon='lock'
        title='লিংকটি সঠিক নয়'
        description='পাসওয়ার্ড রিসেট লিংকটি অসম্পূর্ণ বা ভুল। নতুন একটি লিংক চেয়ে নিন।'
      >
        <Link
          href='/forgot-password'
          className='mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-semibold text-accent-ink transition hover:brightness-110 active:scale-95 w-full'
        >
          নতুন রিসেট লিংক নিন
        </Link>
        <BackToLogin />
      </AuthCard>
    )
  }

  return (
    <AuthCard
      icon='lock'
      title='নতুন পাসওয়ার্ড দিন'
      description='এমন পাসওয়ার্ড বেছে নিন যা আগে অন্য কোথাও ব্যবহার করেননি।'
    >
      <ResetPasswordForm resetKey={resetKey} login={login} />
      <BackToLogin />
    </AuthCard>
  )
}

export default function Page ({ searchParams }: PageProps<'/reset-password'>) {
  return (
    <Suspense
      fallback={
        <AuthCard
          icon='lock'
          title='নতুন পাসওয়ার্ড দিন'
          description='এমন পাসওয়ার্ড বেছে নিন যা আগে অন্য কোথাও ব্যবহার করেননি।'
        />
      }
    >
      <ResetContent searchParams={searchParams} />
    </Suspense>
  )
}
