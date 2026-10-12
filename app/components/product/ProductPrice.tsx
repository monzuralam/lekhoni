'use client'

import { bn } from '@/lib/bn'
import { formatPrice } from '@/lib/products'
import type { StockStatus } from './data'
import { useSelectedVariation } from './ProductSelection'
import { saving, stockLabel, type PriceInfo } from './utils'

// Price row and stock line of the product info column. Both follow the
// variation picked in <VariantPicker /> and fall back to the product itself.

export function ProductPrice ({ product }: { product: PriceInfo }) {
  const { variation } = useSelectedVariation()
  const info: PriceInfo = variation ?? product
  const save = saving(info)

  if (!info.price) return null

  return (
    <div aria-live='polite' className='flex flex-wrap items-center gap-3'>
      {save ? (
        <>
          <p className='flex flex-wrap items-baseline gap-x-2'>
            <span className='sr-only'>ছাড়ের দাম</span>
            <span className='text-2xl font-bold text-sale'>{formatPrice(info.price)}</span>
            <span className='sr-only'>আগের দাম</span>
            <del className='text-sm text-muted'>{formatPrice(info.regularPrice)}</del>
          </p>
          <span className='rounded-full bg-sale/10 px-2.5 py-0.5 text-xs font-semibold text-sale'>
            {save.amount} সাশ্রয়
          </span>
        </>
      ) : (
        <p className='text-2xl font-bold text-ink'>{formatPrice(info.price)}</p>
      )}
    </div>
  )
}

type StockInfo = {
  stockStatus?: StockStatus | null
  stockQuantity?: number | null
  manageStock?: boolean | null
}

export function StockStatusLine ({ product }: { product: StockInfo }) {
  const { variation } = useSelectedVariation()
  const info: StockInfo = variation ?? product
  const out = info.stockStatus === 'OUT_OF_STOCK'
  const left = info.manageStock && info.stockQuantity != null && info.stockQuantity > 0
    ? info.stockQuantity
    : null

  return (
    <li aria-live='polite' className='flex items-start gap-3'>
      <span className={`mt-0.5 ${out ? 'text-danger' : 'text-success'}`}>
        <svg className='icon size-5' aria-hidden='true'>
          <use href={out ? '#i-close' : '#i-check'} />
        </svg>
      </span>
      <span>
        <strong className='text-ink'>{stockLabel(info.stockStatus)}</strong>
        {out ? ' · শিগগিরই আবার আসবে' : left !== null && ` · আর মাত্র ${bn(left)}টি বাকি`}
      </span>
    </li>
  )
}
