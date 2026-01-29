/**
 * Pattern Recognition Trainer Page
 * Train your ability to identify algorithm patterns from problem statements
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Brain,
  Target,
  Trophy,
  Flame,
  Clock,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ChevronRight,
  RotateCcw,
  Play,
  Filter,
  BarChart3,
  HelpCircle,
  ExternalLink,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';
import { patterns, patternCategories, type Pattern, type PatternCategory } from '../data/patterns';
import { problemPatternMappings, type ProblemPatternMapping } from '../data/problemPatternMappings';
import { problems, type Difficulty, type Category } from '../data/problems';
import { patternTrainerStore, usePatternTrainerStore, useTrainerStats, useTrainerRecommendations } from '../store/patternTrainerStore';

type TrainingMode = 'setup' | 'training' | 'result' | 'stats';

interface FilterOptions {
  categories: Category[];
  difficulties: Difficulty[];
  patterns: string[];
}

// ===== Helper Components =====

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const colors = {
    Easy: 'bg-green-500/20 text-green-400 border-green-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Hard: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[difficulty]}`}>
      {difficulty}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, subValue, color = 'blue' }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={18} />
        <span className="text-sm opacity-80">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {subValue && <div className="text-xs opacity-60 mt-1">{subValue}</div>}
    </div>
  );
}

function PatternSelectionCard({
  pattern,
  isSelected,
  onClick,
  disabled = false,
}: {
  pattern: Pattern;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  const categoryInfo = patternCategories.find(c => c.name === pattern.category);
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-3 rounded-lg border text-left transition-all ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : isSelected
          ? 'bg-blue-500/20 border-blue-400 ring-2 ring-blue-400/50'
          : 'bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-750'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{categoryInfo?.icon || '📌'}</span>
        <span className="font-medium text-sm">{pattern.name}</span>
        {isSelected && <CheckCircle2 size={16} className="ml-auto text-blue-400" />}
      </div>
      <div className="text-xs text-slate-400 line-clamp-2">{pattern.shortDescription}</div>
    </button>
  );
}

function PatternResultCard({
  pattern,
  wasSelected,
  wasCorrect,
}: {
  pattern: Pattern;
  wasSelected: boolean;
  wasCorrect: boolean;
}) {
  const categoryInfo = patternCategories.find(c => c.name === pattern.category);
  
  let bgClass = 'bg-slate-800 border-slate-700';
  let icon = null;

  if (wasCorrect && wasSelected) {
    bgClass = 'bg-green-500/20 border-green-500/50';
    icon = <CheckCircle2 size={16} className="text-green-400" />;
  } else if (wasCorrect && !wasSelected) {
    bgClass = 'bg-yellow-500/20 border-yellow-500/50';
    icon = <AlertTriangle size={16} className="text-yellow-400" />;
  } else if (!wasCorrect && wasSelected) {
    bgClass = 'bg-red-500/20 border-red-500/50';
    icon = <XCircle size={16} className="text-red-400" />;
  }

  return (
    <div className={`p-3 rounded-lg border ${bgClass}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{categoryInfo?.icon || '📌'}</span>
        <span className="font-medium text-sm flex-1">{pattern.name}</span>
        {icon}
      </div>
      {wasCorrect && !wasSelected && (
        <div className="text-xs text-yellow-400 mt-1">← You should have selected this</div>
      )}
      {!wasCorrect && wasSelected && (
        <div className="text-xs text-red-400 mt-1">← This was incorrect</div>
      )}
    </div>
  );
}

// ===== Main Components =====

function SetupScreen({
  onStart,
  filters,
  setFilters,
}: {
  onStart: () => void;
  filters: FilterOptions;
  setFilters: (f: FilterOptions) => void;
}) {
  const stats = useTrainerStats();
  const recommendations = useTrainerRecommendations();
  const allCategories = Array.from(new Set(problems.map(p => p.category)));
  const allDifficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];

  const availableProblems = useMemo(() => {
    return problemPatternMappings.filter(mapping => {
      const problem = problems.find(p => p.id === mapping.problemId);
      if (!problem) return false;

      if (filters.categories.length > 0 && !filters.categories.includes(problem.category)) {
        return false;
      }
      if (filters.difficulties.length > 0 && !filters.difficulties.includes(problem.difficulty)) {
        return false;
      }
      if (filters.patterns.length > 0 && !mapping.patterns.some(p => filters.patterns.includes(p))) {
        return false;
      }
      return true;
    });
  }, [filters]);

  const toggleCategory = (cat: Category) => {
    setFilters({
      ...filters,
      categories: filters.categories.includes(cat)
        ? filters.categories.filter(c => c !== cat)
        : [...filters.categories, cat],
    });
  };

  const toggleDifficulty = (diff: Difficulty) => {
    setFilters({
      ...filters,
      difficulties: filters.difficulties.includes(diff)
        ? filters.difficulties.filter(d => d !== diff)
        : [...filters.difficulties, diff],
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Brain className="text-purple-400" size={32} />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Pattern Recognition Trainer
          </h1>
        </div>
        <p className="text-slate-400 max-w-xl mx-auto">
          Train your ability to identify algorithm patterns from problem statements.
          The key skill for solving new problems quickly!
        </p>
      </div>

      {/* Quick Stats */}
      {stats.totalAttempts > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={Target}
            label="Accuracy"
            value={`${stats.overallAccuracy}%`}
            color={stats.overallAccuracy >= 70 ? 'green' : stats.overallAccuracy >= 50 ? 'yellow' : 'red'}
          />
          <StatCard
            icon={Trophy}
            label="Problems Done"
            value={stats.totalAttempts}
            subValue={`${stats.correctAttempts} perfect`}
            color="blue"
          />
          <StatCard
            icon={Flame}
            label="Current Streak"
            value={stats.currentStreak}
            subValue={`Best: ${stats.bestStreak}`}
            color="orange"
          />
          <StatCard
            icon={Clock}
            label="Time Trained"
            value={`${stats.totalTrainingTimeMinutes}m`}
            subValue={`~${stats.avgTimePerAttemptSeconds}s per problem`}
            color="purple"
          />
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="text-purple-400" size={18} />
            <span className="font-semibold text-purple-300">Recommendations</span>
          </div>
          <ul className="space-y-2">
            {recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <ChevronRight size={14} className="mt-1 text-purple-400 flex-shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-slate-400" />
          <span className="font-semibold">Filter Problems</span>
          <span className="ml-auto text-sm text-slate-400">
            {availableProblems.length} problems available
          </span>
        </div>

        {/* Difficulty Filter */}
        <div className="mb-4">
          <label className="text-sm text-slate-400 mb-2 block">Difficulty</label>
          <div className="flex flex-wrap gap-2">
            {allDifficulties.map(diff => (
              <button
                key={diff}
                onClick={() => toggleDifficulty(diff)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filters.difficulties.includes(diff)
                    ? diff === 'Easy'
                      ? 'bg-green-500/30 text-green-300 border border-green-500'
                      : diff === 'Medium'
                      ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500'
                      : 'bg-red-500/30 text-red-300 border border-red-500'
                    : 'bg-slate-700 text-slate-400 border border-transparent hover:border-slate-600'
                }`}
              >
                {diff}
              </button>
            ))}
            {filters.difficulties.length > 0 && (
              <button
                onClick={() => setFilters({ ...filters, difficulties: [] })}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {allCategories.slice(0, 10).map(cat => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  filters.categories.includes(cat)
                    ? 'bg-blue-500/30 text-blue-300 border border-blue-500'
                    : 'bg-slate-700 text-slate-400 border border-transparent hover:border-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
            {filters.categories.length > 0 && (
              <button
                onClick={() => setFilters({ ...filters, categories: [] })}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center">
        <button
          onClick={onStart}
          disabled={availableProblems.length === 0}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play size={24} />
          Start Training
        </button>
        {availableProblems.length === 0 && (
          <p className="text-red-400 text-sm mt-2">No problems match your filters</p>
        )}
      </div>
    </div>
  );
}

function TrainingScreen({
  problem,
  mapping,
  selectedPatterns,
  setSelectedPatterns,
  hintsUsed,
  showHint,
  onSubmit,
  startTime,
}: {
  problem: typeof problems[0];
  mapping: ProblemPatternMapping;
  selectedPatterns: string[];
  setSelectedPatterns: (p: string[]) => void;
  hintsUsed: number;
  showHint: () => void;
  onSubmit: () => void;
  startTime: number;
}) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const togglePattern = (patternId: string) => {
    setSelectedPatterns(
      selectedPatterns.includes(patternId)
        ? selectedPatterns.filter(p => p !== patternId)
        : [...selectedPatterns, patternId]
    );
  };

  // Group patterns by category
  const patternsByCategory = useMemo(() => {
    const grouped = new Map<PatternCategory, Pattern[]>();
    patterns.forEach(p => {
      const existing = grouped.get(p.category) || [];
      grouped.set(p.category, [...existing, p]);
    });
    return grouped;
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="text-purple-400" size={24} />
          <span className="font-semibold text-lg">Pattern Trainer</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock size={18} />
            <span className="font-mono">{formatTime(elapsedTime)}</span>
          </div>
        </div>
      </div>

      {/* Problem Statement */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-xl font-bold">{problem.title}</h2>
          <DifficultyBadge difficulty={problem.difficulty} />
          <span className="text-sm text-slate-500">{problem.category}</span>
        </div>
        <p className="text-slate-300 leading-relaxed">{mapping.description}</p>
        <a
          href={problem.leetcodeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mt-3"
        >
          View on LeetCode <ExternalLink size={14} />
        </a>
      </div>

      {/* Hints Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="text-yellow-400" size={18} />
            <span className="font-medium">Hints</span>
            <span className="text-sm text-slate-500">({hintsUsed}/{mapping.hints.length} used)</span>
          </div>
          <button
            onClick={showHint}
            disabled={hintsUsed >= mapping.hints.length}
            className="text-sm px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Show Hint
          </button>
        </div>
        {hintsUsed > 0 && (
          <div className="space-y-2">
            {mapping.hints.slice(0, hintsUsed).map((hint, i) => (
              <div key={i} className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-2 text-sm text-yellow-200">
                💡 {hint}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Question */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="text-purple-400" size={18} />
          <span className="font-semibold text-purple-300">Which pattern(s) apply to this problem?</span>
        </div>
        <p className="text-sm text-slate-400">
          Select all patterns that you would use to solve this problem. Some problems use multiple patterns.
        </p>
      </div>

      {/* Pattern Selection Grid */}
      <div className="space-y-6 mb-8">
        {Array.from(patternsByCategory.entries()).map(([category, categoryPatterns]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{patternCategories.find(c => c.name === category)?.icon}</span>
              <span className="font-medium text-slate-300">{category}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {categoryPatterns.map(pattern => (
                <PatternSelectionCard
                  key={pattern.id}
                  pattern={pattern}
                  isSelected={selectedPatterns.includes(pattern.id)}
                  onClick={() => togglePattern(pattern.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          onClick={onSubmit}
          disabled={selectedPatterns.length === 0}
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle2 size={20} />
          Submit Answer
          {selectedPatterns.length > 0 && (
            <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
              {selectedPatterns.length} selected
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

function ResultScreen({
  problem,
  mapping,
  selectedPatterns,
  attempt,
  onNext,
  onViewStats,
}: {
  problem: typeof problems[0];
  mapping: ProblemPatternMapping;
  selectedPatterns: string[];
  attempt: {
    isFullyCorrect: boolean;
    partialScore: number;
  };
  onNext: () => void;
  onViewStats: () => void;
}) {
  const correctSet = new Set(mapping.patterns);
  const selectedSet = new Set(selectedPatterns);
  
  // All patterns involved in this problem (selected or correct)
  const allRelevantPatterns = new Set([...mapping.patterns, ...selectedPatterns]);
  
  const truePositives = selectedPatterns.filter(p => correctSet.has(p)).length;
  const falsePositives = selectedPatterns.filter(p => !correctSet.has(p)).length;
  const falseNegatives = mapping.patterns.filter(p => !selectedSet.has(p)).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Result Header */}
      <div className={`text-center py-8 px-6 rounded-2xl mb-8 ${
        attempt.isFullyCorrect
          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30'
          : attempt.partialScore > 0
          ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30'
          : 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30'
      }`}>
        <div className="flex justify-center mb-4">
          {attempt.isFullyCorrect ? (
            <div className="p-4 bg-green-500/20 rounded-full">
              <Trophy className="text-green-400" size={48} />
            </div>
          ) : attempt.partialScore > 0 ? (
            <div className="p-4 bg-yellow-500/20 rounded-full">
              <Target className="text-yellow-400" size={48} />
            </div>
          ) : (
            <div className="p-4 bg-red-500/20 rounded-full">
              <XCircle className="text-red-400" size={48} />
            </div>
          )}
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${
          attempt.isFullyCorrect ? 'text-green-400' : attempt.partialScore > 0 ? 'text-yellow-400' : 'text-red-400'
        }`}>
          {attempt.isFullyCorrect ? 'Perfect!' : attempt.partialScore > 0 ? 'Partially Correct' : 'Keep Learning'}
        </h2>
        <div className="text-lg text-slate-300">
          Score: <span className="font-bold">{Math.round(attempt.partialScore * 100)}%</span>
        </div>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div>
            <span className="text-green-400 font-semibold">{truePositives}</span>
            <span className="text-slate-400"> correct</span>
          </div>
          {falsePositives > 0 && (
            <div>
              <span className="text-red-400 font-semibold">{falsePositives}</span>
              <span className="text-slate-400"> wrong</span>
            </div>
          )}
          {falseNegatives > 0 && (
            <div>
              <span className="text-yellow-400 font-semibold">{falseNegatives}</span>
              <span className="text-slate-400"> missed</span>
            </div>
          )}
        </div>
      </div>

      {/* Problem Info */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-bold text-lg">{problem.title}</h3>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
        <p className="text-slate-400 text-sm">{mapping.description}</p>
      </div>

      {/* Pattern Results */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3">Pattern Analysis</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from(allRelevantPatterns).map(patternId => {
            const pattern = patterns.find(p => p.id === patternId);
            if (!pattern) return null;
            return (
              <PatternResultCard
                key={patternId}
                pattern={pattern}
                wasSelected={selectedSet.has(patternId)}
                wasCorrect={correctSet.has(patternId)}
              />
            );
          })}
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="text-blue-400" size={18} />
          <span className="font-semibold text-blue-300">Why These Patterns?</span>
        </div>
        <p className="text-slate-300">{mapping.explanation}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={onNext}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          Next Problem
          <ChevronRight size={20} />
        </button>
        <button
          onClick={onViewStats}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 rounded-xl font-medium hover:bg-slate-600 transition-colors"
        >
          <BarChart3 size={18} />
          View Stats
        </button>
        {problem.hasVisualization && (
          <a
            href={`#${problem.id}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 rounded-xl font-medium hover:bg-slate-600 transition-colors"
          >
            <Play size={18} />
            View Visualizer
          </a>
        )}
      </div>
    </div>
  );
}

function StatsScreen({ onBack }: { onBack: () => void }) {
  void usePatternTrainerStore(); // Subscribe to changes
  const stats = useTrainerStats();
  const recommendations = useTrainerRecommendations();

  const weakestPatterns = patternTrainerStore.getWeakestPatterns(5);
  const strongestPatterns = patternTrainerStore.getStrongestPatterns(5);
  const recentAttempts = patternTrainerStore.getRecentAttempts(10);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-blue-400" size={28} />
          <h1 className="text-2xl font-bold">Training Statistics</h1>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
        >
          ← Back to Training
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Target}
          label="Overall Accuracy"
          value={`${stats.overallAccuracy}%`}
          color={stats.overallAccuracy >= 70 ? 'green' : stats.overallAccuracy >= 50 ? 'yellow' : 'red'}
        />
        <StatCard
          icon={Trophy}
          label="Total Problems"
          value={stats.totalAttempts}
          subValue={`${stats.correctAttempts} perfect`}
          color="blue"
        />
        <StatCard
          icon={Flame}
          label="Best Streak"
          value={stats.bestStreak}
          subValue={`Current: ${stats.currentStreak}`}
          color="orange"
        />
        <StatCard
          icon={Clock}
          label="Training Time"
          value={`${stats.totalTrainingTimeMinutes}m`}
          color="purple"
        />
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="text-purple-400" size={20} />
            <span className="font-semibold text-purple-300">Recommendations</span>
          </div>
          <ul className="space-y-2">
            {recommendations.map((rec, i) => (
              <li key={i} className="text-slate-300 flex items-start gap-2">
                <ChevronRight size={16} className="mt-1 text-purple-400 flex-shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pattern Performance */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Weakest Patterns */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="text-red-400" size={20} />
            <h3 className="font-semibold">Needs Improvement</h3>
          </div>
          {weakestPatterns.length > 0 ? (
            <div className="space-y-3">
              {weakestPatterns.map(ps => {
                const pattern = patterns.find(p => p.id === ps.patternId);
                return (
                  <div key={ps.patternId} className="flex items-center justify-between">
                    <span className="text-sm">{pattern?.name || ps.patternId}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-400"
                          style={{ width: `${ps.accuracy * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-red-400 w-12 text-right">
                        {Math.round(ps.accuracy * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Complete at least 3 problems to see weak patterns</p>
          )}
        </div>

        {/* Strongest Patterns */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-green-400" size={20} />
            <h3 className="font-semibold">Strongest Patterns</h3>
          </div>
          {strongestPatterns.length > 0 ? (
            <div className="space-y-3">
              {strongestPatterns.map(ps => {
                const pattern = patterns.find(p => p.id === ps.patternId);
                return (
                  <div key={ps.patternId} className="flex items-center justify-between">
                    <span className="text-sm">{pattern?.name || ps.patternId}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-400"
                          style={{ width: `${ps.accuracy * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-green-400 w-12 text-right">
                        {Math.round(ps.accuracy * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Complete at least 3 problems to see strong patterns</p>
          )}
        </div>
      </div>

      {/* Recent Attempts */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <h3 className="font-semibold mb-4">Recent Attempts</h3>
        {recentAttempts.length > 0 ? (
          <div className="space-y-2">
            {recentAttempts.map((attempt, i) => {
              const problem = problems.find(p => p.id === attempt.problemId);
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg"
                >
                  <div className={`p-1.5 rounded-full ${
                    attempt.isFullyCorrect
                      ? 'bg-green-500/20 text-green-400'
                      : attempt.partialScore > 0
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {attempt.isFullyCorrect ? (
                      <CheckCircle2 size={16} />
                    ) : attempt.partialScore > 0 ? (
                      <Target size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {problem?.title || attempt.problemId}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(attempt.timestamp).toLocaleDateString()} · 
                      {attempt.hintsUsed > 0 && ` ${attempt.hintsUsed} hints ·`}
                      {Math.round(attempt.timeSpentMs / 1000)}s
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${
                    attempt.isFullyCorrect ? 'text-green-400' : attempt.partialScore > 0 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {Math.round(attempt.partialScore * 100)}%
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No attempts yet. Start training!</p>
        )}
      </div>

      {/* Reset Progress */}
      <div className="mt-8 text-center">
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset all training progress? This cannot be undone.')) {
              patternTrainerStore.resetProgress();
            }
          }}
          className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 mx-auto"
        >
          <RotateCcw size={14} />
          Reset All Progress
        </button>
      </div>
    </div>
  );
}

// ===== Main Component =====

export function PatternTrainerPage() {
  const [mode, setMode] = useState<TrainingMode>('setup');
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    difficulties: [],
    patterns: [],
  });
  const [currentProblem, setCurrentProblem] = useState<typeof problems[0] | null>(null);
  const [currentMapping, setCurrentMapping] = useState<ProblemPatternMapping | null>(null);
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [lastAttempt, setLastAttempt] = useState<{ isFullyCorrect: boolean; partialScore: number } | null>(null);
  const [usedProblemIds, setUsedProblemIds] = useState<Set<string>>(new Set());

  const availableProblems = useMemo(() => {
    return problemPatternMappings.filter(mapping => {
      const problem = problems.find(p => p.id === mapping.problemId);
      if (!problem) return false;

      if (filters.categories.length > 0 && !filters.categories.includes(problem.category)) {
        return false;
      }
      if (filters.difficulties.length > 0 && !filters.difficulties.includes(problem.difficulty)) {
        return false;
      }
      if (filters.patterns.length > 0 && !mapping.patterns.some(p => filters.patterns.includes(p))) {
        return false;
      }
      return true;
    });
  }, [filters]);

  const selectNextProblem = useCallback(() => {
    // Filter out already used problems
    let available = availableProblems.filter(m => !usedProblemIds.has(m.problemId));
    
    // If all used, reset
    if (available.length === 0) {
      setUsedProblemIds(new Set());
      available = availableProblems;
    }

    if (available.length === 0) return;

    // Random selection
    const randomIndex = Math.floor(Math.random() * available.length);
    const mapping = available[randomIndex];
    const problem = problems.find(p => p.id === mapping.problemId);

    if (problem && mapping) {
      setCurrentProblem(problem);
      setCurrentMapping(mapping);
      setSelectedPatterns([]);
      setHintsUsed(0);
      setStartTime(Date.now());
      setUsedProblemIds(prev => new Set([...prev, mapping.problemId]));
    }
  }, [availableProblems, usedProblemIds]);

  const handleStart = () => {
    selectNextProblem();
    setMode('training');
  };

  const handleShowHint = () => {
    if (currentMapping && hintsUsed < currentMapping.hints.length) {
      setHintsUsed(hintsUsed + 1);
    }
  };

  const handleSubmit = () => {
    if (!currentMapping || !currentProblem) return;

    const timeSpent = Date.now() - startTime;
    const attempt = patternTrainerStore.recordAttempt(
      currentProblem.id,
      selectedPatterns,
      currentMapping.patterns,
      hintsUsed,
      timeSpent
    );

    setLastAttempt({
      isFullyCorrect: attempt.isFullyCorrect,
      partialScore: attempt.partialScore,
    });
    setMode('result');
  };

  const handleNext = () => {
    selectNextProblem();
    setLastAttempt(null);
    setMode('training');
  };

  const handleViewStats = () => {
    setMode('stats');
  };

  const handleBackFromStats = () => {
    setMode('setup');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {mode === 'setup' && (
        <SetupScreen
          onStart={handleStart}
          filters={filters}
          setFilters={setFilters}
        />
      )}
      {mode === 'training' && currentProblem && currentMapping && (
        <TrainingScreen
          problem={currentProblem}
          mapping={currentMapping}
          selectedPatterns={selectedPatterns}
          setSelectedPatterns={setSelectedPatterns}
          hintsUsed={hintsUsed}
          showHint={handleShowHint}
          onSubmit={handleSubmit}
          startTime={startTime}
        />
      )}
      {mode === 'result' && currentProblem && currentMapping && lastAttempt && (
        <ResultScreen
          problem={currentProblem}
          mapping={currentMapping}
          selectedPatterns={selectedPatterns}
          attempt={lastAttempt}
          onNext={handleNext}
          onViewStats={handleViewStats}
        />
      )}
      {mode === 'stats' && (
        <StatsScreen onBack={handleBackFromStats} />
      )}
    </div>
  );
}

export default PatternTrainerPage;
