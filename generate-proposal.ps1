# Mediaserv x MineCon 2026 - Proposal Word Document Generator

$outputPath = [System.IO.Path]::Combine($env:USERPROFILE, "Desktop", "Mediaserv x MineCon 2026 - Digital Platform Proposal.docx")

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Add()
$doc.PageSetup.LeftMargin = $word.InchesToPoints(1)
$doc.PageSetup.RightMargin = $word.InchesToPoints(1)
$doc.PageSetup.TopMargin = $word.InchesToPoints(1)
$doc.PageSetup.BottomMargin = $word.InchesToPoints(1)

$sel = $word.Selection

# TITLE BLOCK

$sel.Style = $doc.Styles("Title")
$sel.TypeText("Mediaserv x MineCon 2026")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Subtitle")
$sel.TypeText("The Digital Platform")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Subtitle")
$sel.TypeText("Section 2 of 3 -- Partnership Proposal")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("Prepared by: Mediaserv   |   For: MineCon Organising Team   |   June 2026")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.Font.Italic = $true
$sel.TypeText("Section 1 covered the print publication. Section 3 covers pricing and packages. This section introduces the MineCon 2026 digital platform that Mediaserv has built as part of this all-inclusive partnership.")
$sel.Font.Italic = $false

# SECTION 1 -- INTRO

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Heading 1")
$sel.TypeText("You Are Looking at This for the First Time. Here Is What It Is.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("Mediaserv has designed and built a complete digital home for MineCon 2026 -- a mobile app that every attendee, every exhibitor, and your organising team can use, all from the same connected system.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("Think of it as the print guide coming to life.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("The Exhibition Guide you have always published gets handed out at the gate. People flip through it once, then it sits in a bag. What we are showing you today is what happens when that same guide -- and everything around it -- becomes something people interact with every day, on their phones, for weeks before the event and long after they go home.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("This is not a replacement for print. Print has reach, credibility, and permanence. What the digital platform adds is insight -- so you know exactly what is working, who is paying attention, and what value your sponsors and exhibitors are actually receiving.")

# SECTION 2 -- THREE AUDIENCES

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Heading 1")
$sel.TypeText("The Three Audiences. The Three Experiences.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("The platform was built around the three groups who make MineCon work.")

# ATTENDEE

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Heading 2")
$sel.TypeText("For the Attendee -- Their Pocket Guide to the Show")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("Every visitor to MineCon gets access to an app on their phone. No download required. It just opens in their browser, and they can save it to their home screen like any other app.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Heading 3")
$sel.TypeText("What it does for them:")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Bullet")
$sel.TypeText("Find who they came to see. The full directory of 80+ exhibitors -- searchable and filterable, with booth numbers and zone maps. No more hunting down a company on a paper floor plan.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Bullet")
$sel.TypeText("Book meetings before they arrive. Visitors can request a meeting with any exhibitor right from the app, choose a date and time, and get a confirmed slot. They walk in with appointments, not hopes.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Bullet")
$sel.TypeText("Read the Exhibition Guide on their phone. The same publication you are already printing -- but interactive. Product carousels. Embedded videos. Links that take them straight to an exhibitor's website. Available the day the promotion goes live, not just at the gate.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Bullet")
$sel.TypeText("Stay informed during the show. Live announcements, session reminders, and sponsor updates pushed directly into the app. If a keynote time changes, every attendee knows within minutes.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Bullet")
$sel.TypeText("Ask the AI assistant anything. Attendees type a question like 'Who sells excavator parts at this show?' and get an instant, accurate answer. More on this below.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.Font.Bold = $true
$sel.TypeText("The bottom line for the attendee: ")
$sel.Font.Bold = $false
$sel.TypeText("They stop guessing and start planning. The event becomes less overwhelming and more productive from the moment they register.")

# EXHIBITOR

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Heading 2")
$sel.TypeText("For the Exhibitor -- Their Booth, Measured")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("Every exhibiting company gets their own secure portal. They log in and see everything happening around their booth.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Heading 3")
$sel.TypeText("What they can do:")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Bullet")
$sel.TypeText("See who is looking at them. Every time an attendee views their booth profile, it is counted and shown on a dashboard. They can see how many people engaged with their listing, where those people came from, and when.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Bullet")
$sel.TypeText("Manage meeting requests. Incoming meeting requests from attendees land in their portal. They confirm or decline with one click. No emails to chase, no phone tag.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Bullet")
$sel.TypeText("Scan visitor badges. Exhibitors can use the app to scan an attendee's QR badge and instantly capture that visitor as a lead -- with their name and contact details saved automatically.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Bullet")
$sel.TypeText("See their ad performance. If they have a digital ad running -- in the magazine or on the home screen -- they can see exactly how many people clicked it.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Bullet")
$sel.TypeText("Export their leads. Gold and Diamond tier exhibitors can download all of their meeting requests and visitor contacts as a spreadsheet after the show.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.Font.Bold = $true
$sel.TypeText("The bottom line for the exhibitor: ")
$sel.Font.Bold = $false
$sel.TypeText("For the first time, they can answer the question 'Was it worth it?' with actual numbers, not gut feel. That is a conversation-changing moment for exhibitor retention and tier upgrades.")

# ORGANISER

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Heading 2")
$sel.TypeText("For the Organiser -- The Whole Show in One Screen")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("Your team gets a management console that shows everything happening across the event in real time.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Heading 3")
$sel.TypeText("What you can see and do:")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Bullet")
$sel.TypeText("At a glance: Total registrations. Meeting requests. Announcements. Visitor check-ins at the gate.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Bullet")
$sel.TypeText("Gate management: Scan attendee QR tickets at the entrance. The system tells you instantly whether a ticket is valid, already used, or cancelled. Manual lookup by name or company if needed.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Bullet")
$sel.TypeText("Communications: Push a live announcement to every attendee's app in seconds. Ideal for schedule changes, weather notices, or opening ceremony reminders.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Bullet")
$sel.TypeText("Data quality checks: The console flags issues automatically -- an exhibitor missing their logo, a booth number listed twice, a description never filled in. You catch these before the show, not during it.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Bullet")
$sel.TypeText("Registrations: Track who has registered by type -- attendees, exhibitors, sponsors, speakers, VIPs. Confirm or manage their status from one screen.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.Font.Bold = $true
$sel.TypeText("The bottom line for the organiser: ")
$sel.Font.Bold = $false
$sel.TypeText("You stop running the event on WhatsApp and spreadsheets. Everything is in one place, visible to the right people, and updated in real time.")

# SECTION 3 -- AI AGENT

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Heading 1")
$sel.TypeText("The AI Assistant -- Something No Other African Mining Show Has")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("We have built an AI assistant directly into the MineCon platform.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("Here is the simplest way to explain it: imagine an incredibly knowledgeable event staff member who is available 24 hours a day, never gets tired, never gives a wrong booth number, and can answer hundreds of questions simultaneously.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.Font.Italic = $true
$sel.TypeText("An attendee types: 'I am looking for a supplier of drilling equipment in the Suppliers Zone.'")
$sel.Font.Italic = $false
$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("The assistant replies instantly with the matching companies, their booth numbers, and a link to request a meeting.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.Font.Italic = $true
$sel.TypeText("An attendee types: 'What time does the construction session start on Day 2?'")
$sel.Font.Italic = $false
$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("The assistant gives them the exact time and location.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.Font.Italic = $true
$sel.TypeText("A visitor who has not yet registered types: 'I want to attend MineCon. How do I sign up?'")
$sel.Font.Italic = $false
$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("The assistant walks them through it.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Heading 2")
$sel.TypeText("What the AI assistant can do right now:")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Bullet")
$sel.TypeText("Answer questions about any of the 80+ exhibitors by name, category, or product")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Bullet")
$sel.TypeText("Help attendees book a meeting with an exhibitor directly through the conversation")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Bullet")
$sel.TypeText("Tell attendees the current status of a meeting they already requested")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Bullet")
$sel.TypeText("Look up a registration by email address")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Bullet")
$sel.TypeText("Deliver the latest event announcements and schedule changes in plain language")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Bullet")
$sel.TypeText("Accept product enquiries on behalf of exhibitors -- even outside event hours")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("This is not a chatbot that gives scripted answers from a FAQ. It is a live system connected to real event data -- exhibitor profiles, meeting requests, registrations, announcements -- that updates in real time.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Heading 3")
$sel.TypeText("What this means for each stakeholder:")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Bullet")
$sel.TypeText("For the organiser: Dramatically reduces the volume of repetitive queries your team handles by phone and at the information desk.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Bullet")
$sel.TypeText("For exhibitors: Enquiries come in even when their stand is closed -- every night of the event and in the weeks before.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Bullet")
$sel.TypeText("For attendees: Navigating 80+ exhibitors across four zones feels simple instead of overwhelming.")

# SECTION 4 -- WHAT MEDIASERV MANAGES

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Heading 1")
$sel.TypeText("What Mediaserv Manages Within This Platform")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("As your all-inclusive media partner, Mediaserv does not just build this and hand it over. We operate the commercial layer of the platform throughout the event.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Heading 2")
$sel.TypeText("The Digital Magazine")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("We manage the ad pages inside the interactive Exhibition Guide -- the same advertisers you know from print, now with pages that can include videos and product galleries, with click data reported back to every advertiser after the show.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Heading 2")
$sel.TypeText("The Home Screen Advertising Carousel")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("The first thing every attendee sees when they open the app is a rotating set of branded banners. Mediaserv sells, manages, and updates these slots -- turning them on and off, changing creative, and tracking performance. No developer involvement needed.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Heading 2")
$sel.TypeText("Sponsored Announcements")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("Advertisers who want to put a message directly in front of every attendee can do so through the announcement feed, clearly labelled as sponsored. Mediaserv writes, schedules, and publishes these on their behalf. Use cases include product launch announcements, live demo countdown notices, prize draw calls-to-action, and show-day offers.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Heading 2")
$sel.TypeText("Performance Reporting")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("After the show, every advertiser receives a report from Mediaserv showing exactly what their investment produced: how many people saw their ad, clicked it, watched their video, and requested a meeting. Not estimates -- actual numbers from the platform.")

# SECTION 5 -- WHY THIS CHANGES THINGS

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Heading 1")
$sel.TypeText("Why This Changes the Conversation With Your Exhibitors")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("Before this platform, an exhibitor's main question after MineCon was: 'We are not sure if it was worth the booth fee.'")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("That conversation is hard to have when you cannot show them anything concrete.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("With the platform, you can show a Diamond exhibitor that their profile was viewed 340 times, their home screen ad was clicked 87 times, they received 12 meeting requests of which 9 were confirmed, and their magazine carousel was swiped through 210 times.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.Font.Bold = $true
$sel.TypeText("That is not a feeling. That is a result. And results renew sponsors and upgrade tier commitments.")
$sel.Font.Bold = $false

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("The platform makes the value of exhibiting at MineCon visible -- for the first time. That is the most important commercial benefit of this entire partnership.")

# COMPARISON TABLE

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Heading 1")
$sel.TypeText("Value at a Glance")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("Print alone vs. the Mediaserv all-inclusive package:")
$sel.TypeParagraph()

$table = $doc.Tables.Add($sel.Range, 8, 3)
$table.Style = "Table Grid"
$table.Borders.Enable = $true
$table.PreferredWidthType = 2  # wdPreferredWidthPercent
$table.PreferredWidth = 100

$table.Cell(1,1).Range.Text = "What Matters"
$table.Cell(1,2).Range.Text = "Print Alone"
$table.Cell(1,3).Range.Text = "Print + Digital Platform"

for ($c = 1; $c -le 3; $c++) {
    $table.Cell(1,$c).Range.Font.Bold = $true
}

$rows = @(
    @("Reach", "Fixed print run, handed out at the gate", "Unlimited -- accessed on any phone from Day 1 of promotion"),
    @("Shelf life", "3 days on the floor, then archived", "Persistent -- attendees return to the app long after the event"),
    @("Ad trackability", "None -- no click or view data", "Every page view, click, video play, and swipe is logged"),
    @("Proof of performance", "We were in the programme", "CSV reports: clicks, views, video completions, by advertiser"),
    @("Attendee engagement", "Passive reading", "Active: tap, bookmark, book a meeting -- all from the same screen"),
    @("Lead generation", "Business cards and manual logging", "Structured meeting requests, QR badge scans, contact capture"),
    @("Event communications", "Static -- printed before the event", "Live -- push updates to every attendee in seconds")
)

for ($r = 0; $r -lt $rows.Count; $r++) {
    $row = $r + 2
    $table.Cell($row,1).Range.Text = $rows[$r][0]
    $table.Cell($row,2).Range.Text = $rows[$r][1]
    $table.Cell($row,3).Range.Text = $rows[$r][2]
}

# Move past the table
$rng = $doc.Content
$rng.Collapse(0)  # wdCollapseEnd
$sel.SetRange($rng.Start, $rng.End)
$sel.Collapse(0)
$sel.TypeParagraph()

# SECTION 6 -- NEXT STEPS

$sel.Style = $doc.Styles("Heading 1")
$sel.TypeText("What Happens Next")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("Today's walkthrough of the platform is a live demonstration using real MineCon 2026 data -- the actual exhibitor directory, the actual magazine structure, and the actual dashboards that your team and Mediaserv would use together.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.Font.Bold = $true
$sel.TypeText("We are not showing you a concept. We are showing you the finished product.")
$sel.Font.Bold = $false

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("The conversation we would like to have after this presentation is simple: which parts of this are most valuable to you, and how do we package them alongside the print publication into a single, clean partnership agreement.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Heading 2")
$sel.TypeText("Suggested next steps:")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Number")
$sel.TypeText("Live platform walkthrough -- we demo the organiser console, the attendee app, and the exhibitor portal together")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Number")
$sel.TypeText("Ad inventory discussion -- agree on magazine page assignments, carousel slots, and sponsored announcement schedule")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Number")
$sel.TypeText("Advertiser briefing -- Mediaserv presents the digital opportunity to existing print advertisers")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Number")
$sel.TypeText("Content deadlines -- align magazine ad image delivery, carousel creative, and sponsored post copy schedule")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("List Number")
$sel.TypeText("Reporting cadence -- agree on mid-event and post-event report format and delivery dates")

# FOOTER

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("_______________________________________________")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.Font.Italic = $true
$sel.TypeText("This document forms Section 2 of the Mediaserv x MineCon 2026 Partnership Proposal.")

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("Section 1: Print Publication   |   Section 2: Digital Platform   |   Section 3: Pricing and Packages")
$sel.Font.Italic = $false

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.Font.Bold = $true
$sel.TypeText("Mediaserv -- Connecting Brands to Industry")
$sel.Font.Bold = $false

$sel.TypeParagraph()
$sel.Style = $doc.Styles("Normal")
$sel.TypeText("Partnership enquiries: info@minecon.global")

# SAVE

$doc.SaveAs([ref]$outputPath, [ref]16)
$doc.Close()
$word.Quit()

Write-Output "Done. Saved to: $outputPath"
