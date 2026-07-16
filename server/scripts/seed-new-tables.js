/**
 * Seeds marketplace tables with demo data.
 * Usage: node server/scripts/seed-new-tables.js
 *
 * Reads the live exhibitors list so foreign keys (exhibitor_id, company_name)
 * reference real exhibitors already in the DB.
 */
import 'dotenv/config';
import { ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ddb } from '../lib/dynamo.js';
import { generateId } from '../lib/idgen.js';

const API = 'http://127.0.0.1:3001';

async function post(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`POST ${path} → ${res.status}: ${t}`);
  }
  return res.json();
}

// ── Load exhibitors ──────────────────────────────────────────────────────────
const { Items: exhibitors = [] } = await ddb.send(new ScanCommand({ TableName: 'minecon_exhibitors' }));
if (exhibitors.length === 0) {
  console.error('No exhibitors found. Run the exhibitor seed first.');
  process.exit(1);
}

// Pick by tier (fall back to any exhibitor if tier not seeded yet)
function byTier(tier) {
  return exhibitors.find(e => e.tier === tier) || exhibitors[0];
}

const diamond = exhibitors.filter(e => e.tier === 'diamond');
const gold    = exhibitors.filter(e => e.tier === 'gold');
const chrome  = exhibitors.filter(e => e.tier === 'chrome');
const any     = exhibitors;

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] || exhibitors[0]; }

// ── Helper: skip if table already has items ──────────────────────────────────
async function hasItems(table) {
  const r = await ddb.send(new ScanCommand({ TableName: table, Limit: 1 }));
  return (r.Count || 0) > 0;
}

// ── Jobs (8) ────────────────────────────────────────────────────────────────
if (await hasItems('minecon_job_listings')) {
  console.log('⏭  minecon_job_listings already seeded');
} else {
  const exh0 = diamond[0] || any[0];
  const exh1 = diamond[1] || any[1] || any[0];
  const exh2 = gold[0]    || any[2] || any[0];
  const exh3 = gold[1]    || any[3] || any[0];
  const exh4 = chrome[0]  || any[4] || any[0];
  const exh5 = diamond[2] || any[5] || any[0];

  const jobs = [
    {
      title: 'Diesel Mechanic – Heavy Equipment',
      category: 'Engineering & Technical',
      type: 'Full-time',
      location: 'Harare, Zimbabwe',
      description: 'Maintain and repair heavy earthmoving and mining equipment. Work with excavators, loaders, dump trucks, and graders. Must have strong fault-finding skills and be comfortable working in a mine environment.',
      requirements: '• Trade test in Diesel Plant Fitting or equivalent\n• Minimum 3 years experience on Caterpillar or Komatsu equipment\n• Valid Class 4 driver\'s licence\n• Ability to work shifts and weekends',
      closing_date: '2026-08-15',
      exhibitor_id: exh0.id,
      company_name: exh0.name || exh0.company_name,
    },
    {
      title: 'Sales Engineer – Mining & Construction',
      category: 'Sales & Business Development',
      type: 'Full-time',
      location: 'Harare, Zimbabwe',
      description: 'Drive equipment sales across the mining and construction sector. Build relationships with mine operators, contractors, and quarry owners. Provide technical demonstrations and proposals for capital equipment.',
      requirements: '• Degree in Engineering or Business\n• 2+ years in B2B technical sales\n• Strong presentation and negotiation skills\n• Clean driver\'s licence and willingness to travel',
      closing_date: '2026-08-30',
      exhibitor_id: exh1.id,
      company_name: exh1.name || exh1.company_name,
    },
    {
      title: 'Heavy Equipment Operator',
      category: 'Mining Operations',
      type: 'Contract',
      location: 'Gweru, Zimbabwe',
      description: 'Operate articulated dump trucks and compactors on an active mining site. Candidates must have proven experience operating multi-axle heavy vehicles under mine safety regulations.',
      requirements: '• ZIMDEF Class 2 Operator Certificate\n• Minimum 2 years mine site experience\n• Ability to pass a medical fitness test\n• NSSA Occupational Safety certificate preferred',
      closing_date: '2026-07-31',
      exhibitor_id: exh2.id,
      company_name: exh2.name || exh2.company_name,
    },
    {
      title: 'HSE Officer',
      category: 'Health, Safety & Environment',
      type: 'Full-time',
      location: 'Kwekwe, Zimbabwe',
      description: 'Implement and monitor health, safety, and environmental management systems at mining operations. Conduct safety audits, incident investigations, and toolbox talks. Ensure compliance with MINES AND MINERALS ACT requirements.',
      requirements: '• Degree/Diploma in HSE or Environmental Science\n• NEBOSH or equivalent certification\n• Experience in mining or heavy industry\n• Knowledge of Zimbabwe Mines and Minerals Act',
      closing_date: '2026-08-20',
      exhibitor_id: exh3.id,
      company_name: exh3.name || exh3.company_name,
    },
    {
      title: 'Logistics & Fleet Coordinator',
      category: 'Operations & Logistics',
      type: 'Full-time',
      location: 'Harare, Zimbabwe',
      description: 'Coordinate the movement of equipment, spare parts, and consumables between depots, workshops, and customer sites across Zimbabwe. Manage fleet scheduling and maintenance records.',
      requirements: '• Degree/Diploma in Logistics, Supply Chain or equivalent\n• 3 years experience in fleet or transport management\n• Proficiency in Excel and logistics software\n• Strong communication and planning skills',
      closing_date: '2026-09-05',
      exhibitor_id: exh4.id,
      company_name: exh4.name || exh4.company_name,
    },
    {
      title: 'Workshop Supervisor – Electrical',
      category: 'Engineering & Technical',
      type: 'Full-time',
      location: 'Bulawayo, Zimbabwe',
      description: 'Lead an electrical workshop team servicing high-voltage mining equipment, substations, and conveyor systems. Develop and enforce workshop SOPs and ensure team certifications are current.',
      requirements: '• Class 1 Electrician or Electrical Engineering degree\n• 5+ years workshop supervisory experience\n• Knowledge of HV switchgear and VSD systems\n• Strong leadership and report-writing skills',
      closing_date: '2026-08-10',
      exhibitor_id: exh5.id,
      company_name: exh5.name || exh5.company_name,
    },
    {
      title: 'Procurement Officer – Mining Consumables',
      category: 'Admin & Finance',
      type: 'Full-time',
      location: 'Harare, Zimbabwe',
      description: 'Source and procure drill bits, blast media, conveyor belting, and reagents for ongoing mining operations. Manage supplier relationships and ensure best value procurement in USD and ZiG.',
      requirements: '• Degree in Supply Chain, Commerce or related\n• CIPS qualification (or studying towards)\n• Experience in mining or industrial procurement\n• Competency with ERP or procurement systems',
      closing_date: '2026-09-15',
      exhibitor_id: exh0.id,
      company_name: exh0.name || exh0.company_name,
    },
    {
      title: 'Business Development Manager – Lubricants',
      category: 'Sales & Business Development',
      type: 'Full-time',
      location: 'Harare, Zimbabwe',
      description: 'Grow lubricant and specialty chemical sales across the mining, construction, and agriculture sectors in Zimbabwe and the region. Build OEM partnerships and key account relationships.',
      requirements: '• Degree in Chemical Engineering, Chemistry or Business\n• 5+ years B2B sales experience in industrials\n• Existing mining sector network preferred\n• Willingness to travel regionally',
      closing_date: '2026-08-25',
      exhibitor_id: exh2.id,
      company_name: exh2.name || exh2.company_name,
    },
  ];

  for (const j of jobs) {
    await post('/api/jobs', j);
    console.log(`✓  Job: ${j.title}`);
  }
}

// ── Tenders (6) ─────────────────────────────────────────────────────────────
if (await hasItems('minecon_tender_listings')) {
  console.log('⏭  minecon_tender_listings already seeded');
} else {
  const exh0 = diamond[0] || any[0];
  const exh1 = diamond[1] || any[1] || any[0];
  const exh2 = gold[0]    || any[2] || any[0];
  const exh3 = gold[1]    || any[3] || any[0];
  const exh4 = chrome[0]  || any[4] || any[0];
  const exh5 = diamond[2] || any[0];

  const tenders = [
    {
      title: 'Supply of Personal Protective Equipment (PPE)',
      category: 'Equipment',
      description: 'Invitation to tender for the supply and delivery of PPE to mine sites across Zimbabwe. Items include hard hats, safety boots (sizes 5–14), high-vis vests, FR coveralls, safety glasses, and hearing protection. Annual estimated value: USD 180,000. Deliveries required fortnightly to three depots.',
      closing_date: '2026-08-05',
      exhibitor_id: exh0.id,
      company_name: exh0.name || exh0.company_name,
    },
    {
      title: 'Transportation & Logistics Services – Equipment Delivery',
      category: 'Services',
      description: 'Seeking qualified haulage contractors to transport heavy earthmoving equipment between our depots, customer sites, and the Port of Beira. Loads include excavators up to 50 tonnes, mobile cranes, and articulated trucks. Must hold valid abnormal load permits. Multi-year contract available.',
      closing_date: '2026-08-12',
      exhibitor_id: exh1.id,
      company_name: exh1.name || exh1.company_name,
    },
    {
      title: 'Steel Fabrication – Conveyor Structures',
      category: 'Suppliers',
      description: 'Tender for fabrication and erection of conveyor support structures for expansion of a chrome ore processing facility. Scope includes design review, material procurement, fabrication, delivery, and installation. Estimated tonnage: 420 tonnes structural steel. Timeline: 14 weeks from award.',
      closing_date: '2026-08-20',
      exhibitor_id: exh2.id,
      company_name: exh2.name || exh2.company_name,
    },
    {
      title: 'Catering & Canteen Management – Mine Camp',
      category: 'Services',
      description: 'Invitation to tender for full canteen management services at a mine camp accommodating 350 employees. Scope includes three meals per day, packed lunches for underground shift, kitchen staffing, and camp hygiene. Preference for HACCP-certified suppliers. Contract period: 2 years.',
      closing_date: '2026-07-30',
      exhibitor_id: exh3.id,
      company_name: exh3.name || exh3.company_name,
    },
    {
      title: 'Supply of Industrial Lubricants & Hydraulic Fluids',
      category: 'Suppliers',
      description: 'Annual tender for supply of industrial lubricants, greases, and hydraulic fluids to meet the operational requirements of our workshop and mobile equipment fleet. Estimated annual volume: 85,000 litres. Preferred brands: Shell, Mobil, Total, or approved equivalent. Price lists in USD required.',
      closing_date: '2026-09-01',
      exhibitor_id: exh4.id,
      company_name: exh4.name || exh4.company_name,
    },
    {
      title: 'IT & Network Infrastructure – Camp & Offices',
      category: 'Solutions',
      description: 'Supply, installation, and support of network infrastructure (LAN, Wi-Fi, CCTV, PABX) for a new mine camp and administrative offices. Scope includes structured cabling, firewall, managed switches, and 12-month support SLA. Vendors must demonstrate prior mine site experience.',
      closing_date: '2026-09-10',
      exhibitor_id: exh5.id,
      company_name: exh5.name || exh5.company_name,
    },
  ];

  for (const t of tenders) {
    await post('/api/tenders', t);
    console.log(`✓  Tender: ${t.title}`);
  }
}

// ── Auctions (5) ─────────────────────────────────────────────────────────────
if (await hasItems('minecon_auctions')) {
  console.log('⏭  minecon_auctions already seeded');
} else {
  const auctions = [
    {
      title: 'Pre-Owned Mining Equipment Auction',
      type: 'Timed',
      location: 'MineCon 2026 – Hall B',
      description: 'Clearing sale of surplus mining and earthmoving equipment from multiple vendors. All items sold as-is with inspection available from 07:00 on auction day.',
      status: 'Live',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      featured_lots: [
        { lot_number: '1', title: 'Caterpillar 336 Excavator (2019)', category: 'Heavy Equipment', starting_bid: 95000, current_bid: 112000, bid_count: 7, status: 'Open', seller_name: 'Murray & Roberts Mining', description: '8,400 hours. Full service history. Hydraulic thumb included.' },
        { lot_number: '2', title: 'Bell B40E Articulated Dump Truck', category: 'Heavy Equipment', starting_bid: 65000, current_bid: 71500, bid_count: 4, status: 'Open', seller_name: 'Sandvik Zimbabwe', description: '2018 model, 11,200 hours. New tyres fitted March 2026.' },
        { lot_number: '3', title: 'Atlas Copco ROC D7 Drill Rig', category: 'Mining Assets', starting_bid: 42000, current_bid: 48000, bid_count: 9, status: 'Open', seller_name: 'Barrick Exploration', description: 'Top hammer drill, 2017. Serviced and in working order.' },
        { lot_number: '4', title: 'Sandvik LH517i LHD Loader', category: 'Mining Assets', starting_bid: 80000, current_bid: 80000, bid_count: 1, status: 'Open', seller_name: 'Great Dyke Investments', description: '2021 model, 3,200 hours. Underground use, excellent condition.' },
      ],
    },
    {
      title: 'Agricultural Equipment & Irrigation Sale',
      type: 'Timed',
      location: 'MineCon 2026 – Outdoor Yard',
      description: 'Farm equipment sale featuring tractors, centre pivots, and harvest machinery. Open to commercial farmers and agribusiness investors.',
      status: 'Upcoming',
      start_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
      featured_lots: [
        { lot_number: '1', title: 'John Deere 6130R Tractor (2020)', category: 'Agricultural', starting_bid: 38000, current_bid: null, bid_count: 0, status: 'Upcoming', seller_name: 'Agrifoods Zimbabwe', description: '1,800 hours. AutoTrac guidance system fitted.' },
        { lot_number: '2', title: 'Lindsay Centre Pivot – 6 Towers', category: 'Agricultural', starting_bid: 22000, current_bid: null, bid_count: 0, status: 'Upcoming', seller_name: 'Triangle Estates', description: '2019 installation, 120 ha coverage. Good working order.' },
        { lot_number: '3', title: 'Case IH Combine Harvester (2018)', category: 'Agricultural', starting_bid: 55000, current_bid: null, bid_count: 0, status: 'Upcoming', seller_name: 'Grain Producers Zimbabwe', description: '480 drum hours. Grain header and maize header included.' },
      ],
    },
    {
      title: 'Fleet Vehicles – Light & Heavy',
      type: 'Live',
      location: 'MineCon 2026 – Parking Zone A',
      description: 'Fleet clearance of mine support vehicles, pickups, and panel vans. All vehicles ZINARA-registered and roadworthy. Full service histories on request.',
      status: 'Upcoming',
      start_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString(),
      featured_lots: [
        { lot_number: '1', title: '2021 Toyota Hilux GD6 4×4 (×3 units)', category: 'Light Vehicles', starting_bid: 28000, current_bid: null, bid_count: 0, status: 'Upcoming', seller_name: 'Zimplats', description: 'Mine spec, ARB bullbars, toolboxes. Approx 65,000 km each.' },
        { lot_number: '2', title: '2019 Isuzu FRR 600 Truck', category: 'Light Vehicles', starting_bid: 18000, current_bid: null, bid_count: 0, status: 'Upcoming', seller_name: 'Impala Platinum', description: 'Dropside body, 180,000 km. Full service history.' },
      ],
    },
    {
      title: 'Industrial Tools & Workshop Equipment',
      type: 'Timed',
      location: 'MineCon 2026 – Hall C',
      description: 'Surplus workshop tools and equipment including welding machines, hydraulic presses, compressors, and hand tools from mine workshop decommissioning.',
      status: 'Upcoming',
      start_date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 74 * 60 * 60 * 1000).toISOString(),
      featured_lots: [
        { lot_number: '1', title: 'Lincoln Electric Vantage 400 Welder', category: 'Tools & Accessories', starting_bid: 3200, current_bid: null, bid_count: 0, status: 'Upcoming', seller_name: 'Bindura Nickel Corporation', description: '2020 model. Engine drive, multi-process. Low hours.' },
        { lot_number: '2', title: 'Ingersoll Rand 185 CFM Compressor', category: 'Tools & Accessories', starting_bid: 5500, current_bid: null, bid_count: 0, status: 'Upcoming', seller_name: 'Hwange Colliery', description: 'Diesel driven, trailer mounted. Full service history.' },
        { lot_number: '3', title: 'Parker 10T Hydraulic Press', category: 'Tools & Accessories', starting_bid: 1800, current_bid: null, bid_count: 0, status: 'Upcoming', seller_name: 'Zimasco', description: 'Workshop press, excellent condition.' },
      ],
    },
    {
      title: 'Mining Assets Clearing Sale – Shamva',
      type: 'Sealed Bid',
      location: 'Shamva Mine, Zimbabwe',
      description: 'Sealed bid auction of assets from a decommissioned gold mine including processing equipment, underground infrastructure, and camp assets. Site inspection: 22 July 2026 by appointment only.',
      status: 'Closed',
      start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      featured_lots: [
        { lot_number: '1', title: '50 TPD Ball Mill & CIL Circuit', category: 'Mining Assets', starting_bid: 320000, current_bid: 395000, bid_count: 3, status: 'Closed', seller_name: 'Restricted (Contact Auctioneer)', description: 'Complete gold processing plant. 2015 installation.' },
        { lot_number: '2', title: 'Underground Pump Sets (×12)', category: 'Mining Assets', starting_bid: 45000, current_bid: 52000, bid_count: 5, status: 'Closed', seller_name: 'Restricted (Contact Auctioneer)', description: 'Multistage centrifugal pumps, various capacities.' },
      ],
    },
  ];

  for (const a of auctions) {
    await post('/api/auctions', a);
    console.log(`✓  Auction: ${a.title}`);
  }
}

// ── Enquiries — seed into virtual-enquiries for ExhibitorEnquiries display ───
const { Items: enquiries = [] } = await ddb.send(new ScanCommand({ TableName: 'minecon_virtual_enquiries' }));
const demoEnquiries = enquiries.filter(e => e.name === 'Tendai Moyo' || e.message?.includes('[Demo]'));

if (demoEnquiries.length >= 3) {
  console.log('⏭  Demo enquiries already seeded');
} else {
  const exhibitorIds = any.slice(0, 3).map(e => ({ id: e.id, name: e.name || e.company_name }));

  const items = [
    { name: 'Tendai Moyo', email: 'tendai.moyo@constructco.co.zw', company: 'ConstructCo Zimbabwe', phone: '+263771234567', message: '[Demo] Good afternoon, we are expanding our fleet and would like to schedule a demo of your latest excavator models. Can we arrange a visit after the show?', exhibitor_id: exhibitorIds[0]?.id, exhibitor_name: exhibitorIds[0]?.name, status: 'New' },
    { name: 'Rudo Chikwanda', email: 'rudo@mineserv.co.zw', company: 'Mineserv Solutions', phone: '+263773456789', message: '[Demo] We are interested in your conveyor system offerings for our chrome processing plant upgrade. Please share your product catalogue and lead times for installation in Q4 2026.', exhibitor_id: exhibitorIds[1]?.id, exhibitor_name: exhibitorIds[1]?.name, status: 'New' },
    { name: 'Brighton Ncube', email: 'b.ncube@goldfields.co.zw', company: 'Goldfields Zimbabwe', phone: '+263772345678', message: '[Demo] Our procurement committee is reviewing drill and blast suppliers for the 2027 financial year. Would your company be available to present at our head office in Bulawayo next month?', exhibitor_id: exhibitorIds[2]?.id, exhibitor_name: exhibitorIds[2]?.name, status: 'Responded', reply: 'Thank you for reaching out. We would be happy to schedule a presentation. Please email our BD team at sales@company.co.zw to confirm a date.', replied_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { name: 'Chido Gumbo', email: 'c.gumbo@mhpr.co.zw', company: 'MHPR Consulting', phone: null, message: '[Demo] Could you provide pricing for a 12-month reagent supply contract for our processing facility? We consume approximately 2.4 tonnes of activated carbon per month.', exhibitor_id: exhibitorIds[0]?.id, exhibitor_name: exhibitorIds[0]?.name, status: 'New' },
    { name: 'Anesu Maradzika', email: 'a.maradzika@transafrique.co.zw', company: 'TransAfrique Logistics', phone: '+263774567890', message: '[Demo] We handle heavy equipment transport across southern Africa. Are you exhibiting a dealer programme or looking for logistics partnerships? Happy to discuss at your stand.', exhibitor_id: exhibitorIds[1]?.id, exhibitor_name: exhibitorIds[1]?.name, status: 'New' },
  ];

  for (const item of items) {
    if (!item.exhibitor_id) continue;
    await ddb.send(new PutCommand({
      TableName: 'minecon_virtual_enquiries',
      Item: {
        id: generateId(),
        created_date: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
        ...item,
      },
    }));
    console.log(`✓  Enquiry from ${item.name}`);
  }
}

// ── Live sessions ─────────────────────────────────────────────────────────────
const { Items: sessions = [] } = await ddb.send(new ScanCommand({ TableName: 'minecon_sessions' }));
if (sessions.length >= 2) {
  console.log('⏭  Sessions already seeded');
} else {
  const sessionData = [
    {
      title: 'Zimbabwe Mining Industry Outlook 2027',
      speaker_name: 'Dr. Lovemore Chinoyi',
      speaker_bio: 'Director, Chamber of Mines of Zimbabwe',
      status: 'live',
      start_time: new Date().toISOString(),
      stream_url: null,
      description: 'A deep dive into commodity trends, investment climate, and the opportunities shaping Zimbabwe\'s mining sector heading into 2027.',
      chat_enabled: true,
      qa_enabled: true,
      viewer_count: 142,
    },
    {
      title: 'Green Mining: Electrification of Underground Fleets',
      speaker_name: 'Eng. Sibongile Dlamini',
      speaker_bio: 'Chief Technology Officer, Battery Electric Vehicles Southern Africa',
      status: 'scheduled',
      start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      stream_url: null,
      description: 'How battery-electric LHDs and trucks are reducing diesel costs, improving air quality, and cutting emissions in deep-level mines.',
      chat_enabled: true,
      qa_enabled: true,
    },
    {
      title: 'Women in Mining: Leadership Panel',
      speaker_name: 'Panel Discussion',
      speaker_bio: 'Moderated by Zimbabwe Women in Mining Association',
      status: 'scheduled',
      start_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      stream_url: null,
      description: 'Panel featuring four senior women leaders from across the mining value chain — from geology to executive management.',
      chat_enabled: true,
      qa_enabled: true,
    },
    {
      title: 'Future of Drilling: Digital & Autonomous Systems',
      speaker_name: 'Riku Haarlanen',
      speaker_bio: 'VP Automation, Sandvik Mining & Rock Solutions',
      status: 'ended',
      start_time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      recording_url: 'https://www.youtube.com/embed/4Cp0R0nPum8',
      description: 'An in-depth look at Sandvik\'s AutoMine platform and what autonomous drilling means for productivity and safety on African mine sites.',
      chat_enabled: false,
      qa_enabled: false,
    },
  ];

  for (const s of sessionData) {
    await post('/api/sessions', s);
    console.log(`✓  Session: ${s.title}`);
  }
}

console.log('\nSeed complete.');
