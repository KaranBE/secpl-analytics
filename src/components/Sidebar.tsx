import React from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Users, 
  Building2, 
  Layers,
  ChevronRight,
  ShieldCheck,
  Flame,
  FileSpreadsheet
} from 'lucide-react';

export type DashboardNavTab = 'overview' | 'zones' | 'engineers' | 'customers';

interface SidebarProps {
  activeTab: DashboardNavTab;
  onSelectTab: (tab: DashboardNavTab) => void;
  openTicketsCount: number;
  totalComplaintsCount: number;
  compressorCount: number;
  dispenserCount: number;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  openTicketsCount,
  totalComplaintsCount,
  compressorCount,
  dispenserCount,
  onCloseMobile
}) => {
  const navItems: {
    id: DashboardNavTab;
    label: string;
    description: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    {
      id: 'overview',
      label: 'Operations Overview',
      description: 'Dual-sheet unified KPI dashboard',
      icon: LayoutDashboard,
      badge: `${totalComplaintsCount} Logs`,
      badgeColor: 'bg-slate-100 text-slate-700'
    },
    {
      id: 'zones',
      label: 'Zone Analysis',
      description: 'Regional workload & SLA benchmarks',
      icon: MapPin,
      badge: '5 Zones',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-100'
    },
    {
      id: 'engineers',
      label: 'Engineer Analysis',
      description: 'Workforce efficiency, MTTR & CSAT',
      icon: Users,
      badge: '5 Leads',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-100'
    },
    {
      id: 'customers',
      label: 'Customer Analysis',
      description: 'Compressor account lifecycle & AMC',
      icon: Building2,
      badge: `${compressorCount} Assets`,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-100'
    }
  ];

  const handleTabClick = (tabId: DashboardNavTab) => {
    onSelectTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 h-full">
      {/* Navigation List */}
      <div className="p-4 space-y-6 overflow-y-auto">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2.5">
            Core Analytical Modules
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between group cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50/80 text-indigo-900 border border-indigo-200/90 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-colors ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[11px] text-slate-400 font-normal leading-tight">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Data Sources Info */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
            Active Data Sources
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
              <span className="font-semibold text-slate-800">Sheet 1: Compressor</span>
              <span className="text-indigo-600 font-bold">{compressorCount} logs</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
              <span className="font-semibold text-slate-800">Sheet 2: Dispenser</span>
              <span className="text-emerald-600 font-bold">{dispenserCount} logs</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-semibold text-slate-700">Live Sync Ready</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">v3.1 Dual-Sheet</span>
        </div>
      </div>
    </aside>
  );
};
