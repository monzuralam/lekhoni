import Link from 'next/link'

export default function NotFound () {
  return (
    <>
      <section className='mx-auto w-full max-w-site px-4 sm:px-6 pt-12 text-center sm:pt-16'>
        <svg
          viewBox='0 0 480 240'
          width='480'
          height='240'
          role='img'
          aria-label='হারিয়ে যাওয়া পাতার ছবি'
          className='mx-auto h-auto w-full max-w-md'
        >
          <ellipse
            cx='240'
            cy='218'
            rx='170'
            ry='12'
            className='fill-surface-2'
          />
          <text
            x='82'
            y='170'
            textAnchor='middle'
            fontSize='150'
            fontWeight='700'
            className='fill-ink font-serif'
          >
            ৪
          </text>
          <text
            x='398'
            y='170'
            textAnchor='middle'
            fontSize='150'
            fontWeight='700'
            className='fill-ink font-serif'
          >
            ৪
          </text>
          <g transform='rotate(-8 240 120)'>
            <rect
              x='178'
              y='38'
              width='124'
              height='160'
              rx='12'
              className='fill-surface stroke-line'
              strokeWidth='3'
            />
            <rect
              x='178'
              y='38'
              width='124'
              height='34'
              rx='12'
              className='fill-accent'
            />
            <rect
              x='198'
              y='92'
              width='84'
              height='8'
              rx='4'
              className='fill-line'
            />
            <rect
              x='198'
              y='112'
              width='60'
              height='8'
              rx='4'
              className='fill-line'
            />
            <circle cx='222' cy='150' r='5' className='fill-ink' />
            <circle cx='258' cy='150' r='5' className='fill-ink' />
            <path
              d='M224 176q16-14 32 0'
              fill='none'
              strokeWidth='4'
              strokeLinecap='round'
              className='stroke-ink'
            />
          </g>
        </svg>
        <h1 className='mt-6 text-3xl text-ink sm:text-4xl'>
          পাতাটি খুঁজে পাওয়া গেল না
        </h1>
        <p className='mx-auto mt-3 max-w-xl text-lg text-ink-2'>
          লিংকটি হয়তো বদলে গেছে, অথবা পাতাটি সরিয়ে ফেলা হয়েছে। নিচে খুঁজে
          দেখুন, কিংবা হোম পেজ থেকে আবার শুরু করুন।
        </p>
        <form
          action='search.html'
          method='get'
          role='search'
          className='mx-auto mt-6 flex max-w-lg items-center gap-2 rounded-full border border-line bg-surface p-1.5 shadow-soft focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20'
        >
          <label htmlFor='nf-q' className='sr-only'>
            কী খুঁজছেন
          </label>
          <span className='pl-4 text-muted'>
            <svg className='icon size-5' aria-hidden='true'>
              <use href='#i-search' />
            </svg>
          </span>
          <input
            id='nf-q'
            name='q'
            type='search'
            placeholder='লেখা বা পণ্য খুঁজুন…'
            className='h-11 min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-muted focus:outline-none'
          />
          <button
            type='submit'
            className='inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110 active:scale-95 h-11'
          >
            খুঁজুন
          </button>
        </form>
        <Link
          href='/'
          className='inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-link transition hover:bg-accent/10 mt-4'
        >
          <svg className='icon size-4' aria-hidden='true'>
            <use href='#i-arrow-left' />
          </svg>
          হোম পেজে ফিরে যান
        </Link>
      </section>
    </>
  )
}
