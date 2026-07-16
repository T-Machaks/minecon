/**
 * Seeds 3 demo virtual stands: Nicknel (Diamond), Electrosales (Gold), CAFCA (Chrome).
 * Usage: node server/scripts/seed-virtual-stands.js
 * Safe to re-run — skips any company that already exists by name.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { ScanCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddb } from '../lib/dynamo.js';
import { generateId } from '../lib/idgen.js';

const EXH_TABLE  = 'minecon_exhibitors';
const USER_TABLE = 'minecon_users';
const DEMO_PASSWORD = 'demo2026';
const now = new Date().toISOString();

// ── Check existing ────────────────────────────────────────────────────────────
const { Items: existing = [] } = await ddb.send(new ScanCommand({ TableName: EXH_TABLE }));
const existingNames = new Set(existing.map(e => e.name?.toLowerCase()));

const stands = [
  // ── Diamond / Premium ────────────────────────────────────────────────────────
  {
    id: generateId(),
    name: 'Nicknel Zimbabwe',
    tier: 'Diamond',
    category: 'Equipment',
    section: 'Main Hall',
    booth: 'E01',
    featured: true,
    description: "Zimbabwe's leading electrical wholesale and distribution group, serving the mining, construction, and industrial sectors since 1968. Authorised distributor for ABB, Schneider Electric, Siemens, and Legrand, with one of the largest electrical stockholdings in the country. Our mining division delivers complete electrical infrastructure — from HV switchgear and transformers to underground cabling, motor control centres, and explosion-proof equipment.",
    contact_name: 'Tafadzwa Chivore',
    contact_email: 'mining@nicknel.co.zw',
    phone: '+263 242 700 555',
    website: 'https://nicknel.co.zw',
    logo_url: '',
    video_url: 'https://www.youtube.com/embed/8vPNGCnFjCA',
    products: [
      'Mining-Grade Power Cables',
      'HV/LV Switchgear & MCCs',
      'Variable Speed Drives',
      'Mining Transformers',
      'Explosion-Proof Lighting',
      'Earthing & Lightning Protection',
      'Cable Management Systems',
      'Industrial Automation Components',
    ],
    certifications: [
      'ISO 9001:2015',
      'ABB Authorised Distributor',
      'Schneider Electric Preferred Partner',
      'SAZ Quality Mark',
    ],
    specialties: [
      'Complete HV/LV electrical infrastructure for open-pit and underground mines',
      'Custom motor control centre design, supply, and commissioning',
      'Explosion-proof and intrinsically safe equipment for hazardous areas',
      'On-site electrical engineering support and technical training',
    ],
    faq: [
      {
        question: 'Do you supply electrical equipment for underground mining?',
        answer: 'Yes. Our mining division specialises in underground-rated cables, explosion-proof luminaires, and intrinsically safe control gear certified for use in gassy and dusty hazardous areas (IECEx/ATEX standards).',
      },
      {
        question: 'Can you design and supply a complete motor control centre?',
        answer: 'Absolutely. Our engineering team designs custom MCCs, draws schematics, sources all switchgear and busbars, and can arrange installation and commissioning through our approved contractor network.',
      },
      {
        question: 'What high-voltage equipment do you stock for surface operations?',
        answer: 'We maintain ready stock of HV switchgear, ring main units, and distribution transformers from 11 kV through 33 kV for surface substations and open-pit mine power distribution.',
      },
    ],
    gallery: [
      'https://picsum.photos/seed/nicknel-switchgear/960/540',
      'https://picsum.photos/seed/nicknel-cables/960/540',
      'https://picsum.photos/seed/nicknel-mcc/960/540',
    ],
    status: 'active',
    created_date: now,
  },

  // ── Gold / Enhanced ──────────────────────────────────────────────────────────
  {
    id: generateId(),
    name: 'Electrosales Zimbabwe',
    tier: 'Gold',
    category: 'Suppliers',
    section: 'Exhibition Hall',
    booth: 'F01',
    featured: false,
    description: 'Established electrical wholesale and retail distributor supplying the mining, construction, and manufacturing sectors across Zimbabwe. We carry a comprehensive range of industrial electrical components, wiring accessories, and automation products from globally recognised brands, supported by our in-house technical team.',
    contact_name: 'Chipo Mutandwa',
    contact_email: 'sales@electrosales.co.zw',
    phone: '+263 242 750 200',
    website: 'https://electrosales.co.zw',
    logo_url: '',
    products: [
      'Industrial Contactors & Starters',
      'Miniature & Moulded Case Circuit Breakers',
      'Cable Trays & Conduit Systems',
      'PLC & HMI Components',
      'Industrial Lighting – LED & Fluorescent',
      'Wiring Accessories & Sockets',
      'Three-Phase Metering Equipment',
      'Surge Protection Devices',
    ],
    gallery: [
      'https://picsum.photos/seed/electrosales-panel/960/540',
      'https://picsum.photos/seed/electrosales-components/960/540',
      'https://picsum.photos/seed/electrosales-warehouse/960/540',
      'https://picsum.photos/seed/electrosales-tech/960/540',
    ],
    status: 'active',
    created_date: now,
  },

  // ── Chrome / Basic ───────────────────────────────────────────────────────────
  {
    id: generateId(),
    name: 'CAFCA Limited',
    tier: 'Chrome',
    category: 'Suppliers',
    section: 'Suppliers Zone',
    booth: 'G01',
    featured: false,
    description: "Cable and Conductor Manufacturing Company of Africa — Zimbabwe's only domestic manufacturer of power cables and overhead conductors. ZSE-listed and in production since 1970, CAFCA cables are the backbone of Zimbabwe's electrical infrastructure. Our mining-grade range includes armoured power cables, trailing cables, and overhead conductors engineered for the harshest Southern African conditions.",
    contact_name: 'Kudzai Machera',
    contact_email: 'sales@cafca.co.zw',
    phone: '+263 292 220 200',
    website: 'https://cafca.co.zw',
    logo_url: '',
    products: [
      'Mining Trailing Cables',
      'Armoured Power Cables (SWA/AWA)',
      'Overhead Aerial Conductors (ACSR/AAAC)',
      'PVC & XLPE Insulated Cables',
      'Control & Instrumentation Cables',
      'Low-Smoke Zero-Halogen (LSZH) Cables',
    ],
    gallery: [
      'https://picsum.photos/seed/cafca-drums/960/540',
      'https://picsum.photos/seed/cafca-factory/960/540',
    ],
    status: 'active',
    created_date: now,
  },
];

// ── Seed ──────────────────────────────────────────────────────────────────────
const password_hash = await bcrypt.hash(DEMO_PASSWORD, 10);

for (const stand of stands) {
  if (existingNames.has(stand.name.toLowerCase())) {
    console.log(`⏭  Already exists: ${stand.name}`);
    continue;
  }

  // Create exhibitor
  await ddb.send(new PutCommand({ TableName: EXH_TABLE, Item: stand }));

  // Create user account
  const slug  = stand.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const email = stand.contact_email || `${slug}@portal.minecon.global`;
  const userId = generateId();

  await ddb.send(new PutCommand({
    TableName: USER_TABLE,
    Item: {
      id: userId,
      created_date: now,
      full_name: stand.name,
      email,
      company: stand.name,
      phone: stand.phone || '',
      role: 'exhibitor',
      status: 'active',
      password_hash,
    },
  }));

  await ddb.send(new UpdateCommand({
    TableName: EXH_TABLE,
    Key: { id: stand.id },
    UpdateExpression: 'SET user_id = :u, company_name = :c',
    ExpressionAttributeValues: { ':u': userId, ':c': stand.name },
  }));

  console.log(`✓  [${stand.tier.padEnd(7)}] ${stand.name} → ${email}`);
}

console.log(`\nDone. Demo password: ${DEMO_PASSWORD}`);
