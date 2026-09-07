/**
 * Date normalization, formatting, and timeline aggregation utilities
 * Handles diverse date formats from Google Sheets, Excel serial numbers, and ISO strings.
 */

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
 * Normalizes any date string into standard ISO format (YYYY-MM-DD).
 */
export function normalizeDateToISO(raw: any): string {
  if (raw === null || raw === undefined) {
    return new Date().toISOString().split('T')[0];
  }

  const str = String(raw).trim();
  if (!str) {
    return new Date().toISOString().split('T')[0];
  }

  // 1. Check if numeric Excel serial date (e.g., 45539 from Google Sheets raw values)
  const num = Number(str);
  if (!isNaN(num) && num > 30000 && num < 70000) {
    const jsDate = new Date((num - 25569) * 86400 * 1000);
    if (!isNaN(jsDate.getTime())) {
      return jsDate.toISOString().split('T')[0];
    }
  }

  // 2. Already strict YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // 3. YYYY-MM-DD with timestamp (e.g. 2026-09-04 14:20:00 or 2026-09-04T14:20:00)
  if (/^\d{4}-\d{2}-\d{2}[ T]/.test(str)) {
    return str.slice(0, 10);
  }

  // 4. YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/);
  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // 5. Named month: e.g. "04-Sep-2026", "04 Sep 2026", "Sep 04, 2026"
  const namedMatch1 = str.match(/^(\d{1,2})[ -]([a-zA-Z]{3,9})[ -](\d{2,4})/);
  if (namedMatch1) {
    const [, dayStr, mName, yearStr] = namedMatch1;
    const mNum = MONTH_MAP[mName.toLowerCase()];
    if (mNum) {
      let year = parseInt(yearStr, 10);
      if (year < 100) year += 2000;
      return `${year}-${String(mNum).padStart(2, '0')}-${String(dayStr).padStart(2, '0')}`;
    }
  }

  const namedMatch2 = str.match(/^([a-zA-Z]{3,9})[ -](\d{1,2}),?[ -](\d{2,4})/);
  if (namedMatch2) {
    const [, mName, dayStr, yearStr] = namedMatch2;
    const mNum = MONTH_MAP[mName.toLowerCase()];
    if (mNum) {
      let year = parseInt(yearStr, 10);
      if (year < 100) year += 2000;
      return `${year}-${String(mNum).padStart(2, '0')}-${String(dayStr).padStart(2, '0')}`;
    }
  }

  // 6. DD/MM/YYYY or DD-MM-YYYY (Common in Indian & international operations)
  const dmyMatch = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/);
  if (dmyMatch) {
    let [, p1, p2, yearStr] = dmyMatch;
    let year = parseInt(yearStr, 10);
    if (year < 100) year += 2000;

    let day = parseInt(p1, 10);
    let month = parseInt(p2, 10);

    // If month > 12 and day <= 12, it's MM/DD/YYYY
    if (month > 12 && day <= 12) {
      const tmp = day;
      day = month;
      month = tmp;
    }

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // 7. Standard Date.parse fallback
  const parsed = Date.parse(str);
  if (!isNaN(parsed)) {
    const d = new Date(parsed);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  return str;
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
  const normalizedIncidents = incidents.map(inc => {
    const iso = normalizeDateToISO(inc.date);
    const [y, m, d] = iso.split('-').map(Number);
    const time = y && m && d ? new Date(Date.UTC(y, m - 1, d)).getTime() : 0;
    return {
      ...inc,
      isoDate: iso,
      timestamp: time
    };
  }).filter(inc => inc.timestamp > 0);

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

