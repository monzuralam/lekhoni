import { revalidateTag } from 'next/cache'
import { authQuery, plainMessage } from '@/lib/auth'

// POST /api/blog/comments { postId, parent?, content, name, email, website? }
//   -> { ok, approved } | { error }
// Runs WPGraphQL's createComment. A signed-in customer's token is passed along
// (authQuery), so WordPress attributes the comment to their account. Guests
// can comment, but WordPress holds a new commenter's comment for moderation;
// then `comment` comes back null and the form says it awaits approval.
// `website` is a honeypot.

const MESSAGES = {
  invalid: 'মন্তব্য, নাম ও সঠিক ইমেইল লিখুন।',
  duplicate: 'এই মন্তব্যটি আপনি আগেই পাঠিয়েছেন।',
  flood: 'খুব দ্রুত মন্তব্য পাঠাচ্ছেন। একটু পরে আবার চেষ্টা করুন।',
  closed: 'এই লেখায় মন্তব্য বন্ধ আছে।',
  server: 'মন্তব্য পাঠানো যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।'
}

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

function mapError (message: string) {
  const plain = plainMessage(message).toLowerCase()
  if (plain.includes('duplicate')) return { error: MESSAGES.duplicate, status: 409 }
  if (plain.includes('too quickly')) return { error: MESSAGES.flood, status: 429 }
  if (plain.includes('closed')) return { error: MESSAGES.closed, status: 403 }
  if (plain.includes('invalid') || plain.includes('must include')) return { error: MESSAGES.invalid, status: 422 }
  return { error: MESSAGES.server, status: 502 }
}

export async function POST (request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') return Response.json({ error: MESSAGES.invalid }, { status: 400 })

  // Bots that fill the hidden field get a fake "awaiting moderation" and nothing is saved
  if (text(body.website)) return Response.json({ ok: true, approved: false })

  const postId = Number(body.postId)
  const parent = Number(body.parent) || 0
  const content = text(body.content)
  const author = text(body.name)
  const authorEmail = text(body.email)
  if (
    !Number.isInteger(postId) || postId <= 0 ||
    content.length < 10 || content.length > 5000 ||
    !author || author.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail)
  ) {
    return Response.json({ error: MESSAGES.invalid }, { status: 422 })
  }

  try {
    const json = await authQuery<{ createComment: { success: boolean; comment: { status: string } | null } | null }>(
      `mutation CreateComment($input: CreateCommentInput!) {
        createComment(input: $input) { success comment { status } }
      }`,
      { input: { commentOn: postId, parent: parent || undefined, content, author, authorEmail } },
      { persist: true }
    )
    if (json.errors?.length) {
      const { error, status } = mapError(json.errors[0].message)
      return Response.json({ error }, { status })
    }
    if (!json.data?.createComment?.success) return Response.json({ error: MESSAGES.server }, { status: 502 })

    const approved = json.data.createComment.comment?.status === 'APPROVE'
    if (approved) revalidateTag(`comments:${postId}`, { expire: 0 })
    return Response.json({ ok: true, approved })
  } catch {
    return Response.json({ error: MESSAGES.server }, { status: 502 })
  }
}
