/**
 * Utility for sanitizing names and textual identifiers across operations.
 */

/**
 * Strips special characters, bracketed/parenthetical suffixes, and abnormal symbols from engineer names.
 * Ensures clean alphanumeric names with standard single spacing.
 * 
 * Example: "Amit Sharma (South)" -> "Amit Sharma"
 * Example: "Vishal_Joshi - Lead" -> "Vishal Joshi Lead"
 * Example: "@Rahul Verma#" -> "Rahul Verma"
 */
export function cleanEngineerName(name: string): string {
  if (!name) return '';
  return name
    .replace(/\([^)]*\)/g, '')       // Remove parenthesized annotations like (South), (West), (Lead)
    .replace(/\[[^\]]*\]/g, '')      // Remove bracketed annotations like [Lead], [Tech]
    .replace(/[^a-zA-Z0-9\s]/g, ' ') // Replace any special characters with space
    .replace(/\s+/g, ' ')            // Normalize multiple spaces into a single space
    .trim();
}

/**
 * Validates whether a zone value is a legitimate geographical zone name.
 * Strictly filters out pure numbers, phone numbers, postal codes, ticket IDs,
 * and the literal word "Number" or "Sender Number".
 *
 * Example invalid: "1", "2", "9820012345", "+91 98000 00000", "Number", "Sender Number"
 * Example valid: "West Zone", "North Zone", "South Zone", "East Zone", "Central Zone"
 */
export function isValidZone(zone: unknown): boolean {
  if (!zone || typeof zone !== 'string') return false;
  const trimmed = zone.trim();
  if (!trimmed) return false;

  // Must contain alphabetic characters (eliminates pure numbers, phone numbers, symbols)
  if (!/[a-zA-Z]/.test(trimmed)) return false;

  // Exclude if it's purely a number with punctuation or spaces (e.g. "+91-9876543210")
  const stripped = trimmed.replace(/[^a-zA-Z0-9]/g, '');
  if (/^\d+$/.test(stripped)) return false;

  const lower = trimmed.toLowerCase();

  // Exclude generic placeholder tokens or keywords
  if (
    lower === 'number' ||
    lower === 'numbers' ||
    lower === 'no' ||
    lower === 'no.' ||
    lower === 'n/a' ||
    lower === 'null' ||
    lower === 'undefined' ||
    lower === '-' ||
    lower === '--'
  ) {
    return false;
  }

  // Exclude metadata column names mistakenly picked up as zones
  if (
    lower.includes('number') ||
    lower.includes('phone') ||
    lower.includes('mobile') ||
    lower.includes('serial') ||
    lower.includes('ticket id')
  ) {
    return false;
  }

  return true;
}

/**
 * Formats and cleans zone names.
 */
export function cleanZoneName(zone: string): string {
  if (!isValidZone(zone)) return '';
  return zone.trim();
}

/**
 * Sanitizes a serial number so that it starts with an alphabetic letter,
 * removing any characters (numbers, punctuation, symbols, whitespace) that appear before it.
 * Also trims leading label prefixes like "Sr No:", "Serial No:", "SN:".
 *
 * Example: "#123-DSP-SN-7721" -> "DSP-SN-7721"
 * Example: "01 DSP-SN-3310" -> "DSP-SN-3310"
 * Example: ": DSP-SN-1102" -> "DSP-SN-1102"
 * Example: "-SN-9081" -> "SN-9081"
 * Example: "Sr. No. DSP-8942" -> "DSP-8942"
 * Example: "DSP-SN-7721" -> "DSP-SN-7721"
 */
export function cleanSerialNumber(serial: unknown): string {
  if (!serial || typeof serial !== 'string') return '';
  let str = serial.trim();
  if (!str) return '';

  // Strip common label prefixes like "Sr No:", "Serial No.", "Sr. No -", "SN:" if present
  str = str.replace(/^(?:sr\.?\s*no\.?|serial\s*no\.?|sr\s*number|sn\.?)\s*[:#\-.]?\s*/i, '').trim();

  // Find index of first alphabetic letter [a-zA-Z]
  const match = str.match(/[a-zA-Z]/);
  if (!match || match.index === undefined) {
    // If no letter exists, return trimmed string
    return str;
  }

  // Remove any character appearing before the first letter
  return str.slice(match.index).trim();
}

/**
 * Checks if a string represents a BM (Breakdown Maintenance) service type,
 * accounting for all case, punctuation, space, and phrasing variations:
 * e.g., "BM", "bm", "Bm", "bM", "B.M.", "B.m", "b.m.", "B.M", "b.m", "B . M .", "B-M", "B/M",
 * "Breakdown", "Break Down", "Break-down", "Breakdown Maintenance", "BM Call", etc.
 */
export function isBMServiceType(val: unknown): boolean {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (!trimmed) return false;

  // 1. Strip all non-alphanumeric characters (removes dots, spaces, dashes, slashes, punctuation)
  // e.g. "B.M." -> "BM", "B.m" -> "BM", "b.m." -> "BM", "B.M" -> "BM", "B-M" -> "BM", "B/M" -> "BM", "B . M ." -> "BM"
  const strippedAlpha = trimmed.replace(/[^a-zA-Z]/g, '').toUpperCase();
  if (strippedAlpha === 'BM') {
    return true;
  }

  // 2. Breakdown phrasing checks
  const upper = trimmed.toUpperCase();
  if (upper.includes('BREAKDOWN') || upper.includes('BREAK DOWN') || upper.includes('BREAK-DOWN')) {
    return true;
  }

  // 3. Regex matching for "B.M." or "BM" as a token/prefix in longer text (e.g. "B.M. - Nozzle", "B.m Service", "BM (Breakdown)")
  // Matches B followed by optional dots/spaces/hyphens/slashes followed by M
  if (/^b[.\s\-_/]*m\b/i.test(trimmed) || /\bb[.\s\-_/]*m\b/i.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Checks if a string represents a PM (Preventive Maintenance) service type,
 * accounting for all case, punctuation, space, and phrasing variations:
 * e.g., "PM", "pm", "Pm", "pM", "P.M.", "P.m", "p.m.", "P.M", "p.m", "P . M .", "P-M", "P/M",
 * "Preventive", "Preventative", "Preventive Maintenance", "Periodic", "PM Service", etc.
 */
export function isPMServiceType(val: unknown): boolean {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (!trimmed) return false;

  // 1. Strip all non-alphanumeric characters
  // e.g. "P.M." -> "PM", "P.m" -> "PM", "p.m." -> "PM", "P.M" -> "PM", "P-M" -> "PM", "P/M" -> "PM", "P . M ." -> "PM"
  const strippedAlpha = trimmed.replace(/[^a-zA-Z]/g, '').toUpperCase();
  if (strippedAlpha === 'PM') {
    return true;
  }

  // 2. Preventive or Periodic phrasing checks
  const upper = trimmed.toUpperCase();
  if (
    upper.includes('PREVENT') || 
    upper.includes('PREVENTIVE') || 
    upper.includes('PREVENTATIVE') || 
    upper.includes('PERIODIC')
  ) {
    return true;
  }

  // 3. Regex matching for "P.M." or "PM" as a token/prefix in longer text (e.g. "P.M. - Calibration", "P.m Service", "PM (Preventive)")
  if (/^p[.\s\-_/]*m\b/i.test(trimmed) || /\bp[.\s\-_/]*m\b/i.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Normalizes dispenser service types from the "Service" column to either 'BM' or 'PM'.
 * Automatically resolves variations like B.M., BM, B.m, b.m., P.M., PM, P.m, p.m., etc.
 * Defaults to 'BM' if unspecified or unknown (as breakdown complaints are the primary log type).
 */
export function cleanServiceType(val: unknown): 'BM' | 'PM' | string {
  if (isPMServiceType(val)) return 'PM';
  if (isBMServiceType(val)) return 'BM';
  if (!val || typeof val !== 'string') return 'BM';
  const trimmed = val.trim();
  return trimmed || 'BM';
}

/**
 * Checks if a string contains both date text and station name indicators,
 * or typical composite WhatsApp template formatting.
 */
export function containsDateAndStation(text: unknown, stationName?: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const str = text.trim();
  if (str.length < 8) return false;
  const lower = str.toLowerCase();

  const hasDate =
    /\b(?:date|calldate|complaintdate|visitdate|logdate)\b/i.test(str) ||
    /\b\d{4}[/\-.]\d{1,2}[/\-.]\d{1,2}\b/.test(str) ||
    /\b\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}\b/.test(str) ||
    /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}\b/i.test(str);

  const hasStation =
    (Boolean(stationName) && stationName!.trim().length > 3 && lower.includes(stationName!.trim().toLowerCase())) ||
    /\b(?:station(?:\s*name)?|retail\s*outlet|outlet|cgd(?:\s*hub)?|mother\s*station|daughter\s*station|pump)\b/i.test(str) ||
    /\b(?:iocl|hpcl|bpcl|shell|adani|torrent|reliance|mgl|igl|nayara)\b/i.test(str);

  const hasNumberedTemplate =
    /(?:\(1\)|1[.)])[\s\S]+(?:\(2\)|2[.)])/.test(str) ||
    /(?:\(1\)|1[.)])[\s\S]+(?:\(10\)|10[.)])/.test(str) ||
    (str.includes('\n') && (lower.includes('date') || lower.includes('station')));

  return (hasDate && hasStation) || hasNumberedTemplate;
}

/**
 * Checks if a string contains item (10) or variations thereof.
 */
export function containsNumberedItem10(text: unknown): boolean {
  if (!text || typeof text !== 'string') return false;
  return /(?:^|[\n\r;,(])\s*(?:\(?10\)?|\[10\]|\{10\}|10\.|10\)|10:|10\s*[-–—]|10\s*>|\*10\*|#10|\(10\.\)|\(10\):)/i.test(text);
}

/**
 * Strips all variations of ".action taken:-", ".action takan:-", ".Action Tekan :-" from a problem string.
 * Also handles variations such as .action taken, .action takan, action taken:-, action takan:-, Action Tekan :-,
 * -action taken:-, action taken :, acton taken:-, action take:-, etc.
 *
 * If the remaining text contains any valid value, returns that cleaned value.
 * If the remaining text has no value (was purely the action taken text), returns an empty string.
 */
export function cleanActionTakenFromProblem(problemText: unknown): string {
  if (!problemText || typeof problemText !== 'string') return '';
  const str = problemText.trim();
  if (!str) return '';

  // Comprehensive regex matching all variations of action taken markers:
  // Examples:
  // .action taken:-, .action takan:-, .Action Tekan :-, .action taken, .action takan, .action tekan,
  // action taken:-, action takan:-, Action Tekan:-, Action Taken:,
  // -action taken:-, ;action taken:-, .action done:-, .action take:-,
  // .acton taken:-, .action takn:-, .Action Tekan : -
  const ACTION_TAKEN_REGEX = 
    /(?:^|\s*)[.,;:/\-_*~]*\s*act(?:i?o?n|ions?)\s*(?:(?:t[ae]k[ae]n|takn|tkn|takkan|takken|tekken|take|done)\s*[:=\-_.~]*|[:=\-_.~]+)\s*/i;

  if (ACTION_TAKEN_REGEX.test(str)) {
    const match = str.match(ACTION_TAKEN_REGEX);
    if (match && match.index !== undefined) {
      const before = str.slice(0, match.index).trim();
      const after = str.slice(match.index + match[0].length).trim();

      const cleanBefore = before.replace(/^[.,;:/\-_*~]+|[.,;:/\-_*~]+$/g, '').trim();
      const cleanAfter = after.replace(/^[.,;:/\-_*~]+|[.,;:/\-_*~]+$/g, '').trim();

      // If before has a valid problem description, prefer that value
      if (cleanBefore && cleanBefore.length >= 2) {
        return cleanBefore;
      }
      // If before is empty but after has a value, use the after value
      if (cleanAfter && cleanAfter.length >= 2) {
        return cleanAfter;
      }
      // Both before and after are empty or punctuation: no value remains
      return '';
    }
  }

  return str
    .replace(/(?:^|\s*)[.,;:/\-_*~]*\s*act(?:i?o?n|ions?)\s*(?:(?:t[ae]k[ae]n|takn|tkn|takkan|takken|tekken|take|done)\s*[:=\-_.~]*|[:=\-_.~]+)\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[.,;:/\-_*~]+|[.,;:/\-_*~]+$/g, '')
    .trim();
}

/**
 * Helper to clean extracted problem strings from numbering, bullets, quotes, and metadata.
 */
function sanitizeExtractedProblem(raw: string, stationName?: string): string {
  let cleaned = raw
    .replace(/^(?:\(?\d{1,2}\)?|\[\d{1,2}\]|\d{1,2}[.):\->]|[*•\-#])\s*/, '')
    .replace(/^(?:problem(?:\s*reported)?|nature\s*of\s*(?:complaint|problem|service)|reported\s*problem|complaint(?:\s*details?)?|fault(?:\s*details?)?|defect|issue|breakdown(?:\s*details?)?|remarks?|observation)[\s*:-]+/i, '')
    .replace(/^(?:\(?\d{1,2}\)?|\[\d{1,2}\]|\d{1,2}[.):\->]|[*•\-#])\s*/, '')
    .trim();

  // Strip trailing fields if subsequent keys were included (e.g. "(11) Status: Closed", "wamid....", "Sender:")
  cleaned = cleaned.replace(/[\n\r;].*$/, '').trim();
  cleaned = cleaned.replace(/\s*(?:\(?11\)?|11\.|wamid\.|whatsapp|sender|status)[\s\S]*$/i, '').trim();

  // Strip .action taken:-, .action takan:-, .Action Tekan :-, and all variations
  cleaned = cleanActionTakenFromProblem(cleaned);

  // Remove surrounding quotes or punctuation
  cleaned = cleaned.replace(/^["'`*]+|["'`*]+$/g, '').trim();

  if (cleaned && isValidProblemDescription(cleaned, stationName)) {
    return cleaned;
  }
  return '';
}

/**
 * Robust extractor for problem description:
 * 1. Checks if option/text contains date and station name, or template formatting.
 * 2. Checks text starting with (10) or other variations (e.g. 10., 10), [10], 10:).
 * 3. Checks text after Service Engineer.
 * 4. Checks the end of the raw message if problem keyword is missing.
 */
export function extractProblemFromTextOrRawMessage(
  text: unknown,
  rawMessage?: string,
  stationName?: string,
  engineerName?: string
): string {
  const primaryText = typeof text === 'string' ? text.trim() : '';
  const secondaryText = typeof rawMessage === 'string' ? rawMessage.trim() : '';

  // If already a clean, valid problem without date, station, or (10) numbering, return as is
  if (
    primaryText &&
    isValidProblemDescription(primaryText, stationName) &&
    !containsDateAndStation(primaryText, stationName) &&
    !containsNumberedItem10(primaryText)
  ) {
    return primaryText;
  }

  const candidateSources = [primaryText, secondaryText].filter(Boolean);

  // 1. Check for text starting with (10) or variations in all candidate sources
  const TEN_VARIATIONS_REGEX =
    /(?:^|[\n\r;,(])\s*(?:\(?10\)?|\[10\]|\{10\}|10\.|10\)|10:|10\s*[-–—]|10\s*>|\*10\*|#10|\(10\.\)|\(10\):)\s*(?:(?:problem(?:\s*reported)?|nature\s*of\s*(?:complaint|problem|service)|reported\s*problem|complaint(?:\s*details?)?|fault(?:\s*details?)?|defect|issue|breakdown(?:\s*details?)?|remarks?|observation)[\s*:-]*)?\s*([^\n\r;]+)/i;

  for (const source of candidateSources) {
    const match = source.match(TEN_VARIATIONS_REGEX);
    if (match && match[1]) {
      const sanitized = sanitizeExtractedProblem(match[1], stationName);
      if (sanitized) return sanitized;
    }
  }

  // 2. Check for other numbered items with explicit problem/complaint label (e.g. (9) Problem: ... or 11. Complaint: ...)
  const NUMBERED_PROBLEM_REGEX =
    /(?:^|[\n\r;,(])\s*(?:\(?\d{1,2}\)?|\d{1,2}[.)]|\[\d{1,2}\])\s*(?:problem(?:\s*reported)?|nature\s*of\s*(?:complaint|problem)|reported\s*problem|complaint(?:\s*details?)?|fault|issue|breakdown(?:\s*details?)?)[\s*:-]+\s*([^\n\r;]+)/i;

  for (const source of candidateSources) {
    const match = source.match(NUMBERED_PROBLEM_REGEX);
    if (match && match[1]) {
      const sanitized = sanitizeExtractedProblem(match[1], stationName);
      if (sanitized) return sanitized;
    }
  }

  // 3. Check for explicit "Problem:" or "Nature of complaint:" keyword anywhere in source
  const EXPLICIT_PROBLEM_REGEX =
    /(?:^|[\n\r;,(])\s*(?:problem(?:\s*reported)?|nature\s*of\s*(?:complaint|problem)|reported\s*problem|complaint\s*description|issue\s*description|fault\s*description)[\s*:-]+\s*([^\n\r;]+)/i;

  for (const source of candidateSources) {
    const match = source.match(EXPLICIT_PROBLEM_REGEX);
    if (match && match[1]) {
      const sanitized = sanitizeExtractedProblem(match[1], stationName);
      if (sanitized) return sanitized;
    }
  }

  // 4. Check after "Service Engineer" text:
  // "it could be after service engineer text"
  for (const source of candidateSources) {
    const engMatch = source.match(
      /(?:service\s*engineer(?:\s*name)?|engineer(?:\s*name)?|technician)[\s*:-]+[^\n\r]+([\s\S]*)/i
    );
    if (engMatch && engMatch[1]) {
      const afterEng = engMatch[1].trim();

      // Check if text after engineer has (10) variation
      const tenMatch = afterEng.match(TEN_VARIATIONS_REGEX);
      if (tenMatch && tenMatch[1]) {
        const sanitized = sanitizeExtractedProblem(tenMatch[1], stationName);
        if (sanitized) return sanitized;
      }

      // Check lines immediately after service engineer
      const lines = afterEng.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        const sanitized = sanitizeExtractedProblem(line, stationName);
        if (sanitized && isValidProblemDescription(sanitized, stationName)) {
          // Ensure it's not the engineer's name or station name
          if (
            engineerName &&
            sanitized.toLowerCase().includes(engineerName.trim().toLowerCase())
          ) {
            continue;
          }
          return sanitized;
        }
      }
    }
  }

  // 5. "even check the raw message if problem text is missing at the end of the raw message"
  for (const source of candidateSources) {
    const lines = source.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean);
    // Scan backwards from the end of the message to find the problem description
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];

      // Skip lines that are known metadata at the footer of raw messages
      const lower = line.toLowerCase();
      if (
        lower.startsWith('wamid.') ||
        lower.includes('message id') ||
        lower.startsWith('+91') ||
        lower.includes('sender') ||
        lower.includes('phone') ||
        lower.includes('mobile') ||
        lower.startsWith('status') ||
        lower === 'open' ||
        lower === 'closed' ||
        lower === 'in progress' ||
        lower.startsWith('http') ||
        /^\d{4}[/\-.]\d{1,2}[/\-.]\d{1,2}/.test(line) ||
        /^\d{1,2}[:.]\d{2}/.test(line) ||
        line.startsWith('---') ||
        line.startsWith('===')
      ) {
        continue;
      }

      // Skip if this line is an earlier field label (Date, Station, Serial, Service, Time, Zone, Engineer)
      if (
        /^(?:\(?\d{1,2}\)?|\[\d{1,2}\]|\d{1,2}[.)])?\s*(?:date|station|dispenser\s*serial|serial|service\s*type|type\s*of\s*service|complaint\s*time|reach\s*time|close\s*time|zone|area)[\s*:-]/i.test(line)
      ) {
        continue;
      }

      const sanitized = sanitizeExtractedProblem(line, stationName);
      if (sanitized && isValidProblemDescription(sanitized, stationName)) {
        if (
          engineerName &&
          sanitized.toLowerCase().includes(engineerName.trim().toLowerCase())
        ) {
          continue;
        }
        return sanitized;
      }
    }
  }

  return '';
}

/**
 * Checks whether a given string is a legitimate operational problem description.
 * Strictly rejects dates, clock times, station names, serial numbers,
 * column header labels ("Date", "Station Name", "Problem", etc.), phone numbers,
 * and service types.
 */
export function isValidProblemDescription(problem: unknown, stationName?: string): boolean {
  if (!problem || typeof problem !== 'string') return false;
  const trimmed = problem.trim();
  if (!trimmed || trimmed.length < 3) return false;

  const lower = trimmed.toLowerCase();

  // 1. Exclude generic placeholders or empty markers
  if (
    lower === '-' ||
    lower === '--' ||
    lower === 'n/a' ||
    lower === 'na' ||
    lower === 'null' ||
    lower === 'undefined' ||
    lower === 'none' ||
    lower === 'nil' ||
    lower === 'ok' ||
    lower === 'test'
  ) {
    return false;
  }

  // 1.1 Exclude if string is purely an action taken marker with no remaining value
  const withoutAction = cleanActionTakenFromProblem(trimmed);
  if (!withoutAction) {
    return false;
  }

  // 2. Exclude column header titles accidentally ingested from sheets
  const headerWords = [
    'date',
    'call date',
    'log date',
    'complaint date',
    'date of complaint',
    'date of call',
    'entry date',
    'timestamp',
    'time',
    'station name',
    'station',
    'retail outlet',
    'outlet',
    'location',
    'site',
    'dispenser serial no',
    'serial no',
    'serial number',
    'serial',
    'sr no',
    'sr. no',
    'type of service',
    'service type',
    'service',
    'nature of service',
    'complaint time',
    'reach time',
    'arrival time',
    'close time',
    'resolution time',
    'zone name',
    'zone',
    'area',
    'region',
    'service engineer name',
    'engineer name',
    'engineer',
    'technician',
    'problem',
    'problem reported',
    'reported problem',
    'whatsapp message id',
    'message id',
    'sender number',
    'sender',
    'phone number',
    'mobile',
    'status',
    'ticket status',
    'state',
    'text',
    'value',
    'column'
  ];
  if (headerWords.includes(lower)) {
    return false;
  }

  // 3. Exclude clock times (e.g., "08:45 AM", "14:30:00", "9:00am", "10:30 PM")
  if (/^\d{1,2}[:.]\d{2}([:.]\d{2})?\s*(am|pm)?$/i.test(trimmed)) {
    return false;
  }

  // 4. Exclude dates (e.g., "2026-09-24", "23/09/2026", "23-09-2026", "23.09.2026", "24-Sep-2026", "September 24, 2026")
  if (
    /^\d{4}[/\-.]\d{1,2}[/\-.]\d{1,2}/.test(trimmed) ||
    /^\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}/.test(trimmed) ||
    /^\d{1,2}\s+[a-zA-Z]{3,9}\s+\d{2,4}/.test(trimmed) ||
    /^[a-zA-Z]{3,9}\s+\d{1,2},?\s+\d{2,4}/.test(trimmed) ||
    /^(?:sun|mon|tue|wed|thu|fri|sat)[a-z]*,?\s*\d/i.test(trimmed)
  ) {
    return false;
  }

  // 5. Exclude serial numbers (e.g., "DSP-SN-7721", "CMP-SN-4412", "SN-9081", "#123")
  if (/^(?:dsp|cmp|sn)?[-_\s]*sn[-_\s]*\d+/i.test(trimmed) || /^[a-z]{2,4}-\d{3,6}$/i.test(trimmed)) {
    return false;
  }

  // 6. Exclude WhatsApp IDs or phone numbers
  if (
    lower.startsWith('wamid.') ||
    /^\+?\d[\d\s\-()]{7,}$/.test(trimmed) ||
    /^\d+$/.test(trimmed.replace(/[\s\-+]/g, ''))
  ) {
    return false;
  }

  // 7. Exclude station names
  if (stationName && trimmed.toLowerCase() === stationName.trim().toLowerCase()) {
    return false;
  }
  // Exclude common station naming patterns when the whole cell is just a station name
  const isStationName = 
    /^(?:iocl|hpcl|bpcl|shell|adani|nayara|reliance|mgl|igl|torrent)\b/i.test(trimmed) &&
    /\b(?:station|outlet|retail|plaza|hub|depot|cgd|point|pump)\b/i.test(trimmed);
  if (isStationName) {
    return false;
  }

  // 8. Exclude zones
  if (isValidZone(trimmed) && (lower.endsWith('zone') || lower.endsWith('area') || lower.endsWith('region'))) {
    return false;
  }

  // 9. Exclude pure service type tokens (e.g. "BM", "PM", "B.M.", "P.M.")
  const strippedAlpha = trimmed.replace(/[^a-zA-Z]/g, '').toUpperCase();
  if (strippedAlpha === 'BM' || strippedAlpha === 'PM') {
    return false;
  }

  return true;
}

/**
 * Sanitizes and cleans a problem description string.
 * If invalid or contains date/station metadata, attempts extraction from (10),
 * after service engineer, or from the raw message before falling back to service type.
 */
export function cleanProblemDescription(
  problem: unknown,
  serviceType?: string,
  stationName?: string,
  rawMessage?: string,
  engineerName?: string
): string {
  // If problem contains date text, station name, or template formatting, extract it!
  const extracted = extractProblemFromTextOrRawMessage(problem, rawMessage, stationName, engineerName);
  if (extracted && isValidProblemDescription(extracted, stationName)) {
    return cleanActionTakenFromProblem(extracted) || extracted;
  }

  // Strip action taken and check if remaining text contains value
  const cleanedFromAction = cleanActionTakenFromProblem(problem);
  if (cleanedFromAction && isValidProblemDescription(cleanedFromAction, stationName)) {
    return cleanedFromAction;
  }

  if (isValidProblemDescription(problem, stationName)) {
    return cleanActionTakenFromProblem(String(problem).trim()) || String(problem).trim();
  }

  const isPM = isPMServiceType(serviceType);
  return isPM ? 'Preventive Maintenance (PM)' : 'Dispenser Breakdown (BM)';
}

/**
 * Validates whether an extracted string is a plausible engineer name.
 */
export function isValidEngineerName(name: unknown): boolean {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 2) return false;
  const lower = trimmed.toLowerCase();
  if (
    lower === 'none' ||
    lower === 'n/a' ||
    lower === 'na' ||
    lower === 'nil' ||
    lower === 'null' ||
    lower === 'undefined' ||
    lower === 'unassigned' ||
    lower === '-' ||
    lower === '--' ||
    lower === 'service engineer' ||
    lower === 'service engineer name' ||
    lower === 'engineer' ||
    lower === 'technician' ||
    lower === 'service lead'
  ) {
    return false;
  }
  return /[a-zA-Z]/.test(trimmed);
}

/**
 * Extracts a single engineer name from a line of text.
 */
function extractEngineerFromSingleLine(text: string): string {
  if (!text || typeof text !== 'string') return '';

  // Match Service Engineer / Service Engineer Name and their variations
  const regex = /(?:(?:\d{1,2}[.)\s]*)|\*+)?\s*(?:service\s*(?:eng(?:ineer|g|r)?|technician)|assigned\s*engineer|servic\s*engineer|servise\s*engineer|engineer)\s*(?:name|lead)?\s*\*?\s*(?:[:=.-]+|\s+)\s*([^\n\r,;|]+)/i;

  const match = text.match(regex);
  if (!match || !match[1]) return '';

  let val = match[1].trim();
  val = val.replace(/\*+/g, '');

  // Cut off if another field starts on same line (problem, action taken, remarks, status, etc.)
  val = val.split(/(?:(?:\b\d{1,2}[.)]\s*|\(\d{1,2}\)\s*)?(?:problem|nature\s*of|action\s*t[ae]k[ae]n|status|remarks|mobile|mob|contact|phone|ph\.?|cell)[\s*:-]+)/i)[0].trim();

  // Strip parenthesized annotations or phone numbers (e.g. (9845000000) or (South))
  val = val.replace(/\([^)]*\)/g, '').trim();

  // Strip phone numbers after delimiters like - / |
  val = val.replace(/[-/,|]\s*(?:\+?91[\s-]*)?[6-9]\d[\d\s-]{7,}.*$/i, '').trim();
  val = val.replace(/\+?91[\s-]*[6-9]\d[\d\s-]{7,}.*$/i, '').trim();
  val = val.replace(/\b[6-9]\d{9}\b.*$/i, '').trim();

  val = cleanEngineerName(val);

  if (!isValidEngineerName(val)) return '';
  return val;
}

/**
 * Extracts assigned service engineer name from raw message containing text
 * "Service engineer", "service engineer name" and variations.
 */
export function extractEngineerFromTextOrRawMessage(...sources: unknown[]): string {
  for (const src of sources) {
    if (!src) continue;
    const str = String(src).trim();
    if (!str) continue;

    // Check line by line
    const lines = str.split(/[\n\r]+/);
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      const res = extractEngineerFromSingleLine(trimmedLine);
      if (res && isValidEngineerName(res)) {
        return cleanEngineerName(res);
      }
    }

    // Also test full source string
    const wholeRes = extractEngineerFromSingleLine(str);
    if (wholeRes && isValidEngineerName(wholeRes)) {
      return cleanEngineerName(wholeRes);
    }
  }
  return '';
}
