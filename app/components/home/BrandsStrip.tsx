import Image from 'next/image'
import Link from 'next/link'
import { getBrands, type BrandItem } from './products-data'

// Port of the BrandsStrip section of design/home-shop.html. Brands come from
// ACF "Home Products" → Brands Strip (name, optional logo and link); when that
// list is empty, from WooCommerce product brands that have products. Those
// are not linked, since the storefront has no brand archive route. Hidden
// when there are no brands.

// The design varies the wordmark style from one brand to the next
const STYLES = ['', 'italic', 'tracking-wide', 'font-sans', 'italic', 'tracking-wide']

const ITEM =
  'grid place-items-center px-4 py-6 font-serif text-xl font-bold text-muted opacity-70 transition hover:text-link hover:opacity-100'

function BrandMark ({ brand }: { brand: BrandItem }) {
  if (!brand.logo) return brand.name
  return (
    <Image
      src={brand.logo.sourceUrl}
      alt={brand.logo.altText || brand.name}
      width={brand.logo.width}
      height={brand.logo.height}
      sizes='160px'
      className='h-10 w-auto max-w-full object-contain grayscale transition hover:grayscale-0'
    />
  )
}

export default async function BrandsStrip () {
  const { title, brands } = await getBrands()
  if (!brands.length) return null

  return (
    <section aria-labelledby='brands-title' className='mx-auto mt-14 w-full max-w-site px-4 sm:px-6'>
      <h2
        id='brands-title'
        className='text-center text-sm font-semibold uppercase tracking-widest text-muted'
      >
        {title}
      </h2>
      <ul className='mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'>
        {brands.map((brand, index) => {
          const className = `${ITEM} ${STYLES[index % STYLES.length]}`
          const link = brand.link
          return (
            <li key={`${brand.name}-${index}`} className={link ? 'grid' : className}>
              {link ? (
                link.startsWith('/') ? (
                  <Link href={link} className={className}>
                    <BrandMark brand={brand} />
                  </Link>
                ) : (
                  <a href={link} target='_blank' rel='noopener noreferrer' className={className}>
                    <BrandMark brand={brand} />
                  </a>
                )
              ) : (
                <BrandMark brand={brand} />
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
