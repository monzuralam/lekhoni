// Demo shop: categories, attributes and products (from design/*.html).
// Prices in taka. Image keys refer to demo-images.mjs.

export const PRODUCT_CATEGORIES = [
  { key: 'notebooks', name: 'নোটবুক', slug: 'notebooks', image: 'category-1', description: 'হার্ডকভার নোটবুক আর জার্নাল, প্রতিদিনের লেখার জন্য।' },
  { key: 'pens', name: 'কলম', slug: 'pens', image: 'category-2', description: 'জেল, বলপয়েন্ট আর ফাউন্টেন পেন।' },
  { key: 'mugs', name: 'মগ', slug: 'mugs', image: 'category-3', description: 'সিরামিক আর ট্রাভেল মগ।' },
  { key: 'bags', name: 'ব্যাগ', slug: 'bags', image: 'category-4', description: 'মজবুত ক্যানভাসের টোট ব্যাগ।' },
  { key: 'stickers', name: 'স্টিকার', slug: 'stickers', image: 'category-5', description: 'ল্যাপটপ আর নোটবুক সাজানোর ওয়াটারপ্রুফ স্টিকার।' },
  { key: 'gift-boxes', name: 'গিফট বক্স', slug: 'gift-boxes', image: 'category-6', description: 'প্রিয়জনের জন্য সাজানো উপহারের বক্স।' },
  { key: 'desk-accessories', name: 'ডেস্ক অ্যাক্সেসরিজ', slug: 'desk-accessories', image: 'product-6', description: 'ডেস্ক গোছানোর অর্গানাইজার আর অ্যাক্সেসরিজ।' },
  { key: 'planners', name: 'প্ল্যানার', slug: 'planners', image: 'product-8', description: 'সাপ্তাহিক আর মাসিক পরিকল্পনার ডায়েরি।' }
]

// Global attributes used for variations
export const ATTRIBUTES = [
  { key: 'ruling', name: 'রুলিং', slug: 'ruling', terms: [{ name: 'রুলড', slug: 'ruled' }, { name: 'ডটেড', slug: 'dotted' }, { name: 'সাদা', slug: 'plain' }] },
  { key: 'wrap-color', name: 'মোড়কের রং', slug: 'wrap-color', terms: [{ name: 'গোলাপি', slug: 'pink' }, { name: 'সবুজ', slug: 'green' }, { name: 'নীল', slug: 'blue' }] },
  { key: 'box-size', name: 'বক্সের আকার', slug: 'box-size', terms: [{ name: 'ছোট', slug: 'small' }, { name: 'মাঝারি', slug: 'medium' }, { name: 'বড়', slug: 'large' }] }
]

// Shared review texts (from design/product.html and in the same voice)
const R = {
  sadia: { author: 'সাদিয়া রহমান', email: 'sadia.demo@example.com' },
  ariful: { author: 'আরিফুল ইসলাম', email: 'ariful.demo@example.com' },
  nusrat: { author: 'নুসরাত জাহান', email: 'nusrat.demo@example.com' },
  tanvir: { author: 'তানভীর হাসান', email: 'tanvir.demo@example.com' },
  mitu: { author: 'মিতু আক্তার', email: 'mitu.demo@example.com' }
}

const care = (text) => `<h3>যত্ন নেওয়ার নিয়ম</h3><p>${text}</p>`

export const PRODUCTS = [
  {
    key: 'classic-notebook',
    type: 'variable',
    name: 'লেখনী ক্লাসিক নোটবুক',
    slug: 'lekhoni-classic-notebook',
    sku: 'LK-NB-001',
    categories: ['notebooks'],
    image: 'product-1',
    gallery: ['product-1-alt'],
    short: '১৬০ পাতার হার্ডকভার নোটবুক। ১০০ জিএসএম মসৃণ কাগজে কালি ছড়ায় না, সঙ্গে ফিতা বুকমার্ক।',
    description: '<h3>যত্নে তৈরি, প্রতিদিনের জন্য</h3><p>লেখনী ক্লাসিক নোটবুক বানানো হয়েছে তাঁদের কথা ভেবে, যাঁরা এখনো হাতে লিখতে ভালোবাসেন। ১০০ জিএসএম মসৃণ কাগজে জেল, বলপয়েন্ট বা ফাউন্টেন পেন, যেকোনো কলমেই লেখা যায় স্বচ্ছন্দে।</p><ul><li>সেলাই করা বাঁধাই, তাই পুরো খুলে সমান করে রাখা যায়</li><li>ফিতা বুকমার্ক ও ইলাস্টিক ব্যান্ড</li><li>পেছনের মলাটে ছোট কাগজ রাখার পকেট</li><li>পরিবেশবান্ধব, অ্যাসিড-মুক্ত কাগজ</li></ul>' + care('সরাসরি রোদ ও আর্দ্রতা থেকে দূরে রাখুন। মলাটে দাগ লাগলে হালকা ভেজা কাপড় দিয়ে মুছে নিন।'),
    specs: [['পাতার সংখ্যা', '১৬০ পাতা (৮০ শিট)'], ['কাগজ', '১০০ জিএসএম, অ্যাসিড-মুক্ত'], ['আকার', 'A5 (১৪.৮ × ২১ সেমি)'], ['মলাট', 'হার্ডকভার, কাপড়ের বাঁধাই'], ['তৈরি', 'বাংলাদেশ']],
    weight: '0.32',
    attributes: [{ attribute: 'ruling', terms: ['ruled', 'dotted', 'plain'] }],
    variations: [
      { attributes: { ruling: 'ruled' }, regular: 450, sale: 350, stock: 40, sku: 'LK-NB-001-R' },
      { attributes: { ruling: 'dotted' }, regular: 450, sale: 350, stock: 25, sku: 'LK-NB-001-D', image: 'product-1-alt' },
      { attributes: { ruling: 'plain' }, regular: 450, sale: 350, stock: 4, sku: 'LK-NB-001-P' }
    ],
    featured: true,
    sales: 124,
    reviews: [
      { ...R.sadia, rating: 5, title: 'কাগজের মান অসাধারণ', text: 'ফাউন্টেন পেন দিয়ে লিখি, কালি একদম ছড়ায় না। বাঁধাইও মজবুত, পুরো খুলে সমান করে রাখা যায়।', days: 11 },
      { ...R.ariful, rating: 5, title: 'অফিসের জন্য একদম ঠিক', text: 'মিটিংয়ের নোট রাখার জন্য নিয়েছি। আকারটা ব্যাগে সহজে ধরে, ফিতা বুকমার্কটা কাজের।', days: 22 },
      { ...R.nusrat, rating: 4, title: 'ভালো, তবে রঙ আরো চাই', text: 'মান নিয়ে কোনো অভিযোগ নেই। শুধু মলাটের আরো কয়েকটা রঙ থাকলে ভালো হতো।', days: 34 }
    ]
  },
  {
    key: 'gel-pen-set',
    name: 'মসৃণ জেল কলম সেট (৫টি)',
    slug: 'smooth-gel-pen-set',
    sku: 'LK-PN-002',
    categories: ['pens'],
    image: 'product-2',
    gallery: ['product-2-alt'],
    regular: 260,
    sale: 220,
    stock: 60,
    short: 'পাঁচ রঙের জেল কলম। ০.৫ মিমি নিব, দ্রুত শুকায় এবং দীর্ঘ সময় লিখলেও হাত ব্যথা করে না।',
    description: '<p>নোট নেওয়া, রঙ দিয়ে দাগানো কিংবা জার্নাল সাজানো, সবকিছুর জন্য পাঁচটি উজ্জ্বল রং। নরম রাবার গ্রিপ লম্বা সময় লেখাতেও আরাম দেয়।</p><ul><li>০.৫ মিমি সূক্ষ্ম নিব</li><li>দ্রুত শুকানো কালি, হাতে লাগে না</li><li>কালো, নীল, লাল, সবুজ ও বেগুনি</li></ul>',
    specs: [['নিব', '০.৫ মিমি'], ['কালি', 'জেল, দ্রুত শুকায়'], ['সংখ্যা', '৫টি কলম']],
    weight: '0.08',
    sales: 89,
    reviews: [
      { ...R.mitu, rating: 5, title: 'রংগুলো সুন্দর', text: 'জার্নাল সাজাতে কিনেছি। রংগুলো উজ্জ্বল, কালি একবারও আটকায়নি।', days: 6 },
      { ...R.tanvir, rating: 4, title: 'দামে ভালো', text: 'লেখা মসৃণ। কালোটা একটু তাড়াতাড়ি শেষ হয়েছে, বাকিগুলো ঠিক আছে।', days: 19 }
    ]
  },
  {
    key: 'ceramic-mug',
    name: 'সিরামিক মগ "চা ও কোড"',
    slug: 'ceramic-mug-cha-o-code',
    sku: 'LK-MG-003',
    categories: ['mugs'],
    image: 'product-3',
    gallery: ['product-3-alt'],
    regular: 550,
    sale: 450,
    saleDays: 10,
    stock: 35,
    short: '৩৫০ মিলি সিরামিক মগ। মাইক্রোওয়েভ ও ডিশওয়াশারে ব্যবহার করা যায়, প্রিন্ট ওঠে না।',
    description: '<p>সকালের চা আর রাতের কোডিং, দুটোরই সঙ্গী। মোটা দেয়ালের সিরামিক মগে চা অনেকক্ষণ গরম থাকে।</p><ul><li>৩৫০ মিলি</li><li>মাইক্রোওয়েভ ও ডিশওয়াশার নিরাপদ</li><li>উচ্চ তাপে পোড়ানো প্রিন্ট, ধুলেও ওঠে না</li></ul>',
    specs: [['ধারণক্ষমতা', '৩৫০ মিলি'], ['উপকরণ', 'সিরামিক'], ['যত্ন', 'ডিশওয়াশারে ধোয়া যায়']],
    weight: '0.35',
    featured: true,
    sales: 210,
    reviews: [
      { ...R.tanvir, rating: 5, title: 'ডেস্কের প্রিয় মগ', text: 'প্রিন্টটা দারুণ, অফিসে সবাই জিজ্ঞেস করে কোথা থেকে কিনেছি।', days: 4 },
      { ...R.sadia, rating: 5, title: 'উপহার দিয়েছি', text: 'ভাইকে উপহার দিয়েছি, প্যাকিং খুব যত্ন করে করা ছিল।', days: 27 }
    ]
  },
  {
    key: 'canvas-tote',
    name: 'ক্যানভাস টোট ব্যাগ',
    slug: 'canvas-tote-bag',
    sku: 'LK-BG-004',
    categories: ['bags'],
    image: 'product-4',
    gallery: ['product-4-alt'],
    regular: 380,
    stock: 50,
    short: 'মজবুত সুতি ক্যানভাসের ব্যাগ। ল্যাপটপ, খাতা আর বাজার, সব এক ব্যাগেই ধরে।',
    description: '<p>মোটা সুতি ক্যানভাসে তৈরি, দুই স্তরের সেলাই করা হাতল। ভেতরে ছোট পকেটে চাবি আর ফোন রাখা যায়।</p><ul><li>১৫ ইঞ্চি পর্যন্ত ল্যাপটপ ধরে</li><li>ভেতরে জিপার পকেট</li><li>ধুয়ে আবার ব্যবহার করা যায়</li></ul>',
    specs: [['উপকরণ', '১২ আউন্স সুতি ক্যানভাস'], ['মাপ', '৩৮ × ৪২ সেমি'], ['হাতল', '৬০ সেমি']],
    weight: '0.28',
    sales: 56,
    reviews: [{ ...R.nusrat, rating: 5, title: 'বেশ মজবুত', text: 'প্রতিদিন অফিসে নিই, তিন মাসেও সেলাই একটুও খোলেনি।', days: 15 }]
  },
  {
    key: 'sticker-pack',
    name: 'ডেভেলপার স্টিকার প্যাক',
    slug: 'developer-sticker-pack',
    sku: 'LK-ST-005',
    categories: ['stickers'],
    image: 'product-5',
    gallery: ['product-5-alt'],
    regular: 150,
    sale: 120,
    saleDays: 7,
    stock: 120,
    short: '১২টি ওয়াটারপ্রুফ ভিনাইল স্টিকার। ল্যাপটপ, বোতল বা নোটবুকে লাগানোর জন্য।',
    description: '<p>বাংলা হরফ আর কোডের মজার মিশেলে আঁকা বারোটি স্টিকার। ম্যাট ভিনাইলে ছাপা, পানি বা রোদে রং ফিকে হয় না।</p><ul><li>১২টি আলাদা নকশা</li><li>ওয়াটারপ্রুফ ম্যাট ভিনাইল</li><li>তুলে ফেললে আঠার দাগ থাকে না</li></ul>',
    specs: [['সংখ্যা', '১২টি স্টিকার'], ['উপকরণ', 'ম্যাট ভিনাইল'], ['আকার', '৫ থেকে ৮ সেমি']],
    weight: '0.03',
    featured: true,
    sales: 302,
    reviews: [
      { ...R.ariful, rating: 5, title: 'ল্যাপটপ এখন রঙিন', text: 'নকশাগুলো মজার, ছাপার মানও ভালো। আরেক প্যাক অর্ডার করব।', days: 3 },
      { ...R.mitu, rating: 4, title: 'সুন্দর', text: 'সবগুলোই পছন্দ হয়েছে, শুধু আরেকটু বড় হলে ভালো হতো।', days: 41 }
    ]
  },
  {
    key: 'desk-organizer',
    name: 'কাঠের ডেস্ক অর্গানাইজার',
    slug: 'wooden-desk-organizer',
    sku: 'LK-DK-006',
    categories: ['desk-accessories'],
    image: 'product-6',
    gallery: ['product-6-alt'],
    regular: 850,
    stock: 15,
    short: 'মেহগনি কাঠের তৈরি অর্গানাইজার। কলম, ফোন আর ছোট নোটের জন্য আলাদা খোপ।',
    description: '<p>এক টুকরো মেহগনি কাঠ থেকে খোদাই করা অর্গানাইজার। কলম, ফোন, স্টিকি নোট আর চশমা, সব থাকে হাতের কাছে।</p>' + care('শুকনো কাপড়ে মুছুন। মাঝে মাঝে কাঠের তেল লাগালে রং উজ্জ্বল থাকে।'),
    specs: [['উপকরণ', 'মেহগনি কাঠ'], ['মাপ', '২৪ × ১০ × ৯ সেমি'], ['খোপ', '৪টি']],
    weight: '0.6',
    sales: 41,
    reviews: [{ ...R.tanvir, rating: 4, title: 'ডেস্ক গোছানো থাকে', text: 'কাঠের ফিনিশিং সুন্দর। ফোনের খোপটা আরেকটু চওড়া হলে ভালো হতো।', days: 9 }]
  },
  {
    key: 'gift-box',
    type: 'variable',
    name: 'প্রিমিয়াম গিফট বক্স',
    slug: 'premium-gift-box',
    sku: 'LK-GB-007',
    categories: ['gift-boxes'],
    image: 'product-7',
    gallery: ['product-7-green', 'product-7-blue'],
    short: 'নোটবুক, কলম সেট, মগ আর স্টিকার একসঙ্গে। সুন্দর মোড়কে, শুভেচ্ছা কার্ডসহ।',
    description: '<p>প্রিয়জনের জন্য যত্নে সাজানো উপহার। বাছাই করা পণ্য, পছন্দের মোড়ক আর হাতে লেখা শুভেচ্ছা কার্ড, অর্ডার করলেই পৌঁছে যাবে।</p><ul><li>নোটবুক, কলম সেট, মগ ও স্টিকার প্যাক একসঙ্গে</li><li>হাতে লেখা শুভেচ্ছা কার্ড যোগ করার সুযোগ</li><li>আলাদা কিনলে যা খরচ, তার চেয়ে ৳২৫০ সাশ্রয়</li></ul>',
    specs: [['ভেতরে যা আছে', 'নোটবুক, জেল কলম সেট, মগ, স্টিকার প্যাক'], ['শুভেচ্ছা কার্ড', 'বিনামূল্যে']],
    weight: '1.1',
    attributes: [
      { attribute: 'wrap-color', terms: ['pink', 'green', 'blue'] },
      { attribute: 'box-size', terms: ['small', 'medium', 'large'] }
    ],
    // Every colour in every size; the price follows the size
    variations: ['pink', 'green', 'blue'].flatMap(color =>
      [['small', 1100, 950], ['medium', 1500, 1250], ['large', 1900, 1650]].map(([size, regular, sale]) => ({
        attributes: { 'wrap-color': color, 'box-size': size },
        regular,
        sale,
        saleDays: 14,
        stock: size === 'large' ? 6 : 12,
        sku: `LK-GB-007-${color[0].toUpperCase()}${size[0].toUpperCase()}`,
        image: color === 'pink' ? 'product-7' : `product-7-${color}`
      }))
    ),
    featured: true,
    sales: 77,
    reviews: [
      { ...R.sadia, rating: 5, title: 'উপহারটা সবার পছন্দ হয়েছে', text: 'বোনের জন্মদিনে পাঠিয়েছিলাম। মোড়ক আর কার্ড দেখে সে খুবই খুশি।', days: 8 },
      { ...R.ariful, rating: 5, title: 'সময়মতো পৌঁছেছে', text: 'পরের দিনই ডেলিভারি পেয়েছি, সবকিছু সুন্দরভাবে সাজানো ছিল।', days: 25 }
    ]
  },
  {
    key: 'weekly-planner',
    name: '২০২৭ সাপ্তাহিক প্ল্যানার',
    slug: 'weekly-planner-2027',
    sku: 'LK-PL-008',
    categories: ['planners'],
    image: 'product-8',
    gallery: ['product-8-alt'],
    regular: 550,
    stock: 0,
    short: 'সপ্তাহভিত্তিক পরিকল্পনার ডায়েরি। লক্ষ্য, অভ্যাস ট্র্যাকার আর মাসিক পর্যালোচনার পাতা আছে।',
    description: '<p>প্রতিটি সপ্তাহ দুই পাতায়, সঙ্গে মাসের শুরুতে লক্ষ্য ঠিক করার আর শেষে পর্যালোচনার পাতা। অভ্যাস ট্র্যাকার দিয়ে ছোট ছোট অগ্রগতিও চোখে পড়বে।</p>',
    specs: [['পাতা', '১৯২ পাতা'], ['আকার', 'A5'], ['সময়কাল', 'জানুয়ারি থেকে ডিসেম্বর ২০২৭']],
    weight: '0.4',
    sales: 38,
    reviews: [{ ...R.nusrat, rating: 4, title: 'গোছানো নকশা', text: 'অভ্যাস ট্র্যাকারটা খুব কাজের। নতুন স্টক এলে আরেকটা নেব।', days: 52 }]
  },
  {
    key: 'dotted-journal',
    name: 'ডটেড জার্নাল A5',
    slug: 'dotted-journal-a5',
    sku: 'LK-NB-009',
    categories: ['notebooks'],
    image: 'product-1-alt',
    gallery: ['product-1'],
    regular: 480,
    sale: 420,
    saleDays: 5,
    stock: 30,
    short: 'ডট গ্রিড পাতার জার্নাল। বুলেট জার্নাল, স্কেচ আর ওয়্যারফ্রেম আঁকার জন্য উপযুক্ত।',
    description: '<p>৫ মিমি ডট গ্রিডে লেখা, আঁকা আর তালিকা বানানো, সবই সহজ। নম্বর দেওয়া পাতা আর সূচিপত্রের পাতা আছে।</p>',
    specs: [['পাতার সংখ্যা', '১৯২ পাতা'], ['গ্রিড', '৫ মিমি ডট'], ['কাগজ', '১২০ জিএসএম']],
    weight: '0.36',
    sales: 64,
    reviews: [{ ...R.mitu, rating: 5, title: 'বুলেট জার্নালের জন্য সেরা', text: 'ডটগুলো হালকা, লেখার পর চোখে পড়ে না। কাগজও মোটা।', days: 13 }]
  },
  {
    key: 'fountain-pen',
    name: 'ক্লাসিক ফাউন্টেন পেন',
    slug: 'classic-fountain-pen',
    sku: 'LK-PN-010',
    categories: ['pens'],
    image: 'product-2',
    gallery: ['product-2-alt'],
    regular: 800,
    sale: 680,
    saleDays: 12,
    stock: 18,
    short: 'স্টিলের নিবসহ ফাউন্টেন পেন। রিফিলযোগ্য কনভার্টার আর দুটি কালির কার্তুজ সঙ্গে।',
    description: '<p>হাতের লেখায় ফিরে যাওয়ার সবচেয়ে সুন্দর উপায়। মাঝারি স্টিলের নিব মসৃণভাবে চলে, কনভার্টার দিয়ে বোতলের কালিও ভরা যায়।</p>',
    specs: [['নিব', 'মাঝারি, স্টেইনলেস স্টিল'], ['ভরার পদ্ধতি', 'কার্তুজ বা কনভার্টার'], ['সঙ্গে', '২টি কালো কার্তুজ']],
    weight: '0.05',
    sales: 52,
    reviews: [{ ...R.tanvir, rating: 5, title: 'প্রথম ফাউন্টেন পেন', text: 'নতুনদের জন্য দারুণ। কালি আটকায় না, লিখতে আরাম।', days: 17 }]
  },
  {
    key: 'travel-mug',
    name: 'ট্রাভেল মগ ৪০০ মিলি',
    slug: 'travel-mug-400ml',
    sku: 'LK-MG-011',
    categories: ['mugs'],
    image: 'product-3-alt',
    gallery: ['product-3'],
    regular: 720,
    stock: 22,
    short: 'ডাবল-ওয়াল স্টিলের মগ। ছয় ঘণ্টা পর্যন্ত গরম থাকে, ঢাকনা থেকে চুইয়ে পড়ে না।',
    description: '<p>অফিস, ক্লাস কিংবা দীর্ঘ যাত্রা, গরম চা থাকবে গরম আর ঠান্ডা পানি থাকবে ঠান্ডা। এক হাতে খোলা যায় এমন ঢাকনা।</p>',
    specs: [['ধারণক্ষমতা', '৪০০ মিলি'], ['উপকরণ', 'ডাবল-ওয়াল স্টেইনলেস স্টিল'], ['তাপ ধরে রাখে', '৬ ঘণ্টা পর্যন্ত']],
    weight: '0.3',
    sales: 93,
    reviews: [{ ...R.ariful, rating: 4, title: 'চা গরম থাকে', text: 'সকালে ভরে নিলে দুপুর পর্যন্ত গরম থাকে। ঢাকনাটা একটু শক্ত।', days: 30 }]
  },
  {
    key: 'mini-tote',
    name: 'মিনি টোট ব্যাগ',
    slug: 'mini-tote-bag',
    sku: 'LK-BG-012',
    categories: ['bags'],
    image: 'product-4-alt',
    gallery: ['product-4'],
    regular: 320,
    sale: 260,
    stock: 3,
    short: 'ছোট আকারের ক্যানভাস ব্যাগ। টিফিন বক্স বা বই বহনের জন্য হালকা ও মজবুত।',
    description: '<p>টিফিন বক্স, একটি বই আর পানির বোতল, এর বেশি লাগে না এমন দিনের জন্য।</p>',
    specs: [['উপকরণ', 'সুতি ক্যানভাস'], ['মাপ', '২৮ × ৩০ সেমি']],
    weight: '0.18',
    sales: 27,
    reviews: [{ ...R.sadia, rating: 4, title: 'ছোট কিন্তু কাজের', text: 'টিফিন আর বই নিয়ে যাওয়ার জন্য একদম ঠিক মাপ।', days: 20 }]
  }
]
