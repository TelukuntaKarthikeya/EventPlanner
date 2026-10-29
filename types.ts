export interface EventData {
  id: string;
  name: string;
  occasion: string;
  event_type: 'wedding' | 'birthday' | 'reunion' | 'festival' | 'college_event' | 'community';
  date_range: string;
  location: string;
  guest_count: number;
  total_budget: number;
  currency: string;
  contingency_allocated: number;
  contingency_committed: number;
  atmosphere: string;
  theme: string;
  visual_style: string;
  color_palette: string[];
  protected_priorities: string[];
  cultural_traditions: string[];
  accessibility_requirements: string[];
  status: 'Planning' | 'Red Teaming' | 'Ready' | 'Day-Of' | 'Post-Event';
  created_at?: string;
  updated_at?: string;
}

export interface BudgetItem {
  id: string;
  event_id: string;
  category: string;
  item_name: string;
  amount: number;
  confirmation_status: 'confirmed' | 'quoted' | 'estimated' | 'unknown';
  basis: string;
  is_fixed: boolean;
  is_adjustable: boolean;
  is_optional: boolean;
  paid_amount: number;
  payment_status: 'unpaid' | 'deposit_paid' | 'fully_paid';
  notes?: string;
}

export interface TaskItem {
  id: string;
  event_id: string;
  name: string;
  description: string;
  deadline: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  owner: string;
  dependencies: string[];
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked' | 'Overdue';
  estimated_cost: number;
  contingency_action?: string;
  category: string;
}

export interface StressTestScenario {
  id: string;
  event_id: string;
  scenario_name: string;
  severity: 'High' | 'Medium' | 'Low';
  likelihood: 'High' | 'Medium' | 'Low';
  first_failure: string;
  affected_items: string[];
  invalidated_assumptions: string[];
  immediate_response: string;
  backup_plan: string;
  financial_impact: number;
  required_approvals: string[];
  status: 'Identified' | 'Mitigated' | 'Monitored';
}

export interface Vendor {
  id: string;
  event_id: string;
  category: string;
  name: string;
  contact_info: string;
  quote_amount: number;
  deliverables: string;
  terms: string;
  cancellation_policy: string;
  fit_score: number;
  status: 'Outreach Sent' | 'Quote Received' | 'Negotiating' | 'Contracted' | 'Rejected';
  notes: string;
}

export interface Stakeholder {
  id: string;
  event_id: string;
  name: string;
  role: string;
  stated_priorities: string[];
  budget_opinion: string;
  guest_count_opinion: number;
  notes: string;
}

export interface Incident {
  id: string;
  event_id: string;
  title: string;
  reported_time: string;
  affected_tasks: string[];
  revised_run_of_show: {
    time: string;
    activity: string;
    status: string;
    note: string;
  }[];
  mitigation_steps: string[];
  cost_impact: number;
  broadcast_message: string;
  status: string;
}

export interface BudgetReconciliation {
  total_budget: number;
  total_projected_cost: number;
  remaining_budget: number;
  is_over_budget: boolean;
  deficit: number;
  budget_health: 'HEALTHY' | 'TIGHT' | 'DEFICIT';
  contingency_allocated: number;
  contingency_committed: number;
  available_contingency: number;
  confirmed_total: number;
  quoted_total: number;
  estimated_total: number;
  unknown_count: number;
  fixed_total: number;
  adjustable_total: number;
  optional_total: number;
  paid_total: number;
  category_breakdown: Record<string, number>;
}

export interface TimelineAnalysis {
  total_tasks: number;
  completed_count: number;
  in_progress_count: number;
  overdue_tasks: {
    id: string;
    name: string;
    deadline: string;
    days_overdue: number;
  }[];
  conflict_tasks: {
    child_id: string;
    child_name: string;
    child_deadline: string;
    parent_id: string;
    parent_name: string;
    parent_deadline: string;
    issue: string;
  }[];
  has_circular_dependencies: boolean;
  critical_path_ids: string[];
  critical_tasks: TaskItem[];
}

export interface ValidationCheck {
  check: string;
  description: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  details: string;
}

export interface ValidationReport {
  is_valid: boolean;
  score: number;
  budget_reconciled: boolean;
  within_budget_ceiling: boolean;
  contingency_protected: boolean;
  dependencies_valid: boolean;
  fixed_commitments_safe: boolean;
  priorities_respected: boolean;
  unknown_costs_flagged: number;
  checks: ValidationCheck[];
}

export interface FullEventPlan {
  event: EventData;
  budget_items: BudgetItem[];
  tasks: TaskItem[];
  stress_tests: StressTestScenario[];
  vendors: Vendor[];
  stakeholders: Stakeholder[];
  incidents: Incident[];
  reconciliation: BudgetReconciliation;
  timeline_analysis: TimelineAnalysis;
  validation: ValidationReport;
}

export interface TradeoffScenario {
  id: string;
  title: string;
  description: string;
  changes: {
    item_name: string;
    category: string;
    old_amount: number;
    new_amount: number;
    reduction: number;
  }[];
  impact_summary: string;
  risk_assessment: string;
}

export interface TradeoffResponse {
  feasible: boolean;
  adjusted_category: string;
  old_amount: number;
  new_amount: number;
  delta: number;
  scenarios: TradeoffScenario[];
  message?: string;
}

export interface DayOfIncidentRequest {
  event_id: string;
  incident_type: string;
  description: string;
  custom_time?: string;
  severity?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  engine_source?: string;
  payload?: any;
}
