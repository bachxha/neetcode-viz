import { useMemo } from 'react';
import { problems } from '../data/problems';
import type { Problem } from '../data/problems';
import { ChevronRight, ExternalLink } from 'lucide-react';

interface RelatedProblemsProps {
  currentProblemId: string;
  onSelectProblem: (id: string) => void;
}

interface ProblemCardProps {
  problem: Problem;
  onSelectProblem: (id: string) => void;
}

function ProblemCard({ problem, onSelectProblem }: ProblemCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Hard':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all group">
      {/* Header with title and external link */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h4 className="text-sm font-medium text-slate-200 leading-tight group-hover:text-white transition-colors">
          {problem.title}
        </h4>
        <a
          href={problem.leetcodeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-blue-400 transition-colors flex-shrink-0"
          title="Open on LeetCode"
        >
          <ExternalLink size={12} />
        </a>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
          {problem.difficulty}
        </span>
        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
          {problem.category}
        </span>
      </div>

      {/* Action button */}
      {problem.hasVisualization ? (
        <button
          onClick={() => onSelectProblem(problem.id)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors group/btn"
        >
          <span>View Visualizer</span>
          <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      ) : (
        <div className="text-xs text-slate-500">
          No visualizer available
        </div>
      )}
    </div>
  );
}

export function RelatedProblems({ currentProblemId, onSelectProblem }: RelatedProblemsProps) {
  const relatedProblems = useMemo(() => {
    const currentProblem = problems.find(p => p.id === currentProblemId);
    if (!currentProblem) return [];

    // Filter out the current problem
    const otherProblems = problems.filter(p => p.id !== currentProblemId);

    // Separate problems by relationship type
    const sameCategory = otherProblems.filter(p => p.category === currentProblem.category);
    const sameDifficulty = otherProblems.filter(p => p.difficulty === currentProblem.difficulty);

    // Prioritize same category, but also include some same difficulty
    const categoryCount = Math.min(sameCategory.length, 3); // Max 3 from same category
    const difficultyCount = Math.min(4 - categoryCount, sameDifficulty.filter(p => p.category !== currentProblem.category).length);

    // Shuffle and select
    const shuffleSameCategory = sameCategory.sort(() => Math.random() - 0.5).slice(0, categoryCount);
    const shuffleSameDifficulty = sameDifficulty
      .filter(p => p.category !== currentProblem.category) // Don't duplicate category matches
      .sort(() => Math.random() - 0.5)
      .slice(0, difficultyCount);

    const selected = [...shuffleSameCategory, ...shuffleSameDifficulty];

    // If we still don't have enough, fill with random others
    if (selected.length < 4) {
      const remaining = otherProblems
        .filter(p => !selected.includes(p))
        .sort(() => Math.random() - 0.5)
        .slice(0, 4 - selected.length);
      selected.push(...remaining);
    }

    return selected.slice(0, 4); // Max 4 problems
  }, [currentProblemId]);

  if (relatedProblems.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t border-slate-700">
      <div className="mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Related Problems
        </h3>
        <p className="text-sm text-slate-400">
          More problems to practice similar concepts
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {relatedProblems.map((problem) => (
          <ProblemCard
            key={problem.id}
            problem={problem}
            onSelectProblem={onSelectProblem}
          />
        ))}
      </div>
    </div>
  );
}