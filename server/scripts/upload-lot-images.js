/**
 * Uploads real equipment photos to S3 via the presigned URL endpoint.
 * Run locally: node server/scripts/upload-lot-images.js
 * Prints the resulting S3 URLs, then patches the live auction in DynamoDB.
 */
import { readFileSync } from 'fs';
import 'dotenv/config';
import { ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddb } from '../lib/dynamo.js';

const API = 'https://minecon.tyflex.co.zw';

// Map of lot_number → local image file paths (in order)
const LOT_IMAGES = {
  '1': [
    'C:/Users/USER/Downloads/cat 336f.jpg',
    'C:/Users/USER/Downloads/cat 336f-1.jpg',
    'C:/Users/USER/Downloads/cat 336f-2.jpg',
  ],
  '2': [
    'C:/Users/USER/Downloads/bell b40e.jpg',
    'C:/Users/USER/Downloads/bell b40e-1.jpg',
    'C:/Users/USER/Downloads/bell b40e-2.jpg',
  ],
  '3': [
    'C:/Users/USER/Downloads/atlas copco.jpg',
    'C:/Users/USER/Downloads/atlas copco-1.jpg',
    'C:/Users/USER/Downloads/atlas copco-2.jpg',
  ],
};

async function uploadImage(filePath) {
  // Get presigned PUT URL
  const res = await fetch(`${API}/api/upload/lot-image-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldImageUrl: null }),
  });
  if (!res.ok) throw new Error(`Failed to get upload URL: ${res.status}`);
  const { uploadUrl, publicUrl } = await res.json();

  // Upload image bytes
  const imageBytes = readFileSync(filePath);
  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    body: imageBytes,
    headers: { 'Content-Type': 'image/jpeg' },
  });
  if (!putRes.ok) throw new Error(`S3 PUT failed: ${putRes.status}`);

  return publicUrl;
}

// ── Upload all images ─────────────────────────────────────────────────────────
const s3Urls = {};

for (const [lotNumber, paths] of Object.entries(LOT_IMAGES)) {
  s3Urls[lotNumber] = [];
  console.log(`\nLot ${lotNumber}:`);
  for (const path of paths) {
    const url = await uploadImage(path);
    s3Urls[lotNumber].push(url);
    const fname = path.split('/').pop();
    console.log(`  ✓ ${fname} → ${url}`);
  }
}

// ── Patch the live auction in DynamoDB ────────────────────────────────────────
const { Items: auctions = [] } = await ddb.send(new ScanCommand({ TableName: 'minecon_auctions' }));
const live = auctions.find(a => a.status === 'Live');
if (!live) { console.error('\nNo Live auction found.'); process.exit(1); }

console.log(`\nPatching: "${live.title}"`);

const updatedLots = (live.featured_lots || []).map(lot => {
  const imgs = s3Urls[String(lot.lot_number)];
  if (!imgs) return lot;
  return { ...lot, images: imgs };
});

await ddb.send(new UpdateCommand({
  TableName: 'minecon_auctions',
  Key: { id: live.id },
  UpdateExpression: 'SET featured_lots = :lots',
  ExpressionAttributeValues: { ':lots': updatedLots },
}));

console.log('\n✓ Auction updated with real S3 images.');
updatedLots.forEach(l => {
  const count = (l.images || []).length;
  console.log(`  Lot ${l.lot_number}: ${l.title} — ${count} image${count !== 1 ? 's' : ''}`);
});
