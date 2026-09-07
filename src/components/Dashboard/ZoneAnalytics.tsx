import React, { useState } from 'react';
import { ZoneMetric, UnifiedIncidentRecord, ViewMode } from '../../types';
import { 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Wrench, 
  Shield, 
  Users, 
  TrendingUp, 
  BarChart3, 
  Table as TableIcon,
  Download,
  Search,
  MapPin,
  Flame,
  Zap,
  Map,
  Filter,
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
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { IndiaZoneMap } from './IndiaZoneMap';

interface ZoneAnalyticsProps {
  zoneMetrics: ZoneMetric[];
  incidents: UnifiedIncidentRecord[];
  viewMode: ViewMode;
}

export const ZoneAnalytics: React.FC<ZoneAnalyticsProps> = ({
  zoneMetrics,
  incidents,
  viewMode
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<ZoneMetric | null>(null);
  const [auditModalZone, setAuditModalZone] = useState<ZoneMetric | null>(null);
  const [graphicalSubMode, setGraphicalSubMode] = useState<'all' | 'map' | 'charts'>('all');

  const filteredZones = zoneMetrics.filter(z => {
    const matchesSearch = 
      z.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      z.leadEngineer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      z.topProblem.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesZoneFilter = !selectedZone || z.zone === selectedZone.zone;

    return matchesSearch && matchesZoneFilter;
  });

  const chartData = zoneMetrics.map(z => ({
    name: z.zone.replace(' Zone', ''),
    fullName: z.zone,
    SLA: z.slaPercentage,
    Total: z.totalComplaints,
    Resolved: z.resolvedComplaints,
    Open: z.openComplaints,
    ResponseMins: z.avgResponseMinutes,
    MTTR: z.avgResolutionHours
  }));

  const showGraphical = viewMode === 'both' || viewMode === 'graphical';
  const showTabular = viewMode === 'both' || viewMode === 'tabular';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Territory Intelligence</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            Regional & Zone Operational Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive India territory map, workload distribution, SLA adherence benchmarks, and resolution velocity
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selectedZone && (
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
              Filtered: {selectedZone.zone}
              <button
                type="button"
                onClick={() => setSelectedZone(null)}
                className="hover:text-amber-950 font-bold ml-1 cursor-pointer"
                title="Clear filter"
              >
                &times;
              </button>
            </span>
          )}
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            94.2% Regional SLA Baseline
          </span>
        </div>
      </div>

      {/* Regional Zone Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {zoneMetrics.map(zone => {
          const isSelected = selectedZone?.zone === zone.zone;
          return (
            <div 
              key={zone.zone} 
              onClick={() => setSelectedZone(isSelected ? null : zone)}
              className={`bg-white border rounded-xl p-3 shadow-xs hover:shadow-sm transition-all cursor-pointer space-y-2 relative ${
                isSelected 
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20' 
                  : 'border-slate-200/90 hover:border-indigo-300'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-indigo-200" />
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    zone.zone === 'North Zone' ? 'bg-blue-500' :
                    zone.zone === 'West Zone' ? 'bg-indigo-500' :
                    zone.zone === 'Central Zone' ? 'bg-amber-500' :
                    zone.zone === 'East Zone' ? 'bg-purple-500' : 'bg-teal-500'
                  }`}></span>
                  {zone.zone.replace(' Zone', '')}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  zone.slaPercentage >= 92 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {zone.slaPercentage}% SLA
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Total Incidents:</span>
                  <span className="font-bold text-slate-900">{zone.totalComplaints}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Resolved Cases:</span>
                  <span className="font-semibold text-emerald-600">{zone.resolvedComplaints} closed</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Open Active:</span>
                  <span className={`font-bold ${zone.openComplaints > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {zone.openComplaints} pending
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Avg Response:</span>
                  <span className="font-semibold text-indigo-600">{zone.avgResponseMinutes} mins</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100">
                  <span>Lead Engineer:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[100px]">{zone.leadEngineer}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* GRAPHICAL DATA VIEW */}
      {showGraphical && (
        <div className="space-y-6">
          
          {/* Sub-view mode toggles for graphical tab */}
          <div className="flex items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-xl p-2.5 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 pl-1">Visual Displays:</span>
              <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setGraphicalSubMode('all')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                    graphicalSubMode === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Map & Charts</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGraphicalSubMode('map')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                    graphicalSubMode === 'map'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>India Map Only</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGraphicalSubMode('charts')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                    graphicalSubMode === 'charts'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Charts Only</span>
                </button>
              </div>
            </div>

            {selectedZone && (
              <button
                type="button"
                onClick={() => setSelectedZone(null)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer pr-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Zone Filter</span>
              </button>
            )}
          </div>

          {/* Interactive India Territory Map */}
          {(graphicalSubMode === 'all' || graphicalSubMode === 'map') && (
            <IndiaZoneMap
              zoneMetrics={zoneMetrics}
              incidents={incidents}
              selectedZone={selectedZone}
              onSelectZone={(zone) => setSelectedZone(zone)}
              onOpenAuditModal={(zone) => setAuditModalZone(zone)}
            />
          )}

          {/* Workload & Resolution Comparison Charts */}
          {(graphicalSubMode === 'all' || graphicalSubMode === 'charts') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Zone Incident Volume & Resolution Split */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-indigo-600" />
                      Territory Workload: Resolved vs Open Incidents
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Volume breakdown of incoming service requests by territory zone
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
                        formatter={(val: any, name: string) => [val, name === 'Resolved' ? 'Closed Incidents' : 'Open Incidents']}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Bar dataKey="Resolved" fill="#4f46e5" stackId="a" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="Open" fill="#f59e0b" stackId="a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Regional Response Speed & SLA Comparison */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-600" />
                      Regional Response Time (Minutes) & SLA %
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Arrival speed on site from initial WhatsApp alert dispatch
                    </p>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} unit="m" />
                      <YAxis yAxisId="right" orientation="right" domain={[80, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Bar yAxisId="left" dataKey="ResponseMins" name="Avg Response Time (Min)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="SLA" name="SLA Adherence (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TABULAR DATA VIEW */}
      {showTabular && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-indigo-600" />
                  Territory Zone Master Registry Table
                </h3>
                {selectedZone && (
                  <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200 flex items-center gap-1">
                    Filtered: {selectedZone.zone}
                    <button 
                      type="button" 
                      onClick={() => setSelectedZone(null)}
                      className="hover:text-indigo-950 font-bold ml-0.5 cursor-pointer"
                    >
                      &times;
                    </button>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete quantitative metrics by operational region and territory leads
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter zone or lead..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-48 sm:w-60"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70">
                  <th className="py-3 px-3">Operational Zone</th>
                  <th className="py-3 px-3 text-center">Total Complaints</th>
                  <th className="py-3 px-3 text-center">Resolved</th>
                  <th className="py-3 px-3 text-center">Open Active</th>
                  <th className="py-3 px-3 text-center">SLA %</th>
                  <th className="py-3 px-3 text-center">Avg Response (Min)</th>
                  <th className="py-3 px-3 text-center">Avg Resolution (Hrs)</th>
                  <th className="py-3 px-3">Top Incident Issue</th>
                  <th className="py-3 px-3">Lead Support Engineer</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredZones.map((z) => (
                  <tr 
                    key={z.zone} 
                    className={`transition-colors cursor-pointer ${
                      selectedZone?.zone === z.zone 
                        ? 'bg-indigo-50/40 hover:bg-indigo-50/60' 
                        : 'hover:bg-slate-50/80'
                    }`}
                    onClick={() => setSelectedZone(selectedZone?.zone === z.zone ? null : z)}
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                        {z.zone}
                        {selectedZone?.zone === z.zone && (
                          <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-100/70 px-1.5 py-0.2 rounded">
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                        {z.totalComplaints}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {z.resolvedComplaints}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md font-bold ${
                        z.openComplaints > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'text-slate-400'
                      }`}>
                        {z.openComplaints}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold ${
                        z.slaPercentage >= 92 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {z.slaPercentage}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-slate-800">
                      {z.avgResponseMinutes} min
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-slate-800">
                      {z.avgResolutionHours}h
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium">
                        {z.topProblem}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {z.leadEngineer}
                    </td>
                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setAuditModalZone(z)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Zone Detail Modal */}
      {auditModalZone && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Territory Audit</div>
                <h3 className="text-lg font-bold text-slate-900">{auditModalZone.zone} Performance</h3>
              </div>
              <button
                type="button"
                onClick={() => setAuditModalZone(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500">Lead Field Engineer</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{auditModalZone.leadEngineer}</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="text-[11px] text-emerald-700">SLA Adherence</div>
                <div className="font-bold text-emerald-800 text-sm mt-0.5">{auditModalZone.slaPercentage}% Pass Rate</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500">Average On-Site Reach</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{auditModalZone.avgResponseMinutes} minutes</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500">Primary Breakdown Issue</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{auditModalZone.topProblem}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setSelectedZone(auditModalZone);
                  setAuditModalZone(null);
                }}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Filter to this Zone
              </button>
              <button
                type="button"
                onClick={() => setAuditModalZone(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
