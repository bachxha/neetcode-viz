import React, { createContext, useContext, useEffect, useState } from 'react';
import { problems } from '../data/problems';

interface CompletionContextType {
  completions: string[];
  completionData: Record<string, number>; // problemId -> timestamp
  isCompleted: (problemId: string) => boolean;
  toggleCompletion: (problemId: string) => void;
  completionCount: number;
  getCompletionPercentage: (category: string) => number;
  getCompletionTimestamp: (problemId: string) => number | null;
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
  // Initialize completion data from localStorage
  const [completionData, setCompletionData] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('neetcode-completion-data');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error('Failed to parse completion data:', error);
        }
      }
      
      // Migrate old completions array to new format
      const oldCompletions = localStorage.getItem('neetcode-completions');
      if (oldCompletions) {
        try {
          const oldArray: string[] = JSON.parse(oldCompletions);
          const migrated: Record<string, number> = {};
          const now = Date.now();
          oldArray.forEach(problemId => {
            migrated[problemId] = now; // Use current time as fallback
          });
          return migrated;
        } catch (error) {
          console.error('Failed to migrate old completions:', error);
        }
      }
    }
    return {};
  });

  // Derive completions array from completion data for backward compatibility
  const completions = Object.keys(completionData);

  // Persist completion data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('neetcode-completion-data', JSON.stringify(completionData));
    // Keep the old format for backward compatibility with other components
    localStorage.setItem('neetcode-completions', JSON.stringify(completions));
  }, [completionData, completions]);

  const isCompleted = (problemId: string): boolean => {
    return problemId in completionData;
  };

  const toggleCompletion = (problemId: string) => {
    setCompletionData(prev => {
      const updated = { ...prev };
      if (problemId in prev) {
        // Remove completion
        delete updated[problemId];
      } else {
        // Add completion with current timestamp
        updated[problemId] = Date.now();
      }
      return updated;
    });
  };

  const getCompletionPercentage = (category: string): number => {
    const categoryProblems = problems.filter(p => p.category === category);
    const completedInCategory = categoryProblems.filter(p => isCompleted(p.id));
    
    if (categoryProblems.length === 0) return 0;
    return Math.round((completedInCategory.length / categoryProblems.length) * 100);
  };

  const getCompletionTimestamp = (problemId: string): number | null => {
    return completionData[problemId] || null;
  };

  const completionCount = completions.length;

  return (
    <CompletionContext.Provider value={{ 
      completions, 
      completionData,
      isCompleted, 
      toggleCompletion, 
      completionCount, 
      getCompletionPercentage,
      getCompletionTimestamp 
    }}>
      {children}
    </CompletionContext.Provider>
  );
};