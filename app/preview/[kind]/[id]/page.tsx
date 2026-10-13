import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Suspense } from 'react'
import { CartSpinner } from '../../../components/cart/CartPage'
import WordPressPage from '../../../components/layout/WordPressPage'
import SinglePost from '../../../components/blog/SinglePost'
import { getBlogSettings } from '../../../components/blog/data'
import { toSinglePost } from '../../../components/blog/single-post'
import PreviewBar from '../../../components/preview/PreviewBar'
import { PreviewExpired } from '../../../components/preview/PreviewExpired'
import { PREVIEW_COOKIE, getPreview, isPreviewToken } from '@/lib/preview'

// /preview/post/123 and /preview/page/45: an unpublished post or page (or
// unsaved changes) for the editor who clicked "Preview" in WordPress. Read
// fresh on every request with the preview session from the lk-preview cookie
// (see lib/preview.ts); anyone else gets the "link expired" card.

export const metadata: Metadata = {
  title: 'প্রিভিউ',
  robots: { index: false, follow: false }
}

export default function Page ({ params }: PageProps<'/preview/[kind]/[id]'>) {
  return (
    <Suspense fallback={<CartSpinner />}>
      <Preview params={params} />
    </Suspense>
  )
}

// Pages with their own layout show their editor content only
const TEMPLATE_NOTE: Record<string, string> = {
  'templates/template-home.php': 'হোম শপ টেমপ্লেটের সেকশনগুলো প্রিভিউতে দেখা যায় না, শুধু লেখা দেখানো হচ্ছে।',
  'templates/template-about.php': 'আমাদের সম্পর্কে টেমপ্লেটের সেকশনগুলো প্রিভিউতে দেখা যায় না, শুধু লেখা দেখানো হচ্ছে।',
  'templates/template-contact.php': 'যোগাযোগ টেমপ্লেটের সেকশনগুলো প্রিভিউতে দেখা যায় না, শুধু লেখা দেখানো হচ্ছে।'
}

async function Preview ({ params }: { params: PageProps<'/preview/[kind]/[id]'>['params'] }) {
  const { kind, id } = await params
  const session = (await cookies()).get(PREVIEW_COOKIE)?.value
  const postId = Number(id)
  const valid = isPreviewToken(session) && Number.isInteger(postId) && postId > 0 && (kind === 'post' || kind === 'page')
  const preview = valid ? await getPreview(session, postId) : null
  if (!preview || preview.kind !== kind) return <PreviewExpired />

  if (preview.kind === 'page') {
    return (
      <>
        <PreviewBar status={preview.status} link={preview.link} note={TEMPLATE_NOTE[preview.template]} />
        <WordPressPage page={{ ...preview, isFrontPage: false }} />
      </>
    )
  }

  const settings = await getBlogSettings()
  return (
    <>
      <PreviewBar status={preview.status} link={preview.link} />
      <SinglePost post={toSinglePost(preview)} settings={settings} preview />
    </>
  )
}
