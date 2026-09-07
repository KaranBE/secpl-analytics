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
  ChevronDown,
  Palette,
  Check
} from 'lucide-react';
import { UnifiedIncidentRecord } from '../../types';
import { 
  buildTimelineData, 
  TimelineGranularity, 
  TimelineRangePreset, 
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

export interface TimelinePalette {
  id: string;
  name: string;
  subtitle: string;
  compressor: {
    name: string;
    color: string;
    darkColor: string;
    bgLight: string;
    border: string;
    text: string;
  };
  dispenser: {
    name: string;
    color: string;
    darkColor: string;
    bgLight: string;
    border: string;
    text: string;
  };
  trendline: string;
  brush: string;
}

export const TIMELINE_PALETTES: TimelinePalette[] = [
  {
    id: 'industrial-blue-teal',
    name: 'Industrial Blue & Teal',
    subtitle: 'Classic operations pair (default)',
    compressor: {
      name: 'Compressor',
      color: '#2563eb', // Blue 600
      darkColor: '#1d4ed8', // Blue 700
      bgLight: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700'
    },
    dispenser: {
      name: 'Dispenser',
      color: '#0d9488', // Teal 600
      darkColor: '#0f766e', // Teal 700
      bgLight: 'bg-teal-50',
      border: 'border-teal-200',
      text: 'text-teal-700'
    },
    trendline: '#d97706', // Amber 600
    brush: '#2563eb'
  },
  {
    id: 'indigo-emerald',
    name: 'Indigo & Emerald',
    subtitle: 'Modern analytics vibrancy',
    compressor: {
      name: 'Compressor',
      color: '#4f46e5', // Indigo 600
      darkColor: '#4338ca', // Indigo 700
      bgLight: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-700'
    },
    dispenser: {
      name: 'Dispenser',
      color: '#10b981', // Emerald 500
      darkColor: '#059669', // Emerald 600
      bgLight: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700'
    },
    trendline: '#ea580c', // Orange 600
    brush: '#4f46e5'
  },
  {
    id: 'navy-cyan',
    name: 'Deep Navy & Cyan',
    subtitle: 'Cool enterprise contrast',
    compressor: {
      name: 'Compressor',
      color: '#1e3a8a', // Blue 900
      darkColor: '#172554', // Blue 950
      bgLight: 'bg-blue-50',
      border: 'border-blue-300',
      text: 'text-blue-900'
    },
    dispenser: {
      name: 'Dispenser',
      color: '#0284c7', // Sky 600
      darkColor: '#0369a1', // Sky 700
      bgLight: 'bg-sky-50',
      border: 'border-sky-200',
      text: 'text-sky-700'
    },
    trendline: '#f59e0b', // Amber 500
    brush: '#0284c7'
  },
  {
    id: 'slate-forest',
    name: 'Graphite Slate & Forest',
    subtitle: 'High legibility editorial',
    compressor: {
      name: 'Compressor',
      color: '#334155', // Slate 700
      darkColor: '#1e293b', // Slate 800
      bgLight: 'bg-slate-100',
      border: 'border-slate-300',
      text: 'text-slate-800'
    },
    dispenser: {
      name: 'Dispenser',
      color: '#15803d', // Green 700
      darkColor: '#166534', // Green 800
      bgLight: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800'
    },
    trendline: '#b45309', // Amber 700
    brush: '#334155'
  }
];

interface TimelineTooltipProps {
  active?: boolean;
  payload?: any[];
  isCumulative?: boolean;
  palette: TimelinePalette;
}

const TimelineTooltip: React.FC<TimelineTooltipProps> = ({ active, payload, isCumulative, palette }) => {
  if (!active || !payload || !payload.length) return null;
  const data: TimelineDataPoint = payload[0]?.payload;
  if (!data) return null;

  const comp = data.compressor || 0;
  const disp = data.dispenser || 0;
  const tot = data.total || (comp + disp);
  const compPct = tot > 0 ? Math.round((comp / tot) * 100) : 0;
  const dispPct = tot > 0 ? Math.round((disp / tot) * 100) : 0;

  return (
    <div className="bg-white/95 backdrop-blur-md px-3.5 py-3 rounded-xl shadow-lg border border-slate-200/90 text-xs min-w-[230px] max-w-[270px]">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
        <div>
          <span className="font-bold text-slate-900 block text-xs tracking-tight">{data.fullDate}</span>
          <span className="text-[10px] text-slate-400 font-medium">Incident Inflow</span>
        </div>
        <span className="font-bold text-slate-800 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded text-[11px] font-mono">
          {isCumulative ? `${data.cumulativeTotal} Cumul.` : `${tot} ${tot === 1 ? 'ticket' : 'tickets'}`}
        </span>
      </div>

      {isCumulative ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: palette.compressor.color }}></span>
              Compressors:
            </span>
            <span className="font-mono font-bold text-slate-900">{data.cumulativeCompressor}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: palette.dispenser.color }}></span>
              Dispensers:
            </span>
            <span className="font-mono font-bold text-slate-900">{data.cumulativeDispenser}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 font-semibold text-slate-800">
            <span>Cumulative Total:</span>
            <span className="font-mono text-slate-900">{data.cumulativeTotal}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: palette.compressor.color }}></span>
                Compressor:
              </span>
              <span className="font-mono font-bold text-slate-900">
                {comp} <span className="text-[10px] text-slate-400 font-normal">({compPct}%)</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: palette.dispenser.color }}></span>
                Dispenser:
              </span>
              <span className="font-mono font-bold text-slate-900">
                {disp} <span className="text-[10px] text-slate-400 font-normal">({dispPct}%)</span>
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex mt-1">
              <div className="h-full transition-all" style={{ width: `${compPct}%`, backgroundColor: palette.compressor.color }}></div>
              <div className="h-full transition-all" style={{ width: `${dispPct}%`, backgroundColor: palette.dispenser.color }}></div>
            </div>
          </div>

          {data.movingAverage !== undefined && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500 font-medium">Rolling Trend:</span>
              <span className="font-mono font-bold" style={{ color: palette.trendline }}>{data.movingAverage} / period</span>
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
  // Color Palette State
  const [paletteId, setPaletteId] = useState<string>('industrial-blue-teal');
  const [showPaletteMenu, setShowPaletteMenu] = useState<boolean>(false);

  const palette = useMemo(() => {
    return TIMELINE_PALETTES.find(p => p.id === paletteId) || TIMELINE_PALETTES[0];
  }, [paletteId]);

  // Chart Display States
  const [chartType, setChartType] = useState<ChartType>('composed');
  const [granularity, setGranularity] = useState<TimelineGranularity>('daily');
  const [rangePreset, setRangePreset] = useState<TimelineRangePreset>('all');
  
  // Visual Toggles
  const [isStacked, setIsStacked] = useState<boolean>(true);
  const [showTrendline, setShowTrendline] = useState<boolean>(true);
  const [showAvgLine, setShowAvgLine] = useState<boolean>(false);
  const [showBrush, setShowBrush] = useState<boolean>(false);
  
  // Interactive Series Visibility (allow user to solo/mute Compressor or Dispenser)
  const [showCompressor, setShowCompressor] = useState<boolean>(true);
  const [showDispenser, setShowDispenser] = useState<boolean>(true);

  // Settings dropdown popover state
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);

  // Build aggregated data
  const { 
    timeline: timelineData, 
    peakDay, 
    avgDaily, 
    totalCompressor, 
    totalDispenser, 
    totalInflow,
    dominantEquipment
  } = useMemo(() => buildTimelineData(incidents, {
    granularity,
    range: rangePreset
  }), [incidents, granularity, rangePreset]);

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

  const compShare = totalInflow > 0 ? Math.round((totalCompressor / totalInflow) * 100) : 0;
  const dispShare = totalInflow > 0 ? Math.round((totalDispenser / totalInflow) * 100) : 0;

  return (
    <div className={`${isExpanded ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all duration-200`}>
      
      {/* 1. Header: Clean Title & Primary Navigation */}
      <div className="flex flex-col gap-3 mb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Title & Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900">
                  Incident Inflow Timeline
                </h3>
                <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono">
                  {totalInflow} Inflow
                </span>
                {dominantEquipment !== 'Balanced' && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    dominantEquipment === 'Compressor'
                      ? `${palette.compressor.bgLight} ${palette.compressor.text} ${palette.compressor.border}`
                      : `${palette.dispenser.bgLight} ${palette.dispenser.text} ${palette.dispenser.border}`
                  }`}>
                    {dominantEquipment}-Heavy
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Comparative chronological volume across Compressor & Dispenser logs
              </p>
            </div>
          </div>

          {/* Right Action Cluster: Range Presets, Color Palette & Maximize */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
            {/* Segmented Range Control */}
            <div className="inline-flex items-center bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/80 text-[11px] font-semibold">
              {(['all', '90d', '30d', '14d', '7d'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRangePreset(r)}
                  className={`px-2 py-1 rounded-md transition-all uppercase cursor-pointer ${
                    rangePreset === r
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={`Filter to ${r === 'all' ? 'entire dataset' : `past ${r}`}`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Color Palette Picker Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowPaletteMenu(!showPaletteMenu);
                  setShowSettingsMenu(false);
                }}
                className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showPaletteMenu 
                    ? 'bg-slate-100 border-slate-300 text-slate-900' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title="Change timeline color combination"
              >
                <Palette className="w-3.5 h-3.5 text-slate-600" />
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full border border-white shadow-2xs" style={{ backgroundColor: palette.compressor.color }} />
                  <span className="w-2.5 h-2.5 rounded-full border border-white shadow-2xs" style={{ backgroundColor: palette.dispenser.color }} />
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showPaletteMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowPaletteMenu(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-20 space-y-1">
                    <div className="px-2 py-1 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Color Combinations
                    </div>
                    {TIMELINE_PALETTES.map(p => {
                      const isSelected = p.id === palette.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setPaletteId(p.id);
                            setShowPaletteMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                            isSelected ? 'bg-slate-100 font-semibold text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex items-center -space-x-1">
                              <span className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs" style={{ backgroundColor: p.compressor.color }} />
                              <span className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs" style={{ backgroundColor: p.dispenser.color }} />
                            </div>
                            <div>
                              <div className="text-xs font-semibold leading-tight">{p.name}</div>
                              <div className="text-[10px] text-slate-400">{p.subtitle}</div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-slate-800 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

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
          
          {/* Left: Interactive Series Badges & Key Stats */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Interactive Compressor Series Pill */}
            <button
              type="button"
              onClick={() => {
                if (showCompressor && !showDispenser) return;
                setShowCompressor(!showCompressor);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                showCompressor 
                  ? 'bg-white border-slate-200/90 text-slate-900 shadow-2xs' 
                  : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60 line-through'
              }`}
              title={showCompressor ? "Click to mute Compressors" : "Click to show Compressors"}
            >
              <span 
                className="w-2.5 h-2.5 rounded-full transition-colors" 
                style={{ backgroundColor: showCompressor ? palette.compressor.color : '#94a3b8' }} 
              />
              <span className="font-semibold">Compressor:</span>
              <span className="font-mono font-bold text-slate-800">{totalCompressor}</span>
              <span className="text-[10px] text-slate-400">({compShare}%)</span>
            </button>

            {/* Interactive Dispenser Series Pill */}
            <button
              type="button"
              onClick={() => {
                if (showDispenser && !showCompressor) return;
                setShowDispenser(!showDispenser);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                showDispenser 
                  ? 'bg-white border-slate-200/90 text-slate-900 shadow-2xs' 
                  : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60 line-through'
              }`}
              title={showDispenser ? "Click to mute Dispensers" : "Click to show Dispensers"}
            >
              <span 
                className="w-2.5 h-2.5 rounded-full transition-colors" 
                style={{ backgroundColor: showDispenser ? palette.dispenser.color : '#94a3b8' }} 
              />
              <span className="font-semibold">Dispenser:</span>
              <span className="font-mono font-bold text-slate-800">{totalDispenser}</span>
              <span className="text-[10px] text-slate-400">({dispShare}%)</span>
            </button>

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
                <span className="font-mono font-bold">{peakDay.count}</span>
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
                title="Combo Trend: Dual-sheet bars with rolling trendline"
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
                onClick={() => {
                  setShowSettingsMenu(!showSettingsMenu);
                  setShowPaletteMenu(false);
                }}
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
                        onClick={() => setIsStacked(!isStacked)}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 text-left cursor-pointer"
                      >
                        <span>Stack Columns</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isStacked ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-500'}`}>
                          {isStacked ? 'ON' : 'OFF'}
                        </span>
                      </button>
                    )}

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
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200/90 px-3 py-1.5 rounded-xl text-xs text-slate-900 transition-all">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>
                Filtering table below to <strong>{selectedTimelineBucket.fullDate}</strong>:{' '}
                <span className="font-semibold text-slate-900 font-mono">{selectedTimelineBucket.total} incidents</span>{' '}
                ({selectedTimelineBucket.compressor} Compressor, {selectedTimelineBucket.dispenser} Dispenser)
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
                  <linearGradient id="tlCompGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={palette.compressor.color} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={palette.compressor.darkColor} stopOpacity={0.85} />
                  </linearGradient>
                  <linearGradient id="tlDispGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={palette.dispenser.color} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={palette.dispenser.darkColor} stopOpacity={0.85} />
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
                    <TimelineTooltip active={active} payload={payload} palette={palette} />
                  )}
                />
                {showCompressor && (
                  <Bar 
                    dataKey="compressor" 
                    name="Compressor" 
                    fill="url(#tlCompGrad)" 
                    stackId={isStacked ? "1" : undefined}
                    radius={isStacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                    cursor="pointer"
                  >
                    {timelineData.map(entry => (
                      <Cell 
                        key={`comp-${entry.dateKey}`}
                        opacity={
                          selectedTimelineBucket 
                            ? (selectedTimelineBucket.dateKey === entry.dateKey ? 1 : 0.35)
                            : 1
                        }
                      />
                    ))}
                  </Bar>
                )}
                {showDispenser && (
                  <Bar 
                    dataKey="dispenser" 
                    name="Dispenser" 
                    fill="url(#tlDispGrad)" 
                    stackId={isStacked ? "1" : undefined}
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
                )}
                {showTrendline && (
                  <Line 
                    type="monotone" 
                    dataKey="movingAverage" 
                    name="Rolling Avg Trend" 
                    stroke={palette.trendline} 
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: palette.trendline, stroke: '#fff', strokeWidth: 2 }}
                  />
                )}
                {showBrush && (
                  <Brush 
                    dataKey="displayDate" 
                    height={26} 
                    stroke={palette.brush} 
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
                  <linearGradient id="tlColorCompArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={palette.compressor.color} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={palette.compressor.color} stopOpacity={0.03}/>
                  </linearGradient>
                  <linearGradient id="tlColorDispArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={palette.dispenser.color} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={palette.dispenser.color} stopOpacity={0.03}/>
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
                    <TimelineTooltip active={active} payload={payload} palette={palette} />
                  )}
                />
                {showCompressor && (
                  <Area 
                    type="monotone" 
                    dataKey="compressor" 
                    name="Compressor" 
                    stroke={palette.compressor.color} 
                    strokeWidth={2}
                    stackId={isStacked ? "1" : undefined}
                    fillOpacity={1} 
                    fill="url(#tlColorCompArea)" 
                    dot={{ r: 2.5, fill: palette.compressor.color, stroke: '#ffffff', strokeWidth: 1 }}
                    activeDot={{ r: 5, fill: palette.compressor.color, stroke: '#fff', strokeWidth: 2 }}
                  />
                )}
                {showDispenser && (
                  <Area 
                    type="monotone" 
                    dataKey="dispenser" 
                    name="Dispenser" 
                    stroke={palette.dispenser.color} 
                    strokeWidth={2}
                    stackId={isStacked ? "1" : undefined}
                    fillOpacity={1} 
                    fill="url(#tlColorDispArea)" 
                    dot={{ r: 2.5, fill: palette.dispenser.color, stroke: '#ffffff', strokeWidth: 1 }}
                    activeDot={{ r: 5, fill: palette.dispenser.color, stroke: '#fff', strokeWidth: 2 }}
                  />
                )}
                {showTrendline && (
                  <Line 
                    type="monotone" 
                    dataKey="movingAverage" 
                    name="Rolling Avg Trend" 
                    stroke={palette.trendline} 
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: palette.trendline, stroke: '#fff', strokeWidth: 2 }}
                  />
                )}
                {showBrush && (
                  <Brush 
                    dataKey="displayDate" 
                    height={26} 
                    stroke={palette.brush} 
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
                    <TimelineTooltip active={active} payload={payload} palette={palette} />
                  )}
                />
                {showCompressor && (
                  <Bar 
                    dataKey="compressor" 
                    name="Compressor" 
                    fill={palette.compressor.color} 
                    stackId={isStacked ? "1" : undefined}
                    radius={isStacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                    cursor="pointer"
                  >
                    {timelineData.map(entry => (
                      <Cell 
                        key={`barcomp-${entry.dateKey}`}
                        opacity={
                          selectedTimelineBucket 
                            ? (selectedTimelineBucket.dateKey === entry.dateKey ? 1 : 0.35)
                            : 1
                        }
                      />
                    ))}
                  </Bar>
                )}
                {showDispenser && (
                  <Bar 
                    dataKey="dispenser" 
                    name="Dispenser" 
                    fill={palette.dispenser.color} 
                    stackId={isStacked ? "1" : undefined}
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
                )}
                {showBrush && (
                  <Brush 
                    dataKey="displayDate" 
                    height={26} 
                    stroke={palette.brush} 
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
                    <stop offset="5%" stopColor={palette.compressor.color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={palette.compressor.color} stopOpacity={0.02}/>
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
                    <TimelineTooltip active={active} payload={payload} isCumulative palette={palette} />
                  )}
                />
                <Area 
                  type="monotone" 
                  dataKey="cumulativeTotal" 
                  name="Cumulative Total" 
                  stroke={palette.compressor.color} 
                  strokeWidth={2.5}
                  fill="url(#tlColorCumTotal)" 
                  activeDot={{ r: 5, fill: palette.compressor.color, stroke: '#fff', strokeWidth: 2 }}
                />
                {showCompressor && (
                  <Line 
                    type="monotone" 
                    dataKey="cumulativeCompressor" 
                    name="Cumulative Compressors" 
                    stroke={palette.compressor.darkColor} 
                    strokeWidth={2}
                    dot={false}
                  />
                )}
                {showDispenser && (
                  <Line 
                    type="monotone" 
                    dataKey="cumulativeDispenser" 
                    name="Cumulative Dispensers" 
                    stroke={palette.dispenser.color} 
                    strokeWidth={2}
                    dot={false}
                  />
                )}
                {showBrush && (
                  <Brush 
                    dataKey="displayDate" 
                    height={26} 
                    stroke={palette.brush} 
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
