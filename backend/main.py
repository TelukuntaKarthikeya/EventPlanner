from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import uuid
from typing import Dict, Any, List, Optional

from db import init_db, get_db, get_all_events, get_event_by_id
from models.schemas import (
    EventModel, BudgetItemModel, TaskModel, StressTestScenario,
    VendorModel, StakeholderModel, IncidentModel, ChatRequest,
    TradeoffRequest, DayOfIncidentRequest
)
from engine.budget_engine import reconcile_budget, calculate_tradeoffs
from engine.timeline_engine import analyze_timeline, recalculate_cascade
from engine.stress_test_engine import run_stress_test_suite
from engine.live_incident_engine import resolve_live_incident
from engine.validator_engine import run_validation_gate
from services.gemini_service import generate_planora_response, get_gemini_api_key

# Initialize DB on startup
init_db()

app = FastAPI(title="Planora AI Backend API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    key_configured = bool(get_gemini_api_key())
    return {
        "status": "healthy",
        "service": "Planora AI API",
        "gemini_api_key_configured": key_configured,
        "engine": "Gemini 2.0 Flash + Deterministic Constraint Guard"
    }

@app.get("/api/events")
def list_events():
    return get_all_events()

@app.get("/api/events/{event_id}")
def get_event(event_id: str):
    data = get_event_by_id(event_id)
    if not data:
        raise HTTPException(status_code=404, detail="Event not found")

    event = data["event"]
    b_items = data["budget_items"]
    tasks = data["tasks"]
    st_tests = data["stress_tests"]

    # Add real-time analysis
    reconciliation = reconcile_budget(
        float(event["total_budget"]),
        b_items,
        float(event.get("contingency_allocated", 0.0)),
        float(event.get("contingency_committed", 0.0))
    )
    timeline_analysis = analyze_timeline(tasks)
    validation = run_validation_gate(event, b_items, tasks, st_tests)

    return {
        **data,
        "reconciliation": reconciliation,
        "timeline_analysis": timeline_analysis,
        "validation": validation
    }

@app.post("/api/events")
def create_event(payload: Dict[str, Any] = Body(...)):
    conn = get_db()
    cursor = conn.cursor()
    new_id = f"event-{uuid.uuid4().hex[:8]}"

    name = payload.get("name", "New Planora Event")
    occasion = payload.get("occasion", "Special Gathering")
    event_type = payload.get("event_type", "wedding")
    date_range = payload.get("date_range", "2026-11-20")
    location = payload.get("location", "City Venue")
    guest_count = int(payload.get("guest_count", 100))
    total_budget = float(payload.get("total_budget", 25000.0))
    currency = payload.get("currency", "USD")
    contingency_allocated = float(payload.get("contingency_allocated", total_budget * 0.1))
    contingency_committed = 0.0
    atmosphere = payload.get("atmosphere", "Warm, memorable, and stress-free")
    theme = payload.get("theme", "Modern Elegance")
    visual_style = payload.get("visual_style", "Refined minimalism with soft accent lighting")
    color_palette = json.dumps(payload.get("color_palette", ["#3B82F6", "#10B981", "#F59E0B", "#1F2937"]))
    protected_priorities = json.dumps(payload.get("protected_priorities", ["Dining & Refreshments", "Guest Comfort"]))
    cultural_traditions = json.dumps(payload.get("cultural_traditions", []))
    accessibility_requirements = json.dumps(payload.get("accessibility_requirements", ["Wheelchair step-free access", "Dietary labeling"]))

    cursor.execute("""
    INSERT INTO events (
        id, name, occasion, event_type, date_range, location, guest_count,
        total_budget, currency, contingency_allocated, contingency_committed,
        atmosphere, theme, visual_style, color_palette, protected_priorities,
        cultural_traditions, accessibility_requirements, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        new_id, name, occasion, event_type, date_range, location, guest_count,
        total_budget, currency, contingency_allocated, contingency_committed,
        atmosphere, theme, visual_style, color_palette, protected_priorities,
        cultural_traditions, accessibility_requirements, "Planning"
    ))

    # Create baseline budget items based on budget breakdown
    default_allocations = [
        ("Venue", "Primary Venue Rental & Setup", total_budget * 0.35, "estimated", "Standard market rate", 1, 0, 0),
        ("Food and beverages", "Catering & Beverage Package", total_budget * 0.28, "estimated", f"Estimate for {guest_count} guests", 0, 1, 0),
        ("Decoration and lighting", "Ambient Decor & Floral Installations", total_budget * 0.12, "estimated", "Stylist estimate", 0, 1, 0),
        ("Photography and videography", "Professional Event Photography", total_budget * 0.08, "estimated", "Full coverage quote estimate", 0, 1, 0),
        ("Entertainment", "Audio / Visual & Music", total_budget * 0.05, "estimated", "Band/DJ & AV setup", 0, 1, 0),
        ("Accessibility and guest facilities", "Guest Facilities & Inclusivity Setup", total_budget * 0.02, "estimated", "Ramps, seating & comfort", 1, 0, 0),
        ("Contingency reserve", "Emergency Contingency Pool", contingency_allocated, "confirmed", "Isolated reserve", 1, 0, 0)
    ]

    for cat, item, amt, conf, basis, fix, adj, opt in default_allocations:
        cursor.execute("""
        INSERT INTO budget_items (id, event_id, category, item_name, amount, confirmation_status, basis, is_fixed, is_adjustable, is_optional)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (str(uuid.uuid4()), new_id, cat, item, amt, conf, basis, fix, adj, opt))

    # Baseline tasks
    default_tasks = [
        ("T-01", new_id, "Confirm Venue Date & Deposit", "Lock in primary location contract and sound limits", "2026-09-01", "Critical", "Host", json.dumps([]), "Completed", total_budget * 0.35, "Venue"),
        ("T-02", new_id, "Menu Tasting & Dietary Sign-off", "Select menu and confirm vegan/allergen requirements", "2026-10-01", "High", "Host", json.dumps(["T-01"]), "In Progress", total_budget * 0.28, "Catering"),
        ("T-03", new_id, "Accessibility Walkthrough", "Verify ramps and step-free access at venue", "2026-10-15", "High", "Logistics Lead", json.dumps(["T-01"]), "Not Started", 0.0, "Accessibility"),
        ("T-04", new_id, "Day-Of Run of Show Rehearsal", "Final timing dry run with team", "2026-11-18", "Medium", "Coordinator", json.dumps(["T-02", "T-03"]), "Not Started", 0.0, "Logistics")
    ]
    for tid, eid, tname, desc, dline, prio, own, dep, stat, cost, cat in default_tasks:
        cursor.execute("""
        INSERT INTO tasks (id, event_id, name, description, deadline, priority, owner, dependencies, status, estimated_cost, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (tid, eid, tname, desc, dline, prio, own, dep, stat, cost, cat))

    conn.commit()
    conn.close()

    return {"success": True, "event_id": new_id, "message": "Event created successfully"}

@app.put("/api/events/{event_id}")
def update_event(event_id: str, payload: Dict[str, Any] = Body(...)):
    conn = get_db()
    cursor = conn.cursor()

    fields = []
    values = []
    allowed = ["name", "occasion", "event_type", "date_range", "location", "guest_count",
               "total_budget", "currency", "contingency_allocated", "contingency_committed",
               "atmosphere", "theme", "visual_style", "status"]

    for k in allowed:
        if k in payload:
            fields.append(f"{k} = ?")
            values.append(payload[k])

    for json_k in ["color_palette", "protected_priorities", "cultural_traditions", "accessibility_requirements"]:
        if json_k in payload:
            fields.append(f"{json_k} = ?")
            values.append(json.dumps(payload[json_k]))

    if not fields:
        conn.close()
        return {"success": True}

    fields.append("updated_at = CURRENT_TIMESTAMP")
    values.append(event_id)

    query = f"UPDATE events SET {', '.join(fields)} WHERE id = ?"
    cursor.execute(query, tuple(values))
    conn.commit()
    conn.close()

    return {"success": True, "event_id": event_id}

@app.post("/api/events/{event_id}/chat")
def chat_with_planora(event_id: str, req: ChatRequest):
    data = get_event_by_id(event_id)
    if not data:
        raise HTTPException(status_code=404, detail="Event not found")

    res = generate_planora_response(req.message, data)

    # Save to chat history
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO chat_messages (event_id, role, content, structured_payload)
    VALUES (?, ?, ?, ?)
    """, (event_id, "user", req.message, None))

    cursor.execute("""
    INSERT INTO chat_messages (event_id, role, content, structured_payload)
    VALUES (?, ?, ?, ?)
    """, (event_id, "assistant", res["reply"], json.dumps({
        "validation_score": res["validation"]["score"],
        "engine_source": res["engine_source"]
    })))
    conn.commit()
    conn.close()

    return res

@app.post("/api/events/{event_id}/tradeoff")
def simulate_tradeoff(event_id: str, req: TradeoffRequest):
    data = get_event_by_id(event_id)
    if not data:
        raise HTTPException(status_code=404, detail="Event not found")

    event = data["event"]
    b_items = data["budget_items"]
    priorities = event.get("protected_priorities", [])

    tradeoff_result = calculate_tradeoffs(
        float(event["total_budget"]),
        b_items,
        priorities,
        req.category_adjusted,
        req.new_amount
    )
    return tradeoff_result

@app.post("/api/events/{event_id}/apply-tradeoff")
def apply_tradeoff(event_id: str, payload: Dict[str, Any] = Body(...)):
    """Applies a selected tradeoff scenario directly to the database."""
    scenario_changes = payload.get("changes", [])
    conn = get_db()
    cursor = conn.cursor()

    for ch in scenario_changes:
        item_name = ch.get("item_name")
        new_amt = float(ch.get("new_amount", 0.0))
        cursor.execute("""
        UPDATE budget_items SET amount = ? WHERE event_id = ? AND item_name = ?
        """, (new_amt, event_id, item_name))

    # Also adjust category target if specified
    if "adjusted_category" in payload and "new_amount" in payload:
        cat = payload["adjusted_category"]
        new_cat_amt = float(payload["new_amount"])
        # Find first item in category or update
        cursor.execute("SELECT id FROM budget_items WHERE event_id = ? AND category = ? LIMIT 1", (event_id, cat))
        row = cursor.fetchone()
        if row:
            cursor.execute("UPDATE budget_items SET amount = ? WHERE id = ?", (new_cat_amt, row[0]))

    conn.commit()
    conn.close()
    return {"success": True, "message": "Tradeoff scenario applied successfully"}

@app.post("/api/events/{event_id}/stress-test")
def trigger_stress_tests(event_id: str):
    data = get_event_by_id(event_id)
    if not data:
        raise HTTPException(status_code=404, detail="Event not found")

    new_scenarios = run_stress_test_suite(data["event"], data["budget_items"], data["tasks"])

    conn = get_db()
    cursor = conn.cursor()
    # Save newly generated scenarios if not existing
    for sc in new_scenarios:
        cursor.execute("""
        INSERT OR REPLACE INTO stress_tests (
            id, event_id, scenario_name, severity, likelihood, first_failure,
            affected_items, invalidated_assumptions, immediate_response,
            backup_plan, financial_impact, required_approvals, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            sc["id"], event_id, sc["scenario_name"], sc["severity"], sc["likelihood"],
            sc["first_failure"], json.dumps(sc["affected_items"]), json.dumps(sc["invalidated_assumptions"]),
            sc["immediate_response"], sc["backup_plan"], sc["financial_impact"],
            json.dumps(sc["required_approvals"]), sc["status"]
        ))
    conn.commit()
    conn.close()

    return {"success": True, "scenarios": new_scenarios}

@app.post("/api/events/{event_id}/live-incident")
def trigger_live_incident(event_id: str, req: DayOfIncidentRequest):
    data = get_event_by_id(event_id)
    if not data:
        raise HTTPException(status_code=404, detail="Event not found")

    incident_response = resolve_live_incident(
        req.incident_type,
        req.description,
        req.custom_time or "",
        data["event"],
        data["tasks"]
    )

    # Save to incidents table
    conn = get_db()
    cursor = conn.cursor()
    inc_id = str(uuid.uuid4())
    cursor.execute("""
    INSERT INTO incidents (
        id, event_id, title, reported_time, affected_tasks, revised_run_of_show,
        mitigation_steps, cost_impact, broadcast_message, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        inc_id, event_id, req.description, incident_response["reported_time"],
        json.dumps(incident_response["affected_tasks"]),
        json.dumps(incident_response["revised_run_of_show"]),
        json.dumps(incident_response["mitigation_steps"]),
        incident_response["cost_impact"],
        incident_response["broadcast_message"],
        "Active"
    ))
    conn.commit()
    conn.close()

    return {"incident_id": inc_id, **incident_response}

@app.post("/api/events/{event_id}/timeline-shift")
def shift_timeline(event_id: str, payload: Dict[str, Any] = Body(...)):
    data = get_event_by_id(event_id)
    if not data:
        raise HTTPException(status_code=404, detail="Event not found")

    task_id = payload.get("task_id")
    new_deadline = payload.get("new_deadline")
    tasks = data["tasks"]

    result = recalculate_cascade(tasks, task_id, new_deadline)
    if result.get("success"):
        conn = get_db()
        cursor = conn.cursor()
        # Update shifted task
        cursor.execute("UPDATE tasks SET deadline = ? WHERE event_id = ? AND id = ?", (new_deadline, event_id, task_id))
        # Update cascade tasks
        for upd in result.get("cascade_updates", []):
            cursor.execute("UPDATE tasks SET deadline = ? WHERE event_id = ? AND id = ?", (upd["new_deadline"], event_id, upd["id"]))
        conn.commit()
        conn.close()

    return result

@app.post("/api/events/{event_id}/budget-items")
def add_budget_item(event_id: str, item: BudgetItemModel):
    conn = get_db()
    cursor = conn.cursor()
    item_id = item.id or str(uuid.uuid4())
    cursor.execute("""
    INSERT INTO budget_items (id, event_id, category, item_name, amount, confirmation_status, basis, is_fixed, is_adjustable, is_optional, paid_amount, payment_status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        item_id, event_id, item.category, item.item_name, item.amount,
        item.confirmation_status, item.basis, 1 if item.is_fixed else 0,
        1 if item.is_adjustable else 0, 1 if item.is_optional else 0,
        item.paid_amount, item.payment_status, item.notes or ""
    ))
    conn.commit()
    conn.close()
    return {"success": True, "id": item_id}

@app.put("/api/events/{event_id}/budget-items/{item_id}")
def update_budget_item(event_id: str, item_id: str, item: BudgetItemModel):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE budget_items SET
        category = ?, item_name = ?, amount = ?, confirmation_status = ?,
        basis = ?, is_fixed = ?, is_adjustable = ?, is_optional = ?,
        paid_amount = ?, payment_status = ?, notes = ?
    WHERE id = ? AND event_id = ?
    """, (
        item.category, item.item_name, item.amount, item.confirmation_status,
        item.basis, 1 if item.is_fixed else 0, 1 if item.is_adjustable else 0,
        1 if item.is_optional else 0, item.paid_amount, item.payment_status,
        item.notes or "", item_id, event_id
    ))
    conn.commit()
    conn.close()
    return {"success": True}

@app.delete("/api/events/{event_id}/budget-items/{item_id}")
def delete_budget_item(event_id: str, item_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM budget_items WHERE id = ? AND event_id = ?", (item_id, event_id))
    conn.commit()
    conn.close()
    return {"success": True}

@app.put("/api/events/{event_id}/tasks/{task_id}")
def update_task_status(event_id: str, task_id: str, payload: Dict[str, Any] = Body(...)):
    conn = get_db()
    cursor = conn.cursor()
    status = payload.get("status")
    deadline = payload.get("deadline")
    if status:
        cursor.execute("UPDATE tasks SET status = ? WHERE id = ? AND event_id = ?", (status, task_id, event_id))
    if deadline:
        cursor.execute("UPDATE tasks SET deadline = ? WHERE id = ? AND event_id = ?", (deadline, task_id, event_id))
    conn.commit()
    conn.close()
    return {"success": True}

@app.post("/api/settings/api-key")
def set_api_key(payload: Dict[str, str] = Body(...)):
    key = payload.get("gemini_api_key", "").strip()
    # Save to backend/.env
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    with open(env_path, "w", encoding="utf-8") as f:
        f.write(f"GEMINI_API_KEY={key}\n")
    os.environ["GEMINI_API_KEY"] = key
    return {"success": True, "message": "Gemini API key configured successfully"}
