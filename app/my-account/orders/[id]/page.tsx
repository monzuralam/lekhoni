import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { bn } from '@/lib/bn'
import { formatPrice } from '@/lib/products'
import { gatewayTitle } from '../../../components/checkout/gateways'
import { CartSpinner } from '../../../components/cart/CartPage'
import { divisionOf, fullName, type CustomerAddress } from '../../../components/account/address'
import { getOrder, requireCustomer } from '../../../components/account/data'
import { orderDate, orderStatus } from '../../../components/account/orders'

// Order details. The design's "দেখুন" button pointed at order-received.html;
// that page only works right after checkout (it reads a short-lived cookie),
// so signed-in customers get this view built from the same layout instead.

export const metadata: Metadata = {
  title: 'অর্ডারের বিবরণ | লেখনী',
  robots: { index: false, follow: false }
}

export default function Page ({ params }: PageProps<'/my-account/orders/[id]'>) {
  return (
    <Suspense fallback={<CartSpinner />}>
      <OrderDetails params={params} />
    </Suspense>
  )
}

const positive = (value: string | null | undefined) => Number(value ?? 0) > 0

function AddressBlock ({ title, address, showPhone }: { title: string; address: CustomerAddress | null; showPhone?: boolean }) {
  if (!address?.address1 && !address?.firstName) return null
  const place = divisionOf(address.state)
  const lines = [address.address1, address.city, place?.district, place?.division].filter(Boolean)
  return (
    <div>
      <h3 className='text-lg text-ink'>{title}</h3>
      <address className='mt-2 text-[0.95rem] not-italic leading-relaxed text-ink-2'>
        <strong className='block text-ink'>{fullName(address)}</strong>
        {lines.length > 0 && <span className='block'>{lines.join(', ')}</span>}
        {showPhone && address.phone && (
          <span className='inline-flex items-center gap-1.5'>
            <svg className='icon size-4' aria-hidden='true'>
              <use href='#i-phone' />
            </svg>
            <span>{bn(address.phone)}</span>
          </span>
        )}
      </address>
    </div>
  )
}

async function OrderDetails ({ params }: { params: PageProps<'/my-account/orders/[id]'>['params'] }) {
  const { id } = await params
  await requireCustomer(`/my-account/orders/${id}`)
  const orderId = Number(id)
  if (!Number.isInteger(orderId) || orderId <= 0) notFound()
  const order = await getOrder(orderId)
  if (!order) notFound()

  const status = orderStatus(order.status)
  const date = orderDate(order.date)
  const items = order.lineItems?.nodes ?? []
  const number = bn(order.orderNumber ?? String(order.databaseId))
  const payment = order.paymentMethod
    ? gatewayTitle(order.paymentMethod, order.paymentMethodTitle)
    : order.paymentMethodTitle || '—'

  return (
    <section aria-labelledby='order-title' className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h2 id='order-title' className='text-2xl text-ink'>
          অর্ডার #{number}
        </h2>
        <Link
          href='/my-account/orders'
          className='-mr-3 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-link transition hover:bg-accent/10'
        >
          <svg className='icon size-4' aria-hidden='true'>
            <use href='#i-arrow-left' />
          </svg>
          সব অর্ডার
        </Link>
      </div>

      <div className='rounded-card border border-line bg-surface p-6 shadow-soft sm:p-8'>
        <dl className='grid grid-cols-2 gap-4 rounded-xl bg-surface-2 p-4 text-sm sm:grid-cols-4'>
          <div>
            <dt className='text-muted'>তারিখ</dt>
            <dd className='font-semibold text-ink'>{date.iso && <time dateTime={date.iso}>{date.label}</time>}</dd>
          </div>
          <div>
            <dt className='text-muted'>অবস্থা</dt>
            <dd>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
                {status.label}
              </span>
            </dd>
          </div>
          <div>
            <dt className='text-muted'>পেমেন্ট</dt>
            <dd className='font-semibold text-ink'>{payment}</dd>
          </div>
          <div>
            <dt className='text-muted'>সর্বমোট</dt>
            <dd className='font-semibold text-ink'>{formatPrice(order.total)}</dd>
          </div>
        </dl>

        <ul className='mt-4 divide-y divide-line'>
          {items.map((item, index) => {
            const product = item.product?.node
            return (
              <li key={index} className='flex items-center gap-3 py-3'>
                {product?.image?.sourceUrl ? (
                  <Image
                    src={product.image.sourceUrl}
                    alt=''
                    width={56}
                    height={56}
                    className='size-14 shrink-0 rounded-xl border border-line bg-surface-2 object-cover'
                  />
                ) : (
                  <span className='block size-14 shrink-0 rounded-xl border border-line bg-surface-2' />
                )}
                <span className='min-w-0 flex-1'>
                  <span className='block text-sm font-medium leading-snug text-ink'>
                    {product?.uri ? (
                      <Link href={product.uri} className='transition hover:text-link'>
                        {product.name}
                      </Link>
                    ) : (
                      product?.name ?? 'পণ্য'
                    )}{' '}
                    × {bn(item.quantity ?? 1)}
                  </span>
                  {item.variation?.node?.name && (
                    <span className='block text-xs text-muted'>{item.variation.node.name}</span>
                  )}
                </span>
                <span className='text-sm font-semibold text-ink'>{formatPrice(item.subtotal)}</span>
              </li>
            )
          })}
        </ul>

        <dl className='mt-2 divide-y divide-line border-t border-line text-[0.95rem]'>
          <div className='flex items-start justify-between gap-4 py-2.5'>
            <dt className='text-ink-2'>সাবটোটাল</dt>
            <dd className='font-semibold text-ink'>{formatPrice(order.subtotal)}</dd>
          </div>
          {positive(order.rawDiscount) && (
            <div className='flex items-start justify-between gap-4 py-2.5 text-success'>
              <dt>কুপন ছাড়</dt>
              <dd className='font-semibold'>− {formatPrice(order.discountTotal)}</dd>
            </div>
          )}
          <div className='flex items-start justify-between gap-4 py-2.5'>
            <dt className='text-ink-2'>ডেলিভারি চার্জ</dt>
            <dd className='font-semibold text-ink'>
              {positive(order.rawShipping) ? formatPrice(order.shippingTotal) : 'ফ্রি'}
            </dd>
          </div>
          <div className='flex items-start justify-between gap-4 py-2.5 text-lg'>
            <dt className='font-semibold text-ink'>সর্বমোট</dt>
            <dd className='font-bold text-ink'>{formatPrice(order.total)}</dd>
          </div>
        </dl>

        {order.customerNote && (
          <p className='mt-4 rounded-xl bg-surface-2 px-4 py-3 text-sm text-ink-2'>
            <span className='font-semibold text-ink'>অর্ডার নোট:</span> {order.customerNote}
          </p>
        )}

        <div className='mt-6 grid gap-6 sm:grid-cols-2'>
          <AddressBlock title='বিলিং ঠিকানা' address={order.billing} showPhone />
          <AddressBlock title='ডেলিভারির ঠিকানা' address={order.shipping} />
        </div>
      </div>
    </section>
  )
}
