import { problems, categories } from '../data/problems';
import { TrendingUp, Target, ArrowRight, Zap } from 'lucide-react';

interface StatsCardProps {
  onNavigateToProblems?: () => void;
  onNavigateToDrill?: () => void;
}

export function StatsCard({ onNavigateToProblems, onNavigateToDrill }: StatsCardProps) {
  // Calculate stats
  const totalProblems = problems.length;
  const visualizedProblems = problems.filter(p => p.hasVisualization).length;
  const totalCategories = categories.length;

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl p-6 max-w-md">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
          <TrendingUp className="w-6 h-6 text-blue-400" />
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          AlgoForge Stats
        </h3>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="text-3xl font-bold text-blue-400">
              {visualizedProblems}
            </span>
          </div>
          <p className="text-sm text-slate-300 font-medium">Visualizers</p>
          <p className="text-xs text-slate-500">Interactive problems</p>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-3xl font-bold text-purple-400">
              {totalCategories}
            </span>
          </div>
          <p className="text-sm text-slate-300 font-medium">Patterns</p>
          <p className="text-xs text-slate-500">Core categories</p>
        </div>
      </div>

      {/* Total Problems Display */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-slate-400 mb-1">Total LeetCode Problems</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-bold text-slate-200">{totalProblems}</span>
            <div className="text-xs text-slate-400">
              <span className="text-blue-400 font-medium">{visualizedProblems}</span> visualized
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((visualizedProblems / totalProblems) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Motivational Tagline */}
      <div className="text-center mb-6">
        <h4 className="text-lg font-semibold text-white mb-2">
          Master algorithms visually
        </h4>
        <p className="text-sm text-slate-400">
          Interactive visualizations for faster learning
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-3">
        <button
          onClick={onNavigateToProblems}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg hover:border-blue-400 transition-all font-medium text-blue-400 hover:text-blue-300 group"
        >
          <span>Explore Problems</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
        
        <button
          onClick={onNavigateToDrill}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg hover:border-purple-400 transition-all font-medium text-purple-400 hover:text-purple-300 group"
        >
          <Target className="w-4 h-4" />
          <span>Start Drilling</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <p className="text-xs text-center text-slate-500">
          🎯 Built for interview success
        </p>
      </div>
    </div>
  );
}