import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpacedRepetition } from '../hooks/useSpacedRepetition';
import { problems } from '../data/problems';
import { 
  RefreshCw, 
  ChevronRight, 
  CheckCircle2, 
  Target,
  Brain
} from 'lucide-react';

interface ReviewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProblem: (problemId: string) => void;
}

function ReviewSessionModal({ isOpen, onClose, onSelectProblem }: ReviewSessionModalProps) {
  const { getProblemsForReview, markAsReviewed } = useSpacedRepetition();
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [showDifficultySelector, setShowDifficultySelector] = useState(false);
  
  const dueProblems = getProblemsForReview();
  const currentProblem = dueProblems[currentProblemIndex];
  const problem = currentProblem ? problems.find(p => p.id === currentProblem.problemId) : null;
  
  const handleMarkReviewed = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (currentProblem) {
      markAsReviewed(currentProblem.problemId, difficulty);
      
      if (currentProblemIndex < dueProblems.length - 1) {
        setCurrentProblemIndex(prev => prev + 1);
      } else {
        // Session complete
        onClose();
      }
      setShowDifficultySelector(false);
    }
  };

  const handleSkipToNext = () => {
    if (currentProblemIndex < dueProblems.length - 1) {
      setCurrentProblemIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full border border-slate-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {dueProblems.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 size={48} className="mx-auto text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-green-400 mb-2">All caught up! 🎉</h3>
            <p className="text-slate-400">No problems are due for review right now.</p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold mb-1">Review Session</h3>
                <p className="text-sm text-slate-400">
                  Problem {currentProblemIndex + 1} of {dueProblems.length}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">
                  {dueProblems.length - currentProblemIndex - 1} remaining
                </span>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-slate-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentProblemIndex + 1) / dueProblems.length) * 100}%` }}
                  className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                />
              </div>
            </div>

            {/* Current Problem */}
            {problem && currentProblem && (
              <div className="mb-6">
                <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold">{problem.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                        problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {problem.difficulty}
                      </span>
                      <span className="text-xs text-slate-400">{problem.category}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-400 space-y-1">
                    <p>Last reviewed: {formatDate(currentProblem.lastReviewDate)}</p>
                    <p>
                      {currentProblem.daysOverdue > 0 ? (
                        <span className="text-orange-400">
                          {currentProblem.daysOverdue} day{currentProblem.daysOverdue === 1 ? '' : 's'} overdue
                        </span>
                      ) : (
                        <span className="text-blue-400">Due today</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => onSelectProblem(problem.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
                  >
                    <Brain size={16} />
                    Review Problem
                    <ChevronRight size={16} />
                  </button>
                  
                  <button
                    onClick={() => setShowDifficultySelector(!showDifficultySelector)}
                    className="flex items-center gap-2 px-4 py-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors"
                  >
                    <CheckCircle2 size={16} />
                    Mark as Reviewed
                  </button>
                  
                  <button
                    onClick={handleSkipToNext}
                    className="px-4 py-3 bg-slate-600/50 border border-slate-600 rounded-lg text-slate-400 hover:bg-slate-600/70 transition-colors"
                  >
                    Skip
                  </button>
                </div>

                {/* Difficulty Selector */}
                <AnimatePresence>
                  {showDifficultySelector && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                    >
                      <p className="text-sm text-slate-300 mb-3">How difficult was this review?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMarkReviewed('easy')}
                          className="flex-1 py-2 px-3 bg-green-500/20 border border-green-500/30 rounded text-green-400 hover:bg-green-500/30 transition-colors text-sm"
                        >
                          Easy 😊
                        </button>
                        <button
                          onClick={() => handleMarkReviewed('medium')}
                          className="flex-1 py-2 px-3 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-400 hover:bg-yellow-500/30 transition-colors text-sm"
                        >
                          Medium 🤔
                        </button>
                        <button
                          onClick={() => handleMarkReviewed('hard')}
                          className="flex-1 py-2 px-3 bg-red-500/20 border border-red-500/30 rounded text-red-400 hover:bg-red-500/30 transition-colors text-sm"
                        >
                          Hard 😅
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Your rating affects the next review interval
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

interface ReviewDueProps {
  onSelectProblem: (problemId: string) => void;
  className?: string;
}

export function ReviewDue({ onSelectProblem, className = '' }: ReviewDueProps) {
  const { getProblemsForReview, getReviewStats } = useSpacedRepetition();
  const [showModal, setShowModal] = useState(false);
  
  const dueProblems = getProblemsForReview();
  const stats = getReviewStats();
  
  // Don't show if no problems are due
  if (dueProblems.length === 0) {
    return null;
  }

  const urgentProblems = dueProblems.filter(p => p.daysOverdue > 3);
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-6 ${className}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <RefreshCw size={20} className="text-orange-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              Review Time! 🧠
            </h3>
            <p className="text-sm text-slate-400">
              Spaced repetition helps lock in your knowledge
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400 mb-1">
              {dueProblems.length}
            </div>
            <div className="text-xs text-slate-400">Problems Due</div>
          </div>
          
          {urgentProblems.length > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400 mb-1">
                {urgentProblems.length}
              </div>
              <div className="text-xs text-slate-400">Overdue</div>
            </div>
          )}
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {stats.reviewSchedule.tomorrow}
            </div>
            <div className="text-xs text-slate-400">Due Tomorrow</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {stats.reviewSchedule.thisWeek}
            </div>
            <div className="text-xs text-slate-400">This Week</div>
          </div>
        </div>

        {/* Quick preview of most urgent problems */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 text-slate-300">Most Urgent:</h4>
          <div className="space-y-2">
            {dueProblems.slice(0, 3).map(dueProblem => {
              const problem = problems.find(p => p.id === dueProblem.problemId);
              if (!problem) return null;
              
              return (
                <div 
                  key={dueProblem.problemId}
                  className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      dueProblem.daysOverdue > 3 ? 'bg-red-400' :
                      dueProblem.daysOverdue > 0 ? 'bg-orange-400' : 'bg-yellow-400'
                    }`} />
                    <span className="text-sm font-medium">{problem.title}</span>
                    <span className="text-xs text-slate-400">{problem.category}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {dueProblem.daysOverdue > 0 ? 
                      `${dueProblem.daysOverdue}d overdue` : 
                      'Due today'
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg hover:border-orange-400 transition-all font-medium text-orange-400 hover:text-orange-300"
        >
          <Target size={18} />
          Start Review Session
          <ChevronRight size={16} />
        </button>
        
        <div className="mt-3 text-xs text-center text-slate-500">
          Regular review strengthens long-term retention
        </div>
      </motion.div>

      <AnimatePresence>
        <ReviewSessionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSelectProblem={(problemId) => {
            setShowModal(false);
            onSelectProblem(problemId);
          }}
        />
      </AnimatePresence>
    </>
  );
}