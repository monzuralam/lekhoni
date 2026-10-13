'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import {
  DETAILS_FIELD_ORDER,
  validateDetails,
  validateDetailsField,
  type DetailsErrors,
  type DetailsFields
} from './details'
import { BUTTON_PRIMARY, CARD, Field, FormMessage, INPUT } from './ui'
import { PasswordStrength } from '../auth/fields'
import { isWeakPassword } from '../auth/validation'

// The design's AccountDetails form with the optional password change and the
// PasswordStrength meter. Saves through /api/account/details.

type Profile = Pick<DetailsFields, 'name' | 'displayName' | 'phone' | 'email'>

const EMPTY_PASSWORDS = { current: '', password: '', confirm: '' }

function PasswordInput ({
  autoComplete,
  ...props
}: {
  id: string
  name: string
  value: string
  autoComplete: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
  onChange: (event: { target: { value: string } }) => void
}) {
  const [show, setShow] = useState(false)
  return (
    <div className='relative'>
      <input {...props} type={show ? 'text' : 'password'} autoComplete={autoComplete} className={`${INPUT} pr-12`} />
      <button
        type='button'
        aria-pressed={show}
        aria-label={show ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখান'}
        onClick={() => setShow(value => !value)}
        className='group/eye absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:text-link'
      >
        <svg className='icon size-4.5 group-aria-pressed/eye:hidden' aria-hidden='true'>
          <use href='#i-eye' />
        </svg>
        <svg className='icon hidden size-4.5 group-aria-pressed/eye:block' aria-hidden='true'>
          <use href='#i-eye-off' />
        </svg>
      </button>
    </div>
  )
}

export default function DetailsForm ({ initial }: { initial: Profile }) {
  const router = useRouter()
  const [values, setValues] = useState<DetailsFields>({ ...initial, ...EMPTY_PASSWORDS })
  const [errors, setErrors] = useState<DetailsErrors>({})
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [pending, setPending] = useState(false)

  function update (name: keyof DetailsFields, value: string) {
    const next = { ...values, [name]: value }
    setValues(next)
    if (errors[name] && !validateDetailsField(name, next)) {
      setErrors(current => ({ ...current, [name]: undefined }))
    }
  }

  function fieldProps (name: keyof DetailsFields) {
    const id = `acc-${name}`
    return {
      id,
      name,
      value: values[name],
      'aria-invalid': errors[name] ? true : undefined,
      'aria-describedby': errors[name] ? `${id}-error` : undefined,
      onChange: (event: { target: { value: string } }) => update(name, event.target.value)
    }
  }

  function focusFirst (found: DetailsErrors) {
    const first = DETAILS_FIELD_ORDER.find(name => found[name])
    if (first) document.getElementById(`acc-${first}`)?.focus()
  }

  async function submit (event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus(null)
    const found = validateDetails(values)
    setErrors(found)
    if (Object.keys(found).length) {
      focusFirst(found)
      return
    }

    setPending(true)
    try {
      const res = await fetch('/api/account/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        if (data.fieldErrors) {
          setErrors(data.fieldErrors)
          focusFirst(data.fieldErrors)
        }
        setStatus({ type: 'error', message: data.error || 'তথ্য সংরক্ষণ করা যায়নি, আবার চেষ্টা করুন।' })
      } else {
        setValues({ ...data.details, ...EMPTY_PASSWORDS })
        setStatus({
          type: 'success',
          message: data.passwordChanged ? 'তথ্য ও নতুন পাসওয়ার্ড সংরক্ষণ করা হয়েছে।' : 'তথ্য সংরক্ষণ করা হয়েছে।'
        })
        // The sidebar shows the name and email
        router.refresh()
      }
    } catch {
      setStatus({ type: 'error', message: 'সংযোগে সমস্যা হয়েছে, আবার চেষ্টা করুন।' })
    }
    setPending(false)
  }

  return (
    <form noValidate onSubmit={submit} className={`${CARD} space-y-8 p-6 sm:p-8`}>
      <div className='grid gap-5 sm:grid-cols-2'>
        <Field id='acc-name' label='পুরো নাম' error={errors.name}>
          <input {...fieldProps('name')} type='text' required minLength={3} autoComplete='name' className={INPUT} />
        </Field>
        <Field id='acc-displayName' label='প্রদর্শিত নাম' error={errors.displayName}>
          <input {...fieldProps('displayName')} type='text' autoComplete='nickname' className={INPUT} />
          <p className='mt-1.5 text-xs text-muted'>রিভিউ ও মন্তব্যে এই নাম দেখা যাবে। ফাঁকা রাখলে পুরো নাম দেখাবে।</p>
        </Field>
        <Field id='acc-phone' label='মোবাইল নম্বর' error={errors.phone}>
          <input
            {...fieldProps('phone')}
            type='tel'
            required
            autoComplete='tel'
            inputMode='tel'
            placeholder='01XXXXXXXXX'
            className={INPUT}
          />
        </Field>
        <Field id='acc-email' label='ইমেইল' error={errors.email}>
          <input {...fieldProps('email')} type='email' required autoComplete='email' className={INPUT} />
        </Field>
      </div>

      <fieldset className='space-y-5 border-t border-line pt-6'>
        <legend className='float-left mb-1 w-full font-serif text-lg font-semibold text-ink'>পাসওয়ার্ড পরিবর্তন</legend>
        <p className='clear-both text-sm text-muted'>পাসওয়ার্ড বদলাতে না চাইলে নিচের ঘরগুলো ফাঁকা রাখুন।</p>
        <Field id='acc-current' label='বর্তমান পাসওয়ার্ড' error={errors.current}>
          <PasswordInput {...fieldProps('current')} autoComplete='current-password' />
        </Field>
        <Field id='acc-password' label='নতুন পাসওয়ার্ড' error={errors.password}>
          <PasswordInput {...fieldProps('password')} autoComplete='new-password' />
        </Field>
        <PasswordStrength id='acc-password-strength' value={values.password} />
        <Field id='acc-confirm' label='নতুন পাসওয়ার্ড আবার লিখুন' error={errors.confirm}>
          <PasswordInput {...fieldProps('confirm')} autoComplete='new-password' />
        </Field>
      </fieldset>

      {status && <FormMessage type={status.type}>{status.message}</FormMessage>}
      {/* Disabled while the new password is weak (the meter says why) */}
      <button
        type='submit'
        disabled={pending || isWeakPassword(values.password)}
        aria-describedby={isWeakPassword(values.password) ? 'acc-password-strength' : undefined}
        aria-busy={pending || undefined}
        className={BUTTON_PRIMARY}
      >
        {pending ? 'সংরক্ষণ হচ্ছে…' : 'পরিবর্তন সংরক্ষণ করুন'}
      </button>
    </form>
  )
}
