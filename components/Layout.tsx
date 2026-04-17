
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

  const primaryNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Projects', icon: HardHat },
    { id: 'site', label: 'Deep Scan', icon: FileText },
    { id: 'finance', label: 'Financials', icon: DollarSign },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'labor', label: 'Team', icon: Users }
  ];

  const secondaryNavItems = [
    { id: 'master', label: 'Master View', icon: Settings },
    // others can be hidden in this new visual identity, but state remains
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
    <nav className="flex flex-col h-full bg-slate-50">
      <div className="px-8 py-8 mb-4">
        <h1 className="text-xl font-bold font-heading text-slate-900 tracking-tight uppercase leading-none">BUILDTRACK AI</h1>
        <p className="text-[9px] font-bold text-amber-600 tracking-[0.2em] uppercase mt-1">Industrial Intelligence</p>
      </div>

      <div className="flex-1 space-y-2">
        {primaryNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full group ${
              activeTab === item.id 
                ? 'bg-white border-l-4 border-amber-600 text-slate-900 shadow-[2px_0_10px_rgba(0,0,0,0.02)]' 
                : 'border-l-4 border-transparent text-slate-500 hover:bg-slate-100/50 hover:text-slate-800'
            } flex items-center gap-4 px-8 py-3.5 transition-all duration-200`}
          >
            <item.icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-amber-600' : 'text-slate-400 group-hover:text-amber-600'}`} />
            <span className="font-semibold text-[13px] tracking-wide">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-8 space-y-4">
         <button className="flex items-center gap-4 text-slate-500 hover:text-slate-800 w-full px-1 transition-colors">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span className="font-medium text-[13px]">Help</span>
         </button>
         <button onClick={onLogout} className="flex items-center gap-4 text-slate-500 hover:text-red-600 w-full px-1 transition-colors">
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="font-medium text-[13px]">Logout</span>
         </button>
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
      <main className="flex-1 lg:ml-64 min-h-screen bg-slate-50 flex flex-col transition-all">
        {/* Top Header */}
        <header className="bg-slate-50 border-b border-slate-200/60 px-8 py-5 flex items-center justify-between z-10 sticky top-0">
          <h2 className="text-[18px] font-bold font-heading uppercase tracking-wide text-slate-900">
             {activeTab === 'reports' ? 'EXPORT FULL REPORT' : primaryNavItems.find(i => i.id === activeTab)?.label || activeTab.replace('_', ' ')}
          </h2>
          
          <div className="hidden md:flex flex-1 max-w-xl mx-12 relative">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
               </svg>
             </div>
             <input 
               type="text" 
               placeholder="Search parameters..." 
               className="w-full bg-slate-100/50 border border-slate-200/50 rounded-lg pl-11 pr-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-700 font-medium placeholder-slate-400 shadow-inner" 
             />
          </div>

          <div className="flex items-center gap-6">
             <NotificationCenter uid={user.uid || ''} />
             <button className="text-slate-400 hover:text-amber-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
             </button>
             <button className="text-slate-400 hover:text-amber-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             </button>
             <div className="w-8 h-8 rounded-md overflow-hidden border-2 border-amber-500/30">
               {user.avatar ? (
                 <img src={user.avatar} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               ) : (
                 <div className="w-full h-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">
                   {user.name.charAt(0)}
                 </div>
               )}
             </div>
          </div>
        </header>

        <div className="p-8 mt-2 flex-1 relative">
           <div className="max-w-[1400px] mx-auto h-full">
             {children}
           </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
