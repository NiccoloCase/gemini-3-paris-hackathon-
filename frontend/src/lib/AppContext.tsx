import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

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
  logout: () => void;
}

const STORAGE_KEY = 'arcadia_user';

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { username: string; isLoggedIn: boolean; isOnboarded: boolean };
  } catch {
    return null;
  }
}

function saveUser(data: { username: string; isLoggedIn: boolean; isOnboarded: boolean }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function clearUser() {
  localStorage.removeItem(STORAGE_KEY);
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const cached = loadUser();
  const [isLoggedIn, _setLoggedIn] = useState(cached?.isLoggedIn ?? false);
  const [isOnboarded, _setOnboarded] = useState(cached?.isOnboarded ?? false);
  const [username, _setUsername] = useState(cached?.username ?? 'Player_One');
  const [onboardingAnswers, setAnswers] = useState<string[]>([]);

  const setLoggedIn = useCallback((v: boolean) => {
    _setLoggedIn(v);
    saveUser({ username, isLoggedIn: v, isOnboarded });
  }, [username, isOnboarded]);

  const setOnboarded = useCallback((v: boolean) => {
    _setOnboarded(v);
    saveUser({ username, isLoggedIn, isOnboarded: v });
  }, [username, isLoggedIn]);

  const setUsername = useCallback((v: string) => {
    _setUsername(v);
    saveUser({ username: v, isLoggedIn, isOnboarded });
  }, [isLoggedIn, isOnboarded]);

  const addAnswer = (a: string) => setAnswers(prev => [...prev, a]);
  const resetAnswers = () => setAnswers([]);

  const logout = useCallback(() => {
    clearUser();
    _setLoggedIn(false);
    _setOnboarded(false);
    _setUsername('Player_One');
    setAnswers([]);
  }, []);

  return (
    <AppContext.Provider value={{
      isLoggedIn, isOnboarded, username, onboardingAnswers,
      setLoggedIn, setOnboarded, setUsername, addAnswer, resetAnswers, logout,
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
