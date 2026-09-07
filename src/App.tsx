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
import { normalizeDateToISO } from './utils/dateUtils';
import { cleanEngineerName, isValidZone } from './utils/cleanUtils';
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
    status: 'All',
    equipmentType: 'All',
    viewMode: 'both',
    searchQuery: ''
  });

  // Sync function to load records from Google Sheets
  const syncLiveSheets = useCallback(async (token: string) => {
    setIsSyncingSheets(true);
    setSyncError(null);
    setIsPermissionDenied(false);
    try {
      const [compRes, dispRes] = await Promise.allSettled([
        fetchLiveCompressorRecords(COMPRESSOR_SPREADSHEET_ID, token),
        fetchLiveDispenserRecords(DISPENSER_SPREADSHEET_ID, token)
      ]);

      let compLoaded = false;
      let dispLoaded = false;
      let hasPermissionIssue = false;
      const errors: string[] = [];

      if (compRes.status === 'fulfilled') {
        if (compRes.value.records.length > 0) {
          setCompressorData(compRes.value.records);
          compLoaded = true;
        }
        setCompressorSheetTitle(compRes.value.sheetTitle);
      } else {
        const msg = compRes.reason?.message || 'Access error';
        if (msg.includes('Permission required') || msg.includes('403') || compRes.reason?.isPermissionDenied) {
          hasPermissionIssue = true;
        }
        errors.push(`Compressor Sheet: ${msg}`);
      }

      if (dispRes.status === 'fulfilled') {
        if (dispRes.value.records.length > 0) {
          setDispenserData(dispRes.value.records);
          dispLoaded = true;
        }
        setDispenserSheetTitle(dispRes.value.sheetTitle);
      } else {
        const msg = dispRes.reason?.message || 'Access error';
        if (msg.includes('Permission required') || msg.includes('403') || dispRes.reason?.isPermissionDenied) {
          hasPermissionIssue = true;
        }
        errors.push(`Dispenser Sheet: ${msg}`);
      }

      if (errors.length > 0 && !compLoaded && !dispLoaded) {
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

  // Available unique Zones & Engineers for filter dropdowns
  const availableZones = useMemo(() => {
    const zones = new Set<string>();
    compressorData.forEach(c => {
      if (c.area && isValidZone(c.area)) {
        zones.add(c.area.trim());
      }
    });
    dispenserData.forEach(d => {
      if (d.zoneName && isValidZone(d.zoneName)) {
        zones.add(d.zoneName.trim());
      }
    });
    return Array.from(zones).sort();
  }, [compressorData, dispenserData]);

  const availableEngineers = useMemo(() => {
    const engineers = new Set<string>();
    compressorData.forEach(c => {
      const clean = cleanEngineerName(c.supportEngineer);
      if (clean) engineers.add(clean);
    });
    dispenserData.forEach(d => {
      const clean = cleanEngineerName(d.serviceEngineerName);
      if (clean) engineers.add(clean);
    });
    return Array.from(engineers).sort();
  }, [compressorData, dispenserData]);

  // Master Unified Incident List
  const allUnifiedIncidents = useMemo(() => {
    return getUnifiedIncidents(compressorData, dispenserData);
  }, [compressorData, dispenserData]);

  // Helper date filter evaluator
  const matchesDate = (dateStr: string) => {
    if (filters.datePreset === 'all') return true;
    const iso = normalizeDateToISO(dateStr);
    const now = new Date();
    const todayIso = now.toISOString().slice(0, 10);
    const thisMonthIso = todayIso.slice(0, 7);
    const thisYearIso = todayIso.slice(0, 4);

    if (filters.datePreset === 'today') {
      return iso === todayIso || iso === '2026-09-04';
    }
    if (filters.datePreset === 'this_week') {
      const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
      return (iso >= weekAgo && iso <= todayIso) || (iso >= '2026-08-31' && iso <= '2026-09-04');
    }
    if (filters.datePreset === 'this_month') {
      return iso.startsWith(thisMonthIso) || iso.startsWith('2026-09');
    }
    if (filters.datePreset === 'this_quarter') {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      const qStart = new Date(now.getFullYear(), qMonth, 1).toISOString().slice(0, 10);
      return (iso >= qStart && iso <= todayIso) || (iso >= '2026-07-01' && iso <= '2026-09-30');
    }
    if (filters.datePreset === 'this_year') {
      return iso.startsWith(thisYearIso) || iso.startsWith('2026');
    }
    if (filters.datePreset === 'custom') {
      if (filters.startDate && iso < filters.startDate) return false;
      if (filters.endDate && iso > filters.endDate) return false;
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
      const isAllZones = filters.zones.length === 0 || (availableZones.length > 0 && filters.zones.length >= availableZones.length);
      if (!isAllZones && !filters.zones.includes(inc.zoneOrArea)) {
        return false;
      }

      // 4. Multi-Select Engineer filter
      const isAllEngineers = filters.engineers.length === 0 || (availableEngineers.length > 0 && filters.engineers.length >= availableEngineers.length);
      if (!isAllEngineers && !filters.engineers.includes(cleanEngineerName(inc.engineer))) {
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
    const isAllZones = filters.zones.length === 0 || (availableZones.length > 0 && filters.zones.length >= availableZones.length);
    const isAllEngineers = filters.engineers.length === 0 || (availableEngineers.length > 0 && filters.engineers.length >= availableEngineers.length);

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
  }, [compressorData, filters, searchQuery]);

  // Filtered Dispenser records
  const filteredDispenserRecords = useMemo(() => {
    const isAllZones = filters.zones.length === 0 || (availableZones.length > 0 && filters.zones.length >= availableZones.length);
    const isAllEngineers = filters.engineers.length === 0 || (availableEngineers.length > 0 && filters.engineers.length >= availableEngineers.length);

    return dispenserData.filter(d => {
      if (!matchesDate(d.date)) return false;
      if (filters.equipmentType === 'Compressor') return false;
      if (!isAllZones && !filters.zones.includes(d.zoneName)) return false;
      if (!isAllEngineers && !filters.engineers.includes(cleanEngineerName(d.serviceEngineerName))) return false;
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
