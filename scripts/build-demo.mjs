// Builds the theme's one-click demo packages from the design files, one per
// homepage design:
//   wp-content/themes/lekhoni/demo/<id>/content.json  (content, settings, refs)
//   wp-content/themes/lekhoni/demo/<id>/images/*      (images only this demo uses)
//   wp-content/themes/lekhoni/demo/<id>/preview.jpg   (screenshot of the design)
//   wp-content/themes/lekhoni/demo/shared/*           (images several demos use)
// Demos: stationery (Home Shop), ecommerce (Home – E-commerce), cosmetics
// (Home – Cosmetics). The importer is wp-content/themes/lekhoni/inc/demo-import.php;
// the admin page lets you pick one.
//
// Run from lekhoni/: node scripts/build-demo.mjs
// Edit the content in scripts/demo-content/*, then rebuild.

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { IMAGES as STATIONERY_IMAGES, renderImage } from './demo-images.mjs'
import { ATTRIBUTES, PRODUCTS, PRODUCT_CATEGORIES } from './demo-content/products.mjs'
import { AUTHORS, POSTS, POST_CATEGORIES, POST_TAGS } from './demo-content/posts.mjs'
import { HOME_FIELDS, STORE, THEME_SETTINGS } from './demo-content/site.mjs'
import * as ecommerce from './demo-content/ecommerce.mjs'
import * as cosmetics from './demo-content/cosmetics.mjs'

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

// ---------------------------------------------------------------- Shared parts

const pagesData = JSON.parse(fs.readFileSync(pagesFile || path.join(root, 'scripts', 'demo-content', 'pages.json'), 'utf8'))
const SHARED_PAGES = [
  { key: 'about', title: 'আমাদের সম্পর্কে', slug: 'about', template: 'templates/template-about.php', content: pagesData.about_content, acfGroup: 'group_lk_about_page', acf: pagesData.about },
  { key: 'contact', title: 'যোগাযোগ', slug: 'contact', template: 'templates/template-contact.php', content: pagesData.contact_content || '', acfGroup: 'group_lk_contact_page', acf: { ...pagesData.contact, form: { ...pagesData.contact.form, recipient: '' } } },
  { key: 'blog', title: 'ব্লগ', slug: 'blog', template: '', content: '' }
]
const article = singleArticle()
const SHARED_POSTS = POSTS.map(post => (post.content === '@single' ? { ...post, content: article } : post))

const menus = shopKeys => [
  {
    key: 'primary',
    name: 'প্রধান মেনু',
    location: 'primary',
    items: [
      { title: 'হোম', url: '/' },
      { title: 'শপ', url: '/shop', children: shopKeys.map(key => ({ term: `product_cat:${key}` })) },
      { title: 'ব্লগ', page: 'blog' },
      { title: 'আমাদের সম্পর্কে', page: 'about' },
      { title: 'যোগাযোগ', page: 'contact' }
    ]
  },
  {
    key: 'footer',
    name: 'ফুটার মেনু',
    location: 'footer',
    items: [
      { title: 'শপ', url: '/shop' },
      { title: 'আমার অ্যাকাউন্ট', url: '/my-account' },
      { title: 'ব্লগ', page: 'blog' },
      { title: 'আমাদের সম্পর্কে', page: 'about' },
      { title: 'যোগাযোগ', page: 'contact' }
    ]
  }
]

const { coupon: STATIONERY_COUPON, ...STORE_BASE } = STORE

// ---------------------------------------------------------------- The demos

const DEMOS = [
  {
    id: 'stationery',
    title: 'স্টেশনারি শপ',
    name: 'Stationery shop',
    description: 'The original লেখনী store: notebooks, pens, mugs and gift boxes, with a flash sale, featured tabs, a product spotlight and reviews. Template "Home Shop", Stationery style.',
    design: 'home-shop.html',
    images: STATIONERY_IMAGES,
    productCategories: PRODUCT_CATEGORIES,
    productTags: [],
    attributes: ATTRIBUTES,
    products: PRODUCTS,
    home: { key: 'home', title: 'Home', slug: 'home', template: 'templates/template-home.php', content: '', acfGroup: 'group_6aca0d1273713', acf: HOME_FIELDS },
    shopMenu: ['notebooks', 'pens', 'mugs', 'bags', 'gift-boxes'],
    theme: {
      style: { preset: 'default', accent_color: '' },
      announcement: { enabled: 1, dismissible: 1, icon: 'truck', text: '৳১,০০০-এর বেশি অর্ডারে ফ্রি ডেলিভারি', link_label: 'আজই অর্ডার করুন', link_url: '/shop', starts_at: '', ends_at: '' }
    },
    coupon: STATIONERY_COUPON,
    posts: [],
    postCategories: []
  },
  {
    id: 'ecommerce',
    title: 'ই-কমার্স মার্ট',
    name: 'E-commerce store',
    description: 'A multi-department store: electronics, fashion, home and beauty, with a department menu, deals of the day, category rows and a coupon banner. Template "Home – E-commerce", E-commerce style.',
    design: 'home-ecommerce.html',
    images: ecommerce.IMAGES,
    productCategories: ecommerce.PRODUCT_CATEGORIES,
    productTags: [],
    attributes: ecommerce.ATTRIBUTES,
    products: ecommerce.PRODUCTS,
    home: { ...ecommerce.HOME, content: '' },
    shopMenu: ecommerce.SHOP_MENU,
    theme: ecommerce.THEME,
    coupon: ecommerce.COUPON,
    posts: [],
    postCategories: []
  },
  {
    id: 'cosmetics',
    title: 'বিউটি শপ',
    name: 'Cosmetics store',
    description: 'A beauty store: skincare, makeup, hair and fragrance, with shop-by-concern filters, shade swatches, morning and night routines with a bundle discount, and beauty tips. Template "Home – Cosmetics", Cosmetics style.',
    design: 'home-cosmetics.html',
    images: cosmetics.IMAGES,
    productCategories: cosmetics.PRODUCT_CATEGORIES,
    productTags: cosmetics.PRODUCT_TAGS,
    attributes: cosmetics.ATTRIBUTES,
    products: cosmetics.PRODUCTS,
    home: { ...cosmetics.HOME, content: '' },
    shopMenu: cosmetics.SHOP_MENU,
    theme: cosmetics.THEME,
    coupon: cosmetics.COUPON,
    posts: cosmetics.POSTS,
    postCategories: cosmetics.POST_CATEGORIES
  }
]

// Every image spec by key (keys must be unique across demos)
const SPECS = {}
for (const demo of DEMOS) {
  for (const [key, spec] of Object.entries(demo.images)) {
    if (SPECS[key] && SPECS[key].svg !== spec.svg) throw new Error(`Image key "${key}" is defined twice with different sources`)
    SPECS[key] = spec
  }
}

function packageOf (demo) {
  return {
    version: 2,
    id: demo.id,
    meta: { title: demo.title, name: demo.name, description: demo.description, design: demo.design },
    generated: new Date().toISOString().slice(0, 10),
    images: {},
    authors: AUTHORS,
    terms: {
      product_cat: demo.productCategories,
      product_tag: demo.productTags,
      category: [...POST_CATEGORIES, ...demo.postCategories],
      post_tag: POST_TAGS
    },
    attributes: demo.attributes,
    products: demo.products,
    posts: [...SHARED_POSTS, ...demo.posts],
    pages: [demo.home, ...SHARED_PAGES],
    menus: menus(demo.shopMenu),
    reading: { front: demo.home.key, posts: 'blog' },
    themeSettings: { ...THEME_SETTINGS, ...demo.theme },
    store: { ...STORE_BASE, coupon: demo.coupon }
  }
}

// Image keys a package uses
function imageKeys (content) {
  const keys = new Set()
  const json = JSON.stringify(content)
  for (const [, key] of json.matchAll(/"@image:([a-z0-9-]+)"/g)) keys.add(key)
  for (const [, key] of json.matchAll(/\{\{image-url:([a-z0-9-]+)\}\}/g)) keys.add(key)
  for (const product of content.products) {
    for (const key of [product.image, ...(product.gallery ?? []), ...(product.variations ?? []).map(v => v.image)]) if (key) keys.add(key)
  }
  for (const terms of Object.values(content.terms)) for (const term of terms) if (term.image) keys.add(term.image)
  for (const post of content.posts) if (post.image) keys.add(post.image)
  return keys
}

// Every reference must point at something in the package
function validate (content, keys) {
  const known = {
    image: keys,
    product: new Set(content.products.map(item => item.key)),
    page: new Set(content.pages.map(item => item.key)),
    product_cat: new Set(content.terms.product_cat.map(item => item.key)),
    product_tag: new Set(content.terms.product_tag.map(item => item.key)),
    category: new Set(content.terms.category.map(item => item.key)),
    post_tag: new Set(content.terms.post_tag.map(item => item.key))
  }
  const missing = []
  const json = JSON.stringify(content)
  for (const [, type, rest] of json.matchAll(/"@(image|product|page|term):([^"]+)"/g)) {
    const [kind, key] = type === 'term' ? rest.split(':') : [type, rest]
    if (!known[kind]?.has(key)) missing.push(`@${type}:${rest}`)
  }
  for (const key of keys) if (!SPECS[key]) missing.push(`image ${key} (no spec)`)
  for (const product of content.products) {
    for (const key of product.categories) if (!known.product_cat.has(key)) missing.push(`${product.key}: category ${key}`)
    for (const key of product.tags ?? []) if (!known.product_tag.has(key)) missing.push(`${product.key}: tag ${key}`)
    for (const item of product.attributes ?? []) if (!content.attributes.some(attribute => attribute.slug === item.attribute)) missing.push(`${product.key}: attribute ${item.attribute}`)
  }
  for (const post of content.posts) if (!known.category.has(post.category)) missing.push(`${post.key}: category ${post.category}`)
  for (const item of content.menus.flatMap(menu => menu.items.flatMap(entry => [entry, ...(entry.children ?? [])]))) {
    if (item.term && !known.product_cat.has(item.term.split(':')[1])) missing.push(`menu: ${item.term}`)
  }
  return missing
}

// A screenshot of the design page as the admin page's preview. Needs Chrome
// or Edge; without one, the demo's first hero image is used instead.
function findBrowser () {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ]
  return candidates.find(candidate => candidate && fs.existsSync(candidate)) ?? null
}

async function preview (demo, target, fallback) {
  const browser = findBrowser()
  if (browser) {
    const shot = path.join(os.tmpdir(), `lekhoni-preview-${demo.id}.png`)
    try {
      execFileSync(browser, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=6000', '--window-size=1440,1100', `--screenshot=${shot}`, `file://${path.join(designDir, demo.design).replace(/\\/g, '/')}`], { stdio: 'ignore', timeout: 60000 })
      await sharp(shot).resize({ width: 720 }).jpeg({ quality: 80, mozjpeg: true }).toFile(target)
      fs.rmSync(shot, { force: true })
      return 'screenshot'
    } catch {
      // fall through to the hero image
    }
  }
  await sharp(fallback).resize({ width: 720 }).flatten({ background: '#ffffff' }).jpeg({ quality: 80 }).toFile(target)
  return 'hero image'
}

// ---------------------------------------------------------------- Build

const packages = DEMOS.map(demo => ({ demo, content: packageOf(demo) }))
const used = packages.map(({ content }) => imageKeys(content))
const problems = packages.flatMap(({ demo, content }, index) => validate(content, used[index]).map(item => `${demo.id}: ${item}`))
if (problems.length) {
  console.error('Unknown references:\n  ' + [...new Set(problems)].join('\n  '))
  process.exit(1)
}

// Images used by more than one demo live in demo/shared, the rest with their demo
const usage = {}
for (const keys of used) for (const key of keys) usage[key] = (usage[key] ?? 0) + 1

for (const entry of fs.readdirSync(outDir, { withFileTypes: true })) {
  fs.rmSync(path.join(outDir, entry.name), { recursive: true, force: true })
}
fs.mkdirSync(path.join(outDir, 'shared'), { recursive: true })

const rendered = {}
async function imageFor (key, demoId) {
  const folder = usage[key] > 1 ? 'shared' : `${demoId}/images`
  const cacheKey = `${folder}/${key}`
  if (!rendered[cacheKey]) {
    fs.mkdirSync(path.join(outDir, folder), { recursive: true })
    const info = await renderImage(designDir, key, SPECS[key], path.join(outDir, folder))
    rendered[cacheKey] = { ...info, file: `${folder}/${info.file}` }
  }
  return rendered[cacheKey]
}

const lines = []
for (const [index, { demo, content }] of packages.entries()) {
  fs.mkdirSync(path.join(outDir, demo.id), { recursive: true })
  for (const key of [...used[index]].sort()) content.images[key] = await imageFor(key, demo.id)
  const heroKey = Object.keys(demo.images).find(key => /hero/.test(key)) ?? Object.keys(content.images)[0]
  const how = await preview(demo, path.join(outDir, demo.id, 'preview.jpg'), path.join(outDir, content.images[heroKey].file))
  content.meta.counts = {
    products: content.products.length,
    categories: content.terms.product_cat.length,
    posts: content.posts.length,
    pages: content.pages.length,
    images: Object.keys(content.images).length
  }
  fs.writeFileSync(path.join(outDir, demo.id, 'content.json'), JSON.stringify(content, null, 1))
  lines.push(`demo/${demo.id}: ${content.products.length} products, ${content.posts.length} posts, ${content.pages.length} pages, ${Object.keys(content.images).length} images, preview (${how})`)
}

const size = dir => fs.readdirSync(dir, { withFileTypes: true }).reduce((sum, entry) => sum + (entry.isDirectory() ? size(path.join(dir, entry.name)) : fs.statSync(path.join(dir, entry.name)).size), 0)
console.log(lines.join('\n') + `\ndemo/ total: ${Math.round(size(outDir) / 1024)} KB`)
