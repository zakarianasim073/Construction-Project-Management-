import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  HardHat, 
  DollarSign, 
  FolderOpen,
  Menu,
  X,
  ChevronLeft,
  LogOut,
  CheckCircle2,
  Users,
  Calendar,
  BarChart3,
  ShoppingCart,
  ShieldCheck,
  Camera,
  FileBarChart,
  Truck,
  UserCheck,
  Box,
  Globe
} from 'lucide-react';
import { UserRole, User } from '../types';
import { NotificationCenter } from './Collaboration';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSwitchProject: () => void;
  projectName: string;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  onSwitchProject, 
  projectName,
  user,
  onLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'master', label: 'Master Control', icon: FileText },
    { id: 'site', label: 'Site Execution', icon: HardHat },
    { id: 'finance', label: 'Financial Control', icon: DollarSign },
    { id: 'analytics', label: 'Financial Analytics', icon: BarChart3 },
    { id: 'procurement', label: 'Procurement', icon: ShoppingCart },
    { id: 'equipment', label: 'Equipment', icon: Truck },
    { id: 'labor', label: 'Labor & Attendance', icon: UserCheck },
    { id: 'subcontractors', label: 'Sub-contractors', icon: Users },
    { id: 'qc-safety', label: 'QC & Safety', icon: ShieldCheck },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
    { id: 'gantt', label: 'Timeline', icon: Calendar },
    { id: 'bim', label: 'BIM Viewer', icon: Box },
    { id: 'photos', label: 'Photo Logs', icon: Camera },
    { id: 'reports', label: 'Reports', icon: FileBarChart },
    { id: 'client', label: 'Client Portal', icon: Globe },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'documents', label: 'Documents', icon: FolderOpen },
  ];

  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'DIRECTOR': return 'Project Director';
      case 'MANAGER': return 'Project Manager';
      case 'ENGINEER': return 'Site Engineer';
      case 'ACCOUNTANT': return 'Accountant';
      default: return role;
    }
  };

  const renderNav = () => (
    <nav className="flex flex-col h-full bg-white">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-6">
           <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900 leading-tight">Project Management AI</span>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Active Project</div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="text-sm font-bold text-slate-900 truncate" title={projectName}>
              {projectName}
            </div>
            <button
              onClick={onSwitchProject}
              className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors mt-1.5 uppercase tracking-wider"
            >
              <ChevronLeft className="w-3 h-3" />
              Switch Project
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full sidebar-item ${
              activeTab === item.id ? 'sidebar-item-active' : 'sidebar-item-inactive'
            }`}
          >
            <item.icon className={`w-4 h-4 shrink-0 transition-transform ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="font-semibold tracking-tight">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-3 bg-slate-50 border border-slate-100 rounded-2xl">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full border border-white shadow-sm" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-9 h-9 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-bold text-sm border border-white shadow-sm">
              {user.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-slate-900 truncate">{user.name}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getRoleLabel(user.role)}</p>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-white hover:shadow-sm rounded-xl transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-20 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
          <div className="flex flex-col">
            <span className="font-black text-slate-900">PM AI</span>
            <span className="text-[10px] font-bold text-slate-400 truncate max-w-[150px] uppercase tracking-wider">{projectName}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationCenter uid={user.uid || ''} />
          {user.avatar && <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full border border-slate-200" referrerPolicy="no-referrer" />}
        </div>
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:block w-72 bg-white border-r border-slate-200 fixed h-full z-10">
        {renderNav()}
      </aside>

      {/* Sidebar Mobile */}
      {isMobileMenuOpen && (
        <aside className="lg:hidden fixed inset-0 z-30 bg-white shadow-2xl">
          <div className="flex justify-end p-4">
             <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
          </div>
          {renderNav()}
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 transition-all min-h-screen flex flex-col">
        <header className="hidden lg:flex items-center justify-end px-8 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10">
          <NotificationCenter uid={user.uid || ''} />
        </header>
        <div className="flex-1 p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
