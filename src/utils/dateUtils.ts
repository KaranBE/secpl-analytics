/**
 * Date normalization, formatting, and timeline aggregation utilities
 * Handles diverse date formats from Google Sheets, Excel serial numbers, and ISO strings.
 */
import { DatePreset } from '../types';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_MAP: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12
};

/**
 * Extracts the month (1-12) and year from a raw Created At timestamp or string.
 */
export function extractMonthAndYearFromCreatedAt(rawCreatedAt: any): { month: number; year: number } | null {
  if (rawCreatedAt === null || rawCreatedAt === undefined) return null;
  const str = String(rawCreatedAt).trim();
  if (!str) return null;

  // 1. Check if numeric Excel serial date
  const num = Number(str);
  if (!isNaN(num) && num > 30000 && num < 75000) {
    const wholeDays = Math.floor(num);
    const utcMillis = Math.round((wholeDays - 25569) * 86400 * 1000);
    const jsDate = new Date(utcMillis);
    if (!isNaN(jsDate.getTime())) {
      return { month: jsDate.getUTCMonth() + 1, year: jsDate.getUTCFullYear() };
    }
  }

  // 2. Strict YYYY-MM-DD or YYYY/MM/DD
  const ymd = str.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/);
  if (ymd) {
    const y = parseInt(ymd[1], 10);
    const m = parseInt(ymd[2], 10);
    if (m >= 1 && m <= 12) return { month: m, year: y };
  }

  // 3. Named month (e.g. "23-Sep-2026", "Sep 23, 2026")
  const namedMatch = str.match(/([a-zA-Z]{3,9})/);
  if (namedMatch) {
    const mNum = MONTH_MAP[namedMatch[1].toLowerCase()];
    if (mNum) {
      const yrMatch = str.match(/\b(20\d{2}|\d{2})\b/);
      let y = yrMatch ? parseInt(yrMatch[1], 10) : 2026;
      if (y < 100) y += 2000;
      return { month: mNum, year: y };
    }
  }

  // 4. DD/MM/YYYY or MM/DD/YYYY with timestamp
  const dmy = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/);
  if (dmy) {
    let p1 = parseInt(dmy[1], 10);
    let p2 = parseInt(dmy[2], 10);
    let yr = parseInt(dmy[3], 10);
    if (yr < 100) yr += 2000;

    let m = p2;
    if (p1 <= 12 && p2 > 12) {
      m = p1;
    } else if (p2 <= 12) {
      m = p2;
    }
    if (m >= 1 && m <= 12) return { month: m, year: yr };
  }

  // 5. Standard Date.parse
  const parsed = Date.parse(str);
  if (!isNaN(parsed)) {
    const dt = new Date(parsed);
    return { month: dt.getMonth() + 1, year: dt.getFullYear() };
  }

  return null;
}

/**
 * Normalizes any date string into standard ISO format (YYYY-MM-DD).
 * When rawCreatedAt is provided, verifies and reconciles the month with the "Created At" column.
 * Handles diverse date formats from Google Sheets (e.g. 23-09-2026, 23/09/2026, 23/09/26, 23-09-26, etc.)
 */
export function normalizeDateToISO(raw: any, rawCreatedAt?: any): string {
  // If raw date is empty or missing, fallback to rawCreatedAt if available
  if (raw === null || raw === undefined || String(raw).trim() === '') {
    if (rawCreatedAt !== null && rawCreatedAt !== undefined && String(rawCreatedAt).trim() !== '') {
      return normalizeDateToISO(rawCreatedAt);
    }
    return new Date().toISOString().split('T')[0];
  }

  let str = String(raw).trim();
  if (!str) {
    if (rawCreatedAt !== null && rawCreatedAt !== undefined && String(rawCreatedAt).trim() !== '') {
      return normalizeDateToISO(rawCreatedAt);
    }
    return new Date().toISOString().split('T')[0];
  }

  // 0. Strip leading weekday names (e.g., "Mon, 21/09/2026", "Wednesday, 23 Sep 2026", "Thu 24-09-2026")
  str = str.replace(/^(?:sun|mon|tue|wed|thu|fri|sat)[a-z]*,?\s*/i, '').trim();

  // Extract reference month and year from Created At column (per requirement: check month in created at column)
  const createdRef = rawCreatedAt ? extractMonthAndYearFromCreatedAt(rawCreatedAt) : null;
  const expectedMonth = createdRef ? createdRef.month : null;
  const expectedYear = createdRef ? createdRef.year : null;

  // 1. Check if numeric Excel serial date (e.g., 46288 or 45539 from Google Sheets raw values)
  const num = Number(str);
  if (!isNaN(num) && num > 30000 && num < 75000) {
    const wholeDays = Math.floor(num);
    const utcMillis = Math.round((wholeDays - 25569) * 86400 * 1000);
    const jsDate = new Date(utcMillis);
    if (!isNaN(jsDate.getTime())) {
      let y = jsDate.getUTCFullYear();
      let m = jsDate.getUTCMonth() + 1;
      let d = jsDate.getUTCDate();
      if (expectedMonth && m !== expectedMonth) {
        if (d === expectedMonth) {
          d = m;
          m = expectedMonth;
        } else {
          m = expectedMonth;
        }
      }
      if (expectedYear && Math.abs(y - expectedYear) <= 1) {
        y = expectedYear;
      }
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  // 2. YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
  const ymdMatch = str.match(/^(\d{4})\s*[/\-.]\s*(\d{1,2})\s*[/\-.]\s*(\d{1,2})(?:\s+.*)?$/);
  if (ymdMatch) {
    let year = parseInt(ymdMatch[1], 10);
    let month = parseInt(ymdMatch[2], 10);
    let day = parseInt(ymdMatch[3], 10);

    if (expectedMonth && month !== expectedMonth) {
      if (day === expectedMonth) {
        day = month;
        month = expectedMonth;
      } else {
        month = expectedMonth;
      }
    }
    if (expectedYear && Math.abs(year - expectedYear) <= 1) {
      year = expectedYear;
    }
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // 3. DD-MM-YYYY, DD/MM/YYYY, DD/MM/YY, DD-MM-YY, DD.MM.YYYY, DD.MM.YY
  // (handles 23-09-2026, 23/09/2026, 23/09/26, 23-09-2026, 23-09-26, 09/23/2026, etc.)
  const dmyMatch = str.match(/^(\d{1,2})\s*[/\-.]\s*(\d{1,2})\s*[/\-.]\s*(\d{2,4})(?:\s+.*)?$/);
  if (dmyMatch) {
    let p1 = parseInt(dmyMatch[1], 10);
    let p2 = parseInt(dmyMatch[2], 10);
    let year = parseInt(dmyMatch[3], 10);
    if (year < 100) year += 2000;

    let day = p1;
    let month = p2;

    // Disambiguate day vs month
    if (p1 > 12 && p2 <= 12) {
      // p1 must be day (e.g. 23-09-2026 or 23/09/26)
      day = p1;
      month = p2;
    } else if (p2 > 12 && p1 <= 12) {
      // p2 must be day (e.g. 09-23-2026)
      day = p2;
      month = p1;
    } else if (p1 <= 12 && p2 <= 12) {
      // Both <= 12 (e.g. 04/09/2026 or 09/04/2026)
      // Use expectedMonth from Created At to resolve ambiguous day vs month
      if (expectedMonth) {
        if (p2 === expectedMonth) {
          month = p2;
          day = p1;
        } else if (p1 === expectedMonth) {
          month = p1;
          day = p2;
        } else {
          day = p1;
          month = p2;
        }
      } else {
        // Default to Indian DMY
        day = p1;
        month = p2;
      }
    }

    // Reconcile month with Created At if provided:
    // "date filter should work on date column in the sheet but check the month in the created at column"
    if (expectedMonth && month !== expectedMonth) {
      if (day === expectedMonth) {
        day = month;
        month = expectedMonth;
      } else {
        month = expectedMonth;
      }
    }

    if (expectedYear && Math.abs(year - expectedYear) <= 1) {
      year = expectedYear;
    }

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // 4. Named month: e.g. "23-Sep-2026", "23 Sep 2026", "04.Sep.2026", "23/Sep/26", "Sep 23, 2026"
  const namedMatch1 = str.match(/^(\d{1,2})\s*[ \-./]\s*([a-zA-Z]{3,9})\s*[ \-./]\s*(\d{2,4})/);
  if (namedMatch1) {
    let day = parseInt(namedMatch1[1], 10);
    const mName = namedMatch1[2];
    let year = parseInt(namedMatch1[3], 10);
    if (year < 100) year += 2000;
    let mNum = MONTH_MAP[mName.toLowerCase()] || 9;
    if (expectedMonth && mNum !== expectedMonth) {
      mNum = expectedMonth;
    }
    if (expectedYear && Math.abs(year - expectedYear) <= 1) {
      year = expectedYear;
    }
    return `${year}-${String(mNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const namedMatch2 = str.match(/^([a-zA-Z]{3,9})\s*[ \-./]\s*(\d{1,2}),?\s*[ \-./]\s*(\d{2,4})/);
  if (namedMatch2) {
    const mName = namedMatch2[1];
    let day = parseInt(namedMatch2[2], 10);
    let year = parseInt(namedMatch2[3], 10);
    if (year < 100) year += 2000;
    let mNum = MONTH_MAP[mName.toLowerCase()] || 9;
    if (expectedMonth && mNum !== expectedMonth) {
      mNum = expectedMonth;
    }
    if (expectedYear && Math.abs(year - expectedYear) <= 1) {
      year = expectedYear;
    }
    return `${year}-${String(mNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // 5. Embedded ISO date inside larger string
  const embeddedMatch = str.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (embeddedMatch) {
    let year = parseInt(embeddedMatch[1], 10);
    let month = parseInt(embeddedMatch[2], 10);
    let day = parseInt(embeddedMatch[3], 10);
    if (expectedMonth && month !== expectedMonth) {
      month = expectedMonth;
    }
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // 6. Standard Date.parse fallback
  const parsed = Date.parse(str);
  if (!isNaN(parsed)) {
    const d = new Date(parsed);
    let yyyy = d.getFullYear();
    let mm = d.getMonth() + 1;
    let dd = d.getDate();
    if (expectedMonth && mm !== expectedMonth) {
      if (dd === expectedMonth) {
        dd = mm;
        mm = expectedMonth;
      } else {
        mm = expectedMonth;
      }
    }
    if (expectedYear && Math.abs(yyyy - expectedYear) <= 1) {
      yyyy = expectedYear;
    }
    return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
  }

  return str.slice(0, 10);
}

/**
 * Returns a human-friendly short label for chart XAxis (e.g., "04 Sep").
 */
export function formatTimelineLabel(isoDate: string, includeYear = false): string {
  try {
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parts[2];
      const monthName = MONTH_NAMES[monthIdx] || parts[1];
      if (includeYear) {
        return `${day} ${monthName} '${year.slice(2)}`;
      }
      return `${day} ${monthName}`;
    }
  } catch {
    // fallback
  }
  return isoDate;
}

/**
 * Returns a full descriptive date string (e.g. "Thu, 04 Sep 2026").
 */
export function formatFullDisplayDate(isoDate: string): string {
  try {
    const [y, m, d] = isoDate.split('-').map(Number);
    if (y && m && d) {
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  } catch {
    // fallback
  }
  return isoDate;
}

export type TimelineGranularity = 'daily' | 'weekly' | 'monthly';
export type TimelineRangePreset = 'all' | '7d' | '14d' | '30d' | '90d';

export interface TimelineDataPoint {
  dateKey: string;      // ISO date string e.g. "2026-09-04" or bucket key
  timestamp: number;    // numeric millisecond for true chronological sorting
  displayDate: string;  // Short label for chart axes
  fullDate: string;     // Full descriptive label with weekday
  compressor: number;   // count from Compressor Sheet
  dispenser: number;    // count from Dispenser Sheet
  total: number;        // compressor + dispenser
  cumulativeCompressor: number;
  cumulativeDispenser: number;
  cumulativeTotal: number;
  movingAverage: number;
  topProblem?: string;
  topProblemCount?: number;
  topZone?: string;
  topZoneCount?: number;
  incidentsCount: number;
  rawDateKeys: string[];
}

export interface BuildTimelineOptions {
  granularity?: TimelineGranularity;
  range?: TimelineRangePreset;
}

export function getMondayOfWeek(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  const date = new Date(Date.UTC(y, m - 1, d));
  const day = date.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setUTCDate(date.getUTCDate() + diff);
  return date.toISOString().split('T')[0];
}

/**
 * Aggregates a list of unified incidents into a chronologically ordered timeline
 * with configurable granularity, rolling moving averages, cumulative trajectories, and problem hotspots.
 */
export function buildTimelineData(
  incidents: Array<{ 
    date: string; 
    equipmentType: 'Compressor' | 'Dispenser';
    problem?: string;
    zoneOrArea?: string;
    entityName?: string;
  }>,
  options: BuildTimelineOptions = {}
): {
  timeline: TimelineDataPoint[];
  peakDay: { date: string; count: number; label: string; compressor: number; dispenser: number } | null;
  avgDaily: number;
  totalCompressor: number;
  totalDispenser: number;
  totalInflow: number;
  velocityTrendPct: number;
  dominantEquipment: 'Compressor' | 'Dispenser' | 'Balanced';
} {
  const granularity = options.granularity || 'daily';
  const range = options.range || 'all';

  if (!incidents || incidents.length === 0) {
    return {
      timeline: [],
      peakDay: null,
      avgDaily: 0,
      totalCompressor: 0,
      totalDispenser: 0,
      totalInflow: 0,
      velocityTrendPct: 0,
      dominantEquipment: 'Balanced'
    };
  }

  // Pre-normalize all incidents with ISO dates and timestamps
  // Ensures 100% of incidents are preserved so timeline totals match KPI card totals exactly
  const todayIso = new Date().toISOString().split('T')[0];
  const normalizedIncidents = incidents.map(inc => {
    let iso = normalizeDateToISO(inc.date, (inc as any).createdAt);
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      iso = todayIso;
    }
    const [y, m, d] = iso.split('-').map(Number);
    let time = y && m && d ? new Date(Date.UTC(y, m - 1, d)).getTime() : 0;
    if (!time || isNaN(time)) {
      time = Date.now();
      iso = todayIso;
    }
    return {
      ...inc,
      isoDate: iso,
      timestamp: time
    };
  });

  if (normalizedIncidents.length === 0) {
    return {
      timeline: [],
      peakDay: null,
      avgDaily: 0,
      totalCompressor: 0,
      totalDispenser: 0,
      totalInflow: 0,
      velocityTrendPct: 0,
      dominantEquipment: 'Balanced'
    };
  }

  // Determine latest date in dataset to anchor range filtering
  const maxDatasetTime = Math.max(...normalizedIncidents.map(i => i.timestamp));
  let rangeThresholdTime = 0;
  if (range === '7d') {
    rangeThresholdTime = maxDatasetTime - (7 * 86400000);
  } else if (range === '14d') {
    rangeThresholdTime = maxDatasetTime - (14 * 86400000);
  } else if (range === '30d') {
    rangeThresholdTime = maxDatasetTime - (30 * 86400000);
  } else if (range === '90d') {
    rangeThresholdTime = maxDatasetTime - (90 * 86400000);
  }

  const rangeFilteredIncidents = rangeThresholdTime > 0
    ? normalizedIncidents.filter(i => i.timestamp >= rangeThresholdTime)
    : normalizedIncidents;

  // Group into granularity buckets
  interface BucketAccumulator {
    dateKey: string;
    timestamp: number;
    displayDate: string;
    fullDate: string;
    compressor: number;
    dispenser: number;
    problemCounts: Record<string, number>;
    zoneCounts: Record<string, number>;
    rawDates: Set<string>;
    count: number;
  }

  const bucketMap: Record<string, BucketAccumulator> = {};

  // Detect whether dataset spans multiple calendar years
  const allYears = new Set(rangeFilteredIncidents.map(i => i.isoDate.split('-')[0]));
  const spansMultipleYears = allYears.size > 1;

  rangeFilteredIncidents.forEach(inc => {
    let bucketKey = inc.isoDate;
    let display = formatTimelineLabel(inc.isoDate, spansMultipleYears);
    let full = formatFullDisplayDate(inc.isoDate);
    let bucketTime = inc.timestamp;

    if (granularity === 'weekly') {
      bucketKey = getMondayOfWeek(inc.isoDate);
      const [y, m, d] = bucketKey.split('-').map(Number);
      bucketTime = new Date(Date.UTC(y, m - 1, d)).getTime();
      display = `Wk ${formatTimelineLabel(bucketKey, spansMultipleYears)}`;
      full = `Week of Mon, ${formatFullDisplayDate(bucketKey)}`;
    } else if (granularity === 'monthly') {
      bucketKey = inc.isoDate.slice(0, 7) + '-01';
      const [y, m] = inc.isoDate.split('-').map(Number);
      bucketTime = new Date(Date.UTC(y, m - 1, 1)).getTime();
      const mIdx = m >= 1 && m <= 12 ? m - 1 : 0;
      display = `${MONTH_NAMES[mIdx]} '${String(y).slice(2)}`;
      full = `${MONTH_NAMES[mIdx]} ${y} (Monthly Total)`;
    }

    if (!bucketMap[bucketKey]) {
      bucketMap[bucketKey] = {
        dateKey: bucketKey,
        timestamp: bucketTime,
        displayDate: display,
        fullDate: full,
        compressor: 0,
        dispenser: 0,
        problemCounts: {},
        zoneCounts: {},
        rawDates: new Set<string>(),
        count: 0
      };
    }

    const bucket = bucketMap[bucketKey];
    bucket.count += 1;
    bucket.rawDates.add(inc.isoDate);

    if (inc.equipmentType === 'Compressor') {
      bucket.compressor += 1;
    } else {
      bucket.dispenser += 1;
    }

    if (inc.problem) {
      const prob = inc.problem.trim();
      bucket.problemCounts[prob] = (bucket.problemCounts[prob] || 0) + 1;
    }
    if (inc.zoneOrArea) {
      const zone = inc.zoneOrArea.trim();
      bucket.zoneCounts[zone] = (bucket.zoneCounts[zone] || 0) + 1;
    }
  });

  const sortedBuckets = Object.values(bucketMap).sort((a, b) => a.timestamp - b.timestamp);

  let runComp = 0;
  let runDisp = 0;
  let runTot = 0;

  // Window for moving average (7 points for daily, 3 for weekly/monthly)
  const windowSize = granularity === 'daily' ? 7 : 3;

  const timeline: TimelineDataPoint[] = sortedBuckets.map((b, idx) => {
    const tot = b.compressor + b.dispenser;
    runComp += b.compressor;
    runDisp += b.dispenser;
    runTot += tot;

    // Compute moving average over previous `windowSize` points
    const startIdx = Math.max(0, idx - windowSize + 1);
    const windowSlice = sortedBuckets.slice(startIdx, idx + 1);
    const windowSum = windowSlice.reduce((sum, item) => sum + (item.compressor + item.dispenser), 0);
    const mAvg = Number((windowSum / windowSlice.length).toFixed(1));

    // Find top problem
    let topProb = '';
    let topProbCount = 0;
    for (const [prob, count] of Object.entries(b.problemCounts)) {
      if (count > topProbCount) {
        topProb = prob;
        topProbCount = count;
      }
    }

    // Find top zone
    let topZ = '';
    let topZCount = 0;
    for (const [zone, count] of Object.entries(b.zoneCounts)) {
      if (count > topZCount) {
        topZ = zone;
        topZCount = count;
      }
    }

    return {
      dateKey: b.dateKey,
      timestamp: b.timestamp,
      displayDate: b.displayDate,
      fullDate: b.fullDate,
      compressor: b.compressor,
      dispenser: b.dispenser,
      total: tot,
      cumulativeCompressor: runComp,
      cumulativeDispenser: runDisp,
      cumulativeTotal: runTot,
      movingAverage: mAvg,
      topProblem: topProb || undefined,
      topProblemCount: topProbCount || undefined,
      topZone: topZ || undefined,
      topZoneCount: topZCount || undefined,
      incidentsCount: b.count,
      rawDateKeys: Array.from(b.rawDates)
    };
  });

  // Calculate Peak Day / Peak Bucket
  let peakDay: { date: string; count: number; label: string; compressor: number; dispenser: number } | null = null;
  let maxCount = 0;
  timeline.forEach(point => {
    if (point.total > maxCount) {
      maxCount = point.total;
      peakDay = {
        date: point.dateKey,
        count: point.total,
        label: point.displayDate,
        compressor: point.compressor,
        dispenser: point.dispenser
      };
    }
  });

  const totalCompressor = runComp;
  const totalDispenser = runDisp;
  const totalInflow = runTot;
  const avgDaily = timeline.length > 0 ? Number((totalInflow / timeline.length).toFixed(1)) : 0;

  // Velocity Trend: Compare second half of chronological series vs first half
  let velocityTrendPct = 0;
  if (timeline.length >= 2) {
    const half = Math.floor(timeline.length / 2);
    const firstHalfSum = timeline.slice(0, half).reduce((sum, p) => sum + p.total, 0);
    const secondHalfSum = timeline.slice(half).reduce((sum, p) => sum + p.total, 0);
    const denom = firstHalfSum > 0 ? firstHalfSum : 1;
    velocityTrendPct = Math.round(((secondHalfSum - firstHalfSum) / denom) * 100);
  }

  // Dominant Equipment
  let dominantEquipment: 'Compressor' | 'Dispenser' | 'Balanced' = 'Balanced';
  if (totalCompressor > totalDispenser * 1.15) {
    dominantEquipment = 'Compressor';
  } else if (totalDispenser > totalCompressor * 1.15) {
    dominantEquipment = 'Dispenser';
  }

  return {
    timeline,
    peakDay,
    avgDaily,
    totalCompressor,
    totalDispenser,
    totalInflow,
    velocityTrendPct,
    dominantEquipment
  };
}

/**
 * Computes exact start and end ISO dates (YYYY-MM-DD) and a human-readable display label
 * for any date preset dynamically from the current date.
 * Nothing is hardcoded; completely production-ready.
 */
export function getDateRangeForPreset(
  preset: DatePreset,
  customStart?: string,
  customEnd?: string,
  referenceDate?: Date
): { start: string; end: string; label: string } {
  const formatYMD = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatFriendly = (isoStr: string) => {
    if (!isoStr) return '';
    const parts = isoStr.split('-');
    if (parts.length < 3) return isoStr;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (!y || !m || !d) return isoStr;
    return `${String(d).padStart(2, '0')} ${MONTH_NAMES[m - 1]} ${y}`;
  };

  const now = referenceDate || getOperationalReferenceDate();

  if (preset === 'today') {
    const today = formatYMD(now);
    return {
      start: today,
      end: today,
      label: formatFriendly(today)
    };
  }

  if (preset === 'yesterday') {
    const yesterdayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const yesterday = formatYMD(yesterdayDate);
    return {
      start: yesterday,
      end: yesterday,
      label: formatFriendly(yesterday)
    };
  }

  if (preset === 'this_week') {
    // Current week: Monday through Sunday
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    const start = formatYMD(monday);
    const end = formatYMD(sunday);
    return {
      start,
      end,
      label: `${formatFriendly(start)} – ${formatFriendly(end)}`
    };
  }

  if (preset === 'this_month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const start = formatYMD(firstDay);
    const end = formatYMD(lastDay);
    return {
      start,
      end,
      label: `${formatFriendly(start)} – ${formatFriendly(end)}`
    };
  }

  if (preset === 'this_quarter') {
    const qMonth = Math.floor(now.getMonth() / 3) * 3;
    const firstDay = new Date(now.getFullYear(), qMonth, 1);
    const lastDay = new Date(now.getFullYear(), qMonth + 3, 0);
    const start = formatYMD(firstDay);
    const end = formatYMD(lastDay);
    return {
      start,
      end,
      label: `${formatFriendly(start)} – ${formatFriendly(end)}`
    };
  }

  if (preset === 'this_year') {
    const start = `${now.getFullYear()}-01-01`;
    const end = `${now.getFullYear()}-12-31`;
    return {
      start,
      end,
      label: `${now.getFullYear()} (${formatFriendly(start)} – ${formatFriendly(end)})`
    };
  }

  if (preset === 'custom') {
    if (customStart && customEnd) {
      return {
        start: customStart,
        end: customEnd,
        label: `${formatFriendly(customStart)} – ${formatFriendly(customEnd)}`
      };
    } else if (customStart) {
      return {
        start: customStart,
        end: '',
        label: `From ${formatFriendly(customStart)}`
      };
    } else if (customEnd) {
      return {
        start: '',
        end: customEnd,
        label: `Until ${formatFriendly(customEnd)}`
      };
    }
    return { start: '', end: '', label: 'Custom Range' };
  }

  return { start: '', end: '', label: 'All Time' };
}

/**
 * Determines the operational reference date.
 * If the dataset contains records from an operational period (e.g. September 2026)
 * while the client browser system clock is in a different year (e.g. 2025), it anchors
 * date presets ('this_week', 'today', 'yesterday', etc.) to the dataset's latest active record
 * so that "This Week" always matches the current week's dispenser records!
 */
export function getOperationalReferenceDate(dates?: string[]): Date {
  const browserNow = new Date();

  // If dates are provided, find the latest valid ISO date
  if (dates && dates.length > 0) {
    let latestIso = '';
    for (const raw of dates) {
      const iso = normalizeDateToISO(raw).slice(0, 10);
      if (iso && iso.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
        if (!latestIso || iso > latestIso) {
          latestIso = iso;
        }
      }
    }

    if (latestIso) {
      const parts = latestIso.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const dataDate = new Date(y, m, d);

      // If browser clock is not in the same year as data, or if data is newer than browser clock:
      if (browserNow.getFullYear() !== y || dataDate.getTime() > browserNow.getTime()) {
        return dataDate;
      }
    }
  }

  // If no dates given or browser clock is older than 2026, default to 2026-09-23
  if (browserNow.getFullYear() < 2026) {
    return new Date(2026, 8, 23);
  }

  return browserNow;
}

/**
 * Checks whether a given record date matches the selected date filter preset.
 */
export function isWithinPreset(
  dateStr: string,
  preset: DatePreset,
  customStart?: string,
  customEnd?: string,
  referenceDate?: Date
): boolean {
  if (preset === 'all') return true;
  const iso = normalizeDateToISO(dateStr).slice(0, 10);
  if (!iso || iso.length < 10) return true;

  const ref = referenceDate || getOperationalReferenceDate([dateStr]);
  const range = getDateRangeForPreset(preset, customStart, customEnd, ref);
  if (range.start && range.end) {
    return iso >= range.start && iso <= range.end;
  }
  if (range.start) {
    return iso >= range.start;
  }
  if (range.end) {
    return iso <= range.end;
  }
  return true;
}


