import React from 'react';
import { useAppContext } from '@/src/store/appContext';
import { Button } from '@/src/components/ui/button';
import { ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function ResultsView() {
  const { currentObservation, navigate } = useAppContext();

  if (!currentObservation) {
    navigate('home');
    return null;
  }

  const { imageSrc, predictions } = currentObservation;
  const topPrediction = predictions[0];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-white relative overflow-y-auto"
    >
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center bg-gradient-to-b from-black/50 to-transparent">
        <button 
          onClick={() => navigate('home')}
          className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="relative aspect-[4/3] w-full bg-slate-900">
        <img 
          src={imageSrc} 
          alt="Captured specimen" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      <div className="flex-1 p-6 space-y-8 relative z-20">
        <div>
          <h2 className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">
            Primary Match
          </h2>
          {topPrediction ? (
            <div className="bg-slate-50 rounded-[20px] p-5 border border-slate-100 flex flex-col gap-2">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-2xl font-display font-medium text-slate-900 capitalize truncate pr-4">
                  {topPrediction.label.replace(/_/g, ' ')}
                </h3>
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold shrink-0">
                  {(topPrediction.score * 100).toFixed(1)}%
                </div>
              </div>
              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-slate-900 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${topPrediction.score * 100}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 rounded-[20px] p-5 border border-orange-100 flex items-start gap-4 text-orange-800">
              <div className="mt-1">
                <AlertCircle size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-display font-medium mb-1">Uncertain Match</h3>
                <p className="text-sm text-orange-700/80">Could not identify any plants with high confidence.</p>
              </div>
            </div>
          )}
        </div>

        {predictions.length > 1 && (
          <div>
            <h2 className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
              Alternative Matches
            </h2>
            <div className="space-y-3">
              {predictions.slice(1).map((pred, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="capitalize text-slate-700 font-medium text-sm truncate pr-4">
                      {pred.label.replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-500 text-xs font-sans font-medium">
                       {(pred.score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-slate-300 h-full rounded-full" style={{ width: `${pred.score * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-6 pb-8 space-y-3 mt-auto">
          <Button className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-full h-14 font-medium text-base" onClick={() => navigate('capture')}>
            Save & Record Another
          </Button>
          <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 rounded-full h-14 font-medium text-base" onClick={() => navigate('home')}>
            Discard
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
