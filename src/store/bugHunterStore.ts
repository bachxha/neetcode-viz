/**
 * Bug Hunter Store
 * Tracks progress and stats for the buggy code review trainer
 */

import { useState, useEffect } from 'react';
import type { BugType } from '../data/buggyCodeChallenges';

// ===== Types =====

export interface BugAttempt {
  challengeId: string;
  timestamp: number;
  timeSpentMs: number;
  bugsFound: string[]; // bug IDs found
  bugsMissed: string[]; // bug IDs missed
  falsePositives: number; // lines marked that weren't bugs
  hintsUsed: number;
  score: number; // 0-100
  bugTypesCorrect: BugType[];
  bugTypesMissed: BugType[];
}

export interface BugTypeStats {
  bugType: BugType;
  totalEncountered: number;
  totalFound: number;
  accuracy: number; // 0-1
}

export interface BugHunterState {
  attempts: BugAttempt[];
  completedChallenges: Set<string>;
  currentStreak: number;
  bestStreak: number;
  lastActivityDate: string;
}

// ===== Local Storage =====

const STORAGE_KEY = 'algoforge-bug-hunter';

function loadFromStorage(): BugHunterState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        completedChallenges: new Set(parsed.completedChallenges || []),
      };
    }
  } catch (e) {
    console.error('Failed to load bug hunter progress:', e);
  }
  return {
    attempts: [],
    completedChallenges: new Set(),
    currentStreak: 0,
    bestStreak: 0,
    lastActivityDate: '',
  };
}

function saveToStorage(state: BugHunterState): void {
  try {
    const toStore = {
      ...state,
      completedChallenges: Array.from(state.completedChallenges),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch (e) {
    console.error('Failed to save bug hunter progress:', e);
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

function updateStreak(state: BugHunterState): BugHunterState {
  const today = getTodayString();
  const yesterday = getYesterdayString();

  if (state.lastActivityDate === today) {
    return state;
  }

  if (state.lastActivityDate === yesterday) {
    const newStreak = state.currentStreak + 1;
    return {
      ...state,
      lastActivityDate: today,
      currentStreak: newStreak,
      bestStreak: Math.max(state.bestStreak, newStreak),
    };
  }

  return {
    ...state,
    lastActivityDate: today,
    currentStreak: 1,
    bestStreak: Math.max(state.bestStreak, 1),
  };
}

// ===== Store =====

class BugHunterStore {
  private state: BugHunterState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = loadFromStorage();
  }

  getState(): BugHunterState {
    return this.state;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  private setState(newState: BugHunterState): void {
    this.state = newState;
    saveToStorage(this.state);
    this.notify();
  }

  /**
   * Record an attempt at a bug hunting challenge
   */
  recordAttempt(
    challengeId: string,
    bugsFound: string[],
    bugsMissed: string[],
    falsePositives: number,
    hintsUsed: number,
    timeSpentMs: number,
    bugTypesCorrect: BugType[],
    bugTypesMissed: BugType[]
  ): BugAttempt {
    // Calculate score
    const totalBugs = bugsFound.length + bugsMissed.length;
    const precision = bugsFound.length / Math.max(1, bugsFound.length + falsePositives);
    const recall = totalBugs > 0 ? bugsFound.length / totalBugs : 1;
    
    // F1-ish score with penalty for hints
    const hintPenalty = Math.max(0, 1 - hintsUsed * 0.1);
    const score = Math.round(((precision + recall) / 2) * hintPenalty * 100);

    const attempt: BugAttempt = {
      challengeId,
      timestamp: Date.now(),
      timeSpentMs,
      bugsFound,
      bugsMissed,
      falsePositives,
      hintsUsed,
      score,
      bugTypesCorrect,
      bugTypesMissed,
    };

    const newState = updateStreak({
      ...this.state,
      attempts: [...this.state.attempts, attempt],
      completedChallenges: new Set([...this.state.completedChallenges, challengeId]),
    });

    this.setState(newState);
    return attempt;
  }

  /**
   * Get overall stats
   */
  getStats(): {
    totalAttempts: number;
    perfectAttempts: number;
    averageScore: number;
    totalBugsFound: number;
    totalBugsMissed: number;
    totalFalsePositives: number;
    currentStreak: number;
    bestStreak: number;
    totalTimeMinutes: number;
    avgTimePerChallenge: number;
    uniqueChallengesCompleted: number;
  } {
    const attempts = this.state.attempts;
    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        perfectAttempts: 0,
        averageScore: 0,
        totalBugsFound: 0,
        totalBugsMissed: 0,
        totalFalsePositives: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalTimeMinutes: 0,
        avgTimePerChallenge: 0,
        uniqueChallengesCompleted: 0,
      };
    }

    const totalBugsFound = attempts.reduce((sum, a) => sum + a.bugsFound.length, 0);
    const totalBugsMissed = attempts.reduce((sum, a) => sum + a.bugsMissed.length, 0);
    const totalFalsePositives = attempts.reduce((sum, a) => sum + a.falsePositives, 0);
    const totalTimeMs = attempts.reduce((sum, a) => sum + a.timeSpentMs, 0);
    const perfectAttempts = attempts.filter(a => a.bugsMissed.length === 0 && a.falsePositives === 0).length;

    const today = getTodayString();
    const yesterday = getYesterdayString();
    const currentStreak = (this.state.lastActivityDate === today || this.state.lastActivityDate === yesterday)
      ? this.state.currentStreak
      : 0;

    return {
      totalAttempts: attempts.length,
      perfectAttempts,
      averageScore: Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length),
      totalBugsFound,
      totalBugsMissed,
      totalFalsePositives,
      currentStreak,
      bestStreak: this.state.bestStreak,
      totalTimeMinutes: Math.round(totalTimeMs / 60000),
      avgTimePerChallenge: Math.round(totalTimeMs / attempts.length / 1000),
      uniqueChallengesCompleted: this.state.completedChallenges.size,
    };
  }

  /**
   * Get stats by bug type
   */
  getBugTypeStats(): BugTypeStats[] {
    const typeMap = new Map<BugType, { encountered: number; found: number }>();
    
    this.state.attempts.forEach(attempt => {
      attempt.bugTypesCorrect.forEach(type => {
        const current = typeMap.get(type) || { encountered: 0, found: 0 };
        typeMap.set(type, {
          encountered: current.encountered + 1,
          found: current.found + 1,
        });
      });
      attempt.bugTypesMissed.forEach(type => {
        const current = typeMap.get(type) || { encountered: 0, found: 0 };
        typeMap.set(type, {
          encountered: current.encountered + 1,
          found: current.found,
        });
      });
    });

    return Array.from(typeMap.entries()).map(([bugType, stats]) => ({
      bugType,
      totalEncountered: stats.encountered,
      totalFound: stats.found,
      accuracy: stats.encountered > 0 ? stats.found / stats.encountered : 0,
    }));
  }

  /**
   * Get weakest bug types (lowest accuracy with min attempts)
   */
  getWeakestBugTypes(count: number = 3, minAttempts: number = 2): BugTypeStats[] {
    return this.getBugTypeStats()
      .filter(s => s.totalEncountered >= minAttempts)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, count);
  }

  /**
   * Get strongest bug types
   */
  getStrongestBugTypes(count: number = 3, minAttempts: number = 2): BugTypeStats[] {
    return this.getBugTypeStats()
      .filter(s => s.totalEncountered >= minAttempts)
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, count);
  }

  /**
   * Get recent attempts
   */
  getRecentAttempts(count: number = 10): BugAttempt[] {
    return [...this.state.attempts]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count);
  }

  /**
   * Check if a challenge has been completed
   */
  isCompleted(challengeId: string): boolean {
    return this.state.completedChallenges.has(challengeId);
  }

  /**
   * Get best score for a challenge
   */
  getBestScore(challengeId: string): number | null {
    const challengeAttempts = this.state.attempts.filter(a => a.challengeId === challengeId);
    if (challengeAttempts.length === 0) return null;
    return Math.max(...challengeAttempts.map(a => a.score));
  }

  /**
   * Get recommendations based on performance
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = this.getStats();
    const weakTypes = this.getWeakestBugTypes(2, 2);
    
    if (stats.totalAttempts === 0) {
      recommendations.push('Start with Easy challenges to build your bug-hunting intuition.');
      return recommendations;
    }

    if (stats.averageScore < 50) {
      recommendations.push('Focus on finding all bugs before submitting. Take your time to review each line.');
    }

    if (stats.totalFalsePositives > stats.totalBugsFound * 0.5) {
      recommendations.push('You\'re marking too many false positives. Be more precise - only mark lines you\'re confident about.');
    }

    if (weakTypes.length > 0) {
      const weakTypeName = weakTypes[0].bugType.replace(/-/g, ' ');
      recommendations.push(`Practice "${weakTypeName}" bugs - you\'re missing ${Math.round((1 - weakTypes[0].accuracy) * 100)}% of them.`);
    }

    if (stats.avgTimePerChallenge < 30) {
      recommendations.push('You\'re going very fast. Spend more time reviewing - careful analysis catches more bugs.');
    } else if (stats.avgTimePerChallenge > 180) {
      recommendations.push('Good thorough analysis! If you want to improve speed, focus on common bug patterns.');
    }

    if (stats.perfectAttempts / stats.totalAttempts < 0.2) {
      recommendations.push('Try to identify ALL bugs before submitting. Read through the code multiple times.');
    }

    return recommendations.slice(0, 3);
  }

  /**
   * Reset all progress
   */
  resetProgress(): void {
    this.setState({
      attempts: [],
      completedChallenges: new Set(),
      currentStreak: 0,
      bestStreak: 0,
      lastActivityDate: '',
    });
  }
}

// Singleton
export const bugHunterStore = new BugHunterStore();

// ===== React Hooks =====

export function useBugHunterStore(): BugHunterState {
  const [state, setState] = useState(bugHunterStore.getState());

  useEffect(() => {
    return bugHunterStore.subscribe(() => {
      setState(bugHunterStore.getState());
    });
  }, []);

  return state;
}

export function useBugHunterStats() {
  useBugHunterStore(); // Subscribe to changes
  return bugHunterStore.getStats();
}

export function useBugHunterRecommendations() {
  useBugHunterStore(); // Subscribe to changes
  return bugHunterStore.getRecommendations();
}
