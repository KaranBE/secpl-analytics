import React, { useState, useEffect, useMemo } from 'react';
import { 
  CompressorRecord, 
  DispenserSheetRecord, 
  UnifiedIncidentRecord, 
  CustomerMetric, 
  EngineerMetric, 
  ZoneMetric, 
  DashboardFilters 
} from './types';
import { 
  COMPRESSOR_RECORDS, 
  DISPENSER_RECORDS, 
  getUnifiedIncidents, 
  computeCustomerMetrics, 
  computeZoneMetrics, 
  computeEngineerMetrics 
} from './data/mockData';
import { Header } from './components/Header';
import { Sidebar, DashboardNavTab } from './components/Sidebar';
import { FilterBar } from './components/FilterBar';
import { OverviewDashboard } from './components/Dashboard/OverviewDashboard';
import { ZoneAnalytics } from './components/Dashboard/ZoneAnalytics';
import { EngineerAnalytics } from './components/Dashboard/EngineerAnalytics';
import { CustomerAnalytics } from './components/Dashboard/CustomerAnalytics';

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<DashboardNavTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Primary Dual-Sheet Datasets
  const [compressorData] = useState<CompressorRecord[]>(COMPRESSOR_RECORDS);
  const [dispenserData] = useState<DispenserSheetRecord[]>(DISPENSER_RECORDS);

  // Live Clock
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('17:48 IST');

  // Filter States
  const [filters, setFilters] = useState<DashboardFilters>({
    datePreset: 'all',
    startDate: '',
    endDate: '',
    zones: [],
    engineers: [],
    status: 'All',
    equipmentType: 'All',
    viewMode: 'both',
    searchQuery: ''
  });

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTimeStr(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Available unique Zones & Engineers for filter dropdowns
  const availableZones = useMemo(() => {
    const zones = new Set<string>();
    compressorData.forEach(c => zones.add(c.area));
    dispenserData.forEach(d => zones.add(d.zoneName));
    return Array.from(zones).sort();
  }, [compressorData, dispenserData]);

  const availableEngineers = useMemo(() => {
    const engineers = new Set<string>();
    compressorData.forEach(c => engineers.add(c.supportEngineer));
    dispenserData.forEach(d => engineers.add(d.serviceEngineerName));
    return Array.from(engineers).sort();
  }, [compressorData, dispenserData]);

  // Master Unified Incident List
  const allUnifiedIncidents = useMemo(() => {
    return getUnifiedIncidents(compressorData, dispenserData);
  }, [compressorData, dispenserData]);

  // Helper date filter evaluator
  const matchesDate = (dateStr: string) => {
    if (filters.datePreset === 'all') return true;
    if (filters.datePreset === 'today') return dateStr === '2026-09-04';
    if (filters.datePreset === 'this_week') return dateStr >= '2026-08-31' && dateStr <= '2026-09-04';
    if (filters.datePreset === 'this_month') return dateStr.startsWith('2026-09');
    if (filters.datePreset === 'this_quarter') return dateStr >= '2026-07-01' && dateStr <= '2026-09-30';
    if (filters.datePreset === 'this_year') return dateStr.startsWith('2026');
    if (filters.datePreset === 'custom') {
      if (filters.startDate && dateStr < filters.startDate) return false;
      if (filters.endDate && dateStr > filters.endDate) return false;
      return true;
    }
    return true;
  };

  // Filtered Unified Incidents
  const filteredUnifiedIncidents = useMemo(() => {
    return allUnifiedIncidents.filter(inc => {
      // 1. Date filter
      if (!matchesDate(inc.date)) return false;

      // 2. Equipment Type filter
      if (filters.equipmentType !== 'All' && inc.equipmentType !== filters.equipmentType) {
        return false;
      }

      // 3. Multi-Select Zone filter
      if (filters.zones.length > 0 && !filters.zones.includes(inc.zoneOrArea)) {
        return false;
      }

      // 4. Multi-Select Engineer filter
      if (filters.engineers.length > 0 && !filters.engineers.includes(inc.engineer)) {
        return false;
      }

      // 5. Open/Close Status filter
      if (filters.status !== 'All' && inc.status !== filters.status) {
        return false;
      }

      // 6. Search query
      const activeSearch = (searchQuery || filters.searchQuery).trim().toLowerCase();
      if (activeSearch) {
        const matches = 
          inc.entityName.toLowerCase().includes(activeSearch) ||
          inc.zoneOrArea.toLowerCase().includes(activeSearch) ||
          inc.assetIdentifier.toLowerCase().includes(activeSearch) ||
          inc.problem.toLowerCase().includes(activeSearch) ||
          inc.engineer.toLowerCase().includes(activeSearch) ||
          inc.senderNumber.includes(activeSearch) ||
          inc.whatsappMessageId.toLowerCase().includes(activeSearch) ||
          inc.contractOrServiceType.toLowerCase().includes(activeSearch);
        if (!matches) return false;
      }

      return true;
    });
  }, [allUnifiedIncidents, filters, searchQuery]);

  // Filtered Compressor records (used specifically for Customer Analysis)
  const filteredCompressorRecords = useMemo(() => {
    return compressorData.filter(c => {
      if (!matchesDate(c.date)) return false;
      if (filters.equipmentType === 'Dispenser') return false;
      if (filters.zones.length > 0 && !filters.zones.includes(c.area)) return false;
      if (filters.engineers.length > 0 && !filters.engineers.includes(c.supportEngineer)) return false;
      if (filters.status !== 'All' && c.status !== filters.status) return false;
      
      const activeSearch = (searchQuery || filters.searchQuery).trim().toLowerCase();
      if (activeSearch) {
        const matches = 
          c.customerName.toLowerCase().includes(activeSearch) ||
          c.area.toLowerCase().includes(activeSearch) ||
          c.model.toLowerCase().includes(activeSearch) ||
          c.serialNumber.toLowerCase().includes(activeSearch) ||
          c.problem.toLowerCase().includes(activeSearch) ||
          c.supportEngineer.toLowerCase().includes(activeSearch) ||
          c.senderNumber.includes(activeSearch);
        if (!matches) return false;
      }
      return true;
    });
  }, [compressorData, filters, searchQuery]);

  // Filtered Dispenser records
  const filteredDispenserRecords = useMemo(() => {
    return dispenserData.filter(d => {
      if (!matchesDate(d.date)) return false;
      if (filters.equipmentType === 'Compressor') return false;
      if (filters.zones.length > 0 && !filters.zones.includes(d.zoneName)) return false;
      if (filters.engineers.length > 0 && !filters.engineers.includes(d.serviceEngineerName)) return false;
      if (filters.status !== 'All' && d.status !== filters.status) return false;

      const activeSearch = (searchQuery || filters.searchQuery).trim().toLowerCase();
      if (activeSearch) {
        const matches = 
          d.stationName.toLowerCase().includes(activeSearch) ||
          d.zoneName.toLowerCase().includes(activeSearch) ||
          d.dispenserSerialNo.toLowerCase().includes(activeSearch) ||
          d.problem.toLowerCase().includes(activeSearch) ||
          d.serviceEngineerName.toLowerCase().includes(activeSearch) ||
          d.senderNumber.includes(activeSearch);
        if (!matches) return false;
      }
      return true;
    });
  }, [dispenserData, filters, searchQuery]);

  // Computed Dynamic Metrics based on filtered data
  const customerMetrics = useMemo(() => {
    // "customer analysis (only compressor)"
    return computeCustomerMetrics(filteredCompressorRecords);
  }, [filteredCompressorRecords]);

  const zoneMetrics = useMemo(() => {
    return computeZoneMetrics(filteredCompressorRecords, filteredDispenserRecords);
  }, [filteredCompressorRecords, filteredDispenserRecords]);

  const engineerMetrics = useMemo(() => {
    return computeEngineerMetrics(filteredCompressorRecords, filteredDispenserRecords);
  }, [filteredCompressorRecords, filteredDispenserRecords]);


  const handleResetFilters = () => {
    setFilters({
      datePreset: 'all',
      startDate: '',
      endDate: '',
      zones: [],
      engineers: [],
      status: 'All',
      equipmentType: 'All',
      viewMode: 'both',
      searchQuery: ''
    });
    setSearchQuery('');
  };

  const openTicketsCount = filteredUnifiedIncidents.filter(i => i.status !== 'Closed').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        currentTimeStr={currentTimeStr}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Container with Sidebar Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            openTicketsCount={openTicketsCount}
            totalComplaintsCount={allUnifiedIncidents.length}
            compressorCount={compressorData.length}
            dispenserCount={dispenserData.length}
          />
        </div>

        {/* Mobile Sidebar Overlay Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div 
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-xs bg-white h-full z-50 shadow-2xl flex flex-col">
              <Sidebar
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                openTicketsCount={openTicketsCount}
                totalComplaintsCount={allUnifiedIncidents.length}
                compressorCount={compressorData.length}
                dispenserCount={dispenserData.length}
                onCloseMobile={() => setIsMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Universal Interactive Filter Bar */}
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            onResetFilters={handleResetFilters}
            filteredCount={filteredUnifiedIncidents.length}
            totalCount={allUnifiedIncidents.length}
            availableZones={availableZones}
            availableEngineers={availableEngineers}
          />

          {/* Module Views */}
          {activeTab === 'overview' && (
            <OverviewDashboard
              incidents={filteredUnifiedIncidents}
              compressors={filteredCompressorRecords}
              dispensers={filteredDispenserRecords}
              zoneMetrics={zoneMetrics}
              engineerMetrics={engineerMetrics}
              customerMetrics={customerMetrics}
              viewMode={filters.viewMode}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'zones' && (
            <ZoneAnalytics
              zoneMetrics={zoneMetrics}
              incidents={filteredUnifiedIncidents}
              viewMode={filters.viewMode}
            />
          )}

          {activeTab === 'engineers' && (
            <EngineerAnalytics
              engineerMetrics={engineerMetrics}
              incidents={filteredUnifiedIncidents}
              viewMode={filters.viewMode}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerAnalytics
              customerMetrics={customerMetrics}
              compressors={filteredCompressorRecords}
              viewMode={filters.viewMode}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/90 bg-white py-3 px-6 text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-700">Service Operations Analytics Engine</span>
          </div>
          <div className="text-slate-400 text-[11px] font-mono">
            Sheet 1 (Compressor) & Sheet 2 (Dispenser) Live Sync &bull; 94.2% Fleet SLA
          </div>
        </div>
      </footer>
    </div>
  );
}
