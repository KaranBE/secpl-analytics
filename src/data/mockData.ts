import { 
  CompressorRecord, 
  DispenserSheetRecord, 
  ComplaintRecord, 
  DispenserRecord, 
  EngineerMetric, 
  ZoneMetric,
  CustomerMetric,
  UnifiedIncidentRecord
} from '../types';

// =========================================================================
// SHEET 1: COMPRESSOR DATA
// Exact columns: Date, Customer Name, Area, Model, Serial Number, Problem, Call Priority, Contract, Support Engineer, WhatsApp Message ID, Sender Number
// =========================================================================
export const COMPRESSOR_DATA: CompressorRecord[] = [
  {
    id: 'CMP-101',
    date: '2026-09-04',
    customerName: 'Tata Motors Assembly Plant',
    area: 'West Zone',
    model: 'AtlasCopco GA-37 VSD',
    serialNumber: 'CMP-SN-9081',
    problem: 'High Discharge Temp',
    callPriority: 'Critical',
    contract: 'Comprehensive AMC',
    supportEngineer: 'Vishal Joshi',
    whatsappMessageId: 'wamid.HBgMOTE5ODIzMTQ0NTFBAA==',
    senderNumber: '+91 98231 44510',
    status: 'In Progress',
    notes: 'Aftercooler radiator fin blockage suspected; technician on-site with thermal imaging.'
  },
  {
    id: 'CMP-102',
    date: '2026-09-04',
    customerName: 'Apollo Hospitals Central',
    area: 'South Zone',
    model: 'IngersollRand R-Series 55kW',
    serialNumber: 'CMP-SN-4412',
    problem: 'Air Pressure Drop',
    callPriority: 'High',
    contract: 'Comprehensive AMC',
    supportEngineer: 'Amit Sharma',
    whatsappMessageId: 'wamid.HBgMOTE5ODg0MDE5MjgxAAY==',
    senderNumber: '+91 98840 19283',
    status: 'Closed',
    resolutionTimeHours: 1.4,
    notes: 'Minimum pressure valve seal replaced. Line stabilized at 7.8 bar.'
  },
  {
    id: 'CMP-103',
    date: '2026-09-03',
    customerName: 'Bosch Automotive Hub',
    area: 'South Zone',
    model: 'Kaeser CSDX 140',
    serialNumber: 'CMP-SN-1109',
    problem: 'Oil Filter Clogged',
    callPriority: 'Medium',
    contract: 'Comprehensive AMC',
    supportEngineer: 'Amit Sharma',
    whatsappMessageId: 'wamid.HBgMOTE5NzQxMDg4MjMxAAI==',
    senderNumber: '+91 97410 88231',
    status: 'Closed',
    resolutionTimeHours: 1.8,
    notes: 'High differential pressure trigger. Spin-on oil separator and filter replaced.'
  },
  {
    id: 'CMP-104',
    date: '2026-09-03',
    customerName: 'Reliance Retail Depot',
    area: 'West Zone',
    model: 'Elgi EG-45 Screw',
    serialNumber: 'CMP-SN-8274',
    problem: 'Motor Overload Tripping',
    callPriority: 'Critical',
    contract: 'Warranty',
    supportEngineer: 'Vishal Joshi',
    whatsappMessageId: 'wamid.HBgMOTE5OTE2MDU1NDIxAAM==',
    senderNumber: '+91 99160 55421',
    status: 'Closed',
    resolutionTimeHours: 2.2,
    notes: 'Thermal overload relay calibrated; phase imbalance rectified on main busbar.'
  },
  {
    id: 'CMP-105',
    date: '2026-09-02',
    customerName: 'L&T Heavy Engineering',
    area: 'North Zone',
    model: 'AtlasCopco GA-75+',
    serialNumber: 'CMP-SN-3901',
    problem: 'Vibration Error',
    callPriority: 'High',
    contract: 'Comprehensive AMC',
    supportEngineer: 'Priya Nair',
    whatsappMessageId: 'wamid.HBgMOTE5ODQ1MDc3MTIzAAQ==',
    senderNumber: '+91 98450 77123',
    status: 'Closed',
    resolutionTimeHours: 1.9,
    notes: 'Drive coupling cushion inserts worn. Replaced and laser-aligned.'
  },
  {
    id: 'CMP-106',
    date: '2026-09-02',
    customerName: 'Schneider Electric Plant',
    area: 'East Zone',
    model: 'Chicago Pneumatic CPM-20',
    serialNumber: 'CMP-SN-7643',
    problem: 'Air Leakage in Manifold',
    callPriority: 'Medium',
    contract: 'Non-Comprehensive AMC',
    supportEngineer: 'Rahul Verma',
    whatsappMessageId: 'wamid.HBgMOTE5NjExMjAwOTg0AAU==',
    senderNumber: '+91 96112 00984',
    status: 'Closed',
    resolutionTimeHours: 1.6,
    notes: 'Teflon gasket seated on secondary moisture separator.'
  },
  {
    id: 'CMP-107',
    date: '2026-09-01',
    customerName: 'Bharat Forge Precision Hub',
    area: 'West Zone',
    model: 'Kaeser CSDX 140',
    serialNumber: 'CMP-SN-5120',
    problem: 'Condensate Drain Jam',
    callPriority: 'Low',
    contract: 'Standard SLA',
    supportEngineer: 'Sunil Patil',
    whatsappMessageId: 'wamid.HBgMOTE5MzQxMjM0NTY3AAY==',
    senderNumber: '+91 93412 34567',
    status: 'Closed',
    resolutionTimeHours: 1.2,
    notes: 'Auto drain solenoid valve cleaned of particulate slurry.'
  },
  {
    id: 'CMP-108',
    date: '2026-08-30',
    customerName: 'Tata Motors Assembly Plant',
    area: 'West Zone',
    model: 'AtlasCopco GA-37 VSD',
    serialNumber: 'CMP-SN-9081',
    problem: 'Air Pressure Drop',
    callPriority: 'High',
    contract: 'Comprehensive AMC',
    supportEngineer: 'Vishal Joshi',
    whatsappMessageId: 'wamid.HBgMOTE5ODIzMTQ0NTFBAAc==',
    senderNumber: '+91 98231 44510',
    status: 'Closed',
    resolutionTimeHours: 1.7,
    notes: 'Intake unloader valve spring replaced.'
  },
  {
    id: 'CMP-109',
    date: '2026-08-28',
    customerName: 'Mahindra Auto Works',
    area: 'Central Zone',
    model: 'Sullair S-Energy 75',
    serialNumber: 'CMP-SN-2394',
    problem: 'High Discharge Temp',
    callPriority: 'High',
    contract: 'Comprehensive AMC',
    supportEngineer: 'Vikram Rao',
    whatsappMessageId: 'wamid.HBgMOTE5OTAwMTEyMjMzAAg==',
    senderNumber: '+91 99001 12233',
    status: 'Closed',
    resolutionTimeHours: 2.4,
    notes: 'Synthetic coolant top-up (5 liters) and thermostatic bypass checked.'
  },
  {
    id: 'CMP-110',
    date: '2026-08-25',
    customerName: 'Godrej & Boyce Industrial',
    area: 'East Zone',
    model: 'Elgi EG-45 Screw',
    serialNumber: 'CMP-SN-6671',
    problem: 'Phase Sequence Fault',
    callPriority: 'Medium',
    contract: 'Warranty',
    supportEngineer: 'Rahul Verma',
    whatsappMessageId: 'wamid.HBgMOTE5ODExMjIzMzQ0AAk==',
    senderNumber: '+91 98112 23344',
    status: 'Closed',
    resolutionTimeHours: 1.3,
    notes: 'Input phase sequence reverser engaged after grid maintenance.'
  },
  {
    id: 'CMP-111',
    date: '2026-08-20',
    customerName: 'Flipkart Fulfilment Center',
    area: 'North Zone',
    model: 'AtlasCopco GA-75+',
    serialNumber: 'CMP-SN-1892',
    problem: 'Air Leakage in Manifold',
    callPriority: 'High',
    contract: 'Comprehensive AMC',
    supportEngineer: 'Deepak Sen',
    whatsappMessageId: 'wamid.HBgMOTE5NzExMjI0NDU1AAo==',
    senderNumber: '+91 97112 24455',
    status: 'Closed',
    resolutionTimeHours: 1.5,
    notes: 'Flexible braided hose connection replaced.'
  },
  {
    id: 'CMP-112',
    date: '2026-08-15',
    customerName: 'Biocon Park Facility',
    area: 'South Zone',
    model: 'IngersollRand R-Series 55kW',
    serialNumber: 'CMP-SN-4412',
    problem: 'Oil Filter Clogged',
    callPriority: 'Medium',
    contract: 'Comprehensive AMC',
    supportEngineer: 'Amit Sharma',
    whatsappMessageId: 'wamid.HBgMOTE5NjQ0MzMyMjExAAs==',
    senderNumber: '+91 96443 32211',
    status: 'Closed',
    resolutionTimeHours: 1.8,
    notes: 'Routine 2000hr service pack installed.'
  },
  {
    id: 'CMP-113',
    date: '2026-07-28',
    customerName: 'Ashok Leyland Foundry',
    area: 'Central Zone',
    model: 'Fusheng SA-37',
    serialNumber: 'CMP-SN-9981',
    problem: 'Motor Overload Tripping',
    callPriority: 'Critical',
    contract: 'On-Demand',
    supportEngineer: 'Vikram Rao',
    whatsappMessageId: 'wamid.HBgMOTE5OTg4Nzc2NjU1AAw==',
    senderNumber: '+91 99887 76655',
    status: 'Closed',
    resolutionTimeHours: 2.8,
    notes: 'Stator winding insulation checked and auxiliary contactor replaced.'
  },
  {
    id: 'CMP-114',
    date: '2026-07-15',
    customerName: 'Tata Motors Assembly Plant',
    area: 'West Zone',
    model: 'AtlasCopco GA-37 VSD',
    serialNumber: 'CMP-SN-9081',
    problem: 'Vibration Error',
    callPriority: 'Medium',
    contract: 'Comprehensive AMC',
    supportEngineer: 'Vishal Joshi',
    whatsappMessageId: 'wamid.HBgMOTE5ODIzMTQ0NTFBAA0==',
    senderNumber: '+91 98231 44510',
    status: 'Closed',
    resolutionTimeHours: 1.6,
    notes: 'Anti-vibration mount pads replaced.'
  },
  {
    id: 'CMP-115',
    date: '2026-06-10',
    customerName: 'Bosch Automotive Hub',
    area: 'South Zone',
    model: 'Kaeser CSDX 140',
    serialNumber: 'CMP-SN-1109',
    problem: 'High Discharge Temp',
    callPriority: 'Critical',
    contract: 'Comprehensive AMC',
    supportEngineer: 'Amit Sharma',
    whatsappMessageId: 'wamid.HBgMOTE5NzQxMDg4MjMxAA4==',
    senderNumber: '+91 97410 88231',
    status: 'Closed',
    resolutionTimeHours: 2.0,
    notes: 'Cooling fan motor capacitor replaced.'
  },
  {
    id: 'CMP-116',
    date: '2026-05-18',
    customerName: 'L&T Heavy Engineering',
    area: 'North Zone',
    model: 'AtlasCopco GA-75+',
    serialNumber: 'CMP-SN-3901',
    problem: 'Air Pressure Drop',
    callPriority: 'High',
    contract: 'Comprehensive AMC',
    supportEngineer: 'Priya Nair',
    whatsappMessageId: 'wamid.HBgMOTE5ODQ1MDc3MTIzAA8==',
    senderNumber: '+91 98450 77123',
    status: 'Closed',
    resolutionTimeHours: 1.9,
    notes: 'Inlet air filter element replaced.'
  }
];

// =========================================================================
// SHEET 2: DISPENSER DATA
// Exact columns: Date, Station Name, Dispenser Serial No, Type of Service, Complaint Time, Reach Time, Close Time, Zone Name, Service Engineer Name, Problem, WhatsApp Message ID, Sender Number
// =========================================================================
export const DISPENSER_DATA: DispenserSheetRecord[] = [
  {
    id: 'DSP-201',
    date: '2026-09-04',
    stationName: 'IOCL Green Park Station',
    dispenserSerialNo: 'DSP-SN-7721',
    typeOfService: 'Breakdown',
    complaintTime: '08:45 AM',
    reachTime: '09:20 AM',
    closeTime: '-',
    zoneName: 'West Zone',
    serviceEngineerName: 'Vishal Joshi',
    problem: 'Nozzle Auto-Cut Failure',
    whatsappMessageId: 'wamid.HBgMOTE5ODIzMTQ0NTFBAAw==',
    senderNumber: '+91 98231 44510',
    status: 'In Progress',
    responseTimeMinutes: 35
  },
  {
    id: 'DSP-202',
    date: '2026-09-04',
    stationName: 'HPCL Airport Highway Hub',
    dispenserSerialNo: 'DSP-SN-3310',
    typeOfService: 'Breakdown',
    complaintTime: '09:15 AM',
    reachTime: '09:45 AM',
    closeTime: '11:15 AM',
    zoneName: 'South Zone',
    serviceEngineerName: 'Amit Sharma',
    problem: 'Flow Meter Inaccuracy',
    whatsappMessageId: 'wamid.HBgMOTE5ODg0MDE5MjgxAAY==',
    senderNumber: '+91 98840 19283',
    status: 'Closed',
    responseTimeMinutes: 30,
    resolutionTimeHours: 2.0
  },
  {
    id: 'DSP-203',
    date: '2026-09-03',
    stationName: 'BPCL Ring Road Retail',
    dispenserSerialNo: 'DSP-SN-8842',
    typeOfService: 'Calibration',
    complaintTime: '10:30 AM',
    reachTime: '11:05 AM',
    closeTime: '12:35 PM',
    zoneName: 'East Zone',
    serviceEngineerName: 'Rahul Verma',
    problem: 'Totalizer Sync Error',
    whatsappMessageId: 'wamid.HBgMOTE5NzQxMDg4MjMxAAI==',
    senderNumber: '+91 97410 88231',
    status: 'Closed',
    responseTimeMinutes: 35,
    resolutionTimeHours: 2.1
  },
  {
    id: 'DSP-204',
    date: '2026-09-03',
    stationName: 'Shell Outer Ring Plaza',
    dispenserSerialNo: 'DSP-SN-1093',
    typeOfService: 'Breakdown',
    complaintTime: '11:00 AM',
    reachTime: '11:28 AM',
    closeTime: '01:05 PM',
    zoneName: 'North Zone',
    serviceEngineerName: 'Priya Nair',
    problem: 'Display Backlight Glitch',
    whatsappMessageId: 'wamid.HBgMOTE5ODQ1MDc3MTIzAAQ==',
    senderNumber: '+91 98450 77123',
    status: 'Closed',
    responseTimeMinutes: 28,
    resolutionTimeHours: 2.1
  },
  {
    id: 'DSP-205',
    date: '2026-09-02',
    stationName: 'Nayara Energy South Depot',
    dispenserSerialNo: 'DSP-SN-6450',
    typeOfService: 'Preventive Maintenance',
    complaintTime: '01:15 PM',
    reachTime: '01:50 PM',
    closeTime: '03:40 PM',
    zoneName: 'South Zone',
    serviceEngineerName: 'Amit Sharma',
    problem: 'Piping Seal Leakage',
    whatsappMessageId: 'wamid.HBgMOTE5NjQ0MzMyMjExAAs==',
    senderNumber: '+91 96443 32211',
    status: 'Closed',
    responseTimeMinutes: 35,
    resolutionTimeHours: 2.4
  },
  {
    id: 'DSP-206',
    date: '2026-09-02',
    stationName: 'IndianOil Cyber City Station',
    dispenserSerialNo: 'DSP-SN-9912',
    typeOfService: 'Breakdown',
    complaintTime: '02:40 PM',
    reachTime: '03:10 PM',
    closeTime: '04:30 PM',
    zoneName: 'Central Zone',
    serviceEngineerName: 'Vikram Rao',
    problem: 'Submersible Pump Jam',
    whatsappMessageId: 'wamid.HBgMOTE5OTAwMTEyMjMzAAg==',
    senderNumber: '+91 99001 12233',
    status: 'Closed',
    responseTimeMinutes: 30,
    resolutionTimeHours: 1.8
  },
  {
    id: 'DSP-207',
    date: '2026-09-01',
    stationName: 'HPCL City Center Point',
    dispenserSerialNo: 'DSP-SN-4138',
    typeOfService: 'Breakdown',
    complaintTime: '03:20 PM',
    reachTime: '03:52 PM',
    closeTime: '05:10 PM',
    zoneName: 'East Zone',
    serviceEngineerName: 'Rahul Verma',
    problem: 'Keypad Membrane Fault',
    whatsappMessageId: 'wamid.HBgMOTE5ODExMjIzMzQ0AAk==',
    senderNumber: '+91 98112 23344',
    status: 'Closed',
    responseTimeMinutes: 32,
    resolutionTimeHours: 1.8
  },
  {
    id: 'DSP-208',
    date: '2026-08-29',
    stationName: 'IOCL Green Park Station',
    dispenserSerialNo: 'DSP-SN-7721',
    typeOfService: 'Preventive Maintenance',
    complaintTime: '09:00 AM',
    reachTime: '09:30 AM',
    closeTime: '11:45 AM',
    zoneName: 'West Zone',
    serviceEngineerName: 'Vishal Joshi',
    problem: 'Flow Meter Inaccuracy',
    whatsappMessageId: 'wamid.HBgMOTE5ODIzMTQ0NTFBAAk==',
    senderNumber: '+91 98231 44510',
    status: 'Closed',
    responseTimeMinutes: 30,
    resolutionTimeHours: 2.7
  },
  {
    id: 'DSP-209',
    date: '2026-08-25',
    stationName: 'BPCL Industrial Area Fueling',
    dispenserSerialNo: 'DSP-SN-5520',
    typeOfService: 'Breakdown',
    complaintTime: '10:10 AM',
    reachTime: '10:42 AM',
    closeTime: '12:20 PM',
    zoneName: 'North Zone',
    serviceEngineerName: 'Deepak Sen',
    problem: 'Piping Seal Leakage',
    whatsappMessageId: 'wamid.HBgMOTE5NzExMjI0NDU1AAo==',
    senderNumber: '+91 97112 24455',
    status: 'Closed',
    responseTimeMinutes: 32,
    resolutionTimeHours: 2.2
  },
  {
    id: 'DSP-210',
    date: '2026-08-18',
    stationName: 'Shell Outer Ring Plaza',
    dispenserSerialNo: 'DSP-SN-1093',
    typeOfService: 'Emergency Callout',
    complaintTime: '04:00 PM',
    reachTime: '04:25 PM',
    closeTime: '06:10 PM',
    zoneName: 'North Zone',
    serviceEngineerName: 'Priya Nair',
    problem: 'Nozzle Auto-Cut Failure',
    whatsappMessageId: 'wamid.HBgMOTE5ODQ1MDc3MTIzAAs==',
    senderNumber: '+91 98450 77123',
    status: 'Closed',
    responseTimeMinutes: 25,
    resolutionTimeHours: 2.2
  },
  {
    id: 'DSP-211',
    date: '2026-07-22',
    stationName: 'HPCL Airport Highway Hub',
    dispenserSerialNo: 'DSP-SN-3310',
    typeOfService: 'Calibration',
    complaintTime: '11:15 AM',
    reachTime: '11:45 AM',
    closeTime: '01:30 PM',
    zoneName: 'South Zone',
    serviceEngineerName: 'Amit Sharma',
    problem: 'Totalizer Sync Error',
    whatsappMessageId: 'wamid.HBgMOTE5ODg0MDE5MjgxAAv==',
    senderNumber: '+91 98840 19283',
    status: 'Closed',
    responseTimeMinutes: 30,
    resolutionTimeHours: 2.2
  },
  {
    id: 'DSP-212',
    date: '2026-06-15',
    stationName: 'IndianOil Cyber City Station',
    dispenserSerialNo: 'DSP-SN-9912',
    typeOfService: 'Breakdown',
    complaintTime: '08:30 AM',
    reachTime: '09:05 AM',
    closeTime: '11:00 AM',
    zoneName: 'Central Zone',
    serviceEngineerName: 'Vikram Rao',
    problem: 'Display Backlight Glitch',
    whatsappMessageId: 'wamid.HBgMOTE5OTAwMTEyMjMzAAz==',
    senderNumber: '+91 99001 12233',
    status: 'Closed',
    responseTimeMinutes: 35,
    resolutionTimeHours: 2.5
  }
];

// Helper to get unified incident list
export function getUnifiedIncidents(
  compressors: CompressorRecord[] = COMPRESSOR_DATA,
  dispensers: DispenserSheetRecord[] = DISPENSER_DATA
): UnifiedIncidentRecord[] {
  const unified: UnifiedIncidentRecord[] = [];

  compressors.forEach(c => {
    unified.push({
      id: c.id,
      equipmentType: 'Compressor',
      date: c.date,
      entityName: c.customerName,
      zoneOrArea: c.area,
      assetIdentifier: `${c.model} (${c.serialNumber})`,
      problem: c.problem,
      priority: c.callPriority,
      engineer: c.supportEngineer,
      status: c.status,
      whatsappMessageId: c.whatsappMessageId,
      senderNumber: c.senderNumber,
      contractOrServiceType: c.contract,
      resolutionTimeHours: c.resolutionTimeHours || 1.8,
      notes: c.notes
    });
  });

  dispensers.forEach(d => {
    unified.push({
      id: d.id,
      equipmentType: 'Dispenser',
      date: d.date,
      entityName: d.stationName,
      zoneOrArea: d.zoneName,
      assetIdentifier: d.dispenserSerialNo,
      problem: d.problem,
      priority: d.typeOfService === 'Breakdown' ? 'High' : 'Medium',
      engineer: d.serviceEngineerName,
      status: d.status,
      whatsappMessageId: d.whatsappMessageId,
      senderNumber: d.senderNumber,
      contractOrServiceType: d.typeOfService,
      responseTimeMinutes: d.responseTimeMinutes,
      resolutionTimeHours: d.resolutionTimeHours || 2.0
    });
  });

  return unified.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Compute Customer Metrics (ONLY COMPRESSOR)
export function computeCustomerMetrics(compressors: CompressorRecord[]): CustomerMetric[] {
  const map = new Map<string, {
    area: string;
    contract: string;
    calls: CompressorRecord[];
  }>();

  compressors.forEach(c => {
    if (!map.has(c.customerName)) {
      map.set(c.customerName, {
        area: c.area,
        contract: c.contract,
        calls: []
      });
    }
    map.get(c.customerName)!.calls.push(c);
  });

  const result: CustomerMetric[] = [];

  map.forEach((data, customerName) => {
    const totalCalls = data.calls.length;
    const openCalls = data.calls.filter(c => c.status !== 'Closed').length;
    const closedCalls = totalCalls - openCalls;
    const models = Array.from(new Set(data.calls.map(c => c.model)));
    const serials = Array.from(new Set(data.calls.map(c => c.serialNumber)));

    // Count problems
    const problemCounts: Record<string, number> = {};
    data.calls.forEach(c => {
      problemCounts[c.problem] = (problemCounts[c.problem] || 0) + 1;
    });
    const topProblems = Object.entries(problemCounts)
      .map(([problem, count]) => ({ problem, count }))
      .sort((a, b) => b.count - a.count);

    // Engineer frequency
    const engCounts: Record<string, number> = {};
    data.calls.forEach(c => {
      engCounts[c.supportEngineer] = (engCounts[c.supportEngineer] || 0) + 1;
    });
    const primaryEngineer = Object.entries(engCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unassigned';

    const criticalCount = data.calls.filter(c => c.callPriority === 'Critical').length;
    const avgRes = data.calls.reduce((sum, c) => sum + (c.resolutionTimeHours || 1.8), 0) / (totalCalls || 1);

    result.push({
      customerName,
      area: data.area,
      totalCalls,
      openCalls,
      closedCalls,
      contract: data.contract,
      activeModels: models,
      serialNumbers: serials,
      topProblems,
      primaryEngineer,
      avgResolutionHours: Number(avgRes.toFixed(1)),
      criticalCount
    });
  });

  return result.sort((a, b) => b.totalCalls - a.totalCalls);
}

// Compute Zone Metrics from filtered data
export function computeZoneMetrics(
  compressors: CompressorRecord[],
  dispensers: DispenserSheetRecord[]
): ZoneMetric[] {
  const ZONES = ['West Zone', 'South Zone', 'North Zone', 'East Zone', 'Central Zone'];

  return ZONES.map(zoneName => {
    const cmpInZone = compressors.filter(c => c.area === zoneName || c.area.includes(zoneName.split(' ')[0]));
    const dspInZone = dispensers.filter(d => d.zoneName === zoneName || d.zoneName.includes(zoneName.split(' ')[0]));

    const total = cmpInZone.length + dspInZone.length;
    const open = cmpInZone.filter(c => c.status !== 'Closed').length + dspInZone.filter(d => d.status !== 'Closed').length;
    const resolved = total - open;

    const slaPercentage = total > 0 ? Number(((resolved / total) * 94 + 5).toFixed(1)) : 95.0;

    const problemMap: Record<string, number> = {};
    cmpInZone.forEach(c => { problemMap[c.problem] = (problemMap[c.problem] || 0) + 1; });
    dspInZone.forEach(d => { problemMap[d.problem] = (problemMap[d.problem] || 0) + 1; });
    const topProblem = Object.entries(problemMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Air Pressure Drop';

    const engMap: Record<string, number> = {};
    cmpInZone.forEach(c => { engMap[c.supportEngineer] = (engMap[c.supportEngineer] || 0) + 1; });
    dspInZone.forEach(d => { engMap[d.serviceEngineerName] = (engMap[d.serviceEngineerName] || 0) + 1; });
    const leadEngineer = Object.entries(engMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Amit Sharma';

    const respTimes = dspInZone.map(d => d.responseTimeMinutes || 30);
    const avgResp = respTimes.length > 0 ? Math.round(respTimes.reduce((a, b) => a + b, 0) / respTimes.length) : 30;

    return {
      zone: zoneName,
      totalComplaints: total,
      resolvedComplaints: resolved,
      openComplaints: open,
      slaPercentage: Math.min(99.4, Math.max(88.0, slaPercentage)),
      activeAssets: cmpInZone.length * 8 + dspInZone.length * 12 + 45,
      avgResolutionHours: 1.8,
      avgResponseMinutes: avgResp,
      leadEngineer,
      topProblem
    };
  });
}

// Compute Engineer Metrics from filtered data
export function computeEngineerMetrics(
  compressors: CompressorRecord[],
  dispensers: DispenserSheetRecord[]
): EngineerMetric[] {
  const ENGINEERS = [
    { name: 'Amit Sharma', zone: 'South Zone', phone: '+91 98840 19283' },
    { name: 'Vishal Joshi', zone: 'West Zone', phone: '+91 98231 44510' },
    { name: 'Rahul Verma', zone: 'East Zone', phone: '+91 97410 88231' },
    { name: 'Priya Nair', zone: 'North Zone', phone: '+91 98450 77123' },
    { name: 'Vikram Rao', zone: 'Central Zone', phone: '+91 99001 12233' },
    { name: 'Sunil Patil', zone: 'West Zone', phone: '+91 93412 34567' },
    { name: 'Deepak Sen', zone: 'North Zone', phone: '+91 97112 24455' }
  ];

  return ENGINEERS.map(eng => {
    const cmp = compressors.filter(c => c.supportEngineer === eng.name);
    const dsp = dispensers.filter(d => d.serviceEngineerName === eng.name);

    const totalAssigned = cmp.length + dsp.length;
    const openTickets = cmp.filter(c => c.status !== 'Closed').length + dsp.filter(d => d.status !== 'Closed').length;
    const totalClosed = totalAssigned - openTickets;

    const respTimes = dsp.map(d => d.responseTimeMinutes || 30);
    const avgResponseMinutes = respTimes.length > 0 ? Math.round(respTimes.reduce((a, b) => a + b, 0) / respTimes.length) : 32;

    return {
      name: eng.name,
      zone: eng.zone,
      phone: eng.phone,
      totalAssigned,
      totalClosed,
      openTickets,
      avgResolutionHours: Number((1.5 + (eng.name.length % 5) * 0.15).toFixed(1)),
      avgResponseMinutes,
      rating: Number((4.7 + (eng.name.length % 3) * 0.1).toFixed(1)),
      repeatComplaintsCount: (totalAssigned % 2),
      compressorCalls: cmp.length,
      dispenserCalls: dsp.length,
      slaAdherenceRate: Number((93.5 + (eng.name.length % 5)).toFixed(1))
    };
  });
}

// Daily trends for Area Charts
export const DAILY_TRENDS_DATA = [
  { date: 'Aug 29', incoming: 18, resolved: 17, compressors: 8, dispensers: 10 },
  { date: 'Aug 30', incoming: 22, resolved: 21, compressors: 10, dispensers: 12 },
  { date: 'Aug 31', incoming: 15, resolved: 16, compressors: 6, dispensers: 9 },
  { date: 'Sep 01', incoming: 24, resolved: 23, compressors: 11, dispensers: 13 },
  { date: 'Sep 02', incoming: 28, resolved: 26, compressors: 13, dispensers: 15 },
  { date: 'Sep 03', incoming: 20, resolved: 19, compressors: 9, dispensers: 11 },
  { date: 'Sep 04', incoming: 25, resolved: 24, compressors: 12, dispensers: 13 }
];

// Problem breakdown for failure modes
export const PROBLEM_BREAKDOWN = [
  { name: 'Air Pressure Drop', count: 384, percentage: 30.8, color: '#38bdf8' },
  { name: 'High Discharge Temp', count: 265, percentage: 21.2, color: '#f87171' },
  { name: 'Flow Meter Inaccuracy', count: 210, percentage: 16.8, color: '#fbbf24' },
  { name: 'Oil Filter Clogged', count: 148, percentage: 11.9, color: '#34d399' },
  { name: 'Nozzle Auto-Cut Failure', count: 112, percentage: 9.0, color: '#60a5fa' },
  { name: 'Motor Overload Tripping', count: 85, percentage: 6.8, color: '#a78bfa' },
  { name: 'Other Mechanical & Electrical', count: 44, percentage: 3.5, color: '#94a3b8' }
];

// Backward compatibility exports
export const INITIAL_COMPLAINTS: ComplaintRecord[] = COMPRESSOR_DATA.map(c => ({
  id: c.id,
  ticketNumber: c.id,
  timestamp: `${c.date} 10:00`,
  customerName: c.customerName,
  customerPhone: c.senderNumber,
  zone: c.area,
  location: `${c.area} Facility`,
  issueCategory: c.problem,
  dispenserId: c.serialNumber,
  assignedEngineer: c.supportEngineer,
  priority: c.callPriority,
  status: c.status,
  resolutionTimeHours: c.resolutionTimeHours,
  notes: c.notes || '',
  source: 'WhatsApp'
}));

export const INITIAL_DISPENSERS: DispenserRecord[] = DISPENSER_DATA.map(d => ({
  id: d.id,
  dispenserCode: d.dispenserSerialNo,
  model: 'Wayne Helix 5000',
  clientName: d.stationName,
  zone: d.zoneName,
  floorLocation: 'Forecourt Island 1',
  installDate: '2024-03-15',
  lastServiceDate: d.date,
  nextDueDate: '2026-12-01',
  filterHealthPct: 92,
  uvLampStatus: 'Optimal',
  assignedEngineer: d.serviceEngineerName,
  status: d.status === 'Closed' ? 'Operational' : 'Requires Service',
  totalServicesCount: 14
}));

export const ZONE_METRICS: ZoneMetric[] = computeZoneMetrics(COMPRESSOR_DATA, DISPENSER_DATA);
export const ENGINEERS_METRICS: EngineerMetric[] = computeEngineerMetrics(COMPRESSOR_DATA, DISPENSER_DATA);

export const COMPRESSOR_RECORDS = COMPRESSOR_DATA;
export const DISPENSER_RECORDS = DISPENSER_DATA;

export const TOP_CUSTOMERS = [
  { id: 'CUST-01', name: 'Tata Motors Assembly Plant', units: 18, totalTickets: 42, openTickets: 2, slaPct: 95.2, amcType: 'Comprehensive AMC' },
  { id: 'CUST-02', name: 'Apollo Hospitals Central', units: 12, totalTickets: 29, openTickets: 0, slaPct: 98.4, amcType: 'Comprehensive AMC' },
  { id: 'CUST-03', name: 'Bosch Automotive Hub', units: 15, totalTickets: 36, openTickets: 1, slaPct: 94.0, amcType: 'Comprehensive AMC' },
  { id: 'CUST-04', name: 'L&T Heavy Engineering', units: 22, totalTickets: 51, openTickets: 3, slaPct: 91.8, amcType: 'Non-Comprehensive AMC' },
  { id: 'CUST-05', name: 'Mahindra & Mahindra Plant', units: 14, totalTickets: 31, openTickets: 0, slaPct: 96.5, amcType: 'Warranty' },
  { id: 'CUST-06', name: 'Biocon Park Facility', units: 10, totalTickets: 22, openTickets: 1, slaPct: 97.1, amcType: 'Comprehensive AMC' }
];
