import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle2, 
  RotateCcw, 
  SlidersHorizontal, 
  ChevronDown, 
  Check, 
  X, 
  Layers, 
  BarChart3, 
  Table as TableIcon,
  Search,
  Filter
} from 'lucide-react';
import { DashboardFilters, DatePreset, EquipmentType, ViewMode } from '../types';

interface FilterBarProps {
  filters: DashboardFilters;
  onFilterChange: (filters: DashboardFilters) => void;
  onResetFilters: () => void;
  filteredCount: number;
  totalCount: number;
  availableZones: string[];
  availableEngineers: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  filteredCount,
  totalCount,
  availableZones,
  availableEngineers
}) => {
  const [isZoneOpen, setIsZoneOpen] = useState(false);
  const [isEngineerOpen, setIsEngineerOpen] = useState(false);
  const [zoneSearch, setZoneSearch] = useState('');
  const [engineerSearch, setEngineerSearch] = useState('');

  const zoneRef = useRef<HTMLDivElement>(null);
  const engineerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (zoneRef.current && !zoneRef.current.contains(event.target as Node)) {
        setIsZoneOpen(false);
      }
      if (engineerRef.current && !engineerRef.current.contains(event.target as Node)) {
        setIsEngineerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const datePresets: { id: DatePreset; label: string }[] = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'this_week', label: 'This Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'this_quarter', label: 'This Quarter' },
    { id: 'this_year', label: 'This Year' },
    { id: 'custom', label: 'Custom Range' }
  ];

  const handleDatePresetChange = (preset: DatePreset) => {
    let start = '';
    let end = '';
    const now = new Date('2026-09-04T12:00:00');

    if (preset === 'today') {
      start = '2026-09-04';
      end = '2026-09-04';
    } else if (preset === 'this_week') {
      start = '2026-08-31';
      end = '2026-09-04';
    } else if (preset === 'this_month') {
      start = '2026-09-01';
      end = '2026-09-30';
    } else if (preset === 'this_quarter') {
      start = '2026-07-01';
      end = '2026-09-30';
    } else if (preset === 'this_year') {
      start = '2026-01-01';
      end = '2026-12-31';
    }

    onFilterChange({
      ...filters,
      datePreset: preset,
      startDate: start,
      endDate: end
    });
  };

  const handleToggleZone = (zone: string) => {
    const exists = filters.zones.includes(zone);
    const newZones = exists 
      ? filters.zones.filter(z => z !== zone)
      : [...filters.zones, zone];
    
    onFilterChange({
      ...filters,
      zones: newZones
    });
  };

  const handleSelectAllZones = () => {
    onFilterChange({
      ...filters,
      zones: filters.zones.length === availableZones.length ? [] : [...availableZones]
    });
  };

  const handleToggleEngineer = (eng: string) => {
    const exists = filters.engineers.includes(eng);
    const newEngs = exists 
      ? filters.engineers.filter(e => e !== eng)
      : [...filters.engineers, eng];
    
    onFilterChange({
      ...filters,
      engineers: newEngs
    });
  };

  const handleSelectAllEngineers = () => {
    onFilterChange({
      ...filters,
      engineers: filters.engineers.length === availableEngineers.length ? [] : [...availableEngineers]
    });
  };

  const isAllZonesSelected = availableZones.length > 0 && filters.zones.length === availableZones.length;
  const isAllEngineersSelected = availableEngineers.length > 0 && filters.engineers.length === availableEngineers.length;

  const zoneDisplayText = 
    filters.zones.length === 0 || isAllZonesSelected
      ? 'All'
      : filters.zones.join(', ');

  const engineerDisplayText = 
    filters.engineers.length === 0 || isAllEngineersSelected
      ? 'All'
      : filters.engineers.join(', ');

  const isFiltered = 
    filters.datePreset !== 'all' || 
    filters.zones.length > 0 || 
    filters.engineers.length > 0 || 
    filters.status !== 'All' ||
    filters.equipmentType !== 'All';

  const filteredZonesList = availableZones.filter(z => 
    z.toLowerCase().includes(zoneSearch.toLowerCase())
  );

  const filteredEngineersList = availableEngineers.filter(e => 
    e.toLowerCase().includes(engineerSearch.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Header: Controls Title, Equipment Mode, View Toggle & Reset */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>Smart Operations Filters</span>
              {isFiltered && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 animate-pulse">
                  Filters Active
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">{filteredCount}</span> records of {totalCount} total dataset incidents
            </div>
          </div>
        </div>

        {/* Equipment Selector & View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Equipment Selector */}
          <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-600">
            {(['All', 'Compressor', 'Dispenser'] as EquipmentType[]).map((type) => (
              <button
                key={type}
                onClick={() => onFilterChange({ ...filters, equipmentType: type })}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                  filters.equipmentType === type
                    ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type === 'All' ? 'All Equipment' : `${type} Data`}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-600">
            <button
              onClick={() => onFilterChange({ ...filters, viewMode: 'both' })}
              title="Split View (Charts + Table)"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                filters.viewMode === 'both'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onFilterChange({ ...filters, viewMode: 'graphical' })}
              title="Graphical Charts View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                filters.viewMode === 'graphical'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onFilterChange({ ...filters, viewMode: 'tabular' })}
              title="Tabular Data View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                filters.viewMode === 'tabular'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 rounded-xl border border-rose-200 transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Filter Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. DATE PRESET & RANGE FILTER */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-indigo-600" />
              Date Filter
            </span>
            {filters.datePreset !== 'all' && (
              <span className="text-[10px] text-indigo-600 font-semibold lowercase">
                {filters.datePreset.replace('_', ' ')}
              </span>
            )}
          </label>

          <div className="space-y-1.5">
            <div className="relative">
              <select
                value={filters.datePreset}
                onChange={(e) => handleDatePresetChange(e.target.value as DatePreset)}
                className="w-full appearance-none bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
              >
                {datePresets.map((dp) => (
                  <option key={dp.id} value={dp.id}>
                    {dp.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Custom Date Range Inputs */}
            {(filters.datePreset === 'custom' || filters.startDate || filters.endDate) && (
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => onFilterChange({ ...filters, datePreset: 'custom', startDate: e.target.value })}
                  placeholder="Start date"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-800 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => onFilterChange({ ...filters, datePreset: 'custom', endDate: e.target.value })}
                  placeholder="End date"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* 2. MULTI-SELECT ZONE FILTER */}
        <div ref={zoneRef} className="relative">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-indigo-600" />
              Zone Filter (Multi-Select)
            </span>
            {filters.zones.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                {isAllZonesSelected ? 'All' : `${filters.zones.length} selected`}
              </span>
            )}
          </label>

          <button
            type="button"
            onClick={() => setIsZoneOpen(!isZoneOpen)}
            className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-left cursor-pointer"
          >
            <span className="truncate" title={zoneDisplayText}>
              {zoneDisplayText}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          </button>

          {isZoneOpen && (
            <div className="absolute top-full left-0 mt-1 w-full sm:w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-40 p-2 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={zoneSearch}
                  onChange={(e) => setZoneSearch(e.target.value)}
                  placeholder="Search zones..."
                  className="w-full pl-8 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] px-1 text-indigo-600 font-semibold border-b border-slate-100 pb-1.5">
                <button
                  type="button"
                  onClick={handleSelectAllZones}
                  className="hover:underline cursor-pointer"
                >
                  {filters.zones.length === availableZones.length ? 'Deselect All' : 'Select All Zones'}
                </button>
                {filters.zones.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onFilterChange({ ...filters, zones: [] })}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {filteredZonesList.map((z) => {
                  const isChecked = filters.zones.includes(z);
                  return (
                    <label
                      key={z}
                      onClick={() => handleToggleZone(z)}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-xs text-slate-800"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span className="font-medium">{z}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. MULTI-SELECT ENGINEER FILTER */}
        <div ref={engineerRef} className="relative">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="w-3 h-3 text-indigo-600" />
              Engineer (Multi-Select)
            </span>
            {filters.engineers.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                {isAllEngineersSelected ? 'All' : `${filters.engineers.length} selected`}
              </span>
            )}
          </label>

          <button
            type="button"
            onClick={() => setIsEngineerOpen(!isEngineerOpen)}
            className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-left cursor-pointer"
          >
            <span className="truncate" title={engineerDisplayText}>
              {engineerDisplayText}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          </button>

          {isEngineerOpen && (
            <div className="absolute top-full left-0 mt-1 w-full sm:w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-40 p-2 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={engineerSearch}
                  onChange={(e) => setEngineerSearch(e.target.value)}
                  placeholder="Search engineers..."
                  className="w-full pl-8 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] px-1 text-indigo-600 font-semibold border-b border-slate-100 pb-1.5">
                <button
                  type="button"
                  onClick={handleSelectAllEngineers}
                  className="hover:underline cursor-pointer"
                >
                  {filters.engineers.length === availableEngineers.length ? 'Deselect All' : 'Select All Engineers'}
                </button>
                {filters.engineers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onFilterChange({ ...filters, engineers: [] })}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {filteredEngineersList.map((eng) => {
                  const isChecked = filters.engineers.includes(eng);
                  return (
                    <label
                      key={eng}
                      onClick={() => handleToggleEngineer(eng)}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-xs text-slate-800"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span className="font-medium">{eng}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 4. OPEN / CLOSE STATUS FILTER */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-indigo-600" />
            Open / Close Status
          </label>

          <div className="grid grid-cols-3 gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            {(['All', 'Open', 'Closed'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onFilterChange({ ...filters, status: s })}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  filters.status === s
                    ? s === 'Closed'
                      ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                      : s === 'Open'
                      ? 'bg-amber-600 text-white shadow-2xs font-bold'
                      : 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Filters Pill Tag Bar */}
      {isFiltered && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-[11px]">
          <span className="text-slate-400 font-semibold mr-1">Active Criteria:</span>
          {filters.datePreset !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
              Date: {filters.datePreset.replace('_', ' ')}
              <button onClick={() => handleDatePresetChange('all')} className="hover:text-indigo-900 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.equipmentType !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
              Equipment: {filters.equipmentType}
              <button onClick={() => onFilterChange({ ...filters, equipmentType: 'All' })} className="hover:text-blue-900 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {isAllZonesSelected ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium">
              Zone: All
              <button onClick={() => onFilterChange({ ...filters, zones: [] })} className="hover:text-slate-900 cursor-pointer" title="Clear Zone filter">
                <X className="w-3 h-3" />
              </button>
            </span>
          ) : (
            filters.zones.map((z) => (
              <span key={z} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                Zone: {z}
                <button onClick={() => handleToggleZone(z)} className="hover:text-slate-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
          {isAllEngineersSelected ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium">
              Eng: All
              <button onClick={() => onFilterChange({ ...filters, engineers: [] })} className="hover:text-slate-900 cursor-pointer" title="Clear Engineer filter">
                <X className="w-3 h-3" />
              </button>
            </span>
          ) : (
            filters.engineers.map((e) => (
              <span key={e} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                Eng: {e}
                <button onClick={() => handleToggleEngineer(e)} className="hover:text-slate-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
          {filters.status !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
              Status: {filters.status}
              <button onClick={() => onFilterChange({ ...filters, status: 'All' })} className="hover:text-amber-900 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
