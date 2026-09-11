'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const ChessThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ChessThemeProvider({ children }) {
  const pathname = usePathname();
  const isChessRoute = pathname?.startsWith('/chess');
  const [theme, setThemeState] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('chess-portal-theme');
    if (saved === 'dark' || saved === 'light') {
      setThemeState(saved);
      if (isChessRoute) applyTheme(saved);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = prefersDark ? 'dark' : 'light';
      setThemeState(initial);
      if (isChessRoute) applyTheme(initial);
    }
  }, []);

  // Sync theme to root element only when on Chess routes
  useEffect(() => {
    if (!mounted) return;
    if (isChessRoute) {
      applyTheme(theme);
    }
  }, [isChessRoute, theme, mounted]);

  const applyTheme = (newTheme) => {
    // Only apply to HTML element if currently browsing Chess
    if (typeof window === 'undefined') return;
    const isCurrentChess = window.location.pathname.indexOf('/chess') === 0;
    if (!isCurrentChess) return;

    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    root.setAttribute('data-theme', newTheme);
  };

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('chess-portal-theme', newTheme);
    } catch (e) {}
    if (isChessRoute) {
      applyTheme(newTheme);
    }
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  return (
    <ChessThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
      {children}
    </ChessThemeContext.Provider>
  );
}

export function useChessTheme() {
  return useContext(ChessThemeContext);
}
