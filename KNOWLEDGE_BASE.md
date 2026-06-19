# MineCon 2026 — AI Agent Knowledge Base

> Complete reference for all three portals: Attendee PWA, Exhibitor Portal, and Organizer Console.  
> Last updated: 2026-06-17

---

## Table of Contents

1. [Event Overview](#event-overview)
2. [Platform Architecture](#platform-architecture)
3. [User Roles & Access](#user-roles--access)
4. [Attendee PWA (`/`)](#attendee-pwa)
5. [Exhibitor Portal (`/exhibitor`)](#exhibitor-portal)
6. [Organizer Console (`/console`)](#organizer-console)
7. [Exhibitor Directory — Full List](#exhibitor-directory--full-list)
8. [Sponsors](#sponsors)
9. [Event Schedule](#event-schedule)
10. [FAQs](#faqs)
11. [Event Rules](#event-rules)
12. [Contact & Venue](#contact--venue)

---

## Event Overview

**MineCon 2026** is Southern Africa's premier B2B Mining and Construction Exhibition.

| Detail | Value |
|---|---|
| Event | MineCon 2026 |
| Dates | TBC — October 2026 (3 days) |
| Venue | Artfarm Grounds, Pomona, Harare, Zimbabwe |
| Opening Hours | 08:00 – 18:00 daily (Gates open 07:30) |
| Entry | Free for visitors |
| Exhibitor Packages | Diamond, Gold, Chrome, Copper |
| Website | minecon.global |
| Contact | info@minecon.global |
| Exhibition Days | Day 1 — Mining Sector Focus · Day 2 — Construction & Infrastructure · Day 3 — Suppliers, Solutions & Closing |
| Exhibitor Count | 80+ exhibitors across 4 zones |
| Booth Zones | Main Hall · Exhibition Hall · Suppliers Zone · Solutions Zone |

**About:** MineCon brings together suppliers, equipment manufacturers, professional service providers, and industry buyers under one roof. It provides a structured B2B environment for serious business conversations, product demonstrations, and contract opportunities across the full spectrum of the mining and construction value chain.

---

## Platform Architecture

The MineCon app is a Vite + React PWA with three separate shells:

| Shell | URL Prefix | Audience | Device |
|---|---|---|---|
| Attendee PWA | `/` | Visitors & attendees | Mobile-first PWA |
| Exhibitor Portal | `/exhibitor` | Exhibiting companies | Desktop browser |
| Organizer Console | `/console` | MineCon team & marketing partners | Desktop sidebar |

**Tech stack:** Vite, React, Tailwind CSS v3, shadcn/ui, React Router v6, @tanstack/react-query.  
**Data layer:** DynamoDB + S3 (migrated from localStorage). Storage entities: `exhibitors`, `sponsors`, `announcements`, `meetingrequests`, `registrations`, `users`, `engagementevents`, `attendeenotes`, `adslots`, `appsettings`, `magazinepages`, `guidepages`.

---

## User Roles & Access

| Role | Portal | Capabilities |
|---|---|---|
| `organizer` | Console `/console` | Full access — all modules, analytics, data, settings, user management |
| `marketing_partner` | Console `/console` | Marketing Hub only — ad slots, sponsored posts, exhibition guide, analytics |
| `exhibitor` | Exhibitor Portal `/exhibitor` | Booth profile, meeting requests, visitor scanner, team management, analytics |
| `attendee` | Attendee PWA `/` | Browse exhibitors, book meetings, view schedule, save favourites |

**Demo credentials (seed data):**
- Organizer: `organizer@minecon.global`
- Marketing Partner: `partner@minecon.global`
- Exhibitor: `exhibitor@minecon.global` (linked to Steel Warehouse Holdings)
- Attendee: `attendee@minecon.global`

---

## Attendee PWA

**URL:** `/`  
**Shell:** AppShell — mobile PWA with bottom navigation bar  
**Who uses it:** General visitors, registered attendees, prospective exhibitors researching the event

### Pages & Features

#### Home (`/`)
- Hero banner with MineCon 2026 branding and venue info
- **Ad Banner Carousel** — rotating ads from Diamond exhibitors (auto-scrolling, click-tracked)
- **Virtual Exhibition Banner** — shown only when organizer has enabled virtual exhibition mode
- **Pinned Announcements** — important notices pushed by the organizer (colour-coded by type)
- **Quick Access grid** — 8 shortcut tiles: Exhibitors, Site Plan, Meetings, Schedule, Register, Magazine, Sponsors, Connect
- **Stats strip** — 80+ Exhibitors · 4 Zones · 3 Days
- **Featured Exhibitors** — up to 6 Diamond-tier exhibitors with a "Meet" button that pre-fills the meeting booking form
- **Latest Updates** — 3 most recent non-pinned announcements (sponsored posts shown with "Sponsored" label)

#### Exhibitors (`/exhibitors`)
- Full searchable, filterable directory of all exhibitors
- Filter by tier (Diamond, Gold, Chrome, Copper), category (Equipment, Services, Suppliers, Solutions), and section (Main Hall, Exhibition Hall, Suppliers Zone, Solutions Zone)
- Each card shows: logo, name, booth number, tier badge, category, section
- Tap a card to go to the exhibitor detail page

#### Exhibitor Detail (`/exhibitors/:id`)
- Full exhibitor profile: logo, name, tier badge, booth number, section, category
- Description text
- Contact details: email, phone, website
- Booth stand image (uploaded by exhibitor)
- "Request a Meeting" button — navigates to `/meetings` pre-filled with this exhibitor
- Engagement tracking: view is logged as a `profile_view` event

#### Site Plan (`/site-plan`)
- Interactive floor map showing all 4 booth zones
- Tap a booth marker to see exhibitor name and section
- Booth stand image appears when tapping a booth that has one uploaded

#### Meetings (`/meetings`)
- **Book a Meeting form:** visitor details (name, company, email, phone), exhibitor selector, preferred date (2–4 October 2026), preferred time (09:00–16:00), reason/message
- Date options: 2 October 2026, 3 October 2026, 4 October 2026
- Time slots: 09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00
- After submission: confirmation screen with exhibitor name, date, and time
- **Meeting Requests list** — all submitted requests with status badges (Pending / Confirmed / Cancelled)
- When navigated from a Featured Exhibitor or Exhibitor Detail, the form pre-fills the exhibitor name and booth

#### Schedule (`/schedule`)
- Full 3-day event agenda with day-tab navigation
- Sessions colour-coded by type: Keynote (amber), Panel (blue), Session (purple), Demo (emerald), Networking (pink), Sponsored (orange)
- Each session shows: time, duration, title, speaker, location
- Sessions with `virtual: true` show a "Join Online" badge with webinar link
- Day 1 theme: Mining Sector Focus
- Day 2 theme: Construction & Infrastructure
- Day 3 theme: Suppliers, Solutions & Closing

#### Announcements (`/announcements`)
- All live announcements from the organizer
- Types with colour coding: Important (red), Reminder (amber), Update (emerald), General (blue)
- Sponsored announcements show the sponsor name with a sparkle badge

#### Event Information (`/event-info`)
- Key event details (dates, hours, venue, entry, website)
- About MineCon description
- Visitor guidance tips
- Exhibitor tiers explanation
- Event rules
- FAQ accordion (8 questions — see FAQ section below)
- Organiser contact details

#### Register (`/register`)
- Registration form for attendees, exhibitors, sponsors, speakers, VIPs
- Collects: full name, company, email, phone, role type, ticket type
- Generates a QR-coded ticket after registration

#### Attendee Dashboard (`/attendee-dashboard`)
- Personal dashboard — "My MineCon"
- **Stats strip:** Saved items · Notes · Meetings · Sessions saved
- **Ad Banner Carousel** embedded at top
- **Tabs:**
  - **Saved** — starred exhibitors and sessions; tap the note icon to add personal notes
  - **Bookmarks** — non-starred saved items
  - **Schedule** — full 3-day session list; star any session to save it; saved sessions appear in the Saved tab
  - **Meetings** — all your meeting requests with status and time slot
  - **Updates** — all announcements feed

#### Sponsors (`/sponsors`)
- Sponsor profiles grouped by tier: Platinum, Gold, Silver, Bronze
- Each sponsor shows: logo, name, description, tier badge, website link

#### Magazine (`/magazine`)
- Interactive 15-page digital Exhibition Guide
- Page types: editorial (read-only), image ad (full-page or half-page), interactive carousel (SANY Group — auto-rotating product images), video ad (Jetmaster — image + embedded video)
- Advertisers across ad pages: SANY Group (pg4), Elimobil (pg6), Jetmaster (pg7), Zambezi Gas & Coal (pg10), Zimtile (pg12), Woodlot Timbers (pg13)
- All ad clicks, video plays, video completions, and carousel views are tracked as engagement events

#### QR Resources (`/qr-resources`)
- Explains how to use QR codes at the event
- Scan exhibitor booth QR → access brochures, videos, contacts
- Scan visitor badge QR → exhibitors log your visit

#### Connect Hub (`/connect`)
- Full module directory — all sections of the app with descriptions
- Live stats: Registrations · Meetings · Exhibitors
- Organized into sections: Registration & Attendance · Exhibitors & Sponsors · Event Programme · Communications & Content · Analytics & Reporting

---

## Exhibitor Portal

**URL:** `/exhibitor`  
**Shell:** ExhibitorShell — desktop browser with top navigation  
**Who uses it:** Companies that have a booth at MineCon 2026

**Navigation tabs:** Home · Meetings · Visitor Scanner · Analytics · Team

### Booth Matching
An exhibitor's portal is linked to their booth by matching the logged-in user's email to `contact_email` on the exhibitor record. If no match is found, it falls back to the first exhibitor record (demo mode).

### ExhibitorHome (`/exhibitor`)

**Booth Card**
- Company logo, name, tier badge, section, booth number
- Contact details: email, phone, website
- Description
- "Edit Profile" button — opens an inline form to update booth details

**Stats Row**
- Total Meetings · Pending · Confirmed

**Tier Upgrade CTA** (shown to non-Diamond exhibitors)
- Highlights what the next tier unlocks:
  - Copper → Chrome: Exhibitor directory boost, Priority meeting placement, Dedicated booth page
  - Chrome → Gold: Lead export (CSV), Featured in digital magazine, Meeting request boost, Ad banner eligibility
  - Gold → Diamond: Home page featured listing, Ad carousel slot, Diamond badge, All Gold perks
- "Enquire" button links to `mailto:info@minecon.global?subject=Booth%20Upgrade%20Enquiry`

**Meeting Requests**
- Lists all meeting requests for this exhibitor
- Each request shows: attendee name, status badge, message, preferred time, attendee email
- Pending requests have Confirm and Decline buttons
- Status values: Pending · Confirmed · Declined

**Booth Stand Image**
- Upload a photo of the physical booth stand (JPG/PNG, auto-resized)
- Shown to attendees when they tap the booth on the site plan
- Can replace or remove the image

**Featured Badge**
- Shown if the exhibitor is `featured: true` — indicates they appear highlighted in the directory

**Ad Banner** (Diamond only)
- Shows a live preview of the exhibitor's home screen carousel ad
- Non-Diamond exhibitors see a blurred placeholder with an upgrade prompt
- Diamond exhibitors without a configured ad are prompted to contact the organizer

**Booth QR Code**
- Displays a printable QR code encoding: `{ t: "exhibitor", id, n, b, s, ev: "mc26" }`
- Usage tips: print and frame at booth entrance, add to digital display, include in marketing materials
- Link to Visitor Scanner page

### Meetings (`/exhibitor/meetings`)
- Same meeting booking form as the attendee `/meetings` page
- But when accessed from the exhibitor portal, the meeting list shows only this exhibitor's requests

### Visitor Scanner (`/exhibitor/scan`)
- Camera-based QR scanner
- Scans visitor badge QR codes (`{ t: "visitor", ev: "mc26", id, n, e }`)
- On success: logs a `booth_scan` engagement event and shows visitor name/email
- On failure: "Invalid Badge QR" error with retry button
- **Session Log:** in-memory list of all scans this session (up to 50), with name, email, and time-ago
- Clear button empties the session log

### Analytics (`/exhibitor/analytics`)

**KPI Cards**
- Booth Views (profile_view events)
- QR Scans (qr_scan + booth_scan events)
- Meeting Requests (total)
- Ad & Feature Hits (ad_click + featured_click events)

**14-Day Engagement Trend**
- Bar chart showing daily engagement counts for the past 14 days

**Engagement by Source** (horizontal bar chart)
- Directory, Home — Featured, Home — Ad Banner, Digital Magazine, Connect Hub, Sponsors Page, Visitor Scanned Booth QR, Exhibitor Scanned Visitor

**Engagement by Type** (horizontal bar chart)
- Booth Visit, Meeting Click, Ad Click, Featured Tap, Visitor QR Scan, Exhibitor Scan

**Ad Banner Performance** (Diamond only)
- Carousel Clicks (ad_click events from home_carousel source)
- Total Ad Events (all ad_click events)
- Blurred/locked for non-Diamond tiers

**Exhibition Guide Performance**
- Ad Clicks from the magazine, Carousel Views, Video Plays, Video Completions, Video Completion Rate
- Export CSV button

**Meeting Requests Breakdown**
- Pending · Confirmed · Declined counts

**Recent Activity**
- Last 10 engagement events with type, source, and timestamp

**Lead Export** (Gold and Diamond only)
- Table of all meeting requests: Name, Email (blurred for non-premium), Status, Date
- "Export CSV" downloads all leads as a CSV file
- Copper and Chrome tiers see a locked/blurred table with an upgrade prompt

### Team (`/exhibitor/team`)
- Lists all portal users with `role: exhibitor` at the same company
- Add / Edit / Remove team members
- Each member has: full name, email, company, active status
- Organizers see all exhibitor users across all companies
- Exhibitor users see only their own company's team
- New members get access to `/exhibitor` at their login email

---

## Organizer Console

**URL:** `/console`  
**Shell:** ConsoleShell — desktop sidebar navigation, mobile drawer  
**Guard:** `ConsoleGuard` — only `organizer` and `marketing_partner` roles can access; others are redirected to login  
**Who uses it:** MineCon organizing team and approved marketing partners

### Dashboard (`/console`)

**Role-aware header:** Shows "Marketing Dashboard" for `marketing_partner`, "Dashboard" for `organizer`.

**Marketing Partner quick-access** (marketing_partner only)
- Two quick-link cards: Marketing Hub and Analytics

**Virtual Exhibition Toggle** (organizer only)
- Enable/disable the virtual exhibition feature for attendees
- When open: attendees see the Virtual Exhibition Banner on the home page and can browse virtual booths and submit enquiries
- When closed: virtual features hidden from all attendees

**Stat Cards**
- Total Exhibitors · Meeting Requests · Info Enquiries · Announcements

**Meeting Status**
- Pending · Confirmed · Cancelled counts

**Sanity Check** (organizer only — collapsible)
- Automated data quality checks:
  - Exhibitors missing logo
  - Exhibitors missing description
  - Exhibitors missing booth number
  - Exhibitors with invalid section (must be one of: Main Hall, Exhibition Hall, Suppliers Zone, Solutions Zone)
  - Duplicate booth numbers
  - Announcements missing body text
  - Meeting requests referencing a non-existent exhibitor
- Each issue is expandable to list affected records (up to 12 shown)
- Shows "All clear" when no issues found

**Charts**
- Exhibitors by Tier (bar chart — Diamond/Gold/Chrome/Copper)
- Exhibitors by Category (progress bars — Equipment/Services/Suppliers/Solutions)

**App Engagement** (demo data indicator)
- App Visits · QR Code Scans · Exhibitor Profile Views · Site Plan Views — all with trend percentages

### Analytics (`/console/analytics`)

**Stat Cards (8 KPIs)**
- Total Registrations · Check-Ins · Meeting Requests · Exhibitor Views · QR Scans · Sponsor Clicks · Magazine Views · App Visits — each with a trend percentage

**Charts**
- Engagement Over Event Days (grouped bar: App Visits, QR Scans, Meetings per day over 3 days — demo data)
- Check-in Trend — Day 1 (line chart by hour from 07:30 to 17:00 — demo data)
- Registrations by Type (Attendee / Exhibitor / Sponsor / Speaker / VIP Guest — live data)
- Exhibitor Views by Category (pie chart — Equipment 38%, Services 24%, Suppliers 22%, Solutions 16% — demo data)

**Quick Metrics**
- Avg. sessions per attendee · Avg. exhibitor profile views · Meeting conversion rate · QR scan-to-download rate · Magazine completion rate · Sponsor click-through rate (all demo data)

### Admin & Security (`/console/admin`)
- Admin profile card (name, email, role)
- OTP/Verification settings (configurable): Email OTP on registration, Admin 2FA, Session timeout
- **Role & Permission Simulator** — select any role (Admin / Organiser / Exhibitor / Attendee) to see which modules they can access
- **Registration Management** — list of registrations with status dropdown (Pending / Confirmed / Checked In / Cancelled)
- **Quick Navigation** — links to all app modules

### Communications (`/console/communications`)
- **Live Announcements** — create, view, and delete announcements visible to attendees
  - Types: General · Important · Update · Reminder
  - Optional: mark as Sponsored Post with sponsor name
  - Announcements are immediately live to all attendees after saving
  - Delete confirmation dialog before removal
- **Static Notices** (read-only, reference only):
  - Security & Accreditation — badge collection rules
  - Parking & Transport — Artfarm Grounds, Pomona Road gate, Avondale shuttle
  - Opening Ceremony Change — keynote moved to 09:30 Day 1
  - Wi-Fi Access — Network: MineCon2026, password at registration desk
- **Campaign Messaging** (placeholder section):
  - Pre-event reminder — 7 days before (Draft)
  - Day 1 welcome message (Draft)
  - Session reminders — automated (Draft)
  - Post-event follow-up (Draft)

### Gate Check-In (`/console/check-in`)

**Header stats:** Checked-in count · Pending count (live from registrations)

**Three tabs:**

1. **QR Scanner**
   - Camera-based QR scanner reads ticket QR codes
   - QR payload format: `{ t: "ticket", ev: "mc26", rid: <registration_id>, tok: <token> }`
   - Scan outcomes:
     - ✅ **Entry Granted** — ticket valid, attendee may enter; marks registration as Checked In
     - ⚠️ **Already Checked In** — ticket was already used; shows original check-in time
     - ❌ **Registration Cancelled** — registration was cancelled
     - ❌ **Invalid QR Code** — not a valid MineCon 2026 ticket
     - ❌ **Registration Not Found** — no matching registration ID
     - 🔴 **Security Mismatch — Possible Forgery** — token doesn't match record
   - Each ticket grants entry once only (cryptographic token prevents re-use)

2. **Manual Lookup**
   - Search registrations by name, email, or company
   - Results show: name, status badge, ticket type, company, check-in time (if already in)
   - "Check In" button with a two-step confirmation to prevent accidental check-ins
   - Already-checked-in records show a green checkmark; cancelled records show a red X

3. **Check-In Log**
   - Reverse-chronological list of all checked-in attendees
   - Shows: name, ticket type, badge category, company/email, check-in time

### Users & Roles (`/console/users`)
- Summary cards: count per role (Organizer · Marketing Partner · Exhibitor · Attendee)
- Click a role card to filter the list by that role
- Search by name, email, or company
- **Add / Edit users:** full name, email, company, role selection
- **Delete users** (with confirmation)
- Role descriptions:
  - Organizer: Full console access — MineCon team only
  - Marketing Partner: Console access for approved marketing partners
  - Exhibitor: Exhibitor portal — booth, meetings, analytics
  - Attendee: Attendee PWA — browse, book meetings, schedule
- Organizers cannot edit Marketing Partner accounts via this panel

### Marketing Hub (`/console/marketing`)
**Access:** `marketing_partner` role only (organizers redirected to dashboard)

**KPI Cards**
- Active Ad Slots · Sponsored Posts · Guide Ad Clicks · Total Engagements

**Four collapsible sections:**

#### 1. Exhibition Guide
- 15-page magazine thumbnail grid (pages 1–15)
- Editorial pages (greyed out, non-editable): Cover, Welcome, Contents, Event Overview, Site Plan, Industry Insight, Exhibitor Directory, Why Attend?, Back Cover
- **Ad pages** (amber dot, clickable to edit):
  - Page 4 — SANY Group — Interactive product carousel
  - Page 6 — Elimobil — Full-page image ad
  - Page 7 — Jetmaster — Image + video embed
  - Page 10 — Zambezi Gas & Coal — Full-page image ad
  - Page 12 — Zimtile — Full-page image ad
  - Page 13 — Woodlot Timbers — Half-page image ad
- **Edit panel** (when an ad page is selected):
  - Upload or replace the ad image (JPEG/PNG, auto-resized to 1200px max)
  - Set a click URL (destination when reader taps the ad)
  - Per-page analytics:
    - Page 4 (SANY): website link clicks + carousel slide views
    - Page 7 (Jetmaster): image clicks + video plays, completions, completion rate bar
    - All other pages: image click count
- Click counts shown as badge on each thumbnail when > 0
- All-advertiser click breakdown bar chart at the bottom
- "Export Report" CSV: Advertiser, Page, Ad Type, Ad Clicks, Video Plays, Video Completes, Completion Rate, Carousel Views
- "Preview Magazine" link opens the attendee-facing magazine

#### 2. Ad Carousel Inventory
- Live preview of the attendee home screen carousel (rendered in real-time)
- Table of all ad slots: Company, Headline, Click count, Active/Paused toggle
- **Add Slot dialog:** Company name, ad label, background gradient, headline, subtext, logo URL, destination URL
- Toggle any slot live/paused instantly
- Delete a slot (with confirmation)

#### 3. Sponsored Announcements
- List of all announcements marked as `sponsored: true`
- **New Post dialog:** Sponsor name, type, headline, body
- Sponsored posts appear in the attendee feed with a sparkle ✨ icon and sponsor name
- Delete with confirmation

#### 4. Ad Performance
- Bar chart: Ad Clicks by Exhibitor (top 8)
- Bar chart: Exhibitor Tier Pipeline (Diamond/Gold/Chrome/Copper counts)
- Shows how many premium exhibitors (Diamond + Gold) are eligible for lead export and ad placement

**Reports & Exports (CSV downloads)**
- Engagement Events: all booth visits, QR scans, ad clicks — type, source, exhibitor, date
- Sponsored Posts: title, sponsor, type, date
- Ad Performance: company, status, click counts

---

## Exhibitor Directory — Full List

### Diamond Tier — Main Hall

| ID | Company | Booth | Category | Featured |
|---|---|---|---|---|
| e01 | Steel Warehouse Holdings | A01 | Suppliers | ✅ |
| e02 | Isuzu Zimbabwe | A02 | Equipment | ✅ |
| e03 | Viking | A03 | Equipment | ✅ |
| e04 | Agricon Equipment | A04 | Equipment | ✅ |
| e05 | ICC | A05 | Services | ✅ |
| e06 | Redan | A06 | Suppliers | ✅ |
| e07 | SANY Group | A07 | Equipment | ✅ |
| e08 | R&S Diesel Professionals | A08 | Services | ✅ |
| e09 | National Propshaft Centre | A09 | Services | — |
| e10 | Nicnel | A10 | Services | — |
| e11 | AM Mach | A11 | Equipment | — |
| e12 | Better Brands | A12 | Suppliers | — |
| e13 | Zimplow Holdings | A13 | Equipment | ✅ |
| e14 | Great Dyke | A14 | Solutions | — |
| e15 | Tsapo | A15 | Solutions | — |
| e16 | LiuGong Zimbabwe | A16 | Equipment | ✅ |

### Gold Tier — Exhibition Hall

| ID | Company | Booth | Category |
|---|---|---|---|
| e17 | Electrosales Zimbabwe | B01 | Solutions |
| e18 | Tselentis Group | B02 | Equipment |
| e19 | Steel Building Company | B03 | Suppliers |
| e20 | E4 Engineering | B04 | Services |
| e21 | Pomona Bricks | B05 | Suppliers |
| e22 | Ledtronics | B06 | Solutions |
| e23 | Auto Torque | B07 | Services |
| e24 | Kanu Equipment | B08 | Equipment |
| e25 | FuelTech | B09 | Suppliers |
| e26 | Sealachem | B10 | Suppliers |
| e27 | PTS | B11 | Services |
| e28 | Slab Sales Africa | B12 | Suppliers |
| e29 | Starbell Auto | B13 | Equipment |
| e30 | Intrachem | B14 | Suppliers |
| e31 | FBM Haulage | B15 | Services |
| e32 | Tandamanzi | B16 | Solutions |
| e33 | Zimdam | B17 | Services |
| e34 | Primus | B18 | Suppliers |
| e35 | Zimoco | B19 | Equipment |
| e36 | Solar Agro Systems | B20 | Solutions |
| e37 | Stanserv | B21 | Services |
| e38 | Winfield | B22 | Services |
| e39 | EcoCash | B23 | Solutions |
| e40 | Solar Energy Projects | B24 | Solutions |
| e41 | Zimdam | B25 | Services |
| e42 | Hastt | B26 | Solutions |
| e43 | Swift | B27 | Services |

### Chrome Tier — Suppliers Zone

| ID | Company | Booth | Category |
|---|---|---|---|
| e44 | EzyTrack | C01 | Solutions |
| e45 | Design Element Studios | C02 | Services |
| e46 | Penanel | C03 | Solutions |
| e47 | Cutting Edge | C04 | Equipment |
| e48 | Ice Age | C05 | Services |
| e49 | Shumba Packs | C06 | Suppliers |
| e50 | TradeKings | C07 | Suppliers |
| e51 | FDCA | C08 | Services |
| e52 | Drum City | C09 | Suppliers |
| e53 | Shepco | C10 | Services |
| e54 | Glow Petroleum | C11 | Suppliers |
| e55 | Sunflow | C12 | Solutions |
| e56 | Bain Web | C13 | Solutions |
| e57 | Dzines | C14 | Services |
| e58 | CropServe | C15 | Solutions |
| e59 | PJM | C16 | Services |

### Copper Tier — Solutions Zone

| ID | Company | Booth | Category |
|---|---|---|---|
| e60 | ProCAfrica | D01 | Services |
| e61 | SKM Motorcycles | D02 | Equipment |
| e62 | Fine & Country | D03 | Solutions |
| e63 | TecSol | D04 | Solutions |
| e64 | Scout Aerial Africa | D05 | Solutions |
| e65 | Compulink | D06 | Solutions |
| e66 | Hollands | D07 | Suppliers |
| e67 | Stem Magnetics | D08 | Equipment |
| e68 | Greencon | D09 | Services |
| e69 | AMD | D10 | Equipment |
| e70 | Hardrock | D11 | Services |
| e71 | Cochrane Pump | D12 | Equipment |
| e72 | CAFCA | D13 | Suppliers |
| e73 | Powerworx | D14 | Solutions |
| e74 | Corporate 24 | D15 | Services |
| e75 | Dolphin Telcoms | D16 | Solutions |
| e76 | GPS | D17 | Solutions |
| e77 | Hillmax Engineering | D18 | Services |
| e78 | PowerDrive | D19 | Equipment |
| e79 | CAFCA | D20 | Suppliers |
| e80 | Exodus Mining | D21 | Services |

### Exhibitor Descriptions (Selected)

- **Steel Warehouse Holdings (A01)** — The leading steel and metal products supplier to mining and construction projects across Zimbabwe and the region.
- **Isuzu Zimbabwe (A02)** — Official Isuzu commercial vehicle dealer for Zimbabwe. Trucks, pickups and fleet solutions for the mining and construction sector.
- **SANY Group (A07)** — Global leader in construction and mining equipment. Excavators, cranes, concrete machinery, and road equipment.
- **Zimplow Holdings (A13)** — Diversified Zimbabwean industrial group manufacturing equipment for mining, agriculture and construction.
- **LiuGong Zimbabwe (A16)** — Official LiuGong heavy equipment distributor for Zimbabwe. Wheel loaders, excavators, forklifts and more.
- **Kanu Equipment (B08)** — Construction and mining equipment dealer offering a comprehensive range of machinery and support services.
- **EcoCash (B23)** — Zimbabwe's leading mobile money and digital payments platform powering business transactions on-site.
- **Scout Aerial Africa (D05)** — Drone surveys, aerial photography, and LiDAR mapping for mining exploration and site monitoring.
- **Corporate 24 (D15)** — Private healthcare, medical insurance, and occupational health services for mining personnel.
- **Dolphin Telcoms (D16)** — Telecommunications infrastructure and connectivity solutions for remote mining operations.

---

## Sponsors

| ID | Company | Tier | Website |
|---|---|---|---|
| s1 | SANY Group | Platinum | sanyglobal.com |
| s2 | Zimplow Holdings | Platinum | zimplow.co.zw |
| s3 | Steel Warehouse Holdings | Platinum | swh.co.zw |
| s4 | Agricon Equipment | Gold | agricon.co.zw |
| s5 | LiuGong Zimbabwe | Gold | liugongzw.com |
| s6 | Kanu Equipment | Gold | — |
| s7 | Electrosales Zimbabwe | Silver | — |
| s8 | R&S Diesel Professionals | Silver | — |
| s9 | Scout Aerial Africa | Bronze | scoutaerialafrica.com |
| s10 | EcoCash | Bronze | — |

---

## Event Schedule

### Day 1 — Mining Sector Focus (TBC October 2026)

| Time | Session | Location | Type |
|---|---|---|---|
| 07:30 | Gates Open & Registration | Main Entrance | Logistics |
| 08:00 | Exhibition Opens — Mining Hall | Mining Section | Exhibition |
| 09:00 | Opening Keynote: The Future of Mining in Southern Africa | Main Stage | Keynote |
| 10:00 | Panel: Sustainable Mining Practices | Conference Tent | Panel |
| 11:30 | Equipment Live Demo — Heavy Machinery | Outdoor Demo Zone | Demo |
| 13:00 | Networking Lunch Break | Catering Area | Break |
| 14:00 | Session: Minerals Processing Technology | Conference Tent | Session |
| 15:00 | Sponsored Session: Digital Tools for Mine Management *(+ virtual webinar)* | Conference Tent | Sponsored |
| 16:30 | Day 1 Networking Sundowner | Exhibitor Lounge | Networking |
| 18:00 | Exhibition Closes — Day 1 | All Zones | — |

### Day 2 — Construction & Infrastructure (TBC October 2026)

| Time | Session | Location | Type |
|---|---|---|---|
| 07:30 | Gates Open | Main Entrance | Logistics |
| 08:00 | Exhibition Opens — Construction Hall | Construction Section | Exhibition |
| 09:30 | Keynote: Infrastructure Investment in Zimbabwe | Main Stage | Keynote |
| 11:00 | Live Demo: Concrete & Structural Solutions | Outdoor Demo Zone | Demo |
| 12:00 | Roundtable: Procurement Trends in Construction *(+ virtual)* | Conference Tent | Panel |
| 13:00 | Lunch Break | Catering Area | Break |
| 14:00 | Session: Health & Safety in Construction Environments | Conference Tent | Session |
| 15:30 | Exhibitor Speed Networking | Main Atrium | Networking |
| 18:00 | Exhibition Closes — Day 2 | All Zones | — |

### Day 3 — Suppliers, Solutions & Closing (TBC October 2026)

| Time | Session | Location | Type |
|---|---|---|---|
| 07:30 | Gates Open | Main Entrance | Logistics |
| 08:00 | Exhibition Opens | All Sections | Exhibition |
| 09:00 | Session: Supply Chain Challenges in Sub-Saharan Africa | Conference Tent | Session |
| 10:30 | Live Demo: Drill & Blast Equipment | Outdoor Demo Zone | Demo |
| 12:00 | Closing Keynote & Industry Awards Recognition *(+ virtual)* | Main Stage | Keynote |
| 13:00 | Lunch & Final Networking | Catering Area | Break |
| 15:00 | Exhibition Closes — MineCon 2026 | All Zones | — |

---

## FAQs

**Q: Is registration free for visitors?**  
A: General visitor access is free of charge. Some conference sessions may require pre-registration. Please confirm with the MineCon organising team.

**Q: Where is MineCon held?**  
A: MineCon 2026 will be held at Artfarm Grounds, Pomona, Harare, Zimbabwe. Ample parking is available on-site.

**Q: What are the exhibition opening hours?**  
A: The exhibition is open from 08:00 to 18:00 on all three days. Gates open at 07:30 for early access.

**Q: Can I book meetings with exhibitors in advance?**  
A: Yes. Use the Meetings section in this app to submit a meeting request to any exhibitor. They will confirm your slot.

**Q: Is there catering available on-site?**  
A: Yes, a catering and refreshment area is available throughout the event. Various food vendors will be on-site.

**Q: Are children allowed?**  
A: MineCon is a professional B2B exhibition. Children under 16 are not permitted in the exhibition halls unless accompanied by a responsible adult.

**Q: Is there parking at the venue?**  
A: Yes, dedicated parking is available at Artfarm Grounds. Security personnel will guide visitors. Shuttle services from key pick-up points may be available — check announcements.

**Q: How do I become an exhibitor?**  
A: Visit minecon.global to complete the exhibitor registration form. Different sponsorship tiers (Diamond, Gold, Chrome, Copper) are available with varying booth sizes and benefits.

**Q: What is the difference between exhibitor tiers?**  
A: **Diamond** — Largest floor space, prime Main Hall location, maximum visibility, home page featured listing, ad carousel slot, Diamond badge. **Gold** — Premium placement in Exhibition Hall, full booth, featured in digital magazine, lead export. **Chrome** — Standard booth in Suppliers Zone, directory listing, signage. **Copper** — Compact space in Solutions Zone, shared zones, entry-level package.

**Q: How do QR codes work at MineCon?**  
A: Each exhibitor has a unique booth QR code. Attendees scan it with the MineCon app to log their visit and access booth information. Exhibitors can also use the Visitor Scanner to scan attendee badge QR codes and log visitor contacts.

**Q: How do I upgrade my exhibitor tier?**  
A: Contact the MineCon organising team at info@minecon.global with subject "Booth Upgrade Enquiry". Upgrades from Copper → Chrome → Gold → Diamond are available.

**Q: Where can I see my meeting requests?**  
A: Attendees can see all their submitted meeting requests in the Attendee Dashboard under the Meetings tab, or on the main Meetings page. Exhibitors manage their incoming requests from the Exhibitor Portal home page.

**Q: How does the virtual exhibition work?**  
A: When the organizer enables the Virtual Exhibition, a banner appears on the attendee home screen allowing attendees to browse virtual booths and submit enquiries online. The organizer controls this feature from the Management Console dashboard.

**Q: What is the digital magazine?**  
A: The MineCon 2026 Exhibition Guide is a 15-page interactive digital publication accessible from the app. It includes editorial content, a site plan, exhibitor directory, and paid ad placements from advertisers including SANY Group, Elimobil, Jetmaster, Zambezi Gas & Coal, Zimtile, and Woodlot Timbers.

**Q: How do I access the Management Console?**  
A: Navigate to `/console` and log in with an organizer or marketing_partner account. Standard attendee and exhibitor credentials do not have console access.

**Q: Can I install the MineCon app?**  
A: Yes, MineCon is a Progressive Web App (PWA). On mobile, you can add it to your home screen for full app-like access including offline support. A prompt appears automatically after a few minutes of use.

---

## Event Rules

1. Professional business attire is recommended.
2. Photography of exhibitor booths requires permission from the exhibitor.
3. No canvassing or distribution of materials outside your assigned booth.
4. Vehicles and heavy equipment must be pre-approved for outdoor display zones.
5. All attendees must wear their visitor or exhibitor badge at all times.
6. The organisers reserve the right to remove any person behaving in an unsafe or inappropriate manner.
7. Smoking is only permitted in designated areas.

---

## Contact & Venue

| Detail | Value |
|---|---|
| Website | minecon.global |
| Email | info@minecon.global |
| Venue | Artfarm Grounds, Pomona, Harare, Zimbabwe |
| Parking | Dedicated on-site parking, entry via Pomona Road gate |
| Shuttle | From Avondale pick-up point (both days) — confirm via announcements |
| Wi-Fi | Network: MineCon2026 · Password: displayed at registration desk |
| Badge | Collect at registration desk before entering any exhibition hall. Photo ID required. Uncollected badges cancelled after Day 1. |

---

## Exhibitor Tier Perks Summary

| Feature | Copper | Chrome | Gold | Diamond |
|---|---|---|---|---|
| Floor space | Compact | Standard | Premium | Largest |
| Zone | Solutions Zone | Suppliers Zone | Exhibition Hall | Main Hall |
| Directory listing | ✅ | ✅ | ✅ | ✅ |
| Booth page | — | ✅ | ✅ | ✅ |
| Directory boost | — | ✅ | ✅ | ✅ |
| Priority meeting placement | — | ✅ | ✅ | ✅ |
| Lead export (CSV) | — | — | ✅ | ✅ |
| Featured in digital magazine | — | — | ✅ | ✅ |
| Meeting request boost | — | — | ✅ | ✅ |
| Ad banner eligibility | — | — | ✅ | ✅ |
| Home page featured listing | — | — | — | ✅ |
| Ad carousel slot | — | — | — | ✅ |
| Diamond badge | — | — | — | ✅ |

---

## QR Code Formats

The app uses structured JSON payloads in QR codes:

| Type | Payload | Used by |
|---|---|---|
| Exhibitor booth QR | `{ t: "exhibitor", id, n, b, s, ev: "mc26" }` | Printed at booth, scanned by attendees |
| Attendee ticket | `{ t: "ticket", ev: "mc26", rid, tok }` | Registration confirmation, scanned at gate |
| Visitor badge | `{ t: "visitor", ev: "mc26", id, n, e }` | Attendee badge, scanned by exhibitors |

- `t` = type, `id` = exhibitor/attendee ID, `n` = name, `b` = booth, `s` = section, `ev` = event code, `rid` = registration ID, `tok` = security token, `e` = email

---

## Data Entities Reference

| Entity | Storage key | Description |
|---|---|---|
| Exhibitor | `entities_exhibitors` | All exhibitor records including tier, booth, contact, logo, description |
| User | `entities_users` | All portal users with role assignments |
| Registration | `entities_registrations` | Event registrations with ticket type, status, check-in data |
| Announcement | `entities_announcements` | Live announcements; `pinned: true` shown prominently; `sponsored: true` shows sponsor name |
| MeetingRequest | `entities_meetingrequests` | Meeting bookings between attendees and exhibitors |
| Sponsor | `entities_sponsors` | Sponsor profiles with tier, description, logo, website |
| VirtualEnquiry | `entities_virtualenquiries` | Enquiries submitted via virtual exhibition feature |
| EngagementEvent | `entities_engagementevents` | All tracked interactions — profile views, QR scans, ad clicks, etc. |
| AttendeeNote | `entities_attendeenotes` | Attendee personal notes and saved/favourited items |
| AdSlot | `entities_adslots` | Home screen carousel ad slots managed from Marketing Hub |
| AppSettings | `entities_appsettings` | App-wide settings (e.g. `virtualExhibitionOpen`) |
| MagazinePage | `entities_magazinepages` | Magazine page configs (image URLs, click URLs per page number) |
| GuidePage | `entities_guidepages` | Exhibition guide ad page overrides (image + click URL) |
