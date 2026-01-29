import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Clock,
  Target,
  ExternalLink,
  CheckCircle2,
  Circle,
  Flame,
  Play,
  Lock,
} from 'lucide-react';
import {
  getCompanyPath,
  getTotalProblemsCount,
  getPriorityColor,
  type Phase,
  type PhaseProblem,
} from '../data/companyPaths';
import { problems as allProblems } from '../data/problems';
import { useProgressStore } from '../store/progressStore';
import { CompanyPathProgress } from '../components/CompanyPathProgress';

interface CompanyPathDetailPageProps {
  companyId: string;
  onSelectProblem: (problemId: string) => void;
  onBack: () => void;
}

function PriorityBadge({ priority }: { priority: PhaseProblem['priority'] }) {
  const labels = {
    'must-do': 'Must Do',
    'recommended': 'Recommended',
    'bonus': 'Bonus',
  };
  
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(priority)}`}>
      {labels[priority]}
    </span>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = {
    Easy: 'bg-green-500/20 text-green-400',
    Medium: 'bg-yellow-500/20 text-yellow-400',
    Hard: 'bg-red-500/20 text-red-400',
  };
  
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[difficulty] || 'bg-slate-500/20 text-slate-400'}`}>
      {difficulty}
    </span>
  );
}

function ProblemRow({
  phaseProblem,
  isCompleted,
  onSelect,
}: {
  phaseProblem: PhaseProblem;
  isCompleted: boolean;
  onSelect: () => void;
}) {
  const problem = allProblems.find(p => p.id === phaseProblem.problemId);
  
  if (!problem) {
    return (
      <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg opacity-50">
        <Circle size={18} className="text-slate-500" />
        <span className="text-slate-400">Problem not found: {phaseProblem.problemId}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
        isCompleted
          ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40'
          : problem.hasVisualization
          ? 'bg-slate-800 border-slate-700 hover:border-blue-500'
          : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
      }`}
      onClick={onSelect}
    >
      {/* Completion Status */}
      {isCompleted ? (
        <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
      ) : (
        <Circle size={18} className="text-slate-500 flex-shrink-0" />
      )}

      {/* Visualization indicator */}
      <div className={`p-1.5 rounded ${problem.hasVisualization ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/50 text-slate-500'}`}>
        {problem.hasVisualization ? <Play size={12} /> : <Lock size={12} />}
      </div>

      {/* Problem Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-medium ${isCompleted ? 'text-green-300' : 'text-white'}`}>
            {problem.title}
          </span>
          <DifficultyBadge difficulty={problem.difficulty} />
          <PriorityBadge priority={phaseProblem.priority} />
        </div>
        {phaseProblem.notes && (
          <p className="text-xs text-slate-400 mt-1">{phaseProblem.notes}</p>
        )}
      </div>

      {/* LeetCode Link */}
      <a
        href={problem.leetcodeUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        title="Open on LeetCode"
      >
        <ExternalLink size={14} />
      </a>
    </motion.div>
  );
}

function PhaseSection({
  phase,
  phaseIndex,
  completedProblems,
  onSelectProblem,
  defaultExpanded,
}: {
  phase: Phase;
  phaseIndex: number;
  completedProblems: Set<string>;
  onSelectProblem: (problemId: string) => void;
  defaultExpanded: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const completedCount = phase.problems.filter(p => completedProblems.has(p.problemId)).length;
  const totalCount = phase.problems.length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  const isComplete = completedCount === totalCount;

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center gap-3 p-4 transition-colors ${
          isComplete ? 'bg-green-500/10' : 'bg-slate-800'
        } hover:bg-slate-750`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
            isComplete
              ? 'bg-green-500/20 text-green-400'
              : completedCount > 0
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-slate-700 text-slate-400'
          }`}
        >
          {phaseIndex + 1}
        </div>
        
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{phase.name}</span>
            {isComplete && <CheckCircle2 size={16} className="text-green-400" />}
          </div>
          <div className="text-sm text-slate-400 flex items-center gap-2">
            <span>{phase.weeks} week{phase.weeks > 1 ? 's' : ''}</span>
            <span>•</span>
            <span>{totalCount} problems</span>
          </div>
        </div>

        {/* Progress */}
        <div className="text-right mr-2">
          <div className="text-sm font-medium">
            {completedCount}/{totalCount}
          </div>
          <div className="text-xs text-slate-400">{percentage}%</div>
        </div>

        <ChevronDown
          size={20}
          className={`text-slate-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-slate-900/50 space-y-2">
              <p className="text-sm text-slate-400 mb-4">{phase.description}</p>
              
              {/* Group by priority */}
              {['must-do', 'recommended', 'bonus'].map((priority) => {
                const priorityProblems = phase.problems.filter(p => p.priority === priority);
                if (priorityProblems.length === 0) return null;
                
                return (
                  <div key={priority} className="space-y-2">
                    {priorityProblems.map((phaseProblem) => (
                      <ProblemRow
                        key={phaseProblem.problemId}
                        phaseProblem={phaseProblem}
                        isCompleted={completedProblems.has(phaseProblem.problemId)}
                        onSelect={() => onSelectProblem(phaseProblem.problemId)}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CompanyPathDetailPage({
  companyId,
  onSelectProblem,
  onBack,
}: CompanyPathDetailPageProps) {
  const path = getCompanyPath(companyId);
  const state = useProgressStore();

  const { completedProblems, stats, firstUnsolvedProblem } = useMemo(() => {
    if (!path) {
      return {
        completedProblems: new Set<string>(),
        stats: { total: 0, completed: 0, mustDo: 0, mustDoCompleted: 0 },
        firstUnsolvedProblem: null,
      };
    }

    const completed = new Set<string>();
    let mustDo = 0;
    let mustDoCompleted = 0;
    let firstUnsolved: string | null = null;

    path.phases.forEach((phase) => {
      phase.problems.forEach((p) => {
        if (state.problems[p.problemId]) {
          completed.add(p.problemId);
          if (p.priority === 'must-do') mustDoCompleted++;
        } else if (!firstUnsolved) {
          const problem = allProblems.find(prob => prob.id === p.problemId);
          if (problem?.hasVisualization) {
            firstUnsolved = p.problemId;
          }
        }
        if (p.priority === 'must-do') mustDo++;
      });
    });

    return {
      completedProblems: completed,
      stats: {
        total: getTotalProblemsCount(path),
        completed: completed.size,
        mustDo,
        mustDoCompleted,
      },
      firstUnsolvedProblem: firstUnsolved,
    };
  }, [path, state]);

  if (!path) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Path Not Found</h2>
        <p className="text-slate-400">The company path "{companyId}" doesn't exist.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Back to Company Paths
        </button>
      </div>
    );
  }

  const percentage = Math.round((stats.completed / stats.total) * 100);

  // Find which phase to expand (first incomplete one)
  const firstIncompletePhaseIndex = path.phases.findIndex((phase) => {
    const phaseCompleted = phase.problems.filter(p => completedProblems.has(p.problemId)).length;
    return phaseCompleted < phase.problems.length;
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-5xl">{path.logo}</div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{path.name} Interview Prep</h1>
            <p className="text-slate-400">{path.description}</p>
          </div>
        </div>

        {/* Interview Structure */}
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 mb-4">
          <h3 className="text-sm font-medium text-slate-400 mb-1">Interview Structure</h3>
          <p className="text-white">{path.interviewStructure}</p>
        </div>

        {/* Focus Areas */}
        <div className="flex flex-wrap gap-2 mb-4">
          {path.focusAreas.map((area) => (
            <span
              key={area}
              className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm"
            >
              {area}
            </span>
          ))}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{path.timeline.weeks} weeks</span>
          </div>
          <div className="flex items-center gap-1">
            <Target size={16} />
            <span>{stats.total} problems</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame size={16} className="text-red-400" />
            <span>{stats.mustDo} must-do ({stats.mustDoCompleted} done)</span>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Overall Progress</h2>
          <span className="text-xl font-bold text-blue-400">{percentage}%</span>
        </div>
        <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </div>
        <div className="flex justify-between text-sm text-slate-400 mt-1">
          <span>{stats.completed} completed</span>
          <span>{stats.total - stats.completed} remaining</span>
        </div>
      </div>

      {/* Progress Component */}
      <CompanyPathProgress path={path} />

      {/* Start/Continue Button */}
      {firstUnsolvedProblem && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onSelectProblem(firstUnsolvedProblem)}
          className="w-full mb-8 p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-blue-600 hover:to-purple-600 transition-all"
        >
          <Play size={20} />
          {stats.completed > 0 ? 'Continue Path' : 'Start Phase 1'}
        </motion.button>
      )}

      {/* Phases */}
      <h2 className="text-lg font-semibold mb-4">Study Phases</h2>
      <div className="space-y-4">
        {path.phases.map((phase, index) => (
          <PhaseSection
            key={phase.name}
            phase={phase}
            phaseIndex={index}
            completedProblems={completedProblems}
            onSelectProblem={onSelectProblem}
            defaultExpanded={index === Math.max(0, firstIncompletePhaseIndex)}
          />
        ))}
      </div>

      {/* Tips */}
      <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <h3 className="font-semibold mb-2">💡 {path.name} Interview Tips</h3>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>• Focus on "must-do" problems first - they're the most frequently asked</li>
          <li>• {path.id === 'google' && 'Practice explaining your thought process - Google values communication'}
              {path.id === 'meta' && 'Move fast and write clean code - Meta values efficiency'}
              {path.id === 'amazon' && 'Prepare Leadership Principles stories alongside coding'}
              {path.id === 'apple' && 'Pay extra attention to edge cases and code quality'}
              {path.id === 'microsoft' && 'Brush up on CS fundamentals and be ready to discuss tradeoffs'}
              {path.id === 'netflix' && 'Focus more on system design - senior level expectations'}
              {path.id === 'startups' && 'Emphasize practical solutions and full-stack thinking'}
          </li>
          <li>• Time yourself: aim for 20-25 min for medium problems, 35-45 min for hard</li>
        </ul>
      </div>
    </div>
  );
}
