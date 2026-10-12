import ProductCard from '../ProductCard'
import ProductsTabs from './products-tabs'
import { getFeaturedTabs } from './products-data'

// Port of the FeaturedProductsTabs section of design/home-shop.html: new,
// best sellers and on sale, up to 8 products each. ACF "Home Products" →
// Featured Products Tabs picks the title, labels and products; empty
// product lists fall back to the newest / best-selling / on-sale products.
// Tabs without products are dropped; no products at all hides the section.

export default async function FeaturedProductsTabs () {
  const { title, tabs } = await getFeaturedTabs()
  if (!tabs.length) return null

  return (
    <ProductsTabs
      title={title}
      tabs={tabs.map(tab => ({
        key: tab.key,
        label: tab.label,
        panel: (
          <ul className='grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4'>
            {tab.products.map(product => (
              <li key={product.databaseId}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )
      }))}
    />
  )
}
