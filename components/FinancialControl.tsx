import React, { useState, useMemo } from 'react';
import { ProjectState, ProjectDocument, BOQItem, UserRole, Bill, ExtractedBill } from '../types';
import { Download, PlusCircle, CheckCircle2, ChevronDown, ChevronUp, TrendingUp, Wallet, ArrowDownRight, Sparkles, Loader2, Zap, Package, X, Save, Edit2, Hammer, UsersRound, AlertOctagon } from 'lucide-react';
import DocumentManager from './DocumentManager';
import { extractBillData, suggestActualCostBreakdown, parseRunningBillDetails } from '../services/geminiService';

interface FinancialControlProps {
  data: ProjectState;
  onAddDocument: (doc: ProjectDocument) => void;
  onUpdateBOQItem?: (itemId: string, updatedItem: Partial<BOQItem>) => void;
  onAddBill: (bill: Bill) => void;
  onUpdatePDRemarks: (type: 'BILL', id: string, remarks: string) => void;
  onBillItemizedUpdate: (items: { boqId: string; amount: number }[]) => void;
  userRole: UserRole;
}

const FinancialControl: React.FC<FinancialControlProps> = ({ data, onAddDocument, onUpdateBOQItem, onAddBill, onUpdatePDRemarks, onBillItemizedUpdate, userRole }) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [analyzingItemId, setAnalyzingItemId] = useState<string | null>(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [editingRemarksId, setEditingRemarksId] = useState<string | null>(null);
  const [tempRemarks, setTempRemarks] = useState('');

  // Bill Form
  const [billType, setBillType] = useState<Bill['type']>('VENDOR_INVOICE');
  const [billCategory, setBillCategory] = useState<NonNullable<Bill['category']>>('OTHER');
  const [billEntity, setBillEntity] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [aiAutofilled, setAiAutofilled] = useState(false);
  const [detectedBillDocName, setDetectedBillDocName] = useState('');

  const canAddClientBill = userRole === 'MANAGER' || userRole === 'DIRECTOR';
  const canAddVendorBill = userRole === 'ACCOUNTANT' || userRole === 'DIRECTOR';
  const canUploadDoc = canAddClientBill || canAddVendorBill;
  const isDirector = userRole === 'DIRECTOR';

  const clientBills = data.bills.filter(b => b.type === 'CLIENT_RA');
  const vendorBills = data.bills.filter(b => b.type === 'VENDOR_INVOICE' || b.type === 'MATERIAL_EXPENSE' || b.type === 'SUB_CONTRACTOR');

  const totalRevenue = clientBills.reduce((acc, b) => acc + b.amount, 0);
  const totalExpenses = vendorBills.reduce((acc, b) => acc + b.amount, 0);
  
  // Material Value Calculation
  const materialInventoryValue = data.materials.reduce((sum, mat) => sum + (mat.currentStock * mat.averageRate), 0);

  // --- LIVE SYNC CALCULATIONS ---

  // 1. Live Material Stats (Automated from DPRs)
  const materialStats = useMemo(() => {
    return data.materials.map(m => {
      const consumedQty = data.dprs.reduce((acc, dpr) => {
         const usage = dpr.materialsUsed?.find(u => u.materialId === m.id);
         return acc + (usage ? usage.qty : 0);
      }, 0);
      return {
        ...m,
        liveConsumedQty: consumedQty,
        liveExpense: consumedQty * m.averageRate
      };
    }).filter(m => m.liveConsumedQty > 0 || m.totalConsumed > 0);
  }, [data.materials, data.dprs]);

  // 2. Live Sub-Contractor Stats (Automated from DPRs vs Bills)
  const subContractorStats = useMemo(() => {
     if (!data.subContractors) return [];
     return data.subContractors.map(sc => {
        // Calculate accrued liability directly from DPRs for perfect sync
        const liveWorkValue = data.dprs
            .filter(d => d.subContractorId === sc.id && d.workDoneQty && d.linkedBoqId)
            .reduce((sum, d) => {
                const rate = sc.agreedRates.find(r => r.boqId === d.linkedBoqId)?.rate || 0;
                return sum + (d.workDoneQty! * rate);
            }, 0);
        
        return {
           ...sc,
           liveWorkValue,
           balance: liveWorkValue - sc.totalBilled
        };
     });
  }, [data.subContractors, data.dprs]);

  // 3. Live BOQ Item Costing
  const liveItemStats = useMemo(() => {
    return data.boq.map(item => {
        const relevantDPRs = data.dprs.filter(d => d.linkedBoqId === item.id);
        
        // Calculate Material Expense
        let materialExp = 0;
        relevantDPRs.forEach(dpr => {
            dpr.materialsUsed?.forEach(usage => {
                const mat = data.materials.find(m => m.id === usage.materialId);
                if (mat) {
                    materialExp += usage.qty * mat.averageRate;
                }
            });
        });

        // Calculate Sub-Contractor Liability
        let subContractExp = 0;
        relevantDPRs.forEach(dpr => {
            if (dpr.subContractorId && dpr.workDoneQty) {
                 const sc = data.subContractors.find(s => s.id === dpr.subContractorId);
                 const rateObj = sc?.agreedRates.find(r => r.boqId === item.id);
                 if (rateObj) {
                     subContractExp += dpr.workDoneQty * rateObj.rate;
                 }
            }
        });

        // Estimate Direct Labor
        let directLaborExp = 0;
        const avgDailyWage = 800;
        const dprsWithNoSC = relevantDPRs.filter(d => !d.subContractorId);
        const totalLaborDays = dprsWithNoSC.reduce((acc, d) => acc + d.laborCount, 0);
        directLaborExp = totalLaborDays * avgDailyWage;

        const totalActualCost = materialExp + subContractExp + directLaborExp;
        const revenue = (item.billedAmount || 0);
        const workDoneValue = item.executedQty * item.rate;
        const profit = revenue - totalActualCost;

        return {
            ...item,
            stats: {
                materialExp,
                subContractExp,
                directLaborExp,
                totalActualCost,
                profit
            }
        };
    });
  }, [data.boq, data.dprs, data.materials, data.subContractors]);

  const totalOperationalProfit = liveItemStats.reduce((acc, item) => {
     const workValue = item.executedQty * item.rate;
     return acc + (workValue - item.stats.totalActualCost);
  }, 0);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleBillUploaded = (extracted: ExtractedBill) => {
    setAiAutofilled(true);
    const latestBill = data.documents.find(d => d.category === 'BILL' && d.uploadDate === new Date().toISOString().split('T')[0]);
    if (latestBill) setDetectedBillDocName(latestBill.name);

    if (extracted.type) setBillType(extracted.type === 'CLIENT_RA' ? 'CLIENT_RA' : 'VENDOR_INVOICE');
    if (extracted.entityName) setBillEntity(extracted.entityName);
    if (extracted.amount) setBillAmount(extracted.amount.toString());
    if (extracted.date) setBillDate(extracted.date);
    
    setIsBillModalOpen(true);
    setTimeout(() => setAiAutofilled(false), 5000);
  };

  const handleAiBillExtraction = async () => {
    const lastBillDoc = data.documents.find(d => d.category === 'BILL');
    if (!lastBillDoc) {
      alert("No bill documents found to analyze.");
      return;
    }
    setIsAiLoading(true);
    const extracted = await extractBillData(lastBillDoc.name);
    setDetectedBillDocName(lastBillDoc.name);
    setIsAiLoading(false);
    if (extracted) {
      alert(`AI Extracted Bill Info:\n\nEntity: ${extracted.entityName}\nAmount: ৳${extracted.amount}\nType: ${extracted.type}\n\nYou can now use these values to populate the form.`);
      handleBillUploaded(extracted);
    }
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    onAddBill({
      id: `BILL-${Date.now()}`,
      type: billType,
      entityName: billEntity,
      amount: Number(billAmount),
      date: billDate,
      status: 'PENDING',
      category: billType === 'CLIENT_RA' ? undefined : billCategory
    });

    if (billType === 'CLIENT_RA' && detectedBillDocName) {
      const confirmItemize = window.confirm("Do you want to automatically distribute this bill amount to BOQ items based on the uploaded document?");
      if (confirmItemize) {
        setIsAiLoading(true);
        const itemizedUpdates = await parseRunningBillDetails(detectedBillDocName, data.boq);
        onBillItemizedUpdate(itemizedUpdates);
        setIsAiLoading(false);
        alert(`Successfully mapped bill amount to ${itemizedUpdates.length} BOQ items.`);
      }
    }

    setIsBillModalOpen(false);
    setBillEntity('');
    setBillAmount('');
    setAiAutofilled(false);
    setDetectedBillDocName('');
    setBillCategory('OTHER');
  };

  const handleBillTypeChange = (newType: Bill['type']) => {
    setBillType(newType);
    if (newType === 'MATERIAL_EXPENSE') setBillCategory('MATERIAL');
    else if (newType === 'SUB_CONTRACTOR') setBillCategory('LABOR');
    else setBillCategory('OTHER');
  };

  const saveRemarks = (id: string) => {
    onUpdatePDRemarks('BILL', id, tempRemarks);
    setEditingRemarksId(null);
  };

  const BillTable = ({ bills, title }: { bills: typeof data.bills, title: string }) => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <button className="p-2 text-slate-400 hover:text-slate-600">
          <Download className="w-4 h-4" />
        </button>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 whitespace-nowrap">Bill ID</th>
              <th className="px-6 py-3 whitespace-nowrap">Entity / Description</th>
              <th className="px-6 py-3 whitespace-nowrap">Date</th>
              <th className="px-6 py-3 text-right whitespace-nowrap">Amount</th>
              <th className="px-6 py-3 text-center whitespace-nowrap">Status</th>
              <th className="px-6 py-3 whitespace-nowrap">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bills.map(bill => (
              <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3 font-medium text-slate-700">
                  {bill.id}
                  {bill.type === 'SUB_CONTRACTOR' && <div className="text-[10px] text-orange-600 font-bold">Sub-Contract</div>}
                  {bill.type === 'MATERIAL_EXPENSE' && <div className="text-[10px] text-indigo-600 font-bold">Material</div>}
                  {bill.category && bill.category !== 'OTHER' && (
                    <div className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1 rounded inline-block mt-0.5 border border-slate-200 ml-1">
                      {bill.category}
                    </div>
                  )}
                </td>
                <td className="px-6 py-3 text-slate-600 truncate max-w-[200px]">{bill.entityName}</td>
                <td className="px-6 py-3 text-slate-500">{bill.date}</td>
                <td className="px-6 py-3 text-right font-medium text-slate-900">৳{bill.amount.toLocaleString()}</td>
                <td className="px-6 py-3 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    bill.status === 'PAID' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {bill.status}
                  </span>
                </td>
                <td className="px-6 py-3 min-w-[200px]">
                  {editingRemarksId === bill.id ? (
                    <div className="flex items-center gap-1">
                      <input 
                        type="text" 
                        value={tempRemarks} 
                        onChange={(e) => setTempRemarks(e.target.value)} 
                        className="w-full text-xs border border-blue-300 rounded px-1 py-0.5 outline-none"
                        autoFocus
                      />
                      <button onClick={() => saveRemarks(bill.id)} className="text-emerald-600"><Save className="w-3.5 h-3.5"/></button>
                      <button onClick={() => setEditingRemarksId(null)} className="text-red-500"><X className="w-3.5 h-3.5"/></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group/remark">
                      <span className="text-xs text-slate-500 italic truncate max-w-[150px]">
                        {bill.pdRemarks || (isDirector ? "Add note..." : "")}
                      </span>
                      {isDirector && (
                        <button 
                          onClick={() => { setEditingRemarksId(bill.id); setTempRemarks(bill.pdRemarks || ''); }}
                          className="opacity-0 group-hover/remark:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Financial Control</h1>
          <p className="text-slate-500">Track Bills, Costs, and Profitability</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleAiBillExtraction}
            disabled={isAiLoading}
            className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors shadow-sm text-sm font-bold"
          >
            {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Auto-Scan Bill
          </button>
          {canAddVendorBill && (
             <button 
               onClick={() => { setIsBillModalOpen(true); setBillType('VENDOR_INVOICE'); setBillCategory('OTHER'); setBillEntity(''); setBillAmount(''); setAiAutofilled(false); }}
               className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium"
             >
              <PlusCircle className="w-4 h-4" />
              Add Expense / Bill
            </button>
          )}
          {canAddClientBill && (
            <button 
              onClick={() => { setIsBillModalOpen(true); setBillType('CLIENT_RA'); setBillEntity(''); setBillAmount(''); setAiAutofilled(false); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
            >
              <PlusCircle className="w-4 h-4" />
              Record Bill Received (PE)
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
           <div className="flex justify-between items-start mb-2">
             <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Wallet className="w-5 h-5" />
             </div>
           </div>
           <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Revenue</p>
           <h2 className="text-2xl font-bold text-slate-800 mt-1">৳{totalRevenue.toLocaleString()}</h2>
           <p className="text-xs text-slate-400 mt-1">Total Billed to Client</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
           <div className="flex justify-between items-start mb-2">
             <div className="p-2 bg-red-50 rounded-lg text-red-600">
                <ArrowDownRight className="w-5 h-5" />
             </div>
           </div>
           <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Expenses</p>
           <h2 className="text-2xl font-bold text-slate-800 mt-1">৳{totalExpenses.toLocaleString()}</h2>
           <p className="text-xs text-slate-400 mt-1">Vendor + Sub-contract + Materials</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
           <div className="flex justify-between items-start mb-2">
             <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Package className="w-5 h-5" />
             </div>
           </div>
           <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Material Inventory Value</p>
           <h2 className="text-2xl font-bold text-slate-800 mt-1">৳{materialInventoryValue.toLocaleString()}</h2>
           <p className="text-xs text-slate-400 mt-1">Asset Value in Stock</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden border-l-4 border-l-violet-500">
           <div className="flex justify-between items-start mb-2">
             <div className="p-2 bg-violet-50 rounded-lg text-violet-600">
                <TrendingUp className="w-5 h-5" />
             </div>
           </div>
           <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Accrued Profit</p>
           <h2 className={`text-2xl font-bold mt-1 ${totalOperationalProfit >= 0 ? 'text-violet-700' : 'text-red-600'}`}>
             {totalOperationalProfit >= 0 ? '+' : ''}৳{totalOperationalProfit.toLocaleString()}
           </h2>
           <p className="text-xs text-slate-400 mt-1">Work Value - Actual Expense</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Live Item-Wise Cost Sheet</h3>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded flex items-center gap-1">
            <Zap className="w-3 h-3 fill-current" />
            Auto-Synced with DPR
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-600 font-medium border-b border-slate-200 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 w-8"></th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Selling Rate</th>
                <th className="px-4 py-3 text-right bg-indigo-50/50 text-indigo-700">Material Exp.</th>
                <th className="px-4 py-3 text-right bg-orange-50/50 text-orange-700">Sub-Contract</th>
                <th className="px-4 py-3 text-right text-slate-500">Est. Labor</th>
                <th className="px-4 py-3 text-right font-bold text-slate-800 border-l border-slate-200">Total Actual</th>
                <th className="px-4 py-3 text-right">Billed (PE)</th>
                <th className="px-4 py-3 text-right">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {liveItemStats.map((item) => {
                if (item.executedQty === 0) return null;
                const totalPL = item.stats.profit;
                const workDoneValue = item.executedQty * item.rate;
                const pendingBill = Math.max(0, workDoneValue - (item.billedAmount || 0));

                return (
                  <React.Fragment key={item.id}>
                    <tr 
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${expandedRow === item.id ? 'bg-slate-50' : ''}`}
                      onClick={() => toggleRow(item.id)}
                    >
                      <td className="px-4 py-4 text-center">
                        {expandedRow === item.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700 max-w-[250px]">
                        <div className="truncate">{item.description}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.id} • Qty: {item.executedQty.toLocaleString()} {item.unit}</div>
                      </td>
                      <td className="px-4 py-4 text-right text-slate-900 font-mono">৳{item.rate.toLocaleString()}</td>
                      
                      <td className="px-4 py-4 text-right font-mono bg-indigo-50/30 text-indigo-700">
                         {item.stats.materialExp > 0 ? `৳${item.stats.materialExp.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-4 text-right font-mono bg-orange-50/30 text-orange-700">
                         {item.stats.subContractExp > 0 ? `৳${item.stats.subContractExp.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-slate-500">
                         {item.stats.directLaborExp > 0 ? `~৳${item.stats.directLaborExp.toLocaleString()}` : '-'}
                      </td>
                      
                      <td className="px-4 py-4 text-right font-bold text-slate-900 font-mono border-l border-slate-200 bg-slate-50/50">
                        ৳{item.stats.totalActualCost.toLocaleString()}
                      </td>
                      
                      <td className="px-4 py-4 text-right text-emerald-700 font-medium">
                        ৳{(item.billedAmount || 0).toLocaleString()}
                        {pendingBill > 0 && <div className="text-[9px] text-orange-400">Due: ৳{pendingBill.toLocaleString()}</div>}
                      </td>
                      
                      <td className={`px-4 py-4 text-right font-bold ${totalPL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                         ৳{totalPL.toLocaleString()}
                      </td>
                    </tr>
                    {expandedRow === item.id && (
                      <tr className="bg-slate-50">
                        <td colSpan={9} className="px-6 py-4">
                          <div className="ml-8 flex gap-4">
                            <div className="flex-1 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">DPR Source Data Breakdown</h4>
                               <div className="grid grid-cols-3 gap-4 text-center">
                                  <div className="p-2 bg-indigo-50 rounded border border-indigo-100">
                                     <div className="text-[10px] text-indigo-500 font-bold uppercase">Material Consumed</div>
                                     <div className="font-mono font-bold text-indigo-700">৳{item.stats.materialExp.toLocaleString()}</div>
                                     <div className="text-[9px] text-indigo-400 mt-1">From Stock Out</div>
                                  </div>
                                  <div className="p-2 bg-orange-50 rounded border border-orange-100">
                                     <div className="text-[10px] text-orange-500 font-bold uppercase">Sub-Contract Work</div>
                                     <div className="font-mono font-bold text-orange-700">৳{item.stats.subContractExp.toLocaleString()}</div>
                                     <div className="text-[9px] text-orange-400 mt-1">Based on Agreed Rate</div>
                                  </div>
                                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                                     <div className="text-[10px] text-slate-500 font-bold uppercase">Direct Labor</div>
                                     <div className="font-mono font-bold text-slate-700">৳{item.stats.directLaborExp.toLocaleString()}</div>
                                     <div className="text-[9px] text-slate-400 mt-1">Daily Labor Count</div>
                                  </div>
                               </div>
                            </div>
                            <div className="w-1/3 bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center">
                                <div className="flex justify-between items-center mb-2">
                                   <span className="text-xs font-bold text-slate-500">Actual Unit Cost</span>
                                   <span className="font-mono font-bold text-slate-800">৳{(item.stats.totalActualCost / item.executedQty).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                   <span className="text-xs font-bold text-slate-500">Planned Unit Cost</span>
                                   <span className="font-mono text-slate-600">৳{item.plannedUnitCost.toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-slate-100 my-2"></div>
                                <div className="flex justify-between items-center">
                                   <span className="text-xs font-bold text-slate-500">Variance</span>
                                   <span className={`font-mono font-bold ${item.plannedUnitCost - (item.stats.totalActualCost / item.executedQty) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                      {item.plannedUnitCost - (item.stats.totalActualCost / item.executedQty) >= 0 ? 'Savings' : 'Overrun'}
                                   </span>
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
      </div>
      
      {/* COST CENTER BREAKDOWN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
                <Hammer className="w-4 h-4 text-indigo-600" />
                <h3 className="font-semibold text-slate-800">Material Cost Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium text-xs uppercase border-b border-slate-100">
                        <tr>
                            <th className="px-4 py-2">Material</th>
                            <th className="px-4 py-2 text-right">Avg Rate</th>
                            <th className="px-4 py-2 text-right">Qty Consumed</th>
                            <th className="px-4 py-2 text-right">Total Expense</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {materialStats.map(m => (
                            <tr key={m.id} className="hover:bg-slate-50">
                                <td className="px-4 py-2 font-medium text-slate-700">{m.name}</td>
                                <td className="px-4 py-2 text-right font-mono text-slate-600">৳{m.averageRate.toLocaleString()}</td>
                                <td className="px-4 py-2 text-right font-mono text-slate-600">{m.liveConsumedQty} <span className="text-[10px] text-slate-400">{m.unit}</span></td>
                                <td className="px-4 py-2 text-right font-bold text-indigo-600 font-mono">৳{m.liveExpense.toLocaleString()}</td>
                            </tr>
                        ))}
                        {materialStats.length === 0 && (
                            <tr><td colSpan={4} className="p-4 text-center text-slate-400 text-xs">No consumption data</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
                <UsersRound className="w-4 h-4 text-orange-600" />
                <h3 className="font-semibold text-slate-800">Sub-Contractor Reconciliation</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium text-xs uppercase border-b border-slate-100">
                        <tr>
                            <th className="px-4 py-2">Sub-Contractor</th>
                            <th className="px-4 py-2 text-right">Work Value</th>
                            <th className="px-4 py-2 text-right">Billed</th>
                            <th className="px-4 py-2 text-right">Balance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {subContractorStats.map(sc => (
                            <tr key={sc.id} className="hover:bg-slate-50">
                                <td className="px-4 py-2">
                                    <div className="font-medium text-slate-700">{sc.name}</div>
                                    <div className="text-[10px] text-slate-400">{sc.specialization}</div>
                                </td>
                                <td className="px-4 py-2 text-right font-mono text-slate-600">৳{sc.liveWorkValue.toLocaleString()}</td>
                                <td className="px-4 py-2 text-right font-mono text-slate-600">৳{sc.totalBilled.toLocaleString()}</td>
                                <td className="px-4 py-2 text-right">
                                    <span className={`font-mono font-bold ${sc.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                        ৳{sc.balance.toLocaleString()}
                                    </span>
                                    {sc.balance > 0 && <AlertOctagon className="w-3 h-3 inline ml-1 text-red-500" />}
                                </td>
                            </tr>
                        ))}
                        {subContractorStats.length === 0 && (
                             <tr><td colSpan={4} className="p-4 text-center text-slate-400 text-xs">No sub-contractors engaged</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
        <BillTable bills={clientBills} title="Client RA Bills" />
        <BillTable bills={vendorBills} title="Vendor Invoices (Payables)" />
      </div>

      {isBillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800">
                  {billType === 'CLIENT_RA' ? 'Record Bill Received (PE)' : 'Add Expense / Invoice'}
                </h3>
                {aiAutofilled && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded animate-pulse">
                    <CheckCircle2 className="w-3 h-3" />
                    AI Auto-Filled
                  </div>
                )}
              </div>
              <button onClick={() => setIsBillModalOpen(false)}><X className="w-5 h-5 text-slate-400"/></button>
            </div>
            <form onSubmit={handleCreateBill} className="p-6 space-y-4">
               {billType !== 'CLIENT_RA' && (
                 <>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Expense Type</label>
                     <select 
                       value={billType} 
                       onChange={(e) => handleBillTypeChange(e.target.value as any)}
                       className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                     >
                       <option value="VENDOR_INVOICE">General Vendor Invoice</option>
                       <option value="MATERIAL_EXPENSE">Material Purchase</option>
                       <option value="SUB_CONTRACTOR">Sub-Contractor Bill</option>
                     </select>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Cost Category</label>
                      <select
                          value={billCategory}
                          onChange={(e) => setBillCategory(e.target.value as any)}
                           className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                      >
                          <option value="MATERIAL">Material</option>
                          <option value="LABOR">Labor</option>
                          <option value="EQUIPMENT">Equipment</option>
                          <option value="OVERHEAD">Overhead</option>
                          <option value="OTHER">Other</option>
                      </select>
                   </div>
                 </>
               )}
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                    Entity Name
                    {aiAutofilled && <Sparkles className="w-2.5 h-2.5 text-emerald-500" />}
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={billEntity} 
                    onChange={(e) => setBillEntity(e.target.value)}
                    placeholder="e.g. ABC Constructions Ltd."
                    className={`w-full px-3 py-2 border rounded-lg text-sm transition-all ${aiAutofilled ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-300'}`}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                    Amount (৳)
                    {aiAutofilled && <Sparkles className="w-2.5 h-2.5 text-emerald-500" />}
                  </label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    step="0.01"
                    value={billAmount} 
                    onChange={(e) => setBillAmount(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm transition-all ${aiAutofilled ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-300'}`}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                    Date
                    {aiAutofilled && <Sparkles className="w-2.5 h-2.5 text-emerald-500" />}
                  </label>
                  <input 
                    type="date" 
                    required 
                    value={billDate} 
                    onChange={(e) => setBillDate(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm transition-all ${aiAutofilled ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-300'}`}
                  />
               </div>
               
               {billType === 'CLIENT_RA' && detectedBillDocName && (
                 <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                   <p className="text-xs text-blue-700">
                     <strong>AI Action:</strong> Upon saving, the system will read <em>"{detectedBillDocName}"</em> to automatically distribute the billed amount to individual BOQ items.
                   </p>
                 </div>
               )}

               <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700">
                 Save Record {billType === 'CLIENT_RA' && detectedBillDocName ? '& Auto-Distribute' : ''}
               </button>
            </form>
          </div>
        </div>
      )}

      <DocumentManager 
        documents={data.documents} 
        onAddDocument={onAddDocument} 
        onBillUploaded={handleBillUploaded}
        filterModule="FINANCE" 
        compact={true}
        allowUpload={canUploadDoc}
      />
    </div>
  );
};

export default FinancialControl;