import Link from 'next/link'
import type { Announcement } from '@/lib/theme-settings'
import AnnouncementDismiss from './AnnouncementDismiss'

// Announcement bar from Theme Settings → Announcement Bar. Hidden when
// <html data-announcement-dismissed> is set: by the pre-paint script (see
// ./announcement.ts) when it was closed before or is outside its schedule,
// or by the close button.
export default function AnnouncementBar ({ announcement }: { announcement: Announcement | null }) {
  if (!announcement) return null
  const { link } = announcement

  return (
    <div
      data-dismissible={announcement.id}
      role='region'
      aria-label='ঘোষণা'
      className='bg-accent text-accent-ink print:hidden in-data-announcement-dismissed:hidden'
    >
      <div className='mx-auto w-full max-w-site px-4 sm:px-6 flex items-center justify-center gap-3 py-2 text-center text-sm'>
        <p className='flex flex-wrap items-center justify-center gap-x-2'>
          {announcement.icon && (
            <svg className='icon size-4' aria-hidden='true'>
              <use href={`#i-${announcement.icon}`} />
            </svg>
          )}
          {announcement.text}
          {link && (
            <>
              <span aria-hidden='true'>·</span>
              {link.external ? (
                <a href={link.href} className='font-semibold underline underline-offset-4 hover:no-underline'>
                  {link.label}
                </a>
              ) : (
                <Link href={link.href} className='font-semibold underline underline-offset-4 hover:no-underline'>
                  {link.label}
                </Link>
              )}
            </>
          )}
        </p>
        {announcement.dismissible && <AnnouncementDismiss id={announcement.id} />}
      </div>
    </div>
  )
}
