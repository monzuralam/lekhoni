import { bn } from '@/lib/bn'
import CommentForm, { ReplyButton } from './CommentForm'
import { getComments, type CommentData } from './data'
import { formatDate, isoDay } from './format'

// COMPONENT: Comments (design/single.html #comments): approved comments,
// threaded by parent, then the CommentForm. Replies stop at WordPress's
// default thread depth of 5.

const MAX_DEPTH = 5

type Node = CommentData & { replies: Node[] }

function buildTree (comments: CommentData[]) {
  const byId = new Map<number, Node>(comments.map(comment => [comment.id, { ...comment, replies: [] }]))
  const roots: Node[] = []
  for (const node of byId.values()) {
    const parent = node.parentId ? byId.get(node.parentId) : undefined
    if (parent) parent.replies.push(node)
    else roots.push(node)
  }
  return roots
}

function CommentItem ({ node, depth, authorId, open }: { node: Node; depth: number; authorId: number | null; open: boolean }) {
  const isAuthor = authorId != null && node.author.userId === authorId
  return (
    <li id={`comment-${node.id}`}>
      <article className='flex gap-4'>
        {node.author.avatar ? (
          // Gravatar URL (not in next.config images)
          // eslint-disable-next-line @next/next/no-img-element
          <img src={node.author.avatar} alt='' width={44} height={44} loading='lazy' className='size-11 shrink-0 rounded-full' />
        ) : (
          <span aria-hidden='true' className='grid size-11 shrink-0 place-items-center rounded-full bg-surface-2 font-serif text-lg font-semibold text-ink-2'>
            {node.author.name.charAt(0)}
          </span>
        )}
        <div className={`min-w-0 flex-1 rounded-card border p-5 ${isAuthor ? 'border-accent/40 bg-accent/5' : 'border-line bg-surface'}`}>
          <p className='flex flex-wrap items-center gap-x-3 gap-y-1'>
            <strong className='font-semibold text-ink'>{node.author.name}</strong>
            {isAuthor && <span className='rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-ink'>লেখক</span>}
            <time dateTime={isoDay(node.dateGmt)} className='text-sm text-muted'>
              {formatDate(node.dateGmt)}
            </time>
          </p>
          {/* Comment HTML is filtered by WordPress (kses) before it's stored */}
          <div
            className='mt-2 space-y-2 text-[0.95rem] leading-relaxed text-ink-2 [&_a]:text-link [&_a]:underline'
            dangerouslySetInnerHTML={{ __html: node.content }}
          />
          {open && depth < MAX_DEPTH && <ReplyButton id={node.id} name={node.author.name} />}
        </div>
      </article>
      {node.replies.length > 0 && (
        <ol className='mt-6 space-y-6 border-l-2 border-line pl-5 sm:ml-14'>
          {node.replies.map(reply => (
            <CommentItem key={reply.id} node={reply} depth={depth + 1} authorId={authorId} open={open} />
          ))}
        </ol>
      )}
    </li>
  )
}

export default async function Comments ({ postId, authorId, open }: { postId: number; authorId: number | null; open: boolean }) {
  const comments = await getComments(postId)
  const tree = buildTree(comments)

  return (
    <section id='comments' aria-labelledby='comments-title' className='mt-14 group-data-reading/body:hidden print:hidden'>
      <h2 id='comments-title' className='text-2xl text-ink'>
        {comments.length ? `${bn(comments.length)}টি মন্তব্য` : 'মন্তব্য'}
      </h2>
      {tree.length ? (
        <ol className='mt-6 space-y-6'>
          {tree.map(node => (
            <CommentItem key={node.id} node={node} depth={1} authorId={authorId} open={open} />
          ))}
        </ol>
      ) : (
        <p className='mt-3 text-ink-2'>{open ? 'এখনো কেউ মন্তব্য করেননি। প্রথম মন্তব্যটি আপনার হোক।' : 'এখনো কোনো মন্তব্য নেই।'}</p>
      )}
      {open ? (
        <CommentForm postId={postId} />
      ) : (
        <p className='mt-10 rounded-card border border-dashed border-line p-6 text-center text-ink-2'>এই লেখায় মন্তব্য বন্ধ আছে।</p>
      )}
    </section>
  )
}
