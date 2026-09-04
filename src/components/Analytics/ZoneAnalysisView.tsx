import React from 'react';
import { ZoneMetric, ComplaintRecord } from '../../types';
import { Compass, CheckCircle2, AlertTriangle, Clock, Wrench, Shield, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ZoneAnalysisViewProps {
  zoneMetrics: ZoneMetric[];
  complaints: ComplaintRecord[];
}

export const ZoneAnalysisView: React.FC<ZoneAnalysisViewProps> = ({
  zoneMetrics,
  complaints
}) => {
  const chartData = zoneMetrics.map(z => ({
    name: z.zone,
    sla: z.slaPercentage,
    total: z.totalComplaints,
    resolved: z.resolvedComplaints,
    open: z.openComplaints
  }));

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {zoneMetrics.map(zone => {
          const zoneComplaints = complaints.filter(c => c.zone === zone.zone);
          const openNow = zoneComplaints.filter(c => c.status !== 'Closed').length;
          return (
            <div key={zone.zone} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-indigo-600" />
                  {zone.zone} Zone
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  zone.slaPercentage >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {zone.slaPercentage}% SLA
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Total Complaints:</span>
                  <span className="font-bold text-slate-900">{zone.totalComplaints}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Active Dispensers:</span>
                  <span className="font-semibold text-indigo-600">{zone.dispensersActive} units</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Open Tickets:</span>
                  <span className={`font-bold ${openNow > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{openNow} pending</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Avg MTTR:</span>
                  <span className="font-semibold text-slate-800">{zone.avgResolutionHours} hrs</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-100">
                  <span>Lead Engineer:</span>
                  <span className="font-semibold text-slate-900">{zone.leadEngineer}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SLA Comparison Chart & Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Zone SLA vs Total Tickets</h3>
              <p className="text-xs text-slate-500 mt-0.5">Formula: =AVERAGEIF(Complaints!E:E, "Zone", Complaints!L:L)</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Bar dataKey="total" fill="#38bdf8" name="Total Tickets" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#4f46e5" name="Resolved" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Highlights */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Zone SLA & Bottleneck Analysis</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
              <div className="flex items-center gap-2 font-bold text-emerald-800 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                West Zone Highest Performance (96%)
              </div>
              <p className="text-slate-700 leading-relaxed">
                Vishal Joshi maintains sub-1.7h resolution speed across 165 active dispensers in HDFC and Apollo hospital hubs.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
              <div className="flex items-center gap-2 font-bold text-amber-800 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                East Zone Under Review (89% vs 90% Target)
              </div>
              <p className="text-slate-700 leading-relaxed">
                Heavy traffic delay in Whitefield IT corridor impacting peak hours ticket response. Additional spare kit assigned to Rahul Verma.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                <Shield className="w-4 h-4 text-indigo-600" />
                South Zone Highest Volume (412 Tickets)
              </div>
              <p className="text-slate-700 leading-relaxed">
                Largest installed base (210 units). Amit Sharma successfully resolved 387 tickets with 94.2% on-time completion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
