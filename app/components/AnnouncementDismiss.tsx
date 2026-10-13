'use client'

import { ANNOUNCEMENT_ATTR, announcementStorageKey } from './announcement'

// Close button for the announcement bar: hides it now (via the <html>
// attribute the bar's CSS reacts to) and remembers it for later visits
export default function AnnouncementDismiss ({ id }: { id: string }) {
  return (
    <button
      type='button'
      data-dismiss
      onClick={() => {
        document.documentElement.setAttribute(ANNOUNCEMENT_ATTR, '')
        try {
          localStorage.setItem(announcementStorageKey(id), 'true')
        } catch {}
        // The bar is gone; keep keyboard focus on the page instead of losing it
        document.getElementById('main')?.focus({ preventScroll: true })
      }}
      aria-label='ঘোষণা বন্ধ করুন'
      className='grid size-7 shrink-0 place-items-center rounded-full transition hover:bg-white/20'
    >
      <svg className='icon size-4' aria-hidden='true'>
        <use href='#i-close' />
      </svg>
    </button>
  )
}
