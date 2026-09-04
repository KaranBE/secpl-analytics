import React from 'react';
import { DispenserRecord } from '../../types';
import { Droplets, ShieldCheck, AlertCircle, Wrench, Calendar, CheckCircle2, RefreshCw } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts';

interface DispenserAnalyticsProps {
  dispensers: DispenserRecord[];
}

export const DispenserAnalytics: React.FC<DispenserAnalyticsProps> = ({
  dispensers
}) => {
  const operationalCount = dispensers.filter(d => d.status === 'Operational').length;
  const requiresServiceCount = dispensers.filter(d => d.status === 'Requires Service').length;
  const maintenanceCount = dispensers.filter(d => d.status === 'Under Maintenance').length;

  const fleetStatusData = [
    { name: 'Operational', count: 648, color: '#10b981' },
    { name: 'Requires Service', count: 22, color: '#f59e0b' },
    { name: 'Under Maintenance', count: 12, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-indigo-600" />
            Asset & Dispenser Fleet Health Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time filter telemetry, UV sterilizer lamp degradation, and preventative service cycles for 682 deployed units
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            98.4% Fleet Operational Uptime
          </span>
        </div>
      </div>

      {/* Fleet KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Operational Assets</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">648 Units</div>
          <p className="text-[11px] text-slate-400 mt-1">Dispensing at optimal water purity & TDS</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Service Due (Next 7 Days)</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-600">22 Units</div>
          <p className="text-[11px] text-slate-400 mt-1">Preventive filter & membrane replacement</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Active Maintenance</span>
            <Wrench className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-rose-600">12 Units</div>
          <p className="text-[11px] text-slate-400 mt-1">Technician on-site / Spares assigned</p>
        </div>
      </div>

      {/* Dispenser Registry Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Sample Dispenser Fleet Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                <th className="py-2.5 px-3">Asset Code</th>
                <th className="py-2.5 px-3">Client Location</th>
                <th className="py-2.5 px-3">Zone</th>
                <th className="py-2.5 px-3">Model</th>
                <th className="py-2.5 px-3">Filter Health</th>
                <th className="py-2.5 px-3">UV Lamp</th>
                <th className="py-2.5 px-3">Last Serviced</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dispensers.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-600">{d.dispenserCode}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{d.clientName}</div>
                    <div className="text-[11px] text-slate-400">{d.floorLocation}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">{d.zone}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-700">{d.model}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            d.filterHealthPct > 80 ? 'bg-emerald-500' : d.filterHealthPct > 60 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${d.filterHealthPct}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-slate-700">{d.filterHealthPct}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      d.uvLampStatus === 'Optimal' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {d.uvLampStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{d.lastServiceDate}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      d.status === 'Operational'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : d.status === 'Requires Service'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {d.status}
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
