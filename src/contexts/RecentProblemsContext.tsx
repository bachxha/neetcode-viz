import React, { createContext, useContext, useEffect, useState } from 'react';

interface RecentProblem {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timestamp: number;
}

interface RecentProblemsContextType {
  recentProblems: RecentProblem[];
  addRecentProblem: (problem: Omit<RecentProblem, 'timestamp'>) => void;
  clearRecentProblems: () => void;
  getTimeSinceVisited: (timestamp: number) => string;
}

const RecentProblemsContext = createContext<RecentProblemsContextType | undefined>(undefined);

export const useRecentProblems = () => {
  const context = useContext(RecentProblemsContext);
  if (context === undefined) {
    throw new Error('useRecentProblems must be used within a RecentProblemsProvider');
  }
  return context;
};

export const RecentProblemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize recent problems from localStorage
  const [recentProblems, setRecentProblems] = useState<RecentProblem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('neetcode-recent-problems');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Persist recent problems to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('neetcode-recent-problems', JSON.stringify(recentProblems));
  }, [recentProblems]);

  const addRecentProblem = (problem: Omit<RecentProblem, 'timestamp'>) => {
    setRecentProblems(prev => {
      // Remove existing entry if it exists
      const filtered = prev.filter(p => p.id !== problem.id);
      
      // Add new entry at the beginning
      const newEntry: RecentProblem = {
        ...problem,
        timestamp: Date.now()
      };
      
      const updated = [newEntry, ...filtered];
      
      // Keep only the last 10 problems
      return updated.slice(0, 10);
    });
  };

  const clearRecentProblems = () => {
    setRecentProblems([]);
  };

  const getTimeSinceVisited = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  };

  return (
    <RecentProblemsContext.Provider value={{ 
      recentProblems, 
      addRecentProblem, 
      clearRecentProblems,
      getTimeSinceVisited 
    }}>
      {children}
    </RecentProblemsContext.Provider>
  );
};