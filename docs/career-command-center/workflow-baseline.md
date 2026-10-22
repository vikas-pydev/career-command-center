# Career Command Center — Workflow Baseline & Operational Rules
**Document Version:** 1.0.0  
**Date:** 2026-10-21T00:20:00+05:30  
**Scope:** Existing Automation Boundaries, Schedulers, Business Rules, and Safeguards  

---

## 1. Verified Operational Baseline

### 1.1 Scheduler & Cadence Specification
* **Scheduler ID:** `b12f7fda-6824-4f7f-a2b6-e1e4606bf362`
* **Trigger Mechanism:** Managed Time-Based Scheduler.
* **Cron Expression:** `0 9 * * 1-5` (Minute 0, Hour 9, Day of Month *, Month *, Day of Week Mon-Fri).
* **Reference Timezone:** `Asia/Kolkata` (Indian Standard Time, UTC+05:30).
* **Execution Cap:** Maximum of 25 jobs discovered and processed per run.
* **Behavior on Weekend/Off-Hour:** No runs on Saturday/Sunday. The next run is scheduled for the subsequent business day at 09:00 IST.

### 1.2 Approved Job Discovery Sources
1. Direct Company Career Portals & ATS systems:
   - Workday (`*.myworkdayjobs.com` — e.g., Airbus JR10449126, JR10449944)
   - Dayforce HCM (`jobs.dayforcehcm.com` — e.g., Accuris Req #613)
   - Accenture Careers (`accenture.com/careers` — e.g., R00361602)
   - Techstars Job Board (`jobs.techstars.com` — e.g., Discover Dollar)
   - HCLTech Careers (`careers.hcltech.com` — e.g., Job 166721)
   - Infosys Careers (`career.infosys.com` — e.g., INFSYS-EXTERNAL-254305)
2. Indian fresher & early-career job hubs:
   - Hirastra, FreshersHunt, Hiredoor, OffCampusJobs4U, ClassicJobs.
3. Historical application archives:
   - Cross-referencing Vikas's Gmail application confirmations (`mid=1a061f8d455e62a6`, thread `r-677065444270439688`).

### 1.3 Eligibility & Exclusion Filters
* **Experience Range:** 0 to 2 years (Fresher, Trainee, Junior, Associate, Intern).
* **Hard Exclusion Rule:** Roles demanding $\ge 3$ years of required experience are strictly excluded from the active pipeline and marked with exclusion reasoning:
  - *Example 1:* Applied Systems (`JOB-2026-014`, Req 2026-7883) — Demands 3–5 years $\rightarrow$ Hard Excluded.
  - *Example 2:* Amgen (`JOB-2026-015`, Req R-248367) — Demands 3 years $\rightarrow$ Hard Excluded.
  - *Example 3:* Infosys Technology Analyst (`JOB-2026-016`, Req 253260) — Demands 3–5 years $\rightarrow$ Hard Excluded.
* **Degree Acceptance:** Explicitly evaluates MCA (Master of Computer Applications) eligibility alongside B.E./B.Tech.

### 1.4 Duplicate Prevention Rules
* Deduplication key composed of: `Normalized Company Name` + `Normalized Job Title` + `Requisition ID / Posting Hash`.
* Cross-referenced against all 23 existing records in Tab 2 (`Job Pipeline`).

### 1.5 Evidence-First Resume Tailoring Methodology & Master Resume v3
* **Zero Fabrication Policy:** Resumes and portfolio descriptions must never fabricate metrics, employers, degrees, tools, or dates.
* **Grounding Anchor:** Attached `VIKAS THIRUMANYAM.docx` (Part 7: Master Resume v3 & 9 Tailored ATS Resumes) and Master Google Doc (`1eN9-xYDN-ob9eu4QLL-x-hnhOHRZ1wBBHFcax7QM1jA`).
* **Exact Education Dates & Lines:**
  - `Masai School × IIT Patna` (Jan 2026–Sep 2026) — AI-ML Program | Capstone: Zepto Data & AI Platform
  - `Master of Computer Applications (MCA)` (Aug 2023–May 2025) — Presidency University, Bengaluru
  - `B.Com. (Computer Applications)` (Aug 2018–May 2021) — Sri Venkateswara University, Tirupati
* **All Embedded Hyperlinks Preserved:**
  - LinkedIn: `https://www.linkedin.com/in/vikas-aiml`
  - GitHub: `https://github.com/vikas-pydev`
  - Enterprise Support Live App: `https://enterprise-support-ai-rag-agent.vercel.app/`
  - Enterprise Support Video Demo: `https://lnkd.in/p/g56XA2ki`
  - Enterprise Support Repo: `https://github.com/vikas-pydev/enterprise-support-ai-rag-agent`
  - Zepto Platform Repo: `https://github.com/vikas-pydev/zepto-data-ai-platform`
* **9 ATS-Tailored Resumes (v3):**
  1. Discover Dollar — AI Engineer Intern (96/100)
  2. RevRag AI — AI Engineer Intern (96/100)
  3. Accuris — Junior AI Developer (95/100)
  4. Needl.ai — AI Engineering Intern (95/100)
  5. Airbus — AI Intern: Aerolens (94/100)
  6. Accenture — Data Science Associate (93/100)
  7. KLA Corporation — Software Quality Engineer – Automation & AI (92/100)
  8. Techolution — Generative AI Intern (91/100)
  9. HCLTech — Junior Data & AI Engineer (90/100)

### 1.6 Google Sheets Tracker Behavior
* Authoritative file: `Vikas Thirumanyam — AI & Data Job Discovery Master Tracker.xlsx` (mirrored from Google Sheet `1NnQzoTppnqQQxO7o6Bzo6CZN-kajKLIHhvVFgi7XP6g`).
* Preserves 7 tabs, column headers, cell validations, and formulas.
* Zero-Bounce sanitization: `campus.recruitment@accenture.com` permanently purged and replaced by verified contact `srilakshmi.ramagopal@accenture.com`.

### 1.7 Gmail Draft Behavior & Strict Zero-Bounce Policy
* **Zero-Bounce Verified Recruiter Email Policy:** Guessed or bounced emails are strictly prohibited. Bounced `campus.recruitment@accenture.com` is permanently banned. Outreach defaults to verified named contacts from HR Database or official careers portals.
* **Permitted Action:** `gmail.drafts.create`, `gmail.drafts.update`, `gmail.drafts.get`.
* **Prohibited Action:** `gmail.messages.send`, automated application submission, or automated LinkedIn messaging.
* **Status Tracking:** Tracks draft IDs (e.g., `r-8159868102294701814`) and links directly to Gmail web compose UI.
* **Human Approval Boundary:** Human approval is mandatory before any draft is dispatched. Auto-send is permanently disabled.

---

## 2. Identified Uncertainties & Disclosed Limitations
1. **Direct Google Sheet Online API Access:** In the local offline/sandbox environment, live network OAuth calls to Google Sheets API require active user OAuth tokens (`credentials.json` / refresh token). The local workbook `Vikas Thirumanyam — AI & Data Job Discovery Master Tracker.xlsx` serves as the authoritative local file-backed mirror and persists all 7 tabs identically.
2. **Gmail API Live Status:** Similarly, reading live status changes of Gmail drafts over the wire requires live Google OAuth refresh tokens. In their absence, the dashboard reads the authoritative draft references preserved in Tab 3 and Tab 7 and links to the Gmail compose URLs.
3. **Mid-Session Attachment Limitation:** Acknowledged VM hook constraint (`FileUploadDecorator` ENOENT on attachment turns) is logged in telemetry (`EVT-010`).
