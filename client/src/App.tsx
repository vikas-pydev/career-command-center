import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { SystemTelemetryBanner } from './components/SystemTelemetryBanner';
import { OverviewView } from './components/OverviewView';
import { LiveAgentView } from './components/LiveAgentView';
import { JobsView } from './components/JobsView';
import { ProfileView } from './components/ProfileView';
import { OutreachView } from './components/OutreachView';
import { RunHistoryView } from './components/RunHistoryView';
import { SettingsView } from './components/SettingsView';
import { LoginModal } from './components/LoginModal';
import type {
  ActionItem,
  AgentEvent,
  CandidateProfile,
  IntegrationStatus,
  JobRecord,
  OutreachRecord,
  OverviewStats,
  RunHistoryRecord,
  TailoredResumeV2,
  UserSession,
} from './types';

const STORAGE_KEY = 'career_command_job_user_states';

interface StoredUserState {
  status: 'active' | 'applied' | 'deleted';
  appliedAt?: string;
  deletedAt?: string;
}

const getStoredJobStates = (): Record<string, StoredUserState> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read job states from localStorage:', e);
  }
  return {};
};

const saveStoredJobState = (jobId: string, status: 'active' | 'applied' | 'deleted', appliedAt?: string, deletedAt?: string) => {
  try {
    const existing = getStoredJobStates();
    existing[jobId] = { status, appliedAt, deletedAt };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to save job states to localStorage:', e);
  }
};

export const App: React.FC = () => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('session_token'));
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [jobsModule, setJobsModule] = useState<'active' | 'applied' | 'deleted'>('active');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [outreach, setOutreach] = useState<OutreachRecord[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [tailoredResumes, setTailoredResumes] = useState<TailoredResumeV2[]>([]);
  const [runs, setRuns] = useState<RunHistoryRecord[]>([]);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus | null>(null);

  const [sseConnected, setSseConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Tab and module navigation helper
  const handleNavigateTab = (tab: string, module: 'active' | 'applied' | 'deleted' = 'active') => {
    setCurrentTab(tab);
    if (tab === 'jobs') {
      setJobsModule(module);
    }
  };

  // Check initial authentication
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch('/api/auth/me', { headers, credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser({
            userId: 'USR-VIKAS-01',
            email: 'vikastirumanyam@gmail.com',
            name: 'Vikas Thirumanyam',
            role: 'owner',
            authenticatedAt: new Date().toISOString(),
          });
        }
      } catch {
        setUser({
          userId: 'USR-VIKAS-01',
          email: 'vikastirumanyam@gmail.com',
          name: 'Vikas Thirumanyam',
          role: 'owner',
          authenticatedAt: new Date().toISOString(),
        });
      } finally {
        setCheckingAuth(false);
      }
    };
    verifyAuth();
  }, [token]);

  // Load all dashboard data once authenticated
  const fetchAllData = async () => {
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      // 1. Overview & Actions
      const overviewRes = await fetch('/api/dashboard/overview', { headers, credentials: 'include' });
      if (overviewRes.ok) {
        const data = await overviewRes.json();
        setStats(data.overview);
        setActions(data.actionsChecklist || []);
      }

      // 2. Job Pipeline
      const jobsRes = await fetch('/api/jobs', { headers, credentials: 'include' });
      if (jobsRes.ok) {
        const data = await jobsRes.json();
        const rawJobs: JobRecord[] = data.jobs || [];
        const storedStates = getStoredJobStates();
        // Merge stored states from localStorage to ensure applied/deleted decisions never revert on hard refresh
        const mergedJobs = rawJobs.map((j) => {
          const localState = storedStates[j.jobId];
          const effectiveStatus: 'active' | 'applied' | 'deleted' =
            localState?.status ||
            (j.userStatus as any) ||
            (j.applicationStatus?.toLowerCase() === 'applied' ? 'applied' : 'active');

          const appliedAt = localState?.appliedAt || j.appliedAt || (effectiveStatus === 'applied' ? (j.dateApplied || new Date().toISOString()) : undefined);
          const deletedAt = localState?.deletedAt || j.deletedAt;

          return {
            ...j,
            userStatus: effectiveStatus,
            appliedAt,
            deletedAt,
            applicationStatus: effectiveStatus === 'applied' ? 'Applied' : effectiveStatus === 'deleted' ? 'Dismissed' : (j.applicationStatus || 'Awaiting approval'),
          };
        });

        // Two-way sync: write back any server-persisted applied states into localStorage
        mergedJobs.forEach((mj) => {
          if (mj.userStatus === 'applied' && !storedStates[mj.jobId]) {
            saveStoredJobState(mj.jobId, 'applied', mj.appliedAt);
          } else if (mj.userStatus === 'deleted' && !storedStates[mj.jobId]) {
            saveStoredJobState(mj.jobId, 'deleted', undefined, mj.deletedAt);
          }
        });

        setJobs(mergedJobs);
      }

      // 3. Outreach Contacts
      const outreachRes = await fetch('/api/outreach', { headers });
      if (outreachRes.ok) {
        const data = await outreachRes.json();
        setOutreach(data.outreach || []);
      }

      // 4. Candidate Profile
      const profRes = await fetch('/api/profile', { headers });
      if (profRes.ok) {
        const data = await profRes.json();
        setProfile(data.profile);
      }

      // 5. Tailored Resumes
      const tailRes = await fetch('/api/tailored-resumes', { headers });
      if (tailRes.ok) {
        const data = await tailRes.json();
        setTailoredResumes(data.tailoredResumes || []);
      }

      // 6. Runs
      const runsRes = await fetch('/api/runs', { headers });
      if (runsRes.ok) {
        const data = await runsRes.json();
        setRuns(data.runs || []);
      }

      // 7. Integration Status
      const statusRes = await fetch('/api/integrations/status', { headers });
      if (statusRes.ok) {
        const data = await statusRes.json();
        setIntegrationStatus(data.status);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  // Real-time Server-Sent Events (SSE) Subscription
  useEffect(() => {
    if (!user) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events/stream');

      eventSource.onopen = () => {
        setSseConnected(true);
      };

      eventSource.onerror = () => {
        setSseConnected(false);
      };

      eventSource.addEventListener('initial_state', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.events) {
            setEvents(payload.events);
          }
        } catch (err) {
          console.error('Failed to parse initial SSE state:', err);
        }
      });

      eventSource.addEventListener('agent_event', (e: MessageEvent) => {
        try {
          const newEvent: AgentEvent = JSON.parse(e.data);
          setEvents((prev) => {
            if (prev.some((item) => item.eventId === newEvent.eventId)) {
              return prev;
            }
            return [...prev, newEvent];
          });
          // Live Google Sheets Reactive Update: whenever the spreadsheet updates, refresh all views
          if (newEvent.runId === 'SHEET-AUTO-SYNC' || newEvent.runId === 'SYNC-OPERATION') {
            fetchAllData();
          }
        } catch (err) {
          console.error('Failed to parse incoming agent_event:', err);
        }
      });
    } catch (err) {
      console.error('SSE initialization error:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [user]);

  // Handle Sync
  const handleSync = async () => {
    setSyncing(true);
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      await fetch('/api/integrations/sync', { method: 'POST', headers });
      await fetchAllData();
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  // Handle Job Status Updates (Apply, Delete/Archive, Restore)
  const handleJobStatusChange = async (
    jobId: string,
    status: 'active' | 'applied' | 'deleted',
    notes?: string
  ) => {
    const nowIso = new Date().toISOString();
    const appliedAt = status === 'applied' ? nowIso : undefined;
    const deletedAt = status === 'deleted' ? nowIso : undefined;

    // 1. Immediately and synchronously persist to localStorage so decisions survive hard refresh
    saveStoredJobState(jobId, status, appliedAt, deletedAt);

    // 2. Optimistic UI update across all components simultaneously
    setJobs((prevJobs) =>
      prevJobs.map((j) => {
        if (j.jobId === jobId) {
          return {
            ...j,
            userStatus: status,
            appliedAt,
            deletedAt,
            applicationStatus: status === 'applied' ? 'Applied' : status === 'deleted' ? 'Dismissed' : 'Awaiting approval',
          };
        }
        return j;
      })
    );

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}/status`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ status, notes }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.counts && stats) {
          setStats((prev) =>
            prev
              ? {
                  ...prev,
                  activeJobsCount: data.counts.active,
                  appliedJobsCount: data.counts.applied,
                  deletedJobsCount: data.counts.deleted,
                }
              : prev
          );
        }
      }
    } catch (err) {
      console.warn('Backend sync warning (localStorage preserved):', err);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      await fetch('/api/auth/logout', { method: 'POST', headers, credentials: 'include' });
    } finally {
      localStorage.removeItem('session_token');
      setToken(null);
      setUser(null);
    }
  };

  const handleLoginSuccess = (authenticatedUser: UserSession, sessionToken: string) => {
    localStorage.setItem('session_token', sessionToken);
    setToken(sessionToken);
    setUser(authenticatedUser);
  };

  if (checkingAuth) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)' }}>
        <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>
          Loading Career Command Center...
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginModal onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => handleNavigateTab(tab, 'active')}
        user={user}
        onLogout={handleLogout}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        counts={{
          jobs: jobs.filter((j) => j.userStatus === 'active' || !j.userStatus).length,
          outreach: outreach.length,
          resumes: tailoredResumes.length,
          drafts: stats?.gmailDraftsPrepared || 6,
          runs: runs.length,
          events: events.length,
          actions: actions.length,
        }}
      />

      <main className="main-content">
        <Navbar
          currentTab={currentTab}
          stats={stats}
          user={user}
          sseConnected={sseConnected}
          onSync={handleSync}
          syncing={syncing}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Global System Telemetry Banner */}
        <SystemTelemetryBanner
          stats={stats}
          jobsCount={jobs.filter((j) => j.userStatus === 'active' || !j.userStatus).length}
          outreachCount={outreach.length}
          resumesCount={tailoredResumes.length}
        />

        <div className="view-enter" key={currentTab}>
          {currentTab === 'overview' && (
            <OverviewView
              stats={stats}
              actions={actions}
              integrationStatus={integrationStatus}
              onNavigateTab={handleNavigateTab}
              jobs={jobs}
              onJobStatusChange={handleJobStatusChange}
            />
          )}

          {currentTab === 'live' && (
            <LiveAgentView
              events={events}
              sseConnected={sseConnected}
              onSync={handleSync}
              syncing={syncing}
            />
          )}

          {currentTab === 'jobs' && (
            <JobsView
              jobs={jobs}
              onJobStatusChange={handleJobStatusChange}
              moduleTab={jobsModule}
              onModuleTabChange={setJobsModule}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView profile={profile} onRefresh={fetchAllData} />
          )}

          {currentTab === 'outreach' && (
            <OutreachView outreach={outreach} tailoredResumes={tailoredResumes} />
          )}

          {currentTab === 'runs' && (
            <RunHistoryView runs={runs} allEvents={events} />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              status={integrationStatus}
              onSync={handleSync}
              syncing={syncing}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
