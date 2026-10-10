/*!
 * Lekhoni template scripts (vanilla JS, no dependencies).
 *
 * Structure: one IIFE; every feature lives in its own init function and only
 * runs when its data- hook exists on the page.
 *
 * Conventions:
 * - UI state is stored in data-* / aria-* attributes only; the HTML reacts
 *   through Tailwind variants (data-open:, aria-pressed:, group-data-*, ...).
 * - Every Tailwind class used here is a complete static string so the
 *   Tailwind CLI can detect it. Never build class names by concatenation.
 * - Next.js conversion: each init function maps to one 'use client' component.
 */
;(function () {
  'use strict'

  var doc = document
  var root = doc.documentElement

  /* ======================================================================
     Helpers
     ====================================================================== */

  function $ (selector, scope) {
    return (scope || doc).querySelector(selector)
  }

  function $$ (selector, scope) {
    return Array.prototype.slice.call((scope || doc).querySelectorAll(selector))
  }

  // Create a DOM node from an HTML string
  function el (html) {
    var t = doc.createElement('template')
    t.innerHTML = html.trim()
    return t.content.firstElementChild
  }

  function esc (value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[c]
    })
  }

  var BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']

  // Latin digits -> Bangla digits
  function bn (value) {
    return String(value).replace(/\d/g, function (d) {
      return BN_DIGITS[Number(d)]
    })
  }

  // Bangla digits -> Latin digits (used before validating phone numbers)
  function latin (value) {
    return String(value).replace(/[০-৯]/g, function (d) {
      return String(BN_DIGITS.indexOf(d))
    })
  }

  function money (amount) {
    return '৳' + bn(Math.round(Number(amount) || 0).toLocaleString('en-US'))
  }

  function clamp (n, min, max) {
    return Math.min(max, Math.max(min, n))
  }

  // Safe localStorage wrapper (private mode and blocked storage must not break the page)
  var store = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(key)
        return raw == null ? fallback : JSON.parse(raw)
      } catch (e) {
        return fallback
      }
    },
    set: function (key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch (e) {
        /* storage unavailable: the demo simply does not persist */
      }
    },
    remove: function (key) {
      try {
        localStorage.removeItem(key)
      } catch (e) {
        /* ignore */
      }
    },
    // Plain string values (theme and accent are read by the inline head script)
    getRaw: function (key) {
      try {
        return localStorage.getItem(key)
      } catch (e) {
        return null
      }
    },
    setRaw: function (key, value) {
      try {
        localStorage.setItem(key, value)
      } catch (e) {
        /* ignore */
      }
    }
  }

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  function scrollBehavior () {
    return reducedMotion.matches ? 'auto' : 'smooth'
  }

  function icon (name, classes) {
    return (
      '<svg class="' +
      classes +
      '" aria-hidden="true"><use href="#i-' +
      name +
      '"/></svg>'
    )
  }

  var STAR_ON =
    '<svg class="icon size-4 fill-current text-star" aria-hidden="true"><use href="#i-star"/></svg>'
  var STAR_OFF =
    '<svg class="icon size-4 text-line" aria-hidden="true"><use href="#i-star"/></svg>'

  function starsHTML (rating) {
    var out = ''
    var filled = Math.round(Number(rating) || 0)
    for (var i = 1; i <= 5; i++) out += i <= filled ? STAR_ON : STAR_OFF
    return out
  }

  var FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

  /* ----------------------------------------------------------------------
     Layer helper shared by every dialog (command palette, lightbox, cart
     drawer, quick view): focus trap, Escape, overlay click, focus restore.
     ---------------------------------------------------------------------- */
  var activeLayer = null

  function openLayer (node, options) {
    options = options || {}
    if (activeLayer) activeLayer.close(true)
    var previous = doc.activeElement

    function visibleFocusable () {
      return $$(FOCUSABLE, node).filter(function (item) {
        return item.offsetParent !== null || item === doc.activeElement
      })
    }

    function onKey (e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      if (e.key === 'Tab') {
        var items = visibleFocusable()
        if (!items.length) return
        var first = items[0]
        var last = items[items.length - 1]
        if (e.shiftKey && doc.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && doc.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
      if (options.onKey) options.onKey(e)
    }

    function onClick (e) {
      if (e.target === node || e.target.closest('[data-layer-close]')) close()
    }

    function close (skipRestore) {
      if (activeLayer !== api) return
      activeLayer = null
      node.removeEventListener('keydown', onKey)
      node.removeEventListener('click', onClick)
      node.remove()
      root.style.overflow = ''
      if (options.onClose) options.onClose()
      if (!skipRestore && previous && previous.focus) previous.focus()
    }

    var api = { node: node, close: close }
    activeLayer = api
    node.addEventListener('keydown', onKey)
    node.addEventListener('click', onClick)
    doc.body.appendChild(node)
    root.style.overflow = 'hidden'
    var target = options.focus ? $(options.focus, node) : visibleFocusable()[0]
    if (target) target.focus()
    return api
  }

  /* ======================================================================
     Toasts: window.LekhoniToast.show(message, type)
     ====================================================================== */
  var TOAST_CLASSES = {
    success:
      'pointer-events-auto flex max-w-sm items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-medium text-ink shadow-lift animate-toast-in transition duration-200 data-leaving:translate-y-2 data-leaving:opacity-0',
    error:
      'pointer-events-auto flex max-w-sm items-center gap-3 rounded-2xl border border-danger/40 bg-surface px-4 py-3 text-sm font-medium text-ink shadow-lift animate-toast-in transition duration-200 data-leaving:translate-y-2 data-leaving:opacity-0',
    info: 'pointer-events-auto flex max-w-sm items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-medium text-ink shadow-lift animate-toast-in transition duration-200 data-leaving:translate-y-2 data-leaving:opacity-0'
  }
  var TOAST_ICONS = {
    success:
      '<span class="grid size-7 shrink-0 place-items-center rounded-full bg-success/15 text-success">' +
      icon('check', 'icon size-4') +
      '</span>',
    error:
      '<span class="grid size-7 shrink-0 place-items-center rounded-full bg-danger/15 text-danger">' +
      icon('close', 'icon size-4') +
      '</span>',
    info:
      '<span class="grid size-7 shrink-0 place-items-center rounded-full bg-accent/15 text-link">' +
      icon('zap', 'icon size-4') +
      '</span>'
  }

  function toast (message, type) {
    type = TOAST_CLASSES[type] ? type : 'info'
    var region = $('[data-toast-region]')
    if (!region) {
      region = el(
        '<div data-toast-region role="status" aria-live="polite" class="pointer-events-none fixed inset-x-0 bottom-5 z-[80] flex flex-col items-center gap-2 px-4 print:hidden"></div>'
      )
      doc.body.appendChild(region)
    }
    var node = el(
      '<div class="' +
        TOAST_CLASSES[type] +
        '">' +
        TOAST_ICONS[type] +
        '<span>' +
        esc(message) +
        '</span></div>'
    )
    region.appendChild(node)
    setTimeout(function () {
      node.setAttribute('data-leaving', '')
      setTimeout(function () {
        node.remove()
      }, 220)
    }, 3200)
  }

  window.LekhoniToast = { show: toast }

  /* ======================================================================
     1. Theme (dark / light)
     ====================================================================== */
  function initTheme () {
    var buttons = $$('[data-theme-toggle]')
    if (!buttons.length) return
    var meta = $('meta[name="theme-color"]')

    function sync () {
      var dark = root.getAttribute('data-theme') === 'dark'
      buttons.forEach(function (button) {
        button.setAttribute('aria-pressed', String(dark))
        button.setAttribute(
          'aria-label',
          dark ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন'
        )
      })
      if (meta) meta.setAttribute('content', dark ? '#13161d' : '#faf8f5')
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
        root.setAttribute('data-theme', next)
        store.setRaw('lk-theme', next)
        sync()
      })
    })
    sync()
  }

  /* ======================================================================
     2. Accent picker
     ====================================================================== */
  function initAccentPicker () {
    var pickers = $$('[data-accent-picker]')
    if (!pickers.length) return
    var DEFAULT_ACCENT = '#0f766e'

    function current () {
      return (store.getRaw('lk-accent') || DEFAULT_ACCENT).toLowerCase()
    }

    function sync () {
      var value = current()
      pickers.forEach(function (picker) {
        $$('[data-accent]', picker).forEach(function (button) {
          button.setAttribute(
            'aria-pressed',
            String(button.getAttribute('data-accent').toLowerCase() === value)
          )
        })
        var input = $('input[type="color"]', picker)
        if (input) input.value = value
      })
    }

    function apply (value) {
      root.style.setProperty('--color-accent', value)
      store.setRaw('lk-accent', value)
      sync()
    }

    pickers.forEach(function (picker) {
      picker.addEventListener('click', function (e) {
        var swatch = e.target.closest('[data-accent]')
        if (swatch) apply(swatch.getAttribute('data-accent'))
        if (e.target.closest('[data-accent-reset]')) {
          root.style.removeProperty('--color-accent')
          store.remove('lk-accent')
          sync()
          toast('ডিফল্ট রঙ ফিরিয়ে আনা হয়েছে', 'info')
        }
      })
      var input = $('input[type="color"]', picker)
      if (input) {
        input.addEventListener('input', function () {
          apply(input.value)
        })
      }
    })
    sync()
  }

  /* ======================================================================
     3. Navigation: mobile toggle, submenus, current page
     ====================================================================== */
  function initNavigation () {
    var nav = $('#site-nav')
    if (!nav) return
    var toggle = $('[data-nav-toggle]')

    function setNav (open) {
      nav.toggleAttribute('data-open', open)
      if (toggle) {
        toggle.setAttribute('aria-expanded', String(open))
        toggle.setAttribute(
          'aria-label',
          open ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'
        )
      }
    }

    if (toggle) {
      toggle.addEventListener('click', function () {
        setNav(!nav.hasAttribute('data-open'))
      })
    }

    function closeItem (item) {
      item.removeAttribute('data-open')
      var button = $('[data-submenu-toggle]', item)
      if (button) button.setAttribute('aria-expanded', 'false')
      $$('li[data-open]', item).forEach(closeItem)
    }

    function closeAll () {
      $$('li[data-open]', nav).forEach(closeItem)
    }

    $$('[data-submenu-toggle]', nav).forEach(function (button) {
      button.addEventListener('click', function () {
        var item = button.closest('li')
        var open = !item.hasAttribute('data-open')
        // Close sibling submenus on the same level
        Array.prototype.forEach.call(
          item.parentElement.children,
          function (sibling) {
            if (sibling !== item) closeItem(sibling)
          }
        )
        if (open) {
          item.setAttribute('data-open', '')
          button.setAttribute('aria-expanded', 'true')
        } else {
          closeItem(item)
        }
      })
    })

    doc.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) closeAll()
    })

    doc.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return
      var openItem =
        e.target.closest && e.target.closest('#site-nav li[data-open]')
      if (openItem) {
        closeItem(openItem)
        var button = $('[data-submenu-toggle]', openItem)
        if (button) button.focus()
      } else if (nav.hasAttribute('data-open') && nav.contains(e.target)) {
        setNav(false)
        if (toggle) toggle.focus()
      } else {
        closeAll()
      }
    })

    // Mark the current page. Pages that are not in the menu (single post,
    // product, cart...) point at their parent through <main data-nav-parent>.
    var file = location.pathname.split('/').pop() || 'index.html'
    var main = $('main[data-nav-parent]')
    var parentFile = main ? main.getAttribute('data-nav-parent') : ''

    function markAncestors (link) {
      var item = link.closest('li')
      while (item && nav.contains(item)) {
        var label = $('[data-menu-label]', item)
        if (label) label.setAttribute('data-active', '')
        item = item.parentElement.closest('li')
      }
    }

    var matched = false
    $$('a[href]', nav).forEach(function (link) {
      var target = link.getAttribute('href').split('#')[0].split('?')[0]
      if (target === file) {
        link.setAttribute('aria-current', 'page')
        markAncestors(link)
        matched = true
      }
    })
    if (!matched && parentFile) {
      var parentLink = $('[data-menu] a[href="' + parentFile + '"]', nav)
      if (parentLink) markAncestors(parentLink)
    }
  }

  /* ======================================================================
     4. Sticky header state
     ====================================================================== */
  function initStickyHeader () {
    if (!$('[data-sticky-header]')) return
    var ticking = false

    function update () {
      doc.body.toggleAttribute('data-scrolled', window.scrollY > 40)
      ticking = false
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true
          requestAnimationFrame(update)
        }
      },
      { passive: true }
    )
    update()
  }

  /* ======================================================================
     Demo search index (used by the command palette and the search page).
     Override it by defining window.LEKHONI_SEARCH before this script runs.
     Next.js: replace with WPGraphQL `contentNodes(where: { search })` plus
     WooGraphQL `products(where: { search })`.
     ====================================================================== */
  var SEARCH_INDEX = window.LEKHONI_SEARCH || [
    {
      type: 'post',
      title: 'হেডলেস ওয়ার্ডপ্রেস কী এবং কেন ব্যবহার করবেন',
      url: 'single.html',
      text: 'হেডলেস আর্কিটেকচার, API, ফ্রন্টএন্ড আলাদা করার সুবিধা'
    },
    {
      type: 'post',
      title: 'WPGraphQL দিয়ে প্রথম কোয়েরি লেখা',
      url: 'single.html',
      text: 'GraphQL কোয়েরি, posts, nodes, featuredImage'
    },
    {
      type: 'post',
      title: 'Next.js App Router-এ ব্লগ তৈরি: ধাপে ধাপে',
      url: 'single.html',
      text: 'সার্ভার কম্পোনেন্ট, রাউটিং, generateStaticParams'
    },
    {
      type: 'post',
      title: 'বাংলা ওয়েবসাইটের জন্য সঠিক ফন্ট বাছাই',
      url: 'single.html',
      text: 'হিন্দ শিলিগুড়ি, নোটো সেরিফ বেঙ্গলি, টাইপোগ্রাফি'
    },
    {
      type: 'post',
      title: 'WooGraphQL দিয়ে হেডলেস দোকান: কার্ট থেকে চেকআউট',
      url: 'single.html',
      text: 'WooCommerce, addToCart, সেশন টোকেন'
    },
    {
      type: 'post',
      title: 'ISR ও অন-ডিমান্ড রিভ্যালিডেশন সহজ ভাষায়',
      url: 'single.html',
      text: 'ক্যাশিং, revalidateTag, ওয়েবহুক'
    },
    {
      type: 'post',
      title: 'Tailwind CSS v4-এ ডিজাইন টোকেন সাজানো',
      url: 'single.html',
      text: '@theme, কাস্টম ভ্যারিয়েন্ট, ডার্ক মোড'
    },
    {
      type: 'post',
      title: 'কেনার আগে পড়ুন: ভালো নোটবুক চেনার ৫ উপায়',
      url: 'single.html',
      text: 'কাগজের মান, বাঁধাই, সাইজ'
    },
    {
      type: 'page',
      title: 'আমাদের সম্পর্কে',
      url: 'about.html',
      text: 'লেখনীর গল্প, লক্ষ্য ও দল'
    },
    {
      type: 'page',
      title: 'যোগাযোগ',
      url: 'contact.html',
      text: 'ইমেইল, ফোন, ঠিকানা, সাধারণ জিজ্ঞাসা'
    },
    {
      type: 'page',
      title: 'আর্কাইভ',
      url: 'archive.html',
      text: 'সব লেখা বছর ও মাস অনুযায়ী'
    },
    {
      type: 'page',
      title: 'স্টাইল গাইড',
      url: 'styleguide.html',
      text: 'রঙ, টাইপোগ্রাফি, বাটন, ফর্ম, কার্ড'
    },
    {
      type: 'page',
      title: 'শপ',
      url: 'shop.html',
      text: 'সব পণ্য, ফিল্টার ও সাজানো'
    },
    {
      type: 'product',
      title: 'লেখনী ক্লাসিক নোটবুক',
      url: 'product.html',
      text: 'নোটবুক, ১৬০ পাতা, হার্ডকভার'
    },
    {
      type: 'product',
      title: 'মসৃণ জেল কলম সেট (৫টি)',
      url: 'product.html',
      text: 'কলম, পাঁচ রঙের কালি'
    },
    {
      type: 'product',
      title: 'সিরামিক মগ "চা ও কোড"',
      url: 'product.html',
      text: 'মগ, ৩৫০ মিলি, উপহার'
    },
    {
      type: 'product',
      title: 'ক্যানভাস টোট ব্যাগ',
      url: 'product.html',
      text: 'ব্যাগ, মজবুত সুতি কাপড়'
    },
    {
      type: 'product',
      title: 'ডেভেলপার স্টিকার প্যাক',
      url: 'product.html',
      text: 'স্টিকার, ল্যাপটপ, ১২টি'
    },
    {
      type: 'product',
      title: 'কাঠের ডেস্ক অর্গানাইজার',
      url: 'product.html',
      text: 'ডেস্ক, কলমদানি, কাঠ'
    },
    {
      type: 'product',
      title: 'প্রিমিয়াম গিফট বক্স',
      url: 'product.html',
      text: 'উপহার, নোটবুক, কলম, মগ'
    },
    {
      type: 'product',
      title: '২০২৭ সাপ্তাহিক প্ল্যানার',
      url: 'product.html',
      text: 'প্ল্যানার, ডায়েরি, রুটিন'
    },
    {
      type: 'category',
      title: 'টিউটোরিয়াল',
      url: 'category.html',
      text: 'হাতে-কলমে শেখার লেখা'
    },
    {
      type: 'category',
      title: 'GraphQL',
      url: 'category.html',
      text: 'কোয়েরি, মিউটেশন, স্কিমা'
    },
    {
      type: 'category',
      title: 'Next.js',
      url: 'category.html',
      text: 'App Router, সার্ভার কম্পোনেন্ট'
    },
    {
      type: 'category',
      title: 'ওয়ার্ডপ্রেস',
      url: 'category.html',
      text: 'হেডলেস, প্লাগইন, থিম'
    }
  ]

  var SEARCH_TYPE_LABEL = {
    post: 'পোস্ট',
    page: 'পেজ',
    product: 'পণ্য',
    category: 'বিষয়'
  }

  function searchIndex (query) {
    var q = query.trim().toLowerCase()
    if (!q) return []
    return SEARCH_INDEX.filter(function (item) {
      return (
        (item.title + ' ' + (item.text || '')).toLowerCase().indexOf(q) !== -1
      )
    })
  }

  // Escape text and wrap the matching part in <mark>
  function highlight (text, query) {
    var q = query.trim()
    var index = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1
    if (index === -1) return esc(text)
    return (
      esc(text.slice(0, index)) +
      '<mark>' +
      esc(text.slice(index, index + q.length)) +
      '</mark>' +
      esc(text.slice(index + q.length))
    )
  }

  /* ======================================================================
     5. Command palette search (Ctrl/Cmd+K or "/")
     ====================================================================== */
  function initCommandPalette () {
    var layer = null

    function open () {
      if (layer) return
      var node = el(
        '<div class="fixed inset-0 z-[70] flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-sm print:hidden">' +
          '<div role="dialog" aria-modal="true" aria-label="সাইটে খুঁজুন" class="w-full max-w-xl overflow-hidden rounded-card border border-line bg-surface shadow-lift animate-pop">' +
          '<div class="flex items-center gap-3 border-b border-line px-4">' +
          icon('search', 'icon size-5 text-muted') +
          '<input type="text" role="combobox" aria-expanded="true" aria-controls="lk-palette-list" aria-autocomplete="list" aria-label="সাইটে খুঁজুন" placeholder="পোস্ট, পেজ বা পণ্য খুঁজুন…" autocomplete="off" spellcheck="false" class="h-14 w-full bg-transparent text-base text-ink placeholder:text-muted focus:outline-none">' +
          '<button type="button" data-layer-close aria-label="বন্ধ করুন" class="rounded-lg border border-line px-2 py-1 font-mono text-xs text-muted transition hover:text-ink">Esc</button>' +
          '</div>' +
          '<ul id="lk-palette-list" role="listbox" aria-label="ফলাফল" class="max-h-[50vh] overflow-y-auto p-2"></ul>' +
          '<div class="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line bg-surface-2 px-4 py-2 text-xs text-muted">' +
          '<span><kbd>↑</kbd> <kbd>↓</kbd> বাছাই</span><span><kbd>Enter</kbd> খুলুন</span><span><kbd>Esc</kbd> বন্ধ</span>' +
          '<a href="search.html" data-palette-all class="ml-auto font-medium text-link hover:underline">সব ফলাফল দেখুন</a>' +
          '</div></div></div>'
      )
      var input = $('input', node)
      var list = $('[role="listbox"]', node)
      var allLink = $('[data-palette-all]', node)
      var results = []
      var active = -1

      function setActive (index) {
        active = index
        $$('[role="option"]', list).forEach(function (option, i) {
          option.setAttribute('aria-selected', String(i === active))
          if (i === active) option.scrollIntoView({ block: 'nearest' })
        })
        if (active >= 0)
          input.setAttribute('aria-activedescendant', 'lk-option-' + active)
        else input.removeAttribute('aria-activedescendant')
      }

      function render () {
        var query = input.value
        results = query.trim() ? searchIndex(query) : SEARCH_INDEX.slice(0, 6)
        allLink.setAttribute(
          'href',
          'search.html' +
            (query.trim() ? '?q=' + encodeURIComponent(query.trim()) : '')
        )
        if (!results.length) {
          list.innerHTML =
            '<li role="presentation" class="px-4 py-8 text-center text-sm text-muted">কিছু পাওয়া যায়নি। অন্য শব্দ দিয়ে চেষ্টা করুন।</li>'
          setActive(-1)
          return
        }
        list.innerHTML = results
          .slice(0, 8)
          .map(function (item, i) {
            return (
              '<li role="option" id="lk-option-' +
              i +
              '" aria-selected="false" data-index="' +
              i +
              '" class="group/opt flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 aria-selected:bg-surface-2">' +
              '<span class="shrink-0 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-link">' +
              SEARCH_TYPE_LABEL[item.type] +
              '</span>' +
              '<span class="min-w-0 flex-1 truncate text-sm font-medium text-ink">' +
              highlight(item.title, query) +
              '</span>' +
              '<svg class="icon size-4 text-muted opacity-0 group-aria-selected/opt:opacity-100" aria-hidden="true"><use href="#i-arrow-right"/></svg>' +
              '</li>'
            )
          })
          .join('')
        results = results.slice(0, 8)
        setActive(0)
      }

      input.addEventListener('input', render)
      list.addEventListener('click', function (e) {
        var option = e.target.closest('[role="option"]')
        if (option)
          location.href = results[Number(option.getAttribute('data-index'))].url
      })
      list.addEventListener('mousemove', function (e) {
        var option = e.target.closest('[role="option"]')
        if (option && Number(option.getAttribute('data-index')) !== active)
          setActive(Number(option.getAttribute('data-index')))
      })

      layer = openLayer(node, {
        focus: 'input',
        onClose: function () {
          layer = null
        },
        onKey: function (e) {
          if (e.key === 'ArrowDown' && results.length) {
            e.preventDefault()
            setActive((active + 1) % results.length)
          } else if (e.key === 'ArrowUp' && results.length) {
            e.preventDefault()
            setActive((active - 1 + results.length) % results.length)
          } else if (e.key === 'Enter' && doc.activeElement === input) {
            e.preventDefault()
            if (results[active]) location.href = results[active].url
            else if (input.value.trim())
              location.href =
                'search.html?q=' + encodeURIComponent(input.value.trim())
          }
        }
      })
      render()
    }

    doc.addEventListener('click', function (e) {
      if (e.target.closest('[data-search-open]')) open()
    })

    doc.addEventListener('keydown', function (e) {
      var tag = e.target.tagName
      var typing =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        e.target.isContentEditable
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        open()
      } else if (
        e.key === '/' &&
        !typing &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault()
        open()
      }
    })
  }

  /* ======================================================================
     6. Load more
     ====================================================================== */
  var SKELETON_CARD =
    '<div data-skeleton aria-hidden="true" class="overflow-hidden rounded-card border border-line bg-surface">' +
    '<div class="sk aspect-video rounded-none"></div>' +
    '<div class="space-y-3 p-5"><div class="sk h-3 w-1/4"></div><div class="sk h-5 w-11/12"></div><div class="sk h-5 w-2/3"></div><div class="sk h-3 w-1/2"></div></div>' +
    '</div>'

  function initLoadMore () {
    $$('[data-load-more]').forEach(function (button) {
      var target = $(button.getAttribute('data-target'))
      var source = $(button.getAttribute('data-source'))
      if (!target || !source) return
      var batch = Number(button.getAttribute('data-batch')) || 2
      var status = button.getAttribute('data-status')
        ? $(button.getAttribute('data-status'))
        : null
      var queue = Array.prototype.slice.call(source.content.children)

      button.addEventListener('click', function () {
        if (button.disabled) return
        var take = queue.splice(0, batch)
        var skeletons = take.map(function () {
          return target.appendChild(el(SKELETON_CARD))
        })
        button.disabled = true
        button.setAttribute('aria-busy', 'true')
        if (status) status.textContent = 'আরো লেখা লোড হচ্ছে…'

        // Real project: fetch the next page with endCursor here
        // (posts(first: $batch, after: $endCursor) { pageInfo { hasNextPage endCursor } nodes { ... } })
        setTimeout(function () {
          skeletons.forEach(function (node) {
            node.remove()
          })
          take.forEach(function (card, i) {
            var node = card.cloneNode(true)
            node.classList.add('animate-fade-up')
            node.style.animationDelay = i * 80 + 'ms'
            target.appendChild(node)
          })
          button.disabled = false
          button.removeAttribute('aria-busy')
          if (status)
            status.textContent = bn(take.length) + 'টি নতুন লেখা যোগ হয়েছে।'
          if (!queue.length) {
            button.hidden = true
            if (status) status.textContent = 'সব লেখা দেখানো হয়েছে।'
          }
          syncWishlistButtons()
        }, 700)
      })
    })
  }

  /* ======================================================================
     7. Filter and sort
     ====================================================================== */
  function initFilterSort () {
    $$('[data-filter-list]').forEach(function (scope) {
      var chips = $$('[data-filter]', scope)
      var select = $('select[data-sort]', scope)
      var items = $$('[data-filter-item]', scope)
      var count = $('[data-filter-count]', scope)
      var empty = $('[data-filter-empty]', scope)
      if (!items.length) return
      var container = items[0].parentElement
      var params = new URLSearchParams(location.search)
      var state = {
        filter: params.get('filter') || 'all',
        sort: params.get('sort') || (select ? select.value : 'newest')
      }

      function apply (updateUrl) {
        chips.forEach(function (chip) {
          chip.setAttribute(
            'aria-pressed',
            String(chip.getAttribute('data-filter') === state.filter)
          )
        })
        if (select) select.value = state.sort

        var visible = 0
        items.forEach(function (item) {
          var tags = (item.getAttribute('data-tags') || '').split(/\s+/)
          var show = state.filter === 'all' || tags.indexOf(state.filter) !== -1
          item.hidden = !show
          if (show) visible++
        })

        items
          .slice()
          .sort(function (a, b) {
            if (state.sort === 'title')
              return (a.getAttribute('data-title') || '').localeCompare(
                b.getAttribute('data-title') || '',
                'bn'
              )
            var da = a.getAttribute('data-date') || ''
            var db = b.getAttribute('data-date') || ''
            return state.sort === 'oldest'
              ? da.localeCompare(db)
              : db.localeCompare(da)
          })
          .forEach(function (item) {
            container.appendChild(item)
          })

        if (count) count.textContent = bn(visible)
        if (empty) empty.hidden = visible !== 0

        if (updateUrl) {
          var next = new URLSearchParams(location.search)
          if (state.filter === 'all') next.delete('filter')
          else next.set('filter', state.filter)
          next.set('sort', state.sort)
          history.replaceState(
            null,
            '',
            location.pathname + '?' + next.toString() + location.hash
          )
        }
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          state.filter = chip.getAttribute('data-filter')
          apply(true)
        })
      })
      if (select) {
        select.addEventListener('change', function () {
          state.sort = select.value
          apply(true)
        })
      }
      apply(false)
    })
  }

  /* ======================================================================
     8. Table of contents
     ====================================================================== */
  function initToc () {
    var tocs = $$('[data-toc]')
    var source = $('[data-toc-source]')
    if (!tocs.length || !source) return
    var headings = $$('h2, h3', source)
    if (!headings.length) {
      tocs.forEach(function (toc) {
        toc.hidden = true
      })
      return
    }

    headings.forEach(function (heading, i) {
      if (!heading.id) heading.id = 'section-' + (i + 1)
    })

    var links = []
    tocs.forEach(function (toc) {
      var list = el('<ol class="space-y-0.5"></ol>')
      headings.forEach(function (heading) {
        var link =
          heading.tagName === 'H2'
            ? el(
                '<li><a class="block border-l-2 border-line py-1 pl-3 text-sm leading-snug text-ink-2 transition hover:text-link data-active:border-accent data-active:font-semibold data-active:text-link"></a></li>'
              )
            : el(
                '<li><a class="block border-l-2 border-line py-1 pl-7 text-[0.8125rem] leading-snug text-muted transition hover:text-link data-active:border-accent data-active:font-semibold data-active:text-link"></a></li>'
              )
        var anchor = link.firstElementChild
        anchor.href = '#' + heading.id
        anchor.textContent = heading.textContent
        list.appendChild(link)
        links.push(anchor)
      })
      ;(toc.querySelector('[data-toc-list]') || toc).appendChild(list)
    })

    if (!('IntersectionObserver' in window)) return
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return
          links.forEach(function (anchor) {
            anchor.toggleAttribute(
              'data-active',
              anchor.getAttribute('href') === '#' + entry.target.id
            )
          })
        })
      },
      { rootMargin: '-15% 0px -70% 0px' }
    )
    headings.forEach(function (heading) {
      observer.observe(heading)
    })
  }

  /* ======================================================================
     9. Reading progress
     ====================================================================== */
  function initReadingProgress () {
    var bars = $$('[data-progress]')
    if (!bars.length) return
    var ticking = false

    function update () {
      bars.forEach(function (bar) {
        var target = $(bar.getAttribute('data-progress'))
        if (!target) return
        var rect = target.getBoundingClientRect()
        var total = rect.height - window.innerHeight * 0.6
        var done = clamp(-rect.top / (total > 0 ? total : 1), 0, 1)
        bar.style.setProperty('--progress', done.toFixed(4))
      })
      ticking = false
    }

    function request () {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }

    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)
    update()
  }

  /* ======================================================================
     10. Reader controls (font size and focus mode)
     ====================================================================== */
  function initReaderControls () {
    var controls = $$('[data-reader]')
    var saved = Number(store.get('lk-reader-scale', 1)) || 1
    if (saved !== 1 && $('.entry-content'))
      root.style.setProperty('--reader-scale', String(saved))
    if (!controls.length) return
    var scale = saved

    function setScale (value) {
      scale = clamp(Math.round(value * 100) / 100, 0.9, 1.3)
      root.style.setProperty('--reader-scale', String(scale))
      store.set('lk-reader-scale', scale)
      controls.forEach(function (control) {
        var label = $('[data-reader-value]', control)
        if (label) label.textContent = bn(Math.round(scale * 100)) + '%'
        var smaller = $('[data-reader-action="smaller"]', control)
        var larger = $('[data-reader-action="larger"]', control)
        if (smaller) smaller.disabled = scale <= 0.9
        if (larger) larger.disabled = scale >= 1.3
      })
    }

    function setFocus (on) {
      doc.body.toggleAttribute('data-reading', on)
      $$('[data-reader-action="focus"]').forEach(function (button) {
        button.setAttribute('aria-pressed', String(on))
      })
    }

    controls.forEach(function (control) {
      control.addEventListener('click', function (e) {
        var button = e.target.closest('[data-reader-action]')
        if (!button) return
        var action = button.getAttribute('data-reader-action')
        if (action === 'smaller') setScale(scale - 0.1)
        if (action === 'larger') setScale(scale + 0.1)
        if (action === 'reset') setScale(1)
        if (action === 'focus') {
          var on = !doc.body.hasAttribute('data-reading')
          setFocus(on)
          toast(on ? 'ফোকাস মোড চালু হয়েছে' : 'ফোকাস মোড বন্ধ হয়েছে', 'info')
        }
      })
    })

    doc.addEventListener('keydown', function (e) {
      if (
        e.key === 'Escape' &&
        doc.body.hasAttribute('data-reading') &&
        !activeLayer
      )
        setFocus(false)
    })
    setScale(scale)
  }

  /* ======================================================================
     11. Code copy buttons
     ====================================================================== */
  function copyText (text) {
    if (navigator.clipboard && window.isSecureContext)
      return navigator.clipboard.writeText(text)
    // Fallback for file:// and older browsers
    return new Promise(function (resolve, reject) {
      var area = doc.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      doc.body.appendChild(area)
      area.select()
      try {
        doc.execCommand('copy') ? resolve() : reject(new Error('copy failed'))
      } catch (error) {
        reject(error)
      }
      area.remove()
    })
  }

  function initCodeCopy () {
    $$('.entry-content pre').forEach(function (pre) {
      var button = el(
        '<button type="button" class="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 font-sans text-xs text-white/80 transition hover:bg-white/20 hover:text-white print:hidden">' +
          icon('copy', 'icon size-3.5') +
          '<span data-copy-label>কপি</span></button>'
      )
      button.addEventListener('click', function () {
        var code = $('code', pre) || pre
        var label = $('[data-copy-label]', button)
        copyText(code.innerText.replace(/\n$/, '')).then(
          function () {
            label.textContent = 'কপি হয়েছে'
            setTimeout(function () {
              label.textContent = 'কপি'
            }, 1800)
          },
          function () {
            toast('কপি করা যায়নি', 'error')
          }
        )
      })
      pre.appendChild(button)
    })
  }

  /* ======================================================================
     12. Lightbox
     ====================================================================== */
  function openLightbox (items, startIndex) {
    if (!items.length) return
    var index = startIndex || 0
    var node = el(
      '<div class="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/90 p-4 print:hidden">' +
        '<div role="dialog" aria-modal="true" aria-label="ছবি দেখুন" class="relative flex max-h-full w-full max-w-4xl flex-col items-center gap-3">' +
        '<img data-lightbox-image src="" alt="" class="max-h-[76vh] w-auto max-w-full rounded-xl bg-white object-contain animate-pop">' +
        '<p data-lightbox-caption class="text-center text-sm text-white/80"></p>' +
        '<div class="flex items-center gap-3">' +
        '<button type="button" data-lightbox-prev aria-label="আগের ছবি" class="grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25">' +
        icon('arrow-left', 'icon size-5') +
        '</button>' +
        '<span data-lightbox-counter aria-live="polite" class="min-w-16 text-center text-sm text-white/80"></span>' +
        '<button type="button" data-lightbox-next aria-label="পরের ছবি" class="grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25">' +
        icon('arrow-right', 'icon size-5') +
        '</button>' +
        '</div></div>' +
        '<button type="button" data-layer-close aria-label="বন্ধ করুন" class="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25">' +
        icon('close', 'icon size-5') +
        '</button>' +
        '</div>'
    )
    var image = $('[data-lightbox-image]', node)
    var caption = $('[data-lightbox-caption]', node)
    var counter = $('[data-lightbox-counter]', node)
    var single = items.length < 2
    $('[data-lightbox-prev]', node).hidden = single
    $('[data-lightbox-next]', node).hidden = single

    function show (next) {
      index = (next + items.length) % items.length
      image.src = items[index].src
      image.alt = items[index].alt || ''
      caption.textContent = items[index].caption || ''
      caption.hidden = !items[index].caption
      counter.textContent = bn(index + 1) + ' / ' + bn(items.length)
    }

    node.addEventListener('click', function (e) {
      if (e.target.closest('[data-lightbox-prev]')) show(index - 1)
      if (e.target.closest('[data-lightbox-next]')) show(index + 1)
    })

    openLayer(node, {
      focus: '[data-layer-close]',
      onKey: function (e) {
        if (e.key === 'ArrowLeft') show(index - 1)
        if (e.key === 'ArrowRight') show(index + 1)
      }
    })
    show(index)
  }

  function initLightbox () {
    var images = $$('img[data-lightbox]')
    if (!images.length) return

    function openFor (image) {
      var group = image.getAttribute('data-lightbox')
      var members = $$('img[data-lightbox="' + group + '"]')
      openLightbox(
        members.map(function (member) {
          return {
            src:
              member.getAttribute('data-full') ||
              member.currentSrc ||
              member.src,
            alt: member.alt,
            caption: member.getAttribute('data-caption')
          }
        }),
        members.indexOf(image)
      )
    }

    images.forEach(function (image) {
      image.setAttribute('tabindex', '0')
      image.setAttribute('role', 'button')
      image.addEventListener('click', function () {
        openFor(image)
      })
      image.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openFor(image)
        }
      })
    })
  }

  /* ======================================================================
     13. Share
     ====================================================================== */
  function initShare () {
    $$('[data-share]').forEach(function (scope) {
      var url = scope.getAttribute('data-share-url') || location.href
      var title = scope.getAttribute('data-share-title') || doc.title
      var u = encodeURIComponent(url)
      var t = encodeURIComponent(title)
      var targets = {
        facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + u,
        x: 'https://twitter.com/intent/tweet?url=' + u + '&text=' + t,
        whatsapp: 'https://wa.me/?text=' + t + '%20' + u,
        linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + u
      }

      $$('[data-share-network]', scope).forEach(function (link) {
        var network = link.getAttribute('data-share-network')
        if (!targets[network]) return
        link.href = targets[network]
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
      })

      $$('[data-share-copy]', scope).forEach(function (button) {
        button.addEventListener('click', function () {
          copyText(url).then(
            function () {
              toast('লিংক কপি হয়েছে', 'success')
            },
            function () {
              toast('লিংক কপি করা যায়নি', 'error')
            }
          )
        })
      })

      $$('[data-share-native]', scope).forEach(function (button) {
        if (!navigator.share) {
          button.hidden = true
          return
        }
        button.addEventListener('click', function () {
          navigator.share({ title: title, url: url }).catch(function () {
            /* user cancelled the share sheet */
          })
        })
      })
    })
  }

  /* ======================================================================
     14. Form validation
     ====================================================================== */
  var MESSAGES = {
    required: 'এই ঘরটি পূরণ করা আবশ্যক।',
    checkbox: 'এগিয়ে যেতে এটিতে টিক দিন।',
    choice: 'একটি অপশন বেছে নিন।',
    email: 'সঠিক ইমেইল ঠিকানা লিখুন।',
    mobile: 'সঠিক মোবাইল নম্বর লিখুন (যেমন ০১৭১২৩৪৫৬৭৮)।',
    emailOrMobile: 'সঠিক ইমেইল অথবা মোবাইল নম্বর লিখুন।',
    match: 'পাসওয়ার্ড দুটি মিলছে না।'
  }
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  var MOBILE_PATTERN = /^01[3-9]\d{8}$/

  function fieldError (field, form) {
    var type = field.type
    var value = field.value.trim()
    var rule = field.getAttribute('data-rule')

    if (type === 'checkbox')
      return field.required && !field.checked ? MESSAGES.checkbox : ''
    if (type === 'radio') {
      if (!field.required) return ''
      var group = $$('input[type="radio"]', form).filter(function (radio) {
        return radio.name === field.name
      })
      return group.some(function (radio) {
        return radio.checked
      })
        ? ''
        : MESSAGES.choice
    }
    if (field.required && !value)
      return field.tagName === 'SELECT' ? MESSAGES.choice : MESSAGES.required
    var match = field.getAttribute('data-match')
    if (match && $(match, form) && $(match, form).value !== field.value)
      return MESSAGES.match
    if (!value) return ''
    if (type === 'email' && !EMAIL_PATTERN.test(value)) return MESSAGES.email
    if (
      rule === 'mobile' &&
      !MOBILE_PATTERN.test(latin(value).replace(/[\s-]/g, ''))
    )
      return MESSAGES.mobile
    if (
      rule === 'email-or-mobile' &&
      !EMAIL_PATTERN.test(value) &&
      !MOBILE_PATTERN.test(latin(value).replace(/[\s-]/g, ''))
    )
      return MESSAGES.emailOrMobile
    var min = Number(field.getAttribute('minlength'))
    if (min && value.length < min)
      return 'কমপক্ষে ' + bn(min) + 'টি অক্ষর লিখুন।'
    return ''
  }

  function clearFieldError (field) {
    var holder = field.closest('[data-field]') || field.parentElement
    var message = $('[data-error]', holder)
    if (message) message.remove()
    field.removeAttribute('aria-invalid')
    var described = (field.getAttribute('aria-describedby') || '')
      .split(' ')
      .filter(function (id) {
        return id && id.indexOf('-error') === -1
      })
    if (described.length)
      field.setAttribute('aria-describedby', described.join(' '))
    else field.removeAttribute('aria-describedby')
  }

  var fieldUid = 0

  function showFieldError (field, message) {
    clearFieldError(field)
    var holder = field.closest('[data-field]') || field.parentElement
    if (!field.id) field.id = 'lk-field-' + ++fieldUid
    var id = field.id + '-error'
    var node = el(
      '<p data-error class="mt-1.5 text-sm font-medium text-danger"></p>'
    )
    node.id = id
    node.textContent = message
    holder.appendChild(node)
    field.setAttribute('aria-invalid', 'true')
    var described = field.getAttribute('aria-describedby')
    field.setAttribute(
      'aria-describedby',
      described ? described + ' ' + id : id
    )
  }

  function initFormValidation () {
    $$('form[data-validate]').forEach(function (form) {
      form.setAttribute('novalidate', '')

      function fields () {
        return Array.prototype.filter.call(form.elements, function (field) {
          return (
            field.name !== undefined &&
            /^(INPUT|SELECT|TEXTAREA)$/.test(field.tagName) &&
            !field.disabled &&
            ['hidden', 'submit', 'button', 'reset'].indexOf(field.type) === -1
          )
        })
      }

      form.addEventListener('input', function (e) {
        if (
          e.target.getAttribute &&
          e.target.getAttribute('aria-invalid') === 'true'
        )
          clearFieldError(e.target)
      })
      form.addEventListener('change', function (e) {
        if (e.target.type !== 'radio') return
        $$('input[type="radio"]', form).forEach(function (radio) {
          if (radio.name === e.target.name) clearFieldError(radio)
        })
      })

      form.addEventListener('submit', function (e) {
        e.preventDefault()
        var firstInvalid = null
        var seenRadio = {}
        fields().forEach(function (field) {
          if (field.type === 'radio') {
            // Report a radio group once, on its first radio
            if (seenRadio[field.name]) return
            seenRadio[field.name] = true
          }
          var message = fieldError(field, form)
          if (message) {
            showFieldError(field, message)
            if (!firstInvalid) firstInvalid = field
          } else {
            clearFieldError(field)
          }
        })

        if (firstInvalid) {
          firstInvalid.focus()
          return
        }

        // Other features (checkout) hook in here and may cancel the default behaviour
        var proceed = form.dispatchEvent(
          new CustomEvent('lk:valid', { cancelable: true })
        )
        if (!proceed) return

        var success = form.getAttribute('data-success')
        var reveal = form.getAttribute('data-success-show')
        var redirect = form.getAttribute('data-redirect')

        // Real project: send the mutation here (createComment, registerCustomer, checkout, ...)
        if (redirect) {
          if (success) toast(success, 'success')
          setTimeout(
            function () {
              location.href = redirect
            },
            success ? 900 : 0
          )
          return
        }
        if (reveal && $(reveal)) {
          $(reveal).hidden = false
          form.hidden = true
          $(reveal).focus()
          return
        }
        toast(success || 'ফর্ম সফলভাবে জমা হয়েছে।', 'success')
        form.reset()
        form.dispatchEvent(new CustomEvent('lk:reset'))
      })
    })
  }

  /* ======================================================================
     15. Back to top
     ====================================================================== */
  function initBackToTop () {
    var button = el(
      '<button type="button" aria-label="উপরে যান" class="pointer-events-none fixed bottom-5 right-5 z-30 grid size-11 translate-y-3 place-items-center rounded-full bg-accent text-accent-ink opacity-0 shadow-lift transition duration-300 hover:brightness-110 data-visible:pointer-events-auto data-visible:translate-y-0 data-visible:opacity-100 print:hidden">' +
        icon('arrow-up', 'icon size-5') +
        '</button>'
    )
    doc.body.appendChild(button)
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: scrollBehavior() })
    })
    var ticking = false
    window.addEventListener(
      'scroll',
      function () {
        if (ticking) return
        ticking = true
        requestAnimationFrame(function () {
          button.toggleAttribute('data-visible', window.scrollY > 600)
          ticking = false
        })
      },
      { passive: true }
    )
  }

  /* ======================================================================
     16. Search page
     ====================================================================== */
  function initSearchPage () {
    var page = $('[data-search-page]')
    if (!page) return
    var query = (new URLSearchParams(location.search).get('q') || '').trim()
    var resultsBox = $('[data-search-results]', page)
    var prompt = $('[data-search-prompt]', page)
    var list = $('[data-search-list]', page)
    var empty = $('[data-search-empty]', page)
    var count = $('[data-search-count]', page)
    var chips = $$('[data-search-type]', page)
    var type = 'all'

    $$('[data-search-input]', page).forEach(function (input) {
      input.value = query
    })
    $$('[data-search-term]', page).forEach(function (node) {
      node.textContent = query
    })
    if (resultsBox) resultsBox.hidden = !query
    if (prompt) prompt.hidden = !!query
    if (!query || !list) return

    var matches = searchIndex(query)

    function render () {
      var shown = matches.filter(function (item) {
        return type === 'all' || item.type === type
      })
      chips.forEach(function (chip) {
        chip.setAttribute(
          'aria-pressed',
          String(chip.getAttribute('data-search-type') === type)
        )
      })
      if (count) count.textContent = bn(shown.length)
      if (empty) empty.hidden = shown.length !== 0
      list.innerHTML = shown
        .map(function (item) {
          return (
            '<li class="animate-fade-up"><a href="' +
            esc(item.url) +
            '" class="group/result flex flex-col gap-1.5 rounded-card border border-line bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">' +
            '<span class="w-fit rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-link">' +
            SEARCH_TYPE_LABEL[item.type] +
            '</span>' +
            '<span class="font-serif text-lg font-semibold text-ink transition group-hover/result:text-link">' +
            highlight(item.title, query) +
            '</span>' +
            '<span class="text-sm text-ink-2">' +
            highlight(item.text || '', query) +
            '</span>' +
            '</a></li>'
          )
        })
        .join('')
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        type = chip.getAttribute('data-search-type')
        render()
      })
    })
    render()
  }

  /* ======================================================================
     Product data helper: reads data-product-* from the element itself or
     from the closest [data-product] host (the product card).
     ====================================================================== */
  function readProduct (node) {
    var host = node.closest('[data-product]') || node

    function get (name) {
      return (
        node.getAttribute('data-product-' + name) ||
        host.getAttribute('data-product-' + name) ||
        ''
      )
    }

    return {
      id: get('id'),
      name: get('name'),
      price: Number(get('price')) || 0,
      regular: Number(get('regular-price')) || 0,
      image: get('image'),
      url: get('url') || 'product.html',
      category: get('category'),
      rating: Number(get('rating')) || 0,
      reviews: Number(get('reviews')) || 0,
      description: get('description'),
      stock: get('stock') || 'in'
    }
  }

  /* ======================================================================
     17. Cart (demo, localStorage "lk-cart")
     Next.js: replace the store with a WooGraphQL cart session
     (addToCart, updateItemQuantities, removeItemsFromCart, applyCoupon, checkout).
     ====================================================================== */
  var FREE_DELIVERY_FROM = 1000
  var DELIVERY_FEE = { inside: 60, outside: 120 }
  var COUPONS = { LEKHONI10: 0.1 }
  var cartDrawer = null

  function getCart () {
    var cart = store.get('lk-cart', [])
    return Array.isArray(cart) ? cart : []
  }

  function cartTotals (cart) {
    cart = cart || getCart()
    var subtotal = cart.reduce(function (sum, item) {
      return sum + item.price * item.qty
    }, 0)
    var coupon = store.get('lk-coupon', '')
    var discount = COUPONS[coupon] ? Math.round(subtotal * COUPONS[coupon]) : 0
    var zone =
      store.get('lk-zone', 'inside') === 'outside' ? 'outside' : 'inside'
    var delivery =
      !cart.length || subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE[zone]
    return {
      count: cart.reduce(function (sum, item) {
        return sum + item.qty
      }, 0),
      subtotal: subtotal,
      coupon: COUPONS[coupon] ? coupon : '',
      discount: discount,
      zone: zone,
      delivery: delivery,
      total: subtotal - discount + delivery
    }
  }

  function saveCart (cart) {
    store.set('lk-cart', cart)
    renderCart()
  }

  function cartLineHTML (item, large) {
    var key = esc(item.key)
    var stepper =
      '<div class="inline-flex items-center rounded-full border border-line bg-surface">' +
      '<button type="button" data-cart-dec data-key="' +
      key +
      '" aria-label="পরিমাণ কমান" class="grid size-8 place-items-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link">' +
      icon('minus', 'icon size-3.5') +
      '</button>' +
      '<span class="min-w-7 text-center text-sm font-semibold text-ink" aria-label="পরিমাণ">' +
      bn(item.qty) +
      '</span>' +
      '<button type="button" data-cart-inc data-key="' +
      key +
      '" aria-label="পরিমাণ বাড়ান" class="grid size-8 place-items-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link">' +
      icon('plus', 'icon size-3.5') +
      '</button>' +
      '</div>'
    var remove =
      '<button type="button" data-cart-remove data-key="' +
      key +
      '" aria-label="' +
      esc(item.name) +
      ' সরিয়ে ফেলুন" class="grid size-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-danger/10 hover:text-danger">' +
      icon('trash', 'icon size-4') +
      '</button>'
    var variant = item.variant
      ? '<p class="mt-0.5 text-xs text-muted">' + esc(item.variant) + '</p>'
      : ''

    if (large) {
      return (
        '<li class="flex flex-wrap items-center gap-4 py-5 sm:flex-nowrap">' +
        '<a href="' +
        esc(item.url) +
        '" class="shrink-0"><img src="' +
        esc(item.image) +
        '" alt="" width="96" height="96" loading="lazy" class="size-24 rounded-xl border border-line bg-surface-2 object-cover"></a>' +
        '<div class="min-w-0 flex-1 basis-40"><a href="' +
        esc(item.url) +
        '" class="font-serif text-base font-semibold text-ink transition hover:text-link">' +
        esc(item.name) +
        '</a>' +
        variant +
        '<p class="mt-1 text-sm text-ink-2">' +
        money(item.price) +
        ' × ' +
        bn(item.qty) +
        '</p></div>' +
        stepper +
        '<p class="min-w-20 text-right text-base font-bold text-ink">' +
        money(item.price * item.qty) +
        '</p>' +
        remove +
        '</li>'
      )
    }
    return (
      '<li class="flex gap-3 py-4">' +
      '<img src="' +
      esc(item.image) +
      '" alt="" width="72" height="72" loading="lazy" class="size-18 shrink-0 rounded-xl border border-line bg-surface-2 object-cover">' +
      '<div class="min-w-0 flex-1"><p class="line-clamp-2 text-sm font-semibold leading-snug text-ink">' +
      esc(item.name) +
      '</p>' +
      variant +
      '<div class="mt-2 flex items-center justify-between gap-2">' +
      stepper +
      '<span class="text-sm font-bold text-ink">' +
      money(item.price * item.qty) +
      '</span></div></div>' +
      remove +
      '</li>'
    )
  }

  function freeDeliveryHTML (totals) {
    var left = FREE_DELIVERY_FROM - totals.subtotal
    var percent = clamp(
      Math.round((totals.subtotal / FREE_DELIVERY_FROM) * 100),
      0,
      100
    )
    var text =
      left > 0
        ? 'আর ' + money(left) + ' কিনলেই ফ্রি ডেলিভারি'
        : 'অভিনন্দন! আপনি ফ্রি ডেলিভারি পাচ্ছেন'
    return (
      '<p class="flex items-center gap-2 text-sm font-medium text-ink">' +
      icon('truck', 'icon size-4 text-link') +
      '<span>' +
      text +
      '</span></p>' +
      '<div role="progressbar" aria-label="ফ্রি ডেলিভারির অগ্রগতি" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' +
      percent +
      '" class="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">' +
      '<div class="h-full rounded-full bg-accent transition-[width] duration-500" style="width:' +
      percent +
      '%"></div></div>'
    )
  }

  function drawerBodyHTML () {
    var cart = getCart()
    var totals = cartTotals(cart)
    if (!cart.length) {
      return (
        '<div class="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">' +
        '<span class="grid size-20 place-items-center rounded-full bg-surface-2 text-muted">' +
        icon('cart', 'icon size-9') +
        '</span>' +
        '<p class="font-serif text-xl font-semibold text-ink">আপনার কার্ট খালি</p>' +
        '<p class="text-sm text-ink-2">পছন্দের পণ্য কার্টে যোগ করুন, এখানে দেখা যাবে।</p>' +
        '<a href="shop.html" class="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110">শপে যান</a>' +
        '</div>'
      )
    }
    return (
      '<div class="border-b border-line px-5 py-4">' +
      freeDeliveryHTML(totals) +
      '</div>' +
      '<ul class="flex-1 divide-y divide-line overflow-y-auto px-5">' +
      cart
        .map(function (item) {
          return cartLineHTML(item, false)
        })
        .join('') +
      '</ul>' +
      '<div class="space-y-3 border-t border-line bg-surface-2 p-5">' +
      '<p class="flex items-center justify-between text-base"><span class="text-ink-2">সাবটোটাল</span><strong class="font-bold text-ink">' +
      money(totals.subtotal) +
      '</strong></p>' +
      '<p class="text-xs text-muted">ডেলিভারি চার্জ ও কুপন চেকআউটে হিসাব হবে।</p>' +
      '<div class="grid grid-cols-2 gap-3">' +
      '<a href="cart.html" class="inline-flex items-center justify-center rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-link">কার্ট দেখুন</a>' +
      '<a href="checkout.html" class="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110">চেকআউট</a>' +
      '</div></div>'
    )
  }

  function openCartDrawer () {
    if (cartDrawer) return
    var node = el(
      '<div class="fixed inset-0 z-[70] flex justify-end bg-black/50 print:hidden">' +
        '<aside role="dialog" aria-modal="true" aria-label="শপিং কার্ট" class="flex h-full w-full max-w-md flex-col bg-surface shadow-lift animate-slide-in">' +
        '<header class="flex items-center justify-between border-b border-line px-5 py-4">' +
        '<h2 class="flex items-center gap-2 text-lg text-ink">' +
        icon('cart', 'icon size-5 text-link') +
        'আপনার কার্ট <span class="font-sans text-sm font-normal text-muted">(<span data-cart-count>০</span>টি)</span></h2>' +
        '<button type="button" data-layer-close aria-label="কার্ট বন্ধ করুন" class="grid size-10 place-items-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link">' +
        icon('close', 'icon size-5') +
        '</button>' +
        '</header>' +
        '<div data-drawer-body class="flex min-h-0 flex-1 flex-col"></div>' +
        '</aside></div>'
    )
    cartDrawer = openLayer(node, {
      focus: '[data-layer-close]',
      onClose: function () {
        cartDrawer = null
      }
    })
    renderCart()
  }

  function renderCart () {
    var cart = getCart()
    var totals = cartTotals(cart)

    $$('[data-cart-count]').forEach(function (node) {
      node.textContent = bn(totals.count)
      node.toggleAttribute('data-empty', totals.count === 0)
    })

    if (cartDrawer)
      $('[data-drawer-body]', cartDrawer.node).innerHTML = drawerBodyHTML()

    // Full cart page
    var page = $('[data-cart-page]')
    if (page) {
      var empty = $('[data-cart-empty]', page)
      var filled = $('[data-cart-filled]', page)
      var items = $('[data-cart-items]', page)
      if (empty) empty.hidden = cart.length > 0
      if (filled) filled.hidden = cart.length === 0
      if (items) {
        items.innerHTML = cart
          .map(function (item) {
            return cartLineHTML(item, true)
          })
          .join('')
      }
    }

    // Totals cards (cart page and checkout order summary)
    $$('[data-cart-summary]').forEach(function (summary) {
      var list = $('[data-summary-items]', summary)
      if (list) {
        list.innerHTML = cart
          .map(function (item) {
            return (
              '<li class="flex items-center gap-3 py-3">' +
              '<span class="relative shrink-0"><img src="' +
              esc(item.image) +
              '" alt="" width="56" height="56" loading="lazy" class="size-14 rounded-xl border border-line bg-surface-2 object-cover">' +
              '<span class="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-ink text-[0.6875rem] font-bold text-page">' +
              bn(item.qty) +
              '</span></span>' +
              '<span class="min-w-0 flex-1"><span class="line-clamp-2 text-sm font-medium leading-snug text-ink">' +
              esc(item.name) +
              '</span>' +
              (item.variant
                ? '<span class="block text-xs text-muted">' +
                  esc(item.variant) +
                  '</span>'
                : '') +
              '</span>' +
              '<span class="text-sm font-semibold text-ink">' +
              money(item.price * item.qty) +
              '</span></li>'
            )
          })
          .join('')
      }
      var values = {
        subtotal: money(totals.subtotal),
        discount: '− ' + money(totals.discount),
        delivery: totals.delivery
          ? money(totals.delivery)
          : cart.length
          ? 'ফ্রি'
          : money(0),
        total: money(totals.total)
      }
      $$('[data-sum]', summary).forEach(function (node) {
        node.textContent = values[node.getAttribute('data-sum')] || ''
      })
      var discountRow = $('[data-discount-row]', summary)
      if (discountRow) discountRow.hidden = !totals.discount
      var free = $('[data-free-delivery]', summary)
      if (free) free.innerHTML = freeDeliveryHTML(totals)
      var applied = $('[data-coupon-applied]', summary)
      if (applied) {
        applied.hidden = !totals.coupon
        var code = $('[data-coupon-code]', applied)
        if (code) code.textContent = totals.coupon
      }
      var couponForm = $('[data-coupon-form]', summary)
      if (couponForm) couponForm.hidden = !!totals.coupon
    })

    // Checkout: nothing to order
    var checkoutEmpty = $('[data-checkout-empty]')
    if (checkoutEmpty) checkoutEmpty.hidden = cart.length > 0
    var checkoutBody = $('[data-checkout-body]')
    if (checkoutBody) checkoutBody.hidden = cart.length === 0

    $$('input[name="delivery_zone"]').forEach(function (radio) {
      radio.checked = radio.value === totals.zone
    })
  }

  function variantSelection (scope) {
    // Returns { ok, label } for the variant pickers inside a product scope
    var result = { ok: true, label: '' }
    if (!scope) return result
    var picker = $('[data-variants]', scope)
    if (!picker) return result
    var parts = []
    var firstMissing = null
    $$('[data-variant-group]', picker).forEach(function (group) {
      var chosen = $('[data-variant-value][aria-pressed="true"]', group)
      if (chosen)
        parts.push(
          group.getAttribute('data-variant-name') +
            ': ' +
            chosen.getAttribute('data-variant-value')
        )
      else if (!firstMissing) firstMissing = group
    })
    var message = $('[data-variant-message]', picker)
    if (firstMissing) {
      result.ok = false
      if (message) {
        message.textContent =
          'কার্টে যোগ করার আগে ' +
          firstMissing.getAttribute('data-variant-name') +
          ' বেছে নিন।'
        message.hidden = false
      }
      var first = $('[data-variant-value]', firstMissing)
      if (first) first.focus()
    } else if (message) {
      message.hidden = true
    }
    result.label = parts.join(', ')
    return result
  }

  function addToCart (button) {
    var product = readProduct(button)
    if (!product.id || product.stock === 'out') return false
    var scope = button.closest('[data-product]')
    var variant = variantSelection(scope)
    if (!variant.ok) {
      toast('আগে সব অপশন বেছে নিন', 'error')
      return false
    }
    var qtyInput = scope ? $('[data-qty] input', scope) : null
    var qty = qtyInput ? Math.max(1, Number(qtyInput.value) || 1) : 1
    var key = product.id + (variant.label ? '::' + variant.label : '')
    var cart = getCart()
    var existing = cart.filter(function (item) {
      return item.key === key
    })[0]
    if (existing) existing.qty += qty
    else
      cart.push({
        key: key,
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        url: product.url,
        variant: variant.label,
        qty: qty
      })
    saveCart(cart)
    return true
  }

  function initCart () {
    doc.addEventListener('click', function (e) {
      var add = e.target.closest('[data-add-to-cart]')
      if (add) {
        if (add.disabled) return
        var name = readProduct(add).name
        var quickView = add.closest('[data-quick-view-dialog]')
        if (addToCart(add)) {
          toast(name + ' কার্টে যোগ হয়েছে', 'success')
          if (quickView && activeLayer) activeLayer.close(true)
          if (!cartDrawer) openCartDrawer()
        }
        return
      }

      var buy = e.target.closest('[data-buy-now]')
      if (buy) {
        if (addToCart(buy)) location.href = 'checkout.html'
        return
      }

      if (e.target.closest('[data-cart-open]')) {
        openCartDrawer()
        return
      }

      var change = e.target.closest(
        '[data-cart-inc], [data-cart-dec], [data-cart-remove]'
      )
      if (change) {
        var key = change.getAttribute('data-key')
        var cart = getCart()
        var selector = change.hasAttribute('data-cart-inc')
          ? '[data-cart-inc]'
          : change.hasAttribute('data-cart-dec')
          ? '[data-cart-dec]'
          : ''
        var holder = change.closest('[data-drawer-body], [data-cart-items]')
        cart.forEach(function (item) {
          if (item.key !== key) return
          if (change.hasAttribute('data-cart-inc'))
            item.qty = Math.min(99, item.qty + 1)
          if (change.hasAttribute('data-cart-dec')) item.qty -= 1
          if (change.hasAttribute('data-cart-remove')) item.qty = 0
        })
        var removed = cart.some(function (item) {
          return item.qty < 1
        })
        saveCart(
          cart.filter(function (item) {
            return item.qty > 0
          })
        )
        if (removed) toast('পণ্যটি কার্ট থেকে সরানো হয়েছে', 'info')
        // The list was re-rendered: put focus back on the same control
        if (holder && selector && !removed) {
          var again = $$(selector, holder).filter(function (node) {
            return node.getAttribute('data-key') === key
          })[0]
          if (again) again.focus()
        } else if (
          holder &&
          cartDrawer &&
          holder.hasAttribute('data-drawer-body')
        ) {
          var close = $('[data-layer-close]', cartDrawer.node)
          if (close) close.focus()
        }
        return
      }

      if (e.target.closest('[data-coupon-remove]')) {
        store.remove('lk-coupon')
        renderCart()
        toast('কুপন সরানো হয়েছে', 'info')
      }
    })

    // Coupon forms (demo code: LEKHONI10 = 10% off)
    doc.addEventListener('submit', function (e) {
      var form = e.target.closest('[data-coupon-form]')
      if (!form) return
      e.preventDefault()
      var input = $('input', form)
      var message = $('[data-coupon-message]', form.parentElement)
      var code = input.value.trim().toUpperCase()
      if (COUPONS[code]) {
        store.set('lk-coupon', code)
        input.value = ''
        input.removeAttribute('aria-invalid')
        if (message) message.hidden = true
        renderCart()
        toast('কুপন প্রয়োগ হয়েছে: ১০% ছাড়', 'success')
      } else {
        input.setAttribute('aria-invalid', 'true')
        if (message) {
          message.textContent = code
            ? 'এই কুপন কোডটি সঠিক নয়।'
            : 'কুপন কোড লিখুন।'
          message.hidden = false
        }
        input.focus()
      }
    })

    // Delivery zone radios (cart page and checkout)
    doc.addEventListener('change', function (e) {
      if (e.target.name === 'delivery_zone') {
        store.set('lk-zone', e.target.value)
        renderCart()
      }
    })

    // Checkout: runs after validation succeeded, before the redirect
    var checkout = $('[data-checkout-form]')
    if (checkout) {
      checkout.addEventListener('lk:valid', function (e) {
        var cart = getCart()
        if (!cart.length) {
          e.preventDefault()
          toast('আপনার কার্ট খালি', 'error')
          return
        }
        var totals = cartTotals(cart)
        var data = new FormData(checkout)
        var payment = $('input[name="payment_method"]:checked', checkout)
        var now = new Date()
        // Real project: call the WooGraphQL `checkout` mutation and use the returned order
        store.set('lk-last-order', {
          number: 'LK-' + String(now.getTime()).slice(-6),
          date: now.toISOString(),
          items: cart,
          subtotal: totals.subtotal,
          discount: totals.discount,
          delivery: totals.delivery,
          total: totals.total,
          payment: payment
            ? payment.getAttribute('data-label') || payment.value
            : '',
          name: data.get('name') || '',
          phone: data.get('phone') || '',
          address: [
            data.get('address'),
            data.get('thana'),
            data.get('district'),
            data.get('division')
          ]
            .filter(Boolean)
            .join(', ')
        })
      })
    }

    // Order received page
    var received = $('[data-order-received]')
    if (received) {
      var order = store.get('lk-last-order', null)
      var missing = $('[data-order-missing]')
      if (!order) {
        received.hidden = true
        if (missing) missing.hidden = false
      } else {
        var date = new Date(order.date)
        var MONTHS = [
          'জানুয়ারি',
          'ফেব্রুয়ারি',
          'মার্চ',
          'এপ্রিল',
          'মে',
          'জুন',
          'জুলাই',
          'আগস্ট',
          'সেপ্টেম্বর',
          'অক্টোবর',
          'নভেম্বর',
          'ডিসেম্বর'
        ]
        var values = {
          number: '#' + bn(order.number),
          date:
            bn(date.getDate()) +
            ' ' +
            MONTHS[date.getMonth()] +
            ', ' +
            bn(date.getFullYear()),
          payment: order.payment,
          name: order.name,
          phone: bn(order.phone),
          address: order.address,
          subtotal: money(order.subtotal),
          discount: '− ' + money(order.discount),
          delivery: order.delivery ? money(order.delivery) : 'ফ্রি',
          total: money(order.total)
        }
        $$('[data-order]', received).forEach(function (node) {
          node.textContent = values[node.getAttribute('data-order')] || ''
        })
        var discountRow = $('[data-order-discount-row]', received)
        if (discountRow) discountRow.hidden = !order.discount
        var orderItems = $('[data-order-items]', received)
        if (orderItems) {
          orderItems.innerHTML = order.items
            .map(function (item) {
              return (
                '<li class="flex items-center gap-3 py-3">' +
                '<img src="' +
                esc(item.image) +
                '" alt="" width="56" height="56" loading="lazy" class="size-14 shrink-0 rounded-xl border border-line bg-surface-2 object-cover">' +
                '<span class="min-w-0 flex-1"><span class="block text-sm font-medium leading-snug text-ink">' +
                esc(item.name) +
                ' × ' +
                bn(item.qty) +
                '</span>' +
                (item.variant
                  ? '<span class="block text-xs text-muted">' +
                    esc(item.variant) +
                    '</span>'
                  : '') +
                '</span>' +
                '<span class="text-sm font-semibold text-ink">' +
                money(item.price * item.qty) +
                '</span></li>'
              )
            })
            .join('')
        }
        // The order is placed: empty the cart and forget the coupon
        store.set('lk-cart', [])
        store.remove('lk-coupon')
      }
    }

    renderCart()

    // Keep several open tabs in sync
    window.addEventListener('storage', function (e) {
      if (e.key === 'lk-cart' || e.key === 'lk-coupon' || e.key === 'lk-zone')
        renderCart()
      if (e.key === 'lk-wishlist') renderWishlist()
    })
  }

  /* ======================================================================
     18. Quantity stepper
     ====================================================================== */
  function initQuantity () {
    function limit (stepper, value) {
      var max = Number(stepper.getAttribute('data-max')) || 99
      return clamp(Math.round(Number(value) || 1), 1, max)
    }

    doc.addEventListener('click', function (e) {
      var button = e.target.closest('[data-qty-minus], [data-qty-plus]')
      if (!button) return
      var stepper = button.closest('[data-qty]')
      var input = stepper && $('input', stepper)
      if (!input) return
      input.value = limit(
        stepper,
        Number(input.value) + (button.hasAttribute('data-qty-plus') ? 1 : -1)
      )
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })

    doc.addEventListener('change', function (e) {
      var stepper = e.target.closest && e.target.closest('[data-qty]')
      if (stepper && e.target.tagName === 'INPUT')
        e.target.value = limit(stepper, e.target.value)
    })
  }

  /* ======================================================================
     19. Product gallery
     ====================================================================== */
  function initProductGallery () {
    $$('[data-product-gallery]').forEach(function (gallery) {
      var main = $('[data-gallery-main]', gallery)
      var thumbs = $$('[data-gallery-thumb]', gallery)
      if (!main || !thumbs.length) return
      var image = $('img', main) || main
      var current = 0

      function select (index) {
        current = index
        image.src = thumbs[index].getAttribute('data-src')
        thumbs.forEach(function (thumb, i) {
          if (i === index) thumb.setAttribute('aria-current', 'true')
          else thumb.removeAttribute('aria-current')
        })
      }

      thumbs.forEach(function (thumb, i) {
        thumb.addEventListener('click', function () {
          select(i)
        })
      })

      main.addEventListener('click', function () {
        openLightbox(
          thumbs.map(function (thumb) {
            return {
              src: thumb.getAttribute('data-src'),
              alt: thumb.getAttribute('data-alt') || image.alt
            }
          }),
          current
        )
      })
    })
  }

  /* ======================================================================
     20. Variant picker
     ====================================================================== */
  function initVariants () {
    doc.addEventListener('click', function (e) {
      var button = e.target.closest('[data-variant-value]')
      if (!button) return
      var group = button.closest('[data-variant-group]')
      var picker = button.closest('[data-variants]')
      if (!group || !picker) return
      $$('[data-variant-value]', group).forEach(function (option) {
        option.setAttribute('aria-pressed', String(option === button))
      })
      var label = $('[data-variant-selected]', group)
      if (label) label.textContent = button.getAttribute('data-variant-value')
      var allChosen = $$('[data-variant-group]', picker).every(function (item) {
        return $('[data-variant-value][aria-pressed="true"]', item)
      })
      var message = $('[data-variant-message]', picker)
      if (message && allChosen) message.hidden = true
    })
  }

  /* ======================================================================
     21. Tabs
     ====================================================================== */
  function initTabs () {
    $$('[data-tabs]').forEach(function (scope) {
      var tabs = $$('[role="tab"]', scope).filter(function (tab) {
        return tab.closest('[data-tabs]') === scope
      })
      if (!tabs.length) return
      var param = scope.getAttribute('data-tabs-param')

      function panelOf (tab) {
        return doc.getElementById(tab.getAttribute('aria-controls'))
      }

      function select (index, focus, updateUrl) {
        tabs.forEach(function (tab, i) {
          var on = i === index
          tab.setAttribute('aria-selected', String(on))
          tab.setAttribute('tabindex', on ? '0' : '-1')
          var panel = panelOf(tab)
          if (panel) panel.hidden = !on
        })
        if (focus) tabs[index].focus()
        if (param && updateUrl) {
          var query = new URLSearchParams(location.search)
          query.set(
            param,
            tabs[index].getAttribute('data-tab') || String(index)
          )
          history.replaceState(
            null,
            '',
            location.pathname + '?' + query.toString() + location.hash
          )
        }
      }

      function indexOfKey (key) {
        for (var i = 0; i < tabs.length; i++)
          if (tabs[i].getAttribute('data-tab') === key) return i
        return -1
      }

      tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () {
          select(i, false, true)
        })
        tab.addEventListener('keydown', function (e) {
          var next = -1
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown')
            next = (i + 1) % tabs.length
          if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
            next = (i - 1 + tabs.length) % tabs.length
          if (e.key === 'Home') next = 0
          if (e.key === 'End') next = tabs.length - 1
          if (next !== -1) {
            e.preventDefault()
            select(next, true, true)
          }
        })
      })

      // Links elsewhere on the page can switch tabs: <a data-tab-link="orders">
      doc.addEventListener('click', function (e) {
        var link = e.target.closest('[data-tab-link]')
        if (!link) return
        var index = indexOfKey(link.getAttribute('data-tab-link'))
        if (index === -1) return
        e.preventDefault()
        select(index, true, true)
        scope.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
      })

      var initial = param
        ? indexOfKey(new URLSearchParams(location.search).get(param))
        : -1
      if (initial === -1) {
        initial = Math.max(
          0,
          tabs.findIndex(function (tab) {
            return tab.getAttribute('aria-selected') === 'true'
          })
        )
      }
      select(initial, false, false)
    })
  }

  /* ======================================================================
     22. Password tools: show/hide and strength meter
     ====================================================================== */
  function initPasswordTools () {
    $$('[data-password-toggle]').forEach(function (button) {
      var holder = button.closest('[data-field]') || button.parentElement
      var input = $('input', holder)
      if (!input) return
      button.addEventListener('click', function () {
        var show = input.type === 'password'
        input.type = show ? 'text' : 'password'
        button.setAttribute('aria-pressed', String(show))
        button.setAttribute(
          'aria-label',
          show ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখান'
        )
      })
    })

    $$('[data-password-strength]').forEach(function (meter) {
      var input = $(meter.getAttribute('data-password-strength'))
      var label = $('[data-strength-label]', meter)
      if (!input) return
      var LABELS = ['', 'দুর্বল', 'মাঝারি', 'শক্তিশালী']

      function update () {
        var value = input.value
        var score = 0
        if (value.length >= 8) score++
        if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++
        if (/\d|[০-৯]/.test(value)) score++
        if (/[^A-Za-z0-9০-৯]/.test(value)) score++
        if (value.length >= 12) score++
        var level = !value ? 0 : score <= 2 ? 1 : score <= 3 ? 2 : 3
        // The bar reacts through group-data-[level=N]/strength: variants
        meter.setAttribute('data-level', String(level))
        if (label)
          label.textContent = level ? 'পাসওয়ার্ডের মান: ' + LABELS[level] : ''
      }

      input.addEventListener('input', update)
      var form = input.closest('form')
      if (form) form.addEventListener('lk:reset', update)
      update()
    })
  }

  /* ======================================================================
     23. Toast demo buttons
     ====================================================================== */
  function initToastDemo () {
    doc.addEventListener('click', function (e) {
      var button = e.target.closest('[data-toast]')
      if (button)
        toast(
          button.getAttribute('data-toast'),
          button.getAttribute('data-toast-type') || 'info'
        )
    })
  }

  /* ======================================================================
     24. Carousel (generic: hero, product sliders, categories, testimonials)
     ====================================================================== */
  function initCarousels () {
    $$('[data-carousel]').forEach(function (carousel) {
      var track = $('[data-carousel-track]', carousel)
      if (!track) return
      var slides = Array.prototype.slice.call(track.children)
      if (!slides.length) return
      var prev = $('[data-carousel-prev]', carousel)
      var next = $('[data-carousel-next]', carousel)
      var dotsBox = $('[data-carousel-dots]', carousel)
      var toggle = $('[data-carousel-toggle]', carousel)
      var loop = carousel.hasAttribute('data-loop')
      var delay = Number(carousel.getAttribute('data-autoplay')) || 0
      var active = 0
      var visible = {}
      var dots = []

      // Accessibility wiring
      if (!carousel.hasAttribute('role'))
        carousel.setAttribute('role', 'region')
      carousel.setAttribute('aria-roledescription', 'carousel')
      slides.forEach(function (slide, i) {
        slide.setAttribute('role', 'group')
        slide.setAttribute('aria-roledescription', 'slide')
        slide.setAttribute(
          'aria-label',
          bn(slides.length) + 'টির মধ্যে ' + bn(i + 1)
        )
      })

      function atStart () {
        return track.scrollLeft <= 4
      }

      function atEnd () {
        return track.scrollLeft + track.clientWidth >= track.scrollWidth - 4
      }

      function goTo (index) {
        var target = slides[clamp(index, 0, slides.length - 1)]
        var left =
          target.getBoundingClientRect().left -
          track.getBoundingClientRect().left +
          track.scrollLeft
        track.scrollTo({ left: left, behavior: scrollBehavior() })
      }

      function goNext () {
        if (atEnd()) {
          if (loop) goTo(0)
        } else {
          goTo(active + 1)
        }
      }

      function goPrev () {
        if (atStart()) {
          if (loop) goTo(slides.length - 1)
        } else {
          goTo(active - 1)
        }
      }

      function syncControls () {
        if (!loop) {
          if (prev) prev.disabled = atStart()
          if (next) next.disabled = atEnd()
        }
        dots.forEach(function (dot, i) {
          if (i === active) dot.setAttribute('aria-current', 'true')
          else dot.removeAttribute('aria-current')
        })
        slides.forEach(function (slide, i) {
          slide.toggleAttribute('data-active', i === active)
        })
      }

      if (dotsBox) {
        slides.forEach(function (slide, i) {
          var dot = el(
            '<button type="button" class="h-2.5 w-2.5 rounded-full bg-ink/25 transition-all duration-300 hover:bg-ink/50 aria-[current=true]:w-7 aria-[current=true]:bg-accent"></button>'
          )
          dot.setAttribute('aria-label', 'স্লাইড ' + bn(i + 1) + ' দেখুন')
          dot.addEventListener('click', function () {
            goTo(i)
          })
          dotsBox.appendChild(dot)
          dots.push(dot)
        })
      }

      if (prev) prev.addEventListener('click', goPrev)
      if (next) next.addEventListener('click', goNext)

      // Track the active slide (first slide that is mostly visible)
      if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              visible[slides.indexOf(entry.target)] = entry.isIntersecting
            })
            for (var i = 0; i < slides.length; i++) {
              if (visible[i]) {
                active = i
                break
              }
            }
            syncControls()
          },
          { root: track, threshold: 0.6 }
        )
        slides.forEach(function (slide) {
          observer.observe(slide)
        })
      }

      var scrollTick = false
      track.addEventListener(
        'scroll',
        function () {
          if (scrollTick) return
          scrollTick = true
          requestAnimationFrame(function () {
            syncControls()
            scrollTick = false
          })
        },
        { passive: true }
      )

      carousel.addEventListener('keydown', function (e) {
        if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return
        if (e.target.closest('[data-carousel]') !== carousel) return
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          goNext()
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault()
          goPrev()
        }
      })

      // Autoplay: pauses on hover, on focus inside, when the tab is hidden,
      // and never starts when the user prefers reduced motion.
      if (delay && !reducedMotion.matches) {
        var timer = null
        var userPaused = false
        var hovering = false
        var focused = false

        var refresh = function () {
          var shouldRun = !userPaused && !hovering && !focused && !doc.hidden
          if (shouldRun && !timer) timer = setInterval(goNext, delay)
          if (!shouldRun && timer) {
            clearInterval(timer)
            timer = null
          }
          carousel.toggleAttribute('data-paused', userPaused)
          if (toggle)
            toggle.setAttribute(
              'aria-label',
              userPaused ? 'স্লাইড চালু করুন' : 'স্লাইড থামান'
            )
        }

        carousel.addEventListener('mouseenter', function () {
          hovering = true
          refresh()
        })
        carousel.addEventListener('mouseleave', function () {
          hovering = false
          refresh()
        })
        carousel.addEventListener('focusin', function () {
          focused = true
          refresh()
        })
        carousel.addEventListener('focusout', function (e) {
          if (!carousel.contains(e.relatedTarget)) {
            focused = false
            refresh()
          }
        })
        doc.addEventListener('visibilitychange', refresh)
        if (toggle) {
          toggle.addEventListener('click', function () {
            userPaused = !userPaused
            refresh()
          })
        }
        refresh()
      } else if (toggle) {
        toggle.hidden = true
      }

      syncControls()
    })
  }

  /* ======================================================================
     25. Countdown
     ====================================================================== */
  function initCountdown () {
    $$('[data-countdown]').forEach(function (node) {
      var end = new Date(node.getAttribute('data-countdown')).getTime()
      if (isNaN(end)) return
      var units = {}
      $$('[data-unit]', node).forEach(function (unit) {
        units[unit.getAttribute('data-unit')] = unit
      })
      var ended = $('[data-countdown-ended]', node)
      var body = $('[data-countdown-body]', node)
      var timer = null

      function pad (value) {
        return bn(value < 10 ? '0' + value : String(value))
      }

      function tick () {
        var left = Math.max(0, end - Date.now())
        var seconds = Math.floor(left / 1000)
        var values = {
          d: Math.floor(seconds / 86400),
          h: Math.floor((seconds % 86400) / 3600),
          m: Math.floor((seconds % 3600) / 60),
          s: seconds % 60
        }
        Object.keys(units).forEach(function (key) {
          units[key].textContent = pad(values[key])
        })
        if (left <= 0) {
          if (ended) ended.hidden = false
          if (body) body.hidden = true
          if (timer) clearInterval(timer)
        }
      }

      tick()
      timer = setInterval(tick, 1000)
    })
  }

  /* ======================================================================
     26. Wishlist (localStorage "lk-wishlist")
     ====================================================================== */
  function getWishlist () {
    var list = store.get('lk-wishlist', [])
    return Array.isArray(list) ? list : []
  }

  function syncWishlistButtons () {
    var ids = getWishlist().map(function (item) {
      return item.id
    })
    $$('[data-wishlist-toggle]').forEach(function (button) {
      var on = ids.indexOf(readProduct(button).id) !== -1
      button.setAttribute('aria-pressed', String(on))
      button.setAttribute(
        'aria-label',
        on ? 'পছন্দের তালিকা থেকে সরান' : 'পছন্দের তালিকায় যোগ করুন'
      )
    })
    $$('[data-wishlist-count]').forEach(function (node) {
      node.textContent = bn(ids.length)
      node.toggleAttribute('data-empty', ids.length === 0)
    })
  }

  function renderWishlist () {
    syncWishlistButtons()
    var grid = $('[data-wishlist-grid]')
    if (!grid) return
    var list = getWishlist()
    var empty = $('[data-wishlist-empty]')
    if (empty) empty.hidden = list.length > 0
    grid.hidden = list.length === 0
    // Account page: the wishlist tab renders from the same store
    grid.innerHTML = list
      .map(function (item) {
        return (
          '<li data-product data-product-id="' +
          esc(item.id) +
          '" data-product-name="' +
          esc(item.name) +
          '" data-product-price="' +
          esc(item.price) +
          '" data-product-image="' +
          esc(item.image) +
          '" data-product-url="' +
          esc(item.url) +
          '" class="flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-soft">' +
          '<a href="' +
          esc(item.url) +
          '" class="block aspect-square overflow-hidden bg-surface-2"><img src="' +
          esc(item.image) +
          '" alt="' +
          esc(item.name) +
          '" width="400" height="400" loading="lazy" class="size-full object-cover"></a>' +
          '<div class="flex flex-1 flex-col gap-2 p-4"><a href="' +
          esc(item.url) +
          '" class="line-clamp-2 font-serif text-base font-semibold leading-snug text-ink transition hover:text-link">' +
          esc(item.name) +
          '</a>' +
          '<p class="text-base font-bold text-ink">' +
          money(item.price) +
          '</p>' +
          '<div class="mt-auto flex gap-2 pt-1">' +
          '<button type="button" data-add-to-cart class="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition hover:brightness-110">' +
          icon('cart', 'icon size-4') +
          'কার্টে নিন</button>' +
          '<button type="button" data-wishlist-toggle aria-pressed="true" aria-label="পছন্দের তালিকা থেকে সরান" class="grid size-9 shrink-0 place-items-center rounded-full border border-line text-muted transition hover:border-danger hover:text-danger">' +
          icon('trash', 'icon size-4') +
          '</button>' +
          '</div></div></li>'
        )
      })
      .join('')
  }

  function initWishlist () {
    doc.addEventListener('click', function (e) {
      var button = e.target.closest('[data-wishlist-toggle]')
      if (!button) return
      e.preventDefault()
      var product = readProduct(button)
      if (!product.id) return
      var list = getWishlist()
      var exists = list.some(function (item) {
        return item.id === product.id
      })
      if (exists) {
        list = list.filter(function (item) {
          return item.id !== product.id
        })
        toast('পছন্দের তালিকা থেকে সরানো হয়েছে', 'info')
      } else {
        list.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          url: product.url
        })
        toast('পছন্দের তালিকায় যোগ হয়েছে', 'success')
      }
      store.set('lk-wishlist', list)
      renderWishlist()
    })
    renderWishlist()
  }

  /* ======================================================================
     27. Quick view
     ====================================================================== */
  function initQuickView () {
    doc.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-quick-view]')
      if (!trigger) return
      var p = readProduct(trigger)
      var out = p.stock === 'out'
      var price =
        p.regular > p.price
          ? '<span class="text-2xl font-bold text-sale">' +
            money(p.price) +
            '</span><del class="text-base text-muted">' +
            money(p.regular) +
            '</del>'
          : '<span class="text-2xl font-bold text-ink">' +
            money(p.price) +
            '</span>'
      var action = out
        ? '<button type="button" disabled class="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-full bg-surface-2 px-5 py-2.5 text-sm font-semibold text-muted">স্টক শেষ</button>'
        : '<button type="button" data-add-to-cart class="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110">' +
          icon('cart', 'icon size-4') +
          'কার্টে যোগ করুন</button>'

      // Next.js: fetch with WooGraphQL product(id: $slug, idType: SLUG) when the dialog opens
      var node = el(
        '<div class="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4 print:hidden">' +
          '<div role="dialog" aria-modal="true" aria-labelledby="lk-quick-title" data-quick-view-dialog data-product ' +
          'data-product-id="' +
          esc(p.id) +
          '" data-product-name="' +
          esc(p.name) +
          '" data-product-price="' +
          p.price +
          '" data-product-image="' +
          esc(p.image) +
          '" data-product-url="' +
          esc(p.url) +
          '" data-product-stock="' +
          esc(p.stock) +
          '" ' +
          'class="relative grid max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-card border border-line bg-surface shadow-lift animate-pop sm:grid-cols-2 sm:rounded-card">' +
          '<div class="aspect-square bg-surface-2"><img src="' +
          esc(p.image) +
          '" alt="' +
          esc(p.name) +
          '" width="800" height="800" class="size-full object-cover"></div>' +
          '<div class="flex flex-col gap-3 p-6">' +
          '<p class="text-xs font-semibold uppercase tracking-wide text-link">' +
          esc(p.category) +
          '</p>' +
          '<h2 id="lk-quick-title" class="pr-8 text-2xl text-ink">' +
          esc(p.name) +
          '</h2>' +
          '<div class="flex items-center gap-2"><span class="flex" aria-hidden="true">' +
          starsHTML(p.rating) +
          '</span><span class="text-sm text-muted">' +
          bn(p.rating.toFixed(1)) +
          ' (' +
          bn(p.reviews) +
          'টি রিভিউ)</span></div>' +
          '<p class="flex items-baseline gap-2">' +
          price +
          '</p>' +
          '<p class="text-sm leading-relaxed text-ink-2">' +
          esc(p.description) +
          '</p>' +
          '<div class="mt-auto flex flex-wrap items-center gap-3 pt-3">' +
          (out
            ? ''
            : '<div data-qty data-max="10" class="inline-flex items-center rounded-full border border-line">' +
              '<button type="button" data-qty-minus aria-label="পরিমাণ কমান" class="grid size-10 place-items-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link">' +
              icon('minus', 'icon size-4') +
              '</button>' +
              '<input type="number" value="1" min="1" max="10" inputmode="numeric" aria-label="পরিমাণ" class="w-10 bg-transparent text-center text-sm font-semibold text-ink [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none">' +
              '<button type="button" data-qty-plus aria-label="পরিমাণ বাড়ান" class="grid size-10 place-items-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link">' +
              icon('plus', 'icon size-4') +
              '</button></div>') +
          action +
          '</div>' +
          '<a href="' +
          esc(p.url) +
          '" class="inline-flex items-center gap-1.5 text-sm font-semibold text-link hover:underline">বিস্তারিত দেখুন' +
          icon('arrow-right', 'icon size-4') +
          '</a>' +
          '</div>' +
          '<button type="button" data-layer-close aria-label="বন্ধ করুন" class="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-surface/90 text-ink-2 shadow-soft transition hover:text-link">' +
          icon('close', 'icon size-5') +
          '</button>' +
          '</div></div>'
      )
      openLayer(node, { focus: '[data-layer-close]' })
    })
  }

  /* ======================================================================
     28. Dismissible announcement bar
     ====================================================================== */
  function initDismissible () {
    $$('[data-dismissible]').forEach(function (bar) {
      var key = 'lk-dismissed-' + bar.getAttribute('data-dismissible')
      if (store.get(key, false)) {
        bar.hidden = true
        return
      }
      var close = $('[data-dismiss]', bar)
      if (!close) return
      close.addEventListener('click', function () {
        bar.hidden = true
        store.set(key, true)
      })
    })
  }

  /* ======================================================================
     29. Recently viewed (localStorage "lk-recent", max 8)
     ====================================================================== */
  function initRecentlyViewed () {
    var list = store.get('lk-recent', [])
    if (!Array.isArray(list)) list = []
    var currentId = ''

    var tracked = $('[data-track-view]')
    if (tracked) {
      var product = readProduct(tracked)
      if (product.id) {
        currentId = product.id
        list = [
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            url: product.url
          }
        ]
          .concat(
            list.filter(function (item) {
              return item.id !== product.id
            })
          )
          .slice(0, 8)
        store.set('lk-recent', list)
      }
    }

    $$('[data-recently-viewed]').forEach(function (section) {
      var holder = $('[data-recent-list]', section) || section
      // On the product page do not list the product being viewed
      var shown = list.filter(function (item) {
        return item.id !== currentId
      })
      section.hidden = shown.length === 0
      holder.innerHTML = shown
        .map(function (item) {
          return (
            '<li><a href="' +
            esc(item.url) +
            '" class="group/recent flex items-center gap-3 rounded-card border border-line bg-surface p-3 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">' +
            '<img src="' +
            esc(item.image) +
            '" alt="" width="64" height="64" loading="lazy" class="size-16 shrink-0 rounded-xl bg-surface-2 object-cover">' +
            '<span class="min-w-0"><span class="line-clamp-2 text-sm font-semibold leading-snug text-ink transition group-hover/recent:text-link">' +
            esc(item.name) +
            '</span>' +
            '<span class="text-sm font-bold text-ink-2">' +
            money(item.price) +
            '</span></span></a></li>'
          )
        })
        .join('')
    })
  }

  /* ======================================================================
     30. Stock progress bar
     ====================================================================== */
  function initStockBars () {
    $$('[data-stock-sold]').forEach(function (node) {
      var sold = Number(node.getAttribute('data-stock-sold')) || 0
      var total = Number(node.getAttribute('data-stock-total')) || 0
      if (!total) return
      var percent = clamp(Math.round((sold / total) * 100), 0, 100)
      node.innerHTML =
        '<p class="flex items-center justify-between text-xs text-ink-2"><span>' +
        bn(percent) +
        '% বিক্রি হয়ে গেছে</span><span class="font-semibold text-sale">বাকি ' +
        bn(Math.max(0, total - sold)) +
        'টি</span></p>' +
        '<div role="progressbar" aria-label="বিক্রির অগ্রগতি" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' +
        percent +
        '" class="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">' +
        '<div class="h-full rounded-full bg-sale" style="width:' +
        percent +
        '%"></div></div>'
    })
  }

  /* ======================================================================
     Extra page helpers (not numbered in the brief)
     ====================================================================== */

  // Generic open/close toggle: <button data-toggle-open="#target">.
  // Used by the shop filter drawer on mobile.
  function initToggleOpen () {
    doc.addEventListener('click', function (e) {
      var button = e.target.closest('[data-toggle-open]')
      if (!button) return
      var target = $(button.getAttribute('data-toggle-open'))
      if (!target) return
      var open = !target.hasAttribute('data-open')
      target.toggleAttribute('data-open', open)
      $$(
        '[data-toggle-open="' + button.getAttribute('data-toggle-open') + '"]'
      ).forEach(function (other) {
        if (other.hasAttribute('aria-expanded'))
          other.setAttribute('aria-expanded', String(open))
      })
    })
  }

  // Shop archive: category, price and stock filters, sorting, grid/list view.
  // Next.js: these become WooGraphQL `products(where: { categoryIn, maxPrice, stockStatus, orderby })` variables.
  function initShopFilters () {
    var shop = $('[data-shop]')
    if (!shop) return
    var grid = $('[data-shop-grid]', shop)
    if (!grid) return
    var cards = $$('[data-product]', grid)
    cards.forEach(function (card, i) {
      card.setAttribute('data-order', String(i))
    })
    var categories = $$('[data-shop-category]', shop)
    var price = $('[data-shop-price]', shop)
    var priceLabel = $('[data-shop-price-label]', shop)
    var inStock = $('[data-shop-instock]', shop)
    var sort = $('[data-shop-sort]', shop)
    var count = $('[data-shop-count]', shop)
    var empty = $('[data-shop-empty]', shop)
    var views = $$('[data-shop-view]', shop)

    function apply () {
      var chosen = categories
        .filter(function (box) {
          return box.checked
        })
        .map(function (box) {
          return box.value
        })
      var max = price ? Number(price.value) : Infinity
      if (priceLabel && price) priceLabel.textContent = money(max)
      var visible = 0

      cards.forEach(function (card) {
        var p = readProduct(card)
        var show =
          (!chosen.length || chosen.indexOf(p.category) !== -1) &&
          p.price <= max &&
          (!inStock || !inStock.checked || p.stock !== 'out')
        card.hidden = !show
        if (show) visible++
      })

      var mode = sort ? sort.value : 'default'
      cards
        .slice()
        .sort(function (a, b) {
          var pa = readProduct(a)
          var pb = readProduct(b)
          if (mode === 'price-asc') return pa.price - pb.price
          if (mode === 'price-desc') return pb.price - pa.price
          if (mode === 'rating') return pb.rating - pa.rating
          if (mode === 'name') return pa.name.localeCompare(pb.name, 'bn')
          return (
            Number(a.getAttribute('data-order')) -
            Number(b.getAttribute('data-order'))
          )
        })
        .forEach(function (card) {
          grid.appendChild(card)
        })

      if (count) count.textContent = bn(visible)
      if (empty) empty.hidden = visible !== 0
    }

    shop.addEventListener('change', apply)
    shop.addEventListener('input', function (e) {
      if (e.target === price) apply()
    })

    var reset = $$('[data-shop-reset]', shop)
    reset.forEach(function (button) {
      button.addEventListener('click', function () {
        categories.forEach(function (box) {
          box.checked = false
        })
        if (price) price.value = price.max
        if (inStock) inStock.checked = false
        if (sort) sort.value = 'default'
        apply()
      })
    })

    function setView (view) {
      grid.setAttribute('data-view', view)
      views.forEach(function (button) {
        button.setAttribute(
          'aria-pressed',
          String(button.getAttribute('data-shop-view') === view)
        )
      })
      store.set('lk-shop-view', view)
    }

    views.forEach(function (button) {
      button.addEventListener('click', function () {
        setView(button.getAttribute('data-shop-view'))
      })
    })
    setView(store.get('lk-shop-view', 'grid') === 'list' ? 'list' : 'grid')
    apply()
  }

  // Live text filter: <input data-live-filter="#list"> hides [data-live-item] children that do not match.
  function initLiveFilter () {
    $$('[data-live-filter]').forEach(function (input) {
      var target = $(input.getAttribute('data-live-filter'))
      if (!target) return
      var items = $$('[data-live-item]', target)
      var empty = input.getAttribute('data-live-empty')
        ? $(input.getAttribute('data-live-empty'))
        : null
      var count = input.getAttribute('data-live-count')
        ? $(input.getAttribute('data-live-count'))
        : null

      function apply () {
        var q = input.value.trim().toLowerCase()
        var visible = 0
        items.forEach(function (item) {
          var show = !q || item.textContent.toLowerCase().indexOf(q) !== -1
          item.hidden = !show
          if (show) visible++
        })
        if (empty) empty.hidden = visible !== 0
        if (count) count.textContent = bn(visible)
      }

      input.addEventListener('input', apply)
      apply()
    })
  }

  /* ======================================================================
     Boot
     ====================================================================== */
  function boot () {
    ;[
      initTheme,
      initAccentPicker,
      initNavigation,
      initStickyHeader,
      initCommandPalette,
      initLoadMore,
      initFilterSort,
      initToc,
      initReadingProgress,
      initReaderControls,
      initCodeCopy,
      initLightbox,
      initShare,
      initFormValidation,
      initBackToTop,
      initSearchPage,
      initCart,
      initQuantity,
      initProductGallery,
      initVariants,
      initTabs,
      initPasswordTools,
      initToastDemo,
      initCarousels,
      initCountdown,
      initWishlist,
      initQuickView,
      initDismissible,
      initRecentlyViewed,
      initStockBars,
      initToggleOpen,
      initShopFilters,
      initLiveFilter
    ].forEach(function (init) {
      try {
        init()
      } catch (error) {
        // One broken feature must not stop the others
        if (window.console)
          console.error('[lekhoni] ' + init.name + ' failed', error)
      }
    })
  }

  if (doc.readyState === 'loading')
    doc.addEventListener('DOMContentLoaded', boot)
  else boot()
})()
