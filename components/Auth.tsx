import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { LogIn, ShieldCheck, Construction, Calculator, Briefcase, User as UserIcon } from 'lucide-react';

interface AuthProps {
  onUserChange: (user: any | null) => void;
}

const Auth: React.FC<AuthProps> = ({ onUserChange }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('DIRECTOR');
  
  // Auto-login if token exists
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error("Invalid token");
          return res.json();
        })
        .then(data => onUserChange(data.user))
        .catch(err => {
          console.error("Auto-login failed:", err);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('local_user_uid');
        });
    }
  }, [onUserChange]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const email = `${name.toLowerCase().replace(/\s+/g, '')}@buildtrack.local`;
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email, role })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      if (data.token && data.user) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('local_user_uid', data.user.uid);
        onUserChange(data.user);
      }
    } catch (e) {
      console.error("Login failed", e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
              <Construction className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2 leading-tight font-heading">BuildTrack Local</h1>
            <p className="text-slate-500 text-sm">Offline Mode • No signup required</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Your Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm transition-all"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div className="space-y-1 mt-4">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Select Role</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  { r: 'DIRECTOR', icon: <ShieldCheck className="w-4 h-4" /> },
                  { r: 'MANAGER', icon: <Briefcase className="w-4 h-4" /> },
                  { r: 'ENGINEER', icon: <Construction className="w-4 h-4" /> },
                  { r: 'ACCOUNTANT', icon: <Calculator className="w-4 h-4" /> }
                ].map((item) => (
                  <button
                    key={item.r}
                    type="button"
                    onClick={() => setRole(item.r as UserRole)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                      role === item.r 
                        ? 'bg-blue-50 border-blue-600 text-blue-700' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.icon}
                    {item.r}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 mt-6"
            >
              <LogIn className="w-4 h-4" />
              Enter Workspace
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 flex justify-center text-xs text-slate-400 text-center">
            Note: Firebase has been removed. All data is saved securely to your browser's local storage for immediate testing.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
