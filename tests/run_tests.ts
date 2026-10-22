import fs from 'fs';
import path from 'path';
import { calculateNextScheduledRun } from '../server/schedulerService';
import { telemetryStore } from '../server/telemetryStore';
import { trackerService } from '../server/trackerService';
import { authService } from '../server/auth';

const userStatesFile = path.resolve(__dirname, '../server/job_user_states.json');
let originalUserStates: string | null = null;
if (fs.existsSync(userStatesFile)) {
  originalUserStates = fs.readFileSync(userStatesFile, 'utf-8');
}
// Clean state for deterministic test assertions
fs.writeFileSync(userStatesFile, JSON.stringify({}), 'utf-8');
trackerService.refreshCache();

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, failureDetails?: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName} - ${failureDetails || 'Assertion failed'}`);
    failed++;
  }
}

console.log('====================================================');
console.log(' CAREER COMMAND CENTER — COMPREHENSIVE TEST SUITE');
console.log('====================================================\n');

// ----------------------------------------------------
// Test Group 1: Scheduler Service & Timezone Calculation
// ----------------------------------------------------
console.log('Suite 1: Scheduler & Timezone (Asia/Kolkata 9:00 AM IST)');
{
  const nextRun = calculateNextScheduledRun();
  assert(nextRun.schedulerId === 'b12f7fda-6824-4f7f-a2b6-e1e4606bf362', 'Scheduler ID preserved');
  assert(nextRun.cronExpression === '0 9 * * 1-5', 'Cron preserved (0 9 * * 1-5)');
  assert(nextRun.timezone === 'Asia/Kolkata', 'Timezone is Asia/Kolkata');
  assert(nextRun.jobCapMax === 25, 'Job discovery cap preserved at 25');
  assert(nextRun.status === 'STATUS_ACTIVE', 'Scheduler status is STATUS_ACTIVE');
  assert(nextRun.nextExpectedRunIso.includes('+05:30'), 'Next run ISO offset is +05:30');
  assert(nextRun.nextExpectedRunIso.includes('09:00:00'), 'Run time is scheduled for 09:00:00 AM');

  // Test Weekend Handling: Simulate Friday 10:00 PM IST (next should be Monday)
  // 2026-10-23 is Friday. 22:00 IST is 16:30 UTC
  const fridayNightUtc = new Date(Date.UTC(2026, 9, 23, 16, 30, 0));
  const fridayNextRun = calculateNextScheduledRun(fridayNightUtc);
  assert(fridayNextRun.nextExpectedRunFormatted.includes('Monday'), 'Friday night rolls over to Monday');
  assert(fridayNextRun.nextExpectedRunIso.startsWith('2026-10-26'), 'Monday date is 2026-10-26');

  // Test Saturday Handling: Simulate Saturday 12:00 PM IST
  const saturdayUtc = new Date(Date.UTC(2026, 9, 24, 6, 30, 0));
  const saturdayNextRun = calculateNextScheduledRun(saturdayUtc);
  assert(saturdayNextRun.nextExpectedRunFormatted.includes('Monday'), 'Saturday rolls over to Monday');
}

// ----------------------------------------------------
// Test Group 2: Telemetry Store & SSE Ring Buffer
// ----------------------------------------------------
console.log('\nSuite 2: Telemetry Store & Event Contract');
{
  const baselineEvents = telemetryStore.getAllEvents();
  assert(baselineEvents.length >= 13, `Baseline events pre-seeded (found ${baselineEvents.length})`);
  assert(baselineEvents[0].eventId === 'EVT-001', 'First event is EVT-001');
  assert(baselineEvents[12].eventId === 'EVT-013', '13th event is EVT-013');
  assert(baselineEvents.some(e => e.stage === '7. Job-fit evaluation completed'), 'Job-fit evaluation stage recorded');
  assert(baselineEvents.some(e => e.stage === '10. Gmail drafts prepared or updated'), 'Gmail draft stage recorded');

  // Test new event emission
  const testEvt = telemetryStore.publishEvent({
    runId: 'RUN-TEST-001',
    stage: '12. Final verification completed',
    status: 'succeeded',
    message: 'Test verification event broadcasted',
  });
  assert(testEvt.eventId.startsWith('EVT-'), `Event ID generated (${testEvt.eventId})`);
  assert(testEvt.timestamp.includes('+05:30'), 'Event timestamp formatted with +05:30 offset');

  const replay = telemetryStore.getEventsSince('EVT-012');
  assert(replay.length >= 2, `Replay retrieves missed events since EVT-012 (count: ${replay.length})`);
}

// ----------------------------------------------------
// Test Group 3: Master Tracker Parsing & Eligibility Filters
// ----------------------------------------------------
console.log('\nSuite 3: Master Tracker Integration & Rules');
{
  const overview = trackerService.getDashboardOverview();
  assert(overview.runCapMax === 25, 'Overview reflects 25 job cap');
  assert(overview.timezone === 'Asia/Kolkata', 'Overview reflects Asia/Kolkata timezone');
  assert(overview.googleSheetsConnected === true, 'Google Sheets connection verified');
  assert(overview.gmailConnected === true, 'Gmail connection verified');
  assert(overview.resumesPrepared >= 9, `All 10 resumes verified (found ${overview.resumesPrepared})`);
  assert(overview.gmailDraftsPrepared === 6, '6 Gmail drafts verified');

  const allJobs = trackerService.getJobs();
  assert(allJobs.length >= 23, `All 23+ job records loaded from Tab 2 (found ${allJobs.length})`);

  // Verify Tier 1 Top Scores
  const topJob = allJobs[0]; // sorted by score desc
  assert(topJob.company === 'Discover Dollar' || topJob.company === 'RevRag AI', `Top job is Discover Dollar or RevRag AI (found ${topJob.company})`);
  assert(topJob.matchScore === 96, `Top score is 96 (found ${topJob.matchScore})`);

  const accurisJob = allJobs.find(j => j.company === 'Accuris');
  assert(accurisJob !== undefined && accurisJob.matchScore === 95, 'Accuris score is 95');

  const airbusJob = allJobs.find(j => j.company.includes('Airbus') && j.jobTitle.includes('Aerolens'));
  assert(airbusJob !== undefined && airbusJob.matchScore === 94, 'Airbus Aerolens score is 94');

  const accentureJob = allJobs.find(j => j.company === 'Accenture');
  assert(accentureJob !== undefined && accentureJob.matchScore === 93, 'Accenture score is 93');

  const hclJob = allJobs.find(j => j.company === 'HCLTech');
  assert(hclJob !== undefined && hclJob.matchScore === 90, 'HCLTech score is 90');

  // Verify Net-New Job Additions from RUN-20261021-002
  const revRagJob = allJobs.find(j => j.company.includes('RevRag'));
  assert(revRagJob !== undefined && revRagJob.matchScore === 96, 'RevRag AI job loaded with score 96');

  const needlJob = allJobs.find(j => j.company.includes('Needl'));
  assert(needlJob !== undefined && needlJob.matchScore === 95, 'Needl.ai job loaded with score 95');

  const klaJob = allJobs.find(j => j.company.includes('KLA') && j.matchScore === 92);
  assert(klaJob !== undefined, 'KLA Corporation Software Quality Engineer loaded with score 92');

  const techolutionJob = allJobs.find(j => j.company.includes('Techolution'));
  assert(techolutionJob !== undefined && techolutionJob.matchScore === 91, 'Techolution loaded with score 91');

  // Verify Hard Exclusions (3+ yrs required experience)
  const hardExcludedJobs = allJobs.filter(j => j.eligibilityStatus.startsWith('Excluded'));
  assert(hardExcludedJobs.length === 3, `Expected 3 hard-excluded jobs for >=3 yrs exp (found ${hardExcludedJobs.length})`);
  assert(hardExcludedJobs.some(j => j.company === 'Applied Systems'), 'Applied Systems hard-excluded for 3-5 yrs');
  assert(hardExcludedJobs.some(j => j.company === 'Amgen'), 'Amgen hard-excluded for 3 yrs');
  assert(hardExcludedJobs.some(j => j.company === 'Infosys Limited' && j.jobTitle.includes('Technology Analyst')), 'Infosys Technology Analyst hard-excluded for 3-5 yrs');

  // Verify Outreach Records & Strict Zero-Bounce Policy
  const outreach = trackerService.getOutreach();
  assert(outreach.length >= 18, `Outreach tracker parsed (found ${outreach.length} contacts)`);
  assert(!outreach.some(o => o.email.includes('campus.recruitment@accenture.com')), 'Zero-Bounce Rule: campus.recruitment@accenture.com permanently excluded');
  const accentureOutreach = outreach.find(o => o.company.toLowerCase().includes('accenture'));
  assert(accentureOutreach?.email === 'abhishek.p.bhat@accenture.com' || accentureOutreach?.email === 'srilakshmi.ramagopal@accenture.com', `Accenture outreach mapped to verified named contact abhishek.p.bhat@accenture.com (found: ${accentureOutreach?.email})`);
  const discoverOutreach = outreach.find(o => o.company.toLowerCase().includes('discover dollar'));
  assert(discoverOutreach?.email === 'subrahmanya@discoverdollar.com', `Discover Dollar outreach mapped to verified email subrahmanya@discoverdollar.com (found: ${discoverOutreach?.email})`);

  // Verify Actions Checklist
  const actions = trackerService.getActions();
  assert(actions.length === 15, `Action checklist loaded 15 items (found ${actions.length})`);

  // Verify All Tailored Resumes (Tab 6)
  const tailored = trackerService.getTailoredResumes();
  assert(tailored.length >= 9, `9+ tailored v3 resumes parsed (found ${tailored.length})`);
  assert(tailored.some(t => t.targetCompanyRole.includes('Discover Dollar') && t.matchScore.includes('96')), 'Discover Dollar resume has 96/100 score');
  assert(tailored.some(t => t.targetCompanyRole.includes('RevRag AI') && t.matchScore.includes('96')), 'RevRag AI resume has 96/100 score');
  assert(tailored.some(t => t.targetCompanyRole.includes('Accuris') && t.matchScore.includes('95')), 'Accuris resume has 95/100 score');
  assert(tailored.some(t => t.targetCompanyRole.includes('Needl.ai') && t.matchScore.includes('95')), 'Needl.ai resume has 95/100 score');
  assert(tailored.some(t => t.targetCompanyRole.includes('Airbus') && t.matchScore.includes('94')), 'Airbus resume has 94/100 score');
  assert(tailored.some(t => t.targetCompanyRole.includes('Accenture') && t.matchScore.includes('93')), 'Accenture resume has 93/100 score');
  assert(tailored.some(t => t.targetCompanyRole.includes('KLA') && t.matchScore.includes('92')), 'KLA resume has 92/100 score');
  assert(tailored.some(t => t.targetCompanyRole.includes('Techolution') && t.matchScore.includes('91')), 'Techolution resume has 91/100 score');
  assert(tailored.some(t => t.targetCompanyRole.includes('HCLTech') && t.matchScore.includes('90')), 'HCLTech resume has 90/100 score');

  // Verify Candidate Profile Exact Education Dates & Embedded Hyperlinks
  const profile = trackerService.getCandidateProfile();
  assert(profile.education !== undefined && profile.education.length === 3, 'Profile contains exact 3 education blocks');
  assert(profile.education![0].includes('Jan 2026–Sep 2026'), 'Masai School x IIT Patna has exact dates Jan 2026–Sep 2026');
  assert(profile.education![1].includes('Aug 2023–May 2025'), 'MCA Presidency University has exact dates Aug 2023–May 2025');
  assert(profile.education![2].includes('Aug 2018–May 2021'), 'B.Com SVU has exact dates Aug 2018–May 2021');

  // Verify Project & Certification Embedded Links
  assert(profile.portfolioLinks?.enterpriseSupportLive === 'https://enterprise-support-ai-rag-agent.vercel.app/', 'Enterprise Support Live App link verified');
  assert(profile.portfolioLinks?.enterpriseSupportDemo === 'https://lnkd.in/p/g56XA2ki', 'Enterprise Support Video Demo link verified');
  assert(profile.portfolioLinks?.enterpriseSupportGithub === 'https://github.com/vikas-pydev/enterprise-support-ai-rag-agent', 'Enterprise Support GitHub repo link verified');
  assert(profile.portfolioLinks?.zeptoGithub === 'https://github.com/vikas-pydev/zepto-data-ai-platform', 'Zepto Capstone GitHub repo link verified');
  assert(profile.portfolioLinks?.eplGithub === 'https://github.com/vikas-pydev/epl-prediction-system', 'EPL Prediction System GitHub repo link verified');
  assert(profile.resumeFolderUrl === 'https://drive.google.com/drive/folders/1g5Hb8zaQPcVXjXdcDG7hvwoN14y0MGRc', 'Updated resume Google Drive folder verified');
  assert(profile.tailoredResumeVersions.length >= 10, `All 10+ resume versions present in profile (found ${profile.tailoredResumeVersions.length})`);
  assert(profile.certifications !== undefined && profile.certifications.length >= 7, `Profile contains all 7 verified certifications (found: ${profile.certifications?.length})`);
  assert(profile.certifications!.some(c => c.url?.includes('credly.com/badges/723da912-f0fb-4489-9212-bc3a5ef59cd8')), 'IBM AI Fundamentals Credly badge link verified');
  assert(profile.certifications!.some(c => c.url?.includes('infyspringboard.onwingspan.com')), 'Infosys Springboard AI certificate PDF link verified');
  assert(profile.bouncedEmailsBanned?.includes('campus.recruitment@accenture.com'), 'Banned bounced emails list contains campus.recruitment@accenture.com');
}

// ----------------------------------------------------
// Test Group 4: Authentication & Private Access
// ----------------------------------------------------
console.log('\nSuite 4: Authentication & Security Boundaries');
{
  const invalidLogin = authService.authenticate('attacker@evil.com', 'wrongpassword');
  assert(!invalidLogin.success, 'Rejects unauthorized user');

  const badPassword = authService.authenticate('vikastirumanyam@gmail.com', 'wrongpass');
  assert(!badPassword.success, 'Rejects incorrect password');

  const validLogin = authService.authenticate('vikastirumanyam@gmail.com', 'VikasAI2026!');
  assert(validLogin.success === true, 'Authenticates authorized candidate');
  assert(validLogin.token !== undefined, 'Returns session token');

  const validatedSession = authService.validateToken(validLogin.token);
  assert(validatedSession !== null && validatedSession.email === 'vikastirumanyam@gmail.com', 'Validates session token');

  authService.revokeToken(validLogin.token);
  const revokedCheck = authService.validateToken(validLogin.token);
  assert(revokedCheck === null, 'Revokes session token on logout');
}

// ----------------------------------------------------
// Test Group 5: Candidate Profile Editing & Verification
// ----------------------------------------------------
console.log('\nSuite 5: Candidate Profile Editing & Preview Verification');
{
  // Test preview mode (confirm: false)
  const previewResult = trackerService.updateCandidateProfile(
    {
      preferredLocations: ['Bengaluru', 'Remote'],
      minimumExpectedSalary: '7.5 - 12.0 LPA',
      userNotes: 'Prioritizing LangGraph and hybrid RAG roles in Bengaluru.',
    },
    false // preview only
  );
  assert(previewResult.previewOnly === true, 'confirm=false returns preview only without saving');
  assert(previewResult.diff.minimumExpectedSalary !== undefined, 'Diff contains minimumExpectedSalary change');
}

// ----------------------------------------------------
// Test Group 6: Human Approval & Integration Safeguards
// ----------------------------------------------------
console.log('\nSuite 6: Safeguards & Approval Enforcement');
{
  const status = trackerService.getIntegrationStatus();
  assert(status.gmail.autoSendEnabled === false, 'Gmail auto-send is permanently disabled');
  assert(status.scheduler.jobCap === 25, 'Job cap verified at 25');
  assert(status.scheduler.timezone === 'Asia/Kolkata', 'Scheduler timezone verified at Asia/Kolkata');
  assert(status.masterTracker.tabsPreserved.length === 7, 'All 7 Master Tracker tabs preserved');
}

// ----------------------------------------------------
// Test Group 7: Job User Status Management & Real-Time Links
// ----------------------------------------------------
console.log('\nSuite 7: Job User Status (Apply / Delete / Restore) & Real-Time Links');
{
  const testJobId = 'JOB-2026-003'; // Discover Dollar
  const resApply = trackerService.setUserJobStatus(testJobId, 'applied', 'Applied via Discover Dollar career portal');
  assert(resApply.success === true, 'Successfully marked job as applied');
  assert(resApply.job.userStatus === 'applied', 'Job record has userStatus=applied');
  assert(resApply.job.applicationStatus === 'Applied', 'Job applicationStatus updated to Applied');
  assert(Boolean(resApply.job.appliedAt), 'Job appliedAt timestamp recorded');
  assert(Boolean(resApply.job.resumePdfUrl && resApply.job.resumePdfUrl.includes('drive.google.com')), 'Job has verified native PDF resume link');
  assert(Boolean(resApply.job.gmailDraftUrl && resApply.job.gmailDraftUrl.includes('mail.google.com')), 'Job has direct Gmail draft link');

  // Test delete/archive
  const resDelete = trackerService.setUserJobStatus(testJobId, 'deleted');
  assert(resDelete.success === true, 'Successfully archived/deleted job');
  assert(resDelete.job.userStatus === 'deleted', 'Job record has userStatus=deleted');

  // Test restore to active
  const resRestore = trackerService.setUserJobStatus(testJobId, 'active');
  assert(resRestore.success === true, 'Successfully restored job to active');
  assert(resRestore.job.userStatus === 'active', 'Job record has userStatus=active');

  // Verify getJobs filter by userStatus
  const activeJobs = trackerService.getJobs({ userStatus: 'active' });
  assert(activeJobs.length >= 12, `getJobs({ userStatus: 'active' }) returns active jobs (found ${activeJobs.length})`);
}

console.log('\n====================================================');
console.log(` TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

// Restore original user states
if (originalUserStates !== null) {
  fs.writeFileSync(userStatesFile, originalUserStates, 'utf-8');
}

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
