
import React, { useState, useEffect } from 'react';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout';
import ProjectList from './components/ProjectList';
import Auth from './components/Auth';
import { Suspense, lazy } from 'react';

// Lazy load heavy components for better initial load performance
const Dashboard = lazy(() => import('./components/Dashboard'));
const MasterControl = lazy(() => import('./components/MasterControl'));
const SiteExecution = lazy(() => import('./components/SiteExecution'));
const FinancialControl = lazy(() => import('./components/FinancialControl'));
const LiabilityTracker = lazy(() => import('./components/LiabilityTracker'));
const DocumentManager = lazy(() => import('./components/DocumentManager'));
const TaskManager = lazy(() => import('./components/TaskManager'));
const MemberManager = lazy(() => import('./components/MemberManager'));
const GanttChart = lazy(() => import('./components/GanttChart'));
const FinancialAnalytics = lazy(() => import('./components/FinancialAnalytics'));
const Procurement = lazy(() => import('./components/Procurement'));
const SubcontractorPortal = lazy(() => import('./components/SubcontractorPortal'));
const QCSafety = lazy(() => import('./components/QCSafety'));
const Reporting = lazy(() => import('./components/Reporting'));
const PhotoLogs = lazy(() => import('./components/PhotoLogs'));
const EquipmentManager = lazy(() => import('./components/EquipmentManager'));
const AttendanceManager = lazy(() => import('./components/AttendanceManager'));
const ChangeOrderManager = lazy(() => import('./components/ChangeOrderManager'));
const SustainabilityTracker = lazy(() => import('./components/SustainabilityTracker'));
const BimViewer = lazy(() => import('./components/BimViewer'));
const ClientPortal = lazy(() => import('./components/ClientPortal'));
const VendorAnalytics = lazy(() => import('./components/VendorAnalytics'));
const GeminiChat = lazy(() => import('./components/GeminiChat'));
const CommentSection = lazy(() => import('./components/Collaboration').then(m => ({ default: m.CommentSection })));
import { MOCK_PROJECTS } from './constants';
import { ProjectState, ProjectDocument, DPR, UserRole, BOQItem, AiSuggestion, Material, Bill, ExtractedDPR, User, Task } from './types';
import { parseBOQDocument, analyzeDocumentContent, processWhatsAppMessage } from './services/geminiService';
import { MessageSquare, Send, Loader2, Smartphone, AlertCircle, LayoutDashboard, PlusCircle } from 'lucide-react';
import { useLocalCollection } from './hooks/useLocalCollection';

const stripUndefined = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(stripUndefined);
  if (typeof obj === 'object' && obj !== null) {
    const res: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) res[key] = stripUndefined(obj[key]);
    }
    return res;
  }
  return obj;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const { data: projectsData, add: addProject, update: updateProjectStorage } = useLocalCollection<ProjectState>('projects');
  
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeProjectRole, setActiveProjectRole] = useState<UserRole | null>(null);
  const [activeProjectTasks, setActiveProjectTasks] = useState<Task[]>([]);
  const [activeProjectMembers, setActiveProjectMembers] = useState<User[]>([]);
  const [isSimulatingWhatsApp, setIsSimulatingWhatsApp] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Connection Test omitted since Firebase is removed
  // Auth Listener replaced with short initialization
  useEffect(() => {
     setIsAuthReady(true);
  }, []);

  // Sync Projects
  const projects = projectsData;
  useEffect(() => {
    if (projects.length === 0 && user) {
       MOCK_PROJECTS.forEach(p => {
          addProject({ ...p, ownerUid: user.uid } as any);
       });
    }
  }, [user, projects.length, addProject]);

  // Project Role Listener
  useEffect(() => {
    if (user && activeProjectId) {
       // Local mode: give them the role they logged in with for everything
       setActiveProjectRole(user.role);
    }
  }, [user, activeProjectId]);

  // Tasks local fetch
  useEffect(() => {
     const fetchTasks = async () => {
        try {
           const token = localStorage.getItem('auth_token');
           const res = await fetch(`/api/collections/tasks_${activeProjectId}`, {
               headers: token ? { 'Authorization': `Bearer ${token}` } : {}
           });
           if (!res.ok) throw new Error("Tasks fetch failed");
           const data = await res.json();
           setActiveProjectTasks(data || []);
        } catch (e) {
           console.error("Failed to fetch tasks", e);
        }
     };
     if (activeProjectId) {
         fetchTasks();
     }
  }, [activeProjectId]);

  const activeProject = projects.find(p => p.id === activeProjectId);

  const handleLogout = async () => {
    localStorage.removeItem('local_user_uid');
    localStorage.removeItem('auth_token');
    setUser(null);
    setActiveProjectId(null);
  };

  const handleCreateProject = async (newProject: Partial<ProjectState>) => {
    if (!user) return;
    const id = `P${Date.now()}`;
    const project: ProjectState = {
      ...newProject as ProjectState,
      id,
      ownerUid: user.uid,
      memberUids: [user.uid],
      aiSuggestions: [],
      materials: [],
      subContractors: [],
      documents: [],
      dprs: [],
      boq: [],
      bills: [],
      liabilities: [],
      milestones: [],
      purchaseOrders: [],
      qualityChecks: [],
      safetyChecks: [],
      photoLogs: [],
      equipment: [],
      attendance: [],
      changeOrders: [],
      vendors: [],
      weatherForecast: [],
      bimModels: []
    };
    
    addProject(stripUndefined(project));
    setActiveProjectId(id);
  };

  const handleUpdateProject = async (projectId: string, updater: (proj: ProjectState) => ProjectState) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const updated = updater(project);
    updateProjectStorage(projectId, stripUndefined(updated));
  };

  const handleAddDocument = async (newDoc: ProjectDocument) => {
    if (!activeProjectId || !activeProject) return;
    
    // 1. Add Document immediately
    handleUpdateProject(activeProjectId, (project) => ({
      ...project,
      documents: [newDoc, ...project.documents]
    }));

    // 2. Trigger Auto-Analysis based on Doc Type
    try {
      let mimeType = 'application/pdf';
      if (newDoc.type === 'JPG' || newDoc.type === 'PNG') mimeType = 'image/jpeg';

      const suggestions = await analyzeDocumentContent(newDoc.name, newDoc.category, activeProject.boq, newDoc.content, mimeType);
      
      if (suggestions && suggestions.length > 0) {
        handleUpdateProject(activeProjectId, (project) => ({
          ...project,
          documents: project.documents.map(d => d.id === newDoc.id ? { ...d, isAnalyzed: true } : d),
          aiSuggestions: [...suggestions.map(s => ({ ...s, docId: newDoc.id })), ...project.aiSuggestions]
        }));
      }
    } catch (e) {
      console.error("Auto-analysis failed", e);
    }
  };

  const handleAnalyzeDocument = (docId: string, suggestions: AiSuggestion[]) => {
    if (!activeProjectId) return;
    handleUpdateProject(activeProjectId, (project) => ({
      ...project,
      documents: project.documents.map(d => d.id === docId ? { ...d, isAnalyzed: true } : d),
      aiSuggestions: [...suggestions, ...project.aiSuggestions]
    }));
    setActiveTab('dashboard'); // Switch to dashboard to see results
  };

  const handleImportBOQItems = (items: BOQItem[]) => {
     if (!activeProjectId) return;
     handleUpdateProject(activeProjectId, (project) => ({
       ...project,
       boq: [...project.boq, ...items] // Append new items. In real app, this might merge or replace.
     }));
  };

  const handleApplySuggestion = async (suggestionId: string) => {
    if (!activeProjectId || !activeProject) return;
    const suggestion = activeProject.aiSuggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;

    if (suggestion.type === 'BOQ_IMPORT') {
      const relatedDoc = activeProject.documents.find(d => d.id === suggestion.docId);
      if (relatedDoc) {
         let mimeType = 'application/pdf';
         if (relatedDoc.type === 'JPG' || relatedDoc.type === 'PNG') mimeType = 'image/jpeg';
         const items = await parseBOQDocument(relatedDoc.name, relatedDoc.content, mimeType);
         handleImportBOQItems(items);
      }
      handleUpdateProject(activeProjectId, (project) => ({
        ...project,
        aiSuggestions: project.aiSuggestions.map(s => s.id === suggestionId ? { ...s, status: 'APPLIED' as const } : s)
      }));
      return;
    }

    if (suggestion.type === 'DPR_ENTRY' && suggestion.value) {
       const dprData = suggestion.value as ExtractedDPR;
       // Resolve IDs
       let subId = undefined;
       if (dprData.subContractorName) {
         subId = activeProject.subContractors?.find(s => 
           s.name.toLowerCase().includes(dprData.subContractorName!.toLowerCase())
         )?.id;
       }

       let materialsUsed = [];
       if (dprData.materials) {
         materialsUsed = dprData.materials.map(m => {
           const mat = activeProject.materials.find(ex => ex.name.toLowerCase().includes(m.name.toLowerCase()));
           return mat ? { materialId: mat.id, qty: m.qty } : null;
         }).filter(Boolean) as any;
       }

       const newDPR: DPR = {
         id: `DPR-AI-${Date.now()}`,
         date: dprData.date || new Date().toISOString().split('T')[0],
         activity: dprData.activity || 'Reported Activity',
         location: dprData.location || 'Site',
         laborCount: dprData.laborCount || 0,
         remarks: dprData.remarks || '',
         linkedBoqId: dprData.linkedBoqId,
         workDoneQty: dprData.workDoneQty,
         subContractorId: subId,
         materialsUsed: materialsUsed
       };
       handleAddDPR(newDPR);
       
       handleUpdateProject(activeProjectId, (project) => ({
        ...project,
        aiSuggestions: project.aiSuggestions.map(s => s.id === suggestionId ? { ...s, status: 'APPLIED' as const } : s)
      }));
      return;
    }

    handleUpdateProject(activeProjectId, (project) => {
      let updatedProject = { ...project };
      
      // Update data based on suggestion type
      if (suggestion.type === 'QUANTITY_UPDATE' && suggestion.linkedId && suggestion.value) {
        updatedProject.boq = project.boq.map(b => b.id === suggestion.linkedId ? { ...b, executedQty: b.executedQty + suggestion.value } : b);
      } else if (suggestion.type === 'BILL_DETECTION' && suggestion.value) {
        const billVal = suggestion.value as any; // could be object or number
        const amount = typeof billVal === 'object' ? billVal.amount : billVal;
        
        const newBill = {
          id: `BILL-AI-${Date.now()}`,
          type: 'VENDOR_INVOICE' as const,
          entityName: suggestion.title.split('from ')[1] || 'Unknown Vendor',
          amount: Number(amount),
          date: new Date().toISOString().split('T')[0],
          status: 'PENDING' as const
        };
        updatedProject.bills = [newBill, ...project.bills];
      }

      updatedProject.aiSuggestions = project.aiSuggestions.map(s => s.id === suggestionId ? { ...s, status: 'APPLIED' as const } : s);
      return updatedProject;
    });
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    if (!activeProjectId) return;
    handleUpdateProject(activeProjectId, (project) => ({
      ...project,
      aiSuggestions: project.aiSuggestions.map(s => s.id === suggestionId ? { ...s, status: 'DISMISSED' as const } : s)
    }));
  };

  const handleAddDPR = (newDPR: DPR) => {
    if (!activeProjectId) return;
    handleUpdateProject(activeProjectId, (project) => {
      const updatedDPRs = [newDPR, ...project.dprs];
      let updatedBOQ = project.boq;
      let updatedSubContractors = project.subContractors;
      let updatedLiabilities = project.liabilities;
      
      // 1. Update BOQ Executed Qty
      if (newDPR.linkedBoqId && newDPR.workDoneQty) {
        updatedBOQ = project.boq.map(item => {
          if (item.id === newDPR.linkedBoqId) {
            return { ...item, executedQty: item.executedQty + (newDPR.workDoneQty || 0) };
          }
          return item;
        });

        // 2. Automated Sub-contractor Progress Tracking
        if (newDPR.subContractorId && newDPR.workDoneQty) {
          const sub = project.subContractors.find(s => s.id === newDPR.subContractorId);
          if (sub) {
            // Find agreed rate for this BOQ item
            const rateInfo = sub.agreedRates.find(r => r.boqId === newDPR.linkedBoqId);
            const rate = rateInfo ? rateInfo.rate : 0;
            const workValue = newDPR.workDoneQty * rate;

            if (workValue > 0) {
              // Update SC stats
              updatedSubContractors = project.subContractors.map(s => {
                 if (s.id === sub.id) {
                   return {
                     ...s,
                     totalWorkValue: s.totalWorkValue + workValue,
                     currentLiability: s.currentLiability + workValue
                   };
                 }
                 return s;
              });

              // Create Liability Entry automatically
              const newLiability = {
                id: `L-AUTO-${Date.now()}`,
                description: `Unbilled Work: ${sub.name} (${newDPR.date})`,
                type: 'UNBILLED_WORK' as const,
                amount: workValue,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Net 30 default
              };
              updatedLiabilities = [newLiability, ...project.liabilities];
            }
          }
        }
      }

      // 3. Update Material Stock
      let updatedMaterials = project.materials;
      if (newDPR.materialsUsed && newDPR.materialsUsed.length > 0) {
        updatedMaterials = project.materials.map(mat => {
          const used = newDPR.materialsUsed?.find(u => u.materialId === mat.id);
          if (used) {
            return { 
              ...mat, 
              totalConsumed: mat.totalConsumed + used.qty,
              currentStock: mat.currentStock - used.qty
            };
          }
          return mat;
        });
      }

      return { 
        ...project, 
        dprs: updatedDPRs, 
        boq: updatedBOQ, 
        materials: updatedMaterials, 
        subContractors: updatedSubContractors,
        liabilities: updatedLiabilities
      };
    });
  };

  const handleReceiveMaterial = (materialId: string, receivedQty: number, newRate?: number) => {
    if (!activeProjectId) return;
    handleUpdateProject(activeProjectId, (project) => ({
      ...project,
      materials: project.materials.map(mat => {
        if (mat.id === materialId) {
          const newTotalReceived = mat.totalReceived + receivedQty;
          const newStock = mat.currentStock + receivedQty;
          // Weighted Average Rate Calculation
          const oldVal = mat.currentStock * mat.averageRate;
          const newVal = receivedQty * (newRate || mat.averageRate);
          const newAvgRate = (oldVal + newVal) / newStock;

          return {
            ...mat,
            totalReceived: newTotalReceived,
            currentStock: newStock,
            averageRate: newRate ? newAvgRate : mat.averageRate
          };
        }
        return mat;
      })
    }));
  };

  const handleAddBill = (newBill: Bill) => {
    if (!activeProjectId) return;
    handleUpdateProject(activeProjectId, (project) => ({
      ...project,
      bills: [newBill, ...project.bills]
    }));
  };

  const handleBillItemizedUpdate = (items: { boqId: string; amount: number }[]) => {
    if (!activeProjectId) return;
    handleUpdateProject(activeProjectId, (project) => ({
      ...project,
      boq: project.boq.map(b => {
        const update = items.find(i => i.boqId === b.id);
        if (update) {
          return { ...b, billedAmount: (b.billedAmount || 0) + update.amount };
        }
        return b;
      })
    }));
  };

  const handleUpdatePDRemarks = (entityType: 'MATERIAL' | 'BILL' | 'DPR' | 'SUBCONTRACTOR', entityId: string, remarks: string) => {
    if (!activeProjectId) return;
    handleUpdateProject(activeProjectId, (project) => {
      if (entityType === 'MATERIAL') {
        return { ...project, materials: project.materials.map(m => m.id === entityId ? { ...m, pdRemarks: remarks } : m) };
      }
      if (entityType === 'BILL') {
        return { ...project, bills: project.bills.map(b => b.id === entityId ? { ...b, pdRemarks: remarks } : b) };
      }
      if (entityType === 'SUBCONTRACTOR') {
        return { ...project, subContractors: project.subContractors.map(s => s.id === entityId ? { ...s, pdRemarks: remarks } : s) };
      }
      return project;
    });
  };

  const handleAddBOQItem = (newItem: BOQItem) => {
    if (!activeProjectId) return;
    handleUpdateProject(activeProjectId, (project) => ({
      ...project,
      boq: [...project.boq, newItem]
    }));
  };

  const handleUpdateBOQItem = (itemId: string, updatedItem: Partial<BOQItem>) => {
    if (!activeProjectId) return;
    handleUpdateProject(activeProjectId, (project) => ({
      ...project,
      boq: project.boq.map(item => item.id === itemId ? { ...item, ...updatedItem } : item)
    }));
  };

  const handleSimulateWhatsApp = async () => {
    if (!activeProjectId || !activeProject || !whatsappMessage.trim()) return;
    
    setIsSimulatingWhatsApp(true);
    try {
      const extracted = await processWhatsAppMessage(whatsappMessage, activeProject.boq);
      if (extracted) {
        // Create an AI Suggestion based on WhatsApp message
        const newSuggestion: AiSuggestion = {
          id: `WA-SUG-${Date.now()}`,
          docId: 'WHATSAPP',
          type: 'DPR_ENTRY',
          title: 'WhatsApp Progress Update',
          description: `Extracted from message: "${whatsappMessage.substring(0, 50)}..."`,
          value: extracted,
          status: 'PENDING'
        };
        
        handleUpdateProject(activeProjectId, (project) => ({
          ...project,
          aiSuggestions: [newSuggestion, ...project.aiSuggestions]
        }));
        
        setWhatsappMessage('');
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.error("WhatsApp simulation failed", err);
    } finally {
      setIsSimulatingWhatsApp(false);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      </div>
    );
  }

  if (!user) {
    return <Auth onUserChange={setUser} />;
  }

  if (!activeProject) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ProjectList 
          projects={projects} 
          onSelectProject={setActiveProjectId} 
          onCreateProject={handleCreateProject}
          userRole={user.role}
          onSwitchRole={() => {}} // Disabled for real users
        />
      </div>
    );
  }

  const renderContent = () => {
    if (!activeProjectId || !activeProject) {
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-slate-400">
          <div className="p-8 rounded-full mb-6 bg-slate-100">
            <LayoutDashboard className="w-16 h-16 opacity-20" />
          </div>
          <h2 className="text-2xl font-bold text-slate-600 mb-2">No Project Selected</h2>
          <p className="max-w-md text-center mb-8">
            Please select a project from the sidebar to view its dashboard and manage construction activities.
          </p>
          <button 
            onClick={() => setActiveProjectId(null)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95 font-semibold"
          >
            <PlusCircle className="w-5 h-5" />
            Go to Project List
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            data={activeProject} 
            onApplySuggestion={handleApplySuggestion}
            onDismissSuggestion={handleDismissSuggestion}
            onUpdateProject={(updater) => handleUpdateProject(activeProjectId, updater)}
          />
        );
      case 'master':
        return <MasterControl 
                  data={activeProject} 
                  onAddDocument={handleAddDocument} 
                  onAddBOQItem={handleAddBOQItem} 
                  onUpdateBOQItem={handleUpdateBOQItem} 
                  onImportBOQItems={handleImportBOQItems}
                  userRole={activeProjectRole || user.role} 
               />;
      case 'site':
        return <SiteExecution 
                  data={activeProject} 
                  onAddDocument={handleAddDocument} 
                  onAddDPR={handleAddDPR} 
                  onReceiveMaterial={handleReceiveMaterial}
                  onUpdatePDRemarks={handleUpdatePDRemarks}
                  userRole={activeProjectRole || user.role} 
               />;
      case 'finance':
        return <FinancialControl 
                 data={activeProject} 
                 onAddDocument={handleAddDocument} 
                 onUpdateBOQItem={handleUpdateBOQItem} 
                 onAddBill={handleAddBill}
                 onUpdatePDRemarks={handleUpdatePDRemarks}
                 onBillItemizedUpdate={handleBillItemizedUpdate}
                 userRole={activeProjectRole || user.role} 
               />;
      case 'analytics':
        return (
          <div className="space-y-6">
            <FinancialAnalytics boq={activeProject.boq} bills={activeProject.bills} />
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Sustainability & Waste Tracking</h3>
              <SustainabilityTracker metrics={activeProject.sustainabilityMetrics || { carbonFootprint: 0, waterUsage: 0, wasteGenerated: [] }} />
            </div>
          </div>
        );
      case 'procurement':
        return (
          <div className="space-y-6">
            <Procurement materials={activeProject.materials} purchaseOrders={activeProject.purchaseOrders || []} />
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Vendor Performance</h3>
              <VendorAnalytics vendors={activeProject.vendors || []} />
            </div>
          </div>
        );
      case 'equipment':
        return <EquipmentManager equipment={activeProject.equipment || []} />;
      case 'labor':
        return <AttendanceManager attendance={activeProject.attendance || []} />;
      case 'subcontractors':
        return <SubcontractorPortal subContractors={activeProject.subContractors} dprs={activeProject.dprs} />;
      case 'qc-safety':
        return <QCSafety qualityChecks={activeProject.qualityChecks || []} safetyChecks={activeProject.safetyChecks || []} users={activeProjectMembers} />;
      case 'gantt':
        return <GanttChart tasks={activeProjectTasks} />;
      case 'bim':
        return <BimViewer models={activeProject.bimModels || []} />;
      case 'photos':
        return <PhotoLogs photoLogs={activeProject.photoLogs || []} users={activeProjectMembers} />;
      case 'reports':
        return <Reporting project={activeProject} />;
      case 'client':
        return <ClientPortal project={activeProject} />;
      case 'liability':
        return <LiabilityTracker data={activeProject} onAddDocument={handleAddDocument} userRole={activeProjectRole || user.role} />;
      case 'documents':
        return (
          <div className="h-[calc(100vh-8rem)] flex gap-6">
            <div className="flex-1">
              <DocumentManager 
                documents={activeProject.documents} 
                onAddDocument={handleAddDocument} 
                onAnalyzeDocument={handleAnalyzeDocument}
                onSelectDocument={setSelectedDocId}
                boqItems={activeProject.boq}
                allowUpload={(activeProjectRole || user.role) === 'DIRECTOR' || (activeProjectRole || user.role) === 'MANAGER' || (activeProjectRole || user.role) === 'ENGINEER'}
              />
            </div>
            {selectedDocId && (
              <div className="w-80 h-full">
                <CommentSection 
                  projectId={activeProject.id}
                  targetId={selectedDocId}
                  targetType="DOCUMENT"
                  currentUser={user}
                />
              </div>
            )}
          </div>
        );
      case 'tasks':
        return (
          <div className="h-[calc(100vh-8rem)]">
            <TaskManager 
              projectId={activeProject.id}
              currentUser={user}
            />
          </div>
        );
      case 'team':
        return (
          <div className="h-[calc(100vh-8rem)]">
            <MemberManager 
              projectId={activeProject.id}
              ownerUid={activeProject.ownerUid}
              currentUserUid={user.uid || ''}
            />
          </div>
        );
      default:
        return <Dashboard data={activeProject} onApplySuggestion={handleApplySuggestion} onDismissSuggestion={handleDismissSuggestion} onUpdateProject={(updater) => handleUpdateProject(activeProjectId, updater)} />;
    }
  };

  return (
    <NotificationProvider>
      <Layout 
        activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onSwitchProject={() => setActiveProjectId(null)}
      projectName={activeProject.name}
      user={{ ...user, role: activeProjectRole || user.role }}
      onLogout={handleLogout}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64 bg-white/50 rounded-2xl border border-slate-200 border-dashed">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Module...</p>
              </div>
            </div>
          }>
            {renderContent()}
          </Suspense>
        </div>
        
        {/* Collaboration Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          <GeminiChat currentUser={user!} projectContext={activeProject} />
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-slate-800 text-sm">WhatsApp DPR Simulation</h4>
            </div>
            <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
              Paste a message from your site WhatsApp group to automatically extract progress data.
            </p>
            <textarea
              placeholder="e.g. Today we completed 50sqm of brickwork at block A. 5 masons were present."
              value={whatsappMessage}
              onChange={(e) => setWhatsappMessage(e.target.value)}
              className="w-full p-3 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none mb-3"
            />
            <button
              onClick={handleSimulateWhatsApp}
              disabled={isSimulatingWhatsApp || !whatsappMessage.trim()}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              {isSimulatingWhatsApp ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Process Message
            </button>
          </div>
        </div>
      </div>
    </Layout>
    </NotificationProvider>
  );
};

export default App;
