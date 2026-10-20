// Images for the stationery demo content: the design's SVG illustrations
// (design/assets/img) rendered to JPG, plus recoloured copies used as
// product gallery and variation images. Used by build-demo.mjs.
//
// JPG rather than SVG: WordPress/WooCommerce can't make thumbnails from SVG
// and many hosts block SVG uploads. Images with transparent parts (the hero
// slides have rounded corners) are saved as PNG instead.

import path from 'node:path'
import sharp from 'sharp'

// key -> source SVG, output width, Bangla alt text, optional hue shift (degrees)
export const IMAGES = {
  'hero-1': { svg: 'hero-1', width: 1350, alt: 'নোটবুক, কলম আর মগে সাজানো লেখার টেবিল' },
  'hero-2': { svg: 'hero-2', width: 1350, alt: 'ফিতা বাঁধা উপহারের বক্স' },
  'hero-3': { svg: 'hero-3', width: 1350, alt: 'কাঠের অর্গানাইজার আর প্ল্যানারে গোছানো ডেস্ক' },

  'category-1': { svg: 'category-1', width: 600, alt: 'নোটবুক' },
  'category-2': { svg: 'category-2', width: 600, alt: 'কলম' },
  'category-3': { svg: 'category-3', width: 600, alt: 'মগ' },
  'category-4': { svg: 'category-4', width: 600, alt: 'ব্যাগ' },
  'category-5': { svg: 'category-5', width: 600, alt: 'স্টিকার' },
  'category-6': { svg: 'category-6', width: 600, alt: 'গিফট বক্স' },

  'product-1': { svg: 'product-1', width: 1000, alt: 'হার্ডকভার নোটবুক' },
  'product-1-alt': { svg: 'product-1', width: 1000, alt: 'হার্ডকভার নোটবুক, অন্য রঙে', hue: 150 },
  'product-2': { svg: 'product-2', width: 1000, alt: 'রঙিন কলমের সেট' },
  'product-2-alt': { svg: 'product-2', width: 1000, alt: 'রঙিন কলমের সেট, অন্য রঙে', hue: 200 },
  'product-3': { svg: 'product-3', width: 1000, alt: 'সিরামিক মগ' },
  'product-3-alt': { svg: 'product-3', width: 1000, alt: 'সিরামিক মগ, অন্য রঙে', hue: 120 },
  'product-4': { svg: 'product-4', width: 1000, alt: 'ক্যানভাসের টোট ব্যাগ' },
  'product-4-alt': { svg: 'product-4', width: 1000, alt: 'ক্যানভাসের টোট ব্যাগ, অন্য রঙে', hue: 160 },
  'product-5': { svg: 'product-5', width: 1000, alt: 'ভিনাইল স্টিকারের প্যাক' },
  'product-5-alt': { svg: 'product-5', width: 1000, alt: 'ভিনাইল স্টিকারের প্যাক, অন্য রঙে', hue: 90 },
  'product-6': { svg: 'product-6', width: 1000, alt: 'কাঠের ডেস্ক অর্গানাইজার' },
  'product-6-alt': { svg: 'product-6', width: 1000, alt: 'কাঠের ডেস্ক অর্গানাইজার, অন্য রঙে', hue: 40 },
  'product-7': { svg: 'product-7', width: 1000, alt: 'গোলাপি মোড়কের গিফট বক্স' },
  'product-7-green': { svg: 'product-7', width: 1000, alt: 'সবুজ মোড়কের গিফট বক্স', hue: 170 },
  'product-7-blue': { svg: 'product-7', width: 1000, alt: 'নীল মোড়কের গিফট বক্স', hue: 240 },
  'product-8': { svg: 'product-8', width: 1000, alt: 'সাপ্তাহিক প্ল্যানার' },
  'product-8-alt': { svg: 'product-8', width: 1000, alt: 'সাপ্তাহিক প্ল্যানার, অন্য রঙে', hue: 180 },

  'cover-1': { svg: 'cover-1', width: 1200, alt: 'ব্রাউজারে খোলা ওয়েবসাইটের নকশা' },
  'cover-2': { svg: 'cover-2', width: 1200, alt: 'কোড এডিটরের জানালা' },
  'cover-3': { svg: 'cover-3', width: 1200, alt: 'ধাপে ধাপে সাজানো কম্পোনেন্টের ছবি' },
  'cover-4': { svg: 'cover-4', width: 1200, alt: 'বড় অক্ষরে সাজানো টাইপোগ্রাফির নকশা' },

  'avatar-1': { svg: 'avatar-1', width: 320, alt: 'রহিম আহমেদ' },
  'avatar-2': { svg: 'avatar-2', width: 320, alt: 'করিমা সুলতানা' }
}

// Renders one image to <outDir>/<key>.jpg (or .png when it has transparent
// parts) and returns { file, alt, width, height }. `spec` is an IMAGES entry
// (here or in demo-content/ecommerce.mjs, cosmetics.mjs).
export async function renderImage (designDir, key, spec, outDir) {
  const source = path.join(designDir, 'assets/img', `${spec.svg}.svg`)
  let image = sharp(source, { density: 300 }).resize({ width: spec.width })
  if (spec.hue) image = image.modulate({ hue: spec.hue })
  const rendered = await image.png().toBuffer()
  const { isOpaque } = await sharp(rendered).stats()
  const file = `${key}.${isOpaque ? 'jpg' : 'png'}`
  const output = isOpaque
    ? sharp(rendered).flatten({ background: '#ffffff' }).jpeg({ quality: 82, mozjpeg: true })
    : sharp(rendered).png({ compressionLevel: 9, palette: true, quality: 90 })
  const info = await output.toFile(path.join(outDir, file))
  return { file, alt: spec.alt, width: info.width, height: info.height }
}
