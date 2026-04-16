
import React from 'react';
import { Task } from '../types';
import { Calendar, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface GanttChartProps {
  tasks: Task[];
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks }) => {
  const [viewMode, setViewMode] = React.useState<'WEEK' | 'MONTH'>('MONTH');
  
  // Simple Gantt Logic
  const sortedTasks = [...tasks].sort((a, b) => new Date(a.startDate || a.createdAt).getTime() - new Date(b.startDate || b.createdAt).getTime());
  
  const getTaskDuration = (task: Task) => {
    const start = new Date(task.startDate || task.createdAt);
    const end = new Date(task.dueDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Project Timeline</h2>
          <p className="text-sm text-slate-500">Visual schedule of all construction activities</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('WEEK')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'WEEK' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Week
            </button>
            <button 
              onClick={() => setViewMode('MONTH')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'MONTH' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Month
            </button>
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="min-w-[800px]">
          {/* Timeline Header */}
          <div className="flex border-b border-slate-100 pb-4 mb-6">
            <div className="w-64 shrink-0 font-bold text-slate-400 text-xs uppercase tracking-wider">Activity / Task</div>
            <div className="flex-1 flex justify-between px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
          </div>

          {/* Task Bars */}
          <div className="space-y-6">
            {sortedTasks.map((task, idx) => {
              const start = new Date(task.startDate || task.createdAt);
              const startMonth = start.getMonth();
              const duration = getTaskDuration(task);
              const widthPercent = Math.min(100, (duration / 365) * 100 * 12); // Rough estimation
              const leftPercent = (startMonth / 12) * 100;

              return (
                <div key={task.id} className="flex items-center group">
                  <div className="w-64 shrink-0 pr-4">
                    <h4 className="font-bold text-slate-700 text-sm truncate group-hover:text-blue-600 transition-colors">{task.title}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">{new Date(task.startDate || task.createdAt).toLocaleDateString()} - {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex-1 h-8 bg-slate-50 rounded-lg relative overflow-hidden">
                    <div 
                      className={`absolute top-0 bottom-0 rounded-lg shadow-sm transition-all hover:brightness-110 cursor-pointer ${
                        task.status === 'COMPLETED' ? 'bg-emerald-500' : 
                        task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 
                        task.status === 'BLOCKED' ? 'bg-red-500' : 'bg-slate-300'
                      }`}
                      style={{ 
                        left: `${leftPercent}%`, 
                        width: `${Math.max(5, widthPercent)}%` 
                      }}
                    >
                      <div className="px-2 py-1 text-[8px] font-bold text-white truncate">
                        {task.status}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
          <span className="text-[10px] font-bold text-slate-500 uppercase">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span className="text-[10px] font-bold text-slate-500 uppercase">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-300 rounded-full" />
          <span className="text-[10px] font-bold text-slate-500 uppercase">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-[10px] font-bold text-slate-500 uppercase">Blocked</span>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
