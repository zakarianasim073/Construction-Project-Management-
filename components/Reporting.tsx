
import React from 'react';
import { ProjectState, Bill, DPR, BOQItem } from '../types';
import { 
  FileBarChart, 
  Download, 
  FileText, 
  Calendar, 
  DollarSign, 
  HardHat, 
  CheckCircle2, 
  ChevronRight, 
  Mail, 
  Share2,
  Loader2
} from 'lucide-react';

interface ReportingProps {
  project: ProjectState;
}

const Reporting: React.FC<ReportingProps> = ({ project }) => {
  const [isGenerating, setIsGenerating] = React.useState<string | null>(null);

  const reports = [
    { id: 'DPR_SUMMARY', title: 'Daily Progress Summary', description: 'Consolidated report of all site activities and labor counts.', icon: HardHat, color: 'bg-blue-50 text-blue-600' },
    { id: 'FINANCIAL_HEALTH', title: 'Financial Health Report', description: 'Budget vs Actual, cash flow, and pending liabilities.', icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
    { id: 'BOQ_RECONCILIATION', title: 'BOQ Reconciliation', description: 'Detailed comparison of planned vs executed quantities.', icon: FileText, color: 'bg-amber-50 text-amber-600' },
    { id: 'QC_SAFETY_LOG', title: 'QC & Safety Log', description: 'History of all inspections and safety audits.', icon: CheckCircle2, color: 'bg-red-50 text-red-600' },
    { id: 'STAKEHOLDER_UPDATE', title: 'Executive Stakeholder Update', description: 'High-level summary for directors and clients.', icon: FileBarChart, color: 'bg-purple-50 text-purple-600' },
  ];

  const handleGenerate = (reportId: string) => {
    setIsGenerating(reportId);
    setTimeout(() => setIsGenerating(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Automated Reporting</h2>
            <p className="text-slate-500">Generate and export comprehensive project reports with one click.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-slate-600 font-bold text-sm hover:bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 transition-all">
              <Calendar className="w-4 h-4" />
              Schedule Reports
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map(report => (
            <div key={report.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all group flex items-start gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${report.color} group-hover:scale-110 transition-transform`}>
                <report.icon className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-lg mb-1">{report.title}</h3>
                <p className="text-sm text-slate-500 mb-4">{report.description}</p>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleGenerate(report.id)}
                    disabled={isGenerating === report.id}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    {isGenerating === report.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                    {isGenerating === report.id ? 'Generating...' : 'Download PDF'}
                  </button>
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                    <Mail className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Recent Reports History</h3>
          <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
        </div>
        <div className="divide-y divide-slate-100">
          {[1, 2, 3].map(i => (
            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Monthly_Financial_Summary_Mar_2026.pdf</p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Generated on Apr 01, 2026 • 2.4 MB</p>
                </div>
              </div>
              <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reporting;
