// One-time script: crop individual ads from ADMA double-spread pages
// Run with: node scripts/crop-ads.mjs

import { createCanvas, loadImage } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT   = resolve(__dirname, '..');
const SRC    = resolve(ROOT, 'public/magazines/adma-pages');
const OUT    = resolve(ROOT, 'public/magazines/ads');

mkdirSync(OUT, { recursive: true });

// All landscape spreads are 3047×1984. Left half = 0..1523, right half = 1524..3046
const W = 3047;
const H = 1984;
const L_X = 0,    L_W = 1524;   // left page
const R_X = 1524, R_W = W - R_X; // right page (1523px)

async function crop(srcFile, x, y, w, h, outFile) {
  const img = await loadImage(resolve(SRC, srcFile));
  const canvas = createCanvas(w, h);
  canvas.getContext('2d').drawImage(img, x, y, w, h, 0, 0, w, h);
  writeFileSync(resolve(OUT, outFile), canvas.toBuffer('image/jpeg', { quality: 92 }));
  console.log(`  ✓ ${outFile}  (${w}×${h})`);
}

console.log('Cropping ADMA ads…\n');

// Page 43 → left half of page-023 (Jetmaster Fireplaces & Braais)
await crop('page-023.jpg', L_X, 0, L_W, H, 'ad-jetmaster.jpg');

// Page 53 → left half of page-028 (BOC — welding gas & engineering solutions)
await crop('page-028.jpg', L_X, 0, L_W, H, 'ad-boc.jpg');

// Woodlot half of page 56 → bottom half of right page of page-029 (Woodlot Timbers)
await crop('page-029.jpg', R_X, H / 2, R_W, H / 2, 'ad-woodlot.jpg');

// Page 57 → left half of page-030 (Zimtile — concrete tiles, bricks, pavers)
await crop('page-030.jpg', L_X, 0, L_W, H, 'ad-zimtile.jpg');

// Page 65 → left half of page-034 (Elimobil — agricultural & mining machinery)
await crop('page-034.jpg', L_X, 0, L_W, H, 'ad-elimobil.jpg');

// Page 73 → left half of page-038 (Zambezi Gas & Coal Mine)
await crop('page-038.jpg', L_X, 0, L_W, H, 'ad-zambezi.jpg');

console.log('\nAll done → public/magazines/ads/');