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
  buildTimelineData, 
  normalizeDateToISO,
  TimelineGranularity, 
  TimelineRangePreset, 
  TimelineDataPoint 
} from '../../utils/dateUtils';
import { useVirtualScroll } from '../../utils/useVirtualScroll';
import { PaginationControls, PageSizeMode } from '../common/PaginationControls';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
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
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  ComposedChart,
  Line,
  ReferenceLine,
  Brush,
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend,
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

interface TimelineCustomTooltipProps {
  active?: boolean;
  payload?: any[];
  isCumulative?: boolean;
}

const TimelineCustomTooltip: React.FC<TimelineCustomTooltipProps> = ({ active, payload, isCumulative }) => {
  if (active && payload && payload.length) {
    const data: TimelineDataPoint = payload[0]?.payload;
    if (!data) return null;
    const comp = data.compressor || 0;
    const disp = data.dispenser || 0;
    const tot = data.total || (comp + disp);
    const compPct = tot > 0 ? Math.round((comp / tot) * 100) : 0;
    const dispPct = tot > 0 ? Math.round((disp / tot) * 100) : 0;

    return (
      <div className="bg-white/95 backdrop-blur-md px-4 py-3.5 rounded-2xl shadow-xl border border-slate-200 text-xs min-w-[240px] max-w-[280px]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
          <div>
            <span className="font-bold text-slate-900 block text-xs">{data.fullDate}</span>
            <span className="text-[10px] text-slate-400 font-medium">Timeline Inflow Snapshot</span>
          </div>
          <span className="font-bold text-slate-900 bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-mono text-xs">
            {isCumulative ? `${data.cumulativeTotal} Cumul.` : `${tot} ${tot === 1 ? 'ticket' : 'tickets'}`}
          </span>
        </div>

        {isCumulative ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                <span>Cumulative Compressors:</span>
              </div>
              <span className="font-mono font-bold text-slate-900">{data.cumulativeCompressor}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Cumulative Dispensers:</span>
              </div>
              <span className="font-mono font-bold text-slate-900">{data.cumulativeDispenser}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 font-semibold text-slate-800">
              <span>Trajectory Total:</span>
              <span className="font-mono text-indigo-600">{data.cumulativeTotal}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Split Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                  <span>Compressors (Sheet 1):</span>
                </div>
                <div className="font-semibold text-slate-900 font-mono">
                  {comp} <span className="text-[10px] text-slate-400 font-normal">({compPct}%)</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                <div className="bg-indigo-600 h-full transition-all" style={{ width: `${compPct}%` }}></div>
                <div className="bg-emerald-500 h-full transition-all" style={{ width: `${dispPct}%` }}></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Dispensers (Sheet 2):</span>
              </div>
              <div className="font-semibold text-slate-900 font-mono">
                {disp} <span className="text-[10px] text-slate-400 font-normal">({dispPct}%)</span>
              </div>
            </div>

            {data.movingAverage !== undefined && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                <span className="text-amber-700 font-medium">Rolling Avg Trend:</span>
                <span className="font-mono font-bold text-amber-800">{data.movingAverage} / period</span>
              </div>
            )}

            {/* Root Cause & Hotspot Context */}
            {(data.topProblem || data.topZone) && (
              <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px]">
                {data.topProblem && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Top Issue:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[150px]" title={data.topProblem}>
                      {data.topProblem} {data.topProblemCount ? `(${data.topProblemCount})` : ''}
                    </span>
                  </div>
                )}
                {data.topZone && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Key Hotspot:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[150px]" title={data.topZone}>
                      {data.topZone} {data.topZoneCount ? `(${data.topZoneCount})` : ''}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-indigo-600 font-medium">
          <span>Click to drill-down table</span>
          <span>&rarr;</span>
        </div>
      </div>
    );
  }
  return null;
};

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

  // Enhanced Timeline States
  const [timelineChartType, setTimelineChartType] = useState<'composed' | 'area' | 'bar' | 'cumulative'>('composed');
  const [timelineGranularity, setTimelineGranularity] = useState<TimelineGranularity>('daily');
  const [timelineRange, setTimelineRange] = useState<TimelineRangePreset>('all');
  const [isTimelineStacked, setIsTimelineStacked] = useState<boolean>(true);
  const [showMovingAverage, setShowMovingAverage] = useState<boolean>(true);
  const [showBrush, setShowBrush] = useState<boolean>(false);
  const [showReferenceLine, setShowReferenceLine] = useState<boolean>(true);
  const [selectedTimelineKey, setSelectedTimelineKey] = useState<string | null>(null);
  const [isExpandedTimeline, setIsExpandedTimeline] = useState<boolean>(false);

  // Overall Statistics
  const totalIncidents = incidents.length;
  const closedIncidents = incidents.filter(i => i.status === 'Closed').length;
  const openIncidents = totalIncidents - closedIncidents;
  const resolutionRate = totalIncidents > 0 ? ((closedIncidents / totalIncidents) * 100).toFixed(1) : '100';

  const compressorCount = incidents.filter(i => i.equipmentType === 'Compressor').length;
  const dispenserCount = incidents.filter(i => i.equipmentType === 'Dispenser').length;

  // Aggregate timeline data with robust date normalization, granularity, and chronological ordering
  const { 
    timeline: timelineData, 
    peakDay, 
    avgDaily, 
    totalCompressor, 
    totalDispenser, 
    totalInflow,
    velocityTrendPct,
    dominantEquipment
  } = useMemo(() => buildTimelineData(incidents, {
    granularity: timelineGranularity,
    range: timelineRange
  }), [incidents, timelineGranularity, timelineRange]);

  // Selected timeline bucket for drill-down table filtering
  const selectedTimelineBucket = useMemo(() => {
    if (!selectedTimelineKey) return null;
    return timelineData.find(pt => pt.dateKey === selectedTimelineKey) || null;
  }, [selectedTimelineKey, timelineData]);

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

  const handleChartClick = (state: any) => {
    if (state?.activePayload?.[0]?.payload?.dateKey) {
      const clickedKey = state.activePayload[0].payload.dateKey;
      setSelectedTimelineKey(prev => prev === clickedKey ? null : clickedKey);
    }
  };

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
          <div className={`${isExpandedTimeline ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all duration-200`}>
            
            {/* 1. Header & Quick Actions */}
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      Dual-Sheet Incident Inflow Timeline
                    </h3>
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      {totalInflow} Total Inflow
                    </span>
                    {dominantEquipment !== 'Balanced' && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        dominantEquipment === 'Compressor'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {dominantEquipment}-Heavy Inflow
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chronological volume comparison & rate-of-change across Compressor (Sheet 1) & Dispenser (Sheet 2)
                  </p>
                </div>

                {/* Right controls: Range presets, Expand toggle */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Time Range Selector */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-[11px] font-semibold">
                    {(['all', '90d', '30d', '14d', '7d'] as const).map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setTimelineRange(r)}
                        className={`px-2 py-1 rounded-md transition-all uppercase ${
                          timelineRange === r
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title={`Filter to ${r === 'all' ? 'entire timeline' : `past ${r}`}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  {/* Expand / Minimize Width */}
                  <button
                    type="button"
                    onClick={() => setIsExpandedTimeline(!isExpandedTimeline)}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg transition-colors"
                    title={isExpandedTimeline ? "Restore standard width" : "Expand to full width"}
                  >
                    {isExpandedTimeline ? <Minimize2 className="w-3.5 h-3.5 text-slate-600" /> : <Maximize2 className="w-3.5 h-3.5 text-slate-600" />}
                  </button>
                </div>
              </div>

              {/* 2. Key Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 pt-2 border-t border-slate-100">
                <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-2 flex flex-col justify-center">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Dual Streams</span>
                  <div className="flex items-center gap-2 mt-0.5 text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1 text-indigo-700 font-mono">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      {totalCompressor} <span className="text-[10px] text-slate-400 font-normal">({totalInflow > 0 ? Math.round((totalCompressor / totalInflow) * 100) : 0}%)</span>
                    </span>
                    <span className="text-slate-300">/</span>
                    <span className="flex items-center gap-1 text-emerald-700 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {totalDispenser} <span className="text-[10px] text-slate-400 font-normal">({totalInflow > 0 ? Math.round((totalDispenser / totalInflow) * 100) : 0}%)</span>
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-2 flex flex-col justify-center">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Avg Run-Rate</span>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs font-bold text-slate-800">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-slate-900">{avgDaily}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      tickets / {timelineGranularity === 'daily' ? 'day' : timelineGranularity === 'weekly' ? 'wk' : 'mo'}
                    </span>
                  </div>
                </div>

                {peakDay && (
                  <button 
                    type="button"
                    onClick={() => setSelectedTimelineKey(prev => prev === peakDay.date ? null : peakDay.date)}
                    className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2 flex flex-col justify-center text-left hover:bg-amber-100/60 transition-colors group cursor-pointer"
                    title="Click to filter table to peak day"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-amber-800 font-semibold uppercase tracking-wider flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-500" /> Peak Spike
                      </span>
                      <span className="text-[9px] text-amber-600 font-bold group-hover:underline">Filter</span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-0.5 text-xs font-bold text-amber-950 font-mono">
                      <span>{peakDay.count} tickets</span>
                      <span className="text-[10px] font-sans text-amber-700 font-medium">({peakDay.label})</span>
                    </div>
                  </button>
                )}

                <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-2 flex flex-col justify-center">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Velocity Shift</span>
                  <div className="flex items-center gap-1 mt-0.5 text-xs font-bold font-mono">
                    {velocityTrendPct >= 0 ? (
                      <span className="flex items-center gap-0.5 text-emerald-600">
                        <TrendingUp className="w-3.5 h-3.5" />
                        +{velocityTrendPct}%
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-blue-600">
                        <TrendingDown className="w-3.5 h-3.5" />
                        {velocityTrendPct}%
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-normal font-sans">vs prior half</span>
                  </div>
                </div>

                <div className="hidden lg:flex bg-slate-50/80 border border-slate-100 rounded-xl p-2 flex-col justify-center">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Time Windows</span>
                  <div className="flex items-center gap-1 mt-0.5 text-xs font-bold text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{timelineData.length} {timelineGranularity} buckets</span>
                  </div>
                </div>
              </div>

              {/* 3. Graph Controls Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                {/* Left: Chart Style Picker */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
                    <SlidersHorizontal className="w-3 h-3 text-slate-400" /> Mode:
                  </span>
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setTimelineChartType('composed')}
                      className={`px-2 py-1 rounded-md transition-all ${
                        timelineChartType === 'composed'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Combo: Dual-sheet bars with 7-period rolling average line"
                    >
                      Combo Trend
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimelineChartType('area')}
                      className={`px-2 py-1 rounded-md transition-all ${
                        timelineChartType === 'area'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Smooth layered spline area waves"
                    >
                      Smooth Area
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimelineChartType('bar')}
                      className={`px-2 py-1 rounded-md transition-all ${
                        timelineChartType === 'bar'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Classic grouped / stacked bar columns"
                    >
                      Bars
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimelineChartType('cumulative')}
                      className={`px-2 py-1 rounded-md transition-all ${
                        timelineChartType === 'cumulative'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Cumulative inflow trajectory (S-Curve growth)"
                    >
                      Cumulative
                    </button>
                  </div>

                  {/* Stacking toggle (applicable for composed, area, bar) */}
                  {timelineChartType !== 'cumulative' && (
                    <button
                      type="button"
                      onClick={() => setIsTimelineStacked(!isTimelineStacked)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                        isTimelineStacked
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                      title="Toggle between Stacked and Side-by-Side comparison"
                    >
                      {isTimelineStacked ? 'Stacked' : 'Grouped'}
                    </button>
                  )}
                </div>

                {/* Right: Granularity tabs & visual feature toggles */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Granularity Switcher */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-[11px] font-semibold">
                    {(['daily', 'weekly', 'monthly'] as const).map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setTimelineGranularity(g)}
                        className={`px-2 py-1 rounded-md capitalize transition-all ${
                          timelineGranularity === g
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title={`Aggregate incidents by ${g}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>

                  {/* Moving Average Line toggle (for composed/area) */}
                  {timelineChartType !== 'cumulative' && (
                    <button
                      type="button"
                      onClick={() => setShowMovingAverage(!showMovingAverage)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                        showMovingAverage
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                      title="Toggle 7-period rolling average trendline"
                    >
                      Trendline
                    </button>
                  )}

                  {/* Average Run-rate Reference Line Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowReferenceLine(!showReferenceLine)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                      showReferenceLine
                        ? 'bg-slate-200/80 border-slate-300 text-slate-800'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                    title="Toggle horizontal average run-rate reference line"
                  >
                    Avg Line
                  </button>

                  {/* Zoom Brush slider toggle */}
                  <button
                    type="button"
                    onClick={() => setShowBrush(!showBrush)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                      showBrush
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                    title="Toggle interactive zoom range slider"
                  >
                    Zoom Slider
                  </button>
                </div>
              </div>

              {/* 4. Active Date Filter Banner (if drill-down is clicked) */}
              {selectedTimelineBucket && (
                <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200/80 px-3 py-1.5 rounded-xl text-xs text-indigo-900 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>
                      Filtered to <strong>{selectedTimelineBucket.fullDate}</strong>:{' '}
                      <span className="font-semibold text-indigo-700 font-mono">{selectedTimelineBucket.total} incidents</span>{' '}
                      ({selectedTimelineBucket.compressor} Compressor, {selectedTimelineBucket.dispenser} Dispenser)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTimelineKey(null)}
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-white px-2 py-0.5 rounded-lg border border-indigo-200 shadow-2xs hover:bg-indigo-50 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Clear Filter
                  </button>
                </div>
              )}
            </div>

            {/* 5. The Chart Canvas Viewport */}
            <div className={`w-full ${isExpandedTimeline ? 'h-96 sm:h-[420px]' : 'h-80 sm:h-96'} transition-all`}>
              {timelineData.length === 0 ? (
                <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-700 text-sm">No ticket inflow logged for selected period</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    No tickets match the active date, equipment, or zone filters. Adjust the filters above to view timeline trends.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {/* Mode 1: Composed Chart (Bars + Rolling Trendline) */}
                  {timelineChartType === 'composed' ? (
                    <ComposedChart 
                      data={timelineData} 
                      margin={{ top: 14, right: 20, left: -5, bottom: showBrush ? 25 : 8 }}
                      onClick={handleChartClick}
                    >
                      <defs>
                        <linearGradient id="compGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.95} />
                          <stop offset="100%" stopColor="#4338ca" stopOpacity={0.8} />
                        </linearGradient>
                        <linearGradient id="dispGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.95} />
                          <stop offset="100%" stopColor="#047857" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="displayDate" 
                        tick={{ fontSize: 11, fill: '#64748b' }} 
                        minTickGap={16}
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis 
                        allowDecimals={false} 
                        domain={[0, 'auto']} 
                        tick={{ fontSize: 11, fill: '#64748b' }} 
                        width={35}
                        tickLine={false}
                        axisLine={false}
                      />
                      {showReferenceLine && avgDaily > 0 && (
                        <ReferenceLine 
                          y={avgDaily} 
                          stroke="#94a3b8" 
                          strokeDasharray="4 4" 
                          strokeWidth={1.5}
                          label={{ 
                            value: `Avg: ${avgDaily}`, 
                            position: 'insideTopRight', 
                            fill: '#64748b', 
                            fontSize: 10,
                            fontWeight: 600
                          }} 
                        />
                      )}
                      <Tooltip 
                        content={({ active, payload }) => (
                          <TimelineCustomTooltip active={active} payload={payload} />
                        )}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={32} 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', paddingTop: '0px' }}
                      />
                      <Bar 
                        dataKey="compressor" 
                        name="Compressors (Sheet 1)" 
                        fill="url(#compGradient)" 
                        stackId={isTimelineStacked ? "1" : undefined}
                        radius={isTimelineStacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                        cursor="pointer"
                      />
                      <Bar 
                        dataKey="dispenser" 
                        name="Dispensers (Sheet 2)" 
                        fill="url(#dispGradient)" 
                        stackId={isTimelineStacked ? "1" : undefined}
                        radius={[4, 4, 0, 0]}
                        cursor="pointer"
                      />
                      {showMovingAverage && (
                        <Line 
                          type="monotone" 
                          dataKey="movingAverage" 
                          name="Rolling Avg Trend" 
                          stroke="#f59e0b" 
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 5, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                        />
                      )}
                      {showBrush && (
                        <Brush 
                          dataKey="displayDate" 
                          height={28} 
                          stroke="#6366f1" 
                          fill="#f8fafc"
                          travellerWidth={10}
                        />
                      )}
                    </ComposedChart>
                  ) : timelineChartType === 'area' ? (
                    /* Mode 2: Area Spline Chart */
                    <AreaChart 
                      data={timelineData} 
                      margin={{ top: 14, right: 20, left: -5, bottom: showBrush ? 25 : 8 }}
                      onClick={handleChartClick}
                    >
                      <defs>
                        <linearGradient id="colorCompArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.45}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.03}/>
                        </linearGradient>
                        <linearGradient id="colorDispArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.45}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.03}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="displayDate" 
                        tick={{ fontSize: 11, fill: '#64748b' }} 
                        minTickGap={16}
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis 
                        allowDecimals={false} 
                        domain={[0, 'auto']} 
                        tick={{ fontSize: 11, fill: '#64748b' }} 
                        width={35}
                        tickLine={false}
                        axisLine={false}
                      />
                      {showReferenceLine && avgDaily > 0 && (
                        <ReferenceLine 
                          y={avgDaily} 
                          stroke="#94a3b8" 
                          strokeDasharray="4 4" 
                          strokeWidth={1.5}
                          label={{ value: `Avg: ${avgDaily}`, position: 'insideTopRight', fill: '#64748b', fontSize: 10 }} 
                        />
                      )}
                      <Tooltip 
                        content={({ active, payload }) => (
                          <TimelineCustomTooltip active={active} payload={payload} />
                        )}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={32} 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', paddingTop: '0px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="compressor" 
                        name="Compressors (Sheet 1)" 
                        stroke="#4f46e5" 
                        strokeWidth={2}
                        stackId={isTimelineStacked ? "1" : undefined}
                        fillOpacity={1} 
                        fill="url(#colorCompArea)" 
                        dot={{ r: 3, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 1.5 }}
                        activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="dispenser" 
                        name="Dispensers (Sheet 2)" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        stackId={isTimelineStacked ? "1" : undefined}
                        fillOpacity={1} 
                        fill="url(#colorDispArea)" 
                        dot={{ r: 3, fill: '#10b981', stroke: '#ffffff', strokeWidth: 1.5 }}
                        activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                      />
                      {showMovingAverage && (
                        <Line 
                          type="monotone" 
                          dataKey="movingAverage" 
                          name="Rolling Avg Trend" 
                          stroke="#f59e0b" 
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 5, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                        />
                      )}
                      {showBrush && (
                        <Brush 
                          dataKey="displayDate" 
                          height={28} 
                          stroke="#6366f1" 
                          fill="#f8fafc"
                          travellerWidth={10}
                        />
                      )}
                    </AreaChart>
                  ) : timelineChartType === 'bar' ? (
                    /* Mode 3: Crisp Bar Columns */
                    <BarChart 
                      data={timelineData} 
                      margin={{ top: 14, right: 20, left: -5, bottom: showBrush ? 25 : 8 }}
                      onClick={handleChartClick}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="displayDate" 
                        tick={{ fontSize: 11, fill: '#64748b' }} 
                        minTickGap={16}
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis 
                        allowDecimals={false} 
                        domain={[0, 'auto']} 
                        tick={{ fontSize: 11, fill: '#64748b' }} 
                        width={35}
                        tickLine={false}
                        axisLine={false}
                      />
                      {showReferenceLine && avgDaily > 0 && (
                        <ReferenceLine 
                          y={avgDaily} 
                          stroke="#94a3b8" 
                          strokeDasharray="4 4" 
                          strokeWidth={1.5}
                          label={{ value: `Avg: ${avgDaily}`, position: 'insideTopRight', fill: '#64748b', fontSize: 10 }} 
                        />
                      )}
                      <Tooltip 
                        content={({ active, payload }) => (
                          <TimelineCustomTooltip active={active} payload={payload} />
                        )}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={32} 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', paddingTop: '0px' }}
                      />
                      <Bar 
                        dataKey="compressor" 
                        name="Compressors (Sheet 1)" 
                        fill="#4f46e5" 
                        stackId={isTimelineStacked ? "1" : undefined}
                        radius={isTimelineStacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                        cursor="pointer"
                      />
                      <Bar 
                        dataKey="dispenser" 
                        name="Dispensers (Sheet 2)" 
                        fill="#10b981" 
                        stackId={isTimelineStacked ? "1" : undefined}
                        radius={[4, 4, 0, 0]}
                        cursor="pointer"
                      />
                      {showBrush && (
                        <Brush 
                          dataKey="displayDate" 
                          height={28} 
                          stroke="#6366f1" 
                          fill="#f8fafc"
                          travellerWidth={10}
                        />
                      )}
                    </BarChart>
                  ) : (
                    /* Mode 4: Cumulative S-Curve Trajectory */
                    <AreaChart 
                      data={timelineData} 
                      margin={{ top: 14, right: 20, left: -5, bottom: showBrush ? 25 : 8 }}
                      onClick={handleChartClick}
                    >
                      <defs>
                        <linearGradient id="colorCumTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="displayDate" 
                        tick={{ fontSize: 11, fill: '#64748b' }} 
                        minTickGap={16}
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis 
                        allowDecimals={false} 
                        tick={{ fontSize: 11, fill: '#64748b' }} 
                        width={40}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        content={({ active, payload }) => (
                          <TimelineCustomTooltip active={active} payload={payload} isCumulative />
                        )}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={32} 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', paddingTop: '0px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="cumulativeTotal" 
                        name="Cumulative Total" 
                        stroke="#6366f1" 
                        strokeWidth={2.5}
                        fill="url(#colorCumTotal)" 
                        activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cumulativeCompressor" 
                        name="Cumulative Compressors" 
                        stroke="#4338ca" 
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cumulativeDispenser" 
                        name="Cumulative Dispensers" 
                        stroke="#059669" 
                        strokeWidth={2}
                        dot={false}
                      />
                      {showBrush && (
                        <Brush 
                          dataKey="displayDate" 
                          height={28} 
                          stroke="#6366f1" 
                          fill="#f8fafc"
                          travellerWidth={10}
                        />
                      )}
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>

            {/* Bottom Tip for Operational Guidance */}
            <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Click any bar or date point on the graph to filter the incident registry below to that time window.
              </span>
              {selectedTimelineBucket && (
                <span className="text-indigo-600 font-semibold">
                  1 Date active in filter
                </span>
              )}
            </div>
          </div>

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
                onClick={() => setSelectedTimelineKey(null)}
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
