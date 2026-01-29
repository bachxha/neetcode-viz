/**
 * Bug Hunter Page
 * Train users to find bugs in code - a different mental mode from writing code
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Bug as BugIcon,
  Target,
  Trophy,
  Flame,
  Clock,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ChevronRight,
  RotateCcw,
  Filter,
  BarChart3,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Eye,
  Shuffle,
  Search,
} from 'lucide-react';
import {
  buggyCodeChallenges,
  bugTypeDescriptions,
  type BuggyCodeChallenge,
  type BugType,
} from '../data/buggyCodeChallenges';
import { CodeDisplay, BugDetails } from '../components/CodeDisplay';
import {
  bugHunterStore,
  useBugHunterStats,
  useBugHunterRecommendations,
  useBugHunterStore,
} from '../store/bugHunterStore';

type ViewMode = 'setup' | 'hunting' | 'results' | 'stats';

interface SelectedLine {
  lineNumber: number;
  bugType: BugType | null;
}

interface FilterOptions {
  difficulties: Array<'Easy' | 'Medium' | 'Hard'>;
  bugTypes: BugType[];
  hideCompleted: boolean;
}

// ===== Helper Components =====

function DifficultyBadge({ difficulty }: { difficulty: 'Easy' | 'Medium' | 'Hard' }) {
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

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color = 'blue',
}: {
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

function BugTypeSelector({
  selectedType,
  onSelect,
}: {
  selectedType: BugType | null;
  onSelect: (type: BugType) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {(Object.entries(bugTypeDescriptions) as [BugType, typeof bugTypeDescriptions[BugType]][]).map(
        ([type, info]) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`p-2 rounded-lg text-left transition-all ${
              selectedType === type
                ? 'bg-blue-500/30 border-blue-400 ring-2 ring-blue-400/50'
                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
            } border`}
          >
            <div className="flex items-center gap-2">
              <span>{info.icon}</span>
              <span className="text-xs font-medium truncate">{info.name}</span>
            </div>
          </button>
        )
      )}
    </div>
  );
}

// ===== Setup Screen =====

function SetupScreen({
  onStart,
  filters,
  setFilters,
}: {
  onStart: (challenge: BuggyCodeChallenge) => void;
  filters: FilterOptions;
  setFilters: (f: FilterOptions) => void;
}) {
  const stats = useBugHunterStats();
  const recommendations = useBugHunterRecommendations();
  void useBugHunterStore();

  const filteredChallenges = useMemo(() => {
    return buggyCodeChallenges.filter(challenge => {
      if (filters.difficulties.length > 0 && !filters.difficulties.includes(challenge.difficulty)) {
        return false;
      }
      if (filters.bugTypes.length > 0) {
        const challengeBugTypes = challenge.bugs.map(b => b.bugType);
        if (!filters.bugTypes.some(t => challengeBugTypes.includes(t))) {
          return false;
        }
      }
      if (filters.hideCompleted && bugHunterStore.isCompleted(challenge.id)) {
        return false;
      }
      return true;
    });
  }, [filters]);

  const handleRandomStart = () => {
    if (filteredChallenges.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredChallenges.length);
    onStart(filteredChallenges[randomIndex]);
  };

  const toggleDifficulty = (diff: 'Easy' | 'Medium' | 'Hard') => {
    setFilters({
      ...filters,
      difficulties: filters.difficulties.includes(diff)
        ? filters.difficulties.filter(d => d !== diff)
        : [...filters.difficulties, diff],
    });
  };

  const toggleBugType = (type: BugType) => {
    setFilters({
      ...filters,
      bugTypes: filters.bugTypes.includes(type)
        ? filters.bugTypes.filter(t => t !== type)
        : [...filters.bugTypes, type],
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <BugIcon className="text-red-400" size={32} />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            Bug Hunter
          </h1>
        </div>
        <p className="text-slate-400 max-w-xl mx-auto">
          Train your bug-finding skills! Review code, spot the bugs, and classify them.
          A crucial skill for code reviews and debugging under pressure.
        </p>
      </div>

      {/* Quick Stats */}
      {stats.totalAttempts > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={Target}
            label="Avg Score"
            value={`${stats.averageScore}%`}
            color={stats.averageScore >= 70 ? 'green' : stats.averageScore >= 50 ? 'yellow' : 'red'}
          />
          <StatCard
            icon={BugIcon}
            label="Bugs Found"
            value={stats.totalBugsFound}
            subValue={`${stats.totalBugsMissed} missed`}
            color="purple"
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
            label="Time Hunted"
            value={`${stats.totalTimeMinutes}m`}
            subValue={`~${stats.avgTimePerChallenge}s per challenge`}
            color="blue"
          />
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="text-orange-400" size={18} />
            <span className="font-semibold text-orange-300">Recommendations</span>
          </div>
          <ul className="space-y-2">
            {recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <ChevronRight size={14} className="mt-1 text-orange-400 flex-shrink-0" />
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
          <span className="font-semibold">Filters</span>
          <span className="ml-auto text-sm text-slate-400">
            {filteredChallenges.length} challenges available
          </span>
        </div>

        {/* Difficulty Filter */}
        <div className="mb-4">
          <label className="text-sm text-slate-400 mb-2 block">Difficulty</label>
          <div className="flex flex-wrap gap-2">
            {(['Easy', 'Medium', 'Hard'] as const).map(diff => (
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
          </div>
        </div>

        {/* Bug Type Filter */}
        <div className="mb-4">
          <label className="text-sm text-slate-400 mb-2 block">Bug Types</label>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(bugTypeDescriptions) as [BugType, typeof bugTypeDescriptions[BugType]][]).map(
              ([type, info]) => (
                <button
                  key={type}
                  onClick={() => toggleBugType(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1 ${
                    filters.bugTypes.includes(type)
                      ? 'bg-blue-500/30 text-blue-300 border border-blue-500'
                      : 'bg-slate-700 text-slate-400 border border-transparent hover:border-slate-600'
                  }`}
                >
                  <span>{info.icon}</span>
                  {info.name}
                </button>
              )
            )}
          </div>
        </div>

        {/* Hide Completed Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.hideCompleted}
            onChange={e => setFilters({ ...filters, hideCompleted: e.target.checked })}
            className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-300">Hide completed challenges</span>
        </label>
      </div>

      {/* Start Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={handleRandomStart}
          disabled={filteredChallenges.length === 0}
          className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Shuffle size={24} />
          Random Challenge
        </button>
      </div>

      {/* Challenge List */}
      <div>
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Search size={18} className="text-slate-400" />
          Select a Challenge
        </h3>
        <div className="grid gap-3">
          {filteredChallenges.map(challenge => {
            const isCompleted = bugHunterStore.isCompleted(challenge.id);
            const bestScore = bugHunterStore.getBestScore(challenge.id);
            
            return (
              <button
                key={challenge.id}
                onClick={() => onStart(challenge)}
                className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-slate-600 transition-all text-left group"
              >
                <div
                  className={`p-3 rounded-lg ${
                    isCompleted
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-slate-700 text-slate-400 group-hover:text-red-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={24} /> : <BugIcon size={24} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{challenge.title}</span>
                    <DifficultyBadge difficulty={challenge.difficulty} />
                  </div>
                  <div className="text-sm text-slate-400 line-clamp-1">{challenge.description}</div>
                  <div className="flex items-center gap-3 mt-1">
                    {challenge.bugs.map(bug => (
                      <span
                        key={bug.id}
                        className="text-xs text-slate-500"
                        title={bug.bugType}
                      >
                        {bugTypeDescriptions[bug.bugType].icon}
                      </span>
                    ))}
                    {challenge.bugs.length === 0 && (
                      <span className="text-xs text-slate-500">No bugs (trick question!)</span>
                    )}
                  </div>
                </div>
                {bestScore !== null && (
                  <div className="text-right">
                    <div
                      className={`text-lg font-bold ${
                        bestScore >= 80 ? 'text-green-400' : bestScore >= 50 ? 'text-yellow-400' : 'text-red-400'
                      }`}
                    >
                      {bestScore}%
                    </div>
                    <div className="text-xs text-slate-500">best</div>
                  </div>
                )}
                <ChevronRight className="text-slate-500 group-hover:text-slate-300 transition-colors" size={20} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ===== Hunting Screen =====

function HuntingScreen({
  challenge,
  selectedLines,
  setSelectedLines,
  currentBugType,
  setCurrentBugType,
  hintsUsed,
  showHint,
  onSubmit,
  startTime,
}: {
  challenge: BuggyCodeChallenge;
  selectedLines: SelectedLine[];
  setSelectedLines: (lines: SelectedLine[]) => void;
  currentBugType: BugType | null;
  setCurrentBugType: (type: BugType | null) => void;
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

  const handleLineClick = (lineNumber: number) => {
    const existing = selectedLines.find(sl => sl.lineNumber === lineNumber);
    
    if (existing) {
      // Toggle off
      setSelectedLines(selectedLines.filter(sl => sl.lineNumber !== lineNumber));
    } else {
      // Add with current bug type
      setSelectedLines([...selectedLines, { lineNumber, bugType: currentBugType }]);
    }
  };

  const updateLineBugType = (lineNumber: number, bugType: BugType) => {
    setSelectedLines(
      selectedLines.map(sl =>
        sl.lineNumber === lineNumber ? { ...sl, bugType } : sl
      )
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <BugIcon className="text-red-400" size={24} />
            <h2 className="text-xl font-bold">{challenge.title}</h2>
            <DifficultyBadge difficulty={challenge.difficulty} />
          </div>
          <p className="text-slate-400 text-sm">{challenge.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400 bg-slate-800 px-4 py-2 rounded-lg">
            <Clock size={18} />
            <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Code Panel */}
        <div className="lg:col-span-2">
          <CodeDisplay
            code={challenge.buggyCode}
            selectedLines={selectedLines}
            onLineClick={handleLineClick}
          />
        </div>

        {/* Control Panel */}
        <div className="space-y-4">
          {/* Instructions */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Target size={18} className="text-blue-400" />
              Instructions
            </h3>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>• Click on buggy lines to mark them</li>
              <li>• Select a bug type before clicking (optional)</li>
              <li>• Find ALL bugs for the best score</li>
              <li>• Avoid false positives!</li>
            </ul>
          </div>

          {/* Bug Type Selector */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <BugIcon size={18} className="text-red-400" />
              Bug Type (optional)
            </h3>
            <BugTypeSelector selectedType={currentBugType} onSelect={setCurrentBugType} />
            {currentBugType && (
              <button
                onClick={() => setCurrentBugType(null)}
                className="text-xs text-slate-500 hover:text-slate-300 mt-2"
              >
                Clear selection
              </button>
            )}
          </div>

          {/* Selected Lines */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Eye size={18} className="text-purple-400" />
              Marked Lines ({selectedLines.length})
            </h3>
            {selectedLines.length === 0 ? (
              <p className="text-sm text-slate-500">No lines marked yet</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedLines.map(sl => (
                  <div
                    key={sl.lineNumber}
                    className="flex items-center gap-2 bg-slate-900 rounded-lg px-3 py-2"
                  >
                    <span className="text-sm font-mono text-slate-400">Line {sl.lineNumber}</span>
                    <select
                      value={sl.bugType || ''}
                      onChange={e => updateLineBugType(sl.lineNumber, e.target.value as BugType)}
                      className="flex-1 text-xs bg-slate-700 border-none rounded px-2 py-1 text-slate-300"
                    >
                      <option value="">Select type...</option>
                      {(Object.entries(bugTypeDescriptions) as [BugType, typeof bugTypeDescriptions[BugType]][]).map(
                        ([type, info]) => (
                          <option key={type} value={type}>
                            {info.icon} {info.name}
                          </option>
                        )
                      )}
                    </select>
                    <button
                      onClick={() => setSelectedLines(selectedLines.filter(s => s.lineNumber !== sl.lineNumber))}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hints */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Lightbulb size={18} className="text-yellow-400" />
                Hints ({hintsUsed}/{challenge.hints.length})
              </h3>
              <button
                onClick={showHint}
                disabled={hintsUsed >= challenge.hints.length}
                className="text-sm px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Show Hint
              </button>
            </div>
            {hintsUsed > 0 && (
              <div className="space-y-2">
                {challenge.hints.slice(0, hintsUsed).map((hint, i) => (
                  <div
                    key={i}
                    className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2 text-sm text-yellow-200"
                  >
                    💡 {hint}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={onSubmit}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={24} />
            Submit ({selectedLines.length} bugs marked)
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Results Screen =====

function ResultsScreen({
  challenge,
  selectedLines,
  attempt,
  onNext,
  onRetry,
  onViewStats,
}: {
  challenge: BuggyCodeChallenge;
  selectedLines: SelectedLine[];
  attempt: {
    score: number;
    bugsFound: string[];
    bugsMissed: string[];
    falsePositives: number;
  };
  onNext: () => void;
  onRetry: () => void;
  onViewStats: () => void;
}) {
  const isPerfect = attempt.bugsMissed.length === 0 && attempt.falsePositives === 0;
  const foundCount = attempt.bugsFound.length;
  const missedCount = attempt.bugsMissed.length;
  const totalBugs = challenge.bugs.length;

  const selectedLineNumbers = new Set(selectedLines.map(sl => sl.lineNumber));
  const missedBugs = challenge.bugs.filter(b => !selectedLineNumbers.has(b.lineNumber));
  const foundBugs = challenge.bugs.filter(b => selectedLineNumbers.has(b.lineNumber));

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Result Header */}
      <div
        className={`text-center py-8 px-6 rounded-2xl mb-8 ${
          isPerfect
            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30'
            : attempt.score >= 50
            ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30'
            : 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30'
        }`}
      >
        <div className="flex justify-center mb-4">
          {isPerfect ? (
            <div className="p-4 bg-green-500/20 rounded-full">
              <Trophy className="text-green-400" size={48} />
            </div>
          ) : attempt.score >= 50 ? (
            <div className="p-4 bg-yellow-500/20 rounded-full">
              <Target className="text-yellow-400" size={48} />
            </div>
          ) : (
            <div className="p-4 bg-red-500/20 rounded-full">
              <XCircle className="text-red-400" size={48} />
            </div>
          )}
        </div>
        <h2
          className={`text-2xl font-bold mb-2 ${
            isPerfect ? 'text-green-400' : attempt.score >= 50 ? 'text-yellow-400' : 'text-red-400'
          }`}
        >
          {isPerfect ? 'Perfect Hunt!' : attempt.score >= 50 ? 'Good Effort!' : 'Keep Hunting!'}
        </h2>
        <div className="text-4xl font-bold mb-2">{attempt.score}%</div>
        <div className="flex justify-center gap-6 text-sm">
          <div>
            <span className="text-green-400 font-semibold">{foundCount}</span>
            <span className="text-slate-400"> found</span>
          </div>
          {missedCount > 0 && (
            <div>
              <span className="text-red-400 font-semibold">{missedCount}</span>
              <span className="text-slate-400"> missed</span>
            </div>
          )}
          {attempt.falsePositives > 0 && (
            <div>
              <span className="text-yellow-400 font-semibold">{attempt.falsePositives}</span>
              <span className="text-slate-400"> false +</span>
            </div>
          )}
          <div>
            <span className="text-slate-400">{totalBugs} total bugs</span>
          </div>
        </div>
      </div>

      {/* Code with Results */}
      <div className="mb-8">
        <h3 className="font-semibold text-lg mb-4">Code Review Results</h3>
        <CodeDisplay
          code={challenge.buggyCode}
          selectedLines={selectedLines}
          revealedBugs={challenge.bugs}
          showResults={true}
          disabled={true}
        />
      </div>

      {/* Bug Details */}
      {(foundBugs.length > 0 || missedBugs.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Found Bugs */}
          {foundBugs.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-green-400">
                <CheckCircle2 size={20} />
                Bugs Found ({foundBugs.length})
              </h3>
              <div className="space-y-3">
                {foundBugs.map(bug => (
                  <BugDetails key={bug.id} bug={bug} />
                ))}
              </div>
            </div>
          )}

          {/* Missed Bugs */}
          {missedBugs.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-red-400">
                <AlertTriangle size={20} />
                Bugs Missed ({missedBugs.length})
              </h3>
              <div className="space-y-3">
                {missedBugs.map(bug => (
                  <BugDetails key={bug.id} bug={bug} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Correct Code */}
      <div className="mb-8">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <CheckCircle2 size={20} className="text-green-400" />
          Corrected Code
        </h3>
        <CodeDisplay
          code={challenge.correctCode}
          selectedLines={[]}
          disabled={true}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={onNext}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          Next Challenge
          <ChevronRight size={20} />
        </button>
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 rounded-xl font-medium hover:bg-slate-600 transition-colors"
        >
          <RotateCcw size={18} />
          Try Again
        </button>
        <button
          onClick={onViewStats}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 rounded-xl font-medium hover:bg-slate-600 transition-colors"
        >
          <BarChart3 size={18} />
          View Stats
        </button>
      </div>
    </div>
  );
}

// ===== Stats Screen =====

function StatsScreen({ onBack }: { onBack: () => void }) {
  void useBugHunterStore();
  const stats = useBugHunterStats();
  const recommendations = useBugHunterRecommendations();
  const weakTypes = bugHunterStore.getWeakestBugTypes(5, 2);
  const strongTypes = bugHunterStore.getStrongestBugTypes(5, 2);
  const recentAttempts = bugHunterStore.getRecentAttempts(10);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-blue-400" size={28} />
          <h1 className="text-2xl font-bold">Bug Hunter Statistics</h1>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Target}
          label="Avg Score"
          value={`${stats.averageScore}%`}
          color={stats.averageScore >= 70 ? 'green' : stats.averageScore >= 50 ? 'yellow' : 'red'}
        />
        <StatCard
          icon={BugIcon}
          label="Bugs Found"
          value={stats.totalBugsFound}
          subValue={`${stats.perfectAttempts} perfect hunts`}
          color="purple"
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
          label="Total Time"
          value={`${stats.totalTimeMinutes}m`}
          subValue={`${stats.uniqueChallengesCompleted} challenges`}
          color="blue"
        />
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="text-orange-400" size={20} />
            <span className="font-semibold text-orange-300">Recommendations</span>
          </div>
          <ul className="space-y-2">
            {recommendations.map((rec, i) => (
              <li key={i} className="text-slate-300 flex items-start gap-2">
                <ChevronRight size={16} className="mt-1 text-orange-400 flex-shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bug Type Performance */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Weakest */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="text-red-400" size={20} />
            <h3 className="font-semibold">Needs Practice</h3>
          </div>
          {weakTypes.length > 0 ? (
            <div className="space-y-3">
              {weakTypes.map(ts => (
                <div key={ts.bugType} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{bugTypeDescriptions[ts.bugType].icon}</span>
                    <span className="text-sm">{bugTypeDescriptions[ts.bugType].name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-400"
                        style={{ width: `${ts.accuracy * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-red-400 w-12 text-right">
                      {Math.round(ts.accuracy * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Complete more challenges to see weak areas</p>
          )}
        </div>

        {/* Strongest */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-green-400" size={20} />
            <h3 className="font-semibold">Strong Areas</h3>
          </div>
          {strongTypes.length > 0 ? (
            <div className="space-y-3">
              {strongTypes.map(ts => (
                <div key={ts.bugType} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{bugTypeDescriptions[ts.bugType].icon}</span>
                    <span className="text-sm">{bugTypeDescriptions[ts.bugType].name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-400"
                        style={{ width: `${ts.accuracy * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-green-400 w-12 text-right">
                      {Math.round(ts.accuracy * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Complete more challenges to see strong areas</p>
          )}
        </div>
      </div>

      {/* Recent Attempts */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <h3 className="font-semibold mb-4">Recent Hunts</h3>
        {recentAttempts.length > 0 ? (
          <div className="space-y-2">
            {recentAttempts.map((attempt, i) => {
              const challenge = buggyCodeChallenges.find(c => c.id === attempt.challengeId);
              const isPerfect = attempt.bugsMissed.length === 0 && attempt.falsePositives === 0;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg"
                >
                  <div
                    className={`p-1.5 rounded-full ${
                      isPerfect
                        ? 'bg-green-500/20 text-green-400'
                        : attempt.score >= 50
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {isPerfect ? (
                      <Trophy size={16} />
                    ) : attempt.score >= 50 ? (
                      <Target size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {challenge?.title || attempt.challengeId}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(attempt.timestamp).toLocaleDateString()} ·{' '}
                      {attempt.bugsFound.length} found, {attempt.bugsMissed.length} missed
                      {attempt.hintsUsed > 0 && ` · ${attempt.hintsUsed} hints`}
                    </div>
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      isPerfect ? 'text-green-400' : attempt.score >= 50 ? 'text-yellow-400' : 'text-red-400'
                    }`}
                  >
                    {attempt.score}%
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No attempts yet. Start hunting!</p>
        )}
      </div>

      {/* Reset Progress */}
      <div className="mt-8 text-center">
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset all Bug Hunter progress? This cannot be undone.')) {
              bugHunterStore.resetProgress();
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

export function BugHunterPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('setup');
  const [filters, setFilters] = useState<FilterOptions>({
    difficulties: [],
    bugTypes: [],
    hideCompleted: false,
  });
  const [currentChallenge, setCurrentChallenge] = useState<BuggyCodeChallenge | null>(null);
  const [selectedLines, setSelectedLines] = useState<SelectedLine[]>([]);
  const [currentBugType, setCurrentBugType] = useState<BugType | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [lastAttempt, setLastAttempt] = useState<{
    score: number;
    bugsFound: string[];
    bugsMissed: string[];
    falsePositives: number;
  } | null>(null);

  const startChallenge = useCallback((challenge: BuggyCodeChallenge) => {
    setCurrentChallenge(challenge);
    setSelectedLines([]);
    setCurrentBugType(null);
    setHintsUsed(0);
    setStartTime(Date.now());
    setLastAttempt(null);
    setViewMode('hunting');
  }, []);

  const handleShowHint = () => {
    if (currentChallenge && hintsUsed < currentChallenge.hints.length) {
      setHintsUsed(hintsUsed + 1);
    }
  };

  const handleSubmit = () => {
    if (!currentChallenge) return;

    const timeSpent = Date.now() - startTime;
    const selectedLineNumbers = new Set(selectedLines.map(sl => sl.lineNumber));
    const actualBugLines = new Set(currentChallenge.bugs.map(b => b.lineNumber));

    const bugsFound: string[] = [];
    const bugsMissed: string[] = [];
    const bugTypesCorrect: BugType[] = [];
    const bugTypesMissed: BugType[] = [];

    currentChallenge.bugs.forEach(bug => {
      if (selectedLineNumbers.has(bug.lineNumber)) {
        bugsFound.push(bug.id);
        bugTypesCorrect.push(bug.bugType);
      } else {
        bugsMissed.push(bug.id);
        bugTypesMissed.push(bug.bugType);
      }
    });

    let falsePositives = 0;
    selectedLines.forEach(sl => {
      if (!actualBugLines.has(sl.lineNumber)) {
        falsePositives++;
      }
    });

    const attempt = bugHunterStore.recordAttempt(
      currentChallenge.id,
      bugsFound,
      bugsMissed,
      falsePositives,
      hintsUsed,
      timeSpent,
      bugTypesCorrect,
      bugTypesMissed
    );

    setLastAttempt({
      score: attempt.score,
      bugsFound,
      bugsMissed,
      falsePositives,
    });
    setViewMode('results');
  };

  const handleNext = () => {
    // Get a random challenge that's different from current
    const available = buggyCodeChallenges.filter(c => c.id !== currentChallenge?.id);
    if (available.length > 0) {
      const randomIndex = Math.floor(Math.random() * available.length);
      startChallenge(available[randomIndex]);
    }
  };

  const handleRetry = () => {
    if (currentChallenge) {
      startChallenge(currentChallenge);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {viewMode === 'setup' && (
        <SetupScreen
          onStart={startChallenge}
          filters={filters}
          setFilters={setFilters}
        />
      )}
      {viewMode === 'hunting' && currentChallenge && (
        <HuntingScreen
          challenge={currentChallenge}
          selectedLines={selectedLines}
          setSelectedLines={setSelectedLines}
          currentBugType={currentBugType}
          setCurrentBugType={setCurrentBugType}
          hintsUsed={hintsUsed}
          showHint={handleShowHint}
          onSubmit={handleSubmit}
          startTime={startTime}
        />
      )}
      {viewMode === 'results' && currentChallenge && lastAttempt && (
        <ResultsScreen
          challenge={currentChallenge}
          selectedLines={selectedLines}
          attempt={lastAttempt}
          onNext={handleNext}
          onRetry={handleRetry}
          onViewStats={() => setViewMode('stats')}
        />
      )}
      {viewMode === 'stats' && <StatsScreen onBack={() => setViewMode('setup')} />}
    </div>
  );
}

export default BugHunterPage;
