'use client'

import { useId, useRef, useState, type FormEvent } from 'react'
import { bn } from '@/lib/bn'
import { DIVISIONS, findDistrict } from '../checkout/locations'
import {
  ADDRESS_FIELD_ORDER,
  validateAddress,
  validateAddressField,
  type AddressErrors,
  type AddressFields,
  type AddressType
} from './address'
import { BUTTON_GHOST, BUTTON_PRIMARY, CARD, Field, FormMessage, INPUT, optional } from './ui'

// The design's AccountAddresses: billing and shipping cards, each with an
// inline edit form (same fields and validation as checkout). Saves through
// /api/account/addresses.

const TITLES: Record<AddressType, string> = {
  billing: 'বিলিং ঠিকানা',
  shipping: 'ডেলিভারির ঠিকানা'
}

export default function AddressBook ({ billing, shipping }: { billing: AddressFields; shipping: AddressFields }) {
  return (
    <div className='grid items-start gap-6 md:grid-cols-2'>
      <AddressCard type='billing' initial={billing} />
      <AddressCard type='shipping' initial={shipping} />
    </div>
  )
}

function AddressCard ({ type, initial }: { type: AddressType; initial: AddressFields }) {
  const [saved, setSaved] = useState(initial)
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState('')
  const editRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()

  const district = findDistrict(saved.division, saved.district)
  const hasAddress = Boolean(saved.address || saved.name)

  return (
    <article aria-labelledby={titleId} className={`${CARD} p-6`}>
      <div className='flex items-center justify-between gap-3'>
        <h3 id={titleId} className='text-lg text-ink'>
          {TITLES[type]}
        </h3>
        {!editing && (
          <button
            ref={editRef}
            type='button'
            onClick={() => {
              setMessage('')
              setEditing(true)
            }}
            className={`${BUTTON_GHOST} -mr-3`}
          >
            {hasAddress ? 'সম্পাদনা' : 'যোগ করুন'}
          </button>
        )}
      </div>

      {editing ? (
        <AddressForm
          type={type}
          initial={saved}
          onCancel={() => {
            setEditing(false)
            requestAnimationFrame(() => editRef.current?.focus())
          }}
          onSaved={address => {
            setSaved(address)
            setEditing(false)
            setMessage('ঠিকানা সংরক্ষণ করা হয়েছে।')
            requestAnimationFrame(() => editRef.current?.focus())
          }}
        />
      ) : (
        <>
          {hasAddress ? (
            <address className='mt-3 text-[0.95rem] not-italic leading-relaxed text-ink-2'>
              {saved.name && <strong className='block text-ink'>{saved.name}</strong>}
              {saved.address}
              {(saved.thana || district) && (
                <>
                  <br />
                  {[saved.thana, district?.name, saved.division].filter(Boolean).join(', ')}
                </>
              )}
              {saved.phone && (
                <>
                  <br />
                  মোবাইল: {bn(saved.phone)}
                </>
              )}
              {type === 'billing' && saved.email && (
                <>
                  <br />
                  ইমেইল: {saved.email}
                </>
              )}
            </address>
          ) : (
            <p className='mt-3 text-[0.95rem] text-muted'>এখনো কোনো ঠিকানা যোগ করা হয়নি।</p>
          )}
          {message && (
            <div className='mt-4'>
              <FormMessage type='success'>{message}</FormMessage>
            </div>
          )}
        </>
      )}
    </article>
  )
}

function AddressForm ({
  type,
  initial,
  onCancel,
  onSaved
}: {
  type: AddressType
  initial: AddressFields
  onCancel: () => void
  onSaved: (address: AddressFields) => void
}) {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState<AddressErrors>({})
  const [formError, setFormError] = useState('')
  const [pending, setPending] = useState(false)
  const prefix = `${type}-`
  const districts = DIVISIONS.find(d => d.name === values.division)?.districts ?? []

  function update (name: keyof AddressFields, value: string) {
    const next = { ...values, [name]: value }
    if (name === 'division') next.district = ''
    setValues(next)
    // Like checkout: an invalid field clears its error as soon as it is fixed
    if (errors[name] && !validateAddressField(name, next, type)) {
      setErrors(current => ({ ...current, [name]: undefined }))
    }
  }

  function fieldProps (name: keyof AddressFields) {
    const id = prefix + name
    return {
      id,
      name,
      value: values[name],
      'aria-invalid': errors[name] ? true : undefined,
      'aria-describedby': errors[name] ? `${id}-error` : undefined,
      onChange: (event: { target: { value: string } }) => update(name, event.target.value)
    }
  }

  function focusFirst (found: AddressErrors) {
    const first = ADDRESS_FIELD_ORDER.find(name => found[name])
    if (first) document.getElementById(prefix + first)?.focus()
  }

  async function submit (event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    const found = validateAddress(values, type)
    setErrors(found)
    if (Object.keys(found).length) {
      focusFirst(found)
      return
    }

    setPending(true)
    try {
      const res = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...values })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.address) {
        if (data.fieldErrors) {
          setErrors(data.fieldErrors)
          focusFirst(data.fieldErrors)
        }
        setFormError(data.error || 'ঠিকানা সংরক্ষণ করা যায়নি, আবার চেষ্টা করুন।')
        setPending(false)
        return
      }
      onSaved(data.address)
    } catch {
      setFormError('সংযোগে সমস্যা হয়েছে, আবার চেষ্টা করুন।')
      setPending(false)
    }
  }

  const autoSection = type === 'billing' ? 'billing' : 'shipping'

  return (
    <form noValidate onSubmit={submit} className='mt-4 space-y-5'>
      <div className='grid gap-5'>
        <Field id={`${prefix}name`} label='নাম' error={errors.name}>
          <input {...fieldProps('name')} type='text' required autoComplete={`${autoSection} name`} className={INPUT} />
        </Field>
        <Field
          id={`${prefix}phone`}
          label={type === 'billing' ? 'মোবাইল নম্বর' : <>মোবাইল নম্বর {optional}</>}
          error={errors.phone}
        >
          <input
            {...fieldProps('phone')}
            type='tel'
            required={type === 'billing'}
            autoComplete={`${autoSection} tel`}
            inputMode='tel'
            placeholder='01XXXXXXXXX'
            className={INPUT}
          />
        </Field>
        {type === 'billing' && (
          <Field id={`${prefix}email`} label={<>ইমেইল {optional}</>} error={errors.email}>
            <input {...fieldProps('email')} type='email' autoComplete='billing email' className={INPUT} />
          </Field>
        )}
        <div className='grid gap-5 sm:grid-cols-2'>
          <Field id={`${prefix}division`} label='বিভাগ' error={errors.division}>
            <select {...fieldProps('division')} required autoComplete={`${autoSection} address-level1`} className={INPUT}>
              <option value=''>বিভাগ বেছে নিন</option>
              {DIVISIONS.map(division => (
                <option key={division.name}>{division.name}</option>
              ))}
            </select>
          </Field>
          <Field id={`${prefix}district`} label='জেলা' error={errors.district}>
            <select
              {...fieldProps('district')}
              required
              disabled={!districts.length}
              autoComplete={`${autoSection} address-level2`}
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
        </div>
        <Field id={`${prefix}thana`} label='থানা/এলাকা' error={errors.thana}>
          <input {...fieldProps('thana')} type='text' required autoComplete={`${autoSection} address-level3`} className={INPUT} />
        </Field>
        <Field id={`${prefix}address`} label='পূর্ণ ঠিকানা' error={errors.address}>
          <input
            {...fieldProps('address')}
            type='text'
            required
            minLength={10}
            autoComplete={`${autoSection} street-address`}
            placeholder='বাড়ি, সড়ক, ফ্ল্যাট নম্বর'
            className={INPUT}
          />
        </Field>
      </div>
      {formError && <FormMessage type='error'>{formError}</FormMessage>}
      <div className='flex flex-wrap items-center gap-3'>
        <button type='submit' disabled={pending} className={BUTTON_PRIMARY}>
          {pending ? 'সংরক্ষণ হচ্ছে…' : 'ঠিকানা সংরক্ষণ করুন'}
        </button>
        <button type='button' onClick={onCancel} disabled={pending} className={BUTTON_GHOST}>
          বাতিল
        </button>
      </div>
    </form>
  )
}
