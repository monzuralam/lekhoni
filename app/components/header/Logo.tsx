import Link from 'next/link'

export default function Logo () {
  return (
    <Link
      href='/'
      aria-label='লেখনী, হোম পেজ'
      className='font-serif text-3xl font-bold leading-none text-ink transition-[font-size] duration-300 group-data-scrolled/body:text-2xl nav:text-4xl nav:group-data-scrolled/body:text-3xl'
    >
      লেখনী<span className='text-link'>.</span>
    </Link>
  )
}
