import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Radio,
  RefreshCw,
  Search,
  Filter,
  Tag,
} from 'lucide-react';
import type { AgentEvent } from '../types';

interface LiveAgentViewProps {
  events: AgentEvent[];
  sseConnected: boolean;
  onSync: () => void;
  syncing: boolean;
}

export const LiveAgentView: React.FC<LiveAgentViewProps> = ({
  events,
  sseConnected,
  onSync,
  syncing,
}) => {
  const [selectedRun, setSelectedRun] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Extract unique run IDs
  const runIds = Array.from(new Set(events.map((e) => e.runId))).filter(Boolean);

  const filteredEvents = events.filter((ev) => {
    if (selectedRun !== 'all' && ev.runId !== selectedRun) return false;
    if (statusFilter !== 'all' && ev.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        ev.stage.toLowerCase().includes(term) ||
        ev.message.toLowerCase().includes(term) ||
        (ev.recordId && ev.recordId.toLowerCase().includes(term)) ||
        ev.eventId.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="content-body">
      {/* Top Telemetry Header Card */}
      <div className="section-card">
        <div className="section-header">
          <div className="section-title">
            <Activity size={18} color="var(--accent-orange)" />
            <span>Structured Agent Telemetry Log ({events.length} Recorded Events)</span>
          </div>

          <div className="section-actions">
            {sseConnected ? (
              <span className="badge badge-live">
                <span className="pulse-dot" />
                <Radio size={12} />
                <span>Live SSE Streaming Active</span>
              </span>
            ) : (
              <span className="badge badge-warning">
                <Radio size={12} />
                <span>Reconnecting Stream...</span>
              </span>
            )}

            <button
              className="btn btn-outline btn-sm"
              onClick={onSync}
              disabled={syncing}
              title="Publish a live verification event & refresh tracker"
            >
              <RefreshCw size={13} className={syncing ? 'spin' : ''} />
              <span>{syncing ? 'Syncing...' : 'Emit Verification Ping'}</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div
          style={{
            padding: '14px 24px',
            backgroundColor: 'var(--bg-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 240px' }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              className="search-input"
              placeholder="Search stage, message, record ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={15} color="var(--text-muted)" />
            <select
              className="select-filter"
              value={selectedRun}
              onChange={(e) => setSelectedRun(e.target.value)}
            >
              <option value="all">All Execution Runs ({runIds.length})</option>
              {runIds.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <select
              className="select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Outcomes</option>
              <option value="succeeded">Succeeded Only</option>
              <option value="failed">Failed / Warnings</option>
              <option value="started">Started</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Timeline List */}
      <div className="section-card" style={{ padding: '24px' }}>
        {filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
            No agent events match the current filter criteria.
          </div>
        ) : (
          <div className="timeline">
            {filteredEvents.map((ev) => {
              const isSuccess = ev.status === 'succeeded';
              const isFailed = ev.status === 'failed';

              return (
                <div key={ev.eventId} className="timeline-item">
                  <div className={`timeline-dot ${isSuccess ? 'succeeded' : isFailed ? 'failed' : ''}`}>
                    {isSuccess ? (
                      <CheckCircle2 size={16} color="var(--success)" />
                    ) : isFailed ? (
                      <XCircle size={16} color="var(--danger)" />
                    ) : (
                      <Activity size={15} color="var(--accent-orange)" />
                    )}
                  </div>

                  <div className="timeline-content">
                    <div className="timeline-meta">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span className="badge badge-neutral" style={{ fontWeight: 700, fontSize: '0.72rem' }}>
                          {ev.eventId}
                        </span>
                        <span className="badge badge-orange" style={{ fontSize: '0.7rem' }}>
                          {ev.runId}
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                          {ev.stage}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        <Clock size={12} />
                        <span>{ev.timestamp.replace('T', ' ').slice(0, 19)} IST</span>
                        <span className={`badge ${isSuccess ? 'badge-live' : isFailed ? 'badge-danger' : 'badge-neutral'}`}>
                          {ev.status}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: '6px', fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                      {ev.message}
                    </div>

                    {ev.recordId && (
                      <div style={{ marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Tag size={12} color="var(--accent-orange)" />
                        <span>Record Anchor: <code>{ev.recordId}</code></span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
