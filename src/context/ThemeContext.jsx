'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  useEffect(() => {
    try {
      localStorage.removeItem('carrompro-theme');
    } catch (e) {}
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'light', toggleTheme: () => {}, setTheme: () => {}, mounted: true }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
