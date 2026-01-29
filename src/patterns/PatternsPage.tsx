import { patternCategories, patterns, getPatternsByCategory } from '../data/patterns';
import type { PatternCategory } from '../data/patterns';
import { ChevronRight, BookOpen } from 'lucide-react';

interface PatternsPageProps {
  onSelectPattern: (patternId: string) => void;
}

function CategoryCard({ 
  category, 
  onSelect 
}: { 
  category: { name: PatternCategory; description: string; icon: string; color: string };
  onSelect: (patternId: string) => void;
}) {
  const categoryPatterns = getPatternsByCategory(category.name);
  
  const colorClasses: Record<string, { border: string; bg: string; text: string; badge: string }> = {
    blue: { border: 'border-blue-500/30', bg: 'from-blue-500/10 to-blue-600/5', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-400' },
    purple: { border: 'border-purple-500/30', bg: 'from-purple-500/10 to-purple-600/5', text: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-400' },
    green: { border: 'border-green-500/30', bg: 'from-green-500/10 to-green-600/5', text: 'text-green-400', badge: 'bg-green-500/20 text-green-400' },
    emerald: { border: 'border-emerald-500/30', bg: 'from-emerald-500/10 to-emerald-600/5', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-400' },
    cyan: { border: 'border-cyan-500/30', bg: 'from-cyan-500/10 to-cyan-600/5', text: 'text-cyan-400', badge: 'bg-cyan-500/20 text-cyan-400' },
    yellow: { border: 'border-yellow-500/30', bg: 'from-yellow-500/10 to-yellow-600/5', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-400' },
    red: { border: 'border-red-500/30', bg: 'from-red-500/10 to-red-600/5', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400' },
    orange: { border: 'border-orange-500/30', bg: 'from-orange-500/10 to-orange-600/5', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-400' },
    pink: { border: 'border-pink-500/30', bg: 'from-pink-500/10 to-pink-600/5', text: 'text-pink-400', badge: 'bg-pink-500/20 text-pink-400' },
  };
  
  const colors = colorClasses[category.color] || colorClasses.blue;
  
  return (
    <div className={`border ${colors.border} rounded-xl overflow-hidden`}>
      <div className={`p-5 bg-gradient-to-r ${colors.bg}`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{category.icon}</span>
          <h3 className={`text-xl font-bold ${colors.text}`}>{category.name}</h3>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.badge}`}>
            {categoryPatterns.length} patterns
          </span>
        </div>
        <p className="text-slate-400 text-sm">{category.description}</p>
      </div>
      
      <div className="p-3 space-y-2 bg-slate-900/50">
        {categoryPatterns.map((pattern) => (
          <button
            key={pattern.id}
            onClick={() => onSelect(pattern.id)}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-blue-500 transition-all text-left group"
          >
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <BookOpen size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white group-hover:text-blue-300 transition-colors">
                {pattern.name}
              </div>
              <div className="text-sm text-slate-400 truncate">
                {pattern.shortDescription}
              </div>
            </div>
            <span className="text-xs text-slate-500">
              {pattern.relatedProblems.length} problems
            </span>
            <ChevronRight className="text-slate-500 group-hover:text-blue-400 transition-colors" size={16} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function PatternsPage({ onSelectPattern }: PatternsPageProps) {
  const totalPatterns = patterns.length;
  const totalProblems = patterns.reduce((sum, p) => sum + p.relatedProblems.length, 0);
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
          Algorithm Patterns
        </h1>
        <p className="text-slate-400 text-lg mb-4">
          Master the core patterns behind coding interview problems
        </p>
        <div className="flex justify-center gap-6 text-sm">
          <div className="px-4 py-2 bg-slate-800 rounded-lg">
            <span className="text-emerald-400 font-bold">{totalPatterns}</span>
            <span className="text-slate-400"> patterns</span>
          </div>
          <div className="px-4 py-2 bg-slate-800 rounded-lg">
            <span className="text-cyan-400 font-bold">{totalProblems}</span>
            <span className="text-slate-400"> related problems</span>
          </div>
          <div className="px-4 py-2 bg-slate-800 rounded-lg">
            <span className="text-slate-400">{patternCategories.length} categories</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {patternCategories.map((category) => (
          <CategoryCard
            key={category.name}
            category={category}
            onSelect={onSelectPattern}
          />
        ))}
      </div>
      
      <div className="mt-8 text-center text-slate-500 text-sm">
        <p>Each pattern includes interactive animations, code templates, and related problems</p>
        <p className="mt-1">Learn the pattern → recognize it in problems → ace the interview 🎯</p>
      </div>
    </div>
  );
}
