import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
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
import { 
  initAuth, 
  googleSignIn, 
  googleSignOut, 
  getAccessToken 
} from './services/firebaseAuth';
import { 
  fetchLiveCompressorRecords, 
  fetchLiveDispenserRecords,
  COMPRESSOR_SPREADSHEET_ID,
  DISPENSER_SPREADSHEET_ID
} from './services/googleSheets';
import { normalizeDateToISO, isWithinPreset } from './utils/dateUtils';
import {
  cleanEngineerName,
  isValidZone,
  cleanSerialNumber,
  cleanServiceType,
  isBMServiceType,
  isPMServiceType,
  isValidProblemDescription,
  cleanProblemDescription,
  cleanActionTakenFromProblem,
  containsDateAndStation,
  containsNumberedItem10,
  extractProblemFromTextOrRawMessage
} from './utils/cleanUtils';
import { Header } from './components/Header';
import { Sidebar, DashboardNavTab } from './components/Sidebar';
import { FilterBar } from './components/FilterBar';
import { GoogleSheetsSyncBar } from './components/GoogleSheetsSyncBar';
import { OverviewDashboard } from './components/Dashboard/OverviewDashboard';
import { ZoneAnalytics } from './components/Dashboard/ZoneAnalytics';
import { EngineerAnalytics } from './components/Dashboard/EngineerAnalytics';
import { CustomerAnalytics } from './components/Dashboard/CustomerAnalytics';
import { LoginModal } from './components/LoginModal';
import { ShareAnalyticsModal } from './components/ShareAnalyticsModal';
import { DEFAULT_SHEET_OWNER_EMAIL } from './services/googleSheets';
import { Activity } from 'lucide-react';

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<DashboardNavTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Google Sheets Authentication & Sync State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isPermissionDenied, setIsPermissionDenied] = useState<boolean>(false);
  const [previewModeActive, setPreviewModeActive] = useState<boolean>(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [compressorSheetTitle, setCompressorSheetTitle] = useState<string>('');
  const [dispenserSheetTitle, setDispenserSheetTitle] = useState<string>('');

  // Primary Dual-Sheet Datasets (populated with default baseline, replaced with live sheets data on sync)
  const [compressorData, setCompressorData] = useState<CompressorRecord[]>(COMPRESSOR_RECORDS);
  const [dispenserData, setDispenserData] = useState<DispenserSheetRecord[]>(DISPENSER_RECORDS);

  // Filter States
  const [filters, setFilters] = useState<DashboardFilters>({
    datePreset: 'all',
    startDate: '',
    endDate: '',
    zones: [],
    engineers: [],
    problems: [],
    status: 'All',
    equipmentType: 'Dispenser',
    viewMode: 'both',
    searchQuery: '',
    dispenserServiceType: 'All',
    dispenserStation: 'All',
    dispenserSerialNo: 'All'
  });

  // Sync function to load records from Google Sheets
  const syncLiveSheets = useCallback(async (token: string) => {
    setIsSyncingSheets(true);
    setSyncError(null);
    setIsPermissionDenied(false);
    try {
      let dispLoaded = false;
      let hasPermissionIssue = false;
      const errors: string[] = [];

      try {
        const dispRes = await fetchLiveDispenserRecords(DISPENSER_SPREADSHEET_ID, token);
        if (dispRes.records.length > 0) {
          setDispenserData(dispRes.records);
          dispLoaded = true;
        }
        setDispenserSheetTitle(dispRes.sheetTitle);
      } catch (err: any) {
        const msg = err?.message || 'Access error';
        if (msg.includes('Permission required') || msg.includes('403') || err?.isPermissionDenied) {
          hasPermissionIssue = true;
        }
        errors.push(`Dispenser Sheet: ${msg}`);
      }

      // Optional background fetch
      try {
        const compRes = await fetchLiveCompressorRecords(COMPRESSOR_SPREADSHEET_ID, token);
        if (compRes.records.length > 0) {
          setCompressorData(compRes.records);
        }
        setCompressorSheetTitle(compRes.sheetTitle);
      } catch {
        // Silently skip if unavailable
      }

      if (errors.length > 0 && !dispLoaded) {
        if (hasPermissionIssue) {
          setIsPermissionDenied(true);
          setSyncError(`Signed-in account requires Viewer permissions from sheet owner (${DEFAULT_SHEET_OWNER_EMAIL}). You can request access, view sharing guide, or continue in Preview Mode.`);
        } else {
          setSyncError(errors.join(' | '));
        }
      } else {
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncedAt(timeNow);
      }
    } catch (err: any) {
      console.error('Error syncing Google Sheets:', err);
      const msg = err?.message || 'Failed to sync Google Sheets';
      if (msg.includes('Permission required') || msg.includes('403') || err?.isPermissionDenied) {
        setIsPermissionDenied(true);
        setSyncError(`Signed-in account requires Viewer permissions from sheet owner (${DEFAULT_SHEET_OWNER_EMAIL}).`);
      } else {
        setSyncError(msg);
      }
    } finally {
      setIsSyncingSheets(false);
    }
  }, []);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = initAuth(
      async (authUser, token) => {
        setUser(authUser);
        setIsAuthenticated(true);
        setShowLoginModal(false);
        if (token) {
          await syncLiveSheets(token);
        }
      },
      () => {
        setUser(null);
        setIsAuthenticated(false);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [syncLiveSheets]);

  // Handle Google Sign In
  const handleSignIn = async () => {
    setIsLoadingAuth(true);
    setSyncError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setIsAuthenticated(true);
        setShowLoginModal(false);
        await syncLiveSheets(res.accessToken);
      }
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' || 
        err?.code === 'auth/cancelled-popup-request'
      ) {
        // User voluntarily dismissed popup, no error needed
        return;
      }
      if (err?.code === 'auth/popup-blocked') {
        setSyncError('Sign-in popup was blocked by your browser. Please allow popups or open this app in a new tab.');
        return;
      }
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        console.warn(`[App] Google sign-in: Domain "${host}" requires registration in Firebase Console.`);
        setSyncError(`auth/unauthorized-domain: ${host}`);
        return;
      }
      console.error('Google sign in error:', err);
      setSyncError(err?.message || 'Google sign-in could not be completed.');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Handle Google Sign Out
  const handleSignOut = async () => {
    await googleSignOut();
    setUser(null);
    setIsAuthenticated(false);
    setShowLoginModal(true);
    setLastSyncedAt(null);
    setSyncError(null);
    setCompressorData(COMPRESSOR_RECORDS);
    setDispenserData(DISPENSER_RECORDS);
  };

  // Manual Trigger for Refreshing Sheets
  const handleManualSync = async () => {
    const token = getAccessToken();
    if (!token) {
      handleSignIn();
      return;
    }
    await syncLiveSheets(token);
  };

  // Available unique Zones & Engineers dynamically derived from dispenser dataset
  const availableZones = useMemo(() => {
    const zones = new Set<string>();
    dispenserData.forEach(d => {
      if (d.zoneName && isValidZone(d.zoneName)) {
        zones.add(d.zoneName.trim());
      }
    });
    return Array.from(zones).sort();
  }, [dispenserData]);

  const availableEngineers = useMemo(() => {
    const engineers = new Set<string>();
    dispenserData.forEach(d => {
      const clean = cleanEngineerName(d.serviceEngineerName);
      if (clean) engineers.add(clean);
    });
    return Array.from(engineers).sort();
  }, [dispenserData]);

  // Available unique Problems dynamically derived for multi-select filter
  // Strips text such as .action taken:-, .action takan:-, .Action Tekan :- (and all variations)
  // and if the remaining text contains any value, shows that value in the dropdown
  const availableProblems = useMemo(() => {
    const probs = new Set<string>();
    dispenserData.forEach(d => {
      let rawProb = d.problem ? d.problem.trim() : '';

      // Clean action taken markers from problem
      const cleanedAction = cleanActionTakenFromProblem(rawProb);
      if (cleanedAction) {
        rawProb = cleanedAction;
      } else if (rawProb) {
        // If it was purely action taken text with no value, reset to empty
        rawProb = '';
      }

      if (
        rawProb &&
        (containsDateAndStation(rawProb, d.stationName) ||
          containsNumberedItem10(rawProb) ||
          !isValidProblemDescription(rawProb, d.stationName))
      ) {
        const extracted = extractProblemFromTextOrRawMessage(
          rawProb,
          d.whatsappMessageId,
          d.stationName,
          d.serviceEngineerName
        );
        if (extracted) {
          rawProb = cleanActionTakenFromProblem(extracted);
        }
      }

      // Check if remaining text contains any valid value; if so, show in dropdown
      if (rawProb && isValidProblemDescription(rawProb, d.stationName)) {
        probs.add(rawProb);
      }
    });
    return Array.from(probs).sort();
  }, [dispenserData]);

  // Service Types for Dispensers (BM and PM only, non-dynamic)
  const availableDispenserServiceTypes = useMemo(() => ['BM', 'PM'], []);

  const availableDispenserStations = useMemo(() => {
    const stations = new Set<string>();
    dispenserData.forEach(d => {
      if (d.stationName && d.stationName.trim()) {
        stations.add(d.stationName.trim());
      }
    });
    return Array.from(stations).sort();
  }, [dispenserData]);

  const availableDispenserSerialNos = useMemo(() => {
    const serials = new Set<string>();
    dispenserData.forEach(d => {
      const clean = cleanSerialNumber(d.dispenserSerialNo);
      if (clean) {
        serials.add(clean);
      }
    });
    return Array.from(serials).sort();
  }, [dispenserData]);

  // Master Unified Incident List (restricted to Dispenser operations)
  const allUnifiedIncidents = useMemo(() => {
    return getUnifiedIncidents(compressorData, dispenserData, true);
  }, [compressorData, dispenserData]);

  // Dynamic date filter evaluator using real current calendar dates
  const matchesDate = (dateStr: string) => {
    return isWithinPreset(dateStr, filters.datePreset, filters.startDate, filters.endDate);
  };

  // Filtered Unified Incidents
  const filteredUnifiedIncidents = useMemo(() => {
    return allUnifiedIncidents.filter(inc => {
      // 1. Dynamic Date filter (works on date column in the sheet, checking month against created at)
      const recordDate = inc.date || inc.createdAt;
      if (!isWithinPreset(recordDate, filters.datePreset, filters.startDate, filters.endDate)) return false;

      // 2. Equipment Type filter (dispenser focused)
      if (filters.equipmentType !== 'All' && inc.equipmentType !== filters.equipmentType) {
        return false;
      }

      // 3. Multi-Select Zone filter
      const isAllZones = filters.zones.length === 0 || (availableZones.length > 0 && filters.zones.length >= availableZones.length);
      if (!isAllZones && !filters.zones.includes(inc.zoneOrArea)) {
        return false;
      }

      // 4. Multi-Select Engineer filter
      const isAllEngineers = filters.engineers.length === 0 || (availableEngineers.length > 0 && filters.engineers.length >= availableEngineers.length);
      if (!isAllEngineers && !filters.engineers.includes(cleanEngineerName(inc.engineer))) {
        return false;
      }

      // 5. Multi-Select Problem filter
      const isAllProblems = !filters.problems || filters.problems.length === 0 || (availableProblems.length > 0 && filters.problems.length >= availableProblems.length);
      if (!isAllProblems) {
        const cleanIncProb = cleanActionTakenFromProblem(inc.problem) || inc.problem;
        const matches = filters.problems?.some(p => p === inc.problem || p === cleanIncProb);
        if (!matches) {
          return false;
        }
      }

      // 6. Dispenser Type of Service filter (BM / PM text variation matching)
      if (filters.dispenserServiceType && filters.dispenserServiceType !== 'All') {
        const target = filters.dispenserServiceType.trim().toUpperCase();
        if (target === 'BM') {
          if (!isBMServiceType(inc.contractOrServiceType)) return false;
        } else if (target === 'PM') {
          if (!isPMServiceType(inc.contractOrServiceType)) return false;
        }
      }

      // 7. Dispenser Station Name filter
      if (filters.dispenserStation && filters.dispenserStation !== 'All') {
        if (inc.entityName !== filters.dispenserStation) {
          return false;
        }
      }

      // 8. Dispenser Serial Number filter (cleaned of non-letter prefix characters)
      if (filters.dispenserSerialNo && filters.dispenserSerialNo !== 'All') {
        if (cleanSerialNumber(inc.assetIdentifier) !== cleanSerialNumber(filters.dispenserSerialNo)) {
          return false;
        }
      }

      // 9. Search query
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
  }, [allUnifiedIncidents, filters, searchQuery, availableZones, availableEngineers, availableProblems]);

  // Filtered records for customer metrics
  const filteredCompressorRecords = useMemo(() => {
    const isAllZones = filters.zones.length === 0 || (availableZones.length > 0 && filters.zones.length >= availableZones.length);
    const isAllEngineers = filters.engineers.length === 0 || (availableEngineers.length > 0 && filters.engineers.length >= availableEngineers.length);

    // If dispenser-specific filters are active, return empty
    if (filters.dispenserServiceType && filters.dispenserServiceType !== 'All') return [];
    if (filters.dispenserStation && filters.dispenserStation !== 'All') return [];
    if (filters.dispenserSerialNo && filters.dispenserSerialNo !== 'All') return [];

    return compressorData.filter(c => {
      if (!matchesDate(c.date)) return false;
      if (filters.equipmentType === 'Dispenser') return false;
      if (!isAllZones && !filters.zones.includes(c.area)) return false;
      if (!isAllEngineers && !filters.engineers.includes(cleanEngineerName(c.supportEngineer))) return false;
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
  }, [compressorData, filters, searchQuery, availableZones, availableEngineers]);

  // Filtered Dispenser records
  const filteredDispenserRecords = useMemo(() => {
    const isAllZones = filters.zones.length === 0 || (availableZones.length > 0 && filters.zones.length >= availableZones.length);
    const isAllEngineers = filters.engineers.length === 0 || (availableEngineers.length > 0 && filters.engineers.length >= availableEngineers.length);

    return dispenserData.filter(d => {
      if (!matchesDate(d.date)) return false;
      if (!isAllZones && !filters.zones.includes(d.zoneName)) return false;
      if (!isAllEngineers && !filters.engineers.includes(cleanEngineerName(d.serviceEngineerName))) return false;
      if (filters.status !== 'All' && d.status !== filters.status) return false;

      // Problem filter
      const isAllProblems = !filters.problems || filters.problems.length === 0 || (availableProblems.length > 0 && filters.problems.length >= availableProblems.length);
      if (!isAllProblems) {
        const cleanDProb = cleanActionTakenFromProblem(d.problem) || d.problem;
        const matches = filters.problems?.some(p => p === d.problem || p === cleanDProb);
        if (!matches) {
          return false;
        }
      }

      // Dispenser Type of Service filter (BM / PM text variation matching)
      if (filters.dispenserServiceType && filters.dispenserServiceType !== 'All') {
        const target = filters.dispenserServiceType.trim().toUpperCase();
        if (target === 'BM') {
          if (!isBMServiceType(d.typeOfService)) return false;
        } else if (target === 'PM') {
          if (!isPMServiceType(d.typeOfService)) return false;
        }
      }

      // Dispenser Station filter
      if (filters.dispenserStation && filters.dispenserStation !== 'All' && d.stationName !== filters.dispenserStation) {
        return false;
      }

      // Dispenser Serial Number filter (cleaned of non-letter prefix characters)
      if (filters.dispenserSerialNo && filters.dispenserSerialNo !== 'All') {
        if (cleanSerialNumber(d.dispenserSerialNo) !== cleanSerialNumber(filters.dispenserSerialNo)) {
          return false;
        }
      }

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
  }, [dispenserData, filters, searchQuery, availableZones, availableEngineers]);

  // Computed Dynamic Metrics based on filtered data
  const customerMetrics = useMemo(() => {
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
      problems: [],
      status: 'All',
      equipmentType: 'Dispenser',
      viewMode: 'both',
      searchQuery: '',
      dispenserServiceType: 'All',
      dispenserStation: 'All',
      dispenserSerialNo: 'All'
    });
    setSearchQuery('');
  };

  const openTicketsCount = filteredUnifiedIncidents.filter(i => i.status !== 'Closed').length;

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Background Screen: Blurred when login modal is active */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${(showLoginModal && !previewModeActive) ? 'filter blur-[4px] pointer-events-none select-none opacity-85' : ''}`}>
        {/* Top Header */}
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          user={user}
          isLiveSynced={isAuthenticated && !!lastSyncedAt && !isPermissionDenied}
          onOpenLogin={() => setShowLoginModal(true)}
          onOpenShare={() => setIsShareModalOpen(true)}
        />

        {/* Google Sheets Live Sync Bar */}
        <GoogleSheetsSyncBar
          user={user}
          isAuthenticated={isAuthenticated}
          isLoading={isLoadingAuth}
          isSyncing={isSyncingSheets}
          syncError={syncError}
          isPermissionDenied={isPermissionDenied}
          lastSyncedAt={lastSyncedAt}
          compressorRowCount={compressorData.length}
          dispenserRowCount={dispenserData.length}
          compressorSheetTitle={compressorSheetTitle}
          dispenserSheetTitle={dispenserSheetTitle}
          onSignIn={() => setShowLoginModal(true)}
          onSignOut={handleSignOut}
          onSync={handleManualSync}
          onOpenShare={() => setIsShareModalOpen(true)}
          onSwitchToPreviewMode={() => {
            setIsPermissionDenied(false);
            setSyncError(null);
            setPreviewModeActive(true);
          }}
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
              engineerCount={engineerMetrics.length}
              isLiveConnected={isAuthenticated && !!lastSyncedAt}
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
                  engineerCount={engineerMetrics.length}
                  onCloseMobile={() => setIsMobileMenuOpen(false)}
                  isLiveConnected={isAuthenticated && !!lastSyncedAt}
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
              availableProblems={availableProblems}
              availableDispenserServiceTypes={availableDispenserServiceTypes}
              availableDispenserStations={availableDispenserStations}
              availableDispenserSerialNos={availableDispenserSerialNos}
            />

            {/* Prominent Loader until data is fully loaded */}
            {isSyncingSheets ? (
              <div 
                id="sheets-data-sync-loader"
                className="bg-white border border-slate-200/90 rounded-3xl p-10 sm:p-16 shadow-xs flex flex-col items-center justify-center min-h-[460px] text-center space-y-6 animate-in fade-in duration-300"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-indigo-600 border-r-emerald-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="w-7 h-7 text-indigo-600 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2 max-w-md">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    Loading Service Operations Data...
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Synchronizing live incident telemetry from Google Sheets, verifying service dates against creation timestamps, and compiling fleet analytics.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl text-left pt-2">
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100/90 flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping shrink-0" />
                    <span className="text-[11px] font-semibold text-indigo-950">Connecting Google Sheets</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100/90 flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                    <span className="text-[11px] font-semibold text-emerald-950">Normalizing Date & Month</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                    <span className="text-[11px] font-semibold text-slate-700">Compiling Fleet Metrics</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  Please hold on &bull; Fetching live data...
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </main>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200/90 bg-white py-3 px-6 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-slate-700">Dispenser Service Operations Analytics Engine</span>
            </div>
            <div className="text-slate-400 text-[11px] font-mono">
              Live Google Sheets Integration &bull; Active Field Maintenance SLA
            </div>
          </div>
        </footer>
      </div>

      {/* Centered Login Modal with Blurred Background Screen */}
      <LoginModal
        isOpen={showLoginModal && !previewModeActive}
        isLoading={isLoadingAuth}
        error={syncError}
        onSignIn={handleSignIn}
        onClose={() => setShowLoginModal(false)}
        onContinueAsGuest={() => {
          setShowLoginModal(false);
          setPreviewModeActive(true);
        }}
        onOpenShareGuide={() => {
          setShowLoginModal(false);
          setIsShareModalOpen(true);
        }}
      />

      {/* Share Analytics & Team Access Guidance Modal */}
      <ShareAnalyticsModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        currentUser={user}
        hasPermissionError={isPermissionDenied}
        onSwitchToPreviewMode={() => {
          setIsPermissionDenied(false);
          setSyncError(null);
          setPreviewModeActive(true);
          setIsShareModalOpen(false);
        }}
        onRetrySync={handleManualSync}
      />
    </div>
  );
}
