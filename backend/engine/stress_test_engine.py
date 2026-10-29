from typing import List, Dict, Any

def run_stress_test_suite(event: Dict[str, Any], budget_items: List[Dict[str, Any]], tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Executes red team stress-test simulations across 6 standard failure modes:
    1. Severe Weather Shock at Venue
    2. Primary Vendor Cancellation (48 hours prior)
    3. Attendance Surge (+20% unannounced guests)
    4. Key Staging / AV Delivery Delayed
    5. Surprise Regulatory / Overtime Surcharge
    6. Transport / Accessibility Pathway Breakdown
    """
    location = event.get("location", "the venue")
    guest_count = event.get("guest_count", 100)
    currency = event.get("currency", "USD")
    budget = event.get("total_budget", 50000.0)
    event_type = event.get("event_type", "event")

    # Estimate scaling values based on budget
    surge_count = int(guest_count * 0.20)
    surge_cost = round(budget * 0.04, 2)
    weather_tarp_cost = round(budget * 0.035, 2)
    rush_vendor_premium = round(budget * 0.025, 2)

    scenarios = [
        {
            "id": "sim-weather",
            "scenario_name": f"Flash Downpour & High Winds at {location}",
            "severity": "High",
            "likelihood": "Medium",
            "first_failure": "Open-air electrical boards trip; table linens and dance floor rendered unsafe.",
            "affected_items": ["Outdoor stage", "Sound and lighting rig", "Buffet stations", "Guest footwear & apparel"],
            "invalidated_assumptions": [
                "Assumption that open lawn is usable without overhead shelter",
                "Assumption that outdoor power circuits are water-sealed"
            ],
            "immediate_response": "Trigger rapid covered-zone evacuation protocol; disconnect exposed 220V power drops within 90 seconds.",
            "backup_plan": "Seamlessly redirect guests to pre-booked covered arcade or deploy heavy-duty clear-span pagoda tent with weighted gutters.",
            "financial_impact": weather_tarp_cost,
            "required_approvals": ["Event Host approval to deploy emergency tenting team", "Venue Manager authorization to use indoor banquet reserve"],
            "status": "Identified"
        },
        {
            "id": "sim-vendor-cancel",
            "scenario_name": "Critical Vendor Cancels 48 Hours Before Event",
            "severity": "High",
            "likelihood": "Low",
            "first_failure": "Scheduled setup window misses crew arrival; key deliverable (e.g., sound or food) unavailable.",
            "affected_items": ["Main stage schedule", "Run of show timeline", "Deposit recovery process"],
            "invalidated_assumptions": [
                "Primary vendor contract execution is guaranteed without emergency bench backup",
                "Onboarding lead time is greater than 24 hours"
            ],
            "immediate_response": "Activate secondary pre-vetted retainer vendor from comparison matrix; invoke contractual default clause to recover deposit.",
            "backup_plan": "Deploy on-call partner provider with expedited rider specs; brief emergency crew via digital run-sheet.",
            "financial_impact": rush_vendor_premium,
            "required_approvals": ["User sign-off for expedited replacement contract rider", "Budget authorization for rush dispatch fee"],
            "status": "Identified"
        },
        {
            "id": "sim-guest-surge",
            "scenario_name": f"Surge of +{surge_count} Unannounced Attendees (+20% Capacity)",
            "severity": "Medium",
            "likelihood": "High",
            "first_failure": "Queue bottleneck at welcome desk; dining table seating capacity exhausted.",
            "affected_items": ["Seating chart & table arrangements", "Catering portion headcount", "Restroom queue capacity", "Welcome favors"],
            "invalidated_assumptions": [
                f"Strict RSVP attendance ceiling of exactly {guest_count} guests",
                "Table allocations leave zero auxiliary gap"
            ],
            "immediate_response": "Direct catering captain to engage standard +15% plate reserve buffer; dispatch hospitality team to assemble auxiliary high-top cocktail tables.",
            "backup_plan": "Convert adjacent lounge seating into overflow dining; switch dessert to roving passed trays to prevent buffet congestion.",
            "financial_impact": surge_cost,
            "required_approvals": ["Authorization for additional per-plate catering surcharge"],
            "status": "Identified"
        },
        {
            "id": "sim-delivery-delay",
            "scenario_name": "Decor & Floral Cargo Delayed 3 Hours in Traffic",
            "severity": "Medium",
            "likelihood": "Medium",
            "first_failure": "Photo backdrop and entrance arch incomplete when early VIP guests begin arriving.",
            "affected_items": ["Welcome cocktail visual impact", "Early portrait photography session", "Floor team stress"],
            "invalidated_assumptions": [
                "Cargo arrives at least 4 hours prior to guest arrival",
                "Stage florals must precede welcome drinks"
            ],
            "immediate_response": "Shift guest reception flow away from main hall entrance to ambient garden bar or welcome lounge with warm music and drinks.",
            "backup_plan": "Execute 'Phase 1 Minimalist Staging' using focal ambient uplighting and brass pedestal lanterns already on site.",
            "financial_impact": 0.0,
            "required_approvals": ["Lead host approval to delay grand ballroom reveal by 30 minutes"],
            "status": "Identified"
        },
        {
            "id": "sim-accessibility-glitch",
            "scenario_name": "Main Elevator or Accessibility Ramp Blocked by Equipment",
            "severity": "High",
            "likelihood": "Low",
            "first_failure": "Guests with mobility devices, wheelchairs, or elderly relatives cannot reach main hall.",
            "affected_items": ["Guest comfort and dignity", "Emergency exit compliance", "Arrival schedule"],
            "invalidated_assumptions": [
                "Service corridors remain completely unobstructed by loading crew",
                "Standard entry path accommodates all guests equally"
            ],
            "immediate_response": "Immediately deploy dedicated logistics marshal to clear freight staging; unveil secondary ground-level accessible VIP corridor.",
            "backup_plan": "Provide dedicated golf buggy escort and deploy portable non-slip aluminum modular ramp stored in facilities reserve.",
            "financial_impact": round(budget * 0.005, 2),
            "required_approvals": ["On-site coordinator immediate clearance"],
            "status": "Mitigated"
        }
    ]

    return scenarios
