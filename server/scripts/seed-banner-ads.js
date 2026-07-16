/**
 * Seeds homepage banner carousel (AdSlot) entries for the three demo exhibitors.
 * - Downloads CAFCA factory images from cafca.co.zw → uploads to S3 banner-images/
 * - Updates S3 bucket policy to allow banner-images/* public reads
 * - Creates / replaces AdSlot records for Nicnel, Electrosales, CAFCA
 *
 * Run on server: node scripts/seed-banner-ads.js
 */
import 'dotenv/config';
import { ScanCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import { ddb } from '../lib/dynamo.js';
import { generateId } from '../lib/idgen.js';

const BUCKET = 'minecon';
const REGION = 'af-south-1';
const s3 = new S3Client({ region: REGION });
const now = new Date().toISOString();

// ── S3 helpers ────────────────────────────────────────────────────────────────

async function uploadFromUrl(srcUrl, key, contentType) {
  process.stdout.write(`  ↓ ${srcUrl.split('/').pop()} ... `);
  const res = await fetch(srcUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: contentType }));
  const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
  console.log(`${(buffer.length / 1024).toFixed(0)} KB → ${url}`);
  return url;
}

async function updatePolicy() {
  const policy = JSON.stringify({
    Version: '2012-10-17',
    Statement: [{
      Sid: 'PublicReadGetObject',
      Effect: 'Allow',
      Principal: '*',
      Action: 's3:GetObject',
      Resource: [
        'arn:aws:s3:::minecon/booth-images/*',
        'arn:aws:s3:::minecon/guide-images/*',
        'arn:aws:s3:::minecon/videos/*',
        'arn:aws:s3:::minecon/lot-images/*',
        'arn:aws:s3:::minecon/exhibitor-logos/*',
        'arn:aws:s3:::minecon/gallery-images/*',
        'arn:aws:s3:::minecon/banner-images/*',
      ],
    }],
  });
  await s3.send(new PutBucketPolicyCommand({ Bucket: BUCKET, Policy: policy }));
  console.log('✓ Bucket policy updated — banner-images/* now public');
}

// ── Step 1: update bucket policy ─────────────────────────────────────────────
await updatePolicy();

// ── Step 2: upload CAFCA images ───────────────────────────────────────────────
console.log('\nUploading CAFCA images...');
const cafcaFactory = await uploadFromUrl(
  'https://www.cafca.co.zw/wp-content/uploads/2023/11/cafca-hn.png',
  'banner-images/cafca-factory-floor.png',
  'image/png',
);
const cafcaDrum = await uploadFromUrl(
  'https://www.cafca.co.zw/wp-content/uploads/2023/11/cafca-hm.png',
  'banner-images/cafca-cable-drum.png',
  'image/png',
);

// ── Step 3: find exhibitor IDs ────────────────────────────────────────────────
console.log('\nLooking up exhibitors...');
const { Items: exhibitors = [] } = await ddb.send(new ScanCommand({ TableName: 'minecon_exhibitors' }));
const nicnel = exhibitors.find(e => e.name?.toLowerCase().includes('nicnel') && e.tier === 'Diamond');
const electro = exhibitors.find(e => e.name?.toLowerCase().includes('electrosales') && e.tier === 'Gold');
const cafca   = exhibitors.find(e => e.name?.toLowerCase().includes('cafca'));

[['Nicnel Zimbabwe (Diamond)', nicnel], ['Electrosales (Gold)', electro], ['CAFCA (Chrome)', cafca]]
  .forEach(([label, ex]) => console.log(`  ${ex ? '✓' : '✗'} ${label}: ${ex?.id || 'NOT FOUND'}`));

// ── Step 4: remove old demo banner slots ──────────────────────────────────────
console.log('\nCleaning up existing demo slots...');
const { Items: oldSlots = [] } = await ddb.send(new ScanCommand({ TableName: 'minecon_adslots' }));
const demos = oldSlots.filter(s =>
  ['nicnel', 'electrosales', 'cafca'].some(n => s.company?.toLowerCase().includes(n))
);
for (const s of demos) {
  await ddb.send(new DeleteCommand({ TableName: 'minecon_adslots', Key: { id: s.id } }));
  console.log(`  Removed: ${s.company}`);
}

// ── Step 5: seed banner slots ─────────────────────────────────────────────────
console.log('\nSeeding banner ad slots...');

const slots = [
  // ── Diamond: Nicnel Zimbabwe ───────────────────────────────────────────────
  {
    id:             generateId(),
    order:          1,
    active:         true,
    company:        'Nicnel Zimbabwe',
    exhibitor_id:   nicnel?.id || '',
    exhibitor_name: 'Nicnel Zimbabwe',
    label:          'Diamond Exhibitor · Plant & Equipment',
    headline:       "Zimbabwe's Leading Plant & Equipment Specialists",
    sub:            'Supply, hire and maintenance of heavy mining and construction plant across Southern Africa',
    stat:           '30+ Years',
    tags:           ['Plant Hire', 'Mining', 'Heavy Equipment'],
    logo_url:       'https://minecon.global/wp-content/uploads/2025/08/NICNEL.png',
    accent:         '#3b82f6',
    bg:             'from-blue-950 to-slate-900',
    url:            'https://nicnel.co.zw',
    internal:       false,
    created_date:   now,
  },

  // ── Gold: Electrosales Zimbabwe ────────────────────────────────────────────
  {
    id:             generateId(),
    order:          2,
    active:         true,
    company:        'Electrosales Zimbabwe',
    exhibitor_id:   electro?.id || '',
    exhibitor_name: 'Electrosales Zimbabwe',
    label:          'Gold Exhibitor · Hardware & Electrical',
    headline:       'Your Hardware Home — Built for Every Project',
    sub:            'Electrical, plumbing, power tools, DIY and building materials — everything you need on site',
    stat:           '1,000+ Products',
    tags:           ['Electrical', 'Hardware', 'Tools'],
    logo_url:       'https://minecon.global/wp-content/uploads/2025/09/ELECTROSALES.png',
    accent:         '#ef4444',
    bg:             'from-red-950 to-slate-900',
    url:            'https://electrosales.co.zw',
    internal:       false,
    created_date:   now,
  },

  // ── Chrome: CAFCA Limited ─────────────────────────────────────────────────
  {
    id:             generateId(),
    order:          3,
    active:         true,
    company:        'CAFCA Limited',
    exhibitor_id:   cafca?.id || '',
    exhibitor_name: 'CAFCA Limited',
    label:          'Chrome Exhibitor · Cable Manufacturing',
    headline:       "Zimbabwe's Cable & Conductor Manufacturer",
    sub:            'Mining trailing cables, armoured conductors and overhead aerial lines — manufactured in Bulawayo since 1970',
    stat:           'ZSE Listed',
    tags:           ['Mining Cables', 'Conductors', 'Manufacturing'],
    logo_url:       'https://www.cafca.co.zw/wp-content/uploads/2023/07/Asset-1.png',
    image_url:      cafcaFactory,
    image_type:     'bg',
    image_pos:      'center',
    accent:         '#3b82f6',
    bg:             'from-slate-900 to-blue-950',
    url:            'https://cafca.co.zw',
    internal:       false,
    created_date:   now,
  },
];

for (const slot of slots) {
  await ddb.send(new PutCommand({ TableName: 'minecon_adslots', Item: slot }));
  console.log(`  ✓ [${slot.order}] ${slot.company}`);
}

console.log('\n✓ Done — 3 banner ads live on the homepage carousel.');
console.log(`\n  CAFCA factory: ${cafcaFactory}`);
console.log(`  CAFCA drum:    ${cafcaDrum}`);
