
import React from 'react';
import { SustainabilityMetrics, Unit } from '../types';
import { Leaf, Recycle, Droplets, Wind, TrendingDown, AlertCircle, BarChart3 } from 'lucide-react';

interface SustainabilityTrackerProps {
  metrics: SustainabilityMetrics;
}

const SustainabilityTracker: React.FC<SustainabilityTrackerProps> = ({ metrics }) => {
  const totalWaste = metrics.wasteGenerated.reduce((acc, curr) => acc + curr.qty, 0);
  const totalRecycled = metrics.wasteGenerated.reduce((acc, curr) => acc + curr.recycledQty, 0);
  const recycleRate = (totalRecycled / (totalWaste || 1)) * 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Carbon Footprint */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Carbon Footprint</p>
                <p className="text-2xl font-black text-slate-800">{metrics.carbonFootprint.toLocaleString()} kg CO₂</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg w-fit">
              <TrendingDown className="w-3 h-3" />
              <span>12% lower than benchmark</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100/50 blur-[50px] rounded-full -mr-16 -mt-16"></div>
        </div>

        {/* Water Usage */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Water Usage</p>
                <p className="text-2xl font-black text-slate-800">{metrics.waterUsage.toLocaleString()} L</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">Site curing & dust suppression</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 blur-[50px] rounded-full -mr-16 -mt-16"></div>
        </div>

        {/* Waste Recycle Rate */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Recycle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recycle Rate</p>
                <p className="text-2xl font-black text-slate-800">{recycleRate.toFixed(0)}%</p>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${recycleRate}%` }} />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 blur-[50px] rounded-full -mr-16 -mt-16"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waste Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Waste Breakdown
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {metrics.wasteGenerated.map((waste, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-700">{waste.type}</span>
                  <span className="text-slate-500 font-medium">{waste.qty} {waste.unit}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-emerald-500" 
                    style={{ width: `${(waste.recycledQty / waste.qty) * 100}%` }}
                    title="Recycled"
                  />
                  <div 
                    className="h-full bg-slate-300" 
                    style={{ width: `${((waste.qty - waste.recycledQty) / waste.qty) * 100}%` }}
                    title="Landfill"
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-emerald-600">Recycled: {waste.recycledQty} {waste.unit}</span>
                  <span className="text-slate-400">Landfill: {waste.qty - waste.recycledQty} {waste.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sustainability Tips */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-600" />
            Green Site Recommendations
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <AlertCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-900 mb-1">Optimize Concrete Curing</h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Use curing compounds instead of continuous water spraying to reduce water consumption by up to 30%.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <AlertCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-blue-900 mb-1">Steel Scrap Segregation</h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Implement a dedicated scrap yard for rebar off-cuts to ensure 100% recyclability and potential resale value.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900 mb-1">Solar Lighting for Site Office</h4>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Switching to solar-powered site lighting can reduce operational carbon footprint by 500kg CO₂ per month.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityTracker;
