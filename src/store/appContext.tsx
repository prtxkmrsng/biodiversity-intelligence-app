import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Prediction } from '@/src/services/mlPipeline';

export type Screen = 'home' | 'capture' | 'results' | 'admin';

export interface Observation {
  id: string;
  imageSrc: string;
  predictions: Prediction[];
  timestamp: Date;
}

interface AppContextType {
  currentScreen: Screen;
  navigate: (screen: Screen) => void;
  currentObservation: Observation | null;
  setCurrentObservation: (obs: Observation | null) => void;
  observationsHistory: Observation[];
  addObservation: (obs: Observation) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [currentObservation, setCurrentObservation] = useState<Observation | null>(null);
  const [observationsHistory, setObservationsHistory] = useState<Observation[]>([]);

  const addObservation = (obs: Observation) => {
    setObservationsHistory(prev => [obs, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      currentScreen,
      navigate: setCurrentScreen,
      currentObservation,
      setCurrentObservation,
      observationsHistory,
      addObservation
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}
