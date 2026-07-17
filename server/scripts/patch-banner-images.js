/**
 * Adds logo cutout images to Nicnel and Electrosales banner ad slots.
 * Downloads logos from minecon.global → uploads to S3 → patches DynamoDB.
 *
 * Run: node scripts/patch-banner-images.js
 */
import 'dotenv/config';
import { ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ddb } from '../lib/dynamo.js';

const BUCKET = 'minecon';
const REGION = 'af-south-1';
const s3 = new S3Client({ region: REGION });

async function uploadFromUrl(srcUrl, key, contentType) {
  process.stdout.write(`  ↓ ${srcUrl.split('/').pop()} ... `);
  const res = await fetch(srcUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${srcUrl}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: contentType }));
  const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
  console.log(`${(buffer.length / 1024).toFixed(0)} KB → ${url}`);
  return url;
}

// Download logos from minecon.global
console.log('Uploading logos to S3...');
const nicnelLogoUrl = await uploadFromUrl(
  'https://minecon.global/wp-content/uploads/2025/08/NICNEL.png',
  'banner-images/nicnel-logo.png',
  'image/png',
);
const electrosalesLogoUrl = await uploadFromUrl(
  'https://minecon.global/wp-content/uploads/2025/09/ELECTROSALES.png',
  'banner-images/electrosales-logo.png',
  'image/png',
);

// Find the adslot records
console.log('\nPatching AdSlot records...');
const { Items: slots = [] } = await ddb.send(new ScanCommand({ TableName: 'minecon_adslots' }));

const nicnelSlot = slots.find(s => s.company?.toLowerCase().includes('nicnel'));
const electroSlot = slots.find(s => s.company?.toLowerCase().includes('electrosales'));

if (!nicnelSlot) { console.log('  ✗ Nicnel slot not found'); }
if (!electroSlot) { console.log('  ✗ Electrosales slot not found'); }

const patches = [
  [nicnelSlot, nicnelLogoUrl],
  [electroSlot, electrosalesLogoUrl],
];

for (const [slot, imageUrl] of patches) {
  if (!slot || !imageUrl) continue;
  await ddb.send(new UpdateCommand({
    TableName: 'minecon_adslots',
    Key: { id: slot.id },
    UpdateExpression: 'SET image_url = :u, image_type = :t, image_pos = :p',
    ExpressionAttributeValues: { ':u': imageUrl, ':t': 'cutout', ':p': 'right center' },
  }));
  console.log(`  ✓ ${slot.company} → cutout image set`);
}

console.log('\n✓ Done.');
