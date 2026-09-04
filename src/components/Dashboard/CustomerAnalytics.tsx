import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  ArrowUpDown, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  Wrench, 
  ChevronRight, 
  FileText, 
  SlidersHorizontal,
  CheckCircle2,
  Layers,
  BarChart3,
  Table as TableIcon,
  Download,
  Flame,
  Tag
} from 'lucide-react';
import { CustomerMetric, CompressorRecord, ViewMode } from '../../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';

interface CustomerAnalyticsProps {
  customerMetrics: CustomerMetric[];
  compressors: CompressorRecord[];
  viewMode: ViewMode;
}

const COLORS = ['#6366f1', '#3b82f6', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
const CONTRACT_COLORS: Record<string, string> = {
  'Comprehensive AMC': '#4f46e5',
  'Non-Comprehensive AMC': '#0284c7',
  'Warranty': '#059669',
  'Standard SLA': '#d97706',
  'On-Demand': '#dc2626'
};

export const CustomerAnalytics: React.FC<CustomerAnalyticsProps> = ({
  customerMetrics,
  compressors,
  viewMode
}) => {
  const [search, setSearch] = useState('');
  const [selectedContract, setSelectedContract] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'total' | 'open' | 'critical' | 'name'>('total');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerMetric | null>(null);

  // Filter and sort customer metrics
  const filteredMetrics = customerMetrics.filter(c => {
    const matchSearch = c.customerName.toLowerCase().includes(search.toLowerCase()) ||
      c.area.toLowerCase().includes(search.toLowerCase()) ||
      c.activeModels.some(m => m.toLowerCase().includes(search.toLowerCase())) ||
      c.serialNumbers.some(s => s.toLowerCase().includes(search.toLowerCase()));
    
    const matchContract = selectedContract === 'All' || c.contract === selectedContract;
    return matchSearch && matchContract;
  }).sort((a, b) => {
    if (sortBy === 'total') return b.totalCalls - a.totalCalls;
    if (sortBy === 'open') return b.openCalls - a.openCalls;
    if (sortBy === 'closed') return b.closedCalls - a.closedCalls;
    return a.customerName.localeCompare(b.customerName);
  });

  // Top 8 customer volume chart data
  const chartData = filteredMetrics.slice(0, 8).map(c => ({
    name: c.customerName.length > 18 ? `${c.customerName.slice(0, 16)}...` : c.customerName,
    fullName: c.customerName,
    total: c.totalCalls,
    open: c.openCalls,
    closed: c.closedCalls,
    area: c.area,
    contract: c.contract
  }));

  // Contract breakdown data for Pie Chart
  const contractBreakdown = Object.entries(
    compressors.reduce((acc, c) => {
      acc[c.contract] = (acc[c.contract] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Problem breakdown in compressor dataset
  const problemCounts: Record<string, number> = {};
  compressors.forEach(c => {
    problemCounts[c.problem] = (problemCounts[c.problem] || 0) + 1;
  });
  const topProblems: { problem: string; count: number }[] = Object.keys(problemCounts)
    .map(problem => ({ problem, count: problemCounts[problem] }))
    .sort((a, b) => b.count - a.count);



  const totalCompressorCalls = compressors.length;
  const totalOpenCompressorCalls = compressors.filter(c => c.status !== 'Closed').length;

  const showGraphical = viewMode === 'both' || viewMode === 'graphical';
  const showTabular = viewMode === 'both' || viewMode === 'tabular';

  const exportCSV = () => {
    const headers = ['Customer Name,Area,Contract,Total Calls,Open Calls,Closed Calls,Active Models,Serial Numbers,Primary Engineer'];
    const rows = filteredMetrics.map(c => 
      `"${c.customerName}","${c.area}","${c.contract}",${c.totalCalls},${c.openCalls},${c.closedCalls},"${c.activeModels.join('; ')}","${c.serialNumbers.join('; ')}","${c.primaryEngineer}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `compressor_customer_analytics_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 lg:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10 mb-3">
            <Building2 className="w-3.5 h-3.5 text-indigo-300" />
            <span>Dedicated Compressor Account Intelligence</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
            Customer Incident & Asset Lifecycle Analysis
          </h2>
          <p className="text-indigo-200/90 text-sm mt-1 leading-relaxed">
            Multi-dimensional analysis of industrial accounts, AMC coverage types, compressor serial health, and repeat breakdown trends across all operational zones.
          </p>
        </div>

        {/* Quick KPI stats overlay */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div>
            <div className="text-xs text-indigo-200 font-medium">Total Accounts</div>
            <div className="text-2xl font-bold text-white mt-0.5">{customerMetrics.length}</div>
            <div className="text-[11px] text-indigo-300">Active Industrial Clients</div>
          </div>
          <div>
            <div className="text-xs text-indigo-200 font-medium">Total Service Calls</div>
            <div className="text-2xl font-bold text-white mt-0.5">{totalCompressorCalls}</div>
            <div className="text-[11px] text-emerald-400 font-medium">{totalCompressorCalls - totalOpenCompressorCalls} Resolved</div>
          </div>
          <div>
            <div className="text-xs text-indigo-200 font-medium">Open Incidents</div>
            <div className="text-2xl font-bold text-amber-300 mt-0.5">{totalOpenCompressorCalls}</div>
            <div className="text-[11px] text-amber-200">Active in Field</div>
          </div>
          <div>
            <div className="text-xs text-indigo-200 font-medium">Resolution Rate</div>
            <div className="text-2xl font-bold text-emerald-300 mt-0.5">
              {totalCompressorCalls > 0 ? Math.round(((totalCompressorCalls - totalOpenCompressorCalls) / totalCompressorCalls) * 100) : 100}%
            </div>
            <div className="text-[11px] text-emerald-200">Closure Efficiency</div>
          </div>
        </div>
      </div>

      {/* GRAPHICAL DATA VIEW */}
      {showGraphical && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. Customer Call Volume Bar Chart */}
          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  Top Accounts by Compressor Incident Volume
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comparison of resolved vs open breakdown calls per customer account
                </p>
              </div>
            </div>

            <div className="h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(val: any, name: string) => [val, name === 'closed' ? 'Closed Tickets' : 'Open Tickets']}
                    labelFormatter={(label) => `Account: ${label}`}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="closed" name="Closed" fill="#4f46e5" stackId="a" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="open" name="Open" fill="#f59e0b" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Contract SLA Type Distribution */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Compressor Contract Split
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Distribution of calls by service agreement type
              </p>
            </div>

            <div className="h-56 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contractBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {contractBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CONTRACT_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    formatter={(val: any) => [`${val} calls`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              {contractBreakdown.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: CONTRACT_COLORS[item.name] || COLORS[idx % COLORS.length] }}
                    ></span>
                    <span className="text-slate-700 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Problem Categories across Compressors */}
      {showGraphical && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-amber-500" />
            Top Compressor Problem Breakdown Across All Customers
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {topProblems.map((prob, idx) => (
              <div key={prob.problem} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <div className="text-[11px] text-slate-500 font-medium truncate" title={prob.problem}>
                  {prob.problem}
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg font-bold text-slate-900">{prob.count}</span>
                  <span className="text-[10px] text-indigo-600 font-semibold">
                    {Math.round((prob.count / (totalCompressorCalls || 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${Math.round((prob.count / (totalCompressorCalls || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TABULAR DATA VIEW */}
      {showTabular && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          {/* Table Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-indigo-600" />
                Customer Account Master Registry (Compressor Fleet)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed tabular breakdown of client assets, contract SLAs, and incident history
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search Customer */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter customer, model, serial..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-52 sm:w-64"
                />
              </div>

              {/* Filter by Contract */}
              <select
                value={selectedContract}
                onChange={(e) => setSelectedContract(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="All">All Contracts</option>
                <option value="Comprehensive AMC">Comprehensive AMC</option>
                <option value="Non-Comprehensive AMC">Non-Comprehensive AMC</option>
                <option value="Warranty">Warranty</option>
                <option value="Standard SLA">Standard SLA</option>
                <option value="On-Demand">On-Demand</option>
              </select>

              {/* Sort selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="total">Sort: Total Calls (High to Low)</option>
                <option value="open">Sort: Open Calls</option>
                <option value="closed">Sort: Closed Calls</option>
                <option value="name">Sort: Customer Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70">
                  <th className="py-3 px-3">Customer Account</th>
                  <th className="py-3 px-3">Area / Zone</th>
                  <th className="py-3 px-3">Contract Type</th>
                  <th className="py-3 px-3">Active Models & Serials</th>
                  <th className="py-3 px-3 text-center">Total Calls</th>
                  <th className="py-3 px-3 text-center">Open</th>
                  <th className="py-3 px-3">Top Problems Reported</th>
                  <th className="py-3 px-3">Assigned Lead</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMetrics.map((cust) => (
                  <tr key={cust.customerName} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{cust.customerName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {cust.serialNumbers.length} registered asset{cust.serialNumbers.length > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {cust.area}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cust.contract === 'Comprehensive AMC'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : cust.contract === 'Warranty'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {cust.contract}
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <div className="font-medium text-slate-800 truncate" title={cust.activeModels.join(', ')}>
                        {cust.activeModels.join(', ')}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 truncate" title={cust.serialNumbers.join(', ')}>
                        SN: {cust.serialNumbers.join(', ')}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                        {cust.totalCalls}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {cust.openCalls > 0 ? (
                        <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          {cust.openCalls}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">0</span>
                      )}
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {cust.topProblems.slice(0, 2).map(p => (
                          <span key={p.problem} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                            {p.problem} ({p.count})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {cust.primaryEngineer}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Detailed Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Account Detail Dossier</div>
                <h3 className="text-lg font-bold text-slate-900">{selectedCustomer.customerName}</h3>
                <p className="text-xs text-slate-500">{selectedCustomer.area} &bull; {selectedCustomer.contract}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Total Incident Calls</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">{selectedCustomer.totalCalls}</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                <div className="text-[11px] text-amber-700 font-medium">Active Open Calls</div>
                <div className="text-xl font-bold text-amber-800 mt-0.5">{selectedCustomer.openCalls}</div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                <div className="text-[11px] text-emerald-700 font-medium">Avg Resolution Time</div>
                <div className="text-xl font-bold text-emerald-800 mt-0.5">{selectedCustomer.avgResolutionHours}h</div>
              </div>
            </div>

            {/* Compressor Records for this Customer */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-2">Logged Compressor Service Incidents</h4>
              <div className="space-y-2">
                {compressors
                  .filter(c => c.customerName === selectedCustomer.customerName)
                  .map(c => (
                    <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-indigo-600">{c.serialNumber} &bull; {c.model}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'Closed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <div className="text-slate-800 font-medium">{c.problem}</div>
                      <div className="text-slate-500 text-[11px] flex items-center justify-between">
                        <span>Date: {c.date} | Lead: {c.supportEngineer}</span>
                        <span className="font-mono text-[10px] text-slate-400">WhatsApp: {c.senderNumber}</span>
                      </div>
                      {c.notes && (
                        <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 mt-1">
                          {c.notes}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
