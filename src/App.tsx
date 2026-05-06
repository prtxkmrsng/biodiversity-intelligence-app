/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AppProvider, useAppContext } from './store/appContext';
import { HomeView } from './views/HomeView';
import { CaptureView } from './views/CaptureView';
import { ResultsView } from './views/ResultsView';
import { AdminView } from './views/AdminView';
import { mlPipeline } from './services/mlPipeline';
import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

function NavigationManager() {
  const { currentScreen } = useAppContext();

  return (
    <div className="flex-1 overflow-hidden relative">
      <AnimatePresence mode="wait">
        {currentScreen === 'home' && <HomeView key="home" />}
        {currentScreen === 'capture' && <CaptureView key="capture" />}
        {currentScreen === 'results' && <ResultsView key="results" />}
        {currentScreen === 'admin' && <AdminView key="admin" />}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        await mlPipeline.init('/mobilenet_v2.tflite', '/labels.txt');
        setIsInitializing(false);
      } catch (err) {
        console.error("Init Error", err);
        setInitError(err instanceof Error ? err.message : String(err));
      }
    }
    init();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[100dvh] bg-[#f8fafc] sm:bg-[#e2e8f0] text-slate-900 font-sans p-0 sm:p-6 overflow-hidden relative">
      
      {/* Mobile Simulator Shell */}
      <div className="w-full max-w-[400px] h-[100dvh] sm:h-[800px] sm:max-h-[85vh] sm:rounded-[32px] overflow-hidden bg-white sm:shadow-2xl relative flex flex-col z-10 sm:border-[8px] sm:border-slate-900">
        
        {isInitializing ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            {initError ? (
              <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-sm border border-red-100 shadow-sm">
                <p className="font-display font-bold text-lg mb-2">Initialization Failed</p>
                <p className="leading-relaxed">
                  {initError}
                </p>
                <p className="mt-4 text-xs font-medium uppercase tracking-wider text-red-500/80">
                  Ensure .tflite is valid.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 flex items-center justify-center mb-2">
                  <Loader2 className="animate-spin text-slate-800" size={24} />
                </div>
                <p className="text-slate-900 font-display font-medium text-lg tracking-tight">System Initializing</p>
                <p className="text-slate-500 font-medium text-sm">Loading ML Pipeline...</p>
                 <div className="h-1 w-24 bg-slate-100 rounded-full mt-4 overflow-hidden"><div className="h-full bg-slate-900 rounded-full animate-pulse w-full"></div></div>
              </div>
            )}
          </div>
        ) : (
          <AppProvider>
            <NavigationManager />
          </AppProvider>
        )}
      </div>
    </div>
  );
}
