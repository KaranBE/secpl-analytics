import React from 'react';
import { TOP_CUSTOMERS } from '../../data/mockData';
import { Building2, ShieldCheck, Wrench, AlertCircle } from 'lucide-react';

export const CustomerAnalysisView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            Top Corporate & Institutional Customer Accounts
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Dispenser units, ticket velocity, and contracted SLA fulfillment rates
          </p>
        </div>
        <span className="text-xs text-slate-700 font-mono font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          348 Total Installed Units
        </span>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3.5 px-5">Customer / Facility Name</th>
                <th className="py-3.5 px-4 text-center">Active Dispensers</th>
                <th className="py-3.5 px-4 text-center">Lifetime Tickets</th>
                <th className="py-3.5 px-4 text-center">Open Tickets</th>
                <th className="py-3.5 px-4 text-center">SLA Compliance</th>
                <th className="py-3.5 px-5 text-right">Service Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {TOP_CUSTOMERS.map((cust) => (
                <tr key={cust.name} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-slate-900 flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <span>{cust.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-indigo-600">{cust.units}</td>
                  <td className="py-3.5 px-4 text-center text-slate-600">{cust.totalTickets}</td>
                  <td className="py-3.5 px-4 text-center font-bold">
                    {cust.openTickets > 0 ? (
                      <span className="text-amber-700 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[11px]">
                        {cust.openTickets} Open
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">0</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-600">{cust.slaPct}%</td>
                  <td className="py-3.5 px-5 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Healthy
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
