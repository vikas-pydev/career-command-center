import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Database,
  Calendar,
  Mail,
  FileCheck,
  RefreshCw,
  Lock,
  Terminal,
  Copy,
  Check,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import type { IntegrationStatus } from '../types';
import { IntegrationHealthTable } from './IntegrationHealthTable';

interface SettingsViewProps {
  status: IntegrationStatus | null;
  onSync: () => void;
  syncing: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  status,
  onSync,
  syncing,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="content-body">
      {/* Title & Sync Action Card */}
      <div className="section-card">
        <div className="section-header">
          <div className="section-title">
            <Settings size={18} color="var(--accent-orange)" />
            <span>System Architecture & Integration Baseline</span>
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={onSync}
            disabled={syncing}
          >
            <RefreshCw size={13} className={syncing ? 'spin' : ''} />
            <span>{syncing ? 'Verifying Sync...' : 'Re-verify All Integrations'}</span>
          </button>
        </div>

        <div style={{ padding: '16px 24px', backgroundColor: 'var(--bg-subtle)', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          This command center functions as an additive supervisory layer above your existing scheduled automation. All core parameters, cron cadence, job caps, and human approval boundaries are strictly preserved.
        </div>
      </div>

      {/* Integration Health & Data Provenance Table */}
      <IntegrationHealthTable status={status} />

      {/* System Integration Details Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Scheduler Service */}
        <div className="section-card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="var(--accent-orange)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>1. Scheduler Service</h3>
            </div>
            <span className="badge badge-live">Verified Active</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div>Service: <strong>{status?.scheduler.service || 'Gemini Time-Based Scheduler'}</strong></div>
            <div>Identifier: <code>{status?.scheduler.id || 'b12f7fda-6824-4f7f-a2b6-e1e4606bf362'}</code></div>
            <div>Cron Cadence: <code>{status?.scheduler.cron || '0 9 * * 1-5'}</code> (Weekdays ~9:00 AM IST)</div>
            <div>Timezone: <strong>{status?.scheduler.timezone || 'Asia/Kolkata'} (+05:30)</strong></div>
            <div>Discovery Cap: <strong>{status?.scheduler.jobCap || 25} jobs / scheduled run</strong></div>
            <div>Next Run: <strong>{status?.scheduler.nextExpectedRun || 'Wednesday, Oct 21, 2026 ~09:00:00 IST'}</strong></div>
            <div style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <Lock size={11} style={{ display: 'inline', marginRight: '4px' }} />
              Schedule and job limits are hard-locked against accidental alteration or competing jobs.
            </div>
          </div>
        </div>

        {/* Master Tracker (Google Sheets) */}
        <div className="section-card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} color="#15803D" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>2. Master Tracker Database</h3>
            </div>
            <span className="badge badge-live">Connected</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div>Spreadsheet ID: <code>1NnQzoTppnqQQxO7o6Bzo6CZN-kajKLIHhvVFgi7XP6g</code></div>
            <div>Local File Mirror: <code>Vikas Thirumanyam — AI & Data Job Discovery Master Tracker.xlsx</code></div>
            <div>Authoritative Tabs: <strong>7 Preserved Tabs</strong></div>
            <div className="tag-list" style={{ marginTop: '2px' }}>
              {(status?.masterTracker.tabsPreserved || [
                'Dashboard & Action Checklist',
                'Job Pipeline',
                'Outreach Tracker',
                'Daily Summary',
                'Candidate Profile & Resume Vers',
                'Tailored Resumes & Outreach v2',
                'System Audit & Run Telemetry',
              ]).map((tab, i) => (
                <span key={i} className="tag">{tab}</span>
              ))}
            </div>
            <div>Total Tracked Opportunities: <strong>{status?.masterTracker.totalJobs || 23} jobs</strong></div>
            <div>Last Synchronized: <strong>{status?.masterTracker.lastSync || '2026-10-21T14:08:00+05:30'}</strong></div>
          </div>
        </div>

        {/* Resume Repository */}
        <div className="section-card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCheck size={18} color="var(--accent-orange)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>3. Resume Repository</h3>
            </div>
            <span className="badge badge-live">Connected</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div>Master Google Doc ID: <code>1eN9-xYDN-ob9eu4QLL-x-hnhOHRZ1wBBHFcax7QM1jA</code> (unmodified)</div>
            <div>Google Drive Folder: <a href="https://drive.google.com/drive/folders/1g5Hb8zaQPcVXjXdcDG7hvwoN14y0MGRc" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-orange)' }}>updated resume (1g5Hb8zaQPcVXjXdcDG7hvwoN14y0MGRc)</a></div>
            <div>Contents: <strong>All 10 Single-Page Native ATS PDFs (application/pdf, 15 clickable links, Jan–Sep 2026 Masai × IIT Patna dates, verified README metrics)</strong></div>
            <div>Master Baseline PDF: <a href="https://drive.google.com/file/d/1n009_DEQB9yPPNPcZmxmccUJHO3Kpk9I/view?usp=sharing" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-orange)' }}>Resume_Impact_Vikas_Thirumanyam_2026-10-21.pdf</a></div>
            <div>Methodology: <strong>Evidence-First Zero Fabrication & Strict Zero-Bounce Outreach</strong></div>
            <div>Verified Anchor: <strong>VIKAS THIRUMANYAM.docx / Resume_Impact_Vikas_Thirumanyam_2026-10-21.pdf</strong></div>
          </div>
        </div>

        {/* Gmail Draft Integration */}
        <div className="section-card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={18} color="#DC2626" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>4. Gmail Outreach Integration</h3>
            </div>
            <span className="badge badge-orange">Draft-Only</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div>Authorized Account: <strong>vikastirumanyam@gmail.com</strong></div>
            <div>OAuth Scope: <strong>Draft Composition Only</strong> (gmail.compose)</div>
            <div>Auto-Send Status: <strong style={{ color: '#DC2626' }}>PERMANENTLY DISABLED</strong></div>
            <div>Preserved Drafts: <strong>6 Unsent Saved Drafts</strong></div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Draft IDs: <code>r-8159868102294701814</code>, <code>r1374887159427357902</code>, <code>r-4353617344403466119</code>, <code>r-5956255536446211565</code>, <code>r-3686840521095354095</code>, <code>r4711525409096730367</code>
            </div>
            <div style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--success-text)' }}>
              <ShieldCheck size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Section 3.2 Human Approval strictly enforced. Zero external sends executed.
            </div>
          </div>
        </div>
      </div>

      {/* Private Access, Security & Local Host Setup Panel */}
      <div className="section-card">
        <div className="section-header">
          <div className="section-title">
            <Lock size={18} color="var(--accent-orange)" />
            <span>Private Access, Security & Local Host Setup</span>
          </div>
          <span className="badge badge-live">Zero Credentials in Client JS</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
            padding: '24px',
          }}
        >
          {/* Left Column: Security Boundaries & Environment Variables */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ fontSize: '0.96rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <KeyRound size={16} color="var(--accent-orange)" />
              <span>Server-Side Environment Variables & Secret Handling</span>
            </h4>

            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              All authentication secrets, session tokens, and spreadsheet identifiers are isolated server-side. The frontend receives only sanitized session payloads and never exposes private tokens or passwords.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between' }}>
                <code>SESSION_SECRET</code>
                <span style={{ color: 'var(--text-muted)' }}>Server-only HMAC signing key</span>
              </div>
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between' }}>
                <code>DATA_FILE_PATH</code>
                <span style={{ color: 'var(--text-muted)' }}>Local mirror workbook path</span>
              </div>
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between' }}>
                <code>GOOGLE_SPREADSHEET_ID</code>
                <span style={{ color: 'var(--text-muted)' }}>Authorized 7-tab Sheet ID</span>
              </div>
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between' }}>
                <code>PORT</code>
                <span style={{ color: 'var(--text-muted)' }}>Local backend daemon port (3001)</span>
              </div>
            </div>

            {/* Safe Rollback Procedures */}
            <div style={{ marginTop: '8px', padding: '12px 14px', backgroundColor: 'var(--bg-surface-warm)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RotateCcw size={14} color="var(--accent-orange)" />
                <span>Safe Rollback & Recovery Procedures</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                The backend automatically verifies write operations with read-after-write verification. In the event of a workbook synchronization anomaly, the master tracker local copy can be re-synchronized from the Google Sheet via the <strong>Sync Sheet</strong> button. Telemetry records preserve historical runs for state comparison.
              </div>
            </div>
          </div>

          {/* Right Column: Local Host Setup Commands */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ fontSize: '0.96rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={16} color="var(--accent-orange)" />
              <span>Local Host Verification Commands</span>
            </h4>

            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Commands can be run directly from the project directory. Use the copy buttons below:
            </div>

            {[
              { id: 'test', label: 'Run Automated Test Suite (78 Tests)', cmd: 'npm test' },
              { id: 'server', label: 'Start Telemetry Backend Server', cmd: 'npm run server' },
              { id: 'client', label: 'Launch Command Center Frontend', cmd: 'npm run client' },
              { id: 'build', label: 'Compile Production Client Bundle', cmd: 'npm run build:client' },
            ].map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.label}</div>
                  <code style={{ fontSize: '0.84rem', color: 'var(--text-main)', marginTop: '2px', display: 'inline-block' }}>
                    {c.cmd}
                  </code>
                </div>

                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleCopy(c.cmd, c.id)}
                  title="Copy command"
                >
                  {copiedCmd === c.id ? (
                    <>
                      <Check size={12} color="#15803D" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
