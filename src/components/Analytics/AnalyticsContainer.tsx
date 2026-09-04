import React, { useState } from 'react';
import { 
  ComplaintRecord, 
  DispenserRecord, 
  ZoneMetric, 
  EngineerMetric 
} from '../../types';
import { DashboardView } from './DashboardView';
import { ZoneAnalysisView } from './ZoneAnalysisView';
import { EngineerAnalysisView } from './EngineerAnalysisView';
import { CustomerAnalysisView } from './CustomerAnalysisView';
import { ProblemAnalysisView } from './ProblemAnalysisView';
import { DailyTrendsView } from './DailyTrendsView';
import { 
  LayoutDashboard, 
  Compass, 
  UserCheck, 
  Building2, 
  AlertTriangle, 
  TrendingUp 
} from 'lucide-react';

export type AnalyticsSubTab = 'dashboard' | 'zone' | 'engineer' | 'customer' | 'problem' | 'trends';

interface AnalyticsContainerProps {
  complaints: ComplaintRecord[];
  dispensers: DispenserRecord[];
  zoneMetrics: ZoneMetric[];
  engineerMetrics: EngineerMetric[];
}

export const AnalyticsContainer: React.FC<AnalyticsContainerProps> = ({
  complaints,
  dispensers,
  zoneMetrics,
  engineerMetrics
}) => {
  const [subTab, setSubTab] = useState<AnalyticsSubTab>('dashboard');

  const subTabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'zone' as const, label: 'Zone Analysis', icon: Compass },
    { id: 'engineer' as const, label: 'Engineer Analysis', icon: UserCheck },
    { id: 'customer' as const, label: 'Customer Analysis', icon: Building2 },
    { id: 'problem' as const, label: 'Problem Analysis', icon: AlertTriangle },
    { id: 'trends' as const, label: 'Daily Trends', icon: TrendingUp }
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tab Switcher matching prompt's "Analytics sheet" structure */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold text-slate-400 uppercase px-3 font-mono hidden sm:inline">
          Analytics Views:
        </span>
        {subTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`analytics-tab-${tab.id}`}
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render Selected Analytics View */}
      {subTab === 'dashboard' && (
        <DashboardView
          complaints={complaints}
          dispensers={dispensers}
          zoneMetrics={zoneMetrics}
          engineerMetrics={engineerMetrics}
          onViewEngineerAnalysis={() => setSubTab('engineer')}
        />
      )}

      {subTab === 'zone' && (
        <ZoneAnalysisView
          zoneMetrics={zoneMetrics}
          complaints={complaints}
        />
      )}

      {subTab === 'engineer' && (
        <EngineerAnalysisView
          engineers={engineerMetrics}
        />
      )}

      {subTab === 'customer' && (
        <CustomerAnalysisView />
      )}

      {subTab === 'problem' && (
        <ProblemAnalysisView />
      )}

      {subTab === 'trends' && (
        <DailyTrendsView />
      )}
    </div>
  );
};
