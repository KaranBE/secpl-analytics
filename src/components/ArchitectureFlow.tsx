import React, { useState } from 'react';
import { 
  MessageSquare, 
  Cpu, 
  FileSpreadsheet, 
  Mail, 
  Clock, 
  ArrowRight, 
  CheckCircle, 
  ShieldCheck, 
  Zap, 
  Ban, 
  Database,
  BarChart4,
  Layers
} from 'lucide-react';

export const ArchitectureFlow: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>('sheets');

  const nodes = [
    {
      id: 'whatsapp',
      title: '1. WhatsApp Cloud API',
      subtitle: 'Customer & Engineer Channel',
      icon: MessageSquare,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Input Source',
      details: [
        'Customers text complaints, addresses & dispenser photos.',
        'Engineers reply with status codes (e.g., "Status #1248 Closed").',
        'Technicians submit periodic dispenser service notes.',
        'Instant 2-way automated confirmation replies.'
      ]
    },
    {
      id: 'appsscript',
      title: '2. Google Apps Script',
      subtitle: 'doPost(e) Webhook & Triggers',
      icon: Cpu,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Serverless Engine',
      details: [
        'Zero-cost serverless webhook hosted inside Google Workspace.',
        'JSON payload parser & regex intent classifier.',
        'Audits raw messages into Raw_Log and isolates faults to Errors.',
        'Runs time-driven cron triggers for 6:00 PM and Monday 9:00 AM.'
      ]
    },
    {
      id: 'sheets',
      title: '3. Google Sheets Master',
      subtitle: 'Master & Private Dispenser',
      icon: FileSpreadsheet,
      color: 'from-emerald-600 to-green-700',
      badge: 'Real-time Database',
      details: [
        'Master Workbook: Complaints, Raw_Log, Errors tabs.',
        'Private Dispenser Workbook: Dispensers inventory, filters & UV status.',
        'Native Google Sheets Formulas (=COUNTIF, =QUERY, =FILTER).',
        'Instant recalculation as soon as WhatsApp inserts a row.'
      ]
    },
    {
      id: 'analytics',
      title: '4. In-Sheet Analytics',
      subtitle: 'Looker Studio Replacement',
      icon: BarChart4,
      color: 'from-amber-500 to-orange-600',
      badge: 'Zero Latency BI',
      details: [
        'Dashboard: Real-time service metrics, Zone & Engineer performance.',
        'Zone Analysis: SLA % and response turn-around times.',
        'Problem & Pareto Analysis: Water Leakage vs Filters vs Electrical.',
        'No external sync delays, no data connection fees, no Looker license.'
      ]
    },
    {
      id: 'gmail',
      title: '5. Automated Gmail Dispatch',
      subtitle: 'Daily 6 PM & Weekly 9 AM',
      icon: Mail,
      color: 'from-rose-500 to-pink-600',
      badge: 'Automated Delivery',
      details: [
        '6:00 PM IST: Today\'s Complaints, Closures, and Dispenser services.',
        'Monday 9:00 AM: Weekly executive rollup with SLA performance.',
        'Monthly: Comprehensive management review with parts metrics.',
        'Delivered straight to Operations & Executive inboxes via GmailApp.'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner explaining the No-Looker architecture */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 lg:p-7 relative overflow-hidden shadow-xs">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Layers className="w-56 h-56 text-indigo-600" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            100% Native Google Workspace & WhatsApp Architecture
          </div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight">
            Why You Do Not Need Looker Studio
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            By structuring the Master Google Sheet with dedicated <strong className="text-slate-900 font-semibold">Complaints, Raw_Log, Errors, Dispensers</strong>, and <strong className="text-slate-900 font-semibold">Analytics</strong> tabs, your reporting updates <em className="text-indigo-600 font-medium not-italic">instantly</em> on every WhatsApp message. Google Apps Script automates the 6:00 PM email delivery with zero external platform overhead.
          </p>
          
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="flex items-center gap-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-2xs font-medium">
              <Ban className="w-4 h-4 text-rose-500 shrink-0" />
              <span>No Looker Studio Connector lag</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-2xs font-medium">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Instant sheet formula calculation</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-2xs font-medium">
              <Clock className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Scheduled 6 PM Gmail automation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Pipeline Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3.5">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          const isSelected = selectedNode === node.id;
          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node.id)}
              className={`cursor-pointer rounded-2xl p-4 transition-all border relative flex flex-col justify-between shadow-xs ${
                isSelected 
                  ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20' 
                  : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${node.color} text-white shadow-xs`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {node.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{node.title}</h3>
                <p className="text-xs text-slate-500 mb-3">{node.subtitle}</p>
              </div>

              <div className="mt-2 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className={isSelected ? 'text-indigo-600 font-bold' : 'text-slate-400 font-medium'}>
                  {isSelected ? 'Viewing Node Specs' : 'Click to inspect'}
                </span>
                {index < nodes.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 hidden lg:block" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Node Detail Inspector */}
      {selectedNode && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          {(() => {
            const current = nodes.find(n => n.id === selectedNode);
            if (!current) return null;
            const Icon = current.icon;
            return (
              <div>
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${current.color} text-white shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{current.title} — Specification</h3>
                    <p className="text-xs text-slate-500">{current.subtitle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {current.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs text-slate-700 shadow-2xs">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-medium">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Master Spreadsheet Structure Diagram */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-600" />
          Spreadsheet Schema & Tab Organization
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50/70 border border-slate-200/90 p-5 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Spreadsheet 1: Master.gsheet</span>
              <span className="text-[11px] text-slate-500 font-medium">Core Operations</span>
            </div>
            <div className="space-y-2 mt-3 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <span className="text-slate-900 font-semibold">📁 Complaints</span>
                <span className="text-slate-500 text-[11px] font-sans">Ticket ID, Zone, Status, Engineer, Notes</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <span className="text-slate-900 font-semibold">📄 Raw_Log</span>
                <span className="text-slate-500 text-[11px] font-sans">Audit trail of every WhatsApp JSON webhook</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <span className="text-slate-900 font-semibold">⚠️ Errors</span>
                <span className="text-slate-500 text-[11px] font-sans">Parsing errors, payload issues, retries</span>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200 flex items-center justify-between shadow-2xs">
                <span className="text-indigo-900 font-bold">📊 Analytics</span>
                <span className="text-indigo-600 text-[11px] font-sans font-medium">Dashboard, Zone, Engineer, Trends</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/90 p-5 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Spreadsheet 2: Private Dispenser.gsheet</span>
              <span className="text-[11px] text-slate-500 font-medium">Asset & Maintenance</span>
            </div>
            <div className="space-y-2 mt-3 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <span className="text-slate-900 font-semibold">🚰 Dispensers</span>
                <span className="text-slate-500 text-[11px] font-sans">Dispenser Code, Model, Client, Zone</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <span className="text-slate-900 font-semibold">🔧 Filter Health & UV Status</span>
                <span className="text-slate-500 text-[11px] font-sans">Install Date, Last Service, Next Due Date</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <span className="text-slate-900 font-semibold">👨‍🔧 Assigned Field Technician</span>
                <span className="text-slate-500 text-[11px] font-sans">Total Servicing Cycles Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
