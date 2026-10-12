import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { wpQuery } from '@/lib/wp'
import PageHeader from '../components/layout/PageHeader'
import ContactForm from '../components/contact/ContactForm'

// Contact page from WordPress: the page with slug "contact" (template
// "Contact"), fields from the "Contact Page" ACF group
// (wp-content/themes/lekhoni/inc/acf-contact.php). Port of design/contact.html.

type ContactPage = {
  title: string
  contactPage: {
    subtitle: string | null
    infoCards: { icon: string[] | string | null; label: string | null; value: string | null; link: string | null }[] | null
    form: { title: string | null; note: string | null; subjects: string | null; successMessage: string | null } | null
    faq: { title: string | null; items: { question: string | null; answer: string | null }[] | null } | null
    map: { embedUrl: string | null; label: string | null; note: string | null } | null
  } | null
}

async function getContactPage () {
  const data = await wpQuery(`
    {
      page(id: "contact", idType: URI) {
        title
        contactPage {
          subtitle
          infoCards {
            icon
            label
            value
            link
          }
          form {
            title
            note
            subjects
            successMessage
          }
          faq {
            title
            items {
              question
              answer
            }
          }
          map {
            embedUrl
            label
            note
          }
        }
      }
    }
  `)
  return (data?.page ?? null) as ContactPage | null
}

// Only Google Maps embeds are rendered in the iframe
function mapEmbed (url: string | null | undefined) {
  if (!url) return null
  try {
    const parsed = new URL(url)
    const google =
      parsed.protocol === 'https:' &&
      ((parsed.hostname === 'www.google.com' && parsed.pathname.startsWith('/maps/embed')) ||
        (parsed.hostname === 'maps.google.com' && parsed.searchParams.get('output') === 'embed'))
    return google ? parsed.href : null
  } catch {
    return null
  }
}

// Card links: mailto/tel, site paths and http(s) only
function safeLink (link: string | null | undefined) {
  if (!link) return null
  return /^(mailto:|tel:|https?:\/\/|\/)/i.test(link.trim()) ? link.trim() : null
}

export async function generateMetadata (): Promise<Metadata> {
  const page = await getContactPage()
  if (!page) return { title: 'পাতা পাওয়া যায়নি' }
  return {
    title: page.title,
    description: page.contactPage?.subtitle || undefined
  }
}

export default async function ContactPage () {
  const page = await getContactPage()
  if (!page) notFound()

  const { subtitle, infoCards, form, faq, map } = page.contactPage ?? {}
  const cards = (infoCards ?? []).filter(card => card.label && card.value)
  const subjects = (form?.subjects ?? '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
  const questions = (faq?.items ?? []).filter(item => item.question && item.answer)
  const embed = mapEmbed(map?.embedUrl)

  return (
    <>
      <PageHeader title={page.title} breadcrumbs={[{ label: page.title }]} description={subtitle} />

      {cards.length > 0 && (
        <section aria-label='যোগাযোগের তথ্য' className='mx-auto w-full max-w-site px-4 sm:px-6 mt-10'>
          <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {cards.map((card, index) => {
              const icon = (Array.isArray(card.icon) ? card.icon[0] : card.icon) || 'mail'
              const href = safeLink(card.link)
              const external = href ? /^https?:\/\//i.test(href) : false
              return (
                <li key={index} className='rounded-card border border-line bg-surface shadow-soft flex items-start gap-4 p-5'>
                  <span className='grid size-11 shrink-0 place-items-center rounded-2xl bg-accent/10 text-link'>
                    <svg className='icon size-5' aria-hidden='true'>
                      <use href={`#i-${icon}`} />
                    </svg>
                  </span>
                  <div className='min-w-0'>
                    <h2 className='font-sans text-sm font-medium text-muted'>{card.label}</h2>
                    {href ? (
                      <a
                        href={href}
                        target={external ? '_blank' : undefined}
                        rel={external ? 'noopener noreferrer' : undefined}
                        className='break-words font-semibold text-ink transition hover:text-link'
                      >
                        {card.value}
                      </a>
                    ) : (
                      <p className='font-semibold text-ink'>{card.value}</p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <div className='mx-auto w-full max-w-site px-4 sm:px-6 mt-12 grid gap-10 lg:grid-cols-2'>
        <section aria-labelledby='form-title' className='relative rounded-card border border-line bg-surface shadow-soft p-6 sm:p-8'>
          <h2 id='form-title' className='text-2xl text-ink'>
            {form?.title || 'আমাদের লিখুন'}
          </h2>
          <p className='mt-1 text-sm text-muted'>{form?.note || 'তারকা চিহ্ন ছাড়া সব ঘর পূরণ করা আবশ্যক।'}</p>
          <ContactForm
            subjects={subjects}
            successMessage={form?.successMessage || 'বার্তা পাঠানো হয়েছে। শিগগিরই উত্তর দেব।'}
          />
        </section>

        <div className='space-y-10'>
          {questions.length > 0 && (
            <section aria-labelledby='faq-title'>
              <h2 id='faq-title' className='text-2xl text-ink'>
                {faq?.title || 'সাধারণ জিজ্ঞাসা'}
              </h2>
              <div className='mt-5 space-y-3'>
                {questions.map((item, index) => (
                  <details
                    key={index}
                    className='group/faq rounded-card border border-line bg-surface shadow-soft px-5 py-4 open:border-accent/50'
                  >
                    <summary className='flex list-none items-center justify-between gap-4 font-semibold text-ink [&::-webkit-details-marker]:hidden'>
                      {item.question}
                      <span className='grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-ink-2 transition group-open/faq:rotate-180 group-open/faq:bg-accent group-open/faq:text-accent-ink'>
                        <svg className='icon size-4' aria-hidden='true'>
                          <use href='#i-chevron-down' />
                        </svg>
                      </span>
                    </summary>
                    <p className='mt-3 text-[0.95rem] leading-relaxed text-ink-2'>{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <section aria-labelledby='map-title'>
            <h2 id='map-title' className='sr-only'>
              মানচিত্র
            </h2>
            {embed ? (
              <iframe
                src={embed}
                title={map?.label ? `${map.label}: মানচিত্র` : 'মানচিত্র'}
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
                allowFullScreen
                className='aspect-video w-full rounded-card border border-line bg-surface-2'
              />
            ) : (
              <div className='relative grid aspect-video place-items-center overflow-hidden rounded-card border border-line bg-surface-2'>
                <div
                  aria-hidden='true'
                  className='absolute inset-0 opacity-60 [background-image:linear-gradient(var(--color-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-line)_1px,transparent_1px)] [background-size:2.5rem_2.5rem]'
                />
                <div className='relative text-center'>
                  <span className='mx-auto grid size-14 place-items-center rounded-full bg-accent text-accent-ink shadow-lift'>
                    <svg className='icon size-6' aria-hidden='true'>
                      <use href='#i-map-pin' />
                    </svg>
                  </span>
                  {map?.label && <p className='mt-3 font-semibold text-ink'>{map.label}</p>}
                  {map?.note && <p className='text-sm text-muted'>{map.note}</p>}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
