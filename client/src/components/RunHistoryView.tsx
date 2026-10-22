import React, { useState } from 'react';
import {
  History,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { AgentEvent, RunHistoryRecord } from '../types';

interface RunHistoryViewProps {
  runs: RunHistoryRecord[];
  allEvents: AgentEvent[];
}

export const RunHistoryView: React.FC<RunHistoryViewProps> = ({ runs, allEvents }) => {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(runs[0]?.runId || null);
  const [expandedMobileRun, setExpandedMobileRun] = useState<string | null>(runs[0]?.runId || null);

  const selectedRunEvents = allEvents.filter((e) => e.runId === selectedRunId);

  return (
    <div className="content-body">
      {/* Top Header Card */}
      <div className="section-card">
        <div className="section-header">
          <div className="section-title">
            <History size={18} color="var(--accent-orange)" />
            <span>Audit Trail & Historical Execution Records ({runs.length} Runs Recorded)</span>
          </div>
          <span className="badge badge-neutral">Authoritative Telemetry Store (Tab 7)</span>
        </div>

        {/* Desktop Table View */}
        <div className="data-table-wrapper data-table-desktop">
          <table className="data-table">
            <thead>
              <tr>
                <th>Run ID</th>
                <th>Trigger Type</th>
                <th>Start (IST)</th>
                <th>End (IST)</th>
                <th>Duration</th>
                <th>Overall Result</th>
                <th>Jobs Discovered</th>
                <th>Eligible Retained</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => {
                const isSelected = r.runId === selectedRunId;
                const isSuccess = r.overallResult.toLowerCase().includes('succeeded');

                return (
                  <tr
                    key={r.runId}
                    style={{
                      backgroundColor: isSelected ? 'var(--accent-orange-subtle)' : undefined,
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedRunId(r.runId)}
                  >
                    <td>
                      <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                        {r.runId}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.triggerType}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.actualStart}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.actualEnd}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}>
                        <Clock size={12} color="var(--text-muted)" />
                        <span>{r.duration}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${isSuccess ? 'badge-live' : 'badge-warning'}`}>
                        {r.overallResult.slice(0, 24)}...
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{r.jobsDiscovered}</td>
                    <td>{r.eligibleRetained}</td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRunId(r.runId);
                        }}
                      >
                        <span>Inspect Events</span>
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Run Cards */}
        <div className="action-cards-mobile">
          {runs.map((r) => {
            const isExpanded = expandedMobileRun === r.runId;
            const isSuccess = r.overallResult.toLowerCase().includes('succeeded');
            const runEvts = allEvents.filter((e) => e.runId === r.runId);

            return (
              <div key={r.runId} className="action-card-mobile">
                <div className="action-card-mobile-top">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                        {r.runId}
                      </span>
                      <strong style={{ fontSize: '0.9rem' }}>{r.triggerType}</strong>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {r.actualStart} → {r.actualEnd} ({r.duration})
                    </div>
                  </div>
                  <span className={`badge ${isSuccess ? 'badge-live' : 'badge-warning'}`}>
                    {isSuccess ? 'Succeeded' : 'Completed with Notes'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem', marginTop: '4px' }}>
                  <div>Discovered: <strong>{r.jobsDiscovered}</strong></div>
                  <div>Eligible: <strong>{r.eligibleRetained}</strong></div>
                  <div>Drafts: <strong>{r.draftOperations}</strong></div>
                </div>

                <button
                  className="btn btn-outline btn-touch"
                  style={{ width: '100%', marginTop: '6px' }}
                  onClick={() => setExpandedMobileRun(isExpanded ? null : r.runId)}
                >
                  <span>{isExpanded ? 'Hide Run Events' : `View ${runEvts.length} Events`}</span>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {isExpanded && (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {runEvts.map((ev) => (
                      <div
                        key={ev.eventId}
                        style={{
                          padding: '8px 10px',
                          backgroundColor: 'var(--bg-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.78rem',
                        }}
                      >
                        <div style={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                          <span>{ev.stage}</span>
                          <span className="badge badge-live" style={{ fontSize: '0.65rem' }}>{ev.status}</span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{ev.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Run Detailed Timeline */}
      {selectedRunId && (
        <div className="section-card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={17} color="var(--accent-orange)" />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 600 }}>
                Run Lifecycle Timeline: <code>{selectedRunId}</code> ({selectedRunEvents.length} Events)
              </h3>
            </div>
            <span className="badge badge-live">Verified Grounded Execution</span>
          </div>

          <div className="timeline">
            {selectedRunEvents.map((ev) => (
              <div key={ev.eventId} className="timeline-item">
                <div className="timeline-dot succeeded">
                  <CheckCircle2 size={16} color="var(--success)" />
                </div>
                <div className="timeline-content">
                  <div className="timeline-meta">
                    <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.84rem' }}>
                      {ev.stage}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {ev.timestamp.replace('T', ' ').slice(0, 19)} IST
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.45 }}>
                    {ev.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
