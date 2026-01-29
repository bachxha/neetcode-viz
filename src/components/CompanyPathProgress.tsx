import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Flame,
  TrendingUp,
  CheckCircle2,
  Target,
  Calendar,
} from 'lucide-react';
import type { CompanyPath } from '../data/companyPaths';
import { useProgressStore } from '../store/progressStore';

interface CompanyPathProgressProps {
  path: CompanyPath;
}

export function CompanyPathProgress({ path }: CompanyPathProgressProps) {
  const state = useProgressStore();

  const progressData = useMemo(() => {
    // Calculate phase-by-phase progress
    const phases = path.phases.map((phase) => {
      const problemIds = phase.problems.map(p => p.problemId);
      const completed = problemIds.filter(id => state.problems[id]).length;
      return {
        name: phase.name,
        completed,
        total: phase.problems.length,
        percentage: Math.round((completed / phase.problems.length) * 100),
        weeks: phase.weeks,
      };
    });

    // Calculate total progress
    const totalProblems = phases.reduce((sum, p) => sum + p.total, 0);
    const totalCompleted = phases.reduce((sum, p) => sum + p.completed, 0);

    // Estimate time remaining based on pace
    // Get problems from this path that user has solved
    const pathProblemIds = path.phases.flatMap(p => p.problems.map(prob => prob.problemId));
    const solvedTimestamps: number[] = [];
    
    pathProblemIds.forEach(id => {
      const progress = state.problems[id];
      if (progress) {
        solvedTimestamps.push(...progress.solvedAt);
      }
    });

    // Calculate average pace (problems per day)
    let avgProblemsPerDay = 0;
    let estimatedDaysRemaining = 0;
    
    if (solvedTimestamps.length >= 2) {
      solvedTimestamps.sort((a, b) => a - b);
      const firstSolve = solvedTimestamps[0];
      const lastSolve = solvedTimestamps[solvedTimestamps.length - 1];
      const daysDiff = Math.max(1, (lastSolve - firstSolve) / (24 * 60 * 60 * 1000));
      avgProblemsPerDay = solvedTimestamps.length / daysDiff;
      
      const remaining = totalProblems - totalCompleted;
      estimatedDaysRemaining = avgProblemsPerDay > 0 ? Math.ceil(remaining / avgProblemsPerDay) : 0;
    }

    // Calculate streak for this path
    // Count consecutive days with activity on this path
    const activityDays = new Set<string>();
    pathProblemIds.forEach(id => {
      const progress = state.problems[id];
      if (progress) {
        progress.solvedAt.forEach(ts => {
          const day = new Date(ts).toISOString().split('T')[0];
          activityDays.add(day);
        });
      }
    });

    // Count recent streak
    let pathStreak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (activityDays.has(dateStr)) {
        pathStreak++;
      } else if (i > 0) {
        // Allow today to be missing (user might not have solved yet today)
        break;
      }
    }

    // Last 7 days activity
    const last7Days: boolean[] = [];
    for (let i = 6; i >= 0; i--) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      last7Days.push(activityDays.has(dateStr));
    }

    return {
      phases,
      totalProblems,
      totalCompleted,
      avgProblemsPerDay,
      estimatedDaysRemaining,
      pathStreak,
      last7Days,
    };
  }, [path, state]);

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  // Adjust to show correct day labels starting from 6 days ago
  const today = new Date().getDay(); // 0 = Sunday
  const adjustedLabels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayIndex = (today - i + 7) % 7;
    // Convert: 0=Sun, 1=Mon, ... to our labels
    const labelIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    adjustedLabels.push(dayLabels[labelIndex]);
  }

  return (
    <div className="mb-8 space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <CheckCircle2 size={14} />
            <span className="text-xs">Completed</span>
          </div>
          <div className="text-xl font-bold text-green-400">
            {progressData.totalCompleted}/{progressData.totalProblems}
          </div>
        </div>

        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <TrendingUp size={14} />
            <span className="text-xs">Daily Pace</span>
          </div>
          <div className="text-xl font-bold text-blue-400">
            {progressData.avgProblemsPerDay > 0 
              ? progressData.avgProblemsPerDay.toFixed(1)
              : '—'}
            <span className="text-sm font-normal text-slate-400">/day</span>
          </div>
        </div>

        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Clock size={14} />
            <span className="text-xs">Est. Remaining</span>
          </div>
          <div className="text-xl font-bold text-purple-400">
            {progressData.estimatedDaysRemaining > 0
              ? `${progressData.estimatedDaysRemaining}d`
              : progressData.totalCompleted === progressData.totalProblems
              ? '✓'
              : '—'}
          </div>
        </div>

        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Flame size={14} />
            <span className="text-xs">Path Streak</span>
          </div>
          <div className="text-xl font-bold text-orange-400">
            {progressData.pathStreak}
            <span className="text-sm font-normal text-slate-400"> days</span>
          </div>
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-slate-400" />
          <span className="text-sm font-medium">Last 7 Days Activity</span>
        </div>
        <div className="flex gap-2 justify-center">
          {progressData.last7Days.map((active, i) => (
            <div key={i} className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  active
                    ? 'bg-green-500/20 border border-green-500/40'
                    : 'bg-slate-700/50 border border-slate-600/50'
                }`}
              >
                {active ? (
                  <CheckCircle2 size={14} className="text-green-400" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-600" />
                )}
              </motion.div>
              <div className="text-xs text-slate-500 mt-1">{adjustedLabels[i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase Progress Bars */}
      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Target size={16} className="text-slate-400" />
          <span className="text-sm font-medium">Phase Progress</span>
        </div>
        <div className="space-y-3">
          {progressData.phases.map((phase, index) => (
            <div key={phase.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  {phase.name}
                </span>
                <span className={phase.percentage === 100 ? 'text-green-400' : 'text-slate-300'}>
                  {phase.completed}/{phase.total}
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${phase.percentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`h-full rounded-full ${
                    phase.percentage === 100
                      ? 'bg-green-500'
                      : phase.percentage > 0
                      ? 'bg-blue-500'
                      : 'bg-slate-600'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
