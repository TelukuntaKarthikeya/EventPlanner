from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class BudgetItemModel(BaseModel):
    id: Optional[str] = None
    event_id: Optional[str] = None
    category: str
    item_name: str
    amount: float
    confirmation_status: str = "estimated"  # confirmed, quoted, estimated, unknown
    basis: str = "Initial estimate"
    is_fixed: bool = False
    is_adjustable: bool = True
    is_optional: bool = False
    paid_amount: float = 0.0
    payment_status: str = "unpaid"  # unpaid, deposit_paid, fully_paid
    notes: Optional[str] = None

class TaskModel(BaseModel):
    id: str
    event_id: Optional[str] = None
    name: str
    description: Optional[str] = ""
    deadline: str  # YYYY-MM-DD or ISO / time
    priority: str = "Medium"  # Critical, High, Medium, Low
    owner: Optional[str] = "Event Host"
    dependencies: List[str] = []
    status: str = "Not Started"  # Not Started, In Progress, Completed, Blocked, Overdue
    estimated_cost: float = 0.0
    contingency_action: Optional[str] = ""
    category: Optional[str] = "General"

class StressTestScenario(BaseModel):
    id: Optional[str] = None
    event_id: Optional[str] = None
    scenario_name: str
    severity: str = "Medium"  # High, Medium, Low
    likelihood: str = "Medium"  # High, Medium, Low
    first_failure: str
    affected_items: List[str] = []
    invalidated_assumptions: List[str] = []
    immediate_response: str
    backup_plan: str
    financial_impact: float = 0.0
    required_approvals: List[str] = []
    status: str = "Identified"  # Identified, Mitigated, Monitored

class VendorModel(BaseModel):
    id: Optional[str] = None
    event_id: Optional[str] = None
    category: str
    name: str
    contact_info: Optional[str] = ""
    quote_amount: float = 0.0
    deliverables: str = ""
    terms: Optional[str] = ""
    cancellation_policy: Optional[str] = ""
    fit_score: int = 85
    status: str = "Quote Received"  # Outreach Sent, Quote Received, Negotiating, Contracted, Rejected
    notes: Optional[str] = ""

class StakeholderModel(BaseModel):
    id: Optional[str] = None
    event_id: Optional[str] = None
    name: str
    role: str
    stated_priorities: List[str] = []
    budget_opinion: Optional[str] = ""
    guest_count_opinion: Optional[int] = None
    notes: Optional[str] = ""

class IncidentModel(BaseModel):
    id: Optional[str] = None
    event_id: Optional[str] = None
    title: str
    reported_time: str
    affected_tasks: List[str] = []
    revised_run_of_show: List[Dict[str, Any]] = []
    mitigation_steps: List[str] = []
    cost_impact: float = 0.0
    broadcast_message: str = ""
    status: str = "Active"  # Active, Resolved, Monitoring

class EventModel(BaseModel):
    id: Optional[str] = None
    name: str
    occasion: str
    event_type: str  # wedding, birthday, reunion, festival, college_event, community
    date_range: str
    location: str
    guest_count: int
    total_budget: float
    currency: str = "USD"
    contingency_allocated: float = 0.0
    contingency_committed: float = 0.0
    atmosphere: Optional[str] = "Warm, elegant, and memorable"
    theme: Optional[str] = "Classic Contemporary"
    visual_style: Optional[str] = "Earthy neutrals with gold accents"
    color_palette: List[str] = ["#2D3748", "#D69E2E", "#F7FAFC", "#ED8936"]
    protected_priorities: List[str] = ["Catering & Dining", "Guest Comfort & Accessibility"]
    cultural_traditions: List[str] = []
    accessibility_requirements: List[str] = ["Step-free access", "Quiet sensory room", "Vegetarian & Gluten-Free options"]
    status: str = "Planning"  # Planning, Red Teaming, Ready, Day-Of, Post-Event

class EventPlanFull(BaseModel):
    event: EventModel
    budget_items: List[BudgetItemModel]
    tasks: List[TaskModel]
    stress_tests: List[StressTestScenario]
    vendors: List[VendorModel]
    stakeholders: List[StakeholderModel]
    incidents: List[IncidentModel]

class ChatMessage(BaseModel):
    role: str
    content: str
    structured_payload: Optional[Dict[str, Any]] = None
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    event_id: str
    message: str
    context: Optional[Dict[str, Any]] = None

class TradeoffRequest(BaseModel):
    event_id: str
    category_adjusted: str
    new_amount: float
    reason: Optional[str] = ""

class DayOfIncidentRequest(BaseModel):
    event_id: str
    incident_type: str  # photographer_late, extra_guests, weather_rain, ceremony_delay, custom
    description: str
    custom_time: Optional[str] = None
    severity: Optional[str] = "High"

class ValidationReport(BaseModel):
    is_valid: bool
    budget_reconciled: bool
    within_budget_ceiling: bool
    contingency_protected: bool
    dependencies_valid: bool
    fixed_commitments_safe: bool
    priorities_respected: bool
    unknown_costs_flagged: int
    checks: List[Dict[str, Any]]
    score: int
