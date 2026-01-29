/**
 * Verbal Trainer Store
 * Tracks verbal explanation practice sessions and progress
 */

import { useState, useEffect } from 'react';
import { explanationCheckpoints } from '../data/verbalCheckpoints';

// ===== Types =====

export interface VerbalSession {
  id: string;
  problemId: string;
  timestamp: number;
  duration: number; // in seconds
  transcript: string;
  score: number;
  checkpointsCovered: string[];
  checkpointsMissed: string[];
  fillerWordCount: number;
  wordCount: number;
}

export interface CheckpointPerformance {
  checkpointId: string;
  timesAttempted: number;
  timesCovered: number;
  coverageRate: number; // 0-1
}

export interface VerbalTrainerState {
  sessions: VerbalSession[];
  totalSessions: number;
  averageScore: number;
  averageDuration: number;
  averageFillerWords: number;
  checkpointPerformance: Record<string, CheckpointPerformance>;
  problemsExplained: string[];
  currentStreak: number;
  bestStreak: number;
  lastSessionDate: string | null;
  totalPracticeTimeSeconds: number;
}

// ===== Local Storage Persistence =====

const STORAGE_KEY = 'algoforge-verbal-trainer';
const MAX_SESSIONS = 100;

function getInitialState(): VerbalTrainerState {
  return {
    sessions: [],
    totalSessions: 0,
    averageScore: 0,
    averageDuration: 0,
    averageFillerWords: 0,
    checkpointPerformance: {},
    problemsExplained: [],
    currentStreak: 0,
    bestStreak: 0,
    lastSessionDate: null,
    totalPracticeTimeSeconds: 0,
  };
}

function loadFromStorage(): VerbalTrainerState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load verbal trainer state from localStorage:', e);
  }
  return getInitialState();
}

function saveToStorage(state: VerbalTrainerState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save verbal trainer state to localStorage:', e);
  }
}

// ===== Helper Functions =====

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

function generateSessionId(): string {
  return `vs_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ===== Verbal Trainer Store Class =====

class VerbalTrainerStore {
  private state: VerbalTrainerState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = loadFromStorage();
  }

  getState(): VerbalTrainerState {
    return this.state;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  private setState(newState: VerbalTrainerState): void {
    this.state = newState;
    saveToStorage(this.state);
    this.notify();
  }

  /**
   * Record a new verbal explanation session
   */
  recordSession(
    problemId: string,
    duration: number,
    transcript: string,
    score: number,
    checkpointsCovered: string[],
    checkpointsMissed: string[],
    fillerWordCount: number,
    wordCount: number
  ): VerbalSession {
    const today = getTodayString();
    const yesterday = getYesterdayString();

    const session: VerbalSession = {
      id: generateSessionId(),
      problemId,
      timestamp: Date.now(),
      duration,
      transcript,
      score,
      checkpointsCovered,
      checkpointsMissed,
      fillerWordCount,
      wordCount,
    };

    // Update sessions list (keep last N)
    const newSessions = [session, ...this.state.sessions].slice(0, MAX_SESSIONS);

    // Update checkpoint performance
    const newCheckpointPerformance = { ...this.state.checkpointPerformance };
    
    explanationCheckpoints.forEach(cp => {
      const existing = newCheckpointPerformance[cp.id] || {
        checkpointId: cp.id,
        timesAttempted: 0,
        timesCovered: 0,
        coverageRate: 0,
      };

      const wasCovered = checkpointsCovered.includes(cp.id);
      const newAttempted = existing.timesAttempted + 1;
      const newCovered = existing.timesCovered + (wasCovered ? 1 : 0);

      newCheckpointPerformance[cp.id] = {
        ...existing,
        timesAttempted: newAttempted,
        timesCovered: newCovered,
        coverageRate: Math.round((newCovered / newAttempted) * 100) / 100,
      };
    });

    // Update problems explained
    const newProblemsExplained = this.state.problemsExplained.includes(problemId)
      ? this.state.problemsExplained
      : [...this.state.problemsExplained, problemId];

    // Update streak
    let newStreak = this.state.currentStreak;
    if (this.state.lastSessionDate === today) {
      // Already practiced today, no streak change
    } else if (this.state.lastSessionDate === yesterday) {
      // Consecutive day
      newStreak++;
    } else {
      // Streak broken or first session
      newStreak = 1;
    }

    // Calculate new averages
    const totalSessions = this.state.totalSessions + 1;
    const totalScore = this.state.averageScore * this.state.totalSessions + score;
    const totalDuration = this.state.averageDuration * this.state.totalSessions + duration;
    const totalFillers = this.state.averageFillerWords * this.state.totalSessions + fillerWordCount;

    const newState: VerbalTrainerState = {
      sessions: newSessions,
      totalSessions,
      averageScore: Math.round(totalScore / totalSessions),
      averageDuration: Math.round(totalDuration / totalSessions),
      averageFillerWords: Math.round((totalFillers / totalSessions) * 10) / 10,
      checkpointPerformance: newCheckpointPerformance,
      problemsExplained: newProblemsExplained,
      currentStreak: newStreak,
      bestStreak: Math.max(this.state.bestStreak, newStreak),
      lastSessionDate: today,
      totalPracticeTimeSeconds: this.state.totalPracticeTimeSeconds + duration,
    };

    this.setState(newState);
    return session;
  }

  /**
   * Get recent sessions
   */
  getRecentSessions(limit: number = 10): VerbalSession[] {
    return this.state.sessions.slice(0, limit);
  }

  /**
   * Get sessions for a specific problem
   */
  getSessionsForProblem(problemId: string): VerbalSession[] {
    return this.state.sessions.filter(s => s.problemId === problemId);
  }

  /**
   * Get weakest checkpoints (lowest coverage rate)
   */
  getWeakestCheckpoints(limit: number = 3): CheckpointPerformance[] {
    return Object.values(this.state.checkpointPerformance)
      .filter(cp => cp.timesAttempted >= 2) // At least 2 attempts
      .sort((a, b) => a.coverageRate - b.coverageRate)
      .slice(0, limit);
  }

  /**
   * Get strongest checkpoints (highest coverage rate)
   */
  getStrongestCheckpoints(limit: number = 3): CheckpointPerformance[] {
    return Object.values(this.state.checkpointPerformance)
      .filter(cp => cp.timesAttempted >= 2)
      .sort((a, b) => b.coverageRate - a.coverageRate)
      .slice(0, limit);
  }

  /**
   * Get summary statistics
   */
  getSummaryStats() {
    const state = this.state;
    return {
      totalSessions: state.totalSessions,
      averageScore: state.averageScore,
      averageDuration: state.averageDuration,
      averageFillerWords: state.averageFillerWords,
      problemsExplained: state.problemsExplained.length,
      currentStreak: state.currentStreak,
      bestStreak: state.bestStreak,
      totalPracticeMinutes: Math.round(state.totalPracticeTimeSeconds / 60),
    };
  }

  /**
   * Get improvement recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const weakest = this.getWeakestCheckpoints(2);

    if (weakest.length > 0) {
      const checkpointNames = weakest.map(cp => {
        const checkpoint = explanationCheckpoints.find(c => c.id === cp.checkpointId);
        return checkpoint?.label || cp.checkpointId;
      });
      recommendations.push(`Focus on: ${checkpointNames.join(', ')}`);
    }

    if (this.state.averageFillerWords > 5) {
      recommendations.push('Practice pausing instead of using filler words.');
    }

    if (this.state.averageDuration < 60 && this.state.totalSessions >= 3) {
      recommendations.push('Try to explain in more detail - aim for 1-2 minutes.');
    }

    if (this.state.averageDuration > 300 && this.state.totalSessions >= 3) {
      recommendations.push('Practice being more concise - interviewers appreciate brevity.');
    }

    if (this.state.totalSessions < 5) {
      recommendations.push('Keep practicing! Aim for at least 5 sessions to build fluency.');
    }

    if (this.state.currentStreak >= 3) {
      recommendations.push(`🔥 ${this.state.currentStreak}-day streak! Keep it going!`);
    }

    return recommendations;
  }

  /**
   * Get best session for a problem
   */
  getBestSession(problemId: string): VerbalSession | undefined {
    const sessions = this.getSessionsForProblem(problemId);
    if (sessions.length === 0) return undefined;
    return sessions.reduce((best, s) => s.score > best.score ? s : best);
  }

  /**
   * Reset all progress
   */
  resetProgress(): void {
    this.setState(getInitialState());
  }
}

// Singleton instance
export const verbalTrainerStore = new VerbalTrainerStore();

// ===== React Hooks =====

export function useVerbalTrainerStore(): VerbalTrainerState {
  const [state, setState] = useState(verbalTrainerStore.getState());

  useEffect(() => {
    return verbalTrainerStore.subscribe(() => {
      setState(verbalTrainerStore.getState());
    });
  }, []);

  return state;
}

export function useVerbalStats() {
  void useVerbalTrainerStore(); // Subscribe to changes
  return verbalTrainerStore.getSummaryStats();
}

export function useVerbalRecommendations(): string[] {
  void useVerbalTrainerStore(); // Subscribe to changes
  return verbalTrainerStore.getRecommendations();
}
