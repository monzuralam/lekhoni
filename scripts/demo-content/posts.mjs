// Demo blog: authors, categories, tags and posts (from design/index.html,
// blog.html and home-shop.html). The first post's body is the article in
// design/single.html (added by build-demo.mjs). `days` = days before import.

export const AUTHORS = [
  {
    key: 'rahim',
    login: 'rahim-ahmed',
    email: 'rahim.demo@example.com',
    first: 'রহিম',
    last: 'আহমেদ',
    bio: 'কোড লেখেন, কোড নিয়ে লেখেন। লেখনীর টিউটোরিয়ালগুলোর বেশিরভাগ তাঁর হাতে তৈরি।',
    profile: { job_title: 'ফ্রন্টএন্ড ডেভেলপার ও লেখক', experience: '৮ বছর' }
  },
  {
    key: 'karima',
    login: 'karima-sultana',
    email: 'karima.demo@example.com',
    first: 'করিমা',
    last: 'সুলতানা',
    bio: 'লেখনীর নকশা ও সম্পাদনা দেখেন। বাংলা টাইপোগ্রাফি তাঁর প্রিয় বিষয়।',
    profile: { job_title: 'ডিজাইনার ও সম্পাদক', experience: '৬ বছর' }
  }
]

export const POST_CATEGORIES = [
  { key: 'wordpress', name: 'ওয়ার্ডপ্রেস', slug: 'wordpress' },
  { key: 'graphql', name: 'GraphQL', slug: 'graphql' },
  { key: 'nextjs', name: 'Next.js', slug: 'nextjs' },
  { key: 'design', name: 'ডিজাইন', slug: 'design' },
  { key: 'buying-guide', name: 'কেনার গাইড', slug: 'buying-guide' }
]

export const POST_TAGS = [
  { key: 'headless', name: 'হেডলেস', slug: 'headless' },
  { key: 'wpgraphql', name: 'WPGraphQL', slug: 'wpgraphql' },
  { key: 'react', name: 'React', slug: 'react' },
  { key: 'typography', name: 'টাইপোগ্রাফি', slug: 'typography' },
  { key: 'woocommerce', name: 'WooCommerce', slug: 'woocommerce' },
  { key: 'seo', name: 'SEO', slug: 'seo' },
  { key: 'notebook', name: 'নোটবুক', slug: 'notebook' },
  { key: 'pen', name: 'কলম', slug: 'pen' },
  { key: 'gift', name: 'উপহার', slug: 'gift' }
]

const p = (...paragraphs) => paragraphs.map(text => `<p>${text}</p>`).join('\n')
const h2 = text => `<h2>${text}</h2>`
const list = (...items) => `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`

export const POSTS = [
  {
    key: 'what-is-headless-wordpress',
    title: 'হেডলেস ওয়ার্ডপ্রেস কী এবং কেন ব্যবহার করবেন',
    slug: 'what-is-headless-wordpress',
    category: 'wordpress',
    tags: ['headless', 'wpgraphql'],
    image: 'cover-1',
    author: 'rahim',
    days: 15,
    sticky: true,
    excerpt: 'কনটেন্ট থাকবে ওয়ার্ডপ্রেসে, আর সাইট চলবে Next.js-এ। এই ব্যবস্থায় গতি, নিরাপত্তা আর ডিজাইনের স্বাধীনতা কীভাবে বাড়ে, সহজ ভাষায় জেনে নিন।',
    content: '@single'
  },
  {
    key: 'first-wpgraphql-query',
    title: 'WPGraphQL দিয়ে প্রথম কোয়েরি লেখা',
    slug: 'first-wpgraphql-query',
    category: 'graphql',
    tags: ['wpgraphql'],
    image: 'cover-2',
    author: 'karima',
    days: 19,
    excerpt: 'প্লাগইন চালু করা থেকে শুরু করে পোস্টের তালিকা আনা পর্যন্ত, GraphiQL IDE-তে হাতে-কলমে প্রথম কোয়েরি লিখে ফেলুন।',
    content: [
      p('WPGraphQL চালু করলেই ওয়ার্ডপ্রেসের সব কনটেন্ট একটি GraphQL এন্ডপয়েন্টে পাওয়া যায়। কোয়েরি লেখার আগে দেখে নেওয়া যাক কোথা থেকে শুরু করবেন।'),
      h2('প্লাগইন চালু করুন'),
      p('প্লাগইন যোগ করার পর অ্যাডমিন মেনুতে GraphQL নামে নতুন একটি অংশ আসবে। সেখানে GraphiQL IDE খুললেই বাঁ দিকে পুরো স্কিমা দেখা যায়।'),
      h2('প্রথম কোয়েরি'),
      '<pre><code>query RecentPosts {\n  posts(first: 3) {\n    nodes { title uri }\n  }\n}</code></pre>',
      p('চালালেই ডান দিকে তিনটি পোস্টের শিরোনাম আর লিংক আসবে। ঠিক যা চেয়েছেন, তার বেশি কিছু নয়, এটাই GraphQL-এর সুবিধা।')
    ].join('\n')
  },
  {
    key: 'nextjs-app-router-blog',
    title: 'Next.js App Router-এ ব্লগ তৈরি: ধাপে ধাপে',
    slug: 'nextjs-app-router-blog',
    category: 'nextjs',
    tags: ['react', 'headless'],
    image: 'cover-3',
    author: 'rahim',
    days: 24,
    excerpt: 'সার্ভার কম্পোনেন্ট, ডায়নামিক রাউট আর generateStaticParams ব্যবহার করে একটি পূর্ণাঙ্গ ব্লগের কাঠামো দাঁড় করানোর গাইড।',
    content: [
      p('App Router-এ প্রতিটি ফোল্ডার একটি রাউট, আর পাতাগুলো ডিফল্টভাবে সার্ভার কম্পোনেন্ট। ব্লগের জন্য এর চেয়ে সুবিধাজনক কাঠামো খুব কমই আছে।'),
      h2('রাউটের কাঠামো'),
      list('<code>app/blog/page.tsx</code>: সব লেখার তালিকা', '<code>app/blog/[slug]/page.tsx</code>: একটি লেখা', '<code>app/blog/[slug]/loading.tsx</code>: লোড হওয়ার সময়ের কাঠামো'),
      h2('আগে থেকে পাতা তৈরি'),
      p('<code>generateStaticParams</code> দিয়ে সব লেখার slug আগে থেকে জানিয়ে দিলে বিল্ডের সময়ই পাতাগুলো তৈরি হয়ে থাকে। নতুন লেখা এলে রিভ্যালিডেশন বাকিটা সামলায়।')
    ].join('\n')
  },
  {
    key: 'bangla-web-fonts',
    title: 'বাংলা ওয়েবসাইটের জন্য সঠিক ফন্ট বাছাই',
    slug: 'bangla-web-fonts',
    category: 'design',
    tags: ['typography'],
    image: 'cover-4',
    author: 'karima',
    days: 31,
    excerpt: 'যুক্তাক্ষর, লাইন-হাইট আর ওজনের ভারসাম্য ঠিক না হলে বাংলা লেখা পড়তে কষ্ট হয়। কোন ফন্ট কোথায় মানায়, দেখে নিন।',
    content: [
      p('বাংলা হরফের মাত্রা, যুক্তাক্ষর আর কার-চিহ্ন লাতিন হরফের চেয়ে বেশি জায়গা নেয়। তাই ইংরেজি সাইটের সেটিং হুবহু বসালে লেখা ঘিঞ্জি দেখায়।'),
      h2('শিরোনাম আর মূল লেখা আলাদা করুন'),
      p('শিরোনামে সেরিফ ধাঁচের ফন্ট আর মূল লেখায় পরিষ্কার স্যান্স-সেরিফ ভালো মানায়। দুটোর ওজন আর উচ্চতা যেন কাছাকাছি থাকে।'),
      h2('লাইন-হাইট বাড়ান'),
      p('বাংলা মূল লেখায় ১.৭ থেকে ১.৮ লাইন-হাইট রাখলে ওপর-নিচের কার-চিহ্ন একে অপরের গায়ে লাগে না।')
    ].join('\n')
  },
  {
    key: 'woographql-headless-shop',
    title: 'WooGraphQL দিয়ে হেডলেস দোকান: কার্ট থেকে চেকআউট',
    slug: 'woographql-headless-shop',
    category: 'graphql',
    tags: ['woocommerce', 'wpgraphql'],
    image: 'cover-2',
    author: 'rahim',
    days: 38,
    excerpt: 'সেশন টোকেন সামলানো, addToCart মিউটেশন আর চেকআউটের ধাপগুলো একটি বাস্তব উদাহরণ দিয়ে বোঝানো হয়েছে।',
    content: [
      p('হেডলেস দোকানে কার্ট থাকে সার্ভারে, আর ব্রাউজার শুধু একটি সেশন টোকেন রাখে। সেই টোকেনই প্রতিটি অনুরোধে বলে দেয় কার্টটি কার।'),
      h2('সেশন টোকেন'),
      p('প্রথম <code>addToCart</code> মিউটেশনের উত্তরে <code>woocommerce-session</code> হেডার আসে। সেটি httpOnly কুকিতে রেখে পরের সব অনুরোধে পাঠালেই কার্ট টিকে থাকে।'),
      h2('চেকআউট'),
      p('<code>checkout</code> মিউটেশনে ঠিকানা, পেমেন্ট পদ্ধতি আর শিপিং দিলেই অর্ডার তৈরি হয়। লগইন করা ক্রেতার অর্ডার তাঁর অ্যাকাউন্টে যুক্ত হয়ে যায়।')
    ].join('\n')
  },
  {
    key: 'isr-on-demand-revalidation',
    title: 'ISR ও অন-ডিমান্ড রিভ্যালিডেশন সহজ ভাষায়',
    slug: 'isr-on-demand-revalidation',
    category: 'nextjs',
    tags: ['headless'],
    image: 'cover-3',
    author: 'karima',
    days: 45,
    excerpt: 'নতুন পোস্ট প্রকাশের সঙ্গে সঙ্গে সাইট আপডেট হবে, অথচ পুরো সাইট আবার বিল্ড করতে হবে না। ওয়েবহুক দিয়ে সেটা কীভাবে করবেন।',
    content: [
      p('আগে থেকে তৈরি পাতা দ্রুত, কিন্তু পুরোনো হয়ে যেতে পারে। রিভ্যালিডেশন এই দুইয়ের মাঝে ভারসাম্য আনে।'),
      h2('সময় ধরে রিভ্যালিডেশন'),
      p('প্রতি কয়েক মিনিটে পাতা নতুন করে তৈরি হয়। সহজ, তবে পরিবর্তন দেখতে কিছুক্ষণ অপেক্ষা করতে হয়।'),
      h2('অন-ডিমান্ড রিভ্যালিডেশন'),
      p('ওয়ার্ডপ্রেসে লেখা সেভ হলেই একটি ওয়েবহুক ফ্রন্টএন্ডকে জানায়, আর শুধু সংশ্লিষ্ট ডেটা নতুন করে আনা হয়। পরিবর্তন দেখা যায় সঙ্গে সঙ্গেই।')
    ].join('\n')
  },
  {
    key: 'tailwind-v4-design-tokens',
    title: 'Tailwind CSS v4-এ ডিজাইন টোকেন সাজানো',
    slug: 'tailwind-v4-design-tokens',
    category: 'design',
    tags: ['typography'],
    image: 'cover-4',
    author: 'rahim',
    days: 53,
    excerpt: 'কনফিগ ফাইল ছাড়াই @theme দিয়ে রঙ, ফন্ট আর ব্রেকপয়েন্ট সাজান, আর টোকেন বদলে ডার্ক মোড চালু করুন।',
    content: [
      p('Tailwind v4-এ টোকেন থাকে সরাসরি CSS-এ। <code>@theme</code> ব্লকে রঙ বা ফন্ট লিখলেই সেগুলো ইউটিলিটি ক্লাস হয়ে যায়।'),
      h2('রঙের টোকেন'),
      '<pre><code>@theme {\n  --color-ink: #1f2937;\n  --color-accent: #0f766e;\n}</code></pre>',
      h2('ডার্ক মোড'),
      p('একই টোকেন ডার্ক মোডে নতুন মান পেলেই পুরো সাইটের রং বদলে যায়। আলাদা আলাদা ক্লাস লিখতে হয় না।')
    ].join('\n')
  },
  {
    key: 'headless-seo',
    title: 'হেডলেস সাইটে SEO: মেটাডেটা থেকে সাইটম্যাপ',
    slug: 'headless-seo',
    category: 'wordpress',
    tags: ['seo', 'headless'],
    image: 'cover-1',
    author: 'karima',
    days: 60,
    excerpt: 'ওয়ার্ডপ্রেসের SEO প্লাগইনের ডেটা GraphQL দিয়ে এনে Next.js-এর Metadata API-তে বসানোর পুরো প্রক্রিয়া।',
    content: [
      p('হেডলেস সাইটে থিম নেই, তাই SEO প্লাগইন নিজে থেকে মেটা ট্যাগ বসাতে পারে না। কাজটি করতে হয় ফ্রন্টএন্ডে।'),
      h2('মেটাডেটা'),
      p('প্রতিটি পাতার <code>generateMetadata</code> ফাংশনে শিরোনাম, বিবরণ আর Open Graph ছবি দিন। ডেটা আসবে GraphQL থেকে।'),
      h2('সাইটম্যাপ'),
      p('<code>app/sitemap.ts</code> ফাইলে সব পোস্ট আর পণ্যের লিংক তালিকা করে দিলেই সার্চ ইঞ্জিন নতুন পাতা খুঁজে পায়।')
    ].join('\n')
  },
  {
    key: 'acf-fields-in-graphql',
    title: 'ACF ফিল্ড GraphQL-এ আনার সহজ উপায়',
    slug: 'acf-fields-in-graphql',
    category: 'graphql',
    tags: ['wpgraphql'],
    image: 'cover-2',
    author: 'rahim',
    days: 68,
    excerpt: 'কাস্টম ফিল্ড গ্রুপ স্কিমায় দেখানো, ফ্র্যাগমেন্ট দিয়ে গুছিয়ে আনা এবং কম্পোনেন্টে ব্যবহার করার কৌশল।',
    content: [
      p('WPGraphQL for ACF চালু থাকলে প্রতিটি ফিল্ড গ্রুপ GraphQL-এ একটি টাইপ হয়ে যায়। শুধু গ্রুপের সেটিংয়ে "Show in GraphQL" চালু রাখতে হয়।'),
      h2('ফ্র্যাগমেন্ট'),
      p('একই ফিল্ড কয়েক জায়গায় লাগলে ফ্র্যাগমেন্ট লিখে রাখুন। কোয়েরি ছোট থাকে, ভুলও কম হয়।'),
      h2('ছবি আর সম্পর্ক'),
      p('ছবি আর সম্পর্কিত পোস্ট আসে <code>node</code> বা <code>nodes</code> হিসেবে, তাই প্রয়োজনীয় ফিল্ডগুলো আলাদা করে চেয়ে নিতে হয়।')
    ].join('\n')
  },
  {
    key: 'how-to-choose-a-notebook',
    title: 'কেনার আগে পড়ুন: ভালো নোটবুক চেনার ৫ উপায়',
    slug: 'how-to-choose-a-notebook',
    category: 'buying-guide',
    tags: ['notebook'],
    image: 'cover-4',
    author: 'karima',
    days: 11,
    excerpt: 'কাগজের ওজন, বাঁধাই আর রুলিং দেখে কীভাবে বুঝবেন নোটবুকটি আপনার কাজের জন্য ঠিক কি না।',
    content: [
      p('দেখতে সব নোটবুক প্রায় একই রকম। কিন্তু কয়েকটি জিনিস খেয়াল করলেই বোঝা যায় কোনটি দীর্ঘদিন সঙ্গী হবে।'),
      h2('যা দেখবেন'),
      '<ol><li><strong>কাগজের ওজন:</strong> ৮০ জিএসএমের বেশি হলে কালি অন্য পাতায় যায় না।</li><li><strong>বাঁধাই:</strong> সেলাই করা বাঁধাই পুরো খুলে সমান রাখা যায়।</li><li><strong>রুলিং:</strong> লেখার জন্য রুলড, আঁকা ও তালিকার জন্য ডটেড।</li><li><strong>আকার:</strong> ব্যাগে রাখার জন্য A5 সবচেয়ে সুবিধাজনক।</li><li><strong>মলাট:</strong> হার্ডকভার হাতে রেখে লেখার সময় ভরসা দেয়।</li></ol>',
      p('আমাদের <a href="/product/lekhoni-classic-notebook">ক্লাসিক নোটবুকে</a> এই পাঁচটিই মিলবে।')
    ].join('\n')
  },
  {
    key: 'which-pen-suits-you',
    title: 'কোন কলম আপনার লেখার জন্য মানানসই',
    slug: 'which-pen-suits-you',
    category: 'buying-guide',
    tags: ['pen'],
    image: 'cover-1',
    author: 'rahim',
    days: 13,
    excerpt: 'জেল, বলপয়েন্ট না ফাউন্টেন? লেখার ধরন আর কাগজ অনুযায়ী কলম বাছাইয়ের সহজ নিয়ম।',
    content: [
      p('কলম বাছাই নির্ভর করে আপনি কী লেখেন, কত দ্রুত লেখেন আর কোন কাগজে লেখেন তার ওপর।'),
      h2('তিন ধরনের কলম'),
      list('<strong>বলপয়েন্ট:</strong> সব কাগজে চলে, কালি দ্রুত শুকায়', '<strong>জেল:</strong> মসৃণ আর উজ্জ্বল, নোট আর জার্নালের জন্য ভালো', '<strong>ফাউন্টেন:</strong> হাতের লেখা সুন্দর করে, তবে ভালো কাগজ চায়'),
      p('প্রতিদিনের নোটের জন্য <a href="/product/smooth-gel-pen-set">জেল কলম সেট</a>, আর লেখার আনন্দের জন্য <a href="/product/classic-fountain-pen">ফাউন্টেন পেন</a> চেষ্টা করে দেখুন।')
    ].join('\n')
  },
  {
    key: 'gift-box-guide',
    title: 'উপহারে কী দেবেন: গিফট বক্স সাজানোর গাইড',
    slug: 'gift-box-guide',
    category: 'buying-guide',
    tags: ['gift'],
    image: 'cover-3',
    author: 'karima',
    days: 17,
    excerpt: 'বাজেট অনুযায়ী তিন রকম গিফট বক্সের আইডিয়া, সঙ্গে মোড়ক আর শুভেচ্ছা কার্ডের পরামর্শ।',
    content: [
      p('ভালো উপহার দামি হতে হবে এমন নয়। প্রাপকের পছন্দ মাথায় রেখে কয়েকটি জিনিস একসঙ্গে সাজালেই তা মনে রাখার মতো হয়।'),
      h2('বাজেট অনুযায়ী তিন আইডিয়া'),
      list('<strong>৳১,০০০-এর মধ্যে:</strong> নোটবুক, জেল কলম সেট আর স্টিকার', '<strong>৳১,৫০০-এর মধ্যে:</strong> সঙ্গে একটি সিরামিক মগ', '<strong>৳২,০০০-এর মধ্যে:</strong> ফাউন্টেন পেন আর প্ল্যানারসহ বড় বক্স'),
      h2('মোড়ক আর কার্ড'),
      p('প্রাপকের প্রিয় রঙের মোড়ক বেছে নিন, আর কার্ডে দুই লাইন নিজের হাতে লিখুন। আমাদের <a href="/product/premium-gift-box">প্রিমিয়াম গিফট বক্সে</a> তিন রঙ আর তিন আকার আছে।')
    ].join('\n')
  }
]
