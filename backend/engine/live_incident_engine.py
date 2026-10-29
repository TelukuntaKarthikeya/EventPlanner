from typing import Dict, Any, List
from datetime import datetime, timedelta

def resolve_live_incident(incident_type: str, description: str, current_time_str: str, event: Dict[str, Any], tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Day-Of Live Mode Incident Response Engine per Section 11.
    Evaluates trigger, generates waterfall run-of-show adjustments, protects critical rituals,
    calculates financial delta, and drafts instant announcements.
    """
    currency = event.get("currency", "USD")
    event_name = event.get("name", "the event")
    timestamp = current_time_str or datetime.now().strftime("%H:%M")

    affected_tasks = []
    revised_schedule = []
    mitigation_steps = []
    cost_impact = 0.0
    broadcast_message = ""

    if "photographer" in incident_type.lower() or "late" in description.lower():
        affected_tasks = ["T4", "T6", "T8", "RU-4"]
        mitigation_steps = [
            "Keep guests engaged with acoustic background playlist and roving cocktail appetizers.",
            "Instruct assistant shooter or mobile content creator to begin capturing decor details, ambient venue shots, and guest arrivals.",
            "Compress portrait session from 45 mins to 25 mins by grouping immediate family members in advance.",
            "Protect critical ceremony timing: Ceremony begins on schedule regardless of portrait delays."
        ]
        cost_impact = 0.0
        broadcast_message = (
            f"Dear Guests, Welcome to {event_name}! Refreshments and signature welcome beverages are being served in the courtyard. "
            f"Our ceremony will commence shortly. Please enjoy the music and mingle!"
        )
        revised_schedule = [
            {"time": "17:00", "activity": "Welcome Cocktails & Live Acoustic Set", "status": "Extended (+20 mins)", "note": "Engage guests while photographer sets up"},
            {"time": "17:35", "activity": "Focused Family Mini-Portraits (Expedited)", "status": "Rescheduled", "note": "Pre-staged shot list ready to execute"},
            {"time": "18:00", "activity": "Main Ceremony Begins", "status": "Protected (Strict)", "note": "Non-negotiable ritual timing maintained"}
        ]

    elif "guest" in incident_type.lower() or "extra" in description.lower() or "surge" in incident_type.lower():
        affected_tasks = ["T3", "T5", "RU-2"]
        cost_impact = 450.0 if currency == "USD" else 35000.0
        mitigation_steps = [
            "Instruct catering captain to activate reserve kitchen buffer (+15% plate preparation).",
            "Banquet staff immediately rolls out 2 auxiliary ten-seater round tables with pre-steamed linens.",
            "Host hospitality team discreetly prepares welcome favors and seating tags.",
            "Bar staff informed to maintain beverage flow to prevent queue at single dispensary."
        ]
        broadcast_message = (
            f"Welcome all friends and family! Additional seating and dining spaces have been opened in the East Arcade for your maximum comfort."
        )
        revised_schedule = [
            {"time": "Current", "activity": "Auxiliary Tables Deployed in Arcade", "status": "Immediate", "note": "Setup completes in under 8 minutes"},
            {"time": "+15m", "activity": "Catering Buffer Headcount Authorized", "status": "Pending Host Approval", "note": f"Estimated incremental cost: {currency} {cost_impact:,.2f}"},
            {"time": "Dinner", "activity": "Staggered Buffet Call (Tables 1-12, then 13-24)", "status": "Active", "note": "Ensures zero queue bottlenecks"}
        ]

    elif "rain" in incident_type.lower() or "weather" in incident_type.lower():
        affected_tasks = ["T2", "T4", "T7", "RU-1"]
        cost_impact = 350.0 if currency == "USD" else 25000.0
        mitigation_steps = [
            "SAFETY FIRST: Disconnect exterior lawn extension cords and switch stage audio to sheltered speakers.",
            "Deploy motorized transparent courtyard canopy / clear umbrella brigade.",
            "Relocate acoustic performers and dance floor to covered stone colonnade.",
            "Ensure step-free non-slip rubber mats are laid across wet flagstones immediately."
        ]
        broadcast_message = (
            f"Notice: Due to brief weather changes, festivities have transitioned seamlessly to the sheltered Grand Arcade & Pavilion! "
            f"Please follow the warm lanterns inside."
        )
        revised_schedule = [
            {"time": "Immediate", "activity": "Power & Audio Safe Transition to Covered Colonnade", "status": "High Priority", "note": "Zero safety hazards"},
            {"time": "+10m", "activity": "Dance Floor & DJ Rig Operational Indoors", "status": "Active", "note": "Atmosphere preserved"},
            {"time": "+20m", "activity": "Hot Spiced Tea & Warm Hors d'Oeuvres Served", "status": "Comfort Boost", "note": "Delights guests during transition"}
        ]

    else:
        # Ceremony delay or general custom incident
        affected_tasks = ["T7", "T8", "RU-1"]
        cost_impact = 0.0
        mitigation_steps = [
            "Extend current cocktail reception by 25 minutes with acoustic background music.",
            "Coordinate with culinary team to push main course warm-holding time by 20 minutes to prevent food drying out.",
            "Notify officiant and key family hosts of the revised sequence.",
            "Protect end-of-night sound curfew: shave 15 minutes from open-mic speeches if needed."
        ]
        broadcast_message = (
            f"Update: Please continue enjoying appetizers and hospitality! Our main program will transition into the ceremonial hall at {timestamp}."
        )
        revised_schedule = [
            {"time": timestamp, "activity": "Cocktail Hour Extended with Appetizer Pass", "status": "Active", "note": "Food remains hot and fresh"},
            {"time": "+25m", "activity": "Main Program Call & Seating Transition", "status": "Rescheduled", "note": "Smooth unhurried flow"},
            {"time": "Later", "activity": "Curfew Protection: Speech Segment Compressed", "status": "Adjusted", "note": "Avoids sound ordinance fine"}
        ]

    return {
        "incident_type": incident_type,
        "reported_time": timestamp,
        "description": description,
        "affected_tasks": affected_tasks,
        "mitigation_steps": mitigation_steps,
        "revised_run_of_show": revised_schedule,
        "cost_impact": cost_impact,
        "broadcast_message": broadcast_message,
        "approval_required": cost_impact > 0,
        "approval_summary": f"User approval required to authorize {currency} {cost_impact:,.2f} from available contingency reserve." if cost_impact > 0 else "No budget increase required."
    }
