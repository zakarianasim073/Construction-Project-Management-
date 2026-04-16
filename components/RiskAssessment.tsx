
import React from 'react';
import { RiskAssessment } from '../types';
import { AlertTriangle, ShieldCheck, TrendingUp, TrendingDown, Info, BrainCircuit, Zap } from 'lucide-react';

interface RiskAssessmentProps {
  assessment: RiskAssessment;
}

const RiskAssessmentComponent: React.FC<RiskAssessmentProps> = ({ assessment }) => {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-100';
      case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'LOW': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 70) return 'text-red-600';
    if (score > 40) return 'text-amber-600';
    return 'text-emerald-600';
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BrainCircuit className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">AI Risk Engine</span>
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/20 rounded text-[8px] font-bold text-blue-300 border border-blue-500/30">
                  <Zap className="w-2 h-2" />
                  LIVE
                </div>
              </div>
              <h2 className="text-2xl font-bold">Project Risk Assessment</h2>
              <p className="text-xs text-slate-400">Last updated: {assessment.lastUpdated}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Overall Score</p>
              <p className={`text-3xl font-black ${getScoreColor(assessment.overallRiskScore)}`}>
                {assessment.overallRiskScore}
              </p>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <TrendingDown className="w-3 h-3" />
                <span>-5% from last week</span>
              </div>
              <p className="text-[10px] text-slate-500">Improving stability</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-32 -mb-32"></div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {assessment.risks.map((risk, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:border-blue-300 transition-all group">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getImpactColor(risk.impact)}`}>
                    {risk.impact} IMPACT
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{risk.category}</span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{risk.description}</h3>
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">AI Mitigation Strategy</p>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{risk.mitigation}</p>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-48 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>Probability</span>
                    <span>{(risk.probability * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        risk.probability > 0.7 ? 'bg-red-500' : 
                        risk.probability > 0.4 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${risk.probability * 100}%` }}
                    />
                  </div>
                </div>
                <button className="w-full py-2 text-xs font-bold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                  <Info className="w-3 h-3" />
                  View History
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskAssessmentComponent;
