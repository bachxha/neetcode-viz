import React, { createContext, useContext, useEffect, useState } from 'react';
import { problems } from '../data/problems';

interface CompletionContextType {
  completions: string[];
  isCompleted: (problemId: string) => boolean;
  toggleCompletion: (problemId: string) => void;
  completionCount: number;
  getCompletionPercentage: (category: string) => number;
}

const CompletionContext = createContext<CompletionContextType | undefined>(undefined);

export const useCompletions = () => {
  const context = useContext(CompletionContext);
  if (context === undefined) {
    throw new Error('useCompletions must be used within a CompletionProvider');
  }
  return context;
};

export const CompletionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize completions from localStorage
  const [completions, setCompletions] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('neetcode-completions');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Persist completions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('neetcode-completions', JSON.stringify(completions));
  }, [completions]);

  const isCompleted = (problemId: string): boolean => {
    return completions.includes(problemId);
  };

  const toggleCompletion = (problemId: string) => {
    setCompletions(prev => {
      if (prev.includes(problemId)) {
        // Remove completion
        return prev.filter(id => id !== problemId);
      } else {
        // Add completion
        return [...prev, problemId];
      }
    });
  };

  const getCompletionPercentage = (category: string): number => {
    const categoryProblems = problems.filter(p => p.category === category);
    const completedInCategory = categoryProblems.filter(p => completions.includes(p.id));
    
    if (categoryProblems.length === 0) return 0;
    return Math.round((completedInCategory.length / categoryProblems.length) * 100);
  };

  const completionCount = completions.length;

  return (
    <CompletionContext.Provider value={{ completions, isCompleted, toggleCompletion, completionCount, getCompletionPercentage }}>
      {children}
    </CompletionContext.Provider>
  );
};