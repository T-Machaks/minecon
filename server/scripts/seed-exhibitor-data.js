/**
 * Seeds demo exhibitor records + user accounts.
 * Usage: node server/scripts/seed-exhibitor-data.js
 *
 * Skips silently if minecon_exhibitors already has items.
 * After seeding exhibitors it immediately creates exhibitor user accounts
 * (same logic as seed-exhibitor-users.js) with the shared demo password.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { ScanCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddb } from '../lib/dynamo.js';
import { generateId } from '../lib/idgen.js';

const EXH_TABLE  = 'minecon_exhibitors';
const USER_TABLE = 'minecon_users';
const DEMO_PASSWORD = 'demo2026';

// ── Skip if already seeded ────────────────────────────────────────────────────
const { Count: existing } = await ddb.send(new ScanCommand({ TableName: EXH_TABLE, Limit: 1 }));
if ((existing || 0) > 0) {
  console.log('⏭  minecon_exhibitors already has data — skipping exhibitor seed.');
  console.log('   Run seed-exhibitor-users.js to ensure user accounts are linked.');
  process.exit(0);
}

// ── Demo exhibitor definitions ────────────────────────────────────────────────
const now = new Date().toISOString();

const EXHIBITORS = [
  // ── Diamond ×5 ─────────────────────────────────────────────────────────────
  {
    id: generateId(),
    name: 'Apex Mining Solutions',
    tier: 'diamond',
    category: 'Equipment',
    section: 'Main Hall',
    booth: 'A01',
    featured: true,
    description: 'Southern Africa\'s leading supplier of underground and open-cast mining equipment. Comprehensive range of loaders, drills, haul trucks and conveyor systems backed by 24/7 support.',
    contact_name: 'James Murehwa',
    contact_email: 'james@apexmining.co.zw',
    phone: '+263 77 312 4500',
    website: 'https://apexmining.co.zw',
    logo_url: '',
    status: 'active',
    created_date: now,
  },
  {
    id: generateId(),
    name: 'ZimSteel & Structures',
    tier: 'diamond',
    category: 'Suppliers',
    section: 'Main Hall',
    booth: 'A02',
    featured: true,
    description: 'Integrated steel manufacturer and structural engineering firm supplying mined product handling infrastructure, mine frames, headgear, and bulk material handling systems.',
    contact_name: 'Tendai Mhuriro',
    contact_email: 'tendai@zimsteel.co.zw',
    phone: '+263 242 700 100',
    website: 'https://zimsteel.co.zw',
    logo_url: '',
    status: 'active',
    created_date: now,
  },
  {
    id: generateId(),
    name: 'Platinum Drill & Blast',
    tier: 'diamond',
    category: 'Services',
    section: 'Main Hall',
    booth: 'A03',
    featured: true,
    description: 'Specialist drilling and blasting contractor with operations across Zimbabwe, Zambia, and Mozambique. Full design-to-detonation capability for surface and underground mining.',
    contact_name: 'Rutendo Chikwanda',
    contact_email: 'rutendo@platinumdb.com',
    phone: '+263 71 444 7200',
    website: 'https://platinumdb.com',
    logo_url: '',
    status: 'active',
    created_date: now,
  },
  {
    id: generateId(),
    name: 'AfriTech Industrial',
    tier: 'diamond',
    category: 'Solutions',
    section: 'Main Hall',
    booth: 'A04',
    featured: true,
    description: 'Technology-driven mining process solutions including fleet management, ore-body modelling, and real-time mine operations dashboards for optimised production efficiency.',
    contact_name: 'Simba Ndlovu',
    contact_email: 'simba@afritech.co.zw',
    phone: '+263 77 800 3300',
    website: 'https://afritech.co.zw',
    logo_url: '',
    status: 'active',
    created_date: now,
  },
  {
    id: generateId(),
    name: 'Highveld Heavy Equipment',
    tier: 'diamond',
    category: 'Equipment',
    section: 'Main Hall',
    booth: 'A05',
    featured: true,
    description: 'Authorised distributor of Komatsu, Volvo, and Hitachi heavy equipment for Zimbabwe. Full parts inventory, operator training, and mine-site maintenance contracts available.',
    contact_name: 'Farai Chirwa',
    contact_email: 'farai@highveld.co.zw',
    phone: '+263 242 885 400',
    website: 'https://highveld.co.zw',
    logo_url: '',
    status: 'active',
    created_date: now,
  },

  // ── Gold ×5 ────────────────────────────────────────────────────────────────
  {
    id: generateId(),
    name: 'ProSafe Zimbabwe',
    tier: 'gold',
    category: 'Services',
    section: 'Exhibition Hall',
    booth: 'B01',
    featured: false,
    description: 'Occupational health, safety, and environmental compliance consultancy for the mining sector. HSE audits, risk assessments, emergency response planning, and SHEQ management systems.',
    contact_name: 'Ngonidzashe Chakanetsa',
    contact_email: 'ngoni@prosafe.co.zw',
    phone: '+263 77 620 0810',
    website: 'https://prosafe.co.zw',
    logo_url: '',
    status: 'active',
    created_date: now,
  },
  {
    id: generateId(),
    name: 'MineLogix',
    tier: 'gold',
    category: 'Solutions',
    section: 'Exhibition Hall',
    booth: 'B02',
    featured: false,
    description: 'Enterprise resource planning and production management software purpose-built for the African mining industry. Modular deployment with cloud and on-premise options.',
    contact_name: 'Chiedza Sithole',
    contact_email: 'chiedza@minelogix.com',
    phone: '+263 71 335 9900',
    website: 'https://minelogix.com',
    logo_url: '',
    status: 'active',
    created_date: now,
  },
  {
    id: generateId(),
    name: 'Bulawayo Conveyors',
    tier: 'gold',
    category: 'Equipment',
    section: 'Exhibition Hall',
    booth: 'B03',
    featured: false,
    description: 'Design, manufacture, and installation of belt conveyors, transfer stations, and bulk material handling systems for coal, gold, chrome, and phosphate operations.',
    contact_name: 'Thabo Ncube',
    contact_email: 'thabo@bwoconveyors.co.zw',
    phone: '+263 29 288 1100',
    website: 'https://bwoconveyors.co.zw',
    logo_url: '',
    status: 'active',
    created_date: now,
  },
  {
    id: generateId(),
    name: 'SafeGuard PPE',
    tier: 'gold',
    category: 'Suppliers',
    section: 'Exhibition Hall',
    booth: 'B04',
    featured: false,
    description: 'Comprehensive personal protective equipment supplier serving mines across Zimbabwe. Helmets, respirators, high-visibility workwear, safety boots, and first-aid consumables.',
    contact_name: 'Anesu Makoni',
    contact_email: 'anesu@safeguardppe.co.zw',
    phone: '+263 242 750 300',
    website: 'https://safeguardppe.co.zw',
    logo_url: '',
    status: 'active',
    created_date: now,
  },
  {
    id: generateId(),
    name: 'DynaLube Africa',
    tier: 'gold',
    category: 'Suppliers',
    section: 'Exhibition Hall',
    booth: 'B05',
    featured: false,
    description: 'Industrial lubricants, hydraulic fluids, and grease products formulated for extreme mining environments. Technical lubrication analysis and predictive maintenance programs.',
    contact_name: 'Tatenda Moyo',
    contact_email: 'tatenda@dynalube.co.zw',
    phone: '+263 77 190 5500',
    website: 'https://dynalube.co.zw',
    logo_url: '',
    status: 'active',
    created_date: now,
  },

  // ── Chrome ×3 ──────────────────────────────────────────────────────────────
  {
    id: generateId(),
    name: 'AirFlow Ventilation',
    tier: 'chrome',
    category: 'Equipment',
    section: 'Suppliers Zone',
    booth: 'C01',
    featured: false,
    description: 'Underground mine ventilation systems including axial fans, booster fans, ducting, and air quality monitoring equipment for safe working environments.',
    contact_name: 'Kudakwashe Dube',
    contact_email: 'kuda@airflow.co.zw',
    phone: '+263 71 820 4400',
    website: 'https://airflow.co.zw',
    logo_url: '',
    status: 'active',
    created_date: now,
  },
  {
    id: generateId(),
    name: 'Geodata Survey Services',
    tier: 'chrome',
    category: 'Services',
    section: 'Suppliers Zone',
    booth: 'C02',
    featured: false,
    description: 'Mine surveying, geotechnical investigations, and topographic mapping using drone LiDAR and RTK GPS. Licensed surveyors for mining title applications.',
    contact_name: 'Patience Zimba',
    contact_email: 'patience@geodata.co.zw',
    phone: '+263 242 330 600',
    website: 'https://geodata.co.zw',
    logo_url: '',
    status: 'active',
    created_date: now,
  },
  {
    id: generateId(),
    name: 'Harare Fabrication Works',
    tier: 'chrome',
    category: 'Suppliers',
    section: 'Suppliers Zone',
    booth: 'C03',
    featured: false,
    description: 'Structural steel fabrication, pipe spooling, and pressure vessel manufacture for mining and industrial clients. ASME and ISO 9001 certified workshop.',
    contact_name: 'Wellington Chirumanzu',
    contact_email: 'welly@hfabworks.co.zw',
    phone: '+263 77 430 8800',
    website: 'https://hfabworks.co.zw',
    logo_url: '',
    status: 'active',
    created_date: now,
  },

  // ── Copper ×3 ──────────────────────────────────────────────────────────────
  {
    id: generateId(),
    name: 'Scout Drone Services',
    tier: 'copper',
    category: 'Solutions',
    section: 'Solutions Zone',
    booth: 'D01',
    featured: false,
    description: 'Commercial drone operations for open-pit volume surveys, stockpile measurement, and infrastructure inspection. Manned by Civil Aviation Authority of Zimbabwe licensed pilots.',
    contact_name: 'Blessing Muzangaza',
    contact_email: 'blessing@scoutdrones.co.zw',
    phone: '+263 71 560 2200',
    website: 'https://scoutdrones.co.zw',
    logo_url: '',
    status: 'active',
    created_date: now,
  },
  {
    id: generateId(),
    name: 'ZimLaw Mining Attorneys',
    tier: 'copper',
    category: 'Services',
    section: 'Solutions Zone',
    booth: 'D02',
    featured: false,
    description: 'Mining law specialists covering title acquisition, environmental permitting, royalty negotiations, and joint venture structuring under Zimbabwe\'s Mines and Minerals Act.',
    contact_name: 'Nyasha Banda',
    contact_email: 'nyasha@zimlawmining.com',
    phone: '+263 242 448 900',
    website: 'https://zimlawmining.com',
    logo_url: '',
    status: 'active',
    created_date: now,
  },
  {
    id: generateId(),
    name: 'ProChem Reagents',
    tier: 'copper',
    category: 'Suppliers',
    section: 'Solutions Zone',
    booth: 'D03',
    featured: false,
    description: 'Mineral processing chemicals including flotation reagents, flocculants, cyanide solutions, and pH modifiers. Technical support from qualified metallurgists.',
    contact_name: 'Tarisai Chigango',
    contact_email: 'tarisai@prochem.co.zw',
    phone: '+263 71 295 7700',
    website: 'https://prochem.co.zw',
    logo_url: '',
    status: 'active',
    created_date: now,
  },
];

// ── Seed exhibitors ───────────────────────────────────────────────────────────
console.log(`Seeding ${EXHIBITORS.length} demo exhibitors…`);
for (const exh of EXHIBITORS) {
  await ddb.send(new PutCommand({ TableName: EXH_TABLE, Item: exh }));
  console.log(`  ✓ [${exh.tier.padEnd(7)}] ${exh.name}`);
}

// ── Create user accounts ──────────────────────────────────────────────────────
console.log('\nCreating exhibitor user accounts…');
const password_hash = await bcrypt.hash(DEMO_PASSWORD, 10);

const { Items: seededExhibitors } = await ddb.send(new ScanCommand({ TableName: EXH_TABLE }));

for (const exh of seededExhibitors) {
  if (exh.user_id) continue;

  const displayName = exh.name || exh.id;
  const slug = displayName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const email = exh.contact_email || `${slug}@portal.minecon.global`;

  const userId = generateId();
  await ddb.send(new PutCommand({
    TableName: USER_TABLE,
    Item: {
      id: userId,
      created_date: now,
      full_name: displayName,
      email,
      company: displayName,
      phone: exh.phone || '',
      role: 'exhibitor',
      status: 'active',
      password_hash,
    },
  }));

  await ddb.send(new UpdateCommand({
    TableName: EXH_TABLE,
    Key: { id: exh.id },
    UpdateExpression: 'SET user_id = :u, company_name = :c',
    ExpressionAttributeValues: { ':u': userId, ':c': displayName },
  }));

  console.log(`  ✓ ${displayName} → ${email}`);
}

console.log(`\nDone. ${EXHIBITORS.length} exhibitors seeded with demo password: ${DEMO_PASSWORD}`);
