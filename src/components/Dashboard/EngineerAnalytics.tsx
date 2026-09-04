import React, { useState } from 'react';
import { EngineerMetric, UnifiedIncidentRecord, ViewMode } from '../../types';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Star, 
  Award, 
  TrendingUp, 
  AlertCircle, 
  Phone, 
  BarChart3, 
  Table as TableIcon,
  Download,
  Search,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts';

interface EngineerAnalyticsProps {
  engineerMetrics: EngineerMetric[];
  incidents: UnifiedIncidentRecord[];
  viewMode: ViewMode;
}

export const EngineerAnalytics: React.FC<EngineerAnalyticsProps> = ({
  engineerMetrics,
  incidents,
  viewMode
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEngineer, setSelectedEngineer] = useState<EngineerMetric | null>(null);

  const filteredEngineers = engineerMetrics.filter(eng => 
    eng.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eng.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eng.phone.includes(searchTerm)
  );

  const chartData = engineerMetrics.map(eng => ({
    name: eng.name.split(' ')[0],
    fullName: eng.name,
    Closed: eng.totalClosed,
    Open: eng.openTickets,
    Compressor: eng.compressorCalls,
    Dispenser: eng.dispenserCalls,
    MTTR: eng.avgResolutionHours,
    ResponseMins: eng.avgResponseMinutes,
    SLA: eng.slaAdherenceRate,
    Rating: eng.rating
  }));

  const showGraphical = viewMode === 'both' || viewMode === 'graphical';
  const showTabular = viewMode === 'both' || viewMode === 'tabular';

  const exportCSV = () => {
    const headers = ['Engineer Name,Zone,Phone,Total Assigned,Total Closed,Open Tickets,Compressor Calls,Dispenser Calls,Avg Response (Mins),Avg MTTR (Hours),SLA Adherence (%),CSAT Rating'];
    const rows = filteredEngineers.map(eng => 
      `"${eng.name}","${eng.zone}","${eng.phone}",${eng.totalAssigned},${eng.totalClosed},${eng.openTickets},${eng.compressorCalls},${eng.dispenserCalls},${eng.avgResponseMinutes},${eng.avgResolutionHours},${eng.slaAdherenceRate}%,${eng.rating}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `engineer_analytics_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Field Workforce Intelligence</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            Field Support Engineer Productivity & SLA Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Turnaround time (MTTR), customer satisfaction rating, and equipment service splits across all technicians
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
            {engineerMetrics.length} Dedicated Engineers Active
          </span>
        </div>
      </div>

      {/* Engineer KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {engineerMetrics.slice(0, 4).map((eng, idx) => (
          <div 
            key={eng.name}
            onClick={() => setSelectedEngineer(eng)}
            className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs hover:border-indigo-300 transition-all cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 font-extrabold text-[11px] flex items-center justify-center">
                  #{idx + 1}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">{eng.name}</div>
                  <div className="text-[10px] text-slate-400">{eng.zone}</div>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                {eng.rating}
              </span>
            </div>

            <div className="space-y-1 text-xs pt-0.5">
              <div className="flex justify-between text-slate-600">
                <span>Completed Tasks:</span>
                <span className="font-bold text-emerald-600">{eng.totalClosed} / {eng.totalAssigned}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Compressor vs Dispenser:</span>
                <span className="font-semibold text-slate-900">{eng.compressorCalls} C &bull; {eng.dispenserCalls} D</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Avg Response:</span>
                <span className="font-semibold text-indigo-600">{eng.avgResponseMinutes} mins</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SLA Adherence:</span>
                <span className="font-bold text-slate-900">{eng.slaAdherenceRate}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* GRAPHICAL DATA VIEW */}
      {showGraphical && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Engineer Workload & Resolution Split */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  Assigned vs Resolved Incidents per Engineer
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Resolution output by individual field service technician
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    formatter={(val: any, name: string) => [val, name === 'Closed' ? 'Closed Incidents' : 'Open Incidents']}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="Closed" fill="#4f46e5" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="Open" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Equipment Split: Compressor vs Dispenser Calls */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  Equipment Specialization Breakdown
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Compressor vs Dispenser calls completed by technician
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="Compressor" name="Compressor Calls" fill="#3b82f6" stackId="a" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="Dispenser" name="Dispenser Calls" fill="#10b981" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TABULAR DATA VIEW */}
      {showTabular && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-indigo-600" />
                Field Engineer Workforce Master Registry
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed quantitative matrix of engineer throughput, SLA adherence, and customer ratings
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter engineer name or zone..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-48 sm:w-60"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70">
                  <th className="py-3 px-3">Engineer Name</th>
                  <th className="py-3 px-3">Primary Zone</th>
                  <th className="py-3 px-3 text-center">Total Assigned</th>
                  <th className="py-3 px-3 text-center">Closed</th>
                  <th className="py-3 px-3 text-center">Open Pending</th>
                  <th className="py-3 px-3 text-center">Compressors</th>
                  <th className="py-3 px-3 text-center">Dispensers</th>
                  <th className="py-3 px-3 text-center">Avg Response</th>
                  <th className="py-3 px-3 text-center">Avg MTTR</th>
                  <th className="py-3 px-3 text-center">SLA %</th>
                  <th className="py-3 px-3 text-center">Rating</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEngineers.map((eng, idx) => (
                  <tr key={eng.name} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                          #{idx + 1}
                        </div>
                        <span>{eng.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono ml-7">{eng.phone}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {eng.zone}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                        {eng.totalAssigned}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {eng.totalClosed}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {eng.openTickets > 0 ? (
                        <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          {eng.openTickets}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">0</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-blue-700">
                      {eng.compressorCalls}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-emerald-700">
                      {eng.dispenserCalls}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-slate-800">
                      {eng.avgResponseMinutes} min
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-slate-800">
                      {eng.avgResolutionHours}h
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                        {eng.slaAdherenceRate}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        {eng.rating}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedEngineer(eng)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Engineer Detail Modal */}
      {selectedEngineer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Field Engineer Profile</div>
                <h3 className="text-lg font-bold text-slate-900">{selectedEngineer.name}</h3>
                <p className="text-xs text-slate-500">{selectedEngineer.zone} &bull; {selectedEngineer.phone}</p>
              </div>
              <button
                onClick={() => setSelectedEngineer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500">Total Workload</div>
                <div className="font-bold text-slate-900 text-lg mt-0.5">{selectedEngineer.totalAssigned} Incidents</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="text-[11px] text-emerald-700">Resolved Rate</div>
                <div className="font-bold text-emerald-800 text-lg mt-0.5">{selectedEngineer.slaAdherenceRate}%</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div className="text-[11px] text-amber-700">Customer Rating</div>
                <div className="font-bold text-amber-800 text-lg mt-0.5">{selectedEngineer.rating} / 5.0</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedEngineer(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
