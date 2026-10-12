'use client'

import Link from 'next/link'
import { useState } from 'react'
import { bn } from '@/lib/bn'
import { orderDate, orderStatus, type OrderRow } from './orders'

// The design's AccountOrders table (a card list on phones). The first page is
// server-rendered; "আরো অর্ডার দেখুন" fetches the next page by cursor from
// /api/account/orders.

const CELL =
  'px-4 py-3.5 max-sm:flex max-sm:items-center max-sm:justify-between max-sm:gap-4 max-sm:px-0 max-sm:py-1.5 max-sm:before:text-sm max-sm:before:font-medium max-sm:before:text-muted max-sm:before:content-[attr(data-label)]'

type OrdersTableProps = {
  initial: OrderRow[]
  hasNextPage: boolean
  endCursor: string | null
}

export default function OrdersTable ({ initial, hasNextPage, endCursor }: OrdersTableProps) {
  const [orders, setOrders] = useState(initial)
  const [cursor, setCursor] = useState(hasNextPage ? endCursor : null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function loadMore () {
    if (!cursor) return
    setPending(true)
    setError('')
    try {
      const res = await fetch(`/api/account/orders?after=${encodeURIComponent(cursor)}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error)
      const next: OrderRow[] = data.orders
      setOrders(list => [...list, ...next.filter(order => !list.some(row => row.id === order.id))])
      setCursor(data.hasNextPage ? data.endCursor : null)
    } catch (err) {
      setError((err instanceof Error && err.message) || 'অর্ডারগুলো আনা যায়নি, আবার চেষ্টা করুন।')
    }
    setPending(false)
  }

  return (
    <>
      <div className='sm:overflow-hidden sm:rounded-card sm:border sm:border-line sm:bg-surface sm:shadow-soft'>
        <table className='w-full text-[0.95rem] text-ink-2 max-sm:block'>
          <caption className='sr-only'>সাম্প্রতিক অর্ডারের তালিকা</caption>
          <thead className='bg-surface-2 text-left text-sm text-ink max-sm:sr-only'>
            <tr>
              <th scope='col' className='px-4 py-3 font-semibold'>অর্ডার নম্বর</th>
              <th scope='col' className='px-4 py-3 font-semibold'>তারিখ</th>
              <th scope='col' className='px-4 py-3 font-semibold'>অবস্থা</th>
              <th scope='col' className='px-4 py-3 font-semibold'>মোট</th>
              <th scope='col' className='px-4 py-3'>
                <span className='sr-only'>কার্যক্রম</span>
              </th>
            </tr>
          </thead>
          <tbody className='max-sm:block'>
            {orders.map(order => {
              const status = orderStatus(order.status)
              const date = orderDate(order.date)
              return (
                <tr
                  key={order.id}
                  className='border-t border-line max-sm:mb-3 max-sm:block max-sm:rounded-card max-sm:border max-sm:bg-surface max-sm:p-4'
                >
                  <th scope='row' data-label='অর্ডার নম্বর' className={`${CELL} text-left font-semibold text-ink`}>
                    #{bn(order.number)}
                  </th>
                  <td data-label='তারিখ' className={CELL}>
                    {date.iso && <time dateTime={date.iso}>{date.label}</time>}
                  </td>
                  <td data-label='অবস্থা' className={CELL}>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td data-label='মোট' className={CELL}>
                    <span>
                      <strong className='text-ink'>{order.total}</strong>{' '}
                      <span className='text-muted'>({bn(order.items)}টি পণ্য)</span>
                    </span>
                  </td>
                  <td className={`${CELL} max-sm:before:hidden sm:text-right`}>
                    <Link
                      href={`/my-account/orders/${order.id}`}
                      aria-label={`অর্ডার #${bn(order.number)} দেখুন`}
                      className='inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-link active:scale-95 max-sm:w-full'
                    >
                      দেখুন
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {error && (
        <p role='alert' className='mt-4 text-center text-sm font-medium text-danger'>
          {error}
        </p>
      )}
      {cursor && (
        <div className='mt-6 flex justify-center'>
          <button
            type='button'
            onClick={loadMore}
            disabled={pending}
            aria-busy={pending || undefined}
            className='inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-7 py-3 text-base font-semibold text-ink transition hover:border-accent hover:text-link active:scale-95 disabled:cursor-wait disabled:opacity-70'
          >
            {pending ? 'লোড হচ্ছে…' : 'আরো অর্ডার দেখুন'}
          </button>
        </div>
      )}
    </>
  )
}
