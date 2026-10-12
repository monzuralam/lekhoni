import { wpQuery } from '@/lib/wp'

export type MenuItem = {
  id: string
  label: string
  href: string | null // null: label only (custom link with "#" or no URL)
  external: boolean
  target: string | null
  children: MenuItem[]
}

type RawMenuItem = {
  id: string
  parentId: string | null
  label: string | null
  url: string | null
  path: string | null
  target: string | null
}

// Shown until a menu is assigned to the "Primary menu" location in WordPress
const FALLBACK_MENU: MenuItem[] = [
  { id: 'home', label: 'হোম', href: '/', external: false, target: null, children: [] },
  { id: 'shop', label: 'শপ', href: '/shop', external: false, target: null, children: [] }
]

// WordPress URLs point at the WP host; internal ones become front-end paths
function toHref (item: RawMenuItem, wpOrigin: string | null) {
  const url = item.url?.trim()
  if (!url || url === '#') return { href: null, external: false }
  try {
    const parsed = new URL(url, wpOrigin ?? undefined)
    if (wpOrigin && parsed.origin === wpOrigin) {
      // Drop WordPress's trailing slash to skip Next's redirect
      const path = parsed.pathname.replace(/\/+$/, '') || '/'
      return { href: `${path}${parsed.search}${parsed.hash}`, external: false }
    }
    return { href: parsed.href, external: /^https?:$/.test(parsed.protocol) }
  } catch {
    return { href: item.path || url, external: false }
  }
}

export async function getPrimaryMenu (): Promise<MenuItem[]> {
  let nodes: RawMenuItem[] = []
  try {
    const data = await wpQuery(`
      {
        menuItems(first: 100, where: { location: PRIMARY }) {
          nodes {
            id
            parentId
            label
            url
            path
            target
          }
        }
      }
    `)
    nodes = data?.menuItems?.nodes ?? []
  } catch {
    return FALLBACK_MENU
  }
  if (!nodes.length) return FALLBACK_MENU

  let wpOrigin: string | null = null
  try {
    wpOrigin = new URL(process.env.WP_GRAPHQL_URL ?? '').origin
  } catch {}

  // Flat list (already in menu order) -> tree via parentId
  const byId = new Map<string, MenuItem>()
  for (const node of nodes) {
    const { href, external } = toHref(node, wpOrigin)
    byId.set(node.id, {
      id: node.id,
      label: node.label ?? '',
      href,
      external,
      target: node.target || null,
      children: []
    })
  }
  const tree: MenuItem[] = []
  for (const node of nodes) {
    const item = byId.get(node.id)!
    const parent = node.parentId ? byId.get(node.parentId) : undefined
    if (parent) parent.children.push(item)
    else tree.push(item)
  }
  return tree
}
