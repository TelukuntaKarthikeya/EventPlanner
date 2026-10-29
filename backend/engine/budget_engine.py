from typing import List, Dict, Any, Tuple

def reconcile_budget(total_budget: float, budget_items: List[Dict[str, Any]], contingency_allocated: float, contingency_committed: float) -> Dict[str, Any]:
    """
    Reconciles all budget totals deterministically per Section 5 of Planora AI Master Prompt:
    Total projected cost = sum of all projected expenses (excluding duplicate contingency if counted separately).
    Remaining budget = total budget - total projected cost.
    Available contingency = allocated contingency - committed contingency.
    """
    total_projected = 0.0
    confirmed_total = 0.0
    quoted_total = 0.0
    estimated_total = 0.0
    unknown_count = 0
    fixed_total = 0.0
    adjustable_total = 0.0
    optional_total = 0.0
    paid_total = 0.0

    category_breakdown: Dict[str, float] = {}

    for item in budget_items:
        amt = float(item.get("amount", 0.0))
        total_projected += amt
        cat = item.get("category", "Other")
        category_breakdown[cat] = category_breakdown.get(cat, 0.0) + amt

        status = item.get("confirmation_status", "estimated").lower()
        if status == "confirmed":
            confirmed_total += amt
        elif status == "quoted":
            quoted_total += amt
        elif status == "unknown":
            unknown_count += 1
        else:
            estimated_total += amt

        if item.get("is_fixed"):
            fixed_total += amt
        elif item.get("is_optional"):
            optional_total += amt
        else:
            adjustable_total += amt

        paid_total += float(item.get("paid_amount", 0.0))

    remaining_budget = total_budget - total_projected
    available_contingency = max(0.0, contingency_allocated - contingency_committed)
    is_over_budget = total_projected > total_budget
    deficit = max(0.0, total_projected - total_budget)

    # Health status
    if is_over_budget:
        budget_health = "DEFICIT"
    elif remaining_budget < 0.05 * total_budget:
        budget_health = "TIGHT"
    else:
        budget_health = "HEALTHY"

    return {
        "total_budget": total_budget,
        "total_projected_cost": round(total_projected, 2),
        "remaining_budget": round(remaining_budget, 2),
        "is_over_budget": is_over_budget,
        "deficit": round(deficit, 2),
        "budget_health": budget_health,
        "contingency_allocated": round(contingency_allocated, 2),
        "contingency_committed": round(contingency_committed, 2),
        "available_contingency": round(available_contingency, 2),
        "confirmed_total": round(confirmed_total, 2),
        "quoted_total": round(quoted_total, 2),
        "estimated_total": round(estimated_total, 2),
        "unknown_count": unknown_count,
        "fixed_total": round(fixed_total, 2),
        "adjustable_total": round(adjustable_total, 2),
        "optional_total": round(optional_total, 2),
        "paid_total": round(paid_total, 2),
        "category_breakdown": {k: round(v, 2) for k, v in category_breakdown.items()}
    }

def calculate_tradeoffs(
    total_budget: float,
    budget_items: List[Dict[str, Any]],
    protected_priorities: List[str],
    adjusted_category: str,
    new_category_amount: float
) -> Dict[str, Any]:
    """
    When a cost changes or user changes a category amount:
    1. Recalculates allocations deterministically.
    2. Preserves fixed expenses and protected priorities.
    3. Reallocates only categories that can reasonably change (adjustable, non-fixed, non-protected).
    4. Proposes 3 concrete options:
       - Option A: Trim Optional Decor & Non-Essential Items
       - Option B: Moderate balanced shave across all adjustable items
       - Option C: Restructure secondary entertainment / printing / favors
    5. Explains what improves, what is sacrificed, and what new risks appear.
    """
    current_reconciliation = reconcile_budget(total_budget, budget_items, 0, 0)
    current_cat_total = current_reconciliation["category_breakdown"].get(adjusted_category, 0.0)
    delta = new_category_amount - current_cat_total

    # Find candidates for reduction: non-fixed, non-contingency, not matching protected priority keywords
    candidates = []
    for item in budget_items:
        cat = item.get("category", "")
        is_fixed = item.get("is_fixed", False)
        is_protected = any(p.lower() in cat.lower() or p.lower() in item.get("item_name", "").lower() for p in protected_priorities)
        if cat != adjusted_category and not is_fixed and not is_protected and cat != "Contingency reserve":
            candidates.append(item)

    total_candidate_pool = sum(c.get("amount", 0.0) for c in candidates)

    scenarios = []

    if delta > 0:
        # Cost increased by delta
        if total_candidate_pool < delta:
            # Cannot reallocate without touching protected priorities or authorizing budget increase
            return {
                "feasible": False,
                "delta": delta,
                "message": f"Increase of {delta:,.2f} in '{adjusted_category}' exceeds all non-protected adjustable budgets ({total_candidate_pool:,.2f}). User authorization required to increase budget or de-prioritize a protected item.",
                "scenarios": []
            }

        # Scenario 1: Target optional & decorative elements first
        s1_changes = []
        needed = delta
        # Sort candidates: optional first, then non-confirmed
        s1_pool = sorted(candidates, key=lambda x: (not x.get("is_optional", False), x.get("confirmation_status") == "confirmed"))
        for item in s1_pool:
            if needed <= 0:
                break
            cur = item.get("amount", 0.0)
            reduction = min(cur * 0.45, needed)  # max 45% reduction
            if reduction > 0:
                s1_changes.append({
                    "item_name": item.get("item_name"),
                    "category": item.get("category"),
                    "old_amount": cur,
                    "new_amount": round(cur - reduction, 2),
                    "reduction": round(reduction, 2)
                })
                needed -= reduction

        scenarios.append({
            "id": "scenario-1",
            "title": "Aesthetic Trim (Preserves Guest Experience & Food)",
            "description": f"Absorbs +{delta:,.2f} by reducing non-essential decor, ambient staging, and secondary printed assets.",
            "changes": s1_changes,
            "impact_summary": "Protects catering quality, live performance, and accessibility. Sacrifices dense floral arches and custom printed stationery.",
            "risk_assessment": "Low risk. Minimal impact on guest satisfaction."
        })

        # Scenario 2: Proportional balanced reduction
        s2_changes = []
        if total_candidate_pool > 0:
            ratio = min(1.0, delta / total_candidate_pool)
            for item in candidates:
                cur = item.get("amount", 0.0)
                reduction = round(cur * ratio, 2)
                s2_changes.append({
                    "item_name": item.get("item_name"),
                    "category": item.get("category"),
                    "old_amount": cur,
                    "new_amount": round(cur - reduction, 2),
                    "reduction": reduction
                })

        scenarios.append({
            "id": "scenario-2",
            "title": "Balanced Pro-Rata Reallocation",
            "description": f"Distributes the +{delta:,.2f} cost evenly across all flexible categories ({round(ratio*100, 1)}% reduction each).",
            "changes": s2_changes,
            "impact_summary": "No single vendor category feels a drastic cut; keeps all components intact at a slightly leaner tier.",
            "risk_assessment": "Medium risk: Requires re-negotiating minor scope changes across multiple vendors."
        })

        # Scenario 3: Targeted Tech & Digital Optimization
        s3_changes = []
        needed3 = delta
        for item in candidates:
            cat = item.get("category", "")
            cur = item.get("amount", 0.0)
            if "Transport" in cat or "Invitations" in cat or "Entertainment" in cat:
                red = min(cur * 0.35, needed3)
                if red > 0:
                    s3_changes.append({
                        "item_name": item.get("item_name"),
                        "category": cat,
                        "old_amount": cur,
                        "new_amount": round(cur - red, 2),
                        "reduction": round(red, 2)
                    })
                    needed3 -= red

        scenarios.append({
            "id": "scenario-3",
            "title": "Digital & Logistics Streamlining",
            "description": "Replaces paper invitation postage with digital RSVP concierge and optimizes shuttle runs into 2 larger group coaches.",
            "changes": s3_changes,
            "impact_summary": "Low visual impact on event aesthetics; saves logistics and print overhead.",
            "risk_assessment": "Low risk: Requires sending WhatsApp/SMS confirmations to guests."
        })

    else:
        # Cost decreased by delta (savings!)
        savings = abs(delta)
        scenarios.append({
            "id": "scenario-savings-1",
            "title": "Fortify Contingency Reserve",
            "description": f"Allocate the {savings:,.2f} savings directly into the contingency pool for weather or surge protection.",
            "changes": [{"item_name": "Contingency reserve", "category": "Contingency reserve", "old_amount": 0, "new_amount": savings, "reduction": -savings}],
            "impact_summary": "Maximizes resilience against day-of surprises without expanding event scope.",
            "risk_assessment": "Zero risk."
        })
        scenarios.append({
            "id": "scenario-savings-2",
            "title": "Enhance Guest Hospitality & Comfort",
            "description": f"Direct {savings:,.2f} toward guest shuttles, signature welcome mocktails, or live audio enhancement.",
            "changes": [],
            "impact_summary": "Noticeable uplift in guest experience while keeping overall budget exactly balanced.",
            "risk_assessment": "Low risk."
        })

    return {
        "feasible": True,
        "adjusted_category": adjusted_category,
        "old_amount": current_cat_total,
        "new_amount": new_category_amount,
        "delta": round(delta, 2),
        "scenarios": scenarios
    }
