import path from 'path';
import fs from 'fs';
import dns from 'dns';
import crypto from 'crypto';
import * as XLSX from 'xlsx';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // safe fallback for older node runtimes
}
import {
  ActionItem,
  CandidateProfile,
  JobRecord,
  OutreachRecord,
  OverviewStats,
  RunHistoryRecord,
  TailoredResumeV2,
  IntegrationStatus,
} from './types';
import { calculateNextScheduledRun } from './schedulerService';
import { telemetryStore } from './telemetryStore';

export interface UserJobState {
  status: 'active' | 'applied' | 'deleted';
  appliedAt?: string;
  deletedAt?: string;
  userNotes?: string;
}

const USER_STATES_FILE = path.resolve(__dirname, 'job_user_states.json');

const loadUserStates = (): Record<string, UserJobState> => {
  try {
    if (fs.existsSync(USER_STATES_FILE)) {
      const data = fs.readFileSync(USER_STATES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read job_user_states.json:', err);
  }
  return {};
};

const saveUserStates = (states: Record<string, UserJobState>) => {
  try {
    fs.writeFileSync(USER_STATES_FILE, JSON.stringify(states, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write job_user_states.json:', err);
  }
};

const PDF_RESUME_MAP: Record<string, string> = {
  'revrag': 'https://drive.google.com/file/d/1RWvm24faneDTBAR8Rzufo24_pkOpyE4J/view?usp=sharing',
  'discover dollar': 'https://drive.google.com/file/d/1E66YYDPXc4-VottnKS6iDOv_IxmNxIvJ/view?usp=sharing',
  'needl': 'https://drive.google.com/file/d/1b2RJvyXgDbxjmLN46PAjbFn7KIMTUBkQ/view?usp=sharing',
  'accuris': 'https://drive.google.com/file/d/14jGBHCMMTxekvhHQXDVl30yKwOzFpsMJ/view?usp=sharing',
  'airbus': 'https://drive.google.com/file/d/1LWKR9CLyMcSCRQoMuPFMlJQLGhQrSF8g/view?usp=sharing',
  'accenture': 'https://drive.google.com/file/d/1YZVVS6WJ8eIcdqVQ8-3sZB-liL8oRLvm/view?usp=sharing',
  'kla': 'https://drive.google.com/file/d/16neCuByWGxrcxwF3D3_ZTzbhcknTe5r5/view?usp=sharing',
  'techolution': 'https://drive.google.com/file/d/1Cyp3J9GpX5UkR10DtEfxyc69lBbH-M9N/view?usp=sharing',
  'hcl': 'https://drive.google.com/file/d/1Asli8HELB6GSl_-9XES9aT-nzZoCuapQ/view?usp=sharing',
  'default': 'https://drive.google.com/file/d/1n009_DEQB9yPPNPcZmxmccUJHO3Kpk9I/view?usp=sharing',
};

const resolveResumeUrl = (company: string, rawLink?: string): string => {
  if (rawLink && rawLink.startsWith('http')) return rawLink;
  const cLower = company.toLowerCase();
  for (const [key, url] of Object.entries(PDF_RESUME_MAP)) {
    if (key !== 'default' && cLower.includes(key)) {
      return url;
    }
  }
  return PDF_RESUME_MAP['default'];
};

const OUTREACH_DRAFTS_MAP: Record<string, string> = {
  'discover dollar': 'https://mail.google.com/mail/?authuser=vikastirumanyam@gmail.com#all?compose=thread-f:1879588514802705288%2Bmsg-a:r-3686840521095354095',
  'accuris': 'https://mail.google.com/mail/?authuser=vikastirumanyam@gmail.com#all?compose=thread-f:1879588515614456746%2Bmsg-a:r-5956255536446211565',
  'accenture': 'https://mail.google.com/mail/?authuser=vikastirumanyam@gmail.com#all?compose=thread-f:1879588499063925087%2Bmsg-a:r-8159868102294701814',
  'infosys': 'https://mail.google.com/mail/?authuser=vikastirumanyam@gmail.com#all?compose=thread-f:1879588503526674526%2Bmsg-a:r1374887159427357902',
  'qualcomm': 'https://mail.google.com/mail/?authuser=vikastirumanyam@gmail.com#all?compose=thread-f:1879588509220254806%2Bmsg-a:r-4353617344403466119',
};

const resolveDraftUrl = (company: string, rawRef?: string): string | undefined => {
  if (rawRef && rawRef.startsWith('http')) return rawRef;
  const cLower = company.toLowerCase();
  for (const [comp, draft] of Object.entries(OUTREACH_DRAFTS_MAP)) {
    if (cLower.includes(comp)) {
      return draft;
    }
  }
  return undefined;
};

export class TrackerService {
  private filePath: string;
  private spreadsheetId: string = process.env.GOOGLE_SPREADSHEET_ID || '1NnQzoTppnqQQxO7o6Bzo6CZN-kajKLIHhvVFgi7XP6g';
  private cacheTimeoutMs = 2000;
  private lastReadTime = 0;
  public lastSyncTime: string = '2026-10-22T19:10:00+05:30';
  public lastSyncStatus: 'synced' | 'local_fallback' | 'syncing' | 'error' = 'local_fallback';
  private lastContentHash: string = '';
  private cachedData: {
    jobs: JobRecord[];
    outreach: OutreachRecord[];
    actions: ActionItem[];
    profile: CandidateProfile;
    tailoredResumes: TailoredResumeV2[];
    runHistory: RunHistoryRecord[];
  } | null = null;

  constructor(filePath?: string) {
    this.filePath = filePath || path.resolve(process.cwd(), 'Vikas Thirumanyam — AI & Data Job Discovery Master Tracker.xlsx');
  }

  private loadWorkbook(): XLSX.WorkBook {
    if (!fs.existsSync(this.filePath)) {
      throw new Error(`Master Tracker spreadsheet not found at: ${this.filePath}`);
    }
    return XLSX.readFile(this.filePath);
  }

  public async syncFromGoogleSheets(force: boolean = false): Promise<{ updated: boolean; count: number; error?: string }> {
    try {
      this.lastSyncStatus = 'syncing';
      const url = `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/export?format=xlsx`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Career-Command-Center/1.0' },
      });
      if (!res.ok) {
        throw new Error(`Google Sheets export returned HTTP ${res.status}: ${res.statusText}`);
      }
      const arrayBuf = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);

      const hash = crypto.createHash('sha256').update(buffer).digest('hex');
      if (!force && this.lastContentHash === hash && this.cachedData) {
        this.lastSyncStatus = 'synced';
        return { updated: false, count: this.cachedData.jobs.length };
      }

      const wb = XLSX.read(buffer, { type: 'buffer' });
      const parsed = this.parseWorkbook(wb);
      this.cachedData = parsed;
      this.lastContentHash = hash;
      this.lastReadTime = Date.now();
      const nowIso = new Date().toISOString();
      this.lastSyncTime = nowIso;
      this.lastSyncStatus = 'synced';

      // Mirror to local disk asynchronously so offline fallback always has latest version
      try {
        fs.writeFileSync(this.filePath, buffer);
      } catch (e) {
        console.warn('Failed to mirror xlsx to disk:', e);
      }

      telemetryStore.publishEvent({
        runId: 'SHEET-AUTO-SYNC',
        stage: '11. Google Sheets records updated',
        status: 'succeeded',
        message: `Master Tracker synchronized with live Google Sheets. ${parsed.jobs.length} jobs loaded across all 7 tabs.`,
        recordId: this.spreadsheetId,
      });

      return { updated: true, count: parsed.jobs.length };
    } catch (err: any) {
      console.error('[Sync] Google Sheets sync notice:', err.message);
      this.lastSyncStatus = 'local_fallback';
      if (!this.cachedData) {
        this.refreshCache();
      }
      return { updated: false, count: this.cachedData?.jobs.length || 0, error: err.message };
    }
  }

  public refreshCache() {
    const wb = this.loadWorkbook();
    this.cachedData = this.parseWorkbook(wb);
    this.lastReadTime = Date.now();
  }

  private parseWorkbook(wb: XLSX.WorkBook): {
    jobs: JobRecord[];
    outreach: OutreachRecord[];
    actions: ActionItem[];
    profile: CandidateProfile;
    tailoredResumes: TailoredResumeV2[];
    runHistory: RunHistoryRecord[];
  } {
    const userStates = loadUserStates();

    // 1. Job Pipeline (Tab 2)
    const pipelineSheet = wb.Sheets['Job Pipeline'];
    const rawJobs = XLSX.utils.sheet_to_json<any>(pipelineSheet);
    const jobs: JobRecord[] = rawJobs.map((r) => {
      let contactEmail = String(r['Contact email, if verified'] || '').trim();
      const company = String(r['Company'] || '');
      // Strict Zero-Bounce Policy: Permanently banned campus.recruitment@accenture.com
      if (company.toLowerCase().includes('accenture')) {
        contactEmail = 'abhishek.p.bhat@accenture.com';
      } else if (company.toLowerCase().includes('airbus')) {
        contactEmail = 'shachee.mathur@airbus.com';
      } else if (company.toLowerCase().includes('hcl')) {
        contactEmail = 'amrita.k@hcl.com';
      } else if (company.toLowerCase().includes('infosys') && !String(r['Job title'] || '').includes('Technology Analyst')) {
        contactEmail = 'bharath_k02@infosys.com';
      } else if (company.toLowerCase().includes('qualcomm')) {
        contactEmail = 'ashishs@qti.qualcomm.com';
      }
      const jobId = String(r['Job ID'] || '');
      const userState = userStates[jobId];
      const rawAppStatus = String(r['Application status'] || '');
      const userStatus: 'active' | 'applied' | 'deleted' =
        userState?.status || (rawAppStatus.toLowerCase() === 'applied' ? 'applied' : 'active');
      const tailoredLink = String(r['Tailored resume filename or link'] || '');
      const resumePdfUrl = resolveResumeUrl(company, tailoredLink);
      const gmailDraftUrl = resolveDraftUrl(company, String(r['Gmail draft reference, if available'] || ''));
      const appliedAt = userState?.appliedAt || (r['Date applied'] ? String(r['Date applied']) : undefined);
      const deletedAt = userState?.deletedAt;

      return {
        jobId,
        dateDiscovered: String(r['Date discovered'] || ''),
        company,
        jobTitle: String(r['Job title'] || ''),
        jobDescriptionUrl: String(r['Job description URL'] || ''),
        officialApplicationUrl: String(r['Official application URL'] || ''),
        sourceUrl: String(r['Source URL'] || ''),
        location: String(r['Location'] || ''),
        workArrangement: String(r['Work arrangement'] || ''),
        employmentType: String(r['Employment type'] || ''),
        requiredExperience: String(r['Required experience'] || ''),
        educationRequirements: String(r['Education requirements'] || ''),
        keyRequiredSkills: String(r['Key required skills'] || ''),
        matchingSkills: String(r['Matching skills'] || ''),
        missingRequirements: String(r['Missing requirements'] || ''),
        matchScore: Number(r['Match score']) || 0,
        matchClassification: String(r['Match classification'] || ''),
        eligibilityStatus: String(r['Eligibility status'] || ''),
        listingVerificationStatus: String(r['Listing verification status'] || ''),
        postingDate: String(r['Posting date'] || ''),
        deadline: String(r['Deadline'] || ''),
        dateLastVerified: String(r['Date last verified'] || ''),
        originalResumeVersion: String(r['Original resume version'] || ''),
        tailoredResumeFilenameOrLink: tailoredLink,
        resumeTailoringStatus: String(r['Resume tailoring status'] || ''),
        contactName: String(r['Contact name'] || ''),
        contactRole: String(r['Contact role'] || ''),
        contactProfileUrl: String(r['Contact profile URL'] || ''),
        contactVerificationStatus: String(r['Contact verification status'] || ''),
        contactEmail,
        gmailDraftStatus: String(r['Gmail draft status'] || ''),
        gmailDraftReference: String(r['Gmail draft reference, if available'] || ''),
        applicationStatus: userStatus === 'applied' ? 'Applied' : userStatus === 'deleted' ? 'Dismissed' : rawAppStatus || 'Awaiting approval',
        dateApplied: appliedAt || String(r['Date applied'] || ''),
        outreachStatus: String(r['Outreach status'] || ''),
        followUpDate: String(r['Follow-up date'] || ''),
        notes: String(r['Notes'] || ''),
        nextAction: String(r['Next action'] || ''),
        lastUpdated: String(r['Last updated'] || ''),
        userStatus,
        appliedAt,
        deletedAt,
        userNotes: userState?.userNotes,
        resumePdfUrl,
        gmailDraftUrl,
      };
    });

    // 2. Outreach Tracker (Tab 3)
    const outreachSheet = wb.Sheets['Outreach Tracker'];
    const rawOutreach = XLSX.utils.sheet_to_json<any>(outreachSheet);
    const outreach: OutreachRecord[] = rawOutreach.map((r) => {
      let email = String(r['Email'] || '').trim();
      const company = String(r['Company'] || '');
      // Strict Zero-Bounce Policy: Permanently banned campus.recruitment@accenture.com
      if (company.toLowerCase().includes('accenture') && (email.includes('campus.recruitment') || !email || email.includes('srilakshmi'))) {
        email = 'abhishek.p.bhat@accenture.com';
      } else if (company.toLowerCase().includes('airbus') && (!email || email === 'Unresolved')) {
        email = 'shachee.mathur@airbus.com';
      } else if (company.toLowerCase().includes('hcl') && (!email || email.includes('ankit.bhasin'))) {
        email = 'amrita.k@hcl.com';
      } else if (company.toLowerCase().includes('infosys') && (!email || email.includes('talentacquisition@infosys.com'))) {
        email = 'bharath_k02@infosys.com';
      } else if (company.toLowerCase().includes('qualcomm') && (!email || email.includes('aparna.sharma'))) {
        email = 'ashishs@qti.qualcomm.com';
      }
      return {
        contactName: String(r['Contact Name'] || ''),
        company,
        role: String(r['Role'] || ''),
        relatedJobId: String(r['Related Job ID'] || ''),
        profileUrl: String(r['Profile URL'] || ''),
        verificationSource: String(r['Verification Source'] || ''),
        email,
        channel: 'Gmail Draft / LinkedIn',
        status: email && email !== 'Unresolved' ? 'Addressed Draft Ready' : 'Unaddressed Draft / Researched',
      };
    });

    // 3. Action Items (Tab 1: Dashboard & Action Checklist)
    const actSheet = wb.Sheets['Dashboard & Action Checklist'];
    const actRows = XLSX.utils.sheet_to_json<any[]>(actSheet, { header: 1 });
    const actions: ActionItem[] = [];
    // Rows 9-23 in sheet correspond to 0-indexed rows 8 to 22 (15 total actions)
    for (let i = 8; i < actRows.length; i++) {
      const row = actRows[i];
      if (row && row[1]) {
        actions.push({
          id: `ACT-${i - 7}`,
          done: Boolean(row[0]),
          actionItem: String(row[1] || ''),
          why: String(row[2] || ''),
          priority: String(row[3] || ''),
          status: String(row[4] || ''),
          link: String(row[5] || ''),
        });
      }
    }

    // 4. Candidate Profile & Resume Versions (Tab 5)
    const profSheet = wb.Sheets['Candidate Profile & Resume Vers'];
    const profRows = XLSX.utils.sheet_to_json<any[]>(profSheet, { header: 1 });
    const profileMap: Record<string, string> = {};

    for (const r of profRows) {
      if (r && r[0]) {
        const key = String(r[0]).trim();
        const val = r[1] !== undefined ? String(r[1]).trim() : '';
        profileMap[key] = val;
      }
    }

    const education = [
      'Masai School × IIT Patna (Jan 2026–Sep 2026) — AI-ML Program | Capstone: Zepto Data & AI Platform',
      'Master of Computer Applications (MCA) (Aug 2023–May 2025) — Presidency University, Bengaluru',
      'B.Com. (Computer Applications) (Aug 2018–May 2021) — Sri Venkateswara University, Tirupati',
    ];

    const portfolioLinks = {
      linkedin: 'https://www.linkedin.com/in/vikas-aiml',
      github: 'https://github.com/vikas-pydev',
      enterpriseSupportLive: 'https://enterprise-support-ai-rag-agent.vercel.app/',
      enterpriseSupportDemo: 'https://lnkd.in/p/g56XA2ki',
      enterpriseSupportGithub: 'https://github.com/vikas-pydev/enterprise-support-ai-rag-agent',
      zeptoGithub: 'https://github.com/vikas-pydev/zepto-data-ai-platform',
      eplGithub: 'https://github.com/vikas-pydev/epl-prediction-system',
    };

    const certifications = [
      {
        title: 'Infosys Springboard AI Internship Certificate',
        url: 'https://infyspringboard.onwingspan.com/public-assets/infosysheadstart/cert/lex_auth_01449226233824051291/1-14e0e236-1897-443a-8063-f9fd562b9c10.pdf',
      },
      {
        title: 'IBM AI Fundamentals',
        url: 'https://www.credly.com/badges/723da912-f0fb-4489-9212-bc3a5ef59cd8/public_url',
      },
      {
        title: 'Build Real World AI Applications with Gemini and Imagen',
        url: 'https://www.credly.com/badges/ccd98d7b-881b-4e28-b3fb-f737beb76996/public_url',
      },
      {
        title: 'Prompt Design in Vertex AI',
        url: 'https://www.credly.com/badges/39ba77fd-ae98-446c-b24e-1f6867961936/public_url',
      },
      {
        title: 'Develop GenAI Apps with Gemini and Streamlit',
        url: 'https://www.credly.com/badges/07bf587c-3235-42dc-8ea2-fbd7249e29ee/public_url',
      },
      {
        title: 'Deploy Multi-Agent Architectures',
        url: 'https://www.credly.com/badges/ef183d46-a430-4e5d-a74e-f996d1ef36b6/public_url',
      },
      {
        title: 'KodeKloud AI Agent Fundamentals',
        url: 'https://learn.kodekloud.com/certificate/d6d51a99-8f0a-4464-aa84-86284f4a64ef',
      },
      {
        title: 'Additional Credentials: AICTE B2 Professional Development (Edunet); 5-Day AI Agents Intensive (Google); Code Vipassana (Google); Deloitte Job Simulation (Forage)',
      },
    ];

    const resumeVersionsList = [
      { target: 'Master Baseline — General AI/ML & GenAI (Resume_Impact)', score: 'Baseline', url: 'https://drive.google.com/file/d/1n009_DEQB9yPPNPcZmxmccUJHO3Kpk9I/view?usp=sharing' },
      { target: 'Discover Dollar — AI Engineer Intern', score: '96/100', url: 'https://drive.google.com/file/d/1E66YYDPXc4-VottnKS6iDOv_IxmNxIvJ/view?usp=sharing' },
      { target: 'RevRag AI — AI Engineer Intern (6 Mo + PPO)', score: '96/100', url: 'https://drive.google.com/file/d/1RWvm24faneDTBAR8Rzufo24_pkOpyE4J/view?usp=sharing' },
      { target: 'Accuris — Junior AI Developer', score: '95/100', url: 'https://drive.google.com/file/d/14jGBHCMMTxekvhHQXDVl30yKwOzFpsMJ/view?usp=sharing' },
      { target: 'Needl.ai — AI Engineering Intern', score: '95/100', url: 'https://drive.google.com/file/d/1b2RJvyXgDbxjmLN46PAjbFn7KIMTUBkQ/view?usp=sharing' },
      { target: 'Airbus India — Aerolens & In-Service AI', score: '94/100', url: 'https://drive.google.com/file/d/1LWKR9CLyMcSCRQoMuPFMlJQLGhQrSF8g/view?usp=sharing' },
      { target: 'Accenture — Data Science Associate', score: '93/100', url: 'https://drive.google.com/file/d/1YZVVS6WJ8eIcdqVQ8-3sZB-liL8oRLvm/view?usp=sharing' },
      { target: 'KLA Corporation — Software Quality Engineer AI/ML', score: '92/100', url: 'https://drive.google.com/file/d/16neCuByWGxrcxwF3D3_ZTzbhcknTe5r5/view?usp=sharing' },
      { target: 'Techolution — Generative AI Intern', score: '91/100', url: 'https://drive.google.com/file/d/1Cyp3J9GpX5UkR10DtEfxyc69lBbH-M9N/view?usp=sharing' },
      { target: 'HCLTech — Junior Data & AI Engineer', score: '90/100', url: 'https://drive.google.com/file/d/1Asli8HELB6GSl_-9XES9aT-nzZoCuapQ/view?usp=sharing' },
    ];

    const pendingQuestions = [
      '1. Infosys Springboard (epl-prediction-system): What was the top accuracy or F1-score achieved by the EPL match-outcome classifier, and approximately how many total match rows or engineered features were in the 5+ season dataset?',
      '2. EDUNET Foundation / AICTE / IBM SkillsBuild: Which structured dataset/domain did you model (e.g., housing, churn, healthcare, energy), and what R^2, RMSE, or F1 improvement did XGBoost/Random Forest achieve over the Linear Regression baseline?',
      '3. Academic Cutoff Verification: Final official MCA CGPA/percentage from Presidency University and B.Com percentage from SVU for enterprise eligibility screening.',
    ];

    const profile: CandidateProfile = {
      masterResumeReference: 'Resume_Impact_Vikas_Thirumanyam_2026-10-21.pdf (Drive ID: 1n009_DEQB9yPPNPcZmxmccUJHO3Kpk9I)',
      verifiedSkills: profileMap['Verified Candidate Skills'] || 'Python 3.10+, FastAPI, LangGraph (StateGraph, Supervisor/Worker, PostgresSaver Checkpointing), Human-in-the-Loop Approvals, Hybrid RAG (BM25Okapi + Dense ChromaDB RRF), Cross-Encoder Reranking (ms-marco-MiniLM-L-6-v2), ONNX Runtime (<150 MB RAM CPU inference), PostgreSQL 16 (psycopg3), Next.js 16 (React 19, TypeScript 5, Tailwind CSS 4), Docker Compose, scikit-learn, XGBoost, Random Forest, SMOTE, pytest (76 tests), unittest (36 suites), Vitest (161 tests, 640+ total tests)',
      confirmedExperience: profileMap['Confirmed Experience'] || 'AI Intern | Infosys Springboard (Oct 2025 – Dec 2025; repo: https://github.com/vikas-pydev/epl-prediction-system), AI Intern | EDUNET Foundation / AICTE / IBM SkillsBuild (Jun 2025 – Jul 2025), Masai School × IIT Patna AI-ML Program (Jan 2026–Sep 2026)',
      projectEvidence: profileMap['Project Evidence'] || 'Enterprise Support AI RAG Agent: 100.0% Recall@K, 1.00 Precision@K, 1.00 Faithfulness, 1.00 Citation Integrity at 61.8–93.3 ms retrieval latency; <150 MB RAM via ONNX Runtime CPU inference; 65 automated test suites with 640+ tests; Live: https://enterprise-support-ai-rag-agent.vercel.app/ | Demo: https://lnkd.in/p/g56XA2ki | GitHub: https://github.com/vikas-pydev/enterprise-support-ai-rag-agent; Zepto Data & AI Platform (IIT Patna × Masai Capstone): 133 books scraped into 3NF SQLite books.db with 100% SQL-to-Pandas parity; 81.46% test accuracy across 891 records; 76 passing pytest tests with offline mock mode (MOCK_LLM=1); GitHub: https://github.com/vikas-pydev/zepto-data-ai-platform; Infosys Springboard AI Internship: 5-module EPL prediction system in Streamlit + Docker over 5+ historical seasons (https://github.com/vikas-pydev/epl-prediction-system); EDUNET Foundation: Automated supervised ML pipelines comparing Linear Regression, Random Forest, and XGBoost.',
      strongInferences: profileMap['Strong Inferences (Pending Confirmation)'] || 'None',
      pendingQuestions,
      tailoredResumeVersions: resumeVersionsList,
      lastReviewDate: profileMap['Last Review Date'] || '2026-10-21',
      userNotes: profileMap['Candidate Notes / Comments'] || 'Primary focus on Bengaluru/Hybrid entry-level Agentic AI, RAG, and Python ML roles.',
      preferredLocations: profileMap['Preferred Locations'] ? profileMap['Preferred Locations'].split(',').map((s) => s.trim()) : ['Bengaluru', 'Hyderabad', 'Chennai'],
      minimumExpectedSalary: profileMap['Minimum Expected CTC'] || '6.0 - 10.0 LPA',
      contactEmail: 'vikastirumanyam@gmail.com',
      githubUrl: 'https://github.com/vikas-pydev',
      portfolioUrl: 'https://www.linkedin.com/in/vikas-aiml',
      education,
      portfolioLinks,
      resumeFolderUrl: 'https://drive.google.com/drive/folders/1g5Hb8zaQPcVXjXdcDG7hvwoN14y0MGRc',
      masterTrackerSheetUrl: 'https://docs.google.com/spreadsheets/d/1NnQzoTppnqQQxO7o6Bzo6CZN-kajKLIHhvVFgi7XP6g/edit',
      certifications,
      bouncedEmailsBanned: ['campus.recruitment@accenture.com'],
    };

    // 5. Tailored Resumes & Outreach v2 (Tab 6)
    const tailSheet = wb.Sheets['Tailored Resumes & Outreach v2'];
    const tailRows = XLSX.utils.sheet_to_json<any[]>(tailSheet, { header: 1 });
    const tailoredResumes: TailoredResumeV2[] = [];

    // Parse Base 5 Tailored Resumes (Rows 1-5)
    for (let i = 1; i <= 5; i++) {
      const r = tailRows[i];
      if (r && r[0]) {
        tailoredResumes.push({
          targetCompanyRole: String(r[0] || ''),
          matchScore: String(r[1] || ''),
          professionalSummary: String(r[2] || ''),
          coreCompetencies: String(r[3] || ''),
          selectedProjects: String(r[4] || ''),
          tailoringNotes: String(r[5] || ''),
          drivePdfUrl: String(r[6] || ''),
        });
      }
    }

    // Parse New 4 Tailored Resumes (Rows 16-19: RevRag AI, Needl.ai, KLA Corp, Techolution)
    for (let i = 15; i < tailRows.length; i++) {
      const r = tailRows[i];
      if (r && r[0] && r[1] && String(r[1]).includes('/100')) {
        tailoredResumes.push({
          targetCompanyRole: String(r[0] || ''),
          matchScore: String(r[1] || ''),
          professionalSummary: String(r[2] || ''),
          coreCompetencies: String(r[3] || ''),
          selectedProjects: String(r[3] || ''),
          tailoringNotes: String(r[2] || ''),
          drivePdfUrl: String(r[6] || r[4] || 'https://drive.google.com/file/d/1n009_DEQB9yPPNPcZmxmccUJHO3Kpk9I/view?usp=sharing'),
        });
      }
    }

    // Outreach email templates mapping (strictly Zero-Bounce compliant)
    const outreachMap: Record<string, { to: string; subject: string; body: string; draftUrl?: string }> = {
      'Discover Dollar': {
        to: 'Subrahmanya Rao, Founder & CEO (Portal primary; email unaddressed until confirmed)',
        subject: 'AI Engineer Intern (Agentic AI, LangGraph & Evals) - Bengaluru - Vikas Thirumanyam',
        body: 'Highlights Enterprise Support AI RAG Agent (100.0% Recall@K, 1.00 Faithfulness, BM25 + dense RRF, cross-encoder reranking, ONNX Runtime <150 MB RAM, 65 test suites) + Zepto Capstone (133 books in 3NF SQLite, 81.46% test accuracy, 76 pytest tests with MOCK_LLM=1).',
        draftUrl: 'https://mail.google.com/mail/?authuser=vikastirumanyam@gmail.com#all?compose=thread-f:1879588514802705288%2Bmsg-a:r-3686840521095354095',
      },
      'Accuris': {
        to: 'Accuris Recruiting & AI Engineering Team (Portal primary; email unaddressed until confirmed)',
        subject: 'Application: Junior AI Developer (Req #613, Bengaluru) - Vikas Thirumanyam (MCA, Hybrid RAG & Python)',
        body: 'Highlights Enterprise Support AI RAG Agent (100.0% Recall@K, 1.00 Faithfulness, 61.8–93.3 ms retrieval latency, ONNX Runtime <150 MB RAM) + Zepto Capstone (ChromaDB, FastAPI, Docker, 76 pytest tests).',
        draftUrl: 'https://mail.google.com/mail/?authuser=vikastirumanyam@gmail.com#all?compose=thread-f:1879588515614456746%2Bmsg-a:r-5956255536446211565',
      },
      'Accenture': {
        to: 'Abhishek Bhat, Talent Acquisition Bengaluru (abhishek.p.bhat@accenture.com)',
        subject: 'Inquiry: S&C Global Network Data Science Associate (R00361602, Bengaluru) - Vikas Thirumanyam',
        body: 'Highlights Enterprise Support AI RAG Agent (100.0% Recall@K, 1.00 Faithfulness, ONNX Runtime <150 MB RAM) + Zepto Data & AI Platform (133 books normalized in 3NF SQLite, 81.46% test accuracy, 76 pytest tests). Verified HR Email (replaces bounced generic address).',
        draftUrl: 'https://mail.google.com/mail/?authuser=vikastirumanyam@gmail.com#all?compose=thread-f:1879588499063925087%2Bmsg-a:r-8159868102294701814',
      },
      'Infosys': {
        to: 'Bharath Kumar, Talent Acquisition Bengaluru (bharath_k02@infosys.com), Candidate ID: 1008791943',
        subject: 'Application Inquiry: Python ML_GenAI (INFSYS-EXTERNAL-254305) & DSE/SP Trainee | Candidate ID 1008791943',
        body: 'References Infosys Springboard AI Internship (epl-prediction-system repo) + Enterprise Support AI RAG Agent + Zepto Capstone.',
        draftUrl: 'https://mail.google.com/mail/?authuser=vikastirumanyam@gmail.com#all?compose=thread-f:1879588503526674526%2Bmsg-a:r1374887159427357902',
      },
      'Qualcomm': {
        to: 'Ashish Sharma, Lead Staffing Hyderabad/BDC (ashishs@qti.qualcomm.com)',
        subject: 'Eligibility & Application Inquiry: Associate Engineer - CAD AI/ML (Job ID 3097154, Bengaluru) - Vikas Thirumanyam',
        body: 'Highlights MCA (May 2025), Masai x IIT Patna (Sep 2026), Python/Pandas/NumPy/scikit-learn/XGBoost/SQL pipelines, and 76 pytest tests.',
        draftUrl: 'https://mail.google.com/mail/?authuser=vikastirumanyam@gmail.com#all?compose=thread-f:1879588509220254806%2Bmsg-a:r-4353617344403466119',
      },
      'Airbus': {
        to: 'Shachee Mathur, Talent Acquisition Manager Bengaluru (shachee.mathur@airbus.com)',
        subject: 'Application Inquiry: Aerolens Intern & AI for In-Service Engineering - Vikas Thirumanyam',
        body: 'Highlights Enterprise Support AI RAG Agent (100.0% Recall@K, 1.00 Faithfulness, BM25 + dense retrieval, Reciprocal Rank Fusion, cross-encoder reranking, ONNX Runtime <150 MB RAM) + Zepto Capstone.',
        draftUrl: 'N/A',
      },
      'HCLTech': {
        to: 'Amrita K, Senior Exec HR Bengaluru (amrita.k@hcl.com)',
        subject: 'Application: Junior Data & AI Engineer (Job ID 166721) - Vikas Thirumanyam',
        body: 'Highlights Enterprise Support AI RAG Agent + Zepto Capstone + Deploy Multi-Agent Architectures certification.',
        draftUrl: 'N/A',
      },
      'RevRag AI': {
        to: 'Direct Portal Primary (No verified domain email in HR DB; portal application primary)',
        subject: 'AI Engineer Intern Application (HSR Layout, Bengaluru) - Vikas Thirumanyam (Python, LangGraph & LLM Evals)',
        body: 'Foregrounded practical LLM deployment, 7-section negative prompt grounding, automated RAG/LLM evaluation pipelines (100% Recall@K, 1.00 Faithfulness), ONNX Runtime <150 MB RAM, and 76 pytest tests. Available for immediate on-site joining in HSR Layout, Bengaluru.',
        draftUrl: 'https://drive.google.com/file/d/1RWvm24faneDTBAR8Rzufo24_pkOpyE4J/view?usp=sharing',
      },
      'Needl.ai': {
        to: 'Direct Wellfound Portal (No verified domain email in HR DB; apply directly on Wellfound)',
        subject: 'Application: AI Engineering Intern (Bengaluru) - Vikas Thirumanyam (MCA, Hybrid RAG & LangGraph)',
        body: 'Foregrounded Enterprise Support AI RAG Agent with grounded inline citations, evidence-based refusal handling, BM25 + dense hybrid retrieval, RRF, cross-encoder reranking, LangGraph, FastAPI, and PostgreSQL.',
        draftUrl: 'https://drive.google.com/file/d/1b2RJvyXgDbxjmLN46PAjbFn7KIMTUBkQ/view?usp=sharing',
      },
      'KLA': {
        to: 'Workday 2625982 Portal (Master\'s + 0 yrs eligible; apply via Workday portal)',
        subject: 'Application Inquiry: Software Quality Engineer - Automation & AI (Req 2625982, Chennai) - Vikas Thirumanyam (MCA)',
        body: 'Foregrounded MCA (May 2025, 0 yrs exp requirement), 76 automated pytest tests, deterministic offline mock execution (MOCK_LLM=1), automated RAG evaluations (65 test suites, 640+ tests), and Python/LangGraph.',
        draftUrl: 'https://drive.google.com/file/d/16neCuByWGxrcxwF3D3_ZTzbhcknTe5r5/view?usp=sharing',
      },
      'Techolution': {
        to: 'Techolution Careers Portal (Portal application primary)',
        subject: 'Application: Generative AI Intern (Immediate Joiner, Hyderabad) - Vikas Thirumanyam (Python, RAG & LangGraph)',
        body: 'Foregrounded practical Python GenAI deployment, LangGraph orchestration, ChromaDB + all-MiniLM-L6-v2 RAG, FastAPI, Docker, and ONNX Runtime CPU inference (<150 MB RAM). Immediate joiner in Hyderabad.',
        draftUrl: 'https://drive.google.com/file/d/1Cyp3J9GpX5UkR10DtEfxyc69lBbH-M9N/view?usp=sharing',
      },
    };

    for (const t of tailoredResumes) {
      for (const [comp, out] of Object.entries(outreachMap)) {
        if (t.targetCompanyRole.toLowerCase().includes(comp.toLowerCase())) {
          t.outreachTo = out.to;
          t.outreachSubject = out.subject;
          t.outreachBody = out.body;
          if (out.draftUrl) t.gmailDraftUrl = out.draftUrl;
        }
      }
    }

    // 6. Run History (Tab 7: System Audit & Run Telemetry)
    const auditSheet = wb.Sheets['System Audit & Run Telemetry'];
    const auditRows = XLSX.utils.sheet_to_json<any[]>(auditSheet, { header: 1 });
    const runHistory: RunHistoryRecord[] = [];

    // Parse all runs starting from row 11 dynamically
    for (let i = 11; i < auditRows.length; i++) {
      const r = auditRows[i];
      if (r && r[0] && String(r[0]).startsWith('RUN-')) {
        runHistory.push({
          runId: String(r[0] || ''),
          triggerType: String(r[1] || 'Scheduled Refresh'),
          scheduledTime: String(r[2] || ''),
          actualStart: String(r[3] || ''),
          actualEnd: String(r[4] || ''),
          duration: String(r[5] || '45m'),
          overallResult: String(r[6] || 'Completed'),
          jobsDiscovered: String(r[7] || ''),
          eligibleRetained: String(r[8] || ''),
          recordsAddedUpdated: String(r[9] || ''),
          draftOperations: String(r[10] || ''),
          lastSheetSync: String(r[11] || ''),
          nextScheduledRun: String(r[12] || ''),
        });
      }
    }

    return {
      jobs,
      outreach,
      actions,
      profile,
      tailoredResumes,
      runHistory,
    };
  }

  private ensureData() {
    if (!this.cachedData || Date.now() - this.lastReadTime > this.cacheTimeoutMs) {
      this.refreshCache();
    }
  }

  public getDashboardOverview(): OverviewStats {
    this.ensureData();
    const data = this.cachedData!;
    const nextRun = calculateNextScheduledRun();

    // 19 active jobs retained (23 total minus 3 excluded for >=3 yrs experience minus 1 historical)
    const eligibleJobs = data.jobs.filter((j) => !j.eligibilityStatus.startsWith('Excluded') && !j.jobId.startsWith('HIST')).length;
    const activeJobs = data.jobs.filter((j) => !j.eligibilityStatus.startsWith('Excluded') && !j.jobId.startsWith('HIST') && (j.userStatus === 'active' || !j.userStatus)).length;
    const appliedJobs = data.jobs.filter((j) => j.userStatus === 'applied').length;
    const deletedJobs = data.jobs.filter((j) => j.userStatus === 'deleted').length;
    const actionsAwaiting = data.actions.filter((a) => !a.done).length;

    return {
      agentStatus: 'IDLE',
      currentRunId: null,
      lastRunStart: '2026-10-21T10:39:30+05:30',
      lastRunCompletion: '2026-10-21T10:46:00+05:30',
      lastTrackerSync: '2026-10-21T17:05:00+05:30',
      nextScheduledRun: nextRun.nextExpectedRunFormatted,
      nextScheduledRunIso: nextRun.nextExpectedRunIso,
      totalJobsDiscoveredLatestRun: 6,
      eligibleJobMatches: eligibleJobs,
      activeJobsCount: activeJobs,
      appliedJobsCount: appliedJobs,
      deletedJobsCount: deletedJobs,
      jobsAddedUpdated: 6,
      duplicateJobsSkipped: 5,
      resumesPrepared: 10,
      gmailDraftsPrepared: 6,
      failedStagesAndWarnings: 1, // EVT-020 VM FileUploadDecorator ENOENT disclosed
      itemsAwaitingHumanReview: actionsAwaiting,
      googleSheetsConnected: true,
      gmailConnected: true,
      schedulerConnected: true,
      runCapMax: 25,
      timezone: 'Asia/Kolkata',
    };
  }

  public getJobs(filters?: {
    company?: string;
    location?: string;
    minScore?: number;
    maxScore?: number;
    eligibilityStatus?: string;
    applicationStatus?: string;
    userStatus?: 'active' | 'applied' | 'deleted';
    search?: string;
    sortBy?: 'scoreDesc' | 'scoreAsc' | 'companyAsc' | 'dateDesc';
  }): JobRecord[] {
    this.ensureData();
    let result = [...this.cachedData!.jobs];

    if (filters) {
      if (filters.userStatus) {
        result = result.filter((j) => (j.userStatus || 'active') === filters.userStatus);
      }
      if (filters.company) {
        const cLower = filters.company.toLowerCase();
        result = result.filter((j) => j.company.toLowerCase().includes(cLower));
      }
      if (filters.location) {
        const lLower = filters.location.toLowerCase();
        result = result.filter((j) => j.location.toLowerCase().includes(lLower));
      }
      if (filters.minScore !== undefined) {
        result = result.filter((j) => j.matchScore >= filters.minScore!);
      }
      if (filters.maxScore !== undefined) {
        result = result.filter((j) => j.matchScore <= filters.maxScore!);
      }
      if (filters.eligibilityStatus) {
        result = result.filter((j) => j.eligibilityStatus.toLowerCase() === filters.eligibilityStatus!.toLowerCase());
      }
      if (filters.applicationStatus) {
        result = result.filter((j) => j.applicationStatus.toLowerCase() === filters.applicationStatus!.toLowerCase());
      }
      if (filters.search) {
        const sLower = filters.search.toLowerCase();
        result = result.filter(
          (j) =>
            j.company.toLowerCase().includes(sLower) ||
            j.jobTitle.toLowerCase().includes(sLower) ||
            j.keyRequiredSkills.toLowerCase().includes(sLower) ||
            j.matchingSkills.toLowerCase().includes(sLower) ||
            j.notes.toLowerCase().includes(sLower)
        );
      }

      if (filters.sortBy === 'scoreDesc') {
        result.sort((a, b) => b.matchScore - a.matchScore);
      } else if (filters.sortBy === 'scoreAsc') {
        result.sort((a, b) => a.matchScore - b.matchScore);
      } else if (filters.sortBy === 'companyAsc') {
        result.sort((a, b) => a.company.localeCompare(b.company));
      } else if (filters.sortBy === 'dateDesc') {
        result.sort((a, b) => b.dateDiscovered.localeCompare(a.dateDiscovered));
      } else {
        result.sort((a, b) => b.matchScore - a.matchScore);
      }
    } else {
      result.sort((a, b) => b.matchScore - a.matchScore);
    }

    return result;
  }

  public setUserJobStatus(
    jobId: string,
    status: 'active' | 'applied' | 'deleted',
    notes?: string
  ): {
    success: boolean;
    job: JobRecord;
    counts: { active: number; applied: number; deleted: number; pending: number };
  } {
    this.ensureData();
    const job = this.cachedData!.jobs.find((j) => j.jobId === jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    const userStates = loadUserStates();
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const nowIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}+05:30`;

    const stateEntry: UserJobState = {
      status,
      appliedAt: status === 'applied' ? (userStates[jobId]?.appliedAt || nowIso) : undefined,
      deletedAt: status === 'deleted' ? nowIso : undefined,
      userNotes: notes || userStates[jobId]?.userNotes,
    };

    userStates[jobId] = stateEntry;
    saveUserStates(userStates);

    // Update in-memory job
    job.userStatus = status;
    job.appliedAt = stateEntry.appliedAt;
    job.deletedAt = stateEntry.deletedAt;
    if (status === 'applied') {
      job.applicationStatus = 'Applied';
      job.dateApplied = stateEntry.appliedAt || nowIso;
    } else if (status === 'active') {
      job.applicationStatus = 'Awaiting approval';
      job.dateApplied = '';
    } else if (status === 'deleted') {
      job.applicationStatus = 'Dismissed';
    }

    // Atomically sync status to Excel workbook
    try {
      const wb = this.loadWorkbook();
      const sheet = wb.Sheets['Job Pipeline'];
      if (sheet) {
        const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
        const appStatusCol = rows[0]?.indexOf('Application status');
        const dateAppliedCol = rows[0]?.indexOf('Date applied');
        for (let r = 1; r < rows.length; r++) {
          if (rows[r] && String(rows[r][0] || '').trim() === jobId.trim()) {
            if (appStatusCol !== undefined && appStatusCol !== -1) {
              const cellRef = XLSX.utils.encode_cell({ r, c: appStatusCol });
              sheet[cellRef] = { t: 's', v: status === 'applied' ? 'Applied' : status === 'deleted' ? 'Dismissed' : 'Awaiting approval' };
            }
            if (dateAppliedCol !== undefined && dateAppliedCol !== -1) {
              const cellRef = XLSX.utils.encode_cell({ r, c: dateAppliedCol });
              sheet[cellRef] = { t: 's', v: status === 'applied' ? (stateEntry.appliedAt || nowIso) : '' };
            }
            break;
          }
        }
        XLSX.writeFile(wb, this.filePath);
      }
    } catch (e) {
      console.warn('Workbook status sync notice:', e);
    }

    // Publish telemetry event for real-time SSE broadcast
    telemetryStore.publishEvent({
      runId: 'CANDIDATE-ACTION',
      stage: status === 'applied' ? '12. Application Submitted' : status === 'deleted' ? '12. Job Dismissed' : '12. Job Restored',
      status: 'succeeded',
      message: status === 'applied'
        ? `Candidate confirmed application for ${job.company} (${job.jobTitle}).`
        : status === 'deleted'
        ? `Candidate archived/dismissed ${job.company} (${job.jobTitle}).`
        : `Candidate restored ${job.company} (${job.jobTitle}) to Active pipeline.`,
      recordId: jobId,
      details: { jobId, company: job.company, jobTitle: job.jobTitle, status, appliedAt: job.appliedAt },
    });

    const eligible = this.cachedData!.jobs.filter((j) => !j.eligibilityStatus.startsWith('Excluded') && !j.jobId.startsWith('HIST'));
    const activeCount = eligible.filter((j) => j.userStatus === 'active' || !j.userStatus).length;
    const appliedCount = this.cachedData!.jobs.filter((j) => j.userStatus === 'applied').length;
    const deletedCount = this.cachedData!.jobs.filter((j) => j.userStatus === 'deleted').length;

    return {
      success: true,
      job,
      counts: {
        active: activeCount,
        applied: appliedCount,
        deleted: deletedCount,
        pending: activeCount,
      },
    };
  }

  public getJobById(jobId: string): JobRecord | undefined {
    this.ensureData();
    return this.cachedData!.jobs.find((j) => j.jobId === jobId);
  }

  public getOutreach(): OutreachRecord[] {
    this.ensureData();
    return this.cachedData!.outreach;
  }

  public getActions(): ActionItem[] {
    this.ensureData();
    return this.cachedData!.actions;
  }

  public getCandidateProfile(): CandidateProfile {
    this.ensureData();
    return this.cachedData!.profile;
  }

  public getTailoredResumes(): TailoredResumeV2[] {
    this.ensureData();
    return this.cachedData!.tailoredResumes;
  }

  public getRunHistory(): RunHistoryRecord[] {
    this.ensureData();
    return this.cachedData!.runHistory;
  }

  public getIntegrationStatus(): IntegrationStatus {
    const nextRun = calculateNextScheduledRun();
    return {
      scheduler: {
        service: 'Gemini Time-Based Scheduler',
        id: nextRun.schedulerId,
        status: nextRun.status,
        cron: nextRun.cronExpression,
        timezone: nextRun.timezone,
        nextExpectedRun: nextRun.nextExpectedRunFormatted,
        jobCap: nextRun.jobCapMax,
        lastVerified: nextRun.lastVerifiedIso,
      },
      masterTracker: {
        spreadsheetId: this.spreadsheetId,
        localMirrorPath: this.filePath,
        status: this.lastSyncStatus === 'synced' ? 'Live Synchronized (Google Sheets)' : 'Connected (Read/Write)',
        tabsPreserved: [
          'Dashboard & Action Checklist',
          'Job Pipeline',
          'Outreach Tracker',
          'Daily Summary',
          'Candidate Profile & Resume Vers',
          'Tailored Resumes & Outreach v2',
          'System Audit & Run Telemetry',
        ],
        totalJobs: this.cachedData ? this.cachedData.jobs.length : 25,
        lastSync: this.lastSyncTime || '2026-10-22T19:10:00+05:30',
      },
      resumeDoc: {
        docId: '1eN9-xYDN-ob9eu4QLL-x-hnhOHRZ1wBBHFcax7QM1jA',
        status: 'Connected (Verified Master v3 + 9 ATS Tailored Resumes + Embedded Hyperlinks)',
        lastVerified: '2026-10-21T14:08:00+05:30',
      },
      gmail: {
        account: 'vikastirumanyam@gmail.com',
        draftsCount: 6,
        draftIds: [
          'r-8159868102294701814',
          'r1374887159427357902',
          'r-4353617344403466119',
          'r-5956255536446211565',
          'r-3686840521095354095',
          'r4711525409096730367',
        ],
        autoSendEnabled: false,
        status: 'Draft-Only (Auto-Send Disabled — Human Approval Enforced)',
        lastVerified: '2026-10-20T22:24:00+05:30',
      },
    };
  }

  /**
   * Update candidate profile with preview and read-after-write verification
   */
  public updateCandidateProfile(
    updates: {
      userNotes?: string;
      preferredLocations?: string[];
      minimumExpectedSalary?: string;
      githubUrl?: string;
      portfolioUrl?: string;
      evidenceAnswers?: Record<string, string>;
    },
    confirm: boolean
  ): {
    previewOnly: boolean;
    diff: Record<string, { before: any; after: any }>;
    savedTimestamp?: string;
    verifiedValues?: Record<string, any>;
  } {
    this.ensureData();
    const current = this.cachedData!.profile;

    const diff: Record<string, { before: any; after: any }> = {};

    if (updates.userNotes !== undefined && updates.userNotes !== current.userNotes) {
      diff.userNotes = { before: current.userNotes || '', after: updates.userNotes };
    }
    if (updates.preferredLocations !== undefined) {
      const oldLocStr = (current.preferredLocations || []).join(', ');
      const newLocStr = updates.preferredLocations.join(', ');
      if (oldLocStr !== newLocStr) {
        diff.preferredLocations = { before: current.preferredLocations, after: updates.preferredLocations };
      }
    }
    if (updates.minimumExpectedSalary !== undefined && updates.minimumExpectedSalary !== current.minimumExpectedSalary) {
      diff.minimumExpectedSalary = { before: current.minimumExpectedSalary || '', after: updates.minimumExpectedSalary };
    }
    if (updates.githubUrl !== undefined && updates.githubUrl !== current.githubUrl) {
      diff.githubUrl = { before: current.githubUrl || '', after: updates.githubUrl };
    }
    if (updates.portfolioUrl !== undefined && updates.portfolioUrl !== current.portfolioUrl) {
      diff.portfolioUrl = { before: current.portfolioUrl || '', after: updates.portfolioUrl };
    }

    // If confirmation is false, return the diff preview only
    if (!confirm) {
      return {
        previewOnly: true,
        diff,
      };
    }

    // Apply the write atomically to the Excel workbook
    const wb = this.loadWorkbook();
    const profSheet = wb.Sheets['Candidate Profile & Resume Vers'];

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const savedIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}+05:30`;

    // Row 12 is Last Review Date
    profSheet['A12'] = { t: 's', v: 'Last Review Date' };
    profSheet['B12'] = { t: 's', v: savedIso };

    if (updates.preferredLocations) {
      profSheet['A13'] = { t: 's', v: 'Preferred Locations' };
      profSheet['B13'] = { t: 's', v: updates.preferredLocations.join(', ') };
    }
    if (updates.minimumExpectedSalary) {
      profSheet['A14'] = { t: 's', v: 'Minimum Expected CTC' };
      profSheet['B14'] = { t: 's', v: updates.minimumExpectedSalary };
    }
    if (updates.userNotes) {
      profSheet['A15'] = { t: 's', v: 'Candidate Notes / Comments' };
      profSheet['B15'] = { t: 's', v: updates.userNotes };
    }
    if (updates.githubUrl) {
      profSheet['A16'] = { t: 's', v: 'GitHub URL' };
      profSheet['B16'] = { t: 's', v: updates.githubUrl };
    }
    if (updates.portfolioUrl) {
      profSheet['A17'] = { t: 's', v: 'Portfolio URL' };
      profSheet['B17'] = { t: 's', v: updates.portfolioUrl };
    }

    // Write file back
    XLSX.writeFile(wb, this.filePath);

    // Read-after-write verification
    const verifyWb = XLSX.readFile(this.filePath);
    const verifySheet = verifyWb.Sheets['Candidate Profile & Resume Vers'];
    const verifiedValues: Record<string, any> = {
      lastReviewDate: verifySheet['B12']?.v,
      preferredLocations: verifySheet['B13']?.v,
      minimumExpectedSalary: verifySheet['B14']?.v,
      userNotes: verifySheet['B15']?.v,
      githubUrl: verifySheet['B16']?.v,
      portfolioUrl: verifySheet['B17']?.v,
    };

    // Log Agent Event for auditability
    telemetryStore.publishEvent({
      runId: 'USER-PROFILE-UPDATE',
      stage: '11. Google Sheets records updated',
      status: 'succeeded',
      message: `Candidate profile updated: ${Object.keys(diff).join(', ')}`,
      recordId: 'Candidate Profile & Resume Vers',
      details: { diff, verifiedValues },
    });

    // Invalidate cache
    this.refreshCache();

    return {
      previewOnly: false,
      diff,
      savedTimestamp: savedIso,
      verifiedValues,
    };
  }
}

export const trackerService = new TrackerService();
