import React, { useState } from 'react';
import { TriggerReportHistory, ComplaintRecord, DispenserRecord } from '../../types';
import { 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  Eye, 
  Code, 
  Copy, 
  Check,
  Building,
  Wrench,
  AlertCircle
} from 'lucide-react';

interface ReportViewerProps {
  complaints: ComplaintRecord[];
  dispensers: DispenserRecord[];
  triggerHistory: TriggerReportHistory[];
  onTriggerReport: (type: 'Daily 6 PM Report' | 'Weekly Monday 9 AM Report' | 'Monthly Management Report') => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  complaints,
  dispensers,
  triggerHistory,
  onTriggerReport
}) => {
  const [selectedReportType, setSelectedReportType] = useState<'Daily 6 PM Report' | 'Weekly Monday 9 AM Report' | 'Monthly Management Report'>('Daily 6 PM Report');
  const [viewMode, setViewMode] = useState<'preview' | 'html'>('preview');
  const [copied, setCopied] = useState(false);
  const [triggerSuccessToast, setTriggerSuccessToast] = useState<string | null>(null);

  // Dynamic calculations based on state
  const todayComplaints = 41 + (complaints.length - 12);
  const todayClosed = 39 + (complaints.filter(c => c.status === 'Closed').length - 10);
  const todayOpen = Math.max(0, todayComplaints - todayClosed);
  const todayDispensers = 25 + (dispensers.filter(d => d.lastServiceDate === '2026-09-01').length - 5);

  const handleManualTrigger = () => {
    onTriggerReport(selectedReportType);
    setTriggerSuccessToast(`✅ ${selectedReportType} executed & delivered to distribution list!`);
    setTimeout(() => setTriggerSuccessToast(null), 3500);
  };

  const rawHtmlString = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9; padding: 24px; color: #1e293b; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #0f172a; color: #ffffff; padding: 28px 32px; border-bottom: 3px solid #0284c7; }
    .kpi-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; padding: 20px 32px; background: #f8fafc; }
    .kpi-card { background: #ffffff; padding: 14px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; }
    .section { padding: 20px 32px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0; font-size:18px;">${selectedReportType.toUpperCase()}</h1>
      <p style="margin:4px 0 0 0; color:#94a3b8; font-size:12px;">Auto-dispatched via Apps Script GmailApp</p>
    </div>
    <div class="kpi-grid">
      <div class="kpi-card"><div style="font-size:22px; font-weight:bold; color:#0284c7;">${todayComplaints}</div><div style="font-size:11px; color:#64748b;">COMPLAINTS</div></div>
      <div class="kpi-card"><div style="font-size:22px; font-weight:bold; color:#16a34a;">${todayClosed}</div><div style="font-size:11px; color:#64748b;">CLOSED</div></div>
      <div class="kpi-card"><div style="font-size:22px; font-weight:bold; color:#d97706;">${todayOpen}</div><div style="font-size:11px; color:#64748b;">OPEN</div></div>
      <div class="kpi-card"><div style="font-size:22px; font-weight:bold; color:#6366f1;">${todayDispensers}</div><div style="font-size:11px; color:#64748b;">DISP SERVICED</div></div>
    </div>
  </div>
</body>
</html>`;

  const copyHtml = () => {
    navigator.clipboard.writeText(rawHtmlString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Trigger Action */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-600" />
              Automated Email Reporting System (Google Workspace Native)
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              No Looker Studio Needed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Google Apps Script reads the Master Sheet at scheduled trigger intervals and sends structured HTML summaries via <code className="text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">GmailApp.sendEmail()</code>.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleManualTrigger}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 w-full md:w-auto"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Simulate Time-Driven Trigger</span>
          </button>
        </div>
      </div>

      {triggerSuccessToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{triggerSuccessToast}</span>
        </div>
      )}

      {/* Report Type Selector & View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setSelectedReportType('Daily 6 PM Report')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedReportType === 'Daily 6 PM Report'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            ⏰ Daily 6 PM Report
          </button>

          <button
            onClick={() => setSelectedReportType('Weekly Monday 9 AM Report')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedReportType === 'Weekly Monday 9 AM Report'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            📅 Weekly Monday 9 AM
          </button>

          <button
            onClick={() => setSelectedReportType('Monthly Management Report')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedReportType === 'Monthly Management Report'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            📊 Monthly Management
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'preview' ? 'html' : 'preview')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-2xs"
          >
            {viewMode === 'preview' ? <Code className="w-3.5 h-3.5 text-indigo-600" /> : <Eye className="w-3.5 h-3.5 text-teal-600" />}
            <span>{viewMode === 'preview' ? 'View Raw Email HTML' : 'View Visual Email'}</span>
          </button>

          {viewMode === 'html' && (
            <button
              onClick={copyHtml}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy HTML'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Email Render View (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          {viewMode === 'preview' ? (
            /* Gmail UI Emulation */
            <div className="bg-white text-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200/90 font-sans max-w-2xl mx-auto">
              {/* Email Client Header */}
              <div className="bg-slate-900 text-white p-6 border-b-4 border-indigo-600">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>From: Automated Service Desk &lt;desk@company.com&gt;</span>
                  <span>18:00 IST (Scheduled)</span>
                </div>
                <h2 className="text-lg font-bold tracking-tight text-white mt-1">
                  {selectedReportType === 'Daily 6 PM Report' && 'DAILY SERVICE & DISPENSER REPORT'}
                  {selectedReportType === 'Weekly Monday 9 AM Report' && 'WEEKLY OPERATIONS & SLA PERFORMANCE ROLLUP'}
                  {selectedReportType === 'Monthly Management Report' && 'MONTHLY STRATEGIC ASSET & RELIABILITY REVIEW'}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Extracted directly from Google Sheets Master &bull; Zero Looker Studio dependency
                </p>
              </div>

              {/* KPI Stat Cards */}
              <div className="grid grid-cols-4 gap-3 p-5 bg-slate-50/80 border-b border-slate-200/80 text-center">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <div className="text-2xl font-extrabold text-indigo-600 tracking-tight">{todayComplaints}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">Complaints</div>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <div className="text-2xl font-extrabold text-emerald-600 tracking-tight">{todayClosed}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">Closed</div>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <div className="text-2xl font-extrabold text-amber-600 tracking-tight">{todayOpen}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">Pending Open</div>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <div className="text-2xl font-extrabold text-teal-600 tracking-tight">{todayDispensers}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">Serviced</div>
                </div>
              </div>

              {/* Zone SLA Section */}
              <div className="p-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
                  Zone SLA Compliance (Master Sheet Data)
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="font-semibold text-slate-800">West Zone</span>
                    <span className="font-bold text-emerald-600">96.0% SLA (Optimal)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="font-semibold text-slate-800">South Zone</span>
                    <span className="font-bold text-emerald-600">94.2% SLA (Optimal)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="font-semibold text-slate-800">North Zone</span>
                    <span className="font-bold text-indigo-600">91.4% SLA (Good)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="font-semibold text-slate-800">East Zone</span>
                    <span className="font-bold text-amber-600">89.1% SLA (Action Required)</span>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
                    Top Field Engineer Highlights
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    ⭐ <strong>Amit Sharma (South Lead)</strong> completed 14 ticket closures today with 100% first-time resolution.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 font-medium">
                System: WhatsApp Cloud API &rarr; Apps Script &rarr; Google Sheets &rarr; Gmail
              </div>
            </div>
          ) : (
            <div className="font-mono text-xs text-emerald-300 bg-slate-900 p-4 rounded-xl overflow-x-auto max-h-[500px]">
              <pre>{rawHtmlString}</pre>
            </div>
          )}
        </div>

        {/* Right: Trigger History Log (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Automated Trigger Run Log
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              History of scheduled Google Apps Script cron executions
            </p>

            <div className="space-y-3">
              {triggerHistory.map((trig) => (
                <div key={trig.id} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1.5 text-xs shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{trig.reportType}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      {trig.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">{trig.timestamp}</div>
                  <div className="text-[11px] text-slate-700">
                    {trig.summaryMetrics.totalTicketsToday} Tickets ({trig.summaryMetrics.closedToday} Closed) &bull; {trig.summaryMetrics.dispensersServicedToday} Dispensers
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    To: {trig.recipients.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
