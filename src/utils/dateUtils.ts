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

export interface TimelineDataPoint {
  dateKey: string;      // "2026-09-04"
  timestamp: number;    // numeric millisecond for true chronological sorting
  displayDate: string;  // "04 Sep"
  fullDate: string;     // "Thu, Sep 4, 2026"
  compressor: number;   // count from Compressor Sheet
  dispenser: number;    // count from Dispenser Sheet
  total: number;        // compressor + dispenser
}

/**
 * Aggregates a list of unified incidents into a chronologically ordered daily timeline.
 */
export function buildTimelineData(
  incidents: Array<{ date: string; equipmentType: 'Compressor' | 'Dispenser' }>
): {
  timeline: TimelineDataPoint[];
  peakDay: { date: string; count: number; label: string } | null;
  avgDaily: number;
  totalCompressor: number;
  totalDispenser: number;
  totalInflow: number;
} {
  const map: Record<string, { compressor: number; dispenser: number }> = {};

  let totalCompressor = 0;
  let totalDispenser = 0;

  incidents.forEach(inc => {
    const iso = normalizeDateToISO(inc.date);
    if (!map[iso]) {
      map[iso] = { compressor: 0, dispenser: 0 };
    }
    if (inc.equipmentType === 'Compressor') {
      map[iso].compressor += 1;
      totalCompressor += 1;
    } else {
      map[iso].dispenser += 1;
      totalDispenser += 1;
    }
  });

  const keys = Object.keys(map);
  if (keys.length === 0) {
    return {
      timeline: [],
      peakDay: null,
      avgDaily: 0,
      totalCompressor: 0,
      totalDispenser: 0,
      totalInflow: 0
    };
  }

  // Detect whether multiple calendar years are present
  const years = new Set(keys.map(k => k.split('-')[0]));
  const spansMultipleYears = years.size > 1;

  // Build sorted array
  const timeline: TimelineDataPoint[] = keys
    .map(isoKey => {
      const [y, m, d] = isoKey.split('-').map(Number);
      const time = y && m && d ? new Date(y, m - 1, d).getTime() : 0;
      const comp = map[isoKey].compressor;
      const disp = map[isoKey].dispenser;
      const tot = comp + disp;

      return {
        dateKey: isoKey,
        timestamp: time,
        displayDate: formatTimelineLabel(isoKey, spansMultipleYears),
        fullDate: formatFullDisplayDate(isoKey),
        compressor: comp,
        dispenser: disp,
        total: tot
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  // Calculate Peak Day
  let peakDay: { date: string; count: number; label: string } | null = null;
  let maxCount = 0;
  timeline.forEach(point => {
    if (point.total > maxCount) {
      maxCount = point.total;
      peakDay = {
        date: point.dateKey,
        count: point.total,
        label: point.displayDate
      };
    }
  });

  const totalInflow = totalCompressor + totalDispenser;
  const avgDaily = timeline.length > 0 ? Number((totalInflow / timeline.length).toFixed(1)) : 0;

  return {
    timeline,
    peakDay,
    avgDaily,
    totalCompressor,
    totalDispenser,
    totalInflow
  };
}
