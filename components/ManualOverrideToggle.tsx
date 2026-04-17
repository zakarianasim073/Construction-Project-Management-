import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

const ManualOverrideToggle: React.FC = () => {
  const [isOverride, setIsOverride] = React.useState(false);
  const { showToast } = useNotification();

  const toggle = () => {
    const newState = !isOverride;
    setIsOverride(newState);
    showToast(`System Override Mode: ${newState ? 'ENABLED' : 'DISABLED'}`, newState ? 'error' : 'info');
  };

  return (
    <button 
      onClick={toggle}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isOverride ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
    >
      <ShieldAlert className="w-4 h-4" />
      {isOverride ? 'Override ACTIVE' : 'Manual Override'}
    </button>
  );
};

export default ManualOverrideToggle;
