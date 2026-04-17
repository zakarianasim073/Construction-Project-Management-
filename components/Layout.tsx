
import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  HardHat, 
  DollarSign, 
  AlertTriangle,
  FolderOpen,
  Menu,
  X,
  ChevronLeft,
  UserCircle,
  LogOut,
  Bell,
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
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

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
    <nav className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-2 text-slate-800">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Project Management AI</span>
        </div>
        <button 
          onClick={onSwitchProject}
          className="w-full flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors mt-2"
        >
          <ChevronLeft className="w-3 h-3" />
          Switch Project
        </button>
        <div className="mt-2 text-sm font-semibold text-slate-800 truncate" title={projectName}>
          {projectName}
        </div>
      </div>

            <div className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full sidebar-item ${
              activeTab === item.id ? 'sidebar-item-active' : ''
            }`}
          >
            <item.icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
            <span className="font-medium tracking-tight">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-slate-100" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
              {user.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{getRoleLabel(user.role)}</p>
          </div>
          <button 
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-20 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-slate-800">Project Management AI</span>
            <span className="text-xs text-slate-500 truncate max-w-[150px]">{projectName}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationCenter uid={user.uid || ''} />
          {user.avatar && <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full border border-slate-200" referrerPolicy="no-referrer" />}
        </div>
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:block w-64 bg-white border-r border-slate-200 fixed h-full z-10">
        {renderNav()}
      </aside>

      {/* Sidebar Mobile */}
      {isMobileMenuOpen && (
        <aside className="lg:hidden fixed inset-0 z-30 bg-white shadow-xl">
          <div className="flex justify-end p-4">
             <button onClick={() => setIsMobileMenuOpen(false)}><X /></button>
          </div>
          {renderNav()}
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 transition-all">
        <div className="max-w-7xl mx-auto">
          <div className="hidden lg:flex justify-end mb-6">
            <NotificationCenter uid={user.uid || ''} />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
