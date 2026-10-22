import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building2,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowUpRight,
  X,
  RotateCcw,
  UserCheck,
  Check,
  Trash2,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import type { JobRecord } from '../types';

interface JobsViewProps {
  jobs: JobRecord[];
  onJobStatusChange?: (jobId: string, status: 'active' | 'applied' | 'deleted') => void;
  moduleTab?: 'active' | 'applied' | 'deleted';
  onModuleTabChange?: (tab: 'active' | 'applied' | 'deleted') => void;
  onNavigateTab?: (tab: string) => void;
}

export const JobsView: React.FC<JobsViewProps> = ({
  jobs,
  onJobStatusChange,
  moduleTab: controlledTab,
  onModuleTabChange,
  onNavigateTab,
}) => {
  const [internalTab, setInternalTab] = useState<'active' | 'applied' | 'deleted'>('active');
  const moduleTab = controlledTab !== undefined ? controlledTab : internalTab;
  const setModuleTab = (t: 'active' | 'applied' | 'deleted') => {
    setInternalTab(t);
    onModuleTabChange?.(t);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [eligibilityFilter, setEligibilityFilter] = useState('all');
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState<'scoreDesc' | 'scoreAsc' | 'companyAsc'>('scoreDesc');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const activeCount = jobs.filter((j) => j.userStatus === 'active' || !j.userStatus).length;
  const appliedCount = jobs.filter((j) => j.userStatus === 'applied').length;
  const deletedCount = jobs.filter((j) => j.userStatus === 'deleted').length;

  const isFiltered =
    searchTerm !== '' ||
    locationFilter !== 'all' ||
    eligibilityFilter !== 'all' ||
    minScore > 0 ||
    sortBy !== 'scoreDesc';

  const resetFilters = () => {
    setSearchTerm('');
    setLocationFilter('all');
    setEligibilityFilter('all');
    setMinScore(0);
    setSortBy('scoreDesc');
  };

  // Filter logic
  const filteredJobs = jobs
    .filter((j) => {
      // 1. Module partition filter
      if (moduleTab === 'active' && (j.userStatus === 'applied' || j.userStatus === 'deleted')) return false;
      if (moduleTab === 'applied' && j.userStatus !== 'applied') return false;
      if (moduleTab === 'deleted' && j.userStatus !== 'deleted') return false;

      // 2. Standard filters
      if (locationFilter !== 'all' && !j.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
      if (eligibilityFilter === 'eligible' && j.eligibilityStatus.startsWith('Excluded')) return false;
      if (eligibilityFilter === 'excluded' && !j.eligibilityStatus.startsWith('Excluded')) return false;
      if (j.matchScore < minScore) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          j.company.toLowerCase().includes(term) ||
          j.jobTitle.toLowerCase().includes(term) ||
          j.keyRequiredSkills.toLowerCase().includes(term) ||
          j.matchingSkills.toLowerCase().includes(term) ||
          j.notes.toLowerCase().includes(term)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'scoreDesc') return b.matchScore - a.matchScore;
      if (sortBy === 'scoreAsc') return a.matchScore - b.matchScore;
      if (sortBy === 'companyAsc') return a.company.localeCompare(b.company);
      return 0;
    });

  const toggleExpand = (id: string) => {
    setExpandedJobId(expandedJobId === id ? null : id);
  };

  return (
    <div className="content-body">
      {/* Module Selector: Active Pipeline / Applied Module / Archived */}
      <div className="jobs-module-nav">
        <button
          className={`jobs-module-tab ${moduleTab === 'active' ? 'active' : ''}`}
          onClick={() => setModuleTab('active')}
        >
          <Briefcase size={15} />
          <span>Active Pipeline</span>
          <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>{activeCount}</span>
        </button>
        <button
          className={`jobs-module-tab tab-applied ${moduleTab === 'applied' ? 'active' : ''}`}
          onClick={() => setModuleTab('applied')}
        >
          <CheckCircle2 size={15} color="#15803d" />
          <span>Applied Module</span>
          <span className="badge badge-applied" style={{ fontSize: '0.72rem' }}>{appliedCount}</span>
        </button>
        <button
          className={`jobs-module-tab ${moduleTab === 'deleted' ? 'active' : ''}`}
          onClick={() => setModuleTab('deleted')}
        >
          <Trash2 size={15} />
          <span>Archived / Dismissed</span>
          <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>{deletedCount}</span>
        </button>

        {onNavigateTab && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onNavigateTab('overview')}
            style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Return to Dashboard Overview and Action Queue"
          >
            <span>Overview & Actions</span>
            <ArrowUpRight size={12} />
          </button>
        )}
      </div>

      {/* Header & Filter Card */}
      <div className="section-card">
        <div className="section-header">
          <div className="section-title">
            <Briefcase size={17} color="var(--accent-orange)" />
            <span>
              {moduleTab === 'active'
                ? `Active Opportunities (${filteredJobs.length} of ${activeCount})`
                : moduleTab === 'applied'
                ? `Applied Applications (${filteredJobs.length} of ${appliedCount})`
                : `Archived / Dismissed (${filteredJobs.length} of ${deletedCount})`}
            </span>
          </div>

          <div className="section-actions">
            <button
              className="btn btn-outline btn-sm mobile-filter-toggle"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              style={{ display: 'none' }}
              aria-label="Toggle filters"
            >
              <Filter size={13} />
              <span>{showMobileFilters ? 'Hide Filters' : 'Filters'}</span>
            </button>
            <span className="badge badge-neutral">Master Tracker • Tab 2</span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div
          className={`filter-toolbar ${showMobileFilters ? 'mobile-visible' : ''}`}
          style={{
            padding: '12px 18px',
            backgroundColor: 'var(--bg-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: '1 1 240px' }}>
            <Search
              size={14}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }}
            />
            <input
              type="text"
              className="search-input"
              placeholder="Search titles, companies, skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '30px', paddingRight: searchTerm ? '28px' : '10px' }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Location Filter */}
          <select
            className="select-filter"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="all">All Locations</option>
            <option value="bengaluru">Bengaluru</option>
            <option value="hyderabad">Hyderabad</option>
            <option value="chennai">Chennai</option>
          </select>

          {/* Eligibility Filter */}
          <select
            className="select-filter"
            value={eligibilityFilter}
            onChange={(e) => setEligibilityFilter(e.target.value)}
          >
            <option value="all">All Roles ({jobs.length})</option>
            <option value="eligible">Eligible (0–2 yrs exp)</option>
            <option value="excluded">Hard-Excluded (&gt;=3 yrs)</option>
          </select>

          {/* Min Score Slider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-surface)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
            }}
          >
            <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Min Score:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              style={{ cursor: 'pointer', accentColor: 'var(--accent-orange)', width: '80px' }}
            />
            <span style={{ fontWeight: 600, minWidth: '22px', textAlign: 'right' }}>{minScore}</span>
          </div>

          {/* Sort Order */}
          <select
            className="select-filter"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="scoreDesc">Sort: Highest Match Score</option>
            <option value="scoreAsc">Sort: Lowest Match Score</option>
            <option value="companyAsc">Sort: Company Name A–Z</option>
          </select>

          {/* Reset Filters button */}
          {isFiltered && (
            <button
              className="btn btn-outline btn-sm"
              onClick={resetFilters}
              style={{ padding: '4px 10px', fontSize: '0.74rem' }}
              title="Reset all filters"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Responsive Job Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '16px',
        }}
      >
        {filteredJobs.length === 0 ? (
          <div
            className="section-card"
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              gridColumn: '1 / -1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <Briefcase size={32} color="var(--text-muted)" style={{ opacity: 0.6 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.98rem', color: 'var(--text-main)' }}>
                No jobs match the current criteria
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Try clearing search terms or lowering the minimum match score threshold.
              </div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={resetFilters}>
              <RotateCcw size={13} />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const isExcluded = job.eligibilityStatus.startsWith('Excluded');
            const isTier1 = job.matchScore >= 90;
            const isExpanded = expandedJobId === job.jobId;

            return (
              <div
                key={job.jobId}
                className="section-card job-card"
                style={{
                  borderLeft: isExcluded
                    ? '3px solid var(--danger)'
                    : isTier1
                    ? '3px solid var(--accent-orange)'
                    : '3px solid var(--border-color)',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
                }}
              >
                <div>
                  {/* Top Metadata Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      {/* Job Title as Hero */}
                      <h2
                        style={{
                          fontSize: '1.02rem',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          lineHeight: 1.3,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {job.jobTitle}
                      </h2>

                      {/* Company & Location Row */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          flexWrap: 'wrap',
                          marginTop: '4px',
                          fontSize: '0.8rem',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            color: 'var(--text-main)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Building2 size={13} color="var(--accent-orange)" />
                          {job.company}
                        </span>
                        <span style={{ color: 'var(--text-light)' }}>•</span>
                        <span
                          style={{
                            color: 'var(--text-muted)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <MapPin size={12} />
                          {job.location} ({job.workArrangement})
                        </span>
                      </div>
                    </div>

                    {/* Score & Status Pills */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '4px',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        className={`score-pill ${
                          isExcluded ? 'score-excluded' : isTier1 ? 'score-tier1' : 'score-tier2'
                        }`}
                        style={{ fontSize: '0.82rem', padding: '3px 9px' }}
                      >
                        {job.matchScore > 0 ? `${job.matchScore}/100` : 'Excluded'}
                      </div>
                      <span
                        className={`badge ${isExcluded ? 'badge-danger' : 'badge-neutral'}`}
                        style={{ fontSize: '0.68rem', padding: '1px 6px' }}
                      >
                        {isExcluded ? '>=3 yrs Excluded' : job.matchClassification}
                      </span>
                    </div>
                  </div>

                  {/* Compact Operational Sub-strip */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '10px',
                      fontSize: '0.76rem',
                      color: 'var(--text-muted)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span className="badge badge-neutral" style={{ fontWeight: 600, fontSize: '0.68rem' }}>
                      {job.jobId}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={11} />
                      Exp: <strong style={{ color: 'var(--text-secondary)' }}>{job.requiredExperience}</strong>
                    </span>
                    <span style={{ color: 'var(--text-light)' }}>•</span>
                    <span>Status: <strong style={{ color: 'var(--text-secondary)' }}>{job.applicationStatus || 'Ready for Review'}</strong></span>
                    <span style={{ color: 'var(--text-light)' }}>•</span>
                    <span>Verified: {job.dateLastVerified ? job.dateLastVerified.split('T')[0] : '2026-10-20'}</span>
                  </div>

                  {/* Matching Skills Tags */}
                  {job.matchingSkills && (
                    <div style={{ marginTop: '12px' }}>
                      <div className="tag-list">
                        {job.matchingSkills
                          .split(',')
                          .slice(0, isExpanded ? undefined : 4)
                          .map((s, i) => (
                            <span key={i} className="tag tag-highlight" style={{ fontSize: '0.7rem' }}>
                              <CheckCircle size={10} style={{ display: 'inline', marginRight: '3px' }} />
                              {s.trim()}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Requirements or Warnings */}
                  {job.missingRequirements && (
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--danger-text)',
                        backgroundColor: 'var(--danger-bg)',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        marginTop: '10px',
                        border: '1px solid var(--danger-border)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '6px',
                        lineHeight: 1.4,
                      }}
                    >
                      <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{job.missingRequirements}</span>
                    </div>
                  )}

                  {/* Expandable Disclosure Details */}
                  {isExpanded && (
                    <div
                      style={{
                        marginTop: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '10px 12px',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {job.notes && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          <strong style={{ color: 'var(--text-main)' }}>Audit Rationale:</strong> {job.notes}
                        </div>
                      )}

                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        <div><strong>Required Stack:</strong> {job.keyRequiredSkills}</div>
                        <div><strong>Tailored Resume:</strong> {job.tailoredResumeFilenameOrLink || 'Master Resume (v3)'}</div>
                        {job.company.toLowerCase().includes('accenture') ? (
                          <div style={{ marginTop: '6px', padding: '6px 10px', backgroundColor: 'var(--bg-surface-warm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span className="badge badge-live" style={{ fontSize: '0.66rem' }}>Zero-Bounce Verified</span>
                              <span className="badge badge-danger" style={{ fontSize: '0.66rem' }}>banned campus.recruitment</span>
                            </div>
                            <div style={{ marginTop: '3px', color: 'var(--text-main)' }}>
                              Recruiter: <strong>Abhishek Bhat</strong> (Talent Acquisition, Bengaluru — IT Companies HR Email DB Part 1) — <code>abhishek.p.bhat@accenture.com</code>
                            </div>
                          </div>
                        ) : job.contactEmail && job.contactEmail !== 'Unresolved' && job.contactEmail !== '-' ? (
                          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <UserCheck size={12} color="var(--accent-orange)" />
                            <span>Contact: <strong>{job.contactName || 'Recruiter'}</strong> ({job.contactRole || 'Talent Acquisition'}) — <code>{job.contactEmail}</code></span>
                            <span className="badge badge-live" style={{ fontSize: '0.66rem' }}>Verified Email</span>
                          </div>
                        ) : (
                          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="badge badge-neutral" style={{ fontSize: '0.66rem' }}>
                              Portal Primary (Unverified email withheld per zero-bounce rule)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls & Actions */}
                <div
                  style={{
                    marginTop: '14px',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => toggleExpand(job.jobId)}
                    style={{ fontSize: '0.74rem', padding: '3px 8px' }}
                    aria-label={isExpanded ? 'Collapse job details' : 'Expand job details'}
                  >
                    <span>{isExpanded ? 'Hide Details' : 'View Breakdown'}</span>
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {/* Status Management Actions */}
                    {job.userStatus === 'applied' ? (
                      <>
                        <span className="badge badge-applied" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>
                          <Check size={11} /> Applied
                        </span>
                        <button
                          className="btn-restore-active"
                          style={{ padding: '3px 10px', fontSize: '0.74rem' }}
                          onClick={() => onJobStatusChange?.(job.jobId, 'active')}
                          title="Restore back to Active Pipeline"
                        >
                          <RotateCcw size={12} />
                          <span>Restore Active</span>
                        </button>
                      </>
                    ) : job.userStatus === 'deleted' ? (
                      <>
                        <span className="badge badge-danger" style={{ fontSize: '0.72rem' }}>
                          Dismissed
                        </span>
                        <button
                          className="btn-restore-active"
                          style={{ padding: '3px 10px', fontSize: '0.74rem' }}
                          onClick={() => onJobStatusChange?.(job.jobId, 'active')}
                          title="Restore back to Active Pipeline"
                        >
                          <RotateCcw size={12} />
                          <span>Restore Active</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn-mark-applied"
                          style={{ padding: '3px 11px', fontSize: '0.74rem' }}
                          onClick={() => onJobStatusChange?.(job.jobId, 'applied')}
                          title="Mark as Applied (moves to Applied module)"
                        >
                          <Check size={12} />
                          <span>Applied</span>
                        </button>
                        <button
                          className="btn-mark-delete"
                          style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                          onClick={() => onJobStatusChange?.(job.jobId, 'deleted')}
                          title="Dismiss / Archive Job"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </>
                    )}

                    {/* Direct Links */}
                    {job.gmailDraftUrl && job.gmailDraftUrl.startsWith('http') && (
                      <a
                        href={job.gmailDraftUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                        title="Open Saved Gmail Draft"
                      >
                        <Mail size={12} color="var(--accent-orange)" />
                        <span>Draft</span>
                        <ArrowUpRight size={11} />
                      </a>
                    )}

                    <a
                      href={job.resumePdfUrl || (job.tailoredResumeFilenameOrLink && job.tailoredResumeFilenameOrLink.startsWith('http') ? job.tailoredResumeFilenameOrLink : 'https://drive.google.com/file/d/1n009_DEQB9yPPNPcZmxmccUJHO3Kpk9I/view?usp=sharing')}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline btn-sm"
                      title="Open Tailored Native PDF Resume in Google Drive"
                    >
                      <FileCheck size={12} color="var(--accent-orange)" />
                      <span>PDF Resume</span>
                      <ArrowUpRight size={11} />
                    </a>

                    {job.officialApplicationUrl || job.jobDescriptionUrl ? (
                      <a
                        href={job.officialApplicationUrl || job.jobDescriptionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary btn-sm"
                      >
                        <span>Portal</span>
                        <ArrowUpRight size={12} />
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

