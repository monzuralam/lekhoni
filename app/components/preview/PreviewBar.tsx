import Link from 'next/link'
import { linkTo } from '../blog/format'

// The strip above a preview (app/preview): what is shown and a way out.

const STATUS: Record<string, string> = {
  draft: 'খসড়া',
  'auto-draft': 'খসড়া',
  pending: 'রিভিউর অপেক্ষায়',
  future: 'প্রকাশের তারিখ নির্ধারিত',
  private: 'প্রাইভেট',
  publish: 'প্রকাশিত — না-সেভ করা পরিবর্তনসহ'
}

type Props = {
  status: string
  // Live URI when published; exiting goes there
  link: string | null
  note?: string
}

export default function PreviewBar ({ status, link, note }: Props) {
  const live = link ? linkTo(link) : null
  return (
    <div role='status' className='border-b border-accent/30 bg-accent/10 print:hidden'>
      <div className='mx-auto flex w-full max-w-site flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 text-sm sm:px-6'>
        <p className='flex flex-wrap items-center gap-x-2 gap-y-1 text-ink'>
          <svg className='icon size-4 text-link' aria-hidden='true'>
            <use href='#i-eye' />
          </svg>
          <strong>প্রিভিউ</strong>
          <span className='rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-link'>{STATUS[status] ?? status}</span>
          <span className='text-ink-2'>শুধু আপনি দেখতে পাচ্ছেন।{note ? ` ${note}` : ''}</span>
        </p>
        <div className='flex items-center gap-2'>
          {live && (
            <Link href={live} prefetch={false} className='rounded-full px-3 py-1.5 font-semibold text-link transition hover:bg-accent/10'>
              প্রকাশিত পাতা
            </Link>
          )}
          <form method='post' action='/api/preview/exit'>
            <input type='hidden' name='next' value={live ?? '/'} />
            <button
              type='submit'
              className='inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 font-semibold text-accent-ink transition hover:brightness-110'
            >
              <svg className='icon size-4' aria-hidden='true'>
                <use href='#i-eye-off' />
              </svg>
              প্রিভিউ বন্ধ করুন
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
