import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface AppState {
  isLoggedIn: boolean;
  isOnboarded: boolean;
  username: string;
  userId: string;
  gameHtml: string;
  gameName: string;
  onboardingAnswers: string[];
  setLoggedIn: (v: boolean) => void;
  setOnboarded: (v: boolean) => void;
  setUsername: (v: string) => void;
  setUserId: (v: string) => void;
  setGameHtml: (v: string) => void;
  setGameName: (v: string) => void;
  addAnswer: (a: string) => void;
  resetAnswers: () => void;
  logout: () => void;
}

const STORAGE_KEY = 'arcadia_user';

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { username: string; isLoggedIn: boolean; isOnboarded: boolean; userId?: string };
  } catch {
    return null;
  }
}

function saveUser(data: { username: string; isLoggedIn: boolean; isOnboarded: boolean; userId: string }) {
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
  const [userId, _setUserId] = useState(cached?.userId ?? '');
  const [gameHtml, setGameHtml] = useState('');
  const [gameName, setGameName] = useState('');
  const [onboardingAnswers, setAnswers] = useState<string[]>([]);

  const persist = useCallback((patch: Partial<{ username: string; isLoggedIn: boolean; isOnboarded: boolean; userId: string }>) => {
    saveUser({
      username: patch.username ?? username,
      isLoggedIn: patch.isLoggedIn ?? isLoggedIn,
      isOnboarded: patch.isOnboarded ?? isOnboarded,
      userId: patch.userId ?? userId,
    });
  }, [username, isLoggedIn, isOnboarded, userId]);

  const setLoggedIn = useCallback((v: boolean) => { _setLoggedIn(v); persist({ isLoggedIn: v }); }, [persist]);
  const setOnboarded = useCallback((v: boolean) => { _setOnboarded(v); persist({ isOnboarded: v }); }, [persist]);
  const setUsername = useCallback((v: string) => { _setUsername(v); persist({ username: v }); }, [persist]);
  const setUserId = useCallback((v: string) => { _setUserId(v); persist({ userId: v }); }, [persist]);

  const addAnswer = (a: string) => setAnswers(prev => [...prev, a]);
  const resetAnswers = () => setAnswers([]);

  const logout = useCallback(() => {
    clearUser();
    _setLoggedIn(false);
    _setOnboarded(false);
    _setUsername('Player_One');
    _setUserId('');
    setGameHtml('');
    setGameName('');
    setAnswers([]);
  }, []);

  return (
    <AppContext.Provider value={{
      isLoggedIn, isOnboarded, username, userId, gameHtml, gameName, onboardingAnswers,
      setLoggedIn, setOnboarded, setUsername, setUserId, setGameHtml, setGameName,
      addAnswer, resetAnswers, logout,
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
