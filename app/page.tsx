import type { Metadata } from 'next'
import { getFrontPage } from '@/lib/front-page'
import HeroSlider from './components/HeroSlider'
import TrustSection from './components/TrustSection'
import CategorySection from './components/CategorySection'
import FlashSaleSection from './components/FlashSaleSection'
import FeaturedProductsTabs from './components/home/FeaturedProductsTabs'
import PromoBanners from './components/home/PromoBanners'
import ProductSpotlight from './components/home/ProductSpotlight'
import BestSellersCarousel from './components/home/BestSellersCarousel'
import CustomerReviews from './components/home/CustomerReviews'
import BrandsStrip from './components/home/BrandsStrip'
import FromTheBlog from './components/home/FromTheBlog'
import RecentlyViewedSection from './components/home/RecentlyViewedSection'
import SubscribeBand from './components/home/SubscribeBand'
import BlogHome from './components/blog-home/BlogHome'
import EcommerceHome from './components/home-ecommerce/EcommerceHome'
import CosmeticsHome from './components/home-cosmetics/CosmeticsHome'
import WordPressPage, { getPage, pageMetadata } from './components/layout/WordPressPage'

// The homepage follows Settings > Reading > "Your homepage displays"
// (lib/front-page.ts):
// - static page with the Home Shop template -> shop home (design/home-shop.html)
// - … "Home – E-commerce" / "Home – Cosmetics" -> design/home-ecommerce.html / home-cosmetics.html
// - static page with another template       -> that page's content
// - "Your latest posts"                     -> blog home (design/index.html)

export async function generateMetadata (): Promise<Metadata> {
  const front = await getFrontPage()
  if (front.kind !== 'page') return {} // the layout's site title and tagline
  const page = await getPage(front.uri)
  return page ? pageMetadata(page) : {}
}

// Shop home. Every section reads its settings from the "Home Shop" ACF group
// on the front page (wp-content/themes/lekhoni/inc/acf-home.php), falls back
// to WooCommerce/WordPress data when empty, and renders nothing when it has
// nothing to show.
function ShopHome () {
  return (
    <>
      <HeroSlider />
      <TrustSection />
      <CategorySection />
      <FlashSaleSection />
      <FeaturedProductsTabs />
      <PromoBanners />
      <ProductSpotlight />
      <BestSellersCarousel />
      <CustomerReviews />
      <BrandsStrip />
      <FromTheBlog />
      <RecentlyViewedSection />
      <SubscribeBand />
    </>
  )
}

export default async function Home () {
  const front = await getFrontPage()
  if (front.kind === 'posts') return <BlogHome />
  if (front.kind === 'ecommerce') return <EcommerceHome />
  if (front.kind === 'cosmetics') return <CosmeticsHome />
  if (front.kind === 'page') {
    const page = await getPage(front.uri)
    if (page) return <WordPressPage page={page} />
  }
  return <ShopHome />
}
