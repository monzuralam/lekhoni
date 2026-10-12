import { wpQuery } from '@/lib/wp'

export default async function TrustSection () {
  const stripData = await wpQuery(`
      {
        page(id: "/", idType: URI) {
          homeShop {
            trustSection {
              items {
                icon
                title
                description
              }
            }
          }
        }
      }
    `)
  // ACF select fields come back from GraphQL as a list (["truck"])
  const items: { icon: string[] | string | null; title: string | null; description: string | null }[] =
    (await stripData?.page?.homeShop?.trustSection?.items) || []

  return (
    <>
      <section
        aria-labelledby='trust-title'
        className='mx-auto w-full max-w-site px-4 sm:px-6 mt-10'
      >
        <h2 id='trust-title' className='sr-only'>
          কেন লেখনী শপ
        </h2>
        <ul className='grid grid-cols-2 rounded-card border border-line bg-surface shadow-soft [&>*]:border-line [&>*:nth-child(odd)]:border-r [&>*:nth-child(odd)]:border-b [&>*:nth-child(even)]:border-r [&>*:nth-child(even)]:border-b [&>*:nth-child(n+3)]:border-t [&>*:nth-child(n+3)]:border-b lg:grid-cols-4 lg:[&>*]:border-r-0 lg:[&>*:nth-child(4n+1)]:border-r-0 lg:[&>*:nth-child(4n+2)]:border-r lg:[&>*:nth-child(4n+3)]:border-r lg:[&>*:nth-child(n+5)]:border-t'>
          {items.map((item, index) => {
            return (
              <li
                key={index}
                className='flex flex-col items-center gap-2 p-5 text-center sm:flex-row sm:gap-4 sm:text-left'
              >
                <span className='grid size-12 shrink-0 place-items-center rounded-2xl bg-accent/10 text-link'>
                  {item.icon && (
                    <svg className='icon size-6' aria-hidden='true'>
                      <use href={`#i-${Array.isArray(item.icon) ? item.icon[0] : item.icon}`} />
                    </svg>
                  )}
                </span>
                <div>
                  {item.title && (
                    <h3 className='font-sans text-base font-semibold text-ink'>
                      {item.title}
                    </h3>
                  )}

                  {item.description && (
                    <p className='text-sm leading-snug text-ink-2'>
                      {item.description}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </>
  )
}
