import React from 'react';
import { User } from 'firebase/auth';
import { 
  Activity, 
  Menu, 
  X, 
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  user?: User | null;
  isLiveSynced?: boolean;
  onOpenLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMobileMenuOpen,
  onToggleMobileMenu,
  user,
  isLiveSynced,
  onOpenLogin
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-30 px-4 lg:px-6 py-3 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Brand Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200 flex items-center justify-center text-white shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
                  Service Operations Analytics
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Fleet Monitoring
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden md:block mt-0.5">
                Executive Service Intelligence & Asset Reliability Suite
              </p>
            </div>
          </div>
        </div>

        {/* Right: Operational Badges & User Meta */}
        <div className="flex items-center gap-3">
          {/* System SLA Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 font-semibold shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>94.2% Fleet SLA</span>
          </div>

          {/* User Profile or Sign In Button */}
          {user ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-xl object-cover shadow-xs border border-slate-200" 
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'KB'}
                </div>
              )}
              <div className="hidden lg:block text-left max-w-[130px] truncate">
                <div className="text-xs font-bold text-slate-900 leading-tight truncate">
                  {user.displayName || 'Operations Lead'}
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate">
                  {user.email || 'Google Account'}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <button
                type="button"
                id="header-login-btn"
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <span>Log In</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
