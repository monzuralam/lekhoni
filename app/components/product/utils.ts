import { formatPrice } from '@/lib/products'
import type { AttributeData, StockStatus, VariationData } from './data'

// Pure helpers shared by the server page and the client components.

export type PriceInfo = {
  price?: string | null
  regularPrice?: string | null
  rawPrice?: string | null
  rawRegularPrice?: string | null
}

// Saving and percentage for a single (non-range) sale price
export function saving (info: PriceInfo) {
  const price = Number(info.rawPrice)
  const regular = Number(info.rawRegularPrice)
  if (!price || !regular || regular <= price) return null
  return {
    percent: Math.round((1 - price / regular) * 100),
    // Reuse the store's own formatting ("£16.00") with the saved amount
    amount: formatPrice(
      (info.price ?? '').replace(/\d[\d,.]*/, (regular - price).toFixed(2))
    )
  }
}

export type VariantOption = { value: string; label: string }

export type VariantAttribute = {
  name: string // pa_color, or a local attribute name such as "logo"
  label: string
  options: VariantOption[]
}

// Attributes used for variations, with readable labels. Global attribute
// options come back as term slugs; local ones are the visible names already.
export function variantAttributes (attributes: AttributeData[]): VariantAttribute[] {
  return attributes
    .filter(attribute => attribute.variation && attribute.options?.length)
    .map(attribute => {
      const terms = new Map(attribute.terms?.nodes.map(term => [term.slug, term.name]))
      return {
        name: attribute.name,
        label: attribute.label || attribute.name,
        options: (attribute.options ?? []).map(value => ({
          value,
          label: terms.get(value) ?? value
        }))
      }
    })
}

export type Selection = Record<string, string>

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

function valueOf (variation: VariationData, name: string) {
  const attribute = variation.attributes?.nodes.find(node => same(node.name, name))
  return attribute ? attribute.value : ''
}

// Does the variation accept these choices? Empty variation values mean "any".
export function accepts (variation: VariationData, selection: Selection) {
  return Object.entries(selection).every(([name, chosen]) => {
    if (!chosen) return true
    const value = valueOf(variation, name)
    return value === '' || same(value, chosen)
  })
}

// The variation for a complete selection. When several match (one specific,
// one with "any"), prefer the most specific, like WooCommerce does.
export function findVariation (
  variations: VariationData[],
  attributes: VariantAttribute[],
  selection: Selection
) {
  if (!attributes.every(attribute => selection[attribute.name])) return null
  const matches = variations.filter(variation => accepts(variation, selection))
  if (!matches.length) return null
  const anyCount = (variation: VariationData) =>
    attributes.filter(attribute => valueOf(variation, attribute.name) === '').length
  return matches.reduce((best, variation) =>
    anyCount(variation) < anyCount(best) ? variation : best
  )
}

// Values the cart needs for attributes the variation leaves as "any"
export function anyAttributes (
  variation: VariationData,
  attributes: VariantAttribute[],
  selection: Selection
) {
  const result: Record<string, string> = {}
  attributes.forEach(attribute => {
    if (valueOf(variation, attribute.name) === '' && selection[attribute.name]) {
      result[attribute.name] = selection[attribute.name]
    }
  })
  return result
}

export function stockLabel (status: StockStatus | null | undefined) {
  if (status === 'OUT_OF_STOCK') return 'স্টক শেষ'
  if (status === 'ON_BACKORDER') return 'অর্ডারে পাওয়া যাবে'
  return 'স্টকে আছে'
}
