import React from 'react';
import { PROBLEM_BREAKDOWN } from '../../data/mockData';
import { AlertTriangle, Wrench, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export const ProblemAnalysisView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-indigo-600" />
            Problem & Root Cause Pareto Analysis
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Categorization of 1,248 complaints for predictive spare parts planning and technician training
          </p>
        </div>
        <span className="text-xs text-slate-700 font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          Top 2 Issues = 54.7% of Volume
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pareto Breakdown Chart */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 mb-3">Issue Distribution</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PROBLEM_BREAKDOWN} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} width={110} axisLine={{ stroke: '#e2e8f0' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Bar dataKey="count" name="Total Incidents" radius={[0, 4, 4, 0]}>
                  {PROBLEM_BREAKDOWN.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Percentage Breakdown Table */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900">Recommended Preventive Actions</h4>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200/80">
              <div className="flex justify-between items-center font-bold text-sky-800 mb-1">
                <span>1. Water Leakage (30.8% • 384 incidents)</span>
                <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-[10px]">High Priority</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Primary causes: 3-way connector silicone fatigue & high main pressure. Mandate steel braided hose retrofits on all next preventive visits.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
              <div className="flex justify-between items-center font-bold text-emerald-800 mb-1">
                <span>2. Filter Choked (23.9% • 298 incidents)</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px]">Scheduled</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Driven by high sediment in East and North municipal lines. Auto-trigger 45-day preventive flush alerts in Private Dispenser sheet.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80">
              <div className="flex justify-between items-center font-bold text-rose-800 mb-1">
                <span>3. Power Tripping (11.4% • 142 incidents)</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px]">Safety Critical</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Voltage fluctuations in non-SEZ buildings. SMPS surge protectors deployed across all commercial 4-tap units.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
