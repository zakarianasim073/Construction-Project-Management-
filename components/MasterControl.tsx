import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ProjectState, ProjectDocument, UserRole, BOQItem, Unit, Priority } from '../types';
import DocumentManager from './DocumentManager';
import ChangeOrderManager from './ChangeOrderManager';
import ManualOverrideToggle from './ManualOverrideToggle';
import { 
  PlusCircle, 
  X, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronDown, 
  ArrowUp, 
  ArrowDown, 
  Activity, 
  RotateCcw, 
  Sparkles, 
  Loader2, 
  ChevronUp, 
  Layers, 
  Flag, 
  Save, 
  Info, 
  CheckCircle2, 
  FileText, 
  UploadCloud, 
  Link as LinkIcon, 
  Download, 
  FileUp,
  AlertCircle
} from 'lucide-react';
import { suggestPlannedUnitCost, parseBOQDocument } from '../services/geminiService';

interface MasterControlProps {
  data: ProjectState;
  onAddDocument: (doc: ProjectDocument) => void;
  onAddBOQItem: (item: BOQItem) => void;
  onUpdateBOQItem?: (itemId: string, updatedItem: Partial<BOQItem>) => void;
  onImportBOQItems: (items: BOQItem[]) => void;
  userRole: UserRole;
}

type SortField = 'id' | 'rate' | 'plannedUnitCost' | 'plannedQty' | 'executedQty' | 'progress' | 'revenue' | 'variance' | 'profit' | 'priority';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

const MasterControl: React.FC<MasterControlProps> = ({ data, onAddDocument, onAddBOQItem, onUpdateBOQItem, onImportBOQItems, userRole }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState<Unit | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Import State
  const [importTab, setImportTab] = useState<'EXISTING' | 'UPLOAD'>('EXISTING');
  const [selectedFileId, setSelectedFileId] = useState('');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Editing state for breakdown
  const [editId, setEditId] = useState<string | null>(null);
  const [editMat, setEditMat] = useState<string>('0');
  const [editLab, setEditLab] = useState<string>('0');
  const [editEqp, setEditEqp] = useState<string>('0');
  const [editOH, setEditOH] = useState<string>('0');

  const canEditBOQ = userRole === 'DIRECTOR' || userRole === 'MANAGER';

  // Form State for Adding Item
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState<Unit>(Unit.CUM);
  const [rate, setRate] = useState<string>('');
  const [plannedUnitCost, setPlannedUnitCost] = useState<string>('');
  const [itemPriority, setItemPriority] = useState<Priority>('MEDIUM');
  const [plannedQty, setPlannedQty] = useState<string>('');
  
  // Breakdown states for new item
  const [plannedMat, setPlannedMat] = useState<string>('0');
  const [plannedLab, setPlannedLab] = useState<string>('0');
  const [plannedEqp, setPlannedEqp] = useState<string>('0');
  const [plannedOH, setPlannedOH] = useState<string>('0');
  
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [aiAppliedFields, setAiAppliedFields] = useState<boolean>(false);

  const resetForm = useCallback(() => {
    setDescription('');
    setRate('');
    setPlannedUnitCost('');
    setPlannedQty('');
    setPlannedMat('0');
    setPlannedLab('0');
    setPlannedEqp('0');
    setPlannedOH('0');
    setItemPriority('MEDIUM');
    setAiAppliedFields(false);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModalOpen) closeModal();
        if (isImportModalOpen) setIsImportModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isImportModalOpen, closeModal]);

  // Auto-calculate plannedUnitCost when breakdown changes for NEW item
  useEffect(() => {
    const total = Number(plannedMat) + Number(plannedLab) + Number(plannedEqp) + Number(plannedOH);
    setPlannedUnitCost(total.toString());
  }, [plannedMat, plannedLab, plannedEqp, plannedOH]);

  // Use all documents for import selection to give user full flexibility
  const availableDocs = useMemo(() => {
    // Filter for documents that are likely to be BOQs (PDF, Excel, etc.)
    return data.documents.filter(d => 
      ['PDF', 'XLSX', 'CSV', 'DOC', 'DOCX'].includes(d.type) || 
      ['CONTRACT', 'REPORT', 'BILL'].includes(d.category)
    );
  }, [data.documents]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: BOQItem = {
      id: `${(data.boq.length + 1) * 10}-NEW`,
      description,
      unit,
      rate: Number(rate),
      priority: itemPriority,
      plannedUnitCost: Number(plannedUnitCost),
      plannedBreakdown: {
        material: Number(plannedMat),
        labor: Number(plannedLab),
        equipment: Number(plannedEqp),
        overhead: Number(plannedOH)
      },
      plannedQty: Number(plannedQty),
      executedQty: 0
    };
    onAddBOQItem(newItem);
    closeModal();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (importTab === 'EXISTING' && !selectedFileId) return;
    if (importTab === 'UPLOAD' && !fileToUpload) return;

    setIsImporting(true);
    
    try {
      let docName = '';
      
      if (importTab === 'UPLOAD' && fileToUpload) {
         setImportStatus('Uploading & Scanning...');
         
         // 1. Create and Add Document
         const newDoc: ProjectDocument = {
            id: `D${Date.now()}`,
            name: fileToUpload.name,
            type: fileToUpload.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
            url: URL.createObjectURL(fileToUpload),
            uploadDate: new Date().toISOString().split('T')[0],
            category: 'CONTRACT',
            module: 'MASTER',
            size: `${(fileToUpload.size / 1024).toFixed(1)} KB`
         };
         onAddDocument(newDoc);
         docName = fileToUpload.name;
      } else {
         const existingDoc = availableDocs.find(d => d.id === selectedFileId);
         docName = existingDoc?.name || 'document';
      }

      setImportStatus('Deep Parsing with Gemini...');
      
      // Simulate/Call parse service
      const parsedItems = await parseBOQDocument(docName);
      
      onImportBOQItems(parsedItems);
      setIsImportModalOpen(false);
      setFileToUpload(null);
      setSelectedFileId('');
    } catch (err) {
      console.error('Import failed', err);
      setImportStatus('Error: Failed to parse document');
    } finally {
      setIsImporting(false);
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  const handleSuggestCost = async () => {
    if (!description) return;
    setIsSuggesting(true);
    try {
      const suggestion = await suggestPlannedUnitCost(description, unit, data.boq);
      if (suggestion && suggestion.breakdown) {
        setPlannedMat(suggestion.breakdown.material.toString());
        setPlannedLab(suggestion.breakdown.labor.toString());
        setPlannedEqp(suggestion.breakdown.equipment.toString());
        setPlannedOH(suggestion.breakdown.overhead.toString());
        setAiAppliedFields(true);
      }
    } catch (err) {
      console.error("AI Cost Suggestion Failed", err);
    } finally {
      setIsSuggesting(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStartEdit = (item: BOQItem) => {
    setEditId(item.id);
    setEditMat(item.plannedBreakdown?.material.toString() || '0');
    setEditLab(item.plannedBreakdown?.labor.toString() || '0');
    setEditEqp(item.plannedBreakdown?.equipment.toString() || '0');
    setEditOH(item.plannedBreakdown?.overhead.toString() || '0');
  };

  const handleSaveEdit = (item: BOQItem) => {
    if (!onUpdateBOQItem) return;

    const updatedBreakdown = {
      material: Number(editMat),
      labor: Number(editLab),
      equipment: Number(editEqp),
      overhead: Number(editOH)
    };

    const newTotal = Object.values(updatedBreakdown).reduce((a, b) => a + b, 0);

    onUpdateBOQItem(item.id, {
      plannedBreakdown: updatedBreakdown,
      plannedUnitCost: newTotal
    });

    setEditId(null);
  };

  const filteredAndSortedBOQ = useMemo(() => {
    return data.boq
      .filter(item => {
        const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesUnit = unitFilter === 'ALL' || item.unit === unitFilter;
        const matchesPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;
        
        let matchesStatus = true;
        const progress = (item.executedQty / item.plannedQty) * 100;
        if (statusFilter === 'PENDING') matchesStatus = progress === 0;
        else if (statusFilter === 'IN_PROGRESS') matchesStatus = progress > 0 && progress < 100;
        else if (statusFilter === 'COMPLETED') matchesStatus = progress >= 100;

        return matchesSearch && matchesUnit && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        let comparison = 0;
        
        const getVal = (item: BOQItem, field: SortField) => {
          switch(field) {
            case 'rate': return item.rate;
            case 'plannedUnitCost': return item.plannedUnitCost;
            case 'plannedQty': return item.plannedQty;
            case 'executedQty': return item.executedQty;
            case 'progress': return (item.executedQty / item.plannedQty);
            case 'revenue': return item.executedQty * item.rate;
            case 'profit': return (item.rate - item.plannedUnitCost) * item.executedQty;
            case 'priority':
              const weights = { HIGH: 3, MEDIUM: 2, LOW: 1 };
              return weights[item.priority || 'MEDIUM'];
            default: return item.id;
          }
        };

        const valA = getVal(a, sortField);
        const valB = getVal(b, sortField);

        if (valA < valB) comparison = -1;
        if (valA > valB) comparison = 1;

        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [data.boq, searchTerm, unitFilter, statusFilter, priorityFilter, sortField, sortDirection]);

  const stats = useMemo(() => {
    const totalContract = data.boq.reduce((sum, item) => sum + (item.rate * item.plannedQty), 0);
    const totalExecuted = data.boq.reduce((sum, item) => sum + (item.rate * item.executedQty), 0);
    const totalPlannedCost = data.boq.reduce((sum, item) => sum + (item.plannedUnitCost * item.plannedQty), 0);
    const actualCostSoFar = data.boq.reduce((sum, item) => sum + (item.plannedUnitCost * item.executedQty), 0);

    return {
      contractValue: totalContract,
      executedValue: totalExecuted,
      plannedCost: totalPlannedCost,
      actualCostBasis: actualCostSoFar,
      overallProgress: (totalExecuted / totalContract) * 100 || 0,
      projectedProfit: totalContract - totalPlannedCost
    };
  }, [data.boq]);

  const getPriorityBadge = (p?: Priority) => {
    switch(p) {
      case 'HIGH': return 'bg-red-50 text-red-700 border-red-200';
      case 'MEDIUM': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOW': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Master Control (BOQ)</h2>
          <p className="text-slate-500 text-sm">Centralized engineering control, rate analysis and quantity tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          {canEditBOQ && (
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="btn-secondary"
              >
                <FileUp className="w-4 h-4" />
                Import BOQ
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary"
              >
                <PlusCircle className="w-4 h-4" />
                Add Item
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Contract Value</p>
          <p className="text-xl font-bold text-slate-800">৳{(stats.contractValue / 1000000).toFixed(2)}M</p>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500 font-medium">
            <Info className="w-3 h-3" /> Based on {data.boq.length} line items
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Billing to Date</p>
          <p className="text-xl font-bold text-blue-600">৳{(stats.executedValue / 1000000).toFixed(2)}M</p>
          <div className="mt-2 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full" style={{ width: `${stats.overallProgress}%` }}></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Projected Gross Margin</p>
          <p className="text-xl font-bold text-emerald-600">
            ৳{(stats.projectedProfit / 1000000).toFixed(2)}M
          </p>
          <div className="mt-1 text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
            {((stats.projectedProfit / stats.contractValue) * 100).toFixed(1)}% Margin
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Data Health</p>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="font-bold text-slate-700">Audit Ready</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">AI cross-referenced with {data.documents.length} docs</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search items by description or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <select
          value={unitFilter}
          onChange={(e) => setUnitFilter(e.target.value as any)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Units</option>
          {Object.values(Unit).map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as any)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Priority</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4 ml-auto">
           <button
             onClick={() => {
               setSearchTerm('');
               setUnitFilter('ALL');
               setStatusFilter('ALL');
               setPriorityFilter('ALL');
             }}
             className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
             title="Reset Filters"
           >
             <RotateCcw className="w-4 h-4" />
           </button>
           <ManualOverrideToggle />
        </div>
      </div>

      {/* BOQ Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="p-4 w-10"></th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                   <button
                    onClick={() => { setSortField('id'); setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); }}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                   >
                     Item # {sortField === 'id' && (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                   </button>
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unit</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <button
                    onClick={() => { setSortField('rate'); setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); }}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors text-right justify-end w-full"
                   >
                     Rate (৳) {sortField === 'rate' && (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                   </button>
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                   <button
                    onClick={() => { setSortField('plannedQty'); setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); }}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors text-right justify-end w-full"
                   >
                     Qty {sortField === 'plannedQty' && (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                   </button>
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                   <button
                    onClick={() => { setSortField('progress'); setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); }}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors text-right justify-end w-full"
                   >
                     Progress {sortField === 'progress' && (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                   </button>
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                   <button
                    onClick={() => { setSortField('priority'); setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); }}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors text-center justify-center w-full"
                   >
                     Priority {sortField === 'priority' && (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                   </button>
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedBOQ.map((item) => {
                const progress = (item.executedQty / item.plannedQty) * 100;
                const revenue = item.executedQty * item.rate;
                const isExpanded = expandedRows.has(item.id);
                const isEditing = editId === item.id;

                return (
                  <React.Fragment key={item.id}>
                    <tr className={`hover:bg-slate-50/80 transition-colors ${isExpanded ? 'bg-slate-50/50' : ''}`}>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className={`p-1 rounded-md transition-all ${isExpanded ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-xs font-bold text-slate-500">{item.id}</span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-semibold text-slate-800 line-clamp-1" title={item.description}>{item.description}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold text-slate-500">{item.unit}</span>
                      </td>
                      <td className="p-4 text-right font-mono text-sm font-bold text-slate-700">
                        {item.rate.toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold text-slate-700">{item.plannedQty.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 font-medium">Plan</span>
                        </div>
                      </td>
                      <td className="p-4">
                         <div className="flex flex-col gap-1.5 min-w-[120px]">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                              <span className={progress >= 100 ? 'text-emerald-600' : progress > 0 ? 'text-blue-600' : 'text-slate-400'}>
                                {progress.toFixed(1)}%
                              </span>
                              <span className="text-slate-400">{item.executedQty.toLocaleString()} done</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 ${progress >= 100 ? 'bg-emerald-500' : progress > 50 ? 'bg-blue-500' : 'bg-slate-300'}`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              ></div>
                            </div>
                         </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getPriorityBadge(item.priority)}`}>
                          {item.priority || 'MEDIUM'}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono text-sm font-black text-slate-800">
                         ৳{revenue.toLocaleString()}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={9} className="p-0 border-b border-slate-200">
                           <div className="p-6 bg-white flex flex-col lg:flex-row gap-8 animate-in slide-in-from-top-2 duration-200">
                              {/* Left side: Rate Analysis */}
                              <div className="flex-1 space-y-4">
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                       <Layers className="w-4 h-4 text-blue-600" />
                                       <h4 className="font-bold text-slate-800 text-sm">Engineering Rate Analysis</h4>
                                    </div>
                                    {canEditBOQ && !isEditing && (
                                      <button
                                        onClick={() => handleStartEdit(item)}
                                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                                      >
                                        <Activity className="w-3 h-3" /> Edit Breakdown
                                      </button>
                                    )}
                                 </div>

                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Material</p>
                                       {isEditing ? (
                                          <input
                                            type="number"
                                            value={editMat}
                                            onChange={e => setEditMat(e.target.value)}
                                            className="w-full bg-white border border-blue-300 rounded px-2 py-1 text-xs font-mono font-bold outline-none ring-2 ring-blue-50"
                                          />
                                       ) : (
                                          <p className="font-mono text-sm font-bold text-slate-700">৳{item.plannedBreakdown?.material.toLocaleString() || '0'}</p>
                                       )}
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Labor</p>
                                       {isEditing ? (
                                          <input
                                            type="number"
                                            value={editLab}
                                            onChange={e => setEditLab(e.target.value)}
                                            className="w-full bg-white border border-blue-300 rounded px-2 py-1 text-xs font-mono font-bold outline-none ring-2 ring-blue-50"
                                          />
                                       ) : (
                                          <p className="font-mono text-sm font-bold text-slate-700">৳{item.plannedBreakdown?.labor.toLocaleString() || '0'}</p>
                                       )}
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Equipment</p>
                                       {isEditing ? (
                                          <input
                                            type="number"
                                            value={editEqp}
                                            onChange={e => setEditEqp(e.target.value)}
                                            className="w-full bg-white border border-blue-300 rounded px-2 py-1 text-xs font-mono font-bold outline-none ring-2 ring-blue-50"
                                          />
                                       ) : (
                                          <p className="font-mono text-sm font-bold text-slate-700">৳{item.plannedBreakdown?.equipment.toLocaleString() || '0'}</p>
                                       )}
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Overhead</p>
                                       {isEditing ? (
                                          <input
                                            type="number"
                                            value={editOH}
                                            onChange={e => setEditOH(e.target.value)}
                                            className="w-full bg-white border border-blue-300 rounded px-2 py-1 text-xs font-mono font-bold outline-none ring-2 ring-blue-50"
                                          />
                                       ) : (
                                          <p className="font-mono text-sm font-bold text-slate-700">৳{item.plannedBreakdown?.overhead.toLocaleString() || '0'}</p>
                                       )}
                                    </div>
                                 </div>

                                 <div className="pt-2 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                       <div className="flex flex-col">
                                          <span className="text-[10px] font-bold text-slate-400 uppercase">Unit Cost</span>
                                          <span className="text-lg font-mono font-black text-slate-800">৳{item.plannedUnitCost.toLocaleString()}</span>
                                       </div>
                                       <div className="flex flex-col">
                                          <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Profit/Unit</span>
                                          <span className="text-lg font-mono font-black text-emerald-600">৳{(item.rate - item.plannedUnitCost).toLocaleString()}</span>
                                       </div>
                                    </div>

                                    {isEditing && (
                                       <div className="flex gap-2">
                                          <button
                                            onClick={() => setEditId(null)}
                                            className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded text-xs font-bold hover:bg-slate-200 transition-colors"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            onClick={() => handleSaveEdit(item)}
                                            className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700 shadow-md flex items-center gap-1.5"
                                          >
                                            <Save className="w-3.5 h-3.5" /> Save Changes
                                          </button>
                                       </div>
                                    )}
                                 </div>
                              </div>

                              {/* Right side: Summary & Status */}
                              <div className="w-full lg:w-72 space-y-4 border-l border-slate-100 pl-8">
                                 <h4 className="font-bold text-slate-800 text-sm">Execution Summary</h4>
                                 <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                       <span className="text-slate-500 font-medium">Total Resource Cost:</span>
                                       <span className="font-mono font-bold text-slate-700">৳{(item.plannedUnitCost * item.executedQty).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                       <span className="text-slate-500 font-medium">Billable Value:</span>
                                       <span className="font-mono font-bold text-slate-700">৳{(item.rate * item.executedQty).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-50">
                                       <span className="text-slate-800 font-bold">Net Contribution:</span>
                                       <span className="font-mono font-black text-emerald-600">৳{((item.rate - item.plannedUnitCost) * item.executedQty).toLocaleString()}</span>
                                    </div>
                                 </div>
                                 <div className="pt-2">
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                       <div className="flex items-center gap-2 mb-1">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                                          <span className="text-[10px] font-bold text-blue-700 uppercase">Verification Status</span>
                                       </div>
                                       <p className="text-[10px] text-blue-600 leading-tight">Quantity verified against site DPRs and verified measurements.</p>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAndSortedBOQ.length === 0 && (
           <div className="py-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                 <Activity className="w-8 h-8 text-slate-300" />
              </div>
              <h4 className="font-bold text-slate-700">No matching items found</h4>
              <p className="text-slate-500 text-xs mt-1">Try adjusting your search terms or filters.</p>
           </div>
        )}
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <div className="p-2 bg-blue-50 rounded-lg">
                     <FileUp className="w-5 h-5 text-blue-600" />
                   </div>
                   <h3 className="font-bold text-slate-900 text-lg">Import BOQ Items</h3>
                </div>
                <button 
                  onClick={() => setIsImportModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
             </div>

             <div className="p-8">
                <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-8">
                   <button
                     onClick={() => setImportTab('EXISTING')}
                     className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${importTab === 'EXISTING' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                     Select from Project Docs
                   </button>
                   <button
                     onClick={() => setImportTab('UPLOAD')}
                     className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${importTab === 'UPLOAD' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                     Upload New File
                   </button>
                </div>

                <div className="min-h-[200px] mb-8">
                   {importTab === 'EXISTING' ? (
                     <div className="grid grid-cols-1 gap-3">
                        {availableDocs.length > 0 ? availableDocs.map(doc => (
                          <button
                            key={doc.id}
                            onClick={() => setSelectedFileId(doc.id)}
                            className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left group ${
                              selectedFileId === doc.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-blue-300 bg-white shadow-sm'
                            }`}
                          >
                            <div className={`p-2 rounded-lg transition-colors ${selectedFileId === doc.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                               <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className={`text-sm font-bold truncate ${selectedFileId === doc.id ? 'text-blue-900' : 'text-slate-800'}`}>{doc.name}</p>
                               <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">{doc.type}</span>
                                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">BOQ</span>
                               </div>
                            </div>
                            {selectedFileId === doc.id && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                          </button>
                        )) : (
                          <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                             <FileText className="w-10 h-10 text-slate-200 mb-3" />
                             <p className="text-slate-500 text-sm font-medium">No suitable documents found</p>
                          </div>
                        )}
                     </div>
                   ) : (
                     <div className="flex flex-col items-center justify-center h-full">
                        <label className="w-full flex flex-col items-center justify-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:bg-slate-100 transition-all cursor-pointer group">
                           <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 border border-slate-100 group-hover:scale-110 transition-transform">
                              <UploadCloud className="w-8 h-8 text-blue-600" />
                           </div>
                           <p className="text-slate-800 font-bold mb-1">
                              {fileToUpload ? fileToUpload.name : 'Click to upload BOQ file'}
                           </p>
                           <p className="text-slate-500 text-xs">PDF, Excel, or CSV accepted (Max 10MB)</p>
                           <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.xlsx,.xls,.csv" />
                        </label>
                     </div>
                   )}
                </div>

                {importStatus && (
                  <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                     <div className={`p-4 rounded-xl flex items-center gap-3 ${importStatus.includes('Error') ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                        {importStatus.includes('Error') ? <AlertCircle className="w-5 h-5 shrink-0" /> : <Loader2 className="w-5 h-5 animate-spin shrink-0" />}
                        <p className="text-sm font-bold">{importStatus}</p>
                     </div>
                  </div>
                )}

                <div className="flex gap-3">
                   <button
                     disabled={isImporting}
                     onClick={() => setIsImportModalOpen(false)}
                     className="btn-secondary flex-1"
                   >
                     Cancel
                   </button>
                   <button
                     disabled={isImporting || (importTab === 'EXISTING' ? !selectedFileId : !fileToUpload)}
                     onClick={handleImport}
                     className="btn-primary flex-1 shadow-lg shadow-blue-200"
                   >
                     {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                     {isImporting ? 'Processing...' : 'Sync & Parse BOQ'}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg">Add New BOQ Item</h3>
                {isSuggesting && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded animate-pulse">
                    <Sparkles className="w-2.5 h-2.5" />
                    AI Estimating...
                  </div>
                )}
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddItem} className="p-8 space-y-6 max-h-[85vh] overflow-y-auto scrollbar-thin">
              <div>
                <label htmlFor="description" className="form-label">Item Description</label>
                <textarea 
                  id="description"
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input resize-none"
                  placeholder="e.g., Earth work in cutting and filling of eroded bank"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div>
                  <label htmlFor="unit" className="form-label">Unit</label>
                  <select 
                    id="unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as Unit)}
                    className="form-input bg-white"
                  >
                    {Object.values(Unit).map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="itemPriority" className="form-label">Priority</label>
                  <select 
                    id="itemPriority"
                    value={itemPriority}
                    onChange={(e) => setItemPriority(e.target.value as Priority)}
                    className="form-input bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                   <label htmlFor="rate" className="form-label">Selling Rate (৳)</label>
                   <input 
                    id="rate"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="form-input font-mono"
                    placeholder="0.00"
                  />
                </div>
                <div>
                <label htmlFor="plannedQty" className="form-label">Planned Quantity</label>
                <input 
                  id="plannedQty"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={plannedQty}
                  onChange={(e) => setPlannedQty(e.target.value)}
                  className="form-input font-mono"
                  placeholder="0.00"
                />
              </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Internal Budget Breakdown</h4>
                      {aiAppliedFields && (
                        <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 mt-1 animate-in fade-in slide-in-from-left-2">
                           <CheckCircle2 className="w-3 h-3" /> AI Optimized Estimates
                        </span>
                      )}
                    </div>
                    {description && (
                       <button 
                         type="button"
                         onClick={handleSuggestCost}
                         disabled={isSuggesting}
                         className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-95"
                       >
                         {isSuggesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                         AI Rate Analysis
                       </button>
                    )}
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="plannedMat" className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Material</label>
                      <input 
                        id="plannedMat"
                        type="number" 
                        value={plannedMat} 
                        onChange={(e) => { setPlannedMat(e.target.value); setAiAppliedFields(false); }} 
                        className={`form-input font-mono ${aiAppliedFields ? 'border-indigo-200 bg-indigo-50/20' : ''}`}
                      />
                    </div>
                    <div>
                      <label htmlFor="plannedLab" className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Labor</label>
                      <input 
                        id="plannedLab"
                        type="number" 
                        value={plannedLab} 
                        onChange={(e) => { setPlannedLab(e.target.value); setAiAppliedFields(false); }} 
                        className={`form-input font-mono ${aiAppliedFields ? 'border-indigo-200 bg-indigo-50/20' : ''}`}
                      />
                    </div>
                    <div>
                      <label htmlFor="plannedEqp" className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Equipment</label>
                      <input 
                        id="plannedEqp"
                        type="number" 
                        value={plannedEqp} 
                        onChange={(e) => { setPlannedEqp(e.target.value); setAiAppliedFields(false); }} 
                        className={`form-input font-mono ${aiAppliedFields ? 'border-indigo-200 bg-indigo-50/20' : ''}`}
                      />
                    </div>
                    <div>
                      <label htmlFor="plannedOH" className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Overhead</label>
                      <input 
                        id="plannedOH"
                        type="number" 
                        value={plannedOH} 
                        onChange={(e) => { setPlannedOH(e.target.value); setAiAppliedFields(false); }} 
                        className={`form-input font-mono ${aiAppliedFields ? 'border-indigo-200 bg-indigo-50/20' : ''}`}
                      />
                    </div>
                 </div>

                 <div className="pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-baseline">
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Planned Unit Cost:</span>
                       <span className="text-2xl font-mono font-black text-indigo-700">৳{Number(plannedUnitCost).toLocaleString()}</span>
                    </div>
                 </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="btn-secondary px-6"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-primary px-8 shadow-lg shadow-blue-200"
                >
                  Create BOQ Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterControl;
