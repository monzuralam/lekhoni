import Link from 'next/link'
import AnnouncementDismiss from './AnnouncementDismiss'
import { ANNOUNCEMENT_ID } from './announcement'

// Hidden when <html data-announcement-dismissed> is set: by the pre-paint
// script (see ./announcement.ts) on later visits, or by the close button.
export default function AnnouncementBar () {
  return (
    <div
      data-dismissible={ANNOUNCEMENT_ID}
      role='region'
      aria-label='ঘোষণা'
      className='bg-accent text-accent-ink print:hidden in-data-announcement-dismissed:hidden'
    >
      <div className='mx-auto w-full max-w-site px-4 sm:px-6 flex items-center justify-center gap-3 py-2 text-center text-sm'>
        <p className='flex flex-wrap items-center justify-center gap-x-2'>
          <svg className='icon size-4' aria-hidden='true'>
            <use href='#i-truck' />
          </svg>
          ৳১,০০০-এর বেশি অর্ডারে ফ্রি ডেলিভারি ·{' '}
          <Link
            href='/shop'
            className='font-semibold underline underline-offset-4 hover:no-underline'
          >
            আজই অর্ডার করুন
          </Link>
        </p>
        <AnnouncementDismiss />
      </div>
    </div>
  )
}
