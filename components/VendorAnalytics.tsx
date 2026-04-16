
import React from 'react';
import { Vendor } from '../types';
import { ShoppingCart, Star, TrendingUp, TrendingDown, Package, Clock, ShieldCheck, Search, Filter, MoreVertical } from 'lucide-react';

interface VendorAnalyticsProps {
  vendors: Vendor[];
}

const VendorAnalytics: React.FC<VendorAnalyticsProps> = ({ vendors }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (rating >= 3.5) return 'text-blue-600 bg-blue-50 border-blue-100';
    if (rating >= 2.5) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search vendors..."
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
          <ShoppingCart className="w-4 h-4" />
          New Purchase Order
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No vendors found</p>
          </div>
        ) : (
          filteredVendors.map(vendor => (
            <div key={vendor.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all group overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Package className="w-6 h-6" />
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-bold ${getRatingColor(vendor.rating)}`}>
                    <Star className="w-3 h-3 fill-current" />
                    {vendor.rating.toFixed(1)}
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">{vendor.name}</h3>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
                  {vendor.category}
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Orders</span>
                    <p className="text-lg font-bold text-slate-800">{vendor.totalOrders}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">On-Time Rate</span>
                    <p className={`text-lg font-bold ${vendor.onTimeDeliveryRate > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {vendor.onTimeDeliveryRate}%
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>Quality Score</span>
                    <span>{vendor.qualityScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${vendor.qualityScore}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Clock className="w-3 h-3" />
                    Avg. 4 days delivery
                  </div>
                  <button className="text-xs font-bold text-blue-600 hover:text-blue-700">View History</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VendorAnalytics;
