import EcomHero from './EcomHero'
import {
  BrandGrid,
  CategoryRows,
  DealsSection,
  DepartmentGrid,
  EcomFooterSections,
  PopularTabs,
  ProductLists,
  PromoTrio,
  ServiceStrip,
  WideBanner
} from './EcomSections'

// The "Home – E-commerce" page template (design/home-ecommerce.html).
// Content: wp-admin → the front page → "Home – E-commerce" fields.

export default function EcommerceHome () {
  return (
    <>
      <EcomHero />
      <ServiceStrip />
      <DepartmentGrid />
      <DealsSection />
      <PopularTabs />
      <WideBanner />
      <CategoryRows />
      <PromoTrio />
      <ProductLists />
      <BrandGrid />
      <EcomFooterSections />
    </>
  )
}
