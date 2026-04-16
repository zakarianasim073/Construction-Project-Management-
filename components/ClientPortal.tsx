
import React from 'react';
import { ProjectState } from '../types';
import { Globe, Camera, CheckCircle2, Calendar, TrendingUp, FileText, MessageSquare } from 'lucide-react';

interface ClientPortalProps {
  project: ProjectState;
}

const ClientPortal: React.FC<ClientPortalProps> = ({ project }) => {
  const completedMilestones = project.milestones.filter(m => m.status === 'COMPLETED');
  const progress = (completedMilestones.length / (project.milestones.length || 1)) * 100;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Client Welcome Header */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-blue-400 uppercase tracking-widest">Client Transparency Portal</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome back to {project.name}</h1>
          <p className="text-slate-400 max-w-xl">
            Track your project's progress, view site photos, and download official reports in real-time.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full -mr-32 -mt-32"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress Overview */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Overall Progress</h3>
            <span className="text-2xl font-black text-blue-600">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden mb-8">
            <div 
              className="h-full bg-blue-600 transition-all duration-1000" 
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Start Date</p>
              <p className="text-sm font-bold text-slate-800">{project.startDate}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Est. Completion</p>
              <p className="text-sm font-bold text-slate-800">{project.endDate}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Milestones</p>
              <p className="text-sm font-bold text-slate-800">{completedMilestones.length}/{project.milestones.length}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Site Photos</p>
              <p className="text-sm font-bold text-slate-800">{project.photoLogs?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-800 mb-2">Quick Actions</h3>
          <button className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 rounded-xl transition-all group">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              <span className="text-sm font-bold text-slate-700">Latest Report</span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </button>
          <button className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 rounded-xl transition-all group">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              <span className="text-sm font-bold text-slate-700">Contact Manager</span>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Site Photos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            Recent Site Photos
          </h3>
          <button className="text-sm font-bold text-blue-600 hover:underline">View All</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {project.photoLogs?.slice(0, 4).map(photo => (
            <div key={photo.id} className="aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm group relative">
              <img 
                src={photo.url} 
                alt={photo.caption} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                <p className="text-white text-[10px] font-medium">{photo.caption}</p>
                <p className="text-white/70 text-[8px]">{photo.createdAt}</p>
              </div>
            </div>
          )) || (
            <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-400 text-sm">No photos uploaded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Milestone Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Project Milestones
        </h3>
        <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
          {project.milestones.map((milestone, idx) => (
            <div key={milestone.id} className="flex gap-4 relative">
              <div className={`w-6 h-6 rounded-full border-4 border-white shadow-sm shrink-0 z-10 ${
                milestone.status === 'COMPLETED' ? 'bg-emerald-500' : 
                milestone.status === 'AT_RISK' ? 'bg-red-500' : 'bg-slate-300'
              }`} />
              <div className="flex-1 pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`text-sm font-bold ${milestone.status === 'COMPLETED' ? 'text-slate-800' : 'text-slate-500'}`}>
                    {milestone.title}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400">{milestone.date}</span>
                </div>
                <p className="text-xs text-slate-500">{milestone.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientPortal;
