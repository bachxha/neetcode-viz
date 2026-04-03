import { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, SkipForward, AlertTriangle } from 'lucide-react';
import type { Problem } from '../../data/problems';

interface MockInterviewSessionProps {
  problems: Problem[];
  durationMinutes: number;
  onComplete: (results: InterviewResult[]) => void;
}

export interface InterviewResult {
  problem: Problem;
  status: 'completed' | 'skipped';
  timeSpentSeconds: number;
}

export function MockInterviewSession({ problems, durationMinutes, onComplete }: MockInterviewSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<InterviewResult[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60);
  const [problemStartTime, setProblemStartTime] = useState(Date.now());

  const currentProblem = problems[currentIndex];
  const isLastProblem = currentIndex === problems.length - 1;
  const isLowTime = timeRemaining < 600; // Under 10 minutes

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Time's up - complete with remaining problems as skipped
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleTimeUp = useCallback(() => {
    const timeSpent = Math.floor((Date.now() - problemStartTime) / 1000);
    const finalResults = [...results];
    
    // Add current problem as skipped
    if (currentProblem) {
      finalResults.push({
        problem: currentProblem,
        status: 'skipped',
        timeSpentSeconds: timeSpent,
      });
    }
    
    // Add remaining problems as skipped with 0 time
    for (let i = currentIndex + 1; i < problems.length; i++) {
      finalResults.push({
        problem: problems[i],
        status: 'skipped',
        timeSpentSeconds: 0,
      });
    }
    
    onComplete(finalResults);
  }, [currentIndex, currentProblem, problems, problemStartTime, results, onComplete]);

  const handleProblemAction = (status: 'completed' | 'skipped') => {
    const timeSpent = Math.floor((Date.now() - problemStartTime) / 1000);
    const result: InterviewResult = {
      problem: currentProblem,
      status,
      timeSpentSeconds: timeSpent,
    };

    const newResults = [...results, result];
    setResults(newResults);

    if (isLastProblem) {
      onComplete(newResults);
    } else {
      setCurrentIndex(currentIndex + 1);
      setProblemStartTime(Date.now());
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'Hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Timer Bar */}
        <div 
          className={`p-4 rounded-xl mb-6 border ${
            isLowTime 
              ? 'bg-red-500/10 border-red-500/30' 
              : 'border-transparent'
          }`}
          style={{ backgroundColor: isLowTime ? undefined : 'var(--bg-card)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className={isLowTime ? 'text-red-400' : 'text-blue-400'} size={24} />
              <span 
                className={`text-3xl font-mono font-bold ${
                  isLowTime ? 'text-red-400 animate-pulse' : ''
                }`}
                style={{ color: isLowTime ? undefined : 'var(--text-primary)' }}
              >
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className="text-sm text-slate-400">
              Problem {currentIndex + 1} of {problems.length}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                isLowTime ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ 
                width: `${((durationMinutes * 60 - timeRemaining) / (durationMinutes * 60)) * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Low Time Warning */}
        {isLowTime && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
            <AlertTriangle className="text-red-400" size={20} />
            <span className="text-red-400 font-medium">
              Less than 10 minutes remaining!
            </span>
          </div>
        )}

        {/* Problem Card */}
        <div 
          className="p-8 rounded-2xl border shadow-xl"
          style={{ 
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-primary)'
          }}
        >
          {/* Problem Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(currentProblem.difficulty)}`}>
                {currentProblem.difficulty}
              </span>
              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                {currentProblem.category}
              </span>
            </div>
          </div>

          {/* Problem Title */}
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {currentProblem.title}
          </h2>

          {/* LeetCode Link */}
          <a 
            href={currentProblem.leetcodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mb-8 text-blue-400 hover:text-blue-300 underline"
          >
            Open on LeetCode →
          </a>

          {/* Interview Tips */}
          <div className="mb-8 p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
            <h3 className="font-semibold mb-2 text-yellow-400">💡 Interview Tips</h3>
            <ul className="text-sm space-y-1 text-slate-300">
              <li>• Think out loud as you solve</li>
              <li>• Discuss time/space complexity</li>
              <li>• Consider edge cases</li>
              <li>• Ask clarifying questions if needed</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => handleProblemAction('completed')}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} />
              {isLastProblem ? 'Finish Interview' : 'Done — Next Problem'}
            </button>
            <button
              onClick={() => handleProblemAction('skipped')}
              className="py-4 px-6 bg-gray-600/50 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all flex items-center justify-center gap-2 border border-gray-500/50"
            >
              <SkipForward size={20} />
              Skip
            </button>
          </div>
        </div>

        {/* No hints notice */}
        <div className="mt-6 text-center text-slate-500 text-sm">
          🚫 Hints and solutions are disabled during the interview
        </div>
      </div>
    </div>
  );
}
