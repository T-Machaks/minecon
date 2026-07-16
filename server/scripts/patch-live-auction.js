/**
 * Patches the Live auction's featured_lots with pricing and stock images.
 * Usage: node server/scripts/patch-live-auction.js
 *
 * Images use picsum.photos (seeded, consistent, guaranteed to load).
 * Replace with real equipment photos via the Auctions Manager UI.
 */
import 'dotenv/config';
import { ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddb } from '../lib/dynamo.js';

const { Items: auctions = [] } = await ddb.send(new ScanCommand({ TableName: 'minecon_auctions' }));
const live = auctions.find(a => a.status === 'Live');

if (!live) {
  console.error('No Live auction found in minecon_auctions.');
  process.exit(1);
}

console.log(`Patching: "${live.title}" (${live.id})`);

const updatedLots = [
  {
    lot_number: '1',
    title: 'Caterpillar 336 Excavator (2019)',
    category: 'Heavy Equipment',
    starting_bid: 95000,
    reserve_price: 118000,
    bid_increment: 2500,
    current_bid: 112000,
    bid_count: 7,
    status: 'Open',
    seller_name: 'Murray & Roberts Mining',
    description: '8,400 hours. Full service history. Hydraulic thumb included. Recently serviced with all fluids replaced. Available for inspection at Hall B from 07:00.',
    images: [
      'https://picsum.photos/seed/cat336-main/960/540',
      'https://picsum.photos/seed/cat336-side/960/540',
      'https://picsum.photos/seed/cat336-cab/960/540',
    ],
  },
  {
    lot_number: '2',
    title: 'Bell B40E Articulated Dump Truck',
    category: 'Heavy Equipment',
    starting_bid: 65000,
    reserve_price: 82000,
    bid_increment: 1500,
    current_bid: 71500,
    bid_count: 4,
    status: 'Open',
    seller_name: 'Sandvik Zimbabwe',
    description: '2018 model, 11,200 hours. New Michelin tyres fitted March 2026. ROPS/FOPS certified cab. Engine overhauled at 10,000 hours. Rear axle recently rebuilt.',
    images: [
      'https://picsum.photos/seed/bell-b40-front/960/540',
      'https://picsum.photos/seed/bell-b40-rear/960/540',
    ],
  },
  {
    lot_number: '3',
    title: 'Atlas Copco ROC D7 Drill Rig',
    category: 'Mining Assets',
    starting_bid: 42000,
    reserve_price: 58000,
    bid_increment: 1000,
    current_bid: 48000,
    bid_count: 9,
    status: 'Open',
    seller_name: 'Barrick Exploration',
    description: 'Top hammer drill, 2017. Serviced and in working order. 120mm–152mm hole diameter capability. COP 1838+ hydraulic rock drill. Dust collection and flushing system fitted.',
    images: [
      'https://picsum.photos/seed/roc-d7-rig/960/540',
      'https://picsum.photos/seed/roc-d7-boom/960/540',
    ],
  },
  {
    lot_number: '4',
    title: 'Sandvik LH517i LHD Loader',
    category: 'Mining Assets',
    starting_bid: 80000,
    reserve_price: 98000,
    bid_increment: 2000,
    current_bid: 80000,
    bid_count: 1,
    status: 'Open',
    seller_name: 'Great Dyke Investments',
    description: '2021 model, 3,200 hours. Underground diesel–electric drive. 17-tonne payload capacity. AutoMine capable. Excellent condition — previously used in platinum development headings.',
    images: [
      'https://picsum.photos/seed/lh517i-front/960/540',
      'https://picsum.photos/seed/lh517i-side/960/540',
    ],
  },
];

await ddb.send(new UpdateCommand({
  TableName: 'minecon_auctions',
  Key: { id: live.id },
  UpdateExpression: 'SET featured_lots = :lots',
  ExpressionAttributeValues: { ':lots': updatedLots },
}));

console.log(`\n✓ Updated ${updatedLots.length} lots:`);
updatedLots.forEach(l => {
  console.log(`  Lot ${l.lot_number}: ${l.title}`);
  console.log(`    Starting $${l.starting_bid.toLocaleString()} | Reserve $${l.reserve_price.toLocaleString()} | Increment $${l.bid_increment.toLocaleString()} | ${l.images.length} images`);
});
