import React from 'react';
import { 
  BarChart3, 
  Table2, 
  MessageSquare, 
  Mail, 
  Code2, 
  Workflow
} from 'lucide-react';

export type MainTabType = 'analytics' | 'sheets' | 'whatsapp' | 'reporting' | 'appsscript' | 'architecture';

interface NavigationProps {
  activeTab: MainTabType;
  onChangeTab: (tab: MainTabType) => void;
  openTicketsCount: number;
  unresolvedErrorsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  openTicketsCount,
  unresolvedErrorsCount
}) => {
  const tabs: { id: MainTabType; label: string; icon: React.FC<{ className?: string }>; badge?: number; badgeColor?: string }[] = [
    { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3 },
    { 
      id: 'sheets', 
      label: 'Google Sheets Workspace', 
      icon: Table2, 
      badge: unresolvedErrorsCount > 0 ? unresolvedErrorsCount : undefined,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    { 
      id: 'whatsapp', 
      label: 'WhatsApp Webhook Intake', 
      icon: MessageSquare, 
      badge: openTicketsCount > 0 ? openTicketsCount : undefined,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    { id: 'reporting', label: '6 PM & Scheduled Reports', icon: Mail },
    { id: 'appsscript', label: 'Apps Script Codebase', icon: Code2 },
    { id: 'architecture', label: 'Architecture & Flow', icon: Workflow }
  ];

  return (
    <nav className="bg-white border-b border-slate-200 px-4 lg:px-6">
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all whitespace-nowrap relative cursor-pointer ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>

              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${tab.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                  {tab.badge}
                </span>
              )}

              {isActive && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
