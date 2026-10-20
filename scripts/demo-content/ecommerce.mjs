// The "E-commerce" demo: a multi-department store for the "Home – E-commerce"
// template (design/home-ecommerce.html). Built by build-demo.mjs into
// wp-content/themes/lekhoni/demo/ecommerce/. Same shapes as products.mjs and
// site.mjs; ACF names carry the group's "he_" prefix.

const link = (title, url) => ({ title, url, target: '' })

// key -> design/assets/img/<svg>.svg, width, alt
export const IMAGES = {
  'ec-hero-1': { svg: 'ec-hero-1', width: 1350, alt: 'হেডফোন আর স্মার্টফোন' },
  'ec-hero-2': { svg: 'ec-hero-2', width: 1350, alt: 'স্নিকার্স আর হ্যান্ডব্যাগ' },
  'ec-hero-3': { svg: 'ec-hero-3', width: 1350, alt: 'ইলেকট্রিক কেটলি আর ফ্রাইপ্যান' },
  'ec-banner-1': { svg: 'ec-banner-1', width: 600, alt: 'স্মার্টওয়াচ' },
  'ec-banner-2': { svg: 'ec-banner-2', width: 600, alt: 'ব্লুটুথ স্পিকার' },
  'ec-dept-1': { svg: 'ec-dept-1', width: 600, alt: 'হেডফোন আর ফোন' },
  'ec-dept-2': { svg: 'ec-dept-2', width: 600, alt: 'শার্ট আর স্নিকার্স' },
  'ec-headphones': { svg: 'ec-p1', width: 1000, alt: 'ওয়্যারলেস হেডফোন' },
  'ec-headphones-alt': { svg: 'ec-p1', width: 1000, alt: 'ওয়্যারলেস হেডফোন, অন্য রঙে', hue: 200 },
  'ec-watch': { svg: 'ec-p2', width: 1000, alt: 'স্মার্টওয়াচ' },
  'ec-watch-pink': { svg: 'ec-p2', width: 1000, alt: 'গোলাপি স্মার্টওয়াচ', hue: 110 },
  'ec-speaker': { svg: 'ec-p3', width: 1000, alt: 'ব্লুটুথ স্পিকার' },
  'ec-powerbank': { svg: 'ec-p4', width: 1000, alt: 'পাওয়ার ব্যাংক' },
  'ec-shirt': { svg: 'ec-p5', width: 1000, alt: 'নীল সুতি শার্ট' },
  'ec-shirt-alt': { svg: 'ec-p5', width: 1000, alt: 'সুতি শার্ট, অন্য রঙে', hue: 140 },
  'ec-sneaker': { svg: 'ec-p6', width: 1000, alt: 'লাল রানিং স্নিকার্স' },
  'ec-sneaker-alt': { svg: 'ec-p6', width: 1000, alt: 'রানিং স্নিকার্স, অন্য রঙে', hue: 220 },
  'ec-handbag': { svg: 'ec-p7', width: 1000, alt: 'চামড়ার হ্যান্ডব্যাগ' },
  'ec-sunglasses': { svg: 'ec-p8', width: 1000, alt: 'পোলারাইজড সানগ্লাস' },
  'ec-pan': { svg: 'ec-p9', width: 1000, alt: 'নন-স্টিক ফ্রাইপ্যান' },
  'ec-lamp': { svg: 'ec-p10', width: 1000, alt: 'টেবিল ল্যাম্প' },
  'ec-kettle': { svg: 'ec-p11', width: 1000, alt: 'ইলেকট্রিক কেটলি' },
  'ec-bedsheet': { svg: 'ec-p12', width: 1000, alt: 'সুতি বেডশিট সেট' },
  'ec-phone': { svg: 'ec-p13', width: 1000, alt: 'স্মার্টফোন' },
  'ec-phone-alt': { svg: 'ec-p13', width: 1000, alt: 'স্মার্টফোন, অন্য রঙে', hue: 160 },
  'ec-serum': { svg: 'cs-p1', width: 1000, alt: 'ভিটামিন সি সিরাম' },
  'ec-lipstick': { svg: 'cs-p5', width: 1000, alt: 'ম্যাট লিপস্টিক' },
  'ec-notebook': { svg: 'product-1', width: 1000, alt: 'হার্ডকভার নোটবুক' },
  'ec-pens': { svg: 'product-2', width: 1000, alt: 'জেল কলমের সেট' }
}

export const PRODUCT_CATEGORIES = [
  { key: 'electronics', name: 'ইলেকট্রনিক্স', slug: 'electronics', icon: 'smartphone', image: 'ec-headphones', description: 'ফোন, অডিও, স্মার্টওয়াচ আর গ্যাজেট।' },
  { key: 'fashion', name: 'ফ্যাশন', slug: 'fashion', icon: 'shirt', image: 'ec-shirt', description: 'পোশাক, জুতা, ব্যাগ আর অ্যাক্সেসরিজ।' },
  { key: 'home-kitchen', name: 'ঘর ও রান্না', slug: 'home-kitchen', icon: 'home', image: 'ec-kettle', description: 'রান্নাঘর, বাতি আর বিছানার দরকারি জিনিস।' },
  { key: 'beauty', name: 'বিউটি', slug: 'beauty', icon: 'sparkles', image: 'ec-serum', description: 'স্কিনকেয়ার আর মেকআপ।' },
  { key: 'sports', name: 'খেলাধুলা', slug: 'sports', icon: 'activity', image: 'ec-sneaker', description: 'দৌড়, ব্যায়াম আর ফিটনেসের সঙ্গী।' },
  { key: 'books-stationery', name: 'বই ও স্টেশনারি', slug: 'books-stationery', icon: 'book', image: 'ec-notebook', description: 'নোটবুক, কলম আর পড়ার জিনিস।' }
]

export const ATTRIBUTES = [
  { key: 'color', name: 'রং', slug: 'color', terms: [{ name: 'কালো', slug: 'black', swatch: '#1f2937' }, { name: 'নীল', slug: 'blue', swatch: '#2563eb' }, { name: 'গোলাপি', slug: 'pink', swatch: '#ec4899' }] },
  { key: 'size', name: 'সাইজ', slug: 'size', terms: [{ name: 'S', slug: 's' }, { name: 'M', slug: 'm' }, { name: 'L', slug: 'l' }, { name: 'XL', slug: 'xl' }] }
]

const R = {
  rafi: { author: 'রাফি হাসান', email: 'rafi.demo@example.com' },
  mim: { author: 'মীম চৌধুরী', email: 'mim.demo@example.com' },
  sohel: { author: 'সোহেল রানা', email: 'sohel.demo@example.com' },
  tania: { author: 'তানিয়া আক্তার', email: 'tania.demo@example.com' }
}

const warranty = text => `<h3>ওয়ারেন্টি ও সার্ভিস</h3><p>${text}</p>`

export const PRODUCTS = [
  {
    key: 'ec-headphones', name: 'নয়েজ ক্যানসেলিং ওয়্যারলেস হেডফোন', slug: 'wireless-anc-headphones', sku: 'EC-AU-001',
    categories: ['electronics'], image: 'ec-headphones', gallery: ['ec-headphones-alt'], regular: 3200, sale: 2490, saleDays: 3, stock: 14, featured: true, sales: 312,
    short: '৪০ ঘণ্টা ব্যাটারি, অ্যাক্টিভ নয়েজ ক্যানসেলিং আর ভাঁজ করা যায় এমন নকশা।',
    description: '<p>বাসের হর্ন কিংবা অফিসের কোলাহল, এক বোতামে সব চুপ। নরম কুশন কানে চাপ দেয় না, তাই সারাদিন পরে থাকা যায়।</p><ul><li>অ্যাক্টিভ নয়েজ ক্যানসেলিং</li><li>৪০ ঘণ্টা ব্যাটারি, ১০ মিনিটে ৫ ঘণ্টার চার্জ</li><li>ব্লুটুথ ৫.৩, দুটি ডিভাইসে একসঙ্গে</li></ul>' + warranty('১ বছরের অফিশিয়াল ওয়ারেন্টি।'),
    specs: [['ব্যাটারি', '৪০ ঘণ্টা'], ['সংযোগ', 'ব্লুটুথ ৫.৩, ৩.৫ মিমি'], ['ওজন', '২৫০ গ্রাম'], ['ওয়ারেন্টি', '১ বছর']], weight: '0.25',
    reviews: [{ ...R.rafi, rating: 5, title: 'দামে সেরা', text: 'নয়েজ ক্যানসেলিং সত্যিই কাজ করে। অফিসে এখন শান্তিতে কাজ করি।', days: 6 }, { ...R.mim, rating: 4, title: 'আরামদায়ক', text: 'লম্বা সময় পরলেও কান ব্যথা করে না। কেসটা আরেকটু ছোট হলে ভালো হতো।', days: 18 }]
  },
  {
    key: 'ec-watch', type: 'variable', name: 'স্মার্টওয়াচ সিরিজ ৫ (AMOLED)', slug: 'smartwatch-series-5', sku: 'EC-WT-002',
    categories: ['electronics', 'sports'], image: 'ec-watch', gallery: ['ec-watch-pink'], featured: true, sales: 198,
    short: '১.৯৬ ইঞ্চি AMOLED ডিসপ্লে, হার্ট রেট ও ঘুম ট্র্যাকিং, ৭ দিনের ব্যাটারি।',
    description: '<p>হাঁটা, দৌড়, ঘুম আর হৃৎস্পন্দন, সারাদিনের হিসাব কবজিতে। ফোনের কল আর মেসেজও দেখা যায় সরাসরি।</p><ul><li>১০০টির বেশি স্পোর্টস মোড</li><li>পানি প্রতিরোধী (5ATM)</li><li>৭ দিনের ব্যাটারি</li></ul>' + warranty('১ বছরের অফিশিয়াল ওয়ারেন্টি।'),
    specs: [['ডিসপ্লে', '১.৯৬ ইঞ্চি AMOLED'], ['ব্যাটারি', '৭ দিন'], ['পানি প্রতিরোধ', '5ATM']], weight: '0.05',
    attributes: [{ attribute: 'color', terms: ['black', 'blue', 'pink'] }],
    variations: [
      { attributes: { color: 'black' }, regular: 4800, sale: 3990, stock: 12, sku: 'EC-WT-002-K' },
      { attributes: { color: 'blue' }, regular: 4800, sale: 3990, stock: 9, sku: 'EC-WT-002-B' },
      { attributes: { color: 'pink' }, regular: 4800, sale: 3990, stock: 5, sku: 'EC-WT-002-P', image: 'ec-watch-pink' }
    ],
    reviews: [{ ...R.sohel, rating: 5, title: 'ব্যাটারি দারুণ', text: 'এক চার্জে পুরো সপ্তাহ চলে। ঘুমের হিসাবটা বেশ নির্ভুল।', days: 9 }, { ...R.tania, rating: 4, title: 'দেখতে সুন্দর', text: 'গোলাপি রংটা খুব মানিয়েছে। স্ট্র্যাপ আরেকটু নরম হলে ভালো হতো।', days: 25 }]
  },
  {
    key: 'ec-speaker', name: 'পোর্টেবল ব্লুটুথ স্পিকার মিনি', slug: 'portable-bluetooth-speaker', sku: 'EC-AU-003',
    categories: ['electronics'], image: 'ec-speaker', regular: 1800, sale: 1450, saleDays: 3, stock: 18, sales: 141,
    short: 'পানি প্রতিরোধী, ১২ ঘণ্টা প্লেব্যাক আর জোরালো বেস।',
    description: '<p>পিকনিক, ছাদ কিংবা গোসলখানা, যেখানে খুশি গান। IPX7 পানি প্রতিরোধী, ঝুলিয়ে রাখার ফিতাসহ।</p>' + warranty('৬ মাসের ওয়ারেন্টি।'),
    specs: [['প্লেব্যাক', '১২ ঘণ্টা'], ['পানি প্রতিরোধ', 'IPX7'], ['আউটপুট', '১০ ওয়াট']], weight: '0.4',
    reviews: [{ ...R.rafi, rating: 4, title: 'ছোট কিন্তু জোরালো', text: 'আকারের তুলনায় আওয়াজ অনেক। বেসও ভালো।', days: 14 }]
  },
  {
    key: 'ec-powerbank', name: 'ফাস্ট চার্জিং পাওয়ার ব্যাংক ২০০০০ mAh', slug: 'power-bank-20000', sku: 'EC-AC-004',
    categories: ['electronics'], image: 'ec-powerbank', regular: 1890, stock: 40, sales: 405,
    short: '২২.৫ ওয়াট ফাস্ট চার্জিং, একসঙ্গে দুটি ডিভাইস চার্জ।',
    description: '<p>ফোন তিনবার পুরো চার্জ হয় এক চার্জে। USB-C দিয়ে দ্রুত নিজেও চার্জ হয়।</p>' + warranty('১ বছরের ওয়ারেন্টি।'),
    specs: [['ক্ষমতা', '২০০০০ mAh'], ['আউটপুট', '২২.৫ ওয়াট'], ['পোর্ট', 'USB-C, ২ × USB-A']], weight: '0.42',
    reviews: [{ ...R.sohel, rating: 5, title: 'ভ্রমণের সঙ্গী', text: 'তিন দিনের ট্যুরে ফোন আর ঘড়ি দুটোই চার্জ দিয়েছি।', days: 30 }, { ...R.mim, rating: 5, title: 'দ্রুত চার্জ', text: 'আধা ঘণ্টায় ফোন অর্ধেক চার্জ হয়ে যায়।', days: 41 }]
  },
  {
    key: 'ec-phone', name: 'স্মার্টফোন X১০ (৮/১২৮ জিবি)', slug: 'smartphone-x10', sku: 'EC-PH-005',
    categories: ['electronics'], image: 'ec-phone', gallery: ['ec-phone-alt'], regular: 21500, sale: 18990, saleDays: 5, stock: 8, featured: true, sales: 512,
    short: '৬.৬ ইঞ্চি ডিসপ্লে, ৫০ মেগাপিক্সেল ক্যামেরা আর ৫০০০ mAh ব্যাটারি।',
    description: '<p>উজ্জ্বল ৯০ হার্জ ডিসপ্লে, রাতেও পরিষ্কার ছবি আর সারাদিনের ব্যাটারি।</p><ul><li>৮ জিবি র‍্যাম, ১২৮ জিবি স্টোরেজ</li><li>৩৩ ওয়াট ফাস্ট চার্জিং</li></ul>' + warranty('১ বছরের অফিশিয়াল ওয়ারেন্টি।'),
    specs: [['ডিসপ্লে', '৬.৬ ইঞ্চি, ৯০ হার্জ'], ['ক্যামেরা', '৫০ + ২ মেগাপিক্সেল'], ['ব্যাটারি', '৫০০০ mAh']], weight: '0.19',
    reviews: [{ ...R.tania, rating: 5, title: 'ক্যামেরা চমৎকার', text: 'রাতের ছবিও বেশ পরিষ্কার আসে। ব্যাটারি দেড় দিন চলে।', days: 4 }, { ...R.rafi, rating: 4, title: 'দামে ভালো', text: 'এই দামে এমন ডিসপ্লে পাওয়া কঠিন।', days: 16 }]
  },
  {
    key: 'ec-shirt', type: 'variable', name: 'পুরুষদের কটন ক্যাজুয়াল শার্ট', slug: 'mens-cotton-casual-shirt', sku: 'EC-FS-006',
    categories: ['fashion'], image: 'ec-shirt', gallery: ['ec-shirt-alt'], sales: 88,
    short: '১০০% সুতি কাপড়, আরামদায়ক রেগুলার ফিট।',
    description: '<p>অফিস কিংবা আড্ডা, দুই জায়গাতেই মানানসই। নরম সুতি কাপড় গরমেও আরাম দেয়।</p><h3>যত্ন</h3><p>ঠান্ডা পানিতে ধুয়ে ছায়ায় শুকান।</p>',
    specs: [['কাপড়', '১০০% সুতি'], ['ফিট', 'রেগুলার'], ['তৈরি', 'বাংলাদেশ']], weight: '0.25',
    attributes: [{ attribute: 'size', terms: ['s', 'm', 'l', 'xl'] }],
    variations: [
      { attributes: { size: 's' }, regular: 1200, sale: 950, stock: 10, sku: 'EC-FS-006-S' },
      { attributes: { size: 'm' }, regular: 1200, sale: 950, stock: 15, sku: 'EC-FS-006-M' },
      { attributes: { size: 'l' }, regular: 1200, sale: 950, stock: 12, sku: 'EC-FS-006-L' },
      { attributes: { size: 'xl' }, regular: 1200, sale: 950, stock: 3, sku: 'EC-FS-006-XL' }
    ],
    reviews: [{ ...R.sohel, rating: 4, title: 'কাপড় ভালো', text: 'ধোয়ার পরও রং ঠিক আছে। সাইজ চার্ট মেনে নিলে ঠিকঠাক হয়।', days: 12 }]
  },
  {
    key: 'ec-sneaker', name: 'হালকা রানিং স্নিকার্স', slug: 'lightweight-running-sneakers', sku: 'EC-FS-007',
    categories: ['fashion', 'sports'], image: 'ec-sneaker', gallery: ['ec-sneaker-alt'], regular: 3400, sale: 2850, saleDays: 3, stock: 22, featured: true, sales: 233,
    short: 'নরম কুশন সোল, শ্বাস নিতে পারে এমন মেশ আপার।',
    description: '<p>সকালের দৌড় থেকে সারাদিনের হাঁটাহাঁটি, পায়ে থাকবে হালকা আর আরাম।</p>',
    specs: [['আপার', 'মেশ'], ['সোল', 'EVA কুশন'], ['ওজন', 'প্রতি জোড়া ৫২০ গ্রাম']], weight: '0.6',
    reviews: [{ ...R.rafi, rating: 5, title: 'দৌড়ের জন্য দারুণ', text: 'খুব হালকা, পাঁচ কিলোমিটার দৌড়েও পা ব্যথা করেনি।', days: 8 }, { ...R.tania, rating: 5, title: 'রংটা সুন্দর', text: 'অফিসেও পরি, সবাই প্রশংসা করে।', days: 21 }]
  },
  {
    key: 'ec-handbag', name: 'লেদার টোট হ্যান্ডব্যাগ', slug: 'leather-tote-handbag', sku: 'EC-FS-008',
    categories: ['fashion'], image: 'ec-handbag', regular: 2200, stock: 11, sales: 67,
    short: 'আসল চামড়া, ভেতরে তিনটি পকেট আর মজবুত হাতল।',
    description: '<p>ল্যাপটপ, ডায়েরি আর দিনের সব দরকারি জিনিস একসঙ্গে। ব্যবহারে ব্যবহারে চামড়ার রং আরো সুন্দর হয়।</p>',
    specs: [['উপকরণ', 'আসল চামড়া'], ['মাপ', '৩৮ × ২৮ × ১২ সেমি']], weight: '0.7',
    reviews: [{ ...R.mim, rating: 5, title: 'মান অসাধারণ', text: 'সেলাই খুব যত্নে করা। ১৪ ইঞ্চি ল্যাপটপ ধরে যায়।', days: 33 }]
  },
  {
    key: 'ec-sunglasses', name: 'পোলারাইজড সানগ্লাস ক্লাসিক', slug: 'polarized-classic-sunglasses', sku: 'EC-FS-009',
    categories: ['fashion'], image: 'ec-sunglasses', regular: 990, sale: 790, stock: 30, sales: 54,
    short: 'UV৪০০ সুরক্ষা, হালকা ফ্রেম।',
    description: '<p>রোদে চোখ আরাম পায়, ঝলক কমে। হালকা ফ্রেম সারাদিন পরলেও ভারী লাগে না।</p>',
    specs: [['লেন্স', 'পোলারাইজড, UV৪০০'], ['ফ্রেম', 'TR90']], weight: '0.03'
  },
  {
    key: 'ec-pan', name: 'নন-স্টিক ফ্রাইপ্যান ২৬ সেমি', slug: 'non-stick-frypan-26cm', sku: 'EC-HK-010',
    categories: ['home-kitchen'], image: 'ec-pan', regular: 1500, sale: 1250, saleDays: 3, stock: 16, sales: 176,
    short: 'গ্রানাইট কোটিং, গ্যাস ও ইন্ডাকশনে চলে।',
    description: '<p>অল্প তেলে রান্না, খাবার লেগে যায় না, ধোয়াও সহজ।</p><h3>যত্ন</h3><p>ধাতব খুন্তি ব্যবহার না করাই ভালো।</p>',
    specs: [['মাপ', '২৬ সেমি'], ['কোটিং', 'গ্রানাইট নন-স্টিক'], ['চুলা', 'গ্যাস, ইন্ডাকশন']], weight: '0.9',
    reviews: [{ ...R.tania, rating: 5, title: 'খাবার লেগে যায় না', text: 'ডিম ভাজি থেকে মাছ, সব সহজে উল্টানো যায়।', days: 10 }]
  },
  {
    key: 'ec-lamp', name: 'LED টেবিল ল্যাম্প (৩ মোড)', slug: 'led-table-lamp', sku: 'EC-HK-011',
    categories: ['home-kitchen', 'books-stationery'], image: 'ec-lamp', regular: 990, stock: 4, sales: 92,
    short: 'চোখের আরামের জন্য তিন রঙের আলো, USB চার্জিং।',
    description: '<p>পড়া, লেখা বা রাতের কাজ, আলো বদলান দরকারমতো। এক চার্জে ১০ ঘণ্টা।</p>',
    specs: [['আলো', '৩ রং, ৫ মাত্রা'], ['ব্যাটারি', '১০ ঘণ্টা']], weight: '0.5'
  },
  {
    key: 'ec-kettle', name: 'ইলেকট্রিক কেটলি ১.৮ লিটার', slug: 'electric-kettle-1-8l', sku: 'EC-HK-012',
    categories: ['home-kitchen'], image: 'ec-kettle', regular: 1900, sale: 1650, stock: 20, featured: true, sales: 260,
    short: 'স্টেইনলেস স্টিল, অটো শাট-অফ, ৫ মিনিটে পানি গরম।',
    description: '<p>সকালের চা থেকে নুডলস, পানি গরম হবে মিনিটেই। পানি ফুটলে নিজে থেকেই বন্ধ হয়।</p>' + warranty('১ বছরের ওয়ারেন্টি।'),
    specs: [['ধারণক্ষমতা', '১.৮ লিটার'], ['ক্ষমতা', '১৫০০ ওয়াট']], weight: '1.1',
    reviews: [{ ...R.sohel, rating: 5, title: 'খুব দ্রুত', text: 'পাঁচ মিনিটেও লাগে না। ঢাকনা শক্ত করে আটকায়।', days: 19 }]
  },
  {
    key: 'ec-bedsheet', name: 'কটন বেডশিট সেট (কিং সাইজ)', slug: 'cotton-bedsheet-set-king', sku: 'EC-HK-013',
    categories: ['home-kitchen'], image: 'ec-bedsheet', regular: 1950, stock: 9, sales: 71,
    short: 'একটি চাদর ও দুটি বালিশের কভার, রং ওঠে না।',
    description: '<p>নরম সুতির চাদর, ধোয়ার পরও কোমল থাকে।</p>',
    specs: [['মাপ', '৯০ × ১০০ ইঞ্চি'], ['সেটে', '১ চাদর, ২ বালিশের কভার']], weight: '1.2'
  },
  {
    key: 'ec-serum', name: 'ভিটামিন সি ব্রাইটেনিং সিরাম', slug: 'ec-vitamin-c-serum', sku: 'EC-BT-014',
    categories: ['beauty'], image: 'ec-serum', regular: 1500, sale: 1250, stock: 25, sales: 140,
    short: '১৫% ভিটামিন সি ত্বকের নিষ্প্রভতা আর দাগ কমায়।',
    description: '<p>সকালে ময়েশ্চারাইজারের আগে দুই-তিন ফোঁটা। নিয়মিত ব্যবহারে ত্বক উজ্জ্বল হয়।</p>',
    specs: [['পরিমাণ', '৩০ মিলি'], ['ত্বক', 'সব ধরনের']], weight: '0.08'
  },
  {
    key: 'ec-lipstick', name: 'ভেলভেট ম্যাট লিপস্টিক', slug: 'ec-velvet-matte-lipstick', sku: 'EC-BT-015',
    categories: ['beauty'], image: 'ec-lipstick', regular: 650, stock: 35, sales: 98,
    short: 'এক টানেই গাঢ় রং, ১২ ঘণ্টা টেকে।',
    description: '<p>হালকা টেক্সচার, ঠোঁট শুকায় না।</p>',
    specs: [['পরিমাণ', '৩.৫ গ্রাম'], ['ফিনিশ', 'ম্যাট']], weight: '0.02'
  },
  {
    key: 'ec-notebook', name: 'হার্ডকভার নোটবুক A5', slug: 'ec-hardcover-notebook-a5', sku: 'EC-BS-016',
    categories: ['books-stationery'], image: 'ec-notebook', regular: 450, sale: 380, stock: 50, sales: 120,
    short: '১৬০ পাতা, ১০০ জিএসএম মসৃণ কাগজ।',
    description: '<p>অফিস, ক্লাস বা ডায়েরি, প্রতিদিনের লেখার জন্য।</p>',
    specs: [['পাতা', '১৬০'], ['কাগজ', '১০০ জিএসএম']], weight: '0.32'
  },
  {
    key: 'ec-pens', name: 'জেল কলম সেট (৫টি)', slug: 'ec-gel-pen-set', sku: 'EC-BS-017',
    categories: ['books-stationery'], image: 'ec-pens', regular: 260, stock: 80, sales: 75,
    short: 'পাঁচ রঙের জেল কলম, ০.৫ মিমি নিব।',
    description: '<p>দ্রুত শুকানো কালি, নরম গ্রিপ।</p>',
    specs: [['নিব', '০.৫ মিমি'], ['সংখ্যা', '৫টি']], weight: '0.08'
  }
]

const cats = keys => keys.map(key => `@term:product_cat:${key}`)
const products = keys => keys.map(key => `@product:${key}`)

export const HOME = {
  key: 'home-ecommerce',
  title: 'হোম',
  slug: 'home-ecommerce',
  template: 'templates/template-home-ecommerce.php',
  acfGroup: 'group_lk_home_ecommerce',
  acf: {
    he_hero_section: {
      show_departments: 1,
      menu_title: 'সব ডিপার্টমেন্ট',
      slides: [
        { eyebrow: 'মেগা ইলেকট্রনিক্স সেল', title: 'হেডফোন, ফোন আর গ্যাজেটে ৪০% পর্যন্ত ছাড়', tone: 'accent', text: 'সেরা ব্র্যান্ডের আসল পণ্য, ১ বছরের ওয়ারেন্টিসহ।', link: link('এখনই কিনুন', '/product-category/electronics'), image: '@image:ec-hero-1' },
        { eyebrow: 'নতুন সিজন', title: 'স্টাইলে নতুন কালেকশন, দাম নাগালে', tone: 'sale', text: 'স্নিকার্স, ব্যাগ আর পোশাক। প্রতি সপ্তাহে নতুন ডিজাইন।', link: link('কালেকশন দেখুন', '/product-category/fashion'), image: '@image:ec-hero-2' },
        { eyebrow: 'ঘরের দরকারি জিনিস', title: 'রান্নাঘর সাজান কম খরচে', tone: 'success', text: 'কেটলি, ফ্রাইপ্যান আর কুকওয়্যারে বিশেষ অফার।', link: link('অফার দেখুন', '/product-category/home-kitchen'), image: '@image:ec-hero-3' }
      ],
      side_banners: [
        { eyebrow: '−১৭% ছাড়', title: 'স্মার্টওয়াচ কালেকশন', image: '@image:ec-banner-1', link: '/product/smartwatch-series-5', tone: 'accent' },
        { eyebrow: 'নতুন এসেছে', title: 'ব্লুটুথ স্পিকার', image: '@image:ec-banner-2', link: '/product/portable-bluetooth-speaker', tone: 'success' }
      ]
    },
    he_services_section: {
      enabled: 1,
      items: [
        { icon: 'truck', title: 'সারা দেশে ডেলিভারি', text: '৳১,০০০-এর বেশি অর্ডারে ফ্রি' },
        { icon: 'rotate-ccw', title: '৭ দিনে রিটার্ন', text: 'ঝামেলা ছাড়া পণ্য ফেরত' },
        { icon: 'shield-check', title: '১০০% আসল পণ্য', text: 'অফিশিয়াল ওয়ারেন্টিসহ' },
        { icon: 'credit-card', title: 'নিরাপদ পেমেন্ট', text: 'বিকাশ, নগদ, কার্ড, ক্যাশ' }
      ]
    },
    he_departments_section: { enabled: 1, title: 'ডিপার্টমেন্ট', categories: cats(['electronics', 'fashion', 'home-kitchen', 'beauty', 'sports', 'books-stationery']) },
    he_deals_section: { enabled: 1, title: 'আজকের ডিল', ends_at: '@date:+3', products: products(['ec-headphones', 'ec-watch', 'ec-speaker', 'ec-sneaker', 'ec-pan', 'ec-phone']) },
    he_tabs_section: {
      enabled: 1, title: 'জনপ্রিয় পণ্য', new_label: 'নতুন এসেছে', best_label: 'বেস্টসেলার', top_label: 'সেরা রেটিং',
      new_products: products(['ec-phone', 'ec-shirt', 'ec-lamp', 'ec-handbag', 'ec-speaker', 'ec-bedsheet', 'ec-sunglasses', 'ec-powerbank']),
      best_products: [],
      top_products: []
    },
    he_wide_banner: { enabled: 1, eyebrow: '১১.১১ মেগা সেল', coupon_code: 'MEGA15', title: 'সব অর্ডারে অতিরিক্ত ১৫% ছাড়', text: 'চেকআউটে কুপন কোড ব্যবহার করুন। ৳১,৫০০-এর বেশি অর্ডারে।', link: link('কেনাকাটা শুরু করুন', '/shop') },
    he_category_rows: [
      { category: '@term:product_cat:electronics', title: '', icon: '', banner_eyebrow: 'গ্যাজেট উইক', banner_title: 'ফোন আর অডিওতে ৩০% পর্যন্ত ছাড়', tone: 'accent', banner_image: '@image:ec-dept-1', products: products(['ec-phone', 'ec-headphones', 'ec-watch', 'ec-speaker', 'ec-powerbank']) },
      { category: '@term:product_cat:fashion', title: '', icon: '', banner_eyebrow: 'নতুন কালেকশন', banner_title: 'শীতের আগে নিজেকে সাজান নতুন করে', tone: 'sale', banner_image: '@image:ec-dept-2', products: [] }
    ],
    he_promo_banners: [
      { eyebrow: 'কম্বো অফার', title: 'কেটলি + ফ্রাইপ্যান একসঙ্গে', image: '@image:ec-kettle', link: '/product-category/home-kitchen', tone: 'success' },
      { eyebrow: 'নতুন স্নিকার্স', title: 'প্রথম অর্ডারে ১০% ছাড়', image: '@image:ec-sneaker', link: '/product/lightweight-running-sneakers', tone: 'sale' },
      { eyebrow: 'ফ্ল্যাশ ডিল', title: 'পাওয়ার ব্যাংক মাত্র ৳১,৮৯০', image: '@image:ec-powerbank', link: '/product/power-bank-20000', tone: 'star' }
    ],
    he_lists_section: { enabled: 1, top_title: 'সেরা রেটিং', new_title: 'নতুন এসেছে', sale_title: 'অফারে আছে' },
    he_brands_section: { enabled: 1, title: 'জনপ্রিয় ব্র্যান্ড', brands: ['সুরধ্বনি', 'চলন্তিকা', 'ঘরকন্না', 'আলোকিত', 'টেকবাংলা', 'তাঁতঘর'].map(name => ({ name, logo: '', link: '' })) },
    he_show_recently_viewed: 1,
    he_subscribe_section: { enabled: 1, title: 'অফারের খবর সবার আগে', text: 'সাবস্ক্রাইব করলেই প্রথম অর্ডারে ছাড়ের কুপন। সপ্তাহে একটির বেশি ইমেইল নয়।', success_message: 'সাবস্ক্রাইব করার জন্য ধন্যবাদ!' }
  }
}

export const SHOP_MENU = ['electronics', 'fashion', 'home-kitchen', 'beauty', 'sports', 'books-stationery']

export const THEME = {
  style: { preset: 'ecommerce', accent_color: '' },
  announcement: { enabled: 1, dismissible: 1, icon: 'zap', text: '১১.১১ মেগা সেল চলছে: কোড MEGA15 দিলে আরও ১৫% ছাড়', link_label: 'অফার দেখুন', link_url: '/shop', starts_at: '', ends_at: '' }
}

export const COUPON = { code: 'MEGA15', amount: 15, type: 'percent', minimum: 1500, description: 'ডেমো কুপন: ৳১,৫০০-এর বেশি অর্ডারে ১৫% ছাড়' }
