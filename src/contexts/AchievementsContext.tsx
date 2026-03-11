import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { problems } from '../data/problems';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (data: AchievementData) => boolean;
  progress?: (data: AchievementData) => { current: number; total: number };
}

export interface UnlockedBadge {
  badgeId: string;
  unlockedAt: number; // timestamp
}

export interface AchievementData {
  completions: Record<string, number>; // problemId -> timestamp
  completionCount: number;
  categories: Set<string>;
  streakData: {
    current: number;
    best: number;
    lastPractice: number | null;
  };
  luckyUsageCount: number;
  dailyChallengeCount: number;
  timeStats: Record<string, { times: number[]; fastestTime: number }>;
}

interface AchievementsContextType {
  badges: Badge[];
  unlockedBadges: UnlockedBadge[];
  newlyUnlocked: string[]; // badge IDs that were just unlocked
  isUnlocked: (badgeId: string) => boolean;
  getUnlockedBadge: (badgeId: string) => UnlockedBadge | null;
  checkAchievements: (data: Partial<AchievementData>) => void;
  clearNewlyUnlocked: () => void;
  getProgress: (badgeId: string) => { current: number; total: number } | null;
}

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

export const useAchievements = () => {
  const context = useContext(AchievementsContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementsProvider');
  }
  return context;
};

// Badge definitions
const BADGES: Badge[] = [
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Complete your first problem',
    icon: '🎯',
    condition: (data) => data.completionCount >= 1,
    progress: (data) => ({ current: Math.min(data.completionCount, 1), total: 1 })
  },
  {
    id: 'on-fire',
    name: 'On Fire',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    condition: (data) => data.streakData.current >= 3,
    progress: (data) => ({ current: Math.min(data.streakData.current, 3), total: 3 })
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Maintain a 7-day streak',
    icon: '💪',
    condition: (data) => data.streakData.current >= 7,
    progress: (data) => ({ current: Math.min(data.streakData.current, 7), total: 7 })
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete a problem under 5 minutes',
    icon: '⚡',
    condition: (data) => {
      return Object.values(data.timeStats).some(stat => stat.fastestTime < 5 * 60 * 1000);
    },
    progress: (data) => {
      const hasFastTime = Object.values(data.timeStats).some(stat => stat.fastestTime < 5 * 60 * 1000);
      return { current: hasFastTime ? 1 : 0, total: 1 };
    }
  },
  {
    id: 'category-master',
    name: 'Category Master',
    description: 'Complete all problems in any category',
    icon: '📚',
    condition: (data) => {
      const categories = ['Arrays & Hashing', 'Two Pointers', 'Sliding Window', 'Stack', 
                         'Binary Search', 'Linked List', 'Trees', 'Tries', 'Heap / Priority Queue',
                         'Backtracking', 'Graphs', 'Advanced Graphs', '1-D Dynamic Programming',
                         '2-D Dynamic Programming', 'Greedy', 'Intervals', 'Math & Geometry', 'Bit Manipulation'];
      
      return categories.some(category => {
        const categoryProblems = problems.filter(p => p.category === category);
        const completedInCategory = categoryProblems.filter(p => p.id in data.completions);
        return completedInCategory.length === categoryProblems.length && categoryProblems.length > 0;
      });
    },
    progress: (data) => {
      const categories = ['Arrays & Hashing', 'Two Pointers', 'Sliding Window', 'Stack', 
                         'Binary Search', 'Linked List', 'Trees', 'Tries', 'Heap / Priority Queue',
                         'Backtracking', 'Graphs', 'Advanced Graphs', '1-D Dynamic Programming',
                         '2-D Dynamic Programming', 'Greedy', 'Intervals', 'Math & Geometry', 'Bit Manipulation'];
      
      let maxPercentage = 0;
      categories.forEach(category => {
        const categoryProblems = problems.filter(p => p.category === category);
        if (categoryProblems.length > 0) {
          const completedInCategory = categoryProblems.filter(p => p.id in data.completions);
          const percentage = completedInCategory.length / categoryProblems.length;
          maxPercentage = Math.max(maxPercentage, percentage);
        }
      });
      
      return { current: Math.floor(maxPercentage * 100), total: 100 };
    }
  },
  {
    id: 'halfway-there',
    name: 'Half Way There',
    description: 'Complete 50% of all problems',
    icon: '🌟',
    condition: (data) => data.completionCount >= Math.ceil(problems.length * 0.5),
    progress: (data) => ({ current: data.completionCount, total: Math.ceil(problems.length * 0.5) })
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Complete all problems',
    icon: '🏆',
    condition: (data) => data.completionCount >= problems.length,
    progress: (data) => ({ current: data.completionCount, total: problems.length })
  },
  {
    id: 'lucky',
    name: 'Lucky',
    description: 'Use "I\'m Feeling Lucky" 5 times',
    icon: '🎲',
    condition: (data) => data.luckyUsageCount >= 5,
    progress: (data) => ({ current: Math.min(data.luckyUsageCount, 5), total: 5 })
  },
  {
    id: 'daily-driver',
    name: 'Daily Driver',
    description: 'Complete 7 Daily Challenges',
    icon: '📅',
    condition: (data) => data.dailyChallengeCount >= 7,
    progress: (data) => ({ current: Math.min(data.dailyChallengeCount, 7), total: 7 })
  }
];

// Helper function to calculate streak from completion data
const calculateStreak = (completions: Record<string, number>): { current: number; best: number; lastPractice: number | null } => {
  if (Object.keys(completions).length === 0) {
    return { current: 0, best: 0, lastPractice: null };
  }

  // Group completions by date
  const completionsByDate = new Map<string, number>();
  const timestamps = Object.values(completions);
  
  timestamps.forEach(timestamp => {
    const date = new Date(timestamp);
    const dateStr = date.toISOString().split('T')[0];
    completionsByDate.set(dateStr, Math.max(completionsByDate.get(dateStr) || 0, timestamp));
  });

  const sortedDates = Array.from(completionsByDate.keys()).sort();
  const lastPractice = Math.max(...timestamps);
  
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  // Calculate best streak
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0 || isConsecutiveDay(sortedDates[i-1], sortedDates[i])) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }
    bestStreak = Math.max(bestStreak, tempStreak);
  }
  
  // Calculate current streak (working backwards from today/yesterday)
  let checkDate = completionsByDate.has(todayStr) ? todayStr : 
                  completionsByDate.has(yesterdayStr) ? yesterdayStr : null;
  
  if (checkDate) {
    currentStreak = 1;
    const checkIndex = sortedDates.indexOf(checkDate);
    
    for (let i = checkIndex - 1; i >= 0; i--) {
      if (isConsecutiveDay(sortedDates[i], sortedDates[i + 1])) {
        currentStreak++;
      } else {
        break;
      }
    }
  }
  
  return { current: currentStreak, best: bestStreak, lastPractice };
};

const isConsecutiveDay = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays === 1;
};

export const AchievementsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize unlocked badges from localStorage
  const [unlockedBadges, setUnlockedBadges] = useState<UnlockedBadge[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('neetcode-achievements');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error('Failed to parse achievements data:', error);
        }
      }
    }
    return [];
  });

  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

  // Persist unlocked badges to localStorage
  useEffect(() => {
    localStorage.setItem('neetcode-achievements', JSON.stringify(unlockedBadges));
  }, [unlockedBadges]);

  const isUnlocked = useCallback((badgeId: string): boolean => {
    return unlockedBadges.some(badge => badge.badgeId === badgeId);
  }, [unlockedBadges]);

  const getUnlockedBadge = useCallback((badgeId: string): UnlockedBadge | null => {
    return unlockedBadges.find(badge => badge.badgeId === badgeId) || null;
  }, [unlockedBadges]);

  const getProgress = useCallback((badgeId: string): { current: number; total: number } | null => {
    const badge = BADGES.find(b => b.id === badgeId);
    if (!badge?.progress) return null;

    // Get current data from localStorage to calculate progress
    const completionData = localStorage.getItem('neetcode-completion-data');
    const luckyCount = parseInt(localStorage.getItem('neetcode-lucky-usage') || '0');
    const dailyChallengeCount = parseInt(localStorage.getItem('neetcode-daily-challenge-count') || '0');
    const timeStatsData = localStorage.getItem('neetcode-time-stats');

    let completions: Record<string, number> = {};
    let timeStats: Record<string, any> = {};

    try {
      completions = completionData ? JSON.parse(completionData) : {};
      timeStats = timeStatsData ? JSON.parse(timeStatsData) : {};
    } catch (error) {
      console.error('Error parsing localStorage data:', error);
    }

    const streakData = calculateStreak(completions);
    
    // Convert timeStats to the format expected by badge conditions
    const formattedTimeStats: Record<string, { times: number[]; fastestTime: number }> = {};
    Object.entries(timeStats).forEach(([problemId, stats]: [string, any]) => {
      if (stats && Array.isArray(stats.times) && stats.times.length > 0) {
        formattedTimeStats[problemId] = {
          times: stats.times,
          fastestTime: Math.min(...stats.times)
        };
      }
    });

    const data: AchievementData = {
      completions,
      completionCount: Object.keys(completions).length,
      categories: new Set(Object.keys(completions).map(id => {
        const problem = problems.find(p => p.id === id);
        return problem?.category || '';
      }).filter(Boolean)),
      streakData,
      luckyUsageCount: luckyCount,
      dailyChallengeCount,
      timeStats: formattedTimeStats
    };

    return badge.progress(data);
  }, []);

  const checkAchievements = useCallback((partialData: Partial<AchievementData>) => {
    // Get current data from localStorage
    const completionData = localStorage.getItem('neetcode-completion-data');
    const luckyCount = parseInt(localStorage.getItem('neetcode-lucky-usage') || '0');
    const dailyChallengeCount = parseInt(localStorage.getItem('neetcode-daily-challenge-count') || '0');
    const timeStatsData = localStorage.getItem('neetcode-time-stats');

    let completions: Record<string, number> = {};
    let timeStats: Record<string, any> = {};

    try {
      completions = completionData ? JSON.parse(completionData) : {};
      timeStats = timeStatsData ? JSON.parse(timeStatsData) : {};
    } catch (error) {
      console.error('Error parsing localStorage data:', error);
    }

    const streakData = calculateStreak(completions);
    
    // Convert timeStats to the format expected by badge conditions
    const formattedTimeStats: Record<string, { times: number[]; fastestTime: number }> = {};
    Object.entries(timeStats).forEach(([problemId, stats]: [string, any]) => {
      if (stats && Array.isArray(stats.times) && stats.times.length > 0) {
        formattedTimeStats[problemId] = {
          times: stats.times,
          fastestTime: Math.min(...stats.times)
        };
      }
    });

    const fullData: AchievementData = {
      completions,
      completionCount: Object.keys(completions).length,
      categories: new Set(Object.keys(completions).map(id => {
        const problem = problems.find(p => p.id === id);
        return problem?.category || '';
      }).filter(Boolean)),
      streakData,
      luckyUsageCount: luckyCount,
      dailyChallengeCount,
      timeStats: formattedTimeStats,
      ...partialData
    };

    const newUnlocked: string[] = [];

    BADGES.forEach(badge => {
      if (!isUnlocked(badge.id) && badge.condition(fullData)) {
        newUnlocked.push(badge.id);
      }
    });

    if (newUnlocked.length > 0) {
      const timestamp = Date.now();
      const newBadges = newUnlocked.map(badgeId => ({
        badgeId,
        unlockedAt: timestamp
      }));

      setUnlockedBadges(prev => [...prev, ...newBadges]);
      setNewlyUnlocked(prev => [...prev, ...newUnlocked]);
    }
  }, [isUnlocked]);

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked([]);
  }, []);

  return (
    <AchievementsContext.Provider value={{
      badges: BADGES,
      unlockedBadges,
      newlyUnlocked,
      isUnlocked,
      getUnlockedBadge,
      checkAchievements,
      clearNewlyUnlocked,
      getProgress
    }}>
      {children}
    </AchievementsContext.Provider>
  );
};