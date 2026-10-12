'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { FormError, INPUT_CLASS, SuccessPanel, TextField, focusFirstError, postJson } from '../auth/fields'

// COMPONENT: CommentForm (design/single.html #respond). Posts to
// /api/blog/comments, which runs WPGraphQL's createComment. New guest comments
// usually wait for moderation, so the success message depends on the result.

const REPLY_EVENT = 'lk:comment-reply'

type ReplyTarget = { id: number; name: string } | null

// "উত্তর দিন" under a comment: points the form at that comment
export function ReplyButton ({ id, name }: { id: number; name: string }) {
  return (
    <a
      href='#respond'
      onClick={() => window.dispatchEvent(new CustomEvent<ReplyTarget>(REPLY_EVENT, { detail: { id, name } }))}
      className='mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-link hover:underline'
    >
      <svg className='icon size-4' aria-hidden='true'>
        <use href='#i-chat' />
      </svg>
      উত্তর দিন
    </a>
  )
}

type Errors = Partial<Record<'comment' | 'comment-name' | 'comment-email', string>>
const ORDER = ['comment', 'comment-name', 'comment-email']

export default function CommentForm ({ postId }: { postId: number }) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [replyTo, setReplyTo] = useState<ReplyTarget>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState('')
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState<'approved' | 'pending' | null>(null)
  const textarea = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const onReply = (event: Event) => {
      setReplyTo((event as CustomEvent<ReplyTarget>).detail)
      setSent(null)
      // Wait for the #respond jump, then put the cursor in the box
      requestAnimationFrame(() => textarea.current?.focus({ preventScroll: true }))
    }
    window.addEventListener(REPLY_EVENT, onReply)
    return () => window.removeEventListener(REPLY_EVENT, onReply)
  }, [])

  const validate = () => {
    const next: Errors = {}
    if (content.trim().length < 10) next.comment = 'মন্তব্যে কমপক্ষে ১০ অক্ষর লিখুন।'
    if (!name.trim()) next['comment-name'] = 'আপনার নাম লিখুন।'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next['comment-email'] = 'সঠিক ইমেইল ঠিকানা লিখুন।'
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
    const result = await postJson<{ ok: true; approved: boolean }>('/api/blog/comments', {
      postId,
      parent: replyTo?.id ?? 0,
      content,
      name,
      email,
      website
    })
    setPending(false)

    if ('error' in result) {
      setFormError(result.error)
      return
    }
    setSent(result.approved ? 'approved' : 'pending')
    setContent('')
    setReplyTo(null)
    // An approved comment is in the (revalidated) list now
    if (result.approved) router.refresh()
  }

  return (
    <section id='respond' aria-labelledby='respond-title' className='mt-10 rounded-card border border-line bg-surface p-6 shadow-soft sm:p-8'>
      <h2 id='respond-title' className='text-xl text-ink'>
        {replyTo ? `${replyTo.name}-কে উত্তর দিন` : 'আপনার মতামত লিখুন'}
      </h2>
      <p className='mt-1 text-sm text-muted'>
        আপনার ইমেইল ঠিকানা প্রকাশ করা হবে না।
        {replyTo && (
          <button type='button' onClick={() => setReplyTo(null)} className='ml-2 font-semibold text-link hover:underline'>
            উত্তর বাতিল করুন
          </button>
        )}
      </p>

      {sent && (
        <SuccessPanel
          title={sent === 'approved' ? 'আপনার মন্তব্য প্রকাশিত হয়েছে। ধন্যবাদ!' : 'মন্তব্য জমা হয়েছে। অনুমোদনের পর দেখা যাবে।'}
        >
          <button type='button' onClick={() => setSent(null)} className='mt-3 text-sm font-semibold text-link hover:underline'>
            আরেকটি মন্তব্য লিখুন
          </button>
        </SuccessPanel>
      )}

      <form noValidate onSubmit={onSubmit} hidden={Boolean(sent)} className='mt-5 grid gap-5 sm:grid-cols-2'>
        <div className='sm:col-span-2'>
          <label htmlFor='comment' className='mb-1.5 block text-sm font-medium text-ink'>
            মন্তব্য
          </label>
          <textarea
            ref={textarea}
            id='comment'
            name='comment'
            rows={5}
            required
            minLength={10}
            value={content}
            onChange={event => setContent(event.target.value)}
            aria-invalid={errors.comment ? true : undefined}
            aria-describedby={errors.comment ? 'comment-error' : undefined}
            className={INPUT_CLASS}
          />
          {errors.comment && (
            <p id='comment-error' className='mt-1.5 text-sm font-medium text-danger'>
              {errors.comment}
            </p>
          )}
        </div>
        <TextField
          id='comment-name'
          label='নাম'
          type='text'
          autoComplete='name'
          required
          value={name}
          error={errors['comment-name']}
          onValue={setName}
        />
        <TextField
          id='comment-email'
          label='ইমেইল'
          type='email'
          autoComplete='email'
          required
          value={email}
          error={errors['comment-email']}
          onValue={setEmail}
        />
        {/* Honeypot: hidden from people, bots fill it in */}
        <div aria-hidden='true' className='hidden'>
          <label htmlFor='comment-website'>ওয়েবসাইট</label>
          <input id='comment-website' name='website' tabIndex={-1} autoComplete='off' value={website} onChange={event => setWebsite(event.target.value)} />
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
            className='inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110 active:scale-95 disabled:cursor-wait disabled:opacity-70'
          >
            {pending && <span aria-hidden='true' className='size-4 animate-spin rounded-full border-2 border-current border-t-transparent' />}
            মন্তব্য পাঠান
          </button>
        </div>
      </form>
    </section>
  )
}
