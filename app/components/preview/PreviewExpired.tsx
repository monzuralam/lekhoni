import Link from 'next/link'
import AuthCard from '../auth/AuthCard'

export function PreviewExpired () {
  return (
    <AuthCard
      icon='lock'
      title='প্রিভিউ লিংকের মেয়াদ শেষ'
      description='লিংকটি পুরোনো, আগে ব্যবহার করা হয়েছে, অথবা এই লেখাটি দেখার অনুমতি আপনার নেই। ওয়ার্ডপ্রেস থেকে আবার "Preview" চাপুন।'
    >
      <Link
        href='/'
        className='mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-semibold text-accent-ink transition hover:brightness-110 active:scale-95'
      >
        হোমপেজে যান
      </Link>
    </AuthCard>
  )
}
