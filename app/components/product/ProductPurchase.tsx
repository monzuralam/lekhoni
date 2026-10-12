'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '../cart/CartProvider'
import type { StockStatus, VariationData } from './data'
import { useSelectedVariation } from './ProductSelection'
import QuantityStepper from './QuantityStepper'
import VariantPicker from './VariantPicker'
import { anyAttributes, findVariation, type Selection, type VariantAttribute } from './utils'

// Variant picker + quantity stepper + add to cart / buy now for simple and
// variable products. External and grouped products are handled by the page.

type ProductPurchaseProps = {
  productId: number
  name: string
  stockStatus?: StockStatus | null
  stockQuantity?: number | null
  manageStock?: boolean | null
  attributes?: VariantAttribute[]
  variations?: VariationData[]
  defaultSelection?: Selection
}

const MAX_QUANTITY = 10 // same cap as the design's data-max

function maxFor (info: { manageStock?: boolean | null; stockQuantity?: number | null }) {
  const stock = info.manageStock && info.stockQuantity != null ? info.stockQuantity : MAX_QUANTITY
  return Math.max(1, Math.min(MAX_QUANTITY, stock))
}

export default function ProductPurchase ({
  productId,
  name,
  stockStatus,
  stockQuantity,
  manageStock,
  attributes = [],
  variations = [],
  defaultSelection = {}
}: ProductPurchaseProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const { variation, setVariation } = useSelectedVariation()
  const [selection, setSelection] = useState<Selection>(defaultSelection)
  const [quantity, setQuantity] = useState(1)
  const [pending, setPending] = useState<'cart' | 'buy' | null>(null)

  const isVariable = attributes.length > 0
  const complete = attributes.every(attribute => selection[attribute.name])
  const noMatch = isVariable && complete && !variation
  const allOut = isVariable
    ? variations.length > 0 && variations.every(item => item.stockStatus === 'OUT_OF_STOCK')
    : false
  const outOfStock = stockStatus === 'OUT_OF_STOCK' || allOut ||
    variation?.stockStatus === 'OUT_OF_STOCK'
  const ready = !outOfStock && (!isVariable || Boolean(variation))
  const max = maxFor(variation ?? { manageStock, stockQuantity })
  const amount = Math.min(quantity, max)

  const missing = attributes
    .filter(attribute => !selection[attribute.name])
    .map(attribute => attribute.label)
  const hint = isVariable && missing.length > 0

  const changeSelection = (next: Selection) => {
    setSelection(next)
    setVariation(findVariation(variations, attributes, next))
  }

  const add = async (mode: 'cart' | 'buy') => {
    if (!ready) return
    setPending(mode)
    const added = variation
      ? await addItem(
        productId,
        name,
        amount,
        variation.databaseId,
        anyAttributes(variation, attributes, selection)
      )
      : await addItem(productId, name, amount)
    setPending(null)
    if (added && mode === 'buy') router.push('/checkout')
  }

  return (
    <>
      {isVariable && (
        <VariantPicker
          attributes={attributes}
          variations={variations}
          selection={selection}
          onChange={changeSelection}
          message={noMatch ? 'এই কম্বিনেশনটি পাওয়া যাচ্ছে না, অন্য অপশন বেছে নিন।' : null}
        />
      )}

      {outOfStock ? (
        <div className='flex flex-wrap items-center gap-3 pt-1'>
          <button
            type='button'
            disabled
            className='inline-flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-full bg-surface-2 px-7 py-3 text-base font-semibold text-muted'
          >
            স্টক শেষ
          </button>
        </div>
      ) : (
        <div className='flex flex-wrap items-center gap-3 pt-1'>
          <QuantityStepper value={amount} max={max} onChange={setQuantity} />
          <button
            type='button'
            onClick={() => add('cart')}
            disabled={!ready || pending !== null}
            aria-busy={pending === 'cart' || undefined}
            aria-describedby={hint ? 'variant-hint' : undefined}
            className='inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-semibold text-accent-ink transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 aria-busy:cursor-wait'
          >
            {pending === 'cart' ? (
              <span
                aria-hidden='true'
                className='size-4 animate-spin rounded-full border-2 border-current border-t-transparent'
              />
            ) : (
              <svg className='icon size-4.5' aria-hidden='true'>
                <use href='#i-cart' />
              </svg>
            )}
            {pending === 'cart' ? 'যোগ হচ্ছে…' : 'কার্টে যোগ করুন'}
          </button>
          <button
            type='button'
            onClick={() => add('buy')}
            disabled={!ready || pending !== null}
            aria-busy={pending === 'buy' || undefined}
            aria-describedby={hint ? 'variant-hint' : undefined}
            className='inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-line bg-surface px-7 py-3 text-base font-semibold text-ink transition hover:border-accent hover:text-link active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 aria-busy:cursor-wait'
          >
            এখনই কিনুন
          </button>
          {hint && (
            <p id='variant-hint' className='w-full text-sm text-muted'>
              কার্টে যোগ করতে {missing.join(' ও ')} বেছে নিন।
            </p>
          )}
        </div>
      )}
    </>
  )
}
