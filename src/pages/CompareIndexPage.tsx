import { ArrowLeft, GitCompare, ArrowRight, Zap, Clock } from 'lucide-react';
import { comparisons } from '../data/comparisons';

interface CompareIndexPageProps {
  onBack: () => void;
  onSelectComparison: (problemId: string) => void;
}

// Color coding for complexity classes
function getComplexityColor(complexity: string): string {
  if (complexity.includes('log')) return 'text-green-400';
  if (complexity === 'O(1)') return 'text-green-400';
  if (complexity === 'O(n)') return 'text-emerald-400';
  if (complexity === 'O(n log n)') return 'text-yellow-400';
  if (complexity === 'O(n²)') return 'text-orange-400';
  if (complexity === 'O(n³)') return 'text-red-400';
  return 'text-slate-400';
}

export function CompareIndexPage({ onBack, onSelectComparison }: CompareIndexPageProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-b border-purple-500/30">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
              <GitCompare size={32} className="text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Algorithm Comparisons</h1>
              <p className="text-slate-300 mt-1">
                See brute force vs optimal solutions side-by-side
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700">
              <Zap size={16} className="text-yellow-400" />
              <span className="text-sm text-slate-300">
                {comparisons.length} comparisons available
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700">
              <Clock size={16} className="text-blue-400" />
              <span className="text-sm text-slate-300">
                ~5 min per comparison
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Info Card */}
        <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h3 className="text-blue-400 font-semibold mb-2">💡 Why Compare Algorithms?</h3>
          <p className="text-slate-300 text-sm">
            In interviews, demonstrating you understand <strong>why</strong> the optimal solution is better 
            is just as important as knowing the solution itself. These comparisons show the dramatic 
            difference between brute force and optimal approaches with real step counts.
          </p>
        </div>

        {/* Comparison Cards Grid */}
        <div className="grid gap-6">
          {comparisons.map((comparison) => (
            <button
              key={comparison.problemId}
              onClick={() => onSelectComparison(comparison.problemId)}
              className="w-full text-left bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700 hover:border-purple-500/50 p-6 transition-all group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Title Section */}
                <div className="flex-shrink-0 lg:w-1/4">
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                    {comparison.title}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Click to explore
                  </p>
                </div>

                {/* Comparison Section */}
                <div className="flex-1 flex items-center gap-4">
                  {/* Brute Force */}
                  <div className="flex-1 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="text-sm text-red-400 font-medium mb-1">
                      {comparison.approaches.bruteForce.name}
                    </div>
                    <div className={`text-lg font-mono font-bold ${getComplexityColor(comparison.approaches.bruteForce.timeComplexity)}`}>
                      {comparison.approaches.bruteForce.timeComplexity}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Space: {comparison.approaches.bruteForce.spaceComplexity}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0">
                    <ArrowRight size={24} className="text-purple-400" />
                  </div>

                  {/* Optimal */}
                  <div className="flex-1 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="text-sm text-green-400 font-medium mb-1">
                      {comparison.approaches.optimal.name}
                    </div>
                    <div className={`text-lg font-mono font-bold ${getComplexityColor(comparison.approaches.optimal.timeComplexity)}`}>
                      {comparison.approaches.optimal.timeComplexity}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Space: {comparison.approaches.optimal.spaceComplexity}
                    </div>
                  </div>
                </div>

                {/* Key Insight (hidden on mobile) */}
                <div className="hidden xl:block flex-shrink-0 w-1/4">
                  <div className="text-xs text-slate-400 italic">
                    "{comparison.keyInsight.slice(0, 80)}..."
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Interview Tip */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-3">🎯 Interview Strategy</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="text-purple-400 font-semibold mb-2">Step 1: Clarify</div>
              <p className="text-sm text-slate-300">
                Understand the problem, ask about edge cases and constraints
              </p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="text-purple-400 font-semibold mb-2">Step 2: Brute Force</div>
              <p className="text-sm text-slate-300">
                Start with the obvious solution, state its complexity
              </p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="text-purple-400 font-semibold mb-2">Step 3: Optimize</div>
              <p className="text-sm text-slate-300">
                Identify patterns, trade-offs, and improve step by step
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
