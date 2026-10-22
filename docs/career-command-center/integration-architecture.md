# Career Command Center — Integration Architecture
**Document Version:** 1.0.0  
**Date:** 2026-10-21T00:18:00+05:30  
**Architect:** Antigravity Senior Full-Stack & Integration Engineer  

---

## 1. Architectural Philosophy: Additive Non-Disruptive Integration
The Career Command Center integrates strictly above the existing job-search automation without altering the foundational schedule, data schema, or operational behaviors.

```
       [Gemini Time-Based Scheduler]
       (ID: b12f7fda-6824-4f7f-a2b6-e1e4606bf362)
       Cron: 0 9 * * 1-5 (Weekdays ~9:00 AM IST)
                    │
                    ▼
       [AI Job-Search Discovery Agent]
       (Cap: max 25 jobs/run; 0-2 yrs filter)
                    │
                    ├─── Emits AgentEvent ───┐
                    ▼                        ▼
      [Google Sheet / Excel Master Tracker]  [Telemetry / Event Stream]
      Tab 1: Dashboard & Checklist           (Tab 7 + In-Memory SSE Ring Buffer)
      Tab 2: Job Pipeline (23 jobs)                  │
      Tab 3: Outreach Tracker (18 contacts)          │
      Tab 4: Daily Summary                           ▼
      Tab 5: Candidate Profile (Master v3)  [Career Command Center Backend API]
      Tab 6: Tailored Resumes (9 editions)  • GET /api/dashboard/overview
      Tab 7: System Audit & Telemetry       • GET /api/jobs, /api/outreach
                    │                       • GET /api/profile, PUT /api/profile
                    │                       • GET /api/runs, GET /api/events/stream
                    │                       • POST /api/auth/login, POST /api/auth/logout
                    └───────────────────────▶        │
                                                     ▼
                                        [Career Command Center Web UI]
                                        (React + TypeScript + Vanilla CSS)
```

---

## 2. System Layers & Boundaries

### 2.1 Layer 1: Scheduler & Trigger Engine
* **Service:** Gemini Time-Based Scheduler (`b12f7fda-6824-4f7f-a2b6-e1e4606bf362`).
* **Configuration:** Cron `0 9 * * 1-5`, Timezone: `Asia/Kolkata`.
* **Execution Boundary:** No secondary scheduler is permitted. The dashboard queries and computes the exact next scheduled run in `Asia/Kolkata` time, handling weekends, holidays, and execution state faithfully.

### 2.2 Layer 2: Authoritative Data Store
* **Store:** `Vikas Thirumanyam — AI & Data Job Discovery Master Tracker.xlsx` (mirrored from Google Sheet `1NnQzoTppnqQQxO7o6Bzo6CZN-kajKLIHhvVFgi7XP6g`).
* **Rule of Authority:** The spreadsheet remains the sole authoritative source of truth for:
  - 23 Discovered job records, match scores, and hiring stages (19 eligible, 3 hard-excluded).
  - Outreach contacts, draft references, and recruiter tracking under the Zero-Bounce policy.
  - Candidate profile details, exact verified education dates, and 9 tailored resume versions.
* **Write Discipline:** Mutations (such as approved profile adjustments) are validated, written to the workbook with atomic cell updates, and read back immediately to verify persistence.

### 2.3 Layer 3: Resume & Outreach Intelligence (Master v3)
* **Google Doc Reference:** `1eN9-xYDN-ob9eu4QLL-x-hnhOHRZ1wBBHFcax7QM1jA` (Master Resume v3 & 9 ATS Tailored Resumes, Part 7).
* **Word Document Baseline:** `VIKAS THIRUMANYAM.docx` (Part 7: Master Resume v3 with exact education lines and embedded hyperlinks).
* **Google Drive PDFs:** 5 single-page ATS-verified PDFs (Accuris, Accenture, Discover Dollar, HCLTech, Airbus).
* **Evidence Grounding:** All claims tie directly to verified projects (`Enterprise Support AI RAG Agent`, `Zepto Data & AI Platform`, `Infosys Springboard EPL Workbench`, `Edunet Foundation`) and formal education (`Masai × IIT Patna Jan 2026–Sep 2026`, `MCA Presidency Univ Aug 2023–May 2025`, `B.Com SVU Aug 2018–May 2021`).

### 2.4 Layer 4: Outreach & Draft Review Gate
* **Gmail Authorization:** Draft creation and query scope (`vikastirumanyam@gmail.com`).
* **Mandatory Human Approval Gate:** Auto-send is permanently disabled. Drafts can only be inspected, edited, and approved by the candidate. Deep links point directly to `https://mail.google.com/mail/?authuser=vikastirumanyam@gmail.com#all?compose=...`.

### 2.5 Layer 5: Dashboard Backend API
* **Engine:** Node.js 24 + Express + TypeScript.
* **Real-Time Streaming:** Server-Sent Events (`GET /api/events/stream`) backed by an in-memory ring buffer with replay for missed events (`Last-Event-ID` header support) and durable logging into Tab 7 of the workbook.
* **Authentication:** Private session authentication using HTTP-only secure cookies and bearer token fallback, with bcrypt-hashed credentials and rate limiting.

### 2.6 Layer 6: Dashboard Frontend Application
* **Framework:** React 19 + TypeScript + Vite.
* **Styling System:** Vanilla CSS design tokens following the requested aesthetic: soft ivory/warm white background (`#fcfbf9`), near-black text (`#14171a`), restrained cobalt/electric-blue accent (`#1a56db`), crisp typography (Inter/system-ui), subtle borders, clean status badges, zero distracting animations.

---

## 3. Structured Progress Event Contract (`AgentEvent`)
Every agent action emits a strictly typed telemetry event:

```typescript
export interface AgentEvent {
  eventId: string;           // Unique monotonic ID e.g., "EVT-014"
  runId: string;             // Associated run e.g., "RUN-20261021-001"
  timestamp: string;         // ISO 8601 with explicit +05:30 offset
  stage: string;             // Canonical stage name
  status: "started" | "progress" | "succeeded" | "failed" | "skipped";
  message: string;           // Human-readable narrative
  recordId?: string;         // Related Job ID, Draft ID, or Document ID
  durationMs?: number;       // Execution duration if applicable
  retryCount?: number;       // Retry count if applicable
  details?: Record<string, unknown>;
}
```

Canonical Stage Names:
1. `1. Scheduled run started`
2. `2. Job discovery started`
3. `3. Sources processed`
4. `4. Candidate jobs normalized`
5. `5. Duplicate detection completed`
6. `6. Eligibility filters applied`
7. `7. Job-fit evaluation completed`
8. `8. Resume evidence and tailoring prepared`
9. `9. Recruiter and hiring-contact research completed`
10. `10. Gmail drafts prepared or updated`
11. `11. Google Sheets records updated`
12. `12. Final verification completed`
13. `13. Run summary published`

---

## 4. Security & Access Control Architecture
1. **Single-User Access Model:** The dashboard is built specifically for Vikas Thirumanyam (`vikastirumanyam@gmail.com`).
2. **Session Security:**
   - Server-side session tokens generated via cryptographically secure random bytes (`crypto.randomBytes(32)`).
   - Cookies set with `HttpOnly`, `SameSite=Strict`, and `Secure` (in HTTPS production).
3. **Audit Trail:** Any mutation to permitted candidate profile fields is recorded in the operational telemetry log with timestamp, originating IP, and changed fields.
4. **Secret Quarantine:** OAuth secrets, API keys, and session secrets are loaded exclusively via environment variables (`.env`). No secret is ever included in frontend bundles.
