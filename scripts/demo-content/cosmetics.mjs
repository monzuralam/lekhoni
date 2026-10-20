// The "Cosmetics" demo: a beauty store for the "Home – Cosmetics" template
// (design/home-cosmetics.html). Built by build-demo.mjs into
// wp-content/themes/lekhoni/demo/cosmetics/. ACF names carry the group's
// "hb_" prefix. Concerns are product tags; shades have swatch colours.

const link = (title, url) => ({ title, url, target: '' })

export const IMAGES = {
  'cs-hero-1': { svg: 'cs-hero-1', width: 1000, alt: 'সিরাম, পাম্প বোতল আর ক্রিমের কৌটা' },
  'cs-hero-2': { svg: 'cs-hero-2', width: 1000, alt: 'লিপস্টিক, পারফিউম আর আইশ্যাডো প্যালেট' },
  'cs-kit': { svg: 'cs-kit', width: 800, alt: 'ট্রাভেল কিটের মিনি পণ্য' },
  'cs-cat-skincare': { svg: 'cs-cat-1', width: 600, alt: 'স্কিনকেয়ার' },
  'cs-cat-makeup': { svg: 'cs-cat-2', width: 600, alt: 'মেকআপ' },
  'cs-cat-haircare': { svg: 'cs-cat-3', width: 600, alt: 'চুলের যত্ন' },
  'cs-cat-fragrance': { svg: 'cs-cat-4', width: 600, alt: 'সুগন্ধি' },
  'cs-cat-bodycare': { svg: 'cs-cat-5', width: 600, alt: 'বডি কেয়ার' },
  'cs-cat-masks': { svg: 'cs-cat-6', width: 600, alt: 'মাস্ক ও টুলস' },
  'cs-vitc-serum': { svg: 'cs-p1', width: 1000, alt: 'ভিটামিন সি সিরামের বোতল' },
  'cs-moisturizer': { svg: 'cs-p2', width: 1000, alt: 'ময়েশ্চারাইজারের কৌটা' },
  'cs-niacinamide': { svg: 'cs-p3', width: 1000, alt: 'নিয়াসিনামাইড সিরামের বোতল' },
  'cs-sunscreen': { svg: 'cs-p4', width: 1000, alt: 'সানস্ক্রিনের টিউব' },
  'cs-lipstick': { svg: 'cs-p5', width: 1000, alt: 'ম্যাট লিপস্টিক' },
  'cs-palette': { svg: 'cs-p6', width: 1000, alt: 'আইশ্যাডো প্যালেট' },
  'cs-cleanser': { svg: 'cs-p7', width: 1000, alt: 'ফোমিং ক্লিনজারের বোতল' },
  'cs-toner': { svg: 'cs-p8', width: 1000, alt: 'রোজ ওয়াটার টোনার' },
  'cs-hair-oil': { svg: 'cs-p9', width: 1000, alt: 'আরগান হেয়ার অয়েল' },
  'cs-perfume': { svg: 'cs-p10', width: 1000, alt: 'পারফিউমের বোতল' },
  'cs-night-cream': { svg: 'cs-p11', width: 1000, alt: 'নাইট ক্রিমের কৌটা' },
  'cs-sheet-mask': { svg: 'cs-p12', width: 1000, alt: 'শিট মাস্কের প্যাকেট' },
  'cs-body-lotion': { svg: 'cs-p7', width: 1000, alt: 'বডি লোশনের বোতল', hue: 70 },
  'cs-g1': { svg: 'cs-g1', width: 1200, alt: 'সিরাম আর লিপস্টিকের ছবি' },
  'cs-g2': { svg: 'cs-g2', width: 1200, alt: 'পাম্প বোতল আর ক্রিমের ছবি' },
  'cs-g3': { svg: 'cs-g3', width: 1200, alt: 'টোনার আর শিট মাস্কের ছবি' },
  'cs-g4': { svg: 'cs-g4', width: 1200, alt: 'হেয়ার অয়েল আর পারফিউমের ছবি' },
  'cs-g5': { svg: 'cs-g5', width: 1200, alt: 'আইশ্যাডো প্যালেটের ছবি' },
  'cs-g6': { svg: 'cs-g6', width: 1200, alt: 'সানস্ক্রিন আর সিরামের ছবি' }
}

export const PRODUCT_CATEGORIES = [
  { key: 'skincare', name: 'স্কিনকেয়ার', slug: 'skincare', icon: 'droplet', image: 'cs-cat-skincare', description: 'ক্লিনজার, টোনার, সিরাম, ময়েশ্চারাইজার আর সানস্ক্রিন।' },
  { key: 'makeup', name: 'মেকআপ', slug: 'makeup', icon: 'sparkles', image: 'cs-cat-makeup', description: 'লিপস্টিক, আইশ্যাডো আর বেস মেকআপ।' },
  { key: 'haircare', name: 'চুলের যত্ন', slug: 'haircare', icon: 'leaf', image: 'cs-cat-haircare', description: 'তেল, শ্যাম্পু আর সিরাম।' },
  { key: 'fragrance', name: 'সুগন্ধি', slug: 'fragrance', icon: 'flask', image: 'cs-cat-fragrance', description: 'পারফিউম আর বডি মিস্ট।' },
  { key: 'bodycare', name: 'বডি কেয়ার', slug: 'bodycare', icon: 'heart', image: 'cs-cat-bodycare', description: 'লোশন আর বডি ওয়াশ।' },
  { key: 'masks', name: 'মাস্ক ও টুলস', slug: 'masks-tools', icon: 'smile', image: 'cs-cat-masks', description: 'শিট মাস্ক আর রূপচর্চার সরঞ্জাম।' }
]

// Concerns: product tags used by the "Shop by concern" chips
export const PRODUCT_TAGS = [
  { key: 'dry-skin', name: 'শুষ্ক ত্বক', slug: 'dry-skin' },
  { key: 'oily-skin', name: 'তৈলাক্ত ত্বক', slug: 'oily-skin' },
  { key: 'acne', name: 'ব্রণ', slug: 'acne' },
  { key: 'dullness', name: 'নিষ্প্রভতা', slug: 'dullness' },
  { key: 'dark-spots', name: 'কালো দাগ', slug: 'dark-spots' },
  { key: 'sun-care', name: 'রোদ সুরক্ষা', slug: 'sun-care' }
]

export const ATTRIBUTES = [
  {
    key: 'shade', name: 'শেড', slug: 'shade',
    terms: [
      { name: 'রুবি', slug: 'ruby', swatch: '#a8324a' },
      { name: 'টেরাকোটা', slug: 'terracotta', swatch: '#c45a5a' },
      { name: 'রোজ', slug: 'rose', swatch: '#d4787f' },
      { name: 'বেরি', slug: 'berry', swatch: '#8e3b52' },
      { name: 'নুড', slug: 'nude', swatch: '#e09a8c' }
    ]
  }
]

const R = {
  nusrat: { author: 'নুসরাত জাহান', email: 'nusrat.beauty@example.com' },
  tasnim: { author: 'তাসনিম রহমান', email: 'tasnim.beauty@example.com' },
  farhana: { author: 'ফারহানা আক্তার', email: 'farhana.beauty@example.com' },
  sadia: { author: 'সাদিয়া ইসলাম', email: 'sadia.beauty@example.com' },
  mahjabin: { author: 'মাহজাবীন চৌধুরী', email: 'mahjabin.beauty@example.com' }
}

const how = text => `<h3>যেভাবে ব্যবহার করবেন</h3><p>${text}</p>`
const free = '<p>প্যারাবেন ও সালফেট মুক্ত, ক্রুয়েলটি ফ্রি। ডার্মাটোলজিস্ট পরীক্ষিত।</p>'

export const PRODUCTS = [
  {
    key: 'cs-cleanser', name: 'জেন্টল ফোমিং ক্লিনজার', slug: 'gentle-foaming-cleanser', sku: 'CS-SK-001',
    categories: ['skincare'], tags: ['oily-skin', 'acne'], image: 'cs-cleanser', regular: 550, stock: 40, sales: 233,
    short: 'সালফেট মুক্ত, ত্বকের প্রাকৃতিক আর্দ্রতা নষ্ট না করে পরিষ্কার করে।',
    description: '<p>দিনের ধুলো, তেল আর মেকআপ তুলে দেয় হালকা ফোমে। ধোয়ার পর ত্বক টানটান লাগে না।</p>' + free + how('ভেজা মুখে অল্প পরিমাণ নিয়ে এক মিনিট আলতো ম্যাসাজ করে ধুয়ে ফেলুন। সকাল ও রাতে।'),
    specs: [['পরিমাণ', '১৫০ মিলি'], ['ত্বক', 'তৈলাক্ত ও মিশ্র'], ['মূল উপাদান', 'গ্লিসারিন, গ্রিন টি']], weight: '0.18',
    reviews: [{ ...R.sadia, rating: 5, title: 'সংবেদনশীল ত্বকেও আরাম', text: 'কোনো জ্বালাপোড়া হয়নি। হালকা ফোম, ধোয়ার পর ত্বক শুকিয়ে যায় না।', days: 7 }]
  },
  {
    key: 'cs-toner', name: 'রোজ ওয়াটার হাইড্রেটিং টোনার', slug: 'rose-water-hydrating-toner', sku: 'CS-SK-002',
    categories: ['skincare'], tags: ['dry-skin', 'dullness'], image: 'cs-toner', regular: 620, stock: 30, sales: 175,
    short: 'গোলাপজল আর গ্লিসারিন, ত্বককে সতেজ ও কোমল রাখে।',
    description: '<p>ক্লিনজারের পর ত্বকের ভারসাম্য ফেরায়, পরের ধাপের পণ্য ভালোভাবে শুষে নিতে সাহায্য করে।</p>' + free + how('তুলায় বা হাতের তালুতে নিয়ে আলতো চাপ দিয়ে মুখে লাগান।'),
    specs: [['পরিমাণ', '২০০ মিলি'], ['ত্বক', 'শুষ্ক ও স্বাভাবিক']], weight: '0.24',
    reviews: [{ ...R.tasnim, rating: 4, title: 'সুন্দর গন্ধ', text: 'গোলাপের হালকা গন্ধ, লাগানোর পর ত্বক ঠান্ডা লাগে।', days: 20 }]
  },
  {
    key: 'cs-vitc-serum', name: 'ভিটামিন সি ব্রাইটেনিং সিরাম', slug: 'vitamin-c-brightening-serum', sku: 'CS-SK-003',
    categories: ['skincare'], tags: ['dullness', 'dark-spots'], image: 'cs-vitc-serum', gallery: ['cs-g1'], regular: 1500, sale: 1250, saleDays: 10, stock: 25, featured: true, sales: 412,
    short: '১৫% ভিটামিন সি ত্বকের নিষ্প্রভতা আর কালো দাগ কমায়, দেয় প্রাকৃতিক উজ্জ্বলতা।',
    description: '<p>স্থিতিশীল ১৫% ভিটামিন সি আর ফেরুলিক অ্যাসিড একসঙ্গে কাজ করে দাগ হালকা করতে আর রোদের ক্ষতি থেকে ত্বককে রক্ষা করতে।</p>' + free + how('সকালে পরিষ্কার ত্বকে ২-৩ ফোঁটা, তারপর ময়েশ্চারাইজার ও সানস্ক্রিন।'),
    specs: [['পরিমাণ', '৩০ মিলি'], ['মূল উপাদান', '১৫% ভিটামিন সি, ফেরুলিক অ্যাসিড'], ['ত্বক', 'সব ধরনের']], weight: '0.08',
    reviews: [{ ...R.farhana, rating: 4, title: 'দাগ হালকা হচ্ছে', text: 'দুই সপ্তাহে দাগ কিছুটা হালকা হয়েছে, ত্বকও উজ্জ্বল দেখাচ্ছে।', days: 5 }, { ...R.nusrat, rating: 5, title: 'প্রতিদিনের সঙ্গী', text: 'হালকা টেক্সচার, চটচটে নয়। মেকআপের নিচেও ভালো বসে।', days: 26 }]
  },
  {
    key: 'cs-niacinamide', name: 'নিয়াসিনামাইড ১০% সিরাম', slug: 'niacinamide-10-serum', sku: 'CS-SK-004',
    categories: ['skincare'], tags: ['oily-skin', 'acne', 'dark-spots'], image: 'cs-niacinamide', regular: 890, stock: 28, sales: 351,
    short: 'লোমকূপ ছোট দেখায়, ব্রণের দাগ আর অতিরিক্ত তেল নিয়ন্ত্রণ করে।',
    description: '<p>১০% নিয়াসিনামাইড আর ১% জিংক ত্বকের তেল নিয়ন্ত্রণে রাখে, ত্বকের প্রাকৃতিক বাধা মজবুত করে।</p>' + free + how('রাতে ক্লিনজার ও টোনারের পর কয়েক ফোঁটা।'),
    specs: [['পরিমাণ', '৩০ মিলি'], ['মূল উপাদান', '১০% নিয়াসিনামাইড, ১% জিংক']], weight: '0.08',
    reviews: [{ ...R.sadia, rating: 5, title: 'তেল কম', text: 'দুপুরের পরও মুখ তেলতেলে হয় না। লোমকূপও কম দেখায়।', days: 13 }]
  },
  {
    key: 'cs-moisturizer', name: 'হায়ালুরোনিক ময়েশ্চারাইজার', slug: 'hyaluronic-moisturizer', sku: 'CS-SK-005',
    categories: ['skincare'], tags: ['dry-skin'], image: 'cs-moisturizer', regular: 980, stock: 34, featured: true, sales: 286,
    short: 'হালকা জেল-ক্রিম, ২৪ ঘণ্টা আর্দ্রতা ধরে রাখে, তেলতেলে ভাব নেই।',
    description: '<p>তিন ধরনের হায়ালুরোনিক অ্যাসিড ত্বকের ভেতর থেকে আর্দ্রতা দেয়। গরমেও ভারী লাগে না।</p>' + free + how('সকাল ও রাতে সিরামের পর।'),
    specs: [['পরিমাণ', '৫০ গ্রাম'], ['ত্বক', 'শুষ্ক ও স্বাভাবিক']], weight: '0.1',
    reviews: [{ ...R.tasnim, rating: 5, title: 'শীতে বাঁচিয়েছে', text: 'আমার ত্বক খুব টানটান হয়ে যেত। এক সপ্তাহে অনেক নরম লাগছে।', days: 9 }]
  },
  {
    key: 'cs-sunscreen', name: 'ডেইলি সানস্ক্রিন SPF ৫০ PA++++', slug: 'daily-sunscreen-spf50', sku: 'CS-SK-006',
    categories: ['skincare'], tags: ['sun-care', 'oily-skin', 'acne'], image: 'cs-sunscreen', gallery: ['cs-g6'], regular: 850, sale: 750, stock: 50, featured: true, sales: 520,
    short: 'সাদা আস্তর পড়ে না, মেকআপের নিচেও ব্যবহার করা যায়।',
    description: '<p>ব্রড স্পেকট্রাম UVA ও UVB সুরক্ষা। পানির মতো হালকা, দ্রুত শুষে নেয়।</p>' + free + how('বাইরে যাওয়ার ১৫ মিনিট আগে, দুই আঙুল পরিমাণ। প্রতি দুই ঘণ্টায় আবার।'),
    specs: [['পরিমাণ', '৫০ মিলি'], ['সুরক্ষা', 'SPF ৫০, PA++++']], weight: '0.07',
    reviews: [{ ...R.nusrat, rating: 5, title: 'সাদা আস্তর নেই', text: 'এই সানস্ক্রিনটা সত্যিই সাদা আস্তর ফেলে না। গরমেও মুখ তেলতেলে হয় না।', days: 3 }, { ...R.mahjabin, rating: 5, title: 'মেকআপের নিচে দারুণ', text: 'ফাউন্ডেশনের নিচে কোনো দলা পাকায় না।', days: 15 }]
  },
  {
    key: 'cs-night-cream', name: 'রেটিনল নাইট রিপেয়ার ক্রিম', slug: 'retinol-night-repair-cream', sku: 'CS-SK-007',
    categories: ['skincare'], tags: ['dullness', 'dry-skin'], image: 'cs-night-cream', regular: 1600, sale: 1350, stock: 15, sales: 164,
    short: 'রাতে ত্বক মেরামত করে, সূক্ষ্ম রেখা ও অসমান টোন কমায়।',
    description: '<p>এনক্যাপসুলেটেড রেটিনল ধীরে কাজ করে, তাই জ্বালাপোড়া কম। সেরামাইড ত্বককে কোমল রাখে।</p>' + free + how('রাতে সপ্তাহে ২-৩ বার দিয়ে শুরু করুন। দিনে সানস্ক্রিন জরুরি।'),
    specs: [['পরিমাণ', '৫০ গ্রাম'], ['মূল উপাদান', '০.২% রেটিনল, সেরামাইড']], weight: '0.1'
  },
  {
    key: 'cs-sheet-mask', name: 'হাইড্রেটিং শিট মাস্ক (৫টি)', slug: 'hydrating-sheet-mask-5', sku: 'CS-MK-008',
    categories: ['masks', 'skincare'], tags: ['dry-skin', 'dullness'], image: 'cs-sheet-mask', regular: 490, stock: 60, sales: 302,
    short: '১৫ মিনিটেই ত্বকে ফেরে আর্দ্রতা আর সতেজ ভাব।',
    description: '<p>অ্যালোভেরা আর হায়ালুরোনিক অ্যাসিডে ভেজানো নরম সুতির মাস্ক।</p>' + how('পরিষ্কার মুখে ১৫-২০ মিনিট রেখে তুলে ফেলুন, বাকি সিরাম আলতো ম্যাসাজ করুন।'),
    specs: [['প্যাকে', '৫টি মাস্ক, প্রতিটি ২৫ মিলি']], weight: '0.15'
  },
  {
    key: 'cs-lipstick', type: 'variable', name: 'ভেলভেট ম্যাট লিপস্টিক', slug: 'velvet-matte-lipstick', sku: 'CS-MU-009',
    categories: ['makeup'], image: 'cs-lipstick', gallery: ['cs-g1'], featured: true, sales: 198,
    short: 'এক টানেই গাঢ় রং, ১২ ঘণ্টা টেকে, ঠোঁট শুকায় না।',
    description: '<p>ভিটামিন ই আর শিয়া বাটারে ঠোঁট থাকে নরম। পাঁচটি শেড, প্রতিদিন থেকে উৎসব পর্যন্ত।</p>',
    specs: [['পরিমাণ', '৩.৫ গ্রাম'], ['ফিনিশ', 'ভেলভেট ম্যাট']], weight: '0.02',
    attributes: [{ attribute: 'shade', terms: ['ruby', 'terracotta', 'rose', 'berry', 'nude'] }],
    variations: [
      { attributes: { shade: 'ruby' }, regular: 650, stock: 20, sku: 'CS-MU-009-RU' },
      { attributes: { shade: 'terracotta' }, regular: 650, stock: 14, sku: 'CS-MU-009-TE' },
      { attributes: { shade: 'rose' }, regular: 650, stock: 18, sku: 'CS-MU-009-RO' },
      { attributes: { shade: 'berry' }, regular: 650, stock: 9, sku: 'CS-MU-009-BE' },
      { attributes: { shade: 'nude' }, regular: 650, stock: 4, sku: 'CS-MU-009-NU' }
    ],
    reviews: [{ ...R.mahjabin, rating: 5, title: 'রুবি শেডটা দারুণ', text: '"রুবি" শেডটা একদম ছবির মতো। সারাদিন ছিল, খাওয়ার পরও খুব একটা ওঠেনি।', days: 4 }, { ...R.farhana, rating: 4, title: 'শুকায় না', text: 'ম্যাট হলেও ঠোঁট ফাটে না। নুড শেডটা অফিসের জন্য ভালো।', days: 17 }]
  },
  {
    key: 'cs-palette', name: 'সানসেট আইশ্যাডো প্যালেট', slug: 'sunset-eyeshadow-palette', sku: 'CS-MU-010',
    categories: ['makeup'], image: 'cs-palette', gallery: ['cs-g5'], regular: 1800, sale: 1450, saleDays: 10, stock: 12, sales: 143,
    short: 'ম্যাট আর শিমার মিলিয়ে ১২টি উষ্ণ রং, সহজে ব্লেন্ড হয়।',
    description: '<p>দিনের হালকা সাজ থেকে সন্ধ্যার স্মোকি আই, এক প্যালেটেই।</p>',
    specs: [['রং', '১২টি'], ['ফিনিশ', 'ম্যাট ও শিমার']], weight: '0.12'
  },
  {
    key: 'cs-hair-oil', name: 'আরগান রিপেয়ার হেয়ার অয়েল', slug: 'argan-repair-hair-oil', sku: 'CS-HC-011',
    categories: ['haircare'], image: 'cs-hair-oil', gallery: ['cs-g4'], regular: 850, stock: 26, sales: 210,
    short: 'রুক্ষ চুলে আনে কোমলতা আর উজ্জ্বলতা, চুল ভাঙা কমায়।',
    description: '<p>খাঁটি আরগান আর নারকেল তেলের হালকা মিশ্রণ, চুল ভারী বা তেলতেলে করে না।</p>' + how('ভেজা বা শুকনো চুলের আগায় কয়েক ফোঁটা।'),
    specs: [['পরিমাণ', '১০০ মিলি']], weight: '0.13'
  },
  {
    key: 'cs-perfume', name: 'অউ দ্য পারফিউম "শিউলি"', slug: 'eau-de-parfum-shiuli', sku: 'CS-FR-012',
    categories: ['fragrance'], image: 'cs-perfume', gallery: ['cs-g4'], regular: 2450, stock: 10, featured: true, sales: 96,
    short: 'শিউলি ফুল, চন্দন আর কস্তুরীর মৃদু সুবাস, সারাদিন থাকে।',
    description: '<p>শরতের সকালের শিউলির গন্ধ, উষ্ণ চন্দনের ছোঁয়া। সীমিত সংস্করণ।</p>',
    specs: [['পরিমাণ', '৫০ মিলি'], ['ধরন', 'অউ দ্য পারফিউম']], weight: '0.25'
  },
  {
    key: 'cs-body-lotion', name: 'শিয়া বাটার বডি লোশন', slug: 'shea-butter-body-lotion', sku: 'CS-BC-013',
    categories: ['bodycare'], tags: ['dry-skin'], image: 'cs-body-lotion', regular: 690, sale: 590, stock: 32, sales: 118,
    short: 'শিয়া বাটার আর ভিটামিন ই, সারাদিন কোমল ত্বক।',
    description: '<p>দ্রুত শুষে নেয়, চটচটে ভাব নেই। শীতের রুক্ষতায় দারুণ।</p>',
    specs: [['পরিমাণ', '২৫০ মিলি']], weight: '0.3'
  }
]

const products = keys => keys.map(key => `@product:${key}`)

export const HOME = {
  key: 'home-cosmetics',
  title: 'হোম',
  slug: 'home-cosmetics',
  template: 'templates/template-home-cosmetics.php',
  acfGroup: 'group_lk_home_cosmetics',
  acf: {
    hb_hero_section: {
      badge: 'ডার্মাটোলজিস্ট পরীক্ষিত',
      rating_text: '১২ হাজার+ খুশি ক্রেতা',
      slides: [
        { eyebrow: 'নতুন · গ্লো কালেকশন', title: 'আপনার ত্বকের নিজস্ব উজ্জ্বলতা ফিরিয়ে আনুন', text: 'ডার্মাটোলজিস্ট পরীক্ষিত সিরাম আর ময়েশ্চারাইজার, বাংলাদেশের আবহাওয়ার কথা মাথায় রেখে বাছাই করা।', primary_link: link('এখনই কিনুন', '/product-category/skincare'), secondary_link: link('ত্বক অনুযায়ী কিনুন', '/shop'), image: '@image:cs-hero-1' },
        { eyebrow: 'উৎসবের সাজ', title: 'রঙে রঙে সাজুন এই মৌসুমে', text: 'ম্যাট লিপস্টিক থেকে আইশ্যাডো প্যালেট, প্রতিটি সাজের জন্য সঠিক রং।', primary_link: link('এখনই কিনুন', '/product-category/makeup'), secondary_link: link('মেকআপ দেখুন', '/product-category/makeup'), image: '@image:cs-hero-2' }
      ]
    },
    hb_promises_section: {
      enabled: 1,
      items: [{ icon: 'award', text: '১০০% আসল পণ্য' }, { icon: 'heart', text: 'ক্রুয়েলটি ফ্রি' }, { icon: 'leaf', text: 'প্যারাবেন ও সালফেট মুক্ত' }, { icon: 'rotate-ccw', text: '৭ দিনে সহজ রিটার্ন' }]
    },
    hb_categories_section: { enabled: 1, eyebrow: 'ক্যাটাগরি', title: 'আপনার পছন্দের জগৎ বেছে নিন', categories: ['skincare', 'makeup', 'haircare', 'fragrance', 'bodycare', 'masks'].map(key => `@term:product_cat:${key}`) },
    hb_concerns_section: {
      enabled: 1, eyebrow: 'ত্বকের সমস্যা অনুযায়ী', title: 'আপনার ত্বকের যা দরকার', all_label: 'সব',
      concerns: PRODUCT_TAGS.map(tag => ({ label: tag.name, tag: `@term:product_tag:${tag.key}` })),
      products: products(['cs-vitc-serum', 'cs-niacinamide', 'cs-sunscreen', 'cs-moisturizer', 'cs-cleanser', 'cs-toner', 'cs-night-cream', 'cs-sheet-mask'])
    },
    hb_bestsellers_section: { enabled: 1, eyebrow: 'সবার পছন্দ', title: 'বেস্টসেলার', products: products(['cs-sunscreen', 'cs-lipstick', 'cs-vitc-serum', 'cs-palette', 'cs-hair-oil', 'cs-perfume', 'cs-niacinamide']) },
    hb_routines_section: {
      enabled: 1, eyebrow: '৪ ধাপের রুটিন', title: 'আপনার রুটিন তৈরি করুন', text: '', discount: 15,
      routines: [
        { name: 'সকালের রুটিন', icon: 'sun', steps: [['পরিষ্কার', 'cs-cleanser'], ['টোন', 'cs-toner'], ['সিরাম', 'cs-vitc-serum'], ['সুরক্ষা', 'cs-sunscreen']].map(([label, key]) => ({ label, product: [`@product:${key}`] })) },
        { name: 'রাতের রুটিন', icon: 'moon', steps: [['পরিষ্কার', 'cs-cleanser'], ['সিরাম', 'cs-niacinamide'], ['মেরামত', 'cs-night-cream'], ['মাস্ক (সপ্তাহে ২ বার)', 'cs-sheet-mask']].map(([label, key]) => ({ label, product: [`@product:${key}`] })) }
      ]
    },
    hb_ingredients_section: {
      enabled: 1, eyebrow: 'উপাদান', title: 'কী আছে ভেতরে, জেনে কিনুন',
      ingredients: [
        { name: 'ভিটামিন সি', icon: 'sun', tone: 'star', text: 'শক্তিশালী অ্যান্টিঅক্সিডেন্ট। দাগ হালকা করে, ত্বককে উজ্জ্বল করে আর রোদের ক্ষতি থেকে রক্ষা করে।', good_for: 'নিষ্প্রভ ত্বক, কালো দাগ', link: link('ভিটামিন সি আছে এমন পণ্য', '/product/vitamin-c-brightening-serum') },
        { name: 'নিয়াসিনামাইড', icon: 'droplet', tone: 'success', text: 'ভিটামিন বি৩। লোমকূপ ছোট দেখায়, তেল নিয়ন্ত্রণ করে আর ত্বকের প্রাকৃতিক বাধা মজবুত করে।', good_for: 'তৈলাক্ত ত্বক, ব্রণ', link: link('নিয়াসিনামাইড আছে এমন পণ্য', '/product/niacinamide-10-serum') },
        { name: 'হায়ালুরোনিক অ্যাসিড', icon: 'sparkles', tone: 'accent', text: 'নিজের ওজনের হাজার গুণ পানি ধরে রাখতে পারে। ত্বককে ভেতর থেকে আর্দ্র আর টানটান রাখে।', good_for: 'শুষ্ক ত্বক, সূক্ষ্ম রেখা', link: link('হায়ালুরোনিক অ্যাসিড আছে এমন পণ্য', '/product/hyaluronic-moisturizer') }
      ]
    },
    hb_offer_section: { enabled: 1, eyebrow: 'উপহার অফার', ends_at: '@date:+10', title: '৳২,০০০-এর বেশি কেনাকাটায় ফ্রি ট্রাভেল কিট', text: 'ক্লিনজার, সিরাম আর ময়েশ্চারাইজারের মিনি সাইজ, সুন্দর পাউচে। স্টক থাকা পর্যন্ত।', link: link('কেনাকাটা শুরু করুন', '/shop'), image: '@image:cs-kit' },
    hb_reviews_section: {
      enabled: 1, eyebrow: 'রিভিউ', title: 'তাঁরা যা বলছেন', source: 'testimonials',
      testimonials: [
        { name: 'নুসরাত জাহান', skin_type: 'তৈলাক্ত', rating: 5, verified: 1, text: 'এই সানস্ক্রিনটা সত্যিই সাদা আস্তর ফেলে না। গরমেও মুখ তেলতেলে হয় না, মেকআপের নিচে দারুণ বসে।', product: ['@product:cs-sunscreen'] },
        { name: 'তাসনিম রহমান', skin_type: 'শুষ্ক', rating: 5, verified: 1, text: 'শীতে আমার ত্বক খুব টানটান হয়ে যেত। এক সপ্তাহ ব্যবহারের পর অনেক নরম আর আরামদায়ক লাগছে।', product: ['@product:cs-moisturizer'] },
        { name: 'ফারহানা আক্তার', skin_type: 'মিশ্র', rating: 4, verified: 1, text: 'দুই সপ্তাহে দাগ কিছুটা হালকা হয়েছে, ত্বকও উজ্জ্বল দেখাচ্ছে। প্যাকেজিংও সুন্দর।', product: ['@product:cs-vitc-serum'] },
        { name: 'সাদিয়া ইসলাম', skin_type: 'সংবেদনশীল', rating: 5, verified: 1, text: 'সংবেদনশীল ত্বকে কোনো জ্বালাপোড়া হয়নি। হালকা ফোম, ধোয়ার পর ত্বক শুকিয়ে যায় না।', product: ['@product:cs-cleanser'] },
        { name: 'মাহজাবীন চৌধুরী', skin_type: 'স্বাভাবিক', rating: 5, verified: 1, text: '"রুবি" শেডটা একদম ছবির মতো। সারাদিন ছিল, খাওয়ার পরও খুব একটা ওঠেনি।', product: ['@product:cs-lipstick'] }
      ]
    },
    hb_gallery_section: { enabled: 1, eyebrow: '#লেখনীবিউটি', title: 'আপনাদের তোলা ছবি', text: 'ছবি শেয়ার করুন হ্যাশট্যাগ দিয়ে, বাছাই করা ছবি থাকবে এখানে।', link: 'https://www.instagram.com/', images: ['cs-g1', 'cs-g2', 'cs-g3', 'cs-g4', 'cs-g5', 'cs-g6'].map(key => `@image:${key}`) },
    hb_blog_section: { enabled: 1, title: 'বিউটি টিপস', link_label: 'সব লেখা', category: ['@term:category:beauty-tips'], count: 3 },
    hb_subscribe_section: { enabled: 1, title: 'বিউটি ক্লাবে যোগ দিন', text: 'প্রথম অর্ডারে ১০% ছাড়, নতুন পণ্যের খবর আর ত্বকের যত্নের টিপস, মাসে দুবার।', success_message: 'স্বাগতম! বিউটি ক্লাবে যোগ দেওয়ার জন্য ধন্যবাদ।', note: 'আমরা আপনার ইমেইল কারো সঙ্গে শেয়ার করি না। যেকোনো সময় আনসাবস্ক্রাইব করতে পারবেন।' }
  }
}

// Extra blog posts for the "Beauty tips" section
export const POST_CATEGORIES = [{ key: 'beauty-tips', name: 'বিউটি টিপস', slug: 'beauty-tips' }]

const p = (...paragraphs) => paragraphs.map(text => `<p>${text}</p>`).join('\n')
const h2 = text => `<h2>${text}</h2>`

export const POSTS = [
  {
    key: 'serum-order-guide', title: 'সিরাম কোন ক্রমে লাগাবেন: সহজ গাইড', slug: 'serum-order-guide', category: 'beauty-tips', tags: [], image: 'cs-g1', author: 'karima', days: 3,
    excerpt: 'ভিটামিন সি, নিয়াসিনামাইড আর রেটিনল একসঙ্গে ব্যবহারের সঠিক নিয়ম।',
    content: p('একাধিক সিরাম ব্যবহার করলে ক্রমটা গুরুত্বপূর্ণ। সাধারণ নিয়ম: পাতলা থেকে ঘন।') + h2('সকালে') + p('ক্লিনজার, টোনার, তারপর ভিটামিন সি সিরাম, ময়েশ্চারাইজার আর সবশেষে সানস্ক্রিন।') + h2('রাতে') + p('ক্লিনজারের পর নিয়াসিনামাইড, তারপর রেটিনল ক্রিম। রেটিনল আর ভিটামিন সি একই সময়ে না লাগানোই ভালো।')
  },
  {
    key: 'sunscreen-how-much', title: 'সানস্ক্রিন কতটুকু আর কতবার লাগাবেন', slug: 'sunscreen-how-much', category: 'beauty-tips', tags: [], image: 'cs-g6', author: 'rahim', days: 9,
    excerpt: 'SPF আর PA-এর মানে, আর কেন মেঘলা দিনেও সানস্ক্রিন জরুরি।',
    content: p('মুখ আর গলার জন্য দুই আঙুল সমান সানস্ক্রিন যথেষ্ট। বাইরে থাকলে প্রতি দুই ঘণ্টায় আবার লাগান।') + h2('SPF আর PA') + p('SPF বলে UVB থেকে কতটা সুরক্ষা, আর PA-এর প্লাস চিহ্ন বলে UVA থেকে। প্রতিদিনের জন্য SPF ৩০ থেকে ৫০ আর PA+++ বা তার বেশি ভালো।') + h2('মেঘলা দিনেও কেন') + p('মেঘ ভেদ করে অতিবেগুনি রশ্মির বড় অংশ পৌঁছে যায়। তাই আবহাওয়া যেমনই হোক, সানস্ক্রিন বাদ দেবেন না।')
  },
  {
    key: 'lipstick-shade-guide', title: 'উৎসবের সাজে ঠিক লিপস্টিক শেড বাছাই', slug: 'lipstick-shade-guide', category: 'beauty-tips', tags: [], image: 'cs-g5', author: 'karima', days: 16,
    excerpt: 'ত্বকের আন্ডারটোন বুঝে কোন রং মানাবে, সহজ কয়েকটি কৌশল।',
    content: p('কবজির শিরার রং দেখে আন্ডারটোন বোঝা যায়: সবুজাভ হলে উষ্ণ, নীলচে হলে শীতল।') + h2('উষ্ণ আন্ডারটোন') + p('টেরাকোটা, কোরাল আর নুড শেড বেশি মানায়।') + h2('শীতল আন্ডারটোন') + p('রুবি, বেরি আর রোজ শেড ত্বককে উজ্জ্বল দেখায়।')
  }
]

export const SHOP_MENU = ['skincare', 'makeup', 'haircare', 'fragrance', 'bodycare']

export const THEME = {
  style: { preset: 'cosmetics', accent_color: '' },
  announcement: { enabled: 1, dismissible: 1, icon: 'gift', text: '৳২,০০০-এর বেশি কেনাকাটায় ফ্রি ট্রাভেল কিট', link_label: 'এখনই কিনুন', link_url: '/shop', starts_at: '', ends_at: '' }
}

export const COUPON = { code: 'GLOW10', amount: 10, type: 'percent', minimum: 1000, description: 'ডেমো কুপন: ৳১,০০০-এর বেশি অর্ডারে ১০% ছাড়' }
