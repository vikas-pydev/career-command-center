# Career Command Center — Current-State Audit (Phase Zero)
**Document Version:** 1.0.0  
**Audit Timestamp:** 2026-10-21T00:15:00+05:30  
**Target Environment:** Local Workspace (`c:\Users\vikas\Downloads\ai`), Windows 11, Node v24.11.1, Python 3.13.7  
**Auditor:** Antigravity Senior Full-Stack & Integration Engineer  

---

## 1. Executive Summary & Audit Scope
An exhaustive inspection of the local workspace, environment configuration, persistent data stores, and integration anchors was performed before authoring any dashboard code. 

The primary persistent artifact in the workspace is the authoritative workbook:
`Vikas Thirumanyam — AI & Data Job Discovery Master Tracker.xlsx` (206,396 bytes), which mirrors the 7-tab Google Sheet (`1NnQzoTppnqQQxO7o6Bzo6CZN-kajKLIHhvVFgi7XP6g`).

The audit verifies that:
1. The **Gemini Time-Based Scheduler** (`b12f7fda-6824-4f7f-a2b6-e1e4606bf362`) is active under cron `0 9 * * 1-5` (`Asia/Kolkata`, weekdays at ~9:00 AM IST) with a strict 25-job/run cap.
2. The **Master Tracker** contains 7 synchronized tabs (Dashboard & Action Checklist, Job Pipeline with 23 jobs [19 eligible, 3 hard-excluded, 1 historical], Outreach Tracker with 18 contact/outreach rows, Daily Summary, Candidate Profile & Resume Versions, Tailored Resumes & Outreach v2 with 9 tailored versions and outreach copy, and System Audit & Run Telemetry).
3. The **Master Resume (v3) & All 9 Job-Specific ATS Resumes** Google Doc (`1eN9-xYDN-ob9eu4QLL-x-hnhOHRZ1wBBHFcax7QM1jA`, Part 7) and 5 base ATS PDFs in Google Drive (`1TUw7fn...`, `14OkRbs...`, `1vJNp83...`, `1PSOyX3...`, `14idusox...`) are authenticated under `vikastirumanyam@gmail.com`.
4. **Gmail Integration & Zero-Bounce Policy:** Holds 6 unsent drafts with auto-send permanently disabled. Zero-Bounce policy permanently bans `campus.recruitment@accenture.com` (delivery failure); replaced with verified named recruiter `srilakshmi.ramagopal@accenture.com` (Accenture Bengaluru HR Partner, HR DB Row 22). Discover Dollar verified as `subrahmanya@discoverdollar.com` (HR DB Row 681). Zero external send operations have ever been executed.
5. In previous sandbox execution turns, direct execution was interrupted by `FileUploadDecorator` attempting to create `/working_dir/c_44c773263d3e6c47/user_uploaded_files` on an unmounted 9p path. In this local workspace, full Node.js 24 and Python 3.13 runtimes are available directly on the Windows filesystem.

---

## 2. Component-by-Component Audit

### 2.1 Scheduler & Trigger Architecture
* **Scheduler Identifier:** `b12f7fda-6824-4f7f-a2b6-e1e4606bf362`
* **Status:** `STATUS_ACTIVE`
* **Cron Expression:** `0 9 * * 1-5`
* **Timezone:** `Asia/Kolkata` (UTC+05:30)
* **Cadence:** Weekdays (Monday through Friday) at 09:00:00+05:30
* **Next Expected Run:** Wednesday, October 21, 2026 at ~09:00:00+05:30
* **Execution Cap:** Hard maximum of 25 candidate jobs per run.
* **Audit Verdict:** Verified active. No competing schedulers or parallel agents exist.

### 2.2 Authoritative Database (Google Sheet & Local Mirror)
* **Google Spreadsheet ID:** `1NnQzoTppnqQQxO7o6Bzo6CZN-kajKLIHhvVFgi7XP6g`
* **Local Master File:** `Vikas Thirumanyam — AI & Data Job Discovery Master Tracker.xlsx`
* **Total Tabs:** 7 tabs:
  1. `Dashboard & Action Checklist`: 24 rows, 8 columns. Summary metrics (19 eligible jobs, 4 blocked actions, 10 strong matches, 6 saved drafts) + 15 human action items.
  2. `Job Pipeline`: 39 standard columns, 23 distinct jobs (22 discovered active: `JOB-2026-001` through `JOB-2026-022`, plus 1 historical). 19 eligible for 0–2 yrs, 3 hard-excluded for >=3 yrs.
  3. `Outreach Tracker`: 14 columns, 18 contacts across Discover Dollar, Accuris, Airbus, Accenture, HCLTech, Infosys, Qualcomm, L&T EduTech, Wipro, Zoho, Cognizant, TCS, RevRag AI, Needl.ai, KLA Corp, and Techolution.
  4. `Daily Summary`: Execution summary metrics for runs through `RUN-20261021-002`.
  5. `Candidate Profile & Resume Vers`: Authoritative reference to `VIKAS THIRUMANYAM.docx` (Part 7 Master Resume v3), exact Education dates (Masai x IIT Patna Jan 2026–Sep 2026, MCA Presidency Aug 2023–May 2025, B.Com SVU Aug 2018–May 2021), all embedded project links, and all 7 certification verification links.
  6. `Tailored Resumes & Outreach v2`: 9 job-tailored resume summaries/skills/projects (Discover Dollar 96/100, RevRag AI 96/100, Accuris 95/100, Needl.ai 95/100, Airbus Aerolens 94/100, Accenture 93/100, KLA Corp 92/100, Techolution 91/100, HCLTech 90/100) and tailored outreach email copy with zero-bounce verified recipients.
  7. `System Audit & Run Telemetry`: System baseline table, Run History table (`RUN-20261020-001` through `RUN-20261021-002`), and structured Agent Event Log (`EVT-001` through `EVT-024`).

### 2.3 Candidate Profile & Resume Methodology (Master v3 Grounding)
* **Master Source:** Attached `VIKAS THIRUMANYAM.docx` (Part 7: Master Resume v3 & 9 Tailored ATS Resumes) + Google Doc ID: `1eN9-xYDN-ob9eu4QLL-x-hnhOHRZ1wBBHFcax7QM1jA`.
* **Exact Verified Education Dates & Lines:**
  - `Masai School × IIT Patna` (Jan 2026–Sep 2026) — AI-ML Program | Capstone: Zepto Data & AI Platform
  - `Master of Computer Applications (MCA)` (Aug 2023–May 2025) — Presidency University, Bengaluru
  - `B.Com. (Computer Applications)` (Aug 2018–May 2021) — Sri Venkateswara University, Tirupati
* **Verified Project Assets & Embedded Hyperlinks:**
  - *Enterprise Support AI RAG Agent:* Live App (`https://enterprise-support-ai-rag-agent.vercel.app/`), Video Demo (`https://lnkd.in/p/g56XA2ki`), GitHub (`https://github.com/vikas-pydev/enterprise-support-ai-rag-agent`). Tech: BM25 + dense hybrid retrieval, RRF, cross-encoder reranking, LangGraph workflows, grounded source citations, evidence-based refusal handling.
  - *Zepto Data & AI Platform:* GitHub (`https://github.com/vikas-pydev/zepto-data-ai-platform`). Tech: all-MiniLM-L6-v2, ChromaDB, LangGraph intent routing, 76 pytest tests, offline mock (`MOCK_LLM=1`), 7 SQL queries validated against Pandas.
* **Certifications (7 Verified Hyperlinks):**
  - Infosys Springboard AI Internship Certificate (Wingspan PDF)
  - IBM AI Fundamentals (Credly)
  - Build Real World AI Applications with Gemini and Imagen (Credly)
  - Prompt Design in Vertex AI (Credly)
  - Develop GenAI Apps with Gemini and Streamlit (Credly)
  - Deploy Multi-Agent Architectures (Credly)
  - KodeKloud AI Agent Fundamentals (KodeKloud verification link)

### 2.4 Gmail Draft & Outreach Layer
* **Account:** `vikastirumanyam@gmail.com`
* **OAuth Permissions:** Draft-only (`https://www.googleapis.com/auth/gmail.compose`).
* **Existing Drafts:** 6 unsent drafts preserved:
  1. `r-8159868102294701814` (Accenture Campus Recruitment)
  2. `r1374887159427357902` (Infosys TA — Candidate ID 1008791943)
  3. `r-4353617344403466119` (Qualcomm India BDC Careers)
  4. `r-5956255536446211565` (Accuris Recruiting)
  5. `r-3686840521095354095` (Discover Dollar — Subrahmanya Rao)
  6. `r4711525409096730367` (L&T EduTech)
* **Approval Boundary:** Human review and approval are strictly enforced. Automatic send endpoints are prohibited.

---

## 3. Discovered Technical Constraints & Boundaries
1. **Authoritative Storage Principle:** The Google Sheet (mirrored in `Vikas Thirumanyam — AI & Data Job Discovery Master Tracker.xlsx`) is the single source of truth for jobs, outreach, candidate profile, and resume versions. The dashboard must read and update this workbook without altering its schema or migrating records into an external database.
2. **Telemetry Mechanism:** Operational telemetry (`AgentEvent` logs and Run History) is already structured in Tab 7 (`System Audit & Run Telemetry`). The dashboard backend will maintain these records additively and stream live events via Server-Sent Events (SSE).
3. **No Phantom Success:** All metrics and statuses must indicate verified live data, last-known data, or unavailable data. No simulated or fabricated numbers.
4. **Security Boundary:** The dashboard must enforce server-side authentication with session protection, CSRF mitigation, input validation, and rate limiting. Credentials must never be embedded in client-side code.
