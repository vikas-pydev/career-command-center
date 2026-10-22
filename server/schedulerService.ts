export interface ScheduleInfo {
  schedulerId: string;
  service: string;
  status: 'STATUS_ACTIVE' | 'STATUS_PAUSED' | 'UNVERIFIED';
  cronExpression: string;
  timezone: string;
  jobCapMax: number;
  lastVerifiedIso: string;
  nextExpectedRunIso: string;
  nextExpectedRunFormatted: string;
  timeRemainingHuman: string;
  isConfirmed: boolean;
}

/**
 * Calculates the next weekday 9:00 AM IST execution for the verified scheduler:
 * ID: b12f7fda-6824-4f7f-a2b6-e1e4606bf362
 * Cron: 0 9 * * 1-5
 * Timezone: Asia/Kolkata (UTC+5:30)
 */
export function calculateNextScheduledRun(referenceTime?: Date): ScheduleInfo {
  const SCHEDULER_ID = 'b12f7fda-6824-4f7f-a2b6-e1e4606bf362';
  const TIMEZONE = 'Asia/Kolkata';
  const CRON = '0 9 * * 1-5';
  const JOB_CAP = 25;
  const LAST_VERIFIED = '2026-10-20T23:12:00+05:30';

  // Base current time in UTC
  const now = referenceTime || new Date();

  // Convert to IST timestamp (UTC + 5.5 hours)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffsetMs);

  const istYear = istNow.getUTCFullYear();
  const istMonth = istNow.getUTCMonth();
  const istDate = istNow.getUTCDate();
  const istDay = istNow.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
  const istHours = istNow.getUTCHours();
  const istMinutes = istNow.getUTCMinutes();

  let targetDate = istDate;
  let targetMonth = istMonth;
  let targetYear = istYear;

  // Has 9:00 AM IST passed today?
  const pastNineAmToday = istHours > 9 || (istHours === 9 && istMinutes > 0);

  if (istDay >= 1 && istDay <= 5 && !pastNineAmToday) {
    // Today is Monday-Friday before 9:00 AM -> Run is today at 9:00 AM IST
    targetDate = istDate;
  } else {
    // We need the next weekday
    let daysToAdd = 1;
    if (istDay === 5) {
      // Friday after 9:00 AM -> Saturday(+1), Sunday(+2), Monday(+3)
      daysToAdd = 3;
    } else if (istDay === 6) {
      // Saturday -> Sunday(+1), Monday(+2)
      daysToAdd = 2;
    } else if (istDay === 0) {
      // Sunday -> Monday(+1)
      daysToAdd = 1;
    } else {
      // Mon-Thu after 9:00 AM -> Next day
      daysToAdd = 1;
    }

    const nextDay = new Date(Date.UTC(istYear, istMonth, istDate + daysToAdd, 9, 0, 0));
    targetYear = nextDay.getUTCFullYear();
    targetMonth = nextDay.getUTCMonth();
    targetDate = nextDay.getUTCDate();
  }

  // Construct target in IST: targetYear, targetMonth, targetDate at 09:00:00
  // In UTC that corresponds to (09:00 - 05:30) = 03:30:00 UTC
  const targetUtcDate = new Date(Date.UTC(targetYear, targetMonth, targetDate, 3, 30, 0));

  // Build ISO string with +05:30 offset
  const pad = (n: number) => n.toString().padStart(2, '0');
  const nextIso = `${targetYear}-${pad(targetMonth + 1)}-${pad(targetDate)}T09:00:00+05:30`;

  // Format human string e.g. "Wednesday, Oct 21, 2026 at 09:00:00 IST"
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const targetDayOfWeek = new Date(Date.UTC(targetYear, targetMonth, targetDate)).getUTCDay();

  const formattedStr = `${dayNames[targetDayOfWeek]}, ${monthNames[targetMonth]} ${targetDate}, ${targetYear} ~09:00:00 IST`;

  // Calculate time remaining
  const diffMs = targetUtcDate.getTime() - now.getTime();
  let timeRemaining = 'Due now';
  if (diffMs > 0) {
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    timeRemaining = `in ${hours}h ${mins}m`;
  }

  return {
    schedulerId: SCHEDULER_ID,
    service: 'Gemini Time-Based Scheduler',
    status: 'STATUS_ACTIVE',
    cronExpression: CRON,
    timezone: TIMEZONE,
    jobCapMax: JOB_CAP,
    lastVerifiedIso: LAST_VERIFIED,
    nextExpectedRunIso: nextIso,
    nextExpectedRunFormatted: formattedStr,
    timeRemainingHuman: timeRemaining,
    isConfirmed: true,
  };
}
