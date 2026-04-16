
import React from 'react';
import { WeatherForecast } from '../types';
import { Cloud, Sun, CloudRain, Wind, Thermometer, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface WeatherWidgetProps {
  forecast: WeatherForecast[];
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ forecast }) => {
  const today = forecast[0];

  const getConditionIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return <Sun className="w-8 h-8 text-amber-500" />;
      case 'rainy': return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'cloudy': return <Cloud className="w-8 h-8 text-slate-400" />;
      default: return <Sun className="w-8 h-8 text-amber-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'STOP_WORK': return 'text-red-600 bg-red-50 border-red-100';
      case 'CAUTION': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'NONE': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-500" />
          Site Weather Forecast
        </h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dhaka, BD</span>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center shadow-inner">
              {getConditionIcon(today?.condition || 'Sunny')}
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-800">{today?.temp || 32}°</span>
                <span className="text-lg font-bold text-slate-400">C</span>
              </div>
              <p className="text-sm font-bold text-slate-600">{today?.condition || 'Sunny'}</p>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <Thermometer className="w-3 h-3" />
                  <span>Feels like 35°</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <Wind className="w-3 h-3" />
                  <span>12 km/h</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border flex items-start gap-3 max-w-xs ${getImpactColor(today?.impactOnSite || 'NONE')}`}>
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Site Impact Analysis</p>
              <p className="text-xs font-bold leading-relaxed">
                {today?.impactOnSite === 'STOP_WORK' ? 'Critical weather alert. All outdoor activities must be suspended.' : 
                 today?.impactOnSite === 'CAUTION' ? 'Moderate rain expected. Secure materials and monitor drainage.' : 
                 'Ideal conditions for all site activities. No weather-related delays expected.'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {forecast.slice(1, 7).map((day, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:border-blue-200 transition-all">
              <span className="text-[10px] font-bold text-slate-400 uppercase mb-3">{day.date}</span>
              <div className="mb-3 transform group-hover:scale-110 transition-transform">
                {getConditionIcon(day.condition)}
              </div>
              <p className="text-sm font-bold text-slate-800">{day.temp}°</p>
              <div className="flex items-center gap-1 mt-1">
                <CloudRain className="w-2.5 h-2.5 text-blue-400" />
                <span className="text-[10px] font-bold text-slate-400">{day.precipitationProbability}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
