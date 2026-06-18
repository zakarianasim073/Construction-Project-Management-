import React, { useState, useEffect, useCallback } from 'react';
import { ProjectState, UserRole, Priority } from '../types';
import { 
  PlusCircle, 
  Building2, 
  Calendar, 
  ArrowRight,
  Activity,
  DollarSign,
  UserCircle,
  Lock,
  Flag,
  X
} from 'lucide-react';

interface ProjectListProps {
  projects: ProjectState[];
  onSelectProject: (projectId: string) => void;
  onCreateProject: (project: Partial<ProjectState>) => void;
  userRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelectProject, onCreateProject, userRole, onSwitchRole }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [contractValue, setContractValue] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');

  const canCreateProject = userRole === 'DIRECTOR';

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setNewProjectName('');
    setContractValue('');
    setPriority('MEDIUM');
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateProject({
      name: newProjectName,
      contractValue: Number(contractValue),
      priority,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      boq: [],
      dprs: [],
      bills: [],
      liabilities: [],
      documents: []
    });
    closeModal();
  };

  const getRoleLabel = (role: UserRole) => {
    switch(role) {
      case 'DIRECTOR': return 'Project Director';
      case 'MANAGER': return 'Project Manager';
      case 'ENGINEER': return 'Site Engineer';
      case 'ACCOUNTANT': return 'Accountant';
      default: return role;
    }
  };

  const getPriorityColor = (p: Priority) => {
    switch(p) {
      case 'HIGH': return 'bg-red-50 text-red-700 border-red-200';
      case 'MEDIUM': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOW': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Projects</h1>
          <p className="text-slate-500 mt-1">Manage your construction portfolio across different sites.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium">
            <UserCircle className="w-5 h-5 text-slate-400" />
            <span>{getRoleLabel(userRole)}</span>
          </div>

          {canCreateProject ? (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              <PlusCircle className="w-5 h-5" />
              Create New Project
            </button>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 bg-slate-100 px-4 py-2.5 rounded-lg text-sm font-medium">
               <Lock className="w-4 h-4" />
               Create Disabled
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <div 
            key={`${project.id}-${index}`}
            onClick={() => onSelectProject(project.id)}
            className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden relative"
          >
            <div className={`absolute top-0 left-0 w-1 h-full ${project.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                    project.status === 'ACTIVE' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {project.status}
                  </div>
                  <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider flex items-center gap-1 ${getPriorityColor(project.priority)}`}>
                    <Flag className="w-2.5 h-2.5" />
                    {project.priority}
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 min-h-[3.5rem]">
                {project.name}
              </h3>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  <span>৳{(project.contractValue / 1000000).toFixed(2)} Million</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{project.startDate} to {project.endDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-400" />
                  <span>{project.boq.length} BOQ Items</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center group-hover:bg-blue-50 transition-colors">
              <span className="text-sm font-medium text-slate-600 group-hover:text-blue-700">Open Dashboard</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 transform group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700">No projects yet</h3>
            <p className="text-slate-500 mb-6">Create your first construction project to get started.</p>
            {canCreateProject && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-blue-600 font-medium hover:underline"
              >
                Create Project
              </button>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-lg">Create New Project</h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-8 space-y-6">
              <div>
                <label htmlFor="projectName" className="form-label">Project Name</label>
                <input 
                  id="projectName"
                  type="text" 
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g., Bridge Construction at..."
                  className="form-input"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="priority" className="form-label">Priority</label>
                  <select 
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="form-input bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="contractValue" className="form-label">Contract Value (৳)</label>
                  <input 
                    id="contractValue"
                    type="number" 
                    required
                    value={contractValue}
                    onChange={(e) => setContractValue(e.target.value)}
                    placeholder="0"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-primary px-8"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
