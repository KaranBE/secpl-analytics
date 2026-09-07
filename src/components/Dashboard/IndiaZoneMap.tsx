import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Flame, 
  Wrench, 
  ChevronRight, 
  Layers, 
  RotateCcw,
  Sparkles,
  AlertCircle,
  Eye,
  CheckCircle2,
  Maximize2,
  Minimize2,
  ZoomIn
} from 'lucide-react';
import { ZoneMetric, UnifiedIncidentRecord } from '../../types';
import { 
  INDIA_STATES_DATA, 
  CITY_HUBS, 
  ZONE_CENTERS, 
  ZONE_VIEWBOXES,
  StateGeoPath, 
  CityHubGeo 
} from '../../data/indiaMapData';

export interface IndiaZoneMapProps {
  zoneMetrics: ZoneMetric[];
  incidents: UnifiedIncidentRecord[];
  selectedZone: ZoneMetric | null;
  onSelectZone: (zone: ZoneMetric | null) => void;
  onOpenAuditModal?: (zone: ZoneMetric) => void;
  className?: string;
}

export type MapMetricMode = 'default' | 'volume' | 'sla' | 'open' | 'response';

export const IndiaZoneMap: React.FC<IndiaZoneMapProps> = ({
  zoneMetrics,
  incidents,
  selectedZone,
  onSelectZone,
  onOpenAuditModal,
  className = ''
}) => {
  const [metricMode, setMetricMode] = useState<MapMetricMode>('default');
  const [hoveredZoneName, setHoveredZoneName] = useState<string | null>(null);
  const [hoveredState, setHoveredState] = useState<StateGeoPath | null>(null);
  const [hoveredHub, setHoveredHub] = useState<CityHubGeo | null>(null);
  const [showHubs, setShowHubs] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showStateBorders, setShowStateBorders] = useState<boolean>(true);
  const [isZoomedToZone, setIsZoomedToZone] = useState<boolean>(false);

  // Map zone data lookup
  const zoneDataMap = useMemo(() => {
    const map: Record<string, ZoneMetric> = {};
    zoneMetrics.forEach(z => {
      map[z.zone] = z;
    });
    return map;
  }, [zoneMetrics]);

  // Group states by zone
  const statesByZone = useMemo(() => {
    const map: Record<string, StateGeoPath[]> = {
      'North Zone': [],
      'West Zone': [],
      'Central Zone': [],
      'East Zone': [],
      'South Zone': []
    };
    INDIA_STATES_DATA.forEach(s => {
      if (map[s.zone]) {
        map[s.zone].push(s);
      }
    });
    return map;
  }, []);

  // Compute dynamic SVG viewBox
  const activeViewBox = useMemo(() => {
    if (isZoomedToZone && selectedZone?.zone && ZONE_VIEWBOXES[selectedZone.zone]) {
      return ZONE_VIEWBOXES[selectedZone.zone];
    }
    return '0 0 600 680';
  }, [isZoomedToZone, selectedZone]);

  // Total national stats
  const nationalTotals = useMemo(() => {
    const total = zoneMetrics.reduce((acc, z) => acc + z.totalComplaints, 0);
    const resolved = zoneMetrics.reduce((acc, z) => acc + z.resolvedComplaints, 0);
    const open = zoneMetrics.reduce((acc, z) => acc + z.openComplaints, 0);
    const avgSla = zoneMetrics.length > 0 
      ? Number((zoneMetrics.reduce((acc, z) => acc + z.slaPercentage, 0) / zoneMetrics.length).toFixed(1)) 
      : 94.0;
    const avgResponse = zoneMetrics.length > 0 
      ? Math.round(zoneMetrics.reduce((acc, z) => acc + z.avgResponseMinutes, 0) / zoneMetrics.length) 
      : 30;

    const maxZone = [...zoneMetrics].sort((a, b) => b.totalComplaints - a.totalComplaints)[0];

    return { total, resolved, open, avgSla, avgResponse, maxZone };
  }, [zoneMetrics]);

  // Color logic based on metric mode
  const getZoneColor = (zoneName: string, isHovered: boolean, isSelected: boolean) => {
    const metric = zoneDataMap[zoneName];
    
    // Corporate operational palette
    const defaultColors: Record<string, { base: string; hover: string; selected: string; stroke: string; border: string }> = {
      'North Zone': { 
        base: '#3b82f6', 
        hover: '#2563eb', 
        selected: '#1d4ed8', 
        stroke: '#1e40af',
        border: '#60a5fa'
      },
      'West Zone': { 
        base: '#6366f1', 
        hover: '#4f46e5', 
        selected: '#4338ca', 
        stroke: '#3730a3',
        border: '#818cf8'
      },
      'Central Zone': { 
        base: '#f59e0b', 
        hover: '#d97706', 
        selected: '#b45309', 
        stroke: '#92400e',
        border: '#fbbf24'
      },
      'East Zone': { 
        base: '#8b5cf6', 
        hover: '#7c3aed', 
        selected: '#6d28d9', 
        stroke: '#5b21b6',
        border: '#a78bfa'
      },
      'South Zone': { 
        base: '#0d9488', 
        hover: '#0f766e', 
        selected: '#115e59', 
        stroke: '#134e4a',
        border: '#2dd4bf'
      }
    };

    if (metricMode === 'volume') {
      const total = metric?.totalComplaints || 0;
      const max = Math.max(...zoneMetrics.map(z => z.totalComplaints), 1);
      const ratio = total / max;
      if (ratio > 0.8) return { fill: isHovered ? '#1e3a8a' : '#2563eb', stroke: '#172554', border: '#93c5fd' };
      if (ratio > 0.5) return { fill: isHovered ? '#2563eb' : '#3b82f6', stroke: '#1e40af', border: '#bfdbfe' };
      if (ratio > 0.25) return { fill: isHovered ? '#3b82f6' : '#60a5fa', stroke: '#2563eb', border: '#dbeafe' };
      return { fill: isHovered ? '#60a5fa' : '#93c5fd', stroke: '#3b82f6', border: '#eff6ff' };
    }

    if (metricMode === 'sla') {
      const sla = metric?.slaPercentage || 90;
      if (sla >= 95) return { fill: isHovered ? '#059669' : '#10b981', stroke: '#047857', border: '#6ee7b7' };
      if (sla >= 92) return { fill: isHovered ? '#0d9488' : '#14b8a6', stroke: '#0f766e', border: '#5eead4' };
      if (sla >= 89) return { fill: isHovered ? '#d97706' : '#f59e0b', stroke: '#b45309', border: '#fde68a' };
      return { fill: isHovered ? '#dc2626' : '#ef4444', stroke: '#b91c1c', border: '#fca5a5' };
    }

    if (metricMode === 'open') {
      const open = metric?.openComplaints || 0;
      if (open >= 4) return { fill: isHovered ? '#dc2626' : '#ef4444', stroke: '#991b1b', border: '#fca5a5' };
      if (open >= 2) return { fill: isHovered ? '#d97706' : '#f59e0b', stroke: '#b45309', border: '#fde68a' };
      if (open >= 1) return { fill: isHovered ? '#eab308' : '#facc15', stroke: '#a16207', border: '#fef08a' };
      return { fill: isHovered ? '#059669' : '#10b981', stroke: '#047857', border: '#6ee7b7' };
    }

    if (metricMode === 'response') {
      const mins = metric?.avgResponseMinutes || 30;
      if (mins <= 24) return { fill: isHovered ? '#059669' : '#10b981', stroke: '#047857', border: '#6ee7b7' };
      if (mins <= 30) return { fill: isHovered ? '#0d9488' : '#06b6d4', stroke: '#0e7490', border: '#67e8f9' };
      if (mins <= 35) return { fill: isHovered ? '#2563eb' : '#3b82f6', stroke: '#1d4ed8', border: '#93c5fd' };
      return { fill: isHovered ? '#d97706' : '#f59e0b', stroke: '#b45309', border: '#fde68a' };
    }

    // Default palette
    const conf = defaultColors[zoneName] || defaultColors['West Zone'];
    return {
      fill: isSelected ? conf.selected : isHovered ? conf.hover : conf.base,
      stroke: conf.stroke,
      border: conf.border
    };
  };

  // Active inspected zone (hovered takes preview priority, otherwise selected)
  const activeZoneName = hoveredZoneName || selectedZone?.zone || null;
  const activeZoneObj = activeZoneName ? zoneDataMap[activeZoneName] : null;

  // Equipment breakdown for active zone
  const activeZoneEquip = useMemo(() => {
    if (!activeZoneName) return null;
    const zoneIncidents = incidents.filter(i => i.zone === activeZoneName);
    const compCount = zoneIncidents.filter(i => (i.equipmentType || '').toLowerCase().includes('compressor')).length;
    const dispCount = zoneIncidents.filter(i => (i.equipmentType || '').toLowerCase().includes('dispenser')).length;
    const otherCount = zoneIncidents.length - compCount - dispCount;
    return {
      total: zoneIncidents.length,
      compCount,
      dispCount,
      otherCount,
      compPct: zoneIncidents.length > 0 ? Math.round((compCount / zoneIncidents.length) * 100) : 0,
      dispPct: zoneIncidents.length > 0 ? Math.round((dispCount / zoneIncidents.length) * 100) : 0
    };
  }, [activeZoneName, incidents]);

  // Top issues in active zone
  const activeZoneTopIssues = useMemo(() => {
    if (!activeZoneName) return [];
    const zoneIncidents = incidents.filter(i => i.zone === activeZoneName);
    const counts: Record<string, number> = {};
    zoneIncidents.forEach(i => {
      const cat = i.category || 'General Maintenance';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));
  }, [activeZoneName, incidents]);

  return (
    <div id="india-zone-map-container" className={`bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs ${className}`}>
      {/* Top Header & Interactive Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
              <Compass className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                India National CNG Operations Map
                {selectedZone && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 flex items-center gap-1">
                    <span>{selectedZone.zone}</span>
                    {isZoomedToZone && <span className="text-[10px] text-indigo-600 font-bold uppercase">(Focused View)</span>}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                Geographically authentic territorial boundaries with state-level demarcation, East Zone corridor &amp; service hubs
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Pills & Interactive Toggles */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setMetricMode('default')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                metricMode === 'default' 
                  ? 'bg-white text-indigo-700 shadow-xs font-bold' 
                  : 'hover:text-slate-900'
              }`}
            >
              Territories
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('volume')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                metricMode === 'volume' 
                  ? 'bg-white text-indigo-700 shadow-xs font-bold' 
                  : 'hover:text-slate-900'
              }`}
            >
              Volume
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('sla')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                metricMode === 'sla' 
                  ? 'bg-white text-indigo-700 shadow-xs font-bold' 
                  : 'hover:text-slate-900'
              }`}
            >
              SLA %
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('open')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                metricMode === 'open' 
                  ? 'bg-white text-indigo-700 shadow-xs font-bold' 
                  : 'hover:text-slate-900'
              }`}
            >
              Open Issues
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('response')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                metricMode === 'response' 
                  ? 'bg-white text-indigo-700 shadow-xs font-bold' 
                  : 'hover:text-slate-900'
              }`}
            >
              Response Speed
            </button>
          </div>

          {/* Quick Display & Focus Toggles */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            {selectedZone && (
              <button
                type="button"
                onClick={() => setIsZoomedToZone(!isZoomedToZone)}
                title={isZoomedToZone ? "View Full National Map" : `Focus on ${selectedZone.zone}`}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                  isZoomedToZone 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                    : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                }`}
              >
                {isZoomedToZone ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isZoomedToZone ? 'Full Map' : `Focus ${selectedZone.zone.replace(' Zone', '')}`}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowHubs(!showHubs)}
              title={showHubs ? "Hide City Station Pins" : "Show City Station Pins"}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                showHubs 
                  ? 'bg-slate-800 text-white border-slate-800' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hubs</span>
            </button>

            <button
              type="button"
              onClick={() => setShowStateBorders(!showStateBorders)}
              title={showStateBorders ? "Hide State Boundaries" : "Show State Boundaries"}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                showStateBorders 
                  ? 'bg-slate-800 text-white border-slate-800' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Borders</span>
            </button>

            <button
              type="button"
              onClick={() => setShowLabels(!showLabels)}
              title={showLabels ? "Hide Labels" : "Show Labels"}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                showLabels 
                  ? 'bg-slate-800 text-white border-slate-800' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Labels</span>
            </button>

            {selectedZone && (
              <button
                type="button"
                onClick={() => {
                  onSelectZone(null);
                  setIsZoomedToZone(false);
                }}
                title="Reset to All-India View"
                className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs flex items-center gap-1 font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>All India</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Map Body: Left Interactive SVG (7 cols), Right Dynamic Inspector (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 items-start">
        
        {/* Left Column: Authentic National Territory SVG */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative bg-gradient-to-b from-slate-50/80 via-blue-50/20 to-slate-50/80 rounded-2xl border border-slate-200/80 p-3 overflow-hidden shadow-inner min-h-[580px]">
          
          {/* Subtle Ambient Ocean Grid & Compass Watermark */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="graticule" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#cbd5e1" strokeWidth="0.4" strokeDasharray="3 3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#graticule)" />
            </svg>
          </div>

          {/* Geographical Water Body Typography (hidden when zoomed in to avoid clutter) */}
          {!isZoomedToZone && (
            <>
              <div className="absolute top-8 left-8 pointer-events-none select-none z-0">
                <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase block">
                  Northern Frontier
                </span>
                <span className="text-[9px] font-medium text-slate-300">
                  Himalayan Region
                </span>
              </div>

              <div className="absolute bottom-28 left-6 pointer-events-none select-none z-0 text-left">
                <span className="text-[11px] font-bold tracking-widest text-slate-400/80 uppercase block">
                  Arabian Sea
                </span>
                <span className="text-[9px] text-slate-400/60 font-medium">
                  Western Offshore Belt
                </span>
              </div>

              <div className="absolute bottom-36 right-8 pointer-events-none select-none z-0 text-right">
                <span className="text-[11px] font-bold tracking-widest text-slate-400/80 uppercase block">
                  Bay of Bengal
                </span>
                <span className="text-[9px] text-slate-400/60 font-medium">
                  Eastern Maritime Zone
                </span>
              </div>

              <div className="absolute bottom-4 right-10 pointer-events-none select-none z-0 text-right">
                <span className="text-[10px] font-bold tracking-wider text-slate-400/70 uppercase block">
                  Andaman Sea
                </span>
              </div>
            </>
          )}

          {/* Zoom In / Out Quick Overlay Control */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={() => {
                if (selectedZone) {
                  setIsZoomedToZone(!isZoomedToZone);
                } else {
                  // Default to focusing East Zone if user clicks zoom without a selection
                  const east = zoneDataMap['East Zone'];
                  if (east) {
                    onSelectZone(east);
                    setIsZoomedToZone(true);
                  }
                }
              }}
              title={isZoomedToZone ? "Zoom out to All-India" : "Focus selected zone in high magnification"}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-indigo-600 flex items-center gap-1.5 cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isZoomedToZone ? 'Full India' : selectedZone ? `Focus ${selectedZone.zone.replace(' Zone', '')}` : 'Focus East Zone'}</span>
            </button>
          </div>

          {/* Floating Hover Card (displays details of hovered state/hub) */}
          {(hoveredState || hoveredHub) && (
            <div className="absolute top-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md text-white text-xs rounded-xl p-3 shadow-lg border border-slate-700/80 pointer-events-none transition-all max-w-[230px]">
              {hoveredState && (
                <div>
                  <div className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">
                    {hoveredState.zone}
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                    <span>{hoveredState.name}</span>
                    {hoveredState.zone === 'East Zone' && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/80 text-purple-200 border border-purple-700">
                        East Sector
                      </span>
                    )}
                  </div>
                  {zoneDataMap[hoveredState.zone] && (
                    <div className="mt-2 pt-2 border-t border-slate-700/60 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Total Incidents:</span>
                        <span className="font-semibold text-white">
                          {zoneDataMap[hoveredState.zone].totalComplaints}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">SLA Adherence:</span>
                        <span className="font-semibold text-emerald-400">
                          {zoneDataMap[hoveredState.zone].slaPercentage}%
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Open Tickets:</span>
                        <span className="font-semibold text-amber-400">
                          {zoneDataMap[hoveredState.zone].openComplaints}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Lead Field Engr:</span>
                        <span className="font-semibold text-slate-200">
                          {zoneDataMap[hoveredState.zone].leadEngineer}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="text-[9px] text-indigo-200 mt-2 font-medium">
                    Click to filter dashboard to {hoveredState.zone}
                  </div>
                </div>
              )}

              {hoveredHub && !hoveredState && (
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-300 uppercase tracking-wider">
                    <MapPin className="w-3 h-3" />
                    Major CNG Hub
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {hoveredHub.name}
                  </div>
                  <div className="mt-1.5 text-[11px] text-slate-300 space-y-0.5">
                    <div>Territory: <strong className="text-white">{hoveredHub.zone}</strong></div>
                    <div>Active Stations: <strong className="text-white">{hoveredHub.stationCount} Units</strong></div>
                    <div>Focus: <strong className="text-indigo-300">{hoveredHub.equipmentFocus}</strong></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SVG Map Canvas */}
          <div className="w-full flex justify-center py-2 relative z-10">
            <svg
              id="authentic-india-national-map"
              viewBox={activeViewBox}
              className="w-full max-w-[530px] h-auto drop-shadow-md select-none transition-all duration-500 ease-in-out"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="zoneGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.35" />
                  <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#3b82f6" floodOpacity="0.4" />
                </filter>
                <filter id="hoverShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.25" />
                </filter>
                <filter id="hubGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#ffffff" floodOpacity="0.8" />
                </filter>
              </defs>

              {/* Geographic Context: Sri Lanka Silhouette in the South (shown in national view) */}
              {!isZoomedToZone && (
                <>
                  <g opacity="0.3" transform="translate(260, 600)">
                    <path
                      d="M 12 5 C 18 10, 24 22, 22 34 C 20 44, 12 50, 6 45 C 0 40, -2 28, 2 16 C 6 8, 8 2, 12 5 Z"
                      fill="#94a3b8"
                      stroke="#64748b"
                      strokeWidth="0.8"
                    />
                    <text x="12" y="32" fontSize="7" fill="#64748b" textAnchor="middle" fontWeight="500">
                      Sri Lanka
                    </text>
                  </g>

                  {/* Andaman & Nicobar Region Identifier Tag */}
                  <g transform="translate(490, 480)" opacity="0.75" className="pointer-events-none">
                    <text x="0" y="0" fontSize="8" fontWeight="600" fill="#475569" textAnchor="middle">
                      A &amp; N Islands
                    </text>
                    <line x1="-30" y1="4" x2="30" y2="4" stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="2 2" />
                  </g>

                  {/* Lakshadweep Region Identifier Tag */}
                  <g transform="translate(100, 520)" opacity="0.75" className="pointer-events-none">
                    <text x="0" y="0" fontSize="8" fontWeight="600" fill="#475569" textAnchor="middle">
                      Lakshadweep
                    </text>
                    <line x1="-25" y1="4" x2="25" y2="4" stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="2 2" />
                  </g>
                </>
              )}

              {/* ==================================================== */}
              {/* 5 OPERATIONAL ZONES WITH ACCURATE STATE PATHS         */}
              {/* ==================================================== */}
              {(['North Zone', 'West Zone', 'Central Zone', 'East Zone', 'South Zone'] as const).map(zoneName => {
                const states = statesByZone[zoneName] || [];
                const isHovered = hoveredZoneName === zoneName;
                const isSelected = selectedZone?.zone === zoneName;
                const isOtherSelected = selectedZone && !isSelected;
                const colors = getZoneColor(zoneName, isHovered, isSelected);
                const zoneCenter = ZONE_CENTERS[zoneName] || { x: 300, y: 300 };

                // If zoomed into a specific zone and this is NOT that zone, hide it to optimize focus
                if (isZoomedToZone && !isSelected) {
                  return null;
                }

                return (
                  <g
                    key={zoneName}
                    id={`zone-${zoneName.toLowerCase().replace(/\s+/g, '-')}`}
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredZoneName(zoneName)}
                    onMouseLeave={() => {
                      setHoveredZoneName(null);
                      setHoveredState(null);
                    }}
                    onClick={() => {
                      if (isSelected) {
                        onSelectZone(null);
                        setIsZoomedToZone(false);
                      } else {
                        onSelectZone(zoneDataMap[zoneName] || null);
                      }
                    }}
                    opacity={isOtherSelected ? 0.35 : 1}
                    filter={isSelected ? 'url(#zoneGlow)' : isHovered ? 'url(#hoverShadow)' : undefined}
                  >
                    {/* Render Each Authentic State within this Zone */}
                    {states.map(state => {
                      const isStateHovered = hoveredState?.id === state.id;
                      return (
                        <g key={state.id}>
                          <path
                            id={state.id}
                            d={state.d}
                            fill={isStateHovered ? colors.border : colors.fill}
                            stroke={
                              isSelected 
                                ? '#ffffff' 
                                : isStateHovered 
                                ? '#ffffff' 
                                : showStateBorders 
                                ? 'rgba(255, 255, 255, 0.65)' 
                                : colors.stroke
                            }
                            strokeWidth={
                              isSelected 
                                ? 1.4 
                                : isStateHovered 
                                ? 1.6 
                                : showStateBorders 
                                ? 0.85 
                                : 0.4
                            }
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            className="transition-colors duration-150"
                            onMouseEnter={(e) => {
                              e.stopPropagation();
                              setHoveredState(state);
                              setHoveredZoneName(zoneName);
                            }}
                            onMouseLeave={() => {
                              setHoveredState(null);
                            }}
                          />

                          {/* State Name text labels when zoomed into zone or in focus */}
                          {(isZoomedToZone || isSelected) && state.centroid && (
                            <text
                              x={state.centroid[0]}
                              y={state.centroid[1]}
                              fontSize={isZoomedToZone ? 9 : 7}
                              textAnchor="middle"
                              fill="#ffffff"
                              stroke="#0f172a"
                              strokeWidth={isZoomedToZone ? 2.5 : 2}
                              paintOrder="stroke fill"
                              fontWeight="700"
                              className="pointer-events-none select-none opacity-90"
                            >
                              {state.name}
                            </text>
                          )}
                        </g>
                      );
                    })}

                    {/* Zone Badge / Label */}
                    {showLabels && !isZoomedToZone && (
                      <g 
                        transform={`translate(${zoneCenter.x}, ${zoneCenter.y})`} 
                        className="pointer-events-none select-none transition-transform duration-200"
                        style={{ transform: isHovered || isSelected ? `translate(${zoneCenter.x}px, ${zoneCenter.y}px) scale(1.08)` : undefined }}
                      >
                        <rect
                          x="-44"
                          y="-13"
                          width="88"
                          height="26"
                          rx="7"
                          fill={isSelected ? '#0f172a' : 'rgba(15, 23, 42, 0.85)'}
                          stroke={isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.45)'}
                          strokeWidth={isSelected ? 1.8 : 1}
                          filter="url(#hoverShadow)"
                        />
                        <text
                          x="0"
                          y="4"
                          textAnchor="middle"
                          fontSize="9.5"
                          fill="#ffffff"
                          fontWeight="700"
                          letterSpacing="0.4"
                        >
                          {zoneName.toUpperCase()}
                        </text>
                      </g>
                    )}

                    {/* Secondary regional label for North East when East Zone is rendered */}
                    {zoneName === 'East Zone' && showLabels && !isZoomedToZone && (
                      <g 
                        transform="translate(485, 225)" 
                        className="pointer-events-none select-none"
                      >
                        <rect
                          x="-38"
                          y="-11"
                          width="76"
                          height="22"
                          rx="6"
                          fill="rgba(88, 28, 135, 0.85)"
                          stroke="rgba(255, 255, 255, 0.4)"
                          strokeWidth="0.8"
                        />
                        <text
                          x="0"
                          y="3"
                          textAnchor="middle"
                          fontSize="8"
                          fill="#ffffff"
                          fontWeight="700"
                          letterSpacing="0.3"
                        >
                          NORTH EAST
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* ==================================================== */}
              {/* MAJOR SERVICE HUBS & COMPRESSOR/DISPENSER TERMINALS */}
              {/* ==================================================== */}
              {showHubs && CITY_HUBS.map(hub => {
                const isSelectedHubZone = selectedZone?.zone === hub.zone;
                const isHubHovered = hoveredHub?.name === hub.name;

                // When zoomed into a zone, only show hubs belonging to that zone
                if (isZoomedToZone && !isSelectedHubZone) {
                  return null;
                }

                return (
                  <g
                    key={hub.name}
                    id={`hub-${hub.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    className="cursor-pointer group"
                    transform={`translate(${hub.x}, ${hub.y})`}
                    onMouseEnter={(e) => {
                      e.stopPropagation();
                      setHoveredHub(hub);
                      setHoveredZoneName(hub.zone);
                    }}
                    onMouseLeave={() => {
                      setHoveredHub(null);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectZone(zoneDataMap[hub.zone] || null);
                    }}
                  >
                    {/* Animated Ripple for active territory hubs */}
                    {isSelectedHubZone && (
                      <circle
                        cx="0"
                        cy="0"
                        r={isZoomedToZone ? 14 : 10}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        opacity="0.8"
                        className="animate-ping"
                      />
                    )}

                    {/* Outer glow ring */}
                    <circle
                      cx="0"
                      cy="0"
                      r={isHubHovered ? (isZoomedToZone ? 8 : 6) : (isZoomedToZone ? 6 : 4.5)}
                      fill="#ffffff"
                      stroke="#0f172a"
                      strokeWidth="1.5"
                      filter="url(#hubGlow)"
                      className="transition-all"
                    />

                    {/* Core Hub Dot (Color-coded by equipment focus) */}
                    <circle
                      cx="0"
                      cy="0"
                      r={isHubHovered ? (isZoomedToZone ? 4.5 : 3.5) : (isZoomedToZone ? 3.5 : 2.5)}
                      fill={
                        hub.equipmentFocus === 'Compressor' 
                          ? '#2563eb' 
                          : hub.equipmentFocus === 'Dispenser' 
                          ? '#0d9488' 
                          : '#4f46e5'
                      }
                      className="transition-all"
                    />

                    {/* Hub Name label */}
                    <text
                      x={isZoomedToZone ? 10 : 7}
                      y={isZoomedToZone ? 4 : 3}
                      fontSize={isZoomedToZone ? 10 : 8}
                      fontWeight="700"
                      fill="#0f172a"
                      stroke="#ffffff"
                      strokeWidth={isZoomedToZone ? 3 : 2.5}
                      paintOrder="stroke fill"
                      className="opacity-90 group-hover:opacity-100 transition-opacity"
                    >
                      {hub.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Bottom Interactive Guidance Line */}
          <div className="w-full flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/80 mt-1 relative z-10">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              {isZoomedToZone ? (
                <span>Focused on <strong>{selectedZone?.zone}</strong> (Click 'Full Map' or reset to return)</span>
              ) : (
                <span>Hover any state for metrics or click East Zone to inspect West Bengal &amp; North East</span>
              )}
            </span>
            {selectedZone && (
              <button
                type="button"
                onClick={() => {
                  onSelectZone(null);
                  setIsZoomedToZone(false);
                }}
                className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Territory Intelligence & Performance Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {activeZoneObj ? (
            /* Active / Inspected Zone View */
            <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4 transition-all">
              {/* Header with Title and SLA Badge */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-200/80 pb-3.5">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" />
                    Territory Intelligence
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mt-0.5">
                    {activeZoneObj.zone}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lead Field Engineer: <strong className="text-slate-800">{activeZoneObj.leadEngineer}</strong>
                  </p>
                </div>

                <div className={`text-right px-3 py-1.5 rounded-xl border text-xs font-bold shadow-xs ${
                  activeZoneObj.slaPercentage >= 94 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : activeZoneObj.slaPercentage >= 90
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  <div className="font-mono text-base leading-tight">{activeZoneObj.slaPercentage}%</div>
                  <div className="text-[10px] font-normal text-slate-500">SLA Compliance</div>
                </div>
              </div>

              {/* Coverage notice for East Zone */}
              {activeZoneObj.zone === 'East Zone' && (
                <div className="p-2.5 rounded-xl bg-purple-50/90 border border-purple-200 text-xs text-purple-900 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">East Zone Operational Reach:</strong>
                    <div className="text-[11px] text-purple-800 mt-0.5">
                      Mainland East (West Bengal, Bihar, Jharkhand, Odisha) &amp; North East corridor (Assam, Sikkim, Arunachal Pradesh, Meghalaya, Nagaland, Manipur, Mizoram, Tripura).
                    </div>
                  </div>
                </div>
              )}

              {/* 4 Quantitative Metric Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
                  <div className="text-[11px] text-slate-500 font-medium">Total Incidents</div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                    {activeZoneObj.totalComplaints}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {activeZoneObj.resolvedComplaints} resolved
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
                  <div className="text-[11px] text-slate-500 font-medium">Pending Tickets</div>
                  <div className={`text-xl font-bold font-mono mt-0.5 ${
                    activeZoneObj.openComplaints > 0 ? 'text-amber-600' : 'text-slate-400'
                  }`}>
                    {activeZoneObj.openComplaints}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    requires field dispatch
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
                  <div className="text-[11px] text-slate-500 font-medium">Avg Response Time</div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-0.5 flex items-baseline gap-1">
                    {activeZoneObj.avgResponseMinutes}
                    <span className="text-xs font-normal text-slate-500">mins</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-500" />
                    From ticket trigger
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
                  <div className="text-[11px] text-slate-500 font-medium">Critical Issues</div>
                  <div className={`text-xl font-bold font-mono mt-0.5 ${
                    activeZoneObj.criticalComplaints > 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {activeZoneObj.criticalComplaints}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-rose-500" />
                    High/Urgent priority
                  </div>
                </div>
              </div>

              {/* Equipment Type Breakdown */}
              {activeZoneEquip && activeZoneEquip.total > 0 && (
                <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                      Station Equipment Distribution
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {activeZoneEquip.total} zone records
                    </span>
                  </div>

                  {/* Dual color progress bar */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div 
                      style={{ width: `${activeZoneEquip.compPct}%` }}
                      className="bg-blue-600 h-full transition-all duration-500"
                      title={`Compressor: ${activeZoneEquip.compCount} (${activeZoneEquip.compPct}%)`}
                    />
                    <div 
                      style={{ width: `${activeZoneEquip.dispPct}%` }}
                      className="bg-teal-500 h-full transition-all duration-500"
                      title={`Dispenser: ${activeZoneEquip.dispCount} (${activeZoneEquip.dispPct}%)`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      <span>Compressors: <strong>{activeZoneEquip.compCount}</strong> ({activeZoneEquip.compPct}%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      <span>Dispensers: <strong>{activeZoneEquip.dispCount}</strong> ({activeZoneEquip.dispPct}%)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Recurring Issue Categories in this Zone */}
              {activeZoneTopIssues.length > 0 && (
                <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 space-y-2 shadow-xs">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Top Recurring Failure Categories
                  </div>
                  <div className="space-y-1.5">
                    {activeZoneTopIssues.map((issue, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-700 truncate pr-2 max-w-[200px]">
                          {issue.name}
                        </span>
                        <span className="font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                          {issue.count} cases
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                {onOpenAuditModal && (
                  <button
                    type="button"
                    onClick={() => onOpenAuditModal(activeZoneObj)}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View Full Zone Operational Audit</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {selectedZone && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectZone(null);
                      setIsZoomedToZone(false);
                    }}
                    className="px-3.5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* National All-India Overview Card */
            <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  National Coverage
                </div>
                <h4 className="text-xl font-bold text-slate-900 mt-0.5">
                  All-India CNG Operations Summary
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aggregated telemetry across all 5 geographical maintenance territories
                </p>
              </div>

              {/* 4 National Metrics */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
                  <div className="text-[11px] text-slate-500 font-medium">National Workload</div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                    {nationalTotals.total}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                    {nationalTotals.resolved} resolved ({Math.round((nationalTotals.resolved / Math.max(nationalTotals.total, 1)) * 100)}%)
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
                  <div className="text-[11px] text-slate-500 font-medium">Pending Tickets</div>
                  <div className="text-xl font-bold font-mono text-amber-600 mt-0.5">
                    {nationalTotals.open}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    across 5 zones
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
                  <div className="text-[11px] text-slate-500 font-medium">Average SLA</div>
                  <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
                    {nationalTotals.avgSla}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    national standard ≥92%
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
                  <div className="text-[11px] text-slate-500 font-medium">Avg Arrival Time</div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                    {nationalTotals.avgResponse} <span className="text-xs font-normal text-slate-500">min</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    mean field response
                  </div>
                </div>
              </div>

              {/* 5 Territory Quick Jump Rows */}
              <div className="space-y-1.5 pt-1">
                <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                  <span>Territory Zone Breakdown</span>
                  <span className="text-[10px] text-slate-400 font-normal">Click to focus</span>
                </div>
                {zoneMetrics.map(zm => (
                  <div
                    key={zm.zone}
                    onClick={() => {
                      onSelectZone(zm);
                      if (zm.zone === 'East Zone') {
                        setIsZoomedToZone(true);
                      }
                    }}
                    onMouseEnter={() => setHoveredZoneName(zm.zone)}
                    onMouseLeave={() => setHoveredZoneName(null)}
                    className="p-2.5 bg-white border border-slate-200/80 hover:border-indigo-300 rounded-xl flex items-center justify-between transition-all hover:shadow-xs cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor: 
                            zm.zone === 'North Zone' ? '#3b82f6' :
                            zm.zone === 'West Zone' ? '#6366f1' :
                            zm.zone === 'Central Zone' ? '#f59e0b' :
                            zm.zone === 'East Zone' ? '#8b5cf6' : '#0d9488'
                        }}
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                          <span>{zm.zone}</span>
                          {zm.zone === 'East Zone' && (
                            <span className="text-[9px] px-1 rounded bg-purple-100 text-purple-800 font-semibold">
                              12 States
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Lead: {zm.leadEngineer}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="text-xs font-bold font-mono text-slate-800">
                          {zm.totalComplaints} inc
                        </div>
                        <div className={`text-[10px] font-semibold ${
                          zm.slaPercentage >= 94 ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {zm.slaPercentage}% SLA
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
