
import React from 'react';
import { Equipment } from '../types';
import { Truck, Settings, AlertTriangle, CheckCircle2, Plus, Search, Filter } from 'lucide-react';

interface EquipmentManagerProps {
  equipment: Equipment[];
}

const EquipmentManager: React.FC<EquipmentManagerProps> = ({ equipment }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredEquipment = equipment.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'MAINTENANCE': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'OUT_OF_ORDER': return 'text-red-600 bg-red-50 border-red-100';
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
              placeholder="Search equipment..."
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
          Add Equipment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No equipment found</p>
          </div>
        ) : (
          filteredEquipment.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all group">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Truck className="w-6 h-6" />
                  </div>
                  <span className={`px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusColor(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">{item.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{item.type}</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Last Maint.</span>
                    <p className="text-xs font-bold text-slate-700">{item.lastMaintenance}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Next Maint.</span>
                    <p className="text-xs font-bold text-blue-600">{item.nextMaintenance}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-600">Hourly Rate</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">৳{item.hourlyRate}/hr</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600">
                      {item.assignedOperator?.charAt(0) || '?'}
                    </div>
                    <span className="text-xs text-slate-500">{item.assignedOperator || 'No Operator'}</span>
                  </div>
                  <button className="text-xs font-bold text-blue-600 hover:text-blue-700">Manage</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EquipmentManager;
