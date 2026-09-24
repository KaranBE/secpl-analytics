import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  RotateCcw, 
  SlidersHorizontal, 
  ChevronDown, 
  Check, 
  X, 
  Layers, 
  BarChart3, 
  Table as TableIcon,
  Search,
  Wrench,
  Fuel,
  Hash,
  AlertCircle
} from 'lucide-react';
import { DashboardFilters, DatePreset, ViewMode } from '../types';
import {
  cleanEngineerName,
  isValidZone,
  cleanSerialNumber,
  isValidProblemDescription,
  cleanActionTakenFromProblem,
  containsDateAndStation,
  containsNumberedItem10,
  extractProblemFromTextOrRawMessage
} from '../utils/cleanUtils';
import { getDateRangeForPreset } from '../utils/dateUtils';

interface FilterBarProps {
  filters: DashboardFilters;
  onFilterChange: (filters: DashboardFilters) => void;
  onResetFilters: () => void;
  filteredCount: number;
  totalCount: number;
  availableZones: string[];
  availableEngineers: string[];
  availableProblems?: string[];
  availableDispenserServiceTypes?: string[];
  availableDispenserStations?: string[];
  availableDispenserSerialNos?: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  filteredCount,
  totalCount,
  availableZones,
  availableEngineers,
  availableProblems = [],
  availableDispenserServiceTypes = [],
  availableDispenserStations = [],
  availableDispenserSerialNos = []
}) => {
  const [isZoneOpen, setIsZoneOpen] = useState(false);
  const [isEngineerOpen, setIsEngineerOpen] = useState(false);
  const [isProblemOpen, setIsProblemOpen] = useState(false);
  const [isStationOpen, setIsStationOpen] = useState(false);
  const [isSerialOpen, setIsSerialOpen] = useState(false);

  const [zoneSearch, setZoneSearch] = useState('');
  const [engineerSearch, setEngineerSearch] = useState('');
  const [problemSearch, setProblemSearch] = useState('');
  const [stationSearch, setStationSearch] = useState('');
  const [serialSearch, setSerialSearch] = useState('');

  const zoneRef = useRef<HTMLDivElement>(null);
  const engineerRef = useRef<HTMLDivElement>(null);
  const problemRef = useRef<HTMLDivElement>(null);
  const stationRef = useRef<HTMLDivElement>(null);
  const serialRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (zoneRef.current && !zoneRef.current.contains(event.target as Node)) {
        setIsZoneOpen(false);
      }
      if (engineerRef.current && !engineerRef.current.contains(event.target as Node)) {
        setIsEngineerOpen(false);
      }
      if (problemRef.current && !problemRef.current.contains(event.target as Node)) {
        setIsProblemOpen(false);
      }
      if (stationRef.current && !stationRef.current.contains(event.target as Node)) {
        setIsStationOpen(false);
      }
      if (serialRef.current && !serialRef.current.contains(event.target as Node)) {
        setIsSerialOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamically computed date ranges for presets (using current local browser date)
  const datePresets = useMemo(() => {
    return [
      { id: 'all' as DatePreset, label: 'All Time', range: '' },
      { id: 'today' as DatePreset, label: 'Today', range: getDateRangeForPreset('today').label },
      { id: 'yesterday' as DatePreset, label: 'Yesterday', range: getDateRangeForPreset('yesterday').label },
      { id: 'this_week' as DatePreset, label: 'This Week', range: getDateRangeForPreset('this_week').label },
      { id: 'this_month' as DatePreset, label: 'This Month', range: getDateRangeForPreset('this_month').label },
      { id: 'this_quarter' as DatePreset, label: 'This Quarter', range: getDateRangeForPreset('this_quarter').label },
      { id: 'this_year' as DatePreset, label: 'This Year', range: getDateRangeForPreset('this_year').label },
      { id: 'custom' as DatePreset, label: 'Custom Range', range: '' }
    ];
  }, []);

  // Current active date range label
  const currentDateRange = useMemo(() => {
    return getDateRangeForPreset(filters.datePreset, filters.startDate, filters.endDate);
  }, [filters.datePreset, filters.startDate, filters.endDate]);

  const handleDatePresetChange = (preset: DatePreset) => {
    const range = getDateRangeForPreset(preset);
    onFilterChange({
      ...filters,
      datePreset: preset,
      startDate: range.start,
      endDate: range.end
    });
  };

  // Zone filter logic
  const validZones = useMemo(() => {
    return availableZones.filter(isValidZone);
  }, [availableZones]);

  const activeValidZones = useMemo(() => {
    return filters.zones.filter(isValidZone);
  }, [filters.zones]);

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
      zones: activeValidZones.length === validZones.length ? [] : [...validZones]
    });
  };

  const isAllZonesSelected = validZones.length > 0 && activeValidZones.length === validZones.length;
  const zoneDisplayText = 
    activeValidZones.length === 0 || isAllZonesSelected
      ? 'All Zones'
      : activeValidZones.join(', ');

  // Engineer filter logic
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

  const isAllEngineersSelected = availableEngineers.length > 0 && filters.engineers.length === availableEngineers.length;
  const engineerDisplayText = 
    filters.engineers.length === 0 || isAllEngineersSelected
      ? 'All Engineers'
      : filters.engineers.map(cleanEngineerName).join(', ');

  // Problem filter logic (multi-select)
  const activeProblems = filters.problems || [];
  const isAllProblemsSelected = availableProblems.length > 0 && activeProblems.length === availableProblems.length;

  const handleToggleProblem = (problem: string) => {
    const exists = activeProblems.includes(problem);
    const newProblems = exists
      ? activeProblems.filter(p => p !== problem)
      : [...activeProblems, problem];
    
    onFilterChange({
      ...filters,
      problems: newProblems
    });
  };

  const handleSelectAllProblems = () => {
    onFilterChange({
      ...filters,
      problems: isAllProblemsSelected ? [] : [...availableProblems]
    });
  };

  const problemDisplayText = 
    activeProblems.length === 0 || isAllProblemsSelected
      ? 'All Problems'
      : activeProblems.length === 1
        ? activeProblems[0]
        : `${activeProblems.length} Problems`;

  // Filtered lists for dropdown search
  const filteredZonesList = validZones.filter(z => 
    z.toLowerCase().includes(zoneSearch.toLowerCase())
  );

  const filteredEngineersList = availableEngineers.filter(e => 
    e.toLowerCase().includes(engineerSearch.toLowerCase())
  );

  const filteredProblemsList = useMemo(() => {
    const set = new Set<string>();
    availableProblems.forEach(p => {
      // Strip text such as .action taken:-, .action takan:-, .Action Tekan :- (and variations)
      let clean = cleanActionTakenFromProblem(p);
      if (clean && (containsDateAndStation(clean) || containsNumberedItem10(clean) || !isValidProblemDescription(clean))) {
        const ext = extractProblemFromTextOrRawMessage(clean);
        if (ext) clean = cleanActionTakenFromProblem(ext);
      }
      // If the remaining text contains any valid value, show that value in the dropdown!
      if (clean && isValidProblemDescription(clean)) {
        set.add(clean);
      }
    });
    return Array.from(set).filter(p =>
      p.toLowerCase().includes(problemSearch.toLowerCase())
    );
  }, [availableProblems, problemSearch]);

  const filteredStationsList = availableDispenserStations.filter(s =>
    s.toLowerCase().includes(stationSearch.toLowerCase())
  );

  const filteredSerialList = availableDispenserSerialNos.filter(sn =>
    sn.toLowerCase().includes(serialSearch.toLowerCase())
  );

  const isFiltered = 
    filters.datePreset !== 'all' || 
    activeValidZones.length > 0 || 
    filters.engineers.length > 0 || 
    activeProblems.length > 0 ||
    (Boolean(filters.dispenserServiceType) && filters.dispenserServiceType !== 'All') ||
    (Boolean(filters.dispenserStation) && filters.dispenserStation !== 'All') ||
    (Boolean(filters.dispenserSerialNo) && filters.dispenserSerialNo !== 'All');

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Header: Title, Focus Badge, View Toggle & Reset */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>Dispenser Operations Filters</span>
              {isFiltered && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 animate-pulse">
                  Active Filters
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">{filteredCount}</span> records of {totalCount} total complaints
            </div>
          </div>
        </div>

        {/* Focus indicator & View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dispenser Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200/80 rounded-xl text-xs font-bold text-indigo-700 shadow-2xs">
            <Fuel className="w-3.5 h-3.5 text-indigo-600" />
            <span>Dispenser Operations</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3">
        {/* 1. DATE PRESET & DYNAMIC RANGE DISPLAY */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-indigo-600" />
              Date Filter
            </span>
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
                    {dp.label} {dp.range ? `(${dp.range})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Live Computed Date Range Display Badge */}
            {filters.datePreset !== 'all' && currentDateRange.label && (
              <div className="text-[10px] font-semibold text-indigo-700 bg-indigo-50/90 px-2 py-0.5 rounded-lg border border-indigo-100 flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
                <span className="truncate">{currentDateRange.label}</span>
              </div>
            )}

            {/* Custom Date Range Inputs */}
            {filters.datePreset === 'custom' && (
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
              Zone
            </span>
            {activeValidZones.length > 0 && !isAllZonesSelected && (
              <span className="text-[10px] text-indigo-600 font-semibold">
                {activeValidZones.length} selected
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
                  {activeValidZones.length === validZones.length ? 'Deselect All' : 'Select All Zones'}
                </button>
                {activeValidZones.length > 0 && (
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
              Engineer
            </span>
            {filters.engineers.length > 0 && !isAllEngineersSelected && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                {filters.engineers.length} selected
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
                      <span className="font-medium">{cleanEngineerName(eng)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 4. MULTI-SELECT PROBLEM FILTER */}
        <div ref={problemRef} className="relative">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3 text-indigo-600" />
              Problem
            </span>
            {activeProblems.length > 0 && !isAllProblemsSelected && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                {activeProblems.length} selected
              </span>
            )}
          </label>

          <button
            type="button"
            onClick={() => setIsProblemOpen(!isProblemOpen)}
            className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-left cursor-pointer"
          >
            <span className="truncate" title={problemDisplayText}>
              {problemDisplayText}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          </button>

          {isProblemOpen && (
            <div className="absolute top-full left-0 mt-1 w-full sm:w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-40 p-2 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={problemSearch}
                  onChange={(e) => setProblemSearch(e.target.value)}
                  placeholder="Search problems..."
                  className="w-full pl-8 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] px-1 text-indigo-600 font-semibold border-b border-slate-100 pb-1.5">
                <button
                  type="button"
                  onClick={handleSelectAllProblems}
                  className="hover:underline cursor-pointer"
                >
                  {isAllProblemsSelected ? 'Deselect All' : 'Select All Problems'}
                </button>
                {activeProblems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onFilterChange({ ...filters, problems: [] })}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {filteredProblemsList.map((prob) => {
                  const isChecked = activeProblems.includes(prob);
                  return (
                    <label
                      key={prob}
                      onClick={() => handleToggleProblem(prob)}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-xs text-slate-800"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span className="truncate">{prob}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 5. TYPE OF SERVICE FILTER (ONLY BM / PM - NON-DYNAMIC) */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Wrench className="w-3 h-3 text-indigo-600" />
              Service Type
            </span>
          </label>

          <div className="relative">
            <select
              value={filters.dispenserServiceType || 'All'}
              onChange={(e) => onFilterChange({ ...filters, dispenserServiceType: e.target.value })}
              className="w-full appearance-none bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            >
              <option value="All">All Service Types</option>
              <option value="BM">BM</option>
              <option value="PM">PM</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 6. STATION NAME FILTER */}
        <div ref={stationRef} className="relative">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Fuel className="w-3 h-3 text-indigo-600" />
              Station Name
            </span>
          </label>

          <button
            type="button"
            onClick={() => setIsStationOpen(!isStationOpen)}
            className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-left cursor-pointer"
          >
            <span className="truncate" title={filters.dispenserStation && filters.dispenserStation !== 'All' ? filters.dispenserStation : 'All Station Names'}>
              {filters.dispenserStation && filters.dispenserStation !== 'All' ? filters.dispenserStation : 'All Station Names'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          </button>

          {isStationOpen && (
            <div className="absolute top-full left-0 mt-1 w-full sm:w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-40 p-2 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={stationSearch}
                  onChange={(e) => setStationSearch(e.target.value)}
                  placeholder="Search station name..."
                  className="w-full pl-8 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] px-1 text-indigo-600 font-semibold border-b border-slate-100 pb-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onFilterChange({ ...filters, dispenserStation: 'All' });
                    setIsStationOpen(false);
                  }}
                  className="hover:underline cursor-pointer"
                >
                  All Station Names
                </button>
                {filters.dispenserStation && filters.dispenserStation !== 'All' && (
                  <button
                    type="button"
                    onClick={() => onFilterChange({ ...filters, dispenserStation: 'All' })}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {filteredStationsList.map((st) => {
                  const isSelected = filters.dispenserStation === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        onFilterChange({ ...filters, dispenserStation: isSelected ? 'All' : st });
                        setIsStationOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-xs text-left ${
                        isSelected ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-800'
                      }`}
                    >
                      <span className="truncate">{st}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 7. DISPENSER SERIAL NUMBER FILTER */}
        <div ref={serialRef} className="relative">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Hash className="w-3 h-3 text-indigo-600" />
              Serial No
            </span>
          </label>

          <button
            type="button"
            onClick={() => setIsSerialOpen(!isSerialOpen)}
            className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-left cursor-pointer"
          >
            <span className="truncate font-mono" title={filters.dispenserSerialNo && filters.dispenserSerialNo !== 'All' ? filters.dispenserSerialNo : 'All Serial Nos'}>
              {filters.dispenserSerialNo && filters.dispenserSerialNo !== 'All' ? filters.dispenserSerialNo : 'All Serial Nos'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          </button>

          {isSerialOpen && (
            <div className="absolute top-full left-0 mt-1 w-full sm:w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-40 p-2 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={serialSearch}
                  onChange={(e) => setSerialSearch(e.target.value)}
                  placeholder="Search serial no..."
                  className="w-full pl-8 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] px-1 text-indigo-600 font-semibold border-b border-slate-100 pb-1.5 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    onFilterChange({ ...filters, dispenserSerialNo: 'All' });
                    setIsSerialOpen(false);
                  }}
                  className="hover:underline cursor-pointer"
                >
                  All Serial Nos
                </button>
                {filters.dispenserSerialNo && filters.dispenserSerialNo !== 'All' && (
                  <button
                    type="button"
                    onClick={() => onFilterChange({ ...filters, dispenserSerialNo: 'All' })}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 font-mono">
                {filteredSerialList.map((sn) => {
                  const isSelected = filters.dispenserSerialNo === sn;
                  return (
                    <button
                      key={sn}
                      type="button"
                      onClick={() => {
                        onFilterChange({ ...filters, dispenserSerialNo: isSelected ? 'All' : sn });
                        setIsSerialOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-xs text-left ${
                        isSelected ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-800'
                      }`}
                    >
                      <span className="truncate">{sn}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-1 font-sans" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Filters Pill Tag Bar */}
      {isFiltered && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-[11px]">
          <span className="text-slate-400 font-semibold mr-1">Active Criteria:</span>
          
          {filters.datePreset !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
              <Calendar className="w-3 h-3 text-indigo-500" />
              Date: {currentDateRange.label || filters.datePreset.replace('_', ' ')}
              <button onClick={() => handleDatePresetChange('all')} className="hover:text-indigo-900 cursor-pointer" title="Reset date">
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
                Eng: {cleanEngineerName(e)}
                <button onClick={() => handleToggleEngineer(e)} className="hover:text-slate-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}

          {isAllProblemsSelected ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
              Problem: All
              <button onClick={() => onFilterChange({ ...filters, problems: [] })} className="hover:text-indigo-900 cursor-pointer" title="Clear Problem filter">
                <X className="w-3 h-3" />
              </button>
            </span>
          ) : (
            activeProblems.map((prob) => (
              <span key={prob} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium max-w-xs truncate">
                Problem: {prob}
                <button onClick={() => handleToggleProblem(prob)} className="hover:text-indigo-900 cursor-pointer shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}

          {Boolean(filters.dispenserServiceType) && filters.dispenserServiceType !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-medium">
              Service Type: {filters.dispenserServiceType}
              <button onClick={() => onFilterChange({ ...filters, dispenserServiceType: 'All' })} className="hover:text-teal-900 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {Boolean(filters.dispenserStation) && filters.dispenserStation !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 font-medium">
              Station Name: {filters.dispenserStation}
              <button onClick={() => onFilterChange({ ...filters, dispenserStation: 'All' })} className="hover:text-cyan-900 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {Boolean(filters.dispenserSerialNo) && filters.dispenserSerialNo !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium font-mono text-[10px]">
              Serial No: {filters.dispenserSerialNo}
              <button onClick={() => onFilterChange({ ...filters, dispenserSerialNo: 'All' })} className="hover:text-purple-900 cursor-pointer font-sans">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
