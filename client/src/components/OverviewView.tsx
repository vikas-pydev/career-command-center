import React, { useState } from 'react';
import {
  Calendar,
  Briefcase,
  Star,
  FileCheck,
  Mail,
  CheckSquare,
  ExternalLink,
  ShieldAlert,
  ArrowUpRight,
  Database,
  Sparkles,
  Check,
  Trash2,
  RotateCcw,
  Clock,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import type { ActionItem, OverviewStats, IntegrationStatus, JobRecord } from '../types';
import { OverviewCharts } from './OverviewCharts';
import { IntegrationHealthTable } from './IntegrationHealthTable';

interface OverviewViewProps {
  stats: OverviewStats | null;
  actions: ActionItem[];
  integrationStatus?: IntegrationStatus | null;
  onNavigateTab: (tab: string, module?: 'active' | 'applied' | 'deleted') => void;
  jobs?: JobRecord[];
  onJobStatusChange?: (jobId: string, status: 'active' | 'applied' | 'deleted') => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  stats,
  actions,
  integrationStatus,
  onNavigateTab,
  jobs = [],
  onJobStatusChange,
}) => {
  const [queueTab, setQueueTab] = useState<'priority' | 'with-draft' | 'all-pending' | 'applied-history' | 'archived-history'>('priority');

  const allEligible = jobs.filter(
    (j) => !j.eligibilityStatus.startsWith('Excluded') && !j.jobId.startsWith('HIST')
  );

  const pendingJobs = allEligible.filter((j) => j.userStatus === 'active' || !j.userStatus);
  const appliedJobs = jobs.filter((j) => j.userStatus === 'applied');
  const deletedJobs = jobs.filter((j) => j.userStatus === 'deleted');

  const priorityJobs = pendingJobs.filter((j) => j.matchScore >= 90);
  const withDraftJobs = pendingJobs.filter(
    (j) => (j.gmailDraftUrl && j.gmailDraftUrl.startsWith('http')) || (j.contactEmail && j.contactEmail !== 'Unresolved' && j.contactEmail !== '-')
  );

  const displayedJobs =
    queueTab === 'priority'
      ? priorityJobs
      : queueTab === 'with-draft'
      ? withDraftJobs
      : queueTab === 'applied-history'
      ? appliedJobs
      : queueTab === 'archived-history'
      ? deletedJobs
      : pendingJobs;
  return (
    <div className="content-body">
      {/* Hero / Next Scheduled Run Banner */}
      <div className="hero-banner">
        <div>
          <div className="hero-title">
            <Calendar size={22} color="var(--accent-orange)" />
            <span>Next Scheduled Job Discovery Run</span>
          </div>
          <div className="hero-subtitle">
            {stats ? stats.nextScheduledRun : 'Wednesday, October 21, 2026 ~09:00:00 IST'}
            &nbsp;•&nbsp;Timezone: <strong>Asia/Kolkata (+05:30)</strong>
            &nbsp;•&nbsp;Max Discovery Cap: <strong>25 jobs / run</strong>
          </div>
        </div>

        <div className="hero-countdown">
          <div className="countdown-label">Cadence: Weekdays (Mon–Fri)</div>
          <div className="countdown-badge">09:00 AM IST</div>
        </div>
      </div>

      {/* Human Approval Mandatory Safeguard Banner */}
      <div className="safeguard-banner">
        <div className="safeguard-text">
          <ShieldAlert size={22} color="var(--accent-orange)" />
          <div>
            <strong>Human Approval Boundary Enforced:</strong>
            <div style={{ fontSize: '0.82rem', marginTop: '2px', color: 'var(--warning-text)' }}>
              The agent never automatically submits job applications or dispatches emails. All tailored resumes and recruiter drafts remain strictly in draft state awaiting your manual review and approval.
            </div>
          </div>
        </div>
        <div className="badge badge-live" style={{ flexShrink: 0 }}>
          0 Auto-Sends Permitted
        </div>
      </div>

      {/* Metrics Cards Grid (Responsive 5 -> 2 -> 1) */}
      <div className="metrics-grid">
        {/* 1. Active Pipeline */}
        <div
          className="metric-card"
          onClick={() => onNavigateTab('jobs', 'active')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          aria-label="View active jobs in pipeline"
        >
          <div className="metric-header">
            <span>Active Pipeline</span>
            <Briefcase size={16} color="var(--accent-orange)" />
          </div>
          <div className="metric-value">{pendingJobs.length}</div>
          <div className="metric-footer">
            <span>{pendingJobs.length} to apply • {allEligible.length} eligible • Click to open</span>
          </div>
        </div>

        {/* 2. Applied Applications (Minimal Green Box) */}
        <div
          className="metric-card metric-card-applied"
          onClick={() => onNavigateTab('jobs', 'applied')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          aria-label="View applied applications in applied module"
        >
          <div className="metric-header">
            <span style={{ color: '#15803d' }}>Applied Module</span>
            <CheckCircle2 size={16} color="#15803d" />
          </div>
          <div className="metric-value" style={{ color: '#15803d' }}>
            {appliedJobs.length}
          </div>
          <div className="metric-footer">
            <span style={{ color: '#15803d' }}>
              ✓ {appliedJobs.length} applied • Permanently saved • Click to view
            </span>
          </div>
        </div>

        {/* 3. Tier-1 Strong Matches */}
        <div
          className="metric-card"
          onClick={() => onNavigateTab('jobs', 'active')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          aria-label="View tier-1 strong match jobs"
        >
          <div className="metric-header">
            <span>Priority Matches (90%+)</span>
            <Star size={16} color="var(--accent-orange)" />
          </div>
          <div className="metric-value" style={{ color: 'var(--accent-orange)' }}>
            {priorityJobs.length}
          </div>
          <div className="metric-footer">
            <span>{priorityJobs.length} high-match roles ready for review</span>
          </div>
        </div>

        {/* 4. Tailored Resumes (v3) */}
        <div
          className="metric-card"
          onClick={() => onNavigateTab('profile')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          aria-label="View tailored resumes"
        >
          <div className="metric-header">
            <span>Tailored Resumes (v3)</span>
            <FileCheck size={16} color="#15803D" />
          </div>
          <div className="metric-value">{stats ? stats.resumesPrepared : 10}</div>
          <div className="metric-footer">
            <span>10 Native PDFs + Verified Links</span>
          </div>
        </div>

        {/* 5. Saved Gmail Drafts */}
        <div
          className="metric-card"
          onClick={() => onNavigateTab('outreach')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          aria-label="View saved drafts"
        >
          <div className="metric-header">
            <span>Gmail Drafts & Outreach</span>
            <Mail size={16} color="var(--accent-orange)" />
          </div>
          <div className="metric-value">{stats ? stats.gmailDraftsPrepared : 6}</div>
          <div className="metric-footer">
            <span>6 Saved Drafts + Recruiter Directory</span>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Real-Time Action Queue: Today's Tasks & Outreach     */}
      {/* ---------------------------------------------------- */}
      <div className="action-queue-section">
        <div className="action-queue-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#15803d' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Immediate Action Queue — Applications & Mail Outreach
                  </h2>
                  <span className="badge badge-orange">{pendingJobs.length} Pending</span>
                  {appliedJobs.length > 0 && (
                    <span className="badge badge-applied">
                      <Check size={11} /> {appliedJobs.length} Applied
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Flow: 1. Open job link ➔ 2. Use tailored resume ➔ 3. Send email draft ➔ 4. Hit "Mark as Applied".
                </div>
              </div>
            </div>

            <button
              className="btn btn-outline btn-sm"
              onClick={() => onNavigateTab('jobs', queueTab === 'applied-history' ? 'applied' : queueTab === 'archived-history' ? 'deleted' : 'active')}
              title="Open this queue in the full Job Pipeline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <Briefcase size={13} color="var(--accent-orange)" />
              <span>Open in Job Pipeline</span>
              <ArrowUpRight size={12} />
            </button>
          </div>

          {/* Segmented Filter Tabs */}
          <div className="action-queue-tabs">
            <button
              className={`action-queue-tab ${queueTab === 'priority' ? 'active' : ''}`}
              onClick={() => setQueueTab('priority')}
            >
              <Star size={13} color="var(--accent-orange)" />
              <span>Priority Matches ({priorityJobs.length})</span>
            </button>
            <button
              className={`action-queue-tab ${queueTab === 'with-draft' ? 'active' : ''}`}
              onClick={() => setQueueTab('with-draft')}
            >
              <Mail size={13} color="var(--accent-orange)" />
              <span>Draft Mail Ready ({withDraftJobs.length})</span>
            </button>
            <button
              className={`action-queue-tab ${queueTab === 'all-pending' ? 'active' : ''}`}
              onClick={() => setQueueTab('all-pending')}
            >
              <Clock size={13} />
              <span>All Pending ({pendingJobs.length})</span>
            </button>
            <button
              className={`action-queue-tab ${queueTab === 'applied-history' ? 'active' : ''}`}
              onClick={() => setQueueTab('applied-history')}
            >
              <CheckCircle2 size={13} color="#15803d" />
              <span>Applied History ({appliedJobs.length})</span>
            </button>
            {deletedJobs.length > 0 && (
              <button
                className={`action-queue-tab ${queueTab === 'archived-history' ? 'active' : ''}`}
                onClick={() => setQueueTab('archived-history')}
              >
                <Trash2 size={13} />
                <span>Dismissed ({deletedJobs.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Task Cards List */}
        <div className="task-list-grid">
          {displayedJobs.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={32} color="#166534" />
              <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)' }}>
                {queueTab === 'applied-history'
                  ? 'No jobs marked as applied yet.'
                  : queueTab === 'archived-history'
                  ? 'No dismissed or archived jobs.'
                  : 'All caught up! No pending applications in this filter.'}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {queueTab === 'applied-history'
                  ? 'Click "Mark as Applied" on any job card to record it here.'
                  : queueTab === 'archived-history'
                  ? 'Dismissed jobs can be restored back to active at any time.'
                  : 'Great job staying on top of your application pipeline.'}
              </div>
            </div>
          ) : (
            displayedJobs.map((job) => {
              const isTier1 = job.matchScore >= 90;
              const hasDraft = Boolean(job.gmailDraftUrl && job.gmailDraftUrl.startsWith('http'));
              const hasRecruiterEmail = Boolean(job.contactEmail && job.contactEmail !== 'Unresolved' && job.contactEmail !== '-');

              return (
                <div key={job.jobId} className="task-item-card">
                  {/* Row 1: Role, Company, Location, Match Score */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {job.jobTitle}
                        </span>
                        <span className={`badge ${isTier1 ? 'badge-orange' : 'badge-neutral'}`}>
                          {job.matchScore}/100 Match
                        </span>
                        {job.userStatus === 'applied' && (
                          <span className="badge badge-applied">
                            <Check size={11} /> Applied
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', fontSize: '0.82rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Building2 size={13} color="var(--accent-orange)" />
                          {job.company}
                        </span>
                        <span>•</span>
                        <span>{job.location}</span>
                        {job.workArrangement && <span>({job.workArrangement})</span>}
                        <span>•</span>
                        <span style={{ color: 'var(--text-muted)' }}>Required Exp: {job.requiredExperience || '0–2 yrs'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: The 3 Core Links at a Glance + Pipeline Link */}
                  <div className="task-three-links-grid">
                    {/* Link 1: Official Job Posting / Portal */}
                    {job.officialApplicationUrl || job.jobDescriptionUrl ? (
                      <a
                        href={job.officialApplicationUrl || job.jobDescriptionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="task-link-box job-link"
                        title="Open official job application link"
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Briefcase size={13} color="var(--accent-orange)" />
                          <span>1. Job Portal / Posting</span>
                        </span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="task-link-box portal-only">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Briefcase size={13} color="var(--text-muted)" />
                          <span>1. Job Link (In Pipeline)</span>
                        </span>
                      </span>
                    )}

                    {/* Link 2: Verified Tailored 1-Page PDF Resume in Google Drive */}
                    <a
                      href={job.resumePdfUrl || (job.tailoredResumeFilenameOrLink && job.tailoredResumeFilenameOrLink.startsWith('http') ? job.tailoredResumeFilenameOrLink : 'https://drive.google.com/file/d/1n009_DEQB9yPPNPcZmxmccUJHO3Kpk9I/view?usp=sharing')}
                      target="_blank"
                      rel="noreferrer"
                      className="task-link-box resume-link"
                      title="Open 1-Page Tailored Native PDF Resume in Google Drive"
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileCheck size={13} color="#15803d" />
                        <span>2. Tailored 1-Page PDF</span>
                      </span>
                      <ArrowUpRight size={12} />
                    </a>

                    {/* Link 3: Gmail Draft or Recruiter Email */}
                    {hasDraft ? (
                      <a
                        href={job.gmailDraftUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="task-link-box draft-link"
                        title="Open verified saved Gmail draft"
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={13} color="var(--accent-orange)" />
                          <span>3. Open Gmail Draft</span>
                        </span>
                        <ArrowUpRight size={12} />
                      </a>
                    ) : hasRecruiterEmail ? (
                      <a
                        href={`mailto:${job.contactEmail}?subject=${encodeURIComponent(`Application Inquiry: ${job.jobTitle} - Vikas Thirumanyam`)}`}
                        className="task-link-box draft-link"
                        title={`Verified HR contact: ${job.contactEmail}`}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <Mail size={13} color="var(--accent-orange)" />
                          <span>3. Mail {job.contactName ? job.contactName.split(' ')[0] : 'HR'} ({job.contactEmail})</span>
                        </span>
                        <ArrowUpRight size={12} />
                      </a>
                    ) : (
                      <span className="task-link-box portal-only" title="Direct application via portal (no cold email draft required)">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ShieldAlert size={12} color="var(--text-muted)" />
                          <span>3. Portal Primary (No Draft)</span>
                        </span>
                      </span>
                    )}

                    {/* Link 4: Open in Job Pipeline */}
                    <button
                      type="button"
                      onClick={() => onNavigateTab('jobs', job.userStatus === 'applied' ? 'applied' : 'active')}
                      className="task-link-box portal-only"
                      title="Inspect full audit breakdown and requirements in Job Pipeline"
                      style={{ cursor: 'pointer', textAlign: 'left', border: '1px dashed var(--border-color)' }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Briefcase size={13} color="var(--accent-orange)" />
                        <span>Pipeline Details</span>
                      </span>
                      <ArrowUpRight size={12} />
                    </button>
                  </div>

                  {/* Row 3: Action Buttons & State Transitions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {job.userStatus === 'applied' ? (
                        <span>
                          Applied date: <strong style={{ color: '#15803d' }}>{job.appliedAt ? new Date(job.appliedAt).toLocaleDateString() : 'Recorded'}</strong>
                        </span>
                      ) : job.userStatus === 'deleted' ? (
                        <span style={{ color: 'var(--danger)' }}>
                          Status: <strong>Dismissed / Archived</strong>
                        </span>
                      ) : (
                        <span>
                          Key Stack: <code>{job.keyRequiredSkills.slice(0, 75)}...</code>
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {job.userStatus === 'applied' ? (
                        <>
                          <span className="badge badge-applied" style={{ padding: '4px 10px' }}>
                            <Check size={12} /> Applied
                          </span>
                          <button
                            className="btn-restore-active"
                            onClick={() => onJobStatusChange?.(job.jobId, 'active')}
                            title="Restore back to Active Pipeline"
                          >
                            <RotateCcw size={13} />
                            <span>Restore to Active</span>
                          </button>
                        </>
                      ) : job.userStatus === 'deleted' ? (
                        <button
                          className="btn-restore-active"
                          onClick={() => onJobStatusChange?.(job.jobId, 'active')}
                          title="Restore back to Active Pipeline"
                        >
                          <RotateCcw size={13} />
                          <span>Restore to Active</span>
                        </button>
                      ) : (
                        <>
                          <button
                            className="btn-mark-applied"
                            onClick={() => onJobStatusChange?.(job.jobId, 'applied')}
                            title="Mark as Applied (moves to Applied module & history)"
                          >
                            <Check size={13} />
                            <span>Mark as Applied</span>
                          </button>
                          <button
                            className="btn-mark-delete"
                            onClick={() => onJobStatusChange?.(job.jobId, 'deleted')}
                            title="Dismiss / Delete from active list"
                          >
                            <Trash2 size={13} />
                            <span>Dismiss</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Visual Insights & Charts Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--accent-orange)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Pipeline Analytics & Telemetry Insights</h2>
        </div>
        <OverviewCharts />
      </div>

      {/* Action Items Checklist Table / Stacked Cards */}
      <div className="section-card">
        <div className="section-header">
          <div className="section-title">
            <CheckSquare size={18} color="var(--accent-orange)" />
            <span>Dashboard & Action Checklist (Awaiting Your Review)</span>
          </div>
          <span className="badge badge-orange">{actions.length} Items Pending Review</span>
        </div>

        {/* Desktop Table View */}
        <div className="data-table-wrapper data-table-desktop">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '44px' }}>Done</th>
                <th>Priority</th>
                <th>Action Item</th>
                <th>Reasoning & Match Impact</th>
                <th>Status</th>
                <th>Action Link</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((act) => (
                <tr key={act.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={act.done}
                      readOnly
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--accent-orange)' }}
                      aria-label={`Mark ${act.actionItem} done`}
                    />
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        act.priority.includes('Priority #1') || act.priority.includes('Priority #2') || act.priority.includes('Priority #3')
                          ? 'badge-orange'
                          : 'badge-neutral'
                      }`}
                    >
                      {act.priority}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{act.actionItem}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: '400px' }}>
                    {act.why}
                  </td>
                  <td>
                    <span className="badge badge-orange">{act.status}</span>
                  </td>
                  <td>
                    {act.link ? (
                      <a
                        href={act.link}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        <span>Open Portal</span>
                        <ArrowUpRight size={12} />
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>Internal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Action Cards */}
        <div className="action-cards-mobile">
          {actions.map((act) => (
            <div key={act.id} className="action-card-mobile">
              <div className="action-card-mobile-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={act.done}
                    readOnly
                    style={{ width: '20px', height: '20px', accentColor: 'var(--accent-orange)' }}
                    aria-label={`Mark ${act.actionItem} done`}
                  />
                  <div className="action-card-mobile-title">{act.actionItem}</div>
                </div>
                <span
                  className={`badge ${
                    act.priority.includes('Priority #1') || act.priority.includes('Priority #2') || act.priority.includes('Priority #3')
                      ? 'badge-orange'
                      : 'badge-neutral'
                  }`}
                >
                  {act.priority}
                </span>
              </div>

              <div className="action-card-mobile-why">{act.why}</div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <span className="badge badge-orange">{act.status}</span>
                {act.link && (
                  <a
                    href={act.link}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-touch"
                    style={{ padding: '8px 16px' }}
                  >
                    <span>Open Portal</span>
                    <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Health & Provenance Overview Table */}
      <IntegrationHealthTable status={integrationStatus || null} compact />

      {/* Connected Workspace Repositories */}
      <div className="section-card">
        <div className="section-header">
          <div className="section-title">
            <ExternalLink size={18} color="var(--accent-orange)" />
            <span>Authoritative Connected Workspace Repositories</span>
          </div>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
          <a
            href="https://drive.google.com/drive/folders/1g5Hb8zaQPcVXjXdcDG7hvwoN14y0MGRc"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline btn-touch"
            style={{ borderColor: 'var(--accent-orange)', color: 'var(--accent-orange)' }}
          >
            <FileCheck size={16} color="var(--accent-orange)" />
            <span>updated resume Drive Folder (10 Native PDFs)</span>
            <ExternalLink size={13} />
          </a>

          <a
            href="https://drive.google.com/file/d/1n009_DEQB9yPPNPcZmxmccUJHO3Kpk9I/view?usp=sharing"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline btn-touch"
          >
            <FileCheck size={16} color="var(--accent-orange)" />
            <span>Master Baseline PDF (Resume_Impact)</span>
            <ExternalLink size={13} />
          </a>

          <a
            href="https://docs.google.com/spreadsheets/d/1NnQzoTppnqQQxO7o6Bzo6CZN-kajKLIHhvVFgi7XP6g/edit"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline btn-touch"
          >
            <Database size={16} color="#15803D" />
            <span>Master Tracker Google Sheet (7 Tabs)</span>
            <ExternalLink size={13} />
          </a>

          <a
            href="https://docs.google.com/document/d/1eN9-xYDN-ob9eu4QLL-x-hnhOHRZ1wBBHFcax7QM1jA/edit"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline btn-touch"
          >
            <FileCheck size={16} color="var(--text-muted)" />
            <span>Master Resume & Tailored Pack Doc (v2)</span>
            <ExternalLink size={13} />
          </a>

          <a
            href="https://mail.google.com/mail/?authuser=vikastirumanyam@gmail.com#drafts"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline btn-touch"
          >
            <Mail size={16} color="#DC2626" />
            <span>Gmail Drafts Box (6 Preserved Drafts)</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
};
