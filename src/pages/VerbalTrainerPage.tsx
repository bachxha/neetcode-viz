/**
 * Verbal Explanation Trainer Page
 * Practice explaining algorithm solutions out loud
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Mic,
  Target,
  Trophy,
  Flame,
  Clock,
  BarChart3,
  ChevronRight,
  RotateCcw,
  Filter,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { problems, type Problem, type Difficulty, type Category } from '../data/problems';
import { explanationCheckpoints } from '../data/verbalCheckpoints';
import { SpeechRecorder } from '../components/SpeechRecorder';
import { ExplanationAnalyzer, analyzeTranscript } from '../components/ExplanationAnalyzer';
import {
  verbalTrainerStore,
  useVerbalTrainerStore,
  useVerbalStats,
  useVerbalRecommendations,
} from '../store/verbalTrainerStore';

type TrainingMode = 'setup' | 'recording' | 'result' | 'stats';

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

function ProblemSelector({
  selectedProblem,
  onSelect,
  filter,
}: {
  selectedProblem: Problem | null;
  onSelect: (problem: Problem) => void;
  filter: { difficulty: Difficulty | null; category: Category | null };
}) {
  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      if (filter.difficulty && p.difficulty !== filter.difficulty) return false;
      if (filter.category && p.category !== filter.category) return false;
      return true;
    });
  }, [filter]);

  return (
    <div className="max-h-80 overflow-y-auto space-y-1 pr-2">
      {filteredProblems.length === 0 ? (
        <p className="text-slate-500 text-center py-4">No problems match the filter</p>
      ) : (
        filteredProblems.map(problem => (
          <button
            key={problem.id}
            onClick={() => onSelect(problem)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
              selectedProblem?.id === problem.id
                ? 'bg-blue-500/20 border-blue-400 ring-2 ring-blue-400/50'
                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{problem.title}</div>
              <div className="text-xs text-slate-500">{problem.category}</div>
            </div>
            <DifficultyBadge difficulty={problem.difficulty} />
          </button>
        ))
      )}
    </div>
  );
}

// ===== Setup Screen =====

function SetupScreen({
  onStart,
  selectedProblem,
  setSelectedProblem,
}: {
  onStart: () => void;
  selectedProblem: Problem | null;
  setSelectedProblem: (p: Problem | null) => void;
}) {
  const stats = useVerbalStats();
  const recommendations = useVerbalRecommendations();
  const [filter, setFilter] = useState<{ difficulty: Difficulty | null; category: Category | null }>({
    difficulty: null,
    category: null,
  });

  const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Mic className="text-pink-400" size={32} />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-orange-500 bg-clip-text text-transparent">
            Verbal Explanation Trainer
          </h1>
        </div>
        <p className="text-slate-400 max-w-xl mx-auto">
          Practice explaining your solutions out loud — a crucial interview skill.
          Get feedback on clarity, completeness, and filler words.
        </p>
      </div>

      {/* Quick Stats */}
      {stats.totalSessions > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={Target}
            label="Avg Score"
            value={`${stats.averageScore}`}
            color={stats.averageScore >= 70 ? 'green' : stats.averageScore >= 50 ? 'yellow' : 'red'}
          />
          <StatCard
            icon={Trophy}
            label="Sessions"
            value={stats.totalSessions}
            subValue={`${stats.problemsExplained} problems`}
            color="blue"
          />
          <StatCard
            icon={Flame}
            label="Streak"
            value={stats.currentStreak}
            subValue={`Best: ${stats.bestStreak}`}
            color="orange"
          />
          <StatCard
            icon={Clock}
            label="Practice Time"
            value={`${stats.totalPracticeMinutes}m`}
            subValue={`~${stats.averageDuration}s avg`}
            color="purple"
          />
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-pink-500/10 to-orange-500/10 border border-pink-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="text-pink-400" size={18} />
            <span className="font-semibold text-pink-300">Recommendations</span>
          </div>
          <ul className="space-y-2">
            {recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <ChevronRight size={14} className="mt-1 text-pink-400 flex-shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Problem Selection */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-slate-400" />
            <span className="font-semibold">Select a Problem to Explain</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-500" />
          </div>
          {difficulties.map(diff => (
            <button
              key={diff}
              onClick={() => setFilter(f => ({
                ...f,
                difficulty: f.difficulty === diff ? null : diff,
              }))}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter.difficulty === diff
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
          {(filter.difficulty || filter.category) && (
            <button
              onClick={() => setFilter({ difficulty: null, category: null })}
              className="text-xs text-slate-500 hover:text-slate-300 ml-2"
            >
              Clear
            </button>
          )}
        </div>

        <ProblemSelector
          selectedProblem={selectedProblem}
          onSelect={setSelectedProblem}
          filter={filter}
        />
      </div>

      {/* What to Cover */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <CheckCircle2 className="text-blue-400" size={18} />
          What to Cover in Your Explanation
        </h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {explanationCheckpoints.map(cp => (
            <div
              key={cp.id}
              className={`p-2 rounded-lg border ${
                cp.importance === 'required'
                  ? 'bg-red-500/5 border-red-500/20'
                  : cp.importance === 'recommended'
                  ? 'bg-yellow-500/5 border-yellow-500/20'
                  : 'bg-blue-500/5 border-blue-500/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{cp.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  cp.importance === 'required'
                    ? 'bg-red-500/20 text-red-400'
                    : cp.importance === 'recommended'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {cp.importance}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center">
        <button
          onClick={onStart}
          disabled={!selectedProblem}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Mic size={24} />
          Start Recording
        </button>
        {!selectedProblem && (
          <p className="text-slate-500 text-sm mt-2">Select a problem first</p>
        )}
      </div>
    </div>
  );
}

// ===== Recording Screen =====

function RecordingScreen({
  problem,
  onStop,
}: {
  problem: Problem;
  onStop: (transcript: string, duration: number) => void;
}) {
  const [transcript, setTranscript] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Checkpoint tracking in real-time
  const coveredCheckpoints = useMemo(() => {
    const analysis = analyzeTranscript(transcript);
    return new Set(analysis.checkpointsCovered);
  }, [transcript]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleTranscriptUpdate = useCallback((newTranscript: string, _isFinal: boolean) => {
    setTranscript(newTranscript);
  }, []);

  const handleRecordingStart = useCallback(() => {
    setIsRecording(true);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, []);

  const handleRecordingStop = useCallback((finalTranscript: string) => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    onStop(finalTranscript, duration);
  }, [onStop]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Mic className="text-pink-400" size={24} />
          <span className="font-semibold text-lg">Recording Your Explanation</span>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            isRecording ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'
          }`}>
            <Clock size={16} />
            <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
          </div>
        </div>
      </div>

      {/* Problem Info */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-xl font-bold">{problem.title}</h2>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
        <p className="text-slate-400 text-sm">{problem.category}</p>
      </div>

      {/* Live Checkpoints */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-6">
        <h3 className="font-medium text-sm text-slate-400 mb-3">Live Checkpoint Tracker</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {explanationCheckpoints.map(cp => (
            <div
              key={cp.id}
              className={`p-2 rounded-lg text-center transition-all ${
                coveredCheckpoints.has(cp.id)
                  ? 'bg-green-500/20 border border-green-500/50'
                  : 'bg-slate-700/50 border border-slate-600'
              }`}
            >
              <div className={`text-lg mb-1 ${coveredCheckpoints.has(cp.id) ? 'text-green-400' : 'text-slate-500'}`}>
                {coveredCheckpoints.has(cp.id) ? <CheckCircle2 size={20} className="mx-auto" /> : <XCircle size={20} className="mx-auto opacity-50" />}
              </div>
              <div className={`text-xs ${coveredCheckpoints.has(cp.id) ? 'text-green-300' : 'text-slate-500'}`}>
                {cp.label.split(' ')[0]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recording Interface */}
      <div className="bg-gradient-to-r from-pink-500/10 to-orange-500/10 border border-pink-500/30 rounded-xl p-8 mb-6">
        <SpeechRecorder
          onTranscriptUpdate={handleTranscriptUpdate}
          onRecordingStart={handleRecordingStart}
          onRecordingStop={handleRecordingStop}
        />
      </div>

      {/* Live Transcript */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
        <h3 className="font-medium text-sm text-slate-400 mb-3">Live Transcript</h3>
        <div className="min-h-32 max-h-48 overflow-y-auto p-4 bg-slate-900/50 rounded-lg">
          {transcript ? (
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {transcript}
            </p>
          ) : (
            <p className="text-slate-600 text-sm italic">
              Start speaking and your words will appear here...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Result Screen =====

function ResultScreen({
  problem,
  transcript,
  duration,
  onRetry,
  onNewProblem,
  onViewStats,
}: {
  problem: Problem;
  transcript: string;
  duration: number;
  onRetry: () => void;
  onNewProblem: () => void;
  onViewStats: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Problem Header */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="font-bold">{problem.title}</h2>
          <DifficultyBadge difficulty={problem.difficulty} />
          <span className="text-sm text-slate-500">{problem.category}</span>
        </div>
      </div>

      {/* Analysis */}
      <ExplanationAnalyzer
        transcript={transcript}
        duration={duration}
        onRetry={onRetry}
      />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <button
          onClick={onNewProblem}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          New Problem
          <ChevronRight size={20} />
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
  void useVerbalTrainerStore(); // Subscribe
  const stats = useVerbalStats();
  const recommendations = useVerbalRecommendations();
  const recentSessions = verbalTrainerStore.getRecentSessions(10);
  const weakestCheckpoints = verbalTrainerStore.getWeakestCheckpoints(3);
  const strongestCheckpoints = verbalTrainerStore.getStrongestCheckpoints(3);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-blue-400" size={28} />
          <h1 className="text-2xl font-bold">Verbal Training Stats</h1>
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
          label="Average Score"
          value={`${stats.averageScore}`}
          color={stats.averageScore >= 70 ? 'green' : stats.averageScore >= 50 ? 'yellow' : 'red'}
        />
        <StatCard
          icon={Trophy}
          label="Total Sessions"
          value={stats.totalSessions}
          subValue={`${stats.problemsExplained} unique problems`}
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
          label="Total Practice"
          value={`${stats.totalPracticeMinutes}m`}
          subValue={`~${stats.averageDuration}s avg`}
          color="purple"
        />
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-pink-500/10 to-orange-500/10 border border-pink-500/30 rounded-xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="text-pink-400" size={20} />
            <span className="font-semibold text-pink-300">Recommendations</span>
          </div>
          <ul className="space-y-2">
            {recommendations.map((rec, i) => (
              <li key={i} className="text-slate-300 flex items-start gap-2">
                <ChevronRight size={16} className="mt-1 text-pink-400 flex-shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Checkpoint Performance */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Weakest */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <XCircle className="text-red-400" size={18} />
            Needs Improvement
          </h3>
          {weakestCheckpoints.length > 0 ? (
            <div className="space-y-3">
              {weakestCheckpoints.map(cp => {
                const checkpoint = explanationCheckpoints.find(c => c.id === cp.checkpointId);
                return (
                  <div key={cp.checkpointId} className="flex items-center justify-between">
                    <span className="text-sm">{checkpoint?.label || cp.checkpointId}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-400"
                          style={{ width: `${cp.coverageRate * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-red-400 w-12 text-right">
                        {Math.round(cp.coverageRate * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Complete at least 2 sessions to see patterns</p>
          )}
        </div>

        {/* Strongest */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-green-400" size={18} />
            Strongest Points
          </h3>
          {strongestCheckpoints.length > 0 ? (
            <div className="space-y-3">
              {strongestCheckpoints.map(cp => {
                const checkpoint = explanationCheckpoints.find(c => c.id === cp.checkpointId);
                return (
                  <div key={cp.checkpointId} className="flex items-center justify-between">
                    <span className="text-sm">{checkpoint?.label || cp.checkpointId}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-400"
                          style={{ width: `${cp.coverageRate * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-green-400 w-12 text-right">
                        {Math.round(cp.coverageRate * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Complete at least 2 sessions to see patterns</p>
          )}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <h3 className="font-semibold mb-4">Recent Sessions</h3>
        {recentSessions.length > 0 ? (
          <div className="space-y-2">
            {recentSessions.map(session => {
              const problem = problems.find(p => p.id === session.problemId);
              return (
                <div
                  key={session.id}
                  className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg"
                >
                  <div className={`p-1.5 rounded-full ${
                    session.score >= 70
                      ? 'bg-green-500/20 text-green-400'
                      : session.score >= 50
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {session.score >= 70 ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <Target size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {problem?.title || session.problemId}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(session.timestamp).toLocaleDateString()} ·{' '}
                      {Math.floor(session.duration / 60)}:{(session.duration % 60).toString().padStart(2, '0')} ·{' '}
                      {session.checkpointsCovered.length}/{explanationCheckpoints.length} points
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${
                    session.score >= 70 ? 'text-green-400' : session.score >= 50 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {session.score}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No sessions yet. Start practicing!</p>
        )}
      </div>

      {/* Reset Progress */}
      <div className="mt-8 text-center">
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset all verbal training progress? This cannot be undone.')) {
              verbalTrainerStore.resetProgress();
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

export function VerbalTrainerPage() {
  const [mode, setMode] = useState<TrainingMode>('setup');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [transcript, setTranscript] = useState('');
  const [duration, setDuration] = useState(0);

  const handleStart = useCallback(() => {
    if (selectedProblem) {
      setTranscript('');
      setDuration(0);
      setMode('recording');
    }
  }, [selectedProblem]);

  const handleRecordingStop = useCallback((finalTranscript: string, recordingDuration: number) => {
    setTranscript(finalTranscript);
    setDuration(recordingDuration);

    // Analyze and save
    if (selectedProblem && finalTranscript.trim()) {
      const analysis = analyzeTranscript(finalTranscript);
      verbalTrainerStore.recordSession(
        selectedProblem.id,
        recordingDuration,
        finalTranscript,
        analysis.score,
        analysis.checkpointsCovered,
        analysis.checkpointsMissed,
        analysis.fillerWordCount,
        analysis.wordCount
      );
    }

    setMode('result');
  }, [selectedProblem]);

  const handleRetry = useCallback(() => {
    setTranscript('');
    setDuration(0);
    setMode('recording');
  }, []);

  const handleNewProblem = useCallback(() => {
    setSelectedProblem(null);
    setTranscript('');
    setDuration(0);
    setMode('setup');
  }, []);

  const handleViewStats = useCallback(() => {
    setMode('stats');
  }, []);

  const handleBackFromStats = useCallback(() => {
    setMode('setup');
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {mode === 'setup' && (
        <SetupScreen
          onStart={handleStart}
          selectedProblem={selectedProblem}
          setSelectedProblem={setSelectedProblem}
        />
      )}
      {mode === 'recording' && selectedProblem && (
        <RecordingScreen
          problem={selectedProblem}
          onStop={handleRecordingStop}
        />
      )}
      {mode === 'result' && selectedProblem && (
        <ResultScreen
          problem={selectedProblem}
          transcript={transcript}
          duration={duration}
          onRetry={handleRetry}
          onNewProblem={handleNewProblem}
          onViewStats={handleViewStats}
        />
      )}
      {mode === 'stats' && (
        <StatsScreen onBack={handleBackFromStats} />
      )}
    </div>
  );
}

export default VerbalTrainerPage;
