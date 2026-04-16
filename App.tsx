
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MasterControl from './components/MasterControl';
import SiteExecution from './components/SiteExecution';
import FinancialControl from './components/FinancialControl';
import LiabilityTracker from './components/LiabilityTracker';
import DocumentManager from './components/DocumentManager';
import ProjectList from './components/ProjectList';
import Auth from './components/Auth';
import TaskManager from './components/TaskManager';
import MemberManager from './components/MemberManager';
import GanttChart from './components/GanttChart';
import FinancialAnalytics from './components/FinancialAnalytics';
import Procurement from './components/Procurement';
import SubcontractorPortal from './components/SubcontractorPortal';
import QCSafety from './components/QCSafety';
import Reporting from './components/Reporting';
import PhotoLogs from './components/PhotoLogs';
import EquipmentManager from './components/EquipmentManager';
import AttendanceManager from './components/AttendanceManager';
import ChangeOrderManager from './components/ChangeOrderManager';
import SustainabilityTracker from './components/SustainabilityTracker';
import BimViewer from './components/BimViewer';
import ClientPortal from './components/ClientPortal';
import VendorAnalytics from './components/VendorAnalytics';
import { CommentSection } from './components/Collaboration';
import { MOCK_PROJECTS } from './constants';
import { ProjectState, ProjectDocument, DPR, UserRole, BOQItem, AiSuggestion, Material, Bill, ExtractedDPR, User, Task } from './types';
import { parseBOQDocument, analyzeDocumentContent, processWhatsAppMessage } from './services/geminiService';
import { auth, db, handleFirestoreError, OperationType, stripUndefined } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, addDoc, doc, setDoc, updateDoc, deleteDoc, orderBy, where, getDocFromServer } from 'firebase/firestore';
import { MessageSquare, Send, Loader2, Smartphone, AlertCircle, LayoutDashboard, PlusCircle } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState<ProjectState[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeProjectRole, setActiveProjectRole] = useState<UserRole | null>(null);
  const [activeProjectTasks, setActiveProjectTasks] = useState<Task[]>([]);
  const [activeProjectMembers, setActiveProjectMembers] = useState<User[]>([]);
  const [isSimulatingWhatsApp, setIsSimulatingWhatsApp] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Connection Test
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, '_connection_test_', 'ping'));
      } catch (error: any) {
        if (error.message?.includes('the client is offline')) {
          setConnectionError("Firebase connection failed. Please check your project configuration.");
        }
      }
    };
    testConnection();
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is logged in, fetch profile from Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser(docSnap.data() as User);
          }
          setIsAuthReady(true);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          setIsAuthReady(true);
        });
      } else {
        setUser(null);
        setIsAuthReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // Projects Listener
  useEffect(() => {
    if (!user || !user.uid) return;
    const q = query(
      collection(db, 'projects'), 
      where('memberUids', 'array-contains', user.uid),
      orderBy('name')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProjects = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        aiSuggestions: doc.data().aiSuggestions || [],
        documents: doc.data().documents || [],
        dprs: doc.data().dprs || [],
        boq: doc.data().boq || [],
        materials: doc.data().materials || [],
        bills: doc.data().bills || [],
        liabilities: doc.data().liabilities || [],
        milestones: doc.data().milestones || [],
        subContractors: doc.data().subContractors || [],
        purchaseOrders: doc.data().purchaseOrders || [],
        qualityChecks: doc.data().qualityChecks || [],
        safetyChecks: doc.data().safetyChecks || [],
        photoLogs: doc.data().photoLogs || [],
        equipment: doc.data().equipment || [],
        attendance: doc.data().attendance || [],
        changeOrders: doc.data().changeOrders || [],
        vendors: doc.data().vendors || [],
        riskAssessment: doc.data().riskAssessment || null,
        weatherForecast: doc.data().weatherForecast || [],
        sustainabilityMetrics: doc.data().sustainabilityMetrics || null,
        bimModels: doc.data().bimModels || []
      })) as ProjectState[];
      
      if (fetchedProjects.length === 0 && projects.length === 0) {
        // Seed with mock data if empty
        MOCK_PROJECTS.forEach(async (p) => {
          const projectData = stripUndefined({ ...p, ownerUid: user.uid });
          await setDoc(doc(db, 'projects', p.id), projectData);
        });
      } else {
        setProjects(fetchedProjects);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });
    return () => unsubscribe();
  }, [user]);

  // Project Role Listener
  useEffect(() => {
    if (!user || !activeProjectId) {
      setActiveProjectRole(null);
      return;
    }
    
    const memberRef = doc(db, 'projects', activeProjectId, 'members', user.uid || '');
    const unsubscribe = onSnapshot(memberRef, (docSnap) => {
      if (docSnap.exists()) {
        setActiveProjectRole(docSnap.data().role as UserRole);
      } else {
        // Fallback to global role if member record doesn't exist yet (shouldn't happen for owner)
        setActiveProjectRole(user.role);
      }
    });
    
    return () => unsubscribe();
  }, [user, activeProjectId]);

  // Active Project Tasks Listener
  useEffect(() => {
    if (!activeProjectId) {
      setActiveProjectTasks([]);
      return;
    }
    const q = query(collection(db, `projects/${activeProjectId}/tasks`), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Task[];
      setActiveProjectTasks(fetchedTasks);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `projects/${activeProjectId}/tasks`);
    });
    return () => unsubscribe();
  }, [activeProjectId]);

  // Active Project Members Listener
  useEffect(() => {
    if (!activeProjectId) {
      setActiveProjectMembers([]);
      return;
    }
    const q = collection(db, `projects/${activeProjectId}/members`);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const members = snapshot.docs.map(doc => ({
        uid: doc.id,
        name: doc.data().name,
        role: doc.data().role,
        avatar: doc.data().avatar,
        email: doc.data().email
      })) as User[];
      setActiveProjectMembers(members);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `projects/${activeProjectId}/members`);
    });
    return () => unsubscribe();
  }, [activeProjectId]);

  const activeProject = projects.find(p => p.id === activeProjectId);

  const handleLogout = async () => {
    await signOut(auth);
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
    
    try {
      await setDoc(doc(db, 'projects', id), stripUndefined(project));
      
      // Also create the member record for the owner
      await setDoc(doc(db, 'projects', id, 'members', user.uid), {
        uid: user.uid,
        name: user.name,
        role: user.role,
        avatar: user.avatar || null,
        joinedAt: new Date().toISOString()
      });

      setActiveProjectId(id);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `projects/${id}`);
    }
  };

  const handleUpdateProject = async (projectId: string, updater: (proj: ProjectState) => ProjectState) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const updated = updater(project);
    const finalData = stripUndefined(updated);

    try {
      await updateDoc(doc(db, 'projects', projectId), finalData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${projectId}`);
    }
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
        {connectionError && (
          <div className="max-w-md p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{connectionError}</p>
          </div>
        )}
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
        return <Dashboard data={activeProject} onApplySuggestion={handleApplySuggestion} onDismissSuggestion={handleDismissSuggestion} />;
    }
  };

  return (
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
          {renderContent()}
        </div>
        
        {/* Collaboration Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
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
  );
};

export default App;
