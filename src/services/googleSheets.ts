import { CompressorRecord, DispenserSheetRecord, TicketStatus } from '../types';
import { normalizeDateToISO } from '../utils/dateUtils';
import { cleanEngineerName, isValidZone } from '../utils/cleanUtils';

export const COMPRESSOR_SPREADSHEET_ID = '1BdifU1B_GzUgs5dkcadQMZhMuOcveG_41m7OSsQr0MU';
export const DISPENSER_SPREADSHEET_ID = '16rYwtl9mx_kWun3q-CqvBx57o5bcovAGvlQSjYarIMU';
export const DEFAULT_SHEET_OWNER_EMAIL = 'web@shahgroup.co';
export const DEFAULT_SHARED_APP_URL = 'https://ais-pre-kcqnkh4h7zpzdjumgjo5gf-270031739203.asia-southeast1.run.app';

export function getPublicSharedAppUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_SHARED_APP_URL;
  const origin = window.location.origin;
  if (!origin || origin.includes('aistudio.google.com')) {
    return DEFAULT_SHARED_APP_URL;
  }
  if (origin.includes('ais-dev-')) {
    return origin.replace('ais-dev-', 'ais-pre-');
  }
  return origin;
}

export function getGoogleSheetShareUrl(spreadsheetId: string): string {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing`;
}

export class GoogleSheetsAccessError extends Error {
  statusCode: number;
  isPermissionDenied: boolean;
  spreadsheetId: string;

  constructor(message: string, statusCode: number, isPermissionDenied: boolean, spreadsheetId: string) {
    super(message);
    this.name = 'GoogleSheetsAccessError';
    this.statusCode = statusCode;
    this.isPermissionDenied = isPermissionDenied;
    this.spreadsheetId = spreadsheetId;
  }
}

export interface SpreadsheetInfo {
  id: string;
  title: string;
  sheets: { id: number; title: string; rowCount?: number }[];
}

/**
 * Fetch spreadsheet metadata to determine title and available sheets dynamically.
 */
export async function getSpreadsheetInfo(spreadsheetId: string, accessToken: string): Promise<SpreadsheetInfo> {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    const isForbidden = response.status === 403 || errorBody.includes('PERMISSION_DENIED') || errorBody.includes('caller does not have permission');
    const isNotFound = response.status === 404;
    
    if (isForbidden || isNotFound) {
      throw new GoogleSheetsAccessError(
        `Permission required: This Google account does not have read access to spreadsheet ${spreadsheetId}. The sheet owner (${DEFAULT_SHEET_OWNER_EMAIL}) must grant Viewer access.`,
        response.status,
        true,
        spreadsheetId
      );
    }
    
    throw new GoogleSheetsAccessError(
      `Failed to fetch spreadsheet info (${response.status}): ${errorBody}`,
      response.status,
      false,
      spreadsheetId
    );
  }

  const data = await response.json();
  return {
    id: spreadsheetId,
    title: data.properties?.title || 'Google Sheet',
    sheets: (data.sheets || []).map((s: any) => ({
      id: s.properties?.sheetId,
      title: s.properties?.title,
      rowCount: s.properties?.gridProperties?.rowCount
    }))
  };
}

/**
 * Fetch 2D array of raw values from a specified spreadsheet tab.
 */
export async function getSheetValues(spreadsheetId: string, sheetTitle: string, accessToken: string): Promise<string[][]> {
  const range = `${encodeURIComponent(sheetTitle)}!A1:Z500`;
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    const isForbidden = response.status === 403 || errorBody.includes('PERMISSION_DENIED') || errorBody.includes('caller does not have permission');
    const isNotFound = response.status === 404;

    if (isForbidden || isNotFound) {
      throw new GoogleSheetsAccessError(
        `Permission required to read tab "${sheetTitle}" in sheet ${spreadsheetId}. The sheet owner (${DEFAULT_SHEET_OWNER_EMAIL}) must grant Viewer access.`,
        response.status,
        true,
        spreadsheetId
      );
    }

    throw new GoogleSheetsAccessError(
      `Failed to fetch sheet values (${response.status}): ${errorBody}`,
      response.status,
      false,
      spreadsheetId
    );
  }

  const data = await response.json();
  return (data.values || []) as string[][];
}

/**
 * Normalize text for resilient column header matching
 */
function norm(str: string | undefined): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Check if a string represents a clock time rather than a problem description
 */
export function isTimeString(val: unknown): boolean {
  if (typeof val !== 'string') return false;
  const s = val.trim();
  if (!s) return false;
  // Matches "08:45", "08:45 AM", "8:45 PM", "14:30", "14:30:00", "09.15 AM", "09:00:00 AM", "8.30 am", "08:45:12"
  if (/^\d{1,2}[:.]\d{2}([:.]\d{2})?\s*(am|pm)?$/i.test(s)) return true;
  if (/^\d{1,2}\s*(am|pm)$/i.test(s)) return true;
  // Matches Excel time fractions or formatted times like "10:30:00"
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(s)) return true;
  return false;
}

/**
 * Map header string to index with candidate priority and exclusion list
 */
function findColIndex(headers: string[], candidates: string[], excludeWords: string[] = []): number {
  const normCandidates = candidates.map(c => norm(c)).filter(Boolean);
  const normExcludes = excludeWords.map(e => norm(e)).filter(Boolean);

  const isExcluded = (h: string) => {
    return normExcludes.some(ex => h.includes(ex));
  };

  // 1. Priority 1: Exact match against candidates (in order of candidate priority)
  for (const c of normCandidates) {
    for (let i = 0; i < headers.length; i++) {
      const h = norm(headers[i]);
      if (!h || isExcluded(h)) continue;
      if (h === c) {
        return i;
      }
    }
  }

  // 2. Priority 2: Header contains candidate as whole word or full substring
  for (const c of normCandidates) {
    for (let i = 0; i < headers.length; i++) {
      const h = norm(headers[i]);
      if (!h || isExcluded(h)) continue;
      if (h.includes(c)) {
        return i;
      }
    }
  }

  // 3. Priority 3: Candidate contains header (for headers >= 4 chars, avoiding 1-2 char false positives)
  for (const c of normCandidates) {
    for (let i = 0; i < headers.length; i++) {
      const h = norm(headers[i]);
      if (!h || isExcluded(h)) continue;
      if (h.length >= 4 && c.includes(h)) {
        return i;
      }
    }
  }

  return -1;
}

/**
 * Fetch and parse Compressor records from Google Sheet
 */
export async function fetchLiveCompressorRecords(
  spreadsheetId: string = COMPRESSOR_SPREADSHEET_ID,
  accessToken: string
): Promise<{ records: CompressorRecord[]; sheetTitle: string; spreadsheetTitle: string }> {
  const info = await getSpreadsheetInfo(spreadsheetId, accessToken);
  if (!info.sheets.length) {
    throw new Error('No sheets found in Compressor spreadsheet.');
  }

  // Find most appropriate sheet (look for "complaint", "compressor", "sheet1", or first tab)
  const chosenSheet = 
    info.sheets.find(s => norm(s.title).includes('compressor') || norm(s.title).includes('complaint')) ||
    info.sheets[0];

  const rawRows = await getSheetValues(spreadsheetId, chosenSheet.title, accessToken);
  if (rawRows.length < 2) {
    return { records: [], sheetTitle: chosenSheet.title, spreadsheetTitle: info.title };
  }

  const headers = rawRows[0];
  const dateIdx = findColIndex(headers, ['date', 'calldate', 'logdate'], ['time', 'stamp', 'hour']);
  const custIdx = findColIndex(headers, ['customer', 'client', 'name']);
  const areaIdx = findColIndex(headers, ['area', 'zone', 'location', 'region'], ['time', 'stamp', 'date', 'num', 'no', 'phone', 'mobile', 'serial', 'id', 'sender']);
  const modelIdx = findColIndex(headers, ['model', 'equipment', 'compressormodel']);
  const serialIdx = findColIndex(headers, ['serial', 'serialnumber', 'srno', 'sn']);
  const problemIdx = findColIndex(
    headers, 
    ['reportedproblem', 'problemreported', 'problem', 'natureofcomplaint', 'issue', 'fault', 'defect', 'complaint'],
    ['time', 'date', 'stamp', 'hour', 'min', 'id', 'num', 'no', 'status']
  );
  const contractIdx = findColIndex(headers, ['contract', 'amc', 'warranty', 'type']);
  const engIdx = findColIndex(headers, ['engineer', 'supportengineer', 'technician', 'assigned']);
  const wamidIdx = findColIndex(headers, ['whatsapp', 'messageid', 'wamid', 'id']);
  const senderIdx = findColIndex(headers, ['sender', 'number', 'phone', 'mobile']);
  const statusIdx = findColIndex(headers, ['status', 'ticketstatus', 'state']);
  const notesIdx = findColIndex(headers, ['notes', 'remark', 'comments', 'resolution']);

  const records: CompressorRecord[] = [];

  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    // Skip completely empty rows
    if (!row || row.every(cell => !cell || !cell.trim())) continue;

    const rawStatus = (statusIdx >= 0 ? row[statusIdx] : '').trim().toLowerCase();
    let status: TicketStatus = 'Open';
    if (rawStatus.includes('close') || rawStatus.includes('resolved') || rawStatus.includes('done')) {
      status = 'Closed';
    } else if (rawStatus.includes('prog') || rawStatus.includes('work') || rawStatus.includes('assign')) {
      status = 'In Progress';
    }

    const rawContract = (contractIdx >= 0 ? row[contractIdx] : '').trim();
    let contract: CompressorRecord['contract'] = 'Comprehensive AMC';
    if (rawContract.toLowerCase().includes('non')) contract = 'Non-Comprehensive AMC';
    else if (rawContract.toLowerCase().includes('warranty')) contract = 'Warranty';
    else if (rawContract.toLowerCase().includes('demand')) contract = 'On-Demand';
    else if (rawContract.toLowerCase().includes('sla')) contract = 'Standard SLA';

    let compProblem = (problemIdx >= 0 ? row[problemIdx] : '')?.trim() || '';
    if (!compProblem || isTimeString(compProblem)) {
      compProblem = 'General Compressor Maintenance';
    }

    const rawArea = (areaIdx >= 0 ? row[areaIdx] : '')?.trim();
    const area = isValidZone(rawArea) ? rawArea : 'General Area';

    records.push({
      id: `CMP-GS-${r + 100}`,
      date: normalizeDateToISO(dateIdx >= 0 ? row[dateIdx] : undefined),
      customerName: (custIdx >= 0 ? row[custIdx] : '')?.trim() || `Customer ${r}`,
      area,
      model: (modelIdx >= 0 ? row[modelIdx] : '')?.trim() || 'Standard Compressor',
      serialNumber: (serialIdx >= 0 ? row[serialIdx] : '')?.trim() || `SN-CMP-${r}`,
      problem: compProblem,
      contract,
      supportEngineer: cleanEngineerName(engIdx >= 0 ? row[engIdx] : '') || 'Unassigned',
      whatsappMessageId: (wamidIdx >= 0 ? row[wamidIdx] : '')?.trim() || `wamid.GS_${r}`,
      senderNumber: (senderIdx >= 0 ? row[senderIdx] : '')?.trim() || '+91 98000 00000',
      status,
      notes: (notesIdx >= 0 ? row[notesIdx] : '')?.trim() || 'Synchronized live from Google Sheets',
      resolutionTimeHours: status === 'Closed' ? (1.2 + (r % 3) * 0.4) : undefined
    });
  }

  return { records, sheetTitle: chosenSheet.title, spreadsheetTitle: info.title };
}

/**
 * Fetch and parse Dispenser records from Google Sheet
 */
export async function fetchLiveDispenserRecords(
  spreadsheetId: string = DISPENSER_SPREADSHEET_ID,
  accessToken: string
): Promise<{ records: DispenserSheetRecord[]; sheetTitle: string; spreadsheetTitle: string }> {
  const info = await getSpreadsheetInfo(spreadsheetId, accessToken);
  if (!info.sheets.length) {
    throw new Error('No sheets found in Dispenser spreadsheet.');
  }

  // Find most appropriate sheet (look for "dispenser", "sheet1", or first tab)
  const chosenSheet = 
    info.sheets.find(s => norm(s.title).includes('dispenser') || norm(s.title).includes('station')) ||
    info.sheets[0];

  const rawRows = await getSheetValues(spreadsheetId, chosenSheet.title, accessToken);
  if (rawRows.length < 2) {
    return { records: [], sheetTitle: chosenSheet.title, spreadsheetTitle: info.title };
  }

  const headers = rawRows[0];
  const dateIdx = findColIndex(headers, ['date', 'calldate', 'logdate'], ['time', 'stamp', 'hour']);
  const stationIdx = findColIndex(headers, ['stationname', 'station', 'retailoutlet', 'outlet', 'location', 'site']);
  const serialIdx = findColIndex(headers, ['dispenserserial', 'serialnumber', 'serialno', 'serial', 'srno', 'sn']);
  const serviceTypeIdx = findColIndex(headers, ['typeofservice', 'servicetype', 'calltype', 'service', 'category']);
  const compTimeIdx = findColIndex(headers, ['complainttime', 'calltime', 'logtime', 'time']);
  const reachTimeIdx = findColIndex(headers, ['reachtime', 'arrivaltime', 'arrival', 'responsetime']);
  const closeTimeIdx = findColIndex(headers, ['closetime', 'resolutiontime', 'completedtime', 'endtime']);
  const zoneIdx = findColIndex(headers, ['zonename', 'zone', 'area', 'region'], ['time', 'stamp', 'date', 'num', 'no', 'phone', 'mobile', 'serial', 'id', 'sender']);
  const engIdx = findColIndex(headers, ['serviceengineer', 'engineername', 'engineer', 'technician', 'assigned']);
  
  // Specific search for Problem, strictly excluding time, date, numbers, and metadata
  const problemIdx = findColIndex(
    headers,
    [
      'reportedproblem',
      'problemreported',
      'natureofcomplaint',
      'problemdescription',
      'faultdescription',
      'complaintdescription',
      'complaintdetails',
      'breakdowndetail',
      'issue',
      'problem',
      'fault',
      'defect',
      'breakdown',
      'remarks',
      'observation',
      'complaint'
    ],
    ['time', 'date', 'stamp', 'hour', 'min', 'reach', 'close', 'arrival', 'slot', 'id', 'num', 'no', 'code', 'status', 'type', 'service', 'engineer', 'name', 'station', 'serial']
  );
  const wamidIdx = findColIndex(headers, ['whatsapp', 'messageid', 'wamid', 'id']);
  const senderIdx = findColIndex(headers, ['sender', 'number', 'phone', 'mobile']);
  const statusIdx = findColIndex(headers, ['status', 'ticketstatus', 'state']);

  const records: DispenserSheetRecord[] = [];

  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.every(cell => !cell || !cell.trim())) continue;

    const rawCloseTime = (closeTimeIdx >= 0 ? row[closeTimeIdx] : '').trim();
    const rawStatus = (statusIdx >= 0 ? row[statusIdx] : '').trim().toLowerCase();

    let status: TicketStatus = 'In Progress';
    if (rawStatus.includes('close') || rawStatus.includes('resolved') || (rawCloseTime && rawCloseTime !== '-')) {
      status = 'Closed';
    } else if (rawStatus.includes('open') || !rawCloseTime) {
      status = 'Open';
    }

    const rawServiceType = (serviceTypeIdx >= 0 ? row[serviceTypeIdx] : '').trim();
    let typeOfService: DispenserSheetRecord['typeOfService'] = 'Breakdown';
    if (rawServiceType.toLowerCase().includes('prevent')) typeOfService = 'Preventive Maintenance';
    else if (rawServiceType.toLowerCase().includes('calib')) typeOfService = 'Calibration';
    else if (rawServiceType.toLowerCase().includes('inspect')) typeOfService = 'Inspection';
    else if (rawServiceType.toLowerCase().includes('emerg')) typeOfService = 'Emergency Callout';

    // Extract problem, ensuring it NEVER contains or defaults to a time string
    let problemVal = (problemIdx >= 0 ? row[problemIdx] : '')?.trim() || '';

    // If the detected value is a clock time (e.g., "08:45 AM", "14:30") or empty:
    if (!problemVal || isTimeString(problemVal)) {
      // Search the row for any other cell that contains a real text description
      let alternativeText = '';
      for (let c = 0; c < row.length; c++) {
        if (
          c === dateIdx || 
          c === stationIdx || 
          c === serialIdx || 
          c === serviceTypeIdx || 
          c === compTimeIdx || 
          c === reachTimeIdx || 
          c === closeTimeIdx || 
          c === zoneIdx || 
          c === engIdx || 
          c === wamidIdx || 
          c === senderIdx || 
          c === statusIdx
        ) {
          continue;
        }
        const cell = (row[c] || '').trim();
        if (cell && !isTimeString(cell) && cell.length > 2 && !/^\+?\d[\d\s\-]{6,}$/.test(cell) && !/^\d{4}-\d{2}-\d{2}$/.test(cell)) {
          alternativeText = cell;
          break;
        }
      }

      if (alternativeText) {
        problemVal = alternativeText;
      } else {
        // Fallback to equipment-appropriate service type description, NEVER a time string
        problemVal = typeOfService === 'Breakdown'
          ? 'Dispenser Breakdown'
          : typeOfService === 'Preventive Maintenance'
            ? 'Preventive Maintenance Inspection'
            : typeOfService === 'Calibration'
              ? 'Flow Meter Calibration Check'
              : typeOfService === 'Emergency Callout'
                ? 'Emergency Dispenser Service'
                : 'Dispenser Component Check';
      }
    }

    const rawZone = (zoneIdx >= 0 ? row[zoneIdx] : '')?.trim();
    const zoneName = isValidZone(rawZone) ? rawZone : 'North Zone';

    records.push({
      id: `DSP-GS-${r + 200}`,
      date: normalizeDateToISO(dateIdx >= 0 ? row[dateIdx] : undefined),
      stationName: (stationIdx >= 0 ? row[stationIdx] : '')?.trim() || `Station Outlet ${r}`,
      dispenserSerialNo: (serialIdx >= 0 ? row[serialIdx] : '')?.trim() || `SN-DSP-${r}`,
      typeOfService,
      complaintTime: (compTimeIdx >= 0 ? row[compTimeIdx] : '')?.trim() || '09:00 AM',
      reachTime: (reachTimeIdx >= 0 ? row[reachTimeIdx] : '')?.trim() || '09:40 AM',
      closeTime: rawCloseTime || (status === 'Closed' ? '11:30 AM' : '-'),
      zoneName,
      serviceEngineerName: cleanEngineerName(engIdx >= 0 ? row[engIdx] : '') || 'Service Lead',
      problem: problemVal,
      whatsappMessageId: (wamidIdx >= 0 ? row[wamidIdx] : '')?.trim() || `wamid.DSP_GS_${r}`,
      senderNumber: (senderIdx >= 0 ? row[senderIdx] : '')?.trim() || '+91 98000 00000',
      status,
      responseTimeMinutes: 35 + (r % 25),
      resolutionTimeHours: status === 'Closed' ? (1.5 + (r % 3) * 0.5) : undefined
    });
  }

  return { records, sheetTitle: chosenSheet.title, spreadsheetTitle: info.title };
}
