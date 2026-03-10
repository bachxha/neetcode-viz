import { useDailyChallenge, completeDailyChallenge } from '../hooks/useDailyChallenge';
import { useCompletions } from '../contexts/CompletionContext';
import { Calendar, Clock, CheckCircle, Play, Flame, Star, ExternalLink } from 'lucide-react';

interface DailyChallengeProps {
  onSelectProblem: (problemId: string) => void;
}

function DifficultyBadge({ difficulty }: { difficulty: 'Easy' | 'Medium' | 'Hard' }) {
  const colors = {
    Easy: 'bg-green-500/20 text-green-400 border-green-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Hard: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[difficulty]}`}>
      {difficulty}
    </span>
  );
}

function formatTimeUntil(milliseconds: number): string {
  if (milliseconds <= 0) return '0s';
  
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

export function DailyChallenge({ onSelectProblem }: DailyChallengeProps) {
  const { problem, isCompleted, timeUntilNext, streak } = useDailyChallenge();
  const { completions, toggleCompletion } = useCompletions();
  
  // Check if problem is completed in general (not just daily)
  const isGenerallyCompleted = completions.includes(problem.id);
  
  const handleStartChallenge = () => {
    onSelectProblem(problem.id);
  };
  
  const handleMarkCompleted = () => {
    completeDailyChallenge();
    if (!isGenerallyCompleted) {
      toggleCompletion(problem.id);
    }
    // Force a re-render by triggering a small state change
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="relative">
      {/* Animated gradient border */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/50 via-orange-500/50 to-red-500/50 rounded-2xl blur-sm opacity-75 animate-pulse"></div>
      
      <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl">
              <Calendar className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Daily Challenge 🎯
              </h2>
              <p className="text-sm text-slate-400">
                A new problem every day to keep your skills sharp
              </p>
            </div>
          </div>
          
          {/* Streak Badge */}
          {streak > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="font-bold text-orange-400">{streak}</span>
              <span className="text-xs text-orange-300">day streak</span>
            </div>
          )}
        </div>

        {/* Problem Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xl font-semibold text-white">
                  {problem.title}
                </h3>
                <DifficultyBadge difficulty={problem.difficulty} />
                {isCompleted && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-xs font-medium text-green-400">Completed</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  {problem.category}
                </span>
                {problem.hasVisualization && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded-md text-blue-400">
                    <Play className="w-3 h-3" />
                    Visualization Available
                  </span>
                )}
              </div>
              
              <p className="text-slate-300 text-sm leading-relaxed">
                {isCompleted 
                  ? "🎉 Well done! You've completed today's challenge. Come back tomorrow for a new one!" 
                  : "Ready to tackle today's algorithmic challenge? Test your problem-solving skills and maintain your streak!"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mb-5">
          {problem.hasVisualization ? (
            <button
              onClick={handleStartChallenge}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl hover:border-blue-400 transition-all font-medium text-blue-400 hover:text-blue-300 group"
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Start Challenge</span>
            </button>
          ) : (
            <a
              href={problem.leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl hover:border-green-400 transition-all font-medium text-green-400 hover:text-green-300 group"
            >
              <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Solve on LeetCode</span>
            </a>
          )}
          
          {!isCompleted && (
            <button
              onClick={handleMarkCompleted}
              className="px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl hover:border-green-400 transition-all font-medium text-green-400 hover:text-green-300"
              title="Mark as completed"
            >
              <CheckCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Countdown Timer */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">Next challenge in:</span>
            </div>
            <div className="font-mono text-lg font-bold text-yellow-400">
              {formatTimeUntil(timeUntilNext)}
            </div>
          </div>
          
          {/* Progress bar showing time until next challenge */}
          <div className="w-full bg-slate-700 rounded-full h-1.5 mt-3">
            <div
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-1.5 rounded-full transition-all duration-1000"
              style={{ 
                width: `${Math.max(0, Math.min(100, (timeUntilNext / (24 * 60 * 60 * 1000)) * 100))}%` 
              }}
            />
          </div>
        </div>
        
        {/* Motivational footer */}
        <div className="mt-4 pt-4 border-t border-slate-700/50 text-center">
          <p className="text-xs text-slate-500">
            💪 Keep your coding skills sharp with daily practice
          </p>
        </div>
      </div>
    </div>
  );
}