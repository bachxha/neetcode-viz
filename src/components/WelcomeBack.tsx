import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Brain, Star, ArrowRight, Calendar, Target, Sparkles } from 'lucide-react';
import { useCompletions } from '../contexts/CompletionContext';
import { problems, Category } from '../data/problems';

const WELCOME_BACK_KEY = 'neetcode-welcome-back-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const INACTIVITY_THRESHOLD = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds

interface WelcomeBackProps {
  onSelectProblem: (problemId: string) => void;
  onStartQuiz: () => void;
}

interface CategoryStats {
  category: Category;
  completed: number;
  total: number;
  percentage: number;
}

export function WelcomeBack({ onSelectProblem, onStartQuiz }: WelcomeBackProps) {
  const { completionData, completions } = useCompletions();
  const [shouldShow, setShouldShow] = useState(false);
  const [daysSinceLastPractice, setDaysSinceLastPractice] = useState(0);
  const [topCategories, setTopCategories] = useState<CategoryStats[]>([]);
  const [restartProblems, setRestartProblems] = useState<typeof problems>([]);

  // Check if component should be shown
  useEffect(() => {
    const checkShouldShow = () => {
      // Check if dismissed recently
      const dismissedTime = localStorage.getItem(WELCOME_BACK_KEY);
      if (dismissedTime) {
        const dismissed = parseInt(dismissedTime);
        const now = Date.now();
        if (now - dismissed < DISMISS_DURATION) {
          return false;
        }
      }

      // Check if there's any completion data
      if (completions.length === 0) {
        return false;
      }

      // Find most recent completion
      const timestamps = Object.values(completionData);
      if (timestamps.length === 0) {
        return false;
      }

      const mostRecent = Math.max(...timestamps);
      const now = Date.now();
      const timeSinceLastPractice = now - mostRecent;

      // Show if inactive for 14+ days
      if (timeSinceLastPractice >= INACTIVITY_THRESHOLD) {
        const days = Math.floor(timeSinceLastPractice / (24 * 60 * 60 * 1000));
        setDaysSinceLastPractice(days);
        return true;
      }

      return false;
    };

    setShouldShow(checkShouldShow());
  }, [completions, completionData]);

  // Calculate category stats and restart problems
  useEffect(() => {
    if (!shouldShow || completions.length === 0) return;

    // Calculate category completion stats
    const categoryMap = new Map<Category, { completed: number; total: number }>();
    
    // Initialize all categories
    const allCategories = Array.from(new Set(problems.map(p => p.category)));
    allCategories.forEach(category => {
      categoryMap.set(category, { completed: 0, total: 0 });
    });

    // Count completions and totals
    problems.forEach(problem => {
      const stats = categoryMap.get(problem.category)!;
      stats.total++;
      if (completions.includes(problem.id)) {
        stats.completed++;
      }
    });

    // Convert to array and calculate percentages
    const categoryStats: CategoryStats[] = Array.from(categoryMap.entries())
      .map(([category, stats]) => ({
        category,
        completed: stats.completed,
        total: stats.total,
        percentage: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      }))
      .filter(stat => stat.completed > 0) // Only include categories with some progress
      .sort((a, b) => b.percentage - a.percentage); // Sort by completion percentage

    setTopCategories(categoryStats.slice(0, 3)); // Top 3 categories

    // Select restart problems from top categories
    const selectedProblems: typeof problems = [];
    for (const categoryStat of categoryStats.slice(0, 3)) {
      const categoryProblems = problems
        .filter(p => p.category === categoryStat.category && p.hasVisualization)
        .filter(p => completions.includes(p.id)) // Only previously completed problems
        .sort((a, b) => a.difficulty === 'Easy' ? -1 : b.difficulty === 'Easy' ? 1 : 0); // Prefer Easy problems

      if (categoryProblems.length > 0) {
        selectedProblems.push(categoryProblems[0]);
      }
    }

    // Fill remaining slots with any easy completed problems if needed
    if (selectedProblems.length < 3) {
      const easyCompletedProblems = problems
        .filter(p => p.difficulty === 'Easy' && p.hasVisualization)
        .filter(p => completions.includes(p.id))
        .filter(p => !selectedProblems.some(sp => sp.id === p.id));
      
      for (const problem of easyCompletedProblems) {
        if (selectedProblems.length >= 3) break;
        selectedProblems.push(problem);
      }
    }

    setRestartProblems(selectedProblems);
  }, [shouldShow, completions]);

  const handleDismiss = () => {
    localStorage.setItem(WELCOME_BACK_KEY, Date.now().toString());
    setShouldShow(false);
  };

  const getPatternCount = () => {
    const patterns = new Set(
      completions.map(id => {
        const problem = problems.find(p => p.id === id);
        return problem?.category;
      }).filter(Boolean)
    );
    return patterns.size;
  };

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-8 shadow-2xl"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '2px solid var(--accent-purple)',
            boxShadow: '0 0 40px rgba(168, 85, 247, 0.3)',
          }}
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-full transition-colors hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={24} />
          </button>

          {/* Header with sparkles */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="text-purple-400" size={28} />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Welcome Back!
              </h1>
              <Sparkles className="text-pink-400" size={28} />
            </div>
            <div className="flex items-center justify-center gap-2 text-lg" style={{ color: 'var(--text-primary)' }}>
              <Calendar size={20} style={{ color: 'var(--accent-blue)' }} />
              <span>It's been <span className="font-semibold text-blue-400">{daysSinceLastPractice} days</span> since your last practice</span>
            </div>
          </div>

          {/* Accomplishments section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Trophy className="text-yellow-400" size={24} />
              Your Accomplishments
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className="p-4 rounded-lg text-center"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                <div className="text-2xl font-bold text-green-400">{completions.length}</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Problems Solved</div>
              </div>
              <div 
                className="p-4 rounded-lg text-center"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                <div className="text-2xl font-bold text-purple-400">{getPatternCount()}</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Patterns Learned</div>
              </div>
            </div>

            {/* Top categories */}
            {topCategories.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                  Your Strongest Areas:
                </h3>
                <div className="space-y-2">
                  {topCategories.map((category, index) => (
                    <div 
                      key={category.category}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--bg-secondary)' }}
                    >
                      <div className="flex items-center gap-2">
                        <Star className="text-yellow-400" size={16} />
                        <span style={{ color: 'var(--text-primary)' }}>{category.category}</span>
                      </div>
                      <span className="text-green-400 font-medium">
                        {category.completed}/{category.total} ({Math.round(category.percentage)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Restart suggestions */}
          {restartProblems.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Target className="text-blue-400" size={24} />
                Suggested Restart Problems
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Let's build confidence with these problems from your strongest areas:
              </p>
              <div className="space-y-3">
                {restartProblems.map((problem) => (
                  <button
                    key={problem.id}
                    onClick={() => {
                      onSelectProblem(problem.id);
                      handleDismiss();
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-lg transition-all hover:scale-105"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-primary)',
                    }}
                  >
                    <div className="text-left">
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{problem.title}</div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{problem.category}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                        problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {problem.difficulty}
                      </span>
                      <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                onStartQuiz();
                handleDismiss();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Brain size={20} />
              5-Minute Pattern Quiz
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 px-6 py-4 rounded-lg transition-all font-medium"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-primary)',
              }}
            >
              Skip for now
            </button>
          </div>

          {/* Encouraging message */}
          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              🎯 You've got this! Every expert was once a beginner who refused to give up.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}