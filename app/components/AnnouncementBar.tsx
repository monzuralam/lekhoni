export default function AnnouncementBar () {
  return (
    <div
      data-dismissible='announce-1'
      role='region'
      aria-label='ঘোষণা'
      className='bg-accent text-accent-ink print:hidden'
    >
      <div className='mx-auto w-full max-w-site px-4 sm:px-6 flex items-center justify-center gap-3 py-2 text-center text-sm'>
        <p className='flex flex-wrap items-center justify-center gap-x-2'>
          <svg className='icon size-4' aria-hidden='true'>
            <use href='#i-truck' />
          </svg>
          ৳১,০০০-এর বেশি অর্ডারে ফ্রি ডেলিভারি ·{' '}
          <a
            href='shop.html'
            className='font-semibold underline underline-offset-4 hover:no-underline'
          >
            আজই অর্ডার করুন
          </a>
        </p>
        <button
          type='button'
          data-dismiss
          aria-label='ঘোষণা বন্ধ করুন'
          className='grid size-7 shrink-0 place-items-center rounded-full transition hover:bg-white/20'
        >
          <svg className='icon size-4' aria-hidden='true'>
            <use href='#i-close' />
          </svg>
        </button>
      </div>
    </div>
  )
}
