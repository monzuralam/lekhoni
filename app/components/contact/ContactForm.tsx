'use client'

import { useState, type FormEvent } from 'react'
import {
  FormError,
  INPUT_CLASS,
  SuccessPanel,
  TextField,
  focusFirstError,
  postJson
} from '../auth/fields'

// Port of the ContactForm in design/contact.html. Sends to /api/contact,
// which stores the message in wp-admin ("Contact Messages") and emails it.

type ContactFormProps = {
  subjects: string[]
  successMessage: string
}

type Errors = Partial<Record<'contact-name' | 'contact-email' | 'contact-subject' | 'contact-message', string>>

const ORDER = ['contact-name', 'contact-email', 'contact-subject', 'contact-message']

export default function ContactForm ({ subjects, successMessage }: ContactFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState('')
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)

  const validate = () => {
    const next: Errors = {}
    if (name.trim().length < 2) next['contact-name'] = 'আপনার নাম লিখুন।'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next['contact-email'] = 'সঠিক ইমেইল ঠিকানা লিখুন।'
    if (subjects.length && !subject) next['contact-subject'] = 'একটি বিষয় বেছে নিন।'
    if (message.trim().length < 20) next['contact-message'] = 'বার্তায় কমপক্ষে ২০ অক্ষর লিখুন।'
    return next
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError('')
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length) {
      focusFirstError(ORDER, found)
      return
    }

    setPending(true)
    const result = await postJson<{ ok: true }>('/api/contact', { name, email, subject, message, website })
    setPending(false)

    if ('error' in result) {
      // The server applies the same rules, so this is usually a throttle or outage message
      setFormError(result.error)
      return
    }

    setSent(true)
    setName('')
    setEmail('')
    setSubject('')
    setMessage('')
  }

  if (sent) {
    return (
      <SuccessPanel title={successMessage}>
        <button
          type='button'
          onClick={() => setSent(false)}
          className='mt-3 text-sm font-semibold text-link hover:underline'
        >
          আরেকটি বার্তা পাঠান
        </button>
      </SuccessPanel>
    )
  }

  return (
    <form noValidate onSubmit={onSubmit} className='mt-6 grid gap-5 sm:grid-cols-2'>
      <TextField
        id='contact-name'
        label='আপনার নাম'
        type='text'
        autoComplete='name'
        required
        value={name}
        error={errors['contact-name']}
        onValue={setName}
      />
      <TextField
        id='contact-email'
        label='ইমেইল'
        type='email'
        autoComplete='email'
        required
        value={email}
        error={errors['contact-email']}
        onValue={setEmail}
      />
      {subjects.length > 0 && (
        <div className='sm:col-span-2'>
          <label htmlFor='contact-subject' className='mb-1.5 block text-sm font-medium text-ink'>
            বিষয়
          </label>
          <select
            id='contact-subject'
            name='subject'
            required
            value={subject}
            onChange={event => setSubject(event.target.value)}
            aria-invalid={errors['contact-subject'] ? true : undefined}
            aria-describedby={errors['contact-subject'] ? 'contact-subject-error' : undefined}
            className={INPUT_CLASS}
          >
            <option value=''>একটি বিষয় বেছে নিন</option>
            {subjects.map(option => (
              <option key={option}>{option}</option>
            ))}
          </select>
          {errors['contact-subject'] && (
            <p id='contact-subject-error' className='mt-1.5 text-sm font-medium text-danger'>
              {errors['contact-subject']}
            </p>
          )}
        </div>
      )}
      <div className='sm:col-span-2'>
        <label htmlFor='contact-message' className='mb-1.5 block text-sm font-medium text-ink'>
          বার্তা
        </label>
        <textarea
          id='contact-message'
          name='contact-message'
          rows={5}
          required
          minLength={20}
          value={message}
          onChange={event => setMessage(event.target.value)}
          aria-invalid={errors['contact-message'] ? true : undefined}
          aria-describedby={`contact-message-hint${errors['contact-message'] ? ' contact-message-error' : ''}`}
          className={INPUT_CLASS}
        />
        <p id='contact-message-hint' className='mt-1.5 text-xs text-muted'>
          কমপক্ষে ২০ অক্ষর লিখুন।
        </p>
        {errors['contact-message'] && (
          <p id='contact-message-error' className='mt-1.5 text-sm font-medium text-danger'>
            {errors['contact-message']}
          </p>
        )}
      </div>
      {/* Honeypot: hidden from people and screen readers; bots fill it in */}
      <div aria-hidden='true' className='absolute -left-[9999px] size-px overflow-hidden'>
        <label htmlFor='contact-website'>Website</label>
        <input
          id='contact-website'
          name='website'
          type='text'
          tabIndex={-1}
          autoComplete='off'
          value={website}
          onChange={event => setWebsite(event.target.value)}
        />
      </div>
      {formError && (
        <div className='sm:col-span-2'>
          <FormError message={formError} />
        </div>
      )}
      <div className='sm:col-span-2'>
        <button
          type='submit'
          disabled={pending}
          aria-busy={pending || undefined}
          className='inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-semibold text-accent-ink transition hover:brightness-110 active:scale-95 disabled:cursor-wait disabled:opacity-70'
        >
          {pending ? (
            <span
              aria-hidden='true'
              className='size-4 animate-spin rounded-full border-2 border-current border-t-transparent'
            />
          ) : (
            <svg className='icon size-4.5' aria-hidden='true'>
              <use href='#i-mail' />
            </svg>
          )}
          {pending ? 'পাঠানো হচ্ছে…' : 'বার্তা পাঠান'}
        </button>
      </div>
    </form>
  )
}
