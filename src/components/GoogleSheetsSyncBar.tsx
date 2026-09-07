import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Database,
  LogOut,
  Sliders,
  ChevronDown,
  ChevronUp,
  Share2,
  Users,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { 
  COMPRESSOR_SPREADSHEET_ID, 
  DISPENSER_SPREADSHEET_ID,
  DEFAULT_SHEET_OWNER_EMAIL 
} from '../services/googleSheets';

interface GoogleSheetsSyncBarProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  syncError: string | null;
  isPermissionDenied?: boolean;
  lastSyncedAt: string | null;
  compressorRowCount: number;
  dispenserRowCount: number;
  compressorSheetTitle?: string;
  dispenserSheetTitle?: string;
  onSignIn: () => void;
  onSignOut: () => void;
  onSync: () => void;
  onOpenShare?: () => void;
  onSwitchToPreviewMode?: () => void;
}

export const GoogleSheetsSyncBar: React.FC<GoogleSheetsSyncBarProps> = ({
  user,
  isAuthenticated,
  isLoading,
  isSyncing,
  syncError,
  isPermissionDenied = false,
  lastSyncedAt,
  compressorRowCount,
  dispenserRowCount,
  compressorSheetTitle,
  dispenserSheetTitle,
  onSignIn,
  onSignOut,
  onSync,
  onOpenShare,
  onSwitchToPreviewMode
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white border-b border-slate-200/90 px-4 lg:px-6 py-2.5 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left: Connection Status & Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isAuthenticated 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs' 
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
            }`}>
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  Google Sheets Live Sync
                </span>
                {isAuthenticated ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    Demo Fleet Mode
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                {isAuthenticated && lastSyncedAt ? (
                  <span>Last synced {lastSyncedAt}</span>
                ) : (
                  <span>Authorize with Google to sync real sheets live</span>
                )}
                {isAuthenticated && (
                  <span className="text-slate-400 font-mono">
                    &bull; {compressorRowCount} Comp / {dispenserRowCount} Disp
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick links to both spreadsheets */}
          <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-200">
            <a
              href={`https://docs.google.com/spreadsheets/d/${COMPRESSOR_SPREADSHEET_ID}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium transition-colors"
              title="Open Compressor Google Sheet"
            >
              <Database className="w-3 h-3 text-indigo-600" />
              <span>Compressor Sheet</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>

            <a
              href={`https://docs.google.com/spreadsheets/d/${DISPENSER_SPREADSHEET_ID}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium transition-colors"
              title="Open Dispenser Google Sheet"
            >
              <Database className="w-3 h-3 text-emerald-600" />
              <span>Dispenser Sheet</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Right: Actions (Sign In or Sync / User info / Share) */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onSync}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>

              {onOpenShare && (
                <button
                  type="button"
                  onClick={onOpenShare}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-indigo-600 text-xs font-medium transition-colors cursor-pointer"
                  title="Share access with another email address"
                >
                  <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              )}

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Details</span>
                {showDetails ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
              </button>

              <button
                onClick={onSignOut}
                className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                title={`Sign out (${user?.email || 'Google User'})`}
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {onOpenShare && (
                <button
                  type="button"
                  onClick={onOpenShare}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-600 text-xs font-semibold shadow-2xs transition-colors cursor-pointer mr-1"
                >
                  <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Share Analytics</span>
                </button>
              )}

              {/* Official Google Sign-In button per workspace-integration skill */}
              <button 
                type="button" 
                className="gsi-material-button shadow-xs"
                onClick={onSignIn}
                disabled={isLoading}
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" style={{ display: 'block' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">Sign in with Google</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sync / Access Permission Error Notice */}
      {syncError && (
        <div className={`mt-2.5 p-3 rounded-2xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isPermissionDenied 
            ? 'bg-amber-50 border border-amber-200 text-amber-900' 
            : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-start gap-2.5">
            <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isPermissionDenied ? 'text-amber-600' : 'text-rose-600'}`} />
            <div>
              {isPermissionDenied ? (
                <div className="space-y-0.5">
                  <span className="font-bold block">Access Permission Needed for Live Sync</span>
                  <span className="text-amber-800 leading-relaxed block">
                    {syncError}
                  </span>
                </div>
              ) : (
                <span>{syncError}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            {isPermissionDenied && onOpenShare && (
              <button
                type="button"
                onClick={onOpenShare}
                className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Share & Permission Guide
              </button>
            )}

            {isPermissionDenied && onSwitchToPreviewMode && (
              <button
                type="button"
                onClick={onSwitchToPreviewMode}
                className="px-2.5 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <Eye className="w-3 h-3 inline mr-1" />
                Preview Mode
              </button>
            )}

            {isAuthenticated && (
              <button
                type="button"
                onClick={onSync}
                className={`px-2.5 py-1.5 text-white rounded-xl text-[11px] font-semibold transition-colors cursor-pointer ${
                  isPermissionDenied ? 'bg-amber-700 hover:bg-amber-800' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Retry Sync
              </button>
            )}
          </div>
        </div>
      )}

      {/* Expandable Details Drawer */}
      {showDetails && isAuthenticated && (
        <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-3 text-xs">
          {/* Ownership & Sharing Info Header */}
          <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-indigo-900">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                Underlying Sheets Owner: <strong className="font-semibold">{DEFAULT_SHEET_OWNER_EMAIL}</strong>
              </span>
            </div>
            {onOpenShare && (
              <button
                type="button"
                onClick={onOpenShare}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
              >
                <Share2 className="w-3 h-3" />
                <span>Share with Another Email Address</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Compressor Sheet Card */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-600" />
                  Sheet 1: Compressor Records
                </span>
                <span className="font-semibold text-indigo-600 font-mono text-[11px]">
                  {compressorRowCount} rows loaded
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono break-all">
                ID: {COMPRESSOR_SPREADSHEET_ID}
              </div>
              {compressorSheetTitle && (
                <div className="text-[11px] text-slate-600">
                  Active Tab: <span className="font-semibold">{compressorSheetTitle}</span>
                </div>
              )}
              <a
                href={`https://docs.google.com/spreadsheets/d/${COMPRESSOR_SPREADSHEET_ID}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1 mt-1"
              >
                Open in Google Sheets <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Dispenser Sheet Card */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  Sheet 2: Dispenser Records
                </span>
                <span className="font-semibold text-emerald-600 font-mono text-[11px]">
                  {dispenserRowCount} rows loaded
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono break-all">
                ID: {DISPENSER_SPREADSHEET_ID}
              </div>
              {dispenserSheetTitle && (
                <div className="text-[11px] text-slate-600">
                  Active Tab: <span className="font-semibold">{dispenserSheetTitle}</span>
                </div>
              )}
              <a
                href={`https://docs.google.com/spreadsheets/d/${DISPENSER_SPREADSHEET_ID}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-emerald-600 hover:text-emerald-800 font-medium inline-flex items-center gap-1 mt-1"
              >
                Open in Google Sheets <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
