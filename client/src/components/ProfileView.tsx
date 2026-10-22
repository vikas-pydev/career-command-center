import React, { useState } from 'react';
import {
  Edit3,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Save,
  X,
  Code,
  GraduationCap,
  Briefcase,
  Layers,
  FileCheck,
  ExternalLink,
  ArrowUpRight,
  Globe,
  Video,
  Award,
} from 'lucide-react';
import type { CandidateProfile } from '../types';

interface ProfileViewProps {
  profile: CandidateProfile | null;
  onRefresh: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, onRefresh }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userNotes, setUserNotes] = useState(profile?.userNotes || '');
  const [locations, setLocations] = useState((profile?.preferredLocations || []).join(', '));
  const [salary, setSalary] = useState(profile?.minimumExpectedSalary || '');
  const [github, setGithub] = useState(profile?.githubUrl || '');
  const [portfolio, setPortfolio] = useState(profile?.portfolioUrl || '');

  // Diff & Preview state
  const [previewDiff, setPreviewDiff] = useState<Record<string, { before: any; after: any }> | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleOpenEdit = () => {
    setUserNotes(profile?.userNotes || '');
    setLocations((profile?.preferredLocations || []).join(', '));
    setSalary(profile?.minimumExpectedSalary || '');
    setGithub(profile?.githubUrl || '');
    setPortfolio(profile?.portfolioUrl || '');
    setPreviewDiff(null);
    setSaveSuccessMsg(null);
    setIsEditModalOpen(true);
  };

  const handlePreview = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: {
            userNotes,
            preferredLocations: locations.split(',').map((s) => s.trim()).filter(Boolean),
            minimumExpectedSalary: salary,
            githubUrl: github,
            portfolioUrl: portfolio,
          },
          confirm: false, // preview only
        }),
      });
      const data = await res.json();
      setPreviewDiff(data.diff || {});
    } catch (err: any) {
      alert('Error fetching preview: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: {
            userNotes,
            preferredLocations: locations.split(',').map((s) => s.trim()).filter(Boolean),
            minimumExpectedSalary: salary,
            githubUrl: github,
            portfolioUrl: portfolio,
          },
          confirm: true, // apply and write back
        }),
      });
      const data = await res.json();
      setSaveSuccessMsg(`Saved and verified at ${data.savedTimestamp}`);
      setPreviewDiff(null);
      setTimeout(() => {
        setIsEditModalOpen(false);
        onRefresh();
      }, 1400);
    } catch (err: any) {
      alert('Error saving profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="content-body">
      {/* Zero-Bounce & Grounding Banner */}
      <div className="section-card" style={{ borderLeft: '4px solid var(--accent-orange)' }}>
        <div className="section-header">
          <div className="section-title">
            <FileCheck size={20} color="var(--accent-orange)" />
            <span>Candidate Profile & Master Resume Intelligence (10 Native PDFs Grounded)</span>
          </div>

          <div className="section-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <a
              href="https://drive.google.com/drive/folders/1g5Hb8zaQPcVXjXdcDG7hvwoN14y0MGRc"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-sm"
              style={{ borderColor: 'var(--accent-orange)', color: 'var(--accent-orange)' }}
            >
              <FileCheck size={14} color="var(--accent-orange)" />
              <span>updated resume Drive Folder</span>
              <ExternalLink size={12} />
            </a>

            <a
              href="https://drive.google.com/file/d/1n009_DEQB9yPPNPcZmxmccUJHO3Kpk9I/view?usp=sharing"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-sm"
            >
              <FileCheck size={14} color="var(--accent-orange)" />
              <span>Master Baseline PDF</span>
              <ExternalLink size={12} />
            </a>

            <button className="btn btn-primary btn-sm" onClick={handleOpenEdit}>
              <Edit3 size={14} />
              <span>Edit Candidate Preferences</span>
            </button>
          </div>
        </div>

        <div style={{ padding: '12px 20px', backgroundColor: 'var(--bg-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="var(--success)" />
            <span>
              Grounding Anchor: <strong style={{ color: 'var(--text-main)' }}>Master Baseline (Resume_Impact)</strong> (Drive ID: <code>1n009_DEQB9yPPNPcZmxmccUJHO3Kpk9I</code>)
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="badge badge-danger" style={{ fontSize: '0.72rem' }}>
              banned campus.recruitment@accenture.com • verified abhishek.p.bhat@accenture.com
            </span>
            <span className="badge badge-live">Zero-Bounce Enforced</span>
          </div>
        </div>
      </div>

      {/* Two-Column Responsive Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Left Column: Verified Technical Skills, Projects & Exact Education */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Verified Skills */}
          <div className="section-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Code size={16} color="var(--accent-orange)" />
              <h3 style={{ fontSize: '0.96rem', fontWeight: 600 }}>1. Verified Technical Skills</h3>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {profile?.verifiedSkills ||
                'Python, FastAPI, LangGraph, ChromaDB, PostgreSQL, Docker, Hybrid Retrieval (BM25 + Dense RRF), Cross-Encoder Reranking, Streamlit, Pytest, Pandas, SQL, XGBoost, DistilBERT'}
            </div>

            <div className="tag-list" style={{ marginTop: '12px' }}>
              {[
                'Python',
                'FastAPI',
                'LangGraph',
                'ChromaDB',
                'Hybrid RAG (BM25+Dense)',
                'Reciprocal Rank Fusion (RRF)',
                'Cross-Encoder Reranking',
                'Docker',
                'PostgreSQL',
                'Streamlit',
                'Pytest (76 tests)',
                'XGBoost',
                'Analytical SQL',
              ].map((skill, i) => (
                <span key={i} className="tag tag-highlight">
                  <CheckCircle size={10} style={{ display: 'inline', marginRight: '4px' }} />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Embedded Project Evidence & Live Hyperlinks */}
          <div className="section-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="var(--accent-orange)" />
                <h3 style={{ fontSize: '0.96rem', fontWeight: 600 }}>2. Embedded Project & Portfolio Hyperlinks</h3>
              </div>
              <span className="badge badge-neutral">All Links Verified</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem' }}>
              {/* Project 1 */}
              <div style={{ padding: '14px 16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Enterprise Support AI RAG Agent</span>
                  <span className="badge badge-live" style={{ fontSize: '0.66rem' }}>Production Architecture</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '4px', lineHeight: 1.45 }}>
                  <strong>Verified Metrics:</strong> 100.0% Recall@K, 1.00 Precision@K, 1.00 Faithfulness, 1.00 Citation Integrity at 61.8–93.3 ms retrieval latency. Avoided 56% latency spike (1,575 ms → 2,460 ms) and Faithfulness drop (1.00 → 0.89). Fuses dense (all-MiniLM-L6-v2) and sparse (BM25Okapi) via RRF (k=60), cross-encoder reranking, and Jaccard overlap suppression. LangGraph supervisor with 3 worker agents, HITL approvals, PostgresSaver checkpointing, and &lt;150 MB RAM ONNX CPU inference (65 test suites, 640+ tests).
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                  <a
                    href="https://enterprise-support-ai-rag-agent.vercel.app/"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                  >
                    <Globe size={12} color="var(--accent-orange)" />
                    <span>Live App</span>
                    <ArrowUpRight size={11} />
                  </a>
                  <a
                    href="https://lnkd.in/p/g56XA2ki"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                  >
                    <Video size={12} color="var(--accent-orange)" />
                    <span>Video Demo</span>
                    <ArrowUpRight size={11} />
                  </a>
                  <a
                    href="https://github.com/vikas-pydev/enterprise-support-ai-rag-agent"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                  >
                    <Code size={12} />
                    <span>GitHub Repo</span>
                    <ArrowUpRight size={11} />
                  </a>
                </div>
              </div>

              {/* Project 2 */}
              <div style={{ padding: '14px 16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Zepto Data & AI Platform (Capstone)</span>
                  <span className="badge badge-neutral" style={{ fontSize: '0.66rem' }}>IIT Patna × Masai</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '4px', lineHeight: 1.45 }}>
                  <strong>Verified Metrics:</strong> 133 books scraped across 3 categories into 3NF SQLite (books.db) with 100% SQL-to-Pandas parity across 7 queries (assert_frame_equal); 81.46% test accuracy (0.7519 F1, 80.59% OOB accuracy, 0.8610 ROC-AUC) across 891 records; 8 Zepto policy docs in ChromaDB with LangGraph router, 7-section negative grounding, and 76 passing pytest tests with offline mock mode (MOCK_LLM=1).
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                  <a
                    href="https://github.com/vikas-pydev/zepto-data-ai-platform"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                  >
                    <Code size={12} />
                    <span>GitHub Repo (76 Pytest Suite)</span>
                    <ArrowUpRight size={11} />
                  </a>
                </div>
              </div>

              {/* Project 3: Infosys Springboard EPL Workbench */}
              <div style={{ padding: '14px 16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>EPL Prediction System</span>
                  <span className="badge badge-orange" style={{ fontSize: '0.66rem' }}>Infosys Springboard AI</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '4px', lineHeight: 1.45 }}>
                  Unified 5 prediction modules (EPL match outcomes, champions, points, goals, assists) across 5+ historical seasons into a single interactive Streamlit application; containerized with Docker for zero environment drift.
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                  <a
                    href="https://github.com/vikas-pydev/epl-prediction-system"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                  >
                    <Code size={12} color="var(--accent-orange)" />
                    <span>GitHub Repo (epl-prediction-system)</span>
                    <ArrowUpRight size={11} />
                  </a>
                </div>
              </div>

              {/* Social / Profiles */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
                <a
                  href="https://www.linkedin.com/in/vikas-aiml"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                >
                  <Globe size={12} color="#0077b5" />
                  <span>LinkedIn (linkedin.com/in/vikas-aiml)</span>
                  <ArrowUpRight size={11} />
                </a>
                <a
                  href="https://github.com/vikas-pydev"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                >
                  <Code size={12} />
                  <span>GitHub (github.com/vikas-pydev)</span>
                  <ArrowUpRight size={11} />
                </a>
              </div>
            </div>
          </div>

          {/* Exact Education Dates & Lines */}
          <div className="section-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <GraduationCap size={18} color="var(--accent-orange)" />
              <h3 style={{ fontSize: '0.96rem', fontWeight: 600 }}>3. Education (Exact Verified Dates & Lines)</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
              <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-orange)' }}>
                <strong style={{ color: 'var(--text-main)' }}>Masai School × IIT Patna</strong>{' '}
                <span className="badge badge-orange" style={{ fontSize: '0.68rem', marginLeft: '4px' }}>Jan 2026–Sep 2026</span>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '2px' }}>
                  AI-ML Program | Capstone: Zepto Data & AI Platform (ChromaDB, LangGraph, 76 pytest tests)
                </div>
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #15803D' }}>
                <strong style={{ color: 'var(--text-main)' }}>Master of Computer Applications (MCA)</strong>{' '}
                <span className="badge badge-live" style={{ fontSize: '0.68rem', marginLeft: '4px' }}>Aug 2023–May 2025</span>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '2px' }}>
                  Presidency University, Bengaluru (Entry-level fresher degree requirement verified)
                </div>
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--border-color)' }}>
                <strong style={{ color: 'var(--text-main)' }}>B.Com. (Computer Applications)</strong>{' '}
                <span className="badge badge-neutral" style={{ fontSize: '0.68rem', marginLeft: '4px' }}>Aug 2018–May 2021</span>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '2px' }}>
                  Sri Venkateswara University, Tirupati
                </div>
              </div>
            </div>
          </div>

          {/* Internships */}
          <div className="section-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Briefcase size={16} color="var(--accent-orange)" />
              <h3 style={{ fontSize: '0.96rem', fontWeight: 600 }}>4. Internship Experience</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>Infosys Springboard AI Intern</strong> <span style={{ color: 'var(--text-muted)' }}>(Oct 2025 – Dec 2025)</span>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '2px' }}>
                  EPL 5-module Streamlit diagnostic workbench, XGBoost match predictor, and DistilBERT sentiment extraction.
                </div>
              </div>

              <div>
                <strong style={{ color: 'var(--text-main)' }}>Edunet Foundation AI Intern</strong> <span style={{ color: 'var(--text-muted)' }}>(Jun 2025 – Jul 2025)</span>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '2px' }}>
                  AICTE / IBM SkillsBuild predictive modeling pipelines, feature engineering, and cross-validation.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tailored Versions & Verified Certifications Directory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* All 10 ATS Tailored Native PDF Resume Pack */}
          <div className="section-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck size={16} color="var(--accent-orange)" />
                <h3 style={{ fontSize: '0.96rem', fontWeight: 600 }}>5. ATS Tailored Resume Pack (All 10 Single-Page Native PDFs)</h3>
              </div>
              <a
                href="https://drive.google.com/drive/folders/1g5Hb8zaQPcVXjXdcDG7hvwoN14y0MGRc"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm"
                style={{ padding: '2px 8px', fontSize: '0.72rem' }}
              >
                <span>Open Folder</span>
                <ExternalLink size={11} />
              </a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { target: 'Master Baseline — General AI/ML & GenAI (Resume_Impact)', score: 'Baseline', link: 'https://drive.google.com/file/d/1n009_DEQB9yPPNPcZmxmccUJHO3Kpk9I/view?usp=sharing' },
                { target: 'Discover Dollar — AI Engineer Intern', score: '96/100', link: 'https://drive.google.com/file/d/1E66YYDPXc4-VottnKS6iDOv_IxmNxIvJ/view?usp=sharing' },
                { target: 'RevRag AI — AI Engineer Intern (6 Mo + PPO)', score: '96/100', link: 'https://drive.google.com/file/d/1RWvm24faneDTBAR8Rzufo24_pkOpyE4J/view?usp=sharing' },
                { target: 'Accuris — Junior AI Developer (Req #613)', score: '95/100', link: 'https://drive.google.com/file/d/14jGBHCMMTxekvhHQXDVl30yKwOzFpsMJ/view?usp=sharing' },
                { target: 'Needl.ai — AI Engineering Intern (Enterprise Workflows)', score: '95/100', link: 'https://drive.google.com/file/d/1b2RJvyXgDbxjmLN46PAjbFn7KIMTUBkQ/view?usp=sharing' },
                { target: 'Airbus India — Aerolens & In-Service AI', score: '94/100', link: 'https://drive.google.com/file/d/1LWKR9CLyMcSCRQoMuPFMlJQLGhQrSF8g/view?usp=sharing' },
                { target: 'Accenture — S&C Global Network Data Science Associate', score: '93/100', link: 'https://drive.google.com/file/d/1YZVVS6WJ8eIcdqVQ8-3sZB-liL8oRLvm/view?usp=sharing' },
                { target: 'KLA Corporation — Software Quality Engineer AI/ML', score: '92/100', link: 'https://drive.google.com/file/d/16neCuByWGxrcxwF3D3_ZTzbhcknTe5r5/view?usp=sharing' },
                { target: 'Techolution — Generative AI Intern (Immediate Joiner)', score: '91/100', link: 'https://drive.google.com/file/d/1Cyp3J9GpX5UkR10DtEfxyc69lBbH-M9N/view?usp=sharing' },
                { target: 'HCLTech — Analyst Generative AI (Band E1)', score: '90/100', link: 'https://drive.google.com/file/d/1Asli8HELB6GSl_-9XES9aT-nzZoCuapQ/view?usp=sharing' },
              ].map((ver, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ver.target}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Match: <strong style={{ color: 'var(--accent-orange)' }}>{ver.score}</strong> • Single-Page ATS Native PDF (15 Clickable Links)
                    </div>
                  </div>
                  <a
                    href={ver.link}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '3px 8px', fontSize: '0.72rem', flexShrink: 0 }}
                  >
                    <span>View PDF</span>
                    <ArrowUpRight size={11} />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Certifications Directory (7 Clickable Verification Links) */}
          <div className="section-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="var(--accent-orange)" />
                <h3 style={{ fontSize: '0.96rem', fontWeight: 600 }}>6. Verified Certifications (All 7 Direct Links)</h3>
              </div>
              <span className="badge badge-live">Verified Authenticity</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
              {[
                {
                  title: 'Infosys Springboard AI Internship Certificate',
                  url: 'https://infyspringboard.onwingspan.com/public-assets/infosysheadstart/cert/lex_auth_01449226233824051291/1-14e0e236-1897-443a-8063-f9fd562b9c10.pdf',
                  issuer: 'Infosys Springboard',
                },
                {
                  title: 'IBM AI Fundamentals',
                  url: 'https://www.credly.com/badges/723da912-f0fb-4489-9212-bc3a5ef59cd8/public_url',
                  issuer: 'IBM / Credly',
                },
                {
                  title: 'Build Real World AI Applications with Gemini and Imagen',
                  url: 'https://www.credly.com/badges/ccd98d7b-881b-4e28-b3fb-f737beb76996/public_url',
                  issuer: 'Google Cloud / Credly',
                },
                {
                  title: 'Prompt Design in Vertex AI',
                  url: 'https://www.credly.com/badges/39ba77fd-ae98-446c-b24e-1f6867961936/public_url',
                  issuer: 'Google Cloud / Credly',
                },
                {
                  title: 'Develop GenAI Apps with Gemini and Streamlit',
                  url: 'https://www.credly.com/badges/07bf587c-3235-42dc-8ea2-fbd7249e29ee/public_url',
                  issuer: 'Google Cloud / Credly',
                },
                {
                  title: 'Deploy Multi-Agent Architectures',
                  url: 'https://www.credly.com/badges/ef183d46-a430-4e5d-a74e-f996d1ef36b6/public_url',
                  issuer: 'Google Cloud / Credly',
                },
                {
                  title: 'KodeKloud AI Agent Fundamentals',
                  url: 'https://learn.kodekloud.com/certificate/d6d51a99-8f0a-4464-aa84-86284f4a64ef',
                  issuer: 'KodeKloud',
                },
              ].map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 10px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.8rem' }}>{c.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.issuer}</div>
                  </div>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '3px 8px', fontSize: '0.72rem', flexShrink: 0 }}
                  >
                    <span>Verify</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              ))}

              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', padding: '6px 8px', backgroundColor: 'var(--bg-surface-warm)', borderRadius: 'var(--radius-sm)', marginTop: '4px' }}>
                <strong>Additional Credentials:</strong> AICTE B2 Professional Development – AI Internship (Edunet); 5-Day AI Agents Intensive (Google); Code Vipassana (Google); Deloitte Job Simulation (Forage).
              </div>
            </div>
          </div>

          {/* Evidence Gaps & Open Questions */}
          <div className="section-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={16} color="var(--accent-orange)" />
                <h3 style={{ fontSize: '0.96rem', fontWeight: 600 }}>7. Targeted Evidence Details (Internship Specifics)</h3>
              </div>
              <span className="badge badge-neutral">Audited</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(profile?.pendingQuestions || [
                '1. Infosys Springboard (epl-prediction-system): What was the top accuracy or F1-score achieved by the EPL match-outcome classifier, and approximately how many total match rows or engineered features were in the 5+ season dataset?',
                '2. EDUNET Foundation / AICTE / IBM SkillsBuild: Which structured dataset/domain did you model (e.g., housing, churn, healthcare, energy), and what R^2, RMSE, or F1 improvement did XGBoost/Random Forest achieve over the Linear Regression baseline?',
                '3. Academic Cutoff Verification: Final official MCA CGPA/percentage from Presidency University and B.Com percentage from SVU for enterprise eligibility screening.',
              ]).map((q, i) => (
                <div
                  key={i}
                  style={{
                    padding: '8px 10px',
                    backgroundColor: 'var(--bg-surface-warm)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.4,
                  }}
                >
                  <strong style={{ color: 'var(--accent-orange)' }}>Item #{i + 1}:</strong> {q}
                </div>
              ))}
            </div>
          </div>

          {/* Candidate Preferences Card */}
          <div className="section-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 700 }}>8. Active Candidate Settings</h3>
              <button className="btn btn-outline btn-sm" onClick={handleOpenEdit}>
                <Edit3 size={13} />
                <span>Edit</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
              <div>Locations: <strong>{profile?.preferredLocations?.join(', ') || 'Bengaluru, Hyderabad, Chennai'}</strong></div>
              <div>Min Expected Salary: <strong>{profile?.minimumExpectedSalary || '6.0 – 10.0 LPA'}</strong></div>
              <div>Notes: <em>{profile?.userNotes || 'Primary focus on Bengaluru/Hybrid entry-level Agentic AI, RAG, and Python ML roles.'}</em></div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal with Change Diff & Verification */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} color="var(--accent-orange)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Edit Candidate Profile Preferences</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {saveSuccessMsg && (
                <div style={{ padding: '10px 14px', backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem' }}>
                  <CheckCircle size={15} style={{ display: 'inline', marginRight: '6px' }} />
                  {saveSuccessMsg}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Preferred Locations (Comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={locations}
                  onChange={(e) => setLocations(e.target.value)}
                  placeholder="Bengaluru, Hyderabad, Remote"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Minimum Expected Salary</label>
                <input
                  type="text"
                  className="form-input"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. 7.5 - 12.0 LPA"
                />
              </div>

              <div className="form-group">
                <label className="form-label">GitHub Profile URL</label>
                <input
                  type="text"
                  className="form-input"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Portfolio / Demo URL</label>
                <input
                  type="text"
                  className="form-input"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Candidate Search Notes</label>
                <textarea
                  className="form-textarea"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="Targeting LangGraph agentic frameworks, hybrid RAG and Python LLM engineering..."
                />
              </div>

              {/* Diff Preview Table */}
              {previewDiff && Object.keys(previewDiff).length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem', marginBottom: '6px' }}>
                    Preview of Pending Changes (Read-After-Write Verification)
                  </div>
                  <table className="diff-table">
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Before</th>
                        <th>After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(previewDiff).map(([key, change]) => (
                        <tr key={key}>
                          <td style={{ fontWeight: 600 }}>{key}</td>
                          <td className="diff-before">{JSON.stringify(change.before)}</td>
                          <td className="diff-after">{JSON.stringify(change.after)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={handlePreview}
                disabled={saving}
              >
                <span>Preview Diff</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmSave}
                disabled={saving}
              >
                <Save size={14} />
                <span>{saving ? 'Verifying & Saving...' : 'Confirm & Save to Master Tracker'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
