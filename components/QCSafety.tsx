
import React from 'react';
import { QualityCheck, SafetyCheck, User } from '../types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  Camera, 
  User as UserIcon,
  ChevronRight,
  MoreVertical
} from 'lucide-react';

interface QCSafetyProps {
  qualityChecks: QualityCheck[];
  safetyChecks: SafetyCheck[];
  users: User[];
}

const QCSafety: React.FC<QCSafetyProps> = ({ qualityChecks, safetyChecks, users }) => {
  const [activeTab, setActiveTab] = React.useState<'QUALITY' | 'SAFETY'>('QUALITY');

  const getInspectorName = (uid: string) => {
    return users.find(u => u.uid === uid)?.name || 'Unknown Inspector';
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('QUALITY')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'QUALITY' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Quality Checks
          </button>
          <button 
            onClick={() => setActiveTab('SAFETY')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'SAFETY' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ShieldCheck className="w-4 h-4" />
            Safety Audits
          </button>
        </div>
        
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
          <Plus className="w-4 h-4" />
          {activeTab === 'QUALITY' ? 'New Inspection' : 'New Audit'}
        </button>
      </div>

      {activeTab === 'QUALITY' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {qualityChecks.map(check => (
            <div key={check.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-blue-300 transition-all group">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    check.status === 'PASSED' ? 'bg-emerald-50 text-emerald-600' : 
                    check.status === 'FAILED' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {check.status === 'PASSED' ? <CheckCircle2 className="w-6 h-6" /> : 
                     check.status === 'FAILED' ? <XCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{check.title}</h3>
                    <p className="text-xs text-slate-500">{check.location} • {new Date(check.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  {check.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                      {item.isOk ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-700">{item.description}</p>
                        {item.remarks && <p className="text-[10px] text-slate-500 mt-1 italic">{item.remarks}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                      <UserIcon className="w-3 h-3 text-slate-500" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{getInspectorName(check.inspectorUid)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
                    <Camera className="w-3 h-3" />
                    {check.photos?.length || 0} Photos
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safetyChecks.map(audit => (
            <div key={audit.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all group">
              <div className="flex items-start justify-between mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  audit.status === 'SAFE' ? 'bg-emerald-50 text-emerald-600' : 
                  audit.status === 'CRITICAL' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Safety Score</span>
                  <p className={`text-2xl font-bold ${
                    audit.score >= 90 ? 'text-emerald-600' : 
                    audit.score >= 70 ? 'text-amber-600' : 'text-red-600'
                  }`}>{audit.score}%</p>
                </div>
              </div>

              <h3 className="font-bold text-slate-800 mb-4">Safety Audit - {new Date(audit.date).toLocaleDateString()}</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Hazards Identified</span>
                  <div className="flex flex-wrap gap-2">
                    {audit.hazardsIdentified.map((hazard, idx) => (
                      <span key={idx} className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg border border-red-100">
                        {hazard}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Corrective Actions</span>
                  <div className="flex flex-wrap gap-2">
                    {audit.correctiveActions.map((action, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-100">
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                    <UserIcon className="w-3 h-3 text-slate-500" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{getInspectorName(audit.inspectorUid)}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                  audit.status === 'SAFE' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 
                  audit.status === 'CRITICAL' ? 'text-red-600 bg-red-50 border-red-100' : 'text-amber-600 bg-amber-50 border-amber-100'
                }`}>
                  {audit.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QCSafety;
