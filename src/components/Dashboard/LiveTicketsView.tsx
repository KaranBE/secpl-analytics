import React, { useState } from 'react';
import { ComplaintRecord } from '../../types';
import { ListFilter, Search, CheckCircle2, Clock, AlertCircle, Wrench, ChevronRight, Eye, Phone, MapPin } from 'lucide-react';

interface LiveTicketsViewProps {
  complaints: ComplaintRecord[];
  searchQuery: string;
}

export const LiveTicketsView: React.FC<LiveTicketsViewProps> = ({
  complaints,
  searchQuery
}) => {
  const [selectedTicket, setSelectedTicket] = useState<ComplaintRecord | null>(null);

  const filteredTickets = complaints.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.ticketNumber.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q) ||
      t.location.toLowerCase().includes(q) ||
      t.assignedEngineer.toLowerCase().includes(q) ||
      t.issueCategory.toLowerCase().includes(q) ||
      t.zone.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ListFilter className="w-5 h-5 text-indigo-600" />
            Live Service Incident Registry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational service incident records with technician logs, resolution notes, and SLA timestamps
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            {filteredTickets.length} Incidents Displayed
          </span>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                <th className="py-2.5 px-3">Ticket #</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Customer & Location</th>
                <th className="py-2.5 px-3">Zone</th>
                <th className="py-2.5 px-3">Issue Category</th>
                <th className="py-2.5 px-3">Technician</th>
                <th className="py-2.5 px-3">MTTR</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-600">
                    {ticket.ticketNumber}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                    {ticket.timestamp}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{ticket.customerName}</div>
                    <div className="text-[11px] text-slate-400">{ticket.location}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                      {ticket.zone}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-800">
                    {ticket.issueCategory}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700">
                    {ticket.assignedEngineer}
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {ticket.resolutionTimeHours ? `${ticket.resolutionTimeHours} hrs` : '-'}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      ticket.status === 'Closed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : ticket.status === 'In Progress'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        ticket.status === 'Closed' ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}></span>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors cursor-pointer"
                      title="View Ticket Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {selectedTicket.ticketNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedTicket.customerName}
                </h3>
                <p className="text-xs text-slate-500">{selectedTicket.location}</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-700 p-1 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs pt-2 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 text-[10px]">Zone & Dispenser</div>
                  <div className="font-bold text-slate-900">{selectedTicket.zone} Zone &bull; {selectedTicket.dispenserId}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 text-[10px]">Issue Category</div>
                  <div className="font-bold text-slate-900">{selectedTicket.issueCategory}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 text-[10px]">Assigned Engineer</div>
                  <div className="font-bold text-slate-900">{selectedTicket.assignedEngineer}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 text-[10px]">Current Status</div>
                  <div className="font-bold text-indigo-600">{selectedTicket.status}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/80">
                <div className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">
                  Engineering Notes & Action Taken
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {selectedTicket.notes}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
