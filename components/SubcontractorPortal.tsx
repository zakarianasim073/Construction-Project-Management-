
import React from 'react';
import { SubContractor, DPR } from '../types';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  DollarSign, 
  HardHat, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown,
  AlertCircle
} from 'lucide-react';

interface SubcontractorPortalProps {
  subContractors: SubContractor[];
  dprs: DPR[];
}

const SubcontractorPortal: React.FC<SubcontractorPortalProps> = ({ subContractors, dprs }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredSubContractors = subContractors.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const getWorkDoneBySubcontractor = (subId: string) => {
    return dprs.filter(d => d.subContractorId === subId);
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search sub-contractors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
            />
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
          <Plus className="w-4 h-4" />
          Add Sub-contractor
        </button>
      </div>

      {/* Subcontractor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubContractors.map(sub => {
          const workDone = getWorkDoneBySubcontractor(sub.id);
          const liabilityPercent = (sub.currentLiability / sub.totalWorkValue) * 100;

          return (
            <div key={sub.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-blue-300 transition-all group">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Users className="w-6 h-6" />
                  </div>
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">{sub.name}</h3>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
                  {sub.specialization}
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Work Value</span>
                    <p className="text-lg font-bold text-slate-800">৳{(sub.totalWorkValue / 100000).toFixed(1)}L</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Liability</span>
                    <p className={`text-lg font-bold ${sub.currentLiability > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      ৳{(sub.currentLiability / 100000).toFixed(1)}L
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>Payment Progress</span>
                    <span>{((sub.totalBilled / sub.totalWorkValue) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${(sub.totalBilled / sub.totalWorkValue) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1">
                    <HardHat className="w-3 h-3" />
                    {workDone.length} DPRs
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {sub.agreedRates.length} Rates
                  </div>
                </div>

                {sub.currentLiability > (sub.totalWorkValue * 0.5) && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
                    <AlertCircle className="w-3 h-3" />
                    HIGH PENDING LIABILITY
                  </div>
                )}

                <button className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                  View Portal
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubcontractorPortal;
