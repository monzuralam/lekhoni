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

const link = (id: string, label: string, href: string): MenuItem => ({ id, label, href, external: false, target: null, children: [] })

// Shown until a menu is assigned to the location in WordPress (Appearance → Menus)
const FALLBACK_MENUS = {
  PRIMARY: [link('home', 'হোম', '/'), link('shop', 'শপ', '/shop')],
  FOOTER: [
    link('shop', 'শপ', '/shop'),
    link('account', 'আমার অ্যাকাউন্ট', '/my-account'),
    link('about', 'আমাদের সম্পর্কে', '/about'),
    link('contact', 'যোগাযোগ', '/contact')
  ]
}

export type MenuLocation = keyof typeof FALLBACK_MENUS

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

// The menu at a theme location ("Primary menu" or "Footer menu"). Tagged
// 'menus': WordPress calls /api/revalidate when a menu is saved.
export async function getMenu (location: MenuLocation): Promise<MenuItem[]> {
  const fallback = FALLBACK_MENUS[location]
  let nodes: RawMenuItem[] = []
  try {
    const data = await wpQuery(`
      query Menu($location: MenuLocationEnum) {
        menuItems(first: 100, where: { location: $location }) {
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
    `, { location }, { tags: ['menus'] })
    nodes = data?.menuItems?.nodes ?? []
  } catch {
    return fallback
  }
  if (!nodes.length) return fallback

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

export const getPrimaryMenu = () => getMenu('PRIMARY')
