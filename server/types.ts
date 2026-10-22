export type EventStatus = 'started' | 'progress' | 'succeeded' | 'failed' | 'skipped';

export type JobUserStatus = 'active' | 'applied' | 'deleted';

export interface AgentEvent {
  eventId: string;
  runId: string;
  timestamp: string; // ISO 8601 with explicit +05:30 offset
  stage: string;
  status: EventStatus;
  message: string;
  recordId?: string;
  durationMs?: number;
  retryCount?: number;
  details?: Record<string, unknown>;
}

export interface JobRecord {
  jobId: string;
  dateDiscovered: string;
  company: string;
  jobTitle: string;
  jobDescriptionUrl: string;
  officialApplicationUrl: string;
  sourceUrl: string;
  location: string;
  workArrangement: string;
  employmentType: string;
  requiredExperience: string;
  educationRequirements: string;
  keyRequiredSkills: string;
  matchingSkills: string;
  missingRequirements: string;
  matchScore: number;
  matchClassification: string;
  eligibilityStatus: string;
  listingVerificationStatus: string;
  postingDate: string;
  deadline: string;
  dateLastVerified: string;
  originalResumeVersion: string;
  tailoredResumeFilenameOrLink: string;
  resumeTailoringStatus: string;
  contactName: string;
  contactRole: string;
  contactProfileUrl: string;
  contactVerificationStatus: string;
  contactEmail: string;
  gmailDraftStatus: string;
  gmailDraftReference: string;
  applicationStatus: string;
  dateApplied: string;
  outreachStatus: string;
  followUpDate: string;
  notes: string;
  nextAction: string;
  lastUpdated: string;
  userStatus?: JobUserStatus;
  appliedAt?: string;
  deletedAt?: string;
  userNotes?: string;
  resumePdfUrl?: string;
  gmailDraftUrl?: string;
}

export interface OutreachRecord {
  contactName: string;
  company: string;
  role: string;
  relatedJobId: string;
  profileUrl: string;
  verificationSource: string;
  email: string;
  channel?: string;
  status?: string;
  notes?: string;
}

export interface ActionItem {
  id: string;
  done: boolean;
  actionItem: string;
  why: string;
  priority: string;
  status: string;
  link: string;
}

export interface CandidateProfile {
  masterResumeReference: string;
  verifiedSkills: string;
  confirmedExperience: string;
  projectEvidence: string;
  strongInferences: string;
  pendingQuestions: string[];
  tailoredResumeVersions: {
    target: string;
    url: string;
    score?: string;
  }[];
  lastReviewDate: string;
  // Permitted editable fields:
  userNotes?: string;
  preferredLocations?: string[];
  minimumExpectedSalary?: string;
  contactEmail?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  // Enhanced Grounding:
  education?: string[];
  resumeFolderUrl?: string;
  masterTrackerSheetUrl?: string;
  portfolioLinks?: {
    linkedin?: string;
    github?: string;
    enterpriseSupportLive?: string;
    enterpriseSupportDemo?: string;
    enterpriseSupportGithub?: string;
    zeptoGithub?: string;
    eplGithub?: string;
  };
  certifications?: {
    title: string;
    url?: string;
    credentialId?: string;
  }[];
  bouncedEmailsBanned?: string[];
}

export interface TailoredResumeV2 {
  targetCompanyRole: string;
  matchScore: string;
  professionalSummary: string;
  coreCompetencies: string;
  selectedProjects: string;
  tailoringNotes: string;
  drivePdfUrl: string;
  outreachSubject?: string;
  outreachTo?: string;
  outreachBody?: string;
  gmailDraftUrl?: string;
}

export interface RunHistoryRecord {
  runId: string;
  triggerType: string;
  scheduledTime: string;
  actualStart: string;
  actualEnd: string;
  duration: string;
  overallResult: string;
  jobsDiscovered: string;
  eligibleRetained: string;
  recordsAddedUpdated: string;
  draftOperations: string;
  lastSheetSync: string;
  nextScheduledRun: string;
}

export interface DailySummaryRecord {
  runDate: string;
  jobsDiscovered: string;
  jobsVerified: string;
  duplicatesExcluded: string;
  eligibleJobs: string;
}

export interface OverviewStats {
  agentStatus: 'IDLE' | 'RUNNING' | 'QUEUED' | 'ERROR';
  currentRunId: string | null;
  lastRunStart: string;
  lastRunCompletion: string;
  lastTrackerSync: string;
  nextScheduledRun: string;
  nextScheduledRunIso: string;
  totalJobsDiscoveredLatestRun: number;
  eligibleJobMatches: number;
  jobsAddedUpdated: number;
  duplicateJobsSkipped: number;
  resumesPrepared: number;
  gmailDraftsPrepared: number;
  failedStagesAndWarnings: number;
  itemsAwaitingHumanReview: number;
  googleSheetsConnected: boolean;
  gmailConnected: boolean;
  schedulerConnected: boolean;
  runCapMax: number;
  timezone: string;
  activeJobsCount?: number;
  appliedJobsCount?: number;
  deletedJobsCount?: number;
}

export interface IntegrationStatus {
  scheduler: {
    service: string;
    id: string;
    status: string;
    cron: string;
    timezone: string;
    nextExpectedRun: string;
    jobCap: number;
    lastVerified: string;
  };
  masterTracker: {
    spreadsheetId: string;
    localMirrorPath: string;
    status: string;
    tabsPreserved: string[];
    totalJobs: number;
    lastSync: string;
  };
  resumeDoc: {
    docId: string;
    status: string;
    lastVerified: string;
  };
  gmail: {
    account: string;
    draftsCount: number;
    draftIds: string[];
    autoSendEnabled: false; // permanently false
    status: string;
    lastVerified: string;
  };
}

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: 'owner';
  authenticatedAt: string;
}
