import {
  EventData, FullEventPlan, TradeoffResponse,
  DayOfIncidentRequest, BudgetItem
} from './types';

const API_BASE = '/api';

export async function fetchAllEvents(): Promise<EventData[]> {
  const res = await fetch(`${API_BASE}/events`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function fetchEventDetails(eventId: string): Promise<FullEventPlan> {
  const res = await fetch(`${API_BASE}/events/${eventId}`);
  if (!res.ok) throw new Error('Failed to fetch event details');
  return res.json();
}

export async function createNewEvent(payload: Partial<EventData>): Promise<{ success: boolean; event_id: string }> {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create event');
  return res.json();
}

export async function updateEventDetails(eventId: string, payload: Partial<EventData>): Promise<void> {
  const res = await fetch(`${API_BASE}/events/${eventId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update event');
}

export async function sendChatMessage(eventId: string, message: string): Promise<{
  reply: string;
  engine_source: string;
  budget_reconciliation: any;
  timeline_analysis: any;
  validation: any;
}> {
  const res = await fetch(`${API_BASE}/events/${eventId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_id: eventId, message }),
  });
  if (!res.ok) throw new Error('Chat failed');
  return res.json();
}

export async function simulateTradeoff(
  eventId: string,
  category: string,
  newAmount: number
): Promise<TradeoffResponse> {
  const res = await fetch(`${API_BASE}/events/${eventId}/tradeoff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: eventId,
      category_adjusted: category,
      new_amount: newAmount,
    }),
  });
  if (!res.ok) throw new Error('Failed to compute trade-offs');
  return res.json();
}

export async function applyTradeoffScenario(
  eventId: string,
  scenario: any,
  adjustedCategory?: string,
  newAmount?: number
): Promise<void> {
  const res = await fetch(`${API_BASE}/events/${eventId}/apply-tradeoff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      changes: scenario.changes,
      adjusted_category: adjustedCategory,
      new_amount: newAmount,
    }),
  });
  if (!res.ok) throw new Error('Failed to apply trade-off scenario');
}

export async function runRedTeamStressTests(eventId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/events/${eventId}/stress-test`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to execute stress tests');
  return res.json();
}

export async function triggerLiveDayOfIncident(
  eventId: string,
  incidentType: string,
  description: string,
  customTime?: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/events/${eventId}/live-incident`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: eventId,
      incident_type: incidentType,
      description,
      custom_time: customTime,
    }),
  });
  if (!res.ok) throw new Error('Failed to report live incident');
  return res.json();
}

export async function shiftTaskTimeline(
  eventId: string,
  taskId: string,
  newDeadline: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/events/${eventId}/timeline-shift`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      task_id: taskId,
      new_deadline: newDeadline,
    }),
  });
  if (!res.ok) throw new Error('Failed to shift timeline');
  return res.json();
}

export async function addOrUpdateBudgetItem(
  eventId: string,
  item: Partial<BudgetItem>
): Promise<void> {
  const isUpdate = !!item.id;
  const url = isUpdate
    ? `${API_BASE}/events/${eventId}/budget-items/${item.id}`
    : `${API_BASE}/events/${eventId}/budget-items`;
  const method = isUpdate ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Failed to save budget item');
}

export async function deleteBudgetItem(eventId: string, itemId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/events/${eventId}/budget-items/${itemId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete budget item');
}

export async function updateTaskStatus(
  eventId: string,
  taskId: string,
  status: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/events/${eventId}/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update task');
}

export async function saveGeminiApiKey(apiKey: string): Promise<void> {
  const res = await fetch(`${API_BASE}/settings/api-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gemini_api_key: apiKey }),
  });
  if (!res.ok) throw new Error('Failed to save API key');
}

export async function checkBackendHealth(): Promise<{
  gemini_api_key_configured: boolean;
  engine: string;
}> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}
