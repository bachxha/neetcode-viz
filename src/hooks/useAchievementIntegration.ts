import { useEffect } from 'react';
import { useAchievements } from '../contexts/AchievementsContext';
import { useCompletions } from '../contexts/CompletionContext';

export function useAchievementIntegration() {
  const { checkAchievements } = useAchievements();
  const { completionData } = useCompletions();

  // Check achievements whenever completions change
  useEffect(() => {
    checkAchievements({
      completions: completionData,
      completionCount: Object.keys(completionData).length
    });
  }, [completionData, checkAchievements]);
}

// Helper function to track "I'm Feeling Lucky" usage
export function trackLuckyUsage() {
  const currentCount = parseInt(localStorage.getItem('neetcode-lucky-usage') || '0');
  localStorage.setItem('neetcode-lucky-usage', (currentCount + 1).toString());
}

// Helper function to track Daily Challenge completion
export function trackDailyChallengeCompletion() {
  const currentCount = parseInt(localStorage.getItem('neetcode-daily-challenge-count') || '0');
  localStorage.setItem('neetcode-daily-challenge-count', (currentCount + 1).toString());
}