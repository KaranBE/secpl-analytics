export type TicketStatus = 'Open' | 'In Progress' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type EquipmentType = 'All' | 'Compressor' | 'Dispenser';
export type ViewMode = 'both' | 'graphical' | 'tabular';

export type DatePreset = 'all' | 'today' | 'this_week' | 'this_month' | 'this_quarter' | 'this_year' | 'custom';

// Sheet 1: Compressor Data Columns
// Date, Customer Name, Area, Model, Serial Number, Problem, Call Priority, Contract, Support Engineer, WhatsApp Message ID, Sender Number
export interface CompressorRecord {
  id: string;
  date: string; // YYYY-MM-DD
  customerName: string;
  area: string; // Area / Zone
  model: string;
  serialNumber: string;
  problem: string;
  callPriority: TicketPriority;
  contract: 'Comprehensive AMC' | 'Non-Comprehensive AMC' | 'Warranty' | 'Standard SLA' | 'On-Demand';
  supportEngineer: string;
  whatsappMessageId: string;
  senderNumber: string;
  status: TicketStatus;
  resolutionTimeHours?: number;
  notes?: string;
}

// Sheet 2: Dispenser Data Columns
// Date, Station Name, Dispenser Serial No, Type of Service, Complaint Time, Reach Time, Close Time, Zone Name, Service Engineer Name, Problem, WhatsApp Message ID, Sender Number
export interface DispenserSheetRecord {
  id: string;
  date: string; // YYYY-MM-DD
  stationName: string;
  dispenserSerialNo: string;
  typeOfService: 'Breakdown' | 'Preventive Maintenance' | 'Calibration' | 'Inspection' | 'Emergency Callout';
  complaintTime: string;
  reachTime: string;
  closeTime: string; // e.g. "16:45" or "-" if still open
  zoneName: string;
  serviceEngineerName: string;
  problem: string;
  whatsappMessageId: string;
  senderNumber: string;
  status: TicketStatus;
  responseTimeMinutes?: number;
  resolutionTimeHours?: number;
}

// Unified Service Incident
export interface UnifiedIncidentRecord {
  id: string;
  equipmentType: 'Compressor' | 'Dispenser';
  date: string;
  entityName: string; // Customer Name (Compressor) or Station Name (Dispenser)
  zoneOrArea: string;
  assetIdentifier: string; // Model/Serial No
  problem: string;
  priority: TicketPriority;
  engineer: string;
  status: TicketStatus;
  whatsappMessageId: string;
  senderNumber: string;
  contractOrServiceType: string;
  responseTimeMinutes?: number;
  resolutionTimeHours?: number;
  notes?: string;
}

export interface DashboardFilters {
  datePreset: DatePreset;
  startDate: string;
  endDate: string;
  zones: string[]; // multi-select
  engineers: string[]; // multi-select
  status: 'All' | 'Open' | 'Closed';
  equipmentType: EquipmentType;
  viewMode: ViewMode;
  searchQuery: string;
}

export interface CustomerMetric {
  customerName: string;
  area: string;
  totalCalls: number;
  openCalls: number;
  closedCalls: number;
  contract: string;
  activeModels: string[];
  serialNumbers: string[];
  topProblems: { problem: string; count: number }[];
  primaryEngineer: string;
  avgResolutionHours: number;
  criticalCount: number;
}

export interface EngineerMetric {
  name: string;
  zone: string;
  phone: string;
  totalAssigned: number;
  totalClosed: number;
  openTickets: number;
  avgResolutionHours: number;
  avgResponseMinutes: number;
  rating: number;
  repeatComplaintsCount: number;
  compressorCalls: number;
  dispenserCalls: number;
  slaAdherenceRate: number;
}

export interface ZoneMetric {
  zone: string;
  totalComplaints: number;
  resolvedComplaints: number;
  openComplaints: number;
  slaPercentage: number;
  activeAssets: number;
  avgResolutionHours: number;
  avgResponseMinutes: number;
  leadEngineer: string;
  topProblem: string;
}

// Backward compatibility types
export interface ComplaintRecord {
  id: string;
  ticketNumber: string;
  timestamp: string;
  customerName: string;
  customerPhone: string;
  zone: string;
  location: string;
  issueCategory: string;
  dispenserId: string;
  assignedEngineer: string;
  priority: TicketPriority;
  status: TicketStatus;
  resolutionTimeHours?: number;
  closedAt?: string;
  notes: string;
  source: string;
}

export interface DispenserRecord {
  id: string;
  dispenserCode: string;
  model: string;
  clientName: string;
  zone: string;
  floorLocation: string;
  installDate: string;
  lastServiceDate: string;
  nextDueDate: string;
  filterHealthPct: number;
  uvLampStatus: string;
  assignedEngineer: string;
  status: string;
  totalServicesCount: number;
}

export interface RawLogRecord {
  id: string;
  timestamp: string;
  sender: string;
  rawText: string;
  status: string;
  parsedFields?: Record<string, string>;
}

export interface ErrorLogRecord {
  id: string;
  timestamp: string;
  sender: string;
  rawPayload: string;
  errorCode: string;
  errorMessage: string;
  suggestedCorrection: string;
}

export interface TriggerReportHistory {
  id: string;
  timestamp: string;
  reportType: string;
  recipientCount: number;
  status: string;
}

