# Planora AI — Adaptive Event-Planning Agent & Execution Engine

> **"Not a generic chatbot returning budget tables and checklists, but a constraint-aware event planner, budget negotiator, creative director, logistics coordinator, and risk analyst working from one consistent event plan."**

---

## 🌟 Overview & Tech Stack

Planora AI transforms natural-language visions and complex real-world constraints into executable, financially locked, resilient event plans. It strictly enforces the **Planora AI Master System Prompt** (Sections 1 through 16).

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend**: FastAPI (Python 3.12), Pydantic v2, Uvicorn
- **Database**: SQLite with persistent relational schema (`events`, `budget_items`, `tasks`, `stress_tests`, `vendors`, `stakeholders`, `incidents`, `chat_messages`)
- **AI Core**: Google Gemini 2.0 Flash integration with deterministic fallback constraint engine

---

## 🏛️ Implementation of the 16 Master System Prompt Pillars

| Section | Pillar | Planora AI Implementation |
|---|---|---|
| **§ 1** | **Role & Mission** | Adaptive agent optimizing for budget feasibility, guest comfort, accessibility, cultural nuances, and timeline resilience. |
| **§ 2** | **Core Operating Principles** | Budget as a hard ceiling; distinguishes confirmed vs quoted vs estimated vs unknown; tools for deterministic calculations; no hallucinated bookings. |
| **§ 3** | **Conversational Event Intake** | Progressive intake modal capturing occasion, dates, location, budget ceiling, guests, atmosphere, protected priorities, and cultural traditions. |
| **§ 4** | **Vibe-to-Event Generator** | Creative Studio tab translating vibes into color palettes (click-to-copy hex), decor direction, lighting concepts, and culinary styling. |
| **§ 5** | **Budget Negotiator** | Itemized budget tracking confirmation status, fixed vs adjustable flags, contingency isolation, and 1-click **Interactive Trade-offs Simulator**. |
| **§ 6** | **Timeline & Logistics Engine** | Dependency-aware DAG timeline with Critical Path calculation, overdue detection, and automatic **Cascade Rescheduling**. |
| **§ 7** | **Plan Stress-Tester (Red Team)** | Structured pre-mortem simulating 6 failure modes (weather, 48h vendor cancellation, +20% guest surge, logistics delays, accessibility snags). |
| **§ 8** | **Cultural Intelligence & Accessibility** | Multi-day ceremony checklists with officiant confirmation flags, plus universal accessibility & dietary audits. |
| **§ 9** | **Vendor Outreach & Comparison** | Vendor comparison matrix tracking deliverables, suitability fit scores, contract conditions, and 1-click RFP generator. |
| **§ 10** | **Family & Stakeholder Alignment** | Multi-stakeholder preference tracker with neutral compromise engine (e.g. parent vs couple priorities). |
| **§ 11** | **Day-Of Live Mode** | Emergency incident response console with real-time revised Run-of-Show, immediate mitigation checklist, and guest broadcast SMS drafts. |
| **§ 12** | **Community Events** | Municipal permit checklists, volunteer shift rosters, crowd flow, and sponsor pitch outlines. |
| **§ 13** | **Post-Event Learning** | Actual expenditure variance scorecard, vendor ratings, and retrospective lessons. |
| **§ 14** | **Structured Output Contract** | Machine-readable JSON contract backing interactive dashboards rather than burying plans in chat transcripts. |
| **§ 15** | **Final Validation Gate** | 10-point mathematical reconciliation and constraint audit with 0-100 readiness scoring. |
| **§ 16** | **Communication Style** | Practical, decisive trade-off explanations without false certainty. |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (3.10+)

### 2. Launching Both Services
Simply double click `run_planora.bat` or run in two terminal tabs:

#### Terminal 1 — Backend (FastAPI):
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*API Swagger Documentation available at:* [http://localhost:8000/docs](http://localhost:8000/docs)

#### Terminal 2 — Frontend (React + Vite):
```bash
cd frontend
npm run dev
```
*Web Application available at:* [http://localhost:5173](http://localhost:5173)

---

## 🧪 Pre-loaded Rich Demo Events

Planora AI comes pre-seeded with 3 realistic events in SQLite:
1. **The Royal Heritage Wedding: Ananya & Kabir** (3-Day Udaipur destination wedding, ₹35,00,000 budget, Vedic muhurtham rituals, Jain banqueting, golf carts for seniors).
2. **Stanford Class of 2016 — 10 Year Tech & Chill Reunion** (Half Moon Bay coastal bluff, $48,000 budget, open craft bar, 2010s live indie band, sound permit curfew).
3. **GreenRoots Community Harvest & Solar Fundraiser** (Oakwood Central Park, $18,500 budget, 600 attendees, volunteer shifts, ASL interpreter, zero-waste).

---

## 🔑 Optional Gemini API Key
To connect directly with live Gemini 2.0 Flash:
1. Open the **Settings** modal (gear icon in the top right).
2. Enter your `GEMINI_API_KEY`.
3. It is stored securely in `backend/.env`.
*(If no key is configured, Planora automatically runs on its deterministic system prompt constraint engine).*
