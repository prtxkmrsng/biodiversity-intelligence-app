import React from 'react';
import { useAppContext } from '@/src/store/appContext';
import { ChevronLeft, MapPin, Calendar, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export function AdminView() {
  const { navigate, observationsHistory } = useAppContext();

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-slate-50"
    >
      <div className="bg-white px-4 py-4 border-b border-slate-100 flex items-center sticky top-0 z-10 shadow-sm">
        <button 
          onClick={() => navigate('home')}
          className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-600 transition-colors mr-3"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="font-display font-medium text-lg text-slate-900">Field Data</h1>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-[0.2em]">
            History
          </h2>
          <span className="bg-slate-200 text-slate-700 font-bold py-1 px-2.5 rounded-full text-[10px] tracking-widest uppercase">
            {observationsHistory.length} total
          </span>
        </div>

        {observationsHistory.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-[24px] border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <MapPin size={24} />
            </div>
            <h3 className="text-slate-900 font-display font-medium mb-1 text-lg">No data collected yet</h3>
            <p className="text-slate-500 text-sm max-w-[200px] mx-auto leading-relaxed">Capture plant images to see them appear here.</p>
          </div>
        ) : (
          <div className="space-y-4 pb-8">
            {observationsHistory.map((obs) => (
              <div key={obs.id} className="bg-white border border-slate-100 rounded-[20px] p-4 flex gap-4 hover:shadow-md transition-shadow">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100/50 text-[10px] flex items-center justify-center">
                    <img 
                      src={obs.imageSrc} 
                      alt="Observation" 
                      className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex-1 py-0.5 flex flex-col min-w-0">
                  <h3 className="font-display font-medium text-slate-900 capitalize text-base mb-1 leading-tight truncate">
                    {obs.predictions[0]?.label.replace(/_/g, ' ') || 'Unknown'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-auto mt-0.5">
                    <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      {(obs.predictions[0]?.score * 100).toFixed(1)}% Match
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-2 pb-0.5">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-300" />
                      {obs.timestamp.toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-slate-300" />
                      {obs.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button className="mt-8 w-full h-14 text-sm font-medium border border-slate-200 rounded-full hover:bg-slate-50 text-slate-700 transition-colors">
                Export Dataset (CSV)
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
