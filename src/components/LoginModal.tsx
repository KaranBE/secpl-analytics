import React from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  X,
  CheckCircle2,
  Users,
  Eye,
  Share2
} from 'lucide-react';
import { DEFAULT_SHEET_OWNER_EMAIL } from '../services/googleSheets';

interface LoginModalProps {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  onSignIn: () => void;
  onClose?: () => void;
  onContinueAsGuest?: () => void;
  onOpenShareGuide?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  isLoading,
  error,
  onSignIn,
  onClose,
  onContinueAsGuest,
  onOpenShareGuide
}) => {
  if (!isOpen) return null;

  return (
    <div 
      id="login-modal-container"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      {/* Blurred Backdrop Screen */}
      <div 
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-md transition-all duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Center Login Card */}
      <div 
        id="login-card"
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-6 sm:p-8 z-10 transition-all duration-200"
      >
        {/* Close button if modal can be dismissed */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close login dialog"
            title="Close login dialog"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Brand & App Emblem */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 flex items-center justify-center mb-4">
            <Activity className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Executive Operations Portal</span>
          </div>

          <h2 id="login-modal-title" className="text-xl font-bold text-slate-900 tracking-tight">
            Sign in to Service Operations
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 max-w-xs leading-relaxed">
            Synchronize live incident telemetry from Compressor and Dispenser Google Sheets.
          </p>
        </div>

        {/* Error notification if any */}
        {error && (
          <div className="mt-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-snug space-y-1">
              <span className="font-semibold block">Authentication Notice</span>
              <p>{error}</p>
              {onContinueAsGuest && (
                <button
                  type="button"
                  onClick={onContinueAsGuest}
                  className="mt-1 inline-flex items-center gap-1 font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
                >
                  Click here to Explore in Preview Mode instead &rarr;
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          {/* Quick Instant Preview Mode (Recommended for external users/clients/gmail) */}
          {onContinueAsGuest && (
            <button
              type="button"
              id="continue-preview-mode-btn"
              onClick={onContinueAsGuest}
              className="w-full h-12 flex items-center justify-between px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-indigo-200 group-hover:scale-110 transition-transform" />
                <span>Explore in Preview Mode</span>
              </div>
              <span className="text-[10px] bg-indigo-500/80 px-2 py-0.5 rounded-full text-indigo-100 font-medium">
                Instant Access &bull; No Login Needed
              </span>
            </button>
          )}

          {/* Google Sign In */}
          <button
            type="button"
            id="google-signin-primary-btn"
            onClick={onSignIn}
            disabled={isLoading}
            className="w-full h-11 flex items-center justify-center gap-3 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-semibold text-xs rounded-2xl border border-slate-300 shadow-2xs hover:border-slate-400 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
            )}
            <span>{isLoading ? 'Connecting...' : 'Sign in with Google'}</span>
          </button>
        </div>

        {/* Sharing with another email address card */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 text-slate-800">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              Live Sheets Permissions
            </span>
            {onOpenShareGuide && (
              <button
                type="button"
                onClick={onOpenShareGuide}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
              >
                Sharing Guide
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            The Google Sheets are owned by <span className="font-semibold text-slate-800">{DEFAULT_SHEET_OWNER_EMAIL}</span>. To sync live data, the owner must share the sheets with Viewer permissions.
          </p>
        </div>

        {/* Key Features & Permissions List */}
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-left">
            Platform Capabilities
          </div>
          <ul className="space-y-1.5 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Dual-Sheet sync: Compressor & Dispenser fleets</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Real-time engineer MTTR and SLA performance</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Multi-account sharing & executive viewer mode</span>
            </li>
          </ul>
        </div>

        {/* Security / Privacy Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <Lock className="w-3 h-3 text-slate-400 shrink-0" />
          <span>Secured via Google Workspace OAuth 2.0</span>
        </div>
      </div>
    </div>
  );
};
