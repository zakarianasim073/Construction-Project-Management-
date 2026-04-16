import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Comment, Notification, User } from '../types';
import { MessageSquare, Bell, Send, X, CheckCircle2, User as UserIcon, Clock, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CollaborationProps {
  projectId: string;
  targetId: string;
  targetType: 'DOCUMENT' | 'TASK';
  currentUser: User;
}

export const CommentSection: React.FC<CollaborationProps> = ({ projectId, targetId, targetType, currentUser }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const path = `projects/${projectId}/comments`;
    const q = query(
      collection(db, path),
      where('targetId', '==', targetId),
      where('targetType', '==', targetType),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Comment[];
      setComments(fetchedComments);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [projectId, targetId, targetType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !auth.currentUser) return;

    setIsLoading(true);
    const path = `projects/${projectId}/comments`;
    try {
      await addDoc(collection(db, path), {
        targetId,
        targetType,
        authorUid: auth.currentUser.uid,
        authorName: currentUser.name,
        text: newComment.trim(),
        createdAt: new Date().toISOString()
      });
      setNewComment('');
      
      // Create notification for other team members (simulated)
      // In a real app, you'd trigger this via Cloud Functions or a separate service
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    const path = `projects/${projectId}/comments/${commentId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-600" />
          <h4 className="font-bold text-slate-800 text-sm">Discussion</h4>
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
          {comments.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                {comment.authorName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-slate-900">{comment.authorName}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {auth.currentUser?.uid === comment.authorUid && (
                      <button 
                        onClick={() => handleDelete(comment.id)}
                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100">
                  <p className="text-sm text-slate-700 leading-relaxed">{comment.text}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50 py-8">
            <MessageSquare className="w-10 h-10 mb-2" />
            <p className="text-xs">No comments yet. Start the conversation!</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-100 bg-white">
        <div className="relative">
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || isLoading}
            className="absolute right-1.5 top-1/2 transform -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:bg-slate-400"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export const NotificationCenter: React.FC<{ uid: string }> = ({ uid }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const path = `users/${uid}/notifications`;
    const q = query(
      collection(db, path),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifs = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Notification[];
      setNotifications(fetchedNotifs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [uid]);

  const markAsRead = async (id: string) => {
    const path = `users/${uid}/notifications/${id}`;
    try {
      await updateDoc(doc(db, path), { isRead: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm">Notifications</h4>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => markAsRead(n.id)}
                    className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-all cursor-pointer flex gap-3 ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      n.type === 'TASK_ASSIGNED' ? 'bg-indigo-100 text-indigo-600' :
                      n.type === 'TASK_COMPLETED' ? 'bg-emerald-100 text-emerald-600' :
                      n.type === 'DOC_UPLOADED' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {n.type === 'TASK_ASSIGNED' ? <UserIcon className="w-4 h-4" /> :
                       n.type === 'TASK_COMPLETED' ? <CheckCircle2 className="w-4 h-4" /> :
                       n.type === 'DOC_UPLOADED' ? <MessageSquare className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-bold ${!n.isRead ? 'text-slate-900' : 'text-slate-600'}`}>{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <Bell className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-xs">All caught up!</p>
                </div>
              )}
            </div>
            <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
              <button className="text-[10px] font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">
                View All Activity
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
