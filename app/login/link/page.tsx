import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import AuthCard, { BackToLogin } from '../../components/auth/AuthCard'
import EmailLinkConfirm from '../../components/auth/EmailLinkConfirm'

// Landing page of the email login link (wp-content/themes/lekhoni/inc/
// email-login.php): /login/link?token=…&next=…

export const metadata: Metadata = {
  title: 'লিংক দিয়ে লগইন',
  robots: { index: false },
  // The token is in the URL: don't leak it to other sites
  referrer: 'no-referrer'
}

function first (value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? ''
}

async function LinkContent ({ searchParams }: { searchParams: PageProps<'/login/link'>['searchParams'] }) {
  const token = first((await searchParams).token)

  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return (
      <AuthCard icon='mail' title='লিংকটি সঠিক নয়' description='লগইন লিংকটি অসম্পূর্ণ বা ভুল। নতুন একটি লিংক চেয়ে নিন।'>
        <Link
          href='/login'
          className='mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-semibold text-accent-ink transition hover:brightness-110 active:scale-95 w-full'
        >
          নতুন লিংক নিন
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard icon='mail' title='লিংক দিয়ে লগইন' description='নিচের বোতামে চাপ দিলেই আপনার অ্যাকাউন্টে লগইন হয়ে যাবেন।'>
      <EmailLinkConfirm token={token} />
      <BackToLogin />
    </AuthCard>
  )
}

export default function Page ({ searchParams }: PageProps<'/login/link'>) {
  return (
    <Suspense
      fallback={
        <AuthCard icon='mail' title='লিংক দিয়ে লগইন' description='নিচের বোতামে চাপ দিলেই আপনার অ্যাকাউন্টে লগইন হয়ে যাবেন।' />
      }
    >
      <LinkContent searchParams={searchParams} />
    </Suspense>
  )
}
