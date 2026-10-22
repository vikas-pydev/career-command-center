import React from 'react';
import {
  Menu,
  Radio,
  RefreshCw,
  Clock,
  ShieldCheck,
  FileText,
  Database,
  ExternalLink,
} from 'lucide-react';
import type { OverviewStats, UserSession } from '../types';

interface NavbarProps {
  currentTab: string;
  stats: OverviewStats | null;
  user: UserSession | null;
  sseConnected: boolean;
  onSync: () => void;
  syncing: boolean;
  onOpenMobileMenu?: () => void;
}

const tabTitles: Record<string, string> = {
  overview: 'Executive Dashboard & Overview',
  live: 'Live Agent Activity & Telemetry',
  jobs: 'Job Pipeline & Opportunity Discovery',
  profile: 'Candidate Profile & Resume Intelligence',
  outreach: 'Recruiter Outreach & Gmail Drafts',
  runs: 'Run History & Audit Log',
  settings: 'System Architecture & Integrations',
};

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  stats,
  sseConnected,
  onSync,
  syncing,
  onOpenMobileMenu,
}) => {
  const lastSyncTime = stats?.lastTrackerSync
    ? stats.lastTrackerSync.split('T')[1]?.slice(0, 5) || '23:52'
    : '23:52';

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          className="mobile-menu-btn"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <h1 className="page-title">{tabTitles[currentTab] || 'Career Command Center'}</h1>
      </div>

      <div className="navbar-right">
        {/* Quick External Repositories Links */}
        <a
          href="https://docs.google.com/spreadsheets/d/1NnQzoTppnqQQxO7o6Bzo6CZN-kajKLIHhvVFgi7XP6g/edit"
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline btn-sm"
          title="Open Master Tracker Google Sheet (7 Tabs)"
        >
          <Database size={13} color="#15803D" />
          <span>Master Sheet</span>
          <ExternalLink size={11} />
        </a>

        <a
          href="https://drive.google.com/drive/folders/1g5Hb8zaQPcVXjXdcDG7hvwoN14y0MGRc"
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline btn-sm"
          title="Open updated resume Google Drive Folder (All 10 Native PDFs)"
        >
          <FileText size={13} color="var(--accent-orange)" />
          <span>PDF Resumes</span>
          <ExternalLink size={11} />
        </a>

        <a
          href="https://docs.google.com/document/d/1eN9-xYDN-ob9eu4QLL-x-hnhOHRZ1wBBHFcax7QM1jA/edit"
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline btn-sm"
          title="Open Master Resume & Tailored Pack Google Doc"
        >
          <FileText size={13} color="var(--text-muted)" />
          <span>Resume Doc</span>
          <ExternalLink size={11} />
        </a>

        {/* Real-time SSE Live Connection Badge */}
        {sseConnected ? (
          <span className="badge badge-live" title="Server-Sent Events active: real-time agent telemetry stream connected">
            <span className="pulse-dot" />
            <span>Live Stream</span>
          </span>
        ) : (
          <span className="badge badge-warning" title="SSE reconnecting to backend stream">
            <Radio size={11} />
            <span>Reconnecting</span>
          </span>
        )}

        {/* Last Sync Badge */}
        <span className="badge badge-neutral" title={`Last Sheet sync verified at ${lastSyncTime} IST`}>
          <Clock size={11} color="var(--text-muted)" />
          <span>Synced: {lastSyncTime} IST</span>
        </span>

        {/* Next Run Pill */}
        <div className="badge badge-neutral" title={`Next Scheduled Run: ${stats?.nextScheduledRun || 'Weekdays ~09:00 AM IST'}`}>
          <Clock size={11} color="var(--accent-orange)" />
          <span>Next: 9:00 AM IST</span>
        </div>

        {/* Human Approval Guardrail Pill */}
        <div className="badge badge-live" title="Auto-send disabled: all emails and applications require human review">
          <ShieldCheck size={11} />
          <span>Drafts Only</span>
        </div>

        {/* Safe Sheet Re-sync Button */}
        <button
          className="btn btn-outline btn-sm"
          onClick={onSync}
          disabled={syncing}
          title="Safely re-read authoritative Google Sheet / Excel mirror"
        >
          <RefreshCw size={12} className={syncing ? 'spin' : ''} />
          <span>{syncing ? 'Syncing...' : 'Sync'}</span>
        </button>
      </div>
    </header>
  );
};
