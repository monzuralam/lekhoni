import { getHomeContent } from './content-data'
import SubscribeForm from './content-subscribe-form'

// COMPONENT: SubscribeBand (design/home-shop.html, design/blog.html).
// Newsletter sign-up; addresses are stored in wp-admin under Subscribers
// (wp-content/themes/lekhoni/inc/newsletter.php) via /api/subscribe.
//
// Usable on any page. Texts come from the props, then the home page's
// "Newsletter Band" ACF fields, then the defaults below. Give each band on a
// page its own `id`; `source` is saved with the address (e.g. "home", "blog").

type SubscribeBandProps = {
  id?: string
  source?: string
  title?: string
  text?: string
  successMessage?: string
  note?: string
  className?: string
  icon?: string // sprite icon in the circle
}

export default async function SubscribeBand ({
  id = 'subscribe',
  source = 'home',
  title,
  text,
  successMessage,
  note,
  className = 'mx-auto w-full max-w-site px-4 sm:px-6 mt-16 print:hidden',
  icon = 'mail'
}: SubscribeBandProps) {
  const settings = (await getHomeContent())?.subscribeSection
  const heading = title || settings?.title || 'নতুন অফারের খবর সরাসরি ইনবক্সে'
  const body = text ?? settings?.text
  const smallPrint = note ?? settings?.note
  const titleId = `${id}-title`

  return (
    <section aria-labelledby={titleId} className={className}>
      <div className='relative overflow-hidden rounded-card border border-line bg-surface-2 px-6 py-10 text-center sm:px-12 sm:py-14'>
        <span aria-hidden='true' className='absolute -right-10 -top-10 size-40 rounded-full bg-accent/10' />
        <span aria-hidden='true' className='absolute -bottom-12 -left-8 size-32 rounded-full bg-accent/10' />
        <div className='relative mx-auto max-w-xl'>
          <span className='mx-auto mb-4 grid size-12 place-items-center rounded-full bg-accent text-accent-ink'>
            <svg className='icon size-5' aria-hidden='true'>
              <use href={`#i-${icon}`} />
            </svg>
          </span>
          <h2 id={titleId} className='text-2xl text-ink sm:text-3xl'>
            {heading}
          </h2>
          {body && <p className='mt-3 text-ink-2'>{body}</p>}
          <SubscribeForm
            id={id}
            source={source}
            successMessage={successMessage || settings?.successMessage || 'সাবস্ক্রাইব করার জন্য ধন্যবাদ!'}
          />
          {smallPrint && <p className='mt-3 text-xs text-muted'>{smallPrint}</p>}
        </div>
      </div>
    </section>
  )
}
