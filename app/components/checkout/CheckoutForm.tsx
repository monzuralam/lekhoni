'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { bn } from '@/lib/bn'
import { useCart } from '../cart/CartProvider'
import { CartSpinner } from '../cart/CartPage'
import CartTotals from '../cart/CartTotals'
import CouponForm from '../cart/CouponForm'
import ShippingOptions from '../cart/ShippingOptions'
import type { AddressFields } from '../account/address'
import BankAccounts from './BankAccounts'
import type { Gateway } from './gateways'
import { DIVISIONS } from './locations'
import {
  FIELD_ORDER,
  validateCheckout,
  validateField,
  type CheckoutFields,
  type FieldErrors
} from './validation'

// Port of design/checkout.html (CheckoutForm + OrderSummary). Submits to
// /api/checkout, which runs the WooGraphQL `checkout` mutation with the
// session cookie.

const INPUT =
  'w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-base text-ink transition placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20'
const CARD = 'rounded-card border border-line bg-surface p-6 shadow-soft sm:p-8'
const LEGEND =
  'float-left mb-5 flex w-full items-center gap-3 font-serif text-xl font-semibold text-ink'

function Step ({ n }: { n: number }) {
  return (
    <span className='grid size-8 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-accent-ink'>
      {bn(n)}
    </span>
  )
}

function Field ({
  id,
  label,
  error,
  className = '',
  children
}: {
  id: string
  label: ReactNode
  error?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className='mb-1.5 block text-sm font-medium text-ink'>
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className='mt-1.5 text-sm font-medium text-danger'>
          {error}
        </p>
      )}
    </div>
  )
}

const optional = <span className='font-normal text-muted'>(ঐচ্ছিক)</span>

type CheckoutFormProps = {
  gateways: Gateway[]
  // A signed-in customer's saved name and address (see savedAddressFields)
  saved?: AddressFields | null
}

export default function CheckoutForm ({ gateways, saved = null }: CheckoutFormProps) {
  const { cart, setAddress, refresh } = useCart()
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [values, setValues] = useState<CheckoutFields>({
    name: '',
    phone: '',
    email: '',
    division: '',
    district: '',
    thana: '',
    address: '',
    ...saved,
    note: '',
    paymentMethod: gateways[0]?.id ?? ''
  })
  const savedDistrict = saved?.district

  // Delivery rates for the saved district, as if it had just been picked
  useEffect(() => {
    if (savedDistrict) setAddress({ country: 'BD', state: savedDistrict })
  }, [savedDistrict, setAddress])
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [pending, setPending] = useState(false)
  const [placed, setPlaced] = useState(false)

  if (placed || !cart) return <CartSpinner />

  if (!cart.items.length) {
    return (
      <section className='mx-auto max-w-lg rounded-card border border-dashed border-line px-6 py-14 text-center'>
        <span className='mx-auto grid size-20 place-items-center rounded-full bg-surface-2 text-muted'>
          <svg className='icon size-9' aria-hidden='true'>
            <use href='#i-cart' />
          </svg>
        </span>
        <h2 className='mt-5 text-2xl text-ink'>চেকআউট করার মতো কিছু নেই</h2>
        <p className='mt-2 text-ink-2'>আপনার কার্ট খালি। আগে শপ থেকে পণ্য যোগ করুন।</p>
        <Link
          href='/shop'
          className='mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-semibold text-accent-ink transition hover:brightness-110 active:scale-95'
        >
          শপে যান
          <svg className='icon size-4' aria-hidden='true'>
            <use href='#i-arrow-right' />
          </svg>
        </Link>
      </section>
    )
  }

  const districts = DIVISIONS.find(d => d.name === values.division)?.districts ?? []

  function update (name: keyof CheckoutFields, value: string) {
    const next = { ...values, [name]: value }
    if (name === 'division') next.district = ''
    setValues(next)
    // Like the design: an invalid field clears its error as soon as it is edited
    if (errors[name] && !validateField(name, next)) {
      setErrors(current => ({ ...current, [name]: undefined }))
    }
    // Shipping zones match on country/state: refresh the rates for the district
    if (name === 'district' && value) setAddress({ country: 'BD', state: value })
  }

  function fieldProps (name: keyof CheckoutFields) {
    return {
      id: name,
      name,
      value: values[name],
      'aria-invalid': errors[name] ? true : undefined,
      'aria-describedby': errors[name] ? `${name}-error` : undefined,
      onChange: (event: { target: { value: string } }) => update(name, event.target.value)
    }
  }

  function focusFirst (found: FieldErrors) {
    const first = FIELD_ORDER.find(name => found[name])
    if (!first) return
    const target =
      first === 'paymentMethod'
        ? formRef.current?.querySelector<HTMLElement>('input[name="paymentMethod"]')
        : document.getElementById(first)
    target?.focus()
  }

  async function submit (event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    const found = validateCheckout(values)
    setErrors(found)
    if (Object.keys(found).length) {
      focusFirst(found)
      return
    }

    setPending(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.redirect) {
        if (data.fieldErrors) {
          setErrors(data.fieldErrors)
          focusFirst(data.fieldErrors)
        }
        setFormError(data.error || 'অর্ডার সম্পন্ন করা যায়নি, আবার চেষ্টা করুন।')
        setPending(false)
        return
      }
      setPlaced(true)
      router.push(data.redirect)
      // WooCommerce emptied the cart: update the header count and drawer
      refresh()
    } catch {
      setFormError('সংযোগে সমস্যা হয়েছে, আবার চেষ্টা করুন।')
      setPending(false)
    }
  }

  return (
    <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]'>
      <form id='checkout-form' ref={formRef} noValidate onSubmit={submit} className='space-y-6'>
        <fieldset className={CARD}>
          <legend className={LEGEND}>
            <Step n={1} />
            যোগাযোগের তথ্য
          </legend>
          {saved && (
            <p className='clear-both mb-5 flex items-start gap-2.5 rounded-xl bg-accent/10 px-4 py-3 text-sm text-ink-2'>
              <svg className='icon mt-0.5 size-4 shrink-0 text-link' aria-hidden='true'>
                <use href='#i-check' />
              </svg>
              <span>
                আপনার অ্যাকাউন্টে সংরক্ষিত তথ্য বসানো হয়েছে। দরকার হলে বদলে নিন; এই অর্ডারের ঠিকানাই পরের বারের জন্য
                সংরক্ষিত থাকবে।
              </span>
            </p>
          )}
          <div className='clear-both grid gap-5 sm:grid-cols-2'>
            <Field id='name' label='নাম' error={errors.name} className='sm:col-span-2'>
              <input {...fieldProps('name')} type='text' required autoComplete='name' className={INPUT} />
            </Field>
            <Field id='phone' label='মোবাইল নম্বর' error={errors.phone}>
              <input
                {...fieldProps('phone')}
                type='tel'
                required
                autoComplete='tel'
                inputMode='tel'
                placeholder='01XXXXXXXXX'
                className={INPUT}
              />
              <p className='mt-1.5 text-xs text-muted'>ডেলিভারির আগে এই নম্বরে ফোন করা হবে।</p>
            </Field>
            <Field id='email' label={<>ইমেইল {optional}</>} error={errors.email}>
              <input {...fieldProps('email')} type='email' autoComplete='email' className={INPUT} />
            </Field>
          </div>
        </fieldset>

        <fieldset className={CARD}>
          <legend className={LEGEND}>
            <Step n={2} />
            ডেলিভারির ঠিকানা
          </legend>
          <div className='clear-both grid gap-5 sm:grid-cols-2'>
            <Field id='division' label='বিভাগ' error={errors.division}>
              <select {...fieldProps('division')} required autoComplete='address-level1' className={INPUT}>
                <option value=''>বিভাগ বেছে নিন</option>
                {DIVISIONS.map(division => (
                  <option key={division.name}>{division.name}</option>
                ))}
              </select>
            </Field>
            <Field id='district' label='জেলা' error={errors.district}>
              <select
                {...fieldProps('district')}
                required
                disabled={!districts.length}
                autoComplete='address-level2'
                className={`${INPUT} disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <option value=''>{districts.length ? 'জেলা বেছে নিন' : 'আগে বিভাগ বেছে নিন'}</option>
                {districts.map(district => (
                  <option key={district.code} value={district.code}>
                    {district.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field id='thana' label='থানা/এলাকা' error={errors.thana} className='sm:col-span-2'>
              <input {...fieldProps('thana')} type='text' required autoComplete='address-level3' className={INPUT} />
            </Field>
            <Field id='address' label='পূর্ণ ঠিকানা' error={errors.address} className='sm:col-span-2'>
              <input
                {...fieldProps('address')}
                type='text'
                required
                minLength={10}
                autoComplete='street-address'
                placeholder='বাড়ি, সড়ক, ফ্ল্যাট নম্বর'
                className={INPUT}
              />
            </Field>
            <Field id='note' label={<>অর্ডার নোট {optional}</>} className='sm:col-span-2'>
              <textarea
                {...fieldProps('note')}
                rows={3}
                placeholder='ডেলিভারি নিয়ে বিশেষ কোনো নির্দেশনা থাকলে লিখুন'
                className={INPUT}
              />
            </Field>
          </div>
        </fieldset>

        <div className={CARD}>
          <h2 className='mb-5 flex items-center gap-3 text-xl text-ink'>
            <Step n={3} />
            ডেলিভারি
          </h2>
          <ShippingOptions />
        </div>

        <fieldset className={CARD} aria-describedby={errors.paymentMethod ? 'paymentMethod-error' : undefined}>
          <legend className={LEGEND}>
            <Step n={4} />
            পেমেন্ট পদ্ধতি
          </legend>
          <div className='clear-both grid gap-2'>
            {gateways.length ? (
              gateways.map(gateway => (
                <label
                  key={gateway.id}
                  className='group/pay block cursor-pointer rounded-xl border border-line bg-surface px-4 py-3 transition hover:border-accent has-checked:border-accent has-checked:bg-accent/5'
                >
                  <span className='flex items-center gap-3'>
                    <input
                      type='radio'
                      name='paymentMethod'
                      value={gateway.id}
                      required
                      checked={values.paymentMethod === gateway.id}
                      onChange={() => update('paymentMethod', gateway.id)}
                      className='size-4 accent-accent'
                    />
                    <span className='font-medium text-ink'>{gateway.title}</span>
                  </span>
                  {gateway.description && (
                    <span className='mt-2 hidden pl-7 text-sm leading-relaxed text-ink-2 group-has-checked/pay:block'>
                      {gateway.description}
                    </span>
                  )}
                  {gateway.accounts && (
                    <BankAccounts accounts={gateway.accounts} className='mt-3 hidden pl-7 group-has-checked/pay:grid' />
                  )}
                </label>
              ))
            ) : (
              <p role='alert' className='rounded-xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm font-medium text-danger'>
                এই মুহূর্তে কোনো পেমেন্ট পদ্ধতি চালু নেই, তাই অর্ডার নেওয়া যাচ্ছে না। অনুগ্রহ করে পরে আবার চেষ্টা করুন।
              </p>
            )}
          </div>
          {errors.paymentMethod && (
            <p id='paymentMethod-error' className='mt-1.5 text-sm font-medium text-danger'>
              {errors.paymentMethod}
            </p>
          )}
        </fieldset>
      </form>

      <aside
        aria-labelledby='summary-title'
        className='space-y-5 self-start rounded-card border border-line bg-surface p-6 shadow-soft lg:sticky lg:top-32'
      >
        <h2 id='summary-title' className='text-xl text-ink'>
          আপনার অর্ডার
        </h2>
        <ul className='divide-y divide-line'>
          {cart.items.map(item => (
            <li key={item.key} className='flex items-center gap-3 py-3'>
              <span className='relative shrink-0'>
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=''
                    width={56}
                    height={56}
                    className='size-14 rounded-xl border border-line bg-surface-2 object-cover'
                  />
                ) : (
                  <span className='block size-14 rounded-xl border border-line bg-surface-2' />
                )}
                <span className='absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-ink text-[0.6875rem] font-bold text-page'>
                  {bn(item.quantity)}
                </span>
              </span>
              <span className='min-w-0 flex-1'>
                <span className='line-clamp-2 text-sm font-medium leading-snug text-ink'>{item.name}</span>
                {item.variant && <span className='block text-xs text-muted'>{item.variant}</span>}
              </span>
              <span className='text-sm font-semibold text-ink'>{item.subtotal}</span>
            </li>
          ))}
        </ul>
        <CouponForm />
        <CartTotals cart={cart} />
        {formError && (
          <p role='alert' className='rounded-xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm font-medium text-danger'>
            {formError}
          </p>
        )}
        <button
          type='submit'
          form='checkout-form'
          disabled={pending || !gateways.length}
          className='inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-semibold text-accent-ink transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60'
        >
          <svg className='icon size-4' aria-hidden='true'>
            <use href='#i-lock' />
          </svg>
          {pending ? 'অর্ডার হচ্ছে…' : 'অর্ডার করুন'}
        </button>
        <p className='text-center text-xs leading-relaxed text-muted'>
          অর্ডার করার মাধ্যমে আপনি আমাদের শর্তাবলি ও রিটার্ন নীতিতে সম্মতি দিচ্ছেন।
        </p>
        <Link
          href='/cart'
          className='inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-link transition hover:bg-accent/10'
        >
          <svg className='icon size-4' aria-hidden='true'>
            <use href='#i-arrow-left' />
          </svg>
          কার্টে ফিরে যান
        </Link>
      </aside>
    </div>
  )
}
