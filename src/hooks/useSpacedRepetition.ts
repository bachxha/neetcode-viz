import { useState, useEffect, useCallback } from 'react';
import { useCompletions } from '../contexts/CompletionContext';

interface ReviewData {
  problemId: string;
  lastReview: number; // timestamp
  interval: number; // days
  easeFactor: number;
  reviewCount: number;
}

interface ProblemDueForReview {
  problemId: string;
  daysOverdue: number;
  urgencyScore: number;
  nextReviewDate: Date;
  lastReviewDate: Date;
  interval: number;
}

const STORAGE_KEY = 'neetcode-spaced-repetition';

// Simplified SM-2 algorithm intervals
const DEFAULT_INTERVALS = [1, 3, 7, 14, 30, 60, 120, 365];

export function useSpacedRepetition() {
  const { completions, completionData } = useCompletions();
  const [reviewData, setReviewData] = useState<Record<string, ReviewData>>({});

  // Load review data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setReviewData(parsed);
      } catch (error) {
        console.error('Failed to parse spaced repetition data:', error);
      }
    }
  }, []);

  // Save review data to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviewData));
  }, [reviewData]);

  // Initialize review data for newly completed problems
  useEffect(() => {
    const newProblems = completions.filter(problemId => !reviewData[problemId]);
    
    if (newProblems.length > 0) {
      setReviewData(prev => {
        const updated = { ...prev };
        
        newProblems.forEach(problemId => {
          // Use the actual completion timestamp from completionData
          const completionTime = completionData[problemId] || Date.now();
          
          updated[problemId] = {
            problemId,
            lastReview: completionTime,
            interval: DEFAULT_INTERVALS[0], // Start with 1 day
            easeFactor: 2.5, // Default ease factor
            reviewCount: 0
          };
        });
        
        return updated;
      });
    }
  }, [completions, completionData, reviewData]);

  // Calculate next review date for a problem
  const getNextReviewDate = useCallback((data: ReviewData): Date => {
    const nextReview = new Date(data.lastReview);
    nextReview.setDate(nextReview.getDate() + data.interval);
    return nextReview;
  }, []);

  // Check if a problem is due for review
  const isProblemDue = useCallback((data: ReviewData): boolean => {
    const nextReview = getNextReviewDate(data);
    return new Date() >= nextReview;
  }, [getNextReviewDate]);

  // Get problems due for review, sorted by urgency
  const getProblemsForReview = useCallback((): ProblemDueForReview[] => {
    const now = new Date();
    const dueProblems: ProblemDueForReview[] = [];

    Object.values(reviewData).forEach(data => {
      // Only include completed problems
      if (!completions.includes(data.problemId)) return;
      
      const nextReviewDate = getNextReviewDate(data);
      const lastReviewDate = new Date(data.lastReview);
      
      if (now >= nextReviewDate) {
        const daysOverdue = Math.floor(
          (now.getTime() - nextReviewDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // Calculate urgency score (higher = more urgent)
        // Factors: days overdue + interval weight
        const urgencyScore = daysOverdue + (data.interval * 0.1);
        
        dueProblems.push({
          problemId: data.problemId,
          daysOverdue,
          urgencyScore,
          nextReviewDate,
          lastReviewDate,
          interval: data.interval
        });
      }
    });

    // Sort by urgency (most urgent first)
    return dueProblems.sort((a, b) => b.urgencyScore - a.urgencyScore);
  }, [reviewData, completions, getNextReviewDate]);

  // Mark a problem as reviewed
  const markAsReviewed = useCallback((problemId: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
    setReviewData(prev => {
      const current = prev[problemId];
      if (!current) return prev;

      const updated = { ...prev };
      const now = Date.now();
      
      // Calculate new interval using simplified SM-2
      let newInterval: number;
      let newEaseFactor = current.easeFactor;
      
      // Adjust ease factor based on difficulty assessment
      if (difficulty === 'easy') {
        newEaseFactor = Math.min(newEaseFactor + 0.1, 3.0);
      } else if (difficulty === 'hard') {
        newEaseFactor = Math.max(newEaseFactor - 0.2, 1.3);
      }
      
      // Calculate new interval
      if (current.reviewCount < DEFAULT_INTERVALS.length) {
        // Use predefined intervals for first few reviews
        newInterval = DEFAULT_INTERVALS[current.reviewCount];
      } else {
        // Use ease factor for subsequent reviews
        newInterval = Math.round(current.interval * newEaseFactor);
        newInterval = Math.min(newInterval, 365); // Cap at 1 year
      }
      
      updated[problemId] = {
        ...current,
        lastReview: now,
        interval: newInterval,
        easeFactor: newEaseFactor,
        reviewCount: current.reviewCount + 1
      };
      
      return updated;
    });
  }, []);

  // Get review stats
  const getReviewStats = useCallback(() => {
    const totalProblems = Object.keys(reviewData).length;
    const dueProblems = getProblemsForReview().length;
    
    // Calculate problems by next review timeframe
    const now = new Date();
    const reviewSchedule = {
      today: 0,
      tomorrow: 0,
      thisWeek: 0,
      thisMonth: 0,
      later: 0
    };
    
    Object.values(reviewData).forEach(data => {
      if (!completions.includes(data.problemId)) return;
      
      const nextReview = getNextReviewDate(data);
      const daysUntil = Math.floor(
        (nextReview.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntil <= 0) {
        reviewSchedule.today++;
      } else if (daysUntil === 1) {
        reviewSchedule.tomorrow++;
      } else if (daysUntil <= 7) {
        reviewSchedule.thisWeek++;
      } else if (daysUntil <= 30) {
        reviewSchedule.thisMonth++;
      } else {
        reviewSchedule.later++;
      }
    });
    
    return {
      totalProblems,
      dueProblems,
      reviewSchedule
    };
  }, [reviewData, completions, getProblemsForReview, getNextReviewDate]);

  // Reset review data for a problem (if they want to start fresh)
  const resetProblemReview = useCallback((problemId: string) => {
    setReviewData(prev => {
      const updated = { ...prev };
      delete updated[problemId];
      return updated;
    });
  }, []);

  // Get specific problem's review data
  const getProblemReviewData = useCallback((problemId: string): ReviewData | null => {
    return reviewData[problemId] || null;
  }, [reviewData]);

  return {
    getProblemsForReview,
    markAsReviewed,
    getReviewStats,
    resetProblemReview,
    getProblemReviewData,
    isProblemDue: (problemId: string) => {
      const data = reviewData[problemId];
      return data ? isProblemDue(data) : false;
    },
    getNextReviewDate: (problemId: string) => {
      const data = reviewData[problemId];
      return data ? getNextReviewDate(data) : null;
    }
  };
}