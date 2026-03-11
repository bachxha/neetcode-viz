import { useState, useEffect } from 'react';
import { problems, type Problem } from '../data/problems';

interface DailyChallengeData {
  problem: Problem;
  isCompleted: boolean;
  timeUntilNext: number; // milliseconds
  streak: number;
}

// Simple seeded random number generator
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Convert to positive number between 0 and 1
  return Math.abs(hash) / 0x7fffffff;
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
}

function getTomorrowMidnight(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

function getDailyProblem(dateString: string): Problem {
  const random = seededRandom(dateString);
  const index = Math.floor(random * problems.length);
  return problems[index];
}

function isDailyCompleted(dateString: string): boolean {
  if (typeof window === 'undefined') return false;
  const key = `neetcode-daily-${dateString}`;
  return localStorage.getItem(key) !== null;
}

function markDailyCompleted(dateString: string, problemId: string): void {
  if (typeof window === 'undefined') return;
  const key = `neetcode-daily-${dateString}`;
  localStorage.setItem(key, problemId);
}

function calculateStreak(): number {
  if (typeof window === 'undefined') return 0;
  
  let streak = 0;
  let checkDate = new Date();
  
  // If today is not completed, start checking from yesterday
  const today = getTodayDateString();
  if (!isDailyCompleted(today)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  // Count consecutive days going backwards
  while (true) {
    const dateString = checkDate.toISOString().split('T')[0];
    if (isDailyCompleted(dateString)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
    
    // Prevent infinite loop by limiting to reasonable timeframe
    if (streak > 365) break;
  }
  
  return streak;
}

export function useDailyChallenge(): DailyChallengeData {
  const [timeUntilNext, setTimeUntilNext] = useState<number>(0);
  
  const today = getTodayDateString();
  const problem = getDailyProblem(today);
  
  // Check if today's challenge is completed either directly or through general completion
  let isCompleted = isDailyCompleted(today);
  
  // Also check if the problem is completed in general completion system
  if (!isCompleted && typeof window !== 'undefined') {
    const generalCompletions = localStorage.getItem('neetcode-completions');
    if (generalCompletions) {
      try {
        const completedProblems: string[] = JSON.parse(generalCompletions);
        if (completedProblems.includes(problem.id)) {
          // Auto-mark daily challenge as completed if general completion exists
          markDailyCompleted(today, problem.id);
          isCompleted = true;
        }
      } catch (error) {
        console.error('Failed to parse general completions:', error);
      }
    }
  }
  
  const streak = calculateStreak();
  
  // Update countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = getTomorrowMidnight();
      setTimeUntilNext(midnight.getTime() - now.getTime());
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Listen for completion changes and problem completions
  useEffect(() => {
    const handleStorageChange = () => {
      // This will trigger a re-render when localStorage changes
    };
    
    const handleProblemCompleted = (event: CustomEvent) => {
      const { problemId: completedProblemId } = event.detail;
      // Check if the completed problem is today's daily challenge
      if (completedProblemId === problem.id && !isCompleted) {
        markDailyCompleted(today, problem.id);
        // Trigger a re-render
        window.dispatchEvent(new Event('storage'));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('problemCompleted', handleProblemCompleted as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('problemCompleted', handleProblemCompleted as EventListener);
    };
  }, [problem.id, isCompleted, today]);
  
  return {
    problem,
    isCompleted,
    timeUntilNext,
    streak
  };
}

// Function to manually mark today's challenge as completed
export function completeDailyChallenge(): void {
  const today = getTodayDateString();
  const problem = getDailyProblem(today);
  markDailyCompleted(today, problem.id);
  
  // Track daily challenge completion for achievements
  if (typeof window !== 'undefined') {
    const currentCount = parseInt(localStorage.getItem('neetcode-daily-challenge-count') || '0');
    localStorage.setItem('neetcode-daily-challenge-count', (currentCount + 1).toString());
  }
}

// Function to check if a specific problem is today's challenge
export function isTodaysChallenge(problemId: string): boolean {
  const today = getTodayDateString();
  const todaysProblem = getDailyProblem(today);
  return todaysProblem.id === problemId;
}