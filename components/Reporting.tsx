
import React, { useState } from 'react';
import { ProjectState } from '../types';
import { 
  Banknote, Box, ShieldAlert, HardHat, 
  FileText, Braces, ChevronDown, CheckCircle2, FileJson, Table, Loader2, Info
} from 'lucide-react';

interface ReportingProps {
  project: ProjectState;
}

const CustomCheckbox = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
  <div onClick={onChange} className={`flex items-center gap-3 px-4 py-2.5 rounded-md cursor-pointer select-none transition-colors ${checked ? 'bg-blue-50/60' : 'bg-slate-100/50 hover:bg-slate-200/50'}`}>
      <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${checked ? 'bg-amber-600 border-amber-600' : 'bg-white border-slate-300'}`}>
         {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
      </div>
      <span className={`text-[13px] font-bold tracking-wide uppercase ${checked ? 'text-slate-900' : 'text-slate-600'}`}>{label}</span>
  </div>
);

const ToggleSwitch = ({ active, onChange, label, Icon }: { active: boolean, onChange: () => void, label: string, Icon?: any }) => (
  <div onClick={onChange} className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer select-none transition-colors ${active ? 'border-amber-600/30 bg-amber-50/20' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
     {Icon && <Icon className={`w-4 h-4 ${active ? 'text-amber-600' : 'text-slate-400'}`} />}
     <span className={`text-[12px] font-bold tracking-wider uppercase ${active ? 'text-slate-800' : 'text-slate-500'}`}>{label}</span>
     <div className={`ml-auto w-[34px] h-[20px] flex items-center rounded-full p-0.5 transition-colors ${active ? 'bg-amber-600' : 'bg-slate-200'}`}>
        <div className={`w-[16px] h-[16px] bg-white rounded-full shadow-sm transform transition-transform ${active ? 'translate-x-[14px]' : 'translate-x-0'}`} />
     </div>
  </div>
);

const Reporting: React.FC<ReportingProps> = ({ project }) => {
  const [timePeriod, setTimePeriod] = useState('7DAYS');
  const [sectors, setSectors] = useState<Record<string, boolean>>({
    'SECTOR A': true, 'SECTOR B': true, 'SECTOR C': false, 'LOGISTICS': false
  });
  const [modules, setModules] = useState({
    FINANCIALS: true, INVENTORY: true, SAFETY: false, LABOR: true
  });
  const [outputFormat, setOutputFormat] = useState('PDF');
  const [deliveryType, setDeliveryType] = useState('RECURRING');

  const [isGenerating, setIsGenerating] = useState(false);

  const toggleSector = (s: string) => setSectors(prev => ({ ...prev, [s]: !prev[s] }));
  const toggleModule = (m: keyof typeof modules) => setModules(prev => ({ ...prev, [m]: !prev[m] }));

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl mx-auto pb-12">
      
      {/* LEFT COLUMN - CONFIGURATION */}
      <div className="flex-1 space-y-8">
        
        {/* 01. EXPORT SCOPE */}
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-amber-600 mr-4 rounded-full"></div>
            <h2 className="text-[20px] font-bold font-heading text-slate-900 tracking-wide uppercase">01. EXPORT SCOPE</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="text-[11px] font-bold text-slate-500 tracking-[0.15em] uppercase mb-3">TIME PERIOD</h4>
              <div className="flex flex-wrap gap-2">
                 <button onClick={() => setTimePeriod('7DAYS')} className={`text-[11px] font-bold tracking-wide uppercase px-4 py-2.5 rounded transition-all ${timePeriod === '7DAYS' ? 'bg-amber-600 text-white shadow-sm' : 'bg-[#eef2f6] text-slate-600 hover:bg-slate-200/60'}`}>LAST 7 DAYS</button>
                 <button onClick={() => setTimePeriod('30DAYS')} className={`text-[11px] font-bold tracking-wide uppercase px-4 py-2.5 rounded transition-all ${timePeriod === '30DAYS' ? 'bg-amber-600 text-white shadow-sm' : 'bg-[#eef2f6] text-slate-600 hover:bg-slate-200/60'}`}>LAST 30 DAYS</button>
                 <button onClick={() => setTimePeriod('CUSTOM')} className={`text-[11px] font-bold tracking-wide uppercase px-4 py-2.5 rounded transition-all ${timePeriod === 'CUSTOM' ? 'bg-amber-600 text-white shadow-sm border border-transparent' : 'bg-transparent border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>CUSTOM RANGE</button>
              </div>
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-500 tracking-[0.15em] uppercase mb-3">SITE SECTOR</h4>
              <div className="grid grid-cols-2 gap-2">
                 {Object.keys(sectors).map(sec => (
                   <CustomCheckbox key={sec} label={sec} checked={sectors[sec]} onChange={() => toggleSector(sec)} />
                 ))}
              </div>
            </div>
          </div>

          <div>
             <h4 className="text-[11px] font-bold text-slate-500 tracking-[0.15em] uppercase mb-3">INCLUDE DATA MODULES</h4>
             <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-3">
               <ToggleSwitch active={modules.FINANCIALS} onChange={() => toggleModule('FINANCIALS')} label="FINANCIALS" Icon={Banknote} />
               <ToggleSwitch active={modules.INVENTORY} onChange={() => toggleModule('INVENTORY')} label="INVENTORY" Icon={Box} />
               <ToggleSwitch active={modules.SAFETY} onChange={() => toggleModule('SAFETY')} label="SAFETY" Icon={ShieldAlert} />
               <ToggleSwitch active={modules.LABOR} onChange={() => toggleModule('LABOR')} label="LABOR" Icon={HardHat} />
             </div>
          </div>
        </div>

        {/* 02. OUTPUT FORMAT */}
        <div className="bg-[#f8fafc] p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
             <FileText className="w-64 h-64" />
          </div>
          <div className="flex items-center mb-6 relative z-10">
            <div className="w-1 h-6 bg-amber-600 mr-4 rounded-full"></div>
            <h2 className="text-[20px] font-bold font-heading text-slate-900 tracking-wide uppercase">02. OUTPUT FORMAT</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
             {/* PDF Card */}
             <div onClick={() => setOutputFormat('PDF')} className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${outputFormat === 'PDF' ? 'border-amber-600 bg-white shadow-sm' : 'border-transparent bg-[#e5edff]/60 hover:bg-[#dbe5ff]/60'}`}>
                <div className={`absolute top-5 right-5 w-4 h-4 rounded-full border-2 ${outputFormat === 'PDF' ? 'border-amber-600 flex items-center justify-center' : 'border-slate-300'}`}>
                   {outputFormat === 'PDF' && <div className="w-1.5 h-1.5 bg-amber-600 rounded-full" />}
                </div>
                <div className={`w-8 h-8 rounded-lg mb-4 flex items-center justify-center ${outputFormat === 'PDF' ? 'bg-amber-600 text-white' : 'bg-slate-300 text-slate-500'}`}>
                   <span className="text-[10px] font-bold">PDF</span>
                </div>
                <h3 className="text-[14px] font-bold font-heading text-slate-900 uppercase tracking-wide mb-2 leading-tight">EXECUTIVE<br/>PDF</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">High-fidelity visualization including performance charts, heatmaps, and summaries.</p>
             </div>

             {/* CSV Card */}
             <div onClick={() => setOutputFormat('CSV')} className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${outputFormat === 'CSV' ? 'border-amber-600 bg-white shadow-sm' : 'border-transparent bg-[#e5edff]/60 hover:bg-[#dbe5ff]/60'}`}>
                <div className={`absolute top-5 right-5 w-4 h-4 rounded-full border-2 ${outputFormat === 'CSV' ? 'border-amber-600 flex items-center justify-center' : 'border-slate-300'}`}>
                   {outputFormat === 'CSV' && <div className="w-1.5 h-1.5 bg-amber-600 rounded-full" />}
                </div>
                <div className={`w-8 h-8 rounded-lg mb-4 flex items-center justify-center ${outputFormat === 'CSV' ? 'bg-amber-600 text-white' : 'bg-slate-300 text-slate-500'}`}>
                   <span className="text-[10px] font-bold">CSV</span>
                </div>
                <h3 className="text-[14px] font-bold font-heading text-slate-900 uppercase tracking-wide mb-2 leading-tight">RAW CSV</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium mt-[18px]">Unformatted datasets optimized for processing in Excel or BI platforms.</p>
             </div>

             {/* JSON Card */}
             <div onClick={() => setOutputFormat('JSON')} className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${outputFormat === 'JSON' ? 'border-amber-600 bg-white shadow-sm' : 'border-transparent bg-[#e5edff]/60 hover:bg-[#dbe5ff]/60'}`}>
                <div className={`absolute top-5 right-5 w-4 h-4 rounded-full border-2 ${outputFormat === 'JSON' ? 'border-amber-600 flex items-center justify-center' : 'border-slate-300'}`}>
                   {outputFormat === 'JSON' && <div className="w-1.5 h-1.5 bg-amber-600 rounded-full" />}
                </div>
                <div className={`w-8 h-8 rounded-lg mb-4 flex items-center justify-center text-xl font-bold ${outputFormat === 'JSON' ? 'bg-amber-600 text-white' : 'bg-slate-300 text-slate-500'}`}>
                   {'{ }'}
                </div>
                <h3 className="text-[14px] font-bold font-heading text-slate-900 uppercase tracking-wide mb-2 leading-tight">BIM/ERP JSON</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Structured objects for direct ingestion into 3D modeling or legacy ERP systems.</p>
             </div>
          </div>
        </div>

        {/* 03. DELIVERY PROTOCOL */}
        <div className="bg-[#f8fafc] p-8 rounded-xl border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-amber-600 mr-4 rounded-full"></div>
            <h2 className="text-[20px] font-bold font-heading text-slate-900 tracking-wide uppercase">03. DELIVERY PROTOCOL</h2>
          </div>

          <div className="flex flex-wrap gap-8 items-center mb-6">
             <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${deliveryType === 'ONCE' ? 'border-amber-600' : 'border-slate-400 group-hover:border-slate-600'}`}>
                   {deliveryType === 'ONCE' && <div className="w-1.5 h-1.5 bg-amber-600 rounded-full" />}
                </div>
                <span className="text-[12px] font-bold text-slate-800 tracking-wide uppercase">EXPORT ONCE</span>
             </label>
             <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${deliveryType === 'RECURRING' ? 'border-amber-600' : 'border-slate-400 group-hover:border-slate-600'}`}>
                   {deliveryType === 'RECURRING' && <div className="w-1.5 h-1.5 bg-amber-600 rounded-full" />}
                </div>
                <span className="text-[12px] font-bold text-slate-800 tracking-wide uppercase">SCHEDULE RECURRING</span>
             </label>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <h4 className="text-[10px] font-bold text-slate-500 tracking-[0.15em] uppercase mb-3">FREQUENCY</h4>
               <div className="relative">
                  <select className="w-full appearance-none bg-[#eef2f6] border border-transparent hover:border-slate-200 text-slate-700 text-sm font-semibold rounded-lg pl-4 pr-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors">
                     <option>Every Monday (Weekly)</option>
                     <option>End of Month</option>
                     <option>End of Day</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
               </div>
             </div>
             <div>
               <h4 className="text-[10px] font-bold text-slate-500 tracking-[0.15em] uppercase mb-3">RECIPIENTS (COMMA SEPARATED)</h4>
               <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <input type="text" defaultValue="admin@industrial.build, p" className="w-full bg-[#eef2f6] border border-transparent hover:border-slate-200 text-slate-700 text-sm font-semibold rounded-lg pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors" />
               </div>
             </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-6 pt-4">
           <button className="text-[13px] font-bold tracking-widest text-slate-500 hover:text-slate-800 uppercase px-4 py-2 transition-colors">
             CANCEL
           </button>
           <button 
             onClick={() => { setIsGenerating(true); setTimeout(() => setIsGenerating(false), 2000); }}
             className="relative overflow-hidden group bg-gradient-to-r from-amber-600 to-amber-500 text-white px-8 py-4 rounded font-bold tracking-widest uppercase shadow-[0_4px_14px_rgba(217,119,6,0.3)] hover:shadow-[0_6px_20px_rgba(217,119,6,0.4)] hover:-translate-y-0.5 transition-all flex items-center gap-3"
           >
             <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12" />
             <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
             {isGenerating ? 'PROCESSING...' : 'GENERATE & EXPORT'}
             {isGenerating ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <div className="w-4 h-4 ml-2 border-2 border-white/40 rounded-full opacity-60"></div>}
           </button>
        </div>

      </div>

      {/* RIGHT COLUMN - PREVIEW */}
      <div className="w-full lg:w-[350px] shrink-0 space-y-6">
         <div className="bg-[#111827] rounded-xl relative overflow-hidden shadow-2xl border border-slate-800/80">
            {/* Grid Pattern overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#64748b_1px,transparent_1px)] [background-size:16px_16px]" />
            
            <div className="p-8 relative z-10">
               <div className="flex items-start justify-between mb-8">
                 <h2 className="text-white text-xl font-heading font-bold italic uppercase tracking-wider leading-tight">REPORT<br/>BLUEPRINT</h2>
                 <div className="bg-amber-600 text-[#111827] px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest">LIVE<br/>PREVIEW</div>
               </div>

               {/* Skeleton Wireframe */}
               <div className="space-y-3 mb-10 opacity-70">
                 <div className="h-2 w-24 bg-amber-600" />
                 <div className="h-8 w-full bg-slate-800 rounded flex gap-2 overflow-hidden">
                   <div className="h-full w-2 bg-slate-700/50" />
                 </div>
                 <div className="h-8 w-full bg-slate-800 rounded flex gap-2 overflow-hidden">
                   <div className="h-full w-2 bg-slate-700/50" />
                 </div>
                 <div className="h-8 w-full bg-slate-800 rounded flex gap-2 overflow-hidden">
                   <div className="h-full w-2 bg-slate-700/50" />
                 </div>
               </div>

               <h4 className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase mb-6 border-b border-slate-800 pb-3">ESTIMATED TABLE OF CONTENTS</h4>
               
               <div className="space-y-5">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-amber-500 font-heading font-bold text-xs tracking-widest">01</span>
                      <h3 className="text-slate-100 text-[11px] font-bold tracking-wider uppercase">EXECUTIVE SUMMARY</h3>
                    </div>
                    <p className="text-[10px] text-slate-500 ml-7 mt-1">KPI Aggregation & Performance Indices</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-amber-500 font-heading font-bold text-xs tracking-widest">02</span>
                      <h3 className="text-slate-100 text-[11px] font-bold tracking-wider uppercase">FINANCIAL HEALTH MATRIX</h3>
                    </div>
                    <p className="text-[10px] text-slate-500 ml-7 mt-1">Burn rate, Forecast Variance, Material Costs</p>
                  </div>
                  <div className="opacity-40">
                    <div className="flex items-center gap-3">
                      <span className="text-amber-500 font-heading font-bold text-xs tracking-widest">03</span>
                      <h3 className="text-slate-100 text-[11px] font-bold tracking-wider uppercase">INCIDENT LOG (SAFETY)</h3>
                    </div>
                    <p className="text-[10px] text-slate-500 ml-7 mt-0.5 italic">Module excluded in settings</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-amber-500 font-heading font-bold text-xs tracking-widest">04</span>
                      <h3 className="text-slate-100 text-[11px] font-bold tracking-wider uppercase">LABOR PRODUCTIVITY INDEX</h3>
                    </div>
                    <p className="text-[10px] text-slate-500 ml-7 mt-1">Site Sector Alpha & Bravo Deep-dive</p>
                  </div>
               </div>

               <div className="mt-10 pt-5 border-t border-slate-800 flex items-center justify-between">
                 <div>
                   <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-1">ESTIMATED SIZE</p>
                   <p className="text-white font-heading text-lg tracking-wide">12.4 MB</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-1">GENERATED PAGES</p>
                   <p className="text-white font-heading text-lg tracking-wide">~ 34</p>
                 </div>
               </div>
            </div>
         </div>

         <div className="bg-[#FAF9F6] border border-amber-900/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
               <div className="w-4 h-4 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-[10px]">i</div>
               <h4 className="text-[10px] font-bold text-amber-900 tracking-widest uppercase">INDUSTRIAL COMPLIANCE NOTICE</h4>
            </div>
            <p className="text-[10px] text-amber-900/70 leading-relaxed">
               Reports generated for 'BIM/ERP JSON' are digitally signed for audit traceability. Ensure target systems support schema v4.2.
            </p>
         </div>
      </div>
    </div>
  );
};

export default Reporting;
