import RecentlyViewed from '../product/RecentlyViewed'

// COMPONENT: RecentlyViewed on the home page (design/home-shop.html): the
// shared client component with the home page's spacing (mt-16; its default
// is mt-14). Like the design it lists up to 8 products. It reads the visitor's
// history from localStorage and renders nothing until there is one.

export default function RecentlyViewedSection () {
  return <RecentlyViewed className='mx-auto w-full max-w-site px-4 sm:px-6 mt-16' />
}
