
import React, { useState, useMemo } from 'react';
import { ProjectState, Priority, AiSuggestion, BOQItem, DPR, RiskAssessment, WeatherForecast } from '../types';
import { 
  TrendingUp, 
  Activity, 
  AlertCircle, 
  Wallet,
  Sparkles,
  Flag,
  Zap,
  Check,
  Trash2,
  Clock,
  ArrowRight,
  AlertTriangle,
  Calendar,
  ChevronRight,
  BarChart3,
  Sun,
  ShieldAlert,
  Leaf
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { generateProjectInsights, generatePredictiveRiskAssessment } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import RiskAssessmentComponent from './RiskAssessment';
import WeatherWidget from './WeatherWidget';

interface DashboardProps {
  data: ProjectState;
  onApplySuggestion: (suggestionId: string) => void;
  onDismissSuggestion: (suggestionId: string) => void;
  onUpdateProject?: (updater: (proj: ProjectState) => ProjectState) => void;
}

// Helper for Gantt Chart
const getDaysDiff = (d1: string, d2: string) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return Math.max(1, (date2.getTime() - date1.getTime()) / (1000 * 3600 * 24));
};

const ProjectGantt: React.FC<{ data: ProjectState }> = ({ data }) => {
  const projectStart = new Date(data.startDate);
  const projectEnd = new Date(data.endDate);
  const totalDuration = getDaysDiff(data.startDate, data.endDate);
  
  // Calculate Today's position relative to project duration
  const today = new Date();
  const todayPercent = Math.max(0, Math.min(100, (today.getTime() - projectStart.getTime()) / (projectEnd.getTime() - projectStart.getTime()) * 100));

  const getPositionPercent = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = (date.getTime() - projectStart.getTime()) / (1000 * 3600 * 24);
    return Math.max(0, Math.min(100, (diff / totalDuration) * 100));
  };

  // Derive Item Execution Windows from DPRs
  const itemTimelines = useMemo(() => {
    const timelines: { itemId: string; name: string; start: string; end: string; progress: number; priority: Priority; status: string }[] = [];
    
    // Only look at items that have started or are high priority
    const activeItems = data.boq.filter(b => b.executedQty > 0 || b.priority === 'HIGH');

    activeItems.forEach(item => {
      const itemDprs = data.dprs.filter(d => d.linkedBoqId === item.id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      let startDate = itemDprs.length > 0 ? itemDprs[0].date : new Date().toISOString().split('T')[0];
      let endDate = itemDprs.length > 0 ? itemDprs[itemDprs.length - 1].date : startDate;

      // If only one DPR or duration is 0, give it a visual width (e.g. 15 days)
      if (startDate === endDate) {
         const end = new Date(startDate);
         end.setDate(end.getDate() + 15);
         endDate = end.toISOString().split('T')[0];
      }

      // If item hasn't started (no DPRs) but is High Priority, visualize it as "Planned" starting now
      if (itemDprs.length === 0) {
         startDate = new Date().toISOString().split('T')[0];
         const end = new Date(startDate);
         end.setDate(end.getDate() + 30);
         endDate = end.toISOString().split('T')[0];
      }

      const progress = Math.min(100, (item.executedQty / item.plannedQty) * 100);
      
      let status = 'On Track';
      if (progress < 100 && new Date(endDate) < today) status = 'Delayed';
      if (progress >= 100) status = 'Completed';

      timelines.push({
        itemId: item.id,
        name: item.description,
        start: startDate,
        end: endDate,
        progress,
        priority: item.priority || 'LOW',
        status
      });
    });

    return timelines.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()).slice(0, 10);
  }, [data.boq, data.dprs]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <BarChart3 className="w-5 h-5 text-blue-600" />
           <h3 className="font-bold text-slate-900 tracking-tight">Timeline & Progress</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
           <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div> High Priority</div>
           <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div> Scheduled</div>
           <div className="flex items-center gap-1.5 text-rose-500"><div className="w-2.5 h-0.5 bg-rose-500"></div> Today</div>
        </div>
      </div>
      
      <div className="p-6 overflow-x-auto">
        <div className="min-w-[700px] relative">
           {/* Timeline Header (Months) */}
           <div className="flex border-b border-slate-200 pb-2 mb-4 text-xs text-slate-400 font-medium font-mono uppercase tracking-widest relative h-6">
              <span className="absolute left-0">{data.startDate}</span>
              <span className="absolute left-1/2 -translate-x-1/2">Project Duration ({Math.ceil(totalDuration)} Days)</span>
              <span className="absolute right-0">{data.endDate}</span>
           </div>

           {/* Grid Lines */}
           <div className="absolute inset-0 top-8 pointer-events-none flex justify-between px-[1px]">
              {[0, 25, 50, 75, 100].map(p => (
                <div key={p} className="h-full w-px bg-slate-100 last:bg-transparent" style={{ left: `${p}%` }}></div>
              ))}
           </div>
           
           {/* Today Marker */}
           <div className="absolute top-8 bottom-0 w-px border-l-2 border-red-400 border-dashed z-30 pointer-events-none" style={{ left: `${todayPercent}%` }}>
               <div className="absolute -top-4 -translate-x-1/2 bg-red-50 text-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-100 uppercase tracking-wider">
                   Today
               </div>
           </div>

           {/* Milestones Track */}
           <div className="h-12 relative mb-6">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full"></div>
              {data.milestones.map(m => {
                const pos = getPositionPercent(m.date);
                return (
                  <div 
                    key={m.id} 
                    className="absolute top-1/2 -translate-y-1/2 group z-20 cursor-pointer" 
                    style={{ left: `${pos}%` }}
                  >
                    <div className={`w-3.5 h-3.5 rotate-45 border-2 border-white shadow-md transition-transform hover:scale-125 ${
                      m.status === 'COMPLETED' ? 'bg-emerald-500' : 
                      m.status === 'AT_RISK' ? 'bg-red-500' : 'bg-slate-400'
                    }`}></div>
                    
                    {/* Tooltip for Milestone */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[10px] px-2 py-1.5 rounded whitespace-nowrap transition-opacity pointer-events-none z-40 shadow-xl">
                      <div className="font-bold">{m.title}</div>
                      <div className="text-slate-300">{m.date} • {m.status}</div>
                    </div>
                    
                    {/* Date label always visible if needed, but keeping it clean */}
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-400 whitespace-nowrap opacity-50 group-hover:opacity-100">
                        {m.date.split('-').slice(1).join('/')}
                    </div>
                  </div>
                );
              })}
           </div>

             {/* Items Tracks */}
           <div className="space-y-4 pt-4">
              {itemTimelines.map(item => {
                const left = getPositionPercent(item.start);
                const width = Math.max(2, getPositionPercent(item.end) - left); // Min width 2%
                
                return (
                  <div key={item.itemId} className="relative h-14 group">
                     <div className="flex justify-between items-center text-xs mb-1.5 px-1">
                        <div className="flex flex-col">
                           <span className="font-bold text-slate-700 truncate max-w-[250px]" title={item.name}>{item.name}</span>
                           <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{item.start} — {item.end}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                item.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                item.status === 'Delayed' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                'bg-indigo-50 text-indigo-700 border-indigo-100'
                            }`}>{item.status}</span>
                            <span className="font-mono font-bold text-slate-800 text-sm">{item.progress.toFixed(0)}%</span>
                        </div>
                     </div>
                     <div className="w-full h-4 bg-slate-100 rounded-lg overflow-hidden relative shadow-inner">
                        {/* The Background Bar (Planned/Total Window) */}
                        <div 
                          className={`absolute h-full rounded-lg transition-all duration-500 flex items-center border border-white/20 ${
                            item.priority === 'HIGH' ? 'bg-indigo-500/10' : 'bg-slate-300/10'
                          }`}
                          style={{ left: `${left}%`, width: `${width}%` }}
                        ></div>

                        {/* The Actual Progress Bar */}
                        <div 
                          className={`absolute h-full rounded-lg transition-all duration-700 shadow-sm flex items-center overflow-hidden border border-white/30 ${
                            item.status === 'Delayed' ? 'bg-rose-500' :
                            item.status === 'Completed' ? 'bg-emerald-500' :
                            item.priority === 'HIGH' ? 'bg-indigo-600' : 'bg-blue-500'
                          }`}
                          style={{ left: `${left}%`, width: `${(width * item.progress) / 100}%` }}
                        >
                           {/* Glossy overlay */}
                           <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                           {/* Animated stripes if active */}
                           {item.status !== 'Completed' && (
                             <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[pulse_2s_infinite]"></div>
                           )}
                        </div>
                     </div>
                     
                     {/* Hover Details */}
                     <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] px-3 py-2 rounded-lg z-40 pointer-events-none w-max shadow-2xl transition-all duration-200 transform group-hover:-translate-y-1">
                        <div className="font-bold border-b border-slate-700 pb-1 mb-1">{item.name}</div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <div><span className="text-slate-400">Duration:</span> {getDaysDiff(item.start, item.end).toFixed(0)}d</div>
                            <div><span className="text-slate-400">Progress:</span> {item.progress.toFixed(1)}%</div>
                            <div><span className="text-slate-400">Start:</span> {item.start}</div>
                            <div><span className="text-slate-400">End:</span> {item.end}</div>
                        </div>
                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                     </div>
                  </div>
                );
              })}
              {itemTimelines.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400 italic bg-slate-50/50 rounded border border-dashed border-slate-200">
                  No active work timelines generated yet. Add DPRs to visualize progress.
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ data, onApplySuggestion, onDismissSuggestion, onUpdateProject }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [loadingRisk, setLoadingRisk] = useState(false);

  // Calculate high-level metrics
  const totalPlannedValue = data.boq.reduce((sum, item) => sum + (item.plannedQty * item.rate), 0);
  const totalExecutedValue = data.boq.reduce((sum, item) => sum + (item.executedQty * item.rate), 0);
  const progressPercentage = Math.round((totalExecutedValue / totalPlannedValue) * 100) || 0;
  
  const totalLiabilities = data.liabilities.reduce((sum, item) => sum + item.amount, 0);
  const totalBilled = data.bills.filter(b => b.type === 'CLIENT_RA').reduce((sum, b) => sum + b.amount, 0);

  // Calculate Pending Work for Key Points
  const pendingHighPriorityItems = data.boq
    .filter(item => item.priority === 'HIGH' && item.executedQty < item.plannedQty)
    .map(item => ({
      ...item,
      pendingQty: item.plannedQty - item.executedQty,
      pendingValue: (item.plannedQty - item.executedQty) * item.rate,
      progress: (item.executedQty / item.plannedQty) * 100
    }))
    .sort((a, b) => b.pendingValue - a.pendingValue)
    .slice(0, 5);

  const chartData = [
    { name: 'Planned', amount: totalPlannedValue },
    { name: 'Executed', amount: totalExecutedValue },
    { name: 'Billed', amount: totalBilled },
    { name: 'Liabilities', amount: totalLiabilities },
  ];

  const handleGenerateInsights = async () => {
    setLoadingInsight(true);
    const result = await generateProjectInsights(data);
    setInsight(result);
    setLoadingInsight(false);
  };

  const handleGenerateRisks = async () => {
    if (!onUpdateProject) return;
    setLoadingRisk(true);
    const result = await generatePredictiveRiskAssessment(data);
    if (result) {
      onUpdateProject(proj => ({ ...proj, riskAssessment: result }));
    }
    setLoadingRisk(false);
  };

  const getPriorityColor = (p: Priority) => {
    switch(p) {
      case 'HIGH': return 'bg-red-50 text-red-700 border-red-100';
      case 'MEDIUM': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'LOW': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const pendingSuggestions = data.aiSuggestions.filter(s => s.status === 'PENDING');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Project Overview</h1>
            <div className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider flex items-center gap-1 ${getPriorityColor(data.priority)}`}>
              <Flag className="w-2.5 h-2.5" />
              {data.priority} Priority
            </div>
          </div>
          <p className="text-slate-500 font-medium">Monitoring and insights for <span className="text-slate-900">{data.name}</span></p>
        </div>
        <div className="flex items-center gap-3">
          {onUpdateProject && (
            <button 
              onClick={handleGenerateRisks}
              disabled={loadingRisk}
              className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors shadow-sm text-sm font-medium disabled:opacity-50"
            >
              <ShieldAlert className="w-4 h-4" />
              {loadingRisk ? 'Modeling Risks...' : 'Predict Risks'}
            </button>
          )}
          <button 
            onClick={handleGenerateInsights}
            disabled={loadingInsight}
            className="btn-primary flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {loadingInsight ? 'Analyzing Data...' : 'AI Insights'}
          </button>
        </div>
      </div>

      {/* Mini Health Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className={`p-3 rounded-xl ${data.riskAssessment?.overallRiskScore && data.riskAssessment.overallRiskScore > 70 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Risk Score</p>
            <p className="text-xl font-bold text-slate-900">{data.riskAssessment?.overallRiskScore || 0}%</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
             <Sun className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Weather Impact</p>
            <p className="text-xl font-bold text-slate-900">
              {data.weatherForecast?.find(f => f.impactOnSite !== 'NONE') ? 'Active Advisory' : 'Operational'}
            </p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4 sm:col-span-2 lg:col-span-1">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
             <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Execution Index</p>
            <p className="text-xl font-bold text-slate-900">
              {progressPercentage > 0 ? (progressPercentage / getDaysDiff(data.startDate, new Date().toISOString()) * 100).toFixed(1) : '0.0'}% avg.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="card p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Completed</p>
                    <h3 className="text-2xl font-bold text-slate-900">{progressPercentage}%</h3>
                    </div>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Activity className="w-4 h-4" />
                    </div>
                </div>
                <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                </div>

                <div className="card p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Contract</p>
                    <h3 className="text-2xl font-bold text-slate-900">৳{(data.contractValue / 1000000).toFixed(1)}M</h3>
                    </div>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                    </div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-4">Total Budget</p>
                </div>

                <div className="card p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Billed</p>
                    <h3 className="text-2xl font-bold text-slate-900">৳{totalBilled > 1000 ? (totalBilled / 1000).toFixed(0) + 'k' : totalBilled}</h3>
                    </div>
                    <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                    <Wallet className="w-4 h-4" />
                    </div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-4">Certified Work</p>
                </div>

                <div className="card p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Liabilities</p>
                    <h3 className="text-2xl font-bold text-rose-600">৳{totalLiabilities > 1000 ? (totalLiabilities / 1000).toFixed(0) + 'k' : totalLiabilities}</h3>
                    </div>
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    </div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-4">Unpaid Sum</p>
                </div>

                <div className="card p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Emissions</p>
                    <h3 className="text-2xl font-bold text-emerald-600">{data.sustainabilityMetrics?.carbonFootprint || 0}kg</h3>
                    </div>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Leaf className="w-4 h-4" />
                    </div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-4">Carbon Output</p>
                </div>
            </div>

            {/* Gantt Chart Section */}
            <ProjectGantt data={data} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {data.riskAssessment && <RiskAssessmentComponent assessment={data.riskAssessment} />}
              {data.weatherForecast && <WeatherWidget forecast={data.weatherForecast} />}
            </div>

            {/* KEY POINTS: Pending Progress Table */}
            <div className="card overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/30">
                  <div className="flex items-center gap-2">
                     <AlertTriangle className="w-5 h-5 text-amber-500" />
                     <h3 className="font-bold text-slate-900 tracking-tight">Critical Pending Work</h3>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Action Needed</span>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                   <thead className="bg-slate-50/50 text-[10px] text-slate-500 font-bold uppercase tracking-widest border-b border-slate-200">
                     <tr>
                       <th className="px-6 py-4">Item Description</th>
                       <th className="px-6 py-4 text-right">Balance</th>
                       <th className="px-6 py-4 text-right">Value</th>
                       <th className="px-6 py-4 text-right">Progress</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {pendingHighPriorityItems.length > 0 ? pendingHighPriorityItems.map(item => (
                       <tr key={item.id} className="hover:bg-slate-50 group transition-colors">
                         <td className="px-6 py-4">
                           <div className="font-bold text-slate-800 line-clamp-1">{item.description}</div>
                           <div className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{item.id}</div>
                         </td>
                         <td className="px-6 py-4 text-right text-slate-600 font-mono text-xs">
                           {item.pendingQty.toLocaleString()} <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{item.unit}</span>
                         </td>
                         <td className="px-6 py-4 text-right font-bold text-slate-900 font-mono text-xs">
                           ৳{item.pendingValue.toLocaleString()}
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex items-center justify-end gap-3">
                             <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-600 rounded-full" style={{ width: `${item.progress}%` }}></div>
                             </div>
                             <span className="text-xs font-bold text-slate-500 w-8 text-right">{item.progress.toFixed(0)}%</span>
                           </div>
                         </td>
                       </tr>
                     )) : (
                       <tr>
                         <td colSpan={4} className="p-12 text-center text-slate-400">
                           <Check className="w-10 h-10 mx-auto mb-3 text-emerald-400 opacity-50" />
                           <p className="font-medium">No high-priority pending items detected.</p>
                         </td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
            </div>

            {/* Financial Chart */}
            <div className="card p-6">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">Financial Position</h3>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-600"></div> <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Budget</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-600"></div> <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Done</span></div>
                  </div>
                </div>
                <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                      tickFormatter={(value) => `৳${value >= 1000000 ? (value/1000000).toFixed(1) + 'M' : (value/1000).toFixed(0) + 'k'}`} 
                    />
                    <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        labelStyle={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px', fontSize: '12px' }}
                        itemStyle={{ fontSize: '11px', fontWeight: 600 }}
                        formatter={(value: number) => [`৳${value.toLocaleString()}`, 'Amount']}
                    />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={40}>
                        {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#2563eb', '#059669', '#7c3aed', '#ea580c'][index]} />
                        ))}
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </div>

            {insight && (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm relative overflow-hidden animate-in slide-in-from-bottom-5">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight">AI Strategy & Insights</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Generative Analysis</p>
                    </div>
                </div>
                <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed">
                    <ReactMarkdown>{insight}</ReactMarkdown>
                </div>
                </div>
            )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
            
            {/* NEW KEY POINTS: Milestone Tracker */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                     <Flag className="w-5 h-5 text-indigo-500" />
                     <h3 className="font-bold text-slate-800">Key Project Points</h3>
                  </div>
               </div>
               <div className="p-4 space-y-4">
                  {data.milestones && data.milestones.length > 0 ? data.milestones.map((milestone) => (
                    <div key={milestone.id} className="relative pl-4 border-l-2 border-slate-200 last:mb-0">
                       <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm ${
                         milestone.status === 'COMPLETED' ? 'bg-emerald-500' :
                         milestone.status === 'AT_RISK' ? 'bg-red-500' : 'bg-slate-300'
                       }`}></div>
                       <div className="flex justify-between items-start">
                          <h4 className={`text-sm font-semibold ${milestone.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                            {milestone.title}
                          </h4>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            milestone.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                            milestone.status === 'AT_RISK' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                          }`}>{milestone.status.replace('_', ' ')}</span>
                       </div>
                       <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                          <Calendar className="w-3 h-3" />
                          <span>{milestone.date}</span>
                       </div>
                       {milestone.description && <p className="text-xs text-slate-400 mt-1">{milestone.description}</p>}
                    </div>
                  )) : (
                    <div className="text-center py-4 text-slate-400 text-sm">No milestones tracked.</div>
                  )}
               </div>
            </div>

            {/* AI Action Sidebar */}
            <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-indigo-400 fill-current" />
                        <h3 className="font-bold text-lg">AI Action Feed</h3>
                    </div>
                    <p className="text-slate-400 text-sm mb-6">Actionable data extracted from your recent document scans.</p>
                    
                    <div className="space-y-4">
                        {pendingSuggestions.length > 0 ? pendingSuggestions.map((s) => (
                            <div key={s.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-indigo-500 transition-all group">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                                        s.type === 'QUANTITY_UPDATE' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                        s.type === 'BILL_DETECTION' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                        'bg-red-500/20 text-red-400 border-red-500/30'
                                    }`}>
                                        {s.type.replace('_', ' ')}
                                    </span>
                                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                                </div>
                                <h4 className="text-sm font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{s.title}</h4>
                                <p className="text-xs text-slate-400 line-clamp-2 mb-4">{s.description}</p>
                                
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => onApplySuggestion(s.id)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold transition-colors"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        Apply
                                    </button>
                                    <button 
                                        onClick={() => onDismissSuggestion(s.id)}
                                        className="p-1.5 bg-slate-700 hover:bg-red-900/40 text-slate-400 hover:text-red-400 rounded transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10">
                                <Activity className="w-10 h-10 text-slate-700 mx-auto mb-3 opacity-30" />
                                <p className="text-slate-500 text-sm">No pending actions. Try an AI Deep Scan on your documents.</p>
                            </div>
                        )}
                    </div>
                    
                    {pendingSuggestions.length > 0 && (
                        <button className="w-full mt-6 text-xs text-indigo-400 font-bold flex items-center justify-center gap-1 hover:text-indigo-300 transition-colors">
                            View All Suggestions
                            <ArrowRight className="w-3 h-3" />
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
