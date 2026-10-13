// Builds the theme's one-click demo package from the design files:
//   wp-content/themes/lekhoni/demo/content.json  (all content, settings, refs)
//   wp-content/themes/lekhoni/demo/images/*      (rendered illustrations)
// The importer is wp-content/themes/lekhoni/inc/demo-import.php.
//
// Run from lekhoni/: node scripts/build-demo.mjs
// Edit the content in scripts/demo-content/*.mjs, then rebuild.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildImages } from './demo-images.mjs'
import { ATTRIBUTES, PRODUCTS, PRODUCT_CATEGORIES } from './demo-content/products.mjs'
import { AUTHORS, POSTS, POST_CATEGORIES, POST_TAGS } from './demo-content/posts.mjs'
import { HOME_FIELDS, MENUS, STORE, THEME_SETTINGS } from './demo-content/site.mjs'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const designDir = path.join(root, 'design')
const outDir = path.join(root, '..', 'wp-content', 'themes', 'lekhoni', 'demo')
const pagesFile = process.argv[2] // optional: JSON export of the About/Contact fields

// The article body of design/single.html, with its images as {{image-url:key}}
function singleArticle () {
  const html = fs.readFileSync(path.join(designDir, 'single.html'), 'utf8')
  const start = html.indexOf('>', html.indexOf('entry-content')) + 1
  let depth = 1
  let end = start
  const tags = /<(\/?)div\b[^>]*>/g
  tags.lastIndex = start
  for (let match; (match = tags.exec(html));) {
    depth += match[1] ? -1 : 1
    if (!depth) {
      end = match.index
      break
    }
  }
  return html
    .slice(start, end)
    .replace(/\n\s+/g, '\n')
    .replace(/ data-lightbox="post"/g, '')
    .replace(/assets\/img\/([a-z0-9-]+)\.svg/g, '{{image-url:$1}}')
    .replace(/<a href="#">([^<]*)<\/a>/g, '$1')
    .trim()
}

// About/Contact content: kept in scripts/demo-content/pages.json
function pages () {
  const file = pagesFile || path.join(root, 'scripts', 'demo-content', 'pages.json')
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  return [
    { key: 'home', title: 'Home', slug: 'home', template: 'templates/template-home.php', content: '', acfGroup: 'group_6aca0d1273713', acf: HOME_FIELDS },
    { key: 'about', title: 'আমাদের সম্পর্কে', slug: 'about', template: 'templates/template-about.php', content: data.about_content, acfGroup: 'group_lk_about_page', acf: data.about },
    { key: 'contact', title: 'যোগাযোগ', slug: 'contact', template: 'templates/template-contact.php', content: data.contact_content || '', acfGroup: 'group_lk_contact_page', acf: { ...data.contact, form: { ...data.contact.form, recipient: '' } } },
    { key: 'blog', title: 'ব্লগ', slug: 'blog', template: '', content: '' }
  ]
}

fs.rmSync(path.join(outDir, 'images'), { recursive: true, force: true })
fs.mkdirSync(path.join(outDir, 'images'), { recursive: true })

const images = await buildImages(designDir, path.join(outDir, 'images'))
const article = singleArticle()

const content = {
  version: 1,
  generated: new Date().toISOString().slice(0, 10),
  images,
  authors: AUTHORS,
  terms: {
    product_cat: PRODUCT_CATEGORIES,
    category: POST_CATEGORIES,
    post_tag: POST_TAGS
  },
  attributes: ATTRIBUTES,
  products: PRODUCTS,
  posts: POSTS.map(post => (post.content === '@single' ? { ...post, content: article } : post)),
  pages: pages(),
  menus: MENUS,
  reading: { front: 'home', posts: 'blog' },
  themeSettings: THEME_SETTINGS,
  store: STORE
}

// Every reference must point at something in the package
const keys = {
  image: new Set(Object.keys(images)),
  product: new Set(PRODUCTS.map(item => item.key)),
  page: new Set(content.pages.map(item => item.key)),
  product_cat: new Set(PRODUCT_CATEGORIES.map(item => item.key)),
  category: new Set(POST_CATEGORIES.map(item => item.key)),
  post_tag: new Set(POST_TAGS.map(item => item.key))
}
const missing = []
const json = JSON.stringify(content)
for (const [, type, rest] of json.matchAll(/"@(image|product|page|term):([^"]+)"/g)) {
  const [kind, key] = type === 'term' ? rest.split(':') : [type, rest]
  if (!keys[kind]?.has(key)) missing.push(`@${type}:${rest}`)
}
for (const [, key] of json.matchAll(/\{\{image-url:([a-z0-9-]+)\}\}/g)) if (!keys.image.has(key)) missing.push(`{{image-url:${key}}}`)
for (const product of PRODUCTS) {
  for (const key of [product.image, ...(product.gallery ?? []), ...(product.variations ?? []).map(v => v.image).filter(Boolean)]) {
    if (!keys.image.has(key)) missing.push(`${product.key}: image ${key}`)
  }
  for (const key of product.categories) if (!keys.product_cat.has(key)) missing.push(`${product.key}: category ${key}`)
}
for (const post of POSTS) {
  if (!keys.image.has(post.image)) missing.push(`${post.key}: image ${post.image}`)
  if (!keys.category.has(post.category)) missing.push(`${post.key}: category ${post.category}`)
}
if (missing.length) {
  console.error('Unknown references:\n  ' + [...new Set(missing)].join('\n  '))
  process.exit(1)
}

fs.writeFileSync(path.join(outDir, 'content.json'), JSON.stringify(content, null, 1))
const size = fs.readdirSync(path.join(outDir, 'images')).reduce((sum, file) => sum + fs.statSync(path.join(outDir, 'images', file)).size, 0)
console.log(
  `demo/content.json: ${PRODUCTS.length} products, ${POSTS.length} posts, ${content.pages.length} pages, ${MENUS.length} menus\n` +
  `demo/images: ${Object.keys(images).length} files, ${Math.round(size / 1024)} KB`
)
