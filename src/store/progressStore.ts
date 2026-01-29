import type { Difficulty } from '../data/problems';

// ===== Types =====

export interface ProblemProgress {
  problemId: string;
  solvedAt: number[]; // Array of timestamps - can solve multiple times
  difficulty: Difficulty;
  timeSpent?: number; // Optional, in seconds
  confidence: number; // 1-5 rating
  nextReviewAt: number; // Timestamp calculated using spaced repetition
  reviewCount: number;
}

export interface ProgressState {
  problems: Record<string, ProblemProgress>;
  lastActivityDate: string; // YYYY-MM-DD format
  streakCount: number;
}

// ===== Spaced Repetition Algorithm (SM-2 style) =====

/**
 * Calculate the ease factor based on confidence rating
 * Confidence 5: ease = 2.5 (Very confident - longer interval)
 * Confidence 4: ease = 2.0
 * Confidence 3: ease = 1.5
 * Confidence 2: ease = 1.2
 * Confidence 1: reset to 1 day (didn't remember)
 */
function getEaseFactor(confidence: number): number {
  const easeFactors: Record<number, number> = {
    5: 2.5,
    4: 2.0,
    3: 1.5,
    2: 1.2,
    1: 1.0, // Reset case
  };
  return easeFactors[confidence] ?? 1.5;
}

/**
 * Calculate the next review date based on SM-2 algorithm
 * Initial interval: 1 day
 * After each review: interval * ease factor
 */
export function calculateNextReviewAt(
  reviewCount: number,
  confidence: number,
  lastReviewAt: number
): number {
  // If confidence is 1, reset to 1 day from now
  if (confidence === 1) {
    return Date.now() + 24 * 60 * 60 * 1000; // 1 day
  }

  const easeFactor = getEaseFactor(confidence);
  
  // Base interval: 1 day for first review, then grows
  let intervalDays: number;
  if (reviewCount <= 1) {
    intervalDays = 1;
  } else {
    // Each review multiplies by ease factor
    intervalDays = Math.pow(easeFactor, reviewCount - 1);
  }

  // Cap at 180 days max interval
  intervalDays = Math.min(intervalDays, 180);

  return lastReviewAt + intervalDays * 24 * 60 * 60 * 1000;
}

// ===== Local Storage Persistence =====

const STORAGE_KEY = 'algoforge-progress';

function loadFromStorage(): ProgressState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load progress from localStorage:', e);
  }
  return {
    problems: {},
    lastActivityDate: '',
    streakCount: 0,
  };
}

function saveToStorage(state: ProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save progress to localStorage:', e);
  }
}

// ===== Streak Management =====

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

function updateStreak(state: ProgressState): ProgressState {
  const today = getTodayString();
  const yesterday = getYesterdayString();

  if (state.lastActivityDate === today) {
    // Already active today, no change
    return state;
  }

  if (state.lastActivityDate === yesterday) {
    // Consecutive day - increment streak
    return {
      ...state,
      lastActivityDate: today,
      streakCount: state.streakCount + 1,
    };
  }

  // Streak broken - reset to 1
  return {
    ...state,
    lastActivityDate: today,
    streakCount: 1,
  };
}

// ===== Progress Store API =====

class ProgressStore {
  private state: ProgressState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = loadFromStorage();
  }

  getState(): ProgressState {
    return this.state;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  private setState(newState: ProgressState): void {
    this.state = newState;
    saveToStorage(this.state);
    this.notify();
  }

  /**
   * Mark a problem as solved with a confidence rating
   */
  markSolved(
    problemId: string,
    difficulty: Difficulty,
    confidence: number,
    timeSpent?: number
  ): void {
    const now = Date.now();
    const existing = this.state.problems[problemId];
    
    const reviewCount = existing ? existing.reviewCount + 1 : 1;
    const solvedAt = existing ? [...existing.solvedAt, now] : [now];
    const nextReviewAt = calculateNextReviewAt(reviewCount, confidence, now);

    const updatedProgress: ProblemProgress = {
      problemId,
      solvedAt,
      difficulty,
      timeSpent: timeSpent ?? existing?.timeSpent,
      confidence,
      nextReviewAt,
      reviewCount,
    };

    const newState = updateStreak({
      ...this.state,
      problems: {
        ...this.state.problems,
        [problemId]: updatedProgress,
      },
    });

    this.setState(newState);
  }

  /**
   * Get progress for a specific problem
   */
  getProgress(problemId: string): ProblemProgress | undefined {
    return this.state.problems[problemId];
  }

  /**
   * Get all solved problems
   */
  getSolvedProblems(): ProblemProgress[] {
    return Object.values(this.state.problems);
  }

  /**
   * Get problems due for review (nextReviewAt < now)
   */
  getDueForReview(): ProblemProgress[] {
    const now = Date.now();
    return Object.values(this.state.problems)
      .filter((p) => p.nextReviewAt <= now)
      .sort((a, b) => a.nextReviewAt - b.nextReviewAt);
  }

  /**
   * Get current streak count
   */
  getStreakCount(): number {
    const today = getTodayString();
    const yesterday = getYesterdayString();
    
    // Check if streak is still valid
    if (
      this.state.lastActivityDate === today ||
      this.state.lastActivityDate === yesterday
    ) {
      return this.state.streakCount;
    }
    return 0;
  }

  /**
   * Get recent activity (last N solves)
   */
  getRecentActivity(limit: number = 10): Array<{ problem: ProblemProgress; timestamp: number }> {
    const activities: Array<{ problem: ProblemProgress; timestamp: number }> = [];

    Object.values(this.state.problems).forEach((problem) => {
      problem.solvedAt.forEach((timestamp) => {
        activities.push({ problem, timestamp });
      });
    });

    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get progress by difficulty
   */
  getProgressByDifficulty(): Record<Difficulty, number> {
    const counts: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };
    
    Object.values(this.state.problems).forEach((p) => {
      counts[p.difficulty]++;
    });

    return counts;
  }

  /**
   * Get progress by category (requires problems data)
   */
  getProgressByCategory(problemsData: Array<{ id: string; category: string }>): Record<string, { solved: number; total: number }> {
    const categoryMap: Record<string, { solved: number; total: number }> = {};

    problemsData.forEach((p) => {
      if (!categoryMap[p.category]) {
        categoryMap[p.category] = { solved: 0, total: 0 };
      }
      categoryMap[p.category].total++;
      if (this.state.problems[p.id]) {
        categoryMap[p.category].solved++;
      }
    });

    return categoryMap;
  }

  /**
   * Clear all progress (for testing/reset)
   */
  clearProgress(): void {
    this.setState({
      problems: {},
      lastActivityDate: '',
      streakCount: 0,
    });
  }
}

// Singleton instance
export const progressStore = new ProgressStore();

// ===== React Hook =====

import { useState, useEffect } from 'react';

export function useProgressStore(): ProgressState {
  const [state, setState] = useState(progressStore.getState());

  useEffect(() => {
    return progressStore.subscribe(() => {
      setState(progressStore.getState());
    });
  }, []);

  return state;
}

export function useProgress(problemId: string): ProblemProgress | undefined {
  const state = useProgressStore();
  return state.problems[problemId];
}
