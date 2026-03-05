import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';

interface TimeStats {
  lastTime: number;    // in ms
  bestTime: number;    // in ms  
  attempts: number;
}

interface TimeTrackerContextType {
  timeStats: Record<string, TimeStats>;
  isTimerRunning: boolean;
  currentTime: number;
  currentProblemSlug: string | null;
  startTimer: (problemSlug: string) => void;
  stopTimer: () => void;
  getStats: (problemSlug: string) => TimeStats | null;
  formatTime: (ms: number) => string;
  getTotalTimeSpent: () => number;
  getAverageTime: () => number;
  getFastestSolves: (limit?: number) => Array<{slug: string, time: number}>;
  getCurrentTimerDisplay: () => string;
}

const TimeTrackerContext = createContext<TimeTrackerContextType | undefined>(undefined);

export const useTimeTracker = () => {
  const context = useContext(TimeTrackerContext);
  if (context === undefined) {
    throw new Error('useTimeTracker must be used within a TimeTrackerProvider');
  }
  return context;
};

export const TimeTrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize time stats from localStorage
  const [timeStats, setTimeStats] = useState<Record<string, TimeStats>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('neetcode-time-stats');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentProblemSlug, setCurrentProblemSlug] = useState<string | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Persist time stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('neetcode-time-stats', JSON.stringify(timeStats));
  }, [timeStats]);

  // Timer update effect
  useEffect(() => {
    if (isTimerRunning && startTimeRef.current) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(Date.now() - startTimeRef.current!);
      }, 100); // Update every 100ms for smooth display

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isTimerRunning]);

  const startTimer = useCallback((problemSlug: string) => {
    // Stop any existing timer first
    stopTimer();
    
    setCurrentProblemSlug(problemSlug);
    setIsTimerRunning(true);
    setCurrentTime(0);
    startTimeRef.current = Date.now();
  }, []);

  const stopTimer = useCallback(() => {
    if (isTimerRunning && currentProblemSlug && startTimeRef.current) {
      const finalTime = Date.now() - startTimeRef.current;
      
      // Update stats
      setTimeStats(prev => {
        const existing = prev[currentProblemSlug] || { lastTime: 0, bestTime: Infinity, attempts: 0 };
        const newStats = {
          lastTime: finalTime,
          bestTime: Math.min(existing.bestTime, finalTime),
          attempts: existing.attempts + 1
        };
        
        return {
          ...prev,
          [currentProblemSlug]: newStats
        };
      });
    }

    setIsTimerRunning(false);
    setCurrentTime(0);
    setCurrentProblemSlug(null);
    startTimeRef.current = null;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isTimerRunning, currentProblemSlug]);

  const getStats = useCallback((problemSlug: string): TimeStats | null => {
    return timeStats[problemSlug] || null;
  }, [timeStats]);

  const formatTime = useCallback((ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const getTotalTimeSpent = useCallback((): number => {
    return Object.values(timeStats).reduce((total, stats) => total + stats.lastTime, 0);
  }, [timeStats]);

  const getAverageTime = useCallback((): number => {
    const problems = Object.values(timeStats);
    if (problems.length === 0) return 0;
    
    const totalTime = problems.reduce((sum, stats) => sum + stats.lastTime, 0);
    return totalTime / problems.length;
  }, [timeStats]);

  const getFastestSolves = useCallback((limit: number = 5): Array<{slug: string, time: number}> => {
    return Object.entries(timeStats)
      .map(([slug, stats]) => ({ slug, time: stats.bestTime }))
      .filter(item => item.time !== Infinity)
      .sort((a, b) => a.time - b.time)
      .slice(0, limit);
  }, [timeStats]);

  const getCurrentTimerDisplay = useCallback((): string => {
    return formatTime(currentTime);
  }, [currentTime, formatTime]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <TimeTrackerContext.Provider value={{
      timeStats,
      isTimerRunning,
      currentTime,
      currentProblemSlug,
      startTimer,
      stopTimer,
      getStats,
      formatTime,
      getTotalTimeSpent,
      getAverageTime,
      getFastestSolves,
      getCurrentTimerDisplay
    }}>
      {children}
    </TimeTrackerContext.Provider>
  );
};