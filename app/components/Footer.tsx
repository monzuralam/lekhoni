export default function Footer () {
  return (
    <footer className='mt-16 border-t border-line bg-surface print:hidden'>
      <div className='mx-auto w-full max-w-site px-4 sm:px-6'>
        <div className='grid gap-10 py-12 group-data-reading/body:hidden sm:grid-cols-2 lg:grid-cols-4'>
          <div>
            <h2 className='mb-4 text-lg text-ink'>লেখনী সম্পর্কে</h2>
            <p className='text-[0.95rem] leading-relaxed text-ink-2'>
              হেডলেস ওয়ার্ডপ্রেস, GraphQL আর Next.js নিয়ে বাংলায় লেখা, সঙ্গে
              লেখালেখির পছন্দের জিনিসপত্রের ছোট্ট দোকান।
            </p>
            <div className='mt-4 flex gap-2'>
              <a
                href='#'
                aria-label='ফেসবুক'
                className='grid size-9 place-items-center rounded-full border border-line text-ink-2 transition hover:border-accent hover:text-link'
              >
                <svg className='icon size-4' aria-hidden='true'>
                  <use href='#i-facebook' />
                </svg>
              </a>
              <a
                href='#'
                aria-label='এক্স'
                className='grid size-9 place-items-center rounded-full border border-line text-ink-2 transition hover:border-accent hover:text-link'
              >
                <svg className='icon size-4' aria-hidden='true'>
                  <use href='#i-x' />
                </svg>
              </a>
              <a
                href='#'
                aria-label='ইনস্টাগ্রাম'
                className='grid size-9 place-items-center rounded-full border border-line text-ink-2 transition hover:border-accent hover:text-link'
              >
                <svg className='icon size-4' aria-hidden='true'>
                  <use href='#i-instagram' />
                </svg>
              </a>
              <a
                href='#'
                aria-label='ইউটিউব'
                className='grid size-9 place-items-center rounded-full border border-line text-ink-2 transition hover:border-accent hover:text-link'
              >
                <svg className='icon size-4' aria-hidden='true'>
                  <use href='#i-youtube' />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h2 className='mb-4 text-lg text-ink'>সাম্প্রতিক লেখা</h2>
            <ul className='space-y-2.5 text-[0.95rem] leading-snug'>
              <li>
                <a
                  href='single.html'
                  className='line-clamp-2 text-ink-2 transition hover:text-link'
                >
                  হেডলেস ওয়ার্ডপ্রেস কী এবং কেন ব্যবহার করবেন
                </a>
              </li>
              <li>
                <a
                  href='single.html'
                  className='line-clamp-2 text-ink-2 transition hover:text-link'
                >
                  WPGraphQL দিয়ে প্রথম কোয়েরি লেখা
                </a>
              </li>
              <li>
                <a
                  href='single.html'
                  className='line-clamp-2 text-ink-2 transition hover:text-link'
                >
                  Next.js App Router-এ ব্লগ তৈরি: ধাপে ধাপে
                </a>
              </li>
              <li>
                <a
                  href='single.html'
                  className='line-clamp-2 text-ink-2 transition hover:text-link'
                >
                  বাংলা ওয়েবসাইটের জন্য সঠিক ফন্ট বাছাই
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className='mb-4 text-lg text-ink'>বিষয়</h2>
            <ul className='flex flex-wrap gap-2'>
              <li>
                <a
                  href='category.html'
                  className='inline-flex items-center rounded-full bg-surface-2 px-3 py-1 text-sm text-ink-2 transition hover:bg-accent/10 hover:text-link'
                >
                  হেডলেস
                </a>
              </li>
              <li>
                <a
                  href='category.html'
                  className='inline-flex items-center rounded-full bg-surface-2 px-3 py-1 text-sm text-ink-2 transition hover:bg-accent/10 hover:text-link'
                >
                  GraphQL
                </a>
              </li>
              <li>
                <a
                  href='category.html'
                  className='inline-flex items-center rounded-full bg-surface-2 px-3 py-1 text-sm text-ink-2 transition hover:bg-accent/10 hover:text-link'
                >
                  Next.js
                </a>
              </li>
              <li>
                <a
                  href='category.html'
                  className='inline-flex items-center rounded-full bg-surface-2 px-3 py-1 text-sm text-ink-2 transition hover:bg-accent/10 hover:text-link'
                >
                  ওয়ার্ডপ্রেস
                </a>
              </li>
              <li>
                <a
                  href='category.html'
                  className='inline-flex items-center rounded-full bg-surface-2 px-3 py-1 text-sm text-ink-2 transition hover:bg-accent/10 hover:text-link'
                >
                  WooCommerce
                </a>
              </li>
              <li>
                <a
                  href='category.html'
                  className='inline-flex items-center rounded-full bg-surface-2 px-3 py-1 text-sm text-ink-2 transition hover:bg-accent/10 hover:text-link'
                >
                  Tailwind
                </a>
              </li>
              <li>
                <a
                  href='category.html'
                  className='inline-flex items-center rounded-full bg-surface-2 px-3 py-1 text-sm text-ink-2 transition hover:bg-accent/10 hover:text-link'
                >
                  টাইপোগ্রাফি
                </a>
              </li>
              <li>
                <a
                  href='category.html'
                  className='inline-flex items-center rounded-full bg-surface-2 px-3 py-1 text-sm text-ink-2 transition hover:bg-accent/10 hover:text-link'
                >
                  পারফরম্যান্স
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className='mb-4 text-lg text-ink'>দরকারি লিংক</h2>
            <ul className='space-y-2 text-[0.95rem]'>
              <li>
                <a
                  href='shop.html'
                  className='text-ink-2 transition hover:text-link'
                >
                  শপ
                </a>
              </li>
              <li>
                <a
                  href='account.html'
                  className='text-ink-2 transition hover:text-link'
                >
                  আমার অ্যাকাউন্ট
                </a>
              </li>
              <li>
                <a
                  href='archive.html'
                  className='text-ink-2 transition hover:text-link'
                >
                  আর্কাইভ
                </a>
              </li>
              <li>
                <a
                  href='topics.html'
                  className='text-ink-2 transition hover:text-link'
                >
                  সব বিষয়
                </a>
              </li>
              <li>
                <a
                  href='about.html'
                  className='text-ink-2 transition hover:text-link'
                >
                  আমাদের সম্পর্কে
                </a>
              </li>
              <li>
                <a
                  href='contact.html'
                  className='text-ink-2 transition hover:text-link'
                >
                  যোগাযোগ
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className='flex flex-col items-center gap-4 border-t border-line py-8 text-center group-data-reading/body:border-t-0'>
          <a
            href='index.html'
            className='font-serif text-2xl font-bold text-ink'
          >
            লেখনী<span className='text-link'>.</span>
          </a>
          <ul
            aria-label='পেমেন্ট পদ্ধতি'
            className='flex flex-wrap justify-center gap-2'
          >
            <li className='rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-2'>
              ক্যাশ অন ডেলিভারি
            </li>
            <li className='rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-2'>
              বিকাশ
            </li>
            <li className='rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-2'>
              নগদ
            </li>
            <li className='rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-2'>
              ভিসা/মাস্টারকার্ড
            </li>
          </ul>
          <p className='text-sm text-muted'>
            © ২০২৬ লেখনী · WordPress ও Next.js দিয়ে তৈরি
          </p>
        </div>
      </div>
    </footer>
  )
}
