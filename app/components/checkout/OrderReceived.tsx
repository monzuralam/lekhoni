import Image from 'next/image'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { bn } from '@/lib/bn'
import { ORDER_COOKIE, decodeOrder } from './order-cookie'
import BankAccounts from './BankAccounts'
import { getBankTransfer } from './gateways'

// Port of design/order-received.html. Guests can't query an order from
// WooGraphQL, so the summary comes from the cookie /api/checkout set right
// after the `checkout` mutation; the URL's order id + key must match it.

const MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর'
]

function formatDate (iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return `${bn(date.getDate())} ${MONTHS[date.getMonth()]}, ${bn(date.getFullYear())}`
}

const STEPS = [
  {
    icon: 'check',
    title: '১. অর্ডার নিশ্চিত',
    text: 'আমরা আপনার অর্ডার পেয়েছি। কিছুক্ষণের মধ্যে এসএমএসে নিশ্চিতকরণ বার্তা যাবে।'
  },
  { icon: 'gift', title: '২. প্যাকিং', text: 'পণ্যগুলো যত্ন করে মোড়ানো হবে, সাধারণত একই দিনে।' },
  {
    icon: 'truck',
    title: '৩. ডেলিভারি',
    text: 'কুরিয়ারে তুলে দেওয়ার পর ট্র্যাকিং নম্বর পাঠানো হবে। ডেলিভারির আগে ফোন করা হবে।'
  }
]

function Missing () {
  return (
    <section className='mx-auto max-w-lg rounded-card border border-dashed border-line px-6 py-14 text-center'>
      <h1 className='text-2xl text-ink'>কোনো অর্ডার পাওয়া যায়নি</h1>
      <p className='mt-2 text-ink-2'>
        মনে হচ্ছে আপনি এখনো অর্ডার করেননি, অথবা পাতাটির মেয়াদ শেষ হয়ে গেছে।
      </p>
      <Link
        href='/shop'
        className='mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-semibold text-accent-ink transition hover:brightness-110 active:scale-95'
      >
        শপে যান
      </Link>
    </section>
  )
}

export default async function OrderReceived ({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const store = await cookies()
  const order = decodeOrder(store.get(ORDER_COOKIE)?.value)

  if (!order || String(order.id) !== params.order || order.key !== params.key) return <Missing />

  // Bank transfer orders wait for the payment: show where to send it
  const bank = order.paymentMethod === 'bacs' ? await getBankTransfer().catch(() => null) : null

  return (
    <div>
      <header className='mx-auto max-w-2xl text-center'>
        <span className='mx-auto grid size-20 place-items-center rounded-full bg-success/15 text-success animate-pop'>
          <svg className='icon size-10' aria-hidden='true'>
            <use href='#i-check' />
          </svg>
        </span>
        <h1 className='mt-5 text-3xl text-ink sm:text-4xl'>ধন্যবাদ! আপনার অর্ডার গ্রহণ করা হয়েছে</h1>
        <p className='mt-3 text-lg text-ink-2'>
          অর্ডার নম্বর <strong className='text-link'>#{bn(order.number)}</strong>। এই নম্বরটি সংরক্ষণ করে রাখুন।
        </p>
      </header>

      {bank && (bank.accounts.length > 0 || bank.instructions) && (
        <section
          aria-labelledby='bank-transfer-title'
          className='mx-auto mt-10 max-w-5xl rounded-card border border-accent/40 bg-accent/5 p-6 sm:p-8'
        >
          <h2 id='bank-transfer-title' className='flex items-center gap-3 text-xl text-ink'>
            <span className='grid size-9 place-items-center rounded-full bg-accent text-accent-ink'>
              <svg className='icon size-4.5' aria-hidden='true'>
                <use href='#i-lock' />
              </svg>
            </span>
            ব্যাংক ট্রান্সফারের তথ্য
          </h2>
          {bank.instructions && <p className='mt-3 whitespace-pre-line text-ink-2'>{bank.instructions}</p>}
          <p className='mt-3 text-ink-2'>
            টাকা পাঠানোর সময় রেফারেন্স হিসেবে অর্ডার নম্বর <strong className='text-ink'>{order.number}</strong> লিখুন।
            টাকা আমাদের অ্যাকাউন্টে জমা হলে অর্ডারটি পাঠানো হবে।
          </p>
          <BankAccounts accounts={bank.accounts} className='mt-4 sm:grid-cols-2' />
        </section>
      )}

      <div className='mx-auto mt-10 grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]'>
        <section
          aria-labelledby='order-summary-title'
          className='rounded-card border border-line bg-surface p-6 shadow-soft sm:p-8'
        >
          <h2 id='order-summary-title' className='text-xl text-ink'>
            অর্ডারের বিবরণ
          </h2>
          <dl className='mt-4 grid grid-cols-2 gap-4 rounded-xl bg-surface-2 p-4 text-sm sm:grid-cols-3'>
            <div>
              <dt className='text-muted'>তারিখ</dt>
              <dd className='font-semibold text-ink'>{formatDate(order.date)}</dd>
            </div>
            <div>
              <dt className='text-muted'>পেমেন্ট</dt>
              <dd className='font-semibold text-ink'>{order.payment}</dd>
            </div>
            <div>
              <dt className='text-muted'>সর্বমোট</dt>
              <dd className='font-semibold text-ink'>{order.total}</dd>
            </div>
          </dl>
          <ul className='mt-4 divide-y divide-line'>
            {order.items.map((item, index) => (
              <li key={index} className='flex items-center gap-3 py-3'>
                {item.image ? (
                  <Image
                    src={item.image}
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
                    {item.name} × {bn(item.quantity)}
                  </span>
                  {item.variant && <span className='block text-xs text-muted'>{item.variant}</span>}
                </span>
                <span className='text-sm font-semibold text-ink'>{item.total}</span>
              </li>
            ))}
            {order.moreItems > 0 && (
              <li className='py-3 text-sm text-muted'>আরো {bn(order.moreItems)}টি পণ্য</li>
            )}
          </ul>
          <dl className='mt-2 divide-y divide-line border-t border-line text-[0.95rem]'>
            <div className='flex items-start justify-between gap-4 py-2.5'>
              <dt className='text-ink-2'>সাবটোটাল</dt>
              <dd className='font-semibold text-ink'>{order.subtotal}</dd>
            </div>
            {order.discount && (
              <div className='flex items-start justify-between gap-4 py-2.5 text-success'>
                <dt>কুপন ছাড়</dt>
                <dd className='font-semibold'>− {order.discount}</dd>
              </div>
            )}
            {(order.fees ?? []).map(fee => (
              <div key={fee.name} className={`flex items-start justify-between gap-4 py-2.5 ${fee.negative ? 'text-success' : ''}`}>
                <dt className={fee.negative ? '' : 'text-ink-2'}>{fee.name}</dt>
                <dd className='font-semibold'>{fee.negative ? '− ' : ''}{fee.amount}</dd>
              </div>
            ))}
            <div className='flex items-start justify-between gap-4 py-2.5'>
              <dt className='text-ink-2'>ডেলিভারি চার্জ</dt>
              <dd className='font-semibold text-ink'>{order.shipping ?? 'ফ্রি'}</dd>
            </div>
            <div className='flex items-start justify-between gap-4 py-2.5 text-lg'>
              <dt className='font-semibold text-ink'>সর্বমোট</dt>
              <dd className='font-bold text-ink'>{order.total}</dd>
            </div>
          </dl>
          <h3 className='mt-6 text-lg text-ink'>ডেলিভারির ঠিকানা</h3>
          <address className='mt-2 text-[0.95rem] not-italic leading-relaxed text-ink-2'>
            <strong className='block text-ink'>{order.name}</strong>
            <span className='block'>{order.address}</span>
            <span className='inline-flex items-center gap-1.5'>
              <svg className='icon size-4' aria-hidden='true'>
                <use href='#i-phone' />
              </svg>
              <span>{bn(order.phone)}</span>
            </span>
          </address>
        </section>

        <aside className='space-y-6 self-start'>
          <section
            aria-labelledby='next-steps-title'
            className='rounded-card border border-line bg-surface p-6 shadow-soft'
          >
            <h2 id='next-steps-title' className='mb-5 text-xl text-ink'>
              এরপর কী হবে
            </h2>
            <ol>
              {STEPS.map(step => (
                <li key={step.icon} className='relative flex gap-4 pb-6 last:pb-0'>
                  <span className='grid size-10 shrink-0 place-items-center rounded-full bg-accent/10 text-link'>
                    <svg className='icon size-5' aria-hidden='true'>
                      <use href={`#i-${step.icon}`} />
                    </svg>
                  </span>
                  <div>
                    <h3 className='font-sans text-base font-semibold text-ink'>{step.title}</h3>
                    <p className='text-sm leading-relaxed text-ink-2'>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
          <div className='grid gap-3'>
            <Link
              href='/my-account/orders'
              className='inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-semibold text-accent-ink transition hover:brightness-110 active:scale-95'
            >
              আমার অর্ডার দেখুন
            </Link>
            <Link
              href='/shop'
              className='inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-7 py-3 text-base font-semibold text-ink transition hover:border-accent hover:text-link active:scale-95'
            >
              আরো কেনাকাটা করুন
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
