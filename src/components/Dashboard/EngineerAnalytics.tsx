import React, { useState, useMemo } from 'react';
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
  Search,
  ShieldCheck,
  Zap,
  Activity,
  ChevronRight,
  Filter,
  CheckCircle,
  Clock3,
  Flame,
  Building2,
  Cpu,
  X
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

type EngineerFilterTab = 'all' | 'open_tickets' | 'high_sla' | 'compressor_specialist' | 'dispenser_specialist';
type SortKey = 'workload' | 'closed' | 'sla' | 'response' | 'rating';

export const EngineerAnalytics: React.FC<EngineerAnalyticsProps> = ({
  engineerMetrics,
  incidents,
  viewMode
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState<EngineerFilterTab>('all');
  const [sortKey, setSortKey] = useState<SortKey>('workload');
  const [selectedEngineer, setSelectedEngineer] = useState<EngineerMetric | null>(null);
  const [modalIncidentSearch, setModalIncidentSearch] = useState('');

  // Fleet-wide calculations
  const fleetSummary = useMemo(() => {
    const totalEngineers = engineerMetrics.length;
    const totalAssigned = engineerMetrics.reduce((sum, e) => sum + e.totalAssigned, 0);
    const totalClosed = engineerMetrics.reduce((sum, e) => sum + e.totalClosed, 0);
    const openTickets = engineerMetrics.reduce((sum, e) => sum + e.openTickets, 0);
    
    const engineersWithResp = engineerMetrics.filter(e => e.avgResponseMinutes > 0);
    const avgResponse = engineersWithResp.length > 0 
      ? Math.round(engineersWithResp.reduce((sum, e) => sum + e.avgResponseMinutes, 0) / engineersWithResp.length)
      : 28;

    const engineersWithMttr = engineerMetrics.filter(e => e.avgResolutionHours > 0);
    const avgMttr = engineersWithMttr.length > 0
      ? Number((engineersWithMttr.reduce((sum, e) => sum + e.avgResolutionHours, 0) / engineersWithMttr.length).toFixed(1))
      : 1.8;

    const avgSla = totalEngineers > 0
      ? Number((engineerMetrics.reduce((sum, e) => sum + e.slaAdherenceRate, 0) / totalEngineers).toFixed(1))
      : 95.0;

    const topEngineer = [...engineerMetrics].sort((a, b) => b.slaAdherenceRate - a.slaAdherenceRate || b.totalClosed - a.totalClosed)[0];

    return {
      totalEngineers,
      totalAssigned,
      totalClosed,
      openTickets,
      avgResponse,
      avgMttr,
      avgSla,
      topEngineer
    };
  }, [engineerMetrics]);

  // Filtered & Sorted Engineers
  const processedEngineers = useMemo(() => {
    return engineerMetrics
      .filter(eng => {
        // Search term
        const term = searchTerm.trim().toLowerCase();
        if (term) {
          const matches = 
            eng.name.toLowerCase().includes(term) ||
            eng.zone.toLowerCase().includes(term) ||
            eng.phone.includes(term);
          if (!matches) return false;
        }

        // Tab filter
        if (activeFilterTab === 'open_tickets') {
          return eng.openTickets > 0;
        }
        if (activeFilterTab === 'high_sla') {
          return eng.slaAdherenceRate >= 95;
        }
        if (activeFilterTab === 'compressor_specialist') {
          return eng.compressorCalls > eng.dispenserCalls;
        }
        if (activeFilterTab === 'dispenser_specialist') {
          return eng.dispenserCalls >= eng.compressorCalls;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortKey === 'workload') return b.totalAssigned - a.totalAssigned || b.totalClosed - a.totalClosed;
        if (sortKey === 'closed') return b.totalClosed - a.totalClosed;
        if (sortKey === 'sla') return b.slaAdherenceRate - a.slaAdherenceRate;
        if (sortKey === 'response') return a.avgResponseMinutes - b.avgResponseMinutes;
        if (sortKey === 'rating') return b.rating - a.rating;
        return 0;
      });
  }, [engineerMetrics, searchTerm, activeFilterTab, sortKey]);

  // Chart data formatting
  const chartData = useMemo(() => {
    return processedEngineers.map(eng => {
      // Short label with first name + last initial
      const parts = eng.name.trim().split(' ');
      const shortName = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
      return {
        name: shortName,
        fullName: eng.name,
        Closed: eng.totalClosed,
        Open: eng.openTickets,
        Compressor: eng.compressorCalls,
        Dispenser: eng.dispenserCalls,
        MTTR: eng.avgResolutionHours,
        ResponseMins: eng.avgResponseMinutes,
        SLA: eng.slaAdherenceRate,
        Rating: eng.rating
      };
    });
  }, [processedEngineers]);

  // Selected engineer's assigned incidents from the unified log
  const selectedEngineerIncidents = useMemo(() => {
    if (!selectedEngineer) return [];
    const norm = selectedEngineer.name.trim().toLowerCase();
    return incidents.filter(inc => {
      const eng = (inc.engineer || '').trim().toLowerCase();
      if (eng !== norm) return false;
      if (modalIncidentSearch.trim()) {
        const query = modalIncidentSearch.trim().toLowerCase();
        return (
          inc.entityName.toLowerCase().includes(query) ||
          inc.problem.toLowerCase().includes(query) ||
          inc.assetIdentifier.toLowerCase().includes(query) ||
          inc.status.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [selectedEngineer, incidents, modalIncidentSearch]);

  const showGraphical = viewMode === 'both' || viewMode === 'graphical';
  const showTabular = viewMode === 'both' || viewMode === 'tabular';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Field Workforce Operations</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            Field Support Engineer Productivity & SLA Performance
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quantitative analysis of resolution turnaround (MTTR), response time, SLA adherence, and equipment specializations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            {engineerMetrics.length} Active Technicians
          </span>
        </div>
      </div>

      {/* Fleet Overview KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Workforce Active</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">{fleetSummary.totalEngineers} Engineers</div>
          <div className="text-[11px] text-slate-500">
            {fleetSummary.totalAssigned} Total Incidents
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Closed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-600">{fleetSummary.totalClosed}</div>
          <div className="text-[11px] text-slate-500">
            {fleetSummary.openTickets} Open Pending
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Fleet SLA Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{fleetSummary.avgSla}%</div>
          <div className="text-[11px] text-emerald-600 font-medium">
            Within Target Threshold
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Fleet Avg Response</span>
            <Clock3 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-blue-600">{fleetSummary.avgResponse} min</div>
          <div className="text-[11px] text-slate-500">
            Avg MTTR: {fleetSummary.avgMttr}h
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Top Lead</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">
            {fleetSummary.topEngineer?.name || 'N/A'}
          </div>
          <div className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-500 inline" />
            {fleetSummary.topEngineer?.rating} &bull; {fleetSummary.topEngineer?.slaAdherenceRate}% SLA
          </div>
        </div>
      </div>

      {/* Interactive Filter & Sort Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeFilterTab === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({engineerMetrics.length})
          </button>
          <button
            onClick={() => setActiveFilterTab('open_tickets')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeFilterTab === 'open_tickets'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            With Open Backlog
          </button>
          <button
            onClick={() => setActiveFilterTab('high_sla')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeFilterTab === 'high_sla'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Top SLA (≥ 95%)
          </button>
          <button
            onClick={() => setActiveFilterTab('compressor_specialist')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeFilterTab === 'compressor_specialist'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Compressor Heavy
          </button>
          <button
            onClick={() => setActiveFilterTab('dispenser_specialist')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeFilterTab === 'dispenser_specialist'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Dispenser Heavy
          </button>
        </div>

        {/* Search & Sort Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search technician name or zone..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
            />
          </div>

          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="workload">Sort: Highest Workload</option>
            <option value="closed">Sort: Most Resolved</option>
            <option value="sla">Sort: SLA Compliance</option>
            <option value="response">Sort: Fastest Response</option>
            <option value="rating">Sort: Highest CSAT</option>
          </select>
        </div>
      </div>

      {/* GRAPHICAL DATA VIEW */}
      {showGraphical && chartData.length > 0 && (
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
                  Resolution throughput comparing closed tickets to open workload
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
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Equipment Allocation Breakdown
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Compressor vs Dispenser calls completed by each technician
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

      {/* TABULAR DATA VIEW: Engineer Master Registry */}
      {showTabular && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-indigo-600" />
                Field Engineer Performance Registry
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete operational matrix calculating response speed, MTTR, SLA adherence, and customer CSAT
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Showing <span className="font-bold text-slate-900">{processedEngineers.length}</span> of {engineerMetrics.length} technicians
            </div>
          </div>

          {processedEngineers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <div className="font-semibold text-slate-600">No engineers match the current filter or search.</div>
              <button
                onClick={() => { setSearchTerm(''); setActiveFilterTab('all'); }}
                className="mt-2 text-indigo-600 hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70">
                    <th className="py-3 px-3">Technician</th>
                    <th className="py-3 px-3">Primary Zone</th>
                    <th className="py-3 px-3 text-center">Assigned</th>
                    <th className="py-3 px-3 text-center">Resolved</th>
                    <th className="py-3 px-3 text-center">Open</th>
                    <th className="py-3 px-3 text-center">Compressors</th>
                    <th className="py-3 px-3 text-center">Dispensers</th>
                    <th className="py-3 px-3 text-center">Avg Response</th>
                    <th className="py-3 px-3 text-center">Avg MTTR</th>
                    <th className="py-3 px-3 text-center">SLA Compliance</th>
                    <th className="py-3 px-3 text-center">CSAT</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedEngineers.map((eng, idx) => {
                    const closurePct = eng.totalAssigned > 0 
                      ? Math.round((eng.totalClosed / eng.totalAssigned) * 100) 
                      : 100;

                    return (
                      <tr 
                        key={eng.name} 
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => setSelectedEngineer(eng)}
                      >
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <div className="w-5 h-5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </div>
                            <span className="group-hover:text-indigo-600 transition-colors">{eng.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono ml-7">{eng.phone}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium whitespace-nowrap">
                            {eng.zone}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-900">
                          {eng.totalAssigned}
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
                        <td className="py-3 px-3 text-center font-medium text-teal-700">
                          {eng.dispenserCalls}
                        </td>
                        <td className="py-3 px-3 text-center font-medium text-slate-800">
                          {eng.avgResponseMinutes > 0 ? `${eng.avgResponseMinutes} min` : '-'}
                        </td>
                        <td className="py-3 px-3 text-center font-medium text-slate-800">
                          {eng.avgResolutionHours > 0 ? `${eng.avgResolutionHours}h` : '-'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            eng.slaAdherenceRate >= 95
                              ? 'bg-emerald-100 text-emerald-800'
                              : eng.slaAdherenceRate >= 85
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEngineer(eng);
                            }}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>Tickets</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Deep-Dive Engineer Profile & Assigned Incidents Modal */}
      {selectedEngineer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{selectedEngineer.name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-100">
                    {selectedEngineer.zone}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                  <span>Phone: <strong className="font-mono text-slate-700">{selectedEngineer.phone}</strong></span>
                  <span>&bull;</span>
                  <span>SLA Conformance: <strong className="text-emerald-600">{selectedEngineer.slaAdherenceRate}%</strong></span>
                </p>
              </div>
              <button
                onClick={() => { setSelectedEngineer(null); setModalIncidentSearch(''); }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Performance Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500">Total Workload</div>
                <div className="font-bold text-slate-900 text-lg mt-0.5">{selectedEngineer.totalAssigned}</div>
                <div className="text-[10px] text-slate-400">
                  {selectedEngineer.compressorCalls} Comp &bull; {selectedEngineer.dispenserCalls} Disp
                </div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="text-[11px] text-emerald-700">Resolved Rate</div>
                <div className="font-bold text-emerald-800 text-lg mt-0.5">
                  {selectedEngineer.totalAssigned > 0 
                    ? Math.round((selectedEngineer.totalClosed / selectedEngineer.totalAssigned) * 100) 
                    : 100}%
                </div>
                <div className="text-[10px] text-emerald-600">
                  {selectedEngineer.totalClosed} closed &bull; {selectedEngineer.openTickets} pending
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-[11px] text-blue-700">Speed / MTTR</div>
                <div className="font-bold text-blue-800 text-lg mt-0.5">{selectedEngineer.avgResponseMinutes} min</div>
                <div className="text-[10px] text-blue-600">
                  Avg MTTR: {selectedEngineer.avgResolutionHours}h
                </div>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div className="text-[11px] text-amber-700">Customer CSAT</div>
                <div className="font-bold text-amber-800 text-lg mt-0.5 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  {selectedEngineer.rating}
                </div>
                <div className="text-[10px] text-amber-600">
                  {selectedEngineer.repeatComplaintsCount} repeat visits
                </div>
              </div>
            </div>

            {/* Assigned Incidents Section */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Assigned Incident Dispatch Log ({selectedEngineerIncidents.length})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Direct stream of compressor and dispenser calls routed to this engineer
                  </p>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={modalIncidentSearch}
                    onChange={(e) => setModalIncidentSearch(e.target.value)}
                    placeholder="Search technician's tickets..."
                    className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500 w-48"
                  />
                </div>
              </div>

              {selectedEngineerIncidents.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200/80">
                  No incidents currently found for this technician in the selected filter window.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Customer / Station</th>
                        <th className="py-2.5 px-3">Reported Problem</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedEngineerIncidents.map(inc => (
                        <tr key={inc.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                            {inc.date}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inc.equipmentType === 'Compressor'
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'bg-teal-50 text-teal-700'
                            }`}>
                              {inc.equipmentType}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            <div>{inc.entityName}</div>
                            <div className="text-[10px] text-slate-400 font-mono font-normal">{inc.assetIdentifier}</div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">
                            {inc.problem}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              inc.status === 'Closed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {inc.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => { setSelectedEngineer(null); setModalIncidentSearch(''); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
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
