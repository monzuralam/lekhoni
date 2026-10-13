// Demo pages (with their ACF fields), menus, Theme Settings and store
// settings. References are resolved by the importer:
//   @image:<key>  @product:<key>  @term:<taxonomy>:<key>  @page:<key>
//   @date:+<days>  (site time, from the moment of import)
// ACF values are keyed by field name; `acfGroup` says which field group
// (wp-content/themes/lekhoni/inc/acf-*.php) the names belong to.

const link = (title, url) => ({ title, url, target: '' })

export const HOME_FIELDS = {
  slider_section: {
    slider_items: [
      { eyebrow: 'নতুন কালেকশন ২০২৬', title: 'লেখার টেবিল সাজান নিজের মতো করে', description: 'নোটবুক, মগ আর কলম। প্রতিদিনের লেখালেখির সঙ্গী এখন এক জায়গায়।', image: '@image:hero-1', buy_now_url: '/product/lekhoni-classic-notebook', collection_url: '/product-category/notebooks' },
      { eyebrow: 'উপহারের মৌসুম', title: 'প্রিয়জনের জন্য যত্নে সাজানো গিফট বক্স', description: 'সুন্দর মোড়ক, শুভেচ্ছা কার্ড আর বাছাই করা পণ্য। অর্ডার করলেই পৌঁছে যাবে।', image: '@image:hero-2', buy_now_url: '/product/premium-gift-box', collection_url: '/product-category/gift-boxes' },
      { eyebrow: 'ডেস্ক সেটআপ', title: 'গোছানো ডেস্ক, গোছানো ভাবনা', description: 'কাঠের অর্গানাইজার আর সাপ্তাহিক প্ল্যানারে কাজ এগোবে পরিকল্পনা মেনে।', image: '@image:hero-3', buy_now_url: '/product/wooden-desk-organizer', collection_url: '/product-category/desk-accessories' }
    ]
  },
  trust_section: {
    items: [
      { icon: 'truck', title: 'দ্রুত ডেলিভারি', description: 'ঢাকায় ২৪ ঘণ্টায়, সারা দেশে ৩ থেকে ৫ দিনে' },
      { icon: 'shield-check', title: 'ক্যাশ অন ডেলিভারি', description: 'পণ্য হাতে পেয়ে তারপর মূল্য পরিশোধ' },
      { icon: 'rotate-ccw', title: '৭ দিনে সহজ রিটার্ন', description: 'পছন্দ না হলে ফেরত দিন, কোনো প্রশ্ন ছাড়াই' },
      { icon: 'headset', title: '২৪/৭ সাপোর্ট', description: 'যেকোনো প্রয়োজনে ফোন বা মেসেজ করুন' }
    ]
  },
  category_section: {
    categories: ['notebooks', 'pens', 'mugs', 'bags', 'stickers', 'gift-boxes'].map(key => `@term:product_cat:${key}`)
  },
  flash_sale_section: {
    title: 'ডিল অফ দ্য ডে',
    ends_at: '@date:+3',
    products: ['sticker-pack', 'ceramic-mug', 'classic-notebook', 'fountain-pen', 'dotted-journal', 'gift-box'].map(key => `@product:${key}`)
  },
  featured_section: {
    title: 'নির্বাচিত পণ্য',
    new_label: 'নতুন এসেছে',
    best_label: 'বেস্টসেলার',
    sale_label: 'অফারে',
    new_products: ['canvas-tote', 'desk-organizer', 'travel-mug', 'weekly-planner'].map(key => `@product:${key}`),
    best_products: ['sticker-pack', 'ceramic-mug', 'classic-notebook', 'gel-pen-set'].map(key => `@product:${key}`),
    sale_products: ['dotted-journal', 'fountain-pen', 'mini-tote', 'gift-box'].map(key => `@product:${key}`)
  },
  promo_section: {
    title: 'চলতি অফার',
    banners: [
      { eyebrow: 'সীমিত সময়ের অফার', title: 'স্টেশনারি কালেকশন: ২০% ছাড়', style: 'accent', text: 'নোটবুক, কলম আর প্ল্যানারে বিশেষ ছাড় চলছে এই মাসজুড়ে।', link: link('অফার দেখুন', '/shop'), image: '@image:product-2' },
      { eyebrow: 'উপহার', title: 'গিফট বক্স: প্রিয়জনের জন্য', style: 'sale', text: 'জন্মদিন কিংবা সাফল্য উদ্‌যাপন, তৈরি বক্সেই উপহার প্রস্তুত।', link: link('গিফট বক্স দেখুন', '/product-category/gift-boxes'), image: '@image:product-7' }
    ]
  },
  spotlight_section: {
    eyebrow: 'এই সপ্তাহের সেরা',
    product: ['@product:gift-box'],
    highlights: [
      { text: 'নোটবুক, কলম সেট, মগ ও স্টিকার প্যাক একসঙ্গে' },
      { text: 'হাতে লেখা শুভেচ্ছা কার্ড যোগ করার সুযোগ' },
      { text: 'আলাদা কিনলে যা খরচ, তার চেয়ে ৳২৫০ সাশ্রয়' }
    ]
  },
  best_sellers_section: {
    title: 'বেস্টসেলার',
    products: ['sticker-pack', 'ceramic-mug', 'classic-notebook', 'travel-mug', 'gel-pen-set', 'gift-box', 'dotted-journal', 'canvas-tote'].map(key => `@product:${key}`)
  },
  reviews_section: {
    title: 'ক্রেতারা যা বলছেন',
    source: 'auto',
    testimonials: [
      { name: 'সাদিয়া রহমান', location: 'ঢাকা', rating: 5, verified: 1, text: 'বোনের জন্মদিনে গিফট বক্স পাঠিয়েছিলাম। মোড়ক আর কার্ড দেখে সে খুবই খুশি।' },
      { name: 'আরিফুল ইসলাম', location: 'চট্টগ্রাম', rating: 5, verified: 1, text: 'নোটবুকের কাগজের মান অসাধারণ। ফাউন্টেন পেনেও কালি ছড়ায় না।' },
      { name: 'নুসরাত জাহান', location: 'সিলেট', rating: 4, verified: 1, text: 'ডেলিভারি সময়মতো পেয়েছি, প্যাকিংও যত্ন করে করা। আবার কিনব।' }
    ]
  },
  brands_section: {
    title: 'যেসব ব্র্যান্ড আমাদের সঙ্গে আছে',
    brands: ['কাগজকলম', 'নীলখাতা', 'চায়ের কাপ', 'সুতোবোনা', 'কাঠঠোকরা', 'ঝরনা কালি'].map(name => ({ name, logo: '', link: '' }))
  },
  blog_section: {
    title: 'কেনার আগে পড়ুন',
    link_label: 'সব গাইড',
    category: ['@term:category:buying-guide'],
    count: 3
  },
  subscribe_section: {
    title: 'নতুন অফারের খবর সরাসরি ইনবক্সে',
    text: 'নতুন পণ্য, ছাড় আর লেখার খবর সবার আগে পেতে সাবস্ক্রাইব করুন।',
    success_message: 'সাবস্ক্রাইব করার জন্য ধন্যবাদ!',
    note: 'মাসে দু-একটির বেশি ইমেইল নয়। যেকোনো সময় আনসাবস্ক্রাইব করা যায়।'
  }
}

export const MENUS = [
  {
    key: 'primary',
    name: 'প্রধান মেনু',
    location: 'primary',
    items: [
      { title: 'হোম', url: '/' },
      {
        title: 'শপ',
        url: '/shop',
        children: ['notebooks', 'pens', 'mugs', 'bags', 'gift-boxes'].map(key => ({ term: `product_cat:${key}` }))
      },
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

export const THEME_SETTINGS = {
  social_links: [
    { network: 'facebook', url: 'https://www.facebook.com/' },
    { network: 'instagram', url: 'https://www.instagram.com/' },
    { network: 'youtube', url: 'https://www.youtube.com/' }
  ],
  footer: {
    topics: { enabled: 1, title: 'বিষয়', source: 'product_categories', count: 8 }
  }
}

// Applied only when "Store settings" is ticked
export const STORE = {
  currency: 'BDT',
  currency_position: 'left',
  decimals: 0,
  thousand_separator: ',',
  decimal_separator: '.',
  default_country: 'BD:BD-13',
  shipping_zone: {
    name: 'বাংলাদেশ',
    country: 'BD',
    flat_rate: { title: 'হোম ডেলিভারি', cost: 60 },
    free_shipping: { title: 'ফ্রি ডেলিভারি', min_amount: 1000 }
  },
  cod: { title: 'ক্যাশ অন ডেলিভারি', description: 'পণ্য হাতে পেয়ে ডেলিভারি কর্মীকে নগদ টাকা দিন।' },
  coupon: { code: 'LEKHONI10', amount: 10, type: 'percent', minimum: 500, description: 'ডেমো কুপন: ৳৫০০-এর বেশি অর্ডারে ১০% ছাড়' }
}
