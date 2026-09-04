import React, { useState } from 'react';
import { 
  ComplaintRecord, 
  RawLogRecord, 
  ErrorLogRecord, 
  DispenserRecord 
} from '../../types';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Copy, 
  Check, 
  Table2, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Wrench,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export type SheetTabName = 'Complaints' | 'Raw_Log' | 'Errors' | 'Dispensers';

interface SheetsTableProps {
  activeSheet: SheetTabName;
  onSelectSheet: (sheet: SheetTabName) => void;
  complaints: ComplaintRecord[];
  rawLogs: RawLogRecord[];
  errors: ErrorLogRecord[];
  dispensers: DispenserRecord[];
  onUpdateComplaintStatus: (id: string, newStatus: 'Open' | 'In Progress' | 'Closed') => void;
  onAddNewComplaint: (record: Partial<ComplaintRecord>) => void;
}

export const SheetsTable: React.FC<SheetsTableProps> = ({
  activeSheet,
  onSelectSheet,
  complaints,
  rawLogs,
  errors,
  dispensers,
  onUpdateComplaintStatus,
  onAddNewComplaint
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string; formula: string; value: string } | null>({
    row: 1,
    col: 'A',
    formula: '=QUERY(Complaints!A2:N, "select * where K = \'Open\'", 0)',
    value: complaints[0]?.ticketNumber || 'TKT-1248'
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // New Complaint Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    zone: 'South' as const,
    location: '',
    issueCategory: 'Water Leakage' as const,
    dispenserId: 'DISP-S04',
    assignedEngineer: 'Amit Sharma',
    priority: 'Medium' as const,
    notes: ''
  });

  const handleCopyFormula = () => {
    if (selectedCell) {
      navigator.clipboard.writeText(selectedCell.formula);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (activeSheet === 'Complaints') {
      csvContent += "Ticket ID,Timestamp,Customer,Phone,Zone,Location,Category,Dispenser ID,Engineer,Priority,Status,Resolution (Hrs),Notes\n";
      complaints.forEach(c => {
        csvContent += `"${c.ticketNumber}","${c.timestamp}","${c.customerName}","${c.customerPhone}","${c.zone}","${c.location}","${c.issueCategory}","${c.dispenserId}","${c.assignedEngineer}","${c.priority}","${c.status}","${c.resolutionTimeHours || ''}","${c.notes.replace(/"/g, '""')}"\n`;
      });
    } else if (activeSheet === 'Dispensers') {
      csvContent += "Dispenser Code,Model,Client Name,Zone,Location,Install Date,Last Service Date,Next Due Date,Filter Health %,UV Status,Status\n";
      dispensers.forEach(d => {
        csvContent += `"${d.dispenserCode}","${d.model}","${d.clientName}","${d.zone}","${d.floorLocation}","${d.installDate}","${d.lastServiceDate}","${d.nextDueDate}","${d.filterHealthPct}%","${d.uvLampStatus}","${d.status}"\n`;
      });
    } else if (activeSheet === 'Raw_Log') {
      csvContent += "Log ID,Timestamp,Sender ID,Sender Name,Parsed Action,Status\n";
      rawLogs.forEach(r => {
        csvContent += `"${r.id}","${r.timestamp}","${r.senderWaId}","${r.senderName}","${r.parsedAction}","${r.status}"\n`;
      });
    } else {
      csvContent += "Error ID,Timestamp,Sender WA ID,Reason,Status\n";
      errors.forEach(e => {
        csvContent += `"${e.id}","${e.timestamp}","${e.senderWaId}","${e.errorReason}","${e.status}"\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeSheet}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName) return;
    onAddNewComplaint({
      ...formData,
      status: 'Open',
      source: 'Manual'
    });
    setShowAddModal(false);
    setFormData({
      customerName: '',
      customerPhone: '',
      zone: 'South',
      location: '',
      issueCategory: 'Water Leakage',
      dispenserId: 'DISP-S04',
      assignedEngineer: 'Amit Sharma',
      priority: 'Medium',
      notes: ''
    });
  };

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    const matchSearch = c.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.assignedEngineer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchZone = zoneFilter === 'ALL' || c.zone === zoneFilter;
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchSearch && matchZone && matchStatus;
  });

  return (
    <div className="space-y-4">
      {/* Top Google Sheets Style Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 tracking-tight">
                  {activeSheet === 'Dispensers' ? 'Private Dispenser.gsheet' : 'Master Service Operations.gsheet'}
                </span>
                <span className="text-[11px] text-emerald-700 ml-2.5 font-medium px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                  ● Real-time synced
                </span>
              </div>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            {activeSheet === 'Complaints' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            )}
          </div>
        </div>

        {/* Formula Bar */}
        <div className="bg-white px-5 py-2.5 border-b border-slate-200 flex items-center gap-2.5 text-xs font-mono">
          <span className="text-slate-700 font-bold px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] border border-slate-200">
            {selectedCell ? `${selectedCell.col}${selectedCell.row}` : 'A1'}
          </span>
          <span className="text-indigo-600 font-bold text-sm">fx</span>
          <div className="flex-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 overflow-x-auto whitespace-nowrap text-xs">
            {selectedCell ? selectedCell.formula : '=IMPORTRANGE("Master", "Complaints!A:N")'}
          </div>
          <button
            onClick={handleCopyFormula}
            title="Copy formula"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Controls / Filter Bar */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket #, client, engineer, location..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs transition-all shadow-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeSheet === 'Complaints' && (
              <>
                <select
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-indigo-500 shadow-xs"
                >
                  <option value="ALL">All Zones</option>
                  <option value="South">South Zone</option>
                  <option value="North">North Zone</option>
                  <option value="West">West Zone</option>
                  <option value="East">East Zone</option>
                  <option value="Central">Central Zone</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-indigo-500 shadow-xs"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </>
            )}

            <span className="text-slate-500 text-xs font-medium bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-xs">
              {activeSheet === 'Complaints' && `${filteredComplaints.length} rows`}
              {activeSheet === 'Dispensers' && `${dispensers.length} units`}
              {activeSheet === 'Raw_Log' && `${rawLogs.length} events`}
              {activeSheet === 'Errors' && `${errors.length} errors`}
            </span>
          </div>
        </div>

        {/* Tab Switcher at Bottom/Top of Sheet */}
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => onSelectSheet('Complaints')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSheet === 'Complaints'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <span>📋 Complaints</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">{complaints.length}</span>
          </button>

          <button
            onClick={() => onSelectSheet('Raw_Log')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSheet === 'Raw_Log'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <span>📄 Raw_Log</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">{rawLogs.length}</span>
          </button>

          <button
            onClick={() => onSelectSheet('Errors')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSheet === 'Errors'
                ? 'bg-white text-rose-600 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <span>⚠️ Errors</span>
            {errors.filter(e => e.status === 'Unresolved').length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                {errors.filter(e => e.status === 'Unresolved').length}
              </span>
            )}
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          <button
            onClick={() => onSelectSheet('Dispensers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSheet === 'Dispensers'
                ? 'bg-white text-teal-600 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <span>🚰 Dispensers (Private)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-semibold">{dispensers.length}</span>
          </button>
        </div>

        {/* The Grid Table */}
        <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
          {activeSheet === 'Complaints' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 border-r border-slate-200 text-slate-400 font-mono w-10 text-center">#</th>
                  <th className="py-3 px-3.5 border-r border-slate-200 font-semibold">Ticket ID</th>
                  <th className="py-3 px-3.5 border-r border-slate-200 font-semibold">Timestamp</th>
                  <th className="py-3 px-3.5 border-r border-slate-200 font-semibold">Customer & Site</th>
                  <th className="py-3 px-3.5 border-r border-slate-200 font-semibold">Zone</th>
                  <th className="py-3 px-3.5 border-r border-slate-200 font-semibold">Category</th>
                  <th className="py-3 px-3.5 border-r border-slate-200 font-semibold">Dispenser</th>
                  <th className="py-3 px-3.5 border-r border-slate-200 font-semibold">Engineer</th>
                  <th className="py-3 px-3.5 border-r border-slate-200 font-semibold">Priority</th>
                  <th className="py-3 px-3.5 border-r border-slate-200 text-center font-semibold">Status</th>
                  <th className="py-3 px-3.5 font-semibold">Notes & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[12px]">
                {filteredComplaints.map((c, index) => (
                  <tr 
                    key={c.id} 
                    onClick={() => setSelectedCell({
                      row: index + 2,
                      col: 'A',
                      formula: `=VLOOKUP("${c.ticketNumber}", Complaints!A:N, 11, FALSE)`,
                      value: c.status
                    })}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-slate-400 text-center font-mono">{index + 2}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 font-bold text-indigo-600">{c.ticketNumber}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-slate-500">{c.timestamp}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-slate-800 font-sans">
                      <div className="font-bold text-slate-900">{c.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{c.location}</div>
                    </td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-sans text-[11px] font-medium border border-slate-200">
                        {c.zone}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-slate-700 font-sans">{c.issueCategory}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-slate-600 font-mono text-[11px]">{c.dispenserId}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-slate-900 font-sans font-medium">{c.assignedEngineer}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-sans border ${
                        c.priority === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        c.priority === 'High' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-center">
                      <select
                        value={c.status}
                        onChange={(e) => onUpdateComplaintStatus(c.id, e.target.value as any)}
                        onClick={(e) => e.stopPropagation()}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold font-sans cursor-pointer focus:outline-none border shadow-2xs ${
                          c.status === 'Closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          c.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="Open" className="bg-white text-amber-700">Open</option>
                        <option value="In Progress" className="bg-white text-indigo-700">In Progress</option>
                        <option value="Closed" className="bg-white text-emerald-700">Closed</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-500 font-sans text-[11px] max-w-xs truncate" title={c.notes}>
                      {c.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeSheet === 'Raw_Log' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 border-r border-slate-200 font-mono w-10 text-center">#</th>
                  <th className="py-3 px-3.5 border-r border-slate-200">Log ID</th>
                  <th className="py-3 px-3.5 border-r border-slate-200">Timestamp</th>
                  <th className="py-3 px-3.5 border-r border-slate-200">Sender WA ID</th>
                  <th className="py-3 px-3.5 border-r border-slate-200">Sender Name</th>
                  <th className="py-3 px-3.5 border-r border-slate-200">Parsed Action</th>
                  <th className="py-3 px-3.5 border-r border-slate-200">Status</th>
                  <th className="py-3 px-3.5">Raw JSON Payload Snippet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {rawLogs.map((r, index) => (
                  <tr 
                    key={r.id} 
                    onClick={() => setSelectedCell({
                      row: index + 2,
                      col: 'A',
                      formula: `=Raw_Log!E${index + 2}`,
                      value: r.id
                    })}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-slate-400 text-center">{index + 2}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 font-bold text-indigo-600">{r.id}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-slate-500">{r.timestamp}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-slate-700">{r.senderWaId}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-slate-900 font-sans font-medium">{r.senderName}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-sans text-[11px] font-semibold">
                        {r.parsedAction}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100">
                      <span className="text-emerald-700 font-bold">✓ Success</span>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-500 font-mono truncate max-w-md" title={r.rawPayload}>
                      {r.rawPayload}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeSheet === 'Errors' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 border-r border-slate-200 font-mono w-10 text-center">#</th>
                  <th className="py-3 px-3.5 border-r border-slate-200">Error ID</th>
                  <th className="py-3 px-3.5 border-r border-slate-200">Timestamp</th>
                  <th className="py-3 px-3.5 border-r border-slate-200">Sender WA ID</th>
                  <th className="py-3 px-3.5 border-r border-slate-200">Error Reason & Diagnostics</th>
                  <th className="py-3 px-3.5 border-r border-slate-200">Retry Count</th>
                  <th className="py-3 px-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {errors.map((err, index) => (
                  <tr key={err.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-slate-400 text-center">{index + 2}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 font-bold text-rose-600">{err.id}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-slate-500">{err.timestamp}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-slate-700">{err.senderWaId}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-slate-700 font-sans">{err.errorReason}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-center text-slate-700">{err.retryCount}</td>
                    <td className="py-2.5 px-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {err.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeSheet === 'Dispensers' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 border-r border-slate-200 font-mono w-10 text-center">#</th>
                  <th className="py-3 px-3.5 border-r border-slate-200">Dispenser ID</th>
                  <th className="py-3 px-3.5 border-r border-slate-200">Model</th>
                  <th className="py-3 px-3.5 border-r border-slate-200">Client / Site</th>
                  <th className="py-3 px-3.5 border-r border-slate-200">Zone</th>
                  <th className="py-3 px-3.5 border-r border-slate-200">Last Service</th>
                  <th className="py-3 px-3.5 border-r border-slate-200">Next Due</th>
                  <th className="py-3 px-3.5 border-r border-slate-200">Filter Health</th>
                  <th className="py-3 px-3.5 border-r border-slate-200">UV Lamp</th>
                  <th className="py-3 px-3.5 border-r border-slate-200">Technician</th>
                  <th className="py-3 px-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {dispensers.map((d, index) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-slate-400 text-center">{index + 2}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 font-bold text-teal-600">{d.dispenserCode}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-slate-700 font-sans">{d.model}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-slate-900 font-sans font-medium">{d.clientName}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-slate-700">{d.zone}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-slate-500">{d.lastServiceDate}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-indigo-600 font-bold">{d.nextDueDate}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              d.filterHealthPct > 80 ? 'bg-emerald-500' : d.filterHealthPct > 60 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${d.filterHealthPct}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-700">{d.filterHealthPct}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-slate-700">{d.uvLampStatus}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-slate-900 font-sans font-medium">{d.assignedEngineer}</td>
                    <td className="py-2.5 px-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-sans border ${
                        d.status === 'Operational' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        d.status === 'Requires Service' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Manual Add Ticket Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                Add Complaint Row to Master Sheet
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Customer / Facility Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. Fortis Hospital"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder="+91 98450 00000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Zone</label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                  >
                    <option value="South">South</option>
                    <option value="North">North</option>
                    <option value="West">West</option>
                    <option value="East">East</option>
                    <option value="Central">Central</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Issue Category</label>
                  <select
                    value={formData.issueCategory}
                    onChange={(e) => setFormData({ ...formData, issueCategory: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                  >
                    <option value="Water Leakage">Water Leakage</option>
                    <option value="Filter Choked">Filter Choked</option>
                    <option value="Cooling Fault">Cooling Fault</option>
                    <option value="Power Tripping">Power Tripping</option>
                    <option value="Dispenser Button Jam">Dispenser Button Jam</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Dispenser ID</label>
                  <input
                    type="text"
                    value={formData.dispenserId}
                    onChange={(e) => setFormData({ ...formData, dispenserId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Assigned Field Engineer</label>
                  <select
                    value={formData.assignedEngineer}
                    onChange={(e) => setFormData({ ...formData, assignedEngineer: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                  >
                    <option value="Amit Sharma">Amit Sharma (South)</option>
                    <option value="Vishal Joshi">Vishal Joshi (West)</option>
                    <option value="Rahul Verma">Rahul Verma (East)</option>
                    <option value="Priya Nair">Priya Nair (North)</option>
                    <option value="Vikram Rao">Vikram Rao (Central)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Floor Location / Details</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. 2nd floor Cafeteria, East Tower"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Describe reported issue symptoms..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-xs"
                >
                  Append to Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
