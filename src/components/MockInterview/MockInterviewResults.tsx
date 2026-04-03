import { useEffect } from 'react';
import { Trophy, Clock, CheckCircle, XCircle, RotateCcw, Home, Eye } from 'lucide-react';
import type { InterviewResult } from './MockInterviewSession';

interface MockInterviewResultsProps {
  results: InterviewResult[];
  company: string;
  difficulty: string;
  onTryAgain: () => void;
  onSelectProblem: (id: string) => void;
  onGoHome: () => void;
}

interface InterviewHistory {
  date: string;
  company: string;
  difficulty: string;
  completed: number;
  skipped: number;
  totalTimeSeconds: number;
  results: InterviewResult[];
}

export function MockInterviewResults({ results, company, difficulty, onTryAgain, onSelectProblem, onGoHome }: MockInterviewResultsProps) {
  const completed = results.filter(r => r.status === 'completed').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const totalTime = results.reduce((sum, r) => sum + r.timeSpentSeconds, 0);

  // Save to history on mount
  useEffect(() => {
    const history: InterviewHistory[] = JSON.parse(localStorage.getItem('mockInterviewHistory') || '[]');
    const newEntry: InterviewHistory = {
      date: new Date().toISOString(),
      company,
      difficulty,
      completed,
      skipped,
      totalTimeSeconds: totalTime,
      results,
    };
    history.unshift(newEntry);
    // Keep last 20 interviews
    localStorage.setItem('mockInterviewHistory', JSON.stringify(history.slice(0, 20)));
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getScoreColor = () => {
    const ratio = completed / results.length;
    if (ratio === 1) return 'from-green-400 to-emerald-500';
    if (ratio >= 0.5) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-pink-500';
  };

  const getScoreEmoji = () => {
    const ratio = completed / results.length;
    if (ratio === 1) return '🎉';
    if (ratio >= 0.5) return '👍';
    return '💪';
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto">
        {/* Results Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{getScoreEmoji()}</div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Interview Complete!
          </h1>
          <p className="text-slate-400">
            {company} • {difficulty}
          </p>
        </div>

        {/* Score Card */}
        <div 
          className="p-6 rounded-2xl border mb-6 text-center"
          style={{ 
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <div className={`text-5xl font-bold bg-gradient-to-r ${getScoreColor()} bg-clip-text text-transparent mb-2`}>
            {completed}/{results.length}
          </div>
          <div className="text-slate-400">Problems Completed</div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div 
            className="p-4 rounded-xl border text-center"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <Clock className="mx-auto mb-2 text-blue-400" size={24} />
            <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {formatTime(totalTime)}
            </div>
            <div className="text-xs text-slate-400">Total Time</div>
          </div>
          <div 
            className="p-4 rounded-xl border text-center"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <CheckCircle className="mx-auto mb-2 text-green-400" size={24} />
            <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {completed}
            </div>
            <div className="text-xs text-slate-400">Completed</div>
          </div>
          <div 
            className="p-4 rounded-xl border text-center"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <XCircle className="mx-auto mb-2 text-red-400" size={24} />
            <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {skipped}
            </div>
            <div className="text-xs text-slate-400">Skipped</div>
          </div>
        </div>

        {/* Problem Results */}
        <div 
          className="p-6 rounded-2xl border mb-8"
          style={{ 
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Trophy size={20} className="text-yellow-400" />
            Problem Breakdown
          </h2>
          <div className="space-y-4">
            {results.map((result) => (
              <div 
                key={result.problem.id}
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <div className="flex items-center gap-3">
                  {result.status === 'completed' ? (
                    <CheckCircle className="text-green-400" size={20} />
                  ) : (
                    <XCircle className="text-red-400" size={20} />
                  )}
                  <div>
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {result.problem.title}
                    </div>
                    <div className="text-xs text-slate-400">
                      {result.problem.difficulty} • {formatTime(result.timeSpentSeconds)}
                    </div>
                  </div>
                </div>
                {result.problem.hasVisualization && (
                  <button
                    onClick={() => onSelectProblem(result.problem.id)}
                    className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                  >
                    <Eye size={16} />
                    View Solution
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onTryAgain}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            Try Again
          </button>
          <button
            onClick={onGoHome}
            className="py-4 px-6 bg-gray-600/50 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all flex items-center justify-center gap-2 border border-gray-500/50"
          >
            <Home size={20} />
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
