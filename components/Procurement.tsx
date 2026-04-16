
import React from 'react';
import { Material, PurchaseOrder, Unit } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  ShoppingCart, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  MoreVertical,
  ChevronRight
} from 'lucide-react';

interface ProcurementProps {
  materials: Material[];
  purchaseOrders: PurchaseOrder[];
}

const Procurement: React.FC<ProcurementProps> = ({ materials, purchaseOrders }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'INVENTORY' | 'ORDERS'>('INVENTORY');

  const filteredMaterials = materials.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredOrders = purchaseOrders.filter(o => o.vendorName.toLowerCase().includes(searchQuery.toLowerCase()));

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'DELIVERED': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'SENT': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'DRAFT': return 'text-slate-600 bg-slate-50 border-slate-100';
      case 'CANCELLED': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('INVENTORY')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'INVENTORY' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Package className="w-4 h-4" />
            Inventory
          </button>
          <button 
            onClick={() => setActiveTab('ORDERS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'ORDERS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ShoppingCart className="w-4 h-4" />
            Purchase Orders
          </button>
        </div>
        
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
            />
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            <Plus className="w-4 h-4" />
            {activeTab === 'INVENTORY' ? 'Add Material' : 'New Order'}
          </button>
        </div>
      </div>

      {activeTab === 'INVENTORY' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map(material => (
            <div key={material.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Package className="w-6 h-6" />
                </div>
                {material.currentStock < (material.totalReceived * 0.1) && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    LOW STOCK
                  </div>
                )}
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{material.name}</h3>
              <p className="text-xs text-slate-500 mb-4">ID: {material.id}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Stock</span>
                  <p className="text-lg font-bold text-slate-800">{material.currentStock} {material.unit}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Consumed</span>
                  <p className="text-lg font-bold text-slate-800">{material.totalConsumed} {material.unit}</p>
                </div>
              </div>

              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
                <div 
                  className={`h-full transition-all ${material.currentStock < (material.totalReceived * 0.1) ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${(material.currentStock / material.totalReceived) * 100}%` }}
                />
              </div>

              <button className="w-full py-2 text-blue-600 font-bold text-xs hover:bg-blue-50 rounded-lg transition-all flex items-center justify-center gap-2">
                View Details
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-800 text-sm">{order.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Truck className="w-4 h-4 text-slate-500" />
                      </div>
                      <span className="font-medium text-slate-700 text-sm">{order.vendorName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800 text-sm">৳{order.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {order.expectedDeliveryDate || 'TBD'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Procurement;
