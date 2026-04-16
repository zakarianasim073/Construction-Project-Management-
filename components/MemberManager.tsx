import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  addDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { ProjectMember, User, UserRole } from '../types';
import { 
  UserPlus, 
  Shield, 
  Trash2, 
  Search, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  User as UserIcon,
  Crown
} from 'lucide-react';

interface MemberManagerProps {
  projectId: string;
  ownerUid: string;
  currentUserUid: string;
}

const MemberManager: React.FC<MemberManagerProps> = ({ projectId, ownerUid, currentUserUid }) => {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const isOwner = currentUserUid === ownerUid;

  useEffect(() => {
    const path = `projects/${projectId}/members`;
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const fetchedMembers = snapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id
      })) as ProjectMember[];
      setMembers(fetchedMembers);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [projectId]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const q = query(collection(db, 'users'), where('email', '==', searchEmail.trim()));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setSearchError('No user found with this email address.');
      } else {
        const userData = snapshot.docs[0].data() as User;
        // Check if already a member
        if (members.some(m => m.uid === userData.uid)) {
          setSearchError('This user is already a member of the project.');
        } else {
          setSearchResult({ ...userData, uid: snapshot.docs[0].id });
        }
      }
    } catch (error) {
      console.error("Search failed", error);
      setSearchError('An error occurred while searching.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = async (user: User) => {
    if (!user.uid) return;
    setIsAdding(true);
    
    try {
      // 1. Add to members subcollection
      const memberData: ProjectMember = {
        uid: user.uid,
        name: user.name,
        role: user.role,
        avatar: user.avatar || null,
        joinedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, `projects/${projectId}/members`, user.uid), memberData);
      
      // 2. Add to project's memberUids array
      await updateDoc(doc(db, 'projects', projectId), {
        memberUids: arrayUnion(user.uid)
      });

      // 3. Send notification
      await addDoc(collection(db, `users/${user.uid}/notifications`), {
        type: 'TASK_ASSIGNED', // Reusing type for now or could add PROJECT_INVITE
        title: 'Added to Project',
        message: `You have been added to the project.`,
        targetId: projectId,
        isRead: false,
        createdAt: new Date().toISOString()
      });

      setSearchResult(null);
      setSearchEmail('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `projects/${projectId}/members/${user.uid}`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateRole = async (memberUid: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, `projects/${projectId}/members`, memberUid), {
        role: newRole
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${projectId}/members/${memberUid}`);
    }
  };

  const handleRemoveMember = async (memberUid: string) => {
    if (memberUid === ownerUid) return; // Cannot remove owner
    
    if (!window.confirm('Are you sure you want to remove this member from the project?')) return;

    try {
      // 1. Remove from subcollection
      await deleteDoc(doc(db, `projects/${projectId}/members`, memberUid));
      
      // 2. Remove from memberUids array
      await updateDoc(doc(db, 'projects', projectId), {
        memberUids: arrayRemove(memberUid)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `projects/${projectId}/members/${memberUid}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Member Section */}
      {isOwner && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Add Team Member
          </h3>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="Enter user email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchEmail.trim()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </form>

          {searchError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm">
              <XCircle className="w-4 h-4" />
              {searchError}
            </div>
          )}

          {searchResult && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                {searchResult.avatar ? (
                  <img src={searchResult.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-white" />
                ) : (
                  <div className="w-10 h-10 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold">
                    {searchResult.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-slate-800">{searchResult.name}</p>
                  <p className="text-xs text-slate-500">{searchResult.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleAddMember(searchResult)}
                disabled={isAdding}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                {isAdding ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
                Add to Project
              </button>
            </div>
          )}
        </div>
      )}

      {/* Members List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Project Team
          </h3>
          <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
            {members.length} Members
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {members.map((member) => (
            <div key={member.uid} className="p-6 flex items-center justify-between group hover:bg-slate-50 transition-all">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {member.avatar ? (
                    <img src={member.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                  ) : (
                    <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-lg">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  {member.uid === ownerUid && (
                    <div className="absolute -top-1 -right-1 bg-amber-400 text-white p-1 rounded-full border-2 border-white shadow-sm">
                      <Crown className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800">{member.name}</p>
                    {member.uid === currentUserUid && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">You</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  {isOwner && member.uid !== ownerUid ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleUpdateRole(member.uid, e.target.value as UserRole)}
                      className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border-none outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="DIRECTOR">Project Director</option>
                      <option value="MANAGER">Project Manager</option>
                      <option value="ENGINEER">Site Engineer</option>
                      <option value="ACCOUNTANT">Accountant</option>
                    </select>
                  ) : (
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                      {member.role}
                    </span>
                  )}
                </div>

                {isOwner && member.uid !== ownerUid && (
                  <button
                    onClick={() => handleRemoveMember(member.uid)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Remove Member"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberManager;
