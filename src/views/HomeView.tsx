import React from 'react';
import { useAppContext } from '@/src/store/appContext';
import { Button } from '@/src/components/ui/button';
import { Leaf, Camera, Database } from 'lucide-react';
import { motion } from 'motion/react';

export function HomeView() {
  const { navigate } = useAppContext();

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-white"
    >
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-10">
        <div className="w-20 h-20 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center mb-2">
          <Leaf size={32} strokeWidth={1.5} />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-display font-medium tracking-tight text-slate-900">
            Darukaa.earth
          </h1>
          <p className="text-slate-500 font-sans text-base max-w-[250px] mx-auto leading-relaxed">
            Biodiversity intelligence platform for fieldworkers.
          </p>
        </div>

        <div className="w-full space-y-3 pt-6">
          <Button 
            className="w-full gap-2 text-base font-medium h-14 rounded-full bg-slate-900 text-white hover:bg-slate-800" 
            onClick={() => navigate('capture')}
          >
            <Camera size={20} strokeWidth={2} />
            Capture & Identify
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full gap-2 text-base font-medium h-14 rounded-full border-slate-200 text-slate-700 hover:bg-slate-50" 
            onClick={() => navigate('admin')}
          >
            <Database size={20} strokeWidth={2} />
            Field Data
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
