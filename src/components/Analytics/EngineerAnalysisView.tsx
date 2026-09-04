import React from 'react';
import { EngineerMetric } from '../../types';
import { UserCheck, Star, Award, CheckCircle2, Clock, Phone, AlertCircle } from 'lucide-react';

interface EngineerAnalysisViewProps {
  engineers: EngineerMetric[];
}

export const EngineerAnalysisView: React.FC<EngineerAnalysisViewProps> = ({ engineers }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            Field Engineer Performance & Workload Distribution
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculated via Master Sheet Formulas: <code className="text-indigo-600 font-mono font-medium">=COUNTIFS(Complaints!I:I, EngineerName, Complaints!K:K, "Closed")</code>
          </p>
        </div>
        <span className="text-xs text-slate-700 font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          5 Certified Service Engineers
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {engineers.map((eng, idx) => {
          const closureRate = Math.round((eng.totalClosed / eng.totalAssigned) * 100);
          return (
            <div key={eng.name} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900">{eng.name}</h4>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                          <Award className="w-3 h-3 text-amber-600" /> Top #1
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-medium">
                      <span>{eng.zone} Zone Lead</span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">{eng.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{eng.rating}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 my-4">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div className="text-xl font-bold text-indigo-600">{eng.totalClosed}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold mt-0.5">Tickets Closed</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div className="text-xl font-bold text-teal-600">{eng.dispensersServiced}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold mt-0.5">Dispensers Serviced</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Closure Rate:</span>
                    <span className="font-bold text-indigo-600">{closureRate}% ({eng.openTickets} open)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${closureRate}%` }} />
                  </div>
                  <div className="flex justify-between text-slate-600 pt-1">
                    <span>Average Resolution:</span>
                    <span className="font-semibold text-slate-800">{eng.avgResolutionHours} hours</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Repeat Visit Rate:</span>
                    <span className="font-semibold text-slate-500">{eng.repeatComplaintsCount} tickets ({((eng.repeatComplaintsCount / eng.totalClosed) * 100).toFixed(1)}%)</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="text-emerald-700 font-medium">✓ WhatsApp status sync active</span>
                <span>ID: ENG-0{idx + 1}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
