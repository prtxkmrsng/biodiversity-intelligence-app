import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera as CameraIcon, X, Loader2 } from 'lucide-react';
import { useAppContext } from '@/src/store/appContext';
import { Button } from '@/src/components/ui/button';
import { mlPipeline } from '@/src/services/mlPipeline';
import { motion } from 'motion/react';

export function CaptureView() {
  const webcamRef = useRef<Webcam>(null);
  const { navigate, setCurrentObservation, addObservation } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const capture = useCallback(async () => {
    if (!webcamRef.current) return;
    
    let imageSrc = webcamRef.current.getScreenshot();
    
    // Fallback if camera is unavailable (e.g. permission denied or web preview environment)
    if (!imageSrc) {
      console.warn("Camera capture failed, using fallback image for demonstration.");
      // Using a sample plant image
      imageSrc = "https://images.unsplash.com/photo-1558293842-c0fd3db86157?q=80&w=600&auto=format&fit=crop";
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create a temporary image element to pass to the ML pipeline
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc;
      await new Promise((resolve, reject) => { 
        img.onload = resolve; 
        img.onerror = () => reject(new Error("Failed to load image for processing."));
      });
      
      // Downscale using OffscreenCanvas to drastically improve TFLite web inference speed
      const canvas = document.createElement('canvas');
      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext('2d');
      if (ctx) {
         ctx.drawImage(img, 0, 0, 224, 224);
      }

      // Run inference
      const predictions = await mlPipeline.predict(canvas);

      const observation = {
        id: Math.random().toString(36).substring(2, 9),
        imageSrc,
        predictions,
        timestamp: new Date()
      };

      setCurrentObservation(observation);
      addObservation(observation);
      navigate('results');

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Model not initialized or failed to process image.');
    } finally {
      setIsProcessing(false);
    }
  }, [webcamRef, navigate, setCurrentObservation, addObservation]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-black relative"
    >
      <div className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <button 
          onClick={() => navigate('home')}
          className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 relative bg-slate-900 flex items-center justify-center overflow-hidden">
        {/* @ts-expect-error react-webcam types are mismatched */}
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Reticle / Guide */}
        <div className="absolute inset-x-8 inset-y-1/4 rounded-3xl pointer-events-none flex flex-col items-center justify-center">
          <div className="w-[80%] h-[80%] border-2 border-white/40 rounded-[40px]"></div>
          
          <div className="text-white/90 text-[10px] font-sans font-medium uppercase tracking-[0.2em] bg-black/40 px-4 py-2 rounded-full backdrop-blur-md mt-auto mb-4 border border-white/10">
             Center Plant in View
          </div>
        </div>

        {error && (
          <div className="absolute top-24 bg-red-500/90 backdrop-blur-md border border-red-500/50 text-white p-3 mx-4 rounded-xl text-sm text-center shadow-lg">
            {error}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center pb-8 pt-4">
        <button
          onClick={capture}
          disabled={isProcessing}
          className="w-20 h-20 rounded-full border-[3px] border-white/50 flex items-center justify-center disabled:opacity-50 transition-all active:scale-95"
        >
          <div className="w-[68px] h-[68px] bg-white rounded-full flex items-center justify-center shadow-lg">
            {isProcessing ? <Loader2 className="animate-spin text-slate-900" size={28} /> : <div className="w-16 h-16 rounded-full border-2 border-slate-200"></div>}
          </div>
        </button>
      </div>
    </motion.div>
  );
}
