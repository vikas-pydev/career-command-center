import React, { useState } from 'react';
import {
  Mail,
  ShieldCheck,
  ExternalLink,
  UserCheck,
  Building,
  Copy,
  Check,
  ArrowUpRight,
  FileCheck,
} from 'lucide-react';
import type { OutreachRecord, TailoredResumeV2 } from '../types';

interface OutreachViewProps {
  outreach: OutreachRecord[];
  tailoredResumes: TailoredResumeV2[];
}

export const OutreachView: React.FC<OutreachViewProps> = ({
  outreach,
  tailoredResumes,
}) => {
  const [activeTab, setActiveTab] = useState<'drafts' | 'contacts'>('drafts');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="content-body">
      {/* Human Approval Guardrail Banner */}
      <div className="safeguard-banner">
        <div className="safeguard-text">
          <ShieldCheck size={20} color="var(--accent-orange)" />
          <div>
            <strong>Strict Human Approval Guardrail (Auto-Send Permanently Disabled):</strong>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              The system never dispatches emails automatically. All outreach is staged exclusively as drafts in your authorized Gmail account (<code>vikastirumanyam@gmail.com</code>) awaiting your explicit human review, edits, and manual dispatch.
            </div>
          </div>
        </div>
        <div className="badge badge-live" style={{ flexShrink: 0 }}>
          0 Auto-Sends Permitted
        </div>
      </div>

      {/* Strict Zero-Bounce Verified Recruiter Email Policy Banner */}
      <div className="section-card" style={{ borderLeft: '4px solid var(--accent-orange)', padding: '16px 20px', backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-danger" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                ZERO-BOUNCE POLICY
              </span>
              <strong style={{ fontSize: '0.94rem', color: 'var(--text-main)' }}>
                Banned Address: <code>campus.recruitment@accenture.com</code> (BOUNCED)
              </strong>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.45 }}>
              Guessed email patterns and unverified addresses are strictly withheld from draft creation. Replaced with verified named recruiter emails from the 1,800-row HR Database and official job postings.
            </div>
          </div>
          <span className="badge badge-live" style={{ fontSize: '0.74rem' }}>
            13 Verified Named Contacts Mapped
          </span>
        </div>

        {/* 1-Minute Quick Fix Guide for 3 Existing Gmail Drafts */}
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
          <strong style={{ color: 'var(--accent-orange)' }}>⚡ 1-Minute Action Required on Your 3 Existing Gmail Drafts:</strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px', marginTop: '8px' }}>
            <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div><strong>1. Accenture Draft</strong> (<a href="https://mail.google.com/mail/?authuser=vikastirumanyam@gmail.com#all?compose=thread-f:1879588499063925087%2Bmsg-a:r-8159868102294701814" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>Open Draft</a>)</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Replace <code>campus.recruitment@accenture.com</code> in To: with <code>srilakshmi.ramagopal@accenture.com</code> (HR Partner Bengaluru).
              </div>
            </div>

            <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div><strong>2. Discover Dollar Draft</strong> (<a href="https://mail.google.com/mail/?authuser=vikastirumanyam@gmail.com#all?compose=thread-f:1879588514802705288%2Bmsg-a:r-3686840521095354095" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>Open Draft</a>)</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Paste <code>subrahmanya@discoverdollar.com</code> (Subrahmanya Rao, CEO) into the To: field.
              </div>
            </div>

            <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div><strong>3. L&T EduTech Draft</strong> (<a href="https://mail.google.com/mail/?authuser=vikastirumanyam@gmail.com#all?compose=thread-f:1879588515525744040%2Bmsg-a:r4711525409096730367" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>Open Draft</a>)</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Paste <code>anitha.j@lntedutech.com, vikram.chandra@lntedutech.com</code> into the To: field.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="section-card">
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-subtle)',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveTab('drafts')}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: activeTab === 'drafts' ? 'var(--bg-surface)' : 'transparent',
              borderBottom: activeTab === 'drafts' ? '2px solid var(--accent-orange)' : '2px solid transparent',
              fontWeight: activeTab === 'drafts' ? 600 : 500,
              color: activeTab === 'drafts' ? 'var(--accent-orange)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.86rem',
              whiteSpace: 'nowrap',
              transition: 'color var(--transition-fast)',
            }}
          >
            <Mail size={15} />
            <span>Saved Gmail Drafts ({tailoredResumes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: activeTab === 'contacts' ? 'var(--bg-surface)' : 'transparent',
              borderBottom: activeTab === 'contacts' ? '2px solid var(--accent-orange)' : '2px solid transparent',
              fontWeight: activeTab === 'contacts' ? 600 : 500,
              color: activeTab === 'contacts' ? 'var(--accent-orange)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.86rem',
              whiteSpace: 'nowrap',
              transition: 'color var(--transition-fast)',
            }}
          >
            <UserCheck size={15} />
            <span>Recruiter Contacts Directory ({outreach.length})</span>
          </button>
        </div>

        {/* Tab 1: Saved Gmail Drafts */}
        {activeTab === 'drafts' && (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Targeted outreach pitches drafted with verified candidate skills and zero fabrication.
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <a
                  href="https://drive.google.com/drive/folders/1g5Hb8zaQPcVXjXdcDG7hvwoN14y0MGRc"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ borderColor: 'var(--accent-orange)', color: 'var(--accent-orange)' }}
                >
                  <FileCheck size={13} color="var(--accent-orange)" />
                  <span>updated resume Drive Folder</span>
                  <ExternalLink size={12} />
                </a>

                <a
                  href="https://mail.google.com/mail/?authuser=vikastirumanyam@gmail.com#drafts"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  <Mail size={13} color="var(--accent-orange)" />
                  <span>Open Gmail Drafts Folder</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '16px',
              }}
            >
              {tailoredResumes.map((tail, idx) => (
                <div
                  key={idx}
                  className="section-card"
                  style={{
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
                          {tail.targetCompanyRole}
                        </h3>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                          Recipient: <strong style={{ color: 'var(--text-secondary)' }}>{tail.outreachTo || 'Recruiting Team'}</strong>
                        </div>
                      </div>
                      <span className="score-pill score-tier1" style={{ fontSize: '0.8rem', padding: '2px 8px' }}>
                        Match: {tail.matchScore}
                      </span>
                    </div>

                    {/* Subject Line */}
                    <div
                      style={{
                        marginTop: '10px',
                        padding: '8px 10px',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <strong style={{ color: 'var(--text-main)' }}>Subject:</strong>{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {tail.outreachSubject || 'AI & Data Engineering Application — Vikas Thirumanyam'}
                      </span>
                    </div>

                    {/* Body Pitch */}
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                          PERSONALIZED PITCH BODY
                        </span>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                          onClick={() => handleCopy(tail.outreachBody || tail.professionalSummary, `draft-${idx}`)}
                        >
                          {copiedId === `draft-${idx}` ? (
                            <>
                              <Check size={11} color="var(--success)" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>Copy Pitch</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.5,
                          backgroundColor: 'var(--bg-surface-warm)',
                          border: '1px solid var(--border-color)',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          maxHeight: '150px',
                          overflowY: 'auto',
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {tail.outreachBody || tail.professionalSummary}
                      </div>
                    </div>

                    {/* Grounded competencies */}
                    <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      <strong style={{ color: 'var(--text-secondary)' }}>Highlights:</strong> {tail.coreCompetencies.slice(0, 95)}...
                    </div>
                  </div>

                  {/* Actions */}
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
                    <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                      Draft Saved • No Auto-Send
                    </span>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      {tail.drivePdfUrl && (
                        <a
                          href={tail.drivePdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline btn-sm"
                          title="Open Native PDF Resume in Google Drive"
                        >
                          <FileCheck size={12} color="var(--accent-orange)" />
                          <span>PDF Resume</span>
                          <ArrowUpRight size={11} />
                        </a>
                      )}

                      <a
                        href="https://mail.google.com/mail/?authuser=vikastirumanyam@gmail.com#drafts"
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary btn-sm"
                      >
                        <span>Open in Gmail</span>
                        <ArrowUpRight size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Recruiter Contacts Directory */}
        {activeTab === 'contacts' && (
          <div style={{ padding: '20px 24px' }}>
            <div className="data-table-wrapper data-table-desktop">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Contact Name</th>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Target Job</th>
                    <th>Verified Source</th>
                    <th>Email</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {outreach.map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700 }}>{c.contactName}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Building size={13} color="var(--accent-orange)" />
                          <strong>{c.company}</strong>
                        </span>
                      </td>
                      <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{c.role}</td>
                      <td>
                        <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                          {c.relatedJobId}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.verificationSource}</td>
                      <td style={{ fontSize: '0.84rem' }}>
                        <code>{c.email}</code>
                      </td>
                      <td>
                        {c.profileUrl ? (
                          <a
                            href={c.profileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline btn-sm"
                            style={{ padding: '3px 8px' }}
                          >
                            <span>Profile</span>
                            <ArrowUpRight size={12} />
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>Direct</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="action-cards-mobile">
              {outreach.map((c, i) => (
                <div key={i} className="action-card-mobile">
                  <div className="action-card-mobile-top">
                    <div>
                      <div className="action-card-mobile-title">{c.contactName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--accent-orange)', fontWeight: 600 }}>
                        {c.company} • {c.role}
                      </div>
                    </div>
                    <span className="badge badge-neutral">{c.relatedJobId}</span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Email: <code>{c.email}</code>
                  </div>

                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Source: {c.verificationSource}
                  </div>

                  {c.profileUrl && (
                    <a
                      href={c.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline btn-touch"
                      style={{ width: '100%' }}
                    >
                      <span>Open Recruiter Profile</span>
                      <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
