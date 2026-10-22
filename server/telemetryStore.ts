import { Response } from 'express';
import { AgentEvent } from './types';

export class TelemetryStore {
  private events: AgentEvent[] = [];
  private clients: Set<Response> = new Set();
  private maxBufferSize = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.seedBaselineEvents();
    this.startHeartbeat();
  }

  private seedBaselineEvents() {
    this.events = [
      {
        eventId: 'EVT-001',
        runId: 'RUN-20261020-001',
        timestamp: '2026-10-20T22:13:36+05:30',
        stage: '1. Scheduled run started',
        status: 'succeeded',
        message: 'Initialized baseline job discovery and audited Google Drive & Gmail context',
        recordId: '-',
      },
      {
        eventId: 'EVT-002',
        runId: 'RUN-20261020-001',
        timestamp: '2026-10-20T22:14:00+05:30',
        stage: '2. Job discovery started',
        status: 'succeeded',
        message: 'Queried company portals, ATS boards, and Indian fresher job aggregators for Bengaluru, Hyderabad, Chennai',
        recordId: '-',
      },
      {
        eventId: 'EVT-003',
        runId: 'RUN-20261020-001',
        timestamp: '2026-10-20T22:15:34+05:30',
        stage: '3. Sources processed',
        status: 'succeeded',
        message: 'Inspected 16 active listings across Dayforce, Accenture, Workday, SuccessFactors, PeopleStrong, Cargill, Techstars, and MyInternships',
        recordId: '-',
      },
      {
        eventId: 'EVT-004',
        runId: 'RUN-20261020-001',
        timestamp: '2026-10-20T22:18:45+05:30',
        stage: '5. Duplicate detection completed',
        status: 'succeeded',
        message: 'Normalized company, title, location, and requisition IDs across 16 new openings and 2 historical Gmail applications',
        recordId: '-',
      },
      {
        eventId: 'EVT-005',
        runId: 'RUN-20261020-001',
        timestamp: '2026-10-20T22:20:00+05:30',
        stage: '6. Eligibility filters applied',
        status: 'succeeded',
        message: 'Retained 13 roles (0–2 yrs); hard-excluded Applied Systems (2026-7883, 3-5 yrs), Amgen (R-248367, 3 yrs), and Infosys Technology Analyst (253260, 3-5 yrs)',
        recordId: 'JOB-2026-014, JOB-2026-015, JOB-2026-016',
      },
      {
        eventId: 'EVT-006',
        runId: 'RUN-20261020-001',
        timestamp: '2026-10-20T22:24:34+05:30',
        stage: '10. Gmail drafts prepared or updated',
        status: 'succeeded',
        message: 'Created 6 unsent Gmail drafts (3 addressed to verified emails, 3 unaddressed)',
        recordId: 'r-8159868102294701814, r1374887159427357902, r-4353617344403466119',
      },
      {
        eventId: 'EVT-007',
        runId: 'RUN-20261020-001',
        timestamp: '2026-10-20T22:24:34+05:30',
        stage: '12. Final verification completed',
        status: 'succeeded',
        message: 'Created weekday 9:00 AM IST schedule (ID: b12f7fda-6824-4f7f-a2b6-e1e4606bf362)',
        recordId: 'b12f7fda-6824-4f7f-a2b6-e1e4606bf362',
      },
      {
        eventId: 'EVT-008',
        runId: 'RUN-20261020-001',
        timestamp: '2026-10-20T22:44:09+05:30',
        stage: '8. Resume evidence and tailoring prepared',
        status: 'succeeded',
        message: 'Compiled 5 single-page ATS PDF resumes and uploaded to Google Drive',
        recordId: '1TUw7fn-8wuuBVwKWqISUPOhojYNkegQT',
      },
      {
        eventId: 'EVT-009',
        runId: 'RUN-20261020-001',
        timestamp: '2026-10-20T22:46:50+05:30',
        stage: '11. Google Sheets records updated',
        status: 'succeeded',
        message: 'Populated 5 tabs in Master Tracker Google Sheet (1NnQzoTppnqQQxO7o6Bzo6CZN-kajKLIHhvVFgi7XP6g)',
        recordId: '1NnQzoTppnqQQxO7o6Bzo6CZN-kajKLIHhvVFgi7XP6g',
      },
      {
        eventId: 'EVT-010',
        runId: 'RUN-20261020-002',
        timestamp: '2026-10-20T23:12:43+05:30',
        stage: '8. Resume evidence and tailoring prepared',
        status: 'failed',
        message: 'VM FileUploadDecorator failed to mkdir /working_dir/c_44c773263d3e6c47/user_uploaded_files during PDF attachment sync; fell back to Workspace sub-agents',
        recordId: 'Vikas_Resume.pdf',
      },
      {
        eventId: 'EVT-011',
        runId: 'RUN-20261020-002',
        timestamp: '2026-10-20T23:14:30+05:30',
        stage: '7. Job-fit evaluation completed',
        status: 'succeeded',
        message: 'Upgraded Tier 1 scores using newly verified Enterprise Support AI RAG Agent (Discover Dollar 96, Accuris 95, Airbus 94, Accenture 93, HCLTech 90)',
        recordId: 'JOB-2026-001..006',
      },
      {
        eventId: 'EVT-012',
        runId: 'RUN-20261020-002',
        timestamp: '2026-10-20T23:16:00+05:30',
        stage: '11. Google Sheets records updated',
        status: 'succeeded',
        message: 'Added Tailored Resumes & Outreach v2 tab and updated schedule b12f7fda-6824-4f7f-a2b6-e1e4606bf362',
        recordId: '1NnQzoTppnqQQxO7o6Bzo6CZN-kajKLIHhvVFgi7XP6g',
      },
      {
        eventId: 'EVT-013',
        runId: 'RUN-20261020-002',
        timestamp: '2026-10-20T23:51:30+05:30',
        stage: '8. Resume evidence and tailoring prepared',
        status: 'succeeded',
        message: 'Updated Google Doc (1eN9-xYDN-ob9eu4QLL-x-hnhOHRZ1wBBHFcax7QM1jA) with full Master Resume baseline and 5 v2 Tailored Resumes',
        recordId: '1eN9-xYDN-ob9eu4QLL-x-hnhOHRZ1wBBHFcax7QM1jA',
      },
      {
        eventId: 'EVT-014',
        runId: 'RUN-20261020-002',
        timestamp: '2026-10-21T00:27:00+05:30',
        stage: '12. Final verification completed',
        status: 'succeeded',
        message: 'Integrated post-run HTML Career Command Center refresh hook (Step 8) into existing weekday 9:00 AM IST schedule b12f7fda-6824-4f7f-a2b6-e1e4606bf362',
        recordId: 'b12f7fda-6824-4f7f-a2b6-e1e4606bf362',
      },
      {
        eventId: 'EVT-015',
        runId: 'RUN-20261020-002',
        timestamp: '2026-10-21T00:27:30+05:30',
        stage: '13. Run summary published',
        status: 'succeeded',
        message: 'Refreshed and displayed career_command_center.html in Canvas and archived v2 single-page HTML source + tests in Google Doc 1eN9-xYDN-ob9eu4QLL-x-hnhOHRZ1wBBHFcax7QM1jA',
        recordId: 'career_command_center.html',
      },
      {
        eventId: 'EVT-016',
        runId: 'RUN-20261021-001',
        timestamp: '2026-10-21T09:00:10+05:30',
        stage: '3. Sources processed',
        status: 'succeeded',
        message: 'Retrieved 7 public India AI/ML & GenAI job-market headlines (Business Standard, Techpaathshala, SevenMentor, AcceleratorX, Teksands, Adobe, Qualcomm) badged separately from private tracker rows',
        recordId: '-',
      },
      {
        eventId: 'EVT-017',
        runId: 'RUN-20261021-001',
        timestamp: '2026-10-21T09:00:30+05:30',
        stage: '13. Run summary published',
        status: 'succeeded',
        message: 'Refreshed Career Command Center (warm ivory & orange #EA580C theme, 18 job cards, 5 visual charts, 7 sidebar sections) and verified Google Sheets sync',
        recordId: 'career_command_center.html',
      },
      {
        eventId: 'EVT-018',
        runId: 'RUN-20261021-002',
        timestamp: '2026-10-21T10:39:30+05:30',
        stage: '2. Job discovery started',
        status: 'succeeded',
        message: 'Scanned Hirastra, HireDoor, Workday, Indeed, and company portals; deduplicated 5 existing roles and verified 6 net-new openings JOB-2026-017 to JOB-2026-022',
        recordId: 'JOB-2026-017..022',
      },
      {
        eventId: 'EVT-019',
        runId: 'RUN-20261021-002',
        timestamp: '2026-10-21T10:40:00+05:30',
        stage: '7. Job-fit evaluation completed',
        status: 'succeeded',
        message: 'Scored 4 new Tier-1 matches (91–96/100) and 2 new Tier-2 matches (84–87/100); generated 4 new tailored v2 resumes',
        recordId: 'JOB-2026-017..022',
      },
      {
        eventId: 'EVT-020',
        runId: 'RUN-20261021-002',
        timestamp: '2026-10-21T10:41:00+05:30',
        stage: '10. Gmail drafts prepared or updated',
        status: 'failed',
        message: 'Attempted gmail:create_draft for Needl.ai, Techolution, KLA, and RevRag AI; blocked by VM FileUploadDecorator ENOENT on /working_dir/c_44c773263d3e6c47/working_dir; saved full outreach texts in Tab 6 and Master Doc without claiming Gmail draft creation',
        recordId: '-',
      },
      {
        eventId: 'EVT-021',
        runId: 'RUN-20261021-002',
        timestamp: '2026-10-21T10:42:00+05:30',
        stage: '11. Google Sheets records updated',
        status: 'succeeded',
        message: 'Updated all 7 tabs of Master Tracker with 24 total jobs',
        recordId: '1NnQzoTppnqQQxO7o6Bzo6CZN-kajKLIHhvVFgi7XP6g',
      },
      {
        eventId: 'EVT-022',
        runId: 'RUN-20261021-003',
        timestamp: '2026-10-21T13:42:00+05:30',
        stage: '10. Gmail drafts prepared or updated',
        status: 'succeeded',
        message: 'Strict Zero-Bounce Verified Recruiter Email Policy enforced: permanently banned campus.recruitment@accenture.com; mapped 13 verified named recruiter emails from HR Database 1oPiyEzMiAKvYu0HeNB9QLM1xHg-j3jI0JkyZR_5_sjc and official job postings',
        recordId: 'srilakshmi.ramagopal@accenture.com',
      },
      {
        eventId: 'EVT-023',
        runId: 'RUN-20261021-003',
        timestamp: '2026-10-21T14:07:30+05:30',
        stage: '8. Resume evidence and tailoring prepared',
        status: 'succeeded',
        message: 'Master Resume v3 synchronized with exact education dates (Masai x IIT Patna Jan 2026–Sep 2026, MCA Presidency Univ Aug 2023–May 2025, B.Com SVU Aug 2018–May 2021) and embedded project Live/Demo/GitHub links and 7 Credly/Wingspan/KodeKloud certification URLs across Master Resume and all 9 tailored resumes',
        recordId: '1eN9-xYDN-ob9eu4QLL-x-hnhOHRZ1wBBHFcax7QM1jA',
      },
      {
        eventId: 'EVT-024',
        runId: 'RUN-20261021-003',
        timestamp: '2026-10-21T14:08:00+05:30',
        stage: '11. Google Sheets records updated',
        status: 'succeeded',
        message: 'Synchronized Tab 2 (Job Pipeline), Tab 3 (Outreach Tracker), Tab 5 (Candidate Profile & Resume Vers), Tab 6 (Tailored Resumes & Outreach v2), and Tab 7 (System Audit & Run Telemetry) with exact education, embedded links, 9 tailored resumes, and zero-bounce recruiter policy',
        recordId: '1NnQzoTppnqQQxO7o6Bzo6CZN-kajKLIHhvVFgi7XP6g',
      },
      {
        eventId: 'EVT-025',
        runId: 'RUN-20261021-004',
        timestamp: '2026-10-21T17:00:00+05:30',
        stage: '8. Resume evidence and tailoring prepared',
        status: 'succeeded',
        message: 'Generated all 10 resumes as single-page native ATS .pdf files (application/pdf, 15 clickable links, Jan 2026–Sep 2026 Masai x IIT Patna dates, verified GitHub README metrics) in Google Drive folder "updated resume" (1g5Hb8zaQPcVXjXdcDG7hvwoN14y0MGRc)',
        recordId: '1g5Hb8zaQPcVXjXdcDG7hvwoN14y0MGRc',
      },
      {
        eventId: 'EVT-026',
        runId: 'RUN-20261021-004',
        timestamp: '2026-10-21T17:02:15+05:30',
        stage: '10. Gmail drafts prepared or updated',
        status: 'succeeded',
        message: 'Strict Zero-Bounce Verified Recruiter Email Policy updated: mapped Abhishek Bhat (abhishek.p.bhat@accenture.com), Shachee Mathur (shachee.mathur@airbus.com), Amrita K (amrita.k@hcl.com), Bharath Kumar (bharath_k02@infosys.com), Ashish Sharma (ashishs@qti.qualcomm.com); held unaddressed drafts for portal-only roles',
        recordId: 'abhishek.p.bhat@accenture.com',
      },
      {
        eventId: 'EVT-027',
        runId: 'RUN-20261021-004',
        timestamp: '2026-10-21T17:04:30+05:30',
        stage: '11. Google Sheets records updated',
        status: 'succeeded',
        message: 'Synchronized all 10 native .pdf Google Drive links, GitHub verified README metrics (100% Recall@K, 1.00 Faithfulness, 61.8-93.3ms latency, <150MB ONNX, 81.46% test acc), and epl-prediction-system repo to Master Tracker Sheet (1NnQzoTppnqQQxO7o6Bzo6CZN-kajKLIHhvVFgi7XP6g)',
        recordId: '1NnQzoTppnqQQxO7o6Bzo6CZN-kajKLIHhvVFgi7XP6g',
      },
    ];
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      for (const client of this.clients) {
        try {
          client.write(': heartbeat\n\n');
        } catch {
          this.clients.delete(client);
        }
      }
    }, 15000);
  }

  public registerClient(res: Response, lastEventId?: string) {
    this.clients.add(res);

    // If client provided a Last-Event-ID, replay events that occurred after it
    if (lastEventId) {
      const missedEvents = this.getEventsSince(lastEventId);
      for (const ev of missedEvents) {
        res.write(`id: ${ev.eventId}\nevent: agent_event\ndata: ${JSON.stringify(ev)}\n\n`);
      }
    }

    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  public publishEvent(eventData: Omit<AgentEvent, 'eventId' | 'timestamp'> & { eventId?: string; timestamp?: string }): AgentEvent {
    const nextNum = this.events.length + 1;
    const eventId = eventData.eventId || `EVT-${nextNum.toString().padStart(3, '0')}`;
    
    // Default timestamp to current IST time
    let timestamp = eventData.timestamp;
    if (!timestamp) {
      const now = new Date();
      const istDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
      const pad = (n: number) => n.toString().padStart(2, '0');
      timestamp = `${istDate.getUTCFullYear()}-${pad(istDate.getUTCMonth() + 1)}-${pad(istDate.getUTCDate())}T${pad(istDate.getUTCHours())}:${pad(istDate.getUTCMinutes())}:${pad(istDate.getUTCSeconds())}+05:30`;
    }

    const fullEvent: AgentEvent = {
      ...eventData,
      eventId,
      timestamp,
    };

    this.events.push(fullEvent);
    if (this.events.length > this.maxBufferSize) {
      this.events.shift();
    }

    // Broadcast to active SSE subscribers
    const payload = `id: ${fullEvent.eventId}\nevent: agent_event\ndata: ${JSON.stringify(fullEvent)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(payload);
      } catch {
        this.clients.delete(client);
      }
    }

    return fullEvent;
  }

  public getAllEvents(): AgentEvent[] {
    return [...this.events];
  }

  public getEventsByRunId(runId: string): AgentEvent[] {
    return this.events.filter(e => e.runId === runId);
  }

  public getEventsSince(lastEventId: string): AgentEvent[] {
    const idx = this.events.findIndex(e => e.eventId === lastEventId);
    if (idx === -1) return [];
    return this.events.slice(idx + 1);
  }

  public getConnectedClientCount(): number {
    return this.clients.size;
  }

  public destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.clients.clear();
  }
}

export const telemetryStore = new TelemetryStore();
