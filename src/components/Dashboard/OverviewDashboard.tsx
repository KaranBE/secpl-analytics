import React, { useState, useMemo } from 'react';
import { 
  UnifiedIncidentRecord, 
  CompressorRecord, 
  DispenserSheetRecord, 
  ZoneMetric, 
  EngineerMetric, 
  CustomerMetric, 
  ViewMode 
} from '../../types';
import { buildTimelineData } from '../../utils/dateUtils';
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
  Download,
  Table as TableIcon,
  BarChart3,
  Layers,
  MessageSquare,
  Wrench,
  Gauge
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
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
  const [selectedIncident, setSelectedIncident] = useState<UnifiedIncidentRecord | null>(null);
  const [timelineChartType, setTimelineChartType] = useState<'area' | 'bar'>('area');
  const [isTimelineStacked, setIsTimelineStacked] = useState<boolean>(true);

  // Overall Statistics
  const totalIncidents = incidents.length;
  const closedIncidents = incidents.filter(i => i.status === 'Closed').length;
  const openIncidents = totalIncidents - closedIncidents;
  const resolutionRate = totalIncidents > 0 ? ((closedIncidents / totalIncidents) * 100).toFixed(1) : '100';

  const compressorCount = incidents.filter(i => i.equipmentType === 'Compressor').length;
  const dispenserCount = incidents.filter(i => i.equipmentType === 'Dispenser').length;

  // Aggregate timeline data with robust date normalization and chronological ordering
  const { 
    timeline: timelineData, 
    peakDay, 
    avgDaily, 
    totalCompressor, 
    totalDispenser, 
    totalInflow 
  } = useMemo(() => buildTimelineData(incidents), [incidents]);

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



  // Table filtering
  const filteredTableIncidents = incidents.filter(i => 
    i.entityName.toLowerCase().includes(tableSearch.toLowerCase()) ||
    i.zoneOrArea.toLowerCase().includes(tableSearch.toLowerCase()) ||
    i.assetIdentifier.toLowerCase().includes(tableSearch.toLowerCase()) ||
    i.problem.toLowerCase().includes(tableSearch.toLowerCase()) ||
    i.engineer.toLowerCase().includes(tableSearch.toLowerCase()) ||
    i.senderNumber.includes(tableSearch) ||
    i.whatsappMessageId.toLowerCase().includes(tableSearch.toLowerCase())
  );

  const showGraphical = viewMode === 'both' || viewMode === 'graphical';
  const showTabular = viewMode === 'both' || viewMode === 'tabular';

  const exportCSV = () => {
    const headers = ['ID,Date,Equipment,Customer or Station,Zone,Asset / Model,Problem,Assigned Engineer,Status,Contract / Service Type,WhatsApp Sender'];
    const rows = filteredTableIncidents.map(i => 
      `"${i.id}","${i.date}","${i.equipmentType}","${i.entityName}","${i.zoneOrArea}","${i.assetIdentifier}","${i.problem}","${i.engineer}","${i.status}","${i.contractOrServiceType}","${i.senderNumber}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `unified_incident_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          {/* Chart 1: Timeline Trend Curve */}
          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    Dual-Sheet Incident Inflow Timeline
                  </h3>
                  <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                    {totalInflow} Tickets
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chronological ticket inflow across Compressor (Sheet 1) & Dispenser (Sheet 2)
                </p>
              </div>

              {/* Badges & Chart Mode Toggles */}
              <div className="flex flex-wrap items-center gap-2">
                {peakDay && (
                  <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium bg-amber-50/80 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-200/60" title={`Peak inflow date: ${peakDay.date}`}>
                    <Flame className="w-3 h-3 text-amber-500" />
                    <span>Peak: <strong className="font-semibold">{peakDay.count}</strong> ({peakDay.label})</span>
                  </div>
                )}
                {avgDaily > 0 && (
                  <div className="hidden md:flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/70">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Avg: <strong className="font-semibold">{avgDaily}</strong>/day</span>
                  </div>
                )}

                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-xs">
                  <button
                    type="button"
                    onClick={() => setTimelineChartType('area')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      timelineChartType === 'area'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Area spline chart"
                  >
                    Area
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimelineChartType('bar')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      timelineChartType === 'bar'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Grouped bar chart"
                  >
                    Bars
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsTimelineStacked(!isTimelineStacked)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                    isTimelineStacked
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Toggle stacked view"
                >
                  {isTimelineStacked ? 'Stacked' : 'Side-by-Side'}
                </button>
              </div>
            </div>

            <div className="h-64 w-full">
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
                  {timelineChartType === 'area' ? (
                    <AreaChart data={timelineData} margin={{ top: 12, right: 15, left: -5, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02}/>
                        </linearGradient>
                        <linearGradient id="colorDisp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.02}/>
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
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0]?.payload;
                            if (!data) return null;
                            const comp = data.compressor || 0;
                            const disp = data.dispenser || 0;
                            const tot = data.total || (comp + disp);
                            const compPct = tot > 0 ? Math.round((comp / tot) * 100) : 0;
                            const dispPct = tot > 0 ? Math.round((disp / tot) * 100) : 0;

                            return (
                              <div className="bg-white/95 backdrop-blur-md px-3.5 py-3 rounded-xl shadow-lg border border-slate-200 text-xs min-w-[210px]">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                                  <span className="font-semibold text-slate-800">{data.fullDate}</span>
                                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px]">
                                    {tot} {tot === 1 ? 'ticket' : 'tickets'}
                                  </span>
                                </div>
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-600">
                                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
                                      <span>Compressors (Sheet 1):</span>
                                    </div>
                                    <div className="font-semibold text-slate-900 font-mono">
                                      {comp} <span className="text-[10px] text-slate-400 font-normal">({compPct}%)</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-600">
                                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                                      <span>Dispensers (Sheet 2):</span>
                                    </div>
                                    <div className="font-semibold text-slate-900 font-mono">
                                      {disp} <span className="text-[10px] text-slate-400 font-normal">({dispPct}%)</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
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
                        name="Compressor Sheet" 
                        stroke="#4f46e5" 
                        strokeWidth={2}
                        stackId={isTimelineStacked ? "1" : undefined}
                        fillOpacity={1} 
                        fill="url(#colorComp)" 
                        dot={{ r: 3, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 1.5 }}
                        activeDot={{ r: 5, fill: '#4f46e5' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="dispenser" 
                        name="Dispenser Sheet" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        stackId={isTimelineStacked ? "1" : undefined}
                        fillOpacity={1} 
                        fill="url(#colorDisp)" 
                        dot={{ r: 3, fill: '#10b981', stroke: '#ffffff', strokeWidth: 1.5 }}
                        activeDot={{ r: 5, fill: '#10b981' }}
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={timelineData} margin={{ top: 12, right: 15, left: -5, bottom: 5 }}>
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
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0]?.payload;
                            if (!data) return null;
                            const comp = data.compressor || 0;
                            const disp = data.dispenser || 0;
                            const tot = data.total || (comp + disp);
                            const compPct = tot > 0 ? Math.round((comp / tot) * 100) : 0;
                            const dispPct = tot > 0 ? Math.round((disp / tot) * 100) : 0;

                            return (
                              <div className="bg-white/95 backdrop-blur-md px-3.5 py-3 rounded-xl shadow-lg border border-slate-200 text-xs min-w-[210px]">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                                  <span className="font-semibold text-slate-800">{data.fullDate}</span>
                                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px]">
                                    {tot} {tot === 1 ? 'ticket' : 'tickets'}
                                  </span>
                                </div>
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-600">
                                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
                                      <span>Compressors (Sheet 1):</span>
                                    </div>
                                    <div className="font-semibold text-slate-900 font-mono">
                                      {comp} <span className="text-[10px] text-slate-400 font-normal">({compPct}%)</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-600">
                                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                                      <span>Dispensers (Sheet 2):</span>
                                    </div>
                                    <div className="font-semibold text-slate-900 font-mono">
                                      {disp} <span className="text-[10px] text-slate-400 font-normal">({dispPct}%)</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={32} 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', paddingTop: '0px' }}
                      />
                      <Bar 
                        dataKey="compressor" 
                        name="Compressor Sheet" 
                        fill="#4f46e5" 
                        stackId={isTimelineStacked ? "1" : undefined}
                        radius={isTimelineStacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="dispenser" 
                        name="Dispenser Sheet" 
                        fill="#10b981" 
                        stackId={isTimelineStacked ? "1" : undefined}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 2: Equipment Split & Failure Pareto */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                Equipment Distribution
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Volume proportion between sheets
              </p>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={equipmentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={44}
                    outerRadius={68}
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
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="Filter customer, station, problem..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-52 sm:w-64"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70">
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
                {filteredTableIncidents.map((inc) => (
                  <tr 
                    key={inc.id} 
                    onClick={() => setSelectedIncident(inc)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3 font-mono text-slate-600">{inc.date}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inc.equipmentType === 'Compressor' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'bg-teal-50 text-teal-700 border border-teal-200'
                      }`}>
                        {inc.equipmentType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">{inc.entityName}</td>
                    <td className="py-3 px-3">
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
                    <td className="py-3 px-3 font-semibold text-slate-800">{inc.engineer}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        inc.status === 'Closed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500 text-[11px] flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-emerald-600" />
                      {inc.senderNumber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
