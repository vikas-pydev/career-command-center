import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Info } from 'lucide-react';

export const OverviewCharts: React.FC = () => {
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  // Data for Chart 1: Runs Timeline
  const runData = [
    { label: 'RUN-1020-001', discovered: 16, eligible: 13, cap: 25 },
    { label: 'RUN-1020-002', discovered: 18, eligible: 13, cap: 25 },
    { label: 'RUN-1021-002', discovered: 24, eligible: 19, cap: 25 },
    { label: 'CURRENT MIRROR', discovered: 23, eligible: 19, cap: 25 },
  ];

  // Data for Chart 2: Pipeline Match Breakdown
  const pipelineSegments = [
    { label: 'Tier-1 Strong (90–96)', count: 10, percentage: '43.5%', color: '#F05A0A', desc: 'RevRag, Discover Dollar, Needl, Accuris, Airbus, Accenture, KLA, Techolution, HCLTech' },
    { label: 'Tier-2 Eligible (70–89)', count: 9, percentage: '39.1%', color: '#F59E0B', desc: 'Airbus In-Service, Trinity, GE Vernova, Qualcomm, Infosys, Tekion, etc.' },
    { label: 'Hard-Excluded (>=3 yrs)', count: 3, percentage: '13.0%', color: '#DC2626', desc: 'Applied Systems, Amgen, Infosys TA' },
    { label: 'Historical Benchmarks', count: 1, percentage: '4.4%', color: '#78716C', desc: 'Preserved benchmark records (Kiksy.ai)' },
  ];

  // Data for Chart 3: Specialization Domain Mix
  const domainSkills = [
    { domain: 'LangGraph & Hybrid RAG', count: 11, percentage: 48, color: '#F05A0A' },
    { domain: 'GenAI & Python APIs', count: 6, percentage: 26, color: '#EA580C' },
    { domain: 'Test Automation & Evals', count: 4, percentage: 17, color: '#F59E0B' },
    { domain: 'Data Engineering & SQL', count: 2, percentage: 9, color: '#84CC16' },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '18px',
      }}
    >
      {/* Chart 1: Jobs Discovered & Retained Over Time */}
      <div className="section-card" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={17} color="var(--accent-orange)" />
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>Discovery & Retention Runs</h3>
          </div>
          <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>Cap: 25 Jobs</span>
        </div>

        {/* SVG Bar Chart */}
        <div style={{ width: '100%', height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '14px', paddingTop: '20px', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
          {/* Target Cap 25 reference line */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: 0,
              right: 0,
              borderTop: '1px dashed var(--accent-orange)',
              opacity: 0.6,
              display: 'flex',
              justifyContent: 'flex-end',
              fontSize: '0.68rem',
              color: 'var(--accent-orange)',
              paddingRight: '6px',
            }}
          >
            Max 25 / Run Cap
          </div>

          {runData.map((r, i) => {
            const discHeight = (r.discovered / 25) * 130;
            const eligHeight = (r.eligible / 25) * 130;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: '140px' }}>
                  {/* Discovered bar */}
                  <div
                    style={{
                      width: '20px',
                      height: `${discHeight}px`,
                      backgroundColor: 'var(--accent-orange)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease',
                      position: 'relative',
                    }}
                    title={`Discovered: ${r.discovered}`}
                  >
                    <span style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-orange)' }}>
                      {r.discovered}
                    </span>
                  </div>
                  {/* Eligible bar */}
                  <div
                    style={{
                      width: '20px',
                      height: `${eligHeight}px`,
                      backgroundColor: '#15803D',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease',
                      position: 'relative',
                    }}
                    title={`Eligible (0-2 yrs): ${r.eligible}`}
                  >
                    <span style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', fontWeight: 700, color: '#15803D' }}>
                      {r.eligible}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                  {r.label}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px', fontSize: '0.74rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--accent-orange)', borderRadius: '2px' }} />
            <span>Discovered Opportunities</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: '#15803D', borderRadius: '2px' }} />
            <span>Eligible Retained (0–2 yrs)</span>
          </div>
        </div>
      </div>

      {/* Chart 2: Pipeline Match & Eligibility Breakdown */}
      <div className="section-card" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={17} color="var(--accent-orange)" />
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>Eligibility & Match Tiers</h3>
          </div>
          <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>18 Roles</span>
        </div>

        {/* Stacked Progress Bar */}
        <div style={{ height: '22px', display: 'flex', borderRadius: 'var(--radius-sm)', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}>
          {pipelineSegments.map((seg, i) => (
            <div
              key={i}
              style={{
                width: seg.percentage,
                backgroundColor: seg.color,
                transition: 'opacity 0.2s',
                opacity: activeSegment && activeSegment !== seg.label ? 0.4 : 1,
                cursor: 'pointer',
              }}
              onMouseEnter={() => setActiveSegment(seg.label)}
              onMouseLeave={() => setActiveSegment(null)}
              title={`${seg.label}: ${seg.count} (${seg.percentage})`}
            />
          ))}
        </div>

        {/* Segment Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
          {pipelineSegments.map((seg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.78rem',
                padding: '4px 6px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: activeSegment === seg.label ? 'var(--bg-subtle)' : 'transparent',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setActiveSegment(seg.label)}
              onMouseLeave={() => setActiveSegment(null)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: seg.color, borderRadius: '50%', flexShrink: 0 }} />
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{seg.label}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <strong style={{ color: 'var(--text-main)' }}>{seg.count} roles</strong>
                <span style={{ color: 'var(--text-muted)', minWidth: '38px', textAlign: 'right' }}>{seg.percentage}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 3: Technical Domain Specialization */}
      <div className="section-card" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={17} color="var(--accent-orange)" />
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>Domain Specialization Mix</h3>
          </div>
          <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>Grounded in PDF</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
          {domainSkills.map((d, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{d.domain}</span>
                <span style={{ color: 'var(--text-muted)' }}>{d.count} roles ({d.percentage}%)</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${d.percentage}%`,
                    backgroundColor: d.color,
                    borderRadius: 'var(--radius-full)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '16px', padding: '10px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={13} color="var(--accent-orange)" />
          <span>Zero fabrication. RAG, LangGraph, and hybrid evaluation grounded in master resume.</span>
        </div>
      </div>
    </div>
  );
};
