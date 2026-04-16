import React, { useState } from 'react';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserRole } from '../types';
import { LogIn, LogOut, User as UserIcon, ShieldCheck, Construction, Calculator, Briefcase } from 'lucide-react';

interface AuthProps {
  onUserChange: (user: any | null) => void;
}

const Auth: React.FC<AuthProps> = ({ onUserChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        onUserChange(userDoc.data());
      } else {
        // New user, show role selection
        setTempUser(user);
        setShowRoleSelection(true);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = async (role: UserRole) => {
    if (!tempUser) return;
    
    setIsLoading(true);
    try {
      const userData = {
        uid: tempUser.uid,
        name: tempUser.displayName || "Anonymous",
        email: tempUser.email || "",
        role: role,
        avatar: tempUser.photoURL || "",
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', tempUser.uid), userData);
      onUserChange(userData);
      setShowRoleSelection(false);
    } catch (err: any) {
      console.error("Role selection error:", err);
      setError(err.message || "Failed to save user profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (showRoleSelection) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Select Your Role</h2>
            <p className="text-slate-500 mb-8">Choose your primary responsibility in the project.</p>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                { role: 'DIRECTOR', icon: <ShieldCheck className="w-5 h-5" />, desc: 'Full control and oversight' },
                { role: 'MANAGER', icon: <Briefcase className="w-5 h-5" />, desc: 'Project planning and execution' },
                { role: 'ENGINEER', icon: <Construction className="w-5 h-5" />, desc: 'Site operations and DPRs' },
                { role: 'ACCOUNTANT', icon: <Calculator className="w-5 h-5" />, desc: 'Financial tracking and bills' }
              ].map((item) => (
                <button
                  key={item.role}
                  onClick={() => handleRoleSelect(item.role as UserRole)}
                  disabled={isLoading}
                  className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="p-2 bg-slate-100 text-slate-600 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{item.role}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
            <Construction className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 leading-tight">Construction project management - AI</h1>
          <p className="text-slate-500 mb-8">Construction Project Management Reimagined</p>
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              ) : (
                <>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                  Sign in with Google
                </>
              )}
            </button>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-blue-300 rounded-full animate-spin" />
              ) : (
                <>
                  <UserIcon className="w-5 h-5" />
                  Sign up with Google
                </>
              )}
            </button>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-100">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-4">New Features Integrated</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-left">
              {[
                'Gantt Chart & Timeline',
                'Budget vs Actual Analytics',
                'Procurement Workflow',
                'Sub-contractor Portal',
                'Digital QC & Safety',
                'Automated Reporting',
                'Low-Stock Alerts',
                'Site Photo Logs'
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-slate-600">
                  <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="text-[11px] font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
