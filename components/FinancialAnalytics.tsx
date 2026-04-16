
import React from 'react';
import { BOQItem, Bill } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

interface FinancialAnalyticsProps {
  boq: BOQItem[];
  bills: Bill[];
}

const FinancialAnalytics: React.FC<FinancialAnalyticsProps> = ({ boq, bills }) => {
  const totalBudget = boq.reduce((acc, item) => acc + (item.plannedQty * item.plannedUnitCost), 0);
  const totalActual = bills.reduce((acc, bill) => acc + bill.amount, 0);
  const totalContract = boq.reduce((acc, item) => acc + (item.plannedQty * item.rate), 0);
  
  const budgetVsActualData = boq.slice(0, 5).map(item => ({
    name: item.description.substring(0, 15) + '...',
    Budget: item.plannedQty * item.plannedUnitCost,
    Actual: (item.executedQty / item.plannedQty) * (item.plannedQty * item.plannedUnitCost) * 1.1 // Simulated actual
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const expenseByCategory = [
    { name: 'Material', value: bills.filter(b => b.category === 'MATERIAL').reduce((a, b) => a + b.amount, 0) || 450000 },
    { name: 'Labor', value: bills.filter(b => b.category === 'LABOR').reduce((a, b) => a + b.amount, 0) || 280000 },
    { name: 'Equipment', value: bills.filter(b => b.category === 'EQUIPMENT').reduce((a, b) => a + b.amount, 0) || 120000 },
    { name: 'Overhead', value: bills.filter(b => b.category === 'OVERHEAD').reduce((a, b) => a + b.amount, 0) || 85000 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Budget</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800">৳{(totalBudget / 1000000).toFixed(2)}M</h3>
          <p className="text-xs text-slate-500 mt-1">Internal estimated cost</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actual Spent</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800">৳{(totalActual / 1000000).toFixed(2)}M</h3>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {((totalActual / totalBudget) * 100).toFixed(1)}% of budget used
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Margin</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800">৳{((totalContract - totalActual) / 1000000).toFixed(2)}M</h3>
          <p className="text-xs text-amber-600 mt-1">Estimated gross profit</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Actual Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Budget vs Actual (Top Items)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetVsActualData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="Budget" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-blue-600" />
            Expense Distribution
          </h3>
          <div className="h-[300px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialAnalytics;
