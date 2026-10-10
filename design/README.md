# লেখনী

হেডলেস WordPress (WPGraphQL) + WooCommerce (WooGraphQL) + Next.js (App Router) সাইটের জন্য তৈরি স্ট্যাটিক HTML টেমপ্লেট। স্টাইল Tailwind CSS v4 দিয়ে, ইন্টারঅ্যাকশন একটি ভ্যানিলা জাভাস্ক্রিপ্ট ফাইলে। সাইটের সব দৃশ্যমান লেখা বাংলায়, কোডের সব মন্তব্য ইংরেজিতে।

## চালানোর নিয়ম

Node.js ২০ বা তার পরের সংস্করণ লাগবে।

```bash
npm install      # Tailwind CLI ও typography প্লাগইন ইনস্টল
npm run dev      # CSS বিল্ড করে এবং ফাইল বদলালে আবার বিল্ড করে (watch)
npm run build    # প্রোডাকশনের জন্য মিনিফাই করা CSS
```

এরপর যেকোনো `.html` ফাইল ব্রাউজারে খুলুন। VS Code ব্যবহার করলে **Live Server** এক্সটেনশন দিয়ে `demo.html` বা `index.html`-এ ডান ক্লিক করে "Open with Live Server" বেছে নিন, তাহলে সেভ করলেই পাতা রিফ্রেশ হবে।

`assets/css/style.css` ফাইলটি তৈরি হয় `src/input.css` থেকে। এটি হাতে সম্পাদনা করবেন না। জিপে একটি বিল্ড করা কপি দেওয়া আছে, তাই `npm install` ছাড়াও পাতাগুলো খোলা যায়।

শুরু করার সহজ জায়গা: `demo.html` (সব পাতার তালিকা) এবং `styleguide.html` (পুরো ডিজাইন সিস্টেম)।

## ফোল্ডার কাঠামো

```
lekhoni/
├── package.json
├── README.md
├── src/input.css              ডিজাইন টোকেন, কাস্টম ইউটিলিটি, WordPress কনটেন্টের CSS
├── assets/css/style.css       তৈরি হওয়া ফাইল
├── assets/js/main.js          সব ইন্টারঅ্যাকশন (৩০টি ফিচার, প্রতিটি আলাদা init ফাংশনে)
├── assets/img/                SVG প্লেসহোল্ডার
└── *.html                     ২৫টি পাতা
```

## পাতা থেকে Next.js রুট

| HTML ফাইল | Next.js রুট |
| --- | --- |
| `index.html` | `app/page.js` (কনটেন্ট-কেন্দ্রিক হোম) |
| `home-shop.html` | `app/page.js` অথবা `app/shop/page.js` (নিচের টীকা দেখুন) |
| `blog.html` | `app/blog/page.js` |
| `single.html` | `app/blog/[slug]/page.js` |
| `category.html` | `app/blog/category/[slug]/page.js` (ট্যাগের জন্য `app/blog/tag/[slug]/page.js`, একই কম্পোনেন্ট) |
| `author.html` | `app/author/[slug]/page.js` |
| `archive.html` | `app/archive/page.js` |
| `topics.html` | `app/topics/page.js` |
| `search.html` | `app/search/page.js` |
| `about.html` | `app/about/page.js` |
| `contact.html` | `app/contact/page.js` |
| `404.html` | `app/not-found.js` |
| `shop.html` | `app/shop/page.js` (অথবা `app/shop/all/page.js`) |
| `product.html` | `app/shop/[slug]/page.js` |
| `cart.html` | `app/cart/page.js` |
| `checkout.html` | `app/checkout/page.js` |
| `order-received.html` | `app/checkout/order-received/[orderKey]/page.js` |
| `login.html` | `app/login/page.js` |
| `register.html` | `app/register/page.js` |
| `forgot-password.html` | `app/forgot-password/page.js` |
| `reset-password.html` | `app/reset-password/page.js` |
| `account.html` | `app/account/...` (প্রতিটি ট্যাব আলাদা রুট: `orders`, `addresses`, `details`, `wishlist`) |
| `styleguide.html`, `elements.html`, `demo.html` | শুধু ডেভেলপমেন্টের জন্য, প্রোডাকশনে বাদ দেওয়া যায় |

### হোমের দুটি ভ্যারিয়েন্ট

- `index.html`: কনটেন্ট-কেন্দ্রিক হোম (নির্বাচিত লেখা, সাম্প্রতিক লেখা, সাইডবার)।
- `home-shop.html`: ই-কমার্স-কেন্দ্রিক হোম (স্লাইডার, ফ্ল্যাশ সেল, ট্যাব, রিভিউ)।

এর মধ্যে একটিই `app/page.js` হবে। অন্যটি `/shop`-এ শপের ল্যান্ডিং পাতা হিসেবে থাকতে পারে, তখন `shop.html` চলে যাবে `/shop/all`-এ।

## কম্পোনেন্ট থেকে GraphQL

প্রতিটি কম্পোনেন্টের শুরুতে HTML-এ একটি মন্তব্য আছে, যেমন:

```html
<!-- COMPONENT: PostCard (variant: grid) | GraphQL: posts { nodes { title uri excerpt ... } } -->
```

মূল কম্পোনেন্ট ও তাদের ডেটার উৎস:

### কনটেন্ট (WPGraphQL)

| কম্পোনেন্ট | কোয়েরি / ফিল্ড |
| --- | --- |
| SiteHeader, MainMenu | `generalSettings { title }`, `menu(id: "primary", idType: LOCATION) { menuItems { nodes { label uri parentId } } }` |
| SiteFooter | `posts(first: 4)`, `tags(first: 8)`, `menu(id: "footer")` |
| PostCard (grid, list, mini) | `posts { nodes { title uri excerpt dateGmt featuredImage author categories } }` |
| FeaturedPost | `posts(first: 1, where: { onlySticky: true })` |
| RecentPosts, AuthorPosts (লোড মোর) | `posts(first, after: $endCursor) { pageInfo { hasNextPage endCursor } }` |
| PostSingle, PostContent | `post(id: $slug, idType: SLUG) { title content author categories tags seo }` |
| Comments, CommentForm | `post { comments }`, মিউটেশন `createComment` |
| TermHeader | `category(id: $slug, idType: SLUG) { name description count }` (ট্যাগে `tag`) |
| TopicGrid | `categories { nodes { name uri description count } }` |
| ArchiveTimeline | `posts(first: 500) { nodes { title uri dateGmt } }`, সার্ভারে বছর ও মাস ধরে ভাগ |
| AuthorHeader | `user(id: $slug, idType: SLUG) { name description avatar }` |
| SearchPage, কমান্ড প্যালেট | `contentNodes(where: { search: $q })` + WooGraphQL `products(where: { search: $q })` |
| পেজ (about, contact) | `page(id: $uri, idType: URI) { title content }` |

### শপ ও অ্যাকাউন্ট (WooGraphQL)

| কম্পোনেন্ট | কোয়েরি / মিউটেশন |
| --- | --- |
| ProductCard, ProductGrid | `products { nodes { name slug onSale stockStatus averageRating image ... on SimpleProduct { price regularPrice } } }` |
| ShopByCategory, ShopFilters | `productCategories { nodes { name uri count image } }` |
| FlashSale | `products(where: { onSale: true })`, `dateOnSaleTo`, `stockQuantity` |
| FeaturedProductsTabs | `orderby: DATE`, `orderby: TOTAL_SALES`, `onSale: true` |
| ProductSingle, ProductSpotlight, QuickView | `product(id: $slug, idType: SLUG)` |
| VariantPicker | `... on VariableProduct { attributes variations }` |
| ReviewForm | মিউটেশন `writeReview` |
| কার্ট ড্রয়ার, CartPage, OrderSummary | `cart { contents subtotal total }`, মিউটেশন `addToCart`, `updateItemQuantities`, `removeItemsFromCart`, `applyCoupon` |
| CheckoutForm | `paymentGateways`, মিউটেশন `checkout` |
| OrderReceived | `order(id: $orderKey, idType: ORDER_KEY)` |
| LoginForm | মিউটেশন `login` |
| RegisterForm | মিউটেশন `registerCustomer` |
| ForgotPasswordForm | মিউটেশন `sendPasswordResetEmail` |
| ResetPasswordForm | মিউটেশন `resetUserPassword` |
| AccountTabs | `customer { orders billing shipping }`, মিউটেশন `updateCustomer` |

## Next.js-এ রূপান্তরের ধাপ

1. `src/input.css` কপি করে `app/globals.css` করুন এবং `@source` লাইন দুটি বাদ দিন (Next.js নিজেই ফাইল খুঁজে নেয়)।
2. HTML-এর `class` হবে `className`, `for` হবে `htmlFor`। ইনলাইন SVG স্প্রাইটটি রুট লেআউটে একটি `<Icons />` কম্পোনেন্টে রাখুন।
3. প্রতিটি `COMPONENT` মন্তব্য মানে একটি React কম্পোনেন্ট। মন্তব্যে লেখা কোয়েরিটি সেই কম্পোনেন্টের (বা তার পাতার) ডেটা ফেচ।
4. `main.js`-এর প্রতিটি `init` ফাংশন মানে একটি `'use client'` কম্পোনেন্ট (যেমন `initCarousels` থেকে `<Carousel>`, `initTabs` থেকে `<Tabs>`)। বাকি সব সার্ভার কম্পোনেন্ট থাকবে।
5. জাভাস্ক্রিপ্ট অবস্থা রাখে `data-*` ও `aria-*` অ্যাট্রিবিউটে, HTML সাড়া দেয় Tailwind ভ্যারিয়েন্ট দিয়ে (`data-open:`, `aria-pressed:`, `group-data-scrolled/body:`)। React-এ একই অ্যাট্রিবিউট state থেকে বসালে ক্লাসগুলো অপরিবর্তিত থাকবে।
6. `<head>`-এর ইনলাইন থিম স্ক্রিপ্টটি রুট লেআউটে রাখুন, যাতে ডার্ক মোডে ঝলক না দেখা যায়। ফন্ট আনুন `next/font/google` দিয়ে (Hind Siliguri, Noto Serif Bengali)।
7. `<img>` বদলে `next/image` ব্যবহার করুন। `width`, `height` ও `fetchpriority="high"` (অর্থাৎ `priority`) আগে থেকেই ঠিক করা আছে।
8. localStorage-এর ডেমো স্টোরগুলো (`lk-cart`, `lk-wishlist`, `lk-recent`, `lk-last-order`) বদলে দিন WooGraphQL কার্ট সেশন ও আসল অথেনটিকেশন দিয়ে।

## ডিজাইন সিস্টেম সংক্ষেপে

- সব রঙ `@theme` টোকেনে (`bg-accent`, `text-ink-2`, `border-line` ইত্যাদি)। ডার্ক মোডে `[data-theme="dark"]` শুধু টোকেনের মান বদলায়, তাই কম্পোনেন্টে `dark:` রঙের ক্লাস লাগে না।
- অ্যাকসেন্ট রঙ বদলাতে `<html>`-এ `--color-accent` সেট করলেই হয় (অ্যাকসেন্ট পিকার সেটাই করে)।
- `nav:` ও `max-nav:` ভ্যারিয়েন্ট (৯০০ পিক্সেল) ডেস্কটপ ও মোবাইল মেনু আলাদা করে।
- কাস্টম ইউটিলিটি তিনটি: `icon`, `sk` (স্কেলিটন), `scrollbar-none`।
- WordPress-এর কনটেন্ট `<div class="entry-content prose">`-এর ভেতরে বসান। ব্লকের ক্লাসগুলোর (`wp-block-gallery`, `wp-block-table`, `wp-block-button__link` ইত্যাদি) স্টাইল `input.css`-এ আছে।
- ওভারলে ও অফার ব্যাজে `bg-black/50`, `text-white`-এর মতো Tailwind-এর নির্দিষ্ট রঙ ব্যবহার করা হয়েছে, কারণ এগুলো থিম বদলালেও একই থাকা দরকার।

## জাভাস্ক্রিপ্ট হুক (সংক্ষিপ্ত তালিকা)

| ফিচার | হুক |
| --- | --- |
| থিম, অ্যাকসেন্ট | `data-theme-toggle`, `data-accent-picker`, `data-accent`, `data-accent-reset` |
| মেনু | `data-nav-toggle`, `data-menu`, `data-submenu-toggle`, `data-menu-label` |
| সার্চ | `data-search-open` (Ctrl/Cmd+K বা `/`), `window.LEKHONI_SEARCH` দিয়ে ইনডেক্স বদলানো যায় |
| লোড মোর | `data-load-more` + `data-target`, `data-source`, `data-batch`, `data-status` |
| ফিল্টার ও সাজানো | `data-filter-list`, `data-filter`, `data-sort`, `data-filter-item` |
| পড়ার সুবিধা | `data-toc`, `data-toc-source`, `data-progress`, `data-reader` |
| লাইটবক্স, শেয়ার | `img[data-lightbox]`, `data-share`, `data-share-network`, `data-share-copy`, `data-share-native` |
| ফর্ম | `form[data-validate]`, `data-field`, `data-rule="mobile"`, `data-match`, `data-success`, `data-success-show`, `data-redirect` |
| কার্ট | `data-add-to-cart`, `data-buy-now`, `data-cart-open`, `data-cart-count`, `data-cart-page`, `data-cart-summary`, `data-coupon-form` |
| পণ্য | `data-product-*`, `data-qty`, `data-product-gallery`, `data-variants`, `data-quick-view`, `data-wishlist-toggle`, `data-track-view` |
| ট্যাব | `data-tabs`, `data-tabs-param`, `data-tab`, `data-tab-link` |
| ক্যারোসেল | `data-carousel`, `data-carousel-track`, `data-carousel-prev/next/dots/toggle`, `data-autoplay`, `data-loop` |
| অন্যান্য | `data-countdown`, `data-stock-sold`, `data-dismissible`, `data-recently-viewed`, `data-toast`, `data-password-toggle`, `data-password-strength` |

টোস্ট দেখাতে: `window.LekhoniToast.show('বার্তা', 'success')` (ধরন: `success`, `error`, `info`)।

## গুরুত্বপূর্ণ টীকা

- কার্ট, চেকআউট, লগইন ও অ্যাকাউন্ট শুধু UI ডেমো। ডেটা ব্রাউজারের localStorage-এ থাকে, কোনো সার্ভারে যায় না।
- আসল কার্ট, পেমেন্ট ও অথেনটিকেশনের জন্য Next.js-এ WooGraphQL সেশন, একটি পেমেন্ট গেটওয়ে (বিকাশ, নগদ বা কার্ড) এবং অথ ব্যবস্থা (যেমন JWT ও httpOnly কুকি) যোগ করতে হবে।
- ডেমো কুপন `LEKHONI10` দিলে ১০% ছাড়। ডেলিভারি চার্জ: ঢাকার ভেতরে ৳৬০, বাইরে ৳১২০, ৳১,০০০-এর বেশি অর্ডারে ফ্রি।
- JSON-LD-এ `https://lekhoni.example` একটি নমুনা ডোমেইন। আসল সাইটের ঠিকানা দিয়ে বদলে নিন।
- ব্র্যান্ড ও পণ্যের নাম কাল্পনিক, ছবিগুলো SVG প্লেসহোল্ডার।
