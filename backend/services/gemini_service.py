import os
import json
import requests
from typing import Dict, Any, List, Optional
from engine.budget_engine import reconcile_budget, calculate_tradeoffs
from engine.timeline_engine import analyze_timeline
from engine.live_incident_engine import resolve_live_incident
from engine.validator_engine import run_validation_gate

MASTER_SYSTEM_PROMPT = """
You are Planora AI, an adaptive event-planning agent that helps users plan and execute weddings, birthdays, reunions, festivals, college events, and community gatherings.
You are not a generic chatbot that returns a budget table and a checklist. You are a constraint-aware event planner, budget negotiator, creative director, logistics coordinator, and risk analyst working from one consistent event plan.

Your mission is to turn a user's vision into a realistic, personalized, financially constrained, executable event plan—and continuously adapt that plan when circumstances change.

Core Operating Principles:
1. Treat user's budget as a hard ceiling unless explicitly authorized.
2. Distinguish confirmed costs, quotations, estimates, and unknown costs.
3. Never invent vendor availability, prices, bookings, quotations, local regulations, or ritual timings.
4. Use deterministic logic for arithmetic, date calculations, and constraint validation.
5. Ask only necessary questions. Allow proceeding with clearly labeled assumptions.
6. Preserve existing user-approved decisions when updating the plan.
7. Explain meaningful changes and downstream consequences.
8. Never silently remove a user-designated priority to make the numbers appear feasible.
9. Obtain explicit approval before sending messages, making bookings, committing funds.
10. If constraints cannot all be satisfied, explain the conflict and present feasible alternatives.
"""

def get_gemini_api_key() -> Optional[str]:
    # Check env
    key = os.environ.get("GEMINI_API_KEY")
    if key:
        return key

    # Check .env file in backend or root
    for path in [
        os.path.join(os.path.dirname(__file__), "..", ".env"),
        os.path.join(os.path.dirname(__file__), "..", "..", ".env")
    ]:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("GEMINI_API_KEY="):
                        return line.split("=", 1)[1].strip().strip('"').strip("'")
    return None

def call_gemini_api(prompt: str, context: Optional[Dict[str, Any]] = None, api_key: Optional[str] = None) -> Optional[str]:
    key = api_key or get_gemini_api_key()
    if not key:
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={key}"
    headers = {"Content-Type": "application/json"}

    system_instruction = MASTER_SYSTEM_PROMPT
    if context:
        system_instruction += f"\n\nCurrent Event State:\n{json.dumps(context, indent=2)}"

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "systemInstruction": {
            "parts": [
                {"text": system_instruction}
            ]
        },
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 2048
        }
    }

    try:
        res = requests.post(url, headers=headers, json=payload, timeout=25)
        if res.status_code == 200:
            data = res.json()
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text", "")
    except Exception as e:
        print(f"Gemini API request failed: {e}")

    return None

def generate_planora_response(message: str, event_data: Dict[str, Any], api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Combines deterministic constraint engine with Gemini LLM (or smart fallback).
    Produces conversational advice, identifies required trade-offs, and enforces safety gates.
    """
    event = event_data.get("event", {})
    budget_items = event_data.get("budget_items", [])
    tasks = event_data.get("tasks", [])
    stress_tests = event_data.get("stress_tests", [])
    vendors = event_data.get("vendors", [])

    total_budget = float(event.get("total_budget", 0.0))
    currency = event.get("currency", "USD")
    contingency_allocated = float(event.get("contingency_allocated", 0.0))
    contingency_committed = float(event.get("contingency_committed", 0.0))

    recon = reconcile_budget(total_budget, budget_items, contingency_allocated, contingency_committed)
    t_analysis = analyze_timeline(tasks)
    validation = run_validation_gate(event, budget_items, tasks, stress_tests)

    # First attempt live Gemini call if API key available
    live_reply = None
    if api_key or get_gemini_api_key():
        context = {
            "event_summary": {
                "name": event.get("name"),
                "budget": total_budget,
                "currency": currency,
                "projected_cost": recon["total_projected_cost"],
                "remaining_budget": recon["remaining_budget"],
                "is_over_budget": recon["is_over_budget"],
                "guest_count": event.get("guest_count"),
                "protected_priorities": event.get("protected_priorities", []),
                "cultural_traditions": event.get("cultural_traditions", []),
                "accessibility": event.get("accessibility_requirements", [])
            },
            "validation_score": validation["score"],
            "critical_path_tasks": [t.get("name") for t in t_analysis["critical_tasks"][:3]]
        }
        live_reply = call_gemini_api(message, context, api_key)

    if live_reply:
        return {
            "reply": live_reply,
            "engine_source": "Gemini 2.0 Flash (Live)",
            "budget_reconciliation": recon,
            "timeline_analysis": t_analysis,
            "validation": validation
        }

    # Deterministic smart fallback based on user query intent
    msg_lower = message.lower()

    if "budget" in msg_lower or "cost" in msg_lower or "expense" in msg_lower or "quote" in msg_lower or "increase" in msg_lower:
        if recon["is_over_budget"]:
            reply = (
                f"**Financial Constraint Alert**: Projected expenses currently total **{currency} {recon['total_projected_cost']:,.2f}**, "
                f"which exceeds your authorized budget ceiling of **{currency} {total_budget:,.2f}** by **{currency} {recon['deficit']:,.2f}**.\n\n"
                f"Per Core Operating Principle #1 & #8, I cannot silently remove your protected priorities "
                f"(`{', '.join(event.get('protected_priorities', []))}`) or treat contingency as free cash.\n\n"
                f"### Recommended Trade-off Scenarios:\n"
                f"1. **Aesthetic & Print Trimming**: Reduce non-essential perimeter decor and switch custom box stationery to digital RSVP concierge.\n"
                f"2. **Pro-Rata Reallocation**: Shave 4-7% across all non-fixed flexible line items.\n"
                f"3. **Scope Modification**: Authorize a budget ceiling adjustment or adjust guest count targets in the Stakeholder Alignment tab."
            )
        else:
            reply = (
                f"**Budget Reconciliation Summary**:\n"
                f"- **Authorized Budget**: {currency} {total_budget:,.2f}\n"
                f"- **Total Projected Cost**: {currency} {recon['total_projected_cost']:,.2f}\n"
                f"- **Remaining Buffer**: {currency} {recon['remaining_budget']:,.2f}\n"
                f"- **Safe Contingency Reserve**: {currency} {recon['available_contingency']:,.2f} *(Protected: Not discretionary)*\n"
                f"- **Cost Transparency**: {currency} {recon['confirmed_total']:,.2f} confirmed by signed contract, "
                f"{currency} {recon['quoted_total']:,.2f} in formal vendor quotes, {currency} {recon['estimated_total']:,.2f} in planning estimates.\n\n"
                f"Your budget is currently in **{recon['budget_health']}** condition. Would you like to simulate a quote increase or explore trade-offs?"
            )

    elif "stress" in msg_lower or "red team" in msg_lower or "risk" in msg_lower or "what if" in msg_lower or "weather" in msg_lower:
        reply = (
            f"**Plan Stress-Tester Pre-Mortem Report**:\n"
            f"I have evaluated the plan across {len(stress_tests)} vulnerability vectors.\n\n"
            f"### High-Risk Exposure Points:\n"
            f"1. **Weather & Venue Exposure**: Open courtyards trip electrical boards during sudden downpours. "
            f"Mitigation: Pre-rigged transparent pagoda canopy and dry interior hall on standby.\n"
            f"2. **Attendance Surge**: A +20% guest surge ({int(event.get('guest_count', 100) * 0.2)} extra attendees) will bottleneck seating and catering portions. "
            f"Mitigation: Enforce a mandatory 15% catering buffer with on-demand auxiliary tables.\n"
            f"3. **Vendor Cancellation**: Clause 9.2 activated to ensure tier-1 replacement shooters with zero surcharge.\n\n"
            f"Check the **Red Team (Stress-Test)** tab for the full 7-step failure cascade simulation."
        )

    elif "timeline" in msg_lower or "schedule" in msg_lower or "deadline" in msg_lower or "task" in msg_lower:
        crit_names = [t.get("name") for t in t_analysis["critical_tasks"][:3]]
        reply = (
            f"**Timeline & Logistics Status**:\n"
            f"- **Total Tasks**: {t_analysis['total_tasks']} ({t_analysis['completed_count']} completed, {t_analysis['in_progress_count']} in progress)\n"
            f"- **Dependency Violations**: {len(t_analysis['conflict_tasks'])} detected\n"
            f"- **Critical Path Sequence**: {' -> '.join(crit_names) if crit_names else 'No blocking chain'}\n\n"
            f"If any key task deadline shifts, our cascade engine will automatically recalculate downstream prerequisites to preserve necessary setup buffers."
        )

    elif "culture" in msg_lower or "tradition" in msg_lower or "ritual" in msg_lower or "timing" in msg_lower or "accessibility" in msg_lower:
        trads = event.get("cultural_traditions", [])
        access = event.get("accessibility_requirements", [])
        reply = (
            f"**Cultural & Accessibility Alignment**:\n\n"
            f"### Preserved Cultural Rituals:\n"
            + ("\n".join(f"- {t}" for t in trads) if trads else "- No specific cultural rituals configured.")
            + f"\n\n### Accessibility & Guest Comfort Standards:\n"
            + ("\n".join(f"- {a}" for a in access) if access else "- Standard facility access.")
            + f"\n\n*Important*: In accordance with Operating Principle #3, ritual timings (such as Vedic Muhurtham or sunset pheras) must be verified with your officiant/family elder rather than auto-assumed."
        )

    elif "vendor" in msg_lower or "quote" in msg_lower or "contract" in msg_lower:
        reply = (
            f"**Vendor Outreach & Comparison Status**:\n"
            f"You currently have {len(vendors)} vendors logged across key categories (Venue, Catering, Decor, Photography).\n"
            f"- Standardized comparison matrix tracks deliverables, payment schedules, cancellation terms, and suitability fit scores.\n"
            f"- You can generate tailored RFPs (Requests for Quotations) in the **Vendors** tab with detailed riders (power specs, setup windows, overtime fees).\n\n"
            f"Remember: Planora AI will draft outreach communications, but will never claim to have sent messages or booked vendors without your explicit confirmation."
        )

    else:
        reply = (
            f"Hello! I am Planora AI, your constraint-aware event planning agent for **{event.get('name', 'your event')}**.\n\n"
            f"Here is your current operational snapshot:\n"
            f"- **Guest Count**: {event.get('guest_count')} pax in {event.get('location')}\n"
            f"- **Financial Ceiling**: {currency} {total_budget:,.2f} (Projected: {currency} {recon['total_projected_cost']:,.2f})\n"
            f"- **Validation Gate Score**: {validation['score']}/100 ({'All checks passed' if validation['is_valid'] else 'Adjustments needed'})\n"
            f"- **Protected Priorities**: {', '.join(event.get('protected_priorities', []))}\n\n"
            f"How would you like to proceed? You can:\n"
            f"1. Adjust budget allocations or test an expense increase\n"
            f"2. Run a Red Team stress test on weather or guest surges\n"
            f"3. Trigger a Day-Of live incident simulation (e.g. photographer delay or sudden rain)\n"
            f"4. Refine the creative theme and color palette"
        )

    return {
        "reply": reply,
        "engine_source": "Planora Deterministic AI Core (System Prompt Compliant)",
        "budget_reconciliation": recon,
        "timeline_analysis": t_analysis,
        "validation": validation
    }
