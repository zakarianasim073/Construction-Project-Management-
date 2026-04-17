import React, { useState } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserRole } from '../types';
import { LogIn, UserPlus, ShieldCheck, Construction, Calculator, Briefcase, Mail, Lock, User as UserIcon } from 'lucide-react';

interface AuthProps {
  onUserChange: (user: any | null) => void;
}

const Auth: React.FC<AuthProps> = ({ onUserChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      let user;
      if (isSignUp) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        user = result.user;
        await updateProfile(user, { displayName: name });
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        user = result.user;
      }
      
      // Check if user exists in Firestore
      const userRef = doc(db, 'users', user.uid);
      let userDoc;
      try {
        userDoc = await getDoc(userRef);
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.GET, 'users');
      }
      
      if (userDoc?.exists()) {
        onUserChange(userDoc.data());
      } else {
        // New user or missing profile, show role selection
        setTempUser(user);
        setShowRoleSelection(true);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already in use.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || "Authentication failed. Please check your credentials.");
      }
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
      
      const userRef = doc(db, 'users', tempUser.uid);
      try {
        await setDoc(userRef, userData);
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.CREATE, `users/${tempUser.uid}`);
      }
      
      onUserChange(userData);
      setShowRoleSelection(false);
    } catch (err: any) {
      console.error("Role selection error:", err);
      setError(err.message || "Failed to save user profile. Please check your permissions.");
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
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
              <Construction className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">BuildTrack AI</h1>
            <p className="text-slate-500 text-sm">{isSignUp ? 'Create your account' : 'Welcome back'}</p>
          </div>
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <LogIn className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Full Name</label>
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
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50 mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-blue-300 rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[
                { label: 'Gantt Chart', icon: <ShieldCheck className="w-3 h-3 text-emerald-500" /> },
                { label: 'Analytics', icon: <ShieldCheck className="w-3 h-3 text-emerald-500" /> },
                { label: 'Procurement', icon: <ShieldCheck className="w-3 h-3 text-emerald-500" /> },
                { label: 'Site Logs', icon: <ShieldCheck className="w-3 h-3 text-emerald-500" /> }
              ].map((feature) => (
                <div key={feature.label} className="flex items-center gap-2 text-slate-500">
                  {feature.icon}
                  <span className="text-[10px] font-bold uppercase tracking-wider">{feature.label}</span>
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
