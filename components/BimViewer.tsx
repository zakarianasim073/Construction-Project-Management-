
import React from 'react';
import { BimModel } from '../types';
import { Box, Layers, Maximize2, RotateCcw, ZoomIn, ZoomOut, Search, Info, Settings, Eye, EyeOff } from 'lucide-react';

interface BimViewerProps {
  models: BimModel[];
}

const BimViewer: React.FC<BimViewerProps> = ({ models }) => {
  const [selectedModel, setSelectedModel] = React.useState(models[0] || null);
  const [layers, setLayers] = React.useState([
    { id: 'arch', name: 'Architectural', visible: true },
    { id: 'struct', name: 'Structural', visible: true },
    { id: 'mep', name: 'MEP', visible: false },
    { id: 'elec', name: 'Electrical', visible: false },
  ]);

  const toggleLayer = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col lg:flex-row gap-6">
      {/* Model List & Layers */}
      <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Box className="w-4 h-4 text-blue-600" />
              BIM Models
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {models.map(model => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model)}
                className={`w-full p-3 rounded-xl border text-left transition-all ${
                  selectedModel?.id === model.id 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/10' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="text-sm font-bold text-slate-800 truncate">{model.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">v{model.version}</span>
                  <span className="text-[10px] text-slate-400">{model.uploadedAt}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Model Layers</h4>
            <div className="space-y-2">
              {layers.map(layer => (
                <button
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className="w-full flex items-center justify-between p-2 hover:bg-white rounded-lg transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Layers className={`w-3 h-3 ${layer.visible ? 'text-blue-600' : 'text-slate-300'}`} />
                    <span className={`text-xs font-medium ${layer.visible ? 'text-slate-700' : 'text-slate-400'}`}>
                      {layer.name}
                    </span>
                  </div>
                  {layer.visible ? (
                    <Eye className="w-3 h-3 text-blue-500" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-slate-300" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Viewer Stage */}
      <div className="flex-1 bg-slate-900 rounded-2xl shadow-2xl relative overflow-hidden group">
        {/* Mock 3D Canvas */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Simple CSS 3D Cube / Shape to simulate a model */}
            <div className="w-64 h-64 relative preserve-3d animate-slow-spin">
              <div className="absolute inset-0 border-2 border-blue-500/30 bg-blue-500/10 backdrop-blur-sm rounded-lg transform rotate-x-45 rotate-y-45"></div>
              <div className="absolute inset-0 border-2 border-blue-400/20 bg-blue-400/5 backdrop-blur-sm rounded-lg transform -rotate-x-45 -rotate-y-45"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Box className="w-32 h-32 text-blue-500/20 animate-pulse" />
              </div>
            </div>
            
            {/* Grid Lines */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          </div>
        </div>

        {/* Viewer Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-800/80 backdrop-blur-md p-2 rounded-2xl border border-slate-700 shadow-2xl transition-all opacity-0 group-hover:opacity-100">
          <button className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-all"><ZoomIn className="w-4 h-4" /></button>
          <button className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-all"><ZoomOut className="w-4 h-4" /></button>
          <div className="w-px h-4 bg-slate-700 mx-1"></div>
          <button className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-all"><RotateCcw className="w-4 h-4" /></button>
          <button className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-all"><Maximize2 className="w-4 h-4" /></button>
          <div className="w-px h-4 bg-slate-700 mx-1"></div>
          <button className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-all"><Settings className="w-4 h-4" /></button>
        </div>

        {/* Info Overlay */}
        <div className="absolute top-6 left-6 bg-slate-800/80 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-xl">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Active Model</p>
          <p className="text-sm font-bold text-white">{selectedModel?.name || 'No Model Selected'}</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] text-slate-400">FPS: 60</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-[10px] text-slate-400">Vertices: 1.2M</span>
            </div>
          </div>
        </div>

        {/* Search / Navigation */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Find element..." 
              className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
          </div>
          <button className="p-2 bg-slate-800/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white rounded-xl transition-all">
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BimViewer;
