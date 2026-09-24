import React, { useState, useMemo } from 'react';
import { 
  ComposedChart, 
  AreaChart, 
  BarChart, 
  Bar, 
  Area, 
  Line, 
  ReferenceLine, 
  Brush, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Flame, 
  Calendar, 
  Clock, 
  Maximize2, 
  Minimize2, 
  X, 
  Sparkles,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { UnifiedIncidentRecord } from '../../types';
import { 
  buildTimelineData, 
  TimelineGranularity, 
  TimelineDataPoint 
} from '../../utils/dateUtils';

export interface DualSheetTimelineProps {
  incidents: UnifiedIncidentRecord[];
  selectedTimelineBucket: TimelineDataPoint | null;
  onSelectTimelineBucket: (bucket: TimelineDataPoint | null) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export type ChartType = 'composed' | 'area' | 'bar' | 'cumulative';

const TIMELINE_THEME = {
  color: '#10b981',        // Emerald 500
  darkColor: '#059669',    // Emerald 600
  lightBg: 'bg-emerald-50',
  border: 'border-emerald-200',
  text: 'text-emerald-700',
  trendline: '#ea580c',    // Orange 600
  brush: '#10b981'         // Emerald 500
};

interface TimelineTooltipProps {
  active?: boolean;
  payload?: any[];
  isCumulative?: boolean;
}

const TimelineTooltip: React.FC<TimelineTooltipProps> = ({ active, payload, isCumulative }) => {
  if (!active || !payload || !payload.length) return null;
  const data: TimelineDataPoint = payload[0]?.payload;
  if (!data) return null;

  const count = data.dispenser !== undefined ? data.dispenser : data.total || 0;
  const cumulCount = data.cumulativeDispenser !== undefined ? data.cumulativeDispenser : data.cumulativeTotal || 0;

  return (
    <div className="bg-white/95 backdrop-blur-md px-3.5 py-3 rounded-xl shadow-lg border border-slate-200/90 text-xs min-w-[220px] max-w-[260px]">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
        <div>
          <span className="font-bold text-slate-900 block text-xs tracking-tight">{data.fullDate}</span>
          <span className="text-[10px] text-slate-400 font-medium">Dispenser Inflow</span>
        </div>
        <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded text-[11px] font-mono">
          {isCumulative ? `${cumulCount} Cumul.` : `${count} ${count === 1 ? 'complaint' : 'complaints'}`}
        </span>
      </div>

      {isCumulative ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Cumulative Inflow:
            </span>
            <span className="font-mono font-bold text-slate-900">{cumulCount}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Dispenser Complaints:
            </span>
            <span className="font-mono font-bold text-slate-900">{count}</span>
          </div>

          {data.movingAverage !== undefined && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500 font-medium">Rolling Trend:</span>
              <span className="font-mono font-bold text-orange-600">{data.movingAverage} / period</span>
            </div>
          )}

          {(data.topProblem || data.topZone) && (
            <div className="pt-1.5 border-t border-slate-100 space-y-0.5 text-[11px]">
              {data.topProblem && (
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Top Issue:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[140px]" title={data.topProblem}>
                    {data.topProblem}
                  </span>
                </div>
              )}
              {data.topZone && (
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Hotspot:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[140px]" title={data.topZone}>
                    {data.topZone}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="pt-1 border-t border-slate-100/80 text-[10px] text-slate-500 font-medium text-center">
            Click to isolate this date in registry
          </div>
        </div>
      )}
    </div>
  );
};

export const DualSheetTimeline: React.FC<DualSheetTimelineProps> = ({
  incidents,
  selectedTimelineBucket,
  onSelectTimelineBucket,
  isExpanded,
  onToggleExpand
}) => {
  // Chart Display States
  const [chartType, setChartType] = useState<ChartType>('composed');
  const [granularity, setGranularity] = useState<TimelineGranularity>('daily');
  
  // Visual Toggles
  const [showTrendline, setShowTrendline] = useState<boolean>(true);
  const [showAvgLine, setShowAvgLine] = useState<boolean>(false);
  const [showBrush, setShowBrush] = useState<boolean>(false);

  // Settings dropdown popover state
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);

  // Build aggregated data (strictly driven by the main filter bar incidents)
  const { 
    timeline: timelineData, 
    peakDay, 
    avgDaily, 
    totalDispenser, 
    totalInflow
  } = useMemo(() => buildTimelineData(incidents, {
    granularity,
    range: 'all'
  }), [incidents, granularity]);

  // Click on chart bucket
  const handleChartClick = (chartState: any) => {
    if (!chartState || !chartState.activePayload || !chartState.activePayload.length) return;
    const clickedPoint: TimelineDataPoint = chartState.activePayload[0]?.payload;
    if (!clickedPoint) return;

    if (selectedTimelineBucket?.dateKey === clickedPoint.dateKey) {
      onSelectTimelineBucket(null);
    } else {
      onSelectTimelineBucket(clickedPoint);
    }
  };

  const totalCount = incidents.length;

  return (
    <div className={`${isExpanded ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all duration-200`}>
      
      {/* 1. Header: Clean Title & Primary Navigation */}
      <div className="flex flex-col gap-3 mb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Title & Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900">
                  Incident Inflow Timeline
                </h3>
                <span className="text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-md font-mono">
                  {totalCount} Complaints
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Chronological complaint volume across Dispenser service logs
              </p>
            </div>
          </div>

          {/* Right Action Cluster: Maximize */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
            {/* Expand / Minimize Width */}
            <button
              type="button"
              onClick={onToggleExpand}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              title={isExpanded ? "Restore 2-column width" : "Expand to full width"}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 2. Unified Context & Control Ribbon */}
        <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          
          {/* Left: Dispenser Inflow Metric & Key Stats */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Dispenser Indicator Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200/90 text-[11px] font-medium shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-700">Dispenser Complaints:</span>
              <span className="font-mono font-bold text-slate-900">{totalCount}</span>
            </div>

            {/* Run-rate Pill */}
            <div className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-white/80 border border-slate-200/80 rounded-lg text-[11px] text-slate-600">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Avg:</span>
              <span className="font-mono font-bold text-slate-900">{avgDaily}</span>
              <span className="text-[10px] text-slate-400">/{granularity === 'daily' ? 'day' : granularity === 'weekly' ? 'wk' : 'mo'}</span>
            </div>

            {/* Peak Spike Pill */}
            {peakDay && (
              <button
                type="button"
                onClick={() => {
                  if (selectedTimelineBucket?.dateKey === peakDay.date) {
                    onSelectTimelineBucket(null);
                  } else {
                    const found = timelineData.find(pt => pt.dateKey === peakDay.date);
                    if (found) onSelectTimelineBucket(found);
                  }
                }}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
                  selectedTimelineBucket?.dateKey === peakDay.date
                    ? 'bg-amber-100 border-amber-300 text-amber-950 font-bold'
                    : 'bg-amber-50/80 hover:bg-amber-100/80 border-amber-200 text-amber-900'
                }`}
                title="Click to filter to peak inflow period"
              >
                <Flame className="w-3 h-3 text-amber-500" />
                <span className="font-medium">Peak:</span>
                <span className="font-mono font-bold">{peakDay.dispenser || peakDay.count}</span>
                <span className="text-[10px] text-amber-700">({peakDay.label})</span>
              </button>
            )}
          </div>

          {/* Right: Chart Type & Display Options Dropdown */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            {/* Chart Type Segmented Control */}
            <div className="inline-flex items-center bg-slate-200/70 p-0.5 rounded-lg text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setChartType('composed')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  chartType === 'composed'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Combo Trend: Dispenser bars with rolling trendline"
              >
                Combo
              </button>
              <button
                type="button"
                onClick={() => setChartType('area')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  chartType === 'area'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Smooth Area: Layered spline inflow waves"
              >
                Area
              </button>
              <button
                type="button"
                onClick={() => setChartType('bar')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  chartType === 'bar'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Bars: Clean columns"
              >
                Bars
              </button>
              <button
                type="button"
                onClick={() => setChartType('cumulative')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  chartType === 'cumulative'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Cumulative Trajectory: Total accumulated inflow"
              >
                Cumulative
              </button>
            </div>

            {/* Granularity Dropdown / Buttons */}
            <div className="inline-flex items-center bg-slate-200/70 p-0.5 rounded-lg text-[11px] font-semibold">
              {(['daily', 'weekly', 'monthly'] as const).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGranularity(g)}
                  className={`px-2 py-1 rounded-md capitalize transition-all cursor-pointer ${
                    granularity === g
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={`Aggregate by ${g}`}
                >
                  {g === 'daily' ? 'Day' : g === 'weekly' ? 'Wk' : 'Mo'}
                </button>
              ))}
            </div>

            {/* Display Options Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  showSettingsMenu 
                    ? 'bg-slate-100 border-slate-300 text-slate-900' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title="Timeline visual configuration"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Options</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showSettingsMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSettingsMenu(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-20 space-y-1">
                    <div className="px-2 py-1 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Chart Layout
                    </div>

                    {chartType !== 'cumulative' && (
                      <button
                        type="button"
                        onClick={() => setShowTrendline(!showTrendline)}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 text-left cursor-pointer"
                      >
                        <span>Rolling Trendline</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${showTrendline ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>
                          {showTrendline ? 'ON' : 'OFF'}
                        </span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowAvgLine(!showAvgLine)}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 text-left cursor-pointer"
                    >
                      <span>Average Guideline</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${showAvgLine ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-500'}`}>
                        {showAvgLine ? 'ON' : 'OFF'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowBrush(!showBrush)}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 text-left cursor-pointer"
                    >
                      <span>Zoom Slider</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${showBrush ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-500'}`}>
                        {showBrush ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 3. Active Date Filter Banner (Dismissible) */}
        {selectedTimelineBucket && (
          <div className="flex items-center justify-between bg-emerald-50/70 border border-emerald-200/90 px-3 py-1.5 rounded-xl text-xs text-slate-900 transition-all">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>
                Filtering table below to <strong>{selectedTimelineBucket.fullDate}</strong>:{' '}
                <span className="font-semibold text-emerald-900 font-mono">
                  {selectedTimelineBucket.dispenser ?? selectedTimelineBucket.total} complaints
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelectTimelineBucket(null)}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-slate-950 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
              Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* 4. The Chart Viewport */}
      <div className={`w-full ${isExpanded ? 'h-80 sm:h-96 lg:h-[400px]' : 'h-72 sm:h-80 lg:h-[340px]'} transition-all`}>
        {timelineData.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-6 text-center">
            <TrendingUp className="w-8 h-8 text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700 text-sm">No ticket inflow logged for selected criteria</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              No incidents match the active range or dashboard filters. Try selecting a broader time preset above.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'composed' ? (
              <ComposedChart 
                data={timelineData} 
                margin={{ top: 12, right: 12, left: -10, bottom: showBrush ? 24 : 4 }}
                onClick={handleChartClick}
              >
                <defs>
                  <linearGradient id="tlDispGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={TIMELINE_THEME.color} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={TIMELINE_THEME.darkColor} stopOpacity={0.85} />
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
                  width={34}
                  tickLine={false}
                  axisLine={false}
                />
                {showAvgLine && avgDaily > 0 && (
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
                    <TimelineTooltip active={active} payload={payload} />
                  )}
                />
                <Bar 
                  dataKey="dispenser" 
                  name="Dispenser Complaints" 
                  fill="url(#tlDispGrad)" 
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                >
                  {timelineData.map(entry => (
                    <Cell 
                      key={`disp-${entry.dateKey}`}
                      opacity={
                        selectedTimelineBucket 
                          ? (selectedTimelineBucket.dateKey === entry.dateKey ? 1 : 0.35)
                          : 1
                      }
                    />
                  ))}
                </Bar>
                {showTrendline && (
                  <Line 
                    type="monotone" 
                    dataKey="movingAverage" 
                    name="Rolling Avg Trend" 
                    stroke={TIMELINE_THEME.trendline} 
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: TIMELINE_THEME.trendline, stroke: '#fff', strokeWidth: 2 }}
                  />
                )}
                {showBrush && (
                  <Brush 
                    dataKey="displayDate" 
                    height={26} 
                    stroke={TIMELINE_THEME.brush} 
                    fill="#f8fafc"
                    travellerWidth={10}
                  />
                )}
              </ComposedChart>
            ) : chartType === 'area' ? (
              <AreaChart 
                data={timelineData} 
                margin={{ top: 12, right: 12, left: -10, bottom: showBrush ? 24 : 4 }}
                onClick={handleChartClick}
              >
                <defs>
                  <linearGradient id="tlColorDispArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={TIMELINE_THEME.color} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={TIMELINE_THEME.color} stopOpacity={0.03}/>
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
                  width={34}
                  tickLine={false}
                  axisLine={false}
                />
                {showAvgLine && avgDaily > 0 && (
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
                    <TimelineTooltip active={active} payload={payload} />
                  )}
                />
                <Area 
                  type="monotone" 
                  dataKey="dispenser" 
                  name="Dispenser Complaints" 
                  stroke={TIMELINE_THEME.color} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#tlColorDispArea)" 
                  dot={{ r: 2.5, fill: TIMELINE_THEME.color, stroke: '#ffffff', strokeWidth: 1 }}
                  activeDot={{ r: 5, fill: TIMELINE_THEME.color, stroke: '#fff', strokeWidth: 2 }}
                />
                {showTrendline && (
                  <Line 
                    type="monotone" 
                    dataKey="movingAverage" 
                    name="Rolling Avg Trend" 
                    stroke={TIMELINE_THEME.trendline} 
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: TIMELINE_THEME.trendline, stroke: '#fff', strokeWidth: 2 }}
                  />
                )}
                {showBrush && (
                  <Brush 
                    dataKey="displayDate" 
                    height={26} 
                    stroke={TIMELINE_THEME.brush} 
                    fill="#f8fafc"
                    travellerWidth={10}
                  />
                )}
              </AreaChart>
            ) : chartType === 'bar' ? (
              <BarChart 
                data={timelineData} 
                margin={{ top: 12, right: 12, left: -10, bottom: showBrush ? 24 : 4 }}
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
                  width={34}
                  tickLine={false}
                  axisLine={false}
                />
                {showAvgLine && avgDaily > 0 && (
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
                    <TimelineTooltip active={active} payload={payload} />
                  )}
                />
                <Bar 
                  dataKey="dispenser" 
                  name="Dispenser Complaints" 
                  fill={TIMELINE_THEME.color} 
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                >
                  {timelineData.map(entry => (
                    <Cell 
                      key={`bardisp-${entry.dateKey}`}
                      opacity={
                        selectedTimelineBucket 
                          ? (selectedTimelineBucket.dateKey === entry.dateKey ? 1 : 0.35)
                          : 1
                      }
                    />
                  ))}
                </Bar>
                {showBrush && (
                  <Brush 
                    dataKey="displayDate" 
                    height={26} 
                    stroke={TIMELINE_THEME.brush} 
                    fill="#f8fafc"
                    travellerWidth={10}
                  />
                )}
              </BarChart>
            ) : (
              <AreaChart 
                data={timelineData} 
                margin={{ top: 12, right: 12, left: -10, bottom: showBrush ? 24 : 4 }}
                onClick={handleChartClick}
              >
                <defs>
                  <linearGradient id="tlColorCumTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={TIMELINE_THEME.color} stopOpacity={0.35}/>
                    <stop offset="95%" stopColor={TIMELINE_THEME.color} stopOpacity={0.02}/>
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
                  width={34}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  content={({ active, payload }) => (
                    <TimelineTooltip active={active} payload={payload} isCumulative />
                  )}
                />
                <Area 
                  type="monotone" 
                  dataKey="cumulativeDispenser" 
                  name="Cumulative Dispenser Complaints" 
                  stroke={TIMELINE_THEME.color} 
                  strokeWidth={2.5}
                  fill="url(#tlColorCumTotal)" 
                  activeDot={{ r: 5, fill: TIMELINE_THEME.color, stroke: '#fff', strokeWidth: 2 }}
                />
                {showBrush && (
                  <Brush 
                    dataKey="displayDate" 
                    height={26} 
                    stroke={TIMELINE_THEME.brush} 
                    fill="#f8fafc"
                    travellerWidth={10}
                  />
                )}
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* 5. Minimalist Footer Guidance */}
      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-slate-400" />
          Click any bar or data point to filter the incident registry table to that date.
        </span>
        {selectedTimelineBucket && (
          <span className="text-slate-700 font-semibold">
            Filtered: {selectedTimelineBucket.displayDate}
          </span>
        )}
      </div>
    </div>
  );
};
