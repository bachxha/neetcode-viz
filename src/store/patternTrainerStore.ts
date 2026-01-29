/**
 * Pattern Trainer Store
 * Tracks training statistics for pattern recognition practice
 */

import { useState, useEffect } from 'react';

// ===== Types =====

export interface TrainingAttempt {
  problemId: string;
  timestamp: number;
  correctPatterns: string[];
  selectedPatterns: string[];
  isFullyCorrect: boolean;
  partialScore: number; // 0-1 score
  hintsUsed: number;
  timeSpentMs: number;
}

export interface PatternStats {
  patternId: string;
  totalAttempts: number;
  correctIdentifications: number;
  accuracy: number; // 0-1
}

export interface TrainingSession {
  startTime: number;
  endTime: number | null;
  attempts: TrainingAttempt[];
}

export interface PatternTrainerState {
  totalAttempts: number;
  correctAttempts: number; // Fully correct
  partiallyCorrectAttempts: number;
  overallAccuracy: number; // Weighted average
  patternStats: Record<string, PatternStats>;
  recentAttempts: TrainingAttempt[]; // Last 50
  currentStreak: number;
  bestStreak: number;
  lastTrainingDate: string | null; // YYYY-MM-DD
  totalTrainingTimeMs: number;
  sessionsCompleted: number;
}

// ===== Local Storage Persistence =====

const STORAGE_KEY = 'algoforge-pattern-trainer';
const MAX_RECENT_ATTEMPTS = 50;

function loadFromStorage(): PatternTrainerState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load pattern trainer state from localStorage:', e);
  }
  return getInitialState();
}

function saveToStorage(state: PatternTrainerState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save pattern trainer state to localStorage:', e);
  }
}

function getInitialState(): PatternTrainerState {
  return {
    totalAttempts: 0,
    correctAttempts: 0,
    partiallyCorrectAttempts: 0,
    overallAccuracy: 0,
    patternStats: {},
    recentAttempts: [],
    currentStreak: 0,
    bestStreak: 0,
    lastTrainingDate: null,
    totalTrainingTimeMs: 0,
    sessionsCompleted: 0,
  };
}

// ===== Helper Functions =====

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function calculatePartialScore(selected: string[], correct: string[]): number {
  if (correct.length === 0) return selected.length === 0 ? 1 : 0;
  
  const correctSet = new Set(correct);
  const selectedSet = new Set(selected);
  
  // Calculate true positives
  let truePositives = 0;
  selectedSet.forEach(p => {
    if (correctSet.has(p)) truePositives++;
  });
  
  // Calculate F1-like score
  if (truePositives === 0) return 0;
  
  const precision = truePositives / selected.length;
  const recall = truePositives / correct.length;
  
  // Penalize for wrong selections
  const f1 = 2 * (precision * recall) / (precision + recall);
  
  return Math.round(f1 * 100) / 100;
}

function isFullyCorrect(selected: string[], correct: string[]): boolean {
  if (selected.length !== correct.length) return false;
  const correctSet = new Set(correct);
  return selected.every(p => correctSet.has(p));
}

// ===== Pattern Trainer Store Class =====

class PatternTrainerStore {
  private state: PatternTrainerState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = loadFromStorage();
  }

  getState(): PatternTrainerState {
    return this.state;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  private setState(newState: PatternTrainerState): void {
    this.state = newState;
    saveToStorage(this.state);
    this.notify();
  }

  /**
   * Record a training attempt
   */
  recordAttempt(
    problemId: string,
    selectedPatterns: string[],
    correctPatterns: string[],
    hintsUsed: number,
    timeSpentMs: number
  ): TrainingAttempt {
    const partialScore = calculatePartialScore(selectedPatterns, correctPatterns);
    const fullyCorrect = isFullyCorrect(selectedPatterns, correctPatterns);
    const today = getTodayString();

    const attempt: TrainingAttempt = {
      problemId,
      timestamp: Date.now(),
      correctPatterns,
      selectedPatterns,
      isFullyCorrect: fullyCorrect,
      partialScore,
      hintsUsed,
      timeSpentMs,
    };

    // Update pattern-specific stats
    const newPatternStats = { ...this.state.patternStats };
    correctPatterns.forEach(patternId => {
      const existing = newPatternStats[patternId] || {
        patternId,
        totalAttempts: 0,
        correctIdentifications: 0,
        accuracy: 0,
      };

      const wasIdentified = selectedPatterns.includes(patternId);
      const newAttempts = existing.totalAttempts + 1;
      const newCorrect = existing.correctIdentifications + (wasIdentified ? 1 : 0);

      newPatternStats[patternId] = {
        ...existing,
        totalAttempts: newAttempts,
        correctIdentifications: newCorrect,
        accuracy: Math.round((newCorrect / newAttempts) * 100) / 100,
      };
    });

    // Update streak
    let newStreak = this.state.currentStreak;
    if (fullyCorrect) {
      newStreak++;
    } else {
      newStreak = 0;
    }

    // Update recent attempts (keep last N)
    const newRecentAttempts = [attempt, ...this.state.recentAttempts].slice(0, MAX_RECENT_ATTEMPTS);

    // Calculate new overall accuracy
    const newTotalAttempts = this.state.totalAttempts + 1;
    const newCorrectAttempts = this.state.correctAttempts + (fullyCorrect ? 1 : 0);
    const newPartiallyCorrect = this.state.partiallyCorrectAttempts + 
      (!fullyCorrect && partialScore > 0 ? 1 : 0);

    // Weighted accuracy: full correct = 1, partial = partialScore, wrong = 0
    const totalScore = newRecentAttempts.reduce((sum, a) => sum + (a.isFullyCorrect ? 1 : a.partialScore), 0);
    const newOverallAccuracy = Math.round((totalScore / newRecentAttempts.length) * 100) / 100;

    const newState: PatternTrainerState = {
      ...this.state,
      totalAttempts: newTotalAttempts,
      correctAttempts: newCorrectAttempts,
      partiallyCorrectAttempts: newPartiallyCorrect,
      overallAccuracy: newOverallAccuracy,
      patternStats: newPatternStats,
      recentAttempts: newRecentAttempts,
      currentStreak: newStreak,
      bestStreak: Math.max(this.state.bestStreak, newStreak),
      lastTrainingDate: today,
      totalTrainingTimeMs: this.state.totalTrainingTimeMs + timeSpentMs,
    };

    this.setState(newState);
    return attempt;
  }

  /**
   * Get stats for a specific pattern
   */
  getPatternStats(patternId: string): PatternStats | undefined {
    return this.state.patternStats[patternId];
  }

  /**
   * Get weakest patterns (lowest accuracy with at least 3 attempts)
   */
  getWeakestPatterns(limit: number = 5): PatternStats[] {
    return Object.values(this.state.patternStats)
      .filter(p => p.totalAttempts >= 3)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, limit);
  }

  /**
   * Get strongest patterns (highest accuracy with at least 3 attempts)
   */
  getStrongestPatterns(limit: number = 5): PatternStats[] {
    return Object.values(this.state.patternStats)
      .filter(p => p.totalAttempts >= 3)
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, limit);
  }

  /**
   * Get patterns that need more practice (least attempts)
   */
  getNeedsPracticePatterns(allPatternIds: string[], limit: number = 5): string[] {
    const attemptMap = new Map<string, number>();
    
    allPatternIds.forEach(id => {
      attemptMap.set(id, this.state.patternStats[id]?.totalAttempts || 0);
    });

    return Array.from(attemptMap.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, limit)
      .map(([id]) => id);
  }

  /**
   * Get recent training history
   */
  getRecentAttempts(limit: number = 10): TrainingAttempt[] {
    return this.state.recentAttempts.slice(0, limit);
  }

  /**
   * Get training summary statistics
   */
  getSummaryStats() {
    const state = this.state;
    const avgTimePerAttempt = state.totalAttempts > 0
      ? Math.round(state.totalTrainingTimeMs / state.totalAttempts / 1000)
      : 0;

    return {
      totalAttempts: state.totalAttempts,
      correctAttempts: state.correctAttempts,
      partiallyCorrectAttempts: state.partiallyCorrectAttempts,
      overallAccuracy: Math.round(state.overallAccuracy * 100),
      currentStreak: state.currentStreak,
      bestStreak: state.bestStreak,
      totalTrainingTimeMinutes: Math.round(state.totalTrainingTimeMs / 60000),
      avgTimePerAttemptSeconds: avgTimePerAttempt,
      patternsTracked: Object.keys(state.patternStats).length,
    };
  }

  /**
   * Get recommendations based on performance
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const weakest = this.getWeakestPatterns(3);

    if (weakest.length > 0) {
      const weakPatternNames = weakest.map(p => p.patternId);
      recommendations.push(
        `Focus on: ${weakPatternNames.join(', ')} - your accuracy is lowest for these patterns.`
      );
    }

    const state = this.state;
    if (state.totalAttempts < 10) {
      recommendations.push('Keep practicing! Aim for at least 10 problems to see meaningful stats.');
    } else if (state.overallAccuracy < 0.5) {
      recommendations.push('Review the pattern explanations before attempting more problems.');
    } else if (state.overallAccuracy >= 0.8) {
      recommendations.push('Great accuracy! Try harder problems or time yourself for extra challenge.');
    }

    if (state.currentStreak >= 5) {
      recommendations.push(`🔥 You're on a ${state.currentStreak}-problem streak! Keep it going!`);
    }

    return recommendations;
  }

  /**
   * Complete a training session
   */
  completeSession(): void {
    this.setState({
      ...this.state,
      sessionsCompleted: this.state.sessionsCompleted + 1,
    });
  }

  /**
   * Reset all training progress
   */
  resetProgress(): void {
    this.setState(getInitialState());
  }
}

// Singleton instance
export const patternTrainerStore = new PatternTrainerStore();

// ===== React Hooks =====

export function usePatternTrainerStore(): PatternTrainerState {
  const [state, setState] = useState(patternTrainerStore.getState());

  useEffect(() => {
    return patternTrainerStore.subscribe(() => {
      setState(patternTrainerStore.getState());
    });
  }, []);

  return state;
}

export function useTrainerStats() {
  void usePatternTrainerStore(); // Subscribe to changes
  return patternTrainerStore.getSummaryStats();
}

export function useTrainerRecommendations(): string[] {
  void usePatternTrainerStore(); // Subscribe to changes
  return patternTrainerStore.getRecommendations();
}
