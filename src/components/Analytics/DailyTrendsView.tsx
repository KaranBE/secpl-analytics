import React from 'react';
import { DAILY_TRENDS_DATA } from '../../data/mockData';
import { TrendingUp, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export const DailyTrendsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Daily Operations Velocity & Dispenser Servicing Trends
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily intake vs resolution throughput feeding the 6 PM automated executive summary
          </p>
        </div>
        <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 95.1% Today's Clearance
        </span>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DAILY_TRENDS_DATA} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDisp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', color: '#475569' }} />
              <Area type="monotone" dataKey="complaints" name="Incoming Complaints" stroke="#38bdf8" fillOpacity={1} fill="url(#colorComplaints)" strokeWidth={2} />
              <Area type="monotone" dataKey="resolved" name="Resolved Tickets" stroke="#4f46e5" fillOpacity={1} fill="url(#colorResolved)" strokeWidth={2} />
              <Area type="monotone" dataKey="dispensersServiced" name="Dispensers Serviced" stroke="#0d9488" fillOpacity={1} fill="url(#colorDisp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
