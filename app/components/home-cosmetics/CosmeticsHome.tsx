import BeautyHero from './BeautyHero'
import {
  BeautyBestsellers,
  BeautyClub,
  BeautyJournal,
  BeautyReviews,
  CategoryCircles,
  CustomerGallery,
  Ingredients,
  OfferBanner,
  PromiseStrip,
  Routines,
  ShopByConcern
} from './BeautySections'

// The "Home – Cosmetics" page template (design/home-cosmetics.html).
// Content: wp-admin → the front page → "Home – Cosmetics" fields.

export default function CosmeticsHome () {
  return (
    <>
      <BeautyHero />
      <PromiseStrip />
      <CategoryCircles />
      <ShopByConcern />
      <BeautyBestsellers />
      <Routines />
      <Ingredients />
      <OfferBanner />
      <BeautyReviews />
      <CustomerGallery />
      <BeautyJournal />
      <BeautyClub />
    </>
  )
}
