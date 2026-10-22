# Career Command Center — Implementation Plan
**Document Version:** 1.0.0  
**Date:** 2026-10-21T00:22:00+05:30  
**Lead Engineer:** Antigravity Senior Full-Stack & Integration Engineer  

---

## 1. Project Phases & Deliverable Milestones

### Phase 1: Foundations & Telemetry Engine (Additive Event Stream)
- [x] Phase Zero Current-State Audit and Baseline Documentation.
- [x] Implement typed telemetry engine (`telemetryStore.ts`) supporting the `AgentEvent` schema (`EVT-001` through `EVT-024`).
- [x] Connect Server-Sent Events (SSE) broadcaster (`/api/events/stream`) with ring-buffer replay and `Last-Event-ID` recovery.
- [x] Map existing event telemetry (`EVT-001` through `EVT-024`) and run history (`RUN-20261020-001` through `RUN-20261021-002`) into the live event store.

### Phase 2: Authoritative Spreadsheet Integration Layer
- [x] Implement `trackerService.ts` reading `Vikas Thirumanyam — AI & Data Job Discovery Master Tracker.xlsx`.
- [x] Build typed mappers for all 7 sheets:
  - `Dashboard & Action Checklist` (summary metrics and 15 action items)
  - `Job Pipeline` (23 jobs with 39 fields: 19 eligible 0–2 yrs, 3 hard-excluded >=3 yrs, 1 historical)
  - `Outreach Tracker` (18 contacts, draft links, zero-bounce sanitization)
  - `Daily Summary` (daily run metrics)
  - `Candidate Profile & Resume Vers` (skills, projects, exact 3 education lines, all 7 certifications, and 5 targeted questions)
  - `Tailored Resumes & Outreach v2` (9 tailored resume versions & outreach email copies)
  - `System Audit & Run Telemetry` (audit baseline, run log, agent events)
- [x] Implement safe atomic write operations for candidate profile updates with read-after-write verification.

### Phase 3: Backend API & Security Implementation
- [x] Implement Express/TypeScript server with helmet, rate-limiting, and CORS protection.
- [x] Private session-based authentication (`POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`).
- [x] Provide typed REST endpoints:
  - `GET /api/dashboard/overview`
  - `GET /api/jobs` (with query filtering for company, location, match score, experience, status)
  - `GET /api/outreach`
  - `GET /api/profile`
  - `PUT /api/profile` (strict validation, change preview, read-after-write verification)
  - `GET /api/runs` and `GET /api/runs/:runId/events`
  - `GET /api/events/stream` (SSE)
  - `GET /api/integrations/status` (live scheduler, sheet sync, Gmail connection status)
- [x] Strictly omit any automated application submission or email sending endpoints.

### Phase 4: Modern, Responsive React + TypeScript Frontend
- [x] Initialize Vite + React 19 + TypeScript app in `client/` or root fullstack structure.
- [x] Author high-fidelity design system in Vanilla CSS:
  - Background: Soft ivory / warm white (`#fdfbf7`, `#f7f4ee`).
  - Surface cards: Pure white (`#ffffff`) with subtle 1px border (`#e6e2da`).
  - Text: Near-black (`#111827`) and slate muted text (`#4b5563`).
  - Accent: Restrained cobalt / electric blue (`#1d4ed8`, `#2563eb`).
  - Status indicators: Emerald (`#059669`), Amber (`#d97706`), Rose (`#dc2626`).
- [x] Build 7 core responsive sections:
  1. **Overview:** Agent status banner, next scheduled run in Asia/Kolkata, high-level metrics cards, action items checklist, quick links.
  2. **Live Agent Activity:** Real-time chronological timeline of `AgentEvent` records with status chips, stage icons, duration, and SSE live connection badge.
  3. **Job Pipeline:** Rich searchable, filterable table/cards with match score badges, matching skills, missing requirements, official application URLs, and tailored resume links.
  4. **Resume & Profile:** Candidate profile viewer with verified projects, exact education dates, 9 tailored resumes, 7 certification links, and a protected profile editing modal with diff preview and explicit confirmation.
  5. **Outreach & Gmail Drafts:** Recruiter contacts, Gmail draft statuses, draft body inspection, deep links to Gmail compose, Zero-Bounce Verified policy banner, and prominent "Auto-Send Disabled — Human Approval Enforced" banner.
  6. **Run History:** Table of historical runs (`RUN-001` through `RUN-20261021-002`) with drilldown into run logs, duration, outcomes, and event sequences.
  7. **Settings & Integrations:** Readouts for Gemini Scheduler (`b12f7fda-6824-4f7f-a2b6-e1e4606bf362`), Google Sheets connection, Gmail connection, timezone `Asia/Kolkata`, and 25-job cap.

### Phase 5: Testing, Validation & Verification
- [x] Unit tests for:
  - `AgentEvent` schema validation and monotonic event ordering (`EVT-001` through `EVT-024`).
  - Next scheduled run calculation (handling Asia/Kolkata weekdays and weekends).
  - Tracker data parsing and field mapping (23 jobs, 19 eligible, 9 tailored resumes).
  - Zero-Bounce recruiter email sanitization (`campus.recruitment@accenture.com` banned).
  - Candidate profile validation rules (exact education dates, embedded links).
  - Deduplication and experience exclusion filters.
- [x] Integration tests for:
  - Express API authentication and route protection.
  - SSE event delivery and reconnection recovery.
  - Safe profile update with read-after-write verification.
- [x] Regression verification confirming the existing 25-job cap, 9:00 AM IST schedule, and human approval boundary.
- [x] Full automated test suite passes: 78 tests passed, 0 failed.
- [x] Production client bundle builds cleanly: `tsc -b && vite build` succeeded.
