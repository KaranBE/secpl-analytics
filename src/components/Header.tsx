import React from 'react';
import { 
  Activity, 
  Clock, 
  Bell, 
  Menu, 
  X,
  ShieldCheck,
  Search
} from 'lucide-react';

interface HeaderProps {
  currentTimeStr: string;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTimeStr,
  isMobileMenuOpen,
  onToggleMobileMenu,
  searchQuery,
  onSearchChange
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

        {/* Center: Global Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tickets, customers, technicians, dispensers..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </div>

        {/* Right: Operational Badges & User Meta */}
        <div className="flex items-center gap-3">
          {/* Live System Time */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-700 font-medium shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-mono text-[11px]">{currentTimeStr}</span>
          </div>

          {/* System SLA Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 font-semibold shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>94.2% Fleet SLA</span>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button 
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
            </button>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              KB
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">Operations Lead</div>
              <div className="text-[10px] text-slate-500 font-medium">Regional Hub</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
