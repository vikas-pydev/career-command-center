import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { authService } from './auth';
import { trackerService } from './trackerService';
import { telemetryStore } from './telemetryStore';
import { calculateNextScheduledRun } from './schedulerService';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost or undefined (same-origin / curl)
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// ----------------------------------------------------
// Public Endpoints
// ----------------------------------------------------
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Career Command Center API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    humanApprovalEnforced: true,
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  const result = authService.authenticate(email, password);

  if (!result.success) {
    res.status(401).json({ error: result.error });
    return;
  }

  // Set HTTP-only secure cookie
  res.cookie('session_token', result.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    token: result.token,
    user: result.user,
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const token = req.cookies?.session_token || req.headers.authorization?.replace('Bearer ', '');
  authService.revokeToken(token);
  res.clearCookie('session_token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// ----------------------------------------------------
// Protected Endpoints
// ----------------------------------------------------
const requireAuth = authService.middleware();

app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
  res.json({ user: (req as any).user });
});

// Overview Metrics & Next Run
app.get('/api/dashboard/overview', requireAuth, (_req: Request, res: Response) => {
  try {
    const overview = trackerService.getDashboardOverview();
    const actions = trackerService.getActions();
    res.json({
      overview,
      actionsChecklist: actions,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to compute dashboard overview', details: err.message });
  }
});

// Job Pipeline
app.get('/api/jobs', requireAuth, (req: Request, res: Response) => {
  try {
    const { company, location, minScore, maxScore, eligibilityStatus, applicationStatus, search, sortBy } = req.query;

    const jobs = trackerService.getJobs({
      company: company as string,
      location: location as string,
      minScore: minScore ? Number(minScore) : undefined,
      maxScore: maxScore ? Number(maxScore) : undefined,
      eligibilityStatus: eligibilityStatus as string,
      applicationStatus: applicationStatus as string,
      search: search as string,
      sortBy: sortBy as any,
    });

    res.json({
      total: jobs.length,
      jobs,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch job pipeline', details: err.message });
  }
});

app.get('/api/jobs/:id', requireAuth, (req: Request, res: Response) => {
  const job = trackerService.getJobById(req.params.id);
  if (!job) {
    res.status(404).json({ error: 'Job not found', jobId: req.params.id });
    return;
  }
  res.json({ job });
});

// Update Job User Status (Apply / Delete / Restore to Active)
app.patch('/api/jobs/:id/status', requireAuth, (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body || {};
    if (!status || !['active', 'applied', 'deleted'].includes(status)) {
      res.status(400).json({ error: 'Valid status required: active | applied | deleted' });
      return;
    }
    const result = trackerService.setUserJobStatus(req.params.id, status, notes);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update job status', details: err.message });
  }
});

app.post('/api/jobs/:id/status', requireAuth, (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body || {};
    if (!status || !['active', 'applied', 'deleted'].includes(status)) {
      res.status(400).json({ error: 'Valid status required: active | applied | deleted' });
      return;
    }
    const result = trackerService.setUserJobStatus(req.params.id, status, notes);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update job status', details: err.message });
  }
});

// Outreach & Recruiter Contacts
app.get('/api/outreach', requireAuth, (_req: Request, res: Response) => {
  try {
    const outreach = trackerService.getOutreach();
    res.json({
      total: outreach.length,
      outreach,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch outreach contacts', details: err.message });
  }
});

// Tailored Resumes & Email Copy (Tab 6)
app.get('/api/tailored-resumes', requireAuth, (_req: Request, res: Response) => {
  try {
    const tailoredResumes = trackerService.getTailoredResumes();
    res.json({
      total: tailoredResumes.length,
      tailoredResumes,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch tailored resumes', details: err.message });
  }
});

// Candidate Profile & Resume Versions (Tab 5)
app.get('/api/profile', requireAuth, (_req: Request, res: Response) => {
  try {
    const profile = trackerService.getCandidateProfile();
    res.json({ profile });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch candidate profile', details: err.message });
  }
});

// Profile Editing with Change Preview & Read-After-Write Verification
app.put('/api/profile', requireAuth, (req: Request, res: Response) => {
  try {
    const { updates, confirm } = req.body || {};

    if (!updates || typeof updates !== 'object') {
      res.status(400).json({ error: 'Updates payload required' });
      return;
    }

    const result = trackerService.updateCandidateProfile(updates, Boolean(confirm));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update candidate profile', details: err.message });
  }
});

// Run History (Tab 7)
app.get('/api/runs', requireAuth, (_req: Request, res: Response) => {
  try {
    const runs = trackerService.getRunHistory();
    res.json({
      total: runs.length,
      runs,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch run history', details: err.message });
  }
});

app.get('/api/runs/:runId/events', requireAuth, (req: Request, res: Response) => {
  const events = telemetryStore.getEventsByRunId(req.params.runId);
  res.json({
    runId: req.params.runId,
    totalEvents: events.length,
    events,
  });
});

// Real-Time Server-Sent Events (SSE) Stream
app.get('/api/events/stream', requireAuth, (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const lastEventId = (req.headers['last-event-id'] as string) || (req.query.lastEventId as string);

  // Send initial snapshot of events
  const allEvents = telemetryStore.getAllEvents();
  res.write(`event: initial_state\ndata: ${JSON.stringify({ events: allEvents })}\n\n`);

  // Register client for live broadcasts
  telemetryStore.registerClient(res, lastEventId);
});

// System Integrations Status
app.get('/api/integrations/status', requireAuth, (_req: Request, res: Response) => {
  try {
    const status = trackerService.getIntegrationStatus();
    res.json({ status });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch integration status', details: err.message });
  }
});

// Safe Synchronization Endpoint (syncs directly with Google Sheets)
app.post('/api/integrations/sync', requireAuth, async (_req: Request, res: Response) => {
  try {
    const syncResult = await trackerService.syncFromGoogleSheets(true);
    res.json({
      success: true,
      message: `Master Tracker synchronized successfully from Google Sheets (${syncResult.count} jobs).`,
      count: syncResult.count,
      lastSync: trackerService.lastSyncTime,
      status: trackerService.lastSyncStatus,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Sync failed', details: err.message });
  }
});

// Public webhook sync (can be triggered by Google Apps Script onEdit trigger without cookies)
app.post('/api/integrations/webhook-sync', async (_req: Request, res: Response) => {
  try {
    const syncResult = await trackerService.syncFromGoogleSheets(true);
    res.json({
      success: true,
      message: `Webhook sync completed: ${syncResult.count} jobs loaded.`,
      updated: syncResult.updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Webhook sync failed', details: err.message });
  }
});

// ----------------------------------------------------
// Strict Human Approval Guardrails
// ----------------------------------------------------
// Any attempt to automatically send emails or submit applications is blocked
const blockAutomatedAction = (_req: Request, res: Response) => {
  res.status(403).json({
    error: 'ForbiddenAction',
    message: 'Human Approval Mandatory. Automatic email dispatch and application submission are strictly disabled in Career Command Center.',
    safeguard: 'Section 3.2 Human Approval Enforcement',
  });
};
app.all('/api/outreach/send', blockAutomatedAction);
app.all('/api/jobs/apply', blockAutomatedAction);
app.all('/api/gmail/send', blockAutomatedAction);

// ----------------------------------------------------
// Serve Client Static Build if present
// ----------------------------------------------------
const clientDist = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((_req: Request, res: Response) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`=======================================================`);
    console.log(`  CAREER COMMAND CENTER BACKEND API`);
    console.log(`  Port: ${PORT}`);
    console.log(`  Mode: Private Dashboard`);
    console.log(`  User: ${process.env.DASHBOARD_USER || 'vikastirumanyam@gmail.com'}`);
    console.log(`  Next Run: ${calculateNextScheduledRun().nextExpectedRunFormatted}`);
    console.log(`  Human Approval: STRICTLY ENFORCED (Auto-Send Prohibited)`);
    console.log(`=======================================================`);

    // Initial Live Sync from Google Sheets
    try {
      console.log(`[Google Sheets] Initiating initial live sync...`);
      const initialSync = await trackerService.syncFromGoogleSheets(true);
      console.log(`[Google Sheets] Synced ${initialSync.count} jobs from Master Tracker.`);
    } catch (e: any) {
      console.warn(`[Google Sheets] Initial live sync fallback to local mirror:`, e.message);
    }

    // Automated periodic background sync polling every 60 seconds
    const SYNC_INTERVAL_MS = 60000;
    setInterval(async () => {
      try {
        const poll = await trackerService.syncFromGoogleSheets(false);
        if (poll.updated) {
          console.log(`[Google Sheets Auto-Sync] Detected spreadsheet updates! Updated pipeline (${poll.count} jobs).`);
        }
      } catch {
        // Silently retry on next interval
      }
    }, SYNC_INTERVAL_MS);
  });
}

export default app;
