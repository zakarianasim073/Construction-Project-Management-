import React, { useState, useEffect } from 'react';
import { Task, User } from '../types';
import { 
  Plus, 
  Search, 
  Calendar, 
  User as UserIcon, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Trash2,
  CheckCircle,
  MessageSquare,
  X
} from 'lucide-react';
import { CommentSection } from './Collaboration';
import { useLocalCollection } from '../hooks/useLocalCollection';

interface TaskManagerProps {
  projectId: string;
  currentUser: User;
}

const TaskManager: React.FC<TaskManagerProps> = ({ projectId, currentUser }) => {
  const { data: tasks, add: addTask, update: updateTask, remove: removeTask } = useLocalCollection<Task & { id: string }>(`tasks_${projectId}`);
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH'
  });

  useEffect(() => {
    // In local mode, fetch from generic API
    fetch('/api/collections/users')
      .then(res => res.json())
      .then(data => setUsers(data && data.length > 0 ? data : [currentUser]))
      .catch(e => {
        console.error(e);
        setUsers([currentUser]);
      });
  }, [currentUser]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const taskId = `TASK-${Date.now()}`;
    const taskData: Task & { id: string } = {
      id: taskId,
      ...newTask,
      projectId,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    
    await addTask(taskData);

    // Create a local notification via API
    if (newTask.assignedTo) {
      await fetch(`/api/collections/notifications_${newTask.assignedTo}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `NOTIF-${Date.now()}`,
          recipientUid: newTask.assignedTo,
          type: 'TASK_ASSIGNED',
          title: 'New Task Assigned',
          message: `You have been assigned a new task: ${newTask.title}`,
          targetId: taskId,
          isRead: false,
          createdAt: new Date().toISOString()
        })
      });
    }

    setIsModalOpen(false);
    setNewTask({
      title: '',
      description: '',
      assignedTo: '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'MEDIUM'
    });
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    updateTask(taskId, { status: newStatus as any });
  };

  const handleDeleteTask = async (taskId: string) => {
    removeTask(taskId);
    if (selectedTaskId === taskId) setSelectedTaskId(null);
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-100';
      case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'LOW': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'COMPLETED': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'IN_PROGRESS': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex h-full gap-6">
      <div className="flex-1 flex flex-col gap-6">
        {/* Header & Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>

        {/* Task List */}
        <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-2">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div 
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className={`bg-white p-4 rounded-xl border transition-all cursor-pointer group ${
                  selectedTaskId === task.id ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(task.id, task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED');
                      }}
                      className="transition-transform hover:scale-110"
                    >
                      {task.status === 'COMPLETED' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-blue-400" />
                      )}
                    </button>
                    <div>
                      <h5 className={`font-bold text-slate-800 ${task.status === 'COMPLETED' ? 'line-through text-slate-400' : ''}`}>
                        {task.title}
                      </h5>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task.id);
                    }}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 mb-4 pl-8">
                  {task.description}
                </p>
                <div className="flex items-center justify-between pl-8">
                  <div className="flex items-center gap-2">
                    {task.assignedTo ? (
                      <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg">
                        <UserIcon className="w-3 h-3 text-slate-500" />
                        <span className="text-[10px] font-bold text-slate-700">
                          {users.find(u => u.uid === task.assignedTo)?.name || 'Assigned'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400 italic">Unassigned</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                      <MessageSquare className="w-3 h-3" />
                      Comments
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center">
              <CheckCircle2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No tasks found matching your criteria.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-blue-600 text-sm font-bold mt-2 hover:underline"
              >
                Create your first task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task Details / Comments Sidebar */}
      {selectedTaskId && (
        <div className="w-80 h-full flex flex-col animate-in slide-in-from-right duration-300">
          <CommentSection 
            projectId={projectId}
            targetId={selectedTaskId}
            targetType="TASK"
            currentUser={currentUser}
          />
        </div>
      )}

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Create New Task</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Task Title</label>
                <input
                  required
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                  placeholder="e.g. Complete foundation concrete"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all h-24 resize-none"
                  placeholder="Add more details about the task..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Assign To</label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                  >
                    <option value="">Select Member</option>
                    {users.map(u => (
                      <option key={u.uid} value={u.uid}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Priority</label>
                <div className="flex gap-2">
                  {(['LOW', 'MEDIUM', 'HIGH'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTask({ ...newTask, priority: p })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        newTask.priority === p 
                          ? getPriorityColor(p) + ' ring-2 ring-offset-1 ring-blue-500'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;
