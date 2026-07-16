/**
 * Patches featured_lots images for the Live auction with real S3 URLs.
 * Run on server: node scripts/patch-lot-images.js
 */
import 'dotenv/config';
import { ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddb } from '../lib/dynamo.js';

const S3_IMAGES = {
  '1': [
    'https://minecon.s3.af-south-1.amazonaws.com/lot-images/1784219072158-1xgoh1.jpg',
    'https://minecon.s3.af-south-1.amazonaws.com/lot-images/1784219083077-q2pbwj.jpg',
    'https://minecon.s3.af-south-1.amazonaws.com/lot-images/1784219084055-4xzep7.jpg',
  ],
  '2': [
    'https://minecon.s3.af-south-1.amazonaws.com/lot-images/1784219085189-j83ewd.jpg',
    'https://minecon.s3.af-south-1.amazonaws.com/lot-images/1784219088240-wul59w.jpg',
    'https://minecon.s3.af-south-1.amazonaws.com/lot-images/1784219088532-qvfr5w.jpg',
  ],
  '3': [
    'https://minecon.s3.af-south-1.amazonaws.com/lot-images/1784219088804-94y3cq.jpg',
    'https://minecon.s3.af-south-1.amazonaws.com/lot-images/1784219089075-3t9kkz.jpg',
    'https://minecon.s3.af-south-1.amazonaws.com/lot-images/1784219089316-enq5gx.jpg',
  ],
};

const { Items: auctions = [] } = await ddb.send(new ScanCommand({ TableName: 'minecon_auctions' }));
const live = auctions.find(a => a.status === 'Live');
if (!live) { console.error('No Live auction found.'); process.exit(1); }

console.log(`Patching: "${live.title}"`);

const updatedLots = (live.featured_lots || []).map(lot => {
  const imgs = S3_IMAGES[String(lot.lot_number)];
  return imgs ? { ...lot, images: imgs } : lot;
});

await ddb.send(new UpdateCommand({
  TableName: 'minecon_auctions',
  Key: { id: live.id },
  UpdateExpression: 'SET featured_lots = :lots',
  ExpressionAttributeValues: { ':lots': updatedLots },
}));

updatedLots.forEach(l =>
  console.log(`  Lot ${l.lot_number}: ${l.title} — ${(l.images || []).length} S3 image(s)`)
);
console.log('\n✓ Done.');
