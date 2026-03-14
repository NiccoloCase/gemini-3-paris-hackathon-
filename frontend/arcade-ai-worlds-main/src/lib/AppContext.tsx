import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppState {
  isLoggedIn: boolean;
  isOnboarded: boolean;
  username: string;
  onboardingAnswers: string[];
  setLoggedIn: (v: boolean) => void;
  setOnboarded: (v: boolean) => void;
  setUsername: (v: string) => void;
  addAnswer: (a: string) => void;
  resetAnswers: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [isOnboarded, setOnboarded] = useState(false);
  const [username, setUsername] = useState('Player_One');
  const [onboardingAnswers, setAnswers] = useState<string[]>([]);

  const addAnswer = (a: string) => setAnswers(prev => [...prev, a]);
  const resetAnswers = () => setAnswers([]);

  return (
    <AppContext.Provider value={{
      isLoggedIn, isOnboarded, username, onboardingAnswers,
      setLoggedIn, setOnboarded, setUsername, addAnswer, resetAnswers,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
