import json
import main
from models.schemas import ChatRequest, TradeoffRequest, DayOfIncidentRequest

def run_tests():
    print("--- 1. Health Check ---")
    h = main.health_check()
    assert h["status"] == "healthy"
    print("Health check response:", h)

    print("\n--- 2. List Events ---")
    events = main.list_events()
    assert len(events) >= 3, f"Expected at least 3 events, got {len(events)}"
    print(f"Loaded {len(events)} seeded events.")

    wedding_id = events[0]["id"]
    print(f"Target event ID: {wedding_id} ({events[0]['name']})")

    print(f"\n--- 3. Fetch Event Details ---")
    data = main.get_event(wedding_id)
    assert "event" in data
    assert "budget_items" in data
    assert "tasks" in data
    assert "reconciliation" in data
    assert "validation" in data
    recon = data["reconciliation"]
    val = data["validation"]
    print("Budget reconciliation: Total =", recon["total_budget"], "Projected =", recon["total_projected_cost"])
    print("Validation Gate score:", val["score"], "/ 100 - Valid:", val["is_valid"])

    print("\n--- 4. Chat with Planora AI ---")
    chat_res = main.chat_with_planora(wedding_id, ChatRequest(
        event_id=wedding_id,
        message="What is our budget breakdown and what are our protected priorities?"
    ))
    assert "reply" in chat_res
    print("Planora reply summary:", chat_res["reply"][:150] + "...")
    print("Engine source:", chat_res["engine_source"])

    print("\n--- 5. Interactive Budget Trade-offs (Section 5) ---")
    cur_venue = recon["category_breakdown"].get("Venue", 1100000.0)
    new_venue = cur_venue + 60000.0
    tradeoff_res = main.simulate_tradeoff(wedding_id, TradeoffRequest(
        event_id=wedding_id,
        category_adjusted="Venue",
        new_amount=new_venue
    ))
    assert tradeoff_res["feasible"] == True
    assert len(tradeoff_res["scenarios"]) >= 3
    print(f"Generated {len(tradeoff_res['scenarios'])} trade-off scenarios for delta +{tradeoff_res['delta']}")
    for s in tradeoff_res["scenarios"]:
        print(f"  • {s['title']} ({len(s['changes'])} items reallocated)")

    print("\n--- 6. Red Team Stress-Test (Section 7) ---")
    stress_res = main.trigger_stress_tests(wedding_id)
    assert stress_res["success"] == True
    assert len(stress_res["scenarios"]) >= 5
    print(f"Generated {len(stress_res['scenarios'])} failure mode pre-mortem simulations.")

    print("\n--- 7. Day-Of Live Mode Incident (Section 11) ---")
    inc_res = main.trigger_live_incident(wedding_id, DayOfIncidentRequest(
        event_id=wedding_id,
        incident_type="photographer_late",
        description="Lead photographer is delayed 30 minutes in traffic",
        custom_time="17:15"
    ))
    assert "revised_run_of_show" in inc_res
    assert "broadcast_message" in inc_res
    assert len(inc_res["mitigation_steps"]) > 0
    print(f"Live incident mitigated: {len(inc_res['revised_run_of_show'])} run-of-show adjustments")
    print("Broadcast draft:", inc_res["broadcast_message"][:100] + "...")

    print("\n--- 8. Cascade Reschedule (Section 6) ---")
    first_task = data["tasks"][0]["id"]
    shift_res = main.shift_timeline(wedding_id, {
        "task_id": first_task,
        "new_deadline": "2026-09-10"
    })
    assert shift_res["success"] == True
    print("Cascade shift result:", shift_res.get("recommendation"))

    print("\n===========================================")
    print("ALL PLANORA AI INTEGRATION TESTS PASSED 100%!")
    print("===========================================")

if __name__ == "__main__":
    run_tests()
