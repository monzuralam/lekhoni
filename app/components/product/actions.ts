'use server'

import { wpMutation } from '@/lib/wp'

// WooGraphQL writeReview. Guests may post as long as WordPress does not
// require registration for comments (Settings > Discussion). New reviews
// usually wait for moderation, so they are not shown straight away.

export type ReviewState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  // Server-side field errors, keyed by input name
  errors?: Record<string, string>
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function submitReview (_prev: ReviewState, form: FormData): Promise<ReviewState> {
  const productId = Number(form.get('productId'))
  const rating = Number(form.get('rating'))
  const content = String(form.get('content') ?? '').trim()
  const author = String(form.get('author') ?? '').trim()
  const authorEmail = String(form.get('authorEmail') ?? '').trim()

  const errors: Record<string, string> = {}
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.rating = 'একটি অপশন বেছে নিন।'
  if (content.length < 10) errors.content = 'কমপক্ষে ১০টি অক্ষর লিখুন।'
  if (!author) errors.author = 'এই ঘরটি পূরণ করা আবশ্যক।'
  if (!EMAIL_PATTERN.test(authorEmail)) errors.authorEmail = 'সঠিক ইমেইল ঠিকানা লিখুন।'
  if (!Number.isInteger(productId) || productId <= 0 || Object.keys(errors).length) {
    return { status: 'error', errors, message: 'ফর্মের ভুলগুলো ঠিক করে আবার জমা দিন।' }
  }

  try {
    await wpMutation(
      `mutation WriteReview($input: WriteReviewInput!) {
        writeReview(input: $input) {
          rating
        }
      }`,
      { input: { commentOn: productId, rating, content, author, authorEmail } }
    )
    return { status: 'success', message: 'রিভিউ জমা হয়েছে। যাচাইয়ের পর প্রকাশ করা হবে।' }
  } catch (error) {
    const text = error instanceof Error ? error.message : ''
    let message = 'রিভিউ জমা দেওয়া যায়নি, একটু পরে আবার চেষ্টা করুন।'
    if (/logged in/i.test(text)) message = 'রিভিউ লিখতে আগে লগইন করুন।'
    else if (/duplicate/i.test(text)) message = 'আপনি এই রিভিউটি আগেই জমা দিয়েছেন।'
    else if (/too quickly/i.test(text)) message = 'খুব দ্রুত জমা দিচ্ছেন, একটু পরে আবার চেষ্টা করুন।'
    else if (/closed/i.test(text)) message = 'এই পণ্যে এখন রিভিউ দেওয়া যাচ্ছে না।'
    return { status: 'error', message }
  }
}
