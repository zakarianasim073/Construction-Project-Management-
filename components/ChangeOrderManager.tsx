
import React from 'react';
import { ChangeOrder } from '../types';
import { FilePlus, Search, Filter, Plus, MoreVertical, DollarSign, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface ChangeOrderManagerProps {
  changeOrders: ChangeOrder[];
}

const ChangeOrderManager: React.FC<ChangeOrderManagerProps> = ({ changeOrders }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredOrders = changeOrders.filter(o => 
    o.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'REJECTED': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'PENDING': return <Clock className="w-4 h-4 text-amber-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'REJECTED': return 'text-red-600 bg-red-50 border-red-100';
      case 'PENDING': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search change orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
            />
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
          <Plus className="w-4 h-4" />
          New Change Order
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <FilePlus className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No change orders found</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all group p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.id}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg mb-1 truncate">{order.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">{order.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-8 shrink-0">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Estimated Cost</span>
                    <div className="flex items-center gap-1 text-slate-800 font-bold">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <span>৳{(order.estimatedCost / 100000).toFixed(1)}L</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Requested Date</span>
                    <div className="flex items-center gap-1 text-slate-600 font-medium text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{order.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all">
                      View Details
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChangeOrderManager;
