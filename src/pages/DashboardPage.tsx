import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Flame,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Star,
} from 'lucide-react';
import { progressStore, useProgressStore } from '../store/progressStore';
import { problems, categories, type Difficulty } from '../data/problems';

interface DashboardPageProps {
  onSelectProblem: (problemId: string) => void;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffMinutes = Math.floor(diffMs / (60 * 1000));

  if (diffDays > 0) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }
  if (diffHours > 0) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }
  if (diffMinutes > 0) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  }
  return 'just now';
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 rounded-lg p-4 border border-slate-700"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-slate-400">{label}</p>
          {subValue && <p className="text-xs text-slate-500">{subValue}</p>}
        </div>
      </div>
    </motion.div>
  );
}

function DifficultyBar({
  difficulty,
  solved,
  total,
}: {
  difficulty: Difficulty;
  solved: number;
  total: number;
}) {
  const colors: Record<Difficulty, { bg: string; fill: string }> = {
    Easy: { bg: 'bg-green-500/20', fill: 'bg-green-500' },
    Medium: { bg: 'bg-yellow-500/20', fill: 'bg-yellow-500' },
    Hard: { bg: 'bg-red-500/20', fill: 'bg-red-500' },
  };

  const percentage = total > 0 ? (solved / total) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{difficulty}</span>
        <span className="font-medium">
          {solved}/{total}
        </span>
      </div>
      <div className={`h-2 rounded-full ${colors[difficulty].bg}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full rounded-full ${colors[difficulty].fill}`}
        />
      </div>
    </div>
  );
}

function CategoryProgress({
  category,
  solved,
  total,
}: {
  category: string;
  solved: number;
  total: number;
}) {
  const percentage = total > 0 ? (solved / total) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400 truncate max-w-[180px]" title={category}>
          {category}
        </span>
        <span className="font-medium whitespace-nowrap">
          {solved}/{total}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-700">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          className="h-full rounded-full bg-blue-500"
        />
      </div>
    </div>
  );
}

export function DashboardPage({ onSelectProblem }: DashboardPageProps) {
  const state = useProgressStore();

  const stats = useMemo(() => {
    const solvedProblems = progressStore.getSolvedProblems();
    const dueForReview = progressStore.getDueForReview();
    const streakCount = progressStore.getStreakCount();
    const recentActivity = progressStore.getRecentActivity(10);
    const progressByDifficulty = progressStore.getProgressByDifficulty();
    const progressByCategory = progressStore.getProgressByCategory(problems);

    // Count total by difficulty
    const totalByDifficulty: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };
    problems.forEach((p) => totalByDifficulty[p.difficulty]++);

    return {
      totalSolved: solvedProblems.length,
      totalProblems: problems.length,
      dueForReview,
      streakCount,
      recentActivity,
      progressByDifficulty,
      totalByDifficulty,
      progressByCategory,
    };
  }, [state]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-slate-400">
          Track your progress and review problems using spaced repetition.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={CheckCircle2}
          label="Problems Solved"
          value={stats.totalSolved}
          subValue={`of ${stats.totalProblems} total`}
          color="bg-green-500/20 text-green-400"
        />
        <StatCard
          icon={AlertCircle}
          label="Due for Review"
          value={stats.dueForReview.length}
          subValue="needs attention"
          color="bg-amber-500/20 text-amber-400"
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${stats.streakCount} day${stats.streakCount !== 1 ? 's' : ''}`}
          subValue="keep it up!"
          color="bg-orange-500/20 text-orange-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Completion"
          value={`${Math.round((stats.totalSolved / stats.totalProblems) * 100)}%`}
          subValue={`${stats.totalSolved}/${stats.totalProblems}`}
          color="bg-blue-500/20 text-blue-400"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Problems Due for Review */}
        <div className="md:col-span-2 bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock size={20} className="text-amber-400" />
            Problems Due for Review
          </h2>
          {stats.dueForReview.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {stats.dueForReview.map((progress) => {
                const problem = problems.find((p) => p.id === progress.problemId);
                if (!problem) return null;

                return (
                  <motion.button
                    key={progress.problemId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => onSelectProblem(progress.problemId)}
                    className="w-full flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-left"
                  >
                    <div
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        problem.difficulty === 'Easy'
                          ? 'bg-green-500/20 text-green-400'
                          : problem.difficulty === 'Medium'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {problem.difficulty}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{problem.title}</p>
                      <p className="text-xs text-slate-400">{problem.category}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Star
                        size={12}
                        className="text-yellow-400 fill-yellow-400"
                      />
                      {progress.confidence}
                    </div>
                    <ArrowRight size={16} className="text-slate-500" />
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <CheckCircle2 size={40} className="mx-auto mb-2 text-green-400" />
              <p>No problems due for review!</p>
              <p className="text-sm">Keep solving to build your review queue.</p>
            </div>
          )}
        </div>

        {/* Progress by Difficulty */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h2 className="text-lg font-semibold mb-4">Progress by Difficulty</h2>
          <div className="space-y-4">
            {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((difficulty) => (
              <DifficultyBar
                key={difficulty}
                difficulty={difficulty}
                solved={stats.progressByDifficulty[difficulty]}
                total={stats.totalByDifficulty[difficulty]}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="md:col-span-2 bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {stats.recentActivity.map(({ problem, timestamp }, index) => {
                const problemData = problems.find((p) => p.id === problem.problemId);
                if (!problemData) return null;

                return (
                  <div
                    key={`${problem.problemId}-${timestamp}-${index}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{problemData.title}</p>
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {formatRelativeTime(timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p>No activity yet. Start solving problems!</p>
            </div>
          )}
        </div>

        {/* Progress by Category */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 max-h-96 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Progress by Category</h2>
          <div className="space-y-3">
            {categories.map((category) => {
              const categoryProgress = stats.progressByCategory[category];
              if (!categoryProgress) return null;

              return (
                <CategoryProgress
                  key={category}
                  category={category}
                  solved={categoryProgress.solved}
                  total={categoryProgress.total}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
