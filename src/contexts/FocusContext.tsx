import React, { createContext, useContext, useEffect, useState } from 'react';

interface FocusContextType {
  isFocusMode: boolean;
  enterFocusMode: () => void;
  exitFocusMode: () => void;
  toggleFocusMode: () => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (context === undefined) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
};

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize focus mode from localStorage
  const [isFocusMode, setIsFocusMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('neetcode-focus-mode');
      return saved === 'true';
    }
    return false;
  });

  // Apply focus mode styles to document
  useEffect(() => {
    const root = document.documentElement;
    if (isFocusMode) {
      root.classList.add('focus-mode');
      root.setAttribute('data-focus-mode', 'true');
    } else {
      root.classList.remove('focus-mode');
      root.removeAttribute('data-focus-mode');
    }
  }, [isFocusMode]);

  // Handle Escape key to exit focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        e.preventDefault();
        exitFocusMode();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  const enterFocusMode = () => {
    setIsFocusMode(true);
    localStorage.setItem('neetcode-focus-mode', 'true');
  };

  const exitFocusMode = () => {
    setIsFocusMode(false);
    localStorage.setItem('neetcode-focus-mode', 'false');
  };

  const toggleFocusMode = () => {
    if (isFocusMode) {
      exitFocusMode();
    } else {
      enterFocusMode();
    }
  };

  return (
    <FocusContext.Provider value={{ 
      isFocusMode, 
      enterFocusMode, 
      exitFocusMode, 
      toggleFocusMode 
    }}>
      {children}
    </FocusContext.Provider>
  );
};