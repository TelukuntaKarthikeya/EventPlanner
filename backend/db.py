import sqlite3
import json
import os
import uuid
from typing import Dict, Any, List, Optional
from models.schemas import EventModel, BudgetItemModel, TaskModel, StressTestScenario, VendorModel, StakeholderModel, IncidentModel

DB_PATH = os.path.join(os.path.dirname(__file__), "planora.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        occasion TEXT NOT NULL,
        event_type TEXT NOT NULL,
        date_range TEXT NOT NULL,
        location TEXT NOT NULL,
        guest_count INTEGER NOT NULL,
        total_budget REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'USD',
        contingency_allocated REAL NOT NULL DEFAULT 0.0,
        contingency_committed REAL NOT NULL DEFAULT 0.0,
        atmosphere TEXT,
        theme TEXT,
        visual_style TEXT,
        color_palette TEXT,
        protected_priorities TEXT,
        cultural_traditions TEXT,
        accessibility_requirements TEXT,
        status TEXT NOT NULL DEFAULT 'Planning',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS budget_items (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        category TEXT NOT NULL,
        item_name TEXT NOT NULL,
        amount REAL NOT NULL,
        confirmation_status TEXT NOT NULL DEFAULT 'estimated',
        basis TEXT,
        is_fixed INTEGER NOT NULL DEFAULT 0,
        is_adjustable INTEGER NOT NULL DEFAULT 1,
        is_optional INTEGER NOT NULL DEFAULT 0,
        paid_amount REAL NOT NULL DEFAULT 0.0,
        payment_status TEXT NOT NULL DEFAULT 'unpaid',
        notes TEXT,
        FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        deadline TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'Medium',
        owner TEXT DEFAULT 'Event Host',
        dependencies TEXT,
        status TEXT NOT NULL DEFAULT 'Not Started',
        estimated_cost REAL DEFAULT 0.0,
        contingency_action TEXT,
        category TEXT DEFAULT 'General',
        FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS stress_tests (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        scenario_name TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'Medium',
        likelihood TEXT NOT NULL DEFAULT 'Medium',
        first_failure TEXT NOT NULL,
        affected_items TEXT,
        invalidated_assumptions TEXT,
        immediate_response TEXT NOT NULL,
        backup_plan TEXT NOT NULL,
        financial_impact REAL DEFAULT 0.0,
        required_approvals TEXT,
        status TEXT NOT NULL DEFAULT 'Identified',
        FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vendors (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        contact_info TEXT,
        quote_amount REAL DEFAULT 0.0,
        deliverables TEXT,
        terms TEXT,
        cancellation_policy TEXT,
        fit_score INTEGER DEFAULT 85,
        status TEXT NOT NULL DEFAULT 'Quote Received',
        notes TEXT,
        FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS stakeholders (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        stated_priorities TEXT,
        budget_opinion TEXT,
        guest_count_opinion INTEGER,
        notes TEXT,
        FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        title TEXT NOT NULL,
        reported_time TEXT NOT NULL,
        affected_tasks TEXT,
        revised_run_of_show TEXT,
        mitigation_steps TEXT,
        cost_impact REAL DEFAULT 0.0,
        broadcast_message TEXT,
        status TEXT NOT NULL DEFAULT 'Active',
        FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        structured_payload TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE
    )
    """)

    conn.commit()

    # Check if events table has rows; if not, seed realistic events
    cursor.execute("SELECT COUNT(*) FROM events")
    if cursor.fetchone()[0] == 0:
        seed_database(conn)

    conn.close()

def seed_database(conn):
    cursor = conn.cursor()

    # 1. Royal Heritage Indian Wedding
    e1_id = "event-wedding-01"
    cursor.execute("""
    INSERT INTO events (
        id, name, occasion, event_type, date_range, location, guest_count,
        total_budget, currency, contingency_allocated, contingency_committed,
        atmosphere, theme, visual_style, color_palette, protected_priorities,
        cultural_traditions, accessibility_requirements, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        e1_id,
        "The Royal Heritage Wedding: Ananya & Kabir",
        "3-Day Destination Wedding",
        "wedding",
        "Nov 14-16, 2026",
        "Udaipur Heritage Fort & Lake Palace, Rajasthan",
        280,
        3500000.0,
        "INR",
        350000.0,
        50000.0,
        "Regal, warm, vibrant, multi-generational celebration of heritage",
        "Rajputana Royal with Contemporary Elegance",
        "Marigold florals, antique brass lamps, velvet drapery, and candlelit courtyard",
        json.dumps(["#D97706", "#991B1B", "#F59E0B", "#1E3A8A", "#FEF3C7"]),
        json.dumps(["Gourmet Regional Catering (Strict Jain + Pure Veg + North/South Live Counters)", "Candid Photography & Cinematography", "Acoustic & Classical Sangeet Troupe"]),
        json.dumps(["Haldi ceremony with organic turmeric", "Mehendi floral canopy", "Sangeet choreography sequence", "Vedic Muhurtham pheras at sunset", "Baraat procession with brass band"]),
        json.dumps(["Golf carts for elderly relatives across courtyard", "Wheelchair ramps to Mandap raised platform", "Allergen-labeled live food counters", "Dedicated quiet recovery lounge for infants and seniors"]),
        "Planning"
    ))

    # Wedding Budget
    wedding_budget = [
        ("Venue", "Heritage Fort Courtyard & Palace Lawns (3 Days)", 1100000.0, "confirmed", "Signed venue contract with heritage surcharge", 1, 0, 0, 400000.0, "deposit_paid", "Includes guest suites access"),
        ("Food and beverages", "Royal Banquet Catering (3 Days, 5 Meals, 280 pax)", 850000.0, "quoted", "Quote from Mewar Culinary Guild (₹3,035/head total)", 0, 1, 0, 200000.0, "deposit_paid", "Includes Jain, vegan & regional dessert stations"),
        ("Decoration and lighting", "Sangeet Lighting, Mandap Florals & Courtyard Lanterns", 420000.0, "quoted", "Bespoke florist estimate with organic marigold & brassware", 0, 1, 0, 0.0, "unpaid", "Can trim courtyard peripheral drapery by ₹60k if needed"),
        ("Photography and videography", "Artisan Wedding Studio (5-crew 4K Cinematic & Drone)", 320000.0, "confirmed", "Signed vendor agreement (Protected priority)", 1, 0, 0, 100000.0, "deposit_paid", "Protected by couple priority"),
        ("Entertainment", "Rajasthani Folk Artists, Sangeet Live Band & DJ", 220000.0, "estimated", "Local cultural troupe + sound engineer quotation", 0, 1, 0, 0.0, "unpaid", "Sound license permit required by 10 PM"),
        ("Clothing and ceremony-related costs", "Bridal Lehengas, Groom Sherwani & Turban Specialists", 180000.0, "estimated", "Tailor & boutique quotes", 0, 1, 0, 50000.0, "deposit_paid", "Fabric purchased"),
        ("Invitations and guest communication", "Embossed Box Invitations & Digital WhatsApp Concierge", 45000.0, "confirmed", "Print shop invoice + WhatsApp API service", 1, 0, 0, 45000.0, "fully_paid", "Printed & dispatched"),
        ("Transport and accommodation", "Airport Shuttles (Udaipur to Fort) & Golf Carts", 95000.0, "quoted", "Rajasthan Tour Cabs fleet package", 0, 1, 0, 0.0, "unpaid", "4 shuttle coaches booked for arrivals"),
        ("Accessibility and guest facilities", "Temporary Wheelchair Ramps, Shaded Lounges & Water Coolers", 35000.0, "estimated", "Event safety & accessibility vendor", 0, 1, 0, 0.0, "unpaid", "Essential for grandparents"),
        ("Taxes, service fees, and other applicable charges", "Municipal Sound License & Police Baraat Permit", 25000.0, "quoted", "City Corporation fee schedule", 1, 0, 0, 0.0, "unpaid", "Mandatory legal requirement"),
        ("Contingency reserve", "General Contingency Pool (10% allocation)", 350000.0, "confirmed", "Budget safety reserve — Not discretionary funds", 1, 0, 0, 0.0, "unpaid", "₹50k already reserved for unexpected weather tenting")
    ]
    for cat, item, amt, conf, basis, fix, adj, opt, paid, pay_stat, notes in wedding_budget:
        cursor.execute("""
        INSERT INTO budget_items (id, event_id, category, item_name, amount, confirmation_status, basis, is_fixed, is_adjustable, is_optional, paid_amount, payment_status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (str(uuid.uuid4()), e1_id, cat, item, amt, conf, basis, fix, adj, opt, paid, pay_stat, notes))

    # Wedding Tasks
    wedding_tasks = [
        ("T1", e1_id, "Finalize Vedic Officiant (Pandit-ji) Muhurtham Timing", "Confirm exact auspicious muhurtham hours for Sunset Pheras with family astrologer", "2026-09-01", "Critical", "Kabir & Parents", json.dumps([]), "Completed", 15000.0, "Consult backup family priest in Jaipur", "Ceremony"),
        ("T2", e1_id, "Confirm Venue Master Contract & Sound Curfew Hours", "Sign agreement and secure Udaipur municipal sound permissions beyond 10:00 PM", "2026-09-15", "Critical", "Event Host", json.dumps(["T1"]), "Completed", 1100000.0, "Move after-party inside soundproof banquet hall", "Venue"),
        ("T3", e1_id, "Menu Tasting & Dietary Sign-off (Jain & Vegan protocols)", "Executive tasting with Mewar Culinary Guild; certify dedicated cookware for Jain meals", "2026-10-01", "High", "Ananya & Mother", json.dumps(["T2"]), "In Progress", 0.0, "Deploy dedicated auxiliary kitchen trailer", "Catering"),
        ("T4", e1_id, "Mandap Floral Engineering & Weatherproofing Sign-off", "Inspect raised platform structure and test overhead transparent rain canopy for open courtyard", "2026-10-15", "High", "Decorator Lead", json.dumps(["T2"]), "In Progress", 420000.0, "Deploy pre-rigged motorized waterproof pagoda canopy", "Decor"),
        ("T5", e1_id, "Guest Airport Shuttle Dispatch Roster", "Compile all 280 guest arrival flight details into 4-wave luxury coach schedule", "2026-11-01", "Medium", "Logistics Coordinator", json.dumps(["T3"]), "Not Started", 95000.0, "Add on-call local taxis at terminal", "Logistics"),
        ("T6", e1_id, "Accessibility Walkthrough with Fort Facilities Lead", "Ensure continuous ramp slope < 1:12 to Mandap and station 3 golf buggies at reception gate", "2026-11-05", "High", "Accessibility Lead", json.dumps(["T4"]), "Not Started", 35000.0, "Portable aluminum non-slip ramp rental", "Accessibility"),
        ("T7", e1_id, "Final Sangeet Sound & Lighting Rehearsal", "Dry run audio balance, wireless mics for speeches, and video projection mapping", "2026-11-13", "Medium", "AV Tech Lead", json.dumps(["T4"]), "Not Started", 220000.0, "Backup silent generator on standby", "Entertainment"),
        ("T8", e1_id, "Day 3 Sunset Muhurtham Pheras Execution", "Ceremony begins sharp at 17:15 to catch Golden Hour lake lighting for photography", "2026-11-16", "Critical", "Lead Coordinator", json.dumps(["T6", "T7"]), "Not Started", 0.0, "Adjust ceremony pace if bridal entry delayed", "Ceremony")
    ]
    for tid, eid, name, desc, dline, prio, own, dep, stat, cost, cont, cat in wedding_tasks:
        cursor.execute("""
        INSERT INTO tasks (id, event_id, name, description, deadline, priority, owner, dependencies, status, estimated_cost, contingency_action, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (tid, eid, name, desc, dline, prio, own, dep, stat, cost, cont, cat))

    # Wedding Stress-Test Scenarios (Red Team)
    wedding_stress = [
        (str(uuid.uuid4()), e1_id, "Sudden Monsoon Storm during Outdoor Sangeet", "High", "Medium",
         "Outdoor courtyard lawn electrical equipment & dance floor become hazardous; marigold canopy soaked",
         json.dumps(["Decor & Stage", "AV Lighting", "Dinner Buffet", "Guest Footwear"]),
         json.dumps(["Zero rainfall assumed in mid-November", "Open-air lawn is usable all evening"]),
         "Immediately activate motorized transparent courtyard awning; switch audio feeds to weather-rated interior speaker zone.",
         "Shift Sangeet performances seamlessly into the Fort Grand Darbar Hall with pre-rigged lighting backup.",
         65000.0, json.dumps(["Event Host", "Venue Manager"]), "Mitigated"),
        (str(uuid.uuid4()), e1_id, "35 Unregistered Extended Relatives Arrive on Day 2", "Medium", "High",
         "Table seating shortage at Sangeet dinner; insufficient welcome gifts and shuttle seats",
         json.dumps(["Catering count", "Table covers", "Local transport", "Gift boxes"]),
         json.dumps(["RSVP count was strictly frozen at 280"]),
         "Instruct caterer to initiate reserve 15% buffet buffer (+40 pax); deploy 3 auxiliary 10-seater tables in arcade.",
         "Activate on-demand local Rajasthan cab fleet on retainer; order digital QR gift vouchers for overflow.",
         42000.0, json.dumps(["Couple", "Head of Catering"]), "Mitigated"),
        (str(uuid.uuid4()), e1_id, "Lead Candid Photographer Tests Positive / Cannot Travel", "High", "Low",
         "Artisan Wedding Studio principal shooter missing for Day 1 Haldi and Mehendi rituals",
         json.dumps(["Photography schedule", "Cinematic highlight reel", "Drone licensing"]),
         json.dumps(["Primary shooter is available on all 3 consecutive dates"]),
         "Activate contract clause 9.2: Studio immediately dispatches Tier-1 vetted senior partner shooter based in Jaipur.",
         "Pre-brief replacement shooter with the exact shot list, family tree portraits, and sunset angle guidelines.",
         15000.0, json.dumps(["Couple Approval Required"]), "Mitigated")
    ]
    for sid, eid, sname, sev, like, ffail, aff, inv, imm, back, cost, apps, stat in wedding_stress:
        cursor.execute("""
        INSERT INTO stress_tests (id, event_id, scenario_name, severity, likelihood, first_failure, affected_items, invalidated_assumptions, immediate_response, backup_plan, financial_impact, required_approvals, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (sid, eid, sname, sev, like, ffail, aff, inv, imm, back, cost, apps, stat))

    # Wedding Vendors
    wedding_vendors = [
        (str(uuid.uuid4()), e1_id, "Venue", "Udaipur Heritage Fort Trust", "+91 294 242 0001", 1100000.0, "Exclusive 3-day access to 2 courtyards, banquet hall, and 12 heritage suites", "50% deposit paid, remaining 10 days before event. Strict sound curfew at 22:00 outside.", "Non-refundable deposit after Sep 1; 80% credit for rescheduled date within 6 months.", 96, "Contracted", "Heritage certified, ramp accessible on ground floor"),
        (str(uuid.uuid4()), e1_id, "Food and beverages", "Mewar Culinary Guild", "+91 982 901 2233", 850000.0, "Complete 3-day royal banqueting: 5 major spreads, live stations, separate Jain kitchen", "30% advance, balance 48 hrs post-event based on audited plate count.", "Cancellation < 14 days forfeits food procurement advance.", 94, "Negotiating", "Strict hygiene audits; requested +10% complimentary buffer"),
        (str(uuid.uuid4()), e1_id, "Photography and videography", "Artisan Wedding Studio", "+91 941 405 6677", 320000.0, "5-crew documentary team, 4K film, raw reels, aerial drone permit, online live stream", "40% deposit paid, 40% on event day, 20% on album delivery.", "Replacement shooter clause included at no surcharge in case of illness.", 98, "Contracted", "Highest priority for couple"),
        (str(uuid.uuid4()), e1_id, "Decoration and lighting", "Royal Mandap Artistry & Florals", "+91 978 450 1122", 420000.0, "Traditional Rajasthani marigold and brass decor, sunset mandap, fairylight canopy", "30% deposit, balance on setup day morning.", "50% refund if cancelled 30 days prior.", 88, "Quote Received", "Exploring trade-off to trim non-essential perimeter drapery by ₹60k")
    ]
    for vid, eid, cat, vname, cont, amt, deliv, term, canc, fit, stat, note in wedding_vendors:
        cursor.execute("""
        INSERT INTO vendors (id, event_id, category, name, contact_info, quote_amount, deliverables, terms, cancellation_policy, fit_score, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (vid, eid, cat, vname, cont, amt, deliv, term, canc, fit, stat, note))

    # Wedding Stakeholders
    wedding_stakeholders = [
        (str(uuid.uuid4()), e1_id, "Ananya (Bride)", "Core Decision Maker", json.dumps(["Aesthetic photography", "Minimalist sunset mandap", "Stress-free guest experience", "Eco-friendly natural florals"]), "Firmly adhere to ₹35L ceiling", 250, "Wants to ensure elderly grandparents are comfortable in golf carts"),
        (str(uuid.uuid4()), e1_id, "Kabir (Groom)", "Core Decision Maker", json.dumps(["Gourmet culinary experience", "High energy Sangeet sound & DJ", "Seamless airport logistics"]), "Okay to reallocate from floral trims to better sound system", 280, "Values rapid communication via WhatsApp concierge"),
        (str(uuid.uuid4()), e1_id, "Mr. & Mrs. Sharma (Bride's Parents)", "Ceremony & Family Host", json.dumps(["Strict Vedic muhurtham alignment", "Authentic Jain food counter with zero root veggies", "Traditional welcome rituals"]), "Cautious about contingency reserve; insist on 10% cash buffer", 300, "Wants dignified hospitality for extended maternal family")
    ]
    for stid, eid, sname, srole, sprio, sbud, sguest, snote in wedding_stakeholders:
        cursor.execute("""
        INSERT INTO stakeholders (id, event_id, name, role, stated_priorities, budget_opinion, guest_count_opinion, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (stid, eid, sname, srole, sprio, sbud, sguest, snote))

    # 2. Stanford Reunion Event
    e2_id = "event-reunion-02"
    cursor.execute("""
    INSERT INTO events (
        id, name, occasion, event_type, date_range, location, guest_count,
        total_budget, currency, contingency_allocated, contingency_committed,
        atmosphere, theme, visual_style, color_palette, protected_priorities,
        cultural_traditions, accessibility_requirements, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        e2_id,
        "Stanford Class of 2016 — 10 Year Tech & Chill Reunion",
        "10-Year College Reunion & Mixer",
        "reunion",
        "Oct 10, 2026",
        "Half Moon Bay Oceanfront Bluff Lodge, California",
        140,
        48000.0,
        "USD",
        4500.0,
        0.0,
        "Cozy, nostalgic, slightly chaotic, vibrant like a college quad revival",
        "Pacific Coast Campfire & 2016 Throwback",
        "Warm festoon lights, reclaimed wood firepits, polaroid photo walls, coastal blankets",
        json.dumps(["#1E293B", "#0D9488", "#F59E0B", "#DC2626", "#F8FAFC"]),
        json.dumps(["Open Craft Beer & Napa Wine Bar", "Retro 90s/2010s Live Cover Band", "Food Truck Row (Artisanal Tacos + Wood-fired Pizza)"]),
        json.dumps(["Campus memory trivia championship", "Sunset toast with alumni keynote", "Late-night acoustic campfire circle"]),
        json.dumps(["ADA accessible pathways to ocean bluff", "Non-alcoholic craft beverage bar", "Allergen-separated pizza oven for celiac guests"]),
        "Planning"
    ))

    # Reunion budget
    reunion_budget = [
        ("Venue", "Half Moon Bay Ocean Bluff Lodge & Firepits", 16000.0, "confirmed", "Signed lodge rental with bluff patio access", 1, 0, 0, 8000.0, "deposit_paid", "Includes firepit wood and ocean heaters"),
        ("Food and beverages", "Dual Food Truck Row (Baja Tacos & Neapolitan Pizza) + Open Bar", 14500.0, "quoted", "Truck minimums + insured mobile bar bartending team", 0, 1, 0, 3000.0, "deposit_paid", "Protected priority: unlimited craft beer & wine"),
        ("Entertainment", "The Quad Throwbacks (Live 5-Piece 2010s Indie Cover Band)", 4800.0, "confirmed", "Contract signed for 3-hour evening set", 1, 0, 0, 2400.0, "deposit_paid", "Must wrap amplifications by 22:00 sharp"),
        ("Photography and videography", "Vintage Polaroid Roamer + Digital Drone Pilot", 2800.0, "quoted", "Includes 300 physical instant films and scanned gallery", 0, 1, 0, 0.0, "unpaid", "Guests take instant memories home"),
        ("Decoration and lighting", "Festoon Overhead Strings, Cedar Benches & Custom Alumni Pennants", 2200.0, "estimated", "Rental and lighting rigging quote", 0, 1, 0, 0.0, "unpaid", "Can trim perimeter lights if needed"),
        ("Invitations and guest communication", "Web Portal, Custom Enamel Pins & Commemorative Badges", 1400.0, "confirmed", "Production and postal costs", 1, 0, 0, 1400.0, "fully_paid", "Badges arrived"),
        ("Transport and accommodation", "Group Shuttles (Palo Alto Caltrain to Coastal Bluff)", 1800.0, "quoted", "Bauer's Transportation quote for 2 shuttle runs", 0, 1, 0, 0.0, "unpaid", "Ensures safe transit after open bar"),
        ("Contingency reserve", "Unforeseen Weather & Coastal Overtime Reserve", 4500.0, "confirmed", "Locked contingency reserve (9.4%)", 1, 0, 0, 0.0, "unpaid", "Reserved strictly for unexpected fog tenting or sound extensions")
    ]
    for cat, item, amt, conf, basis, fix, adj, opt, paid, pay_stat, notes in reunion_budget:
        cursor.execute("""
        INSERT INTO budget_items (id, event_id, category, item_name, amount, confirmation_status, basis, is_fixed, is_adjustable, is_optional, paid_amount, payment_status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (str(uuid.uuid4()), e2_id, cat, item, amt, conf, basis, fix, adj, opt, paid, pay_stat, notes))

    # Reunion tasks
    reunion_tasks = [
        ("RU-1", e2_id, "Secure Half Moon Bay Coastal Sound Permit", "Submit municipal permit for outdoor amplified band until 22:00", "2026-08-15", "Critical", "Permits Chair", json.dumps([]), "Completed", 350.0, "Transition acoustic to indoor fireplace hall", "Permits"),
        ("RU-2", e2_id, "Lock Food Truck Vendors & Health Permits", "Coordinate parking permits for Taco & Pizza rigs with lodge manager", "2026-09-01", "High", "Catering Lead", json.dumps(["RU-1"]), "Completed", 14500.0, "Backup catered buffet from local restaurant", "Food"),
        ("RU-3", e2_id, "Confirm 2x Caltrain Shuttle Schedules", "Finalize departure times from Palo Alto to Half Moon Bay and return shuttles", "2026-09-20", "Medium", "Transport Lead", json.dumps([]), "In Progress", 1800.0, "Contract Uber for Business voucher codes", "Transport"),
        ("RU-4", e2_id, "Deploy Vintage Polaroid Stations & Memory Wall", "Rig string grid and wooden pegs for instant photo guest gallery", "2026-10-09", "Low", "Decor Team", json.dumps([]), "Not Started", 400.0, "Digital photo booth iPad stand", "Activities")
    ]
    for tid, eid, name, desc, dline, prio, own, dep, stat, cost, cont, cat in reunion_tasks:
        cursor.execute("""
        INSERT INTO tasks (id, event_id, name, description, deadline, priority, owner, dependencies, status, estimated_cost, contingency_action, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (tid, eid, name, desc, dline, prio, own, dep, stat, cost, cont, cat))

    # 3. Community Harvest Festival
    e3_id = "event-community-03"
    cursor.execute("""
    INSERT INTO events (
        id, name, occasion, event_type, date_range, location, guest_count,
        total_budget, currency, contingency_allocated, contingency_committed,
        atmosphere, theme, visual_style, color_palette, protected_priorities,
        cultural_traditions, accessibility_requirements, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        e3_id,
        "GreenRoots Community Harvest & Solar Fundraiser",
        "Annual Neighborhood Eco-Festival",
        "community",
        "Sep 26, 2026",
        "Oakwood Central Park & Amphitheater",
        650,
        18500.0,
        "USD",
        2000.0,
        0.0,
        "Inclusive, uplifting, educational, solar-powered family festival",
        "Solar Bounty & Community Resilience",
        "Burlap banners, wooden crates, potted native flora, sunburst chalk murals",
        json.dumps(["#15803D", "#CA8A04", "#0369A1", "#B45309", "#ECFDF5"]),
        json.dumps(["Zero-Waste Food Compost Stations", "Free Children's Eco-Workshop Area", "Wheelchair-Accessible Seating & Ramps"]),
        json.dumps(["Indigenous land acknowledgment ceremony", "Harvest bread-breaking circle", "Community solar ribbon cutting"]),
        json.dumps(["All park pathways wheelchair graded", "ASL interpreter on stage for main speeches", "Quiet sensory tent with ear defenders for neurodivergent guests"]),
        "Planning"
    ))

    community_budget = [
        ("Venue", "City Park Amphitheater & Green Permit Fee", 2200.0, "confirmed", "Department of Parks & Recreation civic rate", 1, 0, 0, 2200.0, "fully_paid", "Civic discount approved"),
        ("Food and beverages", "Community Potluck Kitchen + Local Bakery Bread & Cider", 3800.0, "quoted", "Locally sourced cider press and artisan loaves", 0, 1, 0, 1000.0, "deposit_paid", "Includes reusable stainless cups"),
        ("Entertainment", "Solar Sound Stage, Acoustic Folk Trio & Kid's Science Magic", 2800.0, "quoted", "Performers and portable solar battery power pack", 0, 1, 0, 0.0, "unpaid", "Powered entirely by mobile solar generator"),
        ("Decoration and lighting", "Burlap Eco-Banners, Hay Bale Benches & Chalk Art Supplies", 1600.0, "estimated", "Recycled materials and local nursery loan plants", 0, 1, 0, 400.0, "deposit_paid", "Plants returned to botanical garden after"),
        ("Accessibility and guest facilities", "ADA Portable Toilets, Temporary Ramps & Sensory Tent", 3100.0, "quoted", "Sanitation and accessibility rentals", 1, 0, 0, 500.0, "deposit_paid", "Protected non-negotiable community priority"),
        ("Taxes, service fees, and other applicable charges", "Emergency Medical Technician (EMT) & Fire Marshall Permit", 1500.0, "confirmed", "City public safety requirement for >500 attendees", 1, 0, 0, 1500.0, "fully_paid", "Mandatory safety sign-off"),
        ("Invitations and guest communication", "Recycled Flyers, Bilingual Yard Signs & Social Campaign", 1500.0, "quoted", "Eco-printing shop quote", 0, 1, 0, 0.0, "unpaid", "English and Spanish outreach"),
        ("Contingency reserve", "Weather & Equipment Contingency", 2000.0, "confirmed", "Municipal security reserve", 1, 0, 0, 0.0, "unpaid", "Cannot be spent for upgrades")
    ]
    for cat, item, amt, conf, basis, fix, adj, opt, paid, pay_stat, notes in community_budget:
        cursor.execute("""
        INSERT INTO budget_items (id, event_id, category, item_name, amount, confirmation_status, basis, is_fixed, is_adjustable, is_optional, paid_amount, payment_status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (str(uuid.uuid4()), e3_id, cat, item, amt, conf, basis, fix, adj, opt, paid, pay_stat, notes))

    conn.commit()

# Helper accessors
def get_all_events() -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events ORDER BY updated_at DESC")
    rows = cursor.fetchall()
    events = []
    for r in rows:
        d = dict(r)
        d["color_palette"] = json.loads(d.get("color_palette") or "[]")
        d["protected_priorities"] = json.loads(d.get("protected_priorities") or "[]")
        d["cultural_traditions"] = json.loads(d.get("cultural_traditions") or "[]")
        d["accessibility_requirements"] = json.loads(d.get("accessibility_requirements") or "[]")
        events.append(d)
    conn.close()
    return events

def get_event_by_id(event_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
    d = dict(row)
    d["color_palette"] = json.loads(d.get("color_palette") or "[]")
    d["protected_priorities"] = json.loads(d.get("protected_priorities") or "[]")
    d["cultural_traditions"] = json.loads(d.get("cultural_traditions") or "[]")
    d["accessibility_requirements"] = json.loads(d.get("accessibility_requirements") or "[]")

    # Fetch budget items
    cursor.execute("SELECT * FROM budget_items WHERE event_id = ?", (event_id,))
    budget_items = [dict(b) for b in cursor.fetchall()]

    # Fetch tasks
    cursor.execute("SELECT * FROM tasks WHERE event_id = ? ORDER BY deadline ASC", (event_id,))
    tasks = []
    for t in cursor.fetchall():
        td = dict(t)
        td["dependencies"] = json.loads(td.get("dependencies") or "[]")
        tasks.append(td)

    # Fetch stress tests
    cursor.execute("SELECT * FROM stress_tests WHERE event_id = ?", (event_id,))
    stress_tests = []
    for st in cursor.fetchall():
        std = dict(st)
        std["affected_items"] = json.loads(std.get("affected_items") or "[]")
        std["invalidated_assumptions"] = json.loads(std.get("invalidated_assumptions") or "[]")
        std["required_approvals"] = json.loads(std.get("required_approvals") or "[]")
        stress_tests.append(std)

    # Fetch vendors
    cursor.execute("SELECT * FROM vendors WHERE event_id = ?", (event_id,))
    vendors = [dict(v) for v in cursor.fetchall()]

    # Fetch stakeholders
    cursor.execute("SELECT * FROM stakeholders WHERE event_id = ?", (event_id,))
    stakeholders = []
    for s in cursor.fetchall():
        sd = dict(s)
        sd["stated_priorities"] = json.loads(sd.get("stated_priorities") or "[]")
        stakeholders.append(sd)

    # Fetch incidents
    cursor.execute("SELECT * FROM incidents WHERE event_id = ? ORDER BY reported_time DESC", (event_id,))
    incidents = []
    for inc in cursor.fetchall():
        id_dict = dict(inc)
        id_dict["affected_tasks"] = json.loads(id_dict.get("affected_tasks") or "[]")
        id_dict["revised_run_of_show"] = json.loads(id_dict.get("revised_run_of_show") or "[]")
        id_dict["mitigation_steps"] = json.loads(id_dict.get("mitigation_steps") or "[]")
        incidents.append(id_dict)

    conn.close()

    return {
        "event": d,
        "budget_items": budget_items,
        "tasks": tasks,
        "stress_tests": stress_tests,
        "vendors": vendors,
        "stakeholders": stakeholders,
        "incidents": incidents
    }
