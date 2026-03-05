import React, { useEffect } from 'react';
import { Clock, Trophy } from 'lucide-react';
import { useTimeTracker } from '../contexts/TimeTrackerContext';

interface TimerProps {
  problemSlug: string;
  className?: string;
}

export const Timer: React.FC<TimerProps> = ({ problemSlug, className = '' }) => {
  const { 
    startTimer, 
    stopTimer, 
    getCurrentTimerDisplay, 
    formatTime, 
    getStats,
    isTimerRunning,
    currentProblemSlug 
  } = useTimeTracker();

  // Auto-start timer when component mounts
  useEffect(() => {
    startTimer(problemSlug);
    
    // Stop timer when component unmounts
    return () => {
      stopTimer();
    };
  }, [problemSlug, startTimer, stopTimer]);

  const stats = getStats(problemSlug);
  const isCurrentProblem = currentProblemSlug === problemSlug;

  return (
    <div className={`fixed top-6 right-6 z-50 space-y-2 ${className}`}>
      {/* Current Timer */}
      {isCurrentProblem && isTimerRunning && (
        <div 
          className="flex items-center gap-2 px-4 py-2 rounded-lg border backdrop-blur-sm"
          style={{
            backgroundColor: 'var(--bg-card)/90',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)'
          }}
        >
          <Clock size={16} className="text-blue-400" />
          <span className="font-mono text-lg font-semibold">
            {getCurrentTimerDisplay()}
          </span>
        </div>
      )}

      {/* Best Time */}
      {stats && stats.bestTime !== Infinity && (
        <div 
          className="flex items-center gap-2 px-4 py-2 rounded-lg border backdrop-blur-sm"
          style={{
            backgroundColor: 'var(--bg-card)/90',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-secondary)'
          }}
        >
          <Trophy size={16} className="text-yellow-400" />
          <span className="text-sm">
            Best: <span className="font-mono font-semibold text-yellow-400">{formatTime(stats.bestTime)}</span>
          </span>
        </div>
      )}
    </div>
  );
};