import React, { useState, useMemo, useEffect } from 'react';
import { 
  UnifiedIncidentRecord, 
  CompressorRecord, 
  DispenserSheetRecord, 
  ZoneMetric, 
  EngineerMetric, 
  CustomerMetric, 
  ViewMode 
} from '../../types';
import { 
  normalizeDateToISO,
  TimelineDataPoint 
} from '../../utils/dateUtils';
import { DualSheetTimeline } from './DualSheetTimeline';
import { useVirtualScroll } from '../../utils/useVirtualScroll';
import { PaginationControls, PageSizeMode } from '../common/PaginationControls';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  Users, 
  ShieldCheck,
  Activity,
  ChevronRight,
  Building2,
  MapPin,
  Flame,
  Search,
  Table as TableIcon,
  BarChart3,
  Layers,
  MessageSquare,
  Wrench,
  Gauge,
  Zap,
  Calendar,
  Filter,
  ArrowUpRight,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  X,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { 
  Tooltip, 
  ResponsiveContainer, 
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface OverviewDashboardProps {
  incidents: UnifiedIncidentRecord[];
  compressors: CompressorRecord[];
  dispensers: DispenserSheetRecord[];
  zoneMetrics: ZoneMetric[];
  engineerMetrics: EngineerMetric[];
  customerMetrics: CustomerMetric[];
  viewMode: ViewMode;
  onNavigateToTab: (tab: 'overview' | 'zones' | 'engineers' | 'customers') => void;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6'];

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  incidents,
  compressors,
  dispensers,
  zoneMetrics,
  engineerMetrics,
  customerMetrics,
  viewMode,
  onNavigateToTab
}) => {
  const [tableSearch, setTableSearch] = useState('');
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState<PageSizeMode>(25);
  const [selectedIncident, setSelectedIncident] = useState<UnifiedIncidentRecord | null>(null);

  // Timeline Drill-down and Layout States
  const [selectedTimelineBucket, setSelectedTimelineBucket] = useState<TimelineDataPoint | null>(null);
  const [isExpandedTimeline, setIsExpandedTimeline] = useState<boolean>(false);

  // Overall Statistics
  const totalIncidents = incidents.length;
  const closedIncidents = incidents.filter(i => i.status === 'Closed').length;
  const openIncidents = totalIncidents - closedIncidents;
  const resolutionRate = totalIncidents > 0 ? ((closedIncidents / totalIncidents) * 100).toFixed(1) : '100';

  const compressorCount = incidents.filter(i => i.equipmentType === 'Compressor').length;
  const dispenserCount = incidents.filter(i => i.equipmentType === 'Dispenser').length;

  // Equipment distribution
  const equipmentPieData = [
    { name: 'Compressors', value: compressorCount, color: '#4f46e5' },
    { name: 'Dispensers', value: dispenserCount, color: '#10b981' }
  ];

  // Top failure problems
  const problemCounts: Record<string, number> = {};
  incidents.forEach(inc => {
    problemCounts[inc.problem] = (problemCounts[inc.problem] || 0) + 1;
  });
  const topProblems: { problem: string; count: number }[] = Object.keys(problemCounts)
    .map(problem => ({ problem, count: problemCounts[problem] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Table filtering (including active timeline drill-down filter)
  const filteredTableIncidents = incidents.filter(i => {
    if (selectedTimelineBucket) {
      const incIso = normalizeDateToISO(i.date);
      if (!selectedTimelineBucket.rawDateKeys.includes(incIso)) {
        return false;
      }
    }
    return (
      i.entityName.toLowerCase().includes(tableSearch.toLowerCase()) ||
      i.zoneOrArea.toLowerCase().includes(tableSearch.toLowerCase()) ||
      i.assetIdentifier.toLowerCase().includes(tableSearch.toLowerCase()) ||
      i.problem.toLowerCase().includes(tableSearch.toLowerCase()) ||
      i.engineer.toLowerCase().includes(tableSearch.toLowerCase()) ||
      i.senderNumber.includes(tableSearch) ||
      i.whatsappMessageId.toLowerCase().includes(tableSearch.toLowerCase())
    );
  });

  const totalTableItems = filteredTableIncidents.length;
  const numericPageSize = typeof tablePageSize === 'number' ? tablePageSize : 25;
  const totalTablePages = Math.max(1, Math.ceil(totalTableItems / numericPageSize));

  // Reset to page 1 if current page becomes invalid or out of bounds
  useEffect(() => {
    if (tablePage > totalTablePages) {
      setTablePage(1);
    }
  }, [totalTablePages, tablePage]);

  // Paginated records slice for standard pagination mode
  const paginatedIncidents = useMemo(() => {
    if (tablePageSize === 'virtual') return filteredTableIncidents;
    const start = (tablePage - 1) * tablePageSize;
    return filteredTableIncidents.slice(start, start + tablePageSize);
  }, [filteredTableIncidents, tablePage, tablePageSize]);

  // Virtual DOM Windowing hook (only renders ~20-25 DOM elements in viewport)
  const virtualScroll = useVirtualScroll({
    totalItems: filteredTableIncidents.length,
    itemHeight: 48,
    overscan: 5
  });

  const showGraphical = viewMode === 'both' || viewMode === 'graphical';
  const showTabular = viewMode === 'both' || viewMode === 'tabular';

  return (
    <div className="space-y-6">
      {/* KPI Metric Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Service Calls */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Inquiries</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalIncidents}</span>
            <span className="text-[10px] font-bold text-indigo-600">Dual Sheet</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Cross-system service events</p>
        </div>

        {/* Open Incidents Backlog */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Open Incidents</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-600">{openIncidents}</span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-md">
              In Field
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Pending engineer signoff</p>
        </div>

        {/* Compressor Calls */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Compressor Calls</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Gauge className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{compressorCount}</span>
            <span className="text-[10px] font-bold text-blue-600">{customerMetrics.length} Clients</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Industrial unit calls</p>
        </div>

        {/* Dispenser Calls */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Dispenser Calls</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{dispenserCount}</span>
            <span className="text-[10px] font-bold text-teal-600">Retail Stations</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Dispenser maintenance logs</p>
        </div>
      </div>

      {/* GRAPHICAL DATA VIEW */}
      {showGraphical && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Upgraded Dual-Sheet Inflow Timeline */}
          <DualSheetTimeline
            incidents={incidents}
            selectedTimelineBucket={selectedTimelineBucket}
            onSelectTimelineBucket={setSelectedTimelineBucket}
            isExpanded={isExpandedTimeline}
            onToggleExpand={() => setIsExpandedTimeline(!isExpandedTimeline)}
          />

          {/* Chart 2: Equipment Split & Failure Pareto (adjusts if expanded) */}
          <div className={`${isExpandedTimeline ? 'lg:col-span-3' : 'lg:col-span-1'} bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between`}>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                Equipment Distribution
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Volume proportion between sheets
              </p>
            </div>

            <div className={`${isExpandedTimeline ? 'h-52' : 'h-44'} w-full`}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={equipmentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isExpandedTimeline ? 56 : 44}
                    outerRadius={isExpandedTimeline ? 82 : 68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {equipmentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              {equipmentPieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-700 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {item.value} ({Math.round((item.value / (totalIncidents || 1)) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Module Shortcuts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Zone Analysis Card */}
        <div 
          onClick={() => onNavigateToTab('zones')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-indigo-400 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <MapPin className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mt-3">Zone Analysis</h4>
            <p className="text-xs text-slate-500 mt-1">
              Analyze regional workload across 5 operational territories, SLA benchmarks, and dispatch speeds.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold">
            <span>Explore 5 Zones</span>
            <span>&rarr;</span>
          </div>
        </div>

        {/* Engineer Analysis Card */}
        <div 
          onClick={() => onNavigateToTab('engineers')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-emerald-400 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Users className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mt-3">Engineer Analysis</h4>
            <p className="text-xs text-slate-500 mt-1">
              Evaluate field engineer resolution velocity (MTTR), SLA compliance, CSAT rating, and workload splits.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-semibold">
            <span>Explore {engineerMetrics.length} Technicians</span>
            <span>&rarr;</span>
          </div>
        </div>

        {/* Customer Analysis Card (Only Compressor) */}
        <div 
          onClick={() => onNavigateToTab('customers')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mt-3">Customer Analysis (Compressor)</h4>
            <p className="text-xs text-slate-500 mt-1">
              Dedicated analysis for compressor industrial accounts, AMC contract SLA breakdown, and asset serial tracking.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold">
            <span>Explore Accounts</span>
            <span>&rarr;</span>
          </div>
        </div>
      </div>

      {/* TABULAR DATA VIEW */}
      {showTabular && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-indigo-600" />
                Unified Dual-Sheet Incident Master Registry
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete operational log uniting Compressor & Dispenser Google Sheet streams
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => {
                    setTableSearch(e.target.value);
                    setTablePage(1);
                  }}
                  placeholder="Filter customer, station, problem..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-52 sm:w-64"
                />
              </div>
            </div>
          </div>

          {/* Active Timeline Filter Notice */}
          {selectedTimelineBucket && (
            <div className="flex items-center justify-between bg-indigo-50/80 border border-indigo-200 px-3.5 py-2.5 rounded-xl text-xs text-indigo-950">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Filtering Master Registry by timeline bucket:{' '}
                  <strong className="font-semibold">{selectedTimelineBucket.fullDate}</strong> &mdash;{' '}
                  <span className="font-semibold text-indigo-700 font-mono">{filteredTableIncidents.length} incidents</span>{' '}
                  ({selectedTimelineBucket.compressor} Compressor, {selectedTimelineBucket.dispenser} Dispenser)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTimelineBucket(null)}
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-2xs hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Reset Date Filter
              </button>
            </div>
          )}

          {/* Table Container - Virtual Windowed or Standard Paginated */}
          {filteredTableIncidents.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              No service incidents found matching "{tableSearch}". Try adjusting your search query or reset active filters.
            </div>
          ) : tablePageSize === 'virtual' ? (
            <div 
              ref={virtualScroll.containerRef} 
              className="overflow-x-auto max-h-[580px] overflow-y-auto border border-slate-200/90 rounded-xl shadow-inner scrollbar-thin"
            >
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 shadow-xs">
                  <tr className="text-slate-600 font-semibold">
                    <th className="py-3 px-3 bg-slate-50">Date</th>
                    <th className="py-3 px-3 bg-slate-50">Source Sheet</th>
                    <th className="py-3 px-3 bg-slate-50">Customer / Station</th>
                    <th className="py-3 px-3 bg-slate-50">Zone / Area</th>
                    <th className="py-3 px-3 bg-slate-50">Asset Serial / Model</th>
                    <th className="py-3 px-3 bg-slate-50">Reported Problem</th>
                    <th className="py-3 px-3 bg-slate-50">Engineer Lead</th>
                    <th className="py-3 px-3 text-center bg-slate-50">Status</th>
                    <th className="py-3 px-3 bg-slate-50">WhatsApp Sender</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {virtualScroll.topPadding > 0 && (
                    <tr style={{ height: `${virtualScroll.topPadding}px` }}>
                      <td colSpan={9} className="p-0 border-0" />
                    </tr>
                  )}
                  {virtualScroll.virtualItems.map(({ index }) => {
                    const inc = filteredTableIncidents[index];
                    if (!inc) return null;
                    return (
                      <tr 
                        key={inc.id} 
                        onClick={() => setSelectedIncident(inc)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer h-[48px]"
                      >
                        <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">{inc.date}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inc.equipmentType === 'Compressor' 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : 'bg-teal-50 text-teal-700 border border-teal-200'
                          }`}>
                            {inc.equipmentType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{inc.entityName}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                            {inc.zoneOrArea}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 truncate max-w-[120px]" title={inc.assetIdentifier}>
                          {inc.assetIdentifier}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800 max-w-xs truncate" title={inc.problem}>
                          {inc.problem}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">{inc.engineer}</td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            inc.status === 'Closed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {inc.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px] flex items-center gap-1 whitespace-nowrap">
                          <MessageSquare className="w-3 h-3 text-emerald-600 shrink-0" />
                          {inc.senderNumber}
                        </td>
                      </tr>
                    );
                  })}
                  {virtualScroll.bottomPadding > 0 && (
                    <tr style={{ height: `${virtualScroll.bottomPadding}px` }}>
                      <td colSpan={9} className="p-0 border-0" />
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200/90 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/70 border-b border-slate-200">
                  <tr className="text-slate-500 font-semibold">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Source Sheet</th>
                    <th className="py-3 px-3">Customer / Station</th>
                    <th className="py-3 px-3">Zone / Area</th>
                    <th className="py-3 px-3">Asset Serial / Model</th>
                    <th className="py-3 px-3">Reported Problem</th>
                    <th className="py-3 px-3">Engineer Lead</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3">WhatsApp Sender</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedIncidents.map((inc) => (
                    <tr 
                      key={inc.id} 
                      onClick={() => setSelectedIncident(inc)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">{inc.date}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inc.equipmentType === 'Compressor' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-teal-50 text-teal-700 border border-teal-200'
                        }`}>
                          {inc.equipmentType}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">{inc.entityName}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                          {inc.zoneOrArea}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 truncate max-w-[120px]" title={inc.assetIdentifier}>
                        {inc.assetIdentifier}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800 max-w-xs truncate" title={inc.problem}>
                        {inc.problem}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800 whitespace-nowrap">{inc.engineer}</td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          inc.status === 'Closed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inc.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 text-[11px] flex items-center gap-1 whitespace-nowrap">
                        <MessageSquare className="w-3 h-3 text-emerald-600 shrink-0" />
                        {inc.senderNumber}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Client-Side Pagination and Virtual Window Controls */}
          <PaginationControls
            currentPage={tablePage}
            totalPages={totalTablePages}
            pageSize={tablePageSize}
            totalItems={totalTableItems}
            startIndex={(tablePage - 1) * numericPageSize}
            endIndex={tablePageSize === 'virtual' ? totalTableItems : Math.min(tablePage * numericPageSize, totalTableItems)}
            onPageChange={(page) => setTablePage(page)}
            onPageSizeChange={(newSize) => {
              setTablePageSize(newSize);
              setTablePage(1);
            }}
            itemLabel="service incidents"
            virtualVisibleCount={virtualScroll.visibleCount}
          />
        </div>
      )}

      {/* Incident Detail Drawer/Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedIncident.equipmentType === 'Compressor' ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800'
                }`}>
                  {selectedIncident.equipmentType} Log
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedIncident.entityName}</h3>
                <p className="text-xs text-slate-500">{selectedIncident.zoneOrArea} &bull; {selectedIncident.date}</p>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-slate-500">Asset Serial / Model</div>
                <div className="font-mono font-bold text-slate-900 mt-0.5">{selectedIncident.assetIdentifier}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-slate-500">Contract / Service Type</div>
                <div className="font-bold text-slate-900 mt-0.5">{selectedIncident.contractOrServiceType}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-slate-500">Assigned Engineer</div>
                <div className="font-bold text-slate-900 mt-0.5">{selectedIncident.engineer}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-slate-500">WhatsApp Message ID</div>
                <div className="font-mono text-slate-700 mt-0.5">{selectedIncident.whatsappMessageId}</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="text-slate-500 font-semibold mb-1">Reported Issue Description:</div>
              <div className="text-slate-900 font-medium">{selectedIncident.problem}</div>
              {selectedIncident.notes && (
                <div className="mt-2 text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                  {selectedIncident.notes}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs"
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
