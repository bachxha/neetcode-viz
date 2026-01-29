import { motion } from 'framer-motion';
import {
  Building2,
  Clock,
  Target,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { companyPaths, getTotalProblemsCount, type CompanyPath } from '../data/companyPaths';
import { useProgressStore } from '../store/progressStore';

interface CompanyPathsPageProps {
  onSelectCompany: (companyId: string) => void;
}

function CompanyCard({
  path,
  completedCount,
  onClick,
}: {
  path: CompanyPath;
  completedCount: number;
  onClick: () => void;
}) {
  const totalProblems = getTotalProblemsCount(path);
  const percentage = totalProblems > 0 ? Math.round((completedCount / totalProblems) * 100) : 0;
  const isStarted = completedCount > 0;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="text-left p-6 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="text-4xl">{path.logo}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold mb-1">{path.name}</h3>
          <p className="text-sm text-slate-400 line-clamp-2">{path.description}</p>
        </div>
      </div>

      {/* Focus Areas */}
      <div className="flex flex-wrap gap-2 mb-4">
        {path.focusAreas.slice(0, 3).map((area) => (
          <span
            key={area}
            className="px-2 py-1 text-xs bg-slate-700/50 rounded-full text-slate-300"
          >
            {area}
          </span>
        ))}
        {path.focusAreas.length > 3 && (
          <span className="px-2 py-1 text-xs bg-slate-700/50 rounded-full text-slate-400">
            +{path.focusAreas.length - 3} more
          </span>
        )}
      </div>

      {/* Timeline & Stats */}
      <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{path.timeline.weeks} weeks</span>
        </div>
        <div className="flex items-center gap-1">
          <Target size={14} />
          <span>{totalProblems} problems</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">Progress</span>
          <span className={isStarted ? 'text-blue-400' : 'text-slate-500'}>
            {completedCount}/{totalProblems} ({percentage}%)
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-blue-400">
          {isStarted ? 'Continue Path' : 'Start Path'}
        </span>
        <ChevronRight size={16} className="text-blue-400" />
      </div>
    </motion.button>
  );
}

function StatsOverview() {
  const state = useProgressStore();
  
  // Calculate stats across all company paths
  let totalPathProblems = 0;
  let totalCompleted = 0;
  let pathsStarted = 0;
  let pathsCompleted = 0;

  companyPaths.forEach((path) => {
    const problemIds = path.phases.flatMap(phase => phase.problems.map(p => p.problemId));
    const completedInPath = problemIds.filter(id => state.problems[id]).length;
    totalPathProblems += problemIds.length;
    totalCompleted += completedInPath;
    if (completedInPath > 0) pathsStarted++;
    if (completedInPath === problemIds.length) pathsCompleted++;
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <div className="text-2xl font-bold text-blue-400">{companyPaths.length}</div>
        <div className="text-sm text-slate-400">Company Paths</div>
      </div>
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <div className="text-2xl font-bold text-green-400">{pathsStarted}</div>
        <div className="text-sm text-slate-400">Paths Started</div>
      </div>
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <div className="text-2xl font-bold text-purple-400">{pathsCompleted}</div>
        <div className="text-sm text-slate-400">Paths Completed</div>
      </div>
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <div className="text-2xl font-bold text-amber-400">
          {Math.round((totalCompleted / totalPathProblems) * 100)}%
        </div>
        <div className="text-sm text-slate-400">Overall Progress</div>
      </div>
    </div>
  );
}

function RecommendedPath() {
  const state = useProgressStore();
  
  // Find the path with most progress that isn't complete
  let recommendedPath: CompanyPath | null = null;
  let maxProgress = -1;

  companyPaths.forEach((path) => {
    const problemIds = path.phases.flatMap(phase => phase.problems.map(p => p.problemId));
    const completedInPath = problemIds.filter(id => state.problems[id]).length;
    const percentage = completedInPath / problemIds.length;
    
    // Recommend path that's started but not complete
    if (completedInPath > 0 && percentage < 1 && completedInPath > maxProgress) {
      maxProgress = completedInPath;
      recommendedPath = path;
    }
  });

  // If no path started, recommend Google (most popular)
  if (!recommendedPath) {
    recommendedPath = companyPaths.find(p => p.id === 'google') || companyPaths[0];
  }

  const problemIds = recommendedPath.phases.flatMap(phase => phase.problems.map(p => p.problemId));
  const completedInPath = problemIds.filter(id => state.problems[id]).length;

  return (
    <div className="mb-8 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 size={18} className="text-blue-400" />
        <span className="font-medium text-blue-400">Recommended for You</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{recommendedPath.logo}</span>
        <div>
          <h3 className="font-bold">{recommendedPath.name} Interview Prep</h3>
          <p className="text-sm text-slate-400">
            {completedInPath > 0
              ? `Continue where you left off - ${completedInPath}/${problemIds.length} completed`
              : `${recommendedPath.timeline.weeks} weeks • ${problemIds.length} problems`}
          </p>
        </div>
      </div>
    </div>
  );
}

export function CompanyPathsPage({ onSelectCompany }: CompanyPathsPageProps) {
  const state = useProgressStore();

  const getCompletedCount = (path: CompanyPath): number => {
    const problemIds = path.phases.flatMap(phase => phase.problems.map(p => p.problemId));
    return problemIds.filter(id => state.problems[id]).length;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="text-blue-400" size={28} />
          <h1 className="text-3xl font-bold">Company Interview Paths</h1>
        </div>
        <p className="text-slate-400">
          Curated study paths for top tech companies. Each path includes the most frequently asked
          problems organized into phases with estimated timelines.
        </p>
      </div>

      {/* Stats Overview */}
      <StatsOverview />

      {/* Recommended Path */}
      <RecommendedPath />

      {/* Company Grid */}
      <h2 className="text-lg font-semibold mb-4">All Company Paths</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companyPaths.map((path, index) => (
          <motion.div
            key={path.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <CompanyCard
              path={path}
              completedCount={getCompletedCount(path)}
              onClick={() => onSelectCompany(path.id)}
            />
          </motion.div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <h3 className="font-semibold mb-2">💡 Tips for Interview Prep</h3>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>• Focus on "must-do" problems first - these are the most frequently asked</li>
          <li>• Complete one path before starting another for better retention</li>
          <li>• Review problems using spaced repetition - visit the Dashboard</li>
          <li>• Practice explaining your thought process out loud</li>
        </ul>
      </div>
    </div>
  );
}
