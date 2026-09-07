import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Flame, 
  Wrench, 
  Users, 
  ChevronRight, 
  Layers, 
  Maximize2, 
  Minimize2, 
  RotateCcw,
  Sparkles,
  Info,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ZoneMetric, UnifiedIncidentRecord } from '../../types';

export interface IndiaZoneMapProps {
  zoneMetrics: ZoneMetric[];
  incidents: UnifiedIncidentRecord[];
  selectedZone: ZoneMetric | null;
  onSelectZone: (zone: ZoneMetric | null) => void;
  onOpenAuditModal?: (zone: ZoneMetric) => void;
  className?: string;
}

export type MapMetricMode = 'default' | 'volume' | 'sla' | 'open' | 'response';

interface CityHub {
  name: string;
  zone: string;
  x: number;
  y: number;
  equipmentFocus: 'Both' | 'Compressor' | 'Dispenser';
  stationCount: number;
}

const CITY_HUBS: CityHub[] = [
  { name: 'Delhi NCR', zone: 'North Zone', x: 235, y: 220, equipmentFocus: 'Both', stationCount: 42 },
  { name: 'Chandigarh', zone: 'North Zone', x: 215, y: 165, equipmentFocus: 'Dispenser', stationCount: 18 },
  { name: 'Lucknow', zone: 'North Zone', x: 305, y: 245, equipmentFocus: 'Both', stationCount: 26 },
  { name: 'Jaipur', zone: 'North Zone', x: 195, y: 245, equipmentFocus: 'Compressor', stationCount: 22 },
  { name: 'Ahmedabad', zone: 'West Zone', x: 145, y: 320, equipmentFocus: 'Both', stationCount: 54 },
  { name: 'Surat', zone: 'West Zone', x: 152, y: 355, equipmentFocus: 'Dispenser', stationCount: 38 },
  { name: 'Mumbai', zone: 'West Zone', x: 155, y: 410, equipmentFocus: 'Both', stationCount: 68 },
  { name: 'Pune', zone: 'West Zone', x: 175, y: 425, equipmentFocus: 'Both', stationCount: 34 },
  { name: 'Indore', zone: 'Central Zone', x: 225, y: 335, equipmentFocus: 'Compressor', stationCount: 20 },
  { name: 'Bhopal', zone: 'Central Zone', x: 250, y: 330, equipmentFocus: 'Both', stationCount: 16 },
  { name: 'Raipur', zone: 'Central Zone', x: 325, y: 375, equipmentFocus: 'Compressor', stationCount: 14 },
  { name: 'Kolkata', zone: 'East Zone', x: 410, y: 345, equipmentFocus: 'Both', stationCount: 36 },
  { name: 'Patna', zone: 'East Zone', x: 360, y: 265, equipmentFocus: 'Dispenser', stationCount: 19 },
  { name: 'Bhubaneswar', zone: 'East Zone', x: 375, y: 395, equipmentFocus: 'Both', stationCount: 15 },
  { name: 'Guwahati', zone: 'East Zone', x: 480, y: 250, equipmentFocus: 'Compressor', stationCount: 11 },
  { name: 'Hyderabad', zone: 'South Zone', x: 255, y: 450, equipmentFocus: 'Both', stationCount: 40 },
  { name: 'Bengaluru', zone: 'South Zone', x: 228, y: 535, equipmentFocus: 'Both', stationCount: 48 },
  { name: 'Chennai', zone: 'South Zone', x: 285, y: 535, equipmentFocus: 'Dispenser', stationCount: 35 },
  { name: 'Kochi', zone: 'South Zone', x: 210, y: 615, equipmentFocus: 'Both', stationCount: 24 }
];

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
  const [hoveredHub, setHoveredHub] = useState<CityHub | null>(null);
  const [showHubs, setShowHubs] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);

  // Map zone data lookup
  const zoneDataMap = useMemo(() => {
    const map: Record<string, ZoneMetric> = {};
    zoneMetrics.forEach(z => {
      map[z.zone] = z;
    });
    return map;
  }, [zoneMetrics]);

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

    // Highest volume zone
    const maxZone = [...zoneMetrics].sort((a, b) => b.totalComplaints - a.totalComplaints)[0];

    return { total, resolved, open, avgSla, avgResponse, maxZone };
  }, [zoneMetrics]);

  // Color logic based on metric mode
  const getZoneColor = (zoneName: string, isHovered: boolean, isSelected: boolean) => {
    const metric = zoneDataMap[zoneName];
    
    // Default territory corporate palette
    const defaultColors: Record<string, { base: string; hover: string; selected: string; stroke: string; glow: string }> = {
      'North Zone': { 
        base: '#3b82f6', 
        hover: '#2563eb', 
        selected: '#1d4ed8', 
        stroke: '#1e40af',
        glow: 'rgba(59, 130, 246, 0.4)'
      },
      'West Zone': { 
        base: '#6366f1', 
        hover: '#4f46e5', 
        selected: '#4338ca', 
        stroke: '#3730a3',
        glow: 'rgba(99, 102, 241, 0.4)'
      },
      'Central Zone': { 
        base: '#f59e0b', 
        hover: '#d97706', 
        selected: '#b45309', 
        stroke: '#92400e',
        glow: 'rgba(245, 158, 11, 0.4)'
      },
      'East Zone': { 
        base: '#8b5cf6', 
        hover: '#7c3aed', 
        selected: '#6d28d9', 
        stroke: '#5b21b6',
        glow: 'rgba(139, 92, 246, 0.4)'
      },
      'South Zone': { 
        base: '#0d9488', 
        hover: '#0f766e', 
        selected: '#115e59', 
        stroke: '#134e4a',
        glow: 'rgba(13, 148, 136, 0.4)'
      }
    };

    if (metricMode === 'volume') {
      const total = metric?.totalComplaints || 0;
      const max = Math.max(...zoneMetrics.map(z => z.totalComplaints), 1);
      const ratio = total / max;
      if (ratio > 0.8) return { fill: isHovered ? '#1e3a8a' : '#2563eb', stroke: '#172554' };
      if (ratio > 0.5) return { fill: isHovered ? '#2563eb' : '#3b82f6', stroke: '#1e40af' };
      if (ratio > 0.25) return { fill: isHovered ? '#3b82f6' : '#60a5fa', stroke: '#2563eb' };
      return { fill: isHovered ? '#60a5fa' : '#93c5fd', stroke: '#3b82f6' };
    }

    if (metricMode === 'sla') {
      const sla = metric?.slaPercentage || 90;
      if (sla >= 95) return { fill: isHovered ? '#059669' : '#10b981', stroke: '#047857' };
      if (sla >= 92) return { fill: isHovered ? '#0d9488' : '#14b8a6', stroke: '#0f766e' };
      if (sla >= 89) return { fill: isHovered ? '#d97706' : '#f59e0b', stroke: '#b45309' };
      return { fill: isHovered ? '#dc2626' : '#ef4444', stroke: '#b91c1c' };
    }

    if (metricMode === 'open') {
      const open = metric?.openComplaints || 0;
      if (open >= 4) return { fill: isHovered ? '#dc2626' : '#ef4444', stroke: '#991b1b' };
      if (open >= 2) return { fill: isHovered ? '#d97706' : '#f59e0b', stroke: '#b45309' };
      if (open >= 1) return { fill: isHovered ? '#eab308' : '#facc15', stroke: '#a16207' };
      return { fill: isHovered ? '#059669' : '#10b981', stroke: '#047857' };
    }

    if (metricMode === 'response') {
      const mins = metric?.avgResponseMinutes || 30;
      if (mins <= 24) return { fill: isHovered ? '#059669' : '#10b981', stroke: '#047857' };
      if (mins <= 30) return { fill: isHovered ? '#0d9488' : '#06b6d4', stroke: '#0e7490' };
      if (mins <= 35) return { fill: isHovered ? '#2563eb' : '#3b82f6', stroke: '#1d4ed8' };
      return { fill: isHovered ? '#d97706' : '#f59e0b', stroke: '#b45309' };
    }

    // Default palette
    const conf = defaultColors[zoneName] || defaultColors['West Zone'];
    return {
      fill: isSelected ? conf.selected : isHovered ? conf.hover : conf.base,
      stroke: conf.stroke,
      glow: conf.glow
    };
  };

  const activeZoneObj = selectedZone || (hoveredZoneName ? zoneDataMap[hoveredZoneName] : null);

  // Active Zone Inflow Breakdown from Incidents
  const activeZoneIncidents = useMemo(() => {
    if (!activeZoneObj) return [];
    return incidents.filter(i => 
      i.zoneOrArea === activeZoneObj.zone || 
      i.zoneOrArea.toLowerCase().includes(activeZoneObj.zone.split(' ')[0].toLowerCase())
    );
  }, [activeZoneObj, incidents]);

  const activeCompressorCount = activeZoneIncidents.filter(i => i.equipmentType === 'Compressor').length;
  const activeDispenserCount = activeZoneIncidents.filter(i => i.equipmentType === 'Dispenser').length;

  return (
    <div className={`bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs transition-all ${className}`}>
      
      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900">
                  National Territory Operational Map
                </h3>
                <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2 py-0.5 rounded-md font-mono">
                  5 Active Zones
                </span>
                {selectedZone && (
                  <span className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    Filtered: {selectedZone.zone}
                    <button 
                      type="button" 
                      onClick={() => onSelectZone(null)}
                      className="ml-1 hover:text-amber-950 font-bold cursor-pointer"
                      title="Clear zone filter"
                    >
                      &times;
                    </button>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Geographic service workload distribution, SLA velocity, and response coverage across India
              </p>
            </div>
          </div>
        </div>

        {/* Action Clusters: Metric Mode Selector & Display Toggles */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
          {/* Metric Choropleth Selector */}
          <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setMetricMode('default')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                metricMode === 'default'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Distinct zone territory colors"
            >
              Territories
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('volume')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                metricMode === 'volume'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Incident Volume heatmap"
            >
              Volume
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('sla')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                metricMode === 'sla'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="SLA Adherence performance"
            >
              SLA %
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('open')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                metricMode === 'open'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Open tickets / pending hotspots"
            >
              Open Issues
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('response')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                metricMode === 'response'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Response reach speed"
            >
              Speed
            </button>
          </div>

          {/* Toggle Hub Pins */}
          <button
            type="button"
            onClick={() => setShowHubs(!showHubs)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showHubs 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Toggle major city service hubs and station clusters"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hubs</span>
          </button>

          {/* Reset Selection */}
          {selectedZone && (
            <button
              type="button"
              onClick={() => onSelectZone(null)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Reset zone filter to View All India"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Map Body: Grid with Map on Left & Inspector Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 items-start">
        
        {/* Left Column: Interactive India Map Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative bg-gradient-to-b from-slate-50/70 via-white to-slate-50/40 rounded-2xl border border-slate-200/80 p-4 overflow-hidden">
          
          {/* Floating Map Legend / Mode Indicator */}
          <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-xl px-2.5 py-1.5 shadow-xs text-[11px] space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {metricMode === 'default' && 'Territory Zones'}
              {metricMode === 'volume' && 'Incident Volume (Density)'}
              {metricMode === 'sla' && 'SLA Compliance (%)'}
              {metricMode === 'open' && 'Open Hotspots (Cases)'}
              {metricMode === 'response' && 'Avg Reach Speed (Mins)'}
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {metricMode === 'default' ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> North
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#6366f1]" /> West
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Central
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" /> East
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#0d9488]" /> South
                  </span>
                </div>
              ) : metricMode === 'volume' ? (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                  <span>Low</span>
                  <div className="h-2 w-16 rounded-full bg-gradient-to-r from-blue-200 via-blue-400 to-blue-800" />
                  <span>Heavy</span>
                </div>
              ) : metricMode === 'sla' ? (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> ≥95%</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500" /> 92-94%</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> &lt;92%</span>
                </div>
              ) : metricMode === 'open' ? (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> 0 Open</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> 1-3 Open</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> 4+ Open</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                  <span>&lt;25m</span>
                  <div className="h-2 w-16 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-500 to-amber-500" />
                  <span>&gt;35m</span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Floating Tooltip */}
          {hoveredZoneName && (
            <div className="absolute bottom-3 left-3 z-20 bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-lg border border-slate-700/60 text-xs min-w-[180px] pointer-events-none transition-all">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
                <span className="font-bold text-white text-xs">{hoveredZoneName}</span>
                <span className="font-mono text-[11px] text-emerald-400 font-bold">
                  {zoneDataMap[hoveredZoneName]?.slaPercentage}% SLA
                </span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span>Total Incidents:</span>
                  <span className="font-mono font-bold text-white">{zoneDataMap[hoveredZoneName]?.totalComplaints || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Open:</span>
                  <span className={`font-mono font-bold ${(zoneDataMap[hoveredZoneName]?.openComplaints || 0) > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                    {zoneDataMap[hoveredZoneName]?.openComplaints || 0} pending
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Site Arrival:</span>
                  <span className="font-mono text-cyan-300">{zoneDataMap[hoveredZoneName]?.avgResponseMinutes || 30} mins</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                  <span>Lead:</span>
                  <span className="text-slate-200 truncate max-w-[90px]">{zoneDataMap[hoveredZoneName]?.leadEngineer}</span>
                </div>
              </div>
              <div className="text-[9px] text-indigo-300 mt-1 text-center font-medium">
                Click to inspect & filter dashboard
              </div>
            </div>
          )}

          {/* Hub Pin Hover Tooltip */}
          {hoveredHub && (
            <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-md border border-slate-200 text-slate-900 px-3 py-2 rounded-xl shadow-lg text-xs pointer-events-none">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                {hoveredHub.name}
              </div>
              <div className="text-[10px] text-slate-500">{hoveredHub.zone}</div>
              <div className="text-[11px] font-medium text-slate-700 mt-1 flex items-center gap-1">
                <span>Active Field Stations:</span>
                <span className="font-mono font-bold text-indigo-700">{hoveredHub.stationCount}</span>
              </div>
            </div>
          )}

          {/* SVG Map Viewport */}
          <div className="w-full max-w-[460px] aspect-[600/680] relative flex items-center justify-center">
            <svg
              viewBox="0 0 600 680"
              className="w-full h-full filter drop-shadow-md select-none transition-all duration-300"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Subtle drop shadow filters for zones */}
                <filter id="zoneShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.12" />
                </filter>
                <filter id="selectedGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#3b82f6" floodOpacity="0.5" />
                </filter>
              </defs>

              {/* Water background decorative ocean contour */}
              <path
                d="M 50,380 C 40,460 70,550 140,640 C 200,700 280,690 350,650 C 430,600 480,480 480,380"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.6"
              />

              {/* Neighboring hints (Sri Lanka) */}
              <ellipse
                cx="290"
                cy="650"
                rx="14"
                ry="22"
                fill="#f1f5f9"
                stroke="#cbd5e1"
                strokeWidth="1.2"
              />
              <text x="290" y="654" textAnchor="middle" fontSize="7" fill="#94a3b8" fontWeight="600">
                SL
              </text>

              {/* Andaman & Nicobar islands hint */}
              <g opacity="0.75">
                <circle cx="535" cy="570" r="4" fill="#cbd5e1" />
                <circle cx="540" cy="590" r="4.5" fill="#cbd5e1" />
                <circle cx="545" cy="615" r="5" fill="#cbd5e1" />
                <text x="542" y="632" textAnchor="middle" fontSize="7" fill="#94a3b8" fontWeight="600">
                  A&N (IND)
                </text>
              </g>

              {/* Lakshadweep hint */}
              <g opacity="0.75">
                <circle cx="160" cy="595" r="3.5" fill="#cbd5e1" />
                <circle cx="155" cy="610" r="3.5" fill="#cbd5e1" />
                <text x="157" y="625" textAnchor="middle" fontSize="7" fill="#94a3b8" fontWeight="600">
                  LD
                </text>
              </g>

              {/* ==================================================== */}
              {/* ZONE 1: NORTH ZONE                                   */}
              {/* J&K, Ladakh, HP, Punjab, Haryana, Delhi, UP, North RJ */}
              {/* ==================================================== */}
              {(() => {
                const zName = 'North Zone';
                const isHovered = hoveredZoneName === zName;
                const isSelected = selectedZone?.zone === zName;
                const colors = getZoneColor(zName, isHovered, isSelected);

                return (
                  <g
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredZoneName(zName)}
                    onMouseLeave={() => setHoveredZoneName(null)}
                    onClick={() => onSelectZone(isSelected ? null : zoneDataMap[zName] || null)}
                  >
                    <path
                      d="
                        M 215,50 
                        C 232,34 260,34 274,54 
                        C 288,74 298,94 288,122 
                        C 278,138 282,154 268,172 
                        C 286,186 308,202 328,212 
                        C 348,222 372,232 382,252 
                        C 362,266 342,272 322,286 
                        C 300,296 280,286 265,280 
                        C 245,275 230,285 210,275 
                        C 185,265 170,245 160,225 
                        C 155,200 170,175 180,155 
                        C 185,130 195,100 200,80 
                        Z
                      "
                      fill={colors.fill}
                      stroke={isSelected ? '#1e3a8a' : colors.stroke}
                      strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.5}
                      strokeLinejoin="round"
                      filter={isSelected ? 'url(#selectedGlow)' : 'url(#zoneShadow)'}
                      opacity={selectedZone && !isSelected ? 0.45 : 0.95}
                    />
                    
                    {/* Internal State Guide Accents */}
                    <path
                      d="M 200,120 C 220,135 240,140 260,135 M 190,170 C 215,185 235,180 250,175 M 240,210 C 270,230 300,240 340,250"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="0.8"
                      strokeDasharray="2 3"
                      opacity="0.35"
                    />

                    {/* Zone Badge & Label */}
                    {showLabels && (
                      <g transform="translate(240, 175)" className="pointer-events-none">
                        <rect 
                          x="-42" 
                          y="-14" 
                          width="84" 
                          height="24" 
                          rx="6" 
                          fill="rgba(15, 23, 42, 0.75)" 
                          stroke="rgba(255, 255, 255, 0.4)" 
                          strokeWidth="1" 
                        />
                        <text 
                          x="0" 
                          y="2" 
                          textAnchor="middle" 
                          fontSize="10" 
                          fill="#ffffff" 
                          fontWeight="700"
                        >
                          NORTH ZONE
                        </text>
                      </g>
                    )}
                  </g>
                );
              })()}

              {/* ==================================================== */}
              {/* ZONE 2: WEST ZONE                                    */}
              {/* Gujarat, Maharashtra, Goa, West Rajasthan            */}
              {/* ==================================================== */}
              {(() => {
                const zName = 'West Zone';
                const isHovered = hoveredZoneName === zName;
                const isSelected = selectedZone?.zone === zName;
                const colors = getZoneColor(zName, isHovered, isSelected);

                return (
                  <g
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredZoneName(zName)}
                    onMouseLeave={() => setHoveredZoneName(null)}
                    onClick={() => onSelectZone(isSelected ? null : zoneDataMap[zName] || null)}
                  >
                    <path
                      d="
                        M 160,225
                        C 170,245 185,265 210,275
                        C 215,290 220,310 220,325
                        C 225,345 235,365 240,390
                        C 240,420 215,445 190,460
                        C 175,468 162,472 158,470
                        C 155,440 152,410 148,375
                        C 140,355 130,360 110,362
                        C 90,365 78,340 85,320
                        C 95,305 110,310 120,295
                        C 105,290 75,285 70,270
                        C 95,260 125,255 145,240
                        Z
                      "
                      fill={colors.fill}
                      stroke={isSelected ? '#312e81' : colors.stroke}
                      strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.5}
                      strokeLinejoin="round"
                      filter={isSelected ? 'url(#selectedGlow)' : 'url(#zoneShadow)'}
                      opacity={selectedZone && !isSelected ? 0.45 : 0.95}
                    />

                    {/* Gujarat Kathiawar & Mumbai coastline accent */}
                    <path
                      d="M 130,325 C 135,345 145,360 150,380 M 150,380 C 153,410 155,440 158,470"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="0.8"
                      strokeDasharray="2 3"
                      opacity="0.35"
                    />

                    {/* Zone Badge & Label */}
                    {showLabels && (
                      <g transform="translate(150, 345)" className="pointer-events-none">
                        <rect 
                          x="-38" 
                          y="-14" 
                          width="76" 
                          height="24" 
                          rx="6" 
                          fill="rgba(15, 23, 42, 0.75)" 
                          stroke="rgba(255, 255, 255, 0.4)" 
                          strokeWidth="1" 
                        />
                        <text 
                          x="0" 
                          y="2" 
                          textAnchor="middle" 
                          fontSize="10" 
                          fill="#ffffff" 
                          fontWeight="700"
                        >
                          WEST ZONE
                        </text>
                      </g>
                    )}
                  </g>
                );
              })()}

              {/* ==================================================== */}
              {/* ZONE 3: CENTRAL ZONE                                 */}
              {/* Madhya Pradesh & Chhattisgarh                        */}
              {/* ==================================================== */}
              {(() => {
                const zName = 'Central Zone';
                const isHovered = hoveredZoneName === zName;
                const isSelected = selectedZone?.zone === zName;
                const colors = getZoneColor(zName, isHovered, isSelected);

                return (
                  <g
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredZoneName(zName)}
                    onMouseLeave={() => setHoveredZoneName(null)}
                    onClick={() => onSelectZone(isSelected ? null : zoneDataMap[zName] || null)}
                  >
                    <path
                      d="
                        M 210,275
                        C 230,285 245,275 265,280
                        C 280,286 300,296 322,286
                        C 335,305 345,335 340,365
                        C 345,385 355,410 330,440
                        C 305,435 275,428 240,390
                        C 235,365 225,345 220,325
                        C 220,310 215,290 210,275
                        Z
                      "
                      fill={colors.fill}
                      stroke={isSelected ? '#78350f' : colors.stroke}
                      strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.5}
                      strokeLinejoin="round"
                      filter={isSelected ? 'url(#selectedGlow)' : 'url(#zoneShadow)'}
                      opacity={selectedZone && !isSelected ? 0.45 : 0.95}
                    />

                    {/* MP / Chhattisgarh dividing curve */}
                    <path
                      d="M 285,300 C 290,340 300,380 315,420"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="0.8"
                      strokeDasharray="2 3"
                      opacity="0.35"
                    />

                    {/* Zone Badge & Label */}
                    {showLabels && (
                      <g transform="translate(275, 345)" className="pointer-events-none">
                        <rect 
                          x="-46" 
                          y="-14" 
                          width="92" 
                          height="24" 
                          rx="6" 
                          fill="rgba(15, 23, 42, 0.75)" 
                          stroke="rgba(255, 255, 255, 0.4)" 
                          strokeWidth="1" 
                        />
                        <text 
                          x="0" 
                          y="2" 
                          textAnchor="middle" 
                          fontSize="10" 
                          fill="#ffffff" 
                          fontWeight="700"
                        >
                          CENTRAL ZONE
                        </text>
                      </g>
                    )}
                  </g>
                );
              })()}

              {/* ==================================================== */}
              {/* ZONE 4: EAST ZONE                                    */}
              {/* Bihar, Jharkhand, West Bengal, Odisha, North East    */}
              {/* ==================================================== */}
              {(() => {
                const zName = 'East Zone';
                const isHovered = hoveredZoneName === zName;
                const isSelected = selectedZone?.zone === zName;
                const colors = getZoneColor(zName, isHovered, isSelected);

                return (
                  <g
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredZoneName(zName)}
                    onMouseLeave={() => setHoveredZoneName(null)}
                    onClick={() => onSelectZone(isSelected ? null : zoneDataMap[zName] || null)}
                  >
                    <path
                      d="
                        M 322,286
                        C 342,272 362,266 382,252
                        C 395,248 415,232 430,220
                        C 455,210 495,200 535,210
                        C 560,220 570,245 555,270
                        C 540,290 515,295 490,295
                        C 465,295 448,275 435,275
                        C 425,290 422,320 415,360
                        C 400,385 375,415 340,465
                        C 335,450 330,440 330,440
                        C 355,410 345,385 340,365
                        C 345,335 335,305 322,286
                        Z
                      "
                      fill={colors.fill}
                      stroke={isSelected ? '#4c1d95' : colors.stroke}
                      strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.5}
                      strokeLinejoin="round"
                      filter={isSelected ? 'url(#selectedGlow)' : 'url(#zoneShadow)'}
                      opacity={selectedZone && !isSelected ? 0.45 : 0.95}
                    />

                    {/* Siliguri Corridor / Bay of Bengal boundary lines */}
                    <path
                      d="M 370,300 C 375,340 380,380 385,410 M 430,220 C 440,245 445,265 440,285"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="0.8"
                      strokeDasharray="2 3"
                      opacity="0.35"
                    />

                    {/* Zone Badge & Label */}
                    {showLabels && (
                      <g transform="translate(390, 335)" className="pointer-events-none">
                        <rect 
                          x="-36" 
                          y="-14" 
                          width="72" 
                          height="24" 
                          rx="6" 
                          fill="rgba(15, 23, 42, 0.75)" 
                          stroke="rgba(255, 255, 255, 0.4)" 
                          strokeWidth="1" 
                        />
                        <text 
                          x="0" 
                          y="2" 
                          textAnchor="middle" 
                          fontSize="10" 
                          fill="#ffffff" 
                          fontWeight="700"
                        >
                          EAST ZONE
                        </text>
                      </g>
                    )}
                  </g>
                );
              })()}

              {/* ==================================================== */}
              {/* ZONE 5: SOUTH ZONE                                   */}
              {/* AP, Telangana, Karnataka, Tamil Nadu, Kerala        */}
              {/* ==================================================== */}
              {(() => {
                const zName = 'South Zone';
                const isHovered = hoveredZoneName === zName;
                const isSelected = selectedZone?.zone === zName;
                const colors = getZoneColor(zName, isHovered, isSelected);

                return (
                  <g
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredZoneName(zName)}
                    onMouseLeave={() => setHoveredZoneName(null)}
                    onClick={() => onSelectZone(isSelected ? null : zoneDataMap[zName] || null)}
                  >
                    <path
                      d="
                        M 158,470
                        C 162,472 175,468 190,460
                        C 215,445 240,420 240,390
                        C 275,428 305,435 330,440
                        C 330,440 335,450 340,465
                        C 330,490 310,520 295,550
                        C 285,580 270,615 250,650
                        C 240,668 230,670 225,665
                        C 215,650 205,620 195,580
                        C 185,545 175,510 162,485
                        Z
                      "
                      fill={colors.fill}
                      stroke={isSelected ? '#0f766e' : colors.stroke}
                      strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.5}
                      strokeLinejoin="round"
                      filter={isSelected ? 'url(#selectedGlow)' : 'url(#zoneShadow)'}
                      opacity={selectedZone && !isSelected ? 0.45 : 0.95}
                    />

                    {/* Peninsular Deccan curve */}
                    <path
                      d="M 230,460 C 240,510 245,560 240,610 M 200,560 C 225,565 255,555 285,540"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="0.8"
                      strokeDasharray="2 3"
                      opacity="0.35"
                    />

                    {/* Zone Badge & Label */}
                    {showLabels && (
                      <g transform="translate(240, 530)" className="pointer-events-none">
                        <rect 
                          x="-42" 
                          y="-14" 
                          width="84" 
                          height="24" 
                          rx="6" 
                          fill="rgba(15, 23, 42, 0.75)" 
                          stroke="rgba(255, 255, 255, 0.4)" 
                          strokeWidth="1" 
                        />
                        <text 
                          x="0" 
                          y="2" 
                          textAnchor="middle" 
                          fontSize="10" 
                          fill="#ffffff" 
                          fontWeight="700"
                        >
                          SOUTH ZONE
                        </text>
                      </g>
                    )}
                  </g>
                );
              })()}

              {/* ==================================================== */}
              {/* MAJOR CNG STATIONS & SERVICE HUBS (Interactive Pins) */}
              {/* ==================================================== */}
              {showHubs && CITY_HUBS.map(hub => {
                const isSelectedHubZone = selectedZone?.zone === hub.zone;
                return (
                  <g
                    key={hub.name}
                    className="cursor-pointer group"
                    transform={`translate(${hub.x}, ${hub.y})`}
                    onMouseEnter={() => setHoveredHub(hub)}
                    onMouseLeave={() => setHoveredHub(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectZone(zoneDataMap[hub.zone] || null);
                    }}
                  >
                    {/* Ripple halo for selected zone hubs */}
                    {isSelectedHubZone && (
                      <circle
                        cx="0"
                        cy="0"
                        r="10"
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
                      r="4.5"
                      fill="#ffffff"
                      stroke="#0f172a"
                      strokeWidth="1.5"
                      className="group-hover:scale-125 transition-transform"
                    />

                    {/* Core dot */}
                    <circle
                      cx="0"
                      cy="0"
                      r="2.5"
                      fill={
                        hub.equipmentFocus === 'Compressor' 
                          ? '#2563eb' 
                          : hub.equipmentFocus === 'Dispenser' 
                          ? '#0d9488' 
                          : '#4f46e5'
                      }
                    />

                    {/* Hub Name label */}
                    <text
                      x="7"
                      y="3"
                      fontSize="8"
                      fontWeight="600"
                      fill="#0f172a"
                      className="opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-xs"
                    >
                      {hub.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Bottom guidance line */}
          <div className="w-full flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100/90 mt-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Click any zone polygon or hub marker to filter territory metrics
            </span>
            {selectedZone && (
              <button
                type="button"
                onClick={() => onSelectZone(null)}
                className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors cursor-pointer"
              >
                Reset to All-India
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Dynamic Territory Performance Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {activeZoneObj ? (
            /* Zone Inspector Card when a zone is active or hovered */
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4 transition-all">
              
              {/* Header with Title and SLA Pill */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-200/70 pb-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" />
                    Territory Intelligence
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                    {activeZoneObj.zone}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Lead Field Engineer: <strong className="text-slate-800">{activeZoneObj.leadEngineer}</strong>
                  </p>
                </div>

                <div className={`text-right px-2.5 py-1 rounded-xl border text-xs font-bold ${
                  activeZoneObj.slaPercentage >= 94 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : activeZoneObj.slaPercentage >= 90
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  <div className="font-mono text-sm">{activeZoneObj.slaPercentage}%</div>
                  <div className="text-[10px] font-normal">SLA Compliance</div>
                </div>
              </div>

              {/* 4 Quantitative Metric Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white border border-slate-200/80 rounded-xl p-2.5">
                  <div className="text-[11px] text-slate-500 font-medium">Total Incidents</div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                    {activeZoneObj.totalComplaints}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                    {activeZoneObj.resolvedComplaints} closed
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-xl p-2.5">
                  <div className="text-[11px] text-slate-500 font-medium">Pending Tickets</div>
                  <div className={`text-lg font-bold font-mono mt-0.5 ${
                    activeZoneObj.openComplaints > 0 ? 'text-amber-600' : 'text-slate-400'
                  }`}>
                    {activeZoneObj.openComplaints}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {activeZoneObj.openComplaints > 0 ? 'Needs field action' : 'All clear'}
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-xl p-2.5">
                  <div className="text-[11px] text-slate-500 font-medium">Avg Site Arrival</div>
                  <div className="text-lg font-bold font-mono text-indigo-700 mt-0.5">
                    {activeZoneObj.avgResponseMinutes}m
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">WhatsApp to on-site</div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-xl p-2.5">
                  <div className="text-[11px] text-slate-500 font-medium">Resolution Time</div>
                  <div className="text-lg font-bold font-mono text-slate-800 mt-0.5">
                    {activeZoneObj.avgResolutionHours}h
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Mean turnaround</div>
                </div>
              </div>

              {/* Equipment Inflow Breakdown (Compressor vs Dispenser) */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Equipment Split in {activeZoneObj.zone}</span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {activeCompressorCount} Comp / {activeDispenserCount} Disp
                  </span>
                </div>
                {activeCompressorCount + activeDispenserCount > 0 ? (
                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-blue-600 h-full transition-all"
                        style={{ width: `${Math.round((activeCompressorCount / (activeCompressorCount + activeDispenserCount)) * 100)}%` }}
                        title={`Compressors: ${activeCompressorCount}`}
                      />
                      <div 
                        className="bg-teal-600 h-full transition-all"
                        style={{ width: `${Math.round((activeDispenserCount / (activeCompressorCount + activeDispenserCount)) * 100)}%` }}
                        title={`Dispensers: ${activeDispenserCount}`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        Compressor ({Math.round((activeCompressorCount / (activeCompressorCount + activeDispenserCount)) * 100)}%)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                        Dispenser ({Math.round((activeDispenserCount / (activeCompressorCount + activeDispenserCount)) * 100)}%)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic">No tickets in current date range</div>
                )}
              </div>

              {/* Top Issue & Stations */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Primary Breakdown Issue:</span>
                  <span className="font-bold text-slate-800">{activeZoneObj.topProblem}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-slate-500">Active Station Assets:</span>
                  <span className="font-mono font-bold text-slate-800">{activeZoneObj.activeAssets} units</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {onOpenAuditModal && (
                  <button
                    type="button"
                    onClick={() => onOpenAuditModal(activeZoneObj)}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Full Audit View</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {selectedZone?.zone === activeZoneObj.zone ? (
                  <button
                    type="button"
                    onClick={() => onSelectZone(null)}
                    className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Clear Filter
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectZone(activeZoneObj)}
                    className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Filter Data
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* National Overview Card when no zone is hovered or selected */
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-200/70 pb-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Consolidated Overview
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">
                  All-India Territory Network
                </h4>
                <p className="text-xs text-slate-500">
                  Select any region on the map or click below to examine operational velocity
                </p>
              </div>

              {/* National Summary KPIs */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white border border-slate-200/80 rounded-xl p-2.5">
                  <div className="text-[11px] text-slate-500">Total Inflow</div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                    {nationalTotals.total}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                    {nationalTotals.resolved} resolved
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-xl p-2.5">
                  <div className="text-[11px] text-slate-500">National SLA</div>
                  <div className="text-lg font-bold font-mono text-emerald-600 mt-0.5">
                    {nationalTotals.avgSla}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Target &gt; 92.0%</div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-xl p-2.5">
                  <div className="text-[11px] text-slate-500">Active Open</div>
                  <div className="text-lg font-bold font-mono text-amber-600 mt-0.5">
                    {nationalTotals.open}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Across all 5 zones</div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-xl p-2.5">
                  <div className="text-[11px] text-slate-500">Avg Arrival Speed</div>
                  <div className="text-lg font-bold font-mono text-indigo-600 mt-0.5">
                    {nationalTotals.avgResponse}m
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">On-site response</div>
                </div>
              </div>

              {/* Quick Select Territory List */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Quick Territory Selection
                </div>
                <div className="space-y-1">
                  {zoneMetrics.map(z => (
                    <button
                      key={z.zone}
                      type="button"
                      onClick={() => onSelectZone(z)}
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200/80 text-xs transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          z.zone === 'North Zone' ? 'bg-blue-500' :
                          z.zone === 'West Zone' ? 'bg-indigo-500' :
                          z.zone === 'Central Zone' ? 'bg-amber-500' :
                          z.zone === 'East Zone' ? 'bg-purple-500' : 'bg-teal-500'
                        }`} />
                        <span className="font-semibold text-slate-800 group-hover:text-slate-950">
                          {z.zone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-slate-500">
                          {z.totalComplaints} calls
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {z.slaPercentage}%
                        </span>
                        <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
