import React from 'react';
import { PROBLEM_BREAKDOWN } from '../../data/mockData';
import { AlertTriangle, Wrench, ShieldAlert, CheckCircle2, PieChart as PieChartIcon } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export const IssueAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-indigo-600" />
            Problem & Root Cause Pareto Analysis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Categorization of 1,248 service incidents for predictive spare parts planning, quality control, and technician SOPs
          </p>
        </div>
        <span className="text-xs text-slate-700 font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          Top 2 Issues = 54.7% of Volume
        </span>
      </div>

      {/* 2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Donut Distribution */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Issue Share by Category</h3>
            <p className="text-xs text-slate-500 mb-4">Percentage contribution of each problem type</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PROBLEM_BREAKDOWN}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {PROBLEM_BREAKDOWN.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: any, item: any) => [
                      `${value} incidents (${item.payload.percentage}%)`, 
                      name
                    ]}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 2: Vertical Horizontal Bar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Total Incident Volume Ranking</h3>
          <p className="text-xs text-slate-500 mb-4">Absolute incident count per failure mode</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PROBLEM_BREAKDOWN} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} width={120} axisLine={{ stroke: '#e2e8f0' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" name="Total Incidents" radius={[0, 4, 4, 0]}>
                  {PROBLEM_BREAKDOWN.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Actionable Engineering Root Cause Playbook */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Engineering Root Cause & Preventive Mitigation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200/80">
            <div className="flex justify-between items-center font-bold text-sky-900 mb-1.5">
              <span>Water Leakage (30.8%)</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Main cause: 3-way connector silicone fatigue & high main pressure. Mandated steel braided hose retrofits on all upcoming preventative visits.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="flex justify-between items-center font-bold text-emerald-900 mb-1.5">
              <span>Filter Choking (23.9%)</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Main cause: Municipal sediment spikes in East and North zones. Standardized dual sediment pre-filters on high-intake dispensers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
            <div className="flex justify-between items-center font-bold text-indigo-900 mb-1.5">
              <span>Cooling Faults (19.7%)</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Main cause: Dust accumulation on condenser coils and thermostat relay wear. Cleaned coils during standard 30-day service cycle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
