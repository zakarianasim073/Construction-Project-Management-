import React, { useMemo } from 'react';
import { 
  ProjectState,
  BOQItem,
  AiSuggestion
} from '../types';
import {
  DollarSign,
  Activity, 
  TrendingUp,
  Clock,
  Check,
  X,
  Zap,
  ArrowRight,
  Sparkles,
  Calendar,
  Flag,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import ReactMarkdown from 'react-markdown';

interface DashboardProps {
  data: ProjectState;
  onApplySuggestion: (id: string) => void;
  onDismissSuggestion: (id: string) => void;
  onUpdateProject?: (updater: (project: ProjectState) => ProjectState) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  data,
  onApplySuggestion,
  onDismissSuggestion
}) => {
  const stats = useMemo(() => {
    const totalContract = data.boq.reduce((sum, item) => sum + (item.rate * item.plannedQty), 0);
    const totalExecuted = data.boq.reduce((sum, item) => sum + (item.rate * item.executedQty), 0);
    const totalPlannedCost = data.boq.reduce((sum, item) => sum + (item.plannedUnitCost * item.plannedQty), 0);
    const actualCostSoFar = data.boq.reduce((sum, item) => sum + (item.plannedUnitCost * item.executedQty), 0);
    
    return {
      contractValue: totalContract,
      executedValue: totalExecuted,
      plannedCost: totalPlannedCost,
      actualCostBasis: actualCostSoFar,
      overallProgress: (totalExecuted / totalContract) * 100 || 0,
      projectedProfit: totalContract - totalPlannedCost
    };
  }, [data.boq]);

  const chartData = [
    { name: 'Contract', amount: stats.contractValue },
    { name: 'Executed', amount: stats.executedValue },
    { name: 'Cost Est.', amount: stats.actualCostBasis },
    { name: 'Margin', amount: stats.executedValue - stats.actualCostBasis }
  ];

  const insight = data.aiInsights;
  const pendingSuggestions = data.aiSuggestions.filter(s => s.status === 'PENDING');

  return (
    <div className="space-y-10">
      {/* Page Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Project Overview</h1>
        <p className="text-slate-500 font-medium">Real-time construction performance and AI-driven insights.</p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 border-l-4 border-l-blue-600">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
               <DollarSign className="w-5 h-5" />
             </div>
             <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Live</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Contract Value</p>
          <p className="text-2xl font-black text-slate-900">৳{(stats.contractValue / 1000000).toFixed(2)}M</p>
          <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1 uppercase tracking-tighter">
            <TrendingUp className="w-3 h-3 text-emerald-500" /> +2.4% vs Initial Estimate
          </p>
        </div>

        <div className="card p-6 border-l-4 border-l-emerald-600">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
               <Activity className="w-5 h-5" />
             </div>
             <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Executed</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Billed to Date</p>
          <p className="text-2xl font-black text-slate-900">৳{(stats.executedValue / 1000000).toFixed(2)}M</p>
          <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full transition-all duration-1000" style={{ width: `${stats.overallProgress}%` }}></div>
          </div>
        </div>

        <div className="card p-6 border-l-4 border-l-indigo-600">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
               <TrendingUp className="w-5 h-5" />
             </div>
             <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Projected</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Projected Margin</p>
          <p className="text-2xl font-black text-slate-900">৳{(stats.projectedProfit / 1000000).toFixed(2)}M</p>
          <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1 uppercase tracking-tighter">
            Targeting {((stats.projectedProfit / stats.contractValue) * 100).toFixed(1)}% Yield
          </p>
        </div>

        <div className="card p-6 border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
               <Clock className="w-5 h-5" />
             </div>
             <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Work Days Left</p>
          <p className="text-2xl font-black text-slate-900">142 Days</p>
          <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1 uppercase tracking-tighter">
            Deadline: {data.endDate}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 space-y-8">
            <div className="card p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">Financial Distribution</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Resource allocation & execution</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div> <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Budget</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div> <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Done</span></div>
                  </div>
                </div>
                <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                      tickFormatter={(value) => `৳${value >= 1000000 ? (value/1000000).toFixed(1) + 'M' : (value/1000).toFixed(0) + 'k'}`} 
                    />
                    <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                        labelStyle={{ fontWeight: 900, color: '#0f172a', marginBottom: '8px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                        formatter={(value: number) => [`৳${value.toLocaleString()}`, 'Amount']}
                    />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={48}>
                        {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#0f172a', '#059669', '#6366f1', '#f59e0b'][index]} />
                        ))}
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </div>

            {insight && (
                <div className="card p-8 relative overflow-hidden animate-in slide-in-from-bottom-5 duration-500">
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 bg-blue-50 rounded-xl">
                      <Sparkles className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">AI Executive Summary</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Automated Intelligence</p>
                    </div>
                </div>
                <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed font-medium">
                    <ReactMarkdown>{insight}</ReactMarkdown>
                </div>
                </div>
            )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
            
            {/* Milestone Tracker */}
            <div className="card overflow-hidden">
               <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Flag className="w-5 h-5 text-indigo-500" />
                     <h3 className="font-bold text-slate-900">Critical Milestones</h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next 30 Days</span>
               </div>
               <div className="p-6 space-y-6">
                  {data.milestones && data.milestones.length > 0 ? data.milestones.map((milestone) => (
                    <div key={milestone.id} className="relative pl-6 border-l-2 border-slate-200 last:mb-0 pb-1">
                       <div className={`absolute -left-[7px] top-0 w-3 h-3 rounded-full border-2 border-white shadow-sm transition-colors ${
                         milestone.status === 'COMPLETED' ? 'bg-emerald-500' :
                         milestone.status === 'AT_RISK' ? 'bg-red-500' : 'bg-slate-300'
                       }`}></div>
                       <div className="flex justify-between items-start">
                          <h4 className={`text-sm font-bold ${milestone.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                            {milestone.title}
                          </h4>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                            milestone.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                            milestone.status === 'AT_RISK' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                          }`}>{milestone.status.replace('_', ' ')}</span>
                       </div>
                       <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{milestone.date}</span>
                       </div>
                       {milestone.description && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{milestone.description}</p>}
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <Activity className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm font-medium">No milestones tracked.</p>
                    </div>
                  )}
               </div>
            </div>

            {/* AI Action Feed */}
            <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <Zap className="w-6 h-6 text-indigo-400 fill-current" />
                            <h3 className="font-black text-xl tracking-tight">AI Action Feed</h3>
                        </div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
                    </div>
                    
                    <div className="space-y-5">
                        {pendingSuggestions.length > 0 ? pendingSuggestions.map((s) => (
                            <div key={s.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-indigo-500/50 transition-all group/item shadow-lg">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${
                                        s.type === 'QUANTITY_UPDATE' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                        s.type === 'BILL_DETECTION' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                                        'bg-red-500/20 text-red-300 border-red-500/30'
                                    }`}>
                                        {s.type.replace('_', ' ')}
                                    </span>
                                    <Clock className="w-4 h-4 text-white/30" />
                                </div>
                                <h4 className="text-sm font-black text-white mb-1.5 group-hover/item:text-indigo-300 transition-colors">{s.title}</h4>
                                <p className="text-xs text-white/50 line-clamp-2 mb-5 font-medium leading-relaxed">{s.description}</p>
                                
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => onApplySuggestion(s.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white text-slate-900 hover:bg-indigo-400 hover:text-white rounded-xl text-xs font-black transition-all active:scale-95 shadow-lg shadow-white/5"
                                    >
                                        <Check className="w-4 h-4" />
                                        Apply
                                    </button>
                                    <button 
                                        onClick={() => onDismissSuggestion(s.id)}
                                        className="p-2.5 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 border border-white/5 rounded-xl transition-all"
                                        aria-label="Dismiss"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-12">
                                <CheckCircle2 className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Inbox Zero</p>
                                <p className="text-white/20 text-[10px] mt-1 font-medium">All AI suggestions processed.</p>
                            </div>
                        )}
                    </div>
                    
                    {pendingSuggestions.length > 0 && (
                        <button className="w-full mt-8 text-[10px] text-white/40 font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:text-indigo-400 transition-all">
                            Review All Insight History
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
